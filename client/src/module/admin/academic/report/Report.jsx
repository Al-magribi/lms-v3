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
import { useGetCompletionQuery } from "../../../../service/api/lms/ApiScore";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useGetCategoriesQuery } from "../../../../service/api/main/ApiSubject";

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

const Report = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [month, setMonth] = useState(months[new Date().getMonth()]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Pastikan RTK Query tidak melakukan transformasi yang menghilangkan data pagination
  const { data, isError, isFetching } = useGetCompletionQuery(
    { month, page, limit, search: debouncedSearch, categoryId },
    { skip: !month }
  );

  const { data: catsData } = useGetCategoriesQuery({
    page: "",
    limit: "",
    search: "",
  });

  const handleMonthChange = (value) => setMonth(value);
  const handleCategoryChange = (value) => {
    setCategoryId(value);
    setPage(1);
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

  const columns = [
    // ... Kolom tidak berubah
    { title: "Nama Guru", dataIndex: "teacher", key: "teacher" },
    {
      title: "Absen",
      dataIndex: "present",
      key: "present",
      render: (p) =>
        p ? <Tag color='success'>Sudah</Tag> : <Tag color='error'>Belum</Tag>,
    },
    {
      title: "Sumatif",
      dataIndex: "summative",
      key: "summative",
      render: (s) =>
        s ? <Tag color='success'>Sudah</Tag> : <Tag color='error'>Belum</Tag>,
    },
    {
      title: "Formatif",
      dataIndex: "formative",
      key: "formative",
      render: (f) =>
        f ? <Tag color='success'>Sudah</Tag> : <Tag color='error'>Belum</Tag>,
    },
  ];

  // 1. PASTIKAN DATA DIAMBIL DARI STRUKTUR YANG BENAR
  const statistics = data?.statistics || [];
  const completeness = data ? parseFloat(data.completeness) : 0;
  // Ambil total dari objek pagination, jika tidak ada, default ke 0
  const totalRecords = data?.pagination?.total || 0;

  const isQuerySkipped = !month;

  return (
    <Flex vertical gap='large'>
      <Flex align='center' justify='space-between'>
        <Typography.Title style={{ margin: 0 }} level={5}>
          Statistik Laporan Bulanan
        </Typography.Title>
        <Space>
          <Input.Search
            placeholder='Cari Guru ...'
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            allowClear
          />
          <Select
            style={{ width: 200 }}
            placeholder='Pilih Kategori'
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
            placeholder='Pilih Bulan'
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

      {isFetching && !isQuerySkipped && (
        <Flex justify='center'>
          <Spin />
        </Flex>
      )}
      {isError && (
        <Typography.Text type='danger'>Gagal memuat data.</Typography.Text>
      )}
      {isQuerySkipped && (
        <Typography.Text type='secondary'>Pilih bulan.</Typography.Text>
      )}

      {!isQuerySkipped && !isError && (
        <Flex vertical gap='large'>
          <Flex align='center' gap='large'>
            <Typography.Text>Kelengkapan Nilai (Halaman ini):</Typography.Text>
            <Progress percent={completeness} style={{ flex: 1 }} />
          </Flex>

          {/* 2. PASTIKAN 'total' DI-SET DENGAN BENAR DI SINI */}
          <Table
            dataSource={statistics}
            columns={columns}
            rowKey='teacher'
            bordered
            loading={isFetching}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalRecords, // Ini adalah kunci agar paginasi berfungsi
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default Report;
