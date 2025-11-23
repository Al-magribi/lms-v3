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
import React, { useEffect, useMemo } from "react";
import { useUpdateWeightsMutation } from "../../../../service/api/main/ApiSubject";

const { Title, Text } = Typography;

const FormWeight = ({ title, open, onClose, subject }) => {
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const [updateWeights, { data, isLoading, isSuccess, error, reset }] =
    useUpdateWeightsMutation();

  const totalWeight = useMemo(() => {
    const { presensi = 0, attitude = 0, daily = 0, final = 0 } = values || {};
    return presensi + attitude + daily + final;
  }, [values]);

  const handleSubmit = (formValues) => {
    if (totalWeight !== 100) {
      Modal.error({
        title: "Input Tidak Valid",
        content: "Total bobot nilai harus tepat 100%.",
      });
      return;
    }

    const data = { id: subject.id, ...formValues };
    updateWeights(data);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      onClose();
      reset();
      form.resetFields();
    }
    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [data, error, isSuccess, reset]);

  useEffect(() => {
    if (subject) {
      form.setFieldsValue({
        presensi: subject.presensi,
        attitude: subject.attitude,
        daily: subject.daily,
        final: subject.final,
      });
    }
  }, [subject]);
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText='Simpan'
      cancelText='Tutup'
      destroyOnHidden
      onOk={() => form.submit()}
      confirmLoading={isLoading}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit}>
        <Text type='secondary'>
          Pastikan total bobot dari semua komponen penilaian adalah 100%.
        </Text>
        <Divider style={{ marginTop: "12px" }} />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='presensi'
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
                addonAfter='%'
                placeholder='e.g., 10'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='attitude'
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
                addonAfter='%'
                placeholder='e.g., 20'
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='daily'
              label={
                <Space>
                  <BookOutlined />
                  Bobot Nilai Harian
                </Space>
              }
              tooltip='Nilai rerata dari sumatif dan formatif'
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter='%'
                placeholder='e.g., 30'
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='final'
              label={
                <Space>
                  <BookOutlined />
                  Bobot Nilai Akhir
                </Space>
              }
              tooltip='Nilai rerata dari sumatif dan formatif'
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter='%'
                placeholder='e.g., 40'
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {totalWeight === 100 ? (
          <Alert
            message={<Text strong>Total Bobot: {totalWeight}%</Text>}
            description='Total bobot sudah sesuai.'
            type='success'
            showIcon
          />
        ) : (
          <Alert
            message={<Text strong>Total Bobot: {totalWeight}%</Text>}
            description='Total bobot harus tepat 100% untuk dapat menyimpan.'
            type='warning'
            showIcon
          />
        )}
      </Form>
    </Modal>
  );
};

export default FormWeight;
