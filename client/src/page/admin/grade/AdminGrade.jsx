import { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";

const AdminGrade = () => {
  const [detail, setDetai] = useState("");

  return (
    <Layout title={"Management Tingkat Pendidikan"} levels={["admin"]}>
      <div className='container d-flex flex-column gap-4'>
        <Form detail={detail} setDetail={setDetai} />

        <TableData setDetail={setDetai} />
      </div>
    </Layout>
  );
};

export default AdminGrade;
