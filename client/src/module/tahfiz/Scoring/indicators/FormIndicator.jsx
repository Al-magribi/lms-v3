// FormIndicator.jsx
import React, { useEffect } from "react";
import { Form, Modal, Input, Select, message, notification } from "antd";
import {
  useAddIndicatorMutation,
  useGetCategoriesQuery, // Tambahkan import ini
} from "../../../../service/api/tahfiz/ApiMetric";

const FormIndicator = ({ open, onClose, detail, category }) => {
  const [form] = Form.useForm();

  // 1. Hook untuk mengambil daftar kategori untuk dropdown
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({
      page: "",
      limit: "",
      search: "",
    });

  const [addIndicator, { isLoading: isSubmitting }] = useAddIndicatorMutation();

  // 2. Siapkan options untuk komponen Select Ant Design
  const categoryOptions = categories?.categories?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // 3. Logika untuk mengisi form saat modal terbuka
  useEffect(() => {
    if (open) {
      if (detail) {
        // Mode Edit: Isi semua field dari 'detail'
        form.setFieldsValue({
          id: detail.id,
          name: detail.name,
          categoryId: detail.category_id,
        });
      } else {
        // Mode Tambah: Reset form dan set kategori default dari baris yang diklik
        form.resetFields();
        if (category) {
          form.setFieldsValue({ categoryId: category.id });
        }
      }
    }
  }, [open, detail, category, form]);

  // Handler saat form disubmit
  const handleFinish = async (values) => {
    // Gabungkan ID jika dalam mode edit
    const payload = detail ? { ...values, id: detail.id } : values;
    try {
      const res = await addIndicator(payload).unwrap();
      message.success(res.message);
      onClose();
    } catch (err) {
      notification.error({
        message: "Gagal Menyimpan Indikator",
        description: err.data?.message || "Terjadi kesalahan pada server.",
      });
    }
  };

  return (
    <Modal
      title={detail ? `Edit Indikator` : `Tambah Indikator`}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Batal"
      confirmLoading={isSubmitting}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        {/* Field 'id' diperlukan untuk backend tapi disembunyikan */}
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        {/* 4. Tambahkan Form.Item untuk memilih Kategori */}
        <Form.Item
          name="categoryId"
          label="Kategori Penilaian"
          rules={[{ required: true, message: "Silakan pilih kategori!" }]}
        >
          <Select
            showSearch
            placeholder="Pilih Kategori"
            options={categoryOptions}
            loading={isCategoriesLoading}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Nama Indikator"
          rules={[
            { required: true, message: "Nama indikator tidak boleh kosong!" },
          ]}
        >
          <Input placeholder="Contoh: Ketuk, Tuntun, Ulang" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormIndicator;
