import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Statistic,
  Empty,
  Divider,
  Alert,
  Space,
  Button,
} from "antd";
import {
  UserOutlined,
  InfoCircleOutlined,
  BookOutlined,
  ContainerOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
  UnorderedListOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Teachers = ({ open, onClose, title, teachers }) => {
  return (
    <Modal
      title={
        <Space>
          <IdcardOutlined />
          {`Detail Guru ${title}`}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={850} // Menyesuaikan lebar modal (mirip modal-lg)
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseCircleOutlined />}>
          Tutup
        </Button>,
      ]}
    >
      {teachers && teachers.length > 0 ? (
        <div
          style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {teachers.map((teacher, index) => (
              <Card
                key={index}
                title={
                  <Space>
                    <UserOutlined />
                    <Text strong>{teacher.name}</Text>
                  </Space>
                }
                bordered={false}
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)" }}
              >
                <Row gutter={[24, 24]}>
                  {/* Kolom Informasi Guru */}
                  <Col xs={24} md={12}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Title level={5} type="secondary">
                        <InfoCircleOutlined /> Informasi Guru
                      </Title>
                      <div>
                        <Text strong>Nama:</Text> <Text>{teacher.name}</Text>
                      </div>
                      <div>
                        <Text strong>Kelas yang diajar:</Text>
                        <div style={{ marginTop: "8px" }}>
                          {teacher.class && teacher.class.length > 0 ? (
                            <>
                              {teacher.class.map((cls, clsIndex) => (
                                <Tag key={clsIndex} color="blue">
                                  {cls.name}
                                </Tag>
                              ))}
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Total: {teacher.class.length} kelas
                              </Text>
                            </>
                          ) : (
                            <Text type="secondary">
                              <ExclamationCircleOutlined /> Belum ditugaskan ke
                              kelas
                            </Text>
                          )}
                        </div>
                      </div>
                    </Space>
                  </Col>

                  {/* Kolom Statistik Materi */}
                  <Col xs={24} md={12}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Title level={5} type="secondary">
                        <BookOutlined /> Statistik Materi
                      </Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Card size="small">
                            <Statistic
                              title="Chapter"
                              value={teacher.chapters || 0}
                              prefix={<ContainerOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card size="small">
                            <Statistic
                              title="Materi"
                              value={teacher.contents || 0}
                              prefix={<FileTextOutlined />}
                              valueStyle={{ color: "#389e0d" }}
                            />
                          </Card>
                        </Col>
                      </Row>
                      {(teacher.chapters > 0 || teacher.contents > 0) && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          Guru aktif mengunggah materi
                        </Tag>
                      )}
                    </Space>
                  </Col>
                </Row>

                <Divider />

                {/* Detail Chapter dan Materi */}
                <div>
                  <Title level={5} type="secondary">
                    <UnorderedListOutlined /> Detail Chapter dan Materi
                  </Title>
                  {teacher.chapters > 0 || teacher.contents > 0 ? (
                    <Alert
                      message={<Text strong>Materi Sudah Tersedia</Text>}
                      description={
                        <Space>
                          <Tag color="cyan">
                            Total Chapter: {teacher.chapters}
                          </Tag>
                          <Tag color="green">
                            Total Materi: {teacher.contents}
                          </Tag>
                        </Space>
                      }
                      type="success"
                      showIcon
                    />
                  ) : (
                    <Alert
                      message="Belum Ada Materi yang Tersedia"
                      description="Guru ini belum mengunggah chapter atau materi untuk mata pelajaran ini."
                      type="warning"
                      showIcon
                      icon={<ExclamationCircleOutlined />}
                    />
                  )}
                </div>
              </Card>
            ))}
          </Space>
        </div>
      ) : (
        <Empty
          image={
            <ExclamationCircleOutlined
              style={{ fontSize: 64, color: "#faad14" }}
            />
          }
          imageStyle={{ height: 80 }}
          description={
            <>
              <Title level={5}>Tidak Ada Data Guru</Title>
              <Text type="secondary">
                Belum ada guru yang ditugaskan untuk mata pelajaran ini.
              </Text>
            </>
          }
        />
      )}
    </Modal>
  );
};

export default Teachers;
