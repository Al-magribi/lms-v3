import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

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

// Filter
router.get("/categories", async (req, res) => {
  const client = await pool.connect();
  try {
    const homebase = req.user.homebase;
    const results = await client.query(
      `SELECT * FROM a_category
    WHERE homebase = $1`,
      [homebase]
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/branches", async (req, res) => {
  try {
    const { categoryid } = req.query;
    const homebase = req.user.homebase;

    const results = await client.query(
      `SELECT *
    FORM a_branch WHERE categoryid = $1 AND homebase = $2`,
      [categoryid, homebase]
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Rekap nilai perchapter perbulan
router.get(
  "/chapter-final-score",
  authorize("teacher", "admin", "student", "parent"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { month, chapterid, classid, search } = req.query;
      const homebaseid = req.user.homebase;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      if (!month || !chapterid || !classid || !homebaseid) {
        return res.status(400).json({
          message:
            "Parameter month, chapterid, classid, and homebaseid wajib diisi.",
        });
      }

      // Konversi nama bulan ke angka untuk query kehadiran yang andal
      const monthMap = {
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
      const monthNumber = monthMap[month.toLowerCase()];

      if (!monthNumber) {
        return res.status(400).json({ message: "Nama bulan tidak valid." });
      }

      const searchQuery = `%${search || ""}%`;

      // **PERBAIKAN**: Menggunakan `month` (string) dan `monthNumber` (integer)
      // secara terpisah dalam parameter query.
      const queryParams = [
        chapterid, // $1
        classid, // $2
        monthNumber, // $3 (untuk attendance)
        homebaseid, // $4
        limit, // $5
        offset, // $6
        searchQuery, // $7
        month, // $8 (untuk attitude & daily)
      ];

      const scoreQuery = `
      WITH
      ActivePeriode AS (
        SELECT id AS periode_id
        FROM a_periode
        WHERE homebase = $4 AND isactive = TRUE
        LIMIT 1
      ),
      ChapterInfo AS (
        SELECT
            lc.id AS chapter_id, lc.title AS chapter_name, lc.teacher AS teacher_id,
            ut.name AS teacher_name, lc.subject AS subject_id, su.name AS subject_name
        FROM l_chapter lc
        JOIN u_teachers ut ON lc.teacher = ut.id
        JOIN a_subject su ON lc.subject = su.id
        WHERE lc.id = $1
      ),
      TotalSessions AS (
        SELECT COUNT(DISTINCT day_date)::NUMERIC AS total_days
        FROM l_attendance
        WHERE
            classid = $2
            AND subjectid = (SELECT subject_id FROM ChapterInfo)
            AND EXTRACT(MONTH FROM day_date) = $3 -- Menggunakan angka bulan
            AND periode = (SELECT periode_id FROM ActivePeriode)
      ),
      AttendanceRaw AS (
        SELECT
            studentid,
            (COUNT(CASE WHEN note ILIKE 'Hadir' THEN 1 END)::NUMERIC / NULLIF((SELECT total_days FROM TotalSessions), 0)) * 100 AS score
        FROM l_attendance
        WHERE
            classid = $2
            AND subjectid = (SELECT subject_id FROM ChapterInfo)
            AND EXTRACT(MONTH FROM day_date) = $3 -- Menggunakan angka bulan
            AND periode = (SELECT periode_id FROM ActivePeriode)
        GROUP BY studentid
      ),
      -- **PERBAIKAN**: Menggunakan parameter ke-8 ($8) yang berisi string nama bulan
      AttitudeRaw AS (
        SELECT student_id, rata_rata AS score
        FROM l_attitude
        WHERE class_id = $2 AND chapter_id = (SELECT chapter_id FROM ChapterInfo)
          AND teacher_id = (SELECT teacher_id FROM ChapterInfo) AND LOWER(month) = LOWER($8)
      ),
      -- **PERBAIKAN**: Menggunakan parameter ke-8 ($8) yang berisi string nama bulan
      DailyRaw AS (
        SELECT student_id, AVG(rata_rata) AS score
        FROM (
            SELECT student_id, rata_rata FROM l_formative WHERE class_id = $2 AND chapter_id = (SELECT chapter_id FROM ChapterInfo) AND teacher_id = (SELECT teacher_id FROM ChapterInfo) AND LOWER(month) = LOWER($8)
            UNION ALL
            SELECT student_id, rata_rata FROM l_summative WHERE class_id = $2 AND chapter_id = (SELECT chapter_id FROM ChapterInfo) AND teacher_id = (SELECT teacher_id FROM ChapterInfo) AND LOWER(month) = LOWER($8)
        ) AS combined_scores
        GROUP BY student_id
      ),
      StudentList AS (
        SELECT s.id AS student_id, s.name AS student_name, cls.name as class_name
        FROM u_students s
        JOIN cl_students cs ON s.id = cs.student
        JOIN a_class cls ON cs.classid = cls.id
        WHERE cs.classid = $2
        AND cs.periode = (SELECT periode_id FROM ActivePeriode)
        AND s.name ILIKE $7
      )
      SELECT
        sl.student_id, sl.student_name, sl.class_name,
        ci.subject_name, ci.chapter_name, ci.teacher_name,
        ROUND(COALESCE(ar.score, 0) * COALESCE(w.presensi, 0) / 100.0, 2) AS attendance,
        ROUND(COALESCE(atr.score, 0) * COALESCE(w.attitude, 0) / 100.0, 2) AS attitude,
        ROUND(COALESCE(dr.score, 0) * COALESCE(w.daily, 0) / 100.0, 2) AS daily,
        ROUND(
            (COALESCE(ar.score, 0) * COALESCE(w.presensi, 0) / 100.0) +
            (COALESCE(atr.score, 0) * COALESCE(w.attitude, 0) / 100.0) +
            (COALESCE(dr.score, 0) * COALESCE(w.daily, 0) / 100.0),
        2) AS final_score
      FROM
        StudentList sl
      CROSS JOIN ChapterInfo ci
      LEFT JOIN l_weighting w ON w.teacherid = ci.teacher_id AND w.subjectid = ci.subject_id
      LEFT JOIN AttendanceRaw ar ON sl.student_id = ar.studentid
      LEFT JOIN AttitudeRaw atr ON sl.student_id = atr.student_id
      LEFT JOIN DailyRaw dr ON sl.student_id = dr.student_id
      ORDER BY sl.student_name
      LIMIT $5
      OFFSET $6;
    `;

      const totalCountQuery = `
        SELECT COUNT(*)
        FROM cl_students cs
        JOIN u_students s ON cs.student = s.id
        WHERE cs.classid = $1 
        AND cs.periode = (SELECT id FROM a_periode WHERE homebase = $2 AND isactive = TRUE LIMIT 1)
        AND s.name ILIKE $3;
      `;

      const scoreResult = await client.query(scoreQuery, queryParams);
      const totalResult = await client.query(totalCountQuery, [
        classid,
        homebaseid,
        searchQuery,
      ]);

      const totalData = parseInt(totalResult.rows[0].count, 10);

      res.status(200).json({ results: scoreResult.rows, totalData });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan saat memproses permintaan Anda." });
    } finally {
      client.release();
    }
  }
);

router.get("/monthly-recap", async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId, month, periode } = req.query;

    if (!studentId || !month || !periode) {
      return res.status(400).json({
        message: "Parameter studentId, month, dan periode wajib diisi.",
      });
    }

    // --- QUERY DENGAN PERBAIKAN AMBIGUITY ---
    const query = `
        WITH ActiveSubjects AS (
            -- Mengambil semua mata pelajaran yang diikuti siswa di periode aktif
            SELECT DISTINCT s.id as subject_id, s.name as subject_name,
                            cat.name as category_name, b.name as branch_name,
                            t.name as teacher_name, cat.id as category_id,
                            w.presensi, w.attitude, w.daily
            FROM u_students us
            JOIN cl_students cs ON us.id = cs.student
            JOIN l_cclass lcc ON cs.classid = lcc.classid
            JOIN l_chapter lc ON lcc.chapter = lc.id
            JOIN a_subject s ON lc.subject = s.id
            JOIN u_teachers t ON lc.teacher = t.id
            LEFT JOIN a_category cat ON s.categoryid = cat.id
            LEFT JOIN a_branch b ON s.branchid = b.id
            LEFT JOIN l_weighting w ON lc.teacher = w.teacherid AND s.id = w.subjectid
            WHERE us.id = $1 AND cs.periode = $2
        ),
        AttendanceData AS (
            -- Menghitung data kehadiran
            SELECT subjectid,
                COALESCE(COUNT(*) FILTER (WHERE note = 'Hadir'), 0) AS hadir,
                COALESCE(COUNT(*) FILTER (WHERE note = 'Sakit'), 0) AS sakit,
                COALESCE(COUNT(*) FILTER (WHERE note = 'Ijin'), 0) AS ijin,
                COALESCE(COUNT(*) FILTER (WHERE note = 'Alpa'), 0) AS alpa,
                TRUNC(COALESCE((COUNT(*) FILTER (WHERE note = 'Hadir')) * 100.0 / NULLIF(COUNT(*), 0), 0), 2) AS attendance_percentage
            FROM l_attendance
            WHERE studentid = $1 AND periode = $2 AND EXTRACT(MONTH FROM day_date) = $3
            GROUP BY subjectid
        ),
        ScoreData AS (
            -- Menghitung semua data nilai
            -- [FIX] Memberi alias 's' pada a_subject untuk kejelasan
            SELECT
                s.id as subject_id,
                COALESCE(AVG(att.rata_rata), 0) as avg_attitude,
                COALESCE(AVG(att.kinerja), 0) as kinerja, COALESCE(AVG(att.kedisiplinan), 0) as kedisiplinan,
                COALESCE(AVG(att.keaktifan), 0) as keaktifan, COALESCE(AVG(att.percaya_diri), 0) as percaya_diri,
                COALESCE(AVG(sm.rata_rata), 0) as avg_summative,
                COALESCE(AVG(sm.oral), 0) as oral, COALESCE(AVG(sm.written), 0) as written,
                COALESCE(AVG(sm.project), 0) as project, COALESCE(AVG(sm.performance), 0) as performance,
                COALESCE(AVG(f.rata_rata), 0) as avg_formative,
                jsonb_agg(DISTINCT f.rata_rata) FILTER (WHERE f.rata_rata IS NOT NULL) AS formative_scores,
                string_agg(DISTINCT att.catatan_guru, ' | ') as note,
                jsonb_agg(DISTINCT jsonb_build_object('id', ch.id, 'name', ch.title)) FILTER (WHERE ch.id IS NOT NULL) as chapters
            FROM a_subject s
            LEFT JOIN l_attitude att ON s.id = att.subject_id AND att.student_id = $1 AND att.periode_id = $2 AND att.month = $4
            LEFT JOIN l_summative sm ON s.id = sm.subject_id AND sm.student_id = $1 AND sm.periode_id = $2 AND sm.month = $4
            LEFT JOIN l_formative f ON s.id = f.subject_id AND f.student_id = $1 AND f.periode_id = $2 AND f.month = $4
            LEFT JOIN l_chapter ch ON (att.chapter_id = ch.id OR sm.chapter_id = ch.id OR f.chapter_id = ch.id)
            GROUP BY s.id
        )
        SELECT
            s.nis, s.name AS student_name, hb.name AS homebase_name, p.name AS periode_name,
            g.name AS grade_name, c.name AS class_name, th.name AS teacher_homeroom,
            subj.*,
            COALESCE(ad.hadir, 0) AS hadir, COALESCE(ad.sakit, 0) AS sakit,
            COALESCE(ad.ijin, 0) AS ijin, COALESCE(ad.alpa, 0) AS alpa,
            COALESCE(ad.attendance_percentage, 0) AS attendance_score,
            -- [FIX] Menggunakan sc.subject_id untuk menghindari ambiguitas
            sc.avg_attitude, sc.kinerja, sc.kedisiplinan, sc.keaktifan, sc.percaya_diri,
            sc.avg_summative, sc.oral, sc.written, sc.project, sc.performance,
            sc.avg_formative, sc.formative_scores, sc.note, sc.chapters
        FROM u_students s
        JOIN cl_students cs ON s.id = cs.student
        JOIN a_periode p ON cs.periode = p.id
        JOIN a_class c ON cs.classid = c.id
        JOIN a_homebase hb ON c.homebase = hb.id
        JOIN a_grade g ON c.grade = g.id
        LEFT JOIN u_teachers th ON c.id = th.class AND th.homeroom = TRUE
        JOIN ActiveSubjects subj ON 1=1
        LEFT JOIN AttendanceData ad ON subj.subject_id = ad.subjectid
        -- [FIX] Menggunakan sc.subject_id untuk join agar tidak ambigu
        LEFT JOIN ScoreData sc ON subj.subject_id = sc.subject_id
        WHERE s.id = $1 AND cs.periode = $2;
      `;

    const monthNumber = getMonthNumber(month);
    const { rows } = await client.query(query, [
      studentId,
      periode,
      monthNumber,
      month,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Data rekapitulasi tidak ditemukan." });
    }

    // Bagian pemrosesan data di bawah ini tidak perlu diubah
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

    const categoriesMap = new Map();

    for (const row of rows) {
      const dailyScoreAvg =
        (Number(row.avg_formative) + Number(row.avg_summative)) / 2;
      const weightedScore =
        (Number(row.attendance_score) * Number(row.presensi || 0)) / 100 +
        (Number(row.avg_attitude) * Number(row.attitude || 0)) / 100 +
        (dailyScoreAvg * Number(row.daily || 0)) / 100;

      const subjectData = {
        name: row.subject_name,
        teacher: row.teacher_name,
        score: parseFloat(weightedScore.toFixed(2)),
        chapters: row.chapters || [],
        note: row.note || null,
        detail: [
          {
            attendance: [
              { Hadir: Number(row.hadir) },
              { Sakit: Number(row.sakit) },
              { Ijin: Number(row.ijin) },
              { Alpa: Number(row.alpa) },
              {
                presentase: parseFloat(Number(row.attendance_score).toFixed(2)),
              },
            ],
          },
          {
            attitude: [
              { kinerja: parseFloat(Number(row.kinerja).toFixed(2)) },
              { kedisiplinan: parseFloat(Number(row.kedisiplinan).toFixed(2)) },
              { keaktifan: parseFloat(Number(row.keaktifan).toFixed(2)) },
              { percaya_diri: parseFloat(Number(row.percaya_diri).toFixed(2)) },
            ],
          },
          {
            summative: [
              { lisan: parseFloat(Number(row.oral).toFixed(2)) },
              { tulis: parseFloat(Number(row.written).toFixed(2)) },
              { proyek: parseFloat(Number(row.project).toFixed(2)) },
              { keterampilan: parseFloat(Number(row.performance).toFixed(2)) },
            ],
            formative: (row.formative_scores || []).map((val) =>
              parseFloat(Number(val).toFixed(2))
            ),
          },
        ],
      };

      const categoryName = row.category_name || "Lainnya";
      if (!categoriesMap.has(categoryName)) {
        const isDiniyah = categoryName === "Diniyah";
        categoriesMap.set(categoryName, {
          name: categoryName,
          ...(isDiniyah ? { branch: [] } : { subjects: [] }),
        });
      }

      const category = categoriesMap.get(categoryName);
      if (categoryName === "Diniyah") {
        const branchName = row.branch_name || "Tanpa Rumpun";
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

    res.status(200).json([{ ...studentInfo, category: categoryArray }]);
  } catch (error) {
    console.error("Error fetching monthly recap:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

export default router;
