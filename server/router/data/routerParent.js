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
        p.email AS parent_email
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

export default router;
