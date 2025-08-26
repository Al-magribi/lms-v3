import { useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteBankMutation,
  useGetBankQuery,
} from "../../../controller/api/cbt/ApiBank";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const TableBank = ({ setDetail }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetBankQuery({
    page,
    limit,
    search,
  });
  const { banks = [], totalData, totalPages } = rawData;
  const [deleteBank, { isLoading }] = useDeleteBankMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus bank soal ini dan semua data yang terkait dengan bank soal ini?"
    );
    if (confirm) {
      toast.promise(
        deleteBank(id)
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Memproses...",
          success: (message) => message,
          error: (err) => err.data.message,
        }
      );
    }
  };

  const goToLink = (subject, name, id) => {
    const nameFormat = name.replace(/[\s/]/g, "-");
    const subjectFormat = subject.replace(/[\s/]/g, "-");
    navigate(`/admin-cbt-bank/${subjectFormat}/${nameFormat}/${id}`);
  };

  return (
    <div style={{ overflow: "visible", position: "relative" }}>
      <Table
        page={page}
        setPage={setPage}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}
        isLoading={dataLoading}
      >
        <div
          className='table-responsive'
          style={{ overflow: "visible", position: "relative" }}
        >
          <table
            className='table table-hover align-middle'
            style={{ position: "relative", overflow: "visible" }}
          >
            <thead className='table-light'>
              <tr>
                <th
                  scope='col'
                  className='text-center'
                  style={{ width: "60px" }}
                >
                  #
                </th>
                <th scope='col'>Nama Bank Soal</th>
                <th scope='col'>Guru</th>
                <th scope='col'>Mata Pelajaran</th>
                <th scope='col'>Jenis</th>
                <th scope='col' className='text-center'>
                  Jumlah Soal
                </th>
                <th
                  scope='col'
                  className='text-center'
                  style={{ width: "120px" }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody style={{ position: "relative", overflow: "visible" }}>
              {banks?.length > 0 ? (
                banks?.map((item, i) => (
                  <tr
                    key={i}
                    className='align-middle'
                    style={{ position: "relative", overflow: "visible" }}
                  >
                    <td className='text-center'>
                      <span className='badge bg-primary rounded-pill'>
                        {(page - 1) * limit + i + 1}
                      </span>
                    </td>
                    <td>
                      <div className='d-flex align-items-center gap-2'>
                        <div
                          className='bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center'
                          style={{ width: 40, height: 40 }}
                        >
                          <i className='bi bi-folder-fill text-primary'></i>
                        </div>
                        <div>
                          <div
                            className='fw-semibold text-primary'
                            title={item.name}
                          >
                            {item.name.length > 25
                              ? `${item.name.slice(0, 25)}...`
                              : item.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className='text-muted' title={item.teacher_name}>
                        {item.teacher_name.length > 20
                          ? `${item.teacher_name.slice(0, 20)}...`
                          : item.teacher_name}
                      </span>
                    </td>
                    <td>
                      <span className='badge bg-secondary bg-opacity-75'>
                        {item.subject_name}
                      </span>
                    </td>
                    <td>
                      <span className='badge bg-success'>
                        {item.btype.toUpperCase()}
                      </span>
                    </td>
                    <td className='text-center'>
                      <span className='badge bg-info'>
                        {item.question_count} Soal
                      </span>
                    </td>
                    <td
                      className='text-center'
                      style={{ position: "relative", overflow: "visible" }}
                    >
                      <div
                        className='dropdown'
                        style={{ position: "relative" }}
                      >
                        <button
                          className='btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center gap-1'
                          type='button'
                          data-bs-toggle='dropdown'
                          aria-expanded='false'
                          style={{
                            minWidth: "120px",
                            justifyContent: "space-between",
                            fontSize: "0.875rem",
                            padding: "0.375rem 0.75rem",
                            border: "1px solid #0d6efd",
                            borderRadius: "0.375rem",
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <span>Pilihan Aksi</span>
                          <i
                            className='bi bi-chevron-down'
                            style={{ fontSize: "0.75rem" }}
                          ></i>
                        </button>
                        <ul
                          className='dropdown-menu dropdown-menu-end shadow-lg border-0'
                          style={{
                            minWidth: "200px",
                            padding: "0.5rem 0",
                            borderRadius: "0.5rem",
                            border: "1px solid rgba(0,0,0,0.1)",
                            backgroundColor: "#fff",
                            zIndex: 99999,
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "0.25rem",
                            boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                            transform: "translateY(0)",
                            opacity: 1,
                            visibility: "visible",
                            maxHeight: "none",
                            overflow: "visible",
                            pointerEvents: "auto",
                          }}
                        >
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center py-2 px-3'
                              onClick={() =>
                                goToLink(item.subject_name, item.name, item.id)
                              }
                              style={{
                                fontSize: "0.875rem",
                                color: "#495057",
                                transition: "all 0.15s ease-in-out",
                                border: "none",
                                backgroundColor: "transparent",
                                width: "100%",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.color = "#0d6efd";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#495057";
                              }}
                            >
                              <i
                                className='bi bi-eye me-3'
                                style={{ fontSize: "1rem", color: "#0d6efd" }}
                              ></i>
                              <span>Lihat</span>
                            </button>
                          </li>
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center py-2 px-3'
                              onClick={() => setDetail(item)}
                              data-bs-toggle='modal'
                              data-bs-target='#addbank'
                              style={{
                                fontSize: "0.875rem",
                                color: "#495057",
                                transition: "all 0.15s ease-in-out",
                                border: "none",
                                backgroundColor: "transparent",
                                width: "100%",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.color = "#0d6efd";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#495057";
                              }}
                            >
                              <i
                                className='bi bi-pencil me-3'
                                style={{ fontSize: "1rem", color: "#ffc107" }}
                              ></i>
                              <span>Edit</span>
                            </button>
                          </li>
                          <li>
                            <hr
                              className='dropdown-divider my-2'
                              style={{
                                borderColor: "#e9ecef",
                                margin: "0.5rem 0",
                              }}
                            />
                          </li>
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center py-2 px-3'
                              disabled={isLoading}
                              onClick={() => deleteHandler(item.id)}
                              style={{
                                fontSize: "0.875rem",
                                color: "#dc3545",
                                transition: "all 0.15s ease-in-out",
                                border: "none",
                                backgroundColor: "transparent",
                                width: "100%",
                                textAlign: "left",
                                opacity: isLoading ? 0.6 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (!isLoading) {
                                  e.target.style.backgroundColor = "#fff5f5";
                                  e.target.style.color = "#dc3545";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isLoading) {
                                  e.target.style.backgroundColor =
                                    "transparent";
                                  e.target.style.color = "#dc3545";
                                }
                              }}
                            >
                              <i
                                className='bi bi-trash me-3'
                                style={{ fontSize: "1rem" }}
                              ></i>
                              <span>
                                {isLoading ? "Memproses..." : "Hapus"}
                              </span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='7' className='text-center py-4'>
                    <div className='text-muted'>
                      <i className='bi bi-inbox fs-1 d-block mb-2'></i>
                      Data belum tersedia
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Table>
    </div>
  );
};

export default TableBank;
