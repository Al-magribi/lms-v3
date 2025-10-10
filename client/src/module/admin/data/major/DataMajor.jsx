import { Flex, Typography } from "antd";
import React, { useState } from "react";
import Add from "../../../../components/buttons/Add";
import TableData from "./TableData";
import FormMajor from "./FormMajor";

const { Title } = Typography;

const DataMajor = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [major, setMajor] = useState({});

  const handleEdit = (record) => {
    setMajor(record);
    setIsEdit(true);
    setOpen(true);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title style={{ margin: 0 }} level={5}>
          Management Jurusan
        </Title>

        <Add onClick={() => setOpen(true)} />
      </Flex>

      <TableData onEdit={handleEdit} />

      <FormMajor
        title={isEdit ? "Edit Jurusan" : "Tambah Jurusan"}
        open={open}
        setOpen={() => setOpen(false)}
        major={major}
        setMajor={() => setMajor({})}
      />
    </Flex>
  );
};

export default DataMajor;
