import { RetweetOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Reset = ({ onClick }) => {
  return (
    <Button
      icon={<RetweetOutlined />}
      onClick={onClick}
      style={{
        backgroundColor: "#faad14",
        color: "#fff",
        borderColor: "#faad14",
      }}
    >
      Ulang
    </Button>
  );
};

export default Reset;
