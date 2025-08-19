const SubjectReportCard = ({ subject, getGradeColor, getGradeLetter }) => {
  // New letter grade function specifically for attitude scores
  const getAttitudeGradeLetter = (score) => {
    if (!score) return "-";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    return "C";
  };

  const createHtml = (html) => {
    return { __html: html };
  };

  // Helper function to check if a formative score has a value
  const hasFormativeValue = (formative, field) => {
    return (
      formative && formative[field] !== null && formative[field] !== undefined
    );
  };
  const {
    subject_name,
    teacher_name,
    attitude,
    formative,
    summative,
    attendance,
    chapter,
  } = subject;

  return (
    <div className='card border-secondary shadow-sm'>
      {/* Subject Header */}
      <div className='card-header bg-secondary text-white'>
        <div className='row align-items-center'>
          <div className='col-md-8'>
            <h5 className='mb-1'>
              <i className='bi bi-book me-2'></i>
              {subject_name}
            </h5>
            <p className='mb-0'>
              <i className='bi bi-person me-1'></i>
              Guru: {teacher_name || "Belum ditentukan"}
            </p>
          </div>
          <div className='col-md-4 text-md-end'>
            {subject.subject_cover && (
              <img
                src={subject.subject_cover}
                alt={subject_name}
                className='rounded'
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
            )}
          </div>
        </div>
      </div>

      <div className='card-body'>
        <div className='row'>
          {/* Attitude Section */}
          <div className='col-md-6 mb-4'>
            <div className='card border-primary h-100'>
              <div className='card-header bg-primary text-white'>
                <h6 className='mb-0'>
                  <i className='bi bi-heart me-2'></i>
                  Nilai Sikap
                </h6>
              </div>
              <div className='card-body'>
                {attitude ? (
                  <div className='row'>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Kinerja</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(attitude.kinerja)}`}
                      >
                        {attitude.kinerja || "-"}
                      </div>
                    </div>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Kedisiplinan</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          attitude.kedisiplinan
                        )}`}
                      >
                        {attitude.kedisiplinan || "-"}
                      </div>
                    </div>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Keaktifan</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          attitude.keaktifan
                        )}`}
                      >
                        {attitude.keaktifan || "-"}
                      </div>
                    </div>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Percaya Diri</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          attitude.percaya_diri
                        )}`}
                      >
                        {attitude.percaya_diri || "-"}
                      </div>
                    </div>
                    <div className='col-12'>
                      <small className='text-muted'>Rata-rata</small>
                      <div
                        className={`h4 mb-0 ${getGradeColor(
                          attitude.rata_rata
                        )}`}
                      >
                        {attitude.rata_rata
                          ? `${attitude.rata_rata} (${getAttitudeGradeLetter(
                              attitude.rata_rata
                            )})`
                          : "-"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-muted py-3'>
                    <i className='bi bi-dash-circle display-6'></i>
                    <p className='mb-0'>Data sikap belum tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div className='col-md-6 mb-4'>
            <div className='card border-info h-100'>
              <div className='card-header bg-info text-white'>
                <h6 className='mb-0'>
                  <i className='bi bi-calendar-check me-2'></i>
                  Kehadiran
                </h6>
              </div>
              <div className='card-body'>
                {attendance ? (
                  <div className='row text-center'>
                    <div className='col-3 mb-2'>
                      <div className='border rounded p-2'>
                        <div className='h5 text-success mb-0'>
                          {attendance.hadir || 0}
                        </div>
                        <small className='text-muted'>Hadir</small>
                      </div>
                    </div>
                    <div className='col-3 mb-2'>
                      <div className='border rounded p-2'>
                        <div className='h5 text-warning mb-0'>
                          {attendance.sakit || 0}
                        </div>
                        <small className='text-muted'>Sakit</small>
                      </div>
                    </div>
                    <div className='col-3 mb-2'>
                      <div className='border rounded p-2'>
                        <div className='h5 text-info mb-0'>
                          {attendance.ijin || 0}
                        </div>
                        <small className='text-muted'>Ijin</small>
                      </div>
                    </div>
                    <div className='col-3 mb-2'>
                      <div className='border rounded p-2'>
                        <div className='h5 text-danger mb-0'>
                          {attendance.alpa || 0}
                        </div>
                        <small className='text-muted'>Alpa</small>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='progress mt-2'>
                        <div
                          className='progress-bar bg-success'
                          style={{
                            width: `${
                              attendance.total > 0
                                ? (attendance.hadir / attendance.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <small className='text-muted'>
                        Kehadiran:{" "}
                        {attendance.total > 0
                          ? Math.round(
                              (attendance.hadir / attendance.total) * 100
                            )
                          : 0}
                        %
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-muted py-3'>
                    <i className='bi bi-dash-circle display-6'></i>
                    <p className='mb-0'>Data kehadiran belum tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Scores Section */}
        <div className='row'>
          {/* Formative Scores */}
          <div className='col-md-6 mb-4'>
            <div className='card border-warning'>
              <div className='card-header bg-warning text-dark'>
                <h6 className='mb-0'>
                  <i className='bi bi-pencil-square me-2'></i>
                  Nilai Formatif
                </h6>
              </div>
              <div className='card-body'>
                {formative ? (
                  (() => {
                    // Check if any formative scores have values
                    const hasAnyFormativeScore = [1, 2, 3, 4, 5, 6, 7, 8].some(
                      (num) => {
                        const field = `f_${num}`;
                        return hasFormativeValue(formative, field);
                      }
                    );

                    if (!hasAnyFormativeScore) {
                      return (
                        <div className='text-center text-muted py-3'>
                          <i className='bi bi-dash-circle display-6'></i>
                          <p className='mb-0'>Belum ada nilai formatif</p>
                        </div>
                      );
                    }

                    return (
                      <div className='row'>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                          const field = `f_${num}`;
                          const hasValue = hasFormativeValue(formative, field);

                          // Only show if the score has a value
                          if (!hasValue) return null;

                          return (
                            <div key={num} className='col-3 mb-2'>
                              <small className='text-muted'>F_{num}</small>
                              <div
                                className={`h6 mb-0 ${getGradeColor(
                                  formative[field]
                                )}`}
                              >
                                {formative[field]}
                              </div>
                            </div>
                          );
                        })}
                        <div className='col-12 mt-2'>
                          <hr />
                          <small className='text-muted'>Rata-rata</small>
                          <div
                            className={`h5 mb-0 ${getGradeColor(
                              formative.rata_rata
                            )}`}
                          >
                            {formative.rata_rata ? formative.rata_rata : "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className='text-center text-muted py-3'>
                    <i className='bi bi-dash-circle display-6'></i>
                    <p className='mb-0'>Data formatif belum tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summative Scores */}
          <div className='col-md-6 mb-4'>
            <div className='card border-success'>
              <div className='card-header bg-success text-white'>
                <h6 className='mb-0'>
                  <i className='bi bi-star me-2'></i>
                  Nilai Sumatif
                </h6>
              </div>
              <div className='card-body'>
                {summative ? (
                  <div className='row'>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Tes Lisan</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(summative.oral)}`}
                      >
                        {summative.oral || "-"}
                      </div>
                    </div>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Tes Tulis</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          summative.written
                        )}`}
                      >
                        {summative.written || "-"}
                      </div>
                    </div>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Proyek</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          summative.project
                        )}`}
                      >
                        {summative.project || "-"}
                      </div>
                    </div>
                    <div className='col-6 mb-2'>
                      <small className='text-muted'>Penampilan</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          summative.performace
                        )}`}
                      >
                        {summative.performace || "-"}
                      </div>
                    </div>
                    <div className='col-12 mt-2'>
                      <hr />
                      <small className='text-muted'>Rata-rata</small>
                      <div
                        className={`h5 mb-0 ${getGradeColor(
                          summative.rata_rata
                        )}`}
                      >
                        {summative.rata_rata ? summative.rata_rata : "-"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-muted py-3'>
                    <i className='bi bi-dash-circle display-6'></i>
                    <p className='mb-0'>Data sumatif belum tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Notes and Topic */}
        <div className='row'>
          <div className='col-md-6 mb-3'>
            <div className='card border-secondary'>
              <div className='card-header bg-secondary text-white'>
                <h6 className='mb-0'>
                  <i className='bi bi-journal-text me-2'></i>
                  Topik Materi
                </h6>
              </div>
              <div className='card-body'>
                {chapter && chapter.topic ? (
                  <div>
                    <p className='mb-1 fw-bold'>{chapter.topic}</p>
                    {chapter.target_description && (
                      <small
                        className='text-muted'
                        dangerouslySetInnerHTML={createHtml(
                          chapter.target_description
                        )}
                      ></small>
                    )}
                  </div>
                ) : (
                  <p className='text-muted mb-0'>
                    Topik materi belum ditentukan
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='col-md-6 mb-3'>
            <div className='card border-dark'>
              <div className='card-header bg-dark text-white'>
                <h6 className='mb-0'>
                  <i className='bi bi-chat-text me-2'></i>
                  Catatan Guru
                </h6>
              </div>
              <div className='card-body'>
                {attitude && attitude.catatan_guru ? (
                  <p
                    className='mb-0 fst-italic'
                    dangerouslySetInnerHTML={createHtml(attitude.catatan_guru)}
                  ></p>
                ) : (
                  <p className='text-muted mb-0'>Belum ada catatan dari guru</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectReportCard;
