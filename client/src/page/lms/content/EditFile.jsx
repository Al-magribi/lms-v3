import React, { useState, useEffect } from "react";
import { useUpdateFileMutation } from "../../../controller/api/lms/ApiChapter";
import { toast } from "react-hot-toast";

const EditFile = ({ file, onCancel, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [updateFile, { isLoading }] = useUpdateFileMutation();

  useEffect(() => {
    if (file) {
      setTitle(file.title || "");
    }
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Nama file tidak boleh kosong");
      return;
    }

    try {
      await updateFile({
        id: file.id,
        title: title.trim(),
      }).unwrap();

      toast.success("Nama file berhasil diperbarui");
      onSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  const handleCancel = () => {
    setTitle(file?.title || "");
    onCancel();
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-light border-0">
        <h6 className="m-0 fw-bold text-primary">
          <i className="bi bi-file-earmark-edit me-2"></i>
          Edit File
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
              placeholder="Masukkan nama file"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-file-earmark me-2"></i>
              File Saat Ini
            </label>
            <div className="alert alert-info d-flex align-items-center">
              <i className="bi bi-file-earmark me-2"></i>
              <span className="fw-medium">{file?.title}</span>
            </div>
          </div>

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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Perbarui
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFile;
