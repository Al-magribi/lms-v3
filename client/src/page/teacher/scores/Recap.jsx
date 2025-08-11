import React from "react";
import { useSearchParams } from "react-router-dom";
import { useGetRecapQuery } from "../../../controller/api/lms/ApiScore";
import Table from "../../../components/table/Table";

const Recap = ({
  data,
  isLoading: studentsLoading,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  totalData,
  totalPages,
}) => {
  const [searchParams] = useSearchParams();
  const classid = searchParams.get("classid");
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  // Fetch recap data
  const { data: recapData, isLoading: recapLoading } = useGetRecapQuery(
    {
      classid,
      subjectid,
      chapterid,
      month,
      semester,
    },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
    }
  );

  const isLoading = studentsLoading || recapLoading;

  // Create a map of student data for easy lookup
  const recapMap = new Map();
  if (recapData && Array.isArray(recapData)) {
    recapData.forEach((item) => {
      recapMap.set(item.student_id, item);
    });
  }

  // Calculate averages for summary row
  const calculateAverages = () => {
    if (!recapData || !Array.isArray(recapData) || recapData.length === 0)
      return null;

    const totals = recapData.reduce(
      (acc, item) => {
        acc.kehadiran += parseFloat(item.kehadiran) || 0;
        acc.sikap += parseFloat(item.sikap) || 0;
        acc.formatif += parseFloat(item.formatif) || 0;
        acc.sumatif += parseFloat(item.sumatif) || 0;
        return acc;
      },
      { kehadiran: 0, sikap: 0, formatif: 0, sumatif: 0 }
    );

    const count = recapData.length;
    return {
      kehadiran: (totals.kehadiran / count).toFixed(2),
      sikap: (totals.sikap / count).toFixed(2),
      formatif: (totals.formatif / count).toFixed(2),
      sumatif: (totals.sumatif / count).toFixed(2),
    };
  };

  const averages = calculateAverages();

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
              <thead className="table-light">
                <tr>
                  <th
                    className="text-center align-middle"
                    style={{ width: "60px" }}
                  >
                    No
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "100px" }}
                  >
                    NIS
                  </th>
                  <th className="text-center align-middle">Siswa</th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "100px" }}
                  >
                    Kehadiran
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "80px" }}
                  >
                    Sikap
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "100px" }}
                  >
                    Formatif
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "100px" }}
                  >
                    Sumatif
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "300px" }}
                  >
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.students?.map((student, index) => {
                  const recap = recapMap.get(student.student);

                  return (
                    <tr key={student.id}>
                      <td className="text-center align-middle fw-bold">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="text-center align-middle">
                        {student.nis}
                      </td>
                      <td className="align-middle fw-medium">
                        {student.student_name}
                      </td>
                      <td className="text-center align-middle">
                        {recap && parseFloat(recap.kehadiran) > 0 ? (
                          <span
                            className={`badge ${
                              parseFloat(recap.kehadiran) >= 80
                                ? "bg-success"
                                : parseFloat(recap.kehadiran) >= 60
                                ? "bg-warning"
                                : "bg-danger"
                            }`}
                          >
                            {recap.kehadiran}%
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        {recap && parseFloat(recap.sikap) > 0 ? (
                          <span
                            className={`fw-bold ${
                              parseFloat(recap.sikap) >= 80
                                ? "text-success"
                                : parseFloat(recap.sikap) >= 60
                                ? "text-warning"
                                : "text-danger"
                            }`}
                          >
                            {recap.sikap}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        {recap && parseFloat(recap.formatif) > 0 ? (
                          <span
                            className={`fw-bold ${
                              parseFloat(recap.formatif) >= 80
                                ? "text-success"
                                : parseFloat(recap.formatif) >= 60
                                ? "text-warning"
                                : "text-danger"
                            }`}
                          >
                            {recap.formatif}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        {recap && parseFloat(recap.sumatif) > 0 ? (
                          <span
                            className={`fw-bold ${
                              parseFloat(recap.sumatif) >= 80
                                ? "text-success"
                                : parseFloat(recap.sumatif) >= 60
                                ? "text-warning"
                                : "text-danger"
                            }`}
                          >
                            {recap.sumatif}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">
                          {recap?.catatan || "-"}
                        </small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {averages && (
                <tfoot className="table-info">
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center align-middle fw-bold"
                    >
                      RATA-RATA KELAS
                    </td>
                    <td className="text-center align-middle fw-bold">
                      {averages.kehadiran}%
                    </td>
                    <td className="text-center align-middle fw-bold">
                      {averages.sikap}
                    </td>
                    <td className="text-center align-middle fw-bold">
                      {averages.formatif}
                    </td>
                    <td className="text-center align-middle fw-bold">
                      {averages.sumatif}
                    </td>
                    <td className="align-middle">
                      <small className="text-muted">-</small>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Recap;
