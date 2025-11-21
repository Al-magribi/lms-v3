import { Flex, Tabs } from "antd";
import MainLayout from "../../../components/layout/MainLayout";
import Subjects from "./subjects/Subjects";
import Teachers from "./teachers/Teachers";
// import Report from "./report/Report";
import Category from "./category/Category";
import NewReport from "./report/NewReport";

const AdminAcademic = () => {
  const items = [
    { label: "Kategori", key: "1", children: <Category /> },
    { label: "Mata Pelajaran", key: "2", children: <Subjects /> },
    { label: "Guru", key: "3", children: <Teachers /> },
    // { label: "Laporan Bulanan", key: "4", children: <Report /> },
    { label: "Laporan Bulanan", key: "5", children: <NewReport /> },
    { label: "Nilai Akhir", key: "6", children: <NewReport /> },
  ];

  return (
    <MainLayout title={"Management Akademik"} levels={["admin"]}>
      <Flex vertical gap={"middle"}>
        <Tabs defaultActiveKey="1" centered items={items} />
      </Flex>
    </MainLayout>
  );
};

export default AdminAcademic;
