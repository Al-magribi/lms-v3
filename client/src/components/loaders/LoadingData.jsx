import { Spin } from "antd";
import React from "react";

const LoadingData = ({ children, isLoading }) => {
  return (
    <Spin spinning={isLoading} style={{ height: 100 }}>
      {children}
    </Spin>
  );
};

export default LoadingData;
