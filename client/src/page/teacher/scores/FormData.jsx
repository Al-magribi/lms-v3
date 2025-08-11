import React, { useState, useMemo, useEffect } from "react";
import ReactSelect from "react-select";
import { useGetChaptersQuery } from "../../../controller/api/lms/ApiChapter";
import { useSearchParams, useNavigate } from "react-router-dom";

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 10 }),
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    "@media (max-width: 576px)": {
      minHeight: "44px",
    },
  }),
  option: (base, state) => ({
    ...base,
    "@media (max-width: 576px)": {
      padding: "12px 16px",
    },
  }),
};

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const semesters = [
  { label: "Semester 1", value: 1 },
  { label: "Semester 2", value: 2 },
];

const FormData = ({ subject, id }) => {
  const { data } = useGetChaptersQuery(id);
  const [searchParams, setSearchParams] = useSearchParams();

  // Options untuk dropdown chapter
  const chapterOptions = useMemo(
    () =>
      data?.map((chapter) => ({
        value: chapter.chapter_id,
        label: chapter.chapter_name,
      })) || [],
    [data]
  );

  // Ambil dari query url
  const chapteridParam = searchParams.get("chapterid");
  const classidParam = searchParams.get("classid");
  const monthParam = searchParams.get("month");
  const semesterParam = searchParams.get("semester");

  // State
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Class options tergantung chapter terpilih
  const classOptions = useMemo(() => {
    if (!selectedChapter && !chapteridParam) return [];
    const chapterId = selectedChapter ? selectedChapter.value : chapteridParam;
    const chapter = data?.find(
      (c) => String(c.chapter_id) === String(chapterId)
    );
    return (
      chapter?.class?.map((cls) => ({ value: cls.id, label: cls.name })) || []
    );
  }, [data, selectedChapter, chapteridParam]);

  // Month options
  const monthOptions = useMemo(
    () => months.map((month) => ({ value: month, label: month })),
    []
  );

  // Semester options
  const semesterOptions = useMemo(
    () =>
      semesters.map((semester) => ({
        value: semester.value,
        label: semester.label,
      })),
    []
  );

  // Sinkronisasi state dengan query param setelah data/options siap
  useEffect(() => {
    // Set chapter
    if (chapteridParam && chapterOptions.length > 0) {
      const found = chapterOptions.find(
        (opt) => String(opt.value) === String(chapteridParam)
      );
      setSelectedChapter(found || null);
    }
  }, [chapteridParam, chapterOptions]);

  useEffect(() => {
    // Set class
    if (classidParam && classOptions.length > 0) {
      const found = classOptions.find(
        (opt) => String(opt.value) === String(classidParam)
      );
      setSelectedClass(found || null);
    }
  }, [classidParam, classOptions]);

  useEffect(() => {
    // Set month
    if (monthParam && monthOptions.length > 0) {
      const found = monthOptions.find((opt) => opt.value === monthParam);
      setSelectedMonth(found || null);
    }
  }, [monthParam, monthOptions]);

  useEffect(() => {
    // Set semester
    if (semesterParam && semesterOptions.length > 0) {
      const found = semesterOptions.find(
        (opt) => String(opt.value) === String(semesterParam)
      );
      setSelectedSemester(found || null);
    }
  }, [semesterParam, semesterOptions]);

  // Handler untuk update query params
  const updateQuery = (chapter, cls, month, semester) => {
    const params = {};
    // Pertahankan subject dan id
    if (subject) params.subject = subject;
    if (id) params.id = id;
    if (chapter) params.chapterid = chapter.value;
    if (cls) params.classid = cls.value;
    if (month) params.month = month.value;
    if (semester) params.semester = semester.value;
    setSearchParams(params);
  };

  // Handler saat chapter berubah
  const handleChapterChange = (option) => {
    setSelectedChapter(option);
    setSelectedClass(null); // reset kelas jika chapter berubah
    updateQuery(option, null, selectedMonth, selectedSemester);
  };

  // Handler saat kelas berubah
  const handleClassChange = (option) => {
    setSelectedClass(option);
    updateQuery(selectedChapter, option, selectedMonth, selectedSemester);
  };

  // Handler saat bulan berubah
  const handleMonthChange = (option) => {
    setSelectedMonth(option);
    updateQuery(selectedChapter, selectedClass, option, selectedSemester);
  };

  // Handler saat semester berubah
  const handleSemesterChange = (option) => {
    setSelectedSemester(option);
    updateQuery(selectedChapter, selectedClass, selectedMonth, option);
  };

  return (
    <div className="form-data-container">
      {/* Desktop Layout - Horizontal */}
      <div className="d-none d-lg-flex gap-3">
        <div className="flex-fill">
          <ReactSelect
            options={chapterOptions}
            value={selectedChapter}
            onChange={handleChapterChange}
            placeholder="Pilih Chapter"
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
        </div>
        <div className="flex-fill">
          <ReactSelect
            options={classOptions}
            value={selectedClass}
            onChange={handleClassChange}
            placeholder="Pilih Kelas"
            isDisabled={!selectedChapter}
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
        </div>
        <div className="flex-fill">
          <ReactSelect
            options={monthOptions}
            value={selectedMonth}
            onChange={handleMonthChange}
            placeholder="Pilih Bulan"
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
        </div>
        <div className="flex-fill">
          <ReactSelect
            options={semesterOptions}
            value={selectedSemester}
            onChange={handleSemesterChange}
            placeholder="Pilih Semester"
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
        </div>
      </div>

      {/* Tablet Layout - 2x2 Grid */}
      <div className="d-none d-md-block d-lg-none">
        <div className="row g-3">
          <div className="col-md-6">
            <ReactSelect
              options={chapterOptions}
              value={selectedChapter}
              onChange={handleChapterChange}
              placeholder="Pilih Chapter"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
          <div className="col-md-6">
            <ReactSelect
              options={classOptions}
              value={selectedClass}
              onChange={handleClassChange}
              placeholder="Pilih Kelas"
              isDisabled={!selectedChapter}
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
          <div className="col-md-6">
            <ReactSelect
              options={monthOptions}
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Pilih Bulan"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
          <div className="col-md-6">
            <ReactSelect
              options={semesterOptions}
              value={selectedSemester}
              onChange={handleSemesterChange}
              placeholder="Pilih Semester"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout - Vertical Stack */}
      <div className="d-block d-md-none">
        <div className="d-flex flex-column gap-3">
          <div>
            <label className="form-label fw-semibold mb-2">Chapter</label>
            <ReactSelect
              options={chapterOptions}
              value={selectedChapter}
              onChange={handleChapterChange}
              placeholder="Pilih Chapter"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
          <div>
            <label className="form-label fw-semibold mb-2">Kelas</label>
            <ReactSelect
              options={classOptions}
              value={selectedClass}
              onChange={handleClassChange}
              placeholder="Pilih Kelas"
              isDisabled={!selectedChapter}
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
          <div>
            <label className="form-label fw-semibold mb-2">Bulan</label>
            <ReactSelect
              options={monthOptions}
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Pilih Bulan"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
          <div>
            <label className="form-label fw-semibold mb-2">Semester</label>
            <ReactSelect
              options={semesterOptions}
              value={selectedSemester}
              onChange={handleSemesterChange}
              placeholder="Pilih Semester"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormData;
