import { Card } from "antd";
import Add from "../../../../components/buttons/Add";
import TableData from "./TableData";
import { useState } from "react";
import FormCat from "./FormCat";

const Category = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [catdata, setCatdata] = useState([]);

  const handleClose = () => {
    setCatdata({});
    setOpen(false);
    setIsEdit(false);
  };

  const handleEdit = (record) => {
    setCatdata(record);
    setIsEdit(true);
    setOpen(true);
  };
  return (
    <Card
      hoverable
      title="Managemen Kategori"
      extra={<Add onClick={() => setOpen(true)} />}
    >
      <TableData onEdit={handleEdit} />

      <FormCat
        title={isEdit ? "Edit Kategori" : "Simpan Kategori"}
        open={open}
        onClose={handleClose}
        category={catdata}
      />
    </Card>
  );
};

export default Category;
