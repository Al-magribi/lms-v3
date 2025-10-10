import { EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Edit = ({ onClick }) => {
  return (
    <Button icon={<EditOutlined />} type="default" onClick={onClick}>
      Sunting
    </Button>
  );
};

export default Edit;
