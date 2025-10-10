import { Form, Input, Modal, Spin, message } from "antd";
import React, { useEffect } from "react";
import Cancel from "../../../../components/buttons/Cancel";
import Save from "../../../../components/buttons/Save";
import { useAddGradeMutation } from "../../../../service/api/main/ApiGrade";

const FormGrade = ({ title, open, setOpen, grade, setGrade }) => {
  const [form] = Form.useForm();

  const [addGrade, { isLoading, isSuccess, error, data }] =
    useAddGradeMutation();

  const handleClose = () => {
    setOpen(false);
    setGrade();
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (grade) {
      const data = { ...values, id: grade.id };

      addGrade(data);
    } else {
      form.resetFields();
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (grade) {
        form.setFieldsValue({ name: grade.name });
      } else {
        form.resetFields();
      }
    }
  }, [grade, open]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      handleClose();
    }

    if (error) {
      console.log(error);
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
            label="Nama Tingkat"
            rules={[{ required: true, message: "Kolom wajib diisi" }]}
          >
            <Input type="number" placeholder="Nama Tingkat" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormGrade;
