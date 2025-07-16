import React from "react";
import Layout from "../../../components/layout/Layout";
import TableData from "./TableData";

const TeacherScores = () => {
  return (
    <Layout title="Penilaian" levels={["teacher"]}>
      <TableData />
    </Layout>
  );
};

export default TeacherScores;
