import React, { useState, useEffect } from "react";
import { useAddContentFileMutation } from "../../../controller/api/lms/ApiChapter";
import toast from "react-hot-toast";
import "./Modal.css";

const Modal = ({ title, content, onClose, modalId, isOpen }) => {
  const [formData, setFormData] = useState({
    title: "",
    files: [],
    video: "",
  });

  const [uploadState, setUploadState] = useState({
    hasFiles: false,
    hasError: false,
    isDragging: false,
  });

  const [addContentFile, { isLoading }] = useAddContentFileMutation();

  const isFileModal = title?.includes("File:");
  const isYoutubeModal = title?.includes("Youtube URL:");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        [name]: fileArray,
      }));

      setUploadState((prev) => ({
        ...prev,
        hasFiles: fileArray.length > 0,
        hasError: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, isDragging: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: Array.from(files),
      }));

      setUploadState((prev) => ({
        ...prev,
        hasFiles: true,
        hasError: false,
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, isDragging: false }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      files: [],
      video: "",
    });
    setUploadState({
      hasFiles: false,
      hasError: false,
      isDragging: false,
    });
  };

  useEffect(() => {
    if (content && isOpen) {
      resetForm();
    }
  }, [content, isOpen]);

  // Manage body scroll and class
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";

      // Ensure this modal is on top
      const modalElement = document.querySelector(".modal-overlay");
      if (modalElement) {
        modalElement.style.zIndex = "10001";
      }
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content?.id) {
      toast.error("Data konten tidak valid");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("contentId", content.id);
    formDataToSend.append("title", formData.title);

    if (isFileModal && formData.files.length > 0) {
      formData.files.forEach((file) => {
        formDataToSend.append("files", file);
      });
    } else if (isYoutubeModal && formData.video) {
      formDataToSend.append("video", formData.video);
    } else {
      toast.error("Harap isi semua data yang diperlukan");
      return;
    }

    try {
      const result = await addContentFile(formDataToSend).unwrap();
      toast.success(result.message);
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.data?.message || "Terjadi kesalahan");
      setUploadState((prev) => ({ ...prev, hasError: true }));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              {isFileModal ? (
                <i className="bi bi-file-earmark-plus"></i>
              ) : (
                <i className="bi bi-youtube"></i>
              )}
            </div>
            <div className="modal-title-content">
              <h5 className="modal-title">{title}</h5>
              <p className="modal-subtitle">
                {isFileModal
                  ? "Upload file materi pembelajaran"
                  : "Tambah video pembelajaran dari YouTube"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* File Name Input */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-tag me-2"></i>
                {isFileModal ? "Nama File" : "Nama Video"}
              </label>
              <input
                type="text"
                className="form-input"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={
                  isFileModal
                    ? "Contoh: Materi Fisika Dasar"
                    : "Contoh: Pengenalan Fisika"
                }
                required
              />
            </div>

            {/* File Upload Section */}
            {isFileModal && (
              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload File
                </label>

                <div
                  className={`file-upload-container ${
                    uploadState.hasFiles ? "has-files" : ""
                  } ${uploadState.hasError ? "has-error" : ""} ${
                    uploadState.isDragging ? "is-dragging" : ""
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    className="file-input"
                    name="files"
                    onChange={handleChange}
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                    required
                  />

                  <div className="upload-content">
                    <div className="upload-icon-wrapper">
                      <i
                        className={`bi ${
                          uploadState.hasFiles
                            ? "bi-check-circle-fill success-icon"
                            : uploadState.hasError
                            ? "bi-exclamation-triangle-fill error-icon"
                            : "bi-cloud-upload"
                        }`}
                      ></i>
                    </div>

                    <div className="upload-text-content">
                      <h6 className="upload-title">
                        {uploadState.hasFiles
                          ? `${formData.files.length} file dipilih`
                          : uploadState.hasError
                          ? "Terjadi kesalahan"
                          : "Klik atau seret file ke sini"}
                      </h6>
                      <p className="upload-description">
                        Format yang didukung: PDF, DOC, PPT, XLS, TXT, ZIP, RAR
                      </p>
                    </div>
                  </div>

                  {/* File List */}
                  {formData.files.length > 0 && (
                    <div className="file-list">
                      {formData.files.map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-info">
                            <i className="bi bi-file-earmark me-2"></i>
                            <span className="file-name">{file.name}</span>
                          </div>
                          <span className="file-size">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* YouTube URL Section */}
            {isYoutubeModal && (
              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-link-45deg me-2"></i>
                  URL Video YouTube
                </label>
                <div className="youtube-input-group">
                  <div className="youtube-icon">
                    <i className="bi bi-youtube"></i>
                  </div>
                  <input
                    type="url"
                    className="form-input youtube-input"
                    name="video"
                    value={formData.video}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    pattern="https?://.*"
                    required
                  />
                </div>
                <div className="form-hint">
                  <i className="bi bi-info-circle me-1"></i>
                  Masukkan URL lengkap video YouTube
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
            >
              <i className="bi bi-x me-2"></i>
              Batal
            </button>
            <button type="submit" className="btn btn-save" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner me-2"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
