import React, { useState } from "react";
import { useGetExamsByClassQuery } from "../../../controller/api/cbt/ApiExam";
import Table from "../../../components/table/Table";
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

  return (
    <Table
      isLoading={isLoading}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      totalPages={totalPages}
      setSearch={setSearch}
      totalData={totalData}>
      <table className='mb-0 table table-hover table-striped table-bordered'>
        <thead>
          <tr>
            <th className='text-center'>No</th>
            <th className='text-center'>Guru</th>
            <th className='text-center'>Nama Ujian</th>
            <th className='text-center'>Durasi</th>
            <th className='text-center'>Status</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {exams?.length > 0 ? (
            exams?.map((item, index) => (
              <tr key={item.id}>
                <td className='text-center align-middle'>{index + 1}</td>
                <td className='align-middle'>{item.teacher_name}</td>
                <td className='align-middle'>{item.name}</td>
                <td className='text-center align-middle'>
                  <p className='m-0 badge bg-primary'>{`${item.duration} Menit`}</p>
                </td>
                <td className='text-center align-middle'>
                  <p className='m-0'>
                    {item.isactive ? (
                      <span className='badge bg-success'>Aktif</span>
                    ) : (
                      <span className='badge bg-danger'>nonaktif</span>
                    )}
                  </p>
                </td>
                <td className='text-center align-middle'>
                  <button
                    className='btn btn-sm btn-primary'
                    data-bs-toggle='modal'
                    data-bs-target='#token'
                    disabled={!item.isactive}
                    onClick={() => setExam(item)}>
                    <i className='bi bi-eye'></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>Data Belum Tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
      <Modal exam={exam} setExam={setExam} />
    </Table>
  );
};

export default ExamList;
