import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Verses from "./verses/Verses";
import Juzs from "./juzs/Juzs";
import { Flex, Tabs, Typography } from "antd";

const TahfizQuran = () => {
  const items = [
    { label: "Surah", key: "1", children: <Verses /> },
    { label: "Juz", key: "2", children: <Juzs /> },
  ];
  return (
    <MainLayout title={"Management Al Qur'an"} levels={["tahfiz"]}>
      <Flex vertical gap='middle'>
        <Typography.Title style={{ margin: 0 }} level={5}>
          Managemen Alqur'an
        </Typography.Title>

        <Tabs defaultActiveKey='1' centered items={items} />
      </Flex>
    </MainLayout>
  );
};

export default TahfizQuran;
