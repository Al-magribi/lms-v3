import { useEffect, useState } from "react"
import Table from "../../../components/table/Table"
import {
	useDeleteExamMutation,
	useGetExamsQuery,
	useChangeStatusMutation,
} from "../../../controller/api/cbt/ApiExam"
import { toast } from "react-hot-toast"

const TableExam = ({ setDetail }) => {
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")

	const { data: rawData = {}, isLoading: loading } = useGetExamsQuery({
		page,
		limit,
		search,
	})
	const { exams = [], totalData, totalPages } = rawData
	const [deleteExam, { isSuccess, isLoading, isError, reset }] =
		useDeleteExamMutation()
	const [
		changeStatus,
		{ isSuccess: isSuccessStatus, isError: isErrorStatus, reset: resetStatus },
	] = useChangeStatusMutation()

	const deleteHandler = (id) => {
		toast.promise(
			deleteExam(id)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Memproses...",
				success: (message) => message,
				error: (err) => err.data.message,
			}
		)
	}

	const changeStatusHandler = (id) => {
		toast.promise(
			changeStatus(id)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Memproses...",
				success: (message) => message,
				error: (err) => err.data.message,
			}
		)
	}

	useEffect(() => {
		if (isSuccess || isError) {
			reset()
		}
	}, [isSuccess, isError])

	useEffect(() => {
		if (isSuccessStatus || isErrorStatus) {
			resetStatus()
		}
	}, [isSuccessStatus, isErrorStatus])

	return (
		<Table
			page={page}
			setPage={setPage}
			setLimit={setLimit}
			setSearch={setSearch}
			totalData={totalData}
			totalPages={totalPages}
			isLoading={loading}>
			<table className='table table-striped table-bordered table-hover mb-0'>
				<thead>
					<tr>
						<th className='text-center'>No</th>
						<th className='text-center'>Guru</th>
						<th className='text-center'>Bank Soal</th>
						<th className='text-center'>Kelas</th>
						<th className='text-center'>Nama Ujian</th>
						<th className='text-center'>Durasi</th>
						<th className='text-center'>Status</th>
						<th className='text-center'>Token</th>
						<th className='text-center'>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{exams?.length > 0 ? (
						exams?.map((exam, i) => (
							<tr key={i}>
								<td className='text-center align-middle'>
									{(page - 1) * limit + i + 1}
								</td>
								<td className='align-middle'>{exam.teacher_name}</td>
								<td className='align-middle'>
									{exam.banks.map((bank) => (
										<p key={bank.id} className='m-0'>
											{bank.type !== "paket"
												? `${bank.name} - PG ${bank.pg} - Essay ${bank.essay}`
												: `${bank.name}`}
										</p>
									))}
								</td>
								<td className='align-middle'>
									{exam.classes?.map((item) => (
										<p key={item.id} className='m-0'>
											{item.name}
										</p>
									))}
								</td>
								<td className='align-middle'>{exam.name}</td>

								<td className='text-center align-middle'>{exam.duration}</td>
								<td className='text-center align-middle'>
									<div
										className='form-check form-switch pointer d-flex justify-content-center'
										onClick={() => changeStatusHandler(exam.id)}>
										<input
											className='form-check-input'
											type='checkbox'
											id='flexSwitchCheckChecked'
											checked={exam.isactive}
											readOnly
										/>
									</div>
								</td>
								<td className='text-center align-middle'>{exam.token}</td>
								<td className='text-center align-middle'>
									<div className='d-flex justify-content-center gap-2'>
										<button className='btn btn-sm btn-primary'>
											<i className='bi bi-people'></i>
										</button>
										<button
											className='btn btn-sm btn-warning'
											onClick={() => setDetail(exam)}>
											<i className='bi bi-pencil-square'></i>
										</button>
										<button
											className='btn btn-sm btn-danger'
											disabled={isLoading}
											onClick={() => deleteHandler(exam.id)}>
											<i className='bi bi-folder-x'></i>
										</button>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={8}>Data belum tersedia</td>
						</tr>
					)}
				</tbody>
			</table>
		</Table>
	)
}

export default TableExam
