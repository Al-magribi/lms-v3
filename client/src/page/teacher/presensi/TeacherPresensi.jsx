import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector } from "react-redux";
import Select from "react-select";
import { useGetClassQuery } from "../../../controller/api/admin/ApiClass";
import Table from "../../../components/table/Table";
import TableData from "./TableData";

const TeacherPresensi = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: classes } = useGetClassQuery({
    page: "",
    limit: "",
    search: "",
  });

  const [classid, setClassid] = useState("");
  const [subjectid, setSubjectid] = useState("");

  const options = user?.subjects?.map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  const optionsClass = classes?.map((kelas) => ({
    value: kelas.id,
    label: kelas.name,
  }));

  return (
    <Layout title={"Presensi Siswa"} levels={["teacher"]}>
      <div className="row g-2 mb-4">
        <div className="col-12 col-lg-3">
          <Select
            options={options}
            isSearchable={true}
            placeholder="Pilih Mata Pelajaran"
            onChange={(e) => setSubjectid(e.value)}
          />
        </div>
        <div className="col-12 col-lg-3">
          <Select
            options={optionsClass}
            isSearchable={true}
            placeholder="Pilih Kelas"
            onChange={(e) => setClassid(e.value)}
          />
        </div>
      </div>

      <TableData classid={classid} subjectid={subjectid} />
    </Layout>
  );
};

export default TeacherPresensi;
