import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import bcrypt from "bcrypt";
import xlsx from "xlsx";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = express.Router();

router.post("/add-student", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, entry, nis, name, gender, classid } = req.body;
    const homebase = req.user.homebase;
    const password = "12345678";
    const hashedPassword = await bcrypt.hash(password, 10);

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    await client.query("BEGIN");

    const checkData = await client.query(
      `SELECT * FROM u_students
			WHERE homebase = $1 AND nis = $2`,
      [homebase, nis]
    );

    if (checkData.rowCount > 0 && !id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "NIS sudah terdaftar" });
    }

    if (id) {
      await client.query(
        `UPDATE u_students
				SET name = $1, nis = $2, gender = $3 WHERE id = $4`,
        [name, nis, gender, id]
      );

      await client.query(
        `UPDATE cl_students SET classid = $1 WHERE student = $2`,
        [classid, id]
      );
    } else {
      const student = await client.query(
        `INSERT INTO u_students(entry, nis, name, password, homebase, gender, periode)
				VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name`,
        [entry, nis, name, hashedPassword, homebase, gender, activePeriode]
      );

      await client.query(
        `INSERT INTO cl_students(periode, classid, student, student_name, homebase)
            VALUES($1, $2, $3, $4, $5)`,
        [
          activePeriode,
          classid,
          student.rows[0].id,
          student.rows[0].name,
          homebase,
        ]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ message: id ? update : create });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-students", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT * FROM a_periode 
      WHERE isactive = true AND homebase = $1`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    const [count, data] = await Promise.all([
      client.query(
        `SELECT COUNT(*) FROM u_students
        INNER JOIN cl_students ON u_students.id = cl_students.student
				WHERE u_students.homebase = $1 
        AND (u_students.name ILIKE $2 OR u_students.nis ILIKE $2)
        AND cl_students.periode = $3
        AND u_students.isactive = true`,
        [homebase, `%${search}%`, activePeriode]
      ),

      client.query(
        `SELECT u_students.*,
				entry_periode.id AS entry_id,
        entry_periode.name AS entry,
				periode_periode.id AS periode_id,
        periode_periode.name AS periode_name,
        cl_students.classid AS classid,
        a_class.name AS classname,
				a_homebase.name AS homebase
				FROM u_students
				INNER JOIN cl_students ON u_students.id = cl_students.student
				LEFT JOIN a_periode AS entry_periode ON u_students.entry = entry_periode.id
				LEFT JOIN a_periode AS periode_periode ON cl_students.periode = periode_periode.id
				LEFT JOIN a_homebase ON u_students.homebase = a_homebase.id
				LEFT JOIN a_class ON cl_students.classid = a_class.id
				WHERE u_students.homebase = $1
				AND (u_students.name ILIKE $2 OR u_students.nis ILIKE $2) 
				AND cl_students.periode = $3
        AND u_students.isactive = true
				ORDER BY entry_periode.name DESC, u_students.name ASC
				LIMIT $4 OFFSET $5`,
        [homebase, `%${search}%`, activePeriode, limit, offset]
      ),
    ]);

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);
    const students = data.rows;

    res.status(200).json({ totalData, totalPages, students });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-student", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query("BEGIN");
    await client.query(`DELETE FROM u_students WHERE id = $1`, [id]);
    await client.query("COMMIT");

    res.status(200).json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.put(
  "/change-status",
  authorize("admin", "center", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.query;

      const student = await client.query(
        `SELECT * FROM u_students WHERE id = $1`,
        [id]
      );

      const isactive = student.rows[0].isactive;

      await client.query(
        `UPDATE u_students SET isactive = $1 
      WHERE id = $2`,
        [!isactive, id]
      );

      res.status(200).json({ message: "Berhasil mengubah status" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put(
  "/change-periode",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { userid, periodeid } = req.body;

      await client.query("BEGIN");

      const user = await client.query(
        `SELECT * FROM u_students WHERE id = $1`,
        [userid]
      );

      if (user.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Siswa tidak ditemukan" });
      }

      await client.query(`UPDATE u_students SET periode = $1 WHERE id = $2`, [
        periodeid,
        userid,
      ]);

      await client.query(
        `UPDATE cl_students SET periode = $1 WHERE student = $2`,
        [periodeid, userid]
      );

      await client.query("COMMIT");

      res.status(200).json({ message: "Berhasil mengubah tahun ajaran" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put("/graduated", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid } = req.query;

    await client.query("BEGIN");

    await client.query(
      `UPDATE u_students SET isactive = false 
       WHERE id IN (
         SELECT student FROM cl_students 
         WHERE classid = $1
       )`,
      [classid]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Berhasil meluluskan semua siswa" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// New endpoint to fix period mismatch between u_students and cl_students
router.put("/fix-periods", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update u_students.periode to match cl_students.periode for all students
    const updateResult = await client.query(
      `UPDATE u_students 
       SET periode = cl_students.periode 
       FROM cl_students 
       WHERE u_students.id = cl_students.student 
       AND u_students.periode != cl_students.periode`
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: `Berhasil memperbaiki periode untuk ${updateResult.rowCount} siswa`,
      updatedCount: updateResult.rowCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Modified download-students endpoint to use cl_students.periode for filtering
router.get("/download-students", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const homebase = req.user.homebase;
    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    // Get students data with required fields
    const studentsData = await client.query(
      `SELECT 
        entry_periode.name AS tahun_masuk,
        periode_periode.name AS periode,
        u_students.nis,
        u_students.name,
        a_grade.name AS tingkat,
        a_class.name AS kelas,
        CASE 
          WHEN u_students.isactive = true THEN 'Aktif'
          ELSE 'Nonaktif'
        END AS status
      FROM u_students
      INNER JOIN cl_students ON u_students.id = cl_students.student
      LEFT JOIN a_periode AS entry_periode ON u_students.entry = entry_periode.id
      LEFT JOIN a_periode AS periode_periode ON cl_students.periode = periode_periode.id
      LEFT JOIN a_class ON cl_students.classid = a_class.id
      LEFT JOIN a_grade ON a_class.grade = a_grade.id
      WHERE u_students.homebase = $1
      AND cl_students.periode = $2
      AND u_students.isactive = true
      ORDER BY entry_periode.name DESC, a_class.name ASC, u_students.name ASC`,
      [homebase, activePeriode]
    );

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(studentsData.rows);

    // Set column headers
    const headers = [
      "Tahun Masuk",
      "Periode",
      "NIS",
      "Nama",
      "Tingkat",
      "Kelas",
      "Status",
    ];

    // Set headers in the first row
    xlsx.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    // Auto-size columns
    const columnWidths = [
      { wch: 15 }, // Tahun Masuk
      { wch: 15 }, // Periode
      { wch: 12 }, // NIS
      { wch: 30 }, // Nama
      { wch: 10 }, // Tingkat
      { wch: 15 }, // Kelas
      { wch: 10 }, // Status
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=data-siswa.xlsx"
    );
    res.setHeader("Content-Length", buffer.length);

    // Send the file
    res.send(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});
export default router;
