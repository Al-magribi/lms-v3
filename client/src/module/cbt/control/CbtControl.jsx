import MainLayout from "../../../components/layout/MainLayout";
import { useSearchParams } from "react-router-dom";
import { Tabs } from "antd";
import Bank from "../bank/Bank";
import Questions from "../bank/Questions";
import Exams from "../exams/Exams";
import Report from "../report/Report";
import { FolderOutlined, ScheduleOutlined } from "@ant-design/icons";

const CbtControl = () => {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject")?.replace(/-/g, " ");
  const bankid = searchParams.get("bankid");
  const name = searchParams.get("name")?.replace(/-/g, " ");
  const report = searchParams.get("report");
  const examid = searchParams.get("examid");
  const token = searchParams.get("token");

  const items = [
    {
      label: "Bank Soal",
      key: "1",
      children: <Bank />,
      icon: <FolderOutlined />,
    },
    {
      label: "Jadwal Ujian",
      key: "2",
      children: <Exams />,
      icon: <ScheduleOutlined />,
    },
  ];

  if (bankid) {
    return (
      <MainLayout
        title={"Mangement Computer Based Test"}
        levels={["admin", "teacher"]}
      >
        <Questions subject={subject} bankid={bankid} name={name} />
      </MainLayout>
    );
  }

  if (report) {
    return (
      <MainLayout
        title={
          name ? name?.replace(/-/g, " ") : "Mangement Computer Based Test"
        }
        levels={["admin", "teacher"]}
      >
        <Report name={name} examid={examid} token={token} />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={"Mangement Computer Based Test"}
      levels={["admin", "teacher"]}
    >
      <Tabs items={items} />
    </MainLayout>
  );
};

export default CbtControl;
