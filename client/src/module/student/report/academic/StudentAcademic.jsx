import React, { useState, useEffect } from "react";
import {
  Flex,
  Select,
  Typography,
  Card,
  Empty,
  Spin,
  Alert,
  Collapse,
  List,
  Tag,
  Divider,
  Descriptions,
  Statistic,
  Row,
  Col,
  Grid,
  Form,
  Button, // No longer needed for modal
  Modal, // No longer needed for modal
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ReadOutlined,
  HomeOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  BookOutlined,
  EyeOutlined, // No longer needed for modal
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import MainLayout from "../../../../components/layout/MainLayout";
import { useGetMonthlyRecapQuery } from "../../../../service/api/lms/ApiRecap";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// ===================================================================
// KOMPONEN UNTUK MENAMPILKAN DETAIL PENILAIAN (TIDAK PERLU DIUBAH)
// Komponen ini sudah bisa menerima data detail dari chapter
// ===================================================================
const SubjectDetail = ({ detail }) => {
  // Defensive checks for potentially missing data
  const attendanceDetail = detail?.[0]?.attendance || [];
  const attitudeDetail = detail?.[1]?.attitude || [];
  const assessmentDetail = detail?.[2] || { summative: [], formative: [] };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} lg={6}>
        <Card size="small" title="Attendance">
          <List
            dataSource={attendanceDetail}
            renderItem={(item) => {
              const key = Object.keys(item)[0];
              const value = item[key];
              return (
                <List.Item>
                  <Text style={{ textTransform: "capitalize" }}>{key}</Text>
                  <Text strong>
                    {key === "presentase" ? `${value}%` : value}
                  </Text>
                </List.Item>
              );
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12} lg={6}>
        <Card size="small" title="Attitude">
          <List
            dataSource={attitudeDetail}
            renderItem={(item) => {
              const key = Object.keys(item)[0];
              const value = item[key];
              return (
                <List.Item>
                  <Text style={{ textTransform: "capitalize" }}>{key}</Text>
                  <Statistic
                    value={value}
                    precision={2}
                    valueStyle={{ fontSize: "1rem" }}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12} lg={8}>
        <Card size="small" title="Summative">
          <List
            dataSource={assessmentDetail.summative}
            renderItem={(item) => {
              const key = Object.keys(item)[0];
              const value = item[key];
              return (
                <List.Item>
                  <Text style={{ textTransform: "capitalize" }}>{key}</Text>
                  <Statistic
                    value={value}
                    precision={2}
                    valueStyle={{ fontSize: "1rem" }}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12} lg={4}>
        <Card size="small" title="Formative">
          <List
            dataSource={assessmentDetail.formative}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            locale={{ emptyText: "-" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// ===================================================================
// KOMPONEN KARTU MATA PELAJARAN (BAGIAN INI YANG DIPERBARUI)
// Logika modal dihapus dan diganti dengan Collapse untuk setiap chapter
// ===================================================================
const SubjectItem = ({ subject }) => {
  return (
    <List.Item key={`${subject.name}-${subject.teacher}`}>
      <Card>
        {/* --- Bagian Header Kartu Mata Pelajaran (Nama, Guru, Nilai Akhir) --- */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="small">
          <div>
            <Title level={5} style={{ marginBottom: 0 }}>
              {subject.name}
            </Title>
            <Text type="secondary">
              <UserOutlined /> Guru: {subject.teacher}
            </Text>
          </div>
          <Statistic
            title="Rata-rata Nilai"
            value={subject.score}
            precision={2}
            valueStyle={{
              color: subject.score >= 75 ? "#3f8600" : "#cf1322",
            }}
            prefix={subject.score >= 75 ? <RiseOutlined /> : <FallOutlined />}
          />
        </Flex>

        {/* --- Bagian Chapter (Menggunakan Collapse) --- */}
        {subject.chapters && subject.chapters.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <BookOutlined /> Detail Penilaian per Chapter
            </Divider>
            <Collapse accordion>
              {subject.chapters.map((chapter) => (
                <Collapse.Panel
                  key={chapter.id}
                  header={
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <Text strong>{chapter.name}</Text>
                      <Statistic
                        title="Nilai"
                        value={chapter.score}
                        precision={2}
                        valueStyle={{
                          fontSize: "1rem",
                          color: chapter.score >= 75 ? "#3f8600" : "#cf1322",
                        }}
                      />
                    </Flex>
                  }
                >
                  {/* Menggunakan kembali komponen SubjectDetail untuk detail chapter */}
                  <SubjectDetail detail={chapter.detail} />

                  {/* Menampilkan catatan spesifik untuk chapter */}
                  {chapter.note && (
                    <>
                      <Divider
                        orientation="left"
                        plain
                        style={{ marginTop: "24px" }}
                      >
                        Catatan Guru Chapter Ini
                      </Divider>
                      <Paragraph italic>"{chapter.note}"</Paragraph>
                    </>
                  )}
                </Collapse.Panel>
              ))}
            </Collapse>
          </>
        )}

        {/* Menampilkan catatan umum untuk mata pelajaran */}
        {subject.note && (
          <>
            <Divider orientation="left" plain>
              Catatan Umum Guru
            </Divider>
            <Paragraph italic>"{subject.note}"</Paragraph>
          </>
        )}
      </Card>
    </List.Item>
  );
};

// ===================================================================
// KOMPONEN UTAMA (TIDAK PERLU DIUBAH SECARA SIGNIFIKAN)
// ===================================================================
const StudentAcademic = () => {
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
  const monthOpts = months.map((month) => ({ label: month, value: month }));

  const [month, setMonth] = useState(null);
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.auth);

  const studentId = user?.id;
  const periode = user?.periode;

  useEffect(() => {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    // Default ke bulan sebelumnya, atau Desember jika bulan ini Januari
    const previousMonthName =
      months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1];
    setMonth(previousMonthName);
    form.setFieldsValue({ month: previousMonthName });
  }, [user, form]); // Dependency array is fine

  const { data, error, isFetching } = useGetMonthlyRecapQuery(
    { studentId, month, periode },
    { skip: !studentId || !month || !periode }
  );

  const screens = useBreakpoint();
  const recapData = data; // Data dari API sudah berupa objek, ini sudah benar

  const renderSubjectList = (subjects) => (
    <List
      itemLayout="vertical"
      dataSource={subjects}
      renderItem={(subject, index) => (
        // Menggunakan id subjek jika ada, jika tidak, kombinasi unik sebagai fallback
        <SubjectItem
          subject={subject}
          key={subject.id || `${subject.name}-${index}`}
        />
      )}
    />
  );

  if (error) {
    return (
      <MainLayout title={`Laporan Akademik ${user?.name}`} levels={["student"]}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="month"
            label={
              <Title level={5} style={{ margin: 0 }}>
                Pilih Bulan Laporan
              </Title>
            }
          >
            <Select
              placeholder="Pilih Bulan"
              onChange={(value) => setMonth(value)}
              options={monthOpts}
              style={{ width: 300 }}
            />
          </Form.Item>
        </Form>

        <Alert
          message="Terjadi Kesalahan"
          description={error?.data?.message || "Gagal memuat data."}
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Laporan Akademik ${user?.name}`} levels={["student"]}>
      <Flex vertical gap="large">
        <Form form={form} layout="vertical">
          <Form.Item
            name="month"
            label={
              <Title level={5} style={{ margin: 0 }}>
                Pilih Bulan Laporan
              </Title>
            }
          >
            <Select
              placeholder="Pilih Bulan"
              onChange={(value) => setMonth(value)}
              options={monthOpts}
              style={{ width: 300 }}
            />
          </Form.Item>
        </Form>

        {isFetching && (
          <div style={{ textAlign: "center", marginTop: 50 }}>
            <Spin size="large" />
          </div>
        )}

        {!isFetching && recapData && (
          <>
            <Descriptions bordered column={screens.md ? 2 : 1} size="small">
              <Descriptions.Item
                label={
                  <>
                    <UserOutlined /> Nama Siswa
                  </>
                }
                span={screens.md ? 2 : 1}
              >
                <Text strong>
                  {recapData.name} ({recapData.nis})
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <HomeOutlined /> Homebase
                  </>
                }
              >
                {recapData.homebase}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <ReadOutlined /> Kelas
                  </>
                }
              >
                {recapData.grade} - {recapData.class}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <TeamOutlined /> Wali Kelas
                  </>
                }
              >
                {recapData.teacher_homeroom}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Periode Laporan
                  </>
                }
              >
                <Text strong>
                  {recapData.periode} - {recapData.month}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Collapse
              accordion
              defaultActiveKey={["0"]}
              ghost
              items={recapData.category.map((cat, index) => ({
                key: String(index), // Key harus string
                label: <Title level={5}>{cat.name}</Title>,
                children:
                  cat.name === "Diniyah" && cat.branch ? (
                    <Collapse
                      items={cat.branch.map((branch, branchIndex) => ({
                        key: String(branchIndex), // Key harus string
                        label: (
                          <Flex
                            justify="space-between"
                            style={{ width: "100%" }}
                          >
                            <Text strong>{branch.name}</Text>
                            <Tag color="blue">
                              Rata-rata Nilai: {branch.score}
                            </Tag>
                          </Flex>
                        ),
                        children: renderSubjectList(branch.subjects),
                      }))}
                    />
                  ) : (
                    renderSubjectList(cat.subjects)
                  ),
              }))}
            />
          </>
        )}

        {!isFetching && !recapData && month && !error && (
          <Card>
            <Empty description="Data laporan untuk bulan yang dipilih tidak tersedia." />
          </Card>
        )}
      </Flex>
    </MainLayout>
  );
};

export default StudentAcademic;
