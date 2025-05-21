import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";

const AdminStudents = () => {
  const [detail, setDetail] = useState("");
  return (
    <Layout title={"Siswa"} levels={["admin"]}>
      <Form detail={detail} setDetail={setDetail} />

      <TableData setDetail={setDetail} />
    </Layout>
  );
};

export default AdminStudents;
