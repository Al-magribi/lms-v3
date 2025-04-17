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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentDetailModal = ({ show, onClose, students, gradeName }) => {
  if (!show) return null;

  return (
    <>
      <div className='modal fade show d-block' tabIndex='-1'>
        <div className='modal-dialog modal-lg modal-dialog-scrollable'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Tingkat - {gradeName}</h5>
              <button
                type='button'
                className='btn-close'
                onClick={onClose}></button>
            </div>
            <div className='modal-body'>
              <div className='table-responsive'>
                <table className='table table-sm table-bordered table-striped table-hover'>
                  <thead>
                    <tr>
                      <th>NIS</th>
                      <th>Nama</th>
                      <th>Kelas</th>
                      <th style={{ width: "30%" }}>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, studentIndex) => (
                      <tr key={studentIndex}>
                        <td>{student.nis}</td>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td>
                          {student.progress.map((p, pIndex) => (
                            <div key={pIndex} className='mb-1'>
                              <small className='d-flex justify-content-between'>
                                <span>{p.juz}</span>
                                <span>{p.persentase}%</span>
                              </small>
                              <div
                                className='progress'
                                style={{ height: "5px" }}>
                                <div
                                  className={`progress-bar ${
                                    p.persentase >= 100
                                      ? "bg-success"
                                      : p.persentase >= 75
                                      ? "bg-info"
                                      : p.persentase >= 50
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                  role='progressbar'
                                  style={{ width: `${p.persentase}%` }}
                                  aria-valuenow={p.persentase}
                                  aria-valuemin='0'
                                  aria-valuemax='100'></div>
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={onClose}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  );
};

const Achievement = () => {
  const { data, isLoading } = useGetAchievementQuery();
  const [modalData, setModalData] = useState({
    show: false,
    students: [],
    gradeName: "",
  });

  console.log(data);

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
    <div className='container-fluid p-0'>
      {data.map((periode, periodeIndex) => (
        <div key={periodeIndex} className='card mb-4'>
          <div className='card-header'>
            <h4>{periode.periode}</h4>
            <small className='text-muted'>{periode.homebase}</small>
          </div>
          <div className='card-body'>
            {periode.grade.map((grade, gradeIndex) => (
              <div key={gradeIndex} className='mb-4'>
                <h5>{grade.name}</h5>
                <div className='row'>
                  <div className='col-md-4'>
                    <div className='card mb-3'>
                      <div className='card-body'>
                        <h6>Target Hafalan</h6>
                        {grade.target.map((target, targetIndex) => (
                          <div key={targetIndex} className='mb-2'>
                            <div className='d-flex justify-content-between'>
                              <span className='badge bg-success'>
                                {target.juz}
                              </span>
                              <small className='badge bg-danger'>
                                {target.verses} Ayat | {target.lines} Baris
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='col-md-8'>
                    <div className='card mb-3'>
                      <div className='card-body'>
                        <h6>Pencapaian Tingkat</h6>
                        <div className='mb-3'>
                          <div className='d-flex justify-content-between mb-1'>
                            <span>Progress Ketuntasan</span>
                            <span>{grade.achievement}%</span>
                          </div>
                          <div className='progress'>
                            <div
                              className={`progress-bar ${
                                grade.achievement >= 75
                                  ? "bg-success"
                                  : grade.achievement >= 50
                                  ? "bg-warning"
                                  : "bg-danger"
                              }`}
                              role='progressbar'
                              style={{ width: `${grade.achievement}%` }}
                              aria-valuenow={grade.achievement}
                              aria-valuemin='0'
                              aria-valuemax='100'>
                              {grade.achievement}%
                            </div>
                          </div>
                        </div>
                        <div className='row text-center'>
                          <div className='col'>
                            <div className='h5 mb-0'>{grade.completed}</div>
                            <small className='text-success'>Tuntas</small>
                          </div>
                          <div className='col'>
                            <div className='h5 mb-0'>{grade.uncompleted}</div>
                            <small className='text-danger'>Belum Tuntas</small>
                          </div>
                        </div>
                        <div className='text-center mt-3'>
                          <button
                            className='btn btn-sm btn-primary'
                            onClick={() =>
                              setModalData({
                                show: true,
                                students: grade.students,
                                gradeName: grade.name,
                              })
                            }>
                            Lihat Detail Siswa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Chart untuk visualisasi data */}
            <div className='mt-4'>
              <Bar
                options={chartOptions}
                data={{
                  labels: periode.grade.map((g) => g.name),
                  datasets: [
                    {
                      label: "Pencapaian (%)",
                      data: periode.grade.map((g) => g.achievement),
                      backgroundColor: "rgba(53, 162, 235, 0.5)",
                    },
                    {
                      label: "Siswa Tuntas",
                      data: periode.grade.map((g) => g.completed),
                      backgroundColor: "rgba(75, 192, 192, 0.5)",
                    },
                    {
                      label: "Siswa Belum Tuntas",
                      data: periode.grade.map((g) => g.uncompleted),
                      backgroundColor: "rgba(255, 99, 132, 0.5)",
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <StudentDetailModal
        show={modalData.show}
        students={modalData.students}
        gradeName={modalData.gradeName}
        onClose={() =>
          setModalData({ show: false, students: [], gradeName: "" })
        }
      />
    </div>
  );
};

export default Achievement;
