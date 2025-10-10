import { EllipsisOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

const Detail = ({ onClick }) => {
  return (
    <Button type="link" onClick={onClick}>
      Detail
    </Button>
  );
};

export default Detail;
