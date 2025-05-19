import React, { useEffect, useState } from "react";
import {
  useChangePeriodeMutation,
  useChangeStatusMutation,
  useDeleteStudentMutation,
  useGetStudentsQuery,
} from "../../../controller/api/admin/ApiStudent";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { useGetPeriodeQuery } from "../../../controller/api/database/ApiDatabase";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("");

  const {
    data: rawData = {},
    isLoading: dataLoading,
    refetch,
  } = useGetStudentsQuery({
    page,
    limit,
    search,
  });
  const { students = [], totalData, totalPages } = rawData;
  const { data: periodes } = useGetPeriodeQuery();

  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();
  const [changeStatus] = useChangeStatusMutation();
  const [changePeriode, { isLoading: isChanging }] = useChangePeriodeMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus siswa ini dan semua data yang terkait dengan siswa ini?"
    );
    if (confirm) {
      toast.promise(
        deleteStudent(id)
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

  const changeHandler = (id) => {
    toast.promise(
      changeStatus(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const updatePeriode = (e) => {
    const periodeId = e.target.value;
    setSelectedPeriode(periodeId);
  };

  const handleSavePeriode = async () => {
    if (!selectedPeriode) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }
    try {
      const updatePromises = students.map((student) =>
        changePeriode({ userid: student.id, periodeid: selectedPeriode })
      );
      await Promise.all(updatePromises);
      toast.success("Berhasil mengganti tahun ajaran");
      setSelectedPeriode("");
      refetch();
    } catch (err) {
      console.error("Error updating periods:", err);
      toast.error("Gagal mengganti tahun ajaran");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
    }
    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={dataLoading}
    >
      <div className="row g-4">
        {students.length > 0 ? (
          students.map((student, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm hover-shadow h-100 p-0 overflow-hidden position-relative">
                <div className="card-body p-4 d-flex flex-column h-100">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <h5
                        className="text-primary mb-1"
                        style={{ fontSize: 20 }}
                      >
                        {student.name}
                      </h5>
                      <span className="badge bg-secondary mb-2">
                        NIS: {student.nis}
                      </span>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-light border dropdown-toggle"
                        type="button"
                        id={`dropdownMenuButton${student.id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby={`dropdownMenuButton${student.id}`}
                      >
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() => setDetail(student)}
                          >
                            <i className="bi bi-pencil-square"></i> Edit
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2 text-danger"
                            disabled={isLoading}
                            onClick={() => deleteHandler(student.id)}
                          >
                            <i className="bi bi-person-x-fill"></i> Hapus
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-calendar-event text-primary"></i>
                      <span className="small">
                        Tahun Ajaran: <b>{student.periode_name}</b>
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-calendar-plus text-primary"></i>
                      <span className="small">
                        Tahun Masuk: <b>{student.entry}</b>
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-building text-primary"></i>
                      <span className="small">
                        Satuan: <b>{student.homebase}</b>
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-gender-ambiguous text-primary"></i>
                      <span className="small">
                        Gender: <b>{student.gender}</b>
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-auto">
                    <span
                      className={`badge ${
                        student.isactive ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {student.isactive ? "Aktif" : "Nonaktif"}
                    </span>
                    <div className="form-check form-switch ms-2">
                      <input
                        className="form-check-input pointer"
                        type="checkbox"
                        role="switch"
                        id={`flexSwitchCheckChecked${student.id}`}
                        checked={student.isactive}
                        onChange={() => changeHandler(student.id)}
                      />
                    </div>
                  </div>
                </div>
                <span
                  className="position-absolute top-0 end-0 badge bg-primary rounded-pill m-2"
                  style={{ fontSize: 13 }}
                >
                  #{(page - 1) * limit + i + 1}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info d-flex align-items-center gap-2 mb-0">
              <i className="bi bi-info-circle-fill"></i>
              <span>Data tidak tersedia</span>
            </div>
          </div>
        )}
      </div>
      {/* Footer untuk ganti tahun ajaran */}
      {/* <div className="d-flex align-items-center justify-content-end gap-2 mt-4">
        <select
          style={{ width: "20%" }}
          className="form-select"
          value={selectedPeriode}
          onChange={updatePeriode}
        >
          <option value="" hidden>
            Ganti Tahun Ajaran
          </option>
          {periodes?.map((periode) => (
            <option key={periode.id} value={periode.id}>
              {periode.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-sm btn-success"
          onClick={handleSavePeriode}
          disabled={isChanging || !selectedPeriode}
        >
          <i className="bi bi-save"></i>
          <span className="ms-2">{isChanging ? "Menyimpan..." : "Simpan"}</span>
        </button>
      </div> */}
    </Table>
  );
};

export default TableData;
