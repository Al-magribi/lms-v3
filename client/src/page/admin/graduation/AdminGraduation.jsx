import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";

const AdminGraduation = () => {
  const [detail, setDetail] = useState({});
  return (
    <Layout title="Lulusan" levels={["admin"]}>
      <Form detail={detail} setDetail={setDetail} />

      <TableData setDetail={setDetail} />
    </Layout>
  );
};

export default AdminGraduation;
