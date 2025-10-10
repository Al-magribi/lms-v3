import { Form, Input, Modal, message } from "antd";
import { useAddJuzMutation } from "../../../../service/api/tahfiz/ApiQuran";
import { useEffect } from "react";

const FormJuz = ({ title, open, onClose, juz }) => {
  const [form] = Form.useForm();

  const [addJuz, { data, error, isLoading, isSuccess }] = useAddJuzMutation();

  const handleSubmit = (values) => {
    if (juz) {
      const data = { id: juz.id, ...values };
      addJuz(data);
    } else {
      addJuz(values);
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (juz) {
        form.setFieldsValue({ name: juz.name });
      }
    }
  }, [open, juz]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      onClose();
      form.resetFields();
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
      confirmLoading={isLoading}
      loading={isLoading}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Nama Juz"
          rules={[{ required: true, message: "Nama Juz wajiib diisi" }]}
        >
          <Input placeholder="Nama Juz" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormJuz;
