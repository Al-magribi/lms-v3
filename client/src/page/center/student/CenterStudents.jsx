import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetStudentsDataQuery } from "../../../controller/api/center/ApiCenterData";
import Table from "../../../components/table/Table";

const CenterStudents = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useGetStudentsDataQuery({
    page,
    limit,
    search,
  });

  const { results = [], totalData, totalPages } = data || {};

  return (
    <Layout title={"Daftar Siswa"} levels={["center"]}>
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}>
        <table className='mb-0 table table-hover table-striped table-bordered'>
          <thead>
            <tr>
              <th className='text-center'>No</th>
              <th className='text-center'>Satuan</th>
              <th className='text-center'>Tahun Masuk</th>
              <th className='text-center'>NIS</th>
              <th className='text-center'>Nama</th>
              <th className='text-center'>P/L</th>
              <th className='text-center'>Satus</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id}>
                <td className='text-center align-middle'>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className='text-center align-middle'>{result.homebase}</td>
                <td className='text-center align-middle'>{result.periode}</td>
                <td className='text-center align-middle'>{result.nis}</td>
                <td className='align-middle'>{result.name}</td>
                <td className='text-center align-middle'>{result.gender}</td>
                <td className='text-center align-middle'>
                  {result.isactive ? (
                    <span className='badge bg-primary'>Aktif</span>
                  ) : (
                    <span className='badge bg-success'>Lulus</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </Layout>
  );
};

export default CenterStudents;
