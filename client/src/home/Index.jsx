import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useSigninMutation } from "../controller/api/auth/ApiAuth"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setLogin } from "../controller/slice/AuthSlice"

const Index = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const [role, setRole] = useState("none")
	const [isSignup, setSignup] = useState(false)
	const [accountValue, setAccountValue] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [signin, { isLoading, data }] = useSigninMutation()
	const { user, isSignin } = useSelector((state) => state.auth)

	const handlePasswordToggle = () => {
		setShowPassword((prev) => !prev)
	}

	const handleRoleChange = (value) => {
		setRole(value)
		setAccountValue("") // Reset account value when role changes
	}

	const handleSignup = () => {
		setRole("")
		setSignup(true)
		setAccountValue("")
	}

	const back = () => {
		setRole("none")
		setSignup(false)
		setAccountValue("")
	}

	const routes = {
		center: "/center-dashboard",
		admin: "/admin-dashboard",
		student: "/siswa-dashboard",
		teacher: "/guru-dashboard",
		parent: "/wali-dashboard",
		tahfiz: "/tahfiz-dashboard",
	}

	const loginHandler = async (e) => {
		e.preventDefault()

		const credentials = {
			password,
			...(role === "student"
				? { nis: accountValue }
				: role === "teacher"
				? { username: accountValue }
				: role === "parent"
				? { name: accountValue }
				: { email: accountValue }),
		}

		await toast.promise(signin(credentials).unwrap(), {
			loading: "Sedang masuk...",
			success: (response) => {
				dispatch(setLogin(response.user))

				window.location.href = routes[response.user.level] || "/"

				return response.message
			},
			error: (error) => {
				return error.data?.message
			},
		})
	}

	useEffect(() => {
		if (user.level && isSignin) {
			window.location.href = routes[user.level]
		}
	}, [user, isSignin])

	return (
		<div>
			<div className='area'>
				<ul className='circles'>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
				</ul>
			</div>

			<div
				className='d-flex align-items-center justify-content-center flex-column gap-2'
				style={{ height: "100vh" }}>
				<img src='/nibs.png' alt='logo' style={{ height: 100, width: 100 }} />

				{role === "none" && (
					<>
						<button
							className='btn btn-info btn-sign-in'
							onClick={() => handleRoleChange("admin")}>
							Admin
						</button>
						<button
							className='btn btn-info btn-sign-in'
							onClick={() => handleRoleChange("teacher")}>
							Guru
						</button>
						<button
							className='btn btn-info btn-sign-in'
							onClick={() => handleRoleChange("student")}>
							Siswa
						</button>
						<button
							className='btn btn-info btn-sign-in'
							onClick={() => handleRoleChange("parent")}>
							Wali Murid
						</button>

						<button className='btn btn-info btn-sign-in' onClick={handleSignup}>
							Pendaftaran
						</button>
					</>
				)}

				{role !== "none" && !isSignup && (
					<form
						style={{ width: 300 }}
						className='d-flex flex-column gap-2'
						onSubmit={loginHandler}>
						<input
							type={role === "admin" || role === "parent" ? "email" : "text"}
							placeholder={
								role === "student"
									? "NIS"
									: role === "teacher"
									? "USERNAME"
									: "EMAIL"
							}
							value={accountValue}
							onChange={(e) => setAccountValue(e.target.value)}
							required
							className='form-control'
						/>

						<input
							type={showPassword ? "text" : "password"}
							placeholder='Password'
							className='form-control'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>

						<div className='form-check'>
							<input
								className='form-check-input'
								type='checkbox'
								id='flexCheckDefault'
								checked={showPassword}
								onChange={handlePasswordToggle}
							/>
							<label
								className='form-check-label text-white'
								htmlFor='flexCheckDefault'>
								Tampilkan Password
							</label>
						</div>

						<div className='d-flex justify-content-between'>
							<button
								type='button'
								className='btn btn-danger'
								onClick={() => setRole("none")}>
								<i className='bi bi-arrow-left'></i> Kembali
							</button>
							<button
								type='submit'
								className='btn btn-success'
								disabled={isLoading}>
								{isLoading ? (
									<>
										<span
											className='spinner-border spinner-border-sm'
											aria-hidden='true'></span>
										<span role='status'>Loading...</span>
									</>
								) : (
									"Masuk"
								)}
							</button>
						</div>
					</form>
				)}

				{isSignup && <SignUp setRole={back} />}
			</div>
		</div>
	)
}

export default Index
