import { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";
import Upload from "./Upload";

const AdminClass = () => {
  const [detail, setDetail] = useState("");

  return (
    <Layout title={"Management Kelas"} levels={["admin"]}>
      <Form detail={detail} setDetail={setDetail} />

      <TableData setDetail={setDetail} />

      <Upload />
    </Layout>
  );
};

export default AdminClass;
