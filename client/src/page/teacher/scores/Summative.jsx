import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../components/table/Table";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetSummativeQuery,
  useUpsertSummativeMutation,
} from "../../../controller/api/lms/ApiScore";
import { toast } from "react-hot-toast";

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

  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  const { user } = useSelector((state) => state.auth);

  const { data: summativeData, refetch } = useGetSummativeQuery(
    { classid, subjectid, chapterid, month, semester },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
      refetchOnMountOrArgChange: true,
    }
  );

  // Reset scores when parameters change
  useEffect(() => {
    setSummativeScores({});
  }, [classid, subjectid, chapterid, month, semester]);

  useEffect(() => {
    if (summativeData && Array.isArray(summativeData)) {
      const mapped = {};
      for (const row of summativeData) {
        mapped[row.student_id] = {
          sumatif1: row.s_1 !== null && row.s_1 !== undefined ? row.s_1 : "",
          sumatif2: row.s_2 !== null && row.s_2 !== undefined ? row.s_2 : "",
          sumatif3: row.s_3 !== null && row.s_3 !== undefined ? row.s_3 : "",
          sumatif4: row.s_4 !== null && row.s_4 !== undefined ? row.s_4 : "",
          sumatif5: row.s_5 !== null && row.s_5 !== undefined ? row.s_5 : "",
          sumatif6: row.s_6 !== null && row.s_6 !== undefined ? row.s_6 : "",
          sumatif7: row.s_7 !== null && row.s_7 !== undefined ? row.s_7 : "",
          sumatif8: row.s_8 !== null && row.s_8 !== undefined ? row.s_8 : "",
        };
      }
      if (Object.keys(mapped).length > 0) setSummativeScores(mapped);
    }
  }, [summativeData]);

  const [
    upsertSummative,
    { isLoading: isSaving, isSuccess, data: upsertData, isError, error },
  ] = useUpsertSummativeMutation();

  const handleScoreChange = (studentId, taskNumber, value) => {
    setSummativeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [`sumatif${taskNumber}`]: value,
      },
    }));
  };

  const handleSave = async (student) => {
    const s = summativeScores[student.student] || {};
    await upsertSummative({
      student_id: student.student,
      subject_id: Number(subjectid),
      class_id: Number(classid),
      chapter_id: Number(chapterid),
      month,
      semester,
      S_1: s.sumatif1 ? Number(s.sumatif1) : null,
      S_2: s.sumatif2 ? Number(s.sumatif2) : null,
      S_3: s.sumatif3 ? Number(s.sumatif3) : null,
      S_4: s.sumatif4 ? Number(s.sumatif4) : null,
      S_5: s.sumatif5 ? Number(s.sumatif5) : null,
      S_6: s.sumatif6 ? Number(s.sumatif6) : null,
      S_7: s.sumatif7 ? Number(s.sumatif7) : null,
      S_8: s.sumatif8 ? Number(s.sumatif8) : null,
    });
  };

  const calculateAverage = (studentId) => {
    const scores = summativeScores[studentId];
    if (!scores) return 0;

    const values = [];
    for (let i = 1; i <= 8; i++) {
      const score = scores[`sumatif${i}`];
      if (score !== "" && score !== null && score !== undefined) {
        values.push(Number(score));
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
          <div>s_{i}</div>
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
            min="0"
            max="100"
            value={summativeScores[student.student]?.[`sumatif${i}`] ?? ""}
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

export default Summative;
