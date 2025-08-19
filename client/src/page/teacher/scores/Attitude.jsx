import React, { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../../components/table/Table";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetAttitudeQuery,
  useUpsertAttitudeMutation,
  useBulkUpsertAttitudeMutation,
} from "../../../controller/api/lms/ApiScore";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import Upload from "./Upload";

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

  // Upload file
  const inputRef = useRef(null);
  const [
    bulkUpsertAttitude,
    {
      isLoading: isBulkUpserting,
      isSuccess: isBulkUpsertSuccess,
      isError: isBulkUpsertError,
      error: bulkUpsertError,
      data: bulkUpsertData,
    },
  ] = useBulkUpsertAttitudeMutation();

  const [file, setFile] = useState(null);

  const onDownload = () => {
    // Prepare data for Excel export
    const excelData = [
      // Header row
      [
        "NIS",
        "Nama Siswa",
        "Kinerja",
        "Kedisiplinan",
        "Keaktifan",
        "Percaya Diri",
        "Catatan",
        "rata-rata",
      ],
    ];

    // Add student data rows
    if (data?.students) {
      data.students.forEach((student) => {
        const studentScores = attitudeScores[student.student] || {};
        const average = calculateAverage(student.student);

        excelData.push([
          student.nis || "",
          student.student_name || "",
          studentScores.kinerja || "",
          studentScores.kedisiplinan || "",
          studentScores.keaktifan || "",
          studentScores.percayaDiri || "",
          studentScores.catatan || "",
          average || "",
        ]);
      });
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths for better formatting
    const columnWidths = [
      { wch: 15 }, // NIS
      { wch: 30 }, // Nama Siswa
      { wch: 12 }, // Kinerja
      { wch: 15 }, // Kedisiplinan
      { wch: 12 }, // Keaktifan
      { wch: 15 }, // Percaya Diri
      { wch: 40 }, // Catatan
      { wch: 12 }, // rata-rata
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penilaian Sikap");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `penilaian_sikap_${currentDate}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);

    toast.success("File Excel berhasil diunduh!");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          range: 1,
        });

        // Filter data to only include columns A, B, C, D, E and rows that are not null
        const filteredData = jsonData
          .map((row) => {
            const [colA, colB, colC, colD, colE, colF, colG, colH] = row;
            return [colA, colB, colC, colD, colE, colF, colG, colH];
          })
          .filter((row) =>
            row.every((cell) => cell !== null && cell !== undefined)
          );

        // Pastikan filteredData adalah array
        const result = Array.isArray(filteredData)
          ? filteredData
          : [filteredData];

        toast.promise(
          bulkUpsertAttitude({
            classid: Number(classid),
            subjectid: Number(subjectid),
            chapterid: Number(chapterid),
            month,
            semester,
            data: result,
          })
            .unwrap()
            .then((res) => res.message),
          {
            loading: "Menyimpan data...",
            success: (message) => message,
            error: (err) => err.data.message,
          }
        );
      };

      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (isBulkUpsertSuccess) {
      inputRef.current.value = null;
      setFile(null);
      const closeModal = document.querySelector("[data-bs-dismiss='modal']");
      closeModal.click();
    }

    if (isBulkUpsertError) {
      toast.error(bulkUpsertError.data.message);
      inputRef.current.value = null;
      setFile(null);
    }
  }, [isBulkUpsertSuccess, isBulkUpsertError, bulkUpsertData, refetch]);

  useEffect(() => {
    const modal = document.getElementById("upload-score");
    if (!modal) return;
    const handler = () => {
      // Reset state/input jika perlu
      setFile(null);
      if (inputRef.current) inputRef.current.value = null;
    };
    modal.addEventListener("hidden.bs.modal", handler);
    return () => modal.removeEventListener("hidden.bs.modal", handler);
  }, []);

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
    <>
      <Upload
        type="attitude"
        title="Upload Penilaian Sikap"
        onSubmit={onSubmit}
        inputRef={inputRef}
        setFile={setFile}
      />
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Penilaian Sikap</h5>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-success"
              data-bs-toggle="modal"
              data-bs-target="#upload-score"
            >
              <i className="bi bi-upload"></i> Upload
            </button>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={onDownload}
            >
              <i className="bi bi-download"></i> Download
            </button>
          </div>
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
                    <th className="text-center align-middle">Rerata</th>
                    <th className="text-center align-middle">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.students?.map((student, index) => (
                    <tr key={student.id}>
                      <td className="text-center align-middle">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="text-center align-middle">
                        {student.nis}
                      </td>
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
                          value={
                            attitudeScores[student.student]?.keaktifan ?? ""
                          }
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
                          <i className="bi bi-floppy"></i>
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
    </>
  );
};

export default Attitude;
