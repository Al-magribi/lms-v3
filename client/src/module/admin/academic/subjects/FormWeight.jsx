import {
  Form,
  InputNumber,
  Modal,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  Space,
  message,
} from "antd";
import {
  PercentageOutlined,
  SmileOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import React from "react";

const { Title, Text } = Typography;

const FormWeight = ({ title, open, onClose, subject }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Text type="secondary">
          Pastikan total bobot dari semua komponen penilaian adalah 100%.
        </Text>
        <Divider style={{ marginTop: "12px" }} />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="presensi"
              label={
                <Space>
                  <PercentageOutlined />
                  Bobot Nilai Kehadiran
                </Space>
              }
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter="%"
                placeholder="e.g., 10"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="attitude"
              label={
                <Space>
                  <SmileOutlined />
                  Bobot Nilai Sikap
                </Space>
              }
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter="%"
                placeholder="e.g., 20"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="daily"
              label={
                <Space>
                  <BookOutlined />
                  Bobot Nilai Harian
                </Space>
              }
              tooltip="Nilai rerata dari sumatif dan formatif"
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter="%"
                placeholder="e.g., 40"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="final"
              label={
                <Space>
                  <BookOutlined />
                  Bobot Nilai Akhir
                </Space>
              }
              tooltip="Nilai rerata dari sumatif dan formatif"
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter="%"
                placeholder="e.g., 40"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* {totalWeight === 100 ? (
          <Alert
            message={<Text strong>Total Bobot: {totalWeight}%</Text>}
            description="Total bobot sudah sesuai."
            type="success"
            showIcon
          />
        ) : (
          <Alert
            message={<Text strong>Total Bobot: {totalWeight}%</Text>}
            description="Total bobot harus tepat 100% untuk dapat menyimpan."
            type="warning"
            showIcon
          />
        )} */}
      </Form>
    </Modal>
  );
};

export default FormWeight;
