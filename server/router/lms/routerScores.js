import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

export default router;

// ============================================
// ENDPOINTS UNTUK l_reports
// ============================================

// CREATE or UPDATE l_reports
router.post("/add-report", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      id,
      classid,
      subjectid,
      studentid,
      teacherid,
      periodeid,
      type_report,
      month,
      performance,
      discipline,
      activeness,
      confidence,
      teacher_note,
      note,
    } = req.body;
    await client.query("BEGIN");
    if (id) {
      await client.query(
        `UPDATE l_reports SET classid=$1, subjectid=$2, studentid=$3, teacherid=$4, periodeid=$5, type_report=$6, month=$7, performance=$8, discipline=$9, activeness=$10, confidence=$11, teacher_note=$12, note=$13 WHERE id=$14`,
        [
          classid,
          subjectid,
          studentid,
          teacherid,
          periodeid,
          type_report,
          month,
          performance,
          discipline,
          activeness,
          confidence,
          teacher_note,
          note,
          id,
        ]
      );
      await client.query("COMMIT");
      return res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO l_reports (classid, subjectid, studentid, teacherid, periodeid, type_report, month, performance, discipline, activeness, confidence, teacher_note, note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          classid,
          subjectid,
          studentid,
          teacherid,
          periodeid,
          type_report,
          month,
          performance,
          discipline,
          activeness,
          confidence,
          teacher_note,
          note,
        ]
      );
      await client.query("COMMIT");
      return res.status(200).json({ message: "Berhasil disimpan" });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// READ l_reports (with optional filters)
