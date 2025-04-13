import { Router } from "express"
import { authorize } from "../../middleware/auth.js"
import { pool } from "../../config/config.js"

const create = "Berhasil disimpan"
const update = "Berhasil diubah"
const remove = "Berhasil dihapus"

const router = Router()

const fetchQueryResults = async (query, params = []) => {
	const client = await pool.connect()
	try {
		const { rows } = await client.query(query, params)
		return rows
	} catch (error) {
		throw new Error(error.message)
	} finally {
		client.release()
	}
}

const buildStudentData = async (rows) => {
	// Gunakan Map untuk memastikan unik data per tanggal dan NIS
	const uniqueResults = new Map()

	for (const row of rows) {
		const dates = await fetchQueryResults(
			`SELECT DISTINCT DATE(createdat) AS date FROM t_scoring WHERE userid = $1 AND type_id = $2`,
			[row.userid, row.type_id]
		)

		for (const date of dates) {
			const uniqueKey = `${row.userid}_${date.date}_${row.type_id}` // Kombinasi unik userid dan tanggal

			if (!uniqueResults.has(uniqueKey)) {
				const surahs = await fetchQueryResults(
					`SELECT * FROM t_process
           INNER JOIN t_surah ON t_process.surah_id = t_surah.id
           WHERE userid = $1 AND DATE(t_process.createdat) = $2 AND type_id = $3
					 ORDER BY t_surah.id ASC`,
					[row.userid, date.date, row.type_id]
				)

				const categories = await fetchQueryResults(
					`SELECT 
            t_scoring.*, 
            t_categories.name, 
            DATE(t_scoring.createdat) AS created_date 
          FROM 
            t_scoring 
          LEFT JOIN 
            t_categories 
          ON 
            t_scoring.category_id = t_categories.id
          WHERE 
            t_scoring.indicator_id IS NULL 
            AND t_scoring.type_id = $1 AND t_scoring.userid = $2 AND DATE(t_scoring.createdat) = $3`,
					[row.type_id, row.userid, date.date]
				)

				const indicators = await fetchQueryResults(
					`SELECT 
            t_scoring.*, 
            t_indicators.name, 
            DATE(t_scoring.createdat) AS created_date 
          FROM 
            t_scoring 
          LEFT JOIN 
            t_indicators 
          ON 
            t_scoring.indicator_id = t_indicators.id
          WHERE 
            t_scoring.indicator_id IS NOT NULL 
            AND t_scoring.type_id = $1 AND t_scoring.userid = $2 AND DATE(t_scoring.createdat) = $3
          ORDER BY 
            t_indicators.name ASC`,
					[row.type_id, row.userid, date.date]
				)

				const scores = categories.map((category) => {
					const relatedIndicators = indicators.filter(
						(indi) => indi.category_id === category.category_id
					)

					return {
						id: category.id,
						category_id: category.category_id,
						category: category.name,
						poin: Number(category.poin),
						date: category.created_date,
						indicators: relatedIndicators.map((indi) => ({
							id: indi.id,
							indicator_id: indi.indicator_id,
							indicator: indi.name,
							poin: indi.poin,
						})),
					}
				})

				const totalPoints = scores.reduce((acc, score) => acc + score.poin, 0)

				uniqueResults.set(uniqueKey, {
					userid: row.userid,
					nis: row.nis,
					name: row.student_name,
					grade: row.grade,
					class: row.class_name,
					scores,
					surahs: surahs.map((surah) => ({
						id: surah.id,
						surah_id: surah.surah_id,
						name: surah.name,
						from_ayat: surah.from_count,
						to_ayat: surah.to_count,
						from_line: surah.from_line,
						to_line: surah.to_line,
					})),
					type_id: row.type_id,
					type: row.type_name,
					examiner: row.examiner_name,
					examiner_id: row.examiner_id,
					totalPoints,
					date: date.date,
				})
			}
		}
	}

	// Return all unique results
	return Array.from(uniqueResults.values()).sort(
		(a, b) => new Date(b.date) - new Date(a.date)
	)
}

