import { Flex, Input, Space, Typography } from "antd";
import React, { useState } from "react";
import Add from "../../../components/buttons/Add";
import Lists from "./Lists";
import FormBank from "./FormBank";

const Bank = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [bankData, setBankData] = useState({});

  const [search, setSearch] = useState("");

  const handleClose = () => {
    setBankData({});
    setIsEdit(false);
    setOpen(false);
  };

  const handleEdit = (record) => {
    setBankData(record);
    setIsEdit(true);
    setOpen(true);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Typography.Title style={{ margin: 0 }} level={5}>
          Manajemen Bank Soal
        </Typography.Title>

        <Space>
          <Input.Search
            placeholder="Cari Data ..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />

          <Add onClick={() => setOpen(true)} />
        </Space>
      </Flex>

      <Lists onEdit={handleEdit} search={search} />

      <FormBank
        title={isEdit ? `Edit Bank Soal ${bankData.name}` : "Tambah Bank Soal"}
        open={open}
        onClose={handleClose}
        bank={bankData}
      />
    </Flex>
  );
};

export default Bank;
