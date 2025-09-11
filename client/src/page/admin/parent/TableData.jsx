import React, { useState } from "react";
import { useGetParentsQuery } from "../../../controller/api/admin/ApiParent";
import Table from "../../../components/table/Table";

const TableData = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetParentsQuery({ page, limit, search });

  console.log(data);
  return (
    <Table
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={data?.totalData}
      totalPages={data?.totalPages}
      isLoading={isLoading}
    >
      <div className="table-responsive">
        <table
          className="table table-bordered table-striped table-hover"
          style={{ fontSize: "0.9rem" }}
        >
          <thead>
            <tr>
              <th className="text-center">No</th>
              <th className="text-center">Nama Siswa</th>
              <th className="text-center">Orang Tua</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.length > 0 ? (
              data?.data.map((item, i) => (
                <tr key={i}>
                  <td className="text-center text-muted fw-medium">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="text-muted fw-medium">
                    <div className="d-flex flex-column">
                      <p className="m-0">{item.student_name}</p>
                      <small>
                        {item.nis} <i className="bi bi-dot"></i> {item.grade}
                        <i className="bi bi-dot"></i> {item.class}
                      </small>
                    </div>
                  </td>
                  <td className="text-muted fw-medium">
                    <div className="d-flex flex-column">
                      <p className="m-0">{item.parent_name}</p>
                      <small className="fw-medium">{item.parent_email}</small>
                    </div>
                  </td>
                  <td className="text-center text-muted fw-medium">
                    <button className="btn btn-sm btn-warning">Reset</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-5">
                  <div className="d-flex flex-column align-items-center text-muted">
                    <i className="bi bi-inbox fs-1 mb-3"></i>
                    <span className="fw-medium">
                      Data orang tua belum tersedia
                    </span>
                    <small>Silakan tambahkan data baru</small>
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

export default TableData;
