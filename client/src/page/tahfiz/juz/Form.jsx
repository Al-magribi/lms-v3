import React, { useState } from "react"
import { toast } from "react-hot-toast"

const Form = ({ detail, setDetail }) => {
	const [id, setId] = useState("")
	const [name, setName] = useState("")

	const addHandler = (e) => {
		e.preventDefault()

		const data = { id: id ? id : "", name }

		console.log(data)
	}

	const cancel = () => {
		setDetail({})
		setName("")
		setId("")
	}

	return (
		<form
			onSubmit={addHandler}
			className='rounded border shadow p-2 d-flex flex-column gap-2 bg-white'>
			<p className='m-0 h6'>Tambah Juz</p>

			<input
				type='text'
				className='form-control'
				placeholder='Nama Juz'
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>

			<div className='d-flex justify-content-end gap-2'>
				<button type='button' className='btn btn-warning' onClick={cancel}>
					Batal
				</button>
				<button type='submit' className='btn btn-success'>
					Simpan
				</button>
			</div>
		</form>
	)
}

export default Form
