import { Router } from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();

router.post("/add-presensi", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  const { classid, subjectid, studentid, note, date } = req.body;

  try {
    await client.query("BEGIN");

    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;
    const attendanceDate = date || new Date().toISOString().split("T")[0]; // Use provided date or today

    const check = await client.query(
      `SELECT * FROM l_attendance WHERE classid = $1 
      AND subjectid = $2 AND studentid = $3 AND day_date = $4`,
      [classid, subjectid, studentid, attendanceDate]
    );

    if (check.rows.length > 0) {
      await client.query(
        `UPDATE l_attendance SET note = $1 WHERE classid = $2 
        AND subjectid = $3 AND studentid = $4 AND day_date = $5`,
        [note, classid, subjectid, studentid, attendanceDate]
      );
    } else {
      await client.query(
        `INSERT INTO l_attendance (periode, classid, subjectid, studentid, note, day_date) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [activePeriode, classid, subjectid, studentid, note, attendanceDate]
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({ message: "Presensi berhasil disimpan" });
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-presensi", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  const { classid, subjectid, date } = req.query;

  try {
    await client.query("BEGIN");

    let query = `
    SELECT la.id, la.periode, la.classid, la.subjectid, la.studentid, la.note, 
           la.day_date as date, la.createdat, us.name as student_name, us.nis 
    FROM l_attendance la
    JOIN u_students us ON la.studentid = us.id
    WHERE la.classid = $1 AND la.subjectid = $2
    `;

    let params = [classid, subjectid];

    if (date) {
      query += ` AND la.day_date = $3`;
      params.push(date);
    }

    query += ` ORDER BY la.day_date DESC, us.name`;

    const result = await client.query(query, params);

    await client.query("COMMIT");
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Get attendance summary by month
router.get(
  "/get-presensi-summary",
  authorize("teacher", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    const { classid, subjectid, month, year } = req.query;

    try {
      await client.query("BEGIN");

      const query = `
    SELECT 
      us.id as studentid,
      us.name as student_name,
      us.nis,
      COUNT(CASE WHEN la.note = 'Hadir' THEN 1 END) as hadir,
      COUNT(CASE WHEN la.note = 'Sakit' THEN 1 END) as sakit,
      COUNT(CASE WHEN la.note = 'Izin' THEN 1 END) as izin,
      COUNT(CASE WHEN la.note = 'Alpa' THEN 1 END) as alpa,
      COUNT(la.id) as total
    FROM u_students us
    LEFT JOIN l_attendance la ON us.id = la.studentid 
      AND la.classid = $1 
      AND la.subjectid = $2
      AND EXTRACT(MONTH FROM la.day_date) = $3
      AND EXTRACT(YEAR FROM la.day_date) = $4
    WHERE us.id IN (
      SELECT student FROM cl_students WHERE classid = $1
    )
    GROUP BY us.id, us.name, us.nis
    ORDER BY us.name
    `;

      const result = await client.query(query, [
        classid,
        subjectid,
        month,
        year,
      ]);

      await client.query("COMMIT");
      return res.status(200).json(result.rows);
    } catch (error) {
      console.log(error);
      await client.query("ROLLBACK");
      return res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Get available dates for attendance
router.get(
  "/get-attendance-dates",
  authorize("teacher", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    const { classid, subjectid } = req.query;

    try {
      await client.query("BEGIN");

      const query = `
    SELECT DISTINCT day_date as date 
    FROM l_attendance 
    WHERE classid = $1 AND subjectid = $2
    ORDER BY day_date DESC
    `;

      const result = await client.query(query, [classid, subjectid]);

      await client.query("COMMIT");
      return res.status(200).json(result.rows);
    } catch (error) {
      console.log(error);
      await client.query("ROLLBACK");
      return res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
