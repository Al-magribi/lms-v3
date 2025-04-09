import React, { useState } from "react"
import Layout from "../../../components/layout/Layout"
import Form from "./Form"
import TableData from "./TableData"

const TahfizJuz = () => {
	const [detail, setDetail] = useState({})

	return (
		<Layout title={"Tahfiz - Daftar Juz"} levels={["tahfiz"]}>
			<div className='row g-2'>
				<div className='col-lg-3 col-12'>
					<Form detail={detail} setDetail={() => setDetail({})} />
				</div>
				<div className='col-lg-9 col-12'>
					<TableData />
				</div>
			</div>
		</Layout>
	)
}

export default TahfizJuz
