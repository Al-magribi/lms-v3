import React from "react";
import { Pie } from "react-chartjs-2";

const StudentDemographics = ({ studentDemographics, chartOptions }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Data Demografis Siswa</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Informasi</th>
                        <th>Jumlah</th>
                        <th>Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr key="total">
                        <td>Total Siswa</td>
                        <td>
                          {parseInt(studentDemographics?.total_students) || 0}
                        </td>
                        <td>100%</td>
                      </tr>
                      <tr key="male">
                        <td>Laki-laki</td>
                        <td>
                          {parseInt(studentDemographics?.male_count) || 0}
                        </td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.male_count) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key="female">
                        <td>Perempuan</td>
                        <td>
                          {parseInt(studentDemographics?.female_count) || 0}
                        </td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.female_count) ||
                              0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key="age_11_12">
                        <td>Usia 11-12 Tahun</td>
                        <td>{parseInt(studentDemographics?.age_11_12) || 0}</td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.age_11_12) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key="age_13_14">
                        <td>Usia 13-14 Tahun</td>
                        <td>{parseInt(studentDemographics?.age_13_14) || 0}</td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.age_13_14) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key="age_15_16">
                        <td>Usia 15-16 Tahun</td>
                        <td>{parseInt(studentDemographics?.age_15_16) || 0}</td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.age_15_16) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key="age_17_18">
                        <td>Usia 17-18 Tahun</td>
                        <td>{parseInt(studentDemographics?.age_17_18) || 0}</td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.age_17_18) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key="age_19_20">
                        <td>Usia 19-20 Tahun</td>
                        <td>{parseInt(studentDemographics?.age_19_20) || 0}</td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.age_19_20) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Pie
                    data={{
                      labels: ["Laki-laki", "Perempuan"],
                      datasets: [
                        {
                          data: [
                            parseInt(studentDemographics?.male_count) || 0,
                            parseInt(studentDemographics?.female_count) || 0,
                          ],
                          backgroundColor: [
                            "rgba(54, 162, 235, 0.8)",
                            "rgba(255, 99, 132, 0.8)",
                          ],
                          borderColor: [
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 99, 132, 1)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDemographics;
