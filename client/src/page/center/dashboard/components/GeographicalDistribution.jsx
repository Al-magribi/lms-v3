import React from "react";
import { Doughnut } from "react-chartjs-2";

const GeographicalDistribution = ({
  geographicalDistribution,
  studentDemographics,
  chartOptions,
}) => {
  return (
    <div className="col-md-6">
      <div className="card h-100">
        <div className="card-header">
          <h5 className="card-title mb-0">Distribusi Geografis Siswa</h5>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-center h-50">
            <Doughnut
              data={{
                labels:
                  geographicalDistribution?.map((item) => item.province_name) ||
                  [],
                datasets: [
                  {
                    data:
                      geographicalDistribution?.map(
                        (item) => parseInt(item.student_count) || 0
                      ) || [],
                    backgroundColor: [
                      "rgba(54, 162, 235, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                      "rgba(75, 192, 192, 0.8)",
                      "rgba(255, 206, 86, 0.8)",
                      "rgba(153, 102, 255, 0.8)",
                    ],
                    borderColor: [
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 99, 132, 1)",
                      "rgba(75, 192, 192, 1)",
                      "rgba(255, 206, 86, 1)",
                      "rgba(153, 102, 255, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="table-responsive mt-4">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Provinsi</th>
                  <th>Jumlah Siswa</th>
                  <th>Persentase</th>
                </tr>
              </thead>
              <tbody>
                {(geographicalDistribution || []).map((item, index) => (
                  <tr key={index}>
                    <td>{item.province_name}</td>
                    <td>{parseInt(item.student_count) || 0}</td>
                    <td>
                      {(
                        ((parseInt(item.student_count) || 0) /
                          (parseInt(studentDemographics?.total_students) ||
                            1)) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicalDistribution;
