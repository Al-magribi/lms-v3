import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";

const AdminSubject = () => {
  const [detail, setDetail] = useState({});
  return (
    <Layout title={"Mata Pelajaran"} levels={["admin"]}>
      <Form detail={detail} setDetail={setDetail} />

      <TableData setDetail={setDetail} />
    </Layout>
  );
};

export default AdminSubject;
