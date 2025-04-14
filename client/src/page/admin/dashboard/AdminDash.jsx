import { useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetAdminDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminDash = () => {
  const { data, isLoading } = useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <Layout title={"Dashboard"} levels={["admin"]}>
        <div className='d-flex justify-content-center align-items-center min-vh-100'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  // Prepare Grade Data
  const gradeChartData = {
    labels:
      data?.studentsPerGrade?.map((grade) => `Kelas ${grade.grade_name}`) || [],
    datasets: [
      {
        data:
          data?.studentsPerGrade?.map(
            (grade) => parseInt(grade.total_students) || 0
          ) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Teacher Data
  const teacherChartData = {
    labels: ["Laki-laki", "Perempuan"],
    datasets: [
      {
        data: [
          parseInt(data?.teacherComposition?.male_count) || 0,
          parseInt(data?.teacherComposition?.female_count) || 0,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Class Distribution Data
  const classDistributionData = {
    labels: data?.studentsPerClass?.map((cls) => cls.class_name) || [],
    datasets: [
      {
        label: "Laki-laki",
        data:
          data?.studentsPerClass?.map((cls) => parseInt(cls.male_count) || 0) ||
          [],
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Perempuan",
        data:
          data?.studentsPerClass?.map(
            (cls) => parseInt(cls.female_count) || 0
          ) || [],
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const classDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Distribusi Siswa per Kelas",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const cls = data?.studentsPerClass[index];
            const total =
              (parseInt(cls?.male_count) || 0) +
              (parseInt(cls?.female_count) || 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return (
    <Layout title={"Dashboard"} levels={["admin"]}>
      <div className='container-fluid p-4'>
        {/* Basic Statistics Cards */}
        <div className='row g-4 mb-4'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <h6 className='card-subtitle mb-2 text-muted'>Total Siswa</h6>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-people fs-2 me-2 text-primary'></i>
                  <h2 className='card-title mb-0'>
                    {parseInt(data?.basicStats?.total_students) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <h6 className='card-subtitle mb-2 text-muted'>Total Guru</h6>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-person-video3 fs-2 me-2 text-success'></i>
                  <h2 className='card-title mb-0'>
                    {parseInt(data?.basicStats?.total_teachers) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <h6 className='card-subtitle mb-2 text-muted'>Total Kelas</h6>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-book fs-2 me-2 text-info'></i>
                  <h2 className='card-title mb-0'>
                    {parseInt(data?.basicStats?.total_classes) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <h6 className='card-subtitle mb-2 text-muted'>
                  Total Mata Pelajaran
                </h6>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-journal-text fs-2 me-2 text-warning'></i>
                  <h2 className='card-title mb-0'>
                    {parseInt(data?.basicStats?.total_subjects) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='row g-4 mb-4'>
          {/* Students per Grade Chart */}
          <div className='col-12 col-lg-6'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>
                  Distribusi Siswa per Tingkat
                </h5>
              </div>
              <div className='card-body'>
                <div style={{ height: "300px", position: "relative" }}>
                  <Doughnut data={gradeChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Gender Distribution */}
          <div className='col-12 col-lg-6'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Komposisi Guru</h5>
              </div>
              <div className='card-body'>
                <div style={{ height: "300px", position: "relative" }}>
                  <Doughnut data={teacherChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Distribution Section */}
        <div className='row g-4'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Distribusi Siswa per Kelas</h5>
              </div>
              <div className='card-body'>
                <div style={{ height: "400px", position: "relative" }}>
                  <Bar
                    data={classDistributionData}
                    options={classDistributionOptions}
                  />
                </div>
                <div className='table-responsive mt-4'>
                  <table className='table table-striped'>
                    <thead>
                      <tr>
                        <th>Kelas</th>
                        <th>Total Siswa</th>
                        <th>Laki-laki</th>
                        <th>Perempuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.studentsPerClass || []).map((cls) => (
                        <tr key={cls.class_name}>
                          <td>{cls.class_name}</td>
                          <td>{parseInt(cls.total_students) || 0}</td>
                          <td>{parseInt(cls.male_count) || 0}</td>
                          <td>{parseInt(cls.female_count) || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDash;
