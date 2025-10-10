import { Flex, Space } from "antd";
import Title from "antd/es/typography/Title";
import React, { useState } from "react";
import Add from "../../../../components/buttons/Add";
import TableData from "./TableData";
import Upload from "../../../../components/buttons/Upload";
import FormParent from "./FormParent";
import FormUpload from "./FormUpload";

const Parents = () => {
  const [open, setOpen] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [parent, setParent] = useState("");

  const handleEdit = (record) => {
    setParent(record);
    console.log(record);
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setParent("");
    setIsEdit(false);
    setOpen(false);
  };
  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title style={{ margin: 0 }} level={5}>
          Management Orang Tua
        </Title>

        <Space>
          <Upload onClick={() => setOpenUpload(true)} />

          <Add onClick={() => setOpen(true)} />
        </Space>
      </Flex>

      <TableData onEdit={handleEdit} />

      <FormParent
        title={isEdit ? "Edit Data Orang Tua" : "Simpan Data Orang tua"}
        open={open}
        onClose={handleClose}
        parent={parent}
      />

      <FormUpload open={openUpload} onClose={() => setOpenUpload(false)} />
    </Flex>
  );
};

export default Parents;
