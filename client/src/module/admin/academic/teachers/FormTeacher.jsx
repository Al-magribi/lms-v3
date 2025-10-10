import { Form, Modal, message, Input, Select, Checkbox } from "antd";
import { useGetClassQuery } from "../../../../service/api/main/ApiClass";
import { useGetSubjectQuery } from "../../../../service/api/main/ApiSubject";
import { useEffect } from "react";
import { useAddTeacherMutation } from "../../../../service/api/main/ApiTeacher";

const { Option } = Select;

// Constants for API query parameters
const page = "";
const limit = "";
const search = "";

const FormTeacher = ({ title, open, onClose, teacher }) => {
  // RTK Query hooks for fetching data and mutation
  const { data: classData, isLoading: isClassLoading } = useGetClassQuery({
    page,
    limit,
    search,
  });
  const { data: subjectsData, isLoading: isSubjectLoading } =
    useGetSubjectQuery({ page, limit, search });
  const [addTeacher, { isLoading, data: addMessage, isSuccess, error }] =
    useAddTeacherMutation();

  // Ant Design form instance
  const [form] = Form.useForm();

  // Watch the 'homeroom' checkbox value to conditionally render the class selection
  const isHomeroom = Form.useWatch("homeroom", form);

  // Prepare options for Select components
  const classOpts = classData?.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  const subjectOpts = subjectsData?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // Handle form submission
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values };

    if (payload.subjects) {
      payload.subjects = payload.subjects.map((subject) => ({
        value: subject.value,
      }));
    }

    addTeacher(payload);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(addMessage.message);
      form.resetFields();
      onClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [addMessage, isSuccess, error]);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (teacher) {
        // If 'teacher' prop exists, it's an edit, so populate the form
        form.setFieldsValue({
          id: teacher.id,
          username: teacher.username || "",
          name: teacher.name || "",
          gender: teacher.gender || undefined,
          homeroom: teacher.homeroom || false,
          classid: teacher.class || undefined,
          subjects:
            teacher.subjects?.map((subject) => ({
              value: subject.id,
              label: subject.name,
            })) || [],
        });
      }
    }
  }, [open, teacher, form]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText='Simpan'
      cancelText='Tutup'
      confirmLoading={isLoading}
      loading={isLoading}
      onOk={() => form.submit()}
      destroyOnHidden // Ensures form state is reset when the modal is closed
    >
      <Form
        form={form}
        layout='vertical'
        name='teacherForm'
        style={{ marginTop: 24 }}
        onFinish={handleSubmit}
      >
        {/* Hidden input to store the teacher's ID for updates */}
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name='username'
          label='Username'
          rules={[{ required: true, message: "Username is required" }]}
        >
          <Input placeholder='Enter username' />
        </Form.Item>

        <Form.Item
          name='name'
          label='Nama Guru'
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Enter teacher's name" />
        </Form.Item>

        <Form.Item
          name='gender'
          label='Jenis Kelamin'
          rules={[{ required: true, message: "Gender is required" }]}
        >
          <Select placeholder='Select gender'>
            <Option value='L'>Laki-laki</Option>
            <Option value='P'>Perempuan</Option>
          </Select>
        </Form.Item>

        <Form.Item name='subjects' label='Mata Pelajaran'>
          <Select
            mode='multiple'
            allowClear
            placeholder='Select subjects'
            options={subjectOpts}
            loading={isSubjectLoading}
            labelInValue // This prop ensures the value is an object {value, label}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            virtual={false}
          />
        </Form.Item>

        <Form.Item name='homeroom' valuePropName='checked'>
          <Checkbox>Wali Kelas</Checkbox>
        </Form.Item>

        {/* Conditionally render the class selection if 'Wali Kelas' is checked */}
        {isHomeroom && (
          <Form.Item
            name='classid'
            label='Kelas Wali'
            rules={[
              {
                required: true,
                message: "Class is required for a homeroom teacher",
              },
            ]}
          >
            <Select
              placeholder='Select class'
              options={classOpts}
              loading={isClassLoading}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default FormTeacher;
