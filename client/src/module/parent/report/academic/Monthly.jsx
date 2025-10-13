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

const SubjectDetail = ({ detail }) => {
  // Pastikan detail adalah array dan memiliki panjang yang cukup
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

const Monthly = () => {
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const isSmallScreen = !screens.md;

  const studentId = user?.student_id;
  const periode = user?.periode;

  useEffect(() => {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const previousMonthName =
      months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1];
    setMonth(previousMonthName);
    form.setFieldsValue({ month: previousMonthName });
  }, [form, months]);

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
      renderItem={(subject) => (
        <List.Item key={`${subject.name}-${subject.teacher}`}>
          <Card>
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap="small"
            >
              <div>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {subject.name}
                </Title>
                <Text type="secondary">
                  <UserOutlined /> Guru: {subject.teacher}
                </Text>
              </div>
              <Statistic
                title="Nilai Akhir Mapel"
                value={subject.score}
                precision={2}
                valueStyle={{
                  color: subject.score >= 75 ? "#3f8600" : "#cf1322",
                }}
                prefix={
                  subject.score >= 75 ? <RiseOutlined /> : <FallOutlined />
                }
              />
            </Flex>

            {subject.chapters && subject.chapters.length > 0 && (
              <>
                <Divider orientation="left" plain>
                  <BookOutlined /> Chapter Bulan Ini
                </Divider>
                {isSmallScreen ? (
                  <List
                    dataSource={subject.chapters}
                    renderItem={(chapter) => (
                      <List.Item>
                        <Row
                          align="middle"
                          justify="space-between"
                          style={{ width: "100%" }}
                        >
                          <Col xs={24} sm={18}>
                            <Text strong>{chapter.name}</Text>
                            <br />
                            <Text type="secondary">Nilai: {chapter.score}</Text>
                          </Col>
                          <Col xs={24} sm={6}>
                            <Flex justify="end">
                              <Button
                                onClick={() => showChapterDetails(chapter)}
                              >
                                Detail
                              </Button>
                            </Flex>
                          </Col>
                        </Row>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Collapse
                    accordion
                    items={subject.chapters.map((chapter, index) => ({
                      key: index,
                      label: (
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
                              color:
                                chapter.score >= 75 ? "#3f8600" : "#cf1322",
                            }}
                          />
                        </Flex>
                      ),
                      children: (
                        <>
                          <Paragraph italic>
                            <strong>Catatan Guru:</strong> "{chapter.note}"
                          </Paragraph>
                          <Divider plain>Detail Penilaian Chapter</Divider>
                          <SubjectDetail detail={chapter.detail} />
                        </>
                      ),
                    }))}
                  />
                )}
              </>
            )}
          </Card>
        </List.Item>
      )}
    />
  );

  return (
    <Flex vertical gap="middle">
      <Form form={form} layout="vertical">
        <Form.Item
          name="month"
          label={
            <Title level={4} style={{ margin: 0 }}>
              <CalendarOutlined /> Laporan Bulan
            </Title>
          }
          rules={[{ required: true }]}
        >
          <Select
            options={monthOpts}
            onChange={(value) => setMonth(value)}
            style={{ maxWidth: "240px" }}
          />
        </Form.Item>
      </Form>

      {isFetching && <Spin size="large" />}
      {error && (
        <Alert
          message="Error"
          description="Gagal memuat data laporan bulanan."
          type="error"
          showIcon
        />
      )}

      {recapData && (
        <>
          <Card>
            <Descriptions
              title="Data Siswa"
              bordered
              column={isSmallScreen ? 1 : 2}
            >
              <Descriptions.Item label="Nama">
                <UserOutlined /> {recapData.name}
              </Descriptions.Item>
              <Descriptions.Item label="NIS">{recapData.nis}</Descriptions.Item>
              <Descriptions.Item label="Kelas">
                <ReadOutlined /> {recapData.class}
              </Descriptions.Item>
              <Descriptions.Item label="Wali Kelas">
                <TeamOutlined /> {recapData.teacher_homeroom}
              </Descriptions.Item>
              <Descriptions.Item label="Homebase">
                <HomeOutlined /> {recapData.homebase}
              </Descriptions.Item>
              <Descriptions.Item label="Periode">
                <CalendarOutlined /> {recapData.periode}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Collapse
            defaultActiveKey={["0"]}
            items={recapData.category.map((cat, index) => ({
              key: String(index),
              label: (
                <Title level={5} style={{ margin: 0 }}>
                  {cat.name}
                </Title>
              ),
              children: renderSubjectList(cat.subjects),
            }))}
          />
        </>
      )}

      {!isFetching && !recapData && month && !error && (
        <Card>
          <Empty description="Data laporan untuk bulan yang dipilih tidak tersedia." />
        </Card>
      )}

      {selectedChapter && (
        <Modal
          title={`Detail Penilaian: ${selectedChapter.name}`}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="back" onClick={handleModalClose}>
              Tutup
            </Button>,
          ]}
          width={isSmallScreen ? "100vw" : "80vw"}
          style={{ top: 20 }}
        >
          <div style={{ height: "80vh", overflow: "auto" }}>
            <Paragraph italic>
              <strong>Catatan Guru:</strong> "{selectedChapter.note}"
            </Paragraph>
            <Divider plain>Detail Penilaian Chapter</Divider>
            <SubjectDetail detail={selectedChapter.detail} />
          </div>
        </Modal>
      )}
    </Flex>
  );
};

export default Monthly;
