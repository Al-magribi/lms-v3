import React, { useState, useMemo, useEffect } from "react";
import ReactSelect from "react-select";
import { useGetChaptersQuery } from "../../../controller/api/lms/ApiChapter";
import { useSearchParams, useNavigate } from "react-router-dom";

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 10 }),
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

  // State
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

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

  // Handler untuk update query params
  const updateQuery = (chapter, cls, month) => {
    const params = {};
    // Pertahankan subject dan id
    if (subject) params.subject = subject;
    if (id) params.id = id;
    if (chapter) params.chapterid = chapter.value;
    if (cls) params.classid = cls.value;
    if (month) params.month = month.value;
    setSearchParams(params);
  };

  // Handler saat chapter berubah
  const handleChapterChange = (option) => {
    setSelectedChapter(option);
    setSelectedClass(null); // reset kelas jika chapter berubah
    updateQuery(option, null, selectedMonth);
  };

  // Handler saat kelas berubah
  const handleClassChange = (option) => {
    setSelectedClass(option);
    updateQuery(selectedChapter, option, selectedMonth);
  };

  // Handler saat bulan berubah
  const handleMonthChange = (option) => {
    setSelectedMonth(option);
    updateQuery(selectedChapter, selectedClass, option);
  };

  return (
    <div className="d-flex gap-3">
      <ReactSelect
        options={chapterOptions}
        value={selectedChapter}
        onChange={handleChapterChange}
        placeholder="Pilih Chapter"
        menuPortalTarget={document.body}
        styles={selectStyles}
      />
      <ReactSelect
        options={classOptions}
        value={selectedClass}
        onChange={handleClassChange}
        placeholder="Pilih Kelas"
        isDisabled={!selectedChapter}
        menuPortalTarget={document.body}
        styles={selectStyles}
      />
      <ReactSelect
        options={monthOptions}
        value={selectedMonth}
        onChange={handleMonthChange}
        placeholder="Pilih Bulan"
        menuPortalTarget={document.body}
      />
    </div>
  );
};

export default FormData;
