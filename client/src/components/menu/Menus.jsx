import * as Fa from "react-icons/fa"
import * as Fa6 from "react-icons/fa6"
import * as Gi from "react-icons/gi"
import * as Pi from "react-icons/pi"
import * as Md from "react-icons/md"
import * as Bs from "react-icons/bs"
import * as Gr from "react-icons/gr"
import * as Lu from "react-icons/lu"
import * as Cg from "react-icons/cg"
import * as Di from "react-icons/di"

export const CenterMenus = [
	{ label: "Satuan", link: "/center-satuan", icon: <Fa.FaSchool /> },
	{ label: "Admin", link: "/center-admin", icon: <Gr.GrUserAdmin /> },
	{ label: "Guru", link: "/center-guru", icon: <Fa.FaChalkboardTeacher /> },
	{ label: "Siswa", link: "/center-siswa", icon: <Pi.PiStudentFill /> },
	{ label: "Demografi", link: "/center-demografi", icon: <Fa.FaRegMap /> },
	{
		label: "Statistik",
		link: "/center-statistik",
		icon: <Lu.LuChartNoAxesCombined />,
	},
]

export const AdminMenus = [
	{ label: "Jurusan", link: "/admin-jurusan", icon: <Fa.FaCodeBranch /> },
	{ label: "Periode", link: "/admin-periode", icon: <Fa.FaRegCalendar /> },
	{ label: "Tingkat", link: "/admin-tingkat", icon: <Fa.FaSchool /> },
	{ label: "Siswa", link: "/admin-siswa", icon: <Pi.PiStudentFill /> },
	{ label: "Kelas", link: "/admin-kelas", icon: <Fa6.FaFolderTree /> },
	{ label: "Mata Pelajaran", link: "/admin-mapel", icon: <Gi.GiOpenFolder /> },
	{ label: "Guru", link: "/admin-guru", icon: <Fa.FaChalkboardTeacher /> },
	{
		label: "Bank Soal",
		link: "/admin-cbt-bank",
		icon: <Md.MdOutlineFolderCopy />,
	},
	{ label: "Ujian", link: "/admin-cbt-exam", icon: <Bs.BsLaptopFill /> },
]

export const TeacherMenus = [
	{ label: "Mata Pelajaran", link: "/guru-mapel", icon: <Gi.GiOpenFolder /> },
	{
		label: "Bank Soal",
		link: "/guru-bank",
		icon: <Md.MdOutlineFolderCopy />,
	},
	{ label: "Ujian", link: "/guru-ujian", icon: <Bs.BsLaptopFill /> },
]

export const StudentMenus = [
	{ label: "Ujian", link: "/siswa-daftar-ujian", icon: <Bs.BsLaptopFill /> },
	{ label: "Mata Pelajaran", link: "/siswa-mapel", icon: <Gi.GiOpenFolder /> },
]

export const TahfizMenus = [
	{ label: "Hafalan", link: "/tahfiz-hafalan", icon: <Cg.CgNotes /> },
	{ label: "Surah", link: "/tahfiz-surah", icon: <Bs.BsListStars /> },
	{ label: "Juz", link: "/tahfiz-juz", icon: <Bs.BsListColumns /> },
	{ label: "Target", link: "/tahfiz-target", icon: <Gi.GiMultipleTargets /> },
	{ label: "Pengujian", link: "/tahfiz-pengujian", icon: <Fa.FaUserTie /> },
	{ label: "Penilaian", link: "/tahfiz-penilaian", icon: <Gr.GrScorecard /> },
	{ label: "Metrik", link: "/tahfiz-metrik", icon: <Di.DiAtom /> },
	{ label: "Laporan", link: "/tahfiz-laporan", icon: <Fa6.FaChartBar /> },
]