router.get("/get-all", async (req, res) => {
	const client = await pool.connect()
	try {
		const { page = 1, limit = 10, search = "", type } = req.query

		// Konversi page dan limit ke angka
		const numericLimit = parseInt(limit, 10)
		const numericOffset = (parseInt(page, 10) - 1) * numericLimit

		// Kondisi tambahan untuk filter berdasarkan type_id
		const typeFilter = type ? "AND t.id = $2" : ""

		// Main query dengan search, type filter, dan pagination
		const mainQuery = `
      SELECT
        us.id AS userid,
        us.nis AS nis,
        us.name AS student_name,
        g.name AS grade,
        c.name AS class_name,
        t.name AS type_name,
        t.id AS type_id,
        e.name AS examiner_name,
        e.id AS examiner_id,
        ts.type_id
      FROM
        u_students us
        INNER JOIN cl_students cs ON us.id = cs.student
        INNER JOIN a_class c ON cs.classid = c.id
        INNER JOIN a_grade g ON c.grade = g.id
        INNER JOIN t_scoring ts ON us.id = ts.userid
        INNER JOIN t_type t ON ts.type_id = t.id
        INNER JOIN t_examiner e ON ts.examiner_id = e.id
      WHERE
        LOWER(us.name) LIKE LOWER($1)
        ${typeFilter}
      GROUP BY
        us.id, us.nis, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.id
      LIMIT ${numericLimit} OFFSET ${numericOffset}
    `

		// Count query dengan search dan type filter
		const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT
          us.id
        FROM
          u_students us
          INNER JOIN cl_students cs ON us.id = cs.student
          INNER JOIN a_class c ON cs.classid = c.id
          INNER JOIN a_grade g ON c.grade = g.id
          INNER JOIN t_scoring ts ON us.id = ts.userid
          INNER JOIN t_type t ON ts.type_id = t.id
          INNER JOIN t_examiner e ON ts.examiner_id = e.id
        WHERE
          LOWER(us.name) LIKE LOWER($1)
          ${typeFilter}
        GROUP BY
          us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.id
      ) AS subquery
    `

		// Menyusun parameter secara dinamis
		const params = [`%${search}%`]
		if (type) {
			params.push(type) // Tambahkan type jika ada
		}

		// Eksekusi query utama
		const rows = await fetchQueryResults(mainQuery, params)

		// Eksekusi query untuk menghitung total data
		const countResult = await fetchQueryResults(countQuery, params)

		const totalData = parseInt(countResult[0]?.total || 0, 10)
		const totalPages = Math.ceil(totalData / numericLimit)

		// Memproses data untuk laporan
		const report = await buildStudentData(rows)

		res.status(200).json({
			report,
			totalData,
			totalPages,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-report/:userid", async (req, res) => {
	const client = await pool.connect()
	try {
		const { userid } = req.params
		const { page = 1, limit = 10 } = req.query

		// Konversi page dan limit ke angka
		const numericLimit = parseInt(limit, 10)
		const numericOffset = (parseInt(page, 10) - 1) * numericLimit

		// Main query untuk mendapatkan data siswa berdasarkan userid dengan paginasi
		const mainQuery = `
      SELECT
        us.id AS userid,
        us.name AS student_name,
        g.name AS grade,
        c.name AS class_name,
        t.name AS type_name,
        t.id AS type_id,
        e.name AS examiner_name,
        e.id AS examiner_id,
        ts.type_id
      FROM
        u_students us
        INNER JOIN cl_students cs ON us.id = cs.student
        INNER JOIN a_class c ON cs.classid = c.id
        INNER JOIN a_grade g ON c.grade = g.id
        INNER JOIN t_scoring ts ON us.id = ts.userid
        INNER JOIN t_type t ON ts.type_id = t.id
        INNER JOIN t_examiner e ON ts.examiner_id = e.id
      WHERE
        us.id = $1
      GROUP BY
        us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.name
      LIMIT ${numericLimit} OFFSET ${numericOffset}
    `

		// Count query untuk menghitung total data
		const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT
          us.id
        FROM
          u_students us
          INNER JOIN cl_students cs ON us.id = cs.student
          INNER JOIN a_class c ON cs.classid = c.id
          INNER JOIN a_grade g ON c.grade = g.id
          INNER JOIN t_scoring ts ON us.id = ts.userid
          INNER JOIN t_type t ON ts.type_id = t.id
          INNER JOIN t_examiner e ON ts.examiner_id = e.id
        WHERE
          us.id = $1
        GROUP BY
          us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.name
      ) AS subquery
    `

		// Eksekusi query utama
		const rows = await fetchQueryResults(mainQuery, [userid])

		if (rows.length === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" })
		}

		// Eksekusi query untuk menghitung total data
		const countResult = await fetchQueryResults(countQuery, [userid])
		const totalData = parseInt(countResult[0]?.total || 0, 10)
		const totalPages = Math.ceil(totalData / numericLimit)

		// Memproses data untuk laporan
		const report = await buildStudentData(rows)

		res.status(200).json({
			report,
			totalData,
			totalPages,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-report/:type_id", async (req, res) => {
	const client = await pool.connect()
	try {
		const { type_id } = req.params
		const { page, limit, search } = req.query

		const mainQuery = `
      SELECT
        us.id AS userid,
        us.name AS student_name,
        g.name AS grade,
        c.name AS class_name,
        t.name AS type_name,
        t.id AS type_id,
        e.name AS examiner_name,
        e.id AS examiner_id,
        ts.type_id
      FROM
        u_students us
        INNER JOIN cl_students cs ON us.id = cs.student
        INNER JOIN a_class c ON cs.classid = c.id
        INNER JOIN a_grade g ON c.grade = g.id
        INNER JOIN t_scoring ts ON us.id = ts.userid
        INNER JOIN t_type t ON ts.type_id = t.id
        INNER JOIN t_examiner e ON ts.examiner_id = e.id
      WHERE
        ts.type_id = $1
      GROUP BY
        us.id, us.name, g.name, c.name, t.name, e.name, ts.type_id, t.id, e.id
    `

		const rows = await fetchQueryResults(mainQuery, [type_id])

		const result = await buildStudentData(rows, type_id)

		res.status(200).json(result)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete("/delete-report", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { userid, typeId, createdat } = req.query

		console.log(req.query)

		// Konversi ISO date string ke format yang sesuai untuk SQL timestamp
		const formattedDate = new Date(createdat).toISOString() // Pastikan validasi dilakukan

		if (isNaN(Date.parse(formattedDate))) {
			return res.status(400).json({ message: "Format tanggal tidak valid." })
		}

		// Query untuk menghapus data berdasarkan userid, type_id, dan createdat
		const deleteScore = `
        DELETE FROM t_scoring
        WHERE userid = $1 AND type_id = $2 AND DATE(createdat) = $3
      `

		const deleteSurah = `
        DELETE FROM t_process WHERE userid = $1 AND DATE(createdat) = $2
        `

		const result = await client.query(deleteScore, [userid, typeId, createdat])
		const resultSurah = await client.query(deleteSurah, [userid, createdat])

		// Jika tidak ada data yang dihapus, berikan respons 404
		if (result.rowCount === 0) {
			return res
				.status(404)
				.json({ message: "Data tidak ditemukan atau sudah dihapus." })
		}

		res.status(200).json({ message: remove })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-report-target", async (req, res) => {
	const client = await pool.connect()
	try {
		// Query untuk mendapatkan periode aktif
		const activePeriodeQuery = `
			SELECT 
				p.id as periode_id,
				p.name as periode,
				h.id as homebase_id,
				h.name as homebase
			FROM a_periode p
			INNER JOIN a_homebase h ON p.homebase = h.id
			WHERE p.isactive = true
		`

		const activePeriodes = await fetchQueryResults(activePeriodeQuery)

		if (activePeriodes.length === 0) {
			return res.status(404).json({ message: "Tidak ada periode aktif" })
		}

		const result = []

		// Proses untuk setiap periode aktif
		for (const periode of activePeriodes) {
			// Query untuk mendapatkan data grade dan target
			const gradeTargetQuery = `
				SELECT 
					g.id as grade_id,
					g.name as grade_name,
					tj.id as juz_id,
					tj.name as juz_name,
					SUM(tji.to_ayat - tji.from_ayat + 1) as total_verses,
					SUM(tji.lines) as total_lines
				FROM a_grade g
				LEFT JOIN t_target t ON g.id = t.grade_id
				LEFT JOIN t_juz tj ON t.juz_id = tj.id
				LEFT JOIN t_juzitems tji ON tj.id = tji.juz_id
				WHERE g.homebase = $1
				GROUP BY g.id, g.name, tj.id, tj.name
				ORDER BY g.id, tj.id
			`

			const gradeTargets = await fetchQueryResults(gradeTargetQuery, [
				periode.homebase_id,
			])

			// Query untuk mendapatkan data siswa dan progress
			const studentProgressQuery = `
				WITH surah_progress AS (
					SELECT 
						tp.userid,
						tp.juz_id,
						ts.id as surah_id,
						ts.name as surah_name,
						SUM(tp.to_count - tp.from_count + 1) as verses_completed,
						SUM(tp.to_line - tp.from_line + 1) as lines_completed
					FROM t_process tp
					LEFT JOIN t_surah ts ON tp.surah_id = ts.id
					WHERE tp.type_id = 6
					GROUP BY tp.userid, tp.juz_id, ts.id, ts.name
				)
				SELECT 
					us.id as userid,
					us.nis,
					us.name as student_name,
					g.id as grade_id,
					g.name as grade_name,
					c.name as class_name,
					tj.id as juz_id,
					tj.name as juz_name,
					sp.surah_id,
					sp.surah_name,
					sp.verses_completed,
					sp.lines_completed,
					ts.ayat as total_verses,
					ts.lines as total_lines
				FROM u_students us
				INNER JOIN cl_students cs ON us.id = cs.student AND cs.periode = $1
				INNER JOIN a_class c ON cs.classid = c.id
				INNER JOIN a_grade g ON c.grade = g.id
				LEFT JOIN surah_progress sp ON us.id = sp.userid
				LEFT JOIN t_juz tj ON sp.juz_id = tj.id
				LEFT JOIN t_surah ts ON sp.surah_id = ts.id
				WHERE us.homebase = $2
				ORDER BY g.id, us.id, tj.id, sp.surah_id
			`

			const studentProgress = await fetchQueryResults(studentProgressQuery, [
				periode.periode_id,
				periode.homebase_id,
			])

			// Mengelompokkan data
			const periodeData = {
				periode: periode.periode,
				periode_id: periode.periode_id,
				homebase: periode.homebase,
				homebase_id: periode.homebase_id,
				grade: [],
			}

			// Mengelompokkan target per grade
			const gradeMap = new Map()
			gradeTargets.forEach((gt) => {
				if (!gradeMap.has(gt.grade_id)) {
					gradeMap.set(gt.grade_id, {
						name: gt.grade_name,
						id: gt.grade_id,
						target: [],
						students: [],
					})
				}
				if (gt.juz_id) {
					gradeMap.get(gt.grade_id).target.push({
						juz: gt.juz_name,
						verses: gt.total_verses,
						lines: gt.total_lines,
					})
				}
			})

			// Mengelompokkan progress siswa
			const studentMap = new Map()
			studentProgress.forEach((sp) => {
				const studentKey = `${sp.grade_id}_${sp.userid}`
				let student = studentMap.get(studentKey)
				if (!student) {
					student = {
						userid: sp.userid,
						nis: sp.nis,
						name: sp.student_name,
						grade: sp.grade_name,
						class: sp.class_name,
						progress: [],
					}
					studentMap.set(studentKey, student)
				}

				if (sp.juz_id) {
					let progress = student.progress.find((p) => p.juz === sp.juz_name)
					if (!progress) {
						progress = {
							juz: sp.juz_name,
							verses: 0,
							lines: 0,
							persentase: 0,
							surah: [],
						}
						student.progress.push(progress)
					}

					progress.surah.push({
						surah: sp.surah_name,
						verses: parseInt(sp.verses_completed, 10),
						lines: parseInt(sp.lines_completed, 10),
					})

					progress.verses += parseInt(sp.verses_completed, 10)
					progress.lines += parseInt(sp.lines_completed, 10)
				}

				// Filter progress untuk hanya menyertakan juz yang ada dalam target
				const filteredProgress = student.progress.filter((p) => {
					const target = gradeMap
						.get(sp.grade_id)
						.target.find((t) => t.juz === p.juz)
					if (target) {
						// Update persentase berdasarkan lines target
						p.persentase = Number(
							((p.lines / parseInt(target.lines, 10)) * 100).toFixed(2)
						)
						return true
					}
					return false
				})

				// Update data siswa dengan progress yang difilter
				studentMap.set(studentKey, {
					...student,
					progress: filteredProgress,
				})
			})

			// Menggabungkan data
			gradeMap.forEach((gradeData, gradeId) => {
				// Filter siswa untuk grade ini
				const gradeStudents = Array.from(studentMap.values())
					.filter((s) => s.grade === gradeData.name)
					.map((s) => ({
						...s,
						progress: Array.from(s.progress.values()),
					}))

				// Hitung achievement
				const totalStudents = gradeStudents.length
				const completedStudents = gradeStudents.filter((s) =>
					s.progress.some((p) => p.persentase >= 100)
				).length
				const uncompletedStudents = totalStudents - completedStudents
				const achievement = Number(
					((completedStudents / totalStudents) * 100).toFixed(2)
				)

				periodeData.grade.push({
					...gradeData,
					achievement,
					completed: completedStudents,
					uncompleted: uncompletedStudents,
					students: gradeStudents,
				})
			})

			result.push(periodeData)
		}

		res.status(200).json(result)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

export default router
