import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { Tabs } from "antd";
import Market from "./market/Market";
import Demographic from "./demography/Demographic";
import Geographic from "./geography/Geographic";

const CenterAnalysis = () => {
  return (
    <MainLayout title={"Analisa Pasar"} levels={["center"]}>
      <Tabs
        defaultActiveKey="1"
        centered
        items={[
          { label: "Potensial Analisis", key: "1", children: <Market /> },
          { label: "Demografi", key: "2", children: <Demographic /> },
          { label: "Georafi", key: "3", children: <Geographic /> },
        ]}
      />
    </MainLayout>
  );
};

export default CenterAnalysis;
