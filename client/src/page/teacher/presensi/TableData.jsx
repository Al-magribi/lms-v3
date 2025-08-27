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
    <div className="container-fluid px-0">
      {!classid || !subjectid ? (
        <div className="text-center py-5 empty-state">
          <div className="mb-4">
            <i className="bi bi-clipboard2-check display-1 text-muted opacity-75"></i>
          </div>
          <h4 className="fw-bold text-muted mb-3">Pilih Data Presensi</h4>
          <p className="text-muted mb-0 fs-6">
            Silakan pilih mata pelajaran dan kelas terlebih dahulu
          </p>
        </div>
      ) : !students ? (
        <div className="text-center py-5 empty-state">
          <div className="mb-4">
            <i className="bi bi-people display-1 text-muted opacity-75"></i>
          </div>
          <h4 className="fw-bold text-muted mb-3">Data Siswa Tidak Tersedia</h4>
          <p className="text-muted mb-0 fs-6">
            Tidak ada data siswa yang ditemukan untuk kelas ini
          </p>
        </div>
      ) : (
        <>
          {/* Enhanced Date Selection Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="bi bi-calendar-date me-2"></i>
                    Tanggal Presensi: <span>{formatDate(selectedDate)}</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
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
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary bg-gradient text-white">
                  <tr>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "5%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <span>No</span>
                      </div>
                    </th>
                    <th
                      className="align-middle fw-semibold border-0"
                      style={{ width: "25%" }}
                    >
                      <div className="d-flex align-items-center">
                        <span>Siswa</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "10%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-check-circle-fill text-success mb-1"></i>
                        <span>Hadir</span>
                      </div>
                    </th>

                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "10%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-clock-history text-warning mb-1"></i>
                        <span>Telat</span>
                      </div>
                    </th>

                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "10%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-heart-pulse-fill text-primary mb-1"></i>
                        <span>Sakit</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "10%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-envelope-paper-fill text-info mb-1"></i>
                        <span>Izin</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "10%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-x-circle-fill text-danger mb-1"></i>
                        <span>Alpa</span>
                      </div>
                    </th>

                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "10%" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-trash text-danger mb-1"></i>
                        <span>Hapus</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {students.map((student, index) => {
                    const studentAttendance = presensiData?.find(
                      (item) => item.studentid === student.student
                    );

                    return (
                      <tr
                        key={student.id}
                        className="attendance-change border-bottom"
                      >
                        <td className="text-center align-middle">
                          <span className="fw-bold text-primary">
                            {(page - 1) * limit + index + 1}
                          </span>
                        </td>
                        <td className="align-middle">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold text-dark">
                              {student.student_name}
                            </h6>
                            <div className="d-flex flex-wrap gap-3 text-muted small">
                              <span className="d-flex align-items-center">
                                <i className="bi bi-card-text me-1"></i>
                                {student.nis}
                              </span>
                              <span className="d-flex align-items-center">
                                <i className="bi bi-mortarboard me-1"></i>
                                {student.grade_name}
                              </span>
                              <span className="d-flex align-items-center">
                                <i className="bi bi-building me-1"></i>
                                {student.class_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          <input
                            className="form-check-input border-success shadow-sm"
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
                        </td>

                        <td className="text-center align-middle">
                          <input
                            className="form-check-input border-warning shadow-sm"
                            type="radio"
                            name={`attendance-${student.student}`}
                            style={{ width: "1.5em", height: "1.5em" }}
                            checked={studentAttendance?.note === "Hadir"}
                            onChange={(e) => {
                              handleCheck({
                                studentid: student.student,
                                note: "Telat",
                                checked: e.target.checked,
                              });
                            }}
                          />
                        </td>

                        <td className="text-center align-middle">
                          <input
                            className="form-check-input border-primary shadow-sm"
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
                        </td>
                        <td className="text-center align-middle">
                          <input
                            className="form-check-input border-info shadow-sm"
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
                        </td>

                        <td className="text-center align-middle">
                          <input
                            className="form-check-input border-danger shadow-sm"
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
                        </td>

                        <td className="text-center align-middle">
                          <button className="btn btn-sm btn-danger">
                            <i className="bi bi-trash"></i>
                          </button>
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
    </div>
  );
};

export default TableData;
