import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

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

export default router;
