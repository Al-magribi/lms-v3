import { Form, Input, Modal, message } from "antd";
import React, { useEffect } from "react";
import { useAddTypeMutation } from "../../../../service/api/tahfiz/ApiMetric";

const FormType = ({ title, open, onClose, type }) => {
  const [form] = Form.useForm();

  const [addType, { data, error, isLoading, isSuccess }] = useAddTypeMutation();

  const handleSubmit = (values) => {
    if (type) {
      const data = { id: type.id, ...values };
      addType(data);
    } else {
      addType(values);
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (type) {
        form.setFieldsValue({ name: type.name });
      }
    }
  }, [open, type]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      form.resetFields();
      onClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, error, isSuccess]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      loading={isLoading}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name={"name"}
          label="Jenis Penilaian"
          rules={[{ required: true, message: "Wajib disisi" }]}
        >
          <Input placeholder="Jenis Penilaian" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormType;
