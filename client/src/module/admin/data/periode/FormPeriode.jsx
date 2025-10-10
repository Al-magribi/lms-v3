import { Form, Input, Modal, Spin, message } from "antd";
import React, { useEffect } from "react";
import Cancel from "../../../../components/buttons/Cancel";
import { useAddPeriodeMutation } from "../../../../service/api/main/ApiPeriode";
import Save from "../../../../components/buttons/Save";

const FormPeriode = ({ title, open, setOpen, periode, setPeriode }) => {
  const [form] = Form.useForm();

  const [addPeriode, { isLoading, data, isSuccess, error }] =
    useAddPeriodeMutation();

  const handleClose = () => {
    setOpen(false);
    setPeriode();
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (periode) {
      const data = { ...values, id: periode.id };
      addPeriode(data);
    } else {
      form.resetFields();
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (periode) {
        form.setFieldsValue({ name: periode.name });
      } else {
        form.resetFields();
      }
    }
  }, [periode, open]);

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
            label="Nama Periode"
            rules={[{ required: true, message: "Kolom wajib diisi" }]}
          >
            <Input placeholder="Nama Periode" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormPeriode;
