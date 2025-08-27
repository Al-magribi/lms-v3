import React, { useState, useEffect } from "react";
import { useAddContentMutation } from "../../../controller/api/lms/ApiChapter";
import { toast } from "react-hot-toast";

const ModalAddContent = ({
  chapter,
  modalId = "content",
  selectedContent = null,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [addContent] = useAddContentMutation();

  // Reset form when selectedContent changes
  useEffect(() => {
    if (selectedContent) {
      setTitle(selectedContent.content_title || "");
      setContent(selectedContent.content_target || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [selectedContent]);

  // Reset form when modal is hidden
  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (modal) {
      const handleHidden = () => {
        setTitle("");
        setContent("");
        // Remove modal-open class from body if no other modals are open
        const activeModals = document.querySelectorAll(".modal.show");
        if (activeModals.length === 0) {
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "unset";
        }
      };
      modal.addEventListener("hidden.bs.modal", handleHidden);
      return () => {
        modal.removeEventListener("hidden.bs.modal", handleHidden);
      };
    }
  }, [modalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saveContent = async () => {
      const contentResult = await addContent({
        chapterid: chapter.chapter_id,
        contentid: selectedContent?.content_id,
        title,
        content,
      }).unwrap();

      // Close modal first
      const modal = document.getElementById(modalId);
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      return contentResult.message;
    };

    toast.promise(saveContent(), {
      loading: selectedContent
        ? "Memperbarui materi..."
        : "Menyimpan materi...",
      success: (message) => message,
      error: (err) => err.data?.message || "Terjadi kesalahan",
    });
  };

  const handleClose = () => {
    const modal = document.getElementById(modalId);
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  };

  return (
    <div
      className="modal fade"
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id={`${modalId}Label`}>
              {selectedContent ? "Edit" : "Tambah"} Materi{" "}
              <span>{chapter.chapter_name}</span>
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body d-flex flex-column gap-2">
              <input
                type="text"
                name="title"
                id={`${modalId}-title`}
                className="form-control"
                placeholder="Judul Materi"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Leave a comment here"
                  id={`${modalId}-textarea`}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ minHeight: "120px" }}
                ></textarea>
                <label
                  htmlFor={`${modalId}-textarea`}
                  className="text-secondary"
                >
                  Capaian
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={handleClose}
              >
                Tutup
              </button>
              <button type="submit" className="btn btn-success">
                {selectedContent ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAddContent;
