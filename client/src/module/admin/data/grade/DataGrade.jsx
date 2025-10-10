import { Flex, Typography } from "antd";
import React, { useState } from "react";
import Add from "../../../../components/buttons/Add";
import FormGrade from "./FormGrade";
import TableData from "./TableData";

const { Title } = Typography;

const DataGrade = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [grade, setGrade] = useState({});

  const handleEdit = (record) => {
    setGrade(record);
    setIsEdit(true);
    setOpen(true);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title style={{ margin: 0 }} level={5}>
          Management Tingkat
        </Title>

        <Add onClick={() => setOpen(true)} />
      </Flex>

      <TableData onEdit={handleEdit} />

      <FormGrade
        title={isEdit ? "Edit Tingkat" : "Tambah Tingkat"}
        open={open}
        setOpen={() => setOpen(false)}
        grade={grade}
        setGrade={() => setGrade({})}
      />
    </Flex>
  );
};

export default DataGrade;
