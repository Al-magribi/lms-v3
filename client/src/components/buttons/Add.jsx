import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Add = ({ onClick, disabled }) => {
  return (
    <Button
      type="primary"
      size="medium"
      icon={<PlusOutlined />}
      onClick={onClick}
      disabled={disabled}
    >
      Tambah
    </Button>
  );
};

export default Add;
