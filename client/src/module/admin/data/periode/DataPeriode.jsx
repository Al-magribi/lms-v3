import { Flex, Space, Typography } from "antd";
import Add from "../../../../components/buttons/Add";
import TableData from "./TableData";
import { useState } from "react";
import FormPeriode from "./FormPeriode";

const { Title } = Typography;

const DataPeriode = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [periode, setPeriode] = useState({});

  const handleEdit = (record) => {
    setPeriode(record);
    setOpen(true);
    setIsEdit(true);
  };
  return (
    <Flex vertical gap="middle">
      <Flex align="center" justify="space-between">
        <Title style={{ margin: 0 }} level={5}>
          Mangement Periode
        </Title>

        <Add onClick={() => setOpen(true)} />
      </Flex>

      <TableData onEdit={handleEdit} />

      <FormPeriode
        open={open}
        title={isEdit ? "Edit Periode" : "Tambah Periode"}
        periode={periode}
        setPeriode={() => setPeriode({})}
        setOpen={() => setOpen(false)}
      />
    </Flex>
  );
};

export default DataPeriode;
