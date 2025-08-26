import React, { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../../components/table/Table";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetSummativeQuery,
  useUpsertSummativeMutation,
  useBulkUpsertSummativeMutation,
} from "../../../controller/api/lms/ApiScore";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import Upload from "./Upload";

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
          oral: row.oral !== null && row.oral !== undefined ? row.oral : "",
          written:
            row.written !== null && row.written !== undefined
              ? row.written
              : "",
          project:
            row.project !== null && row.project !== undefined
              ? row.project
              : "",
          performace:
            row.performace !== null && row.performace !== undefined
              ? row.performace
              : "",
        };
      }
      if (Object.keys(mapped).length > 0) setSummativeScores(mapped);
    }
  }, [summativeData]);

  const [
    upsertSummative,
    { isLoading: isSaving, isSuccess, data: upsertData, isError, error },
  ] = useUpsertSummativeMutation();

  // Upload file
  const inputRef = useRef(null);
  const [
    bulkUpsertSummative,
    {
      isLoading: isBulkUpserting,
      isSuccess: isBulkUpsertSuccess,
      isError: isBulkUpsertError,
      error: bulkUpsertError,
      data: bulkUpsertData,
    },
  ] = useBulkUpsertSummativeMutation();

  const [file, setFile] = useState(null);

  const handleScoreChange = (studentId, field, value) => {
    setSummativeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
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
      oral: s.oral ? Number(s.oral) : null,
      written: s.written ? Number(s.written) : null,
      project: s.project ? Number(s.project) : null,
      performace: s.performace ? Number(s.performace) : null,
    });
  };

  const calculateAverage = (studentId) => {
    const scores = summativeScores[studentId];
    if (!scores) return 0;

    const values = [];
    if (
      scores.oral !== "" &&
      scores.oral !== null &&
      scores.oral !== undefined
    ) {
      values.push(Number(scores.oral));
    }
    if (
      scores.written !== "" &&
      scores.written !== null &&
      scores.written !== undefined
    ) {
      values.push(Number(scores.written));
    }
    if (
      scores.project !== "" &&
      scores.project !== null &&
      scores.project !== undefined
    ) {
      values.push(Number(scores.project));
    }
    if (
      scores.performace !== "" &&
      scores.performace !== null &&
      scores.performace !== undefined
    ) {
      values.push(Number(scores.performace));
    }

    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + score, 0) / values.length
    ).toFixed(1);
  };

  const onDownload = () => {
    // Prepare data for Excel export
    const excelData = [
      // Header row
      [
        "NIS",
        "Nama Siswa",
        "Lisan",
        "Tulisan",
        "Proyek",
        "Keterampilan",
        "rata-rata",
      ],
    ];

    // Add student data rows
    if (data?.students) {
      data.students.forEach((student) => {
        const studentScores = summativeScores[student.student] || {};
        const average = calculateAverage(student.student);

        excelData.push([
          student.nis || "",
          student.student_name || "",
          studentScores.oral || "",
          studentScores.written || "",
          studentScores.project || "",
          studentScores.performace || "",
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
      { wch: 12 }, // Oral
      { wch: 12 }, // Written
      { wch: 12 }, // Project
      { wch: 12 }, // Performace
      { wch: 12 }, // rata-rata
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penilaian Sumatif");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `penilaian_sumatif_${currentDate}.xlsx`;

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

        // Filter data to only include columns A, B, C, D, E, F, G and rows that are not null
        const filteredData = jsonData
          .map((row) => {
            const [colA, colB, colC, colD, colE, colF, colG] = row;
            return [colA, colB, colC, colD, colE, colF, colG];
          })
          .filter((row) =>
            row.every((cell) => cell !== null && cell !== undefined)
          );

        // Pastikan filteredData adalah array
        const result = Array.isArray(filteredData)
          ? filteredData
          : [filteredData];

        toast.promise(
          bulkUpsertSummative({
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

  const renderSumatifColumns = () => {
    return [
      <th
        key='oral'
        className='text-center align-middle'
        style={{ backgroundColor: "#fff3cd" }}
      >
        <div>Oral</div>
      </th>,
      <th
        key='written'
        className='text-center align-middle'
        style={{ backgroundColor: "#fff3cd" }}
      >
        <div>Written</div>
      </th>,
      <th
        key='project'
        className='text-center align-middle'
        style={{ backgroundColor: "#fff3cd" }}
      >
        <div>Project</div>
      </th>,
      <th
        key='performace'
        className='text-center align-middle'
        style={{ backgroundColor: "#fff3cd" }}
      >
        <div>Performace</div>
      </th>,
    ];
  };

  const renderSumatifInputs = (student) => {
    const studentScores = summativeScores[student.student] || {};
    return [
      <td key='oral' className='text-center align-middle'>
        <input
          type='number'
          className='form-control form-control-sm text-center'
          min='0'
          max='100'
          value={studentScores.oral ?? ""}
          onChange={(e) =>
            handleScoreChange(student.student, "oral", e.target.value)
          }
          placeholder='0-100'
        />
      </td>,
      <td key='written' className='text-center align-middle'>
        <input
          type='number'
          className='form-control form-control-sm text-center'
          min='0'
          max='100'
          value={studentScores.written ?? ""}
          onChange={(e) =>
            handleScoreChange(student.student, "written", e.target.value)
          }
          placeholder='0-100'
        />
      </td>,
      <td key='project' className='text-center align-middle'>
        <input
          type='number'
          className='form-control form-control-sm text-center'
          min='0'
          max='100'
          value={studentScores.project ?? ""}
          onChange={(e) =>
            handleScoreChange(student.student, "project", e.target.value)
          }
          placeholder='0-100'
        />
      </td>,
      <td key='performace' className='text-center align-middle'>
        <input
          type='number'
          className='form-control form-control-sm text-center'
          min='0'
          max='100'
          value={studentScores.performace ?? ""}
          onChange={(e) =>
            handleScoreChange(student.student, "performace", e.target.value)
          }
          placeholder='0-100'
        />
      </td>,
    ];
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
        type='summative'
        title='Upload Penilaian Sumatif'
        onSubmit={onSubmit}
        inputRef={inputRef}
        setFile={setFile}
      />
      <div className='card'>
        <div className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='card-title mb-0'>Penilaian Sumatif</h5>

          <div className='d-flex gap-2'>
            <button
              className='btn btn-sm btn-outline-success'
              data-bs-toggle='modal'
              data-bs-target='#upload-score'
            >
              <i className='bi bi-upload'></i> Upload
            </button>
            <button
              className='btn btn-sm btn-outline-success'
              onClick={onDownload}
            >
              <i className='bi bi-download'></i> Download
            </button>
          </div>
        </div>
        <div className='card-body'>
          <div className='table-responsive'>
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
              <table className='table table-bordered table-striped table-hover'>
                <thead>
                  <tr>
                    <th className='text-center align-middle'>No</th>
                    <th className='text-center align-middle'>NIS</th>
                    <th className='text-center align-middle'>Nama Siswa</th>
                    {renderSumatifColumns()}
                    <th className='text-center align-middle'>Rata2</th>
                    <th className='text-center align-middle'>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.students?.map((student, index) => (
                    <tr key={student.id}>
                      <td className='text-center align-middle'>
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className='text-center align-middle'>
                        {student.nis}
                      </td>
                      <td className='align-middle'>{student.student_name}</td>
                      {renderSumatifInputs(student)}
                      <td className='text-center align-middle'>
                        <span className='fw-bold text-primary'>
                          {calculateAverage(student.student)}
                        </span>
                      </td>
                      <td className='text-center align-middle'>
                        <button
                          className='btn btn-sm btn-primary'
                          onClick={() => handleSave(student)}
                          disabled={isSaving}
                        >
                          <i className='bi bi-floppy'></i>
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

export default Summative;
