import React, { useState } from "react";
import {
  useGetPresensiQuery,
  useGetAttendanceDatesQuery,
} from "../../../controller/api/lms/ApiPresensi";
import LoadingScreen from "../../../components/loader/LoadingScreen";

const AttendanceHistory = ({ classid, subjectid }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const { data: attendanceDates } = useGetAttendanceDatesQuery(
    { classid, subjectid },
    { skip: !classid || !subjectid }
  );

  const { data: presensiData, isLoading } = useGetPresensiQuery(
    {
      classid,
      subjectid,
      ...(selectedDate && { date: selectedDate }),
    },
    { skip: !classid || !subjectid }
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAttendanceIcon = (note) => {
    switch (note) {
      case "Hadir":
        return <i className="bi bi-check-circle text-success"></i>;
      case "Sakit":
        return <i className="bi bi-heart-pulse text-primary"></i>;
      case "Izin":
        return <i className="bi bi-envelope-paper text-info"></i>;
      case "Alpa":
        return <i className="bi bi-x-circle text-danger"></i>;
      default:
        return <i className="bi bi-question-circle text-muted"></i>;
    }
  };

  const getAttendanceBadge = (note) => {
    switch (note) {
      case "Hadir":
        return <span className="badge bg-success">{note}</span>;
      case "Sakit":
        return <span className="badge bg-primary">{note}</span>;
      case "Izin":
        return <span className="badge bg-info">{note}</span>;
      case "Alpa":
        return <span className="badge bg-danger">{note}</span>;
      default:
        return (
          <span className="badge bg-secondary">{note || "Belum Diisi"}</span>
        );
    }
  };

  if (!classid || !subjectid) {
    return (
      <div className="text-center py-5 empty-state">
        <div className="mb-3">
          <i className="bi bi-clock-history display-1 text-muted"></i>
        </div>
        <h5 className="fw-bold text-muted mb-2">Pilih Data Presensi</h5>
        <p className="text-muted mb-0">
          Silakan pilih mata pelajaran dan kelas terlebih dahulu
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h5 className="card-title mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Riwayat Presensi
        </h5>
      </div>
      <div className="card-body">
        {/* Filter Controls */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold">
              <i className="bi bi-calendar-range me-2"></i>
              Filter Tanggal:
            </label>
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                if (e.target.value === "all") {
                  setSelectedDate("");
                } else if (e.target.value === "today") {
                  setSelectedDate(new Date().toISOString().split("T")[0]);
                }
              }}
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="specific">Tanggal Tertentu</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">
              <i className="bi bi-calendar-date me-2"></i>
              Pilih Tanggal:
            </label>
            <select
              className="form-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={dateRange !== "specific"}
            >
              <option value="">Pilih tanggal</option>
              {attendanceDates?.map((dateObj) => (
                <option key={dateObj.date} value={dateObj.date}>
                  {formatDate(dateObj.date)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Data */}
        {presensiData && presensiData.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: "5%" }}>
                    No
                  </th>
                  <th style={{ width: "15%" }}>Tanggal</th>
                  <th style={{ width: "10%" }}>NIS</th>
                  <th style={{ width: "25%" }}>Nama Siswa</th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Status
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {presensiData.map((attendance, index) => (
                  <tr key={attendance.id} className="attendance-change">
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">
                      <div className="fw-bold">
                        {formatDate(attendance.date)}
                      </div>
                      <small className="text-muted">
                        {new Date(attendance.date).toLocaleDateString("id-ID")}
                      </small>
                    </td>
                    <td className="align-middle">{attendance.nis}</td>
                    <td className="align-middle fw-bold">
                      {attendance.student_name}
                    </td>
                    <td className="text-center align-middle">
                      {getAttendanceBadge(attendance.note)}
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Lihat Detail"
                        disabled
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
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
              {selectedDate
                ? `Tidak ada data presensi untuk tanggal ${formatDate(
                    selectedDate
                  )}`
                : "Tidak ada data presensi yang tersedia"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
