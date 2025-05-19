import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useUploadStudentsMutation } from "../../../controller/api/admin/ApiStudent";
import { toast } from "react-hot-toast";

const Upload = () => {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const [uploadStudents, { isSuccess, isLoading, isError, reset }] =
    useUploadStudentsMutation();

  const download = () => {
    window.open("/temp/template_siswa.xlsx", "_blank");
  };

  const uploadData = (e) => {
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

        // Filter data to only include columns A, B, C, D and rows that are not null
        const filteredData = jsonData
          .map((row) => {
            const [colA, colB, colC, colD] = row;
            return [colA, colB, colC, colD];
          })
          .filter((row) =>
            row.every((cell) => cell !== null && cell !== undefined)
          );

        // Pastikan filteredData adalah array
        const result = Array.isArray(filteredData)
          ? filteredData
          : [filteredData];

        toast.promise(
          uploadStudents(result)
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
    if (isSuccess) {
      inputRef.current.value = null;
      reset();
      const closeModal = document.querySelector("[data-bs-dismiss='modal']");
      closeModal.click();
    }

    if (isError) {
      reset();
      inputRef.current.value = null;
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    const modal = document.getElementById("uploadstudent");
    if (!modal) return;
    const handler = () => {
      // Reset state/input jika perlu
      setFile(null);
      if (inputRef.current) inputRef.current.value = null;
    };
    modal.addEventListener("hidden.bs.modal", handler);
    return () => modal.removeEventListener("hidden.bs.modal", handler);
  }, []);

  return (
    <div
      className="modal fade"
      id="uploadstudent"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="uploadStudentModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title" id="uploadStudentModalLabel">
              <i className="bi bi-file-earmark-arrow-up-fill me-2"></i>Upload
              Siswa
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={uploadData} className="d-flex flex-column gap-3">
              <div className="alert alert-info py-2 d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill"></i>
                Upload file Excel sesuai template yang disediakan.
              </div>
              <input
                ref={inputRef}
                type="file"
                name="students"
                id="student"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={download}
                >
                  <i className="bi bi-download me-1"></i>Template
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-success"
                  disabled={isLoading}
                >
                  <i className="bi bi-upload me-1"></i>Upload Data
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
