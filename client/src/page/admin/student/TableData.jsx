import React, { useEffect, useState } from "react";
import {
  useChangePeriodeMutation,
  useChangeStatusMutation,
  useDeleteStudentMutation,
  useGetStudentsQuery,
  useDownloadStudentMutation,
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

  console.log(rawData);

  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();
  const [changeStatus] = useChangeStatusMutation();
  const [changePeriode, { isLoading: isChanging }] = useChangePeriodeMutation();
  const [downloadStudent, { isLoading: isDownloading }] =
    useDownloadStudentMutation();

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

  const handleDownload = () => {
    toast.promise(
      downloadStudent()
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Mengunduh data siswa...",
        success: (message) => message,
        error: (err) => err.data?.message || "Gagal mengunduh file",
      }
    );
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
      downloadButton={{
        onClick: handleDownload,
        isLoading: isDownloading,
      }}
    >
      <div className='row g-4'>
        {students.length > 0 ? (
          students.map((student, i) => (
            <div key={i} className='col-12 col-md-6 col-lg-4 col-xl-3'>
              <div className='card border shadow-sm hover-shadow h-100 p-0 overflow-hidden position-relative rounded-4'>
                <div className='card-body p-4 d-flex flex-column h-100'>
                  <div className='d-flex align-items-start justify-content-between mb-2'>
                    <div>
                      <h5
                        className='text-primary mb-1'
                        style={{ fontSize: 20 }}
                      >
                        {student.name}
                      </h5>

                      <span className='badge bg-secondary mb-2'>
                        NIS: {student.nis}
                      </span>

                      <span
                        className={`badge ms-2 ${
                          student.isactive
                            ? "bg-success bg-opacity-10 text-success"
                            : "bg-danger bg-opacity-10 text-danger"
                        } pointer`}
                        style={{ cursor: "pointer" }}
                        onClick={() => changeHandler(student.id)}
                      >
                        {student.isactive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className='dropdown'>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        type='button'
                        id={`dropdownMenuButton${student.id}`}
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </button>
                      <ul
                        className='dropdown-menu dropdown-menu-end shadow'
                        aria-labelledby={`dropdownMenuButton${student.id}`}
                      >
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2'
                            data-bs-target='#addstudent'
                            data-bs-toggle='modal'
                            onClick={() => setDetail(student)}
                          >
                            <i className='bi bi-pencil-square'></i> Edit
                          </button>
                        </li>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2 text-danger'
                            disabled={isLoading}
                            onClick={() => deleteHandler(student.id)}
                          >
                            <i className='bi bi-person-x-fill'></i> Hapus
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className='d-flex flex-column gap-2'>
                    <div className='d-flex align-items-center gap-2'>
                      <i className='bi bi-calendar-event text-primary'></i>
                      <span className='small'>
                        Tahun Ajaran: <b>{student.periode_name}</b>
                      </span>
                    </div>
                    <div className='d-flex align-items-center gap-2'>
                      <i className='bi bi-calendar-plus text-primary'></i>
                      <span className='small'>
                        Tahun Masuk: <b>{student.entry}</b>
                      </span>
                    </div>

                    <div className='d-flex align-items-center gap-2'>
                      <i className='bi bi-building text-primary'></i>
                      <span className='small'>
                        Satuan: <b>{student.homebase}</b>
                      </span>
                    </div>
                    <div className='d-flex align-items-center gap-2'>
                      <i className='bi bi-mortarboard-fill text-primary'></i>
                      <span className='small'>
                        Kelas: <b>{student.classname}</b>
                      </span>
                    </div>

                    <div className='d-flex align-items-center gap-2 mb-1'>
                      <i
                        className={`bi ${
                          student.gender === "L"
                            ? "bi-gender-male"
                            : "bi-gender-female"
                        } text-primary`}
                      ></i>
                      <span className='small'>
                        Gender:{" "}
                        <b>
                          {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </b>
                      </span>
                    </div>
                  </div>

                  <p className='m-0 text-muted small text-end'>
                    #{(page - 1) * limit + i + 1}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='col-12'>
            <div className='d-flex flex-column align-items-center justify-content-center py-5 text-muted gap-2'>
              <i className='bi bi-inbox fs-1'></i>
              <span className='fs-5'>Data tidak tersedia</span>
            </div>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableData;
