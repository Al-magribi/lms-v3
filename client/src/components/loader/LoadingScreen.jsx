import React from "react";

const LoadingScreen = () => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <img
        src="/logo.png"
        alt="logo"
        style={{ height: 120, width: 120, marginBottom: "2rem" }}
      />
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">Memuat aplikasi...</p>
    </div>
  );
};

export default LoadingScreen;
