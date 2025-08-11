import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../components/table/Table";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetFormativeQuery,
  useUpsertFormativeMutation,
} from "../../../controller/api/lms/ApiScore";
import { toast } from "react-hot-toast";

const Formative = ({
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
  const [formativeScores, setFormativeScores] = useState({});

  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");
  const { user } = useSelector((state) => state.auth);

  const { data: formativeData, refetch } = useGetFormativeQuery(
    { classid, subjectid, chapterid, month, semester },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
      refetchOnMountOrArgChange: true,
    }
  );

  // Reset scores when parameters change
  useEffect(() => {
    setFormativeScores({});
  }, [classid, subjectid, chapterid, month, semester]);

  useEffect(() => {
    if (formativeData && Array.isArray(formativeData)) {
      const mapped = {};
      for (const row of formativeData) {
        mapped[row.student_id] = {
          tugas1: row.f_1 !== null && row.f_1 !== undefined ? row.f_1 : "",
          tugas2: row.f_2 !== null && row.f_2 !== undefined ? row.f_2 : "",
          tugas3: row.f_3 !== null && row.f_3 !== undefined ? row.f_3 : "",
          tugas4: row.f_4 !== null && row.f_4 !== undefined ? row.f_4 : "",
          tugas5: row.f_5 !== null && row.f_5 !== undefined ? row.f_5 : "",
          tugas6: row.f_6 !== null && row.f_6 !== undefined ? row.f_6 : "",
          tugas7: row.f_7 !== null && row.f_7 !== undefined ? row.f_7 : "",
          tugas8: row.f_8 !== null && row.f_8 !== undefined ? row.f_8 : "",
        };
      }
      if (Object.keys(mapped).length > 0) setFormativeScores(mapped);
    }
  }, [formativeData]);

  const [
    upsertFormative,
    { isLoading: isSaving, isSuccess, data: upsertData, isError, error },
  ] = useUpsertFormativeMutation();

  const handleScoreChange = (studentId, taskNumber, value) => {
    setFormativeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [`tugas${taskNumber}`]: value,
      },
    }));
  };

  const handleSave = async (student) => {
    const s = formativeScores[student.student] || {};
    await upsertFormative({
      student_id: student.student,
      subject_id: Number(subjectid),
      class_id: Number(classid),
      chapter_id: Number(chapterid),
      month,
      semester,
      F_1: s.tugas1 ? Number(s.tugas1) : null,
      F_2: s.tugas2 ? Number(s.tugas2) : null,
      F_3: s.tugas3 ? Number(s.tugas3) : null,
      F_4: s.tugas4 ? Number(s.tugas4) : null,
      F_5: s.tugas5 ? Number(s.tugas5) : null,
      F_6: s.tugas6 ? Number(s.tugas6) : null,
      F_7: s.tugas7 ? Number(s.tugas7) : null,
      F_8: s.tugas8 ? Number(s.tugas8) : null,
    });
  };

  const calculateAverage = (studentId) => {
    const scores = formativeScores[studentId];
    if (!scores) return 0;

    const values = [];
    for (let i = 1; i <= 8; i++) {
      const score = scores[`tugas${i}`];
      if (score !== "" && score !== null && score !== undefined) {
        values.push(Number(score));
      }
    }

    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + score, 0) / values.length
    ).toFixed(1);
  };

  const renderTaskColumns = () => {
    const columns = [];
    for (let i = 1; i <= 8; i++) {
      columns.push(
        <th
          key={i}
          className="text-center align-middle"
          style={{ backgroundColor: "#dc3545", color: "white" }}
        >
          f_{i}
        </th>
      );
    }
    return columns;
  };

  const renderTaskInputs = (student) => {
    const inputs = [];
    for (let i = 1; i <= 8; i++) {
      inputs.push(
        <td key={i} className="text-center align-middle">
          <input
            type="number"
            className="form-control form-control-sm text-center"
            min="0"
            max="100"
            value={formativeScores[student.student]?.[`tugas${i}`] ?? ""}
            onChange={(e) =>
              handleScoreChange(student.student, i, e.target.value)
            }
            placeholder="0-100"
          />
        </td>
      );
    }
    return inputs;
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(upsertData.message);
      // Refetch data after successful save to update the UI
      refetch();
    }

    if (isError) {
      toast.error(error.data.message);
    }
  }, [isSuccess, upsertData, isError, error, refetch]);

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Penilaian Formatif</h5>
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
                  {renderTaskColumns()}
                  <th className="text-center align-middle">Rata2</th>
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
                    {renderTaskInputs(student)}
                    <td className="text-center align-middle">
                      <span className="fw-bold text-primary">
                        {calculateAverage(student.student)}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSave(student)}
                        disabled={isSaving}
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

export default Formative;
