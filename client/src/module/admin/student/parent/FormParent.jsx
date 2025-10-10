import { Form, Input, Modal, message } from "antd";
import { useSaveParentMutation } from "../../../../service/api/main/ApiParent";
import { useEffect } from "react";

const FormParent = ({ open, onClose, title, parent }) => {
  const [form] = Form.useForm();

  const [saveParent, { data, error, isLoading, isSuccess, reset }] =
    useSaveParentMutation();

  const handleSubmit = (values) => {
    const processedValues = {
      ...values,
      email: values.email ? values.email.toLowerCase() : "",
    };

    if (parent.parent_id) {
      const data = { id: parent.parent_id, ...processedValues };
      saveParent(data);
    } else {
      saveParent(processedValues);
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (parent) {
        form.setFieldsValue({
          nis: parent.nis,
          name: parent.parent_name,
          email: parent.parent_email,
        });
      }
    }
  }, [open, parent]);

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
  }, [data, error, isSuccess]);
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText='Simpan'
      cancelText='Tutup'
      onOk={() => form.submit()}
      destroyOnHidden
      loading={isLoading}
      confirmLoading={isLoading}
    >
      <Form layout='vertical' form={form} onFinish={handleSubmit}>
        <Form.Item
          name='nis'
          label='NIS'
          rules={[{ required: true, message: "NIS wajib diisi" }]}
        >
          <Input placeholder='NIS' />
        </Form.Item>

        <Form.Item
          name='name'
          label='Nama Orang Tua'
          rules={[{ required: true, message: "Nama Orang tua wajib diisi" }]}
        >
          <Input placeholder='Nama Orang Tua' />
        </Form.Item>

        <Form.Item
          name='email'
          label='Email'
          rules={[{ required: true, message: "Email wajib diisi" }]}
        >
          <Input placeholder='Email' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormParent;
