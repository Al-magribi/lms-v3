import React, { useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { Flex, Space, Typography } from "antd";
import Add from "../../../components/buttons/Add";
import FormAdmin from "./FormAdmin";
import TableData from "./TableData";

const { Title } = Typography;

const CenterAdmin = () => {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState({});
  const [isEdit, setEdit] = useState(false);

  const handleEdit = (record) => {
    setAdmin(record);
    setEdit(true);
    setOpen(true);
  };

  return (
    <MainLayout title={"Managemen Administrasi"} levels={["center"]}>
      <Flex vertical gap="middle">
        <Flex justify="space-between">
          <Title level={5} style={{ margin: 0 }}>
            Mangemen Administrasi
          </Title>

          <Add onClick={() => setOpen(true)} />
        </Flex>

        <TableData onEdit={handleEdit} />
      </Flex>

      <FormAdmin
        title={isEdit ? "Edit data Admin" : "Tambah Admin"}
        open={open}
        setOpen={() => setOpen(false)}
        admin={admin}
        setAdmin={() => setAdmin({})}
      />
    </MainLayout>
  );
};

export default CenterAdmin;
