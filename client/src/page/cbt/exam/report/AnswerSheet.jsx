import React from "react";
import { useParams } from "react-router-dom";
import { useGetStudentAnswerQuery } from "../../../../controller/api/cbt/ApiAnswer";

const AnswerSheet = ({ detail }) => {
  const { examid, name } = useParams();

  const { data, isLoading, isError, error } = useGetStudentAnswerQuery(
    {
      student: detail.student_id,
      exam: examid,
    },
    {
      skip: !detail.student_id, // Skip query if student_id is not available
    }
  );

  // Access the first element of the array
  const studentData = data?.[0];

  return (
    <div
      className='modal fade'
      id='answerSheet'
      data-bs-backdrop='static'
      data-bs-keyboard='false'
      tabIndex='-1'
      aria-labelledby='staticBackdropLabel'
      aria-hidden='true'>
      <div className='modal-dialog modal-xl modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <div className='modal-title' id='staticBackdropLabel'>
              <p className='m-0 h5'>{name?.replace(/-/g, " ")}</p>
              <span className='text-muted'>
                {detail?.nis} - {detail?.student_name}
              </span>
            </div>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'></button>
          </div>
          <div className='modal-body'>
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <div className='alert alert-danger' role='alert'>
                Gagal memuat data jawaban:{" "}
                {error?.data?.message || error.message}
              </div>
            ) : studentData ? (
              <>
                {/* Student Info Card */}
                <div className='card mb-3'>
                  <div className='card-body'>
                    <h5 className='card-title mb-3'>Lembar Jawaban</h5>
                    <table className='table table-sm table-borderless mb-0'>
                      <tbody>
                        <tr>
                          <td>
                            <strong>NIS</strong>
                          </td>
                          <td>: {studentData.student_nis}</td>
                          <td>
                            <strong>Tingkat</strong>
                          </td>
                          <td>: {studentData.student_grade}</td>
                          <td>
                            <strong>Ujian</strong>
                          </td>
                          <td>: {name.replace(/-/g, " ")}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Nama</strong>
                          </td>
                          <td>: {studentData.student_name}</td>
                          <td>
                            <strong>Kelas</strong>
                          </td>
                          <td>: {studentData.student_class}</td>
                          <td>
                            <strong>Tanggal</strong>
                          </td>
                          <td>
                            :{" "}
                            {studentData.log_exam
                              ? new Date(studentData.log_exam).toLocaleString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                )
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Answers Section */}
                {studentData.answers && studentData.answers.length > 0 ? (
                  studentData.answers.map((answer, index) => (
                    <div key={answer.question_id} className='card mb-3'>
                      <div className='card-body'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <h6 className='card-title mb-0'>
                            <span className='badge bg-primary'>
                              Pertanyaan {index + 1}
                            </span>
                          </h6>
                          <span
                            className={`badge ${
                              answer.point > 0 ? "bg-success" : "bg-danger"
                            }`}>
                            {answer.point} Poin
                          </span>
                        </div>
                        <p
                          className='card-text'
                          dangerouslySetInnerHTML={{
                            __html: answer.question_text,
                          }}></p>
                        <div className='mt-3 d-flex gap-4'>
                          <p
                            className={`m-0 badge ${
                              answer.point > 0 ? "bg-success" : "bg-danger"
                            }`}>
                            Jawaban Siswa:{" "}
                            <strong className='m-0'>
                              {answer.answer?.toUpperCase() || "-"}
                            </strong>
                          </p>
                          <p className='m-0 badge bg-success'>
                            Jawaban Benar: <strong>{answer.correct}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='alert alert-info mt-3' role='alert'>
                    Tidak ada data jawaban untuk siswa ini.
                  </div>
                )}
              </>
            ) : (
              <div className='alert alert-warning' role='alert'>
                Data siswa tidak ditemukan.
              </div>
            )}
          </div>
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-secondary'
              data-bs-dismiss='modal'>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerSheet;
