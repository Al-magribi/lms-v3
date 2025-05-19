import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteSubjectMutation,
  useGetSubjectQuery,
} from "../../../controller/api/admin/ApiSubject";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetAppQuery } from "../../../controller/api/center/ApiApp";

const TableData = ({ setDetail }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetSubjectQuery({
    page,
    limit,
    search,
  });
  const { data: app } = useGetAppQuery();

  const { totalData, totalPages, subjects = [] } = rawData;
  const [deleteSubject, { isSuccess, isLoading, isError, reset }] =
    useDeleteSubjectMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data mata pelajaran ini dan semua data yang terkait dengan mata pelajaran ini?"
    );
    if (confirm) {
      toast.promise(
        deleteSubject(id)
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

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  useEffect(() => {
    if (isSuccess || isError) {
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
        {subjects?.length > 0 ? (
          subjects?.map((subject, i) => (
            <div key={i} className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100 p-0 overflow-hidden">
                <div className="d-flex flex-row h-100">
                  <div
                    className="d-flex flex-column align-items-center justify-content-center bg-light"
                    style={{ minWidth: 110, maxWidth: 110 }}
                  >
                    <span
                      className="badge bg-primary rounded-pill position-absolute mt-2 ms-2"
                      style={{ zIndex: 2, fontSize: 14 }}
                    >
                      {(page - 1) * limit + i + 1}
                    </span>
                    <img
                      src={subject.cover ? subject.cover : app?.logo}
                      alt={`cover-${subject.name}`}
                      width={80}
                      height={100}
                      className="rounded-3 shadow-sm mt-4 mb-4"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="flex-grow-1 d-flex flex-column justify-content-between p-3">
                    <div>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5
                          className="text-primary mb-2"
                          style={{ fontSize: 20 }}
                        >
                          {subject.name}
                        </h5>

                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-warning dropdown-toggle"
                            type="button"
                            id={`dropdownMenuButton${subject.id}`}
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          ></button>
                          <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby={`dropdownMenuButton${subject.id}`}
                          >
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() =>
                                  goToLink(subject.name, subject.id)
                                }
                              >
                                <i className="bi bi-eye"></i> Detail
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => setDetail(subject)}
                              >
                                <i className="bi bi-pencil-square"></i> Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                disabled={isLoading}
                                onClick={() => deleteHandler(subject.id)}
                              >
                                <i className="bi bi-folder-minus"></i> Hapus
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-2 mb-2">
                        {subject.teachers.length > 0 ? (
                          subject.teachers.map((teacher, i) => (
                            <div key={i} className="d-flex flex-column">
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-medium text-dark">
                                  {teacher.name}
                                </span>
                                <span className="text-secondary fw-normal small">
                                  {`(${
                                    teacher.class?.length > 0
                                      ? teacher.class
                                          ?.map((item) => item.name)
                                          .join(", ")
                                      : "Data belum tersedia"
                                  })`}
                                </span>
                              </div>
                              <div className="d-flex gap-4 text-secondary small mt-1">
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-book me-2"></i>
                                  <span>{teacher.chapters} Chapter</span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-file-text me-2"></i>
                                  <span>{teacher.contents} Materi</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-secondary fw-normal small">
                            Data belum tersedia
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info d-flex align-items-center gap-2 mb-0">
              <i className="bi bi-info-circle-fill"></i>
              <span>Data tidak tersedia</span>
            </div>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableData;
