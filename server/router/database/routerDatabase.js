import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = express.Router();

// ============================
// Tambah Data Siswa
// ============================

router.get(
  "/get-periode",
  authorize("admin", "teacher", "student", "parent"),
  async (req, res) => {
    const { homebase } = req.user;

    try {
      const result = await pool.query(
        `SELECT * FROM a_periode WHERE homebase = $1 ORDER BY name ASC`,
        [homebase]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/get-homebase",
  authorize("admin", "teacher", "student", "parent"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM a_homebase ORDER BY name ASC`
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/add-student-data",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const {
      userid,
      homebaseid,
      homebase_name,
      entryid,
      entry_name,
      nis,
      nisn,
      name,
      gender,
      birth_place,
      birth_date,
      height,
      weight,
      head,
      order_number,
      siblings,
      provinceid,
      province_name,
      cityid,
      city_name,
      districtid,
      district_name,
      villageid,
      village_name,
      postal_code,
      address,
    } = req.body;

    try {
      // Pengecekan apakah NIS sudah ada di db_student
      const studentCheck = await pool.query(
        `SELECT * FROM db_student WHERE userid = $1`,
        [userid]
      );

      if (studentCheck.rows.length > 0) {
        // Jika NIS ditemukan, update kolom yang sesuai dengan data dari req.body
        await pool.query(
          `UPDATE db_student SET
                    homebaseid = COALESCE($1, homebaseid),
                    homebase_name = COALESCE($2, homebase_name),
                    entryid = COALESCE($3, entryid),
                    entry_name = COALESCE($4, entry_name),
                    nis = COALESCE($5, nis),
                    nisn = COALESCE($6, nisn),
                    name = COALESCE($7, name),
                    gender = COALESCE($8, gender),
                    birth_place = COALESCE($9, birth_place),
                    birth_date = COALESCE($10, birth_date),
                    height = COALESCE($11, height),
                    weight = COALESCE($12, weight),
                    head = COALESCE($13, head),
                    order_number = COALESCE($14, order_number),
                    siblings = COALESCE($15, siblings),
                    provinceid = COALESCE($16, provinceid),
                    province_name = COALESCE($17, province_name),
                    cityid = COALESCE($18, cityid),
                    city_name = COALESCE($19, city_name),
                    districtid = COALESCE($20, districtid),
                    district_name = COALESCE($21, district_name),
                    villageid = COALESCE($22, villageid),
                    village_name = COALESCE($23, village_name),
                    postal_code = COALESCE($24, postal_code),
                    address = COALESCE($25, address)
                WHERE userid = $26
                RETURNING *`,
          [
            homebaseid,
            homebase_name,
            entryid,
            entry_name,
            nis,
            nisn,
            name,
            gender,
            birth_place,
            birth_date,
            height,
            weight,
            head,
            order_number,
            siblings,
            provinceid,
            province_name,
            cityid,
            city_name,
            districtid,
            district_name,
            villageid,
            village_name,
            postal_code,
            address,
            userid,
          ]
        );

        await pool.query(`UPDATE u_students SET homebase = $1 WHERE id = $2`, [
          homebaseid,
          userid,
        ]);

        return res.status(200).json({ message: "Berhasil diperbarui" });
      } else {
        // Jika NIS tidak ditemukan, tambahkan data baru ke db_student
        await pool.query(
          `INSERT INTO db_student (
                   userid, homebaseid, homebase_name, entryid, entry_name, nis, nisn, name, gender,
                   birth_place, birth_date, height, weight, head, order_number, siblings,
                   provinceid, province_name, cityid, city_name, districtid, district_name,
                   villageid, village_name, postal_code, address
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
                 $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
                RETURNING *`,
          [
            userid,
            homebaseid,
            homebase_name,
            entryid,
            entry_name,
            nis,
            nisn,
            name,
            gender,
            birth_place,
            birth_date,
            height,
            weight,
            head,
            order_number,
            siblings,
            provinceid,
            province_name,
            cityid,
            city_name,
            districtid,
            district_name,
            villageid,
            village_name,
            postal_code,
            address,
          ]
        );

        await pool.query(`UPDATE u_students SET homebase = $1 WHERE id = $2`, [
          homebaseid,
          userid,
        ]);

        return res.status(201).json({ message: "Berhasil disimpan" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

// ============================
// Tambah Data Orang Tua
// ============================
router.post(
  "/add-parents-data",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const {
      userid,
      father_nik,
      father_name,
      father_birth_place,
      father_birth_date,
      father_job,
      father_phone,
      mother_nik,
      mother_name,
      mother_birth_place,
      mother_birth_date,
      mother_job,
      mother_phone,
    } = req.body;

    try {
      // Check if the student exists in db_student
      const studentCheck = await pool.query(
        `SELECT * FROM db_student WHERE userid = $1`,
        [userid]
      );

      if (studentCheck.rowCount > 0) {
        await pool.query(
          `UPDATE db_student SET
              father_nik = COALESCE($1, father_nik),
              father_name = COALESCE($2, father_name),
              father_birth_place = COALESCE($3, father_birth_place),
              father_birth_date = COALESCE($4, father_birth_date),
              father_job = COALESCE($5, father_job),
              father_phone = COALESCE($6, father_phone),
              mother_nik = COALESCE($7, mother_nik),
              mother_name = COALESCE($8, mother_name),
              mother_birth_place = COALESCE($9, mother_birth_place),
              mother_birth_date = COALESCE($10, mother_birth_date),
              mother_job = COALESCE($11, mother_job),
              mother_phone = COALESCE($12, mother_phone)
            WHERE userid = $13
            RETURNING *`,
          [
            father_nik,
            father_name,
            father_birth_place,
            father_birth_date,
            father_job,
            father_phone,
            mother_nik,
            mother_name,
            mother_birth_place,
            mother_birth_date,
            mother_job,
            mother_phone,
            userid,
          ]
        );

        return res.status(200).json({ message: "Berhasil disimpan" });
      } else {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

// ============================
// Tambah Data Keluarga
// ============================

router.post(
  "/add-family-data",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const { userid, name, gender, birth_date } = req.body;

    // Input validation
    if (!userid || !name || !gender || !birth_date) {
      return res.status(400).json({
        message: "Semua field harus diisi",
        missingFields: {
          userid: !userid,
          name: !name,
          gender: !gender,
          birth_date: !birth_date,
        },
      });
    }

    // Validate gender
    if (!["L", "P"].includes(gender)) {
      return res.status(400).json({
        message: "Jenis kelamin harus L (Laki-laki) atau P (Perempuan)",
      });
    }

    // Validate birth date format
    const birthDate = new Date(birth_date);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({
        message: "Format tanggal lahir tidak valid",
      });
    }

    const client = await pool.connect();
    try {
      // Check if student exists
      const studentCheck = await client.query(
        `SELECT id FROM u_students WHERE id = $1`,
        [userid]
      );

      if (studentCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Siswa tidak ditemukan",
        });
      }

      // Insert or update family member
      const result = await client.query(
        `INSERT INTO db_family (userid, name, gender, birth_date)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userid, name, gender, birth_date]
      );

      return res.status(200).json({
        message: result.rows[0].id
          ? "Data keluarga berhasil diperbarui"
          : "Data keluarga berhasil ditambahkan",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error in add-family-data:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat memproses data keluarga",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

router.get(
  "/get-family",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const { userid } = req.query;

    try {
      if (!userid) {
        return res.status(400).json({ message: "userid diperlukan" });
      }

      const result = await pool.query(
        `SELECT * FROM db_family WHERE userid = $1 ORDER BY name`,
        [userid]
      );

      return res.status(200).json({
        message: "Data keluarga berhasil diambil",
        data: result.rows,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/delete-family-data",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const { id } = req.query;

    try {
      if (!id) {
        return res.status(400).json({ message: "id diperlukan" });
      }

      const result = await pool.query(
        `DELETE FROM db_family WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Data keluarga tidak ditemukan" });
      }

      return res
        .status(200)
        .json({ message: "Data keluarga berhasil dihapus" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

// ============================
// Database
// ============================
router.get("/get-database", authorize("admin", "center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const homebaseid = req.user.homebase;

    const offset = (page - 1) * limit;

    let query = `
      WITH student_data AS (
        SELECT 
          s.id as student_id,
          s.nis as student_nis,
          s.name as student_name,
          ds.gender as student_gender,
          ds.entryid as student_entry_id,
          ds.entry_name as student_entry,
          g.name as student_grade,
          c.name as student_class,
          CASE 
            WHEN ds.id IS NOT NULL THEN
              ROUND(
                (
                  CASE WHEN ds.name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.nis IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.nisn IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.gender IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.birth_place IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.birth_date IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.height IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.weight IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.head IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.order_number IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.siblings IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.address IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.father_name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.mother_name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.province_name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.city_name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.district_name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN ds.village_name IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN EXISTS (SELECT 1 FROM db_family df WHERE df.userid = s.id) THEN 1 ELSE 0 END
                ) * 100.0 / 19
              )
            ELSE 0
          END as completeness
        FROM u_students s
        LEFT JOIN db_student ds ON s.id = ds.userid
        LEFT JOIN cl_students cs ON s.id = cs.student
        LEFT JOIN a_class c ON cs.classid = c.id
        LEFT JOIN a_grade g ON c.grade = g.id
        WHERE s.homebase = $1
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM u_students s
      WHERE s.homebase = $1
    `;

    const params = [homebaseid];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(s.name) LIKE LOWER($${paramCount}) OR LOWER(s.nis) LIKE LOWER($${paramCount}))`;
      countQuery += ` AND (LOWER(s.name) LIKE LOWER($${paramCount}) OR LOWER(s.nis) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    query += `) SELECT * FROM student_data ORDER BY CAST(student_grade AS INT), student_class, student_name LIMIT $${
      paramCount + 1
    } OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      client.query(query, params),
      client.query(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      students: result.rows,
      totalPages,
      totalData: total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/get-student-data",
  authorize("admin", "teacher", "student", "parent"),
  async (req, res) => {
    const { userid } = req.query;

    try {
      // Get student data with all fields from db_student
      const studentResult = await pool.query(
        `SELECT 
          ds.*,
          s.name as student_name,
          s.nis,
          s.gender as student_gender,
          s.isactive,
          g.name as grade_name,
          c.name as class_name,
          p.name as periode_name,
          h.name as homebase_name
        FROM db_student ds
        LEFT JOIN u_students s ON ds.userid = s.id
        LEFT JOIN cl_students cs ON s.id = cs.student
        LEFT JOIN a_class c ON cs.classid = c.id
        LEFT JOIN a_grade g ON c.grade = g.id
        LEFT JOIN a_periode p ON cs.periode = p.id
        LEFT JOIN a_homebase h ON s.homebase = h.id
        WHERE ds.userid = $1`,
        [userid]
      );

      // Get family data
      const familyResult = await pool.query(
        `SELECT * FROM db_family WHERE userid = $1 ORDER BY birth_date ASC`,
        [userid]
      );

      if (studentResult.rows.length === 0) {
        return res.status(404).json({
          message: "Data siswa tidak ditemukan",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Data siswa berhasil diambil",
        data: {
          ...studentResult.rows[0],
          family: familyResult.rows,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
