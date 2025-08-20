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
        <table className='table table-hover align-middle'>
          <thead className='table-light'>
            <tr>
              <th scope='col' className='text-center' style={{ width: "60px" }}>
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
          <tbody>
            {banks?.length > 0 ? (
              banks?.map((item, i) => (
                <tr key={i} className='align-middle'>
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
                  <td className='text-center'>
                    <div className='dropdown'>
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-primary'
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                      >
                        Pilihan Aksi
                      </button>
                      <ul className='dropdown-menu dropdown-menu-end shadow-sm'>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2'
                            onClick={() =>
                              goToLink(item.subject_name, item.name, item.id)
                            }
                          >
                            <i className='bi bi-eye'></i> Lihat
                          </button>
                        </li>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2'
                            onClick={() => setDetail(item)}
                            data-bs-toggle='modal'
                            data-bs-target='#addbank'
                          >
                            <i className='bi bi-pencil'></i> Edit
                          </button>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button
                            className='dropdown-item d-flex align-items-center gap-2 text-danger'
                            disabled={isLoading}
                            onClick={() => deleteHandler(item.id)}
                          >
                            <i className='bi bi-trash'></i> Hapus
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
  );
};

export default TableBank;
