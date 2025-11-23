import { Flex, Tabs } from "antd";
import MainLayout from "../../../components/layout/MainLayout";
import Subjects from "./subjects/Subjects";
import Teachers from "./teachers/Teachers";
import Category from "./category/Category";
import NewReport from "./report/NewReport";
import Final from "./final/Final";
import Daily from "./daily/Daily";
import {
  AimOutlined,
  ApartmentOutlined,
  AuditOutlined,
  CalendarOutlined,
  ContactsOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

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
      label: "Nilai Harian",
      key: "6",
      children: <Daily />,
      icon: <AuditOutlined />,
    },
    {
      label: "Nilai Akhir",
      key: "7",
      children: <Final />,
      icon: <AimOutlined />,
    },
  ];

  return (
    <MainLayout title={"Management Akademik"} levels={["admin"]}>
      <Flex vertical gap={"middle"}>
        <Tabs defaultActiveKey='1' items={items} />
      </Flex>
    </MainLayout>
  );
};

export default AdminAcademic;
