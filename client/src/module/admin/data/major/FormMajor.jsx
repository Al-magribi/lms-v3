import { Form, Input, Modal, Spin, message } from "antd";
import React, { useEffect } from "react";
import Cancel from "../../../../components/buttons/Cancel";
import { useAddMajorMutation } from "../../../../service/api/main/ApiMajor";
import Save from "../../../../components/buttons/Save";

const FormMajor = ({ title, open, setOpen, major, setMajor }) => {
  const [form] = Form.useForm();

  const [addMajor, { isLoading, isSuccess, error, data }] =
    useAddMajorMutation();

  const handleClose = () => {
    setOpen(false);
    setMajor();
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (major) {
      const data = { ...values, id: major.id };
      console.log(data);
      addMajor(data);
    } else {
      form.resetFields();
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (major) {
        form.setFieldsValue({ name: major.name });
      } else {
        form.resetFields();
      }
    }
  }, [major, open]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      handleClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, isSuccess, error]);

  return (
    <Modal
      open={open}
      title={title}
      destroyOnHidden
      onCancel={handleClose}
      style={{ top: 20 }}
      footer={[
        <Cancel key="cancel" onClick={handleClose} />,
        <Save key="add" onClick={() => form.submit()} />,
      ]}
    >
      <Spin spinning={isLoading} tip="Memuat data...">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Nama Jurusan"
            rules={[{ required: true, message: "Kolom wajib diisi" }]}
          >
            <Input placeholder="Nama Jurusan" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormMajor;
