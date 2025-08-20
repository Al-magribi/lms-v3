import React, { useEffect, useState } from "react";
import {
  useDeleteClassMutation,
  useGetClassQuery,
} from "../../../controller/api/admin/ApiClass";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";
import Modal from "./Modal";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [selectedClass, setClass] = useState({});

  const { data: rawData = {}, isLoading: dataLoading } = useGetClassQuery({
    page,
    limit,
    search,
  });
  const { classes = [], totalData, totalPages } = rawData;
  const [deleteClass, { isSuccess, isLoading, error, reset }] =
    useDeleteClassMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data kelas ini dan semua data yang terkait dengan kelas ini?"
    );
    if (confirm) {
      toast.promise(
        deleteClass(id)
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
    if (error) {
      reset();
    }
  }, [isSuccess, error]);

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
      {/* <div className="row g-4">
        {classes.length > 0 ? (
          classes.map((item, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <div className="card bg-white border rounded-4 shadow-sm hover-shadow h-100 position-relative">
                <div className="card-body p-4 d-flex flex-column h-100">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex flex-column align-items-start">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary fst-italic">
                          _id: {item.id}
                        </span>

                        <h4
                          className="fw-bold text-primary m-0"
                          style={{ fontSize: 22 }}
                        >
                          {item.name}
                        </h4>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-mortarboard text-success"></i>
                        <span className="text-muted small">
                          {item.major_name}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-bar-chart text-info"></i>
                        <span className="text-muted small">
                          Tingkat: {item.grade_name}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-people text-primary"></i>
                        <span className="text-muted small">
                          {item.students} Siswa
                        </span>
                      </div>
                    </div>
                    <div className="dropdown ms-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        id={`dropdownMenuButton-${i}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className="dropdown-menu dropdown-menu-end shadow"
                        aria-labelledby={`dropdownMenuButton-${i}`}
                      >
                        <li>
                          <button
                            type="button"
                            className="dropdown-item d-flex align-items-center gap-2"
                            data-bs-toggle="modal"
                            data-bs-target="#modal-add"
                            onClick={() => setClass(item)}
                          >
                            <i className="bi bi-people-fill"></i> Siswa
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            data-bs-toggle="modal"
                            data-bs-target="#addclass"
                            onClick={() => setDetail(item)}
                          >
                            <i className="bi bi-pencil-square"></i> Edit
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2 text-danger"
                            disabled={isLoading}
                            onClick={() => deleteHandler(item.id)}
                          >
                            <i className="bi bi-folder-minus"></i> Hapus
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted gap-2">
              <i className="bi bi-inbox fs-1"></i>
              <span className="fs-5">Data belum tersedia</span>
            </div>
          </div>
        )}
      </div> */}

      <div className='table-responsive'>
        <table className='table table-bordered table-striped table-hover'>
          <thead>
            <tr>
              <th className='text-center'>_id</th>
              <th className='text-center'>Nama Kelas</th>
              <th className='text-center'>Tingkat</th>
              <th className='text-center'>Jurusan</th>
              <th className='text-center'>Siswa</th>
              <th className='text-center'>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map((item, i) => (
                <tr key={i}>
                  <td className='text-center align-middle'>{item.id}</td>
                  <td className='text-center align-middle'>{item.name}</td>
                  <td className='text-center align-middle'>
                    {item.grade_name}
                  </td>
                  <td className='text-center align-middle'>
                    {item.major_name}
                  </td>
                  <td className='text-center align-middle'>{item.students}</td>
                  <td className='text-center align-middle'>
                    <div className='dropdown ms-2'>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        type='button'
                        id={`dropdownMenuButton-${i}`}
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                      >
                        Pilihan Aksi
                      </button>
                      <ul
                        className='dropdown-menu dropdown-menu-end shadow'
                        aria-labelledby={`dropdownMenuButton-${i}`}
                      >
                        <li>
                          <button
                            type='button'
                            className='dropdown-item d-flex align-items-center gap-2'
                            data-bs-toggle='modal'
                            data-bs-target='#modal-add'
                            onClick={() => setClass(item)}
                          >
                            <i className='bi bi-people-fill'></i> Siswa
                          </button>
                        </li>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2'
                            data-bs-toggle='modal'
                            data-bs-target='#addclass'
                            onClick={() => setDetail(item)}
                          >
                            <i className='bi bi-pencil-square'></i> Edit
                          </button>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2 text-danger'
                            disabled={isLoading}
                            onClick={() => deleteHandler(item.id)}
                          >
                            <i className='bi bi-folder-minus'></i> Hapus
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className='text-center'>
                  <i className='bi bi-inbox fs-1'></i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal detail={selectedClass} />
    </Table>
  );
};

export default TableData;
