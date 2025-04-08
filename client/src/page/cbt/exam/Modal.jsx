import { useState } from "react"
import { useGetTeachersQuery } from "../../../controller/api/cbt/ApiBank"
import { useGetClassesQuery } from "../../../controller/api/cbt/ApiExam"
import Select from "react-select"

const Modal = () => {
	const [formData, setFormData] = useState({
		teacher: "",
		bank: [],
		pg: "",
		essay: "",
		name: "",
		duration: "",
		classes: [],
	})

	const { data: teachers } = useGetTeachersQuery()
	const { data: classes } = useGetClassesQuery()

	const teacherOptions = teachers?.map((teacher) => ({
		value: teacher.id,
		label: teacher.name,
		bank: teacher.bank,
	}))

	const selectedTeacher = teachers?.find((t) => t.id === formData.teacher)

	const bankOptions = selectedTeacher?.bank?.map((bank) => ({
		value: bank.id,
		label: bank.name,
		type: bank.type,
	}))

	const classOptions = classes?.map((item) => ({
		value: item.id,
		label: item.name,
	}))

	const handleTeacherChange = (selectedOption) => {
		setFormData((prev) => ({
			...prev,
			teacher: selectedOption?.value || null,
			bank: [],
		}))
	}

	const handleInput = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleClass = (selectedOption) => {
		setFormData((prev) => ({
			...prev,
			classes: selectedOption || [],
		}))
	}

	const handleBankChange = (selectedOptions) => {
		setFormData((prev) => ({
			...prev,
			bank: selectedOptions.value || [],
		}))
	}

	const selectedBanks = formData.bank || []
	const hasBankType = selectedBanks.some((bank) => bank.type === "bank")

	return (
		<div
			className='modal fade'
			id='exam'
			data-bs-backdrop='static'
			data-bs-keyboard='false'
			tabIndex='-1'
			aria-labelledby='staticBackdropLabel'
			aria-hidden='true'>
			<div className='modal-dialog modal-lg'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 className='modal-title' id='staticBackdropLabel'>
							Buat Ujian Baru
						</h5>
						<button
							type='button'
							className='btn-close'
							data-bs-dismiss='modal'
							aria-label='Close'></button>
					</div>
					<div className='modal-body'>
						<div className='row g-2'>
							<div className='col-6'>
								<input
									type='text'
									name='name'
									className='form-control'
									placeholder='Nama Ujian'
									value={formData.name || ""}
									onChange={handleInput}
								/>
							</div>

							<div className='col-6'>
								<input
									type='number'
									name='duration'
									className='form-control'
									placeholder='Durasi'
									value={formData.duration || ""}
									onChange={handleInput}
								/>
							</div>

							<div className='col-6'>
								<Select
									isClearable
									isSearchable
									isMulti
									placeholder='Untuk Kelas'
									value={formData.classes}
									options={classOptions}
									onChange={handleClass}
								/>
							</div>

							<div className='col-6'>
								<Select
									isClearable
									isSearchable
									placeholder='Cari Guru'
									value={
										teacherOptions?.find(
											(opt) => opt.value === formData.teacher
										) || null
									}
									options={teacherOptions}
									onChange={handleTeacherChange}
								/>
							</div>

							<div className='col-12'>
								<Select
									isClearable
									isSearchable
									placeholder='Pilih Bank Soal'
									value={formData.bank}
									options={bankOptions}
									onChange={handleBankChange}
									isDisabled={!formData.teacher}
								/>
							</div>

							{hasBankType && (
								<>
									<div className='col-lg-4 col-12'>
										<input
											type='number'
											name='pg'
											className='form-control'
											placeholder='Tampil Soal PG'
											value={formData.pg || ""}
											onChange={handleInput}
										/>
									</div>
									<div className='col-lg-4 col-12'>
										<input
											type='number'
											name='essay'
											className='form-control'
											placeholder='Tampil Soal Essay'
											value={formData.essay || ""}
											onChange={handleInput}
										/>
									</div>
									<div className='col-lg-4 col-12'>
										<button className='btn btn-primary'>
											<i class='bi bi-plus-lg'></i>
										</button>
									</div>
								</>
							)}
						</div>
					</div>
					<div className='modal-footer'>
						<button
							type='button'
							className='btn btn-secondary'
							data-bs-dismiss='modal'>
							Batal
						</button>
						<button type='button' className='btn btn-primary'>
							Upload
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Modal
