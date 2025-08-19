import React from "react";
import SubjectReportCard from "./SubjectReportCard";

const MonthlyReportView = ({
  report,
  loading,
  error,
  selectedMonth,
  selectedSemester,
}) => {
  const getGradeColor = (score) => {
    if (!score) return "text-muted";
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-primary";
    return "text-danger";
  };

  const getGradeLetter = (score) => {
    if (!score) return "-";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    return "C";
  };

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat laporan akademik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
          <h4 className="text-danger">Terjadi Kesalahan</h4>
          <p className="text-muted">
            Gagal memuat laporan akademik. Silakan coba lagi.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-file-earmark-x display-1 text-muted mb-3"></i>
          <h4 className="text-muted">Data Tidak Ditemukan</h4>
          <p className="text-muted">
            Tidak ada data laporan untuk periode yang dipilih.
          </p>
        </div>
      </div>
    );
  }

  const { report_period, subjects } = report;

  return (
    <div className="card shadow-sm">
      {/* Report Header */}
      <div className="card-header bg-success text-white">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h4 className="mb-1">
              <i className="bi bi-file-earmark-text me-2"></i>
              LAPORAN BULANAN
            </h4>
            <p className="mb-0">
              {selectedMonth} - Semester {selectedSemester} | Tahun Ajaran{" "}
              {report_period.academic_year}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Student Information */}
        {/* <div className="row mb-4">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Informasi Siswa
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td className="fw-bold" width="40%">
                            Nama:
                          </td>
                          <td>{student_info.name}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">NIS:</td>
                          <td>{student_info.nis}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Kelas:</td>
                          <td>{student_info.class}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td className="fw-bold" width="40%">
                            Tingkat:
                          </td>
                          <td>{student_info.grade}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Periode:</td>
                          <td>{student_info.periode}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Wali Kelas:</td>
                          <td>{student_info.homeroom_teacher || "-"}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Sekolah:</td>
                          <td>{student_info.homebase}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Subjects Reports */}
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3">
              <i className="bi bi-book me-2"></i>
              Laporan Mata Pelajaran
            </h5>
          </div>
        </div>

        {subjects && subjects.length > 0 ? (
          <div className="row">
            {subjects.map((subject, index) => (
              <div key={index} className="col-12 mb-4">
                <SubjectReportCard
                  subject={subject}
                  getGradeColor={getGradeColor}
                  getGradeLetter={getGradeLetter}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="bi bi-book display-1 text-muted mb-3"></i>
            <h5 className="text-muted">Belum Ada Data Mata Pelajaran</h5>
            <p className="text-muted">
              Data penilaian mata pelajaran belum tersedia untuk periode ini.
            </p>
          </div>
        )}

        {/* Grading Scale */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-info">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Skala Penilaian
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h4 className="text-success mb-1">A</h4>
                      <p className="mb-0">90 - 99</p>
                      <small className="text-muted">Sangat Baik</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h4 className="text-primary mb-1">B</h4>
                      <p className="mb-0">80 - 89</p>
                      <small className="text-muted">Baik</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h4 className="text-danger mb-1">C</h4>
                      <p className="mb-0">{`< 80`}</p>
                      <small className="text-muted">Cukup</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportView;
