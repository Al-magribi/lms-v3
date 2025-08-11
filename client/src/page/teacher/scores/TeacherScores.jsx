import { useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector } from "react-redux";
import Subjects from "./Subjects";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import FormData from "./FormData";
import Tabs from "./Tabs";
import Attitude from "./Attitude";
import Attendance from "./Attendance";
import Formative from "./Formative";
import Summative from "./Summative";
import Recap from "./Recap";
import { useGetStudentsInClassQuery } from "../../../controller/api/admin/ApiClass";

const TeacherScores = () => {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject");
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  const [tab, setTab] = useState("attendance");

  const { user } = useSelector((state) => state.auth);

  const subjects = user?.subjects;

  const isSubjectsEmpty = !subjects || subjects.length === 0;

  // Check if all required parameters are present
  const hasRequiredParams =
    classid && subjectid && chapterid && month && semester;

  // Reset tab when parameters change
  useEffect(() => {
    setTab("attendance");
  }, [classid, subjectid, chapterid, month, semester]);

  // Reset pagination when parameters change
  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [classid, subjectid, chapterid, month, semester]);

  // Students data
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetStudentsInClassQuery(
    {
      page,
      limit,
      search,
      classid,
    },
    { skip: !classid }
  );

  if (subject && subjectid) {
    return (
      <Layout title="Penilaian" levels={["teacher"]}>
        <div className="d-flex flex-column gap-3">
          <FormData subject={subject} id={subjectid} />

          <Tabs tab={tab} setTab={setTab} />

          {/* Only render components when required parameters are available */}
          {hasRequiredParams && (
            <>
              {tab === "attitude" && (
                <Attitude
                  key={`attitude-${classid}-${subjectid}-${chapterid}-${month}-${semester}`}
                  data={data}
                  isLoading={isLoading}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  search={search}
                  setSearch={setSearch}
                  totalData={data?.totalData}
                  totalPages={data?.totalPages}
                />
              )}
              {tab === "attendance" && (
                <Attendance
                  key={`attendance-${classid}-${subjectid}-${chapterid}-${month}-${semester}`}
                  data={data}
                  isLoading={isLoading}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  search={search}
                  setSearch={setSearch}
                  totalData={data?.totalData}
                  totalPages={data?.totalPages}
                />
              )}
              {tab === "formative" && (
                <Formative
                  key={`formative-${classid}-${subjectid}-${chapterid}-${month}-${semester}`}
                  data={data}
                  isLoading={isLoading}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  search={search}
                  setSearch={setSearch}
                  totalData={data?.totalData}
                  totalPages={data?.totalPages}
                />
              )}
              {tab === "summative" && (
                <Summative
                  key={`summative-${classid}-${subjectid}-${chapterid}-${month}-${semester}`}
                  data={data}
                  isLoading={isLoading}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  search={search}
                  setSearch={setSearch}
                  totalData={data?.totalData}
                  totalPages={data?.totalPages}
                />
              )}
              {tab === "recap" && (
                <Recap
                  key={`recap-${classid}-${subjectid}-${chapterid}-${month}-${semester}`}
                  data={data}
                  isLoading={isLoading}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  search={search}
                  setSearch={setSearch}
                  totalData={data?.totalData}
                  totalPages={data?.totalPages}
                />
              )}
            </>
          )}
        </div>
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
