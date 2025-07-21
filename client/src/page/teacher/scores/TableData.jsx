import { useState } from "react";
import Table from "../../../components/table/Table";
import { useGetStudentsQuery } from "../../../controller/api/lms/ApiScore";
import Loading from "../../../components/loader/Loading";
import FormData from "./FormData";
import ReactSelect from "react-select";

const TableData = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [classid, setClassid] = useState("");
  const [student, setStudent] = useState(null);

  const { data: rawData, isLoading } = useGetStudentsQuery({
    page,
    limit,
    search,
    classid,
  });
  const { students = [], totalData, totalPages } = rawData || {};

  const classes = students.map((student) => ({
    value: student.classid,
    label: student.class_name,
  }));

  if (isLoading) return <Loading />;

  return (
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
      <table className="mb-0 table table-striped table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">NIS</th>
            <th className="text-center">Nama</th>
            <th className="text-center">Tingkat</th>
            <th className="text-center">Kelas</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td className="text-center align-middle">
                {(page - 1) * limit + index + 1}
              </td>
              <td className="text-center align-middle">{student.nis}</td>
              <td className="align-middle">{student.student_name}</td>
              <td className="text-center align-middle">{student.grade_name}</td>
              <td className="text-center align-middle">{student.class_name}</td>
              <td className="text-center align-middle">
                <button
                  className="btn btn-sm btn-primary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#score"
                  onClick={() => setStudent(student)}
                >
                  <i className="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <FormData student={student} setStudent={() => setStudent(null)} />
    </Table>
  );
};

export default TableData;
