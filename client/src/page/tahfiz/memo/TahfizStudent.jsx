import React, { useEffect, useState } from "react"
import Layout from "../../../components/layout/Layout"
import Selects from "./Selects"
import { useParams } from "react-router-dom"
import Category from "./Category"
import ListSurah from "./ListSurah"
import toast from "react-hot-toast"
import { useAddscoreMutation } from "../../../controller/api/tahfiz/ApiScoring"

const TahfizStudent = () => {
	const { name, userid, periodeId } = useParams()
	const formatted = name.replace(/-/g, " ")

	const [typeId, setTypeId] = useState("")
	const [examiner, setExaminer] = useState("")
	const [juz, setJuz] = useState({})
	const [surah, setSurah] = useState({})
	let countAyat = surah?.to_ayat
	const [fromAyat, setFromAyat] = useState("")
	const [toAyat, setToAyat] = useState("")
	let countLine = surah?.to_line
	const [fromLine, setFromLine] = useState("")
	const [toLine, setToLine] = useState("")
	const [tableData, setTableData] = useState([])

	const addToTable = () => {
		setTableData((prev) => [
			...prev,
			{
				juzId: juz.id,
				fromSurah: surah.surah_id,
				fromSurahName: surah.surah,
				fromAyat,
				toAyat,
				fromLine,
				toLine,
			},
		])
		countAyat = 0
		setFromAyat("")
		setToAyat("")
		countLine = 0
		setFromLine("")
		setToLine("")
	}

	const [addScore, { isLoading, isSuccess, isError, reset }] =
		useAddscoreMutation()

	const deleteSurah = (name) => {
		const filteredTableData = tableData.filter(
			(surah) => surah.fromSurahName !== name
		)
		setTableData(filteredTableData)
	}

	const handleSave = () => {
		const categoryInputs = document.querySelectorAll("[name='category-score']")
		const indicatorInputs = document.querySelectorAll(
			"input[data-indicator-id]"
		)

		const categories = Array.from(categoryInputs).map((categoryInput) => {
			const categoryId = categoryInput.dataset.categoryId
			const categoryPoin = categoryInput.value

			const indicators = Array.from(indicatorInputs)
				.filter(
					(indicatorInput) => indicatorInput.dataset.categoryId === categoryId
				)
				.map((indicatorInput) => ({
					indicator_id: parseInt(indicatorInput.dataset.indicatorId),
					poin: indicatorInput.value,
				}))

			return {
				category_id: parseInt(categoryId),
				poin: categoryPoin,
				indicators,
			}
		})

		const data = {
			userid: parseInt(userid),
			periodeId: parseInt(periodeId),
			juzId: juz.id,
			surahs: tableData,
			examiner: parseInt(examiner),
			poin: {
				type_id: parseInt(typeId),
				categories,
			},
		}

		if (!typeId || !examiner || !tableData || !categories) {
			return toast.warning(`Lengkapi data`)
		}

		toast.promise(
			addScore(data)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Memuat data...",
				success: (message) => message,
				error: (error) => error.data.message,
			}
		)

		// **Mengosongkan input setelah submit**
		categoryInputs.forEach((input) => (input.value = ""))
		indicatorInputs.forEach((input) => (input.value = ""))
	}

	useEffect(() => {
		if (isSuccess || isError) {
			reset()
			setTypeId("")
			setExaminer("")
			setFromAyat("")
			setToAyat("")
			setFromLine("")
			setToLine("")
			setTableData([])
		}
	}, [isSuccess, isError])

	return (
		<Layout title={`Hafalan ${formatted}`} levels={["tahfiz"]}>
			<div className='p-2 d-flex flex-column gap-2 rounded bg-white border shadow'>
				<p className='m-0 h5'>{formatted}</p>

				<div className='row g-2'>
					<div className='col-lg-6 col-12'>
						<Selects
							typeId={typeId}
							setTypeId={setTypeId}
							examiner={examiner}
							setExaminer={setExaminer}
							surah={surah}
							setSelectedSurah={setSurah}
							setSelectedJuz={setJuz}
							countAyat={countAyat}
							fromAyat={fromAyat}
							setFromAyat={setFromAyat}
							toAyat={toAyat}
							setToAyat={setToAyat}
							countLine={countLine}
							fromLine={fromLine}
							setFromLine={setFromLine}
							toLine={toLine}
							setToLine={setToLine}
							addToTable={addToTable}
							setTableData={setTableData}
						/>

						<Category />
					</div>
					<div className='col-lg-6 col-12'>
						<ListSurah data={tableData} deleteSurah={deleteSurah} />

						<div className='mt-2 text-end'>
							<button
								className='btn btn-sm btn-primary'
								disabled={tableData?.length === 0 || isLoading}
								onClick={handleSave}>
								Simpan
							</button>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	)
}

export default TahfizStudent
