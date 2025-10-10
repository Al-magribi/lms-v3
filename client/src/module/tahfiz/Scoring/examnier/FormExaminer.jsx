import React, { useEffect } from "react";
import { useAddExaminerMutation } from "../../../../service/api/tahfiz/ApiExaminer";
import { Form, Input, Modal, message } from "antd";

const FormExaminer = ({ title, open, onClose, examiner }) => {
  const [form] = Form.useForm();

  const [addExaminer, { data, error, isLoading, isSuccess }] =
    useAddExaminerMutation();

  const handleSubmit = (values) => {
    if (examiner) {
      const data = { id: examiner.id, ...values };
      addExaminer(data);
    } else {
      addExaminer(values);
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (examiner) {
        form.setFieldsValue({ name: examiner.name });
      }
    }
  }, [open, examiner]);

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
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name={"name"}
          label="Nama Penguji"
          rules={[{ required: true, message: "Nama Penguji wajib diisi" }]}
        >
          <Input placeholder="Nama Penguji" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormExaminer;
