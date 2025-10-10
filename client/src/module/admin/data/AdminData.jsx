import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { Tabs } from "antd";
import DataPeriode from "./periode/DataPeriode";
import DataMajor from "./major/DataMajor";
import DataGrade from "./grade/DataGrade";
import DataClass from "./class/DataClass";

const AdminData = () => {
  const items = [
    { label: "Periode", key: "1", children: <DataPeriode /> },
    { label: "Jurusan", key: "2", children: <DataMajor /> },
    { label: "Tingkat", key: "3", children: <DataGrade /> },
    { label: "Kelas", key: "4", children: <DataClass /> },
  ];
  return (
    <MainLayout title={"Management Data pokok"} levels={["admin"]}>
      <Tabs defaultActiveKey="1" centered items={items} />
    </MainLayout>
  );
};

export default AdminData;
