import { Router } from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();

router.post("/add-presensi", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  const { classid, subjectid, studentid, note } = req.body;

  try {
    await client.query("BEGIN");

    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    const check = await client.query(
      "SELECT * FROM l_attendance WHERE classid = $1 AND subjectid = $2 AND studentid = $3",
      [classid, subjectid, studentid]
    );

    if (check.rows.length > 0) {
      await client.query(
        "UPDATE l_attendance SET note = $1 WHERE classid = $2 AND subjectid = $3 AND studentid = $4",
        [note, classid, subjectid, studentid]
      );
    } else {
      await client.query(
        "INSERT INTO l_attendance (periode, classid, subjectid, studentid, note) VALUES ($1, $2, $3, $4, $5)",
        [activePeriode, classid, subjectid, studentid, note]
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
  const { classid, subjectid } = req.query;

  try {
    await client.query("BEGIN");

    const query = `
    SELECT * FROM l_attendance WHERE classid = $1 AND subjectid = $2
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
});

export default router;
