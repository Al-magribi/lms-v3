import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import { useGetDatabaseByClassQuery } from "../../../controller/api/database/ApiDatabase";
import Table from "../../../components/table/Table";
import { useNavigate } from "react-router-dom";

const TeacherDatabase = () => {
  const navigate = useNavigate();
  const { classname, classid } = useParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useGetDatabaseByClassQuery({
    page,
    limit,
    search,
    classid,
  });
  const { students = [], totalData, totalPages } = data || {};

  const gotoDatabase = (userid, name) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/database/${userid}/${formattedName}`);
  };

  return (
    <Layout
      title={`Database Kelas ${classname.replace(/-/g, " ")}`}
      levels={["teacher"]}
    >
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}
      >
        <table className="mb-0 table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th className="text-center">No</th>
              <th className="text-center">Homebase</th>
              <th className="text-center">Periode</th>
              <th className="text-center">Nama</th>
              <th className="text-center">Kelas</th>
              <th className="text-center">Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="text-center align-middle">
                  {student.homebase_name}
                </td>
                <td className="text-center align-middle">
                  {student.periode_name}
                </td>
                <td className="align-middle">{student.student_name}</td>
                <td className="text-center align-middle">
                  {student.class_name}
                </td>
                <td className="text-center align-middle">
                  <div className="progress" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar ${
                        parseInt(student.completeness) === 100
                          ? "bg-success"
                          : parseInt(student.completeness) >= 50
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                      role="progressbar"
                      style={{ width: `${student.completeness}%` }}
                      aria-valuenow={student.completeness}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {student.completeness}%
                    </div>
                  </div>
                </td>
                <td className="text-center align-middle">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      gotoDatabase(student.student, student.student_name)
                    }
                  >
                    <i className="bi bi-database"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </Layout>
  );
};

export default TeacherDatabase;
