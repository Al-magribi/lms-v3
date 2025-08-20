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
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={loading}
    >
      <div className='table-responsive'>
        <table className='table table-hover table-striped'>
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
          <tbody>
            {exams?.length > 0 ? (
              exams?.map((exam, i) => (
                <tr key={i}>
                  <td className='align-middle'>{(page - 1) * limit + i + 1}</td>
                  <td className='align-middle'>
                    <div className='d-flex flex-column'>
                      <div>
                        <div className='text-primary'>Ujian: {exam.name}</div>
                        <small>{exam.teacher_name}</small>
                      </div>
                      <small className='text-muted'>
                        {exam.isshuffle ? (
                          <span className='badge bg-success me-1'>Teracak</span>
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
                  <td className='align-middle'>
                    <div className='dropdown'>
                      <button
                        className='btn btn-sm btn-outline-primary dropdown-toggle'
                        type='button'
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </button>
                      <ul className='dropdown-menu dropdown-menu-end'>
                        <li>
                          <button
                            className='dropdown-item'
                            onClick={() =>
                              openNewTab(exam.name, exam.id, exam.token)
                            }
                          >
                            <i className='bi bi-eye me-2'></i>
                            Lihat
                          </button>
                        </li>
                        <li>
                          <button
                            className='dropdown-item'
                            data-bs-toggle='modal'
                            data-bs-target='#addexam'
                            onClick={() => setDetail(exam)}
                          >
                            <i className='bi bi-pencil me-2'></i>
                            Edit
                          </button>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button
                            className='dropdown-item text-danger'
                            disabled={isLoading}
                            onClick={() => deleteHandler(exam.id)}
                          >
                            <i className='bi bi-trash me-2'></i>
                            Hapus
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
  );
};

export default TableExam;
