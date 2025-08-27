import React, { useState, useEffect } from "react";
import Table from "../../../components/table/Table";
import { useGetStudentsInClassQuery } from "../../../controller/api/admin/ApiClass";
import {
  useGetPresensiQuery,
  useAddPresensiMutation,
  useGetAttendanceDatesQuery,
  useBulkPresensiMutation,
  useDeletePresensiMutation,
  useBulkDeletePresensiMutation,
} from "../../../controller/api/lms/ApiPresensi";
import { toast } from "react-hot-toast";

const TableData = ({ classid, subjectid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStudents, setSelectedStudents] = useState([]);

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
  const [bulkPresensi] = useBulkPresensiMutation();
  const [deletePresensi] = useDeletePresensiMutation();
  const [bulkDeletePresensi] = useBulkDeletePresensiMutation();

  const { students, totalData, totalPages } = data || {};

  // Reset selected students when date changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [selectedDate]);

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

  const handleBulkOperation = async (note) => {
    if (selectedStudents.length === 0) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    const data = {
      classid,
      subjectid,
      studentids: selectedStudents,
      note,
      date: selectedDate,
    };

    toast.promise(
      bulkPresensi(data)
        .unwrap()
        .then((res) => {
          setSelectedStudents([]);
          return res.message;
        }),
      {
        loading: "Memproses bulk operation...",
        success: (message) => message,
        error: (error) => error.data?.message || "Terjadi kesalahan",
      }
    );
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    // Show confirmation dialog
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus presensi untuk ${selectedStudents.length} siswa yang dipilih?`
      )
    ) {
      return;
    }

    const data = {
      classid,
      subjectid,
      studentids: selectedStudents,
      date: selectedDate,
    };

    toast.promise(
      bulkDeletePresensi(data)
        .unwrap()
        .then((res) => {
          setSelectedStudents([]);
          return res.message;
        }),
      {
        loading: "Menghapus presensi...",
        success: (message) => message,
        error: (error) => error.data?.message || "Terjadi kesalahan",
      }
    );
  };

  const handleDeleteStudent = async (studentid) => {
    const data = {
      classid,
      subjectid,
      studentid,
      date: selectedDate,
    };

    toast.promise(
      deletePresensi(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menghapus presensi...",
        success: (message) => message,
        error: (error) => error.data?.message || "Terjadi kesalahan",
      }
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(students.map((student) => student.student));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentid, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentid]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentid));
    }
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
                <div className="col-md-6">
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleBulkOperation("Hadir")}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Hadir ({selectedStudents.length})
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleBulkOperation("Telat")}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="bi bi-clock-history me-1"></i>
                      Telat ({selectedStudents.length})
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBulkOperation("Sakit")}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="bi bi-heart-pulse me-1"></i>
                      Sakit ({selectedStudents.length})
                    </button>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleBulkOperation("Izin")}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="bi bi-envelope-paper me-1"></i>
                      Izin ({selectedStudents.length})
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleBulkOperation("Alpa")}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Alpa ({selectedStudents.length})
                    </button>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={handleBulkDelete}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Hapus ({selectedStudents.length})
                    </button>
                  </div>
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
                      style={{ width: "20%" }}
                    >
                      <div className="d-flex align-items-center">
                        <span>Siswa</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "8%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        <span>Hadir</span>
                      </div>
                    </th>

                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "8%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-clock-history text-warning"></i>
                        <span>Telat</span>
                      </div>
                    </th>

                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "8%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-heart-pulse-fill text-primary"></i>
                        <span>Sakit</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "8%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-envelope-paper-fill text-info"></i>
                        <span>Izin</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "8%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-x-circle-fill text-danger"></i>
                        <span>Alpa</span>
                      </div>
                    </th>

                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "8%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-trash text-danger"></i>
                        <span>Hapus</span>
                      </div>
                    </th>
                    <th
                      className="align-middle text-center fw-semibold border-0"
                      style={{ width: "7%" }}
                    >
                      <div className="d-flex flex-column align-items-center gap-2">
                        <span>Pilih</span>
                        <input
                          type="checkbox"
                          checked={
                            selectedStudents.length === students.length &&
                            students.length > 0
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {students.map((student, index) => {
                    const studentAttendance = presensiData?.find(
                      (item) => item.studentid === student.student
                    );
                    const isSelected = selectedStudents.includes(
                      student.student
                    );

                    return (
                      <tr
                        key={student.id}
                        className={`attendance-change border-bottom ${
                          isSelected ? "table-warning" : ""
                        }`}
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
                            checked={studentAttendance?.note === "Telat"}
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
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteStudent(student.student)}
                            title="Hapus presensi siswa ini"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>

                        <td className="text-center align-middle">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectStudent(
                                student.student,
                                e.target.checked
                              )
                            }
                            style={{ width: "1.2em", height: "1.2em" }}
                          />
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
