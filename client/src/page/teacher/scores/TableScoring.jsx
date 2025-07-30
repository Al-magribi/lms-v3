import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetChaptersQuery } from "../../../controller/api/lms/ApiChapter";
import {
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
} from "../../../controller/api/lms/ApiScore";
import { useSelector } from "react-redux";

const scoreFields = [
  { key: "taks_score", label: "Tugas" },
  { key: "writing_score", label: "Menulis" },
  { key: "speaking_score", label: "Berbicara" },
  { key: "lab_score", label: "Lab" },
  { key: "note", label: "Catatan Materi" },
];

const abcdOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
];

const TableScoring = () => {
  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");

  const { user } = useSelector((state) => state.auth);

  // State for report data per student
  const [reports, setReports] = useState({}); // { [studentid]: { ...report, scores: [...] } }
  const [saving, setSaving] = useState({}); // { [studentid]: true/false }
  const [error, setError] = useState(null);

  // Fetch chapter (to get chapters/materials)
  const { data: chaptersData, isLoading: loadingChapters } =
    useGetChaptersQuery(subjectid, { skip: !subjectid });

  // Get selected chapter's chapters
  const selectedChapter = useMemo(
    () => chaptersData?.find((c) => String(c.chapter_id) === String(chapterid)),
    [chaptersData, chapterid]
  );
  const chapters =
    selectedChapter?.contents?.map((c) => ({
      chapter_id: c.content_id,
      chapter_title: c.content_title,
      ...c,
    })) || [];

  // Fetch students + reports from /reports
  const {
    data: studentsData,
    isLoading: loadingReports,
    refetch: refetchReports,
  } = useGetReportsQuery(
    { classid, subjectid, month, chapterid },
    { skip: !classid || !subjectid || !chapterid || !month }
  );

  // Only set reports if studentsData or chapters change meaningfully
  useEffect(() => {
    if (!studentsData || !chapters) return;
    // Only set if reports is empty or studentsData/chapters length changes
    if (
      Object.keys(reports).length === 0 ||
      Object.keys(reports).length !== studentsData.length ||
      (studentsData.length > 0 &&
        (!reports[studentsData[0].studentid] ||
          reports[studentsData[0].studentid].scores?.length !==
            chapters.length))
    ) {
      const newReports = {};
      studentsData.forEach((student) => {
        newReports[student.studentid] = {
          ...student,
          scores:
            student.scores && student.scores.length > 0
              ? student.scores
              : chapters.map((chapter) => ({
                  chapterid: chapter.chapter_id,
                  taks_score: "",
                  writing_score: "",
                  speaking_score: "",
                  lab_score: "",
                  note: "",
                })),
        };
      });
      setReports(newReports);
    }
  }, [studentsData, chapters]);

  // Mutations
  const [createReport] = useCreateReportMutation();
  const [updateReport] = useUpdateReportMutation();

  // Handle input change
  const handleInputChange = (studentid, field, value) => {
    setReports((prev) => ({
      ...prev,
      [studentid]: {
        ...prev[studentid],
        [field]: value,
      },
    }));
  };

  // Handle score change
  const handleScoreChange = (studentid, chapterid, field, value) => {
    setReports((prev) => ({
      ...prev,
      [studentid]: {
        ...prev[studentid],
        scores: prev[studentid].scores.map((score) =>
          score.chapterid === chapterid ? { ...score, [field]: value } : score
        ),
      },
    }));
  };

  // Save or update report for a student
  const handleSave = async (student, idx) => {
    const report = reports[student.studentid];
    if (!report) return;
    setSaving((prev) => ({ ...prev, [student.studentid]: true }));
    setError(null);
    try {
      const body = {
        classid,
        subjectid,
        studentid: student.studentid,
        teacherid: user.id,
        type_report: "bulanan",
        month,
        performance: report.performance,
        discipline: report.discipline,
        activeness: report.activeness,
        confidence: report.confidence,
        teacher_note: report.teacher_note,
        note: report.note,
        scores: report.scores,
      };
      if (report.id) {
        // Update
        await updateReport({ id: report.id, body }).unwrap();
      } else {
        // Create
        await createReport(body).unwrap();
      }
      setSaving((prev) => ({ ...prev, [student.studentid]: false }));
      refetchReports();
    } catch (err) {
      setSaving((prev) => ({ ...prev, [student.studentid]: false }));
      setError(
        "Gagal menyimpan laporan: " + (err?.data?.message || err.message)
      );
    }
  };

  if (loadingChapters || loadingReports) return <div>Loading...</div>;
  if (!classid || !subjectid || !chapterid || !month)
    return <div>Pilih chapter, kelas, dan bulan terlebih dahulu.</div>;
  if (!studentsData || studentsData.length === 0)
    return <div>Tidak ada siswa di kelas ini.</div>;

  return (
    <div className="mt-3">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th rowSpan={2}>#</th>
              <th rowSpan={2}>Nama Siswa</th>
              {chapters.map((chapter) => (
                <th
                  key={chapter.chapter_id}
                  colSpan={scoreFields.length}
                  className="text-center"
                >
                  {chapter.chapter_title}
                </th>
              ))}
              <th rowSpan={2}>Kinerja</th>
              <th rowSpan={2}>Disiplin</th>
              <th rowSpan={2}>Keaktifan</th>
              <th rowSpan={2}>Kepercayaan Diri</th>
              <th rowSpan={2}>Catatan Guru</th>
              <th rowSpan={2}>Catatan Umum</th>
              <th rowSpan={2}>Aksi</th>
            </tr>
            <tr>
              {chapters.map((chapter) =>
                scoreFields.map((field) => (
                  <th key={chapter.chapter_id + field.key}>{field.label}</th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {studentsData.map((student, idx) => {
              const report = reports[student.studentid] || {};
              return (
                <tr key={student.studentid}>
                  <td>{idx + 1}</td>
                  <td>{student.name}</td>
                  {chapters.map((chapter) => {
                    const score =
                      (report.scores || []).find(
                        (s) => s.chapterid === chapter.chapter_id
                      ) || {};
                    return scoreFields.map((field) => (
                      <td key={chapter.chapter_id + field.key}>
                        <input
                          type={field.key === "note" ? "text" : "number"}
                          className="form-control form-control-sm"
                          value={score[field.key] || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              student.studentid,
                              chapter.chapter_id,
                              field.key,
                              e.target.value
                            )
                          }
                        />
                      </td>
                    ));
                  })}
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={report.performance || ""}
                      onChange={(e) =>
                        handleInputChange(
                          student.studentid,
                          "performance",
                          e.target.value
                        )
                      }
                    >
                      <option value="">-</option>
                      {abcdOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={report.discipline || ""}
                      onChange={(e) =>
                        handleInputChange(
                          student.studentid,
                          "discipline",
                          e.target.value
                        )
                      }
                    >
                      <option value="">-</option>
                      {abcdOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={report.activeness || ""}
                      onChange={(e) =>
                        handleInputChange(
                          student.studentid,
                          "activeness",
                          e.target.value
                        )
                      }
                    >
                      <option value="">-</option>
                      {abcdOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={report.confidence || ""}
                      onChange={(e) =>
                        handleInputChange(
                          student.studentid,
                          "confidence",
                          e.target.value
                        )
                      }
                    >
                      <option value="">-</option>
                      {abcdOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={report.teacher_note || ""}
                      onChange={(e) =>
                        handleInputChange(
                          student.studentid,
                          "teacher_note",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={report.note || ""}
                      onChange={(e) =>
                        handleInputChange(
                          student.studentid,
                          "note",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      disabled={saving[student.studentid]}
                      onClick={() => handleSave(student, idx)}
                    >
                      {saving[student.studentid]
                        ? "Menyimpan..."
                        : report.id
                        ? "Update"
                        : "Simpan"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableScoring;
