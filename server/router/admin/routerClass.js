import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Get kelas dengan paginasi dan pencarian
router.get("/get-class", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    if (!page && !limit) {
      const data = await client.query(
        `SELECT * FROM a_class WHERE homebase = $1
				 ORDER BY name ASC`,
        [homebase]
      );

      return res.status(200).json(data.rows);
    }

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );
    const activePeriode = periode.rows[0].id;

    const [classes, count] = await Promise.all([
      client.query({
        text: `
					SELECT a_class.*, a_grade.name AS grade_name, a_major.name AS major_name,
					COUNT(DISTINCT CASE WHEN u_students.isactive = true AND cl_students.periode = $5 THEN cl_students.id END) AS students
					FROM a_class
					LEFT JOIN a_grade ON a_class.grade = a_grade.id 
					LEFT JOIN a_major ON a_class.major = a_major.id
					LEFT JOIN cl_students ON a_class.id = cl_students.classid
					LEFT JOIN u_students ON cl_students.student = u_students.id
					WHERE a_class.name ILIKE $1 AND a_class.homebase = $2
					GROUP BY a_class.id, a_grade.name, a_major.name
					ORDER BY a_grade.name::int ASC, regexp_replace(a_class.name, '^\\d+\\s*', '', 'g') ASC
					LIMIT $3 OFFSET $4
				`,
        values: [`%${search}%`, homebase, limit, offset, activePeriode],
      }),
      client.query({
        text: `
					SELECT COUNT(*) FROM a_class 
					WHERE name ILIKE $1 AND homebase = $2
				`,
        values: [`%${search}%`, homebase],
      }),
    ]);

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    res.json({
      classes: classes.rows,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.error("Error getting classes:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Tambah atau update kelas
router.post("/add-class", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name, gradeId, majorId } = req.body;
    const homebase = req.user.homebase;

    if (!name || !gradeId) {
      return res.status(400).json({ message: "Lengkapi semua data" });
    }

    await client.query("BEGIN");

    if (id) {
      const existingClass = await client.query(
        `SELECT * FROM a_class 
				WHERE id = $1 AND homebase = $2`,
        [id, homebase]
      );

      if (existingClass.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Kelas tidak ditemukan" });
      }

      const duplicate = await client.query(
        `SELECT * FROM a_class 
				WHERE name = $1 AND homebase = $2 AND id != $3`,
        [name, homebase, id]
      );

      if (duplicate.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Kelas sudah tersedia" });
      }

      await client.query(
        `UPDATE a_class 
				SET name = $1, grade = $2, major = $3
				WHERE id = $4 AND homebase = $5`,
        [name, gradeId, majorId, id, homebase]
      );

      await client.query("COMMIT");
      res.json({ message: "Kelas berhasil diperbarui" });
    } else {
      const existingClass = await client.query(
        `SELECT * FROM a_class 
				WHERE name = $1 AND homebase = $2`,
        [name, homebase]
      );

      if (existingClass.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Kelas sudah tersedia" });
      }

      await client.query(
        `INSERT INTO a_class (name, grade, major, homebase)
				VALUES ($1, $2, $3, $4)`,
        [name, gradeId, majorId || null, homebase]
      );

      await client.query("COMMIT");
      res.status(201).json({ message: "Kelas berhasil ditambahkan" });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error managing class:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Hapus kelas
router.delete("/delete-class", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    if (!id) {
      return res.status(400).json({ message: "ID kelas diperlukan" });
    }

    await client.query("BEGIN");

    const existingClass = await client.query(
      "SELECT * FROM a_class WHERE id = $1 AND homebase = $2",
      [id, homebase]
    );

    if (existingClass.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    await client.query("DELETE FROM a_class WHERE id = $1 AND homebase = $2", [
      id,
      homebase,
    ]);

    await client.query("COMMIT");
    res.json({ message: "Kelas berhasil dihapus" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting class:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menambah siswa Ke kelas
router.post("/add-student", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { nis, classid } = req.body;
    const homebase = req.user.homebase;

    await client.query("BEGIN");

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );
    const periodeid = periode.rows[0].id;

    const checkData = await client.query(
      `SELECT * FROM u_students WHERE nis = $1 AND homebase = $2`,
      [nis, homebase]
    );

    if (checkData.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "NIS tidak ditemukan" });
    }

    const studentid = checkData.rows[0].id;

    const checkStudent = await client.query(
      `SELECT * FROM cl_students
			WHERE student = $1 AND homebase = $2`,
      [studentid, homebase]
    );

    if (checkStudent.rowCount > 0) {
      const checkClass = await client.query(
        `SELECT * FROM a_class WHERE id = $1 AND homebase = $2`,
        [checkStudent.rows[0].classid, homebase]
      );
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: `Sista sudah terdaftar dikelas ${checkClass.rows[0].name}`,
      });
    }

    await client.query(
      `INSERT INTO cl_students(periode, classid, student, student_name, homebase)
			VALUES($1, $2, $3, $4, $5)`,
      [periodeid, classid, studentid, checkData.rows[0].name, homebase]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Berhasil disimpan" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Upload siswa ke kelas
router.post("/upload-students", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const students = req.body;
    const homebase = req.user.homebase;
    const password = "12345678";
    const hash = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );
    const periodeid = periode.rows[0].id;

    // Prepare result containers
    const duplicatedNIS = [];
    const alreadyRegistered = [];
    const uploaded = [];
    const invalidData = [];

    // 1. Cek duplikat NIS di body
    const nisSet = new Set();
    for (const student of students) {
      const nis = student[1];
      if (nisSet.has(nis)) {
        invalidData.push({
          nis,
          name: student[2],
          reason: "NIS duplikat dalam upload",
        });
      }
      nisSet.add(nis);
    }

    // 2. Proses setiap student
    for (const student of students) {
      // student: [entry, nis, name, gender, classid]
      const entry = student[0];
      const nis = student[1];
      const name = student[2];
      const gender = student[3];
      const classid = student[4];

      // Skip jika NIS duplikat di body
      if (
        invalidData.find(
          (s) => s.nis === nis && s.reason === "NIS duplikat dalam upload"
        )
      ) {
        continue;
      }

      // Basic validation
      if (!nis || !name || !gender || !classid) {
        invalidData.push({ nis, name, reason: "Data tidak lengkap" });
        continue;
      }

      // Cek duplikasi di u_students
      const check = await client.query(
        `SELECT id FROM u_students WHERE nis = $1 AND homebase = $2`,
        [nis, homebase]
      );
      let studentId;
      if (check.rowCount > 0) {
        studentId = check.rows[0].id;
        duplicatedNIS.push({ nis, name });
      } else {
        // Insert ke u_students
        const insert = await client.query(
          `INSERT INTO u_students(homebase, entry, nis, name, gender, password, periode)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [homebase, entry, nis, name, gender, hash, periodeid]
        );
        studentId = insert.rows[0].id;
      }

      // 3. Cek apakah sudah terdaftar di cl_students untuk periode & classid yang sama
      const checkStudent = await client.query(
        `SELECT id FROM cl_students WHERE student = $1 AND periode = $2 AND classid = $3 AND homebase = $4`,
        [studentId, periodeid, classid, homebase]
      );
      if (checkStudent.rowCount > 0) {
        // Sudah terdaftar di kelas & periode ini
        alreadyRegistered.push({
          nis,
          name,
          classid,
        });
        continue;
      }

      // 4. Insert ke cl_students pakai classid dari array
      await client.query(
        `INSERT INTO cl_students(periode, classid, student, student_name, homebase)
          VALUES($1, $2, $3, $4, $5)`,
        [periodeid, classid, studentId, name, homebase]
      );
      uploaded.push({ nis, name });
    }

    await client.query("COMMIT");

    // Tentukan status response
    let status = 200;
    let message = "Students uploaded successfully";
    if (
      invalidData.length > 0 ||
      duplicatedNIS.length > 0 ||
      alreadyRegistered.length > 0
    ) {
      status = 207; // Multi-Status
      message = "Sebagian siswa berhasil diupload. Lihat detail.";
    }

    console.log(`Uploaded: ${uploaded}`);
    console.log(`Duplicated NIS: ${duplicatedNIS}`);
    console.log(`Already Registered: ${alreadyRegistered}`);
    console.log(`Invalid Data: ${invalidData}`);

    return res.status(status).json({
      message,
      uploaded,
      duplicatedNIS,
      alreadyRegistered,
      invalidData,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Mangambil data siswa dalam kelas
router.get("/get-students", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search, classid } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );
    const periodeid = periode.rows[0].id;

    const [count, data] = await Promise.all([
      client.query(
        `SELECT COUNT(*) FROM cl_students
				WHERE classid = $1 AND student_name ILIKE $2 AND homebase = $3`,
        [classid, `%${search}%`, homebase]
      ),
      client.query(
        `SELECT cl_students.*, a_class.name AS class_name,
				u_students.nis, u_students.isactive, 
				a_grade.name AS grade_name, a_major.name AS major_name
				FROM cl_students
				LEFT JOIN u_students ON cl_students.student = u_students.id
				LEFT JOIN a_class ON cl_students.classid = a_class.id
				LEFT JOIN a_grade ON a_class.grade = a_grade.id
				LEFT JOIN a_major ON a_class.major = a_major.id
				WHERE cl_students.classid = $1
				AND cl_students.periode = $2
				AND cl_students.student_name ILIKE $3
				AND cl_students.homebase = $4
				ORDER BY u_students.name ASC
				LIMIT $5 OFFSET $6`,
        [classid, periodeid, `%${search}%`, homebase, limit, offset]
      ),
    ]);

    const totalData = parseInt(count.rows[0].count, 10);
    const totalPages = Math.ceil(totalData / parseInt(limit));
    const students = data.rows;

    res.status(200).json({ totalData, totalPages, students });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menghapus siswa dari kelas
router.delete("/delete-student", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    await client.query("BEGIN");
    await client.query(
      `DELETE FROM cl_students WHERE id = $1 AND homebase = $2`,
      [id, homebase]
    );
    await client.query("COMMIT");

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
