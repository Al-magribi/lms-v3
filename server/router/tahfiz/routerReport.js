import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = Router();

const fetchQueryResults = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(query, params);
    return rows;
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

const buildStudentData = async (rows) => {
  // Gunakan Map untuk memastikan unik data per tanggal dan NIS
  const uniqueResults = new Map();

  for (const row of rows) {
    const dates = await fetchQueryResults(
      `SELECT DISTINCT DATE(createdat) AS date FROM t_scoring WHERE userid = $1 AND type_id = $2`,
      [row.userid, row.type_id]
    );

    for (const date of dates) {
      const uniqueKey = `${row.userid}_${date.date}_${row.type_id}`; // Kombinasi unik userid dan tanggal

      if (!uniqueResults.has(uniqueKey)) {
        const surahs = await fetchQueryResults(
          `SELECT * FROM t_process
           INNER JOIN t_surah ON t_process.surah_id = t_surah.id
           WHERE userid = $1 AND DATE(t_process.createdat) = $2 AND type_id = $3
					 ORDER BY t_surah.id ASC`,
          [row.userid, date.date, row.type_id]
        );

        const categories = await fetchQueryResults(
          `SELECT 
            t_scoring.*, 
            t_categories.name, 
            DATE(t_scoring.createdat) AS created_date 
          FROM 
            t_scoring 
          LEFT JOIN 
            t_categories 
          ON 
            t_scoring.category_id = t_categories.id
          WHERE 
            t_scoring.indicator_id IS NULL 
            AND t_scoring.type_id = $1 AND t_scoring.userid = $2 AND DATE(t_scoring.createdat) = $3`,
          [row.type_id, row.userid, date.date]
        );

        const indicators = await fetchQueryResults(
          `SELECT 
            t_scoring.*, 
            t_indicators.name, 
            DATE(t_scoring.createdat) AS created_date 
          FROM 
            t_scoring 
          LEFT JOIN 
            t_indicators 
          ON 
            t_scoring.indicator_id = t_indicators.id
          WHERE 
            t_scoring.indicator_id IS NOT NULL 
            AND t_scoring.type_id = $1 AND t_scoring.userid = $2 AND DATE(t_scoring.createdat) = $3
          ORDER BY 
            t_indicators.name ASC`,
          [row.type_id, row.userid, date.date]
        );

        const scores = categories.map((category) => {
          const relatedIndicators = indicators.filter(
            (indi) => indi.category_id === category.category_id
          );

          return {
            id: category.id,
            category_id: category.category_id,
            category: category.name,
            poin: Number(category.poin),
            date: category.created_date,
            indicators: relatedIndicators.map((indi) => ({
              id: indi.id,
              indicator_id: indi.indicator_id,
              indicator: indi.name,
              poin: indi.poin,
            })),
          };
        });

        const totalPoints = scores.reduce((acc, score) => acc + score.poin, 0);

        uniqueResults.set(uniqueKey, {
          userid: row.userid,
          nis: row.nis,
          name: row.student_name,
          grade: row.grade,
          class: row.class_name,
          scores,
          surahs: surahs.map((surah) => ({
            id: surah.id,
            surah_id: surah.surah_id,
            name: surah.name,
            from_ayat: surah.from_count,
            to_ayat: surah.to_count,
            from_line: surah.from_line,
            to_line: surah.to_line,
          })),
          type_id: row.type_id,
          type: row.type_name,
          examiner: row.examiner_name,
          examiner_id: row.examiner_id,
          totalPoints,
          date: date.date,
        });
      }
    }
  }

  // Return all unique results
  return Array.from(uniqueResults.values()).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
};

