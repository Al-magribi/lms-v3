import React, { useState } from "react"
import Layout from "../../../components/layout/Layout"
import { useGetTypesQuery } from "../../../controller/api/tahfiz/ApiMetric"
import TableData from "./TableData"
import Achievement from "./Achievement"

const TahfizReport = () => {
	const [type, setType] = useState("")
	const [achievement, setAchievement] = useState(false)

	const { data: types } = useGetTypesQuery({ page: "", limit: "", search: "" })

	return (
		<Layout title={"Laporan Hafalan Siswa"} levels={["tahfiz"]}>
			<div className='container-fluid bg-white d-flex justify-content-end gap-2 p-2 mb-2 rounded shadow border'>
				{types?.map((type) => (
					<button
						key={type.id}
						className='btn btn-sm btn-secondary'
						onClick={() => setType(type.id)}>
						{type.name}
					</button>
				))}
				<button className='btn btn-sm btn-danger' onClick={() => setType("")}>
					<i className='bi bi-recycle'></i>
				</button>
				<button
					className='btn btn-sm btn-success'
					onClick={() => setAchievement(!achievement)}>
					{achievement ? "Laporan" : "Capaian"}
				</button>
			</div>

			{achievement ? <Achievement /> : <TableData type={type} />}
		</Layout>
	)
}

export default TahfizReport
