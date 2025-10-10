import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  Popconfirm,
  message,
  Card,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useAddFamilyDataMutation,
  useDeleteFamilyDataMutation,
} from "../../service/api/database/ApiDatabase";

const { Title } = Typography;

const FamilyData = ({ familyData, onRefetch, userid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const [addFamilyData, { isLoading: isSaving }] = useAddFamilyDataMutation();
  const [deleteFamily, { isLoading: isDeleting }] =
    useDeleteFamilyDataMutation();

  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        birth_date: record.birth_date ? dayjs(record.birth_date) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    const formattedValues = {
      ...values,
      birth_date: dayjs(values.birth_date).format("YYYY-MM-DD"),
    };

    // Payload ini sudah benar, mengirimkan 'id' jika 'editingRecord' ada
    const payload = editingRecord
      ? { ...formattedValues, id: editingRecord.id, userid } // Payload untuk update
      : { ...formattedValues, userid }; // Payload untuk tambah baru

    try {
      await addFamilyData(payload).unwrap();
      message.success(
        editingRecord
          ? "Data anggota keluarga berhasil diperbarui"
          : "Anggota keluarga baru berhasil ditambahkan"
      );
      if (onRefetch) onRefetch();
      handleCancel();
    } catch (error) {
      message.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFamily(id).unwrap();
      message.success("Data anggota keluarga berhasil dihapus");
      if (onRefetch) onRefetch();
    } catch (error) {
      message.error(error.data?.message || "Gagal menghapus data.");
    }
  };

  const columns = [
    { title: "Nama", dataIndex: "name", key: "name" },
    {
      title: "Jenis Kelamin",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (gender === "P" ? "Perempuan" : "Laki-laki"),
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "birth_date",
      key: "birth_date",
      render: (date) => (date ? dayjs(date).format("DD MMMM YYYY") : "-"),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Yakin ingin menghapus?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button icon={<DeleteOutlined />} danger loading={isDeleting}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Title style={{ margin: 0 }} level={5}>
          Anggota Keluarga (selain orang tua)
        </Title>
      }
    >
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Tambah
      </Button>
      <Table
        columns={columns}
        dataSource={familyData}
        rowKey="id"
        scroll={{ x: true }}
      />
      <Modal
        title={
          editingRecord ? "Edit Anggota Keluarga" : "Tambah Anggota Keluarga"
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSaving}
            onClick={() => form.submit()}
          >
            Simpan
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: "Nama harus diisi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Jenis Kelamin"
            rules={[{ required: true, message: "Jenis kelamin harus dipilih" }]}
          >
            <Select
              options={[
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="birth_date"
            label="Tanggal Lahir"
            rules={[{ required: true, message: "Tanggal lahir harus diisi" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default FamilyData;
