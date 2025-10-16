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
  Button,
  Modal,
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
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useGetMonthlyRecapQuery } from "../../../../service/api/lms/ApiRecap";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// ===================================================================
// KOMPONEN UNTUK MENAMPILKAN DETAIL PENILAIAN (TIDAK DIUBAH)
// ===================================================================
const SubjectDetail = ({ detail }) => {
  const attendanceDetail = detail?.[0]?.attendance || [];
  const attitudeDetail = detail?.[1]?.attitude || [];
  const assessmentDetail = detail?.[2] || { summative: [], formative: [] };

  console.log(attendanceDetail);

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
// KOMPONEN KARTU MATA PELAJARAN (TIDAK DIUBAH)
// ===================================================================
const SubjectItem = ({ subject, isSmallScreen, onChapterClick }) => {
  return (
    <List.Item key={`${subject.name}-${subject.teacher}`}>
      <Card>
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
            title="Nilai"
            value={subject.score}
            precision={2}
            valueStyle={{
              color: subject.score >= 75 ? "#3f8600" : "#cf1322",
            }}
            prefix={subject.score >= 75 ? <RiseOutlined /> : <FallOutlined />}
          />
        </Flex>

        {subject.chapters && subject.chapters.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <BookOutlined /> Detail Penilaian per Chapter
            </Divider>
            {isSmallScreen ? (
              <List
                itemLayout="vertical"
                dataSource={subject.chapters}
                renderItem={(chapter) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => onChapterClick(chapter)}
                      >
                        Lihat Detail
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text strong>{chapter.name}</Text>}
                      description={`Nilai: ${chapter.score}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
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
                    <SubjectDetail detail={chapter.detail} />
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
            )}
          </>
        )}

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
// PERBAIKAN UTAMA:
// Variabel `months` dan `monthOpts` dipindahkan ke luar komponen.
// Ini mencegah mereka dibuat ulang pada setiap render, yang sebelumnya
// menyebabkan useEffect berjalan terus-menerus dan me-reset pilihan bulan.
// ===================================================================
const months = Array.from({ length: 12 }, (_, i) => {
  return new Date(0, i).toLocaleString("id-ID", { month: "long" });
});
const monthOpts = months.map((month) => ({ label: month, value: month }));

const Monthly = () => {
  const [month, setMonth] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const isSmallScreen = !screens.md;

  const studentId = user?.student_id;
  const periode = user?.periode;

  // PERBAIKAN: Dependensi `months` dihapus dari array.
  // Karena `months` sekarang menjadi konstanta di luar komponen,
  // efek ini dijamin hanya akan berjalan sekali saat komponen dimuat.
  useEffect(() => {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const previousMonthName =
      months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1];
    setMonth(previousMonthName);
    form.setFieldsValue({ month: previousMonthName });
  }, [form]);

  const { data, error, isFetching } = useGetMonthlyRecapQuery(
    { studentId, month, periode },
    { skip: !studentId || !month || !periode }
  );

  const recapData = data && data;

  const showChapterDetails = (chapter) => {
    setSelectedChapter(chapter);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedChapter(null);
  };

  const renderSubjectList = (subjects) => (
    <List
      itemLayout="vertical"
      dataSource={subjects}
      renderItem={(subject, index) => (
        <SubjectItem
          subject={subject}
          key={subject.id || `${subject.name}-${index}`}
          isSmallScreen={isSmallScreen}
          onChapterClick={showChapterDetails}
        />
      )}
    />
  );

  if (error) {
    return (
      <>
        <Flex vertical gap="middle">
          <Form form={form} layout="vertical">
            <Form.Item
              name="month"
              label={
                <Title level={5} style={{ margin: 0 }}>
                  Pilih Bulan
                </Title>
              }
            >
              <Select
                placeholder="Pilih Bulan"
                onChange={(value) => setMonth(value)}
                options={monthOpts}
                style={{ width: isSmallScreen ? "100%" : 300 }}
              />
            </Form.Item>
          </Form>

          <Alert
            message="Terjadi Kesalahan"
            description={error?.data?.message || "Gagal memuat data."}
            type="error"
            showIcon
          />
        </Flex>
      </>
    );
  }

  return (
    <Flex vertical gap="large">
      <Form form={form} layout="vertical">
        <Form.Item
          name="month"
          label={
            <Title level={5} style={{ margin: 0 }}>
              Pilih Bulan
            </Title>
          }
        >
          <Select
            placeholder="Pilih Bulan"
            onChange={(value) => setMonth(value)}
            options={monthOpts}
            style={{ width: isSmallScreen ? "100%" : 300 }}
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
              key: String(index),
              label: <Title level={5}>{cat.name}</Title>,
              children:
                cat.name === "Diniyah" && cat.branch ? (
                  <Collapse
                    items={cat.branch.map((branch, branchIndex) => ({
                      key: String(branchIndex),
                      label: (
                        <Flex justify="space-between" style={{ width: "100%" }}>
                          <Text strong>{branch.name}</Text>
                          <Tag color="blue">Nilai: {branch.score}</Tag>
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

      <Modal
        title={
          <Title level={5}>Detail Penilaian: {selectedChapter?.name}</Title>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Tutup
          </Button>,
        ]}
        width={isSmallScreen ? "90vw" : "80vw"}
      >
        {selectedChapter && <SubjectDetail detail={selectedChapter.detail} />}
      </Modal>

      {!isFetching && !recapData && month && !error && (
        <Card>
          <Empty description="Data laporan untuk bulan yang dipilih tidak tersedia." />
        </Card>
      )}
    </Flex>
  );
};

export default Monthly;
