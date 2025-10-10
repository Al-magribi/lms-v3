import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import BasicStats from "./BasicStats";
import { Divider, Flex } from "antd";
import HomebaseStats from "./HomebaseStats";

const CenterDash = () => {
  return (
    <MainLayout levels={["center"]} title={"Dashboard"}>
      <Flex vertical gap={12}>
        <Divider orientation="left">Overview</Divider>

        <BasicStats />

        <Divider orientation="left">Data Satuan</Divider>

        <HomebaseStats />
      </Flex>
    </MainLayout>
  );
};

export default CenterDash;
