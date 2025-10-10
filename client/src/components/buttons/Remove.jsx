import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Remove = ({ onClick }) => {
  return (
    <Button type="primary" danger icon={<DeleteOutlined />} onClick={onClick}>
      Hapus
    </Button>
  );
};

export default Remove;
