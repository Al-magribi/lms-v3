import { CloudDownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Download = ({ onClick }) => {
  return (
    <Button
      style={{ backgroundColor: "#52c41a", color: "#fff" }}
      icon={<CloudDownloadOutlined />}
      onClick={onClick}
    >
      Unduh
    </Button>
  );
};

export default Download;
