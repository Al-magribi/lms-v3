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
                (SELECT COUNT(*) FROM c_bank WHERE homebase = $1) as total_banks,
                (SELECT COUNT(*) FROM l_chapter WHERE subject IN (SELECT id FROM a_subject WHERE homebase = $1)) as total_chapters,
                (SELECT COUNT(*) FROM l_content WHERE chapter IN (SELECT id FROM l_chapter WHERE subject IN (SELECT id FROM a_subject WHERE homebase = $1))) as total_learning_materials
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
                g.name as grade_name,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
                COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
            FROM a_class c
            LEFT JOIN a_grade g ON c.grade = g.id
            LEFT JOIN cl_students s ON s.classid = c.id
            LEFT JOIN u_students us ON us.id = s.student
            WHERE c.homebase = $1
            GROUP BY c.id, c.name, g.name
            ORDER BY g.name, c.name
        `,
      [homebaseId]
    );

    // Teacher composition by gender and homeroom status
    const teacherComposition = await pool.query(
      `
            SELECT 
                COUNT(*) as total_teachers,
                COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
                COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count,
                COUNT(CASE WHEN homeroom = true THEN 1 END) as homeroom_count
            FROM u_teachers
            WHERE homebase = $1
        `,
      [homebaseId]
    );

    // Activity logs
    const activityLogs = await pool.query(
      `
            SELECT 
                l.id,
                l.action,
                l.createdat,
                l.islogin,
                l.ispenalty,
                l.isactive,
                l.isdone,
                l.ip,
                SUBSTRING(l.browser FROM '^[^/]+') as browser_name,
                SUBSTRING(l.browser FROM '/([^ ]+)') as browser_version,
                COALESCE(s.name, t.name, a.name) as user_name,
                CASE 
                    WHEN l.student IS NOT NULL THEN 'Siswa'
                    WHEN l.teacher IS NOT NULL THEN 'Guru'
                    WHEN l.admin IS NOT NULL THEN 'Admin'
                    ELSE 'Unknown'
                END as user_type
            FROM logs l
            LEFT JOIN u_students s ON l.student = s.id
            LEFT JOIN u_teachers t ON l.teacher = t.id
            LEFT JOIN u_admin a ON l.admin = a.id
            WHERE (l.student IN (SELECT id FROM u_students WHERE homebase = $1) OR
                  l.teacher IN (SELECT id FROM u_teachers WHERE homebase = $1) OR
                  l.admin IN (SELECT id FROM u_admin WHERE homebase = $1))
            ORDER BY l.createdat DESC
            LIMIT 10
        `,
      [homebaseId]
    );

    // Recent activities (last 7 days)
    const recentActivities = await pool.query(
      `
            SELECT 
                'exam' as type,
                e.name as title,
                t.name as teacher_name,
                e.createdat
            FROM c_exam e
            JOIN u_teachers t ON e.teacher = t.id
            WHERE e.homebase = $1 AND e.createdat >= NOW() - INTERVAL '7 days'
            UNION ALL
            SELECT 
                'subject' as type,
                s.name as title,
                t.name as teacher_name,
                s.createdat
            FROM a_subject s
            JOIN at_subject ats ON ats.subject = s.id
            JOIN u_teachers t ON ats.teacher = t.id
            WHERE s.homebase = $1 AND s.createdat >= NOW() - INTERVAL '7 days'
            UNION ALL
            SELECT 
                'chapter' as type,
                ch.title as title,
                t.name as teacher_name,
                ch.createdat
            FROM l_chapter ch
            JOIN u_teachers t ON ch.teacher = t.id
            JOIN a_subject s ON ch.subject = s.id
            WHERE s.homebase = $1 AND ch.createdat >= NOW() - INTERVAL '7 days'
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
                COUNT(CASE WHEN e.isactive = true THEN 1 END) as active_exams,
                COUNT(DISTINCT e.teacher) as teacher_count,
                COUNT(DISTINCT c.classid) as class_count,
                COUNT(DISTINCT cb.subject) as subject_count
            FROM c_exam e
            LEFT JOIN c_class c ON c.exam = e.id
            LEFT JOIN c_ebank eb ON eb.exam = e.id
            LEFT JOIN c_bank cb ON cb.id = eb.bank
            WHERE e.homebase = $1
        `,
      [homebaseId]
    );

    // Learning material statistics
    const learningStats = await pool.query(
      `
            SELECT 
                COUNT(DISTINCT ch.id) as total_chapters,
                COUNT(DISTINCT co.id) as total_contents,
                COUNT(DISTINCT f.id) as total_files,
                COUNT(DISTINCT ch.teacher) as teacher_count
            FROM l_chapter ch
            LEFT JOIN l_content co ON co.chapter = ch.id
            LEFT JOIN l_file f ON f.content = co.id
            WHERE ch.createdat >= (
              SELECT createdat 
              FROM l_chapter 
              ORDER BY createdat DESC 
              LIMIT 1 OFFSET 9
            )
        `,
      []
    );

    res.json({
      basicStats: basicStats.rows[0],
      studentsPerGrade: studentsPerGrade.rows,
      studentsPerClass: studentsPerClass.rows,
      teacherComposition: teacherComposition.rows[0],
      activityLogs: activityLogs.rows,
      recentActivities: recentActivities.rows,
      examStats: examStats.rows[0],
      learningStats: learningStats.rows[0],
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

// ======================================
// Student Dashboard
// ======================================
router.get("/student-stats", authorize("student"), async (req, res) => {
  try {
    const studentId = req.user.id;
    const homebaseId = req.user.homebase;

    // Get student's class and subjects
    const studentInfo = await pool.query(
      `
      SELECT 
        c.name as class_name,
        g.name as grade_name,
        m.name as major_name,
        COUNT(DISTINCT ats.subject) as total_subjects
      FROM cl_students cs
      JOIN a_class c ON cs.classid = c.id
      JOIN a_grade g ON c.grade = g.id
      LEFT JOIN a_major m ON c.major = m.id
      LEFT JOIN at_class atc ON atc.class_id = c.id
      LEFT JOIN at_subject ats ON ats.teacher = atc.teacher_id
      WHERE cs.student = $1 AND cs.homebase = $2
      GROUP BY c.name, g.name, m.name
      `,
      [studentId, homebaseId]
    );

    // Get upcoming exams
    const upcomingExams = await pool.query(
      `
      SELECT 
        e.id,
        e.name,
        e.duration,
        e.createdat,
        s.name as subject_name,
        t.name as teacher_name
      FROM c_exam e
      JOIN c_class cc ON cc.exam = e.id
      JOIN cl_students cs ON cs.classid = cc.classid
      JOIN c_ebank eb ON eb.exam = e.id
      JOIN c_bank cb ON cb.id = eb.bank
      JOIN a_subject s ON cb.subject = s.id
      JOIN u_teachers t ON e.teacher = t.id
      WHERE cs.student = $1 
      AND e.isactive = true
      AND e.createdat >= NOW()
      ORDER BY e.createdat ASC
      LIMIT 5
      `,
      [studentId]
    );

    // Get recent learning materials
    const recentMaterials = await pool.query(
      `
      SELECT 
        ch.id,
        ch.title,
        ch.createdat,
        s.name as subject_name,
        t.name as teacher_name
      FROM l_chapter ch
      JOIN a_subject s ON ch.subject = s.id
      JOIN u_teachers t ON ch.teacher = t.id
      JOIN l_cclass lc ON lc.chapter = ch.id
      JOIN cl_students cs ON cs.classid = lc.classid
      WHERE cs.student = $1
      ORDER BY ch.createdat DESC
      LIMIT 5
      `,
      [studentId]
    );

    // Get Quran learning progress
    const quranProgress = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT p.juz_id) as completed_juz,
        COUNT(DISTINCT p.surah_id) as completed_surah,
        MAX(p.createdat) as last_activity
      FROM t_process p
      WHERE p.userid = $1
      `,
      [studentId]
    );

    res.json({
      studentInfo: studentInfo.rows[0],
      upcomingExams: upcomingExams.rows,
      recentMaterials: recentMaterials.rows,
      quranProgress: quranProgress.rows[0],
    });
  } catch (error) {
    console.error("Error fetching student dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================================
// Center Dashboard (Admin Pusat)
// ======================================
router.get("/center-stats", authorize("center"), async (req, res) => {
  try {
    // Get basic statistics
    const basicStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM u_students) as total_students,
        (SELECT COUNT(*) FROM u_teachers) as total_teachers,
        (SELECT COUNT(*) FROM a_class) as total_classes,
        (SELECT COUNT(*) FROM a_subject) as total_subjects,
        (SELECT COUNT(*) FROM a_homebase) as total_homebase,
        (SELECT COUNT(*) FROM c_exam) as total_exams,
        (SELECT COUNT(*) FROM c_bank) as total_banks,
        (SELECT COUNT(*) FROM l_chapter) as total_chapters
    `);

    // Get students distribution by grade
    const studentsPerGrade = await pool.query(`
      SELECT 
        g.name as grade_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
        COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
      FROM a_grade g
      LEFT JOIN a_class c ON c.grade = g.id
      LEFT JOIN cl_students s ON s.classid = c.id
      LEFT JOIN u_students us ON us.id = s.student
      GROUP BY g.id, g.name
      ORDER BY g.name
    `);

    // Get teacher composition
    const teacherComposition = await pool.query(`
      SELECT 
        COUNT(*) as total_teachers,
        COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count,
        COUNT(CASE WHEN homeroom = true THEN 1 END) as homeroom_count
      FROM u_teachers
    `);

    // Get exam statistics
    const examStats = await pool.query(
      `
      SELECT 
        COUNT(*) as total_exams,
        COUNT(CASE WHEN e.isactive = true THEN 1 END) as active_exams,
        COUNT(DISTINCT e.teacher) as teacher_count,
        COUNT(DISTINCT c.classid) as class_count,
        COUNT(DISTINCT cb.subject) as subject_count
      FROM c_exam e
      LEFT JOIN c_class c ON c.exam = e.id
      LEFT JOIN c_ebank eb ON eb.exam = e.id
      LEFT JOIN c_bank cb ON cb.id = eb.bank
      WHERE e.createdat >= (
        SELECT createdat 
        FROM c_exam 
        ORDER BY createdat DESC 
        LIMIT 1 OFFSET 9
      )
    `,
      []
    );

    // Get learning material statistics
    const learningStats = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT ch.id) as total_chapters,
        COUNT(DISTINCT co.id) as total_contents,
        COUNT(DISTINCT f.id) as total_files,
        COUNT(DISTINCT ch.teacher) as teacher_count
      FROM l_chapter ch
      LEFT JOIN l_content co ON co.chapter = ch.id
      LEFT JOIN l_file f ON f.content = co.id
      WHERE ch.createdat >= (
        SELECT createdat 
        FROM l_chapter 
        ORDER BY createdat DESC 
        LIMIT 1 OFFSET 9
      )
    `,
      []
    );

    // Get recent activities
    const recentActivities = await pool.query(
      `
      SELECT 
        'exam' as type,
        e.name as title,
        t.name as teacher_name,
        e.createdat
      FROM c_exam e
      JOIN u_teachers t ON e.teacher = t.id
      WHERE e.createdat >= (
        SELECT createdat 
        FROM c_exam 
        ORDER BY createdat DESC 
        LIMIT 1 OFFSET 9
      )
      UNION ALL
      SELECT 
        'subject' as type,
        s.name as title,
        t.name as teacher_name,
        s.createdat
      FROM a_subject s
      JOIN at_subject ats ON ats.subject = s.id
      JOIN u_teachers t ON ats.teacher = t.id
      WHERE s.createdat >= (
        SELECT createdat 
        FROM a_subject 
        ORDER BY createdat DESC 
        LIMIT 1 OFFSET 9
      )
      UNION ALL
      SELECT 
        'chapter' as type,
        ch.title as title,
        t.name as teacher_name,
        ch.createdat
      FROM l_chapter ch
      JOIN u_teachers t ON ch.teacher = t.id
      WHERE ch.createdat >= (
        SELECT createdat 
        FROM l_chapter 
        ORDER BY createdat DESC 
        LIMIT 1 OFFSET 9
      )
      ORDER BY createdat DESC
      LIMIT 10
    `,
      []
    );

    // Get homebase statistics
    const homebaseStats = await pool.query(`
      SELECT 
        h.name as homebase_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT t.id) as total_teachers,
        COUNT(DISTINCT c.id) as total_classes,
        COUNT(DISTINCT sub.id) as total_subjects
      FROM a_homebase h
      LEFT JOIN u_students s ON s.homebase = h.id
      LEFT JOIN u_teachers t ON t.homebase = h.id
      LEFT JOIN a_class c ON c.homebase = h.id
      LEFT JOIN a_subject sub ON sub.homebase = h.id
      GROUP BY h.id, h.name
      ORDER BY h.name
    `);

    // Get system activity logs
    const activityLogs = await pool.query(`
      SELECT 
        l.id,
        l.action,
        l.createdat,
        l.islogin,
        l.ispenalty,
        l.isactive,
        l.isdone,
        l.ip,
        SUBSTRING(l.browser FROM '^[^/]+') as browser_name,
        SUBSTRING(l.browser FROM '/([^ ]+)') as browser_version,
        COALESCE(s.name, t.name, a.name) as user_name,
        CASE 
          WHEN l.student IS NOT NULL THEN 'Siswa'
          WHEN l.teacher IS NOT NULL THEN 'Guru'
          WHEN l.admin IS NOT NULL THEN 'Admin'
          ELSE 'Unknown'
        END as user_type
      FROM logs l
      LEFT JOIN u_students s ON l.student = s.id
      LEFT JOIN u_teachers t ON l.teacher = t.id
      LEFT JOIN u_admin a ON l.admin = a.id
      ORDER BY l.createdat DESC
      LIMIT 10
    `);

    res.json({
      basicStats: basicStats.rows[0],
      studentsPerGrade: studentsPerGrade.rows,
      teacherComposition: teacherComposition.rows[0],
      examStats: examStats.rows[0],
      learningStats: learningStats.rows[0],
      recentActivities: recentActivities.rows,
      homebaseStats: homebaseStats.rows,
      activityLogs: activityLogs.rows,
    });
  } catch (error) {
    console.error("Error fetching center dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
