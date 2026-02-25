import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";
import xlsx from "xlsx";

const router = Router();

router.get("/get-teachers-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const count = await client.query(
      "SELECT COUNT(*) FROM u_teachers WHERE name ILIKE $1",
      [`%${search}%`]
    );

    const data = await client.query(
      `SELECT u_teachers.*, a_homebase.name AS homebase
        FROM u_teachers
      LEFT JOIN a_homebase ON a_homebase.id = u_teachers.homebase
      WHERE u_teachers.name ILIKE $1
      ORDER BY u_teachers.name ASC
      LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const totalPages = Math.ceil(count.rows[0].count / limit);
    const totalData = count.rows[0].count;

    res.status(200).json({
      results: data.rows,
      totalPages,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-students-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const count = await client.query(
      "SELECT COUNT(*) FROM u_students WHERE name ILIKE $1",
      [`%${search}%`]
    );

    const data = await client.query(
      `SELECT u_students.*, a_homebase.name AS homebase,
      a_periode.name AS periode
        FROM u_students
      LEFT JOIN a_homebase ON a_homebase.id = u_students.homebase
      LEFT JOIN a_periode ON a_periode.id = u_students.entry
      WHERE u_students.name ILIKE $1
      ORDER BY u_students.name ASC
      LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const totalPages = Math.ceil(count.rows[0].count / limit);
    const totalData = count.rows[0].count;

    res.status(200).json({
      results: data.rows,
      totalPages,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ... existing code ...

router.get("/get-family-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search, family_age, family_gender } = req.query;
    const offset = (page - 1) * limit;

    let ageCondition =
      "AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer BETWEEN 10 AND 15";
    if (family_age) {
      ageCondition = `AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer = $2`;
    }

    let genderCondition = "";
    if (family_gender) {
      genderCondition = `AND f.gender = $${family_age ? "3" : "2"}`;
    }

    const countQuery = `
      SELECT COUNT(*)
      FROM db_family f
      LEFT JOIN u_students s ON s.id = f.userid
      WHERE (s.name ILIKE $1 OR f.name ILIKE $1)
      ${ageCondition}
      ${genderCondition}
    `;

    const countParams = [];
    countParams.push(`%${search}%`);
    if (family_age) countParams.push(family_age);
    if (family_gender) countParams.push(family_gender);

    const count = await client.query(countQuery, countParams);

    const dataQuery = `
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.nis,
        f.id as family_id,
        f.name as family_name,
        f.gender as family_gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer as family_age,
        st.father_phone,
        st.mother_phone,
        st.father_name,
        st.mother_name
      FROM db_family f
      LEFT JOIN u_students s ON s.id = f.userid
      LEFT JOIN db_student st ON st.userid = s.id
      WHERE (s.name ILIKE $1 OR f.name ILIKE $1)
      ${ageCondition}
      ${genderCondition}
      ORDER BY s.name ASC, f.name ASC
      LIMIT $${countParams.length + 1} OFFSET $${countParams.length + 2}
    `;

    const dataParams = [...countParams, limit, offset];
    const data = await client.query(dataQuery, dataParams);

    const totalPages = Math.ceil(count.rows[0].count / limit);
    const totalData = count.rows[0].count;

    res.status(200).json({
      results: data.rows,
      totalPages,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/download-market-analysis", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { search = "", family_age, family_gender } = req.query;

    let ageCondition =
      "AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer BETWEEN 10 AND 15";
    if (family_age) {
      ageCondition = `AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer = $2`;
    }

    let genderCondition = "";
    if (family_gender) {
      genderCondition = `AND f.gender = $${family_age ? "3" : "2"}`;
    }

    const params = [`%${search}%`];
    if (family_age) params.push(family_age);
    if (family_gender) params.push(family_gender);

    const query = `
      SELECT
        s.name as student_name,
        s.nis,
        c.name as student_class,
        f.name as family_name,
        CASE WHEN f.gender = 'P' THEN 'Perempuan' ELSE 'Laki Laki' END as family_gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer as family_age,
        st.father_name,
        st.father_phone,
        st.mother_name,
        st.mother_phone
      FROM db_family f
      LEFT JOIN u_students s ON s.id = f.userid
      LEFT JOIN db_student st ON st.userid = s.id
      LEFT JOIN cl_students cs ON cs.student = s.id AND cs.periode = s.periode
      LEFT JOIN a_class c ON c.id = cs.classid
      WHERE (s.name ILIKE $1 OR f.name ILIKE $1)
      ${ageCondition}
      ${genderCondition}
      ORDER BY s.name ASC, f.name ASC
    `;

    const result = await client.query(query, params);

    const excelData = result.rows.map((row) => ({
      "Nama Siswa": row.student_name || "",
      NIS: row.nis || "",
      Kelas: row.student_class || "",
      "Nama Keluarga": row.family_name || "",
      "Jenis Kelamin Keluarga": row.family_gender || "",
      "Usia Keluarga": row.family_age || "",
      "Nama Ayah": row.father_name || "",
      "No. HP Ayah": row.father_phone || "",
      "Nama Ibu": row.mother_name || "",
      "No. HP Ibu": row.mother_phone || "",
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);

    xlsx.utils.sheet_add_aoa(
      worksheet,
      [
        [
          "Nama Siswa",
          "NIS",
          "Kelas",
          "Nama Keluarga",
          "Jenis Kelamin Keluarga",
          "Usia Keluarga",
          "Nama Ayah",
          "No. HP Ayah",
          "Nama Ibu",
          "No. HP Ibu",
        ],
      ],
      { origin: "A1" }
    );

    worksheet["!cols"] = [
      { wch: 30 },
      { wch: 14 },
      { wch: 14 },
      { wch: 30 },
      { wch: 22 },
      { wch: 14 },
      { wch: 25 },
      { wch: 16 },
      { wch: 25 },
      { wch: 16 },
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, "Analisis Market");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=analisis-market.xlsx"
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ... existing code ...

export default router;
