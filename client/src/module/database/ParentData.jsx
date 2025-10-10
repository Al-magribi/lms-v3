import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  DatePicker,
  message,
  Typography,
  Spin,
  Space,
} from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAddParentsDataMutation } from "../../service/api/database/ApiDatabase";

const { Title } = Typography;

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const numericPhone = phone.replace(/[^0-9+]/g, "");
  if (numericPhone.startsWith("0")) {
    return "62" + numericPhone.substring(1);
  }
  if (numericPhone.startsWith("+62")) {
    return "62" + numericPhone.substring(3);
  }
  return numericPhone;
};

const ParentData = ({ studentData, onRefetch, userid }) => {
  // Jika tidak ada studentData.userid, anggap ini form baru dan langsung masuk mode edit
  const [isEditing, setIsEditing] = useState(!studentData?.userid);
  const [form] = Form.useForm();
  const [addParentsData, { isLoading: isUpdating }] =
    useAddParentsDataMutation();

  useEffect(() => {
    if (studentData) {
      form.setFieldsValue({
        father_name: studentData.father_name,
        father_nik: studentData.father_nik,
        father_birth_place: studentData.father_birth_place,
        father_birth_date: studentData.father_birth_date
          ? dayjs(studentData.father_birth_date)
          : null,
        father_job: studentData.father_job,
        father_phone: studentData.father_phone,
        mother_name: studentData.mother_name,
        mother_nik: studentData.mother_nik,
        mother_birth_place: studentData.mother_birth_place,
        mother_birth_date: studentData.mother_birth_date
          ? dayjs(studentData.mother_birth_date)
          : null,
        mother_job: studentData.mother_job,
        mother_phone: studentData.mother_phone,
      });
    }
  }, [studentData, form]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
    if (studentData) {
      form.setFieldsValue({
        father_name: studentData.father_name,
        father_nik: studentData.father_nik,
        father_birth_place: studentData.father_birth_place,
        father_birth_date: studentData.father_birth_date
          ? dayjs(studentData.father_birth_date)
          : null,
        father_job: studentData.father_job,
        father_phone: studentData.father_phone,
        mother_name: studentData.mother_name,
        mother_nik: studentData.mother_nik,
        mother_birth_place: studentData.mother_birth_place,
        mother_birth_date: studentData.mother_birth_date
          ? dayjs(studentData.mother_birth_date)
          : null,
        mother_job: studentData.mother_job,
        mother_phone: studentData.mother_phone,
      });
    }
  };

  const onFinish = async (values) => {
    const payload = {
      ...values,
      userid: userid, // Gunakan userid dari props
      father_birth_date: values.father_birth_date
        ? dayjs(values.father_birth_date).format("YYYY-MM-DD")
        : null,
      mother_birth_date: values.mother_birth_date
        ? dayjs(values.mother_birth_date).format("YYYY-MM-DD")
        : null,
      father_phone: formatPhoneNumber(values.father_phone),
      mother_phone: formatPhoneNumber(values.mother_phone),
    };

    try {
      await addParentsData(payload).unwrap();
      message.success("Data orang tua berhasil disimpan!");
      setIsEditing(false);
      if (onRefetch) onRefetch();
    } catch (error) {
      message.error(error.data?.message || "Gagal menyimpan data.");
    }
  };

  const renderViewMode = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<Title level={5}>Data Ayah</Title>}>
          <Descriptions bordered column={1} layout="vertical">
            <Descriptions.Item label="Nama">
              {studentData?.father_name}
            </Descriptions.Item>
            <Descriptions.Item label="NIK">
              {studentData?.father_nik}
            </Descriptions.Item>
            <Descriptions.Item label="TTL">{`${
              studentData?.father_birth_place || "-"
            }, ${
              studentData?.father_birth_date
                ? dayjs(studentData.father_birth_date).format("DD MMMM YYYY")
                : "-"
            }`}</Descriptions.Item>
            <Descriptions.Item label="Pekerjaan">
              {studentData?.father_job}
            </Descriptions.Item>
            <Descriptions.Item label="No. Telepon">
              {studentData?.father_phone}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title={<Title level={5}>Data Ibu</Title>}>
          <Descriptions bordered column={1} layout="vertical">
            <Descriptions.Item label="Nama">
              {studentData?.mother_name}
            </Descriptions.Item>
            <Descriptions.Item label="NIK">
              {studentData?.mother_nik}
            </Descriptions.Item>
            <Descriptions.Item label="TTL">{`${
              studentData?.mother_birth_place || "-"
            }, ${
              studentData?.mother_birth_date
                ? dayjs(studentData.mother_birth_date).format("DD MMMM YYYY")
                : "-"
            }`}</Descriptions.Item>
            <Descriptions.Item label="Pekerjaan">
              {studentData?.mother_job}
            </Descriptions.Item>
            <Descriptions.Item label="No. Telepon">
              {studentData?.mother_phone}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );

  const renderEditMode = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<Title level={5}>Data Ayah</Title>}>
          <Form.Item name="father_name" label="Nama">
            <Input />
          </Form.Item>
          <Form.Item name="father_nik" label="NIK">
            <Input />
          </Form.Item>
          <Form.Item name="father_birth_place" label="Tempat Lahir">
            <Input />
          </Form.Item>
          <Form.Item name="father_birth_date" label="Tanggal Lahir">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="father_job" label="Pekerjaan">
            <Input />
          </Form.Item>
          <Form.Item name="father_phone" label="No. Telepon">
            <Input />
          </Form.Item>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title={<Title level={5}>Data Ibu</Title>}>
          <Form.Item name="mother_name" label="Nama">
            <Input />
          </Form.Item>
          <Form.Item name="mother_nik" label="NIK">
            <Input />
          </Form.Item>
          <Form.Item name="mother_birth_place" label="Tempat Lahir">
            <Input />
          </Form.Item>
          <Form.Item name="mother_birth_date" label="Tanggal Lahir">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="mother_job" label="Pekerjaan">
            <Input />
          </Form.Item>
          <Form.Item name="mother_phone" label="No. Telepon">
            <Input />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Spin spinning={isUpdating}>
      <Card
        title={<Title level={5}>Informasi Orang Tua</Title>}
        extra={
          isEditing ? (
            <Space>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={() => form.submit()}
                loading={isUpdating}
              >
                Simpan
              </Button>
              {/* Hanya tampilkan tombol Batal jika ada data awal (mode edit) */}
              {studentData?.userid && (
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Batal
                </Button>
              )}
            </Space>
          ) : (
            <Button icon={<EditOutlined />} type="primary" onClick={handleEdit}>
              Edit
            </Button>
          )
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {isEditing ? renderEditMode() : renderViewMode()}
        </Form>
      </Card>
    </Spin>
  );
};

export default ParentData;
