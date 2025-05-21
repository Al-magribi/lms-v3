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
          <div className="modal-header border-bottom bg-white py-3 px-4">
            <h1
              className="modal-title fs-5 d-flex align-items-center gap-2 fw-bold"
              id="staticBackdropLabel"
            >
              <i className="bi bi-mortarboard-fill text-primary fs-4"></i>
              Kelas <span className="text-primary">{detail?.name}</span>
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body bg-light d-flex flex-column gap-3 px-4 py-3">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h6 className="card-title mb-3 fw-semibold">Tambah Siswa</h6>
                <Add classid={detail.id} />
              </div>
            </div>

            <div className="card shadow-sm border-0">
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
                    <table className="table table-hover table-striped table-bordered align-middle mb-0">
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
                                  <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary px-3 py-2 fw-normal">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="badge rounded-pill bg-success bg-opacity-25 text-success px-3 py-2 fw-normal">
                                    Lulus
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center gap-1"
                                  disabled={isLoading}
                                  style={{ transition: "0.2s" }}
                                  onMouseOver={(e) =>
                                    e.currentTarget.classList.add("shadow")
                                  }
                                  onMouseOut={(e) =>
                                    e.currentTarget.classList.remove("shadow")
                                  }
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
          <div className="modal-footer border-top bg-white px-4 py-3 d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={download}
            >
              <i className="bi bi-download"></i>
              Template
            </button>
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              disabled={isLoadingGraduated}
              onClick={changeStatusHandler}
            >
              <i className="bi bi-mortarboard"></i>
              Luluskan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
