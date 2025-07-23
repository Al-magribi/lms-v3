import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

// 1. GET: List laporan bulanan
router.get("/reports", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { periodeid, classid, subjectid, month, studentid } = req.query;
    let query = `SELECT * FROM l_reports WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (periodeid) {
      query += ` AND periodeid = $${idx++}`;
      params.push(periodeid);
    }
    if (classid) {
      query += ` AND classid = $${idx++}`;
      params.push(classid);
    }
    if (subjectid) {
      query += ` AND subjectid = $${idx++}`;
      params.push(subjectid);
    }
    if (month) {
      query += ` AND month = $${idx++}`;
      params.push(month);
    }
    if (studentid) {
      query += ` AND studentid = $${idx++}`;
      params.push(studentid);
    }
    query += ` ORDER BY classid, subjectid, studentid, month`;
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 2. GET: Detail laporan bulanan (header + detail nilai)
router.get("/report/:id", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const report = await client.query(`SELECT * FROM l_reports WHERE id = $1`, [
      id,
    ]);
    if (report.rowCount === 0)
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    const scores = await client.query(
      `SELECT * FROM l_scores WHERE reportid = $1`,
      [id]
    );
    res.status(200).json({ ...report.rows[0], scores: scores.rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 3. POST: Buat laporan bulanan (header + detail nilai)
router.post("/report", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      periodeid,
      classid,
      subjectid,
      studentid,
      teacherid,
      type_report = "bulanan",
      month,
      performance,
      discipline,
      activeness,
      confidence,
      teacher_note,
      note,
      scores = [],
    } = req.body;
    await client.query("BEGIN");
    // Cek duplikasi
    const exist = await client.query(
      `SELECT id FROM l_reports WHERE periodeid=$1 AND classid=$2 AND subjectid=$3 AND studentid=$4 AND teacherid=$5 AND month=$6`,
      [periodeid, classid, subjectid, studentid, teacherid, month]
    );
    if (exist.rowCount > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Laporan sudah ada untuk siswa ini di bulan ini" });
    }
    // Insert l_reports
    const reportRes = await client.query(
      `INSERT INTO l_reports (periodeid, classid, subjectid, studentid, teacherid, type_report, month, performance, discipline, activeness, confidence, teacher_note, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [
        periodeid,
        classid,
        subjectid,
        studentid,
        teacherid,
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
    const reportid = reportRes.rows[0].id;
    // Insert l_scores
    for (const s of scores) {
      await client.query(
        `INSERT INTO l_scores (reportid, contentid, taks_score, writing_score, speaking_score, lab_score, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          reportid,
          s.contentid,
          s.taks_score,
          s.writing_score,
          s.speaking_score,
          s.lab_score,
          s.note,
        ]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ message: "Laporan berhasil disimpan", reportid });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 4. PUT: Update laporan bulanan (header + detail nilai)
router.put("/report/:id", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      performance,
      discipline,
      activeness,
      confidence,
      teacher_note,
      note,
      scores = [],
    } = req.body;
    await client.query("BEGIN");
    // Update l_reports
    await client.query(
      `UPDATE l_reports SET performance=$1, discipline=$2, activeness=$3, confidence=$4, teacher_note=$5, note=$6 WHERE id=$7`,
      [performance, discipline, activeness, confidence, teacher_note, note, id]
    );
    // Hapus l_scores lama
    await client.query(`DELETE FROM l_scores WHERE reportid = $1`, [id]);
    // Insert l_scores baru
    for (const s of scores) {
      await client.query(
        `INSERT INTO l_scores (reportid, contentid, taks_score, writing_score, speaking_score, lab_score, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          id,
          s.contentid,
          s.taks_score,
          s.writing_score,
          s.speaking_score,
          s.lab_score,
          s.note,
        ]
      );
    }
    await client.query("COMMIT");
    res.status(200).json({ message: "Laporan berhasil diupdate" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 5. DELETE: Hapus laporan bulanan
router.delete(
  "/report/:id",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      await client.query("BEGIN");
      await client.query(`DELETE FROM l_reports WHERE id = $1`, [id]);
      await client.query("COMMIT");
      res.status(200).json({ message: "Laporan berhasil dihapus" });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 6. GET: Rekap absensi bulanan per siswa
router.get("/attendance", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentid, classid, subjectid, periodeid, month } = req.query;
    let query = `SELECT studentid, 
      SUM(CASE WHEN note ILIKE '%sakit%' THEN 1 ELSE 0 END) AS sakit,
      SUM(CASE WHEN note ILIKE '%izin%' THEN 1 ELSE 0 END) AS izin,
      SUM(CASE WHEN note ILIKE '%alpa%' THEN 1 ELSE 0 END) AS alpa
      FROM l_attendance WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (studentid) {
      query += ` AND studentid = $${idx++}`;
      params.push(studentid);
    }
    if (classid) {
      query += ` AND classid = $${idx++}`;
      params.push(classid);
    }
    if (subjectid) {
      query += ` AND subjectid = $${idx++}`;
      params.push(subjectid);
    }
    if (periodeid) {
      query += ` AND periode = $${idx++}`;
      params.push(periodeid);
    }
    if (month) {
      query += ` AND EXTRACT(MONTH FROM day_date) = $${idx++}`;
      params.push(month);
    }
    query += ` GROUP BY studentid`;
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 7. GET: Daftar content di kelas tertentu
router.get("/contents", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { subjectid, classid } = req.query;
    if (!subjectid || !classid)
      return res
        .status(400)
        .json({ message: "subjectid dan classid wajib diisi" });
    const query = `SELECT l_content.* FROM l_content
      JOIN l_chapter ON l_content.chapter = l_chapter.id
      JOIN l_cclass ON l_cclass.chapter = l_chapter.id
      WHERE l_chapter.subject = $1 AND l_cclass.classid = $2`;
    const result = await client.query(query, [subjectid, classid]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 8. GET: Daftar siswa di kelas tertentu
router.get("/students", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, periodeid } = req.query;
    if (!classid)
      return res.status(400).json({ message: "classid wajib diisi" });
    let query = `SELECT u.id, u.name, u.nis FROM cl_students c
      JOIN u_students u ON c.student = u.id
      WHERE c.classid = $1`;
    const params = [classid];
    if (periodeid) {
      query += ` AND c.periode = $2`;
      params.push(periodeid);
    }
    query += ` ORDER BY u.name ASC`;
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
