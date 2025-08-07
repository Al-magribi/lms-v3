import React, { useState } from "react";
import Table from "../../../components/table/Table";

const Attendance = ({
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
  const [attendanceScores, setAttendanceScores] = useState({});

  const handleScoreChange = (studentId, value) => {
    setAttendanceScores((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSave = (student) => {
    const studentScore = attendanceScores[student.student] || "";
    console.log("Menyimpan nilai kehadiran untuk siswa:", {
      studentId: student.student,
      studentName: student.student_name,
      score: studentScore,
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Penilaian Kehadiran</h5>
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
                    Nilai Kehadiran
                  </th>
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
                        value={attendanceScores[student.student] || ""}
                        onChange={(e) =>
                          handleScoreChange(student.student, e.target.value)
                        }
                        placeholder="10-100"
                      />
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

export default Attendance;
