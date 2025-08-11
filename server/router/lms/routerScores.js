import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const saved = "Berhasil menyimpan data";
const failed = "Gagal menyimpan data";
const updated = "Berhasil mengupdate data";
const removed = "Berhasil menghapus data";

const router = Router();

// Helper function to get active periode
const getActivePeriode = async (client, homebase) => {
  const periode = await client.query(
    `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
    [homebase]
  );
  return periode.rows[0]?.id;
};

// ==========================
// Attitude (Sikap)
// ==========================

// Get attitude scores for a class/subject/chapter/month
router.get("/attitude", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;
    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const result = await client.query(
      `SELECT * FROM l_attitude
         WHERE class_id = $1 AND subject_id = $2 AND chapter_id = $3
           AND month = $4 AND semester = $5 AND periode_id = $6
         ORDER BY student_id`,
      [classid, subjectid, chapterid, month, semester, periodeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Create or update attitude score (UPSERT)
router.post("/attitude", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      student_id,
      subject_id,
      class_id,
      chapter_id,
      month,
      semester,
      kinerja,
      kedisiplinan,
      keaktifan,
      percaya_diri,
      catatan_guru,
    } = req.body;

    if (
      !student_id ||
      !subject_id ||
      !class_id ||
      !chapter_id ||
      !month ||
      !semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in body" });
    }

    const homebase = req.user.homebase;
    const teacher_id = req.user.id;
    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const query = `
        INSERT INTO l_attitude (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
                     semester, month, kinerja, kedisiplinan, keaktifan, percaya_diri, catatan_guru
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (student_id, subject_id, class_id, chapter_id, month)
        DO UPDATE SET
                     kinerja = EXCLUDED.kinerja,
           kedisiplinan = EXCLUDED.kedisiplinan,
           keaktifan = EXCLUDED.keaktifan,
           percaya_diri = EXCLUDED.percaya_diri,
           catatan_guru = EXCLUDED.catatan_guru,
           updatedat = CURRENT_TIMESTAMP
        RETURNING *
      `;

    const params = [
      student_id,
      subject_id,
      class_id,
      periode_id,
      chapter_id,
      teacher_id,
      semester,
      month,
      kinerja ?? null,
      kedisiplinan ?? null,
      keaktifan ?? null,
      percaya_diri ?? null,
      catatan_guru ?? null,
    ];

    const result = await client.query(query, params);
    res.status(200).json({ message: saved, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==========================
// Formative
// ==========================

router.get("/formative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;
    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const result = await client.query(
      `SELECT * FROM l_formative
         WHERE class_id = $1 AND subject_id = $2 AND chapter_id = $3
           AND month = $4 AND semester = $5 AND periode_id = $6
         ORDER BY student_id`,
      [classid, subjectid, chapterid, month, semester, periodeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/formative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      student_id,
      subject_id,
      class_id,
      chapter_id,
      month,
      semester,
      F_1,
      F_2,
      F_3,
      F_4,
      F_5,
      F_6,
      F_7,
      F_8,
    } = req.body;

    if (
      !student_id ||
      !subject_id ||
      !class_id ||
      !chapter_id ||
      !month ||
      !semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in body" });
    }

    const homebase = req.user.homebase;
    const teacher_id = req.user.id;
    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const query = `
        INSERT INTO l_formative (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, F_1, F_2, F_3, F_4, F_5, F_6, F_7, F_8
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (student_id, subject_id, class_id, chapter_id, month)
        DO UPDATE SET
          F_1 = EXCLUDED.F_1,
          F_2 = EXCLUDED.F_2,
          F_3 = EXCLUDED.F_3,
          F_4 = EXCLUDED.F_4,
          F_5 = EXCLUDED.F_5,
          F_6 = EXCLUDED.F_6,
          F_7 = EXCLUDED.F_7,
                     F_8 = EXCLUDED.F_8,
           updatedat = CURRENT_TIMESTAMP
        RETURNING *
      `;

    const params = [
      student_id,
      subject_id,
      class_id,
      periode_id,
      chapter_id,
      teacher_id,
      semester,
      month,
      F_1 ?? null,
      F_2 ?? null,
      F_3 ?? null,
      F_4 ?? null,
      F_5 ?? null,
      F_6 ?? null,
      F_7 ?? null,
      F_8 ?? null,
    ];

    const result = await client.query(query, params);
    res.status(200).json({ message: saved, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==========================
// Summative
// ==========================

router.get("/summative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;
    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const result = await client.query(
      `SELECT * FROM l_summative
         WHERE class_id = $1 AND subject_id = $2 AND chapter_id = $3
           AND month = $4 AND semester = $5 AND periode_id = $6
         ORDER BY student_id`,
      [classid, subjectid, chapterid, month, semester, periodeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/summative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      student_id,
      subject_id,
      class_id,
      chapter_id,
      month,
      semester,
      S_1,
      S_2,
      S_3,
      S_4,
      S_5,
      S_6,
      S_7,
      S_8,
    } = req.body;

    if (
      !student_id ||
      !subject_id ||
      !class_id ||
      !chapter_id ||
      !month ||
      !semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in body" });
    }

    const homebase = req.user.homebase;
    const teacher_id = req.user.id;
    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const query = `
        INSERT INTO l_summative (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, S_1, S_2, S_3, S_4, S_5, S_6, S_7, S_8
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (student_id, subject_id, class_id, chapter_id, month)
        DO UPDATE SET
          S_1 = EXCLUDED.S_1,
          S_2 = EXCLUDED.S_2,
          S_3 = EXCLUDED.S_3,
          S_4 = EXCLUDED.S_4,
          S_5 = EXCLUDED.S_5,
          S_6 = EXCLUDED.S_6,
          S_7 = EXCLUDED.S_7,
                     S_8 = EXCLUDED.S_8,
           updatedat = CURRENT_TIMESTAMP
        RETURNING *
      `;

    const params = [
      student_id,
      subject_id,
      class_id,
      periode_id,
      chapter_id,
      teacher_id,
      semester,
      month,
      S_1 ?? null,
      S_2 ?? null,
      S_3 ?? null,
      S_4 ?? null,
      S_5 ?? null,
      S_6 ?? null,
      S_7 ?? null,
      S_8 ?? null,
    ];

    const result = await client.query(query, params);
    res.status(200).json({ message: saved, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==========================
// Recap Data
// ==========================

// Helper function to convert Indonesian month name to month number
const getMonthNumber = (monthName) => {
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

  return monthMap[monthName.toLowerCase()] || 1; // Default to January if not found
};

// Get comprehensive recap data for all students in a class
router.get("/recap", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;

    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    // Convert Indonesian month name to month number
    const currentMonth = getMonthNumber(month);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    console.log("Query params:", {
      classid,
      subjectid,
      chapterid,
      month,
      semester,
      periodeid,
      currentMonth,
      currentYear,
    });

    const query = `
      WITH student_data AS (
        SELECT 
          us.id as student_id,
          us.name as student_name,
          us.nis,
          cs.classid
        FROM cl_students cs
        JOIN u_students us ON cs.student = us.id
        WHERE cs.classid = $1 AND cs.periode = $2
      ),
      attendance_data AS (
        SELECT 
          la.studentid,
          COUNT(CASE WHEN la.note = 'Hadir' THEN 1 END) as hadir_count,
          COUNT(la.id) as total_days,
          CASE 
            WHEN COUNT(la.id) > 0 THEN 
              ROUND((COUNT(CASE WHEN la.note = 'Hadir' THEN 1 END)::DECIMAL / COUNT(la.id)::DECIMAL) * 100, 2)
            ELSE 0 
          END as attendance_percentage
        FROM l_attendance la
        WHERE la.classid = $1 
          AND la.subjectid = $3
          AND EXTRACT(MONTH FROM la.day_date) = $4
          AND EXTRACT(YEAR FROM la.day_date) = $5
          AND la.periode = $2
        GROUP BY la.studentid
      ),
      attitude_data AS (
        SELECT 
          lat.student_id,
          lat.rata_rata as attitude_average,
          lat.catatan_guru
        FROM l_attitude lat
        WHERE lat.class_id = $1 
          AND lat.subject_id = $3
          AND lat.chapter_id = $6
          AND lat.month = $7
          AND lat.semester = $8
          AND lat.periode_id = $2
      ),
      formative_data AS (
        SELECT 
          lf.student_id,
          lf.rata_rata as formative_average
        FROM l_formative lf
        WHERE lf.class_id = $1 
          AND lf.subject_id = $3
          AND lf.chapter_id = $6
          AND lf.month = $7
          AND lf.semester = $8
          AND lf.periode_id = $2
      ),
      summative_data AS (
        SELECT 
          ls.student_id,
          ls.rata_rata as summative_average
        FROM l_summative ls
        WHERE ls.class_id = $1 
          AND ls.subject_id = $3
          AND ls.chapter_id = $6
          AND ls.month = $7
          AND ls.semester = $8
          AND ls.periode_id = $2
      )
      SELECT 
        sd.student_id,
        sd.student_name,
        sd.nis,
        COALESCE(ad.attendance_percentage, 0) as kehadiran,
        COALESCE(atd.attitude_average, 0) as sikap,
        COALESCE(fd.formative_average, 0) as formatif,
        COALESCE(smd.summative_average, 0) as sumatif,
        atd.catatan_guru as catatan,
        ROUND(
          (COALESCE(ad.attendance_percentage, 0) + COALESCE(atd.attitude_average, 0) + 
           COALESCE(fd.formative_average, 0) + COALESCE(smd.summative_average, 0)) / 4.0, 2
        ) as rata_rata
      FROM student_data sd
      LEFT JOIN attendance_data ad ON sd.student_id = ad.studentid
      LEFT JOIN attitude_data atd ON sd.student_id = atd.student_id
      LEFT JOIN formative_data fd ON sd.student_id = fd.student_id
      LEFT JOIN summative_data smd ON sd.student_id = smd.student_id
      ORDER BY sd.student_name
    `;

    const result = await client.query(query, [
      classid,
      periodeid,
      subjectid,
      currentMonth,
      currentYear,
      chapterid,
      month, // Use original month name for attitude/formative/summative tables
      semester,
    ]);

    console.log("Query result:", result.rows);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
