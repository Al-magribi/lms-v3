import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetUserLogQuery,
  useAddCbtLogsMutation,
} from "../../../controller/api/log/ApiLog";

const Modal = ({ exam, setExam }) => {
  const [token, setToken] = useState("");
  const modalRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { data: log, isLoading } = useGetUserLogQuery(
    {
      exam: exam.id,
      student: user.user_id,
    },
    { skip: !exam.id || !user.user_id }
  );
  const [addCbtLogs, { isLoading: logLoading }] = useAddCbtLogsMutation();

  const confirm = () => {
    if (!exam.id) {
      toast.error("Ujian tidak ditemukan");
      return;
    }

    if (token !== exam.token) {
      toast.error("Token Salah");
      setToken("");
      return;
    }

    if (log && log.ispenalty) {
      toast.error("Anda melanggar ketentuan");
      setToken("");
      return;
    }

    if (log && log.isactive) {
      toast.error("Anda sedang mengikuti ujian");
      setToken("");
      return;
    }

    if (log && log.isdone) {
      toast.error("Anda sudah mengikuti ujian");
      setToken("");
      return;
    }

    const data = {
      exam: exam.id,
      student: user.user_id,
      action: "start",
      start_time: new Date().toISOString(),
    };

    toast.promise(addCbtLogs(data).unwrap(), {
      loading: "Memuat...",
      success: (data) => {
        setExam({});
        setToken("");

        // Close modal using data-bs-dismiss
        const modalElement = document.getElementById("token");
        if (modalElement) {
          const closeButton = modalElement.querySelector(
            '[data-bs-dismiss="modal"]'
          );
          if (closeButton) {
            closeButton.click();
          }
        }

        localStorage.removeItem("questions");

        const name = exam.name.replace(/\s+/g, "-");
        window.location.href = `/siswa-cbt/${name}/${exam.id}/${exam.token}`;

        return data.message || "Berhasil memulai ujian";
      },
      error: (error) => error.data?.message || "Gagal memulai ujian",
    });
  };

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.addEventListener("shown.bs.modal", () => {
        // Remove aria-hidden when modal is shown
        modalRef.current.removeAttribute("aria-hidden");
      });

      modalRef.current.addEventListener("hidden.bs.modal", () => {
        // Add aria-hidden when modal is hidden
        modalRef.current.setAttribute("aria-hidden", "true");
      });
    }
  }, []);

  const cancel = () => {
    setExam({});
    setToken("");
  };

  return (
    <div
      ref={modalRef}
      className="modal fade"
      id="token"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="token-label"
      aria-modal="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="token-label">
              Token {exam.name}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={cancel}
            ></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              name="token"
              id="token"
              className="form-control"
              placeholder="Masukkan Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              aria-label="Token input"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-danger"
              data-bs-dismiss="modal"
              onClick={cancel}
            >
              Tutup
            </button>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={confirm}
              disabled={isLoading || logLoading}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
