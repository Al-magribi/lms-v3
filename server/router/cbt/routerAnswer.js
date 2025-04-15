import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = Router();

// ================================
// SISWA
// ================================
router.post("/add-answer", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, student, exam, question, mc, essay } = req.body;

    // Get the question's point and correct answer (qkey)
    const questionQuery = `
      SELECT poin, qkey FROM c_question WHERE id = $1
    `;
    const questionResult = await client.query(questionQuery, [question]);
    const questionData = questionResult.rows[0];

    console.log(questionData);
    console.log(mc);

    // Calculate points based on whether mc matches qkey
    const isCorrect = questionData
      ? mc?.toUpperCase() === questionData.qkey?.toUpperCase()
      : false;
    const point = questionData ? (isCorrect ? questionData.poin : 0) : 0;
    const correct = questionData.qkey;

    if (id) {
      const query = `
                UPDATE c_answer SET 
                student = $1, exam = $2, question = $3, 
                mc = $4, essay = $5, point = $6, correct = $7
                WHERE id = $8
            `;
      await client.query(query, [
        student,
        exam,
        question,
        mc,
        essay,
        point,
        correct,
        id,
      ]);
      res.status(200).json({ message: update });
    } else {
      const query = `
                INSERT INTO c_answer (student, exam, question, mc, essay, point, correct)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
      await client.query(query, [
        student,
        exam,
        question,
        mc,
        essay,
        point,
        correct,
      ]);
      res.status(200).json({ message: create });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-student-answer", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { student, exam } = req.query;

    const query = `
        SELECT * FROM c_answer WHERE student = $1 AND exam = $2
    `;
    const result = await client.query(query, [student, exam]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});
export default router;
