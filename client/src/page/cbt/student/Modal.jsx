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

  const examData = JSON.parse(localStorage.getItem("exam"));

  const { user } = useSelector((state) => state.auth);

  const { data: log, isLoading } = useGetUserLogQuery(
    {
      exam: exam.id,
      student: user?.id,
    },
    { skip: !exam.id || !user?.id }
  );
  const [addCbtLogs, { isLoading: logLoading }] = useAddCbtLogsMutation();

  const confirm = () => {
    // 1. Check if exam exists
    if (!exam || !exam.id) {
      toast.error("Ujian tidak ditemukan");
      return;
    }

    // 2. Check if user exists
    if (!user || !user?.id) {
      toast.error("Data pengguna tidak valid");
      return;
    }

    // 3. Check token
    if (token !== exam.token) {
      toast.error("Token Salah");
      setToken("");
      return;
    }

    // 4. Check penalty
    if (log && log.ispenalty) {
      toast.error("Anda melanggar ketentuan");
      setToken("");
      return;
    }

    // 5. Check if already active
    if (log && log.isactive) {
      toast.error("Anda sedang mengikuti ujian");
      setToken("");
      return;
    }

    // 6. Check if already done
    if (log && log.isdone) {
      toast.error("Anda sudah mengikuti ujian");
      setToken("");
      return;
    }

    const data = {
      exam: exam.id.toString(),
      student: user?.id.toString(),
    };

    toast.promise(addCbtLogs(data).unwrap(), {
      loading: "Memulai ujian...",
      success: (data) => {
        // Clear states
        setExam({});
        setToken("");
        localStorage.removeItem("exam");

        // Close modal using Bootstrap's built-in method
        const modalElement = document.getElementById("token");
        if (modalElement) {
          const closeButton = modalElement.querySelector(
            '[data-bs-dismiss="modal"]'
          );
          if (closeButton) {
            closeButton.click();
          }
        }

        // Clear any existing questions from localStorage
        localStorage.removeItem("questions");

        // Redirect to exam page
        const name = exam?.name?.replace(/\s+/g, "-") || "ujian";
        const examId = exam?.id || "";
        const examToken = exam?.token || "";
        window.location.href = `/siswa-cbt/${name}/${examId}/${examToken}`;
      },
      error: (error) => {
        return error.data?.message || "Gagal memulai ujian";
      },
    });
  };

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.addEventListener("shown.bs.modal", () => {
        // Remove aria-hidden when modal is shown
        modalRef.current.removeAttribute("aria-hidden");
        // Focus on token input when modal opens
        const tokenInput = modalRef.current.querySelector(
          'input[name="token"]'
        );
        if (tokenInput) {
          tokenInput.focus();
        }
      });

      modalRef.current.addEventListener("hidden.bs.modal", () => {
        // Add aria-hidden when modal is hidden
        modalRef.current.setAttribute("aria-hidden", "true");
        // Clear token when modal closes
        setToken("");
        setExam({});
        localStorage.removeItem("exam");
      });
    }
  }, []);

  const cancel = () => {
    setExam({});
    setToken("");
    localStorage.removeItem("exam");
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
              Token {exam?.name || "Ujian"}
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
