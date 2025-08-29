import React from "react";
import { formatTime } from "../../../../utils/formatTime";

const Header = ({ name, user, examid, timeLeft, isExamStarted }) => {
  const getTimerDisplay = () => {
    if (!isExamStarted) {
      return (
        <div className="d-flex flex-column align-items-center">
          <small className="text-white-50">Status</small>
          <div className="h6 m-0 text-warning">Memulai Ujian...</div>
        </div>
      );
    }

    if (timeLeft === null || timeLeft === undefined) {
      return (
        <div className="d-flex flex-column align-items-center">
          <small className="text-white-50">Status</small>
          <div className="h6 m-0 text-warning">Memuat Timer...</div>
        </div>
      );
    }

    if (timeLeft <= 0) {
      return (
        <div className="d-flex flex-column align-items-center">
          <small className="text-white-50">Status</small>
          <div className="h6 m-0 text-danger">Waktu Habis</div>
        </div>
      );
    }

    // Show countdown timer
    return (
      <div className="d-flex flex-column align-items-center">
        <small className="text-white-50">Waktu Tersisa</small>
        <div
          className={`h3 m-0 fw-bold ${
            timeLeft <= 300
              ? "text-danger"
              : timeLeft <= 600
              ? "text-warning"
              : "text-light"
          }`}
        >
          {formatTime(timeLeft)}
        </div>
        {timeLeft <= 300 && (
          <small className="text-danger fw-bold">⚠️ Waktu Hampir Habis!</small>
        )}
      </div>
    );
  };

  return (
    <div className="container-fluid bg-primary text-white">
      <div className="container p-2">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-0">{name.replace(/-/g, " ")}</h4>
            <small>
              Nama: {user.name} | Kelas: {user.class}
            </small>
          </div>
          <div className="d-flex align-items-center gap-3">
            {getTimerDisplay()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
