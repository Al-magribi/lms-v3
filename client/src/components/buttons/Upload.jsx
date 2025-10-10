import { CloudUploadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Upload = ({ onClick }) => {
  return (
    <Button icon={<CloudUploadOutlined />} onClick={onClick}>
      Unggah
    </Button>
  );
};

export default Upload;
