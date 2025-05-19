import React, { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../controller/api/admin/ApiTeacher";
import toast from "react-hot-toast";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
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
      <div className="row g-4">
        {teachers?.length > 0 ? (
          teachers?.map((teacher, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <span
                        style={{ height: 50, width: 50 }}
                        className="badge bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                      >
                        <i
                          className="bi bi-person-circle text-primary"
                          style={{ fontSize: 25 }}
                        ></i>
                      </span>
                      <div className="ms-3">
                        <h5 className="card-title mb-1 text-primary">
                          {teacher.name}
                        </h5>
                        <p className="text-muted small mb-0">
                          {teacher.username}
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => setDetail(teacher)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={isLoading}
                        onClick={() => deleteHandler(teacher.id)}
                      >
                        <i className="bi bi-folder-minus"></i>
                      </button>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-building me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">Satuan</small>
                          <span className="fw-medium">{teacher.homebase}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-gender-ambiguous me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">
                            Jenis Kelamin
                          </small>
                          <span className="fw-medium">
                            {teacher.gender === "L" ? "Laki-laki" : "Perempuan"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-mortarboard me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">
                            Wali Kelas
                          </small>
                          <span className="fw-medium">
                            {teacher.homeroom ? teacher.class_name : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-book me-2 text-primary mt-1"></i>
                        <div>
                          <small className="text-muted d-block">
                            Mata Pelajaran
                          </small>
                          <div className="d-flex flex-wrap gap-2">
                            {teacher.subjects?.map((item) => (
                              <span
                                key={item.id}
                                className="badge bg-light text-dark"
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info mb-0">Data Belum tersedia</div>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableData;
