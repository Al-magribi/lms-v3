import { Button, Flex, Space } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";
import Add from "../../../../components/buttons/Add";
import Download from "../../../../components/buttons/Download";
import TableData from "./TableData";

const Students = () => {
  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title style={{ margin: 0 }} level={5}>
          Mangement Siswa
        </Title>

        <Download />
      </Flex>

      <TableData />
    </Flex>
  );
};

export default Students;
