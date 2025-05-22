import React, { useState, useEffect } from "react";
import Table from "../../../components/table/Table";
import { useGetStudentsInClassQuery } from "../../../controller/api/admin/ApiClass";
import {
  useGetPresensiQuery,
  useAddPresensiMutation,
} from "../../../controller/api/lms/ApiPresensi";
import { toast } from "react-hot-toast";

const TableData = ({ classid, subjectid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetStudentsInClassQuery(
    {
      page,
      limit,
      search,
      classid,
    },
    { skip: !classid }
  );

  const { data: presensiData } = useGetPresensiQuery(
    { classid, subjectid },
    { skip: !classid || !subjectid }
  );

  const [addPresensi] = useAddPresensiMutation();

  const { students, totalData, totalPages } = data || {};

  const handleCheck = async ({ studentid, note }) => {
    const data = { classid, subjectid, studentid, note };

    toast.promise(
      addPresensi(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (error) => error.data?.message || "Terjadi kesalahan",
      }
    );
  };

  return (
    <>
      {!classid || !subjectid ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-clipboard2-check display-1 text-muted"></i>
          </div>
          <h5 className="fw-bold text-muted mb-2">Pilih Data Presensi</h5>
          <p className="text-muted mb-0">
            Silakan pilih mata pelajaran dan kelas terlebih dahulu
          </p>
        </div>
      ) : !students ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-people display-1 text-muted"></i>
          </div>
          <h5 className="fw-bold text-muted mb-2">Data Siswa Tidak Tersedia</h5>
          <p className="text-muted mb-0">
            Tidak ada data siswa yang ditemukan untuk kelas ini
          </p>
        </div>
      ) : (
        <Table
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          setSearch={setSearch}
          totalData={totalData}
          totalPages={totalPages}
        >
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th
                    className="align-middle text-center"
                    style={{ width: "5%" }}
                  >
                    No
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "10%" }}
                  >
                    NIS
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "25%" }}
                  >
                    Nama
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "10%" }}
                  >
                    Tingkat
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "15%" }}
                  >
                    Kelas
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "10%" }}
                  >
                    <i className="bi bi-check-circle text-success"></i>
                    <div className="small">Hadir</div>
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "10%" }}
                  >
                    <i className="bi bi-heart-pulse text-primary"></i>
                    <div className="small">Sakit</div>
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "10%" }}
                  >
                    <i className="bi bi-envelope-paper text-info"></i>
                    <div className="small">Izin</div>
                  </th>
                  <th
                    className="align-middle text-center"
                    style={{ width: "10%" }}
                  >
                    <i className="bi bi-x-circle text-danger"></i>
                    <div className="small">Alpa</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="text-center align-middle">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="text-center align-middle">{student.nis}</td>
                    <td className="align-middle">{student.student_name}</td>
                    <td className="text-center align-middle">
                      {student.grade_name}
                    </td>
                    <td className="text-center align-middle">
                      {student.class_name}
                    </td>
                    <td className="text-center align-middle">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          className="form-check-input border-success"
                          type="checkbox"
                          style={{ width: "1.5em", height: "1.5em" }}
                          checked={
                            presensiData?.find(
                              (item) => item.studentid === student.student
                            )?.note === "Hadir"
                          }
                          onChange={(e) => {
                            handleCheck({
                              studentid: student.student,
                              note: "Hadir",
                              checked: e.target.checked,
                            });
                          }}
                        />
                      </div>
                    </td>

                    <td className="text-center align-middle">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          className="form-check-input border-primary"
                          type="checkbox"
                          style={{ width: "1.5em", height: "1.5em" }}
                          checked={
                            presensiData?.find(
                              (item) => item.studentid === student.student
                            )?.note === "Sakit"
                          }
                          onChange={(e) => {
                            handleCheck({
                              studentid: student.student,
                              note: "Sakit",
                              checked: e.target.checked,
                            });
                          }}
                        />
                      </div>
                    </td>

                    <td className="text-center align-middle">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          className="form-check-input border-info"
                          type="checkbox"
                          style={{ width: "1.5em", height: "1.5em" }}
                          checked={
                            presensiData?.find(
                              (item) => item.studentid === student.student
                            )?.note === "Izin"
                          }
                          onChange={(e) => {
                            handleCheck({
                              studentid: student.student,
                              note: "Izin",
                              checked: e.target.checked,
                            });
                          }}
                        />
                      </div>
                    </td>
                    <td className="text-center align-middle">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          className="form-check-input border-danger"
                          type="checkbox"
                          style={{ width: "1.5em", height: "1.5em" }}
                          checked={
                            presensiData?.find(
                              (item) => item.studentid === student.student
                            )?.note === "Alpa"
                          }
                          onChange={(e) => {
                            handleCheck({
                              studentid: student.student,
                              note: "Alpa",
                              checked: e.target.checked,
                            });
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Table>
      )}
    </>
  );
};

export default TableData;
