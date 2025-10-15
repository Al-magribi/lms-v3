import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

const getMonthNumber = (monthName) => {
  const months = {
    januari: 1,
    februari: 2,
    maret: 3,
    april: 4,
    mei: 5,
    juni: 6,
    juli: 7,
    agustus: 8,
    september: 9,
    oktober: 10,
    november: 11,
    desember: 12,
  };
  return months[monthName.toLowerCase()];
};

// Filter
router.get("/categories", async (req, res) => {
  const client = await pool.connect();
  try {
    const homebase = req.user.homebase;
    const results = await client.query(
      `SELECT * FROM a_category
    WHERE homebase = $1`,
      [homebase]
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/branches", async (req, res) => {
  try {
    const { categoryid } = req.query;
    const homebase = req.user.homebase;

    const results = await client.query(
      `SELECT *
    FORM a_branch WHERE categoryid = $1 AND homebase = $2`,
      [categoryid, homebase]
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Rekap nilai perchapter perbulan VIEW GURU
router.get(
  "/chapter-final-score",
  authorize("teacher", "admin"),
  async (req, res) => {
    const {
      classid,
      subjectid, // subjectId akan digunakan untuk filter yang lebih akurat
      chapterid,
      month, // Nama bulan, e.g., "september"
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    // Menambahkan validasi untuk subjectId demi akurasi
    if (!classid || !chapterid || !month || !subjectid) {
      return res.status(400).json({
        message:
          "Parameter classid, subjectId, chapterid, dan month wajib diisi.",
      });
    }

    const client = await pool.connect();
    try {
      // --- Langkah 1: Dapatkan Periode Aktif ---
      const periodeRes = await client.query(
        `SELECT id FROM a_periode WHERE homebase = $1 AND isactive = true`,
        [req.user.homebase]
      );
      if (periodeRes.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Periode aktif tidak ditemukan." });
      }
      const periode = periodeRes.rows[0].id;

      // --- Langkah 2: Siapkan Parameter ---
      const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchPattern = `%${search}%`;

      // --- Langkah 3: Query Utama yang Komprehensif ---
      const mainQuery = `
        WITH ChapterInfo AS (
          SELECT
            lc.teacher AS teacher_id,
            lc.subject AS subject_id
          FROM l_chapter lc
          WHERE lc.id = $1
        ),
        StudentList AS (
          -- Mengambil daftar siswa yang terdaftar di kelas pada periode aktif
          SELECT
            cs.student AS student_id,
            cs.student_name
          FROM cl_students cs
          WHERE cs.classid = $2 AND cs.periode = $3 AND cs.student_name ILIKE $4
        ),
        TotalSessions AS (
          -- Menghitung total pertemuan untuk subject dan kelas yang spesifik
          SELECT COUNT(DISTINCT la.day_date)::NUMERIC AS total_meetings
          FROM l_attendance la
          WHERE la.classid = $2
            AND la.subjectid = $9 -- Filter berdasarkan subjectId
            AND EXTRACT(MONTH FROM la.day_date) = $5
            AND la.periode = $3
        ),
        AttendanceRaw AS (
          -- Menghitung persentase kehadiran untuk setiap siswa dengan benar
          SELECT
            sl.student_id,
            -- Menghitung jumlah 'Hadir' hanya untuk subject yang relevan
            (COUNT(att.id) FILTER (WHERE att.note = 'Hadir'))::NUMERIC * 100.0 / NULLIF((SELECT total_meetings FROM TotalSessions), 0) AS percentage
          FROM StudentList sl
          LEFT JOIN l_attendance att ON sl.student_id = att.studentid
            AND att.classid = $2
            AND att.periode = $3
            AND EXTRACT(MONTH FROM att.day_date) = $5
            AND att.subjectid = $9 -- FIX: Tambahkan filter subjectid di sini
          GROUP BY sl.student_id
        ),
        AttitudeRaw AS (
          -- Mengambil nilai sikap
          SELECT la.student_id, la.rata_rata AS score
          FROM l_attitude la
          JOIN ChapterInfo ci ON la.teacher_id = ci.teacher_id
          WHERE la.class_id = $2
            AND la.chapter_id = $1
            AND LOWER(la.month) = LOWER($6)
        ),
        DailyRaw AS (
          -- Mengambil nilai harian (formatif + sumatif)
          SELECT student_id, AVG(rata_rata) AS score
          FROM (
            SELECT lf.student_id, lf.rata_rata
            FROM l_formative lf JOIN ChapterInfo ci ON lf.teacher_id = ci.teacher_id
            WHERE lf.class_id = $2 AND lf.chapter_id = $1 AND LOWER(lf.month) = LOWER($6)
            UNION ALL
            SELECT ls.student_id, ls.rata_rata
            FROM l_summative ls JOIN ChapterInfo ci ON ls.teacher_id = ci.teacher_id
            WHERE ls.class_id = $2 AND ls.chapter_id = $1 AND LOWER(ls.month) = LOWER($6)
          ) AS combined_scores
          GROUP BY student_id
        )
        -- --- Final Select: Menggabungkan Semua Data dan Mengaplikasikan Bobot ---
        SELECT
          sl.student_id,
          sl.student_name AS nama_siswa,
          -- Skor kehadiran yang sudah dibobotkan
          COALESCE(ar.percentage * w.presensi / 100.0, 0) AS kehadiran,
          -- Skor sikap yang sudah dibobotkan
          COALESCE(atr.score * w.attitude / 100.0, NULL) AS sikap,
          -- Skor harian yang sudah dibobotkan
          COALESCE(dr.score * w.daily / 100.0, NULL) AS harian,
          -- Nilai akhir gabungan
          (
            COALESCE(ar.percentage * w.presensi / 100.0, 0) +
            COALESCE(atr.score * w.attitude / 100.0, 0) +
            COALESCE(dr.score * w.daily / 100.0, 0)
          ) AS nilai_akhir
        FROM StudentList sl
        CROSS JOIN ChapterInfo ci
        LEFT JOIN l_weighting w ON w.teacherid = ci.teacher_id AND w.subjectid = ci.subject_id
        LEFT JOIN AttendanceRaw ar ON sl.student_id = ar.student_id
        LEFT JOIN AttitudeRaw atr ON sl.student_id = atr.student_id
        LEFT JOIN DailyRaw dr ON sl.student_id = dr.student_id
        ORDER BY sl.student_name ASC
        LIMIT $7 OFFSET $8;
      `;

      const totalQuery = `
        SELECT COUNT(*) FROM cl_students
        WHERE classid = $1 AND periode = $2 AND student_name ILIKE $3;
      `;

      const queryParams = [
        chapterid, // $1
        classid, // $2
        periode, // $3
        searchPattern, // $4
        monthNumber, // $5
        month, // $6
        limit, // $7
        offset, // $8
        subjectid, // $9 (parameter baru untuk query)
      ];

      // Menjalankan kedua query secara paralel
      const resultsPromise = client.query(mainQuery, queryParams);
      const totalPromise = client.query(totalQuery, [
        classid,
        periode,
        searchPattern,
      ]);
      const [resultsRes, totalRes] = await Promise.all([
        resultsPromise,
        totalPromise,
      ]);

      const totalData = parseInt(totalRes.rows[0].count);

      // --- Langkah 4: Format Hasil ---
      const formattedResults = resultsRes.rows.map((row) => ({
        student_id: row.student_id,
        student_name: row.nama_siswa,
        attendance: parseFloat(row.kehadiran).toFixed(2),
        attitude:
          row.sikap != null
            ? parseFloat(row.sikap).toFixed(2)
            : "Tidak ada nilai",
        daily:
          row.harian != null
            ? parseFloat(row.harian).toFixed(2)
            : "Tidak ada nilai",
        final_score: parseFloat(row.nilai_akhir).toFixed(2),
      }));

      res.status(200).json({
        results: formattedResults,
        totalData: totalData,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalData / parseInt(limit)),
      });
    } catch (error) {
      console.error("Error di endpoint /chapter-final-score:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    } finally {
      client.release();
    }
  }
);

// Rekap Nilai VIEW Orang Tua
router.get("/monthly-recap", async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId, month, periode } = req.query;

    if (!studentId || !month || !periode) {
      return res.status(400).json({
        message: "Parameter studentId, month, dan periode wajib diisi.",
      });
    }

    const monthNumber = getMonthNumber(month);
    if (monthNumber === 0) {
      return res.status(400).json({ message: "Nama bulan tidak valid." });
    }

    // --- QUERY BARU UNTUK MENGAMBIL DATA PER-CHAPTER ---
    const query = `
        WITH StudentClass AS (
            -- Mengambil classid siswa untuk periode ini
            SELECT classid FROM cl_students WHERE student = $1 AND periode = $2
        ),
        ChapterScores AS (
            -- Mengagregasi semua skor pada level chapter
            SELECT
                lc.subject AS subject_id,
                s.name AS subject_name,
                cat.name AS category_name,
                b.name AS branch_name,
                t.name AS teacher_name,
                lc.id AS chapter_id,
                lc.title AS chapter_name,
                w.presensi,
                w.attitude,
                w.daily,

                -- 1. Kehadiran per Chapter (dihitung berdasarkan subject di kelas siswa)
                TRUNC(
                    (COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Hadir')) * 100.0 /
                    NULLIF((SELECT COUNT(DISTINCT day_date) FROM l_attendance
                            WHERE subjectid = lc.subject AND classid = sc.classid AND periode = $2 AND EXTRACT(MONTH FROM day_date) = $3), 0)
                , 0) AS attendance_percentage,
                
                -- Detail Kehadiran
                COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Hadir') AS hadir,
                COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Sakit') AS sakit,
                COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Ijin') AS ijin,
                COUNT(DISTINCT attd.id) FILTER (WHERE attd.note = 'Alpa') AS alpa,

                -- 2. Sikap per Chapter
                COALESCE(AVG(att.rata_rata), 0) AS avg_attitude,
                COALESCE(AVG(att.kinerja), 0) AS kinerja,
                COALESCE(AVG(att.kedisiplinan), 0) AS kedisiplinan,
                COALESCE(AVG(att.keaktifan), 0) AS keaktifan,
                COALESCE(AVG(att.percaya_diri), 0) AS percaya_diri,
                string_agg(DISTINCT att.catatan_guru, ' | ') as note,

                -- 3. Harian per Chapter (Gabungan Formatif & Sumatif)
                COALESCE(
                    (SELECT AVG(rata_rata) FROM (
                        SELECT rata_rata FROM l_formative WHERE student_id = $1 AND chapter_id = lc.id AND month = $4
                        UNION ALL
                        SELECT rata_rata FROM l_summative WHERE student_id = $1 AND chapter_id = lc.id AND month = $4
                    ) AS daily_scores), 0
                ) AS avg_daily_score,

                -- Detail Sumatif & Formatif
                COALESCE(AVG(sm.oral), 0) AS oral,
                COALESCE(AVG(sm.written), 0) AS written,
                COALESCE(AVG(sm.project), 0) AS project,
                COALESCE(AVG(sm.performance), 0) AS performance,
                jsonb_agg(DISTINCT f.rata_rata) FILTER (WHERE f.rata_rata IS NOT NULL) AS formative_scores

            FROM l_chapter lc
            JOIN l_cclass lcc ON lc.id = lcc.chapter
            JOIN a_subject s ON lc.subject = s.id
            JOIN u_teachers t ON lc.teacher = t.id
            JOIN StudentClass sc ON lcc.classid = sc.classid
            LEFT JOIN a_category cat ON s.categoryid = cat.id
            LEFT JOIN a_branch b ON s.branchid = b.id
            LEFT JOIN l_weighting w ON lc.teacher = w.teacherid AND s.id = w.subjectid
            -- Joins untuk mendapatkan data nilai
            LEFT JOIN l_attendance attd ON s.id = attd.subjectid AND attd.studentid = $1 AND attd.periode = $2 AND EXTRACT(MONTH FROM attd.day_date) = $3
            LEFT JOIN l_attitude att ON lc.id = att.chapter_id AND att.student_id = $1 AND att.periode_id = $2 AND att.month = $4
            LEFT JOIN l_summative sm ON lc.id = sm.chapter_id AND sm.student_id = $1 AND sm.periode_id = $2 AND sm.month = $4
            LEFT JOIN l_formative f ON lc.id = f.chapter_id AND f.student_id = $1 AND f.periode_id = $2 AND f.month = $4
            -- Filter utama: hanya chapter yang punya nilai di bulan ini untuk siswa ini
            WHERE lcc.classid = sc.classid
              AND (att.id IS NOT NULL OR sm.id IS NOT NULL OR f.id IS NOT NULL)
            GROUP BY lc.id, s.id, t.id, cat.id, b.id, w.id, sc.classid, lc.subject, s.name,
                      cat.name, b.name, t.name, lc.title, w.presensi, w.attitude, w.daily
        )
        -- Final SELECT: Mengambil data siswa dan menggabungkan dengan skor chapter
        SELECT
            s.nis, s.name AS student_name, hb.name AS homebase_name, p.name AS periode_name,
            g.name AS grade_name, c.name AS class_name, th.name AS teacher_homeroom,
            cs.*
        FROM u_students s
        JOIN cl_students cl ON s.id = cl.student
        JOIN a_periode p ON cl.periode = p.id
        JOIN a_class c ON cl.classid = c.id
        JOIN a_homebase hb ON c.homebase = hb.id
        JOIN a_grade g ON c.grade = g.id
        LEFT JOIN u_teachers th ON c.id = th.class AND th.homeroom = TRUE
        -- Left Join agar data siswa tetap muncul meskipun belum ada nilai
        LEFT JOIN ChapterScores cs ON 1=1
        WHERE s.id = $1 AND cl.periode = $2;
    `;

    const { rows } = await client.query(query, [
      studentId,
      periode,
      monthNumber,
      month,
    ]);

    // Jika tidak ada baris data, atau baris pertama tidak punya subject_id, berarti tidak ada nilai sama sekali
    if (rows.length === 0 || !rows[0].subject_id) {
      return res
        .status(404)
        .json({ message: "Data rekapitulasi tidak ditemukan." });
    }

    const studentInfo = {
      month: month,
      nis: rows[0].nis,
      name: rows[0].student_name,
      homebase: rows[0].homebase_name,
      periode: rows[0].periode_name,
      grade: rows[0].grade_name,
      class: rows[0].class_name,
      teacher_homeroom: rows[0].teacher_homeroom || "-",
    };

    // --- STRUKTURISASI DATA BARU DI JAVASCRIPT ---
    const subjectsMap = new Map();

    for (const row of rows) {
      if (!row.subject_id) continue;

      // Hitung nilai akhir per chapter
      const attendanceFinal =
        (Number(row.attendance_percentage) * Number(row.presensi || 0)) / 100;
      const attitudeFinal =
        (Number(row.avg_attitude) * Number(row.attitude || 0)) / 100;
      const dailyFinal =
        (Number(row.avg_daily_score) * Number(row.daily || 0)) / 100;
      const chapterScore = attendanceFinal + attitudeFinal + dailyFinal;

      const chapterData = {
        id: row.chapter_id,
        name: row.chapter_name,
        score: parseFloat(chapterScore.toFixed(2)),
        note: row.note || null,
        detail: [
          {
            attendance: [
              { Hadir: Number(row.hadir || 0) },
              { Sakit: Number(row.sakit || 0) },
              { Ijin: Number(row.ijin || 0) },
              { Alpa: Number(row.alpa || 0) },
              {
                presentase: parseFloat(
                  Number(row.attendance_percentage || 0).toFixed(2)
                ),
              },
            ],
          },
          {
            attitude: [
              { kinerja: parseFloat(Number(row.kinerja || 0).toFixed(2)) },
              {
                kedisiplinan: parseFloat(
                  Number(row.kedisiplinan || 0).toFixed(2)
                ),
              },
              { keaktifan: parseFloat(Number(row.keaktifan || 0).toFixed(2)) },
              {
                percaya_diri: parseFloat(
                  Number(row.percaya_diri || 0).toFixed(2)
                ),
              },
            ],
          },
          {
            summative: [
              { lisan: parseFloat(Number(row.oral || 0).toFixed(2)) },
              { tulis: parseFloat(Number(row.written || 0).toFixed(2)) },
              { proyek: parseFloat(Number(row.project || 0).toFixed(2)) },
              {
                keterampilan: parseFloat(
                  Number(row.performance || 0).toFixed(2)
                ),
              },
            ],
            formative: (row.formative_scores || []).map((val) =>
              parseFloat(Number(val).toFixed(2))
            ),
          },
        ],
      };

      if (!subjectsMap.has(row.subject_id)) {
        subjectsMap.set(row.subject_id, {
          name: row.subject_name,
          teacher: row.teacher_name,
          category_name: row.category_name,
          branch_name: row.branch_name,
          chapters: [],
        });
      }
      subjectsMap.get(row.subject_id).chapters.push(chapterData);
    }

    // Hitung rata-rata nilai mata pelajaran dari total nilai chapter
    const subjectsArray = Array.from(subjectsMap.values()).map((subj) => {
      const totalChapterScore = subj.chapters.reduce(
        (sum, chap) => sum + chap.score,
        0
      );
      const avgSubjectScore =
        subj.chapters.length > 0 ? totalChapterScore / subj.chapters.length : 0;
      return {
        ...subj,
        score: parseFloat(avgSubjectScore.toFixed(2)),
      };
    });

    // Mengelompokkan berdasarkan kategori (logika ini tetap sama)
    const categoriesMap = new Map();
    for (const subjectData of subjectsArray) {
      const categoryName = subjectData.category_name || "Lainnya";
      if (!categoriesMap.has(categoryName)) {
        const isDiniyah = categoryName === "Diniyah";
        categoriesMap.set(categoryName, {
          name: categoryName,
          ...(isDiniyah ? { branch: [] } : { subjects: [] }),
        });
      }
      const category = categoriesMap.get(categoryName);
      if (categoryName === "Diniyah") {
        const branchName = subjectData.branch_name || "Tanpa Rumpun";
        let branch = category.branch.find((b) => b.name === branchName);
        if (!branch) {
          branch = { name: branchName, subjects: [] };
          category.branch.push(branch);
        }
        branch.subjects.push(subjectData);
      } else {
        category.subjects.push(subjectData);
      }
    }

    const categoryArray = Array.from(categoriesMap.values());

    // Hitung rata-rata nilai per rumpun Diniyah
    const diniyahCat = categoryArray.find((c) => c.name === "Diniyah");
    if (diniyahCat) {
      diniyahCat.branch.forEach((b) => {
        const totalScore = b.subjects.reduce((sum, sub) => sum + sub.score, 0);
        b.score =
          b.subjects.length > 0
            ? parseFloat((totalScore / b.subjects.length).toFixed(2))
            : 0;
      });
    }

    // --- LOKASI PENAMBAHAN KODE PENGURUTAN ---

    // 1. Urutkan kategori berdasarkan nama (misal: "Diniyah", "Umum")
    categoryArray.sort((a, b) => a.name.localeCompare(b.name));

    // 2. Urutkan mata pelajaran di dalam setiap kategori dan rumpun
    for (const category of categoryArray) {
      if (category.name === "Diniyah" && category.branch) {
        // Untuk kategori Diniyah, urutkan mata pelajaran di dalam setiap rumpun
        for (const branch of category.branch) {
          branch.subjects.sort((a, b) => a.name.localeCompare(b.name));
        }
        // Anda juga bisa mengurutkan rumpunnya jika perlu
        // category.branch.sort((a, b) => a.name.localeCompare(b.name));
      } else if (category.subjects) {
        // Untuk kategori lain, langsung urutkan mata pelajarannya
        category.subjects.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    // --- AKHIR DARI KODE PENGURUTAN ---

    res.status(200).json({ ...studentInfo, category: categoryArray });
  } catch (error) {
    console.error("Error fetching monthly recap:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

export default router;
