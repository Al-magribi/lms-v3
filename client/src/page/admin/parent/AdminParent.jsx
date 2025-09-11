import React from "react";
import Layout from "../../../components/layout/Layout";
import TableData from "./TableData";

const AdminParent = () => {
  return (
    <Layout title={"Management Orang Tua"} levels={["admin"]}>
      <TableData />
    </Layout>
  );
};

export default AdminParent;
