import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = express.Router();

// =================================
// Endpoint Target
// =================================

router.get("/get-grades", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const homebase = req.user.homebase;

    if (homebase) {
      const { rows } = await client.query(
        "SELECT * FROM a_grade WHERE homebase = $1",
        [homebase]
      );

      res.status(200).json(rows);
    } else {
      const { rows } = await client.query("SELECT * FROM a_grade");
      res.status(200).json(rows);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/add-target", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, gradeId, juzId } = req.body;

    if (id) {
      await client.query(
        "UPDATE t_target SET grade_id = $1, juz_id = $2 WHERE id = $3",
        [gradeId, juzId, id]
      );
    } else {
      await client.query(
        "INSERT INTO t_target (grade_id, juz_id) VALUES ($1, $2) RETURNING *",
        [gradeId, juzId]
      );
    }

    res.status(200).json({ message: id ? update : create });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-targets", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    // Fetch all target data sorted by grade and juz name
    const targetData = await client.query(
      `SELECT t_target.*, t_juz.name AS juz_name, a_grade.name AS grade_name
      FROM t_target 
      LEFT JOIN t_juz ON t_juz.id = t_target.juz_id
      LEFT JOIN a_grade ON a_grade.id = t_target.grade_id
      ORDER BY a_grade.name::INTEGER ASC, t_juz.name DESC`
    );

    // Fetch total ayat and total lines for each juz
    const responseData = await Promise.all(
      targetData.rows.map(async (target) => {
        const ayatData = await client.query(
          `SELECT 
          COALESCE(SUM(to_ayat), 0) AS total_ayat,
          COALESCE(SUM(lines), 0) AS total_line
        FROM t_juzitems
        WHERE juz_id = $1`,
          [target.juz_id]
        );

        return {
          grade: target.grade_name,
          juz: target.juz_name,
          total_ayat: parseInt(ayatData.rows[0].total_ayat, 10),
          total_line: parseInt(ayatData.rows[0].total_line, 10),
        };
      })
    );

    // Group data by grade and calculate total_ayat & total_line per grade
    const groupedData = responseData.reduce((acc, target) => {
      let gradeEntry = acc.find((entry) => entry.grade === target.grade);
      if (!gradeEntry) {
        gradeEntry = {
          grade: target.grade,
          target: [],
          total_ayat: 0,
          total_line: 0,
        };
        acc.push(gradeEntry);
      }

      // Add juz data
      gradeEntry.target.push({
        juz: target.juz,
        total_ayat: target.total_ayat,
        total_line: target.total_line,
      });

      // Sum total ayat and total line for the grade
      gradeEntry.total_ayat += target.total_ayat;
      gradeEntry.total_line += target.total_line;

      return acc;
    }, []);

    res.status(200).json(groupedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-target", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    // Check if target exists
    const targetExists = await client.query(
      "SELECT * FROM t_target WHERE id = $1",
      [id]
    );

    if (targetExists.rows.length === 0) {
      return res.status(404).json({ message: "Target tidak ditemukan" });
    }

    // Delete the target
    await client.query("DELETE FROM t_target WHERE id = $1", [id]);

    res.status(200).json({ message: remove });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
