import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { Tabs } from "antd";
import Subjects from "../subjects/Subjects";
import { useNavigate, useSearchParams } from "react-router-dom";
import Chapters from "../subjects/chapter/Chapters";
import Attendance from "../attendance/Attendance";
import Scoring from "../scoring/Scoring";
import TabScore from "../scoring/TabScore";
import {
  AimOutlined,
  AuditOutlined,
  CalculatorOutlined,
  CarryOutOutlined,
  FileDoneOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import Presensi from "../recap/Presensi";
import Attitude from "../recap/Attitude";
import Daily from "../recap/Daily";
import Final from "../recap/Final";
import FinalScore from "../scoring/FinalScore";

const LmsControl = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const subjectid = searchParams.get("subjectid");
  const mode = searchParams.get("mode");

  const handleBack = () => {
    navigate("/learning-management-system");
  };

  const items = [
    {
      label: "Mata Pelajaran",
      key: "1",
      children: <Subjects />,
      icon: <FolderOutlined />,
    },
    {
      label: "Absen",
      key: "2",
      children: <Attendance />,
      icon: <AuditOutlined />,
    },
    {
      label: "Penilaian",
      key: "3",
      children: <Scoring />,
      icon: <CalculatorOutlined />,
    },
    {
      label: "Rekap Kehadiran",
      key: "4",
      children: <Presensi />,
      icon: <CarryOutOutlined />,
    },
    {
      label: "Nilai Sikap",
      key: "5",
      children: <Attitude />,
      icon: <FileDoneOutlined />,
    },
    {
      label: "Nilai Sumatif",
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

  if (mode === "lms") {
    return <Chapters name={name} id={subjectid} onBack={handleBack} />;
  }

  if (mode === "finalscore") {
    return <FinalScore name={name} id={subjectid} />;
  }

  if (mode === "scoring") {
    return <TabScore name={name} id={subjectid} />;
  }

  return (
    <MainLayout title={"Learning Management System"} levels={["teacher"]}>
      <Tabs defaultActiveKey="1" items={items} />
    </MainLayout>
  );
};

export default LmsControl;
