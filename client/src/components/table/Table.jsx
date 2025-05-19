import { useState, useEffect } from "react";
import * as Md from "react-icons/md";
import TableLoader from "../loader/TableLoader";

const Table = ({
  children,
  height,
  id,
  totalData,
  page,
  setPage,
  totalPages,
  limit,
  setLimit,
  setSearch,
  isLoading,
}) => {
  const [limitValue, setLimitValue] = useState(limit || 10);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  // Update limitValue when limit prop changes
  useEffect(() => {
    setLimitValue(limit || 10);
  }, [limit]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleLimit = (e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setLimitValue(newLimit);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout to delay API call
    const timeout = setTimeout(() => {
      setSearch(value);
      setPage(1); // Reset to first page when searching
    }, 500);

    setSearchTimeout(timeout);
  };

  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 3) {
      pages = [...Array(totalPages).keys()].map((i) => i + 1);
    } else {
      if (page === 1) {
        pages = [1, 2, 3];
      } else if (page === totalPages) {
        pages = [totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [page - 1, page, page + 1];
      }
    }

    return pages;
  };
  return (
    <div className="rounded-lg  no-overflow-x">
      <div style={{ height: height }} className="d-flex flex-column gap-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="position-relative">
            <input
              className="form-control ps-4"
              name="search"
              id="search"
              placeholder="Cari data..."
              style={{ width: 280, borderRadius: "8px" }}
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>

          <div className="d-flex gap-3">
            <select
              style={{ width: 120, borderRadius: "8px" }}
              name="limit"
              id="limit"
              className="form-select"
              value={limitValue || ""}
              onChange={handleLimit}
            >
              <option value="10">10 per halaman</option>
              <option value="20">20 per halaman</option>
              <option value="50">50 per halaman</option>
              <option value="100">100 per halaman</option>
              <option value="200">200 per halaman</option>
              <option value="500">500 per halaman</option>
              <option value="1000">1000 per halaman</option>
            </select>

            {id && (
              <button
                data-bs-toggle="modal"
                data-bs-target={`#${id}`}
                className="btn btn-primary d-flex align-items-center gap-2"
                style={{ borderRadius: "8px" }}
              >
                <Md.MdAdd size={20} />
                Tambah Data
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg">
          {isLoading ? <TableLoader /> : children}
        </div>

        {/* Pagination and Info */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <nav aria-label="Page navigation example" className="m-0">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link border-0"
                  aria-label="Previous"
                  onClick={() => handlePageChange(page - 1)}
                  style={{ borderRadius: "6px", margin: "0 2px" }}
                >
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              {getPageNumbers().map((pageNumber) => (
                <li
                  key={pageNumber}
                  className={`page-items ${
                    page === pageNumber ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link border-0"
                    onClick={() => handlePageChange(pageNumber)}
                    style={{
                      borderRadius: "6px",
                      margin: "0 2px",
                      backgroundColor:
                        page === pageNumber ? "#0d6efd" : "transparent",
                      color: page === pageNumber ? "white" : "inherit",
                    }}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link border-0"
                  aria-label="Next"
                  onClick={() => handlePageChange(page + 1)}
                  style={{ borderRadius: "6px", margin: "0 2px" }}
                >
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Total Data:</span>
            <span className="fw-semibold">
              {parseFloat(totalData).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
