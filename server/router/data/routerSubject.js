import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// Konversi URL ke path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = express.Router();

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./server/assets/lms/cover";
    // Buat direktori jika belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(
      null,
      req.body.name.replace(/\s+/g, "_") +
        "_" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB
  },
});

// ==================== GET ENDPOINTS ====================

// Get mata pelajaran dengan paginasi dan pencarian
router.get("/get-subjects", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    if (!page && !limit) {
      const query = `
				SELECT 
					s.id,
					s.name,
					s.cover,
          c.name AS category_name,
          c.id AS category_id,
          b.name AS branch_name,
          b.id AS branch_id,
					COALESCE(json_agg(
						json_build_object(
							'name', t.name,
							'chapters', (
								SELECT COUNT(DISTINCT ch.id)
								FROM l_chapter ch
								WHERE ch.teacher = t.id AND ch.subject = s.id
							),
							'contents', (
								SELECT COUNT(DISTINCT c.id)
								FROM l_chapter ch
								JOIN l_content c ON c.chapter = ch.id
								WHERE ch.teacher = t.id AND ch.subject = s.id
							),
							'class', (
								SELECT json_agg(
									json_build_object(
										'id', cl.id,
										'name', cl.name
									)
								)
								FROM (
									SELECT DISTINCT ON (cl.id) cl.id, cl.name
									FROM l_chapter ch
									JOIN l_cclass lc ON lc.chapter = ch.id
									JOIN a_class cl ON cl.id = lc.classid
									WHERE ch.teacher = t.id AND ch.subject = s.id
								) cl
							)
						)
					) FILTER (WHERE t.id IS NOT NULL), '[]') as teachers
				FROM a_subject s
				LEFT JOIN at_subject ats ON ats.subject = s.id
				LEFT JOIN u_teachers t ON t.id = ats.teacher
        LEFT JOIN a_category c ON c.id = s.categoryid
        LEFT JOIN a_branch b ON b.id = s.branchid
				WHERE s.homebase = $1
				GROUP BY s.id, s.name, s.cover, c.name, c.id, b.name, b.id
			`;
      const data = await client.query(query, [homebase]);
      return res.status(200).json(data.rows);
    }

    const countQuery = `
			SELECT COUNT(DISTINCT s.id) 
			FROM a_subject s
			WHERE s.homebase = $1 AND s.name ILIKE $2
		`;

    const dataQuery = `
			SELECT 
				s.id,
				s.name,
				s.cover,
        c.name AS category_name,
        c.id AS category_id,
        b.name AS branch_name,
        b.id AS branch_id,
				COALESCE(json_agg(
					json_build_object(
						'name', t.name,
						'chapters', (
							SELECT COUNT(DISTINCT ch.id)
							FROM l_chapter ch
							WHERE ch.teacher = t.id AND ch.subject = s.id
						),
						'contents', (
							SELECT COUNT(DISTINCT c.id)
							FROM l_chapter ch
							JOIN l_content c ON c.chapter = ch.id
							WHERE ch.teacher = t.id AND ch.subject = s.id
						),
						'class', (
							SELECT json_agg(
								json_build_object(
									'id', cl.id,
									'name', cl.name
								)
							)
							FROM (
								SELECT DISTINCT ON (cl.id) cl.id, cl.name
								FROM l_chapter ch
								JOIN l_cclass lc ON lc.chapter = ch.id
								JOIN a_class cl ON cl.id = lc.classid
								WHERE ch.teacher = t.id AND ch.subject = s.id
							) cl
						)
					)
				) FILTER (WHERE t.id IS NOT NULL), '[]') as teachers
			FROM a_subject s
			LEFT JOIN at_subject ats ON ats.subject = s.id
			LEFT JOIN u_teachers t ON t.id = ats.teacher
      LEFT JOIN a_category c ON c.id = s.categoryid
      LEFT JOIN a_branch b ON b.id = s.branchid
			WHERE s.homebase = $1 AND s.name ILIKE $2
			GROUP BY s.id, s.name, s.cover, c.name, c.id, b.name, b.id
			ORDER BY s.name ASC
			LIMIT $3 OFFSET $4
		`;

    const [count, data] = await Promise.all([
      client.query(countQuery, [homebase, `%${search}%`]),
      client.query(dataQuery, [homebase, `%${search}%`, limit, offset]),
    ]);

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);
    const subjects = data.rows;

    res.status(200).json({ totalData, totalPages, subjects });
  } catch (error) {
    console.error("Error getting subjects:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Get detail mata pelajaran
router.get("/get-subject-detail", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    const query = `
			SELECT 
				s.id,
				s.name,
				COALESCE(json_agg(
					json_build_object(
						'id', ch.id,
						'name', ch.title,
						'target', ch.target,
						'teacher', t.name,
						'contents', (
							SELECT COALESCE(json_agg(
								json_build_object(
									'id', c.id,
									'name', c.title,
									'target', c.target,
									'files', (
										SELECT COALESCE(json_agg(
											json_build_object(
												'id', f.id,
												'file', f.file
											)
										) FILTER (WHERE f.file IS NOT NULL), '[]')
										FROM l_file f
										WHERE f.content = c.id
									),
									'videos', (
										SELECT COALESCE(json_agg(
											json_build_object(
												'id', f.id,
												'video', f.video
											)
										) FILTER (WHERE f.video IS NOT NULL), '[]')
										FROM l_file f
										WHERE f.content = c.id
									)
								)
							) FILTER (WHERE c.id IS NOT NULL), '[]')
							FROM l_content c
							WHERE c.chapter = ch.id
						)
					)
				) FILTER (WHERE ch.id IS NOT NULL), '[]') as chapters
			FROM a_subject s
			LEFT JOIN l_chapter ch ON ch.subject = s.id
			LEFT JOIN u_teachers t ON t.id = ch.teacher
			WHERE s.id = $1 AND s.homebase = $2
			GROUP BY s.id, s.name
		`;

    const data = await client.query(query, [id, homebase]);

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.status(200).json(data.rows[0]);
  } catch (error) {
    console.error("Error getting subject detail:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==================== POST ENDPOINTS ====================

// Tambah atau update mata pelajaran
router.post(
  "/add-subject",
  authorize("admin"),
  upload.single("cover"),
  async (req, res) => {
    // Pastikan variabel pesan didefinisikan
    const create = "Pelajaran berhasil ditambahkan";
    const update = "Pelajaran berhasil diperbarui";
    const client = await pool.connect();

    try {
      const { id, name, categoryid, branchid } = req.body;
      const homebase = req.user.homebase;

      await client.query("BEGIN");

      let subjectid;
      // --- LOGIKA UTAMA ---
      if (id) {
        // 1. Jika ID ada (mode update), cukup update data teks terlebih dahulu.
        //    Jangan sentuh file sama sekali di tahap ini.
        await client.query(
          `UPDATE a_subject SET name = $1, categoryid = $2, branchid = $3
           WHERE id = $4 AND homebase = $5`,
          [name, categoryid, branchid, id, homebase]
        );
        subjectid = id;
      } else {
        // 2. Jika tidak ada ID (mode create), buat data baru.
        const data = await client.query(
          `INSERT INTO a_subject(homebase, name, categoryid, branchid)
          VALUES ($1, $2, $3, $4) RETURNING id`,
          [homebase, name, categoryid, branchid]
        );
        subjectid = data.rows[0].id;
      }

      // --- LOGIKA PENANGANAN FILE (SETELAH CREATE/UPDATE DATA TEKS) ---
      // 3. Cek apakah ada file BARU yang diunggah.
      if (req.file) {
        // Jika ada file baru, baru kita proses penghapusan file lama (jika ada).
        if (id) {
          // Pastikan ini adalah operasi update
          const oldSubject = await client.query(
            "SELECT cover FROM a_subject WHERE id = $1",
            [id]
          );

          if (oldSubject.rows.length > 0 && oldSubject.rows[0].cover) {
            const coverPath = oldSubject.rows[0].cover;
            const fileName = path.basename(coverPath);
            const filePath = path.join(
              __dirname,
              "../../assets/lms/cover",
              fileName
            );

            // Hapus file lama dengan aman
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }

        // 4. Setelah file lama (jika ada) dihapus, update database dengan path file BARU.
        const image = `/assets/lms/cover/${req.file.filename}`;
        await client.query(`UPDATE a_subject SET cover = $1 WHERE id = $2`, [
          image,
          subjectid,
        ]);
      }
      // 5. Jika req.file tidak ada, tidak ada operasi file yang dilakukan.
      //    Data cover yang lama di database dan di filesystem akan tetap utuh.

      await client.query("COMMIT");
      res.status(200).json({ message: id ? update : create });
    } catch (error) {
      await client.query("ROLLBACK");
      // Hapus file yang baru diunggah jika terjadi error
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Error managing subject:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    } finally {
      client.release();
    }
  }
);

// Upload mata pelajaran
router.post(
  "/upload-subjects",
  authorize("admin"),
  upload.single("file"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const homebase = req.user.homebase;

      if (!req.file) {
        return res.status(400).json({ message: "File tidak ditemukan" });
      }

      // Read and parse CSV file
      const fileContent = fs.readFileSync(req.file.path, "utf-8");
      const rows = fileContent
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));

      // Validate header
      const header = rows[0];
      if (header[0].toLowerCase() !== "name") {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Format file tidak sesuai" });
      }

      await client.query("BEGIN");

      // Process each row
      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 1 || !row[0]) continue; // Skip empty rows

        try {
          const name = row[0];

          // Check if subject already exists
          const existingSubject = await client.query(
            "SELECT id FROM a_subject WHERE homebase = $1 AND name = $2",
            [homebase, name]
          );

          if (existingSubject.rows.length > 0) {
            results.failed++;
            results.errors.push(`Mata pelajaran "${name}" sudah ada`);
            continue;
          }

          // Insert new subject
          await client.query(
            "INSERT INTO a_subject (homebase, name) VALUES ($1, $2)",
            [homebase, name]
          );

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error pada baris ${i + 1}: ${error.message}`);
        }
      }

      await client.query("COMMIT");
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        message: "Upload selesai",
        results,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Error uploading subjects:", error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ==================== DELETE ENDPOINTS ====================

// Hapus mata pelajaran
router.delete("/delete-subject", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    await client.query("BEGIN");

    // Ambil informasi cover sebelum menghapus
    const subject = await client.query(
      "SELECT cover FROM a_subject WHERE id = $1 AND homebase = $2",
      [id, homebase]
    );

    if (subject.rows.length > 0 && subject.rows[0].cover) {
      const coverPath = subject.rows[0].cover;
      const fileName = path.basename(coverPath);
      const filePath = path.join(__dirname, "../../assets/lms/cover", fileName);

      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error deleting cover file:", error);
      }
    }

    await client.query(
      "DELETE FROM a_subject WHERE id = $1 AND homebase = $2",
      [id, homebase]
    );

    await client.query("COMMIT");
    res.json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting subject:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ================ CATEGORY ENDPOINTS ========================
// GET
router.get("/get-categories", authorize("admin"), async (req, res) => {
  // Deklarasikan client di luar try-catch agar bisa diakses di blok finally
  let client;

  try {
    client = await pool.connect();

    const { page, limit, search } = req.query;
    const homebase = req.user.homebase;

    let queryParams = [homebase];
    let baseQuery = `FROM a_category WHERE homebase = $1`;
    let searchQuery = "";

    if (search) {
      queryParams.push(`%${search}%`);

      searchQuery = ` AND name ILIKE $${queryParams.length}`;
    }

    const totalDataQuery = `SELECT COUNT(*) ${baseQuery}${searchQuery}`;
    const totalDataResult = await client.query(totalDataQuery, queryParams);
    const totalData = parseInt(totalDataResult.rows[0].count, 10);

    let dataQuery = `SELECT * ${baseQuery}${searchQuery} ORDER BY createdat DESC`;

    if (page && limit) {
      const pageInt = parseInt(page, 10);
      const limitInt = parseInt(limit, 10);
      const offset = (pageInt - 1) * limitInt;

      queryParams.push(limitInt, offset);
      dataQuery += ` LIMIT $${queryParams.length - 1} OFFSET $${
        queryParams.length
      }`;

      const dataResult = await client.query(dataQuery, queryParams);
      const categories = dataResult.rows;

      res.status(200).json({
        totalData: totalData,
        totalPages: limit ? Math.ceil(totalData / parseInt(limit, 10)) : 1,
        categories,
      });
    } else {
      const dataResult = await client.query(dataQuery, queryParams);
      const categories = dataResult.rows;

      res.status(200).json(categories);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({ message: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// ADD
router.post("/add-category", authorize("admin"), async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { id, name } = req.body;
    const { homebase } = req.user;

    // Validasi input
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nama Wajib diisi" });
    }

    let result;
    let statusCode = 200; // Default status for update

    if (id) {
      // --- LOGIKA UPDATE ---
      const updateQuery = `
                UPDATE a_category 
                SET name = $1 
                WHERE id = $2 AND homebase = $3 
                RETURNING *`;
      result = await client.query(updateQuery, [name, id, homebase]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Data tidak ditemukan",
        });
      }
    } else {
      // --- LOGIKA CREATE ---
      const insertQuery = `
                INSERT INTO a_category (name, homebase) 
                VALUES ($1, $2) 
                RETURNING *`;
      result = await client.query(insertQuery, [name, homebase]);
      statusCode = 201; // 201 Created for new resource
    }

    res.status(statusCode).json({ message: id ? update : create });
  } catch (error) {
    console.error("Error saving category:", error);
    res.status(500).json({ message: error.message });
  } finally {
    if (client) client.release();
  }
});

// DELETE
router.delete("/delete-category", authorize("admin"), async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { id } = req.query;
    const { homebase } = req.user;

    const deleteQuery = `
            DELETE FROM a_category 
            WHERE id = $1 AND homebase = $2`;

    const result = await client.query(deleteQuery, [id, homebase]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.status(200).json({ message: remove });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: error.message });
  } finally {
    if (client) client.release();
  }
});

// ================ BRANCH ENDPOINTS ==========================
// GET
router.get("/get-branches", authorize("admin"), async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { page, limit, search } = req.query;
    const { homebase } = req.user;

    let queryParams = [homebase];
    let baseQuery = `FROM a_branch WHERE homebase = $1`;
    let searchQuery = "";

    if (search) {
      queryParams.push(`%${search}%`);
      searchQuery = ` AND name ILIKE $${queryParams.length}`;
    }

    const totalDataQuery = `SELECT COUNT(*) ${baseQuery}${searchQuery}`;
    const totalDataResult = await client.query(totalDataQuery, queryParams);
    const totalData = parseInt(totalDataResult.rows[0].count, 10);

    let dataQuery = `SELECT * ${baseQuery}${searchQuery} ORDER BY createdat DESC`;

    if (page && limit) {
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      queryParams.push(parseInt(limit, 10), offset);
      dataQuery += ` LIMIT $${queryParams.length - 1} OFFSET $${
        queryParams.length
      }`;

      const dataResult = await client.query(dataQuery, queryParams);

      res.status(200).json({
        totalData: totalData,
        totalPages: limit ? Math.ceil(totalData / parseInt(limit, 10)) : 1,
        branches: dataResult.rows,
      });
    } else {
      const dataResult = await client.query(dataQuery, queryParams);
      const branches = dataResult.rows;

      res.status(200).json(branches);
    }
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: error.message });
  } finally {
    if (client) client.release();
  }
});

// ADD
router.post("/add-branch", authorize("admin"), async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { name, id } = req.body;
    const { homebase } = req.user;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nama wajib diisi" });
    }

    let result;
    let statusCode = 200; // Status default untuk operasi update

    if (id) {
      // --- LOGIKA UPDATE JIKA ADA ID ---
      const updateQuery = `
                UPDATE a_branch 
                SET name = $1 
                WHERE id = $2 AND homebase = $3 
                RETURNING *`; // Mengembalikan data yang sudah diupdate

      result = await client.query(updateQuery, [name, id, homebase]);

      // Cek jika tidak ada baris yang ter-update (ID salah atau bukan milik homebase tsb)
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
    } else {
      // --- LOGIKA CREATE JIKA TIDAK ADA ID ---
      const insertQuery = `
                INSERT INTO a_branch (name, homebase) 
                VALUES ($1, $2) 
                RETURNING *`; // Mengembalikan data yang baru dibuat

      result = await client.query(insertQuery, [name, homebase]);
      statusCode = 201; // Status 201 Created untuk resource baru
    }

    // Kirim response sukses
    res.status(statusCode).json({
      message: id ? update : create,
    });
  } catch (error) {
    console.error("Error creating branch:", error);
    res.status(500).json({ message: error });
  } finally {
    if (client) client.release();
  }
});

// DELETE
router.delete("/delete-branch", authorize("admin"), async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { id } = req.query;
    const { homebase } = req.user;

    const deleteQuery = `
            DELETE FROM a_branch 
            WHERE id = $1 AND homebase = $2`;

    const result = await client.query(deleteQuery, [id, homebase]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.status(200).json({ message: remove });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({ message: error.message });
  } finally {
    if (client) client.release();
  }
});

export default router;
