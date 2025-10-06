import express from "express";
import { authorize } from "../../middleware/auth.js";
import { withDbConnection, executeQuery } from "../../middleware/dbHandler.js";
import xlsx from "xlsx";

const router = express.Router();

// ============================
// Tambah Data Siswa
// ============================

router.get(
  "/get-periode",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
    const { homebase } = req.user;

    const result = await executeQuery(
      client,
      `SELECT * FROM a_periode WHERE homebase = $1 ORDER BY name ASC`,
      [homebase]
    );

    return res.status(200).json(result.rows);
  })
);

router.get(
  "/get-homebase",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
    const result = await executeQuery(
      client,
      `SELECT * FROM a_homebase ORDER BY name ASC`
    );
    return res.status(200).json(result.rows);
  })
);

router.post(
  "/add-student-data",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
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

    const studentCheck = await executeQuery(
      client,
      `SELECT * FROM db_student WHERE userid = $1`,
      [userid]
    );

    if (studentCheck.rows.length > 0) {
      await executeQuery(
        client,
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

      await executeQuery(
        client,
        `UPDATE u_students SET homebase = $1 WHERE id = $2`,
        [homebaseid, userid]
      );

      return res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await executeQuery(
        client,
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

      await executeQuery(
        client,
        `UPDATE u_students SET homebase = $1 WHERE id = $2`,
        [homebaseid, userid]
      );

      return res.status(201).json({ message: "Berhasil disimpan" });
    }
  })
);

// ============================
// Tambah Data Orang Tua
// ============================
router.post(
  "/add-parents-data",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
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

    const studentCheck = await executeQuery(
      client,
      `SELECT * FROM db_student WHERE userid = $1`,
      [userid]
    );

    if (studentCheck.rowCount > 0) {
      await executeQuery(
        client,
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
  })
);

// ============================
// Tambah Data Keluarga
// ============================

router.post(
  "/add-family-data",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
    // Tambahkan 'id' ke dalam destrukturisasi body
    const { id, userid, name, gender, birth_date } = req.body;

    // Input validation (tetap sama)
    if (!userid || !name || !gender || !birth_date) {
      return res.status(400).json({
        message: "Semua field harus diisi",
      });
    }
    // ... validasi lainnya tetap sama ...

    // **AWAL PERUBAHAN LOGIKA**

    let result;
    let message;

    if (id) {
      // **Logika untuk UPDATE jika ada ID**
      const updateQuery = `
        UPDATE db_family 
        SET name = $1, gender = $2, birth_date = $3 
        WHERE id = $4 AND userid = $5 
        RETURNING *
      `;
      result = await executeQuery(client, updateQuery, [
        name,
        gender,
        birth_date,
        id,
        userid,
      ]);
      message = "Data keluarga berhasil diperbarui";

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Data keluarga tidak ditemukan untuk diperbarui." });
      }
    } else {
      // **Logika untuk INSERT jika tidak ada ID (logika lama Anda)**
      // Pastikan siswa ada sebelum menambahkan anggota keluarga baru
      const studentCheck = await executeQuery(
        client,
        `SELECT id FROM u_students WHERE id = $1`,
        [userid]
      );
      if (studentCheck.rows.length === 0) {
        return res.status(404).json({ message: "Siswa tidak ditemukan" });
      }

      const insertQuery = `
        INSERT INTO db_family (userid, name, gender, birth_date)
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      result = await executeQuery(client, insertQuery, [
        userid,
        name,
        gender,
        birth_date,
      ]);
      message = "Data keluarga berhasil ditambahkan";
    }

    // **AKHIR PERUBAHAN LOGIKA**

    return res.status(200).json({
      message: message, // Gunakan pesan yang dinamis
      data: result.rows[0],
    });
  })
);

router.get(
  "/get-family",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
    const { userid } = req.query;

    if (!userid) {
      return res.status(400).json({ message: "userid diperlukan" });
    }

    const result = await executeQuery(
      client,
      `SELECT * FROM db_family WHERE userid = $1 ORDER BY name`,
      [userid]
    );

    return res.status(200).json({
      message: "Data keluarga berhasil diambil",
      data: result.rows,
    });
  })
);

router.delete(
  "/delete-family-data",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "id diperlukan" });
    }

    const result = await executeQuery(
      client,
      `DELETE FROM db_family WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data keluarga tidak ditemukan" });
    }

    return res.status(200).json({ message: "Data keluarga berhasil dihapus" });
  })
);

