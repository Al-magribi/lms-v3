import {
  Flex,
  Select,
  Typography,
  Progress,
  Table,
  Tag,
  Spin,
  Space,
  Input,
} from "antd";
import React, { useState, useEffect } from "react";
import { useGetCategoriesQuery } from "../../../../service/api/main/ApiSubject";
import { useGetNewCompletionQuery } from "../../../../service/api/lms/ApiScore";

// Import komponen Modal Details
import Details from "./Details"; // <-- PASTIKAN PATH INI BENAR

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

const NewReport = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [month, setMonth] = useState(months[new Date().getMonth()]);

  // State untuk mengelola modal
  const [modalData, setModalData] = useState({
    open: false,
    title: "",
    done: [],
    undone: [],
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset ke halaman 1 setiap kali search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: catsData } = useGetCategoriesQuery({
    page: "",
    limit: "",
    search: "",
  });

  const { data, isLoading, isError, isFetching } = useGetNewCompletionQuery(
    { month, page, limit, search: debouncedSearch, categoryId },
    { skip: !month } // Jangan fetch jika bulan belum dipilih
  );

  // Handlers untuk Modal
  const handleCloseModal = () => {
    setModalData({ open: false, title: "", done: [], undone: [] });
  };

  const handleTagClick = (title, data) => {
    // Cek apakah data.detail.done adalah sebuah array
    const doneStudents = Array.isArray(data?.detail?.done)
      ? data.detail.done.map((item) => item.student)
      : [];

    // Cek apakah data.detail.undone adalah sebuah array
    const undoneStudents = Array.isArray(data?.detail?.undone)
      ? data.detail.undone.map((item) => item.student)
      : [];

    setModalData({
      open: true,
      title,
      done: doneStudents,
      undone: undoneStudents,
    });
  };

  // Handlers untuk filter
  const handleMonthChange = (value) => setMonth(value);
  const handleCategoryChange = (value) => {
    setCategoryId(value);
    setPage(1); // Reset ke halaman 1
  };
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const monthOpt = months.map((item) => ({ value: item, label: item }));
  const catOpts = catsData?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  // ===================================================================
  // DEFINISI KOLOM & RENDERER PINDAH KE DALAM KOMPONEN
  // Ini agar mereka bisa mengakses `handleTagClick`
  // ===================================================================

  /**
   * Helper function untuk merender detail penyelesaian per chapter.
   * Ini adalah bagian terdalam dari tabel.
   */
  const renderChapterDetails = (chapters) => {
    if (!chapters || chapters.length === 0) {
      return (
        <Typography.Text type="secondary">
          Tidak ada data chapter.
        </Typography.Text>
      );
    }

    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        {chapters.map((chapter) => {
          // Ekstrak data dengan aman, sesuai struktur backend Anda
          const attitude = chapter.details?.[0]?.attitude?.[0];
          const formative = chapter.details?.[0]?.formative?.[0];
          const summative = chapter.details?.[0]?.summative?.[0];

          // Hitung total untuk perbandingan
          const totalAtt = (attitude?.done || 0) + (attitude?.undone || 0);
          const totalForm = (formative?.done || 0) + (formative?.undone || 0);
          const totalSum = (summative?.done || 0) + (summative?.undone || 0);

          // Tentukan warna tag: hijau jika selesai, biru jika belum
          const attColor =
            attitude?.done === totalAtt && totalAtt > 0 ? "green" : "blue";
          const formColor =
            formative?.done === totalForm && totalForm > 0 ? "green" : "blue";
          const sumColor =
            summative?.done === totalSum && totalSum > 0 ? "green" : "blue";

          return (
            <Flex
              vertical
              key={chapter.name}
              style={{
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: 8,
                marginBottom: 8,
                width: "100%",
              }}
            >
              <Typography.Text strong>{chapter.name}</Typography.Text>
              <Space wrap>
                {/* --- TAMBAHKAN onClick DI SINI --- */}
                <Tag
                  style={{ cursor: "pointer" }}
                  color={attColor}
                  onClick={() =>
                    handleTagClick(`Sikap - ${chapter.name}`, attitude)
                  }
                >
                  Sikap: {attitude?.done || 0} / {totalAtt}
                </Tag>
                <Tag
                  style={{ cursor: "pointer" }}
                  color={formColor}
                  onClick={() =>
                    handleTagClick(`Formatif - ${chapter.name}`, formative)
                  }
                >
                  Formatif: {formative?.done || 0} / {totalForm}
                </Tag>
                <Tag
                  style={{ cursor: "pointer" }}
                  color={sumColor}
                  onClick={() =>
                    handleTagClick(`Sumatif - ${chapter.name}`, summative)
                  }
                >
                  Sumatif: {summative?.done || 0} / {totalSum}
                </Tag>
              </Space>
            </Flex>
          );
        })}
      </Space>
    );
  };

  /**
   * Kolom untuk tabel Level 2 (Kelas & Chapters)
   */
  const classColumns = [
    {
      title: "Kelas (Bulan - Semester)",
      dataIndex: "classes",
      key: "classes",
      width: "30%",
    },
    {
      title: "Penyelesaian per Chapter",
      dataIndex: "chapters",
      key: "chapters",
      render: (chapters) => renderChapterDetails(chapters), // Ini akan otomatis memanggil func di atas
    },
  ];

  /**
   * Kolom untuk tabel Level 1 (Mata Pelajaran)
   */
  const subjectColumns = [
    {
      title: "Mata Pelajaran",
      dataIndex: "name",
      key: "name",
    },
  ];

  /**
   * Kolom untuk tabel Level 0 (Guru) - Tabel Utama
   */
  const mainColumns = [
    {
      title: "Nama Guru",
      dataIndex: "name",
      key: "name",
    },
  ];

  return (
    <Flex vertical gap="large">
      {/* BAGIAN FILTER */}
      <Flex align="center" justify="space-between">
        <Typography.Title style={{ margin: 0 }} level={5}>
          Statistik Laporan Bulanan
        </Typography.Title>
        <Space>
          <Input.Search
            placeholder="Cari Guru ..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            allowClear
            style={{ width: 240 }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Pilih Kategori"
            options={catOpts}
            onChange={handleCategoryChange}
            allowClear
            value={categoryId}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            virtual={false}
          />
          <Select
            style={{ width: 200 }}
            showSearch
            allowClear
            placeholder="Pilih Bulan"
            options={monthOpt}
            onChange={handleMonthChange}
            value={month}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            virtual={false}
          />
        </Space>
      </Flex>

      {/* BAGIAN DATA */}
      <Spin spinning={isLoading || isFetching} tip="Memuat data...">
        <Flex vertical gap="middle">
          {/* Progress Bar Global */}
          <Flex gap="large" align="center" style={{ padding: "0 16px" }}>
            <Typography.Title level={5} style={{ margin: 0, minWidth: 200 }}>
              Tingkat Penyelesaian Global
            </Typography.Title>
            <Progress
              percent={parseFloat(data?.completeness) || 0}
              status={isError ? "exception" : "normal"}
              style={{ flex: 1 }}
              showInfo={!isError}
            />
          </Flex>

          {/* Tabel Utama (Guru) */}
          <Table
            dataSource={data?.statistics}
            columns={mainColumns}
            rowKey="name"
            loading={isLoading || isFetching}
            pagination={{
              current: data?.pagination?.page,
              pageSize: data?.pagination?.limit,
              total: data?.pagination?.total,
            }}
            onChange={handleTableChange}
            expandable={{
              // Level 1: Expand Guru -> Tampilkan Mata Pelajaran
              expandedRowRender: (teacherRecord) => (
                <Table
                  columns={subjectColumns} // Menggunakan kolom yang didefinisikan di dalam komponen
                  dataSource={teacherRecord.subjects}
                  rowKey="name"
                  pagination={false}
                  expandable={{
                    // Level 2: Expand Mapel -> Tampilkan Kelas & Chapter
                    expandedRowRender: (subjectRecord) => (
                      <Table
                        columns={classColumns} // Menggunakan kolom yang didefinisikan di dalam komponen
                        dataSource={subjectRecord.details}
                        rowKey="classes"
                        pagination={false}
                      />
                    ),
                    rowExpandable: (subjectRecord) =>
                      subjectRecord.details?.length > 0,
                  }}
                />
              ),
              rowExpandable: (teacherRecord) =>
                teacherRecord.subjects?.length > 0,
            }}
          />
        </Flex>
      </Spin>

      {/* --- RENDER MODAL DI SINI --- */}
      <Details
        open={modalData.open}
        onClose={handleCloseModal}
        title={modalData.title}
        doneList={modalData.done}
        undoneList={modalData.undone}
      />
    </Flex>
  );
};

export default NewReport;
