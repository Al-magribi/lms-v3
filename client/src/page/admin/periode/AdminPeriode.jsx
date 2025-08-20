import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";

const AdminPeriode = () => {
  const [detail, setDetail] = useState("");

  return (
    <Layout title={"Management Periode Pembelajaran"} levels={["admin"]}>
      <div className='container d-flex flex-column gap-4'>
        <Form detail={detail} setDetail={setDetail} />

        <TableData setDetail={setDetail} />
      </div>
    </Layout>
  );
};

export default AdminPeriode;
