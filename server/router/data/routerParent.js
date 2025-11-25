import { Router } from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import bcrypt from "bcrypt";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = Router();

router.get("/get-parents", authorize("admin"), async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT * FROM a_periode 
      WHERE isactive = true AND homebase = $1`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    // Hitung total data
    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM u_parents p
      JOIN u_students s ON p.studentid = s.id
      JOIN cl_students cs ON cs.student = s.id
      JOIN a_class c ON cs.classid = c.id
      JOIN a_grade g ON c.grade = g.id
      WHERE cs.homebase = $1
        AND (
          s.name ILIKE $2
          OR s.nis::text ILIKE $2
          OR p.name ILIKE $2
          OR p.email ILIKE $2
        ) AND cs.periode = $3
    `;
    const totalResult = await client.query(totalQuery, [
      homebase,
      `%${search}%`,
      activePeriode,
    ]);
    const total = totalResult.rows[0].total;

    // Ambil data dengan urutan grade -> class -> student_name
    const query = `
      SELECT 
        s.name AS student_name,
        s.nis AS nis,
        g.name AS grade,
        c.name AS class,
        p.name AS parent_name,
        p.email AS parent_email,
        p.id AS parent_id
      FROM u_parents p
      JOIN u_students s ON p.studentid = s.id
      JOIN cl_students cs ON cs.student = s.id
      JOIN a_class c ON cs.classid = c.id
      JOIN a_grade g ON c.grade = g.id
      WHERE cs.homebase = $1
        AND (
          s.name ILIKE $2
          OR s.nis::text ILIKE $2
          OR p.name ILIKE $2
          OR p.email ILIKE $2
        ) AND cs.periode = $3
      ORDER BY g.name ASC, c.name ASC, s.name ASC
      LIMIT $4 OFFSET $5
    `;
    const result = await client.query(query, [
      homebase,
      `%${search}%`,
      activePeriode,
      limit,
      offset,
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      totalPages,
      totalData: parseInt(total),
      data: result.rows,
    });

    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// POST (Create or Update) a parent
router.post("/add-parent", authorize("admin"), async (req, res) => {
  const { id, nis, email, name } = req.body;

  // Validasi input dasar
  if (!email || !name) {
    return res.status(400).json({ message: "Email dan nama wajib diisi." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- SKENARIO 2: UPDATE DATA JIKA ADA ID ---
    if (id) {
      // Cek konflik email (pastikan email baru tidak dipakai oleh user lain)
      const emailConflict = await client.query(
        "SELECT id FROM u_parents WHERE email = $1 AND id != $2",
        [email, id]
      );
      if (emailConflict.rows.length > 0) {
        return res
          .status(409)
          .json({ message: "Email sudah digunakan oleh akun lain." });
      }

      // Lakukan update
      const result = await client.query(
        "UPDATE u_parents SET name = $1, email = $2 WHERE id = $3",
        [name, email, id]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Data orang tua tidak ditemukan." });
      }

      return res.status(200).json({ message: update });
    }

    // --- SKENARIO 1: BUAT DATA BARU JIKA TIDAK ADA ID ---
    // Validasi NIS untuk pembuatan data baru
    if (!nis) {
      return res
        .status(400)
        .json({ message: "NIS wajib diisi untuk membuat data baru." });
    }

    // Cari studentid berdasarkan NIS
    const studentResult = await client.query(
      "SELECT id FROM u_students WHERE nis = $1",
      [nis]
    );

    if (studentResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: `Siswa dengan NIS ${nis} tidak ditemukan.` });
    }
    const studentid = studentResult.rows[0].id;

    // Cek apakah siswa sudah punya data orang tua
    const parentExists = await client.query(
      "SELECT id FROM u_parents WHERE studentid = $1",
      [studentid]
    );

    if (parentExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Siswa sudah memiliki data orang tua" });
    }

    // Cek konflik email di seluruh tabel
    const emailConflict = await client.query(
      "SELECT id FROM u_parents WHERE email = $1",
      [email]
    );
    if (emailConflict.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Email sudah digunakan oleh akun lain." });
    }

    // Hash password (menggunakan NIS sebagai password default)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(String(nis), saltRounds);

    // Masukkan data orang tua baru
    await client.query(
      `INSERT INTO u_parents (studentid, email, name, password, level)
       VALUES ($1, $2, $3, $4, 'parent')`,
      [studentid, email, name, hashedPassword]
    );

    await client.query("COMMIT");

    res.status(201).json({ message: create });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// DELETE a parent by ID
router.delete("/delete-parent", authorize("admin"), async (req, res) => {
  const { id } = req.query;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "A valid parent ID is required." });
  }

  const client = await pool.connect();
  try {
    const result = await client.query("DELETE FROM u_parents WHERE id = $1", [
      id,
    ]);

    // Check if any row was actually deleted
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Parent not found." });
    }

    res.status(200).json({ message: remove });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Upload
router.post("/upload-parents", authorize("admin"), async (req, res) => {
  const { bulk } = req.body;

  if (!bulk || !Array.isArray(bulk) || bulk.length === 0) {
    return res.status(400).json({ message: "File tidak boleh kosong." });
  }

  const client = await pool.connect();
  try {
    // Memulai transaksi
    await client.query("BEGIN");

    for (const row of bulk) {
      const nis = row[0];
      const name = row[1];
      const email = row[2];

      if (!nis || !name || !email) {
        // Jika ada baris yang tidak lengkap, batalkan transaksi
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Data tidak lengkap pada baris dengan NIS ${
            nis || "(kosong)"
          }. Semua kolom wajib diisi.`,
        });
      }

      // 1. Cari studentid berdasarkan NIS
      const studentResult = await client.query(
        "SELECT id FROM u_students WHERE nis = $1",
        [nis]
      );

      // Jika siswa tidak ditemukan, lewati baris ini atau tangani sebagai error
      if (studentResult.rows.length === 0) {
        // Opsi 1: Lewati (abaikan baris ini)
        console.warn(
          `Siswa dengan NIS ${nis} tidak ditemukan, baris dilewati.`
        );
        continue;

        // Opsi 2: Batalkan (hentikan seluruh proses)
        // await client.query('ROLLBACK');
        // return res.status(404).json({ message: `Siswa dengan NIS ${nis} tidak ditemukan.` });
      }
      const studentid = studentResult.rows[0].id;

      // 2. Cek apakah data orang tua untuk siswa ini sudah ada
      const parentResult = await client.query(
        "SELECT id FROM u_parents WHERE studentid = $1",
        [studentid]
      );

      if (parentResult.rows.length > 0) {
        // JIKA ADA -> UPDATE
        const parentId = parentResult.rows[0].id;
        await client.query(
          "UPDATE u_parents SET name = $1, email = $2 WHERE id = $3",
          [name, email, parentId]
        );
      } else {
        // JIKA TIDAK ADA -> INSERT
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(String(nis), saltRounds);
        await client.query(
          `INSERT INTO u_parents (studentid, email, name, password, level)
           VALUES ($1, $2, $3, $4, 'parent')`,
          [studentid, email, name, hashedPassword]
        );
      }
    }

    // Jika semua berhasil, commit transaksi
    await client.query("COMMIT");
    res
      .status(200)
      .json({ message: "Data orang tua berhasil diimpor dan diproses." });
  } catch (error) {
    // Jika terjadi error, batalkan semua perubahan
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
