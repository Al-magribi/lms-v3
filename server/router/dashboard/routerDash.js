import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = express.Router();

// ======================================
// Admin Dashboard
// ======================================
router.get("/admin-stats", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const homebaseId = req.user.homebase;

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE homebase = $1 AND isactive = true`,
      [homebaseId]
    );

    const activePeriode = periode.rows[0].id;

    // Basic counts
    const basicStats = await client.query(
      `
            SELECT 
                (SELECT COUNT(DISTINCT us.id) 
                 FROM u_students us 
                 JOIN cl_students cs ON us.id = cs.student 
                 WHERE us.homebase = $1 AND us.isactive = true AND cs.periode = $2) as total_students,
                (SELECT COUNT(*) FROM u_teachers WHERE homebase = $1) as total_teachers,
                (SELECT COUNT(*) FROM a_class WHERE homebase = $1) as total_classes,
                (SELECT COUNT(*) FROM c_exam WHERE homebase = $1) as total_exams,
                (SELECT COUNT(*) FROM a_subject WHERE homebase = $1) as total_subjects,
                (SELECT COUNT(*) FROM c_bank WHERE homebase = $1) as total_banks,
                (SELECT COUNT(*) FROM l_chapter WHERE subject IN (SELECT id FROM a_subject WHERE homebase = $1)) as total_chapters,
                (SELECT COUNT(*) FROM l_content WHERE chapter IN (SELECT id FROM l_chapter WHERE subject IN (SELECT id FROM a_subject WHERE homebase = $1))) as total_learning_materials
        `,
      [homebaseId, activePeriode]
    );

    // Students per grade with gender composition
    const studentsPerGrade = await client.query(
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
            WHERE g.homebase = $1 AND us.isactive = true AND s.periode = $2
            GROUP BY g.id, g.name
            ORDER BY g.name
        `,
      [homebaseId, activePeriode]
    );

    // Students per class with gender composition
    const studentsPerClass = await client.query(
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
            WHERE c.homebase = $1 AND us.isactive = true AND s.periode = $2
            GROUP BY c.id, c.name, g.name
            ORDER BY g.name, c.name
        `,
      [homebaseId, activePeriode]
    );

    // Teacher composition by gender and homeroom status
    const teacherComposition = await client.query(
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
    const activityLogs = await client.query(
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
    const recentActivities = await client.query(
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
    const examStats = await client.query(
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
    const learningStats = await client.query(
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

    // Student demographic data untuk admin (filter by homebaseid, ignore null birth_date)
    const studentDemographics = await client.query(
      `
      WITH valid_students AS (
        SELECT
          ds.id,
          ds.gender,
          ds.birth_date,
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, ds.birth_date))::integer as age
        FROM db_student ds
        JOIN u_students us ON ds.nis = us.nis
        WHERE ds.birth_date IS NOT NULL AND ds.homebaseid = $1 AND us.isactive = true
      ),
      age_stats AS (
        SELECT
          MIN(age) as min_age,
          MAX(age) as max_age,
          COUNT(*) as total_students,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
        FROM valid_students
      ),
      -- Create dynamic age ranges based on actual data (filtered by homebase)
      age_ranges AS (
        SELECT
          CASE 
            WHEN age < (SELECT MIN(age) + 2 FROM valid_students)
              THEN concat('<', (SELECT MIN(age) + 2 FROM valid_students))
            WHEN age >= (SELECT MAX(age) - 1 FROM valid_students)
              THEN concat('>', (SELECT MAX(age) - 2 FROM valid_students))
            ELSE concat(
              FLOOR(age/2) * 2, '-', 
              FLOOR(age/2) * 2 + 1
            )
          END as age_group,
          CASE 
            WHEN age < (SELECT MIN(age) + 2 FROM valid_students) THEN 1
            WHEN age >= (SELECT MAX(age) - 1 FROM valid_students) THEN 999
            ELSE FLOOR(age/2) * 2
          END as sort_order,
          id,
          gender,
          age
        FROM valid_students
      ),
      age_distribution_calc AS (
        SELECT
          age_group,
          sort_order,
          COUNT(*) as count
        FROM age_ranges
        GROUP BY age_group, sort_order
        ORDER BY sort_order
      )
      SELECT
        COALESCE((SELECT total_students FROM age_stats), 0) as total_students,
        COALESCE((SELECT male_count FROM age_stats), 0) as male_count,
        COALESCE((SELECT female_count FROM age_stats), 0) as female_count,
        COALESCE((SELECT min_age FROM age_stats), 0) as min_age,
        COALESCE((SELECT max_age FROM age_stats), 0) as max_age,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'age_group', age_group,
            'count', count
          ) ORDER BY sort_order)
           FROM age_distribution_calc),
          '[]'::json
        ) as age_distribution;
    `,
      [homebaseId]
    );

    // Geographical distribution of students
    const geographicalDistribution = await client.query(
      `
      WITH province_stats AS (
        SELECT 
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_province p ON ds.provinceid = p.id
        JOIN u_students us ON ds.nis = us.nis
        WHERE ds.homebaseid = $1 AND us.isactive = true
        GROUP BY p.id, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      city_stats AS (
        SELECT 
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_city c ON ds.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        JOIN u_students us ON ds.nis = us.nis
        WHERE ds.homebaseid = $1 AND us.isactive = true
        GROUP BY c.id, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      district_stats AS (
        SELECT 
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_district d ON ds.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        JOIN u_students us ON ds.nis = us.nis
        WHERE ds.homebaseid = $1 AND us.isactive = true
        GROUP BY d.id, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      village_stats AS (
        SELECT 
          v.name as village_name,
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_village v ON ds.villageid = v.id
        JOIN db_district d ON v.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        JOIN u_students us ON ds.nis = us.nis
        WHERE ds.homebaseid = $1 AND us.isactive = true
        GROUP BY v.id, v.name, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      )
      SELECT 
        json_build_object(
          'provinces', (SELECT json_agg(province_stats) FROM province_stats),
          'cities', (SELECT json_agg(city_stats) FROM city_stats),
          'districts', (SELECT json_agg(district_stats) FROM district_stats),
          'villages', (SELECT json_agg(village_stats) FROM village_stats)
        ) as geographical_data
      `,
      [homebaseId]
    );

    // Student data completeness by grade
    const studentCompleteness = await client.query(
      `
      WITH student_data AS (
        SELECT 
          g.name as grade_name,
          COUNT(DISTINCT s.id) as total_students,
          COUNT(DISTINCT CASE 
            WHEN ds.id IS NOT NULL THEN
              CASE 
                WHEN ds.name IS NOT NULL AND
                     ds.nis IS NOT NULL AND
                     ds.nisn IS NOT NULL AND
                     ds.gender IS NOT NULL AND
                     ds.birth_place IS NOT NULL AND
                     ds.birth_date IS NOT NULL AND
                     ds.height IS NOT NULL AND
                     ds.weight IS NOT NULL AND
                     ds.head IS NOT NULL AND
                     ds.order_number IS NOT NULL AND
                     ds.siblings IS NOT NULL AND
                     ds.address IS NOT NULL AND
                     ds.father_name IS NOT NULL AND
                     ds.mother_name IS NOT NULL AND
                     ds.province_name IS NOT NULL AND
                     ds.city_name IS NOT NULL AND
                     ds.district_name IS NOT NULL AND
                     ds.village_name IS NOT NULL AND
                     EXISTS (SELECT 1 FROM db_family df WHERE df.userid = s.id)
                THEN s.id END
            END
          ) as complete_students
        FROM u_students s
        LEFT JOIN db_student ds ON s.id = ds.userid
        LEFT JOIN cl_students cs ON s.id = cs.student
        LEFT JOIN a_class c ON cs.classid = c.id
        LEFT JOIN a_grade g ON c.grade = g.id
        WHERE s.homebase = $1 AND s.isactive = true AND cs.periode = $2
        GROUP BY g.name
        ORDER BY CAST(g.name AS INTEGER)
      )
      SELECT * FROM student_data
      `,
      [homebaseId, activePeriode]
    );

    // Student entry statistics
    const entryStats = await client.query(
      `
      SELECT 
        e.name as entry_name,
        COUNT(*) as student_count
      FROM db_student ds
      JOIN a_periode e ON ds.entryid = e.id
      WHERE ds.homebaseid = $1
      GROUP BY e.name
      ORDER BY e.name
      `,
      [homebaseId]
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
      studentDemographics: studentDemographics.rows[0],
      geographicalDistribution: geographicalDistribution.rows[0],
      studentCompleteness: studentCompleteness.rows,
      entryStats: entryStats.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

// ======================================
// Teacher Dashboard
// ======================================

// Teacher Dashboard Stats
router.get("/teacher-stats", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const teacherId = req.user.id;
    const homebaseId = req.user.homebase;

    // Get teacher's subjects and classes
    const teachingStats = await client.query(
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
    const recentExams = await client.query(
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
    const recentMaterials = await client.query(
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
  } finally {
    client.release();
  }
});

// ======================================
// Student Dashboard
// ======================================
router.get("/student-stats", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const studentId = req.user.id;
    const homebaseId = req.user.homebase;
    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true`
    );
    const activePeriode = periode.rows[0];

    // Get student's class and subjects (Fixed Query)
    const studentInfo = await client.query(
      `
      SELECT 
        c.name as class_name,
        g.name as grade_name,
        m.name as major_name,
        (SELECT COUNT(DISTINCT ch.subject) 
         FROM l_chapter ch
         JOIN l_cclass lc ON lc.chapter = ch.id
         WHERE lc.classid = cs.classid) as total_subjects
      FROM cl_students cs
      JOIN a_class c ON cs.classid = c.id
      JOIN a_grade g ON c.grade = g.id
      LEFT JOIN a_major m ON c.major = m.id
      WHERE cs.student = $1 AND cs.homebase = $2 AND cs.periode = $3
      GROUP BY c.id, c.name, g.name, m.name, cs.classid
      `,
      [studentId, homebaseId, activePeriode.id]
    );

    // Get upcoming exams (No changes needed)
    const upcomingExams = await client.query(
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

    // Get recent learning materials (No changes needed)
    const recentMaterials = await client.query(
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

    // Get Quran learning progress (No changes needed)
    const quranProgress = await client.query(
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
  } finally {
    client.release();
  }
});

// ======================================
// Parent Dashboard
// ======================================
router.get("/parent-stats", authorize("parent"), async (req, res) => {
  const client = await pool.connect();
  try {
    const parentId = req.user.id;
    const homebaseId = req.user.homebase;

    // First, get the student ID linked to this parent account
    const parentStudentQuery = await client.query(
      `SELECT studentid FROM u_parents WHERE id = $1`,
      [parentId]
    );

    if (parentStudentQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Parent account not found or no student linked" });
    }

    const studentId = parentStudentQuery.rows[0].studentid;

    // Get Quran learning progress for the child
    const quranProgress = await client.query(
      `
      SELECT 
        st.id as student_id,
        st.name as student_name,
        c.name as class_name,
        g.name as grade_name,
        COUNT(DISTINCT p.juz_id) as completed_juz,
        COUNT(DISTINCT p.surah_id) as completed_surah,
        MAX(p.createdat) as last_activity
      FROM u_students st
      LEFT JOIN cl_students cs ON st.id = cs.student
      LEFT JOIN a_class c ON cs.classid = c.id
      LEFT JOIN a_grade g ON c.grade = g.id
      LEFT JOIN t_process p ON st.id = p.userid
      WHERE st.id = $1
      GROUP BY st.id, st.name, c.name, g.name
      `,
      [studentId]
    );

    res.json({
      quranProgress: quranProgress.rows,
    });
  } catch (error) {
    console.error("Error fetching parent dashboard stats:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ======================================
// Center Dashboard (Admin Pusat)
// ======================================
router.get("/center-stats", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    // Combine multiple basic stats into a single query
    const basicStats = await client.query(`
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

    // Combine students per grade and teacher composition in one query
    const gradeAndTeacherStats = await client.query(`
      WITH grade_stats AS (
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
      ),
      teacher_stats AS (
        SELECT 
          COUNT(*) as total_teachers,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count,
          COUNT(CASE WHEN homeroom = true THEN 1 END) as homeroom_count
        FROM u_teachers
      ),
      grade_stats_json AS (
        SELECT json_agg(grade_stats) as grade_stats
        FROM grade_stats
      ),
      teacher_stats_json AS (
        SELECT row_to_json(teacher_stats) as teacher_stats
        FROM teacher_stats
      )
      SELECT 
        json_build_object(
          'grade_stats', (SELECT grade_stats FROM grade_stats_json),
          'teacher_stats', (SELECT teacher_stats FROM teacher_stats_json)
        ) as combined_stats
    `);

    // Combine exam and learning stats
    const examAndLearningStats = await client.query(`
      WITH exam_stats AS (
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
      ),
      learning_stats AS (
        SELECT 
          COUNT(DISTINCT ch.id) as total_chapters,
          COUNT(DISTINCT co.id) as total_contents,
          COUNT(DISTINCT f.id) as total_files,
          COUNT(DISTINCT ch.teacher) as teacher_count
        FROM l_chapter ch
        LEFT JOIN l_content co ON co.chapter = ch.id
        LEFT JOIN l_file f ON f.content = co.id
      ),
      exam_stats_json AS (
        SELECT row_to_json(exam_stats) as exam_stats
        FROM exam_stats
      ),
      learning_stats_json AS (
        SELECT row_to_json(learning_stats) as learning_stats
        FROM learning_stats
      )
      SELECT 
        json_build_object(
          'exam_stats', (SELECT exam_stats FROM exam_stats_json),
          'learning_stats', (SELECT learning_stats FROM learning_stats_json)
        ) as combined_stats
    `);

    // Optimized recent activities query
    const recentActivities = await client.query(`
      SELECT 
        'exam' as type,
        e.name as title,
        t.name as teacher_name,
        e.createdat
      FROM c_exam e
      JOIN u_teachers t ON e.teacher = t.id
      WHERE e.createdat >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'subject' as type,
        s.name as title,
        t.name as teacher_name,
        s.createdat
      FROM a_subject s
      JOIN at_subject ats ON ats.subject = s.id
      JOIN u_teachers t ON ats.teacher = t.id
      WHERE s.createdat >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'chapter' as type,
        ch.title as title,
        t.name as teacher_name,
        ch.createdat
      FROM l_chapter ch
      JOIN u_teachers t ON ch.teacher = t.id
      WHERE ch.createdat >= NOW() - INTERVAL '7 days'
      ORDER BY createdat DESC
      LIMIT 10
    `);

    // Optimized homebase statistics
    const homebaseStats = await client.query(`
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

    // Optimized activity logs with LIMIT
    const activityLogs = await client.query(`
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

    // Simplified student demographics query
    const studentDemographics = await client.query(`
      WITH age_data AS (
        SELECT
          gender,
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::integer as age
        FROM db_student
        WHERE birth_date IS NOT NULL
      ),
      age_stats AS (
        SELECT
          MIN(age) as min_age,
          MAX(age) as max_age,
          COUNT(*) as total_students,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
        FROM age_data
      ),
      age_distribution AS (
        SELECT
          CASE 
            WHEN age < 8 THEN '<8'
            WHEN age >= 18 THEN '>17'
            ELSE concat(FLOOR(age/2) * 2, '-', FLOOR(age/2) * 2 + 1)
          END as age_group,
          COUNT(*) as count
        FROM age_data
        GROUP BY 
          CASE 
            WHEN age < 8 THEN '<8'
            WHEN age >= 18 THEN '>17'
            ELSE concat(FLOOR(age/2) * 2, '-', FLOOR(age/2) * 2 + 1)
          END
        ORDER BY age_group
      ),
      age_distribution_json AS (
        SELECT json_agg(json_build_object('age_group', age_group, 'count', count)) as age_distribution
        FROM age_distribution
      )
      SELECT
        (SELECT total_students FROM age_stats) as total_students,
        (SELECT male_count FROM age_stats) as male_count,
        (SELECT female_count FROM age_stats) as female_count,
        (SELECT min_age FROM age_stats) as min_age,
        (SELECT max_age FROM age_stats) as max_age,
        (SELECT age_distribution FROM age_distribution_json) as age_distribution
    `);

    // Optimized geographical distribution
    const geographicalDistribution = await client.query(`
      WITH province_stats AS (
        SELECT 
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_province p ON ds.provinceid = p.id
        GROUP BY p.id, p.name
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ),
      city_stats AS (
        SELECT 
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_city c ON ds.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY c.id, c.name, p.name
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ),
      district_stats AS (
        SELECT 
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_district d ON ds.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY d.id, d.name, c.name, p.name
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ),
      village_stats AS (
        SELECT 
          v.name as village_name,
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_village v ON ds.villageid = v.id
        JOIN db_district d ON v.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY v.id, v.name, d.name, c.name, p.name
        ORDER BY COUNT(*) DESC
        LIMIT 5
      )
      SELECT 
        json_build_object(
          'provinces', (SELECT json_agg(province_stats) FROM province_stats),
          'cities', (SELECT json_agg(city_stats) FROM city_stats),
          'districts', (SELECT json_agg(district_stats) FROM district_stats),
          'villages', (SELECT json_agg(village_stats) FROM village_stats)
        ) as geographical_data
    `);

    // Simplified student completeness query
    const studentCompleteness = await client.query(`
      SELECT 
        g.name as grade_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE 
          WHEN ds.id IS NOT NULL AND ds.name IS NOT NULL AND ds.nis IS NOT NULL 
          THEN s.id END
        ) as complete_students
      FROM u_students s
      LEFT JOIN db_student ds ON s.id = ds.userid
      LEFT JOIN cl_students cs ON s.id = cs.student
      LEFT JOIN a_class c ON cs.classid = c.id
      LEFT JOIN a_grade g ON c.grade = g.id
      GROUP BY g.name
      ORDER BY CAST(g.name AS INTEGER)
    `);

    // Student entry statistics
    const entryStats = await client.query(`
      SELECT 
        e.name as entry_name,
        COUNT(*) as student_count
      FROM db_student ds
      JOIN a_periode e ON ds.entryid = e.id
      GROUP BY e.name
      ORDER BY e.name
    `);

    // Parse the combined results
    const gradeAndTeacherData = gradeAndTeacherStats.rows[0].combined_stats;
    const examAndLearningData = examAndLearningStats.rows[0].combined_stats;

    res.json({
      basicStats: basicStats.rows[0],
      studentsPerGrade: gradeAndTeacherData.grade_stats || [],
      teacherComposition: gradeAndTeacherData.teacher_stats || {},
      examStats: examAndLearningData.exam_stats || {},
      learningStats: examAndLearningData.learning_stats || {},
      recentActivities: recentActivities.rows,
      homebaseStats: homebaseStats.rows,
      activityLogs: activityLogs.rows,
      studentDemographics: studentDemographics.rows[0],
      geographicalDistribution: geographicalDistribution.rows[0],
      studentCompleteness: studentCompleteness.rows,
      entryStats: entryStats.rows,
    });
  } catch (error) {
    console.error("Error fetching center dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.get("/center-basic-stats", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM u_students) as total_students,
        (SELECT COUNT(*) FROM u_teachers) as total_teachers,
        (SELECT COUNT(*) FROM a_class) as total_classes,
        (SELECT COUNT(*) FROM a_homebase) as total_homebase
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching basic stats:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.get("/center-homebase-stats", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { homebaseId } = req.query;

    const result = await client.query(
      `
      WITH active_periode AS (
        SELECT id, homebase
        FROM a_periode
        WHERE isactive = true
      ),
      homebase_stats AS (
        SELECT 
          h.id as homebase_id,
          h.name as homebase_name,
          COUNT(DISTINCT cs.id) as total_students,
          COUNT(DISTINCT t.id) as total_teachers,
          COUNT(DISTINCT c.id) as total_classes,
          COUNT(DISTINCT s.id) as total_subjects
        FROM a_homebase h
        LEFT JOIN cl_students cs ON cs.homebase = h.id 
          AND cs.periode = (SELECT id FROM active_periode ap WHERE ap.homebase = h.id LIMIT 1)
        LEFT JOIN u_teachers t ON t.homebase = h.id
        LEFT JOIN a_class c ON c.homebase = h.id
        LEFT JOIN a_subject s ON s.homebase = h.id
        ${homebaseId ? "WHERE h.id = $1" : ""}
        GROUP BY h.id, h.name
      ),
      teacher_stats AS (
        SELECT 
          homebase,
          COUNT(*) as total_teachers,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
        FROM u_teachers
        ${homebaseId ? "WHERE homebase = $1" : ""}
        GROUP BY homebase
      ),
      grade_stats AS (
        SELECT 
          g.homebase,
          g.id as grade_id,
          g.name as grade_name,
          COUNT(DISTINCT cs.id) as students_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN cs.id END) as male_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN cs.id END) as female_count
        FROM a_grade g
        LEFT JOIN a_class c ON c.grade = g.id
        LEFT JOIN cl_students cs ON cs.classid = c.id
          AND cs.periode = (SELECT id FROM active_periode ap WHERE ap.homebase = g.homebase LIMIT 1)
        LEFT JOIN u_students us ON us.id = cs.student
        ${homebaseId ? "WHERE g.homebase = $1" : ""}
        GROUP BY g.homebase, g.id, g.name
      ),
      class_stats AS (
        SELECT 
          c.grade,
          c.id as class_id,
          c.name as class_name,
          COUNT(DISTINCT cs.id) as students_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN cs.id END) as male_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN cs.id END) as female_count
        FROM a_class c
        LEFT JOIN cl_students cs ON cs.classid = c.id
          AND cs.periode = (SELECT id FROM active_periode ap WHERE ap.homebase = c.homebase LIMIT 1)
        LEFT JOIN u_students us ON us.id = cs.student
        ${homebaseId ? "WHERE c.homebase = $1" : ""}
        GROUP BY c.grade, c.id, c.name
        HAVING COUNT(cs.id) > 0 -- hanya kelas yang punya siswa
      )
      SELECT 
        h.homebase_id,
        h.homebase_name,
        h.total_students,
        h.total_teachers,
        h.total_classes,
        h.total_subjects,
        json_build_object(
          'male_count', COALESCE(t.male_count,0),
          'female_count', COALESCE(t.female_count,0)
        ) as teacher_stats,
        (
          SELECT json_agg(
            json_build_object(
              'grade_name', g.grade_name,
              'students_count', g.students_count,
              'male_count', g.male_count,
              'female_count', g.female_count,
              'class_stats', (
                SELECT json_agg(
                  json_build_object(
                    'class_name', c.class_name,
                    'students_count', c.students_count,
                    'male_count', c.male_count,
                    'female_count', c.female_count
                  )
                )
                FROM class_stats c
                WHERE c.grade = g.grade_id
              )
            )
          )
          FROM grade_stats g
          WHERE g.homebase = h.homebase_id
        ) as students_stats
      FROM homebase_stats h
      LEFT JOIN teacher_stats t ON t.homebase = h.homebase_id
      ORDER BY h.homebase_name
      `,
      homebaseId ? [homebaseId] : []
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching grades-teachers-homebase stats:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.get(
  "/homebase-stats",
  authorize("center", "admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const homebase = req.user.homebase;

      const result = await client.query(
        `
      WITH active_periode AS (
        SELECT id, homebase
        FROM a_periode
        WHERE isactive = true
      ),
      homebase_stats AS (
        SELECT 
          h.id as homebase_id,
          h.name as homebase_name,
          COUNT(DISTINCT cs.id) as total_students,
          COUNT(DISTINCT t.id) as total_teachers,
          COUNT(DISTINCT c.id) as total_classes,
          COUNT(DISTINCT s.id) as total_subjects
        FROM a_homebase h
        LEFT JOIN cl_students cs ON cs.homebase = h.id 
          AND cs.periode = (SELECT id FROM active_periode ap WHERE ap.homebase = h.id LIMIT 1)
        LEFT JOIN u_teachers t ON t.homebase = h.id
        LEFT JOIN a_class c ON c.homebase = h.id
        LEFT JOIN a_subject s ON s.homebase = h.id
        ${homebase ? "WHERE h.id = $1" : ""}
        GROUP BY h.id, h.name
      ),
      teacher_stats AS (
        SELECT 
          homebase,
          COUNT(*) as total_teachers,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
        FROM u_teachers
        ${homebase ? "WHERE homebase = $1" : ""}
        GROUP BY homebase
      ),
      grade_stats AS (
        SELECT 
          g.homebase,
          g.id as grade_id,
          g.name as grade_name,
          COUNT(DISTINCT cs.id) as students_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN cs.id END) as male_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN cs.id END) as female_count
        FROM a_grade g
        LEFT JOIN a_class c ON c.grade = g.id
        LEFT JOIN cl_students cs ON cs.classid = c.id
          AND cs.periode = (SELECT id FROM active_periode ap WHERE ap.homebase = g.homebase LIMIT 1)
        LEFT JOIN u_students us ON us.id = cs.student
        ${homebase ? "WHERE g.homebase = $1" : ""}
        GROUP BY g.homebase, g.id, g.name
      ),
      class_stats AS (
        SELECT 
          c.grade,
          c.id as class_id,
          c.name as class_name,
          COUNT(DISTINCT cs.id) as students_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN cs.id END) as male_count,
          COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN cs.id END) as female_count
        FROM a_class c
        LEFT JOIN cl_students cs ON cs.classid = c.id
          AND cs.periode = (SELECT id FROM active_periode ap WHERE ap.homebase = c.homebase LIMIT 1)
        LEFT JOIN u_students us ON us.id = cs.student
        ${homebase ? "WHERE c.homebase = $1" : ""}
        GROUP BY c.grade, c.id, c.name
        HAVING COUNT(cs.id) > 0 -- hanya kelas yang punya siswa
      )
      SELECT 
        h.homebase_id,
        h.homebase_name,
        h.total_students,
        h.total_teachers,
        h.total_classes,
        h.total_subjects,
        json_build_object(
          'male_count', COALESCE(t.male_count,0),
          'female_count', COALESCE(t.female_count,0)
        ) as teacher_stats,
        (
          SELECT json_agg(
            json_build_object(
              'grade_name', g.grade_name,
              'students_count', g.students_count,
              'male_count', g.male_count,
              'female_count', g.female_count,
              'class_stats', (
                SELECT json_agg(
                  json_build_object(
                    'class_name', c.class_name,
                    'students_count', c.students_count,
                    'male_count', c.male_count,
                    'female_count', c.female_count
                  )
                )
                FROM class_stats c
                WHERE c.grade = g.grade_id
              )
            )
          )
          FROM grade_stats g
          WHERE g.homebase = h.homebase_id
        ) as students_stats
      FROM homebase_stats h
      LEFT JOIN teacher_stats t ON t.homebase = h.homebase_id
      ORDER BY h.homebase_name
      `,
        homebase ? [homebase] : []
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching grades-teachers-homebase stats:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  }
);

// ======================================
// Home Infograpis
// ======================================

router.get("/infografis", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const geographicalDistribution = await pool.query(`
      WITH province_stats AS (
        SELECT 
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_province p ON ds.provinceid = p.id
        GROUP BY p.id, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      city_stats AS (
        SELECT 
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_city c ON ds.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY c.id, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      district_stats AS (
        SELECT 
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_district d ON ds.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY d.id, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      village_stats AS (
        SELECT 
          v.name as village_name,
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_village v ON ds.villageid = v.id
        JOIN db_district d ON v.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY v.id, v.name, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      )
      SELECT 
        json_build_object(
          'provinces', (SELECT json_agg(province_stats) FROM province_stats),
          'cities', (SELECT json_agg(city_stats) FROM city_stats),
          'districts', (SELECT json_agg(district_stats) FROM district_stats),
          'villages', (SELECT json_agg(village_stats) FROM village_stats)
        ) as geographical_data
    `);

    res.json(geographicalDistribution.rows[0].geographical_data);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching infografis:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
