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

router.get(
  "/get-student-answer",
  authorize("student", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { student, exam } = req.query;

      if (req.user.level === "admin") {
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
               LIMIT 1) as log_exam -- Get the latest login timestamp
            FROM u_students us
            LEFT JOIN cl_students cls ON us.id = cls.student
            LEFT JOIN a_class ac ON cls.classid = ac.id
            LEFT JOIN a_grade ag ON ac.grade = ag.id
            WHERE us.id = $1
          )
          SELECT 
            si.*,
            json_agg(
              json_build_object(
                'question_id', cq.id,
                'question_text', cq.question,
                'answer', ca.mc,
                'correct', cq.qkey,
                'point', ca.point
              )
            ) FILTER (WHERE cq.id IS NOT NULL) as answers -- Return null if no answers
          FROM student_info si
          LEFT JOIN c_answer ca ON ca.student = si.student_id AND ca.exam = $2
          LEFT JOIN c_question cq ON ca.question = cq.id
          GROUP BY si.student_id, si.student_name, si.student_nis, si.student_grade, si.student_class, si.log_exam
        `;
        const result = await client.query(query, [student, exam]);
        res.status(200).json(result.rows);
      } else {
        const query = `
          SELECT * FROM c_answer WHERE student = $1 AND exam = $2
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
