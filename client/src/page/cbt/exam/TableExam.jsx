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
  const [limit, setLimit] = useState(10);
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
    <div style={{ overflow: "visible", position: "relative" }}>
      <Table
        page={page}
        setPage={setPage}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}
        isLoading={loading}
      >
        <div
          className='table-responsive'
          style={{ overflow: "visible", position: "relative" }}
        >
          <table
            className='table table-hover table-striped'
            style={{ position: "relative", overflow: "visible" }}
          >
            <thead className='table-dark'>
              <tr>
                <th scope='col'>No</th>
                <th scope='col'>Data Ujian</th>
                <th scope='col'>Token</th>
                <th scope='col'>Kelas</th>
                <th scope='col'>Bank Soal</th>
                <th scope='col'>Skor PG</th>
                <th scope='col'>Skor Essay</th>
                <th scope='col'>Durasi</th>
                <th scope='col'>Status</th>
                <th scope='col'>Aksi</th>
              </tr>
            </thead>
            <tbody style={{ position: "relative", overflow: "visible" }}>
              {exams?.length > 0 ? (
                exams?.map((exam, i) => (
                  <tr
                    key={i}
                    style={{ position: "relative", overflow: "visible" }}
                  >
                    <td className='align-middle'>
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className='align-middle'>
                      <div className='d-flex flex-column'>
                        <div>
                          <div className='text-primary'>Ujian: {exam.name}</div>
                          <small>{exam.teacher_name}</small>
                        </div>
                        <small className='text-muted'>
                          {exam.isshuffle ? (
                            <span className='badge bg-success me-1'>
                              Teracak
                            </span>
                          ) : (
                            <span className='badge bg-secondary me-1'>
                              Terurut
                            </span>
                          )}
                        </small>
                      </div>
                    </td>

                    <td className='align-middle'>
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        onClick={() => copyTokenHandler(exam.token)}
                        title='Copy Token'
                      >
                        <i className='bi bi-clipboard me-1'></i>
                        {exam.token}
                      </button>
                    </td>
                    <td className='align-middle'>
                      <div className='d-flex flex-wrap gap-1'>
                        {exam.classes?.map((item, idx) => (
                          <span
                            key={idx}
                            className='badge bg-primary'
                            style={{ fontSize: "0.7rem" }}
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='align-middle'>
                      <div className='d-flex flex-column gap-1'>
                        {exam.banks.map((bank, idx) => (
                          <div key={idx} className='small'>
                            <div className='fw-bold'>{bank.name}</div>
                            {bank.type !== "paket" && (
                              <small className='text-muted'>
                                PG: {bank.pg} | Essay: {bank.essay}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className='align-middle'>
                      <span className='badge bg-success'>{exam.mc_score}%</span>
                    </td>
                    <td className='align-middle'>
                      <span className='badge bg-info'>{exam.essay_score}%</span>
                    </td>
                    <td className='align-middle'>
                      <span className='badge bg-warning text-dark'>
                        {exam.duration} menit
                      </span>
                    </td>
                    <td className='align-middle'>
                      <button
                        className={`btn btn-sm ${
                          exam.isactive ? "btn-success" : "btn-danger"
                        }`}
                        onClick={() => changeStatusHandler(exam.id)}
                        disabled={isLoading}
                      >
                        {exam.isactive ? "Aktif" : "Tidak Aktif"}
                      </button>
                    </td>
                    <td
                      className='align-middle'
                      style={{ position: "relative", overflow: "visible" }}
                    >
                      <div
                        className='dropdown'
                        style={{ position: "relative" }}
                      >
                        <button
                          className='btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center gap-1'
                          type='button'
                          data-bs-toggle='dropdown'
                          aria-expanded='false'
                          style={{
                            minWidth: "120px",
                            justifyContent: "space-between",
                            fontSize: "0.875rem",
                            padding: "0.375rem 0.75rem",
                            border: "1px solid #0d6efd",
                            borderRadius: "0.375rem",
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <span>Pilihan Aksi</span>
                          <i
                            className='bi bi-chevron-down'
                            style={{ fontSize: "0.75rem" }}
                          ></i>
                        </button>
                        <ul
                          className='dropdown-menu dropdown-menu-end shadow-lg border-0'
                          style={{
                            minWidth: "200px",
                            padding: "0.5rem 0",
                            borderRadius: "0.5rem",
                            border: "1px solid rgba(0,0,0,0.1)",
                            backgroundColor: "#fff",
                            zIndex: 99999,
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "0.25rem",
                            boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                            transform: "translateY(0)",
                            opacity: 1,
                            visibility: "visible",
                            maxHeight: "none",
                            overflow: "visible",
                            pointerEvents: "auto",
                          }}
                        >
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center py-2 px-3'
                              onClick={() =>
                                openNewTab(exam.name, exam.id, exam.token)
                              }
                              style={{
                                fontSize: "0.875rem",
                                color: "#495057",
                                transition: "all 0.15s ease-in-out",
                                border: "none",
                                backgroundColor: "transparent",
                                width: "100%",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.color = "#0d6efd";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#495057";
                              }}
                            >
                              <i
                                className='bi bi-eye me-3'
                                style={{ fontSize: "1rem", color: "#0d6efd" }}
                              ></i>
                              <span>Lihat</span>
                            </button>
                          </li>
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center py-2 px-3'
                              data-bs-toggle='modal'
                              data-bs-target='#addexam'
                              onClick={() => setDetail(exam)}
                              style={{
                                fontSize: "0.875rem",
                                color: "#495057",
                                transition: "all 0.15s ease-in-out",
                                border: "none",
                                backgroundColor: "transparent",
                                width: "100%",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.color = "#0d6efd";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#495057";
                              }}
                            >
                              <i
                                className='bi bi-pencil me-3'
                                style={{ fontSize: "1rem", color: "#ffc107" }}
                              ></i>
                              <span>Edit</span>
                            </button>
                          </li>
                          <li>
                            <hr
                              className='dropdown-divider my-2'
                              style={{
                                borderColor: "#e9ecef",
                                margin: "0.5rem 0",
                              }}
                            />
                          </li>
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center py-2 px-3'
                              disabled={isLoading}
                              onClick={() => deleteHandler(exam.id)}
                              style={{
                                fontSize: "0.875rem",
                                color: "#dc3545",
                                transition: "all 0.15s ease-in-out",
                                border: "none",
                                backgroundColor: "transparent",
                                width: "100%",
                                textAlign: "left",
                                opacity: isLoading ? 0.6 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (!isLoading) {
                                  e.target.style.backgroundColor = "#fff5f5";
                                  e.target.style.color = "#dc3545";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isLoading) {
                                  e.target.style.backgroundColor =
                                    "transparent";
                                  e.target.style.color = "#dc3545";
                                }
                              }}
                            >
                              <i
                                className='bi bi-trash me-3'
                                style={{ fontSize: "1rem" }}
                              ></i>
                              <span>
                                {isLoading ? "Memproses..." : "Hapus"}
                              </span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='11' className='text-center py-4'>
                    <div className='alert alert-info mb-0'>
                      <i className='bi bi-info-circle me-2'></i>
                      Data belum tersedia
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Table>
    </div>
  );
};

export default TableExam;
