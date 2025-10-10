import { Form, Input, message, Modal } from "antd";
import { useAddSurahMutation } from "../../../../service/api/tahfiz/ApiQuran";
import { useEffect } from "react";

const FormVerse = ({ title, open, onClose, surah }) => {
  const [form] = Form.useForm();

  const [addSurah, { data, error, isLoading, isSuccess }] =
    useAddSurahMutation();

  const handleSubmit = (values) => {
    if (surah) {
      const data = {
        id: surah.id,
        name: values.name,
        ayat: Number(values.ayat),
        lines: Number(values.lines),
      };
      addSurah(data);
    } else {
      const data = {
        name: values.name,
        ayat: Number(values.ayat),
        lines: Number(values.lines),
      };
      addSurah(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      onClose();
      form.resetFields();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, error, data]);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (surah) {
        form.setFieldsValue({
          name: surah.name,
          ayat: surah.ayat,
          lines: surah.lines,
        });
      }
    }
  }, [open, surah]);
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      loading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Nama Surah"
          rules={[{ required: true, message: "Nama Surah harus diisi" }]}
        >
          <Input placeholder="Nama Surah" />
        </Form.Item>

        <Form.Item
          name="ayat"
          label="Jumlah Ayat"
          rules={[{ required: true, message: "Jumlah Ayat harus diisi" }]}
        >
          <Input placeholder="Jumlah Ayat" />
        </Form.Item>
        <Form.Item
          name="lines"
          label="Jumlah Baris"
          rules={[{ required: true, message: "Jumlah Baris harus diisi" }]}
        >
          <Input placeholder="Jumlah Baris" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormVerse;
