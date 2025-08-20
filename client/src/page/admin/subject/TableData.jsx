import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteSubjectMutation,
  useGetSubjectQuery,
} from "../../../controller/api/admin/ApiSubject";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetAppQuery } from "../../../controller/api/center/ApiApp";

const TableData = ({ setDetail }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const { data: rawData = {}, isLoading: dataLoading } = useGetSubjectQuery({
    page,
    limit,
    search,
  });
  const { data: app } = useGetAppQuery();

  const { totalData, totalPages, subjects = [] } = rawData;
  const [deleteSubject, { isSuccess, isLoading, isError, reset }] =
    useDeleteSubjectMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data mata pelajaran ini dan semua data yang terkait dengan mata pelajaran ini?"
    );
    if (confirm) {
      toast.promise(
        deleteSubject(id)
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

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  const showTeacherDetails = (subject) => {
    setSelectedSubject(subject);
  };

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
    }
  }, [isSuccess, isError]);

  return (
    <>
      <Table
        page={page}
        setPage={setPage}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}
        isLoading={dataLoading}
      >
        <div className='table-responsive'>
          <table className='table table-striped table-hover '>
            <thead>
              <tr>
                <th className='text-center'>No</th>
                <th className='text-center'>Nama</th>
                <th className='text-center'>Guru</th>
                <th className='text-center'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subjects?.length > 0 ? (
                subjects.map((subject, i) => (
                  <tr key={i}>
                    <td className='text-center align-middle'>
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className='align-middle text-start'>{subject.name}</td>
                    <td className='text-center align-middle'>
                      {subject.teachers.length > 0 ? (
                        <button
                          className='btn btn-sm btn-primary'
                          onClick={() => showTeacherDetails(subject)}
                          data-bs-toggle='modal'
                          data-bs-target='#teacherDetailModal'
                        >
                          <i className='bi bi-eye me-1'></i>
                          Lihat Guru
                        </button>
                      ) : (
                        <span className='text-secondary fw-normal small'>
                          Data belum tersedia
                        </span>
                      )}
                    </td>
                    <td className='text-center align-middle'>
                      <div className='dropdown'>
                        <button
                          className='btn btn-sm btn-outline-primary'
                          type='button'
                          id={`dropdownMenuButton${subject.id}`}
                          data-bs-toggle='dropdown'
                          aria-expanded='false'
                        >
                          Pilihan Aksi
                        </button>
                        <ul
                          className='dropdown-menu dropdown-menu-end'
                          aria-labelledby={`dropdownMenuButton${subject.id}`}
                        >
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center gap-2'
                              onClick={() => goToLink(subject.name, subject.id)}
                            >
                              <i className='bi bi-eye'></i> Detail
                            </button>
                          </li>
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center gap-2'
                              onClick={() => setDetail(subject)}
                              data-bs-toggle='modal'
                              data-bs-target='#addsubject'
                            >
                              <i className='bi bi-pencil-square'></i> Edit
                            </button>
                          </li>
                          <li>
                            <button
                              className='dropdown-item d-flex align-items-center gap-2 text-danger'
                              disabled={isLoading}
                              onClick={() => deleteHandler(subject.id)}
                            >
                              <i className='bi bi-folder-minus'></i> Hapus
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='4' className='text-center'>
                    <div
                      className='alert alert-danger d-flex align-items-center justify-content-center'
                      role='alert'
                    >
                      <i className='bi bi-exclamation-circle-fill me-2'></i>
                      <span>Data belum tersedia</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Table>

      {/* Teacher Detail Modal */}
      <div
        className='modal fade'
        id='teacherDetailModal'
        tabIndex='-1'
        aria-labelledby='teacherDetailModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='teacherDetailModalLabel'>
                <i className='bi bi-person-badge me-2'></i>
                Detail Guru - {selectedSubject?.name}
              </h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              ></button>
            </div>
            <div className='modal-body'>
              {selectedSubject?.teachers?.length > 0 ? (
                <div className='row'>
                  {selectedSubject.teachers.map((teacher, index) => (
                    <div key={index} className='col-12 mb-4'>
                      <div className='card border-0 shadow-sm'>
                        <div className='card-header bg-primary text-white'>
                          <h6 className='mb-0'>
                            <i className='bi bi-person-circle me-2'></i>
                            {teacher.name}
                          </h6>
                        </div>
                        <div className='card-body'>
                          <div className='row'>
                            <div className='col-md-6'>
                              <h6 className='text-primary mb-3'>
                                <i className='bi bi-info-circle me-2'></i>
                                Informasi Guru
                              </h6>
                              <div className='mb-3'>
                                <strong>Nama:</strong> {teacher.name}
                              </div>
                              {teacher.class?.length > 0 ? (
                                <div className='mb-3'>
                                  <strong>Kelas yang diajar:</strong>
                                  <div className='mt-1'>
                                    {teacher.class.map((cls, clsIndex) => (
                                      <span
                                        key={clsIndex}
                                        className='badge bg-secondary me-1 mb-1'
                                      >
                                        {cls.name}
                                      </span>
                                    ))}
                                  </div>
                                  <small className='text-muted'>
                                    Total: {teacher.class.length} kelas
                                  </small>
                                </div>
                              ) : (
                                <div className='mb-3'>
                                  <strong>Kelas yang diajar:</strong>
                                  <div className='mt-1'>
                                    <span className='text-muted'>
                                      <i className='bi bi-dash-circle me-1'></i>
                                      Belum ditugaskan ke kelas
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className='col-md-6'>
                              <h6 className='text-primary mb-3'>
                                <i className='bi bi-book me-2'></i>
                                Statistik Materi
                              </h6>
                              <div className='row text-center'>
                                <div className='col-6'>
                                  <div
                                    className={`card ${
                                      teacher.chapters > 0
                                        ? "border-primary"
                                        : "bg-light"
                                    }`}
                                  >
                                    <div className='card-body py-2'>
                                      <h4
                                        className={`mb-0 ${
                                          teacher.chapters > 0
                                            ? "text-primary"
                                            : "text-muted"
                                        }`}
                                      >
                                        {teacher.chapters || 0}
                                      </h4>
                                      <small className='text-muted'>
                                        <i className='bi bi-collection me-1'></i>
                                        Chapter
                                      </small>
                                    </div>
                                  </div>
                                </div>
                                <div className='col-6'>
                                  <div
                                    className={`card ${
                                      teacher.contents > 0
                                        ? "border-success"
                                        : "bg-light"
                                    }`}
                                  >
                                    <div className='card-body py-2'>
                                      <h4
                                        className={`mb-0 ${
                                          teacher.contents > 0
                                            ? "text-success"
                                            : "text-muted"
                                        }`}
                                      >
                                        {teacher.contents || 0}
                                      </h4>
                                      <small className='text-muted'>
                                        <i className='bi bi-file-text me-1'></i>
                                        Materi
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {(teacher.chapters > 0 ||
                                teacher.contents > 0) && (
                                <div className='mt-2 text-center'>
                                  <small className='text-success'>
                                    <i className='bi bi-check-circle me-1'></i>
                                    Guru aktif mengunggah materi
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Chapters and Materials Section */}
                          <div className='mt-4'>
                            <h6 className='text-primary mb-3'>
                              <i className='bi bi-list-ul me-2'></i>
                              Detail Chapter dan Materi
                            </h6>

                            {teacher.chapters > 0 || teacher.contents > 0 ? (
                              <div className='row'>
                                <div className='col-md-6'>
                                  <h6 className='text-secondary'>
                                    <i className='bi bi-book me-2'></i>
                                    Statistik Chapter:
                                  </h6>
                                  <div className='card bg-light'>
                                    <div className='card-body'>
                                      <div className='d-flex justify-content-between align-items-center'>
                                        <span>Total Chapter:</span>
                                        <span className='badge bg-primary fs-6'>
                                          {teacher.chapters}
                                        </span>
                                      </div>
                                      <div className='d-flex justify-content-between align-items-center mt-2'>
                                        <span>Total Materi:</span>
                                        <span className='badge bg-success fs-6'>
                                          {teacher.contents}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className='col-md-6'>
                                  <h6 className='text-secondary'>
                                    <i className='bi bi-info-circle me-2'></i>
                                    Status Materi:
                                  </h6>
                                  <div className='card bg-light'>
                                    <div className='card-body'>
                                      {teacher.chapters > 0 ? (
                                        <div className='text-success'>
                                          <i className='bi bi-check-circle me-2'></i>
                                          Materi sudah tersedia
                                        </div>
                                      ) : (
                                        <div className='text-warning'>
                                          <i className='bi bi-exclamation-triangle me-2'></i>
                                          Belum ada materi
                                        </div>
                                      )}
                                      {teacher.contents > 0 && (
                                        <div className='text-info mt-2'>
                                          <i className='bi bi-file-earmark-text me-2'></i>
                                          {teacher.contents} konten tersedia
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className='alert alert-warning'>
                                <i className='bi bi-exclamation-triangle me-2'></i>
                                <strong>Belum ada materi yang tersedia</strong>
                                <br />
                                <small className='text-muted'>
                                  Guru ini belum mengunggah chapter atau materi
                                  untuk mata pelajaran ini.
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-4'>
                  <i
                    className='bi bi-exclamation-triangle text-warning'
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h5 className='mt-3 text-muted'>Tidak ada data guru</h5>
                  <p className='text-muted'>
                    Belum ada guru yang ditugaskan untuk mata pelajaran ini.
                  </p>
                </div>
              )}
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
              >
                <i className='bi bi-x-circle me-1'></i>
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableData;
