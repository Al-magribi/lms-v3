import { Flex, Space, Typography } from "antd";
import React, { useState } from "react";
import Add from "../../../../components/buttons/Add";
import FormClass from "./FormClass";
import TableData from "./TableData";
import Upload from "../../../../components/buttons/Upload";
import UploadStudents from "./UploadStudents";

const { Title } = Typography;

const DataClass = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [classData, setClassData] = useState({});
  const [upload, setUpload] = useState(false);

  const handleEdit = (record) => {
    setClassData(record);
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setUpload(false);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title style={{ margin: 0 }} level={5}>
          Management Kelas
        </Title>

        <Space>
          <Add onClick={() => setOpen(true)} />

          <Upload onClick={() => setUpload(true)} />
        </Space>
      </Flex>

      <TableData onEdit={handleEdit} />

      <FormClass
        title={isEdit ? "Edit Kelas" : "Tambah Kelas"}
        open={open}
        setOpen={() => setOpen(false)}
        classData={classData}
        setClassData={() => setClassData({})}
      />

      <UploadStudents open={upload} onClose={() => setUpload(false)} />
    </Flex>
  );
};

export default DataClass;
