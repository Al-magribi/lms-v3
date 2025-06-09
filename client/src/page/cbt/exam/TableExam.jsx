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
              <div className="card rounded-4 shadow-sm hover-shadow h-100 overflow-hidden">
                <div className="card-body d-flex flex-column h-100 p-4 gap-2">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-start justify-content-center flex-wrap gap-2">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: 48, height: 48 }}
                      >
                        <i className="bi bi-laptop text-primary fs-5"></i>
                      </div>

                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex gap-2 flex-column align-items-start">
                          <h6
                            title={exam.name}
                            className="lh-1 text-primary m-0 pointer"
                          >
                            {exam.name.length > 20
                              ? `${exam.name.slice(0, 20)}...`
                              : exam.name}
                          </h6>
                          <span
                            className="badge bg-secondary pointer"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Copy Token"
                            onClick={() => copyTokenHandler(exam.token)}
                          >
                            {exam.token}
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <span
                            title={exam.teacher_name}
                            className="text-muted small pointer"
                          >
                            {exam.teacher_name.length > 20
                              ? `${exam.teacher_name.slice(0, 20)}...`
                              : exam.teacher_name}
                          </span>
                          <div className="vr" />
                          <div className="d-flex flex-wrap gap-2">
                            {exam.classes?.map((item, idx) => (
                              <span
                                key={idx}
                                className="badge bg-primary bg-opacity-10 text-primary"
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
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
                          <hr className="dropdown-divider" />
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

                  <div className="mb-2 d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48 }}
                    >
                      <i className="bi bi-folder-fill text-primary fs-5"></i>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      {exam.banks.map((bank, idx) => (
                        <span
                          key={idx}
                          className="fs-6 fw-bold text-secondary pointer"
                          title={bank.name}
                        >
                          {bank.type !== "paket"
                            ? `${
                                bank.name.length > 20
                                  ? `${bank.name.slice(0, 20)}...`
                                  : bank.name
                              } - PG ${bank.pg} - Essay ${bank.essay}`
                            : `${
                                bank.name.length > 20
                                  ? `${bank.name.slice(0, 20)}...`
                                  : bank.name
                              }`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">PG</div>
                      <span className="badge bg-success px-3 py-1">
                        {exam.mc_score}%
                      </span>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Essay</div>
                      <span className="badge bg-success px-3 py-1">
                        {exam.essay_score}%
                      </span>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Durasi</div>
                      <span className="badge bg-info px-3 py-1">
                        {exam.duration} Menit
                      </span>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Acak</div>
                      {exam.isshuffle ? (
                        <span className="badge bg-success px-3 py-1">Ya</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-1">Tidak</span>
                      )}
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

export default TableExam;
