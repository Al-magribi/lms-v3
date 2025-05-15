import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteExamMutation,
  useGetExamsQuery,
  useChangeStatusMutation,
} from "../../../controller/api/cbt/ApiExam";
import { toast } from "react-hot-toast";

const TableExam = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: loading } = useGetExamsQuery({
    page,
    limit,
    search,
  });
  const { exams = [], totalData, totalPages } = rawData;

  const [deleteExam, { isSuccess, isLoading, isError, reset }] =
    useDeleteExamMutation();
  const [
    changeStatus,
    { isSuccess: isSuccessStatus, isError: isErrorStatus, reset: resetStatus },
  ] = useChangeStatusMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus ujian ini dan semua data yang terkait dengan ujian ini?"
    );

    if (confirm) {
      toast.promise(
        deleteExam(id)
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

  const changeStatusHandler = (id) => {
    toast.promise(
      changeStatus(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const copyTokenHandler = (token) => {
    navigator.clipboard.writeText(token);
    toast.success("Token berhasil disalin");
  };

  const openNewTab = (name, id, token) => {
    const formatName = name.toUpperCase().replace(/ /g, "-");
    window.open(`/laporan-ujian/${formatName}/${id}/${token}`, "_blank");
  };

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isSuccessStatus || isErrorStatus) {
      resetStatus();
    }
  }, [isSuccessStatus, isErrorStatus]);

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={loading}
    >
      <div className="row g-4">
        {exams?.length > 0 ? (
          exams?.map((exam, i) => (
            <div key={i} className="col-12 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column h-100">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <span className="badge bg-primary">{i + 1}</span>
                      <span className="fw-bold lh-1">{exam.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="form-check form-switch pointer d-flex align-items-center m-0"
                        onClick={() => changeStatusHandler(exam.id)}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`flexSwitchCheckChecked-${i}`}
                          checked={exam.isactive}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-person-badge-fill text-primary"></i>
                    <div className="fw-medium">{exam.teacher_name}</div>
                  </div>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-text-fill text-primary"></i>
                    <div className="d-flex flex-column gap-1">
                      {exam.banks.map((bank, idx) => (
                        <span key={idx} className="fw-medium">
                          {bank.type !== "paket"
                            ? `${bank.name} - PG ${bank.pg} - Essay ${bank.essay}`
                            : `${bank.name}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Kelas</div>
                    <div className="d-flex flex-wrap gap-2">
                      {exam.classes?.map((item, idx) => (
                        <span key={idx} className="badge bg-primary">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">PG</div>
                      <span className="badge bg-success">{exam.mc_score}%</span>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Essay</div>
                      <span className="badge bg-success">
                        {exam.essay_score}%
                      </span>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Durasi</div>
                      <span className="badge bg-primary">
                        {exam.duration} Menit
                      </span>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Acak</div>
                      {exam.isshuffle ? (
                        <span className="badge bg-success">Ya</span>
                      ) : (
                        <span className="badge bg-danger">Tidak</span>
                      )}
                    </div>
                  </div>
                  {/* Token & Dropdown Aksi */}
                  <div className="mb-1 d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <span
                      className="badge bg-secondary pointer fs-6"
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Copy Token"
                      onClick={() => copyTokenHandler(exam.token)}
                    >
                      {exam.token}
                    </span>

                    <button
                      className="btn btn-secondary btn-sm dropdown-toggle"
                      type="button"
                      id={`dropdownMenuButton-${i}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Pilihan Aksi
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby={`dropdownMenuButton-${i}`}
                    >
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center"
                          onClick={() =>
                            openNewTab(exam.name, exam.id, exam.token)
                          }
                        >
                          <i className="bi bi-people me-2"></i>
                          Lihat
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center"
                          data-bs-toggle="modal"
                          data-bs-target="#addexam"
                          onClick={() => setDetail(exam)}
                        >
                          <i className="bi bi-pencil-square me-2"></i>
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center text-danger"
                          disabled={isLoading}
                          onClick={() => deleteHandler(exam.id)}
                        >
                          <i className="bi bi-folder-x me-2"></i>
                          Hapus
                        </button>
                      </li>
                    </ul>
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

export default TableExam;
