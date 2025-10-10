import React, { useEffect, useState } from "react";
import { useGetExamScoreListQuery } from "../../../service/api/cbt/ApiAnswer";
import {
  Table,
  Card,
  Input,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Alert,
} from "antd";

const { Title, Text } = Typography;
const { Search } = Input;

const Scores = ({ examid, classid, tableRef }) => {
  // State untuk manajemen paginasi dan pencarian
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [onSearch, setOnSearch] = useState("");

  // Hook RTK Query untuk mengambil data
  const { data, isLoading, isError } = useGetExamScoreListQuery({
    exam: examid,
    classid,
    page,
    limit,
    search: onSearch,
  });

  // Efek untuk debouncing input pencarian (menunda eksekusi pencarian)
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setOnSearch(search);
      if (page !== 1) setPage(1); // Kembali ke halaman 1 jika sedang tidak di halaman 1
    }, 500);

    return () => clearTimeout(timeOut);
  }, [search]);

  // Handler saat ada perubahan pada tabel (paginasi)
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // Konfigurasi kolom untuk Ant Design Table
  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
      width: "5%",
    },
    {
      title: "NIS",
      dataIndex: "student_nis",
      key: "student_nis",
    },
    {
      title: "Nama Siswa",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Tingkat",
      dataIndex: "student_grade",
      key: "student_grade",
    },
    {
      title: "Kelas",
      dataIndex: "student_class",
      key: "student_class",
    },
    {
      title: "Benar",
      dataIndex: "correct",
      key: "correct",
      align: "center",
      render: (correct) => <Text style={{ color: "#52c41a" }}>{correct}</Text>,
    },
    {
      title: "Salah",
      dataIndex: "incorrect",
      key: "incorrect",
      align: "center",
      render: (incorrect) => (
        <Text style={{ color: "#f5222d" }}>{incorrect}</Text>
      ),
    },
    {
      title: "Skor PG",
      dataIndex: "mc_score",
      key: "mc_score",
      align: "center",
    },
    {
      title: "Skor Esai",
      dataIndex: "essay_score",
      key: "essay_score",
      align: "center",
    },
    {
      title: "Nilai Akhir",
      dataIndex: "score",
      key: "score",
      align: "center",
      render: (score) => (
        <Text strong style={{ color: "#1890ff" }}>
          {score}
        </Text>
      ),
    },
  ];

  // Render kondisi error
  if (isError) {
    return (
      <Alert
        message="Terjadi Kesalahan"
        description="Gagal memuat data nilai. Silakan coba lagi nanti."
        type="error"
        showIcon
      />
    );
  }

  const cardTitle = data?.exam_name || "Daftar Nilai";
  const cardDescription = (
    <Space direction="vertical" size="small">
      <Text type="secondary">Guru: {data?.teacher_name}</Text>
      <Text type="secondary">Sekolah: {data?.homebase_name}</Text>
    </Space>
  );

  return (
    <div ref={tableRef}>
      <Card>
        <Title level={4}>{cardTitle}</Title>
        {cardDescription}

        <Row justify="end" style={{ margin: "16px 0" }}>
          <Col>
            <Search
              placeholder="Cari nama atau NIS siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
              allowClear
              enterButton
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data?.students || []}
          rowKey="student_id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.totalData || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} data`,
          }}
          scroll={{ x: "max-content" }} // Membuat tabel responsif horizontal
        />
      </Card>
    </div>
  );
};

export default Scores;
