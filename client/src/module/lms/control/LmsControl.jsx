import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { Tabs } from "antd";
import Subjects from "../subjects/Subjects";
import { useSearchParams } from "react-router-dom";
import Chapters from "../subjects/chapter/Chapters";
import Attendance from "../attendance/Attendance";
import Scoring from "../scoring/Scoring";
import TabScore from "../scoring/TabScore";

const LmsControl = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const subjectid = searchParams.get("subjectid");
  const mode = searchParams.get("mode");

  const items = [
    { label: "Absen", key: "1", children: <Attendance /> },
    { label: "Mata Pelajaran", key: "2", children: <Subjects /> },
    { label: "Penilaian", key: "3", children: <Scoring /> },
  ];

  if (mode === "lms") {
    return <Chapters name={name} id={subjectid} />;
  }

  if (mode === "scoring") {
    return <TabScore name={name} id={subjectid} />;
  }

  return (
    <MainLayout title={"Learning Management System"} levels={["teacher"]}>
      <Tabs defaultActiveKey="1" items={items} centered />
    </MainLayout>
  );
};

export default LmsControl;
