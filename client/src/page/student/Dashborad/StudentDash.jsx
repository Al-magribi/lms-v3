import React from "react"
import Layout from "../../../components/layout/Layout"
import { useSelector } from "react-redux"

const StudentDash = () => {
	const { user } = useSelector((state) => state.auth)

	return (
		<Layout title={user?.name} levels={["student"]}>
			<div className='row g-2'>
				<div className='col-lg-4 col-12'>sdfsd</div>
				<div className='col-lg-4 col-12'>erwer</div>
				<div className='col-lg-4 col-12'>erwe</div>
			</div>
		</Layout>
	)
}

export default StudentDash
