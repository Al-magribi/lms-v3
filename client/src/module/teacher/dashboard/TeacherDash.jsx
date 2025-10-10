import MainLayout from "../../../components/layout/MainLayout";
import { useGetTeacherDashboardQuery } from "../../../service/api/dashboard/ApiDashboard";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  List,
  Typography,
  Tag,
  Skeleton,
  Space,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  BankOutlined,
  FolderOpenOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;

// Komponen untuk tampilan skeleton saat loading
const DashboardSkeleton = () => (
  <Space direction="vertical" size="large" style={{ width: "100%" }}>
    <Row gutter={[16, 16]}>
      {[...Array(6)].map((_, index) => (
        <Col xs={24} sm={12} md={8} lg={4} key={index}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </Col>
    </Row>
  </Space>
);

const TeacherDash = () => {
  const { data, isLoading } = useGetTeacherDashboardQuery();

  // Konfigurasi untuk kartu statistik agar lebih mudah dikelola
  const statCards = [
    {
      key: "total_subjects",
      title: "Mata Pelajaran",
      icon: <BookOutlined />,
      color: "#1890ff",
    },
    {
      key: "total_classes",
      title: "Kelas Diajar",
      icon: <TeamOutlined />,
      color: "#52c41a",
    },
    {
      key: "total_exams",
      title: "Total Ujian",
      icon: <FileTextOutlined />,
      color: "#faad14",
    },
    {
      key: "total_banks",
      title: "Bank Soal",
      icon: <BankOutlined />,
      color: "#722ed1",
    },
    {
      key: "total_chapters",
      title: "Total Bab",
      icon: <FolderOpenOutlined />,
      color: "#eb2f96",
    },
    {
      key: "total_material_classes",
      title: "Materi Dibagikan",
      icon: <ReadOutlined />,
      color: "#fa541c",
    },
  ];

  // Konfigurasi kolom untuk tabel ujian
  const examColumns = [
    {
      title: "Nama Ujian",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Durasi",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration} menit`,
    },
    {
      title: "Status",
      dataIndex: "isactive",
      key: "isactive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Aktif" : "Tidak Aktif"}
        </Tag>
      ),
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "createdat",
      key: "createdat",
      render: (date) => moment(date).format("DD MMMM YYYY"),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title={"Dashboard"} levels={["teacher"]}>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={"Dashboard"} levels={["teacher"]}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Bagian Statistik */}
        <Row gutter={[16, 16]}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} md={8} lg={4} key={card.key}>
              <Card hoverable>
                <Statistic
                  title={card.title}
                  value={data?.teachingStats[card.key] || 0}
                  prefix={card.icon}
                  valueStyle={{ color: card.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Bagian Konten Utama (Ujian & Materi) */}
        <Row gutter={[16, 16]}>
          {/* Kolom Ujian Terbaru */}
          <Col xs={24} lg={12}>
            <Card title={<Title level={4}>📝 Ujian Terbaru</Title>}>
              <Table
                dataSource={data?.recentExams}
                columns={examColumns}
                rowKey="id"
                pagination={false}
                scroll={{ x: true }}
              />
            </Card>
          </Col>

          {/* Kolom Materi Terbaru */}
          <Col xs={24} lg={12}>
            <Card title={<Title level={4}>📚 Materi Terbaru</Title>}>
              <List
                itemLayout="horizontal"
                dataSource={data?.recentMaterials}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={`Dibuat pada: ${moment(
                        item.createdat
                      ).format("DD MMMM YYYY")}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </MainLayout>
  );
};

export default TeacherDash;
