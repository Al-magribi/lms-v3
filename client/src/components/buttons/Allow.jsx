import { DoubleLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Allow = ({ onClick }) => {
  return (
    <Button
      icon={<DoubleLeftOutlined />}
      style={{ backgroundColor: "#389e0d", color: "#fff" }}
      onClick={onClick}
    >
      Izinkan
    </Button>
  );
};

export default Allow;
