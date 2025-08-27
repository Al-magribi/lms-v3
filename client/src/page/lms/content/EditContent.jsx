import React, { useState, useEffect } from "react";
import { useAddContentMutation } from "../../../controller/api/lms/ApiChapter";
import { toast } from "react-hot-toast";

const EditContent = ({ content, chapterId, onCancel, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [addContent, { isLoading }] = useAddContentMutation();

  useEffect(() => {
    if (content) {
      setTitle(content.content_title || "");
      setContentText(content.content_target || "");
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addContent({
        chapterid: chapterId,
        contentid: content?.content_id,
        title,
        content: contentText,
      }).unwrap();

      toast.success(
        content?.content_id
          ? "Materi berhasil diperbarui"
          : "Materi berhasil disimpan"
      );
      onSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  const handleCancel = () => {
    setTitle(content?.content_title || "");
    setContentText(content?.content_target || "");
    onCancel();
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-light border-0">
        <h6 className="m-0 fw-bold text-primary">
          <i className="bi bi-pencil-square me-2"></i>
          {content?.content_id ? "Edit Materi" : "Tambah Materi"}
        </h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              <i className="bi bi-tag me-2"></i>
              Judul Materi
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul materi"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="content" className="form-label">
              <i className="bi bi-file-text me-2"></i>
              Capaian Pembelajaran
            </label>
            <textarea
              className="form-control"
              id="content"
              rows="4"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Masukkan capaian pembelajaran"
              required
            ></textarea>
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
                  {content?.content_id ? "Perbarui" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContent;
