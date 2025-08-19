import Layout from "../../../components/layout/Layout";
import { useGetStudentReportQuery } from "../../../controller/api/tahfiz/ApiReport";
import { useSelector } from "react-redux";
import LoadingScreen from "../../../components/loader/LoadingScreen";
import { useState, useEffect } from "react";
import {
  FaQuran,
  FaStar,
  FaBook,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaGraduationCap,
  FaTrophy,
} from "react-icons/fa";
import "./tahfiz.css";

const ParentTahfiz = () => {
  const { user } = useSelector((state) => state.auth);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [expandedSurahs, setExpandedSurahs] = useState({});

  const { data, isLoading } = useGetStudentReportQuery(user.student_id, {
    skip: !user.student_id,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSurahList = (juzKey) => {
    setExpandedSurahs((prev) => ({
      ...prev,
      [juzKey]: !prev[juzKey],
    }));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!data) {
    return (
      <Layout title="Laporan Tahfiz" levels={["parent"]}>
        <div className="container-fluid">
          <div
            className="alert alert-danger d-flex align-items-center border-0 shadow-sm"
            role="alert"
          >
            <FaExclamationTriangle className="fs-4 me-3 text-danger" />
            <div>
              <h6 className="alert-heading mb-1">
                Tidak ada data laporan tahfiz
              </h6>
              <p className="mb-0 text-muted">
                Data laporan tahfiz belum tersedia untuk saat ini.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Laporan Tahfiz" levels={["parent"]}>
      <div className="container-fluid parent-tahfiz">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-gradient-primary">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <div className="bg-white rounded-circle p-3 me-3 shadow-sm">
                        <FaQuran className="text-primary fs-2" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-white fw-bold">
                          Laporan Tahfiz Al-Qur'an
                        </h3>
                        <p className="mb-0 text-white-50">
                          <FaGraduationCap className="me-2" />
                          {user?.student || "Student Name"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-white bg-opacity-25 text-white border-0 px-3 py-2">
                        <FaChartLine className="me-2" />
                        Progress Monitoring
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Target and Progress by Grade */}
        {data.targets_by_grade?.map((gradeData, gradeIndex) => (
          <div key={gradeIndex} className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <FaGraduationCap className="text-primary fs-4" />
                </div>
                <div>
                  <h4 className="mb-1 fw-bold text-dark">
                    {gradeData.grade_name}
                  </h4>
                  <p className="mb-0 text-muted">Target dan Progress Hafalan</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {gradeData.targets.map((target, targetIndex) => {
                  // Find corresponding progress data
                  const progressData = data.memorization?.find(
                    (item) => item.juz === target.juz
                  );

                  const juzKey = `${gradeData.grade_name}_${target.juz}`;
                  const isExpanded = expandedSurahs[juzKey];

                  return (
                    <div key={targetIndex} className="col-12 col-sm-6 col-lg-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-primary text-white text-center border-0 py-3">
                          <h5 className="card-title mb-0 fw-bold">
                            <FaBook className="me-2" />
                            {target.juz}
                          </h5>
                        </div>
                        <div className="card-body p-4">
                          {/* Target Information */}
                          <div className="mb-4">
                            <h6 className="text-muted mb-3 fw-semibold">
                              <FaCheckCircle className="me-2 text-success" />
                              Target
                            </h6>
                            <div className="row text-center g-3">
                              <div className="col-6">
                                <div className="bg-light rounded-3 p-3">
                                  <div className="text-muted small mb-1">
                                    Ayat
                                  </div>
                                  <div className="fw-bold fs-5 text-primary">
                                    {target.total_verses}
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="bg-light rounded-3 p-3">
                                  <div className="text-muted small mb-1">
                                    Baris
                                  </div>
                                  <div className="fw-bold fs-5 text-primary">
                                    {target.total_lines}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Progress Information */}
                          {progressData && (
                            <>
                              <hr className="my-4" />
                              <div className="mb-4">
                                <h6 className="text-primary mb-3 fw-semibold">
                                  <FaChartLine className="me-2" />
                                  Progress
                                </h6>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small fw-medium">
                                      Progress
                                    </span>
                                    <span className="fw-bold fs-6 text-primary">
                                      {progressData.progress}%
                                    </span>
                                  </div>
                                  <div
                                    className="progress rounded-3"
                                    style={{ height: "12px" }}
                                  >
                                    <div
                                      className="progress-bar bg-gradient-primary"
                                      role="progressbar"
                                      style={{
                                        width: `${Math.min(
                                          progressData.progress,
                                          100
                                        )}%`,
                                      }}
                                      aria-valuenow={progressData.progress}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                </div>

                                {/* Progress Details */}
                                <div className="row text-center g-3 mb-4">
                                  <div className="col-4">
                                    <div className="border-end border-2">
                                      <div className="text-muted small mb-1">
                                        Ayat
                                      </div>
                                      <div className="fw-bold text-success">
                                        {progressData.completed}/
                                        {progressData.verses}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="border-end border-2">
                                      <div className="text-muted small mb-1">
                                        Baris
                                      </div>
                                      <div className="fw-bold text-success">
                                        {progressData.completed_lines}/
                                        {progressData.lines}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="text-muted small mb-1">
                                      Sisa
                                    </div>
                                    <div className="fw-bold text-danger">
                                      {progressData.uncompleted} ayat
                                    </div>
                                  </div>
                                </div>

                                {/* Surah List Toggle Button */}
                                {progressData.surah &&
                                  progressData.surah.length > 0 && (
                                    <div className="mt-4">
                                      <button
                                        className="btn btn-outline-primary w-100 rounded-3 py-2 fw-medium"
                                        onClick={() => toggleSurahList(juzKey)}
                                      >
                                        {isExpanded ? (
                                          <FaChevronUp className="me-2" />
                                        ) : (
                                          <FaChevronDown className="me-2" />
                                        )}
                                        {isExpanded ? "Sembunyikan" : "Lihat"}{" "}
                                        Surah ({progressData.surah.length})
                                      </button>

                                      {/* Surah Details */}
                                      {isExpanded && (
                                        <div className="mt-3">
                                          <div className="list-group list-group-flush border-0">
                                            {progressData.surah.map(
                                              (surah, idx) => (
                                                <div
                                                  key={idx}
                                                  className="list-group-item px-0 py-2 border-0 bg-transparent"
                                                >
                                                  <div className="d-flex align-items-center">
                                                    <FaBook className="text-primary me-3" />
                                                    <div>
                                                      <div className="fw-medium">
                                                        {surah.surah_name}
                                                      </div>
                                                      <div className="text-muted small">
                                                        Ayat {surah.verse},
                                                        Baris {surah.line}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Exceed Progress Section */}
        {data.exceed && data.exceed.length > 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <FaTrophy className="text-success fs-4" />
                </div>
                <div>
                  <h4 className="mb-1 fw-bold text-success">
                    Hafalan yang melebihi target
                  </h4>
                  <p className="mb-0 text-muted">
                    Prestasi luar biasa dalam hafalan
                  </p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {data.exceed.map((item, index) => (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-success text-white border-0 py-3">
                        <h5 className="card-title mb-0 fw-bold">
                          <FaStar className="me-2" />
                          {item.juz}
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small fw-medium">
                              Progress
                            </span>
                            <span className="fw-bold fs-6 text-success">
                              {item.progress}%
                            </span>
                          </div>
                          <div
                            className="progress rounded-3"
                            style={{ height: "12px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{
                                width: `${Math.min(item.progress, 100)}%`,
                              }}
                              aria-valuenow={item.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="row text-center g-3 mb-4">
                          <div className="col-4">
                            <div className="border-end border-2">
                              <div className="text-muted small mb-1">Ayat</div>
                              <div className="fw-bold text-success">
                                {item.completed}/{item.verses}
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="border-end border-2">
                              <div className="text-muted small mb-1">Baris</div>
                              <div className="fw-bold text-success">
                                {item.completed_lines}/{item.lines}
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="text-muted small mb-1">Sisa</div>
                            <div className="fw-bold text-danger">
                              {item.uncompleted} ayat
                            </div>
                          </div>
                        </div>

                        {/* Surah Details */}
                        {item.surah && item.surah.length > 0 && (
                          <div className="mt-4">
                            <h6 className="text-muted mb-3 fw-semibold">
                              <FaBook className="me-2" />
                              Surah yang dipelajari:
                            </h6>
                            <div className="list-group list-group-flush border-0">
                              {item.surah.map((surah, idx) => (
                                <div
                                  key={idx}
                                  className="list-group-item px-0 py-2 border-0 bg-transparent"
                                >
                                  <div className="d-flex align-items-center">
                                    <FaBook className="text-success me-3" />
                                    <div>
                                      <div className="fw-medium">
                                        {surah.surah_name}
                                      </div>
                                      <div className="text-muted small">
                                        Ayat {surah.verse}, Baris {surah.line}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentTahfiz;
