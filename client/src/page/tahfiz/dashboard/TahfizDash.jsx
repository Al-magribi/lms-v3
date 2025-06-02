import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetAchievementQuery } from "../../../controller/api/tahfiz/ApiReport";
import GaugeChart from "react-gauge-chart";

const TahfizDash = () => {
  const { data, isLoading } = useGetAchievementQuery();
  const [expandedGrade, setExpandedGrade] = useState(null);

  const renderLoadingSkeleton = () => {
    return (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <div
              className="skeleton-text"
              style={{
                width: "200px",
                height: "24px",
                background: "#eee",
                borderRadius: "4px",
              }}
            ></div>
          </div>
          <div className="card-body">
            <div className="row">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div
                        className="skeleton-text mb-3"
                        style={{
                          width: "120px",
                          height: "20px",
                          background: "#eee",
                          borderRadius: "4px",
                          margin: "0 auto",
                        }}
                      ></div>
                      <div
                        className="skeleton-gauge mb-3"
                        style={{
                          width: "200px",
                          height: "200px",
                          background: "#eee",
                          borderRadius: "50%",
                          margin: "0 auto",
                        }}
                      ></div>
                      <div
                        className="skeleton-text"
                        style={{
                          width: "180px",
                          height: "20px",
                          background: "#eee",
                          borderRadius: "4px",
                          margin: "0 auto",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClassCards = (classes) => {
    return classes.map((classItem, idx) => (
      <div key={idx} className="col-md-6 col-lg-4 mb-3">
        <div className="card h-100">
          <div className="card-header bg-light py-2">
            <h6 className="mb-0">{classItem.class_name}</h6>
          </div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-6">
                <div className="border rounded p-2 text-center h-100">
                  <small className="d-block text-muted">Tuntas</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="h5 mb-0">{classItem.completed}</span>
                    <small className="text-success">
                      (
                      {(
                        (classItem.completed /
                          (classItem.completed + classItem.uncompleted)) *
                        100
                      ).toFixed(1)}
                      %)
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded p-2 text-center h-100">
                  <small className="d-block text-muted">Belum Tuntas</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="h5 mb-0">{classItem.uncompleted}</span>
                    <small className="text-danger">
                      (
                      {(
                        (classItem.uncompleted /
                          (classItem.completed + classItem.uncompleted)) *
                        100
                      ).toFixed(1)}
                      %)
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded p-2 text-center h-100">
                  <small className="d-block text-muted">Melebihi Target</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="h5 mb-0">
                      {classItem.exceed_completed}
                    </span>
                    <small className="text-success">
                      (
                      {(
                        (classItem.exceed_completed /
                          (classItem.exceed_completed +
                            classItem.exceed_uncompleted)) *
                        100
                      ).toFixed(1)}
                      %)
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded p-2 text-center h-100">
                  <small className="d-block text-muted">Belum Melebihi</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="h5 mb-0">
                      {classItem.exceed_uncompleted}
                    </span>
                    <small className="text-danger">
                      (
                      {(
                        (classItem.exceed_uncompleted /
                          (classItem.exceed_completed +
                            classItem.exceed_uncompleted)) *
                        100
                      ).toFixed(1)}
                      %)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderGradeGauges = () => {
    if (!data) return null;

    return data.map((item, index) => (
      <div key={index} className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {item.homebase} - {item.periode}
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {item.grade.map((grade, gradeIndex) => {
                const isExpanded = expandedGrade === `${index}-${gradeIndex}`;
                const percentage = grade.achievement;

                return (
                  <React.Fragment key={gradeIndex}>
                    <div className="col-lg-4 col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="card-title mb-0">
                              Tingkat {grade.name}
                            </h6>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                setExpandedGrade(
                                  isExpanded ? null : `${index}-${gradeIndex}`
                                )
                              }
                            >
                              {isExpanded ? "Tutup Detail" : "Lihat Kelas"}
                            </button>
                          </div>

                          <GaugeChart
                            id={`gauge-chart-${index}-${gradeIndex}`}
                            percent={percentage / 100}
                            arcWidth={0.1}
                            colors={["#ff0048", "#ff7809", "#66ff2e"]}
                            textColor="#000000"
                            needleColor="#345243"
                            needleBaseColor="#345243"
                            animate={true}
                            formatTextValue={(value) =>
                              `${grade.achievement.toFixed(1)}%`
                            }
                          />

                          <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span>Target Ketuntasan</span>
                              <span className="badge bg-primary">
                                {grade.achievement.toFixed(1)}%
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span>Melebihi Target</span>
                              <span className="badge bg-success">
                                {grade.exceed_achievement.toFixed(1)}%
                              </span>
                            </div>

                            <div className="border-top pt-2 mt-2">
                              <p className="mb-2 fw-bold">Target Hafalan:</p>
                              <div className="d-flex gap-2 justify-content-center flex-wrap">
                                {grade.target.map((target, idx) => (
                                  <span key={idx} className="badge bg-info">
                                    {target.juz} ({target.lines} Baris)
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="row g-2 mt-2">
                              <div className="col-6">
                                <div className="border rounded p-2">
                                  <small className="d-block text-muted">
                                    Tuntas
                                  </small>
                                  <span className="h6 mb-0">
                                    {grade.completed}
                                  </span>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="border rounded p-2">
                                  <small className="d-block text-muted">
                                    Belum
                                  </small>
                                  <span className="h6 mb-0">
                                    {grade.uncompleted}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="col-12">
                        <div className="card mb-3">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">
                              Detail Kelas - Tingkat {grade.name}
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              {renderClassCards(grade.classes)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Layout title={"Tahfiz - Dashboard"} levels={["tahfiz"]}>
      <div className="row g-2">
        {isLoading ? renderLoadingSkeleton() : renderGradeGauges()}
      </div>
    </Layout>
  );
};

export default TahfizDash;
