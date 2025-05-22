import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetSubjectsOnClassQuery } from "../../../controller/api/lms/ApiLms";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ListSubjects = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Use debounced search term for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useGetSubjectsOnClassQuery(
    { classid: user?.class_id, search: debouncedSearchTerm },
    { skip: !user?.class_id }
  );

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-between align-items-center mb-4">
        <div className="col-lg-6">
          <h4 className="mb-3 text-primary fw-bold">Daftar Mata Pelajaran</h4>
          <div className="input-group input-group-lg shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-primary"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Cari mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat data mata pelajaran...</p>
        </div>
      ) : data?.length > 0 ? (
        <motion.div
          className="row g-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {data.map((item) => (
            <motion.div
              key={item.id}
              className="col-xl-3 col-lg-4 col-md-6"
              variants={item}
            >
              <div
                className="card h-100 shadow-sm border-0 hover-card rounded-3 overflow-hidden"
                onClick={() => goToLink(item.name, item.id)}
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              >
                <div className="position-relative">
                  <img
                    src={
                      item.cover
                        ? `${window.location.origin}${item.cover}`
                        : `/logo.png`
                    }
                    alt={item.name}
                    className="card-img-top"
                    style={{
                      height: "250px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="position-absolute top-0 end-0 p-3">
                    <span className="badge bg-primary rounded-pill">
                      <i className="bi bi-book-fill me-1"></i>
                      Mata Pelajaran
                    </span>
                  </div>
                </div>
                <div className="card-body p-4">
                  <h5 className="card-title mb-3 fw-bold text-primary">
                    {item.name}
                  </h5>
                  <div className="d-flex align-items-center text-muted mb-3">
                    <i className="bi bi-mortarboard-fill me-2"></i>
                    <span className="small">
                      Mata Pelajaran Kelas {user?.class_id}
                    </span>
                  </div>
                  <button
                    className="btn btn-primary w-100 rounded-pill py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToLink(item.name, item.id);
                    }}
                  >
                    <i className="bi bi-arrow-right-circle-fill me-2"></i>
                    Masuk Pelajaran
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row justify-content-center"
        >
          <div className="col-md-6 text-center">
            <div className="py-5">
              <div
                className="bg-light rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{ width: "100px", height: "100px" }}
              >
                <i className="bi bi-journal-x display-4 text-primary"></i>
              </div>
              <h4 className="fw-bold mb-3">
                {searchTerm
                  ? "Mata Pelajaran Tidak Ditemukan"
                  : "Data Belum Tersedia"}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm
                  ? "Maaf, tidak ada mata pelajaran yang sesuai dengan pencarian Anda"
                  : "Belum ada mata pelajaran yang tersedia saat ini"}
              </p>
              {isError && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <small>{error?.message}</small>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ListSubjects;
