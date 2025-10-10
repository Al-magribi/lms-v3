import {
  ApartmentOutlined,
  AreaChartOutlined,
  AuditOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  DotChartOutlined,
  FolderAddOutlined,
  FolderOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  RiseOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  WindowsOutlined,
} from "@ant-design/icons";

export const CenterMenus = [
  {
    label: "Dashboard",
    key: "/center-dashboard",
    icon: <WindowsOutlined />,
  },
  { label: "Satuan", key: "/center-satuan", icon: <HomeOutlined /> },
  { label: "Admin", key: "/center-admin", icon: <IdcardOutlined /> },
  { label: "Market", key: "/center-market", icon: <DotChartOutlined /> },

  { label: "Profile", key: "/profile", icon: <UserOutlined /> },
  { label: "Logout", key: "logout", icon: <LogoutOutlined />, danger: true },
];

export const AdminMenus = [
  {
    label: "Dashboard",
    key: "/admin-dashboard",
    icon: <WindowsOutlined />,
  },
  {
    label: "Data Pokok",
    key: "/admin-data-pokok",
    icon: <FolderOutlined />,
  },
  {
    label: "Data Akademik",
    key: "/admin-data-akademik",
    icon: <AuditOutlined />,
  },
  {
    label: "Data Siswa",
    key: "/admin-data-siswa",
    icon: <ApartmentOutlined />,
  },
  {
    label: "Database",
    key: "/database",
    icon: <DatabaseOutlined />,
  },
  {
    label: "CBT",
    key: "/computer-based-test",
    icon: <DesktopOutlined />,
  },

  { label: "Profile", key: "/profile", icon: <UserOutlined /> },
  { label: "Logout", key: "logout", icon: <LogoutOutlined />, danger: true },
];

export const TeacherMenus = [
  {
    label: "Dashboard",
    key: "/guru-dashboard",
    icon: <WindowsOutlined />,
  },
  {
    label: "LMS",
    key: "/learning-management-system",
    icon: <BranchesOutlined />,
  },
  {
    label: "CBT",
    key: "/computer-based-test",
    icon: <DesktopOutlined />,
  },
  {
    label: "Database",
    key: "/database",
    icon: <DatabaseOutlined />,
  },
  { label: "Profile", key: "/profile", icon: <UserOutlined /> },
  { label: "Logout", key: "logout", icon: <LogoutOutlined />, danger: true },
];

export const StudentMenus = [
  {
    label: "Dashboard",
    key: "/siswa-dashboard",
    icon: <WindowsOutlined />,
  },
  {
    label: "LMS",
    key: "/siswa-lms",
    icon: <BranchesOutlined />,
  },
  {
    label: "CBT",
    key: "/siswa-cbt",
    icon: <DesktopOutlined />,
  },
  {
    label: "Laporan Akademik",
    key: "/siswa-laporan-akademik",
    icon: <AreaChartOutlined />,
  },
  {
    label: "Laporan Tahfiz",
    key: "/siswa-laporan-tahfiz",
    icon: <AuditOutlined />,
  },
  { label: "Profile", key: "/profile", icon: <UserOutlined /> },
  { label: "Logout", key: "logout", icon: <LogoutOutlined />, danger: true },
];

export const ParentMenus = [
  {
    label: "Dashboard",
    key: "/orangtua-dashboard",
    icon: <WindowsOutlined />,
  },
  {
    label: "Data Siswa",
    key: "/orangtua-database-siswa",
    icon: <DatabaseOutlined />,
  },
  {
    label: "Laporan Akademik",
    key: "/orangtua-laporan-akademik",
    icon: <AreaChartOutlined />,
  },
  {
    label: "Laporan Tahfiz",
    key: "/orangtua-laporan-tahfiz",
    icon: <AuditOutlined />,
  },
  { label: "Logout", key: "logout", icon: <LogoutOutlined />, danger: true },
];

export const TahfizMenus = [
  {
    label: "Dashboard",
    key: "/tahfiz-dashboard",
    icon: <WindowsOutlined />,
  },
  {
    label: "Alqur'an",
    key: "/tahfiz-alquran",
    icon: <FolderAddOutlined />,
  },
  {
    label: "Penilaian",
    key: "/tahfiz-penilaian",
    icon: <RiseOutlined />,
  },
  {
    label: "Hafalan",
    key: "/tahfiz-hafalan",
    icon: <AuditOutlined />,
  },

  { label: "Profile", key: "/profile", icon: <UserOutlined /> },
  { label: "Logout", key: "logout", icon: <LogoutOutlined />, danger: true },
];
