import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector } from "react-redux";
import Select from "react-select";
import { useGetClassQuery } from "../../../controller/api/admin/ApiClass";
import TableData from "./TableData";
import AttendanceSummary from "./AttendanceSummary";
import AttendanceHistory from "./AttendanceHistory";
import "./Presensi.css";

const TeacherPresensi = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: classes } = useGetClassQuery({
    page: "",
    limit: "",
    search: "",
  });

  const [classid, setClassid] = useState("");
  const [subjectid, setSubjectid] = useState("");
  const [activeTab, setActiveTab] = useState("daily");

  const options = user?.subjects?.map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  const optionsClass = classes?.map((kelas) => ({
    value: kelas.id,
    label: kelas.name,
  }));

  return (
    <Layout title={"Presensi Siswa"} levels={["teacher"]}>
      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filter Data Presensi
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <label className="form-label fw-bold">
                <i className="bi bi-book me-2"></i>
                Mata Pelajaran:
              </label>
              <Select
                options={options}
                isSearchable={true}
                placeholder="Pilih Mata Pelajaran"
                onChange={(e) => setSubjectid(e.value)}
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 1 }),
                }}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label fw-bold">
                <i className="bi bi-people me-2"></i>
                Kelas:
              </label>
              <Select
                options={optionsClass}
                isSearchable={true}
                placeholder="Pilih Kelas"
                onChange={(e) => setClassid(e.value)}
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 1 }),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {classid && subjectid && (
        <div className="card mb-4">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "daily" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab("daily")}
                >
                  <i className="bi bi-calendar-day me-2"></i>
                  Presensi Harian
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab("history")}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  Riwayat Presensi
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "summary" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab("summary")}
                >
                  <i className="bi bi-calendar-month me-2"></i>
                  Rangkuman Bulanan
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            <div className="tab-content">
              <div
                className={`tab-pane fade ${
                  activeTab === "daily" ? "show active" : ""
                }`}
              >
                <TableData classid={classid} subjectid={subjectid} />
              </div>
              <div
                className={`tab-pane fade ${
                  activeTab === "history" ? "show active" : ""
                }`}
              >
                <AttendanceHistory classid={classid} subjectid={subjectid} />
              </div>
              <div
                className={`tab-pane fade ${
                  activeTab === "summary" ? "show active" : ""
                }`}
              >
                <AttendanceSummary classid={classid} subjectid={subjectid} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!classid || !subjectid) && (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-clipboard2-check display-1 text-muted"></i>
          </div>
          <h5 className="fw-bold text-muted mb-2">Pilih Data Presensi</h5>
          <p className="text-muted mb-0">
            Silakan pilih mata pelajaran dan kelas terlebih dahulu untuk melihat
            data presensi
          </p>
        </div>
      )}
    </Layout>
  );
};

export default TeacherPresensi;
