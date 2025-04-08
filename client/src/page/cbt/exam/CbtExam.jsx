import { useState } from "react"
import Form from "./Form"
import Modal from "./Modal"
import TableExam from "./TableExam"

const CbtExam = () => {
	const [detail, setDetail] = useState(null)
	return (
		<div className='row g-2'>
			<div className='col-lg-3'>
				<Form detail={detail} setDetail={setDetail} />
			</div>
			<div className='col-lg-9'>
				<TableExam setDetail={setDetail} />
			</div>
		</div>
	)
}

export default CbtExam
