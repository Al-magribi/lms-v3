import React from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const LmsSubjectList = () => {
	const navigate = useNavigate()
	const { user } = useSelector((state) => state.auth)

	const subjects = user?.subjects

	const goToLink = (name, id) => {
		const formattedName = name.replace(/\s+/g, "-")
		navigate(`/guru-mapel/${formattedName}/${id}`)
	}

	return (
		<div className='d-flex flex-column gap-3'>
			<p className='m-0 h4 p-2 rounded border bg-white'>List Mata Pelajaran</p>

			<div className='row g-3'>
				{subjects?.map((subject) => (
					<div key={subject.id} className='col-lg-2 col-md-4 col-6'>
						<div
							style={{ width: "100%", overflow: "hidden" }}
							className='rounded bg-white p-2 border shadow-sm text-center pointer'
							onClick={() => goToLink(subject.name, subject.id)}>
							<img
								src={`${window.location.origin}${subject.cover}`}
								alt={`cover - ${subject.name}`}
								className='w-100 object-fit-cover rounded'
								style={{ height: 200 }}
							/>

							<p className='m-0 h5 mt-2'>{subject.name}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default LmsSubjectList
