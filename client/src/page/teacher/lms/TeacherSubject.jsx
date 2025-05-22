import React from "react";
import LmsSubjectList from "../../lms/subject/LmsSubjectList";
import Layout from "../../../components/layout/Layout";

const TeacherSubject = () => {
  return (
    <Layout title={"Mata Pelajaran Saya"} levels={["teacher"]}>
      <LmsSubjectList />
    </Layout>
  );
};

export default TeacherSubject;