router.get("/get-reports", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, classid, subjectid, studentid, teacherid, periodeid } =
      req.query;
    let query = `SELECT * FROM l_reports WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (id) {
      query += ` AND id = $${idx++}`;
      params.push(id);
    }
    if (classid) {
      query += ` AND classid = $${idx++}`;
      params.push(classid);
    }
    if (subjectid) {
      query += ` AND subjectid = $${idx++}`;
      params.push(subjectid);
    }
    if (studentid) {
      query += ` AND studentid = $${idx++}`;
      params.push(studentid);
    }
    if (teacherid) {
      query += ` AND teacherid = $${idx++}`;
      params.push(teacherid);
    }
    if (periodeid) {
      query += ` AND periodeid = $${idx++}`;
      params.push(periodeid);
    }
    query += ` ORDER BY id DESC`;
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// DELETE l_reports
router.delete(
  "/delete-report",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID diperlukan" });
      await client.query("BEGIN");
      await client.query(`DELETE FROM l_reports WHERE id = $1`, [id]);
      await client.query("COMMIT");
      res.status(200).json({ message: "Berhasil dihapus" });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ============================================
// ENDPOINTS UNTUK l_scores
// ============================================

// CREATE or UPDATE l_scores
router.post("/add-score", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      id,
      reportid,
      contentid,
      taks_score,
      writing_score,
      speaking_score,
      lab_score,
      note,
    } = req.body;
    await client.query("BEGIN");
    if (id) {
      await client.query(
        `UPDATE l_scores SET reportid=$1, contentid=$2, taks_score=$3, writing_score=$4, speaking_score=$5, lab_score=$6, note=$7 WHERE id=$8`,
        [
          reportid,
          contentid,
          taks_score,
          writing_score,
          speaking_score,
          lab_score,
          note,
          id,
        ]
      );
      await client.query("COMMIT");
      return res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO l_scores (reportid, contentid, taks_score, writing_score, speaking_score, lab_score, note) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          reportid,
          contentid,
          taks_score,
          writing_score,
          speaking_score,
          lab_score,
          note,
        ]
      );
      await client.query("COMMIT");
      return res.status(200).json({ message: "Berhasil disimpan" });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// READ l_scores (with optional filters)
router.get("/get-scores", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, reportid, contentid } = req.query;
    let query = `SELECT * FROM l_scores WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (id) {
      query += ` AND id = $${idx++}`;
      params.push(id);
    }
    if (reportid) {
      query += ` AND reportid = $${idx++}`;
      params.push(reportid);
    }
    if (contentid) {
      query += ` AND contentid = $${idx++}`;
      params.push(contentid);
    }
    query += ` ORDER BY id DESC`;
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// DELETE l_scores
router.delete(
  "/delete-score",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID diperlukan" });
      await client.query("BEGIN");
      await client.query(`DELETE FROM l_scores WHERE id = $1`, [id]);
      await client.query("COMMIT");
      res.status(200).json({ message: "Berhasil dihapus" });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ============================================
// ENDPOINT: LAPORAN SISWA BERDASARKAN SUBJECT
// ============================================

router.get(
  "/student-report-by-subject",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { studentid, subjectid, classid } = req.query;
      if (!studentid || !subjectid || !classid) {
        return res
          .status(400)
          .json({ message: "studentid, subjectid, classid diperlukan" });
      }

      // 1. Get main report (attitude, teacher note, etc)
      const reportRes = await client.query(
        `SELECT r.*, t.name as teacher_name
       FROM l_reports r
       LEFT JOIN u_teachers t ON r.teacherid = t.id
       WHERE r.studentid = $1 AND r.subjectid = $2 AND r.classid = $3
       ORDER BY r.id DESC LIMIT 1`,
        [studentid, subjectid, classid]
      );
      const report = reportRes.rows[0];

      // 2. Get attendance (sakit, izin, alpa)
      const attendanceRes = await client.query(
        `SELECT 
        COUNT(*) FILTER (WHERE note ILIKE '%sakit%') as sakit,
        COUNT(*) FILTER (WHERE note ILIKE '%ijin%') as izin,
        COUNT(*) FILTER (WHERE note ILIKE '%alpa%') as alpa
      FROM l_attendance
      WHERE studentid = $1 AND subjectid = $2 AND classid = $3`,
        [studentid, subjectid, classid]
      );
      const attendance = attendanceRes.rows[0];

      // 3. Get all chapters and contents for this subject
      const chaptersRes = await client.query(
        `SELECT ch.id as chapter_id, ch.title as chapter_title
       FROM l_chapter ch
       WHERE ch.subject = $1
       ORDER BY ch.order_number ASC`,
        [subjectid]
      );
      const chapters = chaptersRes.rows;

      // 4. Get all contents (topics/materials) for these chapters
      const chapterIds = chapters.map((c) => c.chapter_id);
      let contents = [];
      if (chapterIds.length > 0) {
        const contentsRes = await client.query(
          `SELECT co.id, co.chapter, co.title, co.order_number
         FROM l_content co
         WHERE co.chapter = ANY($1)
         ORDER BY co.chapter, co.order_number ASC`,
          [chapterIds]
        );
        contents = contentsRes.rows;
      }

      // 5. Get all scores for this student and subject (by reportid)
      let scores = [];
      if (report) {
        const scoresRes = await client.query(
          `SELECT * FROM l_scores WHERE reportid = $1`,
          [report.id]
        );
        scores = scoresRes.rows;
      }

      // 6. Format response to match the image
      const topicList = contents.map((c, idx) => ({
        number: idx + 1,
        title: c.title,
        tugas: scores.find((s) => s.contentid === c.id)?.taks_score ?? null,
        tes_tulis:
          scores.find((s) => s.contentid === c.id)?.writing_score ?? null,
        tes_lisan:
          scores.find((s) => s.contentid === c.id)?.speaking_score ?? null,
        lab: scores.find((s) => s.contentid === c.id)?.lab_score ?? null,
      }));

      const response = {
        subjectid,
        studentid,
        classid,
        teacher: report?.teacher_name || null,
        sikap: {
          kinerja: report?.performance || null,
          kedisiplinan: report?.discipline || null,
          keaktifan: report?.activeness || null,
          kepercayaan_diri: report?.confidence || null,
        },
        kehadiran: {
          sakit: Number(attendance?.sakit) || 0,
          izin: Number(attendance?.izin) || 0,
          alpa: Number(attendance?.alpa) || 0,
        },
        catatan_guru: report?.teacher_note || null,
        catatan: report?.note || null,
        topic_list: topicList,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);
