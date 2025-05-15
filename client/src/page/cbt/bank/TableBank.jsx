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
  const [limit, setLimit] = useState(10);
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
            <div key={i} className="col-12 col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-primary me-3">
                      {(page - 1) * limit + i + 1}
                    </span>
                    <div>
                      <h5 className="card-title mb-1">{item.name}</h5>
                      <p className="text-muted small mb-0">
                        {item.subject_name}
                      </p>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-person me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">Guru</small>
                          <span className="fw-medium">{item.teacher_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-tag me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">Jenis</small>
                          <span className="badge bg-success">
                            {item.btype.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-question-circle me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">
                            Jumlah Soal
                          </small>
                          <span className="badge bg-secondary">
                            {`${item.question_count} Soal`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-auto pt-3 border-top">
                    <button
                      className="btn btn-sm btn-primary flex-grow-1"
                      onClick={() =>
                        goToLink(item.subject_name, item.name, item.id)
                      }
                    >
                      <i className="bi bi-folder-fill"></i>
                      <span className="ms-2">Lihat</span>
                    </button>
                    <button
                      className="btn btn-sm btn-warning flex-grow-1"
                      onClick={() => setDetail(item)}
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span className="ms-2">Edit</span>
                    </button>
                    <button
                      className="btn btn-sm btn-danger flex-grow-1"
                      disabled={isLoading}
                      onClick={() => deleteHandler(item.id)}
                    >
                      <i className="bi bi-folder-minus"></i>
                      <span className="ms-2">Hapus</span>
                    </button>
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
