import { Form, Input, Modal, Spin, message } from "antd";
import React, { useEffect } from "react";
import { useAddContentMutation } from "../../../../service/api/lms/ApiChapter";

const { TextArea } = Input;

const FormContent = ({ title, open, onClose, chapterid, content }) => {
  const [form] = Form.useForm();

  const [addContent, { isLoading, isSuccess, error, data, reset }] =
    useAddContentMutation();

  const handleSubmit = (values) => {
    if (content) {
      const data = { chapterid, contentid: content.content_id, ...values };

      addContent(data);
    } else {
      const data = { chapterid, ...values };

      addContent(data);
    }
  };

  useEffect(() => {
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
  }, [data, isSuccess, error]);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (content) {
        form.setFieldsValue({
          title: content.content_title,
          content: content.content_target,
        });
      }
    }
  }, [content]);
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
    >
      <Spin tip="Memproses Data" spinning={isLoading}>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Judul Materi"
            rules={[{ required: true, message: "Judul Materi Wajib diisi!" }]}
          >
            <Input placeholder="Judul Materi" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Capaian Pembelajaran"
            rules={[{ required: true, message: "Capaian Wajib diisi!" }]}
          >
            <TextArea rows={4} placeholder="Capaian Pembelajaran" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormContent;
