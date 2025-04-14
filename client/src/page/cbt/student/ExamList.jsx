import React, { useState } from "react"
import { useGetExamsByClassQuery } from "../../../controller/api/cbt/ApiExam"
import Table from "../../../components/table/Table"

const ExamList = ({ classid }) => {
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")

	const { data = {}, isLoading } = useGetExamsByClassQuery(
		{ classid, page, limit, search },
		{ skip: !classid }
	)
	const { exams = [], totalData, totalPages } = data

	return (
		<Table
			isLoading={isLoading}
			page={page}
			setPage={setPage}
			limit={limit}
			setLimit={setLimit}
			totalPages={totalPages}
			setSearch={setSearch}
			totalData={totalData}>
			<table className='mb-0 table table-hover table-striped table-bordered'>
				<thead>
					<tr>
						<th className='text-center'>No</th>
						<th className='text-center'>Nama Ujian</th>
						<th className='text-center'>Guru</th>
						<th className='text-center'>Durasi</th>
						<th className='text-center'>Status</th>
						<th className='text-center'>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{exams?.map((item, index) => (
						<tr key={item.id}>
							<td className='text-center align-middle'>{index + 1}</td>
							<td className='align-middle'>{item.name}</td>
							<td className='align-middle'>{item.teacher_name}</td>
							<td className='text-center align-middle'>
								<p className='m-0 badge bg-primary'>{`${item.duration} Menit`}</p>
							</td>
							<td className='text-center align-middle'>
								<p className='m-0'>
									{item.isactive ? (
										<span className='badge bg-success'>Aktif</span>
									) : (
										<span className='badge bg-danger'>nonaktif</span>
									)}
								</p>
							</td>
							<td className='text-center align-middle'>
								<button className='btn btn-sm btn-primary'>
									<i className='bi bi-eye'></i>
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</Table>
	)
}

export default ExamList
