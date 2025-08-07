import React from "react";
import { useSearchParams } from "react-router-dom";
import "./Scores.css";

const Tabs = ({ tab, setTab }) => {
  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");

  const handleTabClick = (type) => {
    setTab(type);
  };

  // Check if all required parameters are present
  const hasRequiredParams = classid && subjectid && chapterid && month;

  if (!hasRequiredParams) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Pilih chapter, kelas, dan bulan terlebih dahulu untuk melihat data
        penilaian.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <ul className="nav nav-tabs justify-content-center">
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
    </div>
  );
};

export default Tabs;
