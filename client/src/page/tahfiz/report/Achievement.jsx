import React, { useState } from "react";
import { useGetAchievementQuery } from "../../../controller/api/tahfiz/ApiReport";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import StudentDetail from "./StudentDetail";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Achievement = () => {
  const { data, isLoading } = useGetAchievementQuery();
  const [modalData, setModalData] = useState({
    students: [],
    gradeName: "",
    className: "",
  });

  if (isLoading || !data) return <div>Loading...</div>;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Capaian Hafalan Per Tingkat",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="container-fluid p-0">
      {data.map((periode, periodeIndex) => (
        <div key={periodeIndex} className="card mb-4">
          <div className="card-header">
            <h4>{periode.periode}</h4>
            <small className="text-muted">{periode.homebase}</small>
          </div>
          <div className="card-body">
            {periode.grade.map((grade, gradeIndex) => (
              <div key={gradeIndex} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>{grade.name}</h5>
                  <div className="badge bg-primary">
                    {grade.achievement}% Ketuntasan Total
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6>Target Hafalan</h6>
                        {grade.target.map((target, targetIndex) => (
                          <div key={targetIndex} className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span className="badge bg-success">
                                {target.juz}
                              </span>
                              <small className="badge bg-danger">
                                {target.lines} Baris
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card mb-3">
                      <div className="card-body">
                        <h6>Statistik Grade</h6>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Ketuntasan Target</span>
                            <span>{grade.achievement}%</span>
                          </div>
                          <div className="progress mb-3">
                            <div
                              className={`progress-bar ${
                                grade.achievement >= 75
                                  ? "bg-success"
                                  : grade.achievement >= 50
                                  ? "bg-warning"
                                  : "bg-danger"
                              }`}
                              role="progressbar"
                              style={{ width: `${grade.achievement}%` }}
                              aria-valuenow={grade.achievement}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {grade.achievement}%
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Melebihi Target</span>
                            <span>{grade.exceed_achievement}%</span>
                          </div>
                          <div className="progress">
                            <div
                              className={`progress-bar ${
                                grade.exceed_achievement >= 75
                                  ? "bg-success"
                                  : grade.exceed_achievement >= 50
                                  ? "bg-warning"
                                  : "bg-danger"
                              }`}
                              role="progressbar"
                              style={{ width: `${grade.exceed_achievement}%` }}
                              aria-valuenow={grade.exceed_achievement}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {grade.exceed_achievement}%
                            </div>
                          </div>
                        </div>
                        <div className="row text-center g-2">
                          <div className="col-6">
                            <div className="border rounded p-2">
                              <div className="h5 mb-0">{grade.completed}</div>
                              <small className="text-success">Tuntas</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded p-2">
                              <div className="h5 mb-0">{grade.uncompleted}</div>
                              <small className="text-danger">
                                Belum Tuntas
                              </small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded p-2">
                              <div className="h5 mb-0">
                                {grade.exceed_completed}
                              </div>
                              <small className="text-success">
                                Melebihi Target
                              </small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded p-2">
                              <div className="h5 mb-0">
                                {grade.exceed_uncompleted}
                              </div>
                              <small className="text-danger">
                                Belum Melebihi
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div className="row">
                      {grade.classes.map((classItem, classIndex) => (
                        <div key={classIndex} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-header">
                              <h6 className="mb-0">{classItem.class_name}</h6>
                            </div>
                            <div className="card-body">
                              <div className="row text-center g-2 mb-3">
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <div className="h6 mb-0">
                                      {classItem.completed}
                                    </div>
                                    <small className="text-success">
                                      Tuntas
                                    </small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <div className="h6 mb-0">
                                      {classItem.uncompleted}
                                    </div>
                                    <small className="text-danger">
                                      Belum Tuntas
                                    </small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <div className="h6 mb-0">
                                      {classItem.exceed_completed}
                                    </div>
                                    <small className="text-success">
                                      Melebihi Target
                                    </small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <div className="h6 mb-0">
                                      {classItem.exceed_uncompleted}
                                    </div>
                                    <small className="text-danger">
                                      Belum Melebihi
                                    </small>
                                  </div>
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-primary w-100"
                                data-bs-toggle="modal"
                                data-bs-target="#detail-student"
                                onClick={() =>
                                  setModalData({
                                    students: classItem.students,
                                    gradeName: grade.name,
                                    className: classItem.class_name,
                                  })
                                }
                              >
                                Lihat Detail Siswa
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Chart untuk visualisasi data */}
            <div className="mt-4">
              <Bar
                options={chartOptions}
                data={{
                  labels: periode.grade.map((g) => g.name),
                  datasets: [
                    {
                      label: "Pencapaian Target (%)",
                      data: periode.grade.map((g) => g.achievement),
                      backgroundColor: "rgba(53, 162, 235, 0.5)",
                    },
                    {
                      label: "Siswa Tuntas Target",
                      data: periode.grade.map((g) => g.completed),
                      backgroundColor: "rgba(75, 192, 192, 0.5)",
                    },
                    {
                      label: "Siswa Belum Tuntas Target",
                      data: periode.grade.map((g) => g.uncompleted),
                      backgroundColor: "rgba(255, 99, 132, 0.5)",
                    },
                    {
                      label: "Pencapaian Melebihi Target (%)",
                      data: periode.grade.map((g) => g.exceed_achievement),
                      backgroundColor: "rgba(255, 159, 64, 0.5)",
                    },
                    {
                      label: "Siswa Melebihi Target",
                      data: periode.grade.map((g) => g.exceed_completed),
                      backgroundColor: "rgba(153, 102, 255, 0.5)",
                    },
                    {
                      label: "Siswa Belum Melebihi Target",
                      data: periode.grade.map((g) => g.exceed_uncompleted),
                      backgroundColor: "rgba(255, 205, 86, 0.5)",
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <StudentDetail
        students={modalData.students}
        gradename={modalData.gradeName}
        classname={modalData.className}
      />
    </div>
  );
};

export default Achievement;
