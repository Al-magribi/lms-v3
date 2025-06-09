import { useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteBankMutation,
  useGetBankQuery,
} from "../../../controller/api/cbt/ApiBank";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const TableBank = ({ setDetail }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetBankQuery({
    page,
    limit,
    search,
  });
  const { banks = [], totalData, totalPages } = rawData;
  const [deleteBank, { isLoading }] = useDeleteBankMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus bank soal ini dan semua data yang terkait dengan bank soal ini?"
    );
    if (confirm) {
      toast.promise(
        deleteBank(id)
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

  const goToLink = (subject, name, id) => {
    const nameFormat = name.replace(/[\s/]/g, "-");
    const subjectFormat = subject.replace(/[\s/]/g, "-");
    navigate(`/admin-cbt-bank/${subjectFormat}/${nameFormat}/${id}`);
  };

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
        {banks?.length > 0 ? (
          banks?.map((item, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div className="card bg-white rounded-4 shadow-sm hover-shadow h-100">
                <span
                  className="position-absolute top-0 end-0 badge bg-primary rounded-pill m-2"
                  style={{ fontSize: 13, zIndex: 2 }}
                >
                  #{(page - 1) * limit + i + 1}
                </span>
                <div className="card-body p-4 d-flex flex-column h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex gap-3 align-items-center">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: 48, height: 48 }}
                      >
                        <i className="bi bi-person text-primary fs-4"></i>
                      </div>
                      <div className="d-flex flex-column">
                        <h6
                          title={item.name}
                          className="fw-bold text-primary mb-1 pointer"
                        >
                          {item.name.length > 20
                            ? `${item.name.slice(0, 20)}...`
                            : item.name}
                        </h6>

                        <div className="d-flex gap-2 align-items-center">
                          <span
                            title={item.teacher_name}
                            className="text-muted small pointer"
                          >
                            {item.teacher_name.length > 20
                              ? `${item.teacher_name.slice(0, 20)}...`
                              : item.teacher_name}
                          </span>

                          <div className="vr"></div>

                          <span className="text-muted small">
                            {item.subject_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow">
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() =>
                              goToLink(item.subject_name, item.name, item.id)
                            }
                          >
                            <i className="bi bi-folder-fill"></i> Lihat
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() => setDetail(item)}
                            data-bs-toggle="modal"
                            data-bs-target="#addbank"
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
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-tag me-2 text-success fs-5"></i>
                        <div>
                          <small className="text-muted d-block">Jenis</small>
                          <span className="badge bg-success bg-opacity-75 px-3 py-1">
                            {item.btype.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-question-circle me-2 text-info fs-5"></i>
                        <div>
                          <small className="text-muted d-block">
                            Jumlah Soal
                          </small>
                          <span className="badge bg-info bg-opacity-75 px-3 py-1">
                            {`${item.question_count} Soal`}
                          </span>
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
            <div className="alert alert-info mb-0">Data belum tersedia</div>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableBank;
