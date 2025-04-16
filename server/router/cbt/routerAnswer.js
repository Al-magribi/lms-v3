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

    // Calculate points based on whether mc matches qkey
    const isCorrect = questionData
      ? mc?.toUpperCase() === questionData.qkey?.toUpperCase()
      : false;
    const point = questionData ? (isCorrect ? questionData.poin : 0) : 0;
    const correct = questionData.qkey;

    // Check if an answer already exists for this student, exam, and question
    const checkExistingQuery = `
      SELECT id FROM c_answer 
      WHERE student = $1 AND exam = $2 AND question = $3
    `;
    const existingResult = await client.query(checkExistingQuery, [
      student,
      exam,
      question,
    ]);
    const existingAnswer = existingResult.rows[0];

    if (existingAnswer) {
      // Update existing answer
      const updateQuery = `
        UPDATE c_answer SET 
        mc = $1, essay = $2, point = $3, correct = $4
        WHERE id = $5
      `;
      await client.query(updateQuery, [
        mc,
        essay,
        point,
        correct,
        existingAnswer.id,
      ]);
      res.status(200).json({ message: update, id: existingAnswer.id });
    } else {
      // Insert new answer
      const insertQuery = `
        INSERT INTO c_answer (student, exam, question, mc, essay, point, correct)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const insertResult = await client.query(insertQuery, [
        student,
        exam,
        question,
        mc,
        essay,
        point,
        correct,
      ]);
      res.status(200).json({ message: create, id: insertResult.rows[0].id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/get-student-answer",
  authorize("student", "admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { student, exam } = req.query;

      if (req.user.level === "admin" || req.user.level === "teacher") {
        const query = `
          WITH student_info AS (
            SELECT 
              us.id as student_id,
              us.name as student_name,
              us.nis as student_nis,
              ag.name as student_grade,
              ac.name as student_class,
              (SELECT l.createdat 
               FROM logs l 
               WHERE l.student = us.id AND l.exam = $2 AND l.islogin = true 
               ORDER BY l.createdat DESC 
               LIMIT 1) as log_exam
            FROM u_students us
            LEFT JOIN cl_students cls ON us.id = cls.student
            LEFT JOIN a_class ac ON cls.classid = ac.id
            LEFT JOIN a_grade ag ON ac.grade = ag.id
            WHERE us.id = $1
          ),
          answer_stats AS (
            SELECT 
              COUNT(CASE WHEN ca.point > 0 THEN 1 END) as correct_count,
              COUNT(CASE WHEN ca.point = 0 THEN 1 END) as incorrect_count,
              SUM(CASE WHEN ca.mc IS NOT NULL AND ca.point > 0 THEN ca.point ELSE 0 END) as pg_score,
              SUM(CASE WHEN ca.essay IS NOT NULL THEN ca.point ELSE 0 END) as essay_score
            FROM c_answer ca
            WHERE ca.student = $1 AND ca.exam = $2
          ),
          exam_info AS (
            SELECT mc_score, essay_score
            FROM c_exam
            WHERE id = $2
          )
          SELECT 
            si.*,
            COALESCE(answer_stats.correct_count, 0) as correct,
            COALESCE(answer_stats.incorrect_count, 0) as incorrect,
            COALESCE(answer_stats.pg_score, 0) as pg_score,
            COALESCE(answer_stats.essay_score, 0) as essay_score,
            ROUND(
              (COALESCE(answer_stats.pg_score, 0) * ei.mc_score / 100.0) + 
              (COALESCE(answer_stats.essay_score, 0) * ei.essay_score / 100.0), 
              2
            ) as score,
            (
              SELECT json_agg(
                json_build_object(
                  'question_id', cq.id,
                  'question_text', cq.question,
                  'answer', ca.mc,
                  'essay', ca.essay,
                  'correct', cq.qkey,
                  'point', ca.point,
                  'qtype', cq.qtype,
                  'max_point', cq.poin,
                  'id', ca.id
                )
                ORDER BY cq.id
              )
              FROM c_answer ca
              JOIN c_question cq ON ca.question = cq.id
              WHERE ca.student = si.student_id 
              AND ca.exam = $2
            ) as answers
          FROM student_info si
          CROSS JOIN answer_stats answer_stats
          CROSS JOIN exam_info ei
          GROUP BY 
            si.student_id, si.student_name, si.student_nis, si.student_grade, 
            si.student_class, si.log_exam, answer_stats.correct_count, answer_stats.incorrect_count, 
            answer_stats.pg_score, answer_stats.essay_score, ei.mc_score, ei.essay_score
        `;
        const result = await client.query(query, [student, exam]);
        res.status(200).json(result.rows);
      } else {
        // For students, return a simplified version with just their answers
        const query = `
          SELECT 
            ca.id as id,
            cq.id as question_id,
            cq.question as question_text,
            ca.mc,
            ca.essay,
            cq.qkey as correct,
            ca.point,
            cq.qtype,
            cq.poin as max_point
          FROM c_question cq
          LEFT JOIN c_answer ca ON ca.question = cq.id AND ca.student = $1 AND ca.exam = $2
          WHERE cq.id IN (
            SELECT cq2.id 
            FROM c_question cq2
            JOIN c_bank cb ON cq2.bank = cb.id
            JOIN c_ebank ce ON ce.bank = cb.id
            WHERE ce.exam = $2
          )
          ORDER BY cq.id
        `;
        const result = await client.query(query, [student, exam]);
        res.status(200).json(result.rows);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ================================
// TEACHER/ADMIN
// ================================
router.post("/grade-essay", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { answer_id, point } = req.body;

    // Get the answer and question details to validate the point
    const answerQuery = `
      SELECT ca.*, cq.poin as max_point, cq.qtype
      FROM c_answer ca
      JOIN c_question cq ON ca.question = cq.id
      WHERE ca.id = $1
    `;
    const answerResult = await client.query(answerQuery, [answer_id]);

    if (answerResult.rows.length === 0) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const answerData = answerResult.rows[0];

    // Validate that this is an essay question
    if (answerData.qtype !== 2) {
      return res.status(400).json({ message: "This is not an essay question" });
    }

    // Validate that the point doesn't exceed the maximum
    if (point > answerData.max_point) {
      return res.status(400).json({
        message: `Point cannot exceed the maximum of ${answerData.max_point}`,
      });
    }

    // Update the answer with the new point
    const updateQuery = `
      UPDATE c_answer SET point = $1
      WHERE id = $2
    `;
    await client.query(updateQuery, [point, answer_id]);

    res.status(200).json({ message: update });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;

const result = [
  {
    student_id: "Id siswa diambil dari u_students",
    student_name: "Nama siswa diambil dari u_students",
    student_nis: "NIS siswa diambil dari u_students",
    student_grade:
      "Tingkat kelas siswa diambil dari a_grade berdasarkan cl_students.grade",
    student_class:
      "Kelas siswa diambil dari a_class berdasarkan cl_students.classid",
    log_exam:
      "Tanggal ujian diambil dari log dengan kombinasi exam dan student",
    correct: "jumlah Jawaban benar diambil dari c_answer.point > 0",
    incorrect: " jumlah Jawaban salah diambil dari c_answer.point = 0",
    pg_score:
      "Jumlah PG benar diambil dari c_answer.point yang c_answer.mc tidak null",
    essay_score:
      "Nilai Essay diambil dari c_answer.point yang c_answer.essay tidak null",
    score:
      "pg_score dikali c_exam.pg_score ditambah essay_score dikali c_exam.essay_score, 2 angka dibelakang koma",
    answer: [
      {
        question_id: "Id pertanyaan diambil dari c_question",
        question_text: "Pertanyaan diambil dari c_question",
        answer: "Jawaban siswa diambil dari c_answer",
        correct: "Jawaban benar diambil dari c_question",
        point: "Nilai diambil dari c_answer",
      },
    ],
  },
];
