import React, { useState, useEffect } from "react";

const MonthSelector = ({
  availableMonths,
  loading,
  onMonthSelect,
  selectedMonth,
  selectedSemester,
}) => {
  const [localSelectedMonth, setLocalSelectedMonth] = useState(selectedMonth);
  const [localSelectedSemester, setLocalSelectedSemester] =
    useState(selectedSemester);

  // Sync local state with props
  useEffect(() => {
    setLocalSelectedMonth(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    setLocalSelectedSemester(selectedSemester);
  }, [selectedSemester]);

  const months = [
    { name: "Januari", value: "Januari" },
    { name: "Februari", value: "Februari" },
    { name: "Maret", value: "Maret" },
    { name: "April", value: "April" },
    { name: "Mei", value: "Mei" },
    { name: "Juni", value: "Juni" },
    { name: "Juli", value: "Juli" },
    { name: "Agustus", value: "Agustus" },
    { name: "September", value: "September" },
    { name: "Oktober", value: "Oktober" },
    { name: "November", value: "November" },
    { name: "Desember", value: "Desember" },
  ];

  const semesters = [
    { name: "Semester 1", value: 1 },
    { name: "Semester 2", value: 2 },
  ];

  if (loading) {
    return (
      <div className='text-center py-4'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
        <p className='mt-2 text-muted'>Memuat data periode...</p>
      </div>
    );
  }

  const availablePeriods = availableMonths || [];
  const hasAvailableData = availablePeriods.length > 0;

  return (
    <div className='row'>
      <div className='col-md-6 mb-3'>
        <label htmlFor='monthSelect' className='form-label fw-bold'>
          <i className='bi bi-calendar-month me-2'></i>
          Bulan
        </label>
        <select
          id='monthSelect'
          className='form-select'
          value={localSelectedMonth}
          onChange={(e) => {
            const month = e.target.value;
            setLocalSelectedMonth(month);
            if (month && localSelectedSemester) {
              onMonthSelect(month, localSelectedSemester);
            }
          }}
        >
          <option value=''>Pilih Bulan</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.name}
            </option>
          ))}
        </select>
      </div>

      <div className='col-md-6 mb-3'>
        <label htmlFor='semesterSelect' className='form-label fw-bold'>
          <i className='bi bi-calendar-range me-2'></i>
          Semester
        </label>
        <select
          id='semesterSelect'
          className='form-select'
          value={localSelectedSemester}
          onChange={(e) => {
            const semester = e.target.value ? parseInt(e.target.value) : "";
            setLocalSelectedSemester(semester);
            if (semester && localSelectedMonth) {
              onMonthSelect(localSelectedMonth, semester);
            }
          }}
        >
          <option value=''>Pilih Semester</option>
          {semesters.map((semester) => (
            <option key={semester.value} value={semester.value}>
              {semester.name}
            </option>
          ))}
        </select>
      </div>

      {/* Available Periods Info */}
      {hasAvailableData && (
        <div className='col-12'>
          <div className='alert alert-info'>
            <h6 className='alert-heading'>
              <i className='bi bi-info-circle me-2'></i>
              Periode Tersedia:
            </h6>
            <div className='row'>
              {availablePeriods.map((period, index) => (
                <div key={index} className='col-md-3 col-sm-6 mb-2'>
                  <button
                    className={`btn btn-sm ${
                      localSelectedMonth === period.month &&
                      localSelectedSemester === parseInt(period.semester)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => {
                      const semester = parseInt(period.semester);
                      setLocalSelectedMonth(period.month);
                      setLocalSelectedSemester(semester);
                      onMonthSelect(period.month, semester);
                    }}
                  >
                    {period.month} - Semester {period.semester}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!hasAvailableData && (
        <div className='col-12'>
          <div className='alert alert-warning'>
            <i className='bi bi-exclamation-triangle me-2'></i>
            Belum ada data laporan tersedia. Silakan hubungi guru untuk
            informasi lebih lanjut.
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