// ============================
// Database
// ============================
router.get(
  "/get-database",
  // 1. Allow 'teacher' role to access this endpoint
  authorize("admin", "center", "teacher"),
  withDbConnection(async (req, res, client) => {
    const { search = "", page = 1, limit = 10 } = req.query;
    const homebaseid = req.user.homebase;
    const userLevel = req.user.level;
    const userClassId = req.user.class; // Get classid from user token

    const periode = await executeQuery(
      client,
      `SELECT * FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [homebaseid]
    );

    // Handle case where no active period is found
    if (periode.rows.length === 0) {
      return res.status(404).json({ message: "No active period found." });
    }
    const activePeriode = periode.rows[0].id;

    const offset = (page - 1) * limit;

    // Base queries remain the same
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
        cs.classid as student_class_id,
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
      LEFT JOIN cl_students cs ON s.id = cs.student AND cs.periode = $2
      LEFT JOIN a_class c ON cs.classid = c.id
      LEFT JOIN a_grade g ON c.grade = g.id
      WHERE s.homebase = $1
      AND cs.periode = $2 
    `;

    let countQuery = `
    SELECT COUNT(*) as total
    FROM u_students s
    LEFT JOIN cl_students cs ON s.id = cs.student AND cs.periode = $2
    WHERE s.homebase = $1
    AND cs.periode = $2
    `;

    // Initialize parameters and counter
    const params = [homebaseid, activePeriode];
    let paramCount = 2;

    // 2. Add conditional logic for teachers
    if (userLevel === "teacher") {
      if (!userClassId) {
        return res
          .status(403)
          .json({ message: "Teacher is not assigned to a class." });
      }
      paramCount++;
      query += ` AND cs.classid = $${paramCount}`;
      countQuery += ` AND cs.classid = $${paramCount}`;
      params.push(userClassId);
    }

    // This search logic remains the same and works with the above addition
    if (search) {
      paramCount++;
      query += ` AND (LOWER(s.name) LIKE LOWER($${paramCount}) OR LOWER(s.nis) LIKE LOWER($${paramCount}))`;
      countQuery += ` AND (LOWER(s.name) LIKE LOWER($${paramCount}) OR LOWER(s.nis) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    // This also remains the same, correctly using the final paramCount
    query += `) SELECT * FROM student_data ORDER BY CAST(student_grade AS INT), student_class, student_name LIMIT $${
      paramCount + 1
    } OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      executeQuery(client, query, params),
      // The slice remains correct as limit & offset are not part of the count query
      executeQuery(client, countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      students: result.rows,
      totalPages,
      totalData: total,
    });
  })
);

