import { Form, Input, Modal, Spin, message } from "antd";
import Cancel from "../../../../components/buttons/Cancel";
import Save from "../../../../components/buttons/Save";
import { useSaveCategoryMutation } from "../../../../service/api/main/ApiSubject";
import { useEffect } from "react";

const FormCat = ({ open, onClose, category, title }) => {
  const [form] = Form.useForm();

  const [saveCategory, { isLoading, isSuccess, data, error, reset }] =
    useSaveCategoryMutation();

  const handleSubmit = (values) => {
    if (category) {
      const data = { ...values, id: category.id };
      saveCategory(data);
    } else {
      saveCategory(values);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (category) {
        form.setFieldsValue({ name: category.name });
      } else {
        form.resetFields();
      }
    }
  }, [open, category, form]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      handleClose();
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [isSuccess, data, error]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      okText="Simpan"
      cancelText="Tutup"
      confirmLoading={isLoading}
      loading={isLoading}
      onOk={() => form.submit()}
    >
      <Spin spinning={isLoading} tip="Memperoses data..">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nama Kategori"
            rules={[{ required: true, message: "Nama Wajib diisi" }]}
          >
            <Input placeholder="Nama Kategori" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormCat;
