import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../components/table/Table";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetAttitudeQuery,
  useUpsertAttitudeMutation,
} from "../../../controller/api/lms/ApiScore";
import { toast } from "react-hot-toast";

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

  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  const { user } = useSelector((state) => state.auth);
  const teacher_id = user?.id;

  const { data: attitudeData, refetch } = useGetAttitudeQuery(
    { classid, subjectid, chapterid, month, semester },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
      refetchOnMountOrArgChange: true,
    }
  );

  // Reset scores when parameters change
  useEffect(() => {
    setAttitudeScores({});
  }, [classid, subjectid, chapterid, month, semester]);

  useEffect(() => {
    if (attitudeData && Array.isArray(attitudeData)) {
      const mapped = {};
      for (const row of attitudeData) {
        mapped[row.student_id] = {
          kinerja:
            row.kinerja !== null && row.kinerja !== undefined
              ? row.kinerja
              : "",
          kedisiplinan:
            row.kedisiplinan !== null && row.kedisiplinan !== undefined
              ? row.kedisiplinan
              : "",
          keaktifan:
            row.keaktifan !== null && row.keaktifan !== undefined
              ? row.keaktifan
              : "",
          percayaDiri:
            row.percaya_diri !== null && row.percaya_diri !== undefined
              ? row.percaya_diri
              : "",
          catatan: row.catatan_guru ?? "",
        };
      }
      if (Object.keys(mapped).length > 0) setAttitudeScores(mapped);
    }
  }, [attitudeData]);

  const [
    upsertAttitude,
    { isLoading: isSaving, isSuccess, data: upsertData, isError, error },
  ] = useUpsertAttitudeMutation();

  const handleScoreChange = (studentId, field, value) => {
    setAttitudeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (student) => {
    const studentScores = attitudeScores[student.student] || {};
    await upsertAttitude({
      student_id: student.student,
      subject_id: Number(subjectid),
      class_id: Number(classid),
      chapter_id: Number(chapterid),
      teacher_id,
      month,
      semester,
      kinerja: studentScores.kinerja ? Number(studentScores.kinerja) : null,
      kedisiplinan: studentScores.kedisiplinan
        ? Number(studentScores.kedisiplinan)
        : null,
      keaktifan: studentScores.keaktifan
        ? Number(studentScores.keaktifan)
        : null,
      percaya_diri: studentScores.percayaDiri
        ? Number(studentScores.percayaDiri)
        : null,
      catatan_guru: studentScores.catatan || null,
    });
  };

  const calculateAverage = (studentId) => {
    const scores = attitudeScores[studentId];
    if (!scores) return 0;

    const values = [
      scores.kinerja,
      scores.kedisiplinan,
      scores.keaktifan,
      scores.percayaDiri,
    ].filter((score) => score !== "" && score !== null && score !== undefined);

    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + Number(score), 0) / values.length
    ).toFixed(1);
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
                        min="0"
                        max="100"
                        value={attitudeScores[student.student]?.kinerja ?? ""}
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "kinerja",
                            e.target.value
                          )
                        }
                        placeholder="0-100"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="0"
                        max="100"
                        value={
                          attitudeScores[student.student]?.kedisiplinan ?? ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "kedisiplinan",
                            e.target.value
                          )
                        }
                        placeholder="0-100"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="0"
                        max="100"
                        value={attitudeScores[student.student]?.keaktifan ?? ""}
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "keaktifan",
                            e.target.value
                          )
                        }
                        placeholder="0-100"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        min="0"
                        max="100"
                        value={
                          attitudeScores[student.student]?.percayaDiri ?? ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            student.student,
                            "percayaDiri",
                            e.target.value
                          )
                        }
                        placeholder="0-100"
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

export default Attitude;
