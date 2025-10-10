import { SaveOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Save = ({ onClick, disabled }) => {
  return (
    <Button
      style={{ backgroundColor: "#52c41a", color: "#fff" }}
      onClick={onClick}
      disabled={disabled}
      icon={<SaveOutlined />}
    >
      Simpan
    </Button>
  );
};

export default Save;
