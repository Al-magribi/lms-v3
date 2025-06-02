import React, { useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteReportMutation,
  useGetReportQuery,
} from "../../../controller/api/tahfiz/ApiReport";
import Detail from "./Detail";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";

const TableData = ({ type }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [detail, setDetail] = useState("");
  const [id, setId] = useState("");

  const { data = {}, isLoading } = useGetReportQuery({
    page,
    limit,
    search,
    type,
  });
  const { report = [], totalData, totalPages } = data;
  const [deleteReport, { isLoading: delLoading }] = useDeleteReportMutation();

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const openModal = (data, id) => {
    setDetail(data);
    setId(id);
  };

  const deleteHandler = (userid, typeId, createdat) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data ini?"
    );
    if (confirm) {
      toast.promise(
        deleteReport({ userid, typeId, createdat })
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Menghapus data...",
          success: (message) => message,
          error: (error) => error.data.message,
        }
      );
    }
  };

  const renderMobileCard = (item) => (
    <div
      key={item.id}
      className="card mb-3 shadow-sm animate__animated animate__fadeIn"
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="card-subtitle text-muted">
            <i className="bi bi-calendar-event me-1"></i>
            {new Date(item.date).toLocaleDateString()}
          </h6>
          <span className="badge bg-primary rounded-pill px-3">
            <i className="bi bi-star-fill me-1"></i>
            {item.totalPoints}
          </span>
        </div>

        <h5 className="card-title d-flex align-items-center">
          <i className="bi bi-person-circle me-2"></i>
          {item.name}
          <small className="text-muted ms-2">({item.nis})</small>
        </h5>

        <div className="mt-3">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-mortarboard-fill text-secondary me-2"></i>
            <span>{item.class}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-journal-text text-secondary me-2"></i>
            <span>{item.type}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-book-fill text-secondary me-2"></i>
            <span>{item.examiner}</span>
          </div>
        </div>

        <div className="d-grid gap-2 d-flex mt-3">
          <button
            className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
            onClick={() => openModal(item, item.id)}
          >
            <i className="bi bi-eye-fill"></i>
            <span>Detail</span>
          </button>
          <button
            className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center gap-2"
            onClick={() =>
              deleteHandler(
                item.userid,
                item.type_id,
                new Date(item.date).toLocaleDateString()
              )
            }
          >
            <i className="bi bi-trash"></i>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesktopTable = () => (
    <Table
      isLoading={isLoading}
      totalData={totalData}
      totalPages={totalPages}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}
    >
      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th className="align-middle text-center">No</th>
            <th className="align-middle text-center">Tanggal</th>
            <th className="align-middle text-center">NIS</th>
            <th className="align-middle text-center">Nama Siswa</th>
            <th className="align-middle text-center">Tingkat</th>
            <th className="align-middle text-center">Kelas</th>
            <th className="align-middle text-center">Jenis Penilaian</th>
            <th className="align-middle text-center">Nilai</th>
            <th className="align-middle text-center">Penguji</th>
            <th className="align-middle text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {report?.map((item, index) => (
            <tr key={index}>
              <td className="text-center align-middle">{index + 1}</td>
              <td className="text-center align-middle">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="text-center align-middle">{item.nis}</td>
              <td className="text-start align-middle">{item.name}</td>
              <td className="text-center align-middle">{item.grade}</td>
              <td className="text-center align-middle">{item.class}</td>
              <td className="text-center align-middle">{item.type}</td>
              <td className="text-center align-middle">{item.totalPoints}</td>
              <td className="text-center align-middle">{item.examiner}</td>
              <td className="align-middle">
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openModal(item, item.id)}
                    title="Lihat Detail"
                  >
                    <i className="bi bi-eye-fill"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      deleteHandler(
                        item.userid,
                        item.type_id,
                        new Date(item.date).toLocaleDateString()
                      )
                    }
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {report?.map((data, index) => (
        <Detail
          key={index}
          detail={data.id === id ? detail : null}
          setDetail={setDetail}
          id={data.id}
        />
      ))}
    </Table>
  );

  return (
    <div className="container-fluid">
      {isMobile ? (
        <div className="px-2">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : report?.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox-fill fs-1"></i>
              <p className="mt-2">Belum ada data</p>
            </div>
          ) : (
            report?.map(renderMobileCard)
          )}
        </div>
      ) : (
        renderDesktopTable()
      )}
    </div>
  );
};

export default TableData;
