import React from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector } from "react-redux";
import Subjects from "./Subjects";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import FormData from "./FormData";
import TableScoring from "./TableScoring";

const TeacherScores = () => {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject");
  const id = searchParams.get("id");

  const { user } = useSelector((state) => state.auth);

  const subjects = user?.subjects;

  const isSubjectsEmpty = !subjects || subjects.length === 0;

  if (subject && id) {
    return (
      <Layout title="Penilaian" levels={["teacher"]}>
        <FormData subject={subject} id={id} />

        <TableScoring />
      </Layout>
    );
  }

  return (
    <Layout title="Penilaian" levels={["teacher"]}>
      {isSubjectsEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row justify-content-center"
        >
          <div className="col-md-6 text-center">
            <div className="py-5">
              <div
                className="bg-light rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{ width: "100px", height: "100px" }}
              >
                <i className="bi bi-journal-x display-4 text-primary"></i>
              </div>
              <h4 className="fw-bold mb-3">Belum Ada Mata Pelajaran</h4>
              <p className="text-muted mb-0">
                Anda belum ditugaskan untuk mengajar mata pelajaran apapun saat
                ini
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <Subjects subjects={subjects} user={user} />
      )}
    </Layout>
  );
};

export default TeacherScores;
