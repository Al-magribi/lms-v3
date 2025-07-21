import React from "react";
import Layout from "../../../components/layout/Layout";
import TableData from "./TableData";
import Filters from "./Filters";

const TeacherScores = () => {
  return (
    <Layout title="Penilaian" levels={["teacher"]}>
      <Filters />

      <TableData />
    </Layout>
  );
};

export default TeacherScores;