router.get(
  "/get-database-by-class",
  authorize("teacher"),
  withDbConnection(async (req, res, client) => {
    const { page, limit, search, classid } = req.query;
    const offset = (page - 1) * limit;

    const homebase = req.user.homebase;

    const periode = await executeQuery(
      client,
      `SELECT * FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [homebase]
    );

    const periodeData = periode.rows[0].id;

    const count = await executeQuery(
      client,
      `SELECT COUNT(*) FROM cl_students 
      WHERE classid = $1 
      AND periode = $2 
      AND student_name ILIKE $3`,
      [classid, periodeData, `%${search}%`]
    );

    const data = await executeQuery(
      client,
      `SELECT cl_students.*, 
        u_students.gender as student_gender,
        u_students.isactive as isactive,
        p.name as active_periode,
        a_periode.name as periode_name, 
        a_homebase.name as homebase_name,
        a_class.name as class_name,
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
                CASE WHEN EXISTS (SELECT 1 FROM db_family df WHERE df.userid = cl_students.student) THEN 1 ELSE 0 END
              ) * 100.0 / 19
            )
          ELSE 0
        END as completeness
      FROM cl_students 
      LEFT JOIN a_periode ON cl_students.periode = a_periode.id
      LEFT JOIN a_homebase ON cl_students.homebase = a_homebase.id
      LEFT JOIN a_class ON cl_students.classid = a_class.id
      LEFT JOIN db_student ds ON cl_students.student = ds.userid
      LEFT JOIN u_students ON cl_students.student = u_students.id
      LEFT JOIN a_periode p ON u_students.periode = p.id
      WHERE classid = $1 
      AND cl_students.periode = $2
      AND student_name ILIKE $3
      ORDER BY student_name
      LIMIT $4 OFFSET $5`,
      [classid, periodeData, `%${search}%`, limit, offset]
    );

    const total = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      students: data.rows,
      totalPages,
      totalData: total,
    });
  })
);

router.get(
  "/get-student-data",
  authorize("admin", "teacher", "student", "parent"),
  withDbConnection(async (req, res, client) => {
    const { userid } = req.query;
    console.log(userid);

    // Get student data with all fields from db_student
    const studentResult = await executeQuery(
      client,
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
    const familyResult = await executeQuery(
      client,
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
  })
);

router.get(
  "/export-database",
  authorize("admin", "teacher"),
  withDbConnection(async (req, res, client) => {
    try {
      const homebaseid = req.user.homebase;

      // Get active period
      const periode = await executeQuery(
        client,
        `SELECT * FROM a_periode WHERE homebase = $1 AND isactive = true`,
        [homebaseid]
      );
      const activePeriode = periode.rows[0].id;

      // Get all database data with completeness calculation
      const databaseData = await executeQuery(
        client,
        `SELECT 
          s.id as student_id,
          s.nis as student_nis,
          s.name as student_name,
          ds.gender as student_gender,
          ds.entryid as student_entry_id,
          ds.entry_name as student_entry,
          g.name as student_grade,
          c.name as student_class,
          ds.nisn,
          ds.birth_place,
          ds.birth_date,
          ds.height,
          ds.weight,
          ds.head,
          ds.order_number,
          ds.siblings,
          ds.province_name,
          ds.city_name,
          ds.district_name,
          ds.village_name,
          ds.postal_code,
          ds.address,
          ds.father_nik,
          ds.father_name,
          ds.father_birth_place,
          ds.father_birth_date,
          ds.father_job,
          ds.father_phone,
          ds.mother_nik,
          ds.mother_name,
          ds.mother_birth_place,
          ds.mother_birth_date,
          ds.mother_job,
          ds.mother_phone,
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
          END as completeness,
          CASE 
            WHEN s.isactive = true THEN 'Aktif'
            ELSE 'Nonaktif'
          END as status
        FROM u_students s
        LEFT JOIN db_student ds ON s.id = ds.userid
        LEFT JOIN cl_students cs ON s.id = cs.student AND cs.periode = $2
        LEFT JOIN a_class c ON cs.classid = c.id
        LEFT JOIN a_grade g ON c.grade = g.id
        WHERE s.homebase = $1
        AND s.periode = $2
        AND s.isactive = true
        ORDER BY CAST(student_grade AS INT), student_class, student_name`,
        [homebaseid, activePeriode]
      );

      // Transform data for Excel export
      const excelData = databaseData.rows.map((row) => ({
        "ID Siswa": row.student_id,
        NIS: row.student_nis || "",
        NISN: row.nisn || "",
        "Nama Lengkap": row.student_name || "",
        "Jenis Kelamin": row.student_gender || "",
        "Tempat Lahir": row.birth_place || "",
        "Tanggal Lahir": row.birth_date
          ? new Date(row.birth_date).toLocaleDateString("id-ID")
          : "",
        "Tinggi Badan": row.height || "",
        "Berat Badan": row.weight || "",
        "Lingkar Kepala": row.head || "",
        "Anak Ke": row.order_number || "",
        "Jumlah Saudara": row.siblings || "",
        Provinsi: row.province_name || "",
        "Kota/Kabupaten": row.city_name || "",
        Kecamatan: row.district_name || "",
        "Desa/Kelurahan": row.village_name || "",
        "Kode Pos": row.postal_code || "",
        "Alamat Lengkap": row.address || "",
        "NIK Ayah": row.father_nik || "",
        "Nama Ayah": row.father_name || "",
        "Tempat Lahir Ayah": row.father_birth_place || "",
        "Tanggal Lahir Ayah": row.father_birth_date
          ? new Date(row.father_birth_date).toLocaleDateString("id-ID")
          : "",
        "Pekerjaan Ayah": row.father_job || "",
        "No. HP Ayah": row.father_phone || "",
        "NIK Ibu": row.mother_nik || "",
        "Nama Ibu": row.mother_name || "",
        "Tempat Lahir Ibu": row.mother_birth_place || "",
        "Tanggal Lahir Ibu": row.mother_birth_date
          ? new Date(row.mother_birth_date).toLocaleDateString("id-ID")
          : "",
        "Pekerjaan Ibu": row.mother_job || "",
        "No. HP Ibu": row.mother_phone || "",
        Tingkat: row.student_grade || "",
        Kelas: row.student_class || "",
        "Tahun Masuk": row.student_entry || "",
        "Kelengkapan Data (%)": row.completeness || 0,
        Status: row.status || "",
      }));

      // Create workbook and worksheet
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(excelData);

      // Set column headers
      const headers = [
        "ID Siswa",
        "NIS",
        "NISN",
        "Nama Lengkap",
        "Jenis Kelamin",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Tinggi Badan",
        "Berat Badan",
        "Lingkar Kepala",
        "Anak Ke",
        "Jumlah Saudara",
        "Provinsi",
        "Kota/Kabupaten",
        "Kecamatan",
        "Desa/Kelurahan",
        "Kode Pos",
        "Alamat Lengkap",
        "NIK Ayah",
        "Nama Ayah",
        "Tempat Lahir Ayah",
        "Tanggal Lahir Ayah",
        "Pekerjaan Ayah",
        "No. HP Ayah",
        "NIK Ibu",
        "Nama Ibu",
        "Tempat Lahir Ibu",
        "Tanggal Lahir Ibu",
        "Pekerjaan Ibu",
        "No. HP Ibu",
        "Tingkat",
        "Kelas",
        "Tahun Masuk",
        "Kelengkapan Data (%)",
        "Status",
      ];

      // Set headers in the first row
      xlsx.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

      // Auto-size columns
      const columnWidths = [
        { wch: 10 }, // ID Siswa
        { wch: 12 }, // NIS
        { wch: 12 }, // NISN
        { wch: 30 }, // Nama Lengkap
        { wch: 12 }, // Jenis Kelamin
        { wch: 20 }, // Tempat Lahir
        { wch: 15 }, // Tanggal Lahir
        { wch: 12 }, // Tinggi Badan
        { wch: 12 }, // Berat Badan
        { wch: 15 }, // Lingkar Kepala
        { wch: 10 }, // Anak Ke
        { wch: 15 }, // Jumlah Saudara
        { wch: 20 }, // Provinsi
        { wch: 20 }, // Kota/Kabupaten
        { wch: 20 }, // Kecamatan
        { wch: 20 }, // Desa/Kelurahan
        { wch: 12 }, // Kode Pos
        { wch: 40 }, // Alamat Lengkap
        { wch: 18 }, // NIK Ayah
        { wch: 25 }, // Nama Ayah
        { wch: 20 }, // Tempat Lahir Ayah
        { wch: 15 }, // Tanggal Lahir Ayah
        { wch: 20 }, // Pekerjaan Ayah
        { wch: 15 }, // No. HP Ayah
        { wch: 18 }, // NIK Ibu
        { wch: 25 }, // Nama Ibu
        { wch: 20 }, // Tempat Lahir Ibu
        { wch: 15 }, // Tanggal Lahir Ibu
        { wch: 20 }, // Pekerjaan Ibu
        { wch: 15 }, // No. HP Ibu
        { wch: 10 }, // Tingkat
        { wch: 15 }, // Kelas
        { wch: 15 }, // Tahun Masuk
        { wch: 20 }, // Kelengkapan Data (%)
        { wch: 10 }, // Status
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      xlsx.utils.book_append_sheet(workbook, worksheet, "Database Siswa");

      // Generate buffer
      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=database-siswa.xlsx"
      );
      res.setHeader("Content-Length", buffer.length);

      // Send the file
      res.send(buffer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  })
);

export default router;
