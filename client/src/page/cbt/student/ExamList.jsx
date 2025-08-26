import React, { useState } from "react";
import { useGetExamsByClassQuery } from "../../../controller/api/cbt/ApiExam";
import Modal from "./Modal";

const ExamList = ({ classid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data = {}, isLoading } = useGetExamsByClassQuery(
    { classid, page, limit, search },
    { skip: !classid }
  );
  const { exams = [], totalData, totalPages } = data;
  const [exam, setExam] = useState({});

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to first page on limit change
  };

  return (
    <div className='container-fluid py-4'>
      {/* Search and Limit Controls */}
      <div className='row mb-4'>
        <div className='col-md-6 col-lg-4 mb-3 mb-md-0'>
          <div className='input-group'>
            <span className='input-group-text bg-white border-end-0'>
              <i className='bi bi-search'></i>
            </span>
            <input
              type='text'
              className='form-control border-start-0 ps-0'
              placeholder='Cari ujian...'
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className='col-md-6 col-lg-2'>
          <select
            className='form-select'
            value={limit}
            onChange={handleLimitChange}
          >
            <option value='5'>5 per halaman</option>
            <option value='10'>10 per halaman</option>
            <option value='25'>25 per halaman</option>
            <option value='50'>50 per halaman</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className='text-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Responsive Table */}
          <div className='table-responsive'>
            <table className='table table-hover table-striped align-middle'>
              <thead className='table-light'>
                <tr>
                  <th scope='col' className='fw-bold'>
                    Nama Ujian
                  </th>
                  <th scope='col' className='fw-bold d-none d-md-table-cell'>
                    Guru
                  </th>
                  <th scope='col' className='fw-bold d-none d-lg-table-cell'>
                    Durasi
                  </th>
                  <th scope='col' className='fw-bold text-center'>
                    Status
                  </th>
                  <th scope='col' className='fw-bold text-center'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams?.length > 0 ? (
                  exams?.map((item, index) => (
                    <tr key={item.id} className='align-middle'>
                      <td>
                        <div className='d-flex flex-column'>
                          <span
                            className={`${
                              item.isactive ? "text-primary" : "text-danger"
                            }`}
                          >
                            {item.name}
                          </span>
                          {/* Show teacher and duration on mobile */}
                          <div className='d-md-none'>
                            <small className='text-muted'>
                              <i className='bi bi-person-circle me-1'></i>
                              {item.teacher_name}
                            </small>
                            <br />
                            <small className='text-muted'>
                              <i className='bi bi-clock me-1'></i>
                              {item.duration} Menit
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className='d-none d-md-table-cell'>
                        <div className='d-flex align-items-center'>
                          <i className='bi bi-person-circle me-2 text-muted'></i>
                          <span>{item.teacher_name}</span>
                        </div>
                      </td>
                      <td className='d-none d-lg-table-cell'>
                        <div className='d-flex align-items-center'>
                          <i className='bi bi-clock me-2 text-muted'></i>
                          <span>{item.duration} Menit</span>
                        </div>
                      </td>
                      <td className='text-center'>
                        {item.isactive ? (
                          <span className='badge rounded-pill bg-success px-3 py-2'>
                            <i className='bi bi-check-circle me-1'></i>
                            <span className='d-none d-sm-inline'>Aktif</span>
                          </span>
                        ) : (
                          <span className='badge rounded-pill bg-danger px-3 py-2'>
                            <i className='bi bi-x-circle me-1'></i>
                            <span className='d-none d-sm-inline'>Nonaktif</span>
                          </span>
                        )}
                      </td>
                      <td className='text-center'>
                        <button
                          className='btn btn-sm btn-primary rounded-pill'
                          data-bs-toggle='modal'
                          data-bs-target='#token'
                          disabled={!item.isactive}
                          onClick={() => setExam(item)}
                        >
                          <i className='bi bi-reception-4 me-1'></i>
                          <span className='d-none d-sm-inline'>
                            Ikuti Ujian
                          </span>
                          <span className='d-sm-none'>Mulai</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='5' className='text-center py-5'>
                      <div className='text-muted'>
                        <i className='bi bi-inbox fs-1 d-block mb-3'></i>
                        <h5>Data Belum Tersedia</h5>
                        <p className='text-muted mb-0'>
                          {search
                            ? "Tidak ada ujian yang sesuai dengan pencarian Anda"
                            : "Belum ada ujian yang tersedia saat ini"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <nav
              aria-label='Page navigation'
              className='d-flex justify-content-between align-items-center mt-4'
            >
              <div className='text-muted'>{totalData} Ujian Tersedia</div>
              <ul className='pagination pagination-sm mb-0'>
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className='page-link'
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <i className='bi bi-chevron-left'></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      page === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className='page-link'
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className='page-link'
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    <i className='bi bi-chevron-right'></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <Modal exam={exam} setExam={setExam} />
    </div>
  );
};

export default ExamList;

// Add this CSS to your stylesheet
/*
.table-responsive {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
}

.table td {
  vertical-align: middle;
  border-color: #dee2e6;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.page-link {
  border-radius: 0.5rem;
  margin: 0 0.2rem;
  padding: 0.5rem 0.75rem;
  border: none;
  color: #6c757d;
}

.page-link:hover {
  background-color: #e9ecef;
  color: #000;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  background-color: transparent;
  color: #6c757d;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
*/
