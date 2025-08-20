import React, { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../controller/api/admin/ApiTeacher";
import toast from "react-hot-toast";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetTeachersQuery({
    page,
    limit,
    search,
  });
  const { teachers = [], totalData, totalPages } = rawData;
  const [deleteTeacher, { isSuccess, isLoading, isError, reset }] =
    useDeleteTeacherMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data guru ini dan semua data yang terkait dengan guru ini?"
    );
    if (confirm) {
      toast.promise(
        deleteTeacher(id)
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
    >
      <div className='table-responsive'>
        <table className='table table-hover align-middle'>
          <thead className='table-light'>
            <tr>
              <th scope='col' className='text-center' style={{ width: "60px" }}>
                #
              </th>
              <th scope='col'>Nama Guru</th>
              <th scope='col'>NIP/Username</th>
              <th scope='col'>Wali Kelas</th>
              <th scope='col'>Mata Pelajaran</th>
              <th
                scope='col'
                className='text-center'
                style={{ width: "120px" }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers?.length > 0 ? (
              teachers?.map((teacher, index) => (
                <tr key={teacher.id}>
                  <td className='text-center text-muted'>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td>
                    <div className='d-flex align-items-center'>
                      <div>
                        <h6 className='mb-0 fw-semibold'>{teacher.name}</h6>
                        <small className='text-muted'>
                          {teacher.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </small>
                        {teacher.email && (
                          <div className='text-muted small'>
                            <i className='bi bi-envelope me-1'></i>
                            {teacher.email}
                          </div>
                        )}
                        {teacher.phone && (
                          <div className='text-muted small'>
                            <i className='bi bi-telephone me-1'></i>
                            {teacher.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className='badge bg-light text-dark'>
                      {teacher.username}
                    </span>
                  </td>

                  <td>
                    {teacher.homeroom ? (
                      <span className='badge bg-success bg-opacity-10 text-success'>
                        <i className='bi bi-check-circle me-1'></i>
                        {teacher.class_name}
                      </span>
                    ) : (
                      <span className='badge bg-secondary bg-opacity-10 text-secondary'>
                        Bukan Wali Kelas
                      </span>
                    )}
                  </td>
                  <td>
                    <div className='d-flex flex-wrap gap-1'>
                      {teacher.subjects?.map((subject) => (
                        <span
                          key={subject.id}
                          className='badge bg-primary bg-opacity-10 text-primary'
                          style={{ fontSize: "0.75rem" }}
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className='d-flex gap-1 justify-content-center'>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => setDetail(teacher)}
                        data-bs-toggle='modal'
                        data-bs-target='#addteacher'
                        title='Edit'
                      >
                        <i className='bi bi-pencil-square'></i>
                      </button>
                      <button
                        className='btn btn-sm btn-outline-danger'
                        disabled={isLoading}
                        onClick={() => deleteHandler(teacher.id)}
                        title='Hapus'
                      >
                        <i className='bi bi-trash'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='7' className='text-center py-4'>
                  <div className='text-muted'>
                    <i className='bi bi-inbox display-4 d-block mb-3'></i>
                    <h5>Data Belum Tersedia</h5>
                    <p className='mb-0'>Tidak ada data guru yang ditemukan</p>
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
