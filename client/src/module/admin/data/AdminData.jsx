import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { Tabs } from "antd";
import DataPeriode from "./periode/DataPeriode";
import DataMajor from "./major/DataMajor";
import DataGrade from "./grade/DataGrade";
import DataClass from "./class/DataClass";
import {
  MergeOutlined,
  ReconciliationOutlined,
  RiseOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

const AdminData = () => {
  const items = [
    {
      label: "Periode",
      key: "1",
      children: <DataPeriode />,
      icon: <ScheduleOutlined />,
    },
    {
      label: "Jurusan",
      key: "2",
      children: <DataMajor />,
      icon: <MergeOutlined />,
    },
    {
      label: "Tingkat",
      key: "3",
      children: <DataGrade />,
      icon: <RiseOutlined />,
    },
    {
      label: "Kelas",
      key: "4",
      children: <DataClass />,
      icon: <ReconciliationOutlined />,
    },
  ];
  return (
    <MainLayout title={"Management Data pokok"} levels={["admin"]}>
      <Tabs defaultActiveKey="1" items={items} />
    </MainLayout>
  );
};

export default AdminData;
