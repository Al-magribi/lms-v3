import React from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import { Card, Flex, Typography } from "antd";
import SingleDatabase from "../../database/SingleDatabase";

const ParentDatabase = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <MainLayout title={`Database ${user?.student}`} levels={["parent"]}>
      <SingleDatabase studentid={user?.student_id} name={user?.student} />
    </MainLayout>
  );
};

export default ParentDatabase;
