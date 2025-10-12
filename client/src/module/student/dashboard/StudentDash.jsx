import React from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  List,
  Typography,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  BookOutlined,
  ReadOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import MainLayout from "../../../components/layout/MainLayout";
import { useGetStudentDashboardQuery } from "../../../service/api/dashboard/ApiDashboard";
import dayjs from "dayjs"; // Tambahkan dayjs untuk format tanggal

const { Title, Text } = Typography;

const StudentDash = () => {
  const { data, isLoading, isError } = useGetStudentDashboardQuery();

  if (isLoading) {
    return (
      <MainLayout title={"Dashboard"} levels={["student"]}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Spin size='large' />
        </div>
      </MainLayout>
    );
  }

  if (isError || !data) {
    return (
      <MainLayout title={"Dashboard"} levels={["student"]}>
        <Alert
          message='Error'
          description='Gagal memuat data dashboard. Silakan coba lagi nanti.'
          type='error'
          showIcon
        />
      </MainLayout>
    );
  }

  const { studentInfo, upcomingExams, recentMaterials, quranProgress } = data;

  return (
    <MainLayout title={"Dashboard"} levels={["student"]}>
      <div style={{ padding: "24px" }}>
        {/* Baris Statistik Utama */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title='Kelas'
                value={studentInfo?.class_name || "-"}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title='Total Mata Pelajaran'
                value={studentInfo?.total_subjects || 0}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title='Juz Selesai'
                value={quranProgress?.completed_juz || 0}
                prefix={<ReadOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title='Surah Selesai'
                value={quranProgress?.completed_surah || 0}
                prefix={<ReadOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Baris Konten Materi dan Ujian */}
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          {/* Kolom Materi Terbaru */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <>
                  <FileTextOutlined style={{ marginRight: 8 }} /> Materi Terbaru
                </>
              }
            >
              <List
                itemLayout='horizontal'
                dataSource={recentMaterials}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <a href={`#materi/${item.id}`}>{item.title}</a> // Ganti dengan link yang sesuai
                      }
                      description={`${item.subject_name} - oleh ${item.teacher_name}`}
                    />
                    <Text type='secondary'>
                      {dayjs(item.createdat).format("DD MMM YYYY")}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Kolom Ujian Mendatang */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <>
                  <CalendarOutlined style={{ marginRight: 8 }} /> Ujian
                  Mendatang
                </>
              }
            >
              {upcomingExams && upcomingExams.length > 0 ? (
                <List
                  dataSource={upcomingExams}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.title}
                        description={`${item.subject_name} - ${dayjs(
                          item.date
                        ).format("DD MMM YYYY")}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description='Tidak ada ujian mendatang' />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default StudentDash;
