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
// Pembobotan
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

// Get comprehensive recap data for all students in a class
router.get("/recap", authorize("teacher", "admin"), async (req, res) => {
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

    // Convert Indonesian month name to month number
    const currentMonth = getMonthNumber(month);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const query = `
      WITH student_data AS (
        SELECT 
          us.id as student_id,
          us.name as student_name,
          us.nis,
          cs.classid
        FROM cl_students cs
        JOIN u_students us ON cs.student = us.id
        WHERE cs.classid = $1 AND cs.periode = $2
      ),
      attendance_data AS (
        SELECT 
          la.studentid,
          COUNT(CASE WHEN la.note = 'Hadir' THEN 1 END) as hadir_count,
          COUNT(la.id) as total_days,
          CASE 
            WHEN COUNT(la.id) > 0 THEN 
              ROUND((COUNT(CASE WHEN la.note = 'Hadir' THEN 1 END)::DECIMAL / COUNT(la.id)::DECIMAL) * 100, 2)
            ELSE 0 
          END as attendance_percentage
        FROM l_attendance la
        WHERE la.classid = $1 
          AND la.subjectid = $3
          AND EXTRACT(MONTH FROM la.day_date) = $4
          AND EXTRACT(YEAR FROM la.day_date) = $5
          AND la.periode = $2
        GROUP BY la.studentid
      ),
      attitude_data AS (
        SELECT 
          lat.student_id,
          lat.rata_rata as attitude_average,
          lat.catatan_guru
        FROM l_attitude lat
        WHERE lat.class_id = $1 
          AND lat.subject_id = $3
          AND lat.chapter_id = $6
          AND lat.month = $7
          AND lat.semester = $8
          AND lat.periode_id = $2
      ),
      formative_data AS (
        SELECT 
          lf.student_id,
          lf.rata_rata as formative_average
        FROM l_formative lf
        WHERE lf.class_id = $1 
          AND lf.subject_id = $3
          AND lf.chapter_id = $6
          AND lf.month = $7
          AND lf.semester = $8
          AND lf.periode_id = $2
      ),
      summative_data AS (
        SELECT 
          ls.student_id,
          ls.rata_rata as summative_average
        FROM l_summative ls
        WHERE ls.class_id = $1 
          AND ls.subject_id = $3
          AND ls.chapter_id = $6
          AND ls.month = $7
          AND ls.semester = $8
          AND ls.periode_id = $2
      )
      SELECT 
        sd.student_id,
        sd.student_name,
        sd.nis,
        COALESCE(ad.attendance_percentage, 0) as kehadiran,
        COALESCE(atd.attitude_average, 0) as sikap,
        COALESCE(fd.formative_average, 0) as formatif,
        COALESCE(smd.summative_average, 0) as sumatif,
        atd.catatan_guru as catatan,
        ROUND(
          (COALESCE(ad.attendance_percentage, 0) + COALESCE(atd.attitude_average, 0) + 
           COALESCE(fd.formative_average, 0) + COALESCE(smd.summative_average, 0)) / 4.0, 2
        ) as rata_rata
      FROM student_data sd
      LEFT JOIN attendance_data ad ON sd.student_id = ad.studentid
      LEFT JOIN attitude_data atd ON sd.student_id = atd.student_id
      LEFT JOIN formative_data fd ON sd.student_id = fd.student_id
      LEFT JOIN summative_data smd ON sd.student_id = smd.student_id
      ORDER BY sd.student_name
    `;

    const result = await client.query(query, [
      classid,
      periodeid,
      subjectid,
      currentMonth,
      currentYear,
      chapterid,
      month, // Use original month name for attitude/formative/summative tables
      semester,
    ]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==========================
// Teacher Completion Report
// ==========================

router.get(
  "/teacher-completion-status",
  authorize("admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      let { month, page = 1, limit = 10, search = "", categoryId } = req.query;

      // Sanitasi input untuk mencegah error
      if (categoryId === "null" || categoryId === "undefined" || !categoryId) {
        categoryId = null;
      }
      if (!month) {
        return res.status(400).json({ message: "Month parameter is required" });
      }

      const homebase = req.user.homebase;
      const periodeid = await getActivePeriode(client, homebase);
      if (!periodeid) {
        return res.status(400).json({ message: "No active periode found" });
      }

      const monthNumber = getMonthNumber(month);
      const offset = (page - 1) * limit;

      // 1. PASTIKAN QUERY INI DIGUNAKAN
      // Query ini menghitung total data terlebih dahulu di dalam CTE 'total_count'
      const query = `
        WITH filtered_teachers AS (
          SELECT DISTINCT ut.id, ut.name
          FROM u_teachers ut
          JOIN at_subject ats ON ut.id = ats.teacher
          JOIN a_subject s ON ats.subject = s.id
          WHERE s.homebase = $1
            AND ut.name ILIKE $5
            AND ($6::INTEGER IS NULL OR s.categoryid = $6::INTEGER)
        ),
        total_count AS (
            -- Menghitung jumlah total guru yang telah difilter
            SELECT COUNT(*) as total FROM filtered_teachers
        )
        SELECT
          t.name as teacher,
          EXISTS (
            SELECT 1 FROM l_formative lf
            WHERE lf.teacher_id = t.id AND lf.month = $2 AND lf.periode_id = $3
          ) as formative,
          EXISTS (
            SELECT 1 FROM l_summative ls
            WHERE ls.teacher_id = t.id AND ls.month = $2 AND ls.periode_id = $3
          ) as summative,
          EXISTS (
            SELECT 1 FROM l_attendance la
            WHERE la.subjectid IN (SELECT subject FROM at_subject WHERE teacher = t.id)
              AND EXTRACT(MONTH FROM la.day_date) = $4 AND la.periode = $3
          ) as present,
          -- Mengambil nilai total untuk dikirim ke frontend
          (SELECT total FROM total_count) as total_records
        FROM filtered_teachers t
        ORDER BY t.name
        LIMIT $7 OFFSET $8;
      `;

      const params = [
        homebase,
        month,
        periodeid,
        monthNumber,
        `%${search}%`,
        categoryId,
        limit,
        offset,
      ];
      const result = await client.query(query, params);
      const statistics = result.rows;

      // 2. PASTIKAN TOTAL DATA DIAMBIL DENGAN BENAR
      // Ambil total_records dari baris pertama. Jika tidak ada data, totalnya 0.
      const totalRecords =
        result.rows.length > 0 ? result.rows[0].total_records : 0;

      // Hapus properti total_records dari setiap item agar tidak mengganggu data tabel
      statistics.forEach((s) => delete s.total_records);

      const totalTasks = statistics.length * 3;
      let completedTasks = 0;
      statistics.forEach((teacher) => {
        if (teacher.present) completedTasks++;
        if (teacher.summative) completedTasks++;
        if (teacher.formative) completedTasks++;
      });

      const completenessPercentage =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const completeness = `${completenessPercentage.toFixed(2)}%`;

      // 3. PASTIKAN STRUKTUR RESPON JSON SEPERTI INI
      // Kirim 'statistics' dan 'pagination' sebagai objek terpisah
      res.status(200).json({
        statistics: statistics,
        completeness: completeness,
        pagination: {
          total: parseInt(totalRecords),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ==========================
// Parent Monthly Reports
// ==========================

// Get student's monthly report for parent
router.get("/parent-monthly-report", authorize("parent"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { month, semester } = req.query;
    const parentId = req.user.id;

    if (!month || !semester) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Get student info from parent
    const studentQuery = `
      SELECT 
        us.id as student_id,
        us.name as student_name,
        us.nis,
        ac.id as class_id,
        ac.name as class_name,
        ag.name as grade_name,
        ap.name as periode_name,
        ut.name as homeroom_teacher,
        ah.id as homebase_id,
        ah.name as homebase_name
      FROM u_parents up
      JOIN u_students us ON up.studentid = us.id
      JOIN cl_students cs ON us.id = cs.student
      JOIN a_class ac ON cs.classid = ac.id
      JOIN a_grade ag ON ac.grade = ag.id
      JOIN a_periode ap ON cs.periode = ap.id
      JOIN a_homebase ah ON us.homebase = ah.id
      LEFT JOIN u_teachers ut ON ac.id = ut.class
      WHERE up.id = $1 AND ap.isactive = true
    `;

    const studentResult = await client.query(studentQuery, [parentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentResult.rows[0];

    if (!student.homebase_id) {
      return res.status(400).json({ message: "Student homebase not found" });
    }

    const periodeId = await getActivePeriode(client, student.homebase_id);

    if (!periodeId) {
      return res.status(400).json({ message: "No active periode found" });
    }

    // Get all subjects for the student's class
    const subjectsQuery = `
      SELECT DISTINCT 
        s.id as subject_id,
        s.name as subject_name,
        s.cover as subject_cover,
        ut.name as teacher_name
      FROM a_subject s
      JOIN at_subject ats ON s.id = ats.subject
      JOIN u_teachers ut ON ats.teacher = ut.id
      JOIN at_class atc ON ut.id = atc.teacher_id
      WHERE atc.class_id = $1 AND s.homebase = $2
      ORDER BY s.name
    `;

    const subjectsResult = await client.query(subjectsQuery, [
      student.class_id,
      student.homebase_id,
    ]);

    let subjects = subjectsResult.rows;

    // Fallback: if no subjects found, get all subjects from homebase
    if (subjects.length === 0) {
      const fallbackSubjectsQuery = `
        SELECT DISTINCT 
          s.id as subject_id,
          s.name as subject_name,
          s.cover as subject_cover,
          'Guru Mata Pelajaran' as teacher_name
        FROM a_subject s
        WHERE s.homebase = $1
        ORDER BY s.name
      `;

      const fallbackResult = await client.query(fallbackSubjectsQuery, [
        student.homebase_id,
      ]);
      subjects = fallbackResult.rows;
    }

    const reportData = [];

    // Get data for each subject
    for (const subject of subjects) {
      // Get attitude data
      const attitudeQuery = `
        SELECT 
          kinerja,
          kedisiplinan,
          keaktifan,
          percaya_diri,
          catatan_guru,
          rata_rata
        FROM l_attitude
        WHERE student_id = $1 
          AND subject_id = $2 
          AND month = $3 
          AND semester = $4 
          AND periode_id = $5
      `;

      const attitudeResult = await client.query(attitudeQuery, [
        student.student_id,
        subject.subject_id,
        month,
        semester,
        periodeId,
      ]);

      // Get chapter/topic data and chapter_id first
      const chapterQuery = `
        SELECT 
          lc.id as chapter_id,
          lc.title as topic,
          lc.target as target_description
        FROM l_chapter lc
        WHERE lc.subject = $1
        ORDER BY lc.order_number
        LIMIT 1
      `;

      const chapterResult = await client.query(chapterQuery, [
        subject.subject_id,
      ]);

      // Get formative data - try to find any formative scores for this subject
      let formativeResult;

      // First, try to get any formative scores for this subject regardless of chapter
      const formativeQueryAny = `
        SELECT 
          f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8,
          rata_rata
        FROM l_formative
        WHERE student_id = $1 
          AND subject_id = $2 
          AND month = $3 
          AND semester = $4 
          AND periode_id = $5
        ORDER BY chapter_id
        LIMIT 1
      `;

      formativeResult = await client.query(formativeQueryAny, [
        student.student_id,
        subject.subject_id,
        month,
        semester,
        periodeId,
      ]);

      // If we found formative data, also try with specific chapter_id for better accuracy
      if (
        formativeResult.rows.length === 0 &&
        chapterResult.rows[0] &&
        chapterResult.rows[0].chapter_id
      ) {
        const formativeQueryWithChapter = `
          SELECT 
            f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8,
            rata_rata
          FROM l_formative
          WHERE student_id = $1 
            AND subject_id = $2 
            AND chapter_id = $3
            AND month = $4 
            AND semester = $5 
            AND periode_id = $6
        `;

        formativeResult = await client.query(formativeQueryWithChapter, [
          student.student_id,
          subject.subject_id,
          chapterResult.rows[0].chapter_id,
          month,
          semester,
          periodeId,
        ]);
      }

      // Get summative data
      const summativeQuery = `
        SELECT 
          oral,
          written,
          project,
          performance,
          rata_rata
        FROM l_summative
        WHERE student_id = $1 
          AND subject_id = $2 
          AND month = $3 
          AND semester = $4 
          AND periode_id = $5
      `;

      const summativeResult = await client.query(summativeQuery, [
        student.student_id,
        subject.subject_id,
        month,
        semester,
        periodeId,
      ]);

      // Get attendance data
      const attendanceQuery = `
        SELECT 
          COUNT(CASE WHEN note = 'Hadir' THEN 1 END) as hadir,
          COUNT(CASE WHEN note = 'Sakit' THEN 1 END) as sakit,
          COUNT(CASE WHEN note = 'Ijin' THEN 1 END) as ijin,
          COUNT(CASE WHEN note = 'Alpa' THEN 1 END) as alpa,
          COUNT(*) as total
        FROM l_attendance
        WHERE studentid = $1 
          AND subjectid = $2 
          AND EXTRACT(MONTH FROM day_date) = $3
          AND periode = $4
      `;

      const attendanceResult = await client.query(attendanceQuery, [
        student.student_id,
        subject.subject_id,
        getMonthNumber(month),
        periodeId,
      ]);

      const attitude = attitudeResult.rows[0] || null;
      const formative = formativeResult.rows[0] || null;
      const summative = summativeResult.rows[0] || null;

      // Only include subjects that have at least one type of score
      const hasAttitudeScore =
        attitude &&
        (attitude.kinerja !== null ||
          attitude.kedisiplinan !== null ||
          attitude.keaktifan !== null ||
          attitude.percaya_diri !== null);

      const hasFormativeScore =
        formative &&
        (formative.f_1 !== null ||
          formative.f_2 !== null ||
          formative.f_3 !== null ||
          formative.f_4 !== null ||
          formative.f_5 !== null ||
          formative.f_6 !== null ||
          formative.f_7 !== null ||
          formative.f_8 !== null);

      const hasSummativeScore =
        summative &&
        (summative.oral !== null ||
          summative.written !== null ||
          summative.project !== null ||
          summative.performance !== null);

      // Only add subject if it has at least one type of score
      if (hasAttitudeScore || hasFormativeScore || hasSummativeScore) {
        const subjectData = {
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          subject_cover: subject.subject_cover,
          teacher_name: subject.teacher_name,
          attitude: attitude,
          formative: formative,
          summative: summative,
          attendance: attendanceResult.rows[0] || null,
          chapter: chapterResult.rows[0] || null,
        };

        reportData.push(subjectData);
      }
    }

    const response = {
      report_period: {
        month: month,
        semester: semester,
        academic_year: `${new Date().getFullYear()}/${
          new Date().getFullYear() + 1
        }`,
      },
      subjects: reportData,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Get available months for parent
router.get(
  "/parent-available-months",
  authorize("parent"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const parentId = req.user.id;

      // Get student info from parent
      const studentQuery = `
        SELECT 
          us.id as student_id,
          ah.id as homebase_id,
          ah.name as homebase_name
        FROM u_parents up
        JOIN u_students us ON up.studentid = us.id
        JOIN a_homebase ah ON us.homebase = ah.id
        WHERE up.id = $1
      `;

      const studentResult = await client.query(studentQuery, [parentId]);
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = studentResult.rows[0];

      if (!student.homebase_id) {
        return res.status(400).json({ message: "Student homebase not found" });
      }

      const periodeId = await getActivePeriode(client, student.homebase_id);

      if (!periodeId) {
        return res.status(400).json({ message: "No active periode found" });
      }

      // Get available months from attitude table
      const monthsQuery = `
      SELECT month, semester FROM (
        SELECT DISTINCT 
          month,
          semester
        FROM l_attitude
        WHERE student_id = $1 AND periode_id = $2
      ) subquery
      ORDER BY semester, 
        CASE month
          WHEN 'Januari' THEN 1
          WHEN 'Februari' THEN 2
          WHEN 'Maret' THEN 3
          WHEN 'April' THEN 4
          WHEN 'Mei' THEN 5
          WHEN 'Juni' THEN 6
          WHEN 'Juli' THEN 7
          WHEN 'Agustus' THEN 8
          WHEN 'September' THEN 9
          WHEN 'Oktober' THEN 10
          WHEN 'November' THEN 11
          WHEN 'Desember' THEN 12
        END
    `;

      const monthsResult = await client.query(monthsQuery, [
        student.student_id,
        periodeId,
      ]);

      res.status(200).json(monthsResult.rows);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
