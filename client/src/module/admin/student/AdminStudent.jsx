import MainLayout from "../../../components/layout/MainLayout";
import Students from "./students/Students";
import Parents from "./parent/Parents";
import Graduation from "./graduation/Graduation";
import { Tabs } from "antd";
import { IdcardOutlined, UserOutlined } from "@ant-design/icons";

const AdminStudent = () => {
  const items = [
    {
      key: "1",
      label: "Siswa",
      children: <Students />,
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: "Orang Tua",
      children: <Parents />,
      icon: <IdcardOutlined />,
    },
    // { key: "3", label: "Lulusan", children: <Graduation /> },
  ];

  return (
    <MainLayout title={"Management Siswa"} levels={["admin"]}>
      <Tabs defaultActiveKey="1" items={items} />
    </MainLayout>
  );
};

export default AdminStudent;
