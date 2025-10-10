import { Flex, Typography } from "antd";
import MainLayout from "../../../components/layout/MainLayout";
import Add from "../../../components/buttons/Add";
import { useState } from "react";
import TableData from "./TableData";
import FormHomebase from "./FormHomebase";

const { Title } = Typography;

const CenterHomebase = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [homebase, setHomebase] = useState({});

  const handleEdit = (record) => {
    setHomebase(record);
    setIsEdit(true);
    setOpen(true);
  };

  return (
    <MainLayout title={"Management Satuan"} levels={["center"]}>
      <Flex vertical gap="middle">
        <Flex justify="space-between">
          <Title level={5}>Management Satuan</Title>

          <Add onClick={() => setOpen(true)} />
        </Flex>

        <TableData onEdit={handleEdit} />
      </Flex>

      <FormHomebase
        open={open}
        setOpen={() => setOpen(false)}
        title={isEdit ? "Edit Satuan" : "Tambah Satuan"}
        homebase={homebase}
        setHomebase={() => setHomebase({})}
      />
    </MainLayout>
  );
};

export default CenterHomebase;
