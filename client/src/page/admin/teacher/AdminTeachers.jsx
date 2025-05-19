import { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import Upload from "./Upload";
import TableData from "./TableData";

const AdminTeachers = () => {
  const [detail, setDetail] = useState({});

  return (
    <Layout title={"Guru"} levels={["admin"]}>
      <Form detail={detail} setDetail={setDetail} />

      <Upload />

      <TableData setDetail={setDetail} />
    </Layout>
  );
};

export default AdminTeachers;
