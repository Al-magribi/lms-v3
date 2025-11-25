import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";
import moment from "moment";

const router = Router();

const getMonthNumber = (monthName) => {
  const months = {
    januari: 1,
    februari: 2,
    maret: 3,
    april: 4,
    mei: 5,
    juni: 6,
    juli: 7,
    agustus: 8,
    september: 9,
    oktober: 10,
    november: 11,
    desember: 12,
  };
  return months[monthName.toLowerCase()];
};

// Rekap nilai perchapter perbulan VIEW GURU
router.get("/chapter-final-score", authorize("teacher"), async (req, res) => {
  const {
    classid,
    subjectid, // subjectId akan digunakan untuk filter yang lebih akurat
    chapterid,
    month,
    search = "",
    page = 1,
    limit = 10,
  } = req.query;

  // Menambahkan validasi untuk subjectId demi akurasi
  if (!classid || !chapterid || !month || !subjectid) {
    return res.status(400).json({
      message:
        "Parameter classid, subjectId, chapterid, dan month wajib diisi.",
    });
  }

  const client = await pool.connect();
  try {
    // --- Langkah 1: Dapatkan Periode Aktif ---
    const periodeRes = await client.query(
      `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [req.user.homebase]
    );
    if (periodeRes.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Periode aktif tidak ditemukan." });
    }
    const periode = periodeRes.rows[0].id;

    // --- Langkah 2: Siapkan Parameter ---
    const monthNumber = getMonthNumber(month);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchPattern = `%${search}%`;

    // --- Langkah 3: Query Utama yang Komprehensif ---
    const mainQuery = `
        WITH ChapterInfo AS (
          SELECT
            lc.teacher AS teacher_id,
            lc.subject AS subject_id
          FROM l_chapter lc
          WHERE lc.id = $1
        ),
        StudentList AS (
          SELECT cs.student AS student_id, cs.student_name
          FROM cl_students cs
          WHERE cs.classid = $2 AND cs.periode = $3 AND cs.student_name ILIKE $4
        ),
        TotalSessions AS (
          SELECT COUNT(DISTINCT la.day_date)::NUMERIC AS total_meetings
          FROM l_attendance la
          WHERE la.classid = $2
            AND la.subjectid = $9
            AND EXTRACT(MONTH FROM la.day_date) = $5
            AND la.periode = $3
        ),
        AttendanceRaw AS (
          SELECT sl.student_id,
            (COUNT(att.id) FILTER (WHERE att.note = 'Hadir'))::NUMERIC * 100.0 / NULLIF((SELECT total_meetings FROM TotalSessions), 0) AS percentage
          FROM StudentList sl
          LEFT JOIN l_attendance att ON sl.student_id = att.studentid
            AND att.classid = $2
            AND att.periode = $3
            AND EXTRACT(MONTH FROM att.day_date) = $5
            AND att.subjectid = $9
          GROUP BY sl.student_id
        ),
        -- [PERBAIKAN] Menghitung rata-rata nilai sikap secara manual
        AttitudeRaw AS (
          SELECT
            la.student_id,
            (
              -- Menjumlahkan 4 komponen. COALESCE mengubah nilai NULL menjadi 0 agar penambahan aman.
              COALESCE(la.kinerja, 0) +
              COALESCE(la.kedisiplinan, 0) +
              COALESCE(la.keaktifan, 0) +
              COALESCE(la.percaya_diri, 0)
            ) / 4.0 AS score -- Dibagi 4.0 untuk mendapatkan rata-rata dalam format desimal.
          FROM l_attitude la
          WHERE la.class_id = $2
            AND la.chapter_id = $1
            AND la.periode_id = $3
            AND la.subject_id = $9
            AND LOWER(la.month) = LOWER($6)
        ),
        DailyRaw AS (
          -- Logika ini sudah benar dari perbaikan sebelumnya
          SELECT
            student_id,
            AVG(score) AS score
          FROM (
            SELECT student_id, UNNEST(ARRAY[f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8]) AS score
            FROM l_formative
            WHERE class_id = $2 AND chapter_id = $1 AND periode_id = $3 AND subject_id = $9 AND LOWER(month) = LOWER($6)
            UNION ALL
            SELECT student_id, UNNEST(ARRAY[oral, written, project, performance]) AS score
            FROM l_summative
            WHERE class_id = $2 AND chapter_id = $1 AND periode_id = $3 AND subject_id = $9 AND LOWER(month) = LOWER($6)
          ) AS individual_scores
          WHERE score IS NOT NULL
          GROUP BY student_id
        )
        -- --- Final Select: Menggabungkan Semua Data dan Mengaplikasikan Bobot ---
        SELECT
          sl.student_id,
          sl.student_name,
          COALESCE(ar.percentage, 0) as attendance_raw,
          COALESCE(atr.score, 0) as attitude_raw,
          COALESCE(dr.score, 0) as daily_raw,
          COALESCE(ar.percentage * w.presensi / 100.0, 0) AS attendance,
          COALESCE(atr.score * w.attitude / 100.0, 0) AS attitude,
          COALESCE(dr.score * w.daily / 100.0, 0) AS daily,
          (
            COALESCE(ar.percentage * w.presensi / 100.0, 0) +
            COALESCE(atr.score * w.attitude / 100.0, 0) +
            COALESCE(dr.score * w.daily / 100.0, 0)
          ) AS final_score,
          (SELECT name FROM a_subject WHERE id = $9) as subject_name,
          (SELECT title FROM l_chapter WHERE id = $1) as chapter_name,
          (SELECT name FROM a_class WHERE id = $2) as class_name,
          (SELECT name FROM u_teachers WHERE id = ci.teacher_id) as teacher_name
        FROM StudentList sl
        CROSS JOIN ChapterInfo ci
        LEFT JOIN l_weighting w ON w.teacherid = ci.teacher_id AND w.subjectid = ci.subject_id
        LEFT JOIN AttendanceRaw ar ON sl.student_id = ar.student_id
        LEFT JOIN AttitudeRaw atr ON sl.student_id = atr.student_id
        LEFT JOIN DailyRaw dr ON sl.student_id = dr.student_id
        ORDER BY sl.student_name ASC
        LIMIT $7 OFFSET $8;
      `;

    const totalQuery = `
        SELECT COUNT(*) FROM cl_students
        WHERE classid = $1 AND periode = $2 AND student_name ILIKE $3;
      `;

    const queryParams = [
      chapterid, // $1
      classid, // $2
      periode, // $3
      searchPattern, // $4
      monthNumber, // $5
      month, // $6
      limit, // $7
      offset, // $8
      subjectid, // $9 (parameter baru untuk query)
    ];

    // Menjalankan kedua query secara paralel
    const resultsPromise = client.query(mainQuery, queryParams);
    const totalPromise = client.query(totalQuery, [
      classid,
      periode,
      searchPattern,
    ]);
    const [resultsRes, totalRes] = await Promise.all([
      resultsPromise,
      totalPromise,
    ]);

    const totalData = parseInt(totalRes.rows[0].count);

    // --- Langkah 4: Format Hasil ---
    const formattedResults = resultsRes.rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      // Header info
      subject_name: row.subject_name,
      chapter_name: row.chapter_name,
      class_name: row.class_name,
      teacher_name: row.teacher_name,
      // Scores
      attendance: parseFloat(row.attendance).toFixed(2),
      attitude:
        row.attitude_raw > 0
          ? parseFloat(row.attitude).toFixed(2)
          : "Tidak ada nilai",
      daily:
        row.daily_raw > 0
          ? parseFloat(row.daily).toFixed(2)
          : "Tidak ada nilai",
      final_score: parseFloat(row.final_score).toFixed(2),
    }));

    res.status(200).json({
      results: formattedResults,
      totalData: totalData,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalData / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error di endpoint /chapter-final-score:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  } finally {
    client.release();
  }
});

router.get("/monthly-recap", async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId, month, periode } = req.query;

    if (!studentId || !month || !periode) {
      return res.status(400).json({
        message: "Parameter studentId, month, dan periode wajib diisi.",
      });
    }

    const monthNumber = getMonthNumber(month);
    if (monthNumber === 0) {
      return res.status(400).json({ message: "Nama bulan tidak valid." });
    }

    const query = `
      WITH StudentClass AS (
        SELECT classid FROM cl_students WHERE student = $1 AND periode = $2
      ),
      DailyScores AS (
        SELECT
          chapter_id,
          AVG(score) AS avg_score
        FROM (
          SELECT chapter_id, UNNEST(ARRAY[f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8]) AS score
          FROM l_formative
          WHERE student_id = $1 AND periode_id = $2 AND month = $4
          UNION ALL
          SELECT chapter_id, UNNEST(ARRAY[oral, written, project, performance]) AS score
          FROM l_summative
          WHERE student_id = $1 AND periode_id = $2 AND month = $4
        ) individual_scores
        WHERE score IS NOT NULL
        GROUP BY chapter_id
      ),
      AttitudeScores AS (
          SELECT
              chapter_id,
              (COALESCE(kinerja, 0) + COALESCE(kedisiplinan, 0) + COALESCE(keaktifan, 0) + COALESCE(percaya_diri, 0)) / 4.0 AS avg_score,
              kinerja,
              kedisiplinan,
              keaktifan,
              percaya_diri,
              catatan_guru
          FROM l_attitude
          WHERE student_id = $1 AND periode_id = $2 AND month = $4
      ),
      ChapterScores AS (
        SELECT
          lc.subject AS subject_id,
          s.name AS subject_name,
          cat.name AS category_name,
          b.name AS branch_name,
          t.name AS teacher_name,
          lc.id AS chapter_id,
          lc.title AS chapter_name,
          w.presensi,
          w.attitude,
          w.daily,
          TRUNC(
            (COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Hadir')) * 100.0 /
            NULLIF((SELECT COUNT(DISTINCT day_date) FROM l_attendance
                    WHERE subjectid = lc.subject AND classid = sc.classid AND periode = $2 AND EXTRACT(MONTH FROM day_date) = $3), 0)
          , 0) AS attendance_percentage,
          COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Hadir') AS hadir,
          COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Sakit') AS sakit,
          COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Izin') AS ijin,
          COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Alpa') AS alpa,
          COALESCE(ats.avg_score, 0) AS avg_attitude,
          COALESCE(ats.kinerja, 0) AS kinerja,
          COALESCE(ats.kedisiplinan, 0) AS kedisiplinan,
          COALESCE(ats.keaktifan, 0) AS keaktifan,
          COALESCE(ats.percaya_diri, 0) AS percaya_diri,
          ats.catatan_guru as note,
          COALESCE(ds.avg_score, 0) AS avg_daily_score,
          COALESCE(AVG(sm.oral), 0) AS oral,
          COALESCE(AVG(sm.written), 0) AS written,
          COALESCE(AVG(sm.project), 0) AS project,
          COALESCE(AVG(sm.performance), 0) AS performance,
          jsonb_agg(DISTINCT f.rata_rata) FILTER (WHERE f.rata_rata IS NOT NULL) AS formative_scores
        FROM l_chapter lc
        JOIN l_cclass lcc ON lc.id = lcc.chapter
        JOIN a_subject s ON lc.subject = s.id
        JOIN u_teachers t ON lc.teacher = t.id
        JOIN StudentClass sc ON lcc.classid = sc.classid
        LEFT JOIN a_category cat ON s.categoryid = cat.id
        LEFT JOIN a_branch b ON s.branchid = b.id
        LEFT JOIN l_weighting w ON lc.teacher = w.teacherid AND s.id = w.subjectid
        LEFT JOIN l_attendance attd ON s.id = attd.subjectid AND attd.studentid = $1 AND attd.periode = $2 AND EXTRACT(MONTH FROM attd.day_date) = $3
        LEFT JOIN AttitudeScores ats ON lc.id = ats.chapter_id
        LEFT JOIN DailyScores ds ON lc.id = ds.chapter_id
        LEFT JOIN l_summative sm ON lc.id = sm.chapter_id AND sm.student_id = $1 AND sm.periode_id = $2 AND sm.month = $4
        LEFT JOIN l_formative f ON lc.id = f.chapter_id AND f.student_id = $1 AND f.periode_id = $2 AND f.month = $4
        WHERE lcc.classid = sc.classid
          AND (ats.chapter_id IS NOT NULL OR ds.chapter_id IS NOT NULL)
        -- [PERBAIKAN FINAL] Melengkapi klausa GROUP BY dengan lc.subject
        GROUP BY
            lc.subject, -- Penyebab error sebelumnya
            lc.id, s.id, t.id, cat.id, b.id, w.id, sc.classid,
            s.name, cat.name, b.name, t.name, lc.title,
            w.presensi, w.attitude, w.daily,
            ats.avg_score, ats.kinerja, ats.kedisiplinan, ats.keaktifan, ats.percaya_diri, ats.catatan_guru,
            ds.avg_score
      )
      SELECT
        s.nis, s.name AS student_name, hb.name AS homebase_name, p.name AS periode_name,
        g.name AS grade_name, c.name AS class_name, th.name AS teacher_homeroom,
        cs.*
      FROM u_students s
      JOIN cl_students cl ON s.id = cl.student
      JOIN a_periode p ON cl.periode = p.id
      JOIN a_class c ON cl.classid = c.id
      JOIN a_homebase hb ON c.homebase = hb.id
      JOIN a_grade g ON c.grade = g.id
      LEFT JOIN u_teachers th ON c.id = th.class AND th.homeroom = TRUE
      LEFT JOIN ChapterScores cs ON 1=1
      WHERE s.id = $1 AND cl.periode = $2;
    `;

    const { rows } = await client.query(query, [
      studentId,
      periode,
      monthNumber,
      month,
    ]);

    if (rows.length === 0 || !rows[0].subject_id) {
      const studentInfoQuery = await client.query(
        `
        SELECT s.nis, s.name AS student_name, hb.name AS homebase_name, p.name AS periode_name,
               g.name AS grade_name, c.name AS class_name, th.name AS teacher_homeroom
        FROM u_students s
        JOIN cl_students cl ON s.id = cl.student
        JOIN a_periode p ON cl.periode = p.id
        JOIN a_class c ON cl.classid = c.id
        JOIN a_homebase hb ON c.homebase = hb.id
        JOIN a_grade g ON c.grade = g.id
        LEFT JOIN u_teachers th ON c.id = th.class AND th.homeroom = TRUE
        WHERE s.id = $1 AND cl.periode = $2;
      `,
        [studentId, periode]
      );

      if (studentInfoQuery.rows.length === 0) {
        return res.status(404).json({ message: "Data siswa tidak ditemukan." });
      }

      const studentData = studentInfoQuery.rows[0];
      const response = {
        month: month,
        nis: studentData.nis,
        name: studentData.student_name,
        homebase: studentData.homebase_name,
        periode: studentData.periode_name,
        grade: studentData.grade_name,
        class: studentData.class_name,
        teacher_homeroom: studentData.teacher_homeroom || "-",
        category: [],
      };
      return res.status(200).json(response);
    }

    const studentInfo = {
      month: month,
      nis: rows[0].nis,
      name: rows[0].student_name,
      homebase: rows[0].homebase_name,
      periode: rows[0].periode_name,
      grade: rows[0].grade_name,
      class: rows[0].class_name,
      teacher_homeroom: rows[0].teacher_homeroom || "-",
    };

    const subjectsMap = new Map();

    for (const row of rows) {
      if (!row.subject_id) continue;

      const attendanceFinal =
        (Number(row.attendance_percentage) * Number(row.presensi || 0)) / 100;
      const attitudeFinal =
        (Number(row.avg_attitude) * Number(row.attitude || 0)) / 100;
      const dailyFinal =
        (Number(row.avg_daily_score) * Number(row.daily || 0)) / 100;
      const chapterScore = attendanceFinal + attitudeFinal + dailyFinal;

      const chapterData = {
        id: row.chapter_id,
        name: row.chapter_name,
        score: parseFloat(chapterScore.toFixed(2)),
        note: row.note || null,
        detail: [
          {
            attendance: [
              { Hadir: Number(row.hadir || 0) },
              { Sakit: Number(row.sakit || 0) },
              { Ijin: Number(row.ijin || 0) },
              { Alpa: Number(row.alpa || 0) },
              {
                presentase: parseFloat(
                  Number(row.attendance_percentage || 0).toFixed(2)
                ),
              },
            ],
          },
          {
            attitude: [
              { kinerja: parseFloat(Number(row.kinerja || 0).toFixed(2)) },
              {
                kedisiplinan: parseFloat(
                  Number(row.kedisiplinan || 0).toFixed(2)
                ),
              },
              { keaktifan: parseFloat(Number(row.keaktifan || 0).toFixed(2)) },
              {
                percaya_diri: parseFloat(
                  Number(row.percaya_diri || 0).toFixed(2)
                ),
              },
            ],
          },
          {
            summative: [
              { lisan: parseFloat(Number(row.oral || 0).toFixed(2)) },
              { tulis: parseFloat(Number(row.written || 0).toFixed(2)) },
              { proyek: parseFloat(Number(row.project || 0).toFixed(2)) },
              {
                keterampilan: parseFloat(
                  Number(row.performance || 0).toFixed(2)
                ),
              },
            ],
            formative: (row.formative_scores || []).map((val) =>
              parseFloat(Number(val).toFixed(2))
            ),
          },
        ],
      };

      if (!subjectsMap.has(row.subject_id)) {
        subjectsMap.set(row.subject_id, {
          name: row.subject_name,
          teacher: row.teacher_name,
          category_name: row.category_name,
          branch_name: row.branch_name,
          chapters: [],
        });
      }
      subjectsMap.get(row.subject_id).chapters.push(chapterData);
    }

    const subjectsArray = Array.from(subjectsMap.values()).map((subj) => {
      const totalChapterScore = subj.chapters.reduce(
        (sum, chap) => sum + chap.score,
        0
      );
      const avgSubjectScore =
        subj.chapters.length > 0 ? totalChapterScore / subj.chapters.length : 0;
      return {
        ...subj,
        score: parseFloat(avgSubjectScore.toFixed(2)),
      };
    });

    const categoriesMap = new Map();
    for (const subjectData of subjectsArray) {
      const categoryName = subjectData.category_name || "Lainnya";
      if (!categoriesMap.has(categoryName)) {
        const isDiniyah = categoryName === "Diniyah";
        categoriesMap.set(categoryName, {
          name: categoryName,
          ...(isDiniyah ? { branch: [] } : { subjects: [] }),
        });
      }
      const category = categoriesMap.get(categoryName);
      if (categoryName === "Diniyah") {
        const branchName = subjectData.branch_name || "Tanpa Rumpun";
        let branch = category.branch.find((b) => b.name === branchName);
        if (!branch) {
          branch = { name: branchName, subjects: [] };
          category.branch.push(branch);
        }
        branch.subjects.push(subjectData);
      } else {
        category.subjects.push(subjectData);
      }
    }

    const categoryArray = Array.from(categoriesMap.values());

    const diniyahCat = categoryArray.find((c) => c.name === "Diniyah");
    if (diniyahCat) {
      diniyahCat.branch.forEach((b) => {
        const totalScore = b.subjects.reduce((sum, sub) => sum + sub.score, 0);
        b.score =
          b.subjects.length > 0
            ? parseFloat((totalScore / b.subjects.length).toFixed(2))
            : 0;
      });
    }

    categoryArray.sort((a, b) => a.name.localeCompare(b.name));

    for (const category of categoryArray) {
      if (category.name === "Diniyah" && category.branch) {
        for (const branch of category.branch) {
          branch.subjects.sort((a, b) => a.name.localeCompare(b.name));
        }
        category.branch.sort((a, b) => a.name.localeCompare(b.name));
      } else if (category.subjects) {
        category.subjects.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    res.status(200).json({ ...studentInfo, category: categoryArray });
  } catch (error) {
    console.error("Error fetching monthly recap:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

router.get("/final-score", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { semester, classid, subjectid } = req.query;
    const homebase = req.user.homebase;

    // Validasi input
    if (!semester || !classid || !subjectid) {
      return res
        .status(400)
        .json({ message: "Semester, Class ID, and Subject ID are required" });
    }

    // 1. Ambil Periode Aktif
    const periodeResult = await client.query(
      `SELECT id FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );
    if (periodeResult.rows.length === 0)
      return res.status(404).json({ message: "No active period found" });
    const activePeriode = periodeResult.rows[0].id;

    // 2. Ambil Bobot Nilai (HAPUS bobot daily, hanya pakai presensi, attitude, final)
    const subjectResult = await client.query(
      `SELECT presensi, attitude, final FROM a_subject WHERE id = $1`,
      [subjectid]
    );
    if (subjectResult.rows.length === 0)
      return res.status(404).json({ message: "Subject not found" });

    const weights = {
      presensi: subjectResult.rows[0].presensi || 0,
      attitude: subjectResult.rows[0].attitude || 0,
      final: subjectResult.rows[0].final || 0, // Ini akan menjadi bobot gabungan (Sumatif + UAS)
    };

    // 3. Query Utama
    const query = `
      WITH 
      -- A. Daftar Siswa
      student_list AS (
        SELECT s.id, s.name, s.nis
        FROM u_students s
        JOIN cl_students cl ON s.id = cl.student
        WHERE cl.classid = $1 AND cl.periode = $2
      ),
      
      -- B. Hitung Absensi (Global Denominator)
      total_days_calc AS (
        SELECT COUNT(DISTINCT day_date)::float as total_days
        FROM l_attendance
        WHERE classid = $1 AND subjectid = $3 AND periode = $2
        AND (
            ($4 = 1 AND EXTRACT(MONTH FROM day_date) BETWEEN 7 AND 12) OR
            ($4 = 2 AND EXTRACT(MONTH FROM day_date) BETWEEN 1 AND 6)
        )
      ),
      attendance_raw AS (
        SELECT 
            studentid,
            COUNT(*) FILTER (WHERE note = 'Hadir') as total_hadir
        FROM l_attendance
        WHERE classid = $1 AND subjectid = $3 AND periode = $2
          AND (
            ($4 = 1 AND EXTRACT(MONTH FROM day_date) BETWEEN 7 AND 12) OR
            ($4 = 2 AND EXTRACT(MONTH FROM day_date) BETWEEN 1 AND 6)
          )
        GROUP BY studentid
      ),

      -- C. Hitung Sikap
      attitude_calc AS (
        SELECT student_id, AVG(val) as score
        FROM (
            SELECT student_id, unnest(ARRAY[kinerja, kedisiplinan, keaktifan, percaya_diri]) as val
            FROM l_attitude
            WHERE class_id = $1 AND subject_id = $3 AND periode_id = $2 AND semester = $4
        ) raw_att
        WHERE val IS NOT NULL 
        GROUP BY student_id
      ),

      -- D. Hitung Sumatif (PENGGANTI HARIAN)
      -- Hanya mengambil dari l_summative sesuai instruksi
      summative_calc AS (
        SELECT student_id, AVG(val) as score
        FROM (
            SELECT student_id, unnest(ARRAY[oral, written, project, performance]) as val 
            FROM l_summative 
            WHERE class_id = $1 AND subject_id = $3 AND periode_id = $2 AND semester = $4
        ) raw_sum
        WHERE val IS NOT NULL 
        GROUP BY student_id
      ),

      -- E. Ujian Akhir (UAS)
      final_test_calc AS (
        SELECT studentid, score
        FROM l_finalscore
        WHERE classid = $1 AND subjectid = $3 AND periode = $2 AND semester = $4
      )

      -- F. Gabungkan
      SELECT 
        s.id, s.nis, s.name,
        (COALESCE(attd.total_hadir, 0)::float / NULLIF((SELECT total_days FROM total_days_calc), 0) * 100) AS nilai_kehadiran,
        COALESCE(att.score, 0) AS nilai_sikap,
        COALESCE(sum_calc.score, 0) AS nilai_sumatif, -- Ini sekarang murni rata-rata sumatif
        COALESCE(fin.score, 0) AS nilai_ujian_akhir
      FROM student_list s
      LEFT JOIN attendance_raw attd ON s.id = attd.studentid
      LEFT JOIN attitude_calc att ON s.id = att.student_id
      LEFT JOIN summative_calc sum_calc ON s.id = sum_calc.student_id
      LEFT JOIN final_test_calc fin ON s.id = fin.studentid
      ORDER BY s.name ASC;
    `;

    const result = await client.query(query, [
      classid,
      activePeriode,
      subjectid,
      semester,
    ]);

    const finalData = result.rows.map((row, index) => {
      const n_absen = parseFloat(row.nilai_kehadiran || 0);
      const n_sikap = parseFloat(row.nilai_sikap || 0);
      const n_sumatif = parseFloat(row.nilai_sumatif || 0); // Kolom C di Excel
      const n_uas = parseFloat(row.nilai_ujian_akhir || 0); // Kolom D di Excel

      // LOGIC BARU SESUAI GAMBAR EXCEL:
      // 1. Hitung Rerata Sumatif & Ujian Akhir (Kolom E di Excel)
      //    Rumus: (Sumatif + UAS) / 2
      const rerata_akademik = (n_sumatif + n_uas) / 2;

      // 2. Hitung Nilai Akhir (Kolom F di Excel)
      //    Rumus: (Absen * Bobot_Absen) + (Sikap * Bobot_Sikap) + (Rerata_Akademik * Bobot_Final)
      const totalScore =
        (n_absen * weights.presensi) / 100 +
        (n_sikap * weights.attitude) / 100 +
        (rerata_akademik * weights.final) / 100;

      return {
        no: index + 1,
        nis: row.nis,
        nama_siswa: row.name,
        kehadiran: n_absen.toFixed(0),
        sikap: n_sikap.toFixed(0),
        sumatif: n_sumatif.toFixed(0), // Ditampilkan sebagai info
        ujian_akhir: n_uas.toFixed(0), // Ditampilkan sebagai info
        rerata_gabungan: rerata_akademik.toFixed(0), // Debugging: nilai tengah (Kolom E)
        nilai_akhir: totalScore.toFixed(0),
      };
    });

    res.json({ weights, data: finalData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Rekap Nilai Harian
router.get("/daily-recap", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { semester, classid, subjectid } = req.query;
    const homebase = req.user.homebase;

    // 1. Validasi input
    if (!semester || !classid || !subjectid) {
      return res
        .status(400)
        .json({ message: "Semester, Class ID, and Subject ID are required" });
    }

    // 2. Ambil Periode Aktif
    const periodeResult = await client.query(
      `SELECT id FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );
    if (periodeResult.rows.length === 0) {
      return res.status(404).json({ message: "No active period found" });
    }
    const activePeriode = periodeResult.rows[0].id;

    // 3. Tentukan List Bulan berdasarkan Semester
    // Pastikan ejaan sama persis dengan yang ada di database (CONSTRAINT check)
    let targetMonths = [];
    if (parseInt(semester) === 1) {
      targetMonths = [
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
    } else {
      targetMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
    }

    // 4. Jalankan Query secara Paralel (Siswa, Formatif, Sumatif)
    const [studentsRes, formativeRes, summativeRes] = await Promise.all([
      // A. Ambil Data Siswa di Kelas tersebut
      client.query(
        `SELECT s.id, s.nis, s.name 
         FROM u_students s
         JOIN cl_students cl ON s.id = cl.student
         WHERE cl.classid = $1 AND cl.periode = $2
         ORDER BY s.name ASC`,
        [classid, activePeriode]
      ),
      // B. Ambil Nilai Formatif
      client.query(
        `SELECT student_id, month, f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8 
         FROM l_formative 
         WHERE class_id = $1 AND subject_id = $2 AND periode_id = $3 AND semester = $4`,
        [classid, subjectid, activePeriode, semester]
      ),
      // C. Ambil Nilai Sumatif
      client.query(
        `SELECT student_id, month, oral, written, project, performance 
         FROM l_summative 
         WHERE class_id = $1 AND subject_id = $2 AND periode_id = $3 AND semester = $4`,
        [classid, subjectid, activePeriode, semester]
      ),
    ]);

    // 5. Helper Function untuk grouping data agar mudah diakses
    // Buat Map: key = "studentId_NamaBulan", value = row data
    const formativeMap = {};
    formativeRes.rows.forEach((row) => {
      formativeMap[`${row.student_id}_${row.month}`] = row;
    });

    const summativeMap = {};
    summativeRes.rows.forEach((row) => {
      summativeMap[`${row.student_id}_${row.month}`] = row;
    });

    // 6. Susun Data Akhir
    const finalData = studentsRes.rows.map((student, index) => {
      let totalScore = 0;
      let scoreCount = 0;
      const scoresByMonth = {};

      // Loop setiap bulan untuk mengisi kolom-kolom bulan
      targetMonths.forEach((month) => {
        const key = `${student.id}_${month}`;

        // Ambil data jika ada, jika tidak ada object kosong
        const fData = formativeMap[key] || {};
        const sData = summativeMap[key] || {};

        // Kumpulkan semua nilai mentah untuk bulan ini
        // Digunakan untuk frontend menampilkan angka di kolom masing-masing
        const monthScores = {
          f_1: fData.f_1 || null,
          f_2: fData.f_2 || null,
          f_3: fData.f_3 || null,
          f_4: fData.f_4 || null,
          f_5: fData.f_5 || null,
          f_6: fData.f_6 || null,
          f_7: fData.f_7 || null,
          f_8: fData.f_8 || null,
          oral: sData.oral || null, // Lisan
          written: sData.written || null, // Tulis
          project: sData.project || null, // Projek
          performance: sData.performance || null, // Keterampilan/Praktik
        };

        // Logic Hitung Rata-Rata Total (Gabungan Formatif & Sumatif semua bulan)
        // Kita iterasi value di monthScores, jika tidak null, tambahkan ke total
        Object.values(monthScores).forEach((val) => {
          if (val !== null && val !== undefined) {
            totalScore += parseInt(val);
            scoreCount++;
          }
        });

        // Masukkan data bulan ini ke object student
        scoresByMonth[month] = monthScores;
      });

      // Hitung Rata-rata Akhir
      const finalAverage =
        scoreCount > 0 ? (totalScore / scoreCount).toFixed(2) : 0;

      return {
        no: index + 1,
        nis: student.nis,
        nama_siswa: student.name,
        scores: scoresByMonth, // Object berisi data per bulan (Juli, Agustus, dst)
        rata_rata: finalAverage,
      };
    });

    // 7. Kirim Response
    // Kita kirim juga 'months' agar frontend tahu urutan kolom header tabelnya
    res.json({
      months: targetMonths,
      data: finalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Rekap Presensi
router.get(
  "/attendance-recap",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { semester, classid, subjectid } = req.query;
      const homebase = req.user.homebase;

      // 1. Validasi input
      if (!semester || !classid || !subjectid) {
        return res
          .status(400)
          .json({ message: "Semester, Class ID, and Subject ID are required" });
      }

      // 2. Ambil Periode Aktif
      const periodeResult = await client.query(
        `SELECT id FROM a_periode WHERE isactive = true AND homebase = $1`,
        [homebase]
      );
      if (periodeResult.rows.length === 0) {
        return res.status(404).json({ message: "No active period found" });
      }
      const activePeriode = periodeResult.rows[0].id;

      // 3. Tentukan Range Bulan (Angka) untuk Query Database
      // Sem 1: Bulan 7-12, Sem 2: Bulan 1-6
      let targetMonthNumbers = [];
      if (parseInt(semester) === 1) {
        targetMonthNumbers = [7, 8, 9, 10, 11, 12];
      } else {
        targetMonthNumbers = [1, 2, 3, 4, 5, 6];
      }

      // 4. Query Utama: Ambil Siswa + Data Absensi mereka di semester ini
      // Kita gunakan LEFT JOIN agar siswa yang belum pernah diabsen tetap muncul
      const query = `
      SELECT 
        s.id, s.nis, s.name,
        a.day_date, 
        a.note
      FROM u_students s
      JOIN cl_students cl ON s.id = cl.student
      LEFT JOIN l_attendance a ON s.id = a.studentid 
        AND a.classid = $1 
        AND a.subjectid = $2 
        AND a.periode = $3
        AND EXTRACT(MONTH FROM a.day_date) = ANY($4::int[])
      WHERE cl.classid = $1 AND cl.periode = $3
      ORDER BY s.name ASC, a.day_date ASC
    `;

      const result = await client.query(query, [
        classid,
        subjectid,
        activePeriode,
        targetMonthNumbers,
      ]);

      // 5. Processing Data: Grouping dan Mapping

      // A. Siapkan Set untuk mencatat semua tanggal unik yang ada (agar header dinamis)
      const uniqueDatesSet = new Set();
      // B. Grouping data per siswa
      const studentMap = {};

      result.rows.forEach((row) => {
        // Inisialisasi object siswa jika belum ada
        if (!studentMap[row.id]) {
          studentMap[row.id] = {
            id: row.id,
            nis: row.nis,
            name: row.name,
            attendance: {}, // Key: Tanggal (YYYY-MM-DD), Value: Note
            summary: { H: 0, S: 0, I: 0, A: 0 },
          };
        }

        // Jika row ini memiliki data absensi (karena LEFT JOIN bisa null)
        if (row.day_date) {
          // Format tanggal jadi YYYY-MM-DD agar seragam
          const dateKey = moment(row.day_date).format("YYYY-MM-DD");

          // Simpan ke set unik (untuk header tabel nanti)
          uniqueDatesSet.add(dateKey);

          // Simpan status ke record siswa
          studentMap[row.id].attendance[dateKey] = row.note;

          // Hitung Summary
          if (row.note === "Hadir") studentMap[row.id].summary.H += 1;
          else if (row.note === "Sakit") studentMap[row.id].summary.S += 1;
          else if (row.note === "Izin") studentMap[row.id].summary.I += 1;
          else if (row.note === "Alpa") studentMap[row.id].summary.A += 1;
        }
      });

      // 6. Menyusun Metadata Header (Grouping Tanggal per Bulan)
      // Ubah Set jadi Array dan Sort
      const sortedDates = Array.from(uniqueDatesSet).sort();

      // Mapping nama bulan Indonesia
      const monthNamesIndo = [
        "",
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      // Struktur: { "Juli": ["2023-07-01", "2023-07-05"], "Agustus": [...] }
      const dateColumnsByMonth = {};

      sortedDates.forEach((dateStr) => {
        const monthIndex = moment(dateStr).month() + 1; // moment month is 0-indexed
        const monthName = monthNamesIndo[monthIndex];

        if (!dateColumnsByMonth[monthName]) {
          dateColumnsByMonth[monthName] = [];
        }
        dateColumnsByMonth[monthName].push(dateStr);
      });

      // 7. Format Final Response
      const finalData = Object.values(studentMap).map((s, index) => ({
        no: index + 1,
        ...s,
      }));

      res.json({
        // Struktur Tanggal untuk Header Tabel
        dateMapping: dateColumnsByMonth,
        // Data Baris Siswa
        data: finalData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Rekap Nilai Sikap
router.get(
  "/attitude-recap",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { semester, classid, subjectid } = req.query;
      const homebase = req.user.homebase;

      // 1. Validasi Input
      if (!semester || !classid || !subjectid) {
        return res
          .status(400)
          .json({ message: "Semester, Class ID, and Subject ID are required" });
      }

      // 2. Ambil Periode Aktif
      const periodeResult = await client.query(
        `SELECT id FROM a_periode WHERE isactive = true AND homebase = $1`,
        [homebase]
      );
      if (periodeResult.rows.length === 0) {
        return res.status(404).json({ message: "No active period found" });
      }
      const activePeriode = periodeResult.rows[0].id;

      // 3. Tentukan List Bulan berdasarkan Semester
      let targetMonths = [];
      if (parseInt(semester) === 1) {
        targetMonths = [
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
      } else {
        targetMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      }

      // 4. Query Data (Parallel: Siswa & Nilai Sikap)
      const [studentsRes, attitudeRes] = await Promise.all([
        // A. Ambil Daftar Siswa (Urut Abjad)
        client.query(
          `SELECT s.id, s.nis, s.name 
         FROM u_students s
         JOIN cl_students cl ON s.id = cl.student
         WHERE cl.classid = $1 AND cl.periode = $2
         ORDER BY s.name ASC`,
          [classid, activePeriode]
        ),
        // B. Ambil Nilai Sikap
        client.query(
          `SELECT student_id, month, kinerja, kedisiplinan, keaktifan, percaya_diri
         FROM l_attitude 
         WHERE class_id = $1 AND subject_id = $2 AND periode_id = $3 AND semester = $4`,
          [classid, subjectid, activePeriode, semester]
        ),
      ]);

      // 5. Mapping Data Nilai agar mudah diakses (Key: studentId_Bulan)
      const attitudeMap = {};
      attitudeRes.rows.forEach((row) => {
        // Key unik kombinasi ID siswa dan Bulan
        attitudeMap[`${row.student_id}_${row.month}`] = row;
      });

      // 6. Susun Response Akhir
      const finalData = studentsRes.rows.map((student, index) => {
        const scoresByMonth = {};
        let totalSum = 0;
        let totalCount = 0;

        // Loop setiap bulan yang ditargetkan semester ini
        targetMonths.forEach((month) => {
          const key = `${student.id}_${month}`;
          const data = attitudeMap[key];

          if (data) {
            // Jika ada nilai di bulan ini
            scoresByMonth[month] = {
              kinerja: data.kinerja || 0,
              kedisiplinan: data.kedisiplinan || 0,
              keaktifan: data.keaktifan || 0,
              percaya_diri: data.percaya_diri || 0,
            };

            // Tambahkan ke kalkulasi rata-rata total
            // (Asumsi: Rata-rata diambil dari 4 komponen yang ada nilainya)
            const sumComponents =
              (data.kinerja || 0) +
              (data.kedisiplinan || 0) +
              (data.keaktifan || 0) +
              (data.percaya_diri || 0);
            totalSum += sumComponents;
            totalCount += 4; // Karena ada 4 komponen
          } else {
            // Jika tidak ada nilai, set null/0 agar frontend bisa handle (tampil strip)
            scoresByMonth[month] = null;
          }
        });

        // Hitung Rata-rata Akhir Semester
        const finalAverage =
          totalCount > 0 ? (totalSum / totalCount).toFixed(0) : 0;

        return {
          no: index + 1,
          nis: student.nis,
          name: student.name,
          scores: scoresByMonth, // Object berisi key Nama Bulan
          final_score: finalAverage,
        };
      });

      res.json({
        months: targetMonths, // Kirim list bulan agar Frontend tahu urutan kolom
        data: finalData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
