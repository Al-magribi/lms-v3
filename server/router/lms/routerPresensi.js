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

// Bulk attendance operation
router.post("/bulk-presensi", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  const { classid, subjectid, studentids, note, date } = req.body;

  try {
    await client.query("BEGIN");

    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;
    const attendanceDate = date || new Date().toISOString().split("T")[0];

    for (const studentid of studentids) {
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
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: `Presensi ${note} berhasil disimpan untuk ${studentids.length} siswa`,
    });
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Delete individual student attendance
router.delete("/delete-presensi", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  const { classid, subjectid, studentid, date } = req.query;

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM l_attendance WHERE classid = $1 
      AND subjectid = $2 AND studentid = $3 AND day_date = $4`,
      [classid, subjectid, studentid, date]
    );

    await client.query("COMMIT");

    if (result.rowCount > 0) {
      return res.status(200).json({ message: "Presensi berhasil dihapus" });
    } else {
      return res.status(404).json({ message: "Data presensi tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Bulk delete attendance records
router.delete(
  "/bulk-delete-presensi",
  authorize("teacher"),
  async (req, res) => {
    const client = await pool.connect();
    const { classid, subjectid, studentids, date } = req.body;

    try {
      await client.query("BEGIN");

      let deletedCount = 0;
      for (const studentid of studentids) {
        const result = await client.query(
          `DELETE FROM l_attendance WHERE classid = $1 
        AND subjectid = $2 AND studentid = $3 AND day_date = $4`,
          [classid, subjectid, studentid, date]
        );
        deletedCount += result.rowCount;
      }

      await client.query("COMMIT");

      return res.status(200).json({
        message: `Berhasil menghapus presensi untuk ${deletedCount} siswa`,
      });
    } catch (error) {
      console.log(error);
      await client.query("ROLLBACK");
      return res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

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

    const periode = await client.query(
      `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [req.user.homebase]
    );

    const activePeriode = periode.rows[0].id;

    try {
      await client.query("BEGIN");

      const query = `
    SELECT 
      us.id as studentid,
      us.name as student_name,
      us.nis,
      cs.classid,
      c.name,
      COUNT(CASE WHEN la.note = 'Hadir' THEN 1 END) as hadir,
      COUNT(CASE WHEN la.note = 'Telat' THEN 1 END) as telat,
      COUNT(CASE WHEN la.note = 'Sakit' THEN 1 END) as sakit,
      COUNT(CASE WHEN la.note = 'Izin' THEN 1 END) as izin,
      COUNT(CASE WHEN la.note = 'Alpa' THEN 1 END) as alpa,
      COUNT(la.id) as total
    FROM cl_students cs
    JOIN u_students us ON cs.student = us.id
    JOIN a_class c ON cs.classid = c.id
    LEFT JOIN l_attendance la ON us.id = la.studentid 
      AND la.classid = cs.classid 
      AND la.subjectid = $2
      AND EXTRACT(MONTH FROM la.day_date) = $3
      AND EXTRACT(YEAR FROM la.day_date) = $4
      AND la.periode = $5
    WHERE cs.classid = $1 AND cs.periode = $6
    GROUP BY cs.classid, c.name, us.id, us.name, us.nis
    ORDER BY cs.classid, us.name
    `;

      const result = await client.query(query, [
        classid,
        subjectid,
        month,
        year,
        activePeriode,
        activePeriode,
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

router.get(
  "/get-presensi-matrix",
  authorize("teacher", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    const { classid, subjectid, month } = req.query;
    const userHomebase = req.user.homebase;

    if (!classid || !subjectid || !userHomebase) {
      return res.status(400).json({
        message: "Class ID, Subject ID, and User Homebase are required.",
      });
    }

    try {
      // 1. Dapatkan periode aktif (No change here)
      const periodeRes = await client.query(
        "SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true LIMIT 1",
        [userHomebase]
      );

      if (periodeRes.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Periode aktif tidak ditemukan." });
      }
      const activePeriodeId = periodeRes.rows[0].id;

      // 2. Bangun filter tanggal (No change here)
      const dateFilterParams = [classid, subjectid, activePeriodeId];
      let dateFilterClause = "";
      if (month) {
        if (!/^\d{4}-\d{2}$/.test(month)) {
          return res
            .status(400)
            .json({ message: "Format bulan tidak valid. Gunakan YYYY-MM." });
        }
        dateFilterClause = `AND TO_CHAR(day_date, 'YYYY-MM') = $4`;
        dateFilterParams.push(month);
      }

      // 3. Dapatkan tanggal unik untuk kolom (No change here)
      const dateQuery = `
        SELECT DISTINCT TO_CHAR(day_date, 'YYYY-MM-DD') AS date 
        FROM l_attendance 
        WHERE classid = $1 AND subjectid = $2 AND periode = $3 ${dateFilterClause}
        ORDER BY date ASC
      `;
      const dateRes = await client.query(dateQuery, dateFilterParams);
      const dates = dateRes.rows.map((row) => row.date);

      // Handle jika tidak ada data (No major change here)
      if (dates.length === 0) {
        const studentQuery = `
          SELECT s.id as studentid, s.nis, s.name as student_name
          FROM u_students s
          JOIN cl_students cs ON s.id = cs.student
          WHERE cs.classid = $1 AND cs.periode = $2
          ORDER BY s.name;
        `;
        const studentsRes = await client.query(studentQuery, [
          classid,
          activePeriodeId,
        ]);
        const studentsWithPercentage = studentsRes.rows.map((s) => ({
          ...s,
          presentase: 0,
        }));
        return res
          .status(200)
          .json({ students: studentsWithPercentage, dates: [] });
      }

      // ===================================================================
      // **PERUBAHAN UTAMA DI SINI: MENGGUNAKAN CONDITIONAL AGGREGATION**
      // ===================================================================

      // 4. Bangun kolom SELECT dinamis untuk setiap tanggal
      const selectDateColumns = dates
        .map(
          (date) =>
            `MAX(CASE WHEN TO_CHAR(la.day_date, 'YYYY-MM-DD') = '${date}' THEN la.note END) AS "${date}"`
        )
        .join(",\n");

      // 5. Bangun kalkulasi persentase langsung di dalam query
      const totalDays = dates.length;
      const percentageCalculation = `
        ROUND(
          (
            SUM(CASE WHEN la.note ILIKE 'Hadir' THEN 1 ELSE 0 END)::NUMERIC 
            / ${totalDays} * 100
          ), 0
        ) AS presentase
      `;

      // 6. Query final menggunakan LEFT JOIN dan GROUP BY
      const matrixQuery = `
        SELECT
          s.id AS studentid,
          s.nis,
          s.name AS student_name,
          ${selectDateColumns},
          ${percentageCalculation}
        FROM u_students s
        JOIN cl_students cs ON s.id = cs.student
        LEFT JOIN l_attendance la ON s.id = la.studentid
          AND la.classid = cs.classid
          AND la.subjectid = $3 -- Bind subjectid here
          AND la.periode = cs.periode
          ${month ? `AND TO_CHAR(la.day_date, 'YYYY-MM') = $4` : ""}
        WHERE cs.classid = $1 AND cs.periode = $2
        GROUP BY s.id, s.nis, s.name
        ORDER BY s.name;
      `;

      const queryParams = [classid, activePeriodeId, subjectid];
      if (month) {
        queryParams.push(month);
      }

      const result = await client.query(matrixQuery, queryParams);

      res.status(200).json({
        students: result.rows,
        dates: dates,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server: " + error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
