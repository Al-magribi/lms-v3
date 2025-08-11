import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetPresensiSummaryQuery } from "../../../controller/api/lms/ApiPresensi";
import LoadingScreen from "../../../components/loader/LoadingScreen";

const Attendance = ({
  data,
  isLoading,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  totalData,
  totalPages,
}) => {
  const [searchParams] = useSearchParams();
  const classid = searchParams.get("classid");
  const subjectid = searchParams.get("id");
  const monthName = searchParams.get("month");

  // Convert month name to month number
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const selectedMonth = monthName
    ? months.indexOf(monthName) + 1
    : new Date().getMonth() + 1;
  const selectedYear = new Date().getFullYear();

  const { data: summaryData, isLoading: summaryLoading } =
    useGetPresensiSummaryQuery(
      {
        classid,
        subjectid,
        month: selectedMonth,
        year: selectedYear,
      },
      { skip: !classid || !subjectid }
    );

  const [attendanceScores, setAttendanceScores] = useState({});

  const handleScoreChange = (studentId, value) => {
    setAttendanceScores((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSave = (student) => {
    const studentScore = attendanceScores[student.studentid] || "";
    console.log("Menyimpan nilai kehadiran untuk siswa:", {
      studentId: student.studentid,
      studentName: student.student_name,
      score: studentScore,
    });
  };

  if (!classid || !subjectid) {
    return (
      <div className="text-center py-5 empty-state">
        <div className="mb-3">
          <i className="bi bi-calendar-check display-1 text-muted"></i>
        </div>
        <h5 className="fw-bold text-muted mb-2">Pilih Data Presensi</h5>
        <p className="text-muted mb-0">
          Silakan pilih mata pelajaran dan kelas terlebih dahulu
        </p>
      </div>
    );
  }

  if (summaryLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">
          <i className="bi bi-calendar-month me-2"></i>
          Penilaian Kehadiran Bulanan
        </h5>
      </div>
      <div className="card-body">
        {summaryData && summaryData.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: "5%" }}>
                    No
                  </th>
                  <th style={{ width: "10%" }}>NIS</th>
                  <th style={{ width: "25%" }}>Nama Siswa</th>
                  <th className="text-center" style={{ width: "10%" }}>
                    <i className="bi bi-check-circle text-success me-1"></i>
                    Hadir
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    <i className="bi bi-heart-pulse text-primary me-1"></i>
                    Sakit
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    <i className="bi bi-envelope-paper text-info me-1"></i>
                    Izin
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    <i className="bi bi-x-circle text-danger me-1"></i>
                    Alpa
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    <i className="bi bi-percent text-warning me-1"></i>
                    Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((student, index) => {
                  const totalDays =
                    student.hadir + student.sakit + student.izin + student.alpa;
                  const attendanceRate =
                    totalDays > 0
                      ? ((student.hadir / totalDays) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr key={student.studentid} className="attendance-change">
                      <td className="text-center align-middle">{index + 1}</td>
                      <td className="align-middle">{student.nis}</td>
                      <td className="align-middle fw-bold">
                        {student.student_name}
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-success fs-6">
                          {student.hadir}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-primary fs-6">
                          {student.sakit}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-info fs-6">
                          {student.izin}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-danger fs-6">
                          {student.alpa}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge fs-6 ${
                            attendanceRate >= 90
                              ? "bg-success"
                              : attendanceRate >= 80
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        >
                          {attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 empty-state">
            <div className="mb-3">
              <i className="bi bi-calendar-x display-1 text-muted"></i>
            </div>
            <h5 className="fw-bold text-muted mb-2">Data Tidak Tersedia</h5>
            <p className="text-muted mb-0">
              Tidak ada data presensi untuk periode yang dipilih
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
