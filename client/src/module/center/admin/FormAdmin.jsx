import { Form, Input, Modal, Select, Spin, message } from "antd";
import React, { useEffect } from "react";
import { useGetHomebaseQuery } from "../../../service/api/center/ApiHomebase";
import { useAddAdminMutation } from "../../../service/api/center/ApiAdmin";
import Save from "../../../components/buttons/Save";
import Cancel from "../../../components/buttons/Cancel";

const page = "";
const limit = "";
const search = "";

const FormAdmin = ({ title, open, setOpen, admin, setAdmin }) => {
  const { data: homebase, isLoading } = useGetHomebaseQuery({
    page,
    limit,
    search,
  });
  const [
    addAdmin,
    { isLoading: addLoading, data: addMessage, error, isSuccess },
  ] = useAddAdminMutation();

  const [form] = Form.useForm();
  const selectedLevel = Form.useWatch("level", form);

  const changeLevel = (value) => {
    switch (value) {
      case "pusat":
        form.setFieldsValue({ level: "center" });
        break;
      case "admin":
        form.setFieldsValue({ level: "admin" });
        break;
      case "tahfiz":
        form.setFieldsValue({ level: "tahfiz" });
        break;
      case "cms":
        form.setFieldsValue({ level: "cms" });
        break;
      default:
        break;
    }
  };

  const handleSubmit = (values) => {
    if (admin) {
      const data = { ...values, id: admin.id };
      addAdmin(data);
    } else {
      addAdmin(values);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAdmin();
    form.resetFields();
  };

  const levels = [
    { value: "center", label: "Pusat" },
    { value: "admin", label: "Admin Satuan" },
    { value: "tahfiz", label: "Tahfiz" },
    { value: "cms", label: "Konten" },
  ];

  const homebases = homebase?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const validateMessages = {
    required: "${label} wajib diisi!",
    types: {
      email: "${label} tidak valid!",
      number: "${label} tidak valid!",
    },
  };

  useEffect(() => {
    if (admin) {
      form.setFieldsValue({
        level: admin.level,
        home: admin.homebase,
        name: admin.username,
        email: admin.email,
        phone: admin.phone,
      });
    } else {
      form.resetFields();
    }
  }, [admin]);

  useEffect(() => {
    if (isSuccess) {
      handleClose();
      message.success(addMessage.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, addMessage, error]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      destroyOnHidden
      footer={[
        <Cancel disabled={addLoading} key='reset' onClick={handleClose} />,
        <Save disabled={addLoading} key='add' onClick={() => form.submit()} />,
      ]}
      style={{ top: 20 }}
    >
      <Spin tip='Memporses data..' spinning={addLoading}>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          validateMessages={validateMessages}
        >
          <Form.Item name='level' label='Level' rules={[{ required: true }]}>
            <Select
              placeholder='Pilih Level'
              onChange={changeLevel}
              options={levels}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>

          {selectedLevel === "admin" && (
            <Form.Item name='home' label='Satuan' rules={[{ required: true }]}>
              <Select
                placeholder='Pilih Satuan'
                options={homebases}
                loading={isLoading}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                virtual={false}
              />
            </Form.Item>
          )}

          <Form.Item name='name' label='Username' rules={[{ required: true }]}>
            <Input placeholder='Username' />
          </Form.Item>

          <Form.Item
            name='email'
            label='Email'
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder='Email yang aktif' />
          </Form.Item>

          <Form.Item
            name='phone'
            label='Whatsapp'
            rules={[
              { required: true, message: "Whatsapp wajib diisi!" },
              {
                pattern: /^(62|0)[0-9]{9,15}$/,
                message: "Nomor Whatsapp tidak valid!",
              },
            ]}
          >
            <Input placeholder='62*******' type='tel' />
          </Form.Item>

          <Form.Item
            name='password'
            label='Password'
            rules={[{ required: true, type: "password" }]}
          >
            <Input.Password placeholder='Password' />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormAdmin;
