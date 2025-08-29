import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Table from "../../../../components/table/Table";
import {
  useFinishCbtMutation,
  useGetExamLogQuery,
  useRejoinExamMutation,
  useRetakeExamMutation,
} from "../../../../controller/api/log/ApiLog";
import { toast } from "react-hot-toast";
import AnswerSheet from "./AnswerSheet";

const TableData = forwardRef(({ classid, examid }, ref) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const tableRef = useRef();

  const {
    data = {},
    isLoading,
    refetch,
  } = useGetExamLogQuery({
    exam: examid,
    classid: classid,
    page,
    limit,
    search,
  });
  const { result = [], totalData, totalPages } = data;
  const [detail, setDetail] = useState({});

  const [finishCbt, { isLoading: finishLoad }] = useFinishCbtMutation();
  const [rejoinExam, { isLoading: rejoinLoad }] = useRejoinExamMutation();
  const [retakeExam, { isLoading: retakeLoad }] = useRetakeExamMutation();

  useImperativeHandle(ref, () => ({
    refetch,
    getTableElement: () => tableRef.current,
  }));

  const hanldeFinish = (id) => {
    toast.promise(
      finishCbt({ id, exam: examid })
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleRejoin = (id) => {
    toast.promise(
      rejoinExam({ id })
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleRetake = (id, student) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin mengulang ujian dan menghapus seluruh data jawaban siswa? "
    );

    if (confirm) {
      toast.promise(
        retakeExam({ id, student, exam: examid })
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Memuat data...",
          success: (message) => message,
          error: (error) => error.data.message,
        }
      );
    }
  };

  return (
    <>
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            ref={tableRef}
            className="table table-striped table-hover table-bordered"
            style={{ minWidth: 800 }}
          >
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-center">
                  No
                </th>
                <th scope="col" className="text-center">
                  NIS
                </th>
                <th scope="col" className="text-center">
                  Nama Siswa
                </th>
                <th scope="col" className="text-center">
                  Kelas
                </th>
                <th scope="col" className="text-center">
                  Tingkat
                </th>
                <th scope="col" className="text-center">
                  IP Address
                </th>
                <th scope="col" className="text-center">
                  Browser
                </th>
                <th scope="col" className="text-center">
                  Waktu Mulai
                </th>
                <th scope="col" className="text-center">
                  Status
                </th>
                <th scope="col" className="text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {result.length > 0 ? (
                result.map((item, index) => (
                  <tr key={item.student_id || index}>
                    <td className="text-center align-middle">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="text-center align-middle">{item.nis}</td>
                    <td className="align-middle">{item.student_name}</td>
                    <td className="text-center align-middle">
                      {item.class_name}
                    </td>
                    <td className="text-center align-middle">
                      {item.grade_name}
                    </td>
                    <td className="text-center align-middle">
                      {item.ip || "-"}
                    </td>
                    <td className="text-center align-middle">
                      {item.browser || "-"}
                    </td>
                    <td className="text-center align-middle">
                      {item.createdat ? (
                        <span className="badge bg-success">
                          {new Date(item.createdat).toLocaleString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      {item.ispenalty ? (
                        <span className="badge bg-danger">Melanggar</span>
                      ) : item.isactive ? (
                        <span className="badge bg-warning">Mengerjakan</span>
                      ) : item.isdone ? (
                        <span className="badge bg-success">Selesai</span>
                      ) : (
                        <span className="badge bg-secondary">Belum Masuk</span>
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <div className="dropdown">
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          id={`dropdownMenuButton-${index}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Aksi
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby={`dropdownMenuButton-${index}`}
                        >
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center"
                              title="Lihat Detail"
                              data-bs-toggle="modal"
                              data-bs-target="#answerSheet"
                              onClick={() => setDetail(item)}
                            >
                              <i className="bi bi-eye me-2"></i> Lihat
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center"
                              title="Izinkan Masuk"
                              onClick={() => handleRejoin(item.log_id)}
                              disabled={rejoinLoad || !item.isactive}
                            >
                              <i className="bi bi-arrow-repeat me-2"></i>{" "}
                              Izinkan
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center"
                              title="Selesaikan"
                              onClick={() => hanldeFinish(item.log_id)}
                              disabled={
                                finishLoad || item.isdone || !item.isactive
                              }
                            >
                              <i className="bi bi-check-circle me-2"></i>{" "}
                              Selesaikan
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center text-danger"
                              title="Ulangi Ujian"
                              onClick={() =>
                                handleRetake(item.log_id, item.student_id)
                              }
                              disabled={retakeLoad || !item.isdone}
                            >
                              <i className="bi bi-recycle me-2"></i> Ulangi
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    {isLoading
                      ? "Memuat data..."
                      : "Tidak ada data yang ditemukan"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Table>

      <AnswerSheet detail={detail} />
    </>
  );
});

export default TableData;
