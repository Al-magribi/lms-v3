import React, { useState } from "react";
import Table from "../../../components/table/Table";

const Attitude = ({
  data,
  isLoading,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  totalData,
  totalPages,
}) => {
  const [attitudeScores, setAttitudeScores] = useState({});

  const handleScoreChange = (studentId, field, value) => {
    setAttitudeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = (student) => {
    const studentScores = attitudeScores[student.student] || {};
    console.log("Menyimpan nilai sikap untuk siswa:", {
      studentId: student.student,
      studentName: student.student_name,
      scores: studentScores,
    });
  };

  const calculateAverage = (studentId) => {
    const scores = attitudeScores[studentId];
    if (!scores) return 0;

    const values = [
      scores.kinerja || 0,
      scores.kedisiplinan || 0,
      scores.keaktifan || 0,
      scores.kepercayaanDiri || 0,
    ].filter((score) => score > 0);

    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + score, 0) / values.length
    ).toFixed(1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Penilaian Sikap</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <Table
            isLoading={isLoading}
            totalData={totalData}
            totalPages={totalPages}
            page={page}
            limit={limit}
            setPage={setPage}
            setLimit={setLimit}
            setSearch={setSearch}
          >
            <table className="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th className="text-center align-middle">No</th>
                  <th className="text-center align-middle">NIS</th>
                  <th className="text-center align-middle">Nama Siswa</th>
                  <th
                    className="text-center align-middle"
                    style={{ backgroundColor: "#fff3cd" }}
                  >
                    Kinerja
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ backgroundColor: "#fff3cd" }}
                  >
                    Kedisiplinan
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ backgroundColor: "#fff3cd" }}
                  >
                    Keaktifan
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ backgroundColor: "#fff3cd" }}
                  >
                    Percaya Diri
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ backgroundColor: "#d1ecf1" }}
                  >
                    Catatan
                  </th>
                  <th className="text-center align-middle">Rata-rata</th>
                  <th className="text-center align-middle">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data?.students?.map((student, index) => (
                  <tr key={student.id}>
                    <td className="text-center align-middle">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="text-center align-middle">{student.nis}</td>
                    <td className="align-middle">{student.student_name}</td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="10"
                        max="100"
                        value={attitudeScores[student.student]?.kinerja || ""}
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "kinerja",
                            e.target.value
                          )
                        }
                        placeholder="10-100"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="10"
                        max="100"
                        value={
                          attitudeScores[student.student]?.kedisiplinan || ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "kedisiplinan",
                            e.target.value
                          )
                        }
                        placeholder="10-100"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="10"
                        max="100"
                        value={attitudeScores[student.student]?.keaktifan || ""}
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "keaktifan",
                            e.target.value
                          )
                        }
                        placeholder="10-100"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="10"
                        max="100"
                        value={
                          attitudeScores[student.student]?.kepercayaanDiri || ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "kepercayaanDiri",
                            e.target.value
                          )
                        }
                        placeholder="10-100"
                      />
                    </td>
                    <td className="align-middle">
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={attitudeScores[student.student]?.catatan || ""}
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "catatan",
                            e.target.value
                          )
                        }
                        placeholder="Catatan guru..."
                      />
                    </td>
                    <td className="text-center align-middle">
                      <span className="fw-bold text-primary">
                        {calculateAverage(student.student)}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSave(student)}
                      >
                        <i className="bi bi-check"></i> Simpan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Attitude;
