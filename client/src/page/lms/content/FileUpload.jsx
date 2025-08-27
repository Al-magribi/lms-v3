import React, { useState } from "react";
import { useAddContentFileMutation } from "../../../controller/api/lms/ApiChapter";
import { toast } from "react-hot-toast";

const FileUpload = ({ content, onCancel, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [addContentFile, { isLoading }] = useAddContentFileMutation();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content?.id) {
      toast.error("Data konten tidak valid");
      return;
    }

    if (files.length === 0) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("contentId", content.id);
    formData.append("title", title);

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await addContentFile(formData).unwrap();
      toast.success("File berhasil diupload");
      setTitle("");
      setFiles([]);
      onSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setFiles([]);
    onCancel();
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-light border-0">
        <h6 className="m-0 fw-bold text-primary">
          <i className="bi bi-file-earmark-plus me-2"></i>
          Upload File Materi
        </h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fileTitle" className="form-label">
              <i className="bi bi-tag me-2"></i>
              Nama File
            </label>
            <input
              type="text"
              className="form-control"
              id="fileTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Materi Fisika Dasar"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-cloud-upload me-2"></i>
              Upload File
            </label>
            <div
              className={`border-2 border-dashed rounded p-4 text-center ${
                isDragging ? "border-primary bg-light" : "border-secondary"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="d-none"
                id="fileInput"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                onChange={handleFileChange}
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <i className="bi bi-cloud-upload fs-1 text-muted mb-3"></i>
                <h6 className="mb-2">
                  {files.length > 0
                    ? `${files.length} file dipilih`
                    : "Klik atau seret file ke sini"}
                </h6>
                <p className="text-muted mb-0">
                  Format yang didukung: PDF, DOC, PPT, XLS, TXT, ZIP, RAR
                </p>
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">File yang dipilih:</h6>
              <div className="list-group">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <i className="bi bi-file-earmark me-2"></i>
                      <span className="fw-medium">{file.name}</span>
                      <small className="text-muted ms-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFile(index)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <i className="bi bi-x me-2"></i>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || files.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload File
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;
