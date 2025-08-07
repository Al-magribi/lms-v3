import React from "react";
import Table from "../../../components/table/Table";

const Recap = ({
  data,
  isLoading,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  totalData,
  totalPages,
}) => {
  const renderRecapColumn = (student) => {
    // This would typically fetch the actual scores from the database
    // For now, we'll show placeholder data
    return (
      <div className="d-flex flex-column gap-1">
        <div className="d-flex justify-content-between">
          <small className="text-muted">Sikap:</small>
          <small className="fw-bold">85</small>
        </div>
        <div className="d-flex justify-content-between">
          <small className="text-muted">Kehadiran:</small>
          <small className="fw-bold">90</small>
        </div>
        <div className="d-flex justify-content-between">
          <small className="text-muted">Formatif:</small>
          <small className="fw-bold">88</small>
        </div>
        <div className="d-flex justify-content-between">
          <small className="text-muted">Sumatif:</small>
          <small className="fw-bold">92</small>
        </div>
        <hr className="my-1" />
        <div className="d-flex justify-content-between">
          <small className="text-primary fw-bold">Rata-rata:</small>
          <small className="text-primary fw-bold">88.75</small>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Rekap Nilai</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <Table
            isLoading={isLoading}
            totalData={totalData}
            totalPages={totalPages}
            page={page}
            limit={limit}
            setPage={setPage}
            setLimit={setLimit}
            setSearch={setSearch}
          >
            <table className="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th className="text-center align-middle">No</th>
                  <th className="text-center align-middle">NIS</th>
                  <th className="text-center align-middle">Nama Siswa</th>
                  <th
                    className="text-center align-middle"
                    style={{ backgroundColor: "#e9ecef" }}
                  >
                    Rekap Nilai
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.students?.map((student, index) => (
                  <tr key={student.id}>
                    <td className="text-center align-middle">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="text-center align-middle">{student.nis}</td>
                    <td className="align-middle">{student.student_name}</td>
                    <td className="align-middle">
                      {renderRecapColumn(student)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Recap;
