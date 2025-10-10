// FormCategory.jsx
import React, { useEffect } from "react";
import { Form, Modal, Input, message, notification } from "antd";
import { useAddCategoryMutation } from "../../../../service/api/tahfiz/ApiMetric";

const FormCategory = ({ open, onClose, detail }) => {
  const [form] = Form.useForm();
  const [addCategory, { isLoading }] = useAddCategoryMutation();

  // Effect untuk mengisi form saat mode edit, atau membersihkan saat mode tambah
  useEffect(() => {
    if (open) {
      if (detail) {
        // Mode Edit: Isi form dengan data dari prop `detail`
        form.setFieldsValue(detail);
      } else {
        // Mode Tambah: Bersihkan form
        form.resetFields();
      }
    }
  }, [open, detail, form]);

  // Handler saat form disubmit (tombol OK diklik)
  const handleFinish = async (values) => {
    // Gabungkan ID jika dalam mode edit
    const payload = detail ? { ...values, id: detail.id } : values;
    try {
      const res = await addCategory(payload).unwrap();
      message.success(res.message);
      onClose(); // Tutup modal setelah berhasil
    } catch (err) {
      notification.error({
        message: "Gagal Menyimpan Kategori",
        description: err.data?.message || "Terjadi kesalahan pada server.",
      });
    }
  };

  return (
    <Modal
      title={detail ? "Edit Kategori Penilaian" : "Tambah Kategori Penilaian"}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Batal"
      confirmLoading={isLoading}
      onOk={() => form.submit()} // Memicu onFinish saat OK diklik
      destroyOnHidden
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        {/* Field 'id' tidak perlu ditampilkan, tapi diperlukan untuk update */}
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="Nama Kategori"
          rules={[
            { required: true, message: "Nama kategori tidak boleh kosong!" },
          ]}
        >
          <Input placeholder="Contoh: Tajwid, Kelancaran, Adab" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormCategory;
