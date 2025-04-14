import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = express.Router();

// ======================================
// Admin Dashboard
// ======================================
router.get("/admin-stats", authorize("admin"), async (req, res) => {
  try {
    const homebaseId = req.user.homebase;

    // Basic counts
    const basicStats = await pool.query(
      `
            SELECT 
                (SELECT COUNT(*) FROM u_students WHERE homebase = $1) as total_students,
                (SELECT COUNT(*) FROM u_teachers WHERE homebase = $1) as total_teachers,
                (SELECT COUNT(*) FROM a_class WHERE homebase = $1) as total_classes,
                (SELECT COUNT(*) FROM c_exam WHERE homebase = $1) as total_exams,
                (SELECT COUNT(*) FROM a_subject WHERE homebase = $1) as total_subjects,
                (SELECT COUNT(*) FROM c_bank WHERE homebase = $1) as total_banks
        `,
      [homebaseId]
    );

    // Students per grade with gender composition
    const studentsPerGrade = await pool.query(
      `
            SELECT 
                g.name as grade_name,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
                COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
            FROM a_grade g
            LEFT JOIN a_class c ON c.grade = g.id
            LEFT JOIN cl_students s ON s.classid = c.id
            LEFT JOIN u_students us ON us.id = s.student
            WHERE g.homebase = $1
            GROUP BY g.id, g.name
            ORDER BY g.name
        `,
      [homebaseId]
    );

    // Students per class with gender composition
    const studentsPerClass = await pool.query(
      `
            SELECT 
                c.name as class_name,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
                COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
            FROM a_class c
            LEFT JOIN cl_students s ON s.classid = c.id
            LEFT JOIN u_students us ON us.id = s.student
            WHERE c.homebase = $1
            GROUP BY c.id, c.name
            ORDER BY c.name
        `,
      [homebaseId]
    );

    // Teacher composition by gender
    const teacherComposition = await pool.query(
      `
            SELECT 
                COUNT(*) as total_teachers,
                COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
                COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
            FROM u_teachers
            WHERE homebase = $1
        `,
      [homebaseId]
    );

    // Recent activities (last 7 days)
    const recentActivities = await pool.query(
      `
            SELECT 
                'exam' as type,
                name as title,
                createdat
            FROM c_exam 
            WHERE homebase = $1 AND createdat >= NOW() - INTERVAL '7 days'
            UNION ALL
            SELECT 
                'subject' as type,
                name as title,
                createdat
            FROM a_subject 
            WHERE homebase = $1 AND createdat >= NOW() - INTERVAL '7 days'
            ORDER BY createdat DESC
            LIMIT 10
        `,
      [homebaseId]
    );

    // Exam statistics
    const examStats = await pool.query(
      `
            SELECT 
                COUNT(*) as total_exams,
                COUNT(CASE WHEN isactive = true THEN 1 END) as active_exams,
                COUNT(DISTINCT teacher) as teacher_count,
                COUNT(DISTINCT c.classid) as class_count
            FROM c_exam e
            LEFT JOIN c_class c ON c.exam = e.id
            WHERE e.homebase = $1
        `,
      [homebaseId]
    );

    res.json({
      basicStats: basicStats.rows[0],
      studentsPerGrade: studentsPerGrade.rows,
      studentsPerClass: studentsPerClass.rows,
      teacherComposition: teacherComposition.rows[0],
      recentActivities: recentActivities.rows,
      examStats: examStats.rows[0],
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================================
// Teacher Dashboard
// ======================================

// Teacher Dashboard Stats
router.get("/teacher-stats", authorize("teacher"), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const homebaseId = req.user.homebase;

    // Get teacher's subjects and classes
    const teachingStats = await pool.query(
      `
      SELECT 
        (SELECT COUNT(DISTINCT subject) FROM at_subject WHERE teacher = $1) as total_subjects,
        (SELECT COUNT(DISTINCT lc.classid) 
         FROM l_cclass lc 
         JOIN l_chapter ch ON lc.chapter = ch.id 
         WHERE ch.teacher = $1) as total_classes,
        (SELECT COUNT(*) FROM c_exam WHERE teacher = $1) as total_exams,
        (SELECT COUNT(*) FROM c_bank WHERE teacher = $1) as total_banks,
        (SELECT COUNT(*) FROM l_chapter WHERE teacher = $1) as total_chapters,
        (SELECT COUNT(DISTINCT lc.classid) 
         FROM l_cclass lc 
         JOIN l_chapter ch ON lc.chapter = ch.id 
         WHERE ch.teacher = $1) as total_material_classes
      `,
      [teacherId]
    );

    // Get recent exams
    const recentExams = await pool.query(
      `
      SELECT id, name, duration, isactive, createdat
      FROM c_exam
      WHERE teacher = $1
      ORDER BY createdat DESC
      LIMIT 5
      `,
      [teacherId]
    );

    // Get recent learning materials
    const recentMaterials = await pool.query(
      `
      SELECT id, title, createdat
      FROM l_chapter
      WHERE teacher = $1
      ORDER BY createdat DESC
      LIMIT 5
      `,
      [teacherId]
    );

    res.json({
      teachingStats: teachingStats.rows[0],
      recentExams: recentExams.rows,
      recentMaterials: recentMaterials.rows,
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
