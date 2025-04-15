import React, { useState } from "react";
import Layout from "../../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Filters from "./Filters";
import TableData from "./TableData";
const ExamReport = () => {
  const { name, examid, token } = useParams();

  const [classid, setClassid] = useState("");
  return (
    <Layout
      title={`Laporan Ujian ${name.replace(/-/g, " ")}`}
      levels={["admin", "teacher"]}
    >
      <Filters
        classid={classid}
        setClassid={setClassid}
        examid={examid}
        name={name}
        token={token}
      />

      <TableData classid={classid} examid={examid} />
    </Layout>
  );
};

export default ExamReport;
