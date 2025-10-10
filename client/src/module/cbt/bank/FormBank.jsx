import { Form, Input, Modal, Select, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useAddBankMutation,
  useGetTeachersQuery,
} from "../../../service/api/cbt/ApiBank";

const page = "";
const limit = "";

const FormBank = ({ open, onClose, title, bank }) => {
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [form] = Form.useForm();

  const { data: teachers, isLoading: isLoadingTeachers } = useGetTeachersQuery({
    page,
    limit,
    search,
  });
  const [
    addBank,
    { data: addMessage, isLoading: addLoading, isSuccess, error },
  ] = useAddBankMutation();

  const teacherOpts =
    teachers?.map((item) => ({
      value: item.id,
      label: item.name,
      subjects: item.subjects,
    })) || [];

  // Functions

  const handleSearchTeacher = (value) => {
    setSearch(value);
  };

  const handleTeacherChange = (value, option) => {
    if (option) {
      const newSubjectOptions = option.subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
      }));
      setSubjectOptions(newSubjectOptions);
    } else {
      setSubjectOptions([]);
    }
    form.setFieldsValue({ subject: undefined });
  };

  const onFinish = (values) => {
    if (bank.id) {
      const data = { id: bank.id, ...values };

      addBank(data);
    } else {
      addBank(values);
    }
  };

  //   Effect
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
      // Selalu reset form saat modal dibuka
      form.resetFields();
      setSubjectOptions([]);

      if (!bank.id) {
        // Mode Tambah Baru
        // SOLUSI: Atur nilai default 'btype' secara eksplisit di sini
        form.setFieldsValue({ btype: "paket" });

        if (user?.level === "teacher" && teachers) {
          const loggedInTeacher = teachers.find((t) => t.id === user.id);
          if (loggedInTeacher) {
            form.setFieldsValue({ teacher: loggedInTeacher.id });
            const newSubjectOptions = loggedInTeacher.subjects.map(
              (subject) => ({
                value: subject.id,
                label: subject.name,
              })
            );
            setSubjectOptions(newSubjectOptions);
          }
        }
      } else if (bank && teachers) {
        // Mode Edit
        const selectedTeacher = teachers.find((t) => t.id === bank.teacher);
        if (selectedTeacher) {
          const newSubjectOptions = selectedTeacher.subjects.map((subject) => ({
            value: subject.id,
            label: subject.name,
          }));
          setSubjectOptions(newSubjectOptions);
        }
        form.setFieldsValue({
          name: bank.name,
          btype: bank.btype,
          teacher: bank.teacher,
          subject: bank.subject,
        });
      }
    }
  }, [open, bank, teachers, form, user]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      cancelText='Tutup'
      okText='Simpan'
      onOk={() => form.submit()}
      confirmLoading={addLoading} // Menampilkan loading pada tombol OK
      forceRender
    >
      <Spin tip='Memproses data...' spinning={addLoading}>
        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}
          // KUNCI 1: 'initialValues' mengatur nilai default saat form dimuat/reset.
          initialValues={{ btype: "paket" }}
        >
          {/* ... Form.Item untuk teacher dan subject ... */}
          <Form.Item
            name='teacher'
            label='Pilih Guru'
            rules={[{ required: true, message: "Pilih guru terlebih dahulu" }]}
          >
            <Select
              placeholder='Ketik untuk mencari guru...'
              allowClear
              showSearch
              onSearch={handleSearchTeacher}
              options={teacherOpts}
              onChange={handleTeacherChange}
              loading={isLoadingTeachers}
              disabled={user?.level === "teacher"}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>
          <Form.Item
            name='subject'
            label='Pilih Mata Pelajaran'
            rules={[
              {
                required: true,
                message: "Pilih mata pelajaran terlebih dahulu",
              },
            ]}
          >
            <Select
              placeholder='Pilih mata pelajaran'
              allowClear
              options={subjectOptions}
              disabled={subjectOptions.length === 0 && !bank}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>
          <Form.Item name='btype' label='Tipe Bank Soal'>
            <Select
              placeholder='Pilih tipe bank soal'
              options={[{ label: "Paket", value: "paket" }]}
              // KUNCI 2: 'disabled' mencegah pengguna mengubah nilai yang sudah di-set.
              disabled
            />
          </Form.Item>

          <Form.Item
            name='name'
            label='Nama Bank Soal'
            rules={[{ required: true, message: "Nama bank soal wajib diisi" }]}
          >
            <Input placeholder='maks 30 karakter' maxLength={30} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormBank;
