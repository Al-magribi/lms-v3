import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const saved = "Berhasil menyimpan data";
const failed = "Gagal menyimpan data";
const updated = "Berhasil mengupdate data";
const removed = "Berhasil menghapus data";

const router = Router();

// Helper function to get active periode
const getActivePeriode = async (client, homebase) => {
  // Ensure homebase is an integer
  const homebaseId = parseInt(homebase);
  if (isNaN(homebaseId)) {
    console.error("Invalid homebase ID:", homebase);
    return null;
  }

  const periode = await client.query(
    `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
    [homebaseId]
  );
  return periode.rows[0]?.id;
};

// =======================
// Pembobotan Bulanan
// =======================

router.get("/get-weighting", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { subjectid } = req.query;
    const teacherid = req.user.id; // Diambil dari pengguna yang terautentikasi

    if (!subjectid) {
      return res.status(400).json({ message: "subjectid diperlukan" });
    }

    // Query disesuaikan dengan kolom baru
    const query = `
      SELECT id, presensi, attitude, daily 
      FROM l_weighting 
      WHERE teacherid = $1 AND subjectid = $2
    `;

    const result = await client.query(query, [teacherid, Number(subjectid)]);

    // Jika tidak ada data, kembalikan nilai default yang sesuai
    const data = result.rows[0];

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/save-weighting", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    // Variabel 'id' dihapus karena tidak digunakan dalam logika UPSERT
    const { subjectid, presensi, attitude, daily } = req.body;
    const teacherid = req.user.id;

    // Validasi input tetap sama
    if (
      subjectid === undefined ||
      presensi === undefined ||
      attitude === undefined ||
      daily === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Semua field pembobotan diperlukan" });
    }

    const totalWeight = Number(presensi) + Number(attitude) + Number(daily);
    if (totalWeight !== 100) {
      return res.status(400).json({ message: "Total pembobotan harus 100%" });
    }

    // Query ini secara efisien menangani INSERT dan UPDATE dalam satu perintah
    // ON CONFLICT (teacherid, subjectid) akan aktif jika data dengan kombinasi tersebut sudah ada
    const query = `
      INSERT INTO l_weighting (teacherid, subjectid, presensi, attitude, daily)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (teacherid, subjectid) 
      DO UPDATE SET
        presensi = EXCLUDED.presensi,
        attitude = EXCLUDED.attitude,
        daily = EXCLUDED.daily
      RETURNING *
    `;

    const params = [teacherid, subjectid, presensi, attitude, daily];
    const result = await client.query(query, params);

    res.status(200).json({
      message: "Pembobotan berhasil disimpan",
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==========================
// Attitude (Sikap)
// ==========================

// Get attitude scores for a class/subject/chapter/month
router.get("/attitude", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;
    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const result = await client.query(
      `SELECT * FROM l_attitude
         WHERE class_id = $1 AND subject_id = $2 AND chapter_id = $3
           AND month = $4 AND semester = $5 AND periode_id = $6
         ORDER BY student_id`,
      [classid, subjectid, chapterid, month, semester, periodeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Create or update attitude score (UPSERT)
router.post("/attitude", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      student_id,
      subject_id,
      class_id,
      chapter_id,
      month,
      semester,
      kinerja,
      kedisiplinan,
      keaktifan,
      percaya_diri,
      catatan_guru,
    } = req.body;

    if (
      !student_id ||
      !subject_id ||
      !class_id ||
      !chapter_id ||
      !month ||
      !semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in body" });
    }

    const homebase = req.user.homebase;
    const teacher_id = req.user.id;
    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const query = `
        INSERT INTO l_attitude (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
                     semester, month, kinerja, kedisiplinan, keaktifan, percaya_diri, catatan_guru
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (student_id, subject_id, class_id, chapter_id, month, semester)
        DO UPDATE SET
                     kinerja = EXCLUDED.kinerja,
           kedisiplinan = EXCLUDED.kedisiplinan,
           keaktifan = EXCLUDED.keaktifan,
           percaya_diri = EXCLUDED.percaya_diri,
           catatan_guru = EXCLUDED.catatan_guru,
           updatedat = CURRENT_TIMESTAMP
        RETURNING *
      `;

    const params = [
      student_id,
      subject_id,
      class_id,
      periode_id,
      chapter_id,
      teacher_id,
      semester,
      month,
      kinerja ?? null,
      kedisiplinan ?? null,
      keaktifan ?? null,
      percaya_diri ?? null,
      catatan_guru ?? null,
    ];

    const result = await client.query(query, params);
    res.status(200).json({ message: saved, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Bulk upload attitude scores from Excel file
router.post(
  "/attitude/upload-score",
  authorize("teacher", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { classid, subjectid, chapterid, month, semester } = req.query;
      const data = req.body; // Array of arrays from Excel

      if (!classid || !subjectid || !chapterid || !month || !semester) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "No data provided for upload" });
      }

      const homebase = req.user.homebase;
      const teacher_id = req.user.id;
      const periode_id = await getActivePeriode(client, homebase);
      if (!periode_id) {
        return res.status(400).json({ message: "No active periode found" });
      }

      // Get all students in the class to map NIS to student_id
      const studentsQuery = `
      SELECT us.id as student_id, us.nis, us.name as student_name
      FROM cl_students cs
      JOIN u_students us ON cs.student = us.id
      WHERE cs.classid = $1 AND cs.periode = $2
    `;
      const studentsResult = await client.query(studentsQuery, [
        classid,
        periode_id,
      ]);
      const studentsMap = {};
      studentsResult.rows.forEach((student) => {
        studentsMap[student.nis] = student.student_id;
      });

      // Begin transaction
      await client.query("BEGIN");

      // First, let's check if there are existing records for this combination
      const checkExistingQuery = `
        SELECT id, student_id, kinerja, kedisiplinan, keaktifan, percaya_diri, catatan_guru
        FROM l_attitude 
        WHERE class_id = $1 
          AND subject_id = $2 
          AND chapter_id = $3 
          AND month = $4 
          AND semester = $5 
          AND periode_id = $6
      `;

      const existingRecords = await client.query(checkExistingQuery, [
        Number(classid),
        Number(subjectid),
        Number(chapterid),
        month,
        Number(semester),
        periode_id,
      ]);

      // Use a more robust approach with DELETE and INSERT to avoid constraint issues
      const deleteQuery = `
        DELETE FROM l_attitude 
        WHERE student_id = $1 
          AND subject_id = $2 
          AND class_id = $3 
          AND chapter_id = $4 
          AND month = $5 
          AND semester = $6
      `;

      const insertQuery = `
        INSERT INTO l_attitude (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, kinerja, kedisiplinan, keaktifan, percaya_diri, catatan_guru
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each row from Excel
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!Array.isArray(row) || row.length < 8) {
          errorCount++;
          errors.push(`Row ${i + 1}: Invalid data format`);
          continue;
        }

        const [
          nis,
          namaSiswa,
          kinerja,
          kedisiplinan,
          keaktifan,
          percayaDiri,
          catatan,
          rataRata,
        ] = row;

        // Skip header row or empty rows
        if (!nis || nis === "NIS" || nis === "") {
          continue;
        }

        const student_id = studentsMap[nis];
        if (!student_id) {
          errorCount++;
          errors.push(
            `Row ${i + 1}: Student with NIS ${nis} not found in class`
          );
          continue;
        }

        try {
          const params = [
            student_id,
            Number(subjectid),
            Number(classid),
            periode_id,
            Number(chapterid),
            teacher_id,
            Number(semester),
            month,
            kinerja && kinerja !== "" ? Number(kinerja) : null,
            kedisiplinan && kedisiplinan !== "" ? Number(kedisiplinan) : null,
            keaktifan && keaktifan !== "" ? Number(keaktifan) : null,
            percayaDiri && percayaDiri !== "" ? Number(percayaDiri) : null,
            catatan && catatan !== "" ? catatan : null,
          ];

          // Check if this student already has a record for this combination
          const existingRecord = existingRecords.rows.find(
            (record) => record.student_id === student_id
          );

          // First delete any existing record for this combination
          await client.query(deleteQuery, [
            student_id,
            Number(subjectid),
            Number(classid),
            Number(chapterid),
            month,
            Number(semester),
          ]);

          // Then insert the new record
          const result = await client.query(insertQuery, params);

          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `Row ${i + 1}: Error processing student ${nis}:`,
            error
          );

          // Check if it's a constraint violation error
          if (error.code === "23505") {
            // Unique violation
            errors.push(
              `Row ${
                i + 1
              }: Duplicate record for student ${nis} - constraint violation`
            );
          } else if (error.code === "25P02") {
            // Transaction aborted
            errors.push(
              `Row ${i + 1}: Transaction aborted for student ${nis} - ${
                error.message
              }`
            );
            // Break the loop since transaction is aborted
            break;
          } else {
            errors.push(`Row ${i + 1}: ${error.message}`);
          }
        }
      }

      // Commit transaction
      await client.query("COMMIT");

      // Verify the upload by checking the final state
      const verifyQuery = `
         SELECT COUNT(*) as total_records
         FROM l_attitude 
         WHERE class_id = $1 
           AND subject_id = $2 
           AND chapter_id = $3 
           AND month = $4 
           AND semester = $5 
           AND periode_id = $6
       `;

      const verifyResult = await client.query(verifyQuery, [
        Number(classid),
        Number(subjectid),
        Number(chapterid),
        month,
        Number(semester),
        periode_id,
      ]);

      const message = `Berhasil mengupload ${successCount} data${
        errorCount > 0 ? `, ${errorCount} error` : ""
      }`;
      res.status(200).json({
        message,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
        totalRecordsAfterUpload: verifyResult.rows[0].total_records,
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ==========================
// Formative
// ==========================

router.get("/formative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;
    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const result = await client.query(
      `SELECT * FROM l_formative
         WHERE class_id = $1 AND subject_id = $2 AND chapter_id = $3
           AND month = $4 AND semester = $5 AND periode_id = $6
         ORDER BY student_id`,
      [classid, subjectid, chapterid, month, semester, periodeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/formative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      student_id,
      subject_id,
      class_id,
      chapter_id,
      month,
      semester,
      F_1,
      F_2,
      F_3,
      F_4,
      F_5,
      F_6,
      F_7,
      F_8,
    } = req.body;

    if (
      !student_id ||
      !subject_id ||
      !class_id ||
      !chapter_id ||
      !month ||
      !semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in body" });
    }

    const homebase = req.user.homebase;
    const teacher_id = req.user.id;
    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const query = `
        INSERT INTO l_formative (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, F_1, F_2, F_3, F_4, F_5, F_6, F_7, F_8
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (student_id, subject_id, class_id, chapter_id, month, semester)
        DO UPDATE SET
          F_1 = EXCLUDED.F_1,
          F_2 = EXCLUDED.F_2,
          F_3 = EXCLUDED.F_3,
          F_4 = EXCLUDED.F_4,
          F_5 = EXCLUDED.F_5,
          F_6 = EXCLUDED.F_6,
          F_7 = EXCLUDED.F_7,
                     F_8 = EXCLUDED.F_8,
           updatedat = CURRENT_TIMESTAMP
        RETURNING *
      `;

    const params = [
      student_id,
      subject_id,
      class_id,
      periode_id,
      chapter_id,
      teacher_id,
      semester,
      month,
      F_1 ?? null,
      F_2 ?? null,
      F_3 ?? null,
      F_4 ?? null,
      F_5 ?? null,
      F_6 ?? null,
      F_7 ?? null,
      F_8 ?? null,
    ];

    const result = await client.query(query, params);
    res.status(200).json({ message: saved, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Bulk upload formative scores from Excel file
router.post(
  "/formative/upload-score",
  authorize("teacher", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { classid, subjectid, chapterid, month, semester } = req.query;
      const data = req.body; // Array of arrays from Excel

      if (!classid || !subjectid || !chapterid || !month || !semester) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "No data provided for upload" });
      }

      const homebase = req.user.homebase;
      const teacher_id = req.user.id;
      const periode_id = await getActivePeriode(client, homebase);
      if (!periode_id) {
        return res.status(400).json({ message: "No active periode found" });
      }

      // Get all students in the class to map NIS to student_id
      const studentsQuery = `
        SELECT us.id as student_id, us.nis, us.name as student_name
        FROM cl_students cs
        JOIN u_students us ON cs.student = us.id
        WHERE cs.classid = $1 AND cs.periode = $2
      `;
      const studentsResult = await client.query(studentsQuery, [
        classid,
        periode_id,
      ]);
      const studentsMap = {};
      studentsResult.rows.forEach((student) => {
        studentsMap[student.nis] = student.student_id;
      });

      // Begin transaction
      await client.query("BEGIN");

      // Use a more robust approach with DELETE and INSERT to avoid constraint issues
      const deleteQuery = `
        DELETE FROM l_formative 
        WHERE student_id = $1 
          AND subject_id = $2 
          AND class_id = $3 
          AND chapter_id = $4 
          AND month = $5 
          AND semester = $6
      `;

      const insertQuery = `
        INSERT INTO l_formative (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, F_1, F_2, F_3, F_4, F_5, F_6, F_7, F_8
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each row from Excel
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!Array.isArray(row) || row.length < 11) {
          errorCount++;
          errors.push(`Row ${i + 1}: Invalid data format`);
          continue;
        }

        const [nis, namaSiswa, f1, f2, f3, f4, f5, f6, f7, f8, rataRata] = row;

        // Skip header row or empty rows
        if (!nis || nis === "NIS" || nis === "") {
          continue;
        }

        const student_id = studentsMap[nis];
        if (!student_id) {
          errorCount++;
          errors.push(
            `Row ${i + 1}: Student with NIS ${nis} not found in class`
          );
          continue;
        }

        try {
          const params = [
            student_id,
            Number(subjectid),
            Number(classid),
            periode_id,
            Number(chapterid),
            teacher_id,
            Number(semester),
            month,
            f1 && f1 !== "" ? Number(f1) : null,
            f2 && f2 !== "" ? Number(f2) : null,
            f3 && f3 !== "" ? Number(f3) : null,
            f4 && f4 !== "" ? Number(f4) : null,
            f5 && f5 !== "" ? Number(f5) : null,
            f6 && f6 !== "" ? Number(f6) : null,
            f7 && f7 !== "" ? Number(f7) : null,
            f8 && f8 !== "" ? Number(f8) : null,
          ];

          // First delete any existing record for this combination
          await client.query(deleteQuery, [
            student_id,
            Number(subjectid),
            Number(classid),
            Number(chapterid),
            month,
            Number(semester),
          ]);

          // Then insert the new record
          const result = await client.query(insertQuery, params);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `Row ${i + 1}: Error processing student ${nis}:`,
            error
          );
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      // Commit transaction
      await client.query("COMMIT");

      const message = `Berhasil mengupload ${successCount} data${
        errorCount > 0 ? `, ${errorCount} error` : ""
      }`;
      res.status(200).json({
        message,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ==========================
// Summative
// ==========================

router.get("/summative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, subjectid, chapterid, month, semester } = req.query;
    if (!classid || !subjectid || !chapterid || !month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const result = await client.query(
      `SELECT * FROM l_summative
         WHERE class_id = $1 AND subject_id = $2 AND chapter_id = $3
           AND month = $4 AND semester = $5 AND periode_id = $6
         ORDER BY student_id`,
      [classid, subjectid, chapterid, month, semester, periodeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/summative", authorize("teacher", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      student_id,
      subject_id,
      class_id,
      chapter_id,
      month,
      semester,
      oral,
      written,
      project,
      performance,
    } = req.body;

    if (
      !student_id ||
      !subject_id ||
      !class_id ||
      !chapter_id ||
      !month ||
      !semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in body" });
    }

    const homebase = req.user.homebase;
    const teacher_id = req.user.id;
    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const query = `
        INSERT INTO l_summative (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, oral, written, project, performance
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (student_id, subject_id, class_id, chapter_id, month, semester)
        DO UPDATE SET
          oral = EXCLUDED.oral,
          written = EXCLUDED.written,
          project = EXCLUDED.project,
          performance = EXCLUDED.performance,
          updatedat = CURRENT_TIMESTAMP
        RETURNING *
      `;

    const params = [
      student_id,
      subject_id,
      class_id,
      periode_id,
      chapter_id,
      teacher_id,
      semester,
      month,
      oral ?? null,
      written ?? null,
      project ?? null,
      performance ?? null,
    ];

    const result = await client.query(query, params);
    res.status(200).json({ message: saved, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Bulk upload summative scores from Excel file
router.post(
  "/summative/upload-score",
  authorize("teacher", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { classid, subjectid, chapterid, month, semester } = req.query;
      const data = req.body; // Array of arrays from Excel

      if (!classid || !subjectid || !chapterid || !month || !semester) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "No data provided for upload" });
      }

      const homebase = req.user.homebase;
      const teacher_id = req.user.id;
      const periode_id = await getActivePeriode(client, homebase);
      if (!periode_id) {
        return res.status(400).json({ message: "No active periode found" });
      }

      // Get all students in the class to map NIS to student_id
      const studentsQuery = `
        SELECT us.id as student_id, us.nis, us.name as student_name
        FROM cl_students cs
        JOIN u_students us ON cs.student = us.id
        WHERE cs.classid = $1 AND cs.periode = $2
      `;
      const studentsResult = await client.query(studentsQuery, [
        classid,
        periode_id,
      ]);
      const studentsMap = {};
      studentsResult.rows.forEach((student) => {
        studentsMap[student.nis] = student.student_id;
      });

      // Begin transaction
      await client.query("BEGIN");

      // Use a more robust approach with DELETE and INSERT to avoid constraint issues
      const deleteQuery = `
        DELETE FROM l_summative 
        WHERE student_id = $1 
          AND subject_id = $2 
          AND class_id = $3 
          AND chapter_id = $4 
          AND month = $5 
          AND semester = $6
      `;

      const insertQuery = `
        INSERT INTO l_summative (
          student_id, subject_id, class_id, periode_id, chapter_id, teacher_id,
          semester, month, oral, written, project, performance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each row from Excel
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!Array.isArray(row) || row.length < 7) {
          errorCount++;
          errors.push(`Row ${i + 1}: Invalid data format`);
          continue;
        }

        const [nis, namaSiswa, oral, written, project, performance, rataRata] =
          row;

        // Skip header row or empty rows
        if (!nis || nis === "NIS" || nis === "") {
          continue;
        }

        const student_id = studentsMap[nis];
        if (!student_id) {
          errorCount++;
          errors.push(
            `Row ${i + 1}: Student with NIS ${nis} not found in class`
          );
          continue;
        }

        try {
          const params = [
            student_id,
            Number(subjectid),
            Number(classid),
            periode_id,
            Number(chapterid),
            teacher_id,
            Number(semester),
            month,
            oral && oral !== "" ? Number(oral) : null,
            written && written !== "" ? Number(written) : null,
            project && project !== "" ? Number(project) : null,
            performance && performance !== "" ? Number(performance) : null,
          ];

          // First delete any existing record for this combination
          await client.query(deleteQuery, [
            student_id,
            Number(subjectid),
            Number(classid),
            Number(chapterid),
            month,
            Number(semester),
          ]);

          // Then insert the new record
          const result = await client.query(insertQuery, params);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `Row ${i + 1}: Error processing student ${nis}:`,
            error
          );
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      // Commit transaction
      await client.query("COMMIT");

      const message = `Berhasil mengupload ${successCount} data${
        errorCount > 0 ? `, ${errorCount} error` : ""
      }`;
      res.status(200).json({
        message,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Bulk upload final score from Excel File
router.get("/get-final-score", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { semester, subjectid, classid } = req.query;
    const homebase = req.user.homebase;

    // Validasi input
    if (!semester || !subjectid || !classid) {
      return res.status(400).json({
        message: "Parameter semester, subjectid, dan classid diperlukan",
      });
    }

    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res
        .status(400)
        .json({ message: "Tidak ada periode aktif ditemukan" });
    }

    // UPDATE: Menggunakan cl_students sebagai tabel utama (Left Table)
    // agar semua siswa di kelas tersebut muncul.
    const query = `
      SELECT 
        s.id AS studentid,
        s.nis,
        s.name AS student_name,
        l.score
      FROM cl_students cs
      JOIN u_students s ON cs.student = s.id
      LEFT JOIN l_finalscore l ON 
        l.studentid = s.id AND 
        l.periode = $1 AND 
        l.semester = $2 AND 
        l.subjectid = $3
      WHERE 
        cs.periode = $1 AND 
        cs.classid = $4
      ORDER BY s.name ASC
    `;

    const { rows } = await client.query(query, [
      periode_id, // $1
      semester, // $2
      subjectid, // $3
      classid, // $4
    ]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server internal" });
  } finally {
    client.release();
  }
});

router.post("/final-score", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { semester, subjectid, classid } = req.query;
    const data = req.body; // Expecting array of objects: [{ studentid: 1, score: 80 }, ...]
    const homebase = req.user.homebase;
    const teacher_id = req.user.id;

    if (!data || !Array.isArray(data)) {
      return res
        .status(400)
        .json({ message: "Data harus berupa array nilai siswa" });
    }

    const periode_id = await getActivePeriode(client, homebase);
    if (!periode_id) {
      return res
        .status(400)
        .json({ message: "Tidak ada periode aktif ditemukan" });
    }

    await client.query("BEGIN");

    for (const item of data) {
      const { studentid, score } = item;

      // Skip jika data tidak lengkap
      if (!studentid || score === undefined || score === null || score === "")
        continue;

      // 1. Cek apakah data sudah ada
      const checkSql = `
        SELECT id FROM l_finalscore 
        WHERE periode = $1 AND semester = $2 AND subjectid = $3 AND classid = $4 AND studentid = $5
      `;
      const checkRes = await client.query(checkSql, [
        periode_id,
        semester,
        subjectid,
        classid,
        studentid,
      ]);

      if (checkRes.rows.length > 0) {
        // 2. Jika ada, UPDATE
        const updateSql = `
          UPDATE l_finalscore 
          SET score = $1, teacherid = $2 
          WHERE id = $3
        `;
        await client.query(updateSql, [score, teacher_id, checkRes.rows[0].id]);
      } else {
        // 3. Jika tidak ada, INSERT
        const insertSql = `
          INSERT INTO l_finalscore (periode, semester, teacherid, subjectid, classid, studentid, score)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(insertSql, [
          periode_id,
          semester,
          teacher_id,
          subjectid,
          classid,
          studentid,
          score,
        ]);
      }
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Data nilai akhir berhasil disimpan" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message || "Gagal menyimpan data" });
  } finally {
    client.release();
  }
});

// ==========================
// Recap Data
// ==========================

// Helper function to convert Indonesian month name to month number
const getMonthNumber = (monthName) => {
  const monthMap = {
    januari: 1,
    februari: 2,
    maret: 3,
    april: 4,
    mei: 5,
    juni: 6,
    juli: 7,
    agustus: 8,
    september: 9,
    oktober: 10,
    november: 11,
    desember: 12,
  };

  return monthMap[monthName.toLowerCase()] || 1; // Default to January if not found
};

// ==========================
// Teacher Completion Report
// ==========================

router.get("/teacher-completion", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    let { month, page = 1, limit = 5, search = "", categoryId } = req.query;

    // Sanitasi input
    if (categoryId === "null" || categoryId === "undefined" || !categoryId) {
      categoryId = null;
    }
    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    const homebase = req.user.homebase;
    const periodeid = await getActivePeriode(client, homebase);
    const monthNumber = getMonthNumber(month);
    const semester = monthNumber >= 7 || monthNumber <= 1 ? 1 : 2;

    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    const offset = (page - 1) * limit;

    // 1. Query untuk mendapatkan list Guru yang DIPAGINASI dan total count
    const teacherListQuery = `
        WITH filtered_teachers AS (
          SELECT DISTINCT ut.id, ut.name
          FROM u_teachers ut
          JOIN at_subject ats ON ut.id = ats.teacher
          JOIN a_subject s ON ats.subject = s.id
          WHERE s.homebase = $1 
            AND ut.name ILIKE $2
            AND ($3::INTEGER IS NULL OR s.categoryid = $3::INTEGER)
        ),
        total_count AS (
            SELECT COUNT(*) as total FROM filtered_teachers
        )
        SELECT 
            t.id as teacher_id,
            t.name as teacher_name,
            (SELECT total FROM total_count) as total_records
        FROM filtered_teachers t
        ORDER BY t.name
        LIMIT $4 OFFSET $5;
      `;
    const teacherListParams = [
      homebase, // $1
      `%${search}%`, // $2
      categoryId, // $3
      limit, // $4
      offset, // $5
    ];
    const teacherListResult = await client.query(
      teacherListQuery,
      teacherListParams
    );
    const teachers = teacherListResult.rows; // <-- Ini adalah guru yang dipaginasi

    if (teachers.length === 0) {
      return res.status(200).json({
        statistics: [],
        completeness: "0.00%",
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    }

    const totalRecords = teachers[0].total_records;

    // 2. Query untuk mendapatkan SEMUA guru yang terfilter (hanya ID)
    const allTeachersQuery = `
        SELECT DISTINCT ut.id as teacher_id
        FROM u_teachers ut
        JOIN at_subject ats ON ut.id = ats.teacher
        JOIN a_subject s ON ats.subject = s.id
        WHERE s.homebase = $1 
          AND ut.name ILIKE $2
          AND ($3::INTEGER IS NULL OR s.categoryid = $3::INTEGER);
      `;
    const allTeachersResult = await client.query(allTeachersQuery, [
      homebase, // $1
      `%${search}%`, // $2
      categoryId, // $3
    ]);
    const allTeachers = allTeachersResult.rows; // <-- Ini SEMUA guru

    // Siapkan variabel untuk GLOBAL stats dan Paged stats
    let globalCompletedTasks = 0;
    let globalTotalTasks = 0;

    // Map untuk menampung stats HANYA untuk guru yang dipaginasi
    const pagedTeacherStats = new Map();
    // Set untuk mengecek guru mana yang perlu dibuatkan stats detail
    const pagedTeacherIds = new Set(teachers.map((t) => t.teacher_id));

    // 3. Loop melalui SEMUA guru untuk kalkulasi global
    for (const teacherRef of allTeachers) {
      const currentTeacherId = teacherRef.teacher_id;
      // Cek apakah guru ini ada di page ini
      const isPagedTeacher = pagedTeacherIds.has(currentTeacherId);

      // Query untuk mendapatkan semua kelas, mapel, chapter
      const classesQuery = `
          SELECT 
              ac.id AS class_id, ac.name AS class_name,
              ach.id AS chapter_id, ach.title AS chapter_title,
              s.id AS subject_id, s.name AS subject_name
          FROM a_class ac
          JOIN l_cclass lcc ON ac.id = lcc.classid
          JOIN l_chapter ach ON lcc.chapter = ach.id
          JOIN a_subject s ON ach.subject = s.id
          WHERE ach.teacher = $1 AND s.homebase = $2
            AND ($3::INTEGER IS NULL OR s.categoryid = $3::INTEGER)
            AND EXISTS (
                SELECT 1 FROM l_attitude att WHERE att.chapter_id = ach.id AND att.class_id = ac.id AND att.month = $4
                UNION ALL
                SELECT 1 FROM l_formative f WHERE f.chapter_id = ach.id AND f.class_id = ac.id AND f.month = $4
                UNION ALL
                SELECT 1 FROM l_summative sum WHERE sum.chapter_id = ach.id AND sum.class_id = ac.id AND sum.month = $4
            )
          ORDER BY s.name, ac.name, ach.order_number;
        `;
      const classesResult = await client.query(classesQuery, [
        currentTeacherId, // $1
        homebase, // $2
        categoryId, // $3
        month, // $4
      ]);
      const teacherClasses = classesResult.rows;

      // --- PERBAIKAN DIMULAI DI SINI ---
      if (isPagedTeacher && teacherClasses.length === 0) {
        // Guru ini ada di page ini, TAPI tidak punya data/chapter di bulan ini.
        // Kita harus tetap menampilkannya di list dengan data kosong.
        const teacherName = teachers.find(
          (t) => t.teacher_id === currentTeacherId
        ).teacher_name;

        pagedTeacherStats.set(currentTeacherId, {
          name: teacherName,
          subjects: [], // Kirim array kosong
        });

        // Karena tidak ada 'teacherClasses', tidak ada yang perlu dihitung
        // untuk global stats dari guru ini.
        continue; // Lanjut ke guru berikutnya
      }

      if (teacherClasses.length === 0) {
        // Guru ini TIDAK di page ini, dan tidak punya data.
        // Lanjut saja.
        continue;
      }
      // --- AKHIR PERBAIKAN ---

      // Map untuk mengelompokkan data: Subject ID -> Class ID -> Chapters
      const teacherSubjectsMap = new Map();
      teacherClasses.forEach((c) => {
        if (!teacherSubjectsMap.has(c.subject_id)) {
          teacherSubjectsMap.set(c.subject_id, {
            id: c.subject_id,
            name: c.subject_name,
            detailsMap: new Map(),
          });
        }
        const subjectGroup = teacherSubjectsMap.get(c.subject_id);
        if (!subjectGroup.detailsMap.has(c.class_id)) {
          subjectGroup.detailsMap.set(c.class_id, {
            class_id: c.class_id,
            class_name: c.class_name,
            chapters: [],
          });
        }
        const classGroup = subjectGroup.detailsMap.get(c.class_id);
        if (!classGroup.chapters.some((ch) => ch.id === c.chapter_id)) {
          classGroup.chapters.push({
            id: c.chapter_id,
            name: c.chapter_title,
          });
        }
      });

      // Variabel-variabel ini HANYA diisi jika isPagedTeacher
      let teacherSubjects = [];

      // Loop melalui Mapel (Subjects)
      for (const subjectGroup of teacherSubjectsMap.values()) {
        const subjectDetails = []; // Hanya diisi jika isPagedTeacher
        const classGroups = Array.from(subjectGroup.detailsMap.values());

        // Loop melalui Kelas (Classes) untuk Subject ini
        for (const group of classGroups) {
          if (group.chapters.length === 0) continue;

          const classSubjectName = `${group.class_name} (${month} - Semester ${semester})`;

          const allStudentsQuery = `
              SELECT us.id, us.name
              FROM cl_students cs
              JOIN u_students us ON cs.student = us.id
              WHERE cs.classid = $1 AND cs.periode = $2
            `;
          const allStudentsResult = await client.query(allStudentsQuery, [
            group.class_id,
            periodeid,
          ]);
          const allStudents = allStudentsResult.rows;
          const totalStudents = allStudents.length;

          if (totalStudents === 0) {
            continue;
          }

          const currentChapterIds = group.chapters.map((ch) => ch.id);

          const filledRecordsQuery = `
              SELECT 
                  'attitude' as type, lat.student_id, lat.chapter_id, us.name as student_name
              FROM l_attitude lat 
              JOIN u_students us ON lat.student_id = us.id
              WHERE lat.class_id = $7 AND lat.subject_id = $2 AND lat.teacher_id = $1 AND lat.periode_id = $4
              AND lat.chapter_id = ANY($6::INT[])
              AND lat.semester = $5 AND lat.month = $3::VARCHAR
              AND lat.rata_rata IS NOT NULL
              
              UNION ALL
              
              SELECT 
                  'formative' as type, lf.student_id, lf.chapter_id, us.name as student_name
              FROM l_formative lf
              JOIN u_students us ON lf.student_id = us.id
              WHERE lf.class_id = $7 AND lf.subject_id = $2 AND lf.teacher_id = $1 AND lf.periode_id = $4
              AND lf.chapter_id = ANY($6::INT[])
              AND lf.semester = $5 AND lf.month = $3::VARCHAR
              AND lf.rata_rata IS NOT NULL
              
              UNION ALL
              
              SELECT 
                  'summative' as type, ls.student_id, ls.chapter_id, us.name as student_name
              FROM l_summative ls
              JOIN u_students us ON ls.student_id = us.id
              WHERE ls.class_id = $7 AND ls.subject_id = $2 AND ls.teacher_id = $1 AND ls.periode_id = $4
              AND ls.chapter_id = ANY($6::INT[])
              AND ls.semester = $5 AND ls.month = $3::VARCHAR
              AND ls.rata_rata IS NOT NULL;
            `;
          const filledRecordsResult = await client.query(filledRecordsQuery, [
            currentTeacherId, // $1
            subjectGroup.id, // $2
            month, // $3
            periodeid, // $4
            semester, // $5
            currentChapterIds.map(String), // $6
            group.class_id, // $7
          ]);
          const filledRecords = filledRecordsResult.rows;

          const classChapters = []; // Hanya diisi jika isPagedTeacher

          // Loop melalui setiap Chapter
          for (const chapter of group.chapters) {
            const chapterStats = {
              name: chapter.name,
              details: [{}],
            };

            let chapterTotalDone = 0;
            const totalExpectedChapterRecords = totalStudents;

            const processScoreForChapter = (type) => {
              const chapterRecords = filledRecords.filter(
                (r) => r.type === type && r.chapter_id === chapter.id
              );
              const doneRecordsCount = chapterRecords.length;
              const undoneRecordsCount =
                totalExpectedChapterRecords - doneRecordsCount;
              const doneStudentIds = new Set(
                chapterRecords.map((r) => r.student_id)
              );
              const doneStudents = chapterRecords.map((r) => ({
                student: r.student_name,
              }));
              const undoneStudents = allStudents
                .filter((s) => !doneStudentIds.has(s.id))
                .map((s) => ({ student: s.name }));
              return {
                done: doneRecordsCount,
                undone: undoneRecordsCount,
                detail: { done: doneStudents, undone: undoneStudents },
                totalDone: doneRecordsCount,
              };
            };

            // --- KALKULASI GLOBAL ---
            const attitudeDetails = processScoreForChapter("attitude");
            chapterTotalDone += attitudeDetails.totalDone;
            globalTotalTasks += totalExpectedChapterRecords;

            const formativeDetails = processScoreForChapter("formative");
            chapterTotalDone += formativeDetails.totalDone;
            globalTotalTasks += totalExpectedChapterRecords;

            const summativeDetails = processScoreForChapter("summative");
            chapterTotalDone += summativeDetails.totalDone;
            globalTotalTasks += totalExpectedChapterRecords;

            globalCompletedTasks += chapterTotalDone;

            // --- PEMBUATAN STATS DETAIL ---
            if (isPagedTeacher) {
              chapterStats.details[0].attitude = [
                {
                  done: attitudeDetails.done,
                  undone: attitudeDetails.undone,
                  detail: attitudeDetails.detail,
                },
              ];
              chapterStats.details[0].formative = [
                {
                  done: formativeDetails.done,
                  undone: formativeDetails.undone,
                  detail: formativeDetails.detail,
                },
              ];
              chapterStats.details[0].summative = [
                {
                  done: summativeDetails.done,
                  undone: summativeDetails.undone,
                  detail: summativeDetails.detail,
                },
              ];
              classChapters.push(chapterStats);
            }
          } // End Chapter Loop

          if (isPagedTeacher && classChapters.length > 0) {
            subjectDetails.push({
              classes: classSubjectName,
              chapters: classChapters,
            });
          }
        } // End Class Loop

        if (isPagedTeacher && subjectDetails.length > 0) {
          teacherSubjects.push({
            name: subjectGroup.name,
            details: subjectDetails,
          });
        }
      } // End Subject Loop

      // Simpan stats guru yang dipaginasi ke Map
      if (isPagedTeacher) {
        const teacherName = teachers.find(
          (t) => t.teacher_id === currentTeacherId
        ).teacher_name;

        // Hanya set jika belum diset oleh 'PERBAIKAN' di atas
        if (!pagedTeacherStats.has(currentTeacherId)) {
          pagedTeacherStats.set(currentTeacherId, {
            name: teacherName,
            subjects: teacherSubjects,
          });
        }
      }
    } // End SEMUA Teacher Loop

    // 5. Hitung total komplitasi (Completeness) GLOBAL
    const completenessPercentage =
      globalTotalTasks > 0
        ? (globalCompletedTasks / globalTotalTasks) * 100
        : 0;
    const completeness = `${completenessPercentage.toFixed(2)}%`;

    // 6. Bangun array statistics Paginasi dalam urutan yang benar
    //    Kita HAPUS .filter(Boolean) agar guru dengan data kosong tetap tampil
    const statistics = teachers.map((t) => pagedTeacherStats.get(t.teacher_id));

    // 7. Kirim respons
    res.status(200).json({
      statistics: statistics, // <-- Data Paginasi
      completeness: completeness, // <-- Data Global
      pagination: {
        total: parseInt(totalRecords),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
