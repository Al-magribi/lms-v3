import { Form, Input, Modal, Spin, message } from "antd";
import React, { useEffect } from "react";
import { useAddHomebaseMutation } from "../../../service/api/center/ApiHomebase";
import Cancel from "../../../components/buttons/Cancel";
import Save from "../../../components/buttons/Save";

const FormHomebase = ({ title, open, setOpen, homebase, setHomebase }) => {
  const [form] = Form.useForm();

  const [addHomebase, { isLoading, isSuccess, error, data }] =
    useAddHomebaseMutation();

  const handleSubmit = (values) => {
    if (homebase) {
      const data = { ...values, id: homebase.id };
      addHomebase(data);
    } else {
      addHomebase(values);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setHomebase();
    form.resetFields();
  };

  useEffect(() => {
    // Reset the form and set new values only when the modal opens
    if (open) {
      form.resetFields();

      if (homebase) {
        form.setFieldsValue({ name: homebase.name });
      } else {
        form.resetFields();
      }
    }
  }, [open, homebase]);

  useEffect(() => {
    if (isSuccess) {
      handleClose();
      message.success(data.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, data, error]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      destroyOnHidden
      footer={[
        <Cancel disabled={isLoading} key="reset" onClick={handleClose} />,
        <Save disabled={isLoading} key="add" onClick={() => form.submit()} />,
      ]}
      style={{ top: 20 }}
    >
      <Spin tip="Memproses data..." spinning={isLoading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nama Satuan"
            rules={[{ required: true, message: "Nama satuan wajib diisi!" }]}
          >
            <Input placeholder="Nama Satuan Pendidikan" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormHomebase;
