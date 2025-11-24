import { Flex, Tabs } from "antd";
import MainLayout from "../../../components/layout/MainLayout";
import Subjects from "./subjects/Subjects";
import Teachers from "./teachers/Teachers";
import Category from "./category/Category";
import NewReport from "./report/NewReport";
import Final from "../../lms/recap/Final";
import Daily from "../../lms/recap/Daily";
import {
  AimOutlined,
  ApartmentOutlined,
  AuditOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  ContactsOutlined,
  FileDoneOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import Presensi from "../../lms/recap/Presensi";
import Attitude from "../../lms/recap/Attitude";

const AdminAcademic = () => {
  const items = [
    {
      label: "Kategori",
      key: "1",
      children: <Category />,
      icon: <ApartmentOutlined />,
    },
    {
      label: "Mata Pelajaran",
      key: "2",
      children: <Subjects />,
      icon: <ContactsOutlined />,
    },
    {
      label: "Guru",
      key: "3",
      children: <Teachers />,
      icon: <IdcardOutlined />,
    },
    {
      label: "Laporan Bulanan",
      key: "5",
      children: <NewReport />,
      icon: <CalendarOutlined />,
    },
    {
      label: "Rekap Kehadiran",
      key: "6",
      children: <Presensi />,
      icon: <CarryOutOutlined />,
    },
    {
      label: "Nilai Sikap",
      key: "7",
      children: <Attitude />,
      icon: <FileDoneOutlined />,
    },
    {
      label: "Nilai Harian",
      key: "8",
      children: <Daily />,
      icon: <AuditOutlined />,
    },
    {
      label: "Nilai Akhir",
      key: "9",
      children: <Final />,
      icon: <AimOutlined />,
    },
  ];

  return (
    <MainLayout title={"Management Akademik"} levels={["admin"]}>
      <Flex vertical gap={"middle"}>
        <Tabs defaultActiveKey="1" items={items} />
      </Flex>
    </MainLayout>
  );
};

export default AdminAcademic;
