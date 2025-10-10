import MainLayout from "../../../components/layout/MainLayout";
import Students from "./students/Students";
import Parents from "./parent/Parents";
import Graduation from "./graduation/Graduation";
import { Tabs } from "antd";

const AdminStudent = () => {
  const items = [
    { key: "1", label: "Siswa", children: <Students /> },
    { key: "2", label: "Orang Tua", children: <Parents /> },
    { key: "3", label: "Lulusan", children: <Graduation /> },
  ];

  return (
    <MainLayout title={"Management Siswa"} levels={["admin"]}>
      <Tabs centered defaultActiveKey='1' items={items} />
    </MainLayout>
  );
};

export default AdminStudent;
