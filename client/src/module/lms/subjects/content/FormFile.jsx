import { Form, Input, Modal, Spin, message, Upload, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useAddContentFileMutation } from "../../../../service/api/lms/ApiChapter";
import { useEffect } from "react";

const { Dragger } = Upload;

const FormFile = ({ title, open, onClose, contentid }) => {
  const [form] = Form.useForm();

  const [addContentFile, { isLoading, isSuccess, error, data, reset }] =
    useAddContentFileMutation();

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append("contentId", contentid);
    formData.append("title", values.title);

    values.files.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    addContentFile(formData);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
    }

    if (isSuccess) {
      message.success(data?.message || "File berhasil diunggah!");
      reset();
      onClose();
      form.resetFields();
    }

    if (error) {
      message.error(
        error.data?.message || "Terjadi kesalahan saat mengunggah."
      );
      reset();
    }
  }, [data, isSuccess, error, onClose, reset, open]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const draggerProps = {
    name: "files",
    multiple: true,
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar",

    beforeUpload: () => false,
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      destroyOnHidden
      maskClosable={false}
    >
      <Spin tip="Mengunggah File..." spinning={isLoading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Nama File"
            rules={[
              { required: true, message: "Nama file tidak boleh kosong!" },
            ]}
          >
            <Input placeholder="Nama File" />
          </Form.Item>

          <Form.Item
            label="Pilih File"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              { required: true, message: "Silakan pilih minimal satu file!" },
            ]}
          >
            <Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Klik atau seret file ke area ini untuk mengunggah
              </p>
              <p className="ant-upload-hint">
                Mendukung unggahan tunggal atau massal. Format yang diizinkan:
                PDF, DOC, PPT, XLS, TXT, ZIP, RAR.
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormFile;
