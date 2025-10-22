import React from "react";
import { useGetStudentReportQuery } from "../../../../service/api/tahfiz/ApiReport";
import {
  Button,
  Flex,
  Space,
  Typography,
  Spin,
  Alert,
  Card,
  Descriptions,
  Row,
  Col,
  Statistic,
  Progress,
  Collapse,
  List,
  Empty,
  Tooltip, // Menambahkan Tooltip untuk Progress Bar
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
// const { Panel } = Collapse; // Panel tidak lagi digunakan secara langsung

/**
 * Fungsi helper untuk mengurutkan array Juz berdasarkan angkanya.
 * @param {object} a - Objek pertama (misal: { juz: "Juz 10", ... })
 * @param {object} b - Objek kedua (misal: { juz: "Juz 2", ... })
 * @returns {number} - Hasil perbandingan
 */
const sortJuz = (a, b) => {
  // Ekstrak angka dari string "Juz X"
  const numA = parseInt(a.juz.split(" ")[1], 10);
  const numB = parseInt(b.juz.split(" ")[1], 10);

  // Fallback jika format "Juz X" tidak terdeteksi
  if (isNaN(numA)) return 1;
  if (isNaN(numB)) return -1;

  // Urutkan secara ascending (1, 2, 3, ...)
  return numA - numB;
};

const History = ({ name, userid, onBack }) => {
  const { data, isLoading, error } = useGetStudentReportQuery(userid, {
    skip: !userid,
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert
        message="Gagal Memuat Data"
        description="Terjadi kesalahan saat mengambil data laporan siswa. Silakan coba lagi."
        type="error"
        showIcon
      />
    );
  }

  const studentInfo = data?.student;
  const memorizationData = data?.memorization
    ? [...data.memorization].sort(sortJuz)
    : [];
  const exceedMemoData = data?.exceed ? [...data.exceed].sort(sortJuz) : [];

  return (
    <Flex vertical gap="large">
      <Space>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={onBack} />
        <Title style={{ margin: 0 }} level={4}>{`Laporan Hafalan ${name.replace(
          /-/g,
          " "
        )}`}</Title>
      </Space>

      {studentInfo && (
        <Card
          title={
            <Space>
              <UserOutlined /> Informasi Siswa
            </Space>
          }
          hoverable
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Nama Lengkap">
              {studentInfo.student_name}
            </Descriptions.Item>
            <Descriptions.Item label="NIS">
              {studentInfo.student_nis}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Title level={5}>Laporan Hafalan per Juz (Target)</Title>

      {memorizationData && memorizationData.length > 0 ? (
        memorizationData.map((item) => {
          // Definisikan item untuk Collapse di sini
          const collapseItems = [
            {
              key: "1",
              label: "Lihat Rincian Surah",
              children: (
                <List
                  dataSource={item.surah}
                  renderItem={(surah) => (
                    <List.Item>
                      <List.Item.Meta
                        title={surah.surah_name}
                        description={`Ayat dihafal: ${surah.verse} | Baris dihafal: ${surah.line}`}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ];

          return (
            <Card
              key={item.juz}
              title={
                <Space>
                  <BookOutlined /> {item.juz}
                </Space>
              }
              hoverable
              style={{ width: "100%" }}
            >
              <Flex vertical gap="middle">
                <Tooltip title={`Progress: ${item.progress}%`}>
                  <Progress percent={item.progress} />
                </Tooltip>

                <Row gutter={[16, 16]}>
                  <Col xs={8}>
                    <Statistic title="Total Ayat" value={item.verses} />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Selesai"
                      value={item.completed}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Sisa"
                      value={item.uncompleted}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>

                {/* Gunakan properti 'items' untuk Collapse */}
                <Collapse ghost items={collapseItems} />
              </Flex>
            </Card>
          );
        })
      ) : (
        <Card>
          <Empty description="Belum ada data hafalan (target) yang tercatat untuk siswa ini." />
        </Card>
      )}

      {/* ================================================================
        TAMBAHAN: Bagian untuk menampilkan data hafalan tambahan (exceed)
        ================================================================
      */}
      <Title level={5}>Laporan Hafalan Tambahan (di Luar Target)</Title>

      {exceedMemoData && exceedMemoData.length > 0 ? (
        exceedMemoData.map((item) => {
          // Definisikan item untuk Collapse di sini
          const collapseItems = [
            {
              key: "1",
              label: "Lihat Rincian Surah",
              children: (
                <List
                  dataSource={item.surah}
                  renderItem={(surah) => (
                    <List.Item>
                      <List.Item.Meta
                        title={surah.surah_name}
                        description={`Ayat dihafal: ${surah.verse} | Baris dihafal: ${surah.line}`}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ];

          return (
            <Card
              key={item.juz}
              title={
                <Space>
                  <BookOutlined /> {item.juz}
                </Space>
              }
              hoverable
              style={{ width: "100%" }}
            >
              <Flex vertical gap="middle">
                <Tooltip title={`Progress: ${item.progress}%`}>
                  <Progress percent={item.progress} />
                </Tooltip>

                <Row gutter={[16, 16]}>
                  <Col xs={8}>
                    <Statistic title="Total Ayat" value={item.verses} />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Selesai"
                      value={item.completed}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Sisa"
                      value={item.uncompleted}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>

                {/* Gunakan properti 'items' untuk Collapse */}
                <Collapse ghost items={collapseItems} />
              </Flex>
            </Card>
          );
        })
      ) : (
        <Card>
          <Empty description="Belum ada data hafalan tambahan yang tercatat." />
        </Card>
      )}
    </Flex>
  );
};

export default History;
