import React, { useState } from "react";
import Table from "../../../components/table/Table";

const Summative = ({
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
  const [summativeScores, setSummativeScores] = useState({});

  const handleScoreChange = (studentId, taskNumber, value) => {
    setSummativeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [`sumatif${taskNumber}`]: value,
      },
    }));
  };

  const handleSave = (student) => {
    const studentScores = summativeScores[student.student] || {};
    console.log("Menyimpan nilai sumatif untuk siswa:", {
      studentId: student.student,
      studentName: student.student_name,
      scores: studentScores,
    });
  };

  const calculateAverage = (studentId) => {
    const scores = summativeScores[studentId];
    if (!scores) return 0;

    const values = [];
    for (let i = 1; i <= 8; i++) {
      const score = scores[`sumatif${i}`];
      if (score && score > 0) {
        values.push(parseFloat(score));
      }
    }

    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + score, 0) / values.length
    ).toFixed(1);
  };

  const renderSumatifColumns = () => {
    const columns = [];
    for (let i = 1; i <= 8; i++) {
      columns.push(
        <th
          key={i}
          className="text-center align-middle"
          style={{ backgroundColor: "#fff3cd" }}
        >
          <div>Sumatif {i}</div>
        </th>
      );
    }
    return columns;
  };

  const renderSumatifInputs = (student) => {
    const inputs = [];
    for (let i = 1; i <= 8; i++) {
      inputs.push(
        <td key={i} className="text-center align-middle">
          <input
            type="number"
            className="form-control form-control-sm text-center"
            min="10"
            max="100"
            value={summativeScores[student.student]?.[`sumatif${i}`] || ""}
            onChange={(e) =>
              handleScoreChange(student.student, i, e.target.value)
            }
            placeholder="10-100"
          />
        </td>
      );
    }
    return inputs;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Penilaian Sumatif</h5>
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
                  {renderSumatifColumns()}
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
                    {renderSumatifInputs(student)}
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

export default Summative;
