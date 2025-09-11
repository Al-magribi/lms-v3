import * as Fa from "react-icons/fa";
import * as Fa6 from "react-icons/fa6";
import * as Gi from "react-icons/gi";
import * as Pi from "react-icons/pi";
import * as Md from "react-icons/md";
import * as Bs from "react-icons/bs";
import * as Gr from "react-icons/gr";
import * as Lu from "react-icons/lu";
import * as Cg from "react-icons/cg";
import * as Di from "react-icons/di";

export const CenterMenus = [
  {
    label: "Dashboard",
    link: "/center-dashboard",
    icon: <Lu.LuLayoutDashboard />,
  },
  { label: "Satuan", link: "/center-satuan", icon: <Fa.FaSchool /> },
  { label: "Admin", link: "/center-admin", icon: <Gr.GrUserAdmin /> },
  { label: "Guru", link: "/center-guru", icon: <Fa.FaChalkboardTeacher /> },
  { label: "Siswa", link: "/center-siswa", icon: <Pi.PiStudentFill /> },
  { label: "Market", link: "/center-market", icon: <Pi.PiTarget /> },
  {
    label: "Pengaturan",
    link: "/center-pengaturan",
    icon: <Lu.LuSettings />,
  },
];

export const AdminMenus = [
  {
    label: "Dashboard",
    link: "/admin-dashboard",
    icon: <Lu.LuLayoutDashboard />,
  },

  { label: "Jurusan", link: "/admin-jurusan", icon: <Fa.FaCodeBranch /> },
  { label: "Periode", link: "/admin-periode", icon: <Fa.FaRegCalendar /> },
  { label: "Tingkat", link: "/admin-tingkat", icon: <Fa.FaSchool /> },
  { label: "Kelas", link: "/admin-kelas", icon: <Fa6.FaFolderTree /> },
  { label: "Siswa", link: "/admin-siswa", icon: <Pi.PiStudentFill /> },
  { label: "Orang Tua", link: "/admin-wali", icon: <Fa.FaUserFriends /> },
  { label: "Mata Pelajaran", link: "/admin-mapel", icon: <Gi.GiOpenFolder /> },
  { label: "Guru", link: "/admin-guru", icon: <Fa.FaChalkboardTeacher /> },
  {
    label: "Bank Soal",
    link: "/admin-cbt-bank",
    icon: <Md.MdOutlineFolderCopy />,
  },
  { label: "Ujian", link: "/admin-cbt-exam", icon: <Bs.BsLaptopFill /> },
  {
    label: "Profile",
    link: "/admin-profile",
    icon: <Md.MdOutlineAdminPanelSettings />,
  },
];

export const TeacherMenus = [
  {
    label: "Dashboard",
    link: "/guru-dashboard",
    icon: <Lu.LuLayoutDashboard />,
  },

  { label: "Mata Pelajaran", link: "/guru-mapel", icon: <Gi.GiOpenFolder /> },
  {
    label: "Bank Soal",
    link: "/guru-bank",
    icon: <Md.MdOutlineFolderCopy />,
  },
  { label: "Ujian", link: "/guru-ujian", icon: <Bs.BsLaptopFill /> },
  { label: "Absensi", link: "/guru-absensi", icon: <Bs.BsFingerprint /> },
  { label: "Penilaian", link: "/guru-penilaian", icon: <Gr.GrScorecard /> },
  { label: "Profile", link: "/guru-profile", icon: <Fa.FaRegUser /> },
];

export const StudentMenus = [
  {
    label: "Dashboard",
    link: "/siswa-dashboard",
    icon: <Lu.LuLayoutDashboard />,
  },

  { label: "Pelajaran", link: "/siswa-pelajaran", icon: <Gi.GiOpenFolder /> },
  { label: "Ujian", link: "/siswa-daftar-ujian", icon: <Bs.BsLaptopFill /> },
  { label: "Profile", link: "/siswa-profile", icon: <Fa.FaRegUser /> },
];

export const TahfizMenus = [
  {
    label: "Dashboard",
    link: "/tahfiz-dashboard",
    icon: <Lu.LuLayoutDashboard />,
  },

  { label: "Hafalan", link: "/tahfiz-hafalan", icon: <Cg.CgNotes /> },
  { label: "Surah", link: "/tahfiz-surah", icon: <Bs.BsListStars /> },
  { label: "Juz", link: "/tahfiz-juz", icon: <Bs.BsListColumns /> },
  { label: "Target", link: "/tahfiz-target", icon: <Gi.GiMultipleTargets /> },
  { label: "Penguji", link: "/tahfiz-penguji", icon: <Fa.FaUserTie /> },
  { label: "Penilaian", link: "/tahfiz-penilaian", icon: <Gr.GrScorecard /> },
  { label: "Metrik", link: "/tahfiz-metrik", icon: <Di.DiAtom /> },
  { label: "Laporan", link: "/tahfiz-laporan", icon: <Fa6.FaChartBar /> },
  {
    label: "Profile",
    link: "/tahfiz-profile",
    icon: <Md.MdOutlineAdminPanelSettings />,
  },
];

export const ParentMenus = [
  {
    label: "Dashboard",
    link: "/wali-dashboard",
    icon: <Lu.LuLayoutDashboard />,
  },
  {
    label: "Laporan Tahfiz",
    link: "/wali-laporan-tahfiz",
    icon: <Cg.CgNotes />,
  },
  {
    label: "Laporan Akademik",
    link: "/wali-laporan-akademik",
    icon: <Fa6.FaChartBar />,
  },
  {
    label: "Profile",
    link: "/wali-profile",
    icon: <Md.MdOutlineAdminPanelSettings />,
  },
];
