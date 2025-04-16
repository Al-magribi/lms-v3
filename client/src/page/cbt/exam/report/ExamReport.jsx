import React, { useState, useRef } from "react";
import Layout from "../../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Filters from "./Filters";

const ExamReport = () => {
  const { name, examid, token } = useParams();
  const [classid, setClassid] = useState("");
  const tableRef = useRef();

  const handleRefetch = () => {
    tableRef.current?.refetch();
  };

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
        onRefetch={handleRefetch}
      />
    </Layout>
  );
};

export default ExamReport;
