import { LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Logout = ({ onClick }) => {
  return (
    <Button
      icon={<LogoutOutlined />}
      color="danger"
      variant="solid"
      onClick={onClick}
    >
      Logout
    </Button>
  );
};

export default Logout;
