import React, { useEffect, useMemo } from "react";
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
import {
  useGetWeightingQuery,
  useSaveWeightingMutation,
} from "../../../service/api/lms/ApiScore";

const { Text } = Typography;

const FormWeight = ({ title, open, onClose, subject }) => {
  const [form] = Form.useForm();

  // Use useWatch to track field values in real-time without re-rendering the whole form
  const values = Form.useWatch([], form);

  const { data: weightData, isLoading: getLoading } = useGetWeightingQuery(
    { subjectid: subject.id },
    { skip: !subject.id }
  );

  console.log(weightData);

  const [saveWeighting, { data, isLoading, isSuccess, error }] =
    useSaveWeightingMutation();

  const totalWeight = useMemo(() => {
    const { presensi = 0, attitude = 0, daily = 0 } = values || {};
    return presensi + attitude + daily;
  }, [values]);

  const handleSubmit = (formValues) => {
    if (totalWeight !== 100) {
      Modal.error({
        title: "Input Tidak Valid",
        content: "Total bobot nilai harus tepat 100%.",
      });
      return;
    }

    const data = { subjectid: subject.id, ...formValues };
    saveWeighting(data);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open]);

  useEffect(() => {
    if (weightData) {
      form.setFieldsValue({
        presensi: weightData.presensi,
        attitude: weightData.attitude,
        daily: weightData.daily,
      });
    }
  }, [weightData]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      onClose();
      form.resetFields();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, isSuccess, error]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      destroyOnHidden
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      okButtonProps={{ disabled: totalWeight !== 100 }}
      loading={isLoading || getLoading}
      confirmLoading={isLoading || getLoading}
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
        </Row>

        <Divider />

        {totalWeight === 100 ? (
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
        )}
      </Form>
    </Modal>
  );
};

export default FormWeight;
