import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

const fetchQueryResults = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(query, params);
    return rows;
  } catch (error) {
    console.error("Query Error:", error);
    throw error;
  } finally {
    client.release();
  }
};

router.get("/get-record-memo", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const type = req.query.type;
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  try {
    const params = [`%${search}%`];

    // ==================================================================
    // PERBAIKAN: Menggunakan alias 'u_inner' dan 'p_inner'
    // ==================================================================
    let whereClause = `WHERE (u_inner.name ILIKE $1 OR u_inner.nis ILIKE $1)`;

    if (type && !isNaN(parseInt(type))) {
      whereClause += ` AND p_inner.type_id = $${params.length + 1}`;
      params.push(parseInt(type));
    }
    // ==================================================================

    // Query untuk menghitung total siswa yang cocok
    const totalQuery = `
      SELECT COUNT(DISTINCT p_inner.userid)
      FROM t_process p_inner
      JOIN u_students u_inner ON p_inner.userid = u_inner.id
      JOIN cl_students cs ON u_inner.id = cs.student AND cs.periode IN (SELECT id FROM a_periode WHERE isactive = true)
      ${whereClause}
    `;
    const totalResult = await client.query(totalQuery, params);
    const totalData = parseInt(totalResult.rows[0].count, 10);

    // Query utama dengan perbaikan (Correlated Subquery)
    const query = `
      SELECT
        u.id as userid,
        u.name,
        cl.name as classname,
        u.nis,
        (
          -- Agregasi Level 1: Mengumpulkan JUZ
          SELECT json_agg(juz_records ORDER BY juz_records.id)
          FROM (
            SELECT
              j_inner.id,
              j_inner.name as "JuzName",
              (
                -- Agregasi Level 2: Mengumpulkan VERSES (Surah)
                SELECT json_agg(
                  json_build_object(
                    'id', su_inner.id,
                    'name', su_inner.name,
                    'from_ayat', p_inner.from_count,
                    'to_ayat', p_inner.to_count,
                    'from_line', p_inner.from_line,
                    'to_line', p_inner.to_line,
                    'date', DATE(p_inner.createdat),
                    
                    -- PERBAIKAN (dari sebelumnya): Correlated Subquery
                    -- Mengambil nama penguji secara terpisah untuk
                    -- menghindari duplikasi data.
                    'examiner', (
                        SELECT ex.name
                        FROM t_scoring s_inner
                        JOIN t_examiner ex ON s_inner.examiner_id = ex.id
                        WHERE s_inner.userid = p_inner.userid
                          AND s_inner.type_id = p_inner.type_id
                          AND DATE(s_inner.createdat) = DATE(p_inner.createdat)
                          AND s_inner.examiner_id IS NOT NULL
                        LIMIT 1 -- Menjamin hanya 1 nama penguji
                    )

                  ) ORDER BY p_inner.createdat DESC, su_inner.id
                )
                FROM t_process p_inner -- Mulai dari t_process
                JOIN t_surah su_inner ON p_inner.surah_id = su_inner.id
                WHERE p_inner.userid = u.id AND p_inner.juz_id = j_inner.id
                -- Tidak ada JOIN ke t_scoring di sini
              ) as verses
              
            FROM t_juz j_inner
            -- Pastikan hanya mengambil Juz yang memiliki data di t_process
            WHERE j_inner.id IN (SELECT DISTINCT juz_id FROM t_process WHERE userid = u.id)
            
          ) as juz_records
        ) as records
      FROM (
        -- Subquery untuk paginasi USER
        SELECT DISTINCT u_inner.id
        FROM t_process p_inner
        JOIN u_students u_inner ON p_inner.userid = u_inner.id
        JOIN cl_students cs ON u_inner.id = cs.student AND cs.periode IN (SELECT id FROM a_periode WHERE isactive = true)
        ${whereClause} -- Sekarang merujuk ke 'u_inner' dan 'p_inner'
        ORDER BY u_inner.id
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      ) as paginated_users
      JOIN u_students u ON paginated_users.id = u.id
      LEFT JOIN cl_students cs ON u.id = cs.student AND cs.periode IN (SELECT id FROM a_periode WHERE isactive = true)
      LEFT JOIN a_class cl ON cs.classid = cl.id
      GROUP BY u.id, u.name, cl.name, u.nis
      ORDER BY u.name ASC
    `;

    const result = await client.query(query, [...params, limit, offset]);

    const report = result.rows.map((row) => ({
      ...row,
      // Pastikan 'records' yang null (jika tidak ada hafalan) menjadi array kosong
      records: row.records || [],
    }));

    res.status(200).json({ report, totalData, page, limit });
  } catch (error) {
    console.error("Error fetching record memo:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.delete("/delete-juz-report", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid, juzId } = req.query;

    if (!userid || !juzId) {
      return res
        .status(400)
        .json({ message: "User ID dan Juz ID diperlukan." });
    }

    await client.query("BEGIN");

    // Hapus dari t_scoring yang terkait dengan entri t_process yang akan dihapus
    await client.query(
      `DELETE FROM t_scoring
       WHERE (userid, type_id, DATE(createdat)) IN
       (SELECT DISTINCT userid, type_id, DATE(createdat) FROM t_process WHERE userid = $1 AND juz_id = $2)`,
      [userid, juzId]
    );

    // Hapus dari t_process
    const processResult = await client.query(
      "DELETE FROM t_process WHERE userid = $1 AND juz_id = $2",
      [userid, juzId]
    );

    if (processResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Tidak ada data hafalan untuk juz ini." });
    }

    await client.query("COMMIT");
    res
      .status(200)
      .json({ message: "Semua hafalan dalam juz berhasil dihapus." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Gagal menghapus laporan juz:", error);
    res.status(500).json({ message: "Gagal menghapus laporan juz." });
  } finally {
    client.release();
  }
});

router.delete("/delete-surah-report", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid, surahId, date: dateString } = req.query;

    if (!userid || !surahId || !dateString) {
      return res
        .status(400)
        .json({ message: "User ID, Surah ID, dan Tanggal diperlukan." });
    }

    // Konversi tanggal ke format YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Format tanggal tidak valid." });
    }
    const formattedDate = date.toISOString().split("T")[0];

    await client.query("BEGIN");

    // Hapus dari t_process berdasarkan userid, surah_id, dan tanggal
    const processResult = await client.query(
      "DELETE FROM t_process WHERE userid = $1 AND surah_id = $2 AND DATE(createdat) = $3",
      [userid, surahId, formattedDate]
    );

    // Hapus juga dari t_scoring pada tanggal yang sama jika tidak ada lagi entri di t_process
    // Ini untuk menjaga konsistensi, mirip dengan logika di /delete-report
    const remainingProcessEntries = await client.query(
      "SELECT 1 FROM t_process WHERE userid = $1 AND DATE(createdat) = $2 LIMIT 1",
      [userid, formattedDate]
    );

    if (remainingProcessEntries.rowCount === 0) {
      await client.query(
        "DELETE FROM t_scoring WHERE userid = $1 AND DATE(createdat) = $2",
        [userid, formattedDate]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({ message: "Hafalan surah berhasil dihapus." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Gagal menghapus laporan surah:", error);
    res.status(500).json({ message: "Gagal menghapus laporan surah." });
  } finally {
    client.release();
  }
});

router.get("/get-report-target", async (req, res) => {
  const client = await pool.connect();
  try {
    // Query untuk mendapatkan periode aktif
    const activePeriodeQuery = `
      SELECT 
        p.id as periode_id,
        p.name as periode,
        h.id as homebase_id,
        h.name as homebase
      FROM a_periode p
      INNER JOIN a_homebase h ON p.homebase = h.id
      WHERE p.isactive = true
    `;

    const activePeriodes = await client.query(activePeriodeQuery);

    if (activePeriodes.rows.length === 0) {
      return res.status(404).json({ message: "Tidak ada periode aktif" });
    }

    const result = [];

    for (const periode of activePeriodes.rows) {
      // Get all required data in parallel
      const [gradeTargets, classes, studentProgressResult] = await Promise.all([
        // Grade targets query
        client.query(
          `
          SELECT 
            g.id as grade_id,
            g.name as grade_name,
            ARRAY_AGG(DISTINCT tj.id) as juz_ids,
            ARRAY_AGG(DISTINCT tj.name) as juz_names,
            SUM(tji.lines) as total_target_lines
          FROM a_grade g
          LEFT JOIN t_target t ON g.id = t.grade_id
          LEFT JOIN t_juz tj ON t.juz_id = tj.id
          LEFT JOIN t_juzitems tji ON tj.id = tji.juz_id
          WHERE g.homebase = $1
          GROUP BY g.id, g.name
          ORDER BY g.id
        `,
          [periode.homebase_id]
        ),

        // Classes query
        client.query(
          `
          SELECT 
            c.id as class_id,
            c.name as class_name,
            c.grade as grade_id
          FROM a_class c
          WHERE c.grade IN (SELECT id FROM a_grade WHERE homebase = $1)
          ORDER BY c.name
        `,
          [periode.homebase_id]
        ),

        // Student progress query
        client.query(
          `
          WITH dedup_process AS (
            SELECT 
              tp.userid,
              tp.juz_id,
              tp.surah_id,
              (tp.to_count - tp.from_count + 1) as verse,
              (tp.to_line - tp.from_line + 1) as line,
              ROW_NUMBER() OVER (PARTITION BY tp.userid, tp.juz_id, tp.surah_id ORDER BY tp.to_line DESC, tp.createdat DESC) as rn
            FROM t_process tp
            WHERE tp.type_id = 6
          ),
          student_progress AS (
            SELECT 
              us.id as userid,
              us.nis,
              us.name as student_name,
              g.id as grade_id,
              g.name as grade_name,
              c.id as class_id,
              c.name as class_name,
              t.juz_id,
              tj.name as juz_name,
              COALESCE(SUM(dp.verse), 0) as completed_verses,
              COALESCE(SUM(dp.line), 0) as completed_lines,
              (
                SELECT SUM(tji.to_ayat - tji.from_ayat + 1)
                FROM t_target tt
                JOIN t_juzitems tji ON tt.juz_id = tji.juz_id
                WHERE tt.grade_id = g.id AND tt.juz_id = t.juz_id
              ) as target_verses,
              (
                SELECT SUM(tji.lines)
                FROM t_target tt
                JOIN t_juzitems tji ON tt.juz_id = tji.juz_id
                WHERE tt.grade_id = g.id AND tt.juz_id = t.juz_id
              ) as target_lines
            FROM u_students us
            INNER JOIN cl_students cs ON us.id = cs.student AND cs.periode = $1
            INNER JOIN a_class c ON cs.classid = c.id
            INNER JOIN a_grade g ON c.grade = g.id
            INNER JOIN t_target t ON g.id = t.grade_id
            INNER JOIN t_juz tj ON t.juz_id = tj.id
            LEFT JOIN dedup_process dp ON us.id = dp.userid AND t.juz_id = dp.juz_id AND dp.rn = 1
            WHERE us.homebase = $2
            GROUP BY us.id, us.nis, us.name, g.id, g.name, c.id, c.name, t.juz_id, tj.name
          )
          SELECT 
            userid,
            nis,
            student_name,
            grade_id,
            grade_name,
            class_id,
            class_name,
            ARRAY_AGG(juz_name ORDER BY juz_name ASC) as juz_names,
            ARRAY_AGG(completed_verses ORDER BY juz_name ASC) as completed_verses,
            ARRAY_AGG(completed_lines ORDER BY juz_name ASC) as completed_lines,
            ARRAY_AGG(target_verses ORDER BY juz_name ASC) as target_verses,
            ARRAY_AGG(target_lines ORDER BY juz_name ASC) as target_lines,
            ARRAY_AGG(
              CASE 
                WHEN target_verses > 0 AND target_lines > 0 THEN 
                  LEAST(
                    100,
                    ROUND(((completed_verses::numeric / target_verses::numeric) * 0.5 + 
                          (completed_lines::numeric / target_lines::numeric) * 0.5) * 100, 2)
                  )
                ELSE 0 
              END
              ORDER BY juz_name ASC
            ) as progress_percentages
          FROM student_progress
          GROUP BY userid, nis, student_name, grade_id, grade_name, class_id, class_name
          ORDER BY class_name, student_name
        `,
          [periode.periode_id, periode.homebase_id]
        ),
      ]);

      // Process student exceed data with batch processing
      const studentProgress = studentProgressResult.rows;
      const batchSize = 10; // Process 10 students at a time
      const studentExceedData = [];

      for (let i = 0; i < studentProgress.length; i += batchSize) {
        const batch = studentProgress.slice(i, i + batchSize);
        const batchPromises = batch.map(async (student) => {
          // Get exceed data for student
          const [exceedTargets, exceedProgress] = await Promise.all([
            client.query(
              `
              WITH target_juz AS (
                SELECT tt.juz_id
                FROM t_target tt
                WHERE tt.grade_id = $1
              ),
              student_process AS (
                SELECT DISTINCT juz_id
                FROM t_process
                WHERE userid = $2 AND type_id = 6
              )
              SELECT 
                tj.id as juz_id,
                tj.name as juz,
                COALESCE(SUM(tji.lines), 0) as total_lines,
                COALESCE(SUM(tji.to_ayat - tji.from_ayat + 1), 0) as total_verses
              FROM t_juz tj
              LEFT JOIN t_juzitems tji ON tj.id = tji.juz_id
              WHERE tj.id NOT IN (SELECT juz_id FROM target_juz)
                AND tj.id IN (SELECT juz_id FROM student_process)
              GROUP BY tj.id, tj.name
              ORDER BY tj.id ASC
            `,
              [student.grade_id, student.userid]
            ),

            client.query(
              `
              SELECT 
                juz_id,
                COALESCE(SUM(to_count - from_count + 1), 0) as completed_verses,
                COALESCE(SUM(to_line - from_line + 1), 0) as completed_lines
              FROM t_process
              WHERE userid = $1 AND type_id = 6
              GROUP BY juz_id
            `,
              [student.userid]
            ),
          ]);

          const exceed = exceedTargets.rows.map((target) => {
            const progress = exceedProgress.rows.find(
              (p) => p.juz_id === target.juz_id
            ) || {
              completed_verses: 0,
              completed_lines: 0,
            };

            const completedVerses = parseInt(progress.completed_verses);
            const completedLines = parseInt(progress.completed_lines);
            const totalVerses = parseInt(target.total_verses);
            const totalLines = parseInt(target.total_lines);

            return {
              juz: target.juz,
              lines: {
                completed: completedLines,
                target: totalLines,
                percentage:
                  totalLines > 0
                    ? Number(((completedLines / totalLines) * 100).toFixed(2))
                    : 0,
              },
              verses: {
                completed: completedVerses,
                target: totalVerses,
                percentage:
                  totalVerses > 0
                    ? Number(((completedVerses / totalVerses) * 100).toFixed(2))
                    : 0,
              },
              persentase:
                totalVerses > 0
                  ? Number(((completedVerses / totalVerses) * 100).toFixed(2))
                  : 0,
            };
          });

          return {
            ...student,
            exceed,
          };
        });

        const batchResults = await Promise.all(batchPromises);
        studentExceedData.push(...batchResults);
      }

      // Process grade data
      const gradeData = gradeTargets.rows.map((grade) => {
        const classGroups = classes.rows
          .filter((c) => c.grade_id === grade.grade_id)
          .map((classItem) => {
            const classStudents = studentExceedData.filter(
              (s) => s.class_id === classItem.class_id
            );

            const completedStudents = classStudents.filter((student) =>
              student.progress_percentages.every(
                (percentage) => percentage >= 100
              )
            ).length;

            const studentsWithExceed = classStudents.filter(
              (student) => student.exceed && student.exceed.length > 0
            );

            const exceedCompletedStudents = studentsWithExceed.filter(
              (student) => student.exceed.some((item) => item.persentase >= 100)
            ).length;

            const totalStudents = classStudents.length;

            return {
              class_name: classItem.class_name,
              class_id: classItem.class_id,
              completed: completedStudents,
              uncompleted: totalStudents - completedStudents,
              exceed_completed: exceedCompletedStudents,
              exceed_uncompleted: totalStudents - exceedCompletedStudents,
              students: classStudents.map((student) => ({
                userid: student.userid,
                nis: student.nis,
                name: student.student_name,
                grade: student.grade_name,
                class: student.class_name,
                progress: student.juz_names.map((juz, idx) => ({
                  juz: juz,
                  verses: {
                    completed: Math.min(
                      student.completed_verses[idx],
                      student.target_verses[idx]
                    ),
                    target: student.target_verses[idx],
                    percentage:
                      student.target_verses[idx] > 0
                        ? Math.min(
                            100,
                            Number(
                              (
                                (Math.min(
                                  student.completed_verses[idx],
                                  student.target_verses[idx]
                                ) /
                                  student.target_verses[idx]) *
                                100
                              ).toFixed(2)
                            )
                          )
                        : 0,
                  },
                  lines: {
                    completed: Math.min(
                      student.completed_lines[idx],
                      student.target_lines[idx]
                    ),
                    target: student.target_lines[idx],
                    percentage:
                      student.target_lines[idx] > 0
                        ? Math.min(
                            100,
                            Number(
                              (
                                (Math.min(
                                  student.completed_lines[idx],
                                  student.target_lines[idx]
                                ) /
                                  student.target_lines[idx]) *
                                100
                              ).toFixed(2)
                            )
                          )
                        : 0,
                  },
                  persentase: student.progress_percentages[idx],
                })),
                exceed: student.exceed.map((target) => {
                  const completedVerses = Math.min(
                    target.verses.completed,
                    target.verses.target
                  );
                  const completedLines = Math.min(
                    target.lines.completed,
                    target.lines.target
                  );
                  return {
                    ...target,
                    lines: {
                      ...target.lines,
                      completed: completedLines,
                      percentage:
                        target.lines.target > 0
                          ? Number(
                              (
                                (completedLines / target.lines.target) *
                                100
                              ).toFixed(2)
                            )
                          : 0,
                    },
                    verses: {
                      ...target.verses,
                      completed: completedVerses,
                      percentage:
                        target.verses.target > 0
                          ? Number(
                              (
                                (completedVerses / target.verses.target) *
                                100
                              ).toFixed(2)
                            )
                          : 0,
                    },
                    persentase:
                      target.verses.target > 0
                        ? Number(
                            (
                              (completedVerses / target.verses.target) *
                              100
                            ).toFixed(2)
                          )
                        : 0,
                  };
                }),
              })),
            };
          });

        const totalStudents = classGroups.reduce(
          (sum, c) => sum + c.students.length,
          0
        );
        const completedStudents = classGroups.reduce(
          (sum, c) => sum + c.completed,
          0
        );
        const exceedCompletedStudents = classGroups.reduce(
          (sum, c) => sum + c.exceed_completed,
          0
        );

        return {
          id: grade.grade_id,
          name: grade.grade_name,
          target: grade.juz_names.map((name, idx) => ({
            juz: name,
            lines: grade.total_target_lines,
          })),
          achievement:
            totalStudents > 0
              ? Number(((completedStudents / totalStudents) * 100).toFixed(2))
              : 0,
          completed: completedStudents,
          uncompleted: totalStudents - completedStudents,
          exceed_achievement:
            totalStudents > 0
              ? Number(
                  ((exceedCompletedStudents / totalStudents) * 100).toFixed(2)
                )
              : 0,
          exceed_completed: exceedCompletedStudents,
          exceed_uncompleted: totalStudents - exceedCompletedStudents,
          classes: classGroups,
        };
      });

      result.push({
        periode: periode.periode,
        periode_id: periode.periode_id,
        homebase: periode.homebase,
        homebase_id: periode.homebase_id,
        grade: gradeData,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in get-report-target:", error);
    res.status(500).json({
      message: error.message,
      detail:
        "An error occurred while processing the report. Please try again later.",
    });
  } finally {
    client.release();
  }
});

router.get("/get-student-report", async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid } = req.query;

    // 1. Find student data with userid
    const studentQuery = `
      SELECT 
        us.id as student_id,
        us.nis as student_nis,
        us.name as student_name,
        us.homebase as homebase_id
      FROM u_students us
      WHERE us.id = $1
    `;

    const studentInfo = await fetchQueryResults(studentQuery, [userid]);

    if (studentInfo.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentInfo[0];
    const homebaseId = student.homebase_id;

    // 2. Find active period based on homebase_id
    const activePeriodQuery = `
      SELECT 
        p.id as periode_id,
        p.name as periode_name
      FROM a_periode p
      WHERE p.homebase = $1 AND p.isactive = true
      LIMIT 1
    `;

    const activePeriod = await fetchQueryResults(activePeriodQuery, [
      homebaseId,
    ]);

    if (activePeriod.length === 0) {
      return res
        .status(404)
        .json({ message: "No active period found for this homebase" });
    }

    const periodeId = activePeriod[0].periode_id;

    // 3. Get student information based on active period
    const studentDetailQuery = `
      SELECT 
        us.id as student_id,
        us.nis as student_nis,
        us.name as student_name,
        g.name as grade,
        c.name as class,
        h.name as homebase,
        p.name as periode
      FROM u_students us
      INNER JOIN cl_students cs ON us.id = cs.student AND cs.periode = $1
      INNER JOIN a_class c ON cs.classid = c.id
      INNER JOIN a_grade g ON c.grade = g.id
      INNER JOIN a_homebase h ON g.homebase = h.id
      INNER JOIN a_periode p ON cs.periode = p.id
      WHERE us.id = $2
    `;

    const studentDetail = await fetchQueryResults(studentDetailQuery, [
      periodeId,
      userid,
    ]);

    if (studentDetail.length === 0) {
      return res
        .status(404)
        .json({ message: "Student not found in active period" });
    }

    const studentData = studentDetail[0];

    // 4. Get all target juz for all grades based on student's homebase
    const allTargetsQuery = `
      SELECT 
        g.id as grade_id,
        g.name as grade_name,
        tj.id as juz_id,
        tj.name as juz,
        SUM(tji.lines) as total_lines,
        SUM(tji.to_ayat - tji.from_ayat + 1) as total_verses
      FROM t_target tt
      INNER JOIN t_juz tj ON tt.juz_id = tj.id
      INNER JOIN t_juzitems tji ON tj.id = tji.juz_id
      INNER JOIN a_grade g ON tt.grade_id = g.id
      WHERE g.homebase = $1
      GROUP BY g.id, g.name, tj.id, tj.name
      ORDER BY g.id, tj.id
    `;

    const allTargets = await fetchQueryResults(allTargetsQuery, [homebaseId]);

    // Group targets by grade
    const targetsByGrade = allTargets.reduce((acc, target) => {
      if (!acc[target.grade_id]) {
        acc[target.grade_id] = {
          grade_id: target.grade_id,
          grade_name: target.grade_name,
          targets: [],
        };
      }
      acc[target.grade_id].targets.push({
        juz_id: target.juz_id,
        juz: target.juz,
        total_lines: parseInt(target.total_lines),
        total_verses: parseInt(target.total_verses),
      });
      return acc;
    }, {});

    // Get student's current grade targets
    const studentGradeTargets = allTargets.filter(
      (target) =>
        target.grade_id ===
        allTargets.find((t) => t.grade_name === studentData.grade)?.grade_id
    );

    const targets = studentGradeTargets.map((target) => ({
      juz_id: target.juz_id,
      juz: target.juz,
      total_lines: parseInt(target.total_lines),
      total_verses: parseInt(target.total_verses),
    }));

    // Get student's progress for each juz (ambil baris tertinggi per surah)
    const memorization = await Promise.all(
      targets.map(async (target) => {
        const progressQuery = `
          SELECT 
            COALESCE(SUM(s.verse), 0) as completed_verses,
            COALESCE(SUM(s.line), 0) as completed_lines
          FROM (
            SELECT 
              tp.surah_id,
              (tp.to_count - tp.from_count + 1) as verse,
              (tp.to_line - tp.from_line + 1) as line,
              ROW_NUMBER() OVER (PARTITION BY tp.surah_id ORDER BY tp.to_line DESC, tp.createdat DESC) as rn
            FROM t_process tp
            WHERE tp.userid = $1 AND tp.juz_id = $2 AND tp.type_id = 6
          ) s
          WHERE s.rn = 1
        `;

        const progress = await fetchQueryResults(progressQuery, [
          userid,
          target.juz_id,
        ]);

        // Get surah details for this juz
        const surahQuery = `
          SELECT s.surah_id, s.surah_name, s.verse, s.line FROM (
            SELECT 
              ts.id as surah_id,
              ts.name as surah_name,
              tp.to_count as verse,
              tp.to_line as line,
              tp.createdat,
              ROW_NUMBER() OVER (PARTITION BY tp.surah_id ORDER BY tp.createdat DESC, tp.to_line DESC) as rn
            FROM t_process tp
            INNER JOIN t_surah ts ON tp.surah_id = ts.id
            WHERE tp.userid = $1 AND tp.juz_id = $2 AND tp.type_id = 6
          ) s
          WHERE s.rn = 1
        `;

        const surahs = await fetchQueryResults(surahQuery, [
          userid,
          target.juz_id,
        ]);

        const completedVerses = parseInt(progress[0]?.completed_verses || 0);
        const completedLines = parseInt(progress[0]?.completed_lines || 0);
        const totalVerses = parseInt(target.total_verses);
        const totalLines = parseInt(target.total_lines);

        const cappedVerses = Math.min(completedVerses, totalVerses);
        const cappedLines = Math.min(completedLines, totalLines);
        const versePercent = totalVerses > 0 ? cappedVerses / totalVerses : 0;
        const linePercent = totalLines > 0 ? cappedLines / totalLines : 0;
        const progressValue =
          versePercent + linePercent > 0
            ? Math.min(
                100,
                Number((((versePercent + linePercent) / 2) * 100).toFixed(2))
              )
            : 0;

        return {
          juz: target.juz,
          lines: totalLines,
          verses: totalVerses,
          completed: cappedVerses,
          completed_lines: cappedLines,
          uncompleted: totalVerses - cappedVerses,
          progress: progressValue,
          surah: surahs,
        };
      })
    );

    // Get juz that exceed the target
    const exceedQuery = `
      WITH target_juz AS (
        SELECT tt.juz_id
        FROM t_target tt
        WHERE tt.grade_id = (
          SELECT c.grade 
          FROM cl_students cs
          INNER JOIN a_class c ON cs.classid = c.id
          WHERE cs.student = $1 AND cs.periode = $2
          LIMIT 1
        )
      ),
      student_process AS (
        SELECT DISTINCT juz_id
        FROM t_process
        WHERE userid = $1 AND type_id = 6
      )
      SELECT 
        tj.id as juz_id,
        tj.name as juz,
        COALESCE(SUM(tji.lines), 0) as total_lines,
        COALESCE(SUM(tji.to_ayat - tji.from_ayat + 1), 0) as total_verses
      FROM t_juz tj
      LEFT JOIN t_juzitems tji ON tj.id = tji.juz_id
      WHERE tj.id NOT IN (SELECT juz_id FROM target_juz)
        AND tj.id IN (SELECT juz_id FROM student_process)
      GROUP BY tj.id, tj.name
      ORDER BY tj.id ASC
    `;

    const exceedTargets = await fetchQueryResults(exceedQuery, [
      userid,
      periodeId,
    ]);

    // Get student's progress for each exceed juz
    const exceed = await Promise.all(
      exceedTargets.map(async (target) => {
        // Get completed verses and lines for this juz (ambil baris tertinggi per surah)
        const progressQuery = `
          SELECT 
            COALESCE(SUM(s.verse), 0) as completed_verses,
            COALESCE(SUM(s.line), 0) as completed_lines
          FROM (
            SELECT 
              tp.surah_id,
              (tp.to_count - tp.from_count + 1) as verse,
              (tp.to_line - tp.from_line + 1) as line,
              ROW_NUMBER() OVER (PARTITION BY tp.surah_id ORDER BY tp.to_line DESC, tp.createdat DESC) as rn
            FROM t_process tp
            WHERE tp.userid = $1 AND tp.juz_id = $2 AND tp.type_id = 6
          ) s
          WHERE s.rn = 1
        `;

        const progress = await fetchQueryResults(progressQuery, [
          userid,
          target.juz_id,
        ]);

        // Get surah details for this juz
        const surahQuery = `
          SELECT s.surah_id, s.surah_name, s.verse, s.line FROM (
            SELECT 
              ts.id as surah_id,
              ts.name as surah_name,
              tp.to_count as verse,
              tp.to_line as line,
              tp.createdat,
              ROW_NUMBER() OVER (PARTITION BY tp.surah_id ORDER BY tp.createdat DESC, tp.to_line DESC) as rn
            FROM t_process tp
            INNER JOIN t_surah ts ON tp.surah_id = ts.id
            WHERE tp.userid = $1 AND tp.juz_id = $2 AND tp.type_id = 6
          ) s
          WHERE s.rn = 1
        `;

        const surahs = await fetchQueryResults(surahQuery, [
          userid,
          target.juz_id,
        ]);

        const completedVerses = parseInt(progress[0]?.completed_verses || 0);
        const completedLines = parseInt(progress[0]?.completed_lines || 0);
        const totalVerses = parseInt(target.total_verses);
        const totalLines = parseInt(target.total_lines);

        const cappedVerses = Math.min(completedVerses, totalVerses);
        const cappedLines = Math.min(completedLines, totalLines);
        const versePercent = totalVerses > 0 ? cappedVerses / totalVerses : 0;
        const linePercent = totalLines > 0 ? cappedLines / totalLines : 0;
        const progressValue =
          versePercent + linePercent > 0
            ? Math.min(
                100,
                Number((((versePercent + linePercent) / 2) * 100).toFixed(2))
              )
            : 0;

        return {
          juz: target.juz,
          lines: totalLines,
          verses: totalVerses,
          completed: cappedVerses,
          completed_lines: cappedLines,
          uncompleted: totalVerses - cappedVerses,
          progress: progressValue,
          surah: surahs,
        };
      })
    );

    const result = {
      student,
      memorization,
      exceed,
      targets_by_grade: Object.values(targetsByGrade),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
