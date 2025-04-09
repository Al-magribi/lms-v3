import * as Io from "react-icons/io"
import Meta from "../meta/Meta"
import {
	AdminMenus,
	CenterMenus,
	StudentMenus,
	TeacherMenus,
	TahfizMenus,
} from "../menu/Menus"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { setLogout } from "../../controller/slice/AuthSlice"
import { useDispatch, useSelector } from "react-redux"
import { useLogoutMutation } from "../../controller/api/auth/ApiAuth"

const center = "/center-dashboard"
const admin = "/admin-dashboard"
const teacher = "/guru-dashboard"
const student = "/siswa-dashboard"
const parent = "/orangtua-dashboard"
const tahfiz = "/tahfiz-dashboard"

const Layout = ({ children, title, desc, levels }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [windowWidth, setWindowWidth] = useState(window.innerWidth)
	const { user, isSignin } = useSelector((state) => state.auth)
	const [logout, { isSuccess, isLoading, error, reset }] = useLogoutMutation()

	const logoutHandler = () => {
		toast.promise(
			logout()
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
		if (isSuccess) {
			reset()
			dispatch(setLogout())

			navigate("/")
		}

		if (error) {
			reset()
		}
	}, [isSuccess, error])

	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth)
		}
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	const goToLink = (link) => {
		navigate(link)
	}

	const dynamicHeight = windowWidth >= 820 ? "88vh" : "98vh"
	const level = user?.level

	// Proteksi level
	useEffect(() => {
		const timeout = setTimeout(() => {
			// Periksa apakah user ada, perannya sesuai, dan sudah sign-in
			if (!user || !levels.includes(user?.level) || !isSignin) {
				navigate("/") // Redirect ke halaman beranda jika tidak memenuhi syarat
			}
		}, 1000)

		return () => clearTimeout(timeout)
	}, [user, isSignin, levels])

	return (
		<div
			className='container-fluid d-flex flex-column bg-light'
			style={{ minHeight: "100vh" }}>
			{/* Navbar */}
			<div className='container-fluid bg-info fixed-top'>
				<nav
					className='navbar navbar-expand-lg'
					aria-label='Thirteenth navbar example'>
					<div className='container-fluid'>
						<a
							className='navbar-brand col-lg-2 me-0 text-white'
							href={
								level === "center"
									? center
									: level === "admin"
									? admin
									: level === "teacher"
									? teacher
									: level === "student"
									? student
									: level === "parent"
									? parent
									: tahfiz
							}>
							{user?.name}
						</a>
						<button
							className='navbar-toggler'
							type='button'
							data-bs-toggle='collapse'
							data-bs-target='#navbarsExample11'
							aria-controls='navbarsExample11'
							aria-expanded='false'
							aria-label='Toggle navigation'>
							<span className='navbar-toggler-icon'></span>
						</button>
						<div
							className='collapse navbar-collapse d-lg-flex'
							id='navbarsExample11'>
							<div className='navbar-nav col-12 justify-content-lg-end d-flex gap-2'>
								{(level === "center"
									? CenterMenus
									: level === "admin"
									? AdminMenus
									: level === "teacher"
									? TeacherMenus
									: level === "student"
									? StudentMenus
									: level === "parent"
									? ParentMenus
									: level === "tahfiz"
									? TahfizMenus
									: StudentMenus
								).map((menu, i) => (
									<button
										key={i}
										className='btn btn-light d-flex align-items-center gap-1'
										onClick={() => goToLink(menu.link)}>
										{menu.icon}
										{menu.label}
									</button>
								))}
								<button
									className='btn btn-danger'
									disabled={isLoading}
									onClick={logoutHandler}>
									<Io.IoMdLogOut />
								</button>
							</div>
						</div>
					</div>
				</nav>
			</div>
			{/* Main Content */}
			<div
				className='container-fluid'
				style={{
					marginTop: "60px",
					height: dynamicHeight,
					overflow: "auto",
				}}>
				<Meta title={title} desc={desc} />
				{children}
			</div>
			{/* Footer */}
			<div className='container-fluid p-2 bg-info fixed-bottom text-center'>
				LMS | Almadev
			</div>
		</div>
	)
}

export default Layout
