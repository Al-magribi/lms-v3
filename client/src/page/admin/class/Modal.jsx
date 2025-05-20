import React, { useEffect, useState } from "react";
import Add from "./Add";
import Upload from "./Upload";
import {
  useDeleteStudentMutation,
  useGetStudentsInClassQuery,
} from "../../../controller/api/admin/ApiClass";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { useGraduatedMutation } from "../../../controller/api/admin/ApiStudent";

const Modal = ({ detail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const classid = detail.id;

  const { data: rawData = {}, refetch } = useGetStudentsInClassQuery(
    { page, limit, search, classid },
    { skip: !classid }
  );
  const { totalData, totalPages, students = [] } = rawData;
  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();

  const [
    graduated,
    {
      isSuccess: isSuccessGraduated,
      isLoading: isLoadingGraduated,
      isError: isErrorGraduated,
      reset: resetGraduated,
    },
  ] = useGraduatedMutation();

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

  const changeStatusHandler = () => {
    toast.promise(
      graduated(classid)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const download = () => {
    window.open("/temp/template_kelas_siswa.xlsx", "_blank");
  };

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isSuccessGraduated || isErrorGraduated) {
      resetGraduated();
    }
  }, [isSuccessGraduated, isErrorGraduated]);

  return (
    <div
      className="modal fade"
      id="modal-add"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h1
              className="modal-title fs-5 d-flex align-items-center gap-2"
              id="staticBackdropLabel"
            >
              <i className="bi bi-mortarboard-fill text-primary"></i>
              Kelas <span className="text-primary">{detail?.name}</span>
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body bg-light d-flex flex-column gap-3">
            <div className="row g-3">
              <div className="col-lg-6 col-12">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title mb-3">Tambah Siswa</h6>
                    <Add classid={detail.id} />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-12">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title mb-3">Upload Siswa</h6>
                    <Upload classid={detail.id} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <Table
                  page={page}
                  setPage={setPage}
                  setLimit={setLimit}
                  setSearch={setSearch}
                  totalData={totalData}
                  totalPages={totalPages}
                >
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="text-center" style={{ width: "60px" }}>
                            No
                          </th>
                          <th className="text-center">Jurusan</th>
                          <th className="text-center">Tingkat</th>
                          <th className="text-center">NIS</th>
                          <th>Nama</th>
                          <th className="text-center">Status</th>
                          <th
                            className="text-center"
                            style={{ width: "100px" }}
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students?.length > 0 ? (
                          students?.map((student, i) => (
                            <tr key={i}>
                              <td className="text-center">
                                {(page - 1) * limit + i + 1}
                              </td>
                              <td className="text-center">
                                {student.major_name}
                              </td>
                              <td className="text-center">
                                {student.grade_name}
                              </td>
                              <td className="text-center">{student.nis}</td>
                              <td>{student.student_name}</td>
                              <td className="text-center">
                                {student.isactive ? (
                                  <span className="badge bg-primary bg-opacity-10 text-primary">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="badge bg-success bg-opacity-10 text-success">
                                    Lulus
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={isLoading}
                                  onClick={() => deleteHandler(student.id)}
                                >
                                  <i className="bi bi-person-dash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-4">
                              <div className="d-flex flex-column align-items-center gap-2 text-muted">
                                <i className="bi bi-inbox fs-4"></i>
                                <span>Data tidak tersedia</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Table>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top">
            <button className="btn btn-outline-primary" onClick={download}>
              <i className="bi bi-download me-2"></i>
              Template
            </button>
            <button
              className="btn btn-success"
              disabled={isLoadingGraduated}
              onClick={changeStatusHandler}
            >
              <i className="bi bi-mortarboard me-2"></i>
              Luluskan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