router.get("/get-all", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page = 1, limit = 10, search = "", type } = req.query;

    // Konversi page dan limit ke angka
    const numericLimit = parseInt(limit, 10);
    const numericOffset = (parseInt(page, 10) - 1) * numericLimit;

    // Kondisi tambahan untuk filter berdasarkan type_id
    const typeFilter = type ? "AND t.id = $2" : "";

    // Main query dengan search, type filter, dan pagination
    const mainQuery = `
      SELECT
        us.id AS userid,
        us.nis AS nis,
        us.name AS student_name,
        g.name AS grade,
        c.name AS class_name,
        t.name AS type_name,
        t.id AS type_id,
        e.name AS examiner_name,
        e.id AS examiner_id,
        ts.type_id
      FROM
        u_students us
        INNER JOIN cl_students cs ON us.id = cs.student
        INNER JOIN a_class c ON cs.classid = c.id
        INNER JOIN a_grade g ON c.grade = g.id
        INNER JOIN t_scoring ts ON us.id = ts.userid
        INNER JOIN t_type t ON ts.type_id = t.id
        INNER JOIN t_examiner e ON ts.examiner_id = e.id
      WHERE
        LOWER(us.name) LIKE LOWER($1)
        ${typeFilter}
      GROUP BY
        us.id, us.nis, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.id
      LIMIT ${numericLimit} OFFSET ${numericOffset}
    `;

    // Count query dengan search dan type filter
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT
          us.id
        FROM
          u_students us
          INNER JOIN cl_students cs ON us.id = cs.student
          INNER JOIN a_class c ON cs.classid = c.id
          INNER JOIN a_grade g ON c.grade = g.id
          INNER JOIN t_scoring ts ON us.id = ts.userid
          INNER JOIN t_type t ON ts.type_id = t.id
          INNER JOIN t_examiner e ON ts.examiner_id = e.id
        WHERE
          LOWER(us.name) LIKE LOWER($1)
          ${typeFilter}
        GROUP BY
          us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.id
      ) AS subquery
    `;

    // Menyusun parameter secara dinamis
    const params = [`%${search}%`];
    if (type) {
      params.push(type); // Tambahkan type jika ada
    }

    // Eksekusi query utama
    const rows = await fetchQueryResults(mainQuery, params);

    // Eksekusi query untuk menghitung total data
    const countResult = await fetchQueryResults(countQuery, params);

    const totalData = parseInt(countResult[0]?.total || 0, 10);
    const totalPages = Math.ceil(totalData / numericLimit);

    // Memproses data untuk laporan
    const report = await buildStudentData(rows);

    res.status(200).json({
      report,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-report/:userid", async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Konversi page dan limit ke angka
    const numericLimit = parseInt(limit, 10);
    const numericOffset = (parseInt(page, 10) - 1) * numericLimit;

    // Main query untuk mendapatkan data siswa berdasarkan userid dengan paginasi
    const mainQuery = `
      SELECT
        us.id AS userid,
        us.name AS student_name,
        g.name AS grade,
        c.name AS class_name,
        t.name AS type_name,
        t.id AS type_id,
        e.name AS examiner_name,
        e.id AS examiner_id,
        ts.type_id
      FROM
        u_students us
        INNER JOIN cl_students cs ON us.id = cs.student
        INNER JOIN a_class c ON cs.classid = c.id
        INNER JOIN a_grade g ON c.grade = g.id
        INNER JOIN t_scoring ts ON us.id = ts.userid
        INNER JOIN t_type t ON ts.type_id = t.id
        INNER JOIN t_examiner e ON ts.examiner_id = e.id
      WHERE
        us.id = $1
      GROUP BY
        us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.name
      LIMIT ${numericLimit} OFFSET ${numericOffset}
    `;

    // Count query untuk menghitung total data
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT
          us.id
        FROM
          u_students us
          INNER JOIN cl_students cs ON us.id = cs.student
          INNER JOIN a_class c ON cs.classid = c.id
          INNER JOIN a_grade g ON c.grade = g.id
          INNER JOIN t_scoring ts ON us.id = ts.userid
          INNER JOIN t_type t ON ts.type_id = t.id
          INNER JOIN t_examiner e ON ts.examiner_id = e.id
        WHERE
          us.id = $1
        GROUP BY
          us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.name
      ) AS subquery
    `;

    // Eksekusi query utama
    const rows = await fetchQueryResults(mainQuery, [userid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Eksekusi query untuk menghitung total data
    const countResult = await fetchQueryResults(countQuery, [userid]);
    const totalData = parseInt(countResult[0]?.total || 0, 10);
    const totalPages = Math.ceil(totalData / numericLimit);

    // Memproses data untuk laporan
    const report = await buildStudentData(rows);

    res.status(200).json({
      report,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-report/:type_id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { type_id } = req.params;
    const { page, limit, search } = req.query;

    const mainQuery = `
      SELECT
        us.id AS userid,
        us.name AS student_name,
        g.name AS grade,
        c.name AS class_name,
        t.name AS type_name,
        t.id AS type_id,
        e.name AS examiner_name,
        e.id AS examiner_id,
        ts.type_id
      FROM
        u_students us
        INNER JOIN cl_students cs ON us.id = cs.student
        INNER JOIN a_class c ON cs.classid = c.id
        INNER JOIN a_grade g ON c.grade = g.id
        INNER JOIN t_scoring ts ON us.id = ts.userid
        INNER JOIN t_type t ON ts.type_id = t.id
        INNER JOIN t_examiner e ON ts.examiner_id = e.id
      WHERE
        ts.type_id = $1
      GROUP BY
        us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.id
    `;

    const rows = await fetchQueryResults(mainQuery, [type_id]);

    const result = await buildStudentData(rows, type_id);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-report", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid, typeId, createdat } = req.query;

    // Parse the date from DD/MM/YYYY format
    const [day, month, year] = createdat.split("/");
    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}`;

    // Query untuk menghapus data berdasarkan userid, type_id, dan createdat
    const deleteScore = `
        DELETE FROM t_scoring
        WHERE userid = $1 AND type_id = $2 AND DATE(createdat) = $3
      `;

    const deleteSurah = `
        DELETE FROM t_process 
        WHERE userid = $1 AND type_id = $2 AND DATE(createdat) = $3
        `;

    const result = await client.query(deleteScore, [
      userid,
      typeId,
      formattedDate,
    ]);
    const resultSurah = await client.query(deleteSurah, [
      userid,
      typeId,
      formattedDate,
    ]);

    // Jika tidak ada data yang dihapus, berikan respons 404
    if (result.rowCount === 0 && resultSurah.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan atau sudah dihapus." });
    }

    res.status(200).json({
      message: remove,
      deletedScores: result.rowCount,
      deletedSurahs: resultSurah.rowCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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

    const activePeriodes = await fetchQueryResults(activePeriodeQuery);

    if (activePeriodes.length === 0) {
      return res.status(404).json({ message: "Tidak ada periode aktif" });
    }

    const result = [];

    for (const periode of activePeriodes) {
      // Query untuk mendapatkan target per grade dengan total ayat dan baris yang harus dicapai
      const gradeTargetQuery = `
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
			`;

      const gradeTargets = await fetchQueryResults(gradeTargetQuery, [
        periode.homebase_id,
      ]);

      // Query untuk mendapatkan progress siswa dengan perhitungan ketuntasan yang lebih akurat
      const studentProgressQuery = `
        WITH student_progress AS (
          SELECT 
            us.id as userid,
            us.nis,
            us.name as student_name,
            g.id as grade_id,
            g.name as grade_name,
            c.name as class_name,
            t.juz_id,
            tj.name as juz_name,
            COALESCE(SUM(tp.to_count - tp.from_count + 1), 0) as completed_verses,
            COALESCE(SUM(tp.to_line - tp.from_line + 1), 0) as completed_lines,
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
          LEFT JOIN t_process tp ON us.id = tp.userid 
            AND tp.juz_id = t.juz_id 
            AND tp.type_id = 6
          WHERE us.homebase = $2
          GROUP BY us.id, us.nis, us.name, g.id, g.name, c.name, t.juz_id, tj.name
          ORDER BY tj.name ASC
        )
        SELECT 
          userid,
          nis,
          student_name,
          grade_id,
          grade_name,
          class_name,
          ARRAY_AGG(juz_name ORDER BY juz_name ASC) as juz_names,
          ARRAY_AGG(completed_verses ORDER BY juz_name ASC) as completed_verses,
          ARRAY_AGG(completed_lines ORDER BY juz_name ASC) as completed_lines,
          ARRAY_AGG(target_verses ORDER BY juz_name ASC) as target_verses,
          ARRAY_AGG(target_lines ORDER BY juz_name ASC) as target_lines,
          ARRAY_AGG(
            CASE 
              WHEN target_verses > 0 AND target_lines > 0 THEN 
                ROUND(((completed_verses::numeric / target_verses::numeric) * 0.5 + 
                      (completed_lines::numeric / target_lines::numeric) * 0.5) * 100, 2)
              ELSE 0 
            END
            ORDER BY juz_name ASC
          ) as progress_percentages
        FROM student_progress
        GROUP BY userid, nis, student_name, grade_id, grade_name, class_name
        ORDER BY class_name, student_name
      `;

      const studentProgress = await fetchQueryResults(studentProgressQuery, [
        periode.periode_id,
        periode.homebase_id,
      ]);

      // Mengelompokkan data per grade
      const gradeData = gradeTargets.map((grade) => {
        const students = studentProgress.filter(
          (s) => s.grade_id === grade.grade_id
        );

        // Menghitung siswa yang tuntas (progress >= 100% untuk semua juz)
        const completedStudents = students.filter((student) =>
          student.progress_percentages.every((percentage) => percentage >= 100)
        ).length;

        const totalStudents = students.length;
        const achievement =
          totalStudents > 0
            ? Number(((completedStudents / totalStudents) * 100).toFixed(2))
            : 0;

        return {
          id: grade.grade_id,
          name: grade.grade_name,
          target: grade.juz_names.map((name, idx) => ({
            juz: name,
            lines: grade.total_target_lines,
          })),
          achievement,
          completed: completedStudents,
          uncompleted: totalStudents - completedStudents,
          students: students.map((student) => ({
            userid: student.userid,
            nis: student.nis,
            name: student.student_name,
            grade: student.grade_name,
            class: student.class_name,
            progress: student.juz_names.map((juz, idx) => ({
              juz: juz,
              verses: {
                completed: student.completed_verses[idx],
                target: student.target_verses[idx],
                percentage:
                  student.target_verses[idx] > 0
                    ? Number(
                        (
                          (student.completed_verses[idx] /
                            student.target_verses[idx]) *
                          100
                        ).toFixed(2)
                      )
                    : 0,
              },
              lines: {
                completed: student.completed_lines[idx],
                target: student.target_lines[idx],
                percentage:
                  student.target_lines[idx] > 0
                    ? Number(
                        (
                          (student.completed_lines[idx] /
                            student.target_lines[idx]) *
                          100
                        ).toFixed(2)
                      )
                    : 0,
              },
              persentase: student.progress_percentages[idx],
            })),
          })),
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
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-student-report", async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid } = req.query;

    // Get student basic info with class details
    const studentQuery = `
      SELECT 
        us.id as student_id,
        us.nis as student_nis,
        us.name as student_name,
        g.name as grade,
        c.name as class,
        h.name as homebase
      FROM u_students us
      INNER JOIN cl_students cs ON us.id = cs.student
      INNER JOIN a_class c ON cs.classid = c.id
      INNER JOIN a_grade g ON c.grade = g.id
      INNER JOIN a_homebase h ON g.homebase = h.id
      WHERE us.id = $1
    `;

    const studentInfo = await fetchQueryResults(studentQuery, [userid]);

    if (studentInfo.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get target juz based on student's grade
    const targetQuery = `
      SELECT 
        tj.id as juz_id,
        tj.name as juz,
        SUM(tji.lines) as total_lines,
        SUM(tji.to_ayat - tji.from_ayat + 1) as total_verses
      FROM t_target tt
      INNER JOIN t_juz tj ON tt.juz_id = tj.id
      INNER JOIN t_juzitems tji ON tj.id = tji.juz_id
      WHERE tt.grade_id = (
        SELECT c.grade 
        FROM cl_students cs
        INNER JOIN a_class c ON cs.classid = c.id
        WHERE cs.student = $1
      )
      GROUP BY tj.id, tj.name
    `;

    const targets = await fetchQueryResults(targetQuery, [userid]);

    // Get student's progress for each juz
    const memorization = await Promise.all(
      targets.map(async (target) => {
        // Get completed verses and lines for this juz
        const progressQuery = `
          SELECT 
            COALESCE(SUM(tp.to_count - tp.from_count + 1), 0) as completed_verses,
            COALESCE(SUM(tp.to_line - tp.from_line + 1), 0) as completed_lines
          FROM t_process tp
          WHERE tp.userid = $1 AND tp.juz_id = $2 AND tp.type_id = 6
        `;

        const progress = await fetchQueryResults(progressQuery, [
          userid,
          target.juz_id,
        ]);

        // Get surah details for this juz
        const surahQuery = `
          SELECT 
            ts.id as surah_id,
            ts.name as surah_name,
            tp.to_count as verse,
            tp.to_line as line
          FROM t_process tp
          INNER JOIN t_surah ts ON tp.surah_id = ts.id
          WHERE tp.userid = $1 AND tp.juz_id = $2 AND tp.type_id = 6
          ORDER BY tp.createdat DESC
        `;

        const surahs = await fetchQueryResults(surahQuery, [
          userid,
          target.juz_id,
        ]);

        const completedVerses = parseInt(progress[0]?.completed_verses || 0);
        const completedLines = parseInt(progress[0]?.completed_lines || 0);
        const totalVerses = parseInt(target.total_verses);
        const totalLines = parseInt(target.total_lines);

        return {
          juz: target.juz,
          lines: totalLines,
          verses: totalVerses,
          completed: completedVerses,
          uncompleted: totalVerses - completedVerses,
          progress:
            totalVerses > 0
              ? Number(((completedVerses / totalVerses) * 100).toFixed(2))
              : 0,
          surah: surahs,
        };
      })
    );

    const result = {
      student_id: studentInfo[0].student_id,
      student_nis: studentInfo[0].student_nis,
      student_name: studentInfo[0].student_name,
      grade: studentInfo[0].grade,
      class: studentInfo[0].class,
      homebase: studentInfo[0].homebase,
      memorization,
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

const result = [
  {
    periode: "2024 - 2025",
    periode_id: 14,
    homebase: "SMA Nuraida",
    homebase_id: 6,
    grade: [
      {
        id: 17,
        name: "12",
        target: [
          {
            juz: "Juz 2",
            lines: "1792",
          },
          {
            juz: "Juz 3",
            lines: "1792",
          },
          {
            juz: "Juz 4",
            lines: "1792",
          },
          {
            juz: "Juz 5",
            lines: "1792",
          },
          {
            juz: "Juz 6",
            lines: "1792",
          },
          {
            juz: "Juz 7",
            lines: "1792",
          },
        ],
        achievement: 0,
        completed:
          "total siswa yang sudah tuntas membaca semua lines pada masing-masing juz",
        uncompleted:
          "total siswa yang belum tuntas membaca semua lines pada masing-masing juz",
        students: [
          {
            userid: 2327,
            nis: "222310274",
            name: "Adinda Shafa Phalosa",
            grade: "12",
            class: "12 DI",
            progress: [
              {
                juz: "Juz 5",
                lines:
                  "total baris dari yang sudah dibaca dari surah yang termasuk dalam juz 5",
                persentase:
                  "persentase dari total baris yang sudah dibaca dari total baris yang harus dibaca yang sesuai dengan juz di target",
              },
              {
                juz: "Juz 7",
                lines:
                  "total baris dari yang sudah dibaca dari surah yang termasuk dalam juz 7",
                persentase:
                  "persentase dari total baris yang sudah dibaca dari total baris yang harus dibaca yang sesuai dengan juz di target",
              },
              {
                juz: "Juz 2",
                lines:
                  "total baris dari yang sudah dibaca dari surah yang termasuk dalam juz 2",
                persentase:
                  "persentase dari total baris yang sudah dibaca dari total baris yang harus dibaca yang sesuai dengan juz di target",
              },
              {
                juz: "Juz 4",
                lines:
                  "total baris dari yang sudah dibaca dari surah yang termasuk dalam juz 4",
                persentase:
                  "persentase dari total baris yang sudah dibaca dari total baris yang harus dibaca yang sesuai dengan juz di target",
              },
              {
                juz: "Juz 3",
                lines:
                  "total baris dari yang sudah dibaca dari surah yang termasuk dalam juz 3",
                persentase:
                  "persentase dari total baris yang sudah dibaca dari total baris yang harus dibaca yang sesuai dengan juz di target",
              },
              {
                juz: "Juz 6",
                lines:
                  "total baris dari yang sudah dibaca dari surah yang termasuk dalam juz 6",
                persentase:
                  "persentase dari total baris yang sudah dibaca dari total baris yang harus dibaca yang sesuai dengan juz di target",
              },
            ],
          },
        ],
      },
    ],
  },
];

// const result = [
//   {
//     student_id: "id siswa diambil dari u_students",
//     student_nis: "id siswa diambil dari u_students",
//     student_name: "nama siswa diambil dari u_students",
//     grade: "kelas siswa diambil dari cl_students",
//     class: "kelas siswa diambil dari cl_students",
//     homebase: "homebase siswa diambil dari cl_students",
//     memorization: [
//       {
//         juz: "juz diambil dari t_target berdasarkan garde",
//         lines: "total baris yang harus dibaca berdasarkan juz",
//         verses: "total ayat yang harus dibaca berdasarkan juz",
//         completed: "total ayat yang sudah dibaca berdasarkan juz",
//         uncompleted: "total ayat yang belum dibaca berdasarkan juz",
//         progress: "persentase ketuntasan siswa berdasarkan juz",
//         surah: [
//           {
//             surah_id: "id surah diambil dari t_process",
//             surah_name: "nama surah diambil dari t_process",
//             verse: "ayat akhir diambil dari t_process",
//             line: "baris akhir diambil dari t_process",
//           },
//         ],
//       },
//     ],
//   },
// ];
