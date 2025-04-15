import React, { useState } from "react";
import Table from "../../../../components/table/Table";
import { useGetExamLogQuery } from "../../../../controller/api/log/ApiLog";

const TableData = ({ classid, examid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data = {}, isLoading } = useGetExamLogQuery({
    exam: examid,
    classid: classid,
    page,
    limit,
    search,
  });

  const { result = [], totalData, totalPages } = data;

  return (
    <Table
      isLoading={isLoading}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
    >
      <table className='table table-striped table-hover table-bordered'>
        <thead className='table-light'>
          <tr>
            <th scope='col' className='text-center'>
              No
            </th>
            <th scope='col' className='text-center'>
              NIS
            </th>
            <th scope='col' className='text-center'>
              Nama Siswa
            </th>
            <th scope='col' className='text-center'>
              Kelas
            </th>
            <th scope='col' className='text-center'>
              Tingkat
            </th>
            <th scope='col' className='text-center'>
              IP Address
            </th>
            <th scope='col' className='text-center'>
              Browser
            </th>
            <th scope='col' className='text-center'>
              Waktu Mulai
            </th>
            <th scope='col' className='text-center'>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {result.length > 0 ? (
            result.map((item, index) => (
              <tr key={item.student_id || index}>
                <td className='text-center align-middle'>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className='text-center align-middle'>{item.nis}</td>
                <td className='align-middle'>{item.student_name}</td>
                <td className='text-center align-middle'>{item.class_name}</td>
                <td className='text-center align-middle'>{item.grade_name}</td>
                <td className='text-center align-middle'>{item.ip || "-"}</td>
                <td className='text-center align-middle'>
                  {item.browser || "-"}
                </td>
                <td className='text-center align-middle'>
                  {item.createdat ? (
                    <span className='badge bg-success'>
                      {new Date(item.createdat).toLocaleString()}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className='text-center align-middle'>
                  <span
                    className={`badge ${
                      item.has_log ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {item.has_log ? "Sudah Ujian" : "Belum Ujian"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='9' className='text-center'>
                {isLoading ? "Memuat data..." : "Tidak ada data yang ditemukan"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
