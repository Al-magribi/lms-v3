import React, { useEffect, useState } from "react";
import {
  useDeleteStudentMutation,
  useGetStudentsQuery,
} from "../../../controller/api/admin/ApiStudent";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const TableData = ({ setDetail }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetStudentsQuery({
    page,
    limit,
    search,
  });
  const { students = [], totalData, totalPages } = rawData;

  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();

  const deleteHandler = (id) => {
    toast.promise(
      deleteStudent(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const gotoDatabase = (name, nis, period) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/database/${formattedName}/${nis}/${period}`);
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={dataLoading}>
      <table className='m-0 table table-bordered table-striped table-hover'>
        <thead>
          <tr>
            <th className='text-center'>No</th>
            <th className='text-center'>Satuan</th>
            <th className='text-center'>Tahun Masuk</th>
            <th className='text-center'>NIS</th>
            <th className='text-center'>Nama</th>
            <th className='text-center'>Kelamin</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students?.map((student, i) => (
            <tr key={i}>
              <td className='text-center align-middle'>
                {(page - 1) * limit + i + 1}
              </td>
              <td className='text-center align-middle'>{student.homebase}</td>
              <td className='text-center align-middle'>{student.entry}</td>
              <td className='text-center align-middle'>{student.nis}</td>
              <td className='align-middle'>{student.name}</td>
              <td className='text-center align-middle'>
                {student.gender === "L" ? "Laki - Laki" : "Perempuan"}
              </td>
              <td className='text-cente align-middle'>
                <div className='d-flex justify-content-center gap-2'>
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() => setDetail(student)}>
                    <i className='bi bi-pencil-square'></i>
                  </button>

                  <button
                    className='btn btn-sm btn-danger'
                    disabled={isLoading}
                    onClick={() => deleteHandler(student.id)}>
                    <i className='bi bi-person-x-fill'></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
