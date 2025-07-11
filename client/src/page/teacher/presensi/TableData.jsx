import React, { useState, useEffect } from "react";
import Table from "../../../components/table/Table";
import { useGetStudentsInClassQuery } from "../../../controller/api/admin/ApiClass";
import {
  useGetPresensiQuery,
  useAddPresensiMutation,
  useGetAttendanceDatesQuery,
} from "../../../controller/api/lms/ApiPresensi";
import { toast } from "react-hot-toast";

const TableData = ({ classid, subjectid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data, isLoading } = useGetStudentsInClassQuery(
    {
      page,
      limit,
      search,
      classid,
    },
    { skip: !classid }
  );

  const { data: presensiData } = useGetPresensiQuery(
    { classid, subjectid, date: selectedDate },
    { skip: !classid || !subjectid }
  );

  const { data: attendanceDates } = useGetAttendanceDatesQuery(
    { classid, subjectid },
    { skip: !classid || !subjectid }
  );

  const [addPresensi] = useAddPresensiMutation();

  const { students, totalData, totalPages } = data || {};

  const handleCheck = async ({ studentid, note, checked }) => {
    if (!checked) {
      // If unchecking, we don't send the request (attendance remains as is)
      return;
    }

    const data = { classid, subjectid, studentid, note, date: selectedDate };

    toast.promise(
      addPresensi(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (error) => error.data?.message || "Terjadi kesalahan",
      }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {!classid || !subjectid ? (
        <div className="text-center py-5 empty-state">
          <div className="mb-3">
            <i className="bi bi-clipboard2-check display-1 text-muted"></i>
          </div>
          <h5 className="fw-bold text-muted mb-2">Pilih Data Presensi</h5>
          <p className="text-muted mb-0">
            Silakan pilih mata pelajaran dan kelas terlebih dahulu
          </p>
        </div>
      ) : !students ? (
        <div className="text-center py-5 empty-state">
          <div className="mb-3">
            <i className="bi bi-people display-1 text-muted"></i>
          </div>
          <h5 className="fw-bold text-muted mb-2">Data Siswa Tidak Tersedia</h5>
          <p className="text-muted mb-0">
            Tidak ada data siswa yang ditemukan untuk kelas ini
          </p>
        </div>
      ) : (
        <>
          {/* Date Selection */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="bi bi-calendar-date me-2"></i>
                    Tanggal Presensi:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="bi bi-calendar-check me-2"></i>
                    Riwayat Tanggal:
                  </label>
                  <select
                    className="form-select"
                    onChange={(e) =>
                      e.target.value && setSelectedDate(e.target.value)
                    }
                    value=""
                  >
                    <option value="">Pilih tanggal sebelumnya</option>
                    {attendanceDates?.map((dateObj) => (
                      <option key={dateObj.date} value={dateObj.date}>
                        {formatDate(dateObj.date)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Menampilkan presensi untuk:{" "}
                  <strong>{formatDate(selectedDate)}</strong>
                </small>
              </div>
            </div>
          </div>

          <Table
            isLoading={isLoading}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            setSearch={setSearch}
            totalData={totalData}
            totalPages={totalPages}
          >
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="bg-primary text-white">
                  <tr>
                    <th
                      className="align-middle text-center"
                      style={{ width: "5%" }}
                    >
                      No
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      NIS
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "25%" }}
                    >
                      Nama
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      Tingkat
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      Kelas
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      <i className="bi bi-check-circle"></i>
                      <div className="small">Hadir</div>
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      <i className="bi bi-heart-pulse"></i>
                      <div className="small">Sakit</div>
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      <i className="bi bi-envelope-paper"></i>
                      <div className="small">Izin</div>
                    </th>
                    <th
                      className="align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      <i className="bi bi-x-circle"></i>
                      <div className="small">Alpa</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const studentAttendance = presensiData?.find(
                      (item) => item.studentid === student.student
                    );

                    return (
                      <tr key={student.id} className="attendance-change">
                        <td className="text-center align-middle">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="text-center align-middle">
                          {student.nis}
                        </td>
                        <td className="align-middle fw-bold">
                          {student.student_name}
                        </td>
                        <td className="text-center align-middle">
                          {student.grade_name}
                        </td>
                        <td className="text-center align-middle">
                          {student.class_name}
                        </td>
                        <td className="text-center align-middle">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              className="form-check-input border-success"
                              type="radio"
                              name={`attendance-${student.student}`}
                              style={{ width: "1.5em", height: "1.5em" }}
                              checked={studentAttendance?.note === "Hadir"}
                              onChange={(e) => {
                                handleCheck({
                                  studentid: student.student,
                                  note: "Hadir",
                                  checked: e.target.checked,
                                });
                              }}
                            />
                          </div>
                        </td>

                        <td className="text-center align-middle">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              className="form-check-input border-primary"
                              type="radio"
                              name={`attendance-${student.student}`}
                              style={{ width: "1.5em", height: "1.5em" }}
                              checked={studentAttendance?.note === "Sakit"}
                              onChange={(e) => {
                                handleCheck({
                                  studentid: student.student,
                                  note: "Sakit",
                                  checked: e.target.checked,
                                });
                              }}
                            />
                          </div>
                        </td>

                        <td className="text-center align-middle">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              className="form-check-input border-info"
                              type="radio"
                              name={`attendance-${student.student}`}
                              style={{ width: "1.5em", height: "1.5em" }}
                              checked={studentAttendance?.note === "Izin"}
                              onChange={(e) => {
                                handleCheck({
                                  studentid: student.student,
                                  note: "Izin",
                                  checked: e.target.checked,
                                });
                              }}
                            />
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              className="form-check-input border-danger"
                              type="radio"
                              name={`attendance-${student.student}`}
                              style={{ width: "1.5em", height: "1.5em" }}
                              checked={studentAttendance?.note === "Alpa"}
                              onChange={(e) => {
                                handleCheck({
                                  studentid: student.student,
                                  note: "Alpa",
                                  checked: e.target.checked,
                                });
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Table>
        </>
      )}
    </>
  );
};

export default TableData;
