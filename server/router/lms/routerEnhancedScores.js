import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

// Helper function to get active periode
const getActivePeriode = async (client, homebase) => {
  const periode = await client.query(
    `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
    [homebase]
  );
  return periode.rows[0]?.id;
};

// Helper function to calculate final grade
const calculateFinalGrade = (
  attendanceScore,
  attitudeScore,
  dailyScoresAvg,
  finalExamScore
) => {
  const attendanceWeight = 0.1; // 10%
  const attitudeWeight = 0.3; // 30%
  const dailyWeight = 0.3; // 30%
  const examWeight = 0.3; // 30%

  const finalGrade =
    attendanceScore * attendanceWeight +
    attitudeScore * attitudeWeight +
    dailyScoresAvg * dailyWeight +
    finalExamScore * examWeight;

  return Math.round(finalGrade);
};

// Helper function to get letter grade
const getLetterGrade = (finalGrade) => {
  if (finalGrade >= 96) return "A";
  if (finalGrade >= 91) return "B";
  if (finalGrade >= 85) return "C";
  return "D";
};

// 1. GET: Enhanced reports with all score types
router.get("/reports", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  const homebase = req.user.homebase;

  try {
    const { classid, subjectid, month, chapterid } = req.query;
    if (!classid || !subjectid || !month || !chapterid) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const periodeid = await getActivePeriode(client, homebase);
    if (!periodeid) {
      return res.status(400).json({ message: "No active periode found" });
    }

    // Get all students in the class
    const studentsResult = await client.query(
      `SELECT u.id, u.name, u.nis, u.gender FROM cl_students c
       JOIN u_students u ON c.student = u.id
       WHERE c.classid = $1 AND c.periode = $2
       ORDER BY u.name ASC`,
      [classid, periodeid]
    );
    const students = studentsResult.rows;

    // Get attitude scores
    const attitudeResult = await client.query(
      `SELECT * FROM l_attitude_scores 
       WHERE subject_id = $1 AND month = $2`,
      [subjectid, month]
    );
    const attitudeScores = attitudeResult.rows;

    // Get academic scores
    const academicResult = await client.query(
      `SELECT * FROM l_academic_scores 
       WHERE subject_id = $1 AND chapter_id = $2`,
      [subjectid, chapterid]
    );
    const academicScores = academicResult.rows;

    // Get attendance records
    const attendanceResult = await client.query(
      `SELECT * FROM l_attendance_records 
       WHERE subject_id = $1 AND month = $2`,
      [subjectid, month]
    );
    const attendanceRecords = attendanceResult.rows;

    // Get daily summative scores
    const dailySummativeResult = await client.query(
      `SELECT * FROM l_daily_summative 
       WHERE subject_id = $1 AND chapter_id = $2`,
      [subjectid, chapterid]
    );
    const dailySummativeScores = dailySummativeResult.rows;

    // Get final semester exam scores
    const finalExamResult = await client.query(
      `SELECT * FROM l_final_semester_exam 
       WHERE subject_id = $1 AND periode_id = $2`,
      [subjectid, periodeid]
    );
    const finalExamScores = finalExamResult.rows;

    // Map data to students
    const result = students.map((student) => {
      const attitude = attitudeScores.find((a) => a.student_id === student.id);
      const academic = academicScores.find((a) => a.student_id === student.id);
      const attendance = attendanceRecords.find(
        (a) => a.student_id === student.id
      );
      const dailySummative = dailySummativeScores.find(
        (d) => d.student_id === student.id
      );
      const finalExam = finalExamScores.find(
        (f) => f.student_id === student.id
      );

      return {
        studentid: student.id,
        name: student.name,
        nis: student.nis,
        gender: student.gender,
        attitude: attitude
          ? {
              id: attitude.id,
              performance: attitude.performance,
              discipline: attitude.discipline,
              activeness: attitude.activeness,
              confidence: attitude.confidence,
              teacher_note: attitude.teacher_note,
            }
          : null,
        academic: academic
          ? {
              id: academic.id,
              taks_score: academic.taks_score,
              writing_score: academic.writing_score,
              speaking_score: academic.speaking_score,
              lab_score: academic.lab_score,
              material_note: academic.material_note,
            }
          : null,
        attendance: attendance
          ? {
              id: attendance.id,
              present_days: attendance.present_days,
              sick_days: attendance.sick_days,
              permission_days: attendance.permission_days,
              absent_days: attendance.absent_days,
              total_days: attendance.total_days,
              attendance_percentage: attendance.attendance_percentage,
            }
          : null,
        daily_summative: dailySummative
          ? {
              id: dailySummative.id,
              summative_number: dailySummative.summative_number,
              score: dailySummative.score,
              max_score: dailySummative.max_score,
            }
          : null,
        final_exam: finalExam
          ? {
              id: finalExam.id,
              non_test_score: finalExam.non_test_score,
              test_score: finalExam.test_score,
              final_semester_score: finalExam.final_semester_score,
            }
          : null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 2. POST: Create attitude score
router.post(
  "/add-attitude-score",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id,
        subject_id,
        teacher_id,
        month,
        performance,
        discipline,
        activeness,
        confidence,
        teacher_note,
      } = req.body;

      const homebase = req.user.homebase;
      const periodeid = await getActivePeriode(client, homebase);

      // Check for existing record
      const existing = await client.query(
        `SELECT id FROM l_attitude_scores 
       WHERE student_id = $1 AND subject_id = $2 AND month = $3`,
        [student_id, subject_id, month]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE l_attitude_scores 
         SET performance = $1, discipline = $2, activeness = $3, 
             confidence = $4, teacher_note = $5
         WHERE id = $6`,
          [
            performance,
            discipline,
            activeness,
            confidence,
            teacher_note,
            existing.rows[0].id,
          ]
        );
      } else {
        // Create new record
        await client.query(
          `INSERT INTO l_attitude_scores 
         (student_id, subject_id, teacher_id, month, performance, discipline, 
          activeness, confidence, teacher_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            student_id,
            subject_id,
            teacher_id,
            month,
            performance,
            discipline,
            activeness,
            confidence,
            teacher_note,
          ]
        );
      }

      res.status(200).json({ message: "Attitude score saved successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 3. POST: Create academic score
router.post(
  "/add-academic-score",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id,
        subject_id,
        chapter_id,
        content_id,
        taks_score,
        writing_score,
        speaking_score,
        lab_score,
        material_note,
      } = req.body;

      // Check for existing record
      const existing = await client.query(
        `SELECT id FROM l_academic_scores 
       WHERE student_id = $1 AND subject_id = $2 AND chapter_id = $3`,
        [student_id, subject_id, chapter_id]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE l_academic_scores 
         SET taks_score = $1, writing_score = $2, speaking_score = $3, 
             lab_score = $4, material_note = $5, content_id = $6
         WHERE id = $7`,
          [
            taks_score,
            writing_score,
            speaking_score,
            lab_score,
            material_note,
            content_id,
            existing.rows[0].id,
          ]
        );
      } else {
        // Create new record
        await client.query(
          `INSERT INTO l_academic_scores 
         (student_id, subject_id, chapter_id, content_id, taks_score, 
          writing_score, speaking_score, lab_score, material_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            student_id,
            subject_id,
            chapter_id,
            content_id,
            taks_score,
            writing_score,
            speaking_score,
            lab_score,
            material_note,
          ]
        );
      }

      res.status(200).json({ message: "Academic score saved successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 4. POST: Create attendance record
router.post(
  "/add-attendance-record",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id,
        subject_id,
        class_id,
        month,
        present_days,
        sick_days,
        permission_days,
        absent_days,
        attendance_percentage,
      } = req.body;

      const homebase = req.user.homebase;
      const periodeid = await getActivePeriode(client, homebase);

      // Calculate total days and percentage
      const totalDays =
        present_days + sick_days + permission_days + absent_days;
      const calculatedPercentage =
        totalDays > 0
          ? Math.round(
              ((present_days + sick_days + permission_days) / totalDays) * 100
            )
          : 0;

      // Check for existing record
      const existing = await client.query(
        `SELECT id FROM l_attendance_records 
       WHERE student_id = $1 AND subject_id = $2 AND month = $3`,
        [student_id, subject_id, month]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE l_attendance_records 
         SET present_days = $1, sick_days = $2, permission_days = $3, 
             absent_days = $4, total_days = $5, attendance_percentage = $6
         WHERE id = $7`,
          [
            present_days,
            sick_days,
            permission_days,
            absent_days,
            totalDays,
            calculatedPercentage,
            existing.rows[0].id,
          ]
        );
      } else {
        // Create new record
        await client.query(
          `INSERT INTO l_attendance_records 
         (student_id, subject_id, class_id, periode_id, month, present_days, 
          sick_days, permission_days, absent_days, total_days, attendance_percentage)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            student_id,
            subject_id,
            class_id,
            periodeid,
            month,
            present_days,
            sick_days,
            permission_days,
            absent_days,
            totalDays,
            calculatedPercentage,
          ]
        );
      }

      res.status(200).json({ message: "Attendance record saved successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 5. POST: Create daily summative score
router.post(
  "/add-daily-summative",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id,
        subject_id,
        chapter_id,
        summative_number,
        score,
        max_score = 100,
      } = req.body;

      // Check for existing record
      const existing = await client.query(
        `SELECT id FROM l_daily_summative 
       WHERE student_id = $1 AND subject_id = $2 AND chapter_id = $3 AND summative_number = $4`,
        [student_id, subject_id, chapter_id, summative_number]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE l_daily_summative 
         SET score = $1, max_score = $2
         WHERE id = $3`,
          [score, max_score, existing.rows[0].id]
        );
      } else {
        // Create new record
        await client.query(
          `INSERT INTO l_daily_summative 
         (student_id, subject_id, chapter_id, summative_number, score, max_score)
         VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            student_id,
            subject_id,
            chapter_id,
            summative_number,
            score,
            max_score,
          ]
        );
      }

      res
        .status(200)
        .json({ message: "Daily summative score saved successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 6. POST: Create final semester exam score
router.post(
  "/add-final-semester-exam",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { student_id, subject_id, non_test_score, test_score } = req.body;

      const homebase = req.user.homebase;
      const periodeid = await getActivePeriode(client, homebase);

      // Calculate final semester score (use test_score if available, otherwise average)
      const finalSemesterScore = test_score || non_test_score || 0;

      // Check for existing record
      const existing = await client.query(
        `SELECT id FROM l_final_semester_exam 
       WHERE student_id = $1 AND subject_id = $2 AND periode_id = $3`,
        [student_id, subject_id, periodeid]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE l_final_semester_exam 
         SET non_test_score = $1, test_score = $2, final_semester_score = $3
         WHERE id = $4`,
          [non_test_score, test_score, finalSemesterScore, existing.rows[0].id]
        );
      } else {
        // Create new record
        await client.query(
          `INSERT INTO l_final_semester_exam 
         (student_id, subject_id, periode_id, non_test_score, test_score, final_semester_score)
         VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            student_id,
            subject_id,
            periodeid,
            non_test_score,
            test_score,
            finalSemesterScore,
          ]
        );
      }

      res
        .status(200)
        .json({ message: "Final semester exam score saved successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 7. POST: Calculate final grade
router.post(
  "/calculate-final-grade",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id,
        subject_id,
        class_id,
        attendance_score,
        attitude_score,
        daily_scores_avg,
        final_exam_score,
      } = req.body;

      const homebase = req.user.homebase;
      const periodeid = await getActivePeriode(client, homebase);

      // Calculate final grade
      const finalGrade = calculateFinalGrade(
        attendance_score || 0,
        attitude_score || 0,
        daily_scores_avg || 0,
        final_exam_score || 0
      );

      const letterGrade = getLetterGrade(finalGrade);

      // Check for existing record
      const existing = await client.query(
        `SELECT id FROM l_final_grades 
       WHERE student_id = $1 AND subject_id = $2 AND periode_id = $3`,
        [student_id, subject_id, periodeid]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE l_final_grades 
         SET attendance_score = $1, attitude_score = $2, daily_scores_avg = $3, 
             final_exam_score = $4, final_grade = $5, letter_grade = $6
         WHERE id = $7`,
          [
            attendance_score,
            attitude_score,
            daily_scores_avg,
            final_exam_score,
            finalGrade,
            letterGrade,
            existing.rows[0].id,
          ]
        );
      } else {
        // Create new record
        await client.query(
          `INSERT INTO l_final_grades 
         (student_id, subject_id, class_id, periode_id, attendance_score, 
          attitude_score, daily_scores_avg, final_exam_score, final_grade, letter_grade)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            student_id,
            subject_id,
            class_id,
            periodeid,
            attendance_score,
            attitude_score,
            daily_scores_avg,
            final_exam_score,
            finalGrade,
            letterGrade,
          ]
        );
      }

      res.status(200).json({
        message: "Final grade calculated successfully",
        final_grade: finalGrade,
        letter_grade: letterGrade,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 8. POST: Bulk save scores
router.post(
  "/bulk-save-scores",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { class_id, subject_id, chapter_id, month, teacher_id, students } =
        req.body;

      await client.query("BEGIN");

      for (const student of students) {
        const { student_id, attitude, academic, attendance } = student;

        // Save attitude scores
        if (attitude) {
          await client.query(
            `INSERT INTO l_attitude_scores 
           (student_id, subject_id, teacher_id, month, performance, discipline, 
            activeness, confidence, teacher_note)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (student_id, subject_id, month) 
           DO UPDATE SET performance = EXCLUDED.performance, discipline = EXCLUDED.discipline,
                         activeness = EXCLUDED.activeness, confidence = EXCLUDED.confidence,
                         teacher_note = EXCLUDED.teacher_note`,
            [
              student_id,
              subject_id,
              teacher_id,
              month,
              attitude.performance,
              attitude.discipline,
              attitude.activeness,
              attitude.confidence,
              attitude.teacher_note,
            ]
          );
        }

        // Save academic scores
        if (academic && chapter_id) {
          await client.query(
            `INSERT INTO l_academic_scores 
           (student_id, subject_id, chapter_id, taks_score, writing_score, 
            speaking_score, lab_score, material_note)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (student_id, subject_id, chapter_id) 
           DO UPDATE SET taks_score = EXCLUDED.taks_score, writing_score = EXCLUDED.writing_score,
                         speaking_score = EXCLUDED.speaking_score, lab_score = EXCLUDED.lab_score,
                         material_note = EXCLUDED.material_note`,
            [
              student_id,
              subject_id,
              chapter_id,
              academic.taks_score,
              academic.writing_score,
              academic.speaking_score,
              academic.lab_score,
              academic.material_note,
            ]
          );
        }

        // Save attendance records
        if (attendance) {
          const totalDays =
            attendance.present_days +
            attendance.sick_days +
            attendance.permission_days +
            attendance.absent_days;
          const attendancePercentage =
            totalDays > 0
              ? Math.round(
                  ((attendance.present_days +
                    attendance.sick_days +
                    attendance.permission_days) /
                    totalDays) *
                    100
                )
              : 0;

          await client.query(
            `INSERT INTO l_attendance_records 
           (student_id, subject_id, class_id, month, present_days, sick_days, 
            permission_days, absent_days, total_days, attendance_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (student_id, subject_id, month) 
           DO UPDATE SET present_days = EXCLUDED.present_days, sick_days = EXCLUDED.sick_days,
                         permission_days = EXCLUDED.permission_days, absent_days = EXCLUDED.absent_days,
                         total_days = EXCLUDED.total_days, attendance_percentage = EXCLUDED.attendance_percentage`,
            [
              student_id,
              subject_id,
              class_id,
              month,
              attendance.present_days,
              attendance.sick_days,
              attendance.permission_days,
              attendance.absent_days,
              totalDays,
              attendancePercentage,
            ]
          );
        }
      }

      await client.query("COMMIT");
      res.status(200).json({ message: "All scores saved successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// 9. GET: Student comprehensive report
router.get(
  "/student-report",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { studentid, subjectid, month, periodeid } = req.query;

      if (!studentid || !subjectid) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Get all data for the student
      const [
        attitude,
        academic,
        attendance,
        dailySummative,
        finalExam,
        finalGrade,
      ] = await Promise.all([
        client.query(
          `SELECT * FROM l_attitude_scores 
         WHERE student_id = $1 AND subject_id = $2 AND month = $3`,
          [studentid, subjectid, month]
        ),
        client.query(
          `SELECT * FROM l_academic_scores 
         WHERE student_id = $1 AND subject_id = $2`,
          [studentid, subjectid]
        ),
        client.query(
          `SELECT * FROM l_attendance_records 
         WHERE student_id = $1 AND subject_id = $2 AND month = $3`,
          [studentid, subjectid, month]
        ),
        client.query(
          `SELECT * FROM l_daily_summative 
         WHERE student_id = $1 AND subject_id = $2`,
          [studentid, subjectid]
        ),
        client.query(
          `SELECT * FROM l_final_semester_exam 
         WHERE student_id = $1 AND subject_id = $2 AND periode_id = $3`,
          [studentid, subjectid, periodeid]
        ),
        client.query(
          `SELECT * FROM l_final_grades 
         WHERE student_id = $1 AND subject_id = $2 AND periode_id = $3`,
          [studentid, subjectid, periodeid]
        ),
      ]);

      // Get student info
      const studentInfo = await client.query(
        `SELECT u.name, u.nis, u.gender, c.name as class_name, g.name as grade_name
       FROM u_students u
       JOIN cl_students cs ON u.id = cs.student
       JOIN a_class c ON cs.classid = c.id
       JOIN a_grade g ON c.grade = g.id
       WHERE u.id = $1`,
        [studentid]
      );

      res.status(200).json({
        student: studentInfo.rows[0],
        attitude: attitude.rows[0] || null,
        academic: academic.rows,
        attendance: attendance.rows[0] || null,
        daily_summative: dailySummative.rows,
        final_exam: finalExam.rows[0] || null,
        final_grade: finalGrade.rows[0] || null,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
