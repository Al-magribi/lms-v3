import { Form, Input, Modal, Select, Spin, message } from "antd";
import React, { useEffect } from "react";
import Cancel from "../../../../components/buttons/Cancel";
import Save from "../../../../components/buttons/Save";
import { useAddClassMutation } from "../../../../service/api/main/ApiClass";
import { useGetGradeQuery } from "../../../../service/api/main/ApiGrade";
import { useGetMajorQuery } from "../../../../service/api/main/ApiMajor";

const page = "";
const limit = "";
const search = "";

const FormClass = ({ title, open, setOpen, classData, setClassData }) => {
  const [form] = Form.useForm();

  const { data: grades } = useGetGradeQuery({ page, limit, search });
  const { data: majors } = useGetMajorQuery({ page, limit, search });

  const gradeOptions = grades?.map((item) => ({
    value: item.id,
    label: item.name,
  }));
  const majorOptions = majors?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const [addClass, { isLoading, isSuccess, error, data }] =
    useAddClassMutation();

  const handleClose = () => {
    setOpen(false);
    setClassData();
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (classData) {
      const data = { ...values, id: classData.id };

      addClass(data);
    } else {
      form.resetFields();
    }
  };

  const handleSelectGrade = (value) => {
    form.setFieldsValue({ gradeId: value });
  };

  const handleSelectMajor = (value) => {
    form.setFieldsValue({ majorId: value });
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (classData) {
        form.setFieldsValue({
          name: classData.name,
          gradeId: classData.grade,
          majorId: classData.major,
        });
      } else {
        form.resetFields();
      }
    }
  }, [classData, open]);

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
      okText='Simpan'
      cancelText='Tutup'
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      loading={isLoading}
    >
      <Spin spinning={isLoading} tip='Memuat data...'>
        <Form form={form} onFinish={handleSubmit} layout='vertical'>
          <Form.Item
            name='gradeId'
            label='Pilih Tingkat'
            rules={[{ required: true, message: "Wajid diisi" }]}
          >
            <Select
              placeholder='Pilih Tingkat'
              options={gradeOptions}
              onChange={handleSelectGrade}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>

          <Form.Item name='majorId' label='Pilih Jurusan'>
            <Select
              placeholder='Pilih Jurusan'
              options={majorOptions}
              onChange={handleSelectMajor}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>

          <Form.Item
            name='name'
            label='Nama Kelas'
            rules={[{ required: true, message: "Kolom wajib diisi" }]}
          >
            <Input placeholder='Nama Kelas' />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormClass;
