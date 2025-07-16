import { useState } from "react";
import Table from "../../../components/table/Table";
import { useGetStudentsQuery } from "../../../controller/api/lms/ApiScore";
import Loading from "../../../components/loader/Loading";
import ReactSelect from "react-select";

const TableData = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [classid, setClassid] = useState("");

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
              <td className="text-center">{(page - 1) * limit + index + 1}</td>
              <td className="text-center">{student.nis}</td>
              <td>{student.student_name}</td>
              <td className="text-center">{student.grade_name}</td>
              <td className="text-center">{student.class_name}</td>
              <td className="text-center">
                <button className="btn btn-sm btn-primary me-2">
                  <i className="bi bi-eye"></i>
                </button>

                <button className="btn btn-sm btn-warning">
                  <i className="bi bi-clipboard-check"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
