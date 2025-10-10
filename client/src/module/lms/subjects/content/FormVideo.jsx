import { Form, Input, Modal, message } from "antd";
import { useAddContentFileMutation } from "../../../../service/api/lms/ApiChapter";
import { useEffect } from "react";

const FormVideo = ({ title, open, onClose, contentid }) => {
  const [form] = Form.useForm();

  const [addContentFile, { data, error, isLoading, isSuccess, reset }] =
    useAddContentFileMutation();

  const handleSubmit = (values) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(values.video)) {
      message.error("URL tidak valid. Pastikan URL dari YouTube");
      return;
    }

    const data = new FormData();
    data.append("contentId", contentid);
    data.append("title", values.title);
    data.append("video", values.video);

    addContentFile(data);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
    }

    if (isSuccess) {
      message.success(data.message);
      form.resetFields();
      onClose();
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [open, data, isSuccess, error]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      destroyOnHidden
      loading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Judul Video"
          rules={[{ required: true, message: "Judul Wajib diisi" }]}
        >
          <Input placeholder="Judul Video" />
        </Form.Item>

        <Form.Item
          name="video"
          label="YouTube URL"
          rules={[{ required: true, message: "YouTube URL harus diisi" }]}
        >
          <Input placeholder="YouTube URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormVideo;
