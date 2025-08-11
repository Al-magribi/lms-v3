import React from "react";
import { useSearchParams } from "react-router-dom";
import "./Scores.css";

const Tabs = ({ tab, setTab }) => {
  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  const handleTabClick = (type) => {
    setTab(type);
  };

  // Check if all required parameters are present
  const hasRequiredParams =
    classid && subjectid && chapterid && month && semester;

  if (!hasRequiredParams) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        <span className="d-none d-sm-inline">
          Pilih chapter, kelas, semester, dan bulan terlebih dahulu untuk
          melihat data penilaian.
        </span>
        <span className="d-sm-none">
          Pilih chapter, kelas, semester, dan bulan terlebih dahulu.
        </span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Desktop Tabs */}
      <ul className="nav nav-tabs justify-content-center d-none d-md-flex">
        <li className="nav-item">
          <a
            className={`nav-link pointer ${
              tab === "attendance" ? "active" : ""
            }`}
            aria-current="page"
            onClick={() => handleTabClick("attendance")}
          >
            Kehadiran
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link pointer ${tab === "attitude" ? "active" : ""}`}
            aria-current="page"
            onClick={() => handleTabClick("attitude")}
          >
            Sikap
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link pointer ${
              tab === "formative" ? "active" : ""
            }`}
            aria-current="page"
            onClick={() => handleTabClick("formative")}
          >
            Formatif
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link pointer ${
              tab === "summative" ? "active" : ""
            }`}
            aria-current="page"
            onClick={() => handleTabClick("summative")}
          >
            Sumatif
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link pointer ${tab === "recap" ? "active" : ""}`}
            aria-current="page"
            onClick={() => handleTabClick("recap")}
          >
            Rekapitulasi
          </a>
        </li>
      </ul>

      {/* Mobile Tabs - Dropdown/Select */}
      <div className="d-md-none">
        <select
          className="form-select form-select-lg"
          value={tab}
          onChange={(e) => handleTabClick(e.target.value)}
          aria-label="Pilih jenis penilaian"
        >
          <option value="attendance">Kehadiran</option>
          <option value="attitude">Sikap</option>
          <option value="formative">Formatif</option>
          <option value="summative">Sumatif</option>
          <option value="recap">Rekapitulasi</option>
        </select>
      </div>

      {/* Mobile Tabs - Scrollable Horizontal */}
      <div className="d-none d-sm-block d-md-none">
        <div className="nav-scroll-container">
          <ul className="nav nav-tabs nav-tabs-scroll">
            <li className="nav-item">
              <a
                className={`nav-link pointer ${
                  tab === "attendance" ? "active" : ""
                }`}
                aria-current="page"
                onClick={() => handleTabClick("attendance")}
              >
                Kehadiran
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link pointer ${
                  tab === "attitude" ? "active" : ""
                }`}
                aria-current="page"
                onClick={() => handleTabClick("attitude")}
              >
                Sikap
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link pointer ${
                  tab === "formative" ? "active" : ""
                }`}
                aria-current="page"
                onClick={() => handleTabClick("formative")}
              >
                Formatif
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link pointer ${
                  tab === "summative" ? "active" : ""
                }`}
                aria-current="page"
                onClick={() => handleTabClick("summative")}
              >
                Sumatif
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link pointer ${
                  tab === "recap" ? "active" : ""
                }`}
                aria-current="page"
                onClick={() => handleTabClick("recap")}
              >
                Rekapitulasi
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
