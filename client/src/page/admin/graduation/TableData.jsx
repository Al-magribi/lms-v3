import React, { useState } from "react";
import Table from "../../../components/table/Table";
import { useGetGraduationQuery } from "../../../controller/api/admin/ApiGraduation";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetGraduationQuery({ page, limit, search });
  const { result, totalData, totalPages } = data || {};

  return (
    <Table
      isLoading={isLoading}
      totalData={totalData}
      totalPages={totalPages}
      page={page}
      limit={limit}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
    >
      <div className="row g-3">
        {result?.length > 0 ? (
          result.map((item, index) => {
            // Ambil inisial nama
            const initials = item.student_name
              ? item.student_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";
            return (
              <div className="col-12 col-md-4" key={item.id}>
                <div
                  className="rounded d-flex flex-column justify-content-between h-100 p-4 shadow-sm hover-shadow"
                  style={{
                    border: "1px solid #f3f3f3",
                    minHeight: 180,
                    boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div
                      className="avatar flex-shrink-0 d-flex align-items-center justify-content-center bg-gradient-primary text-primary fw-bold rounded-circle shadow-sm"
                      style={{
                        width: 56,
                        height: 56,
                        fontSize: 22,
                        background:
                          "linear-gradient(135deg, #e3f0ff 0%, #f8fbff 100%)",
                        border: "2px solid #d0e3ff",
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex-grow-1">
                      <div
                        className="fw-bold fs-5 text-dark mb-1"
                        style={{ letterSpacing: 0.5 }}
                      >
                        {item.student_name}
                      </div>
                      <div className="small text-muted mb-1">
                        NIS:{" "}
                        <span className="badge bg-light text-primary border border-primary bg-opacity-10">
                          {item.nis}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <div className="small text-secondary">
                          <i className="bi bi-building me-1"></i>
                          {item.agency}
                        </div>

                        <div className="vr"></div>

                        <div className="small text-secondary">
                          <i className="bi bi-building me-1"></i>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-auto pt-2">
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm px-3"
                      title="Edit"
                      style={{ borderRadius: "8px", fontWeight: 500 }}
                      onClick={() => setDetail(item)}
                      data-bs-toggle="modal"
                      data-bs-target="#addgraduation"
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 shadow-sm px-3"
                      title="Hapus"
                      style={{ borderRadius: "8px", fontWeight: 500 }}
                    >
                      <i className="bi bi-trash"></i>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted">
            <p className="bg-danger bg-opacity-10 p-3 rounded text-danger m-0">
              Tidak ada data lulusan.
            </p>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableData;
