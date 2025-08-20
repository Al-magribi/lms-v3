import React, { useEffect, useState } from "react";
import {
  useChangePeriodeMutation,
  useChangeStatusMutation,
  useDeleteStudentMutation,
  useGetStudentsQuery,
  useDownloadStudentMutation,
} from "../../../controller/api/admin/ApiStudent";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { useGetPeriodeQuery } from "../../../controller/api/database/ApiDatabase";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("");

  const {
    data: rawData = {},
    isLoading: dataLoading,
    refetch,
  } = useGetStudentsQuery({
    page,
    limit,
    search,
  });
  const { students = [], totalData, totalPages } = rawData;
  const { data: periodes } = useGetPeriodeQuery();

  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();
  const [downloadStudent, { isLoading: isDownloading }] =
    useDownloadStudentMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus siswa ini dan semua data yang terkait dengan siswa ini?"
    );
    if (confirm) {
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
    }
  };

  const handleDownload = () => {
    toast.promise(
      downloadStudent()
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Mengunduh data siswa...",
        success: (message) => message,
        error: (err) => err.data?.message || "Gagal mengunduh file",
      }
    );
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
      isLoading={dataLoading}
      downloadButton={{
        onClick: handleDownload,
        isLoading: isDownloading,
      }}
    >
      <div className='table-responsive'>
        <table
          className='table table-hover align-middle'
          style={{ fontSize: "0.9rem" }}
        >
          <thead className='table-light'>
            <tr>
              <th className='text-center' style={{ width: "60px" }}>
                No
              </th>
              <th className='text-start'>Nama Siswa</th>
              <th className='text-center' style={{ width: "80px" }}>
                Gender
              </th>
              <th className='text-center' style={{ width: "120px" }}>
                NIS
              </th>
              <th className='text-center' style={{ width: "100px" }}>
                Kelas
              </th>
              <th className='text-center' style={{ width: "100px" }}>
                Status
              </th>
              <th className='text-center' style={{ width: "120px" }}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {students?.length > 0 ? (
              students.map((student, i) => (
                <tr key={i} className='border-bottom'>
                  <td className='text-center text-muted fw-medium'>
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td>
                    <div className='d-flex flex-column'>
                      <span
                        className='fw-semibold text-dark'
                        style={{ fontSize: "0.95rem" }}
                      >
                        {student.name}
                      </span>
                      <small className='text-muted'>
                        {student.homebase} • {student.periode_name}
                      </small>
                    </div>
                  </td>
                  <td className='text-center'>
                    <span
                      className={`badge rounded-pill text-dark ${
                        student.gender === "L"
                          ? "bg-primary bg-opacity-10"
                          : "bg-pink bg-opacity-10"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {student.gender === "L" ? "L" : "P"}
                    </span>
                  </td>
                  <td className='text-center'>
                    <code
                      className='bg-light px-2 py-1 rounded'
                      style={{ fontSize: "0.8rem" }}
                    >
                      {student.nis}
                    </code>
                  </td>
                  <td className='text-center'>
                    <span className='badge bg-secondary bg-opacity-10 text-secondary rounded-pill'>
                      {student.classname}
                    </span>
                  </td>
                  <td className='text-center'>
                    <span
                      className={`badge rounded-pill ${
                        student.isactive
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-danger bg-opacity-10 text-danger"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {student.isactive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className='text-center'>
                    <div className='dropdown'>
                      <button
                        className='btn btn-sm btn-outline-secondary border-0'
                        type='button'
                        id={`dropdownMenuButton${student.id}`}
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                        style={{ fontSize: "0.8rem" }}
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </button>
                      <ul
                        className='dropdown-menu dropdown-menu-end shadow-sm border-0'
                        aria-labelledby={`dropdownMenuButton${student.id}`}
                        style={{ fontSize: "0.85rem" }}
                      >
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2 py-2'
                            data-bs-target='#addstudent'
                            data-bs-toggle='modal'
                            onClick={() => setDetail(student)}
                          >
                            <i className='bi bi-pencil-square text-primary'></i>
                            <span>Edit Data</span>
                          </button>
                        </li>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2 py-2 text-danger'
                            disabled={isLoading}
                            onClick={() => deleteHandler(student.id)}
                          >
                            <i className='bi bi-trash3'></i>
                            <span>Hapus</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='7' className='text-center py-5'>
                  <div className='d-flex flex-column align-items-center text-muted'>
                    <i className='bi bi-inbox fs-1 mb-3'></i>
                    <span className='fw-medium'>Data siswa belum tersedia</span>
                    <small>Silakan tambahkan data siswa baru</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Table>
  );
};

export default TableData;
