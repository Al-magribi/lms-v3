import { Form, Modal, Select, Input, InputNumber, Switch, message } from "antd";
import { useGetTeachersQuery } from "../../../service/api/cbt/ApiBank";
import {
  useCreateExamMutation,
  useGetClassesQuery,
} from "../../../service/api/cbt/ApiExam";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";

const FormExam = ({ title, open, onClose, exam }) => {
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const { data: teachers } = useGetTeachersQuery();
  const { data: classes } = useGetClassesQuery();

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();

  const [bankOptions, setBankOptions] = useState([]);
  const modalTitle = exam ? "Edit Ujian" : title;

  const teacherOpts = useMemo(() => {
    if (!teachers) return [];
    return teachers.map((teacher) => ({
      value: teacher.id,
      label: teacher.name,
      banks: teacher.bank,
    }));
  }, [teachers]);

  const classOpts = useMemo(() => {
    if (!classes) return [];
    return classes.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [classes]);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (exam && teachers) {
        const teacherData = teacherOpts?.find(
          (opt) => opt.value === exam.teacher
        );
        if (teacherData) {
          const initialBankOptions = (teacherData.banks || []).map((bank) => ({
            value: bank.id,
            label: bank.name,
            type: bank.type,
          }));
          setBankOptions(initialBankOptions);
        }

        // ## BAGIAN YANG DIPERBAIKI ##
        form.setFieldsValue({
          ...exam,
          // ✅ Ambil ID dari `exam.classes` dengan mengakses properti 'id'
          classes: (exam.classes || []).map((c) => c.id),
          // ✅ Ambil ID dari `exam.banks` dengan mengakses properti 'id'
          bank: (exam.banks || []).map((b) => b.id),
        });
      } else {
        form.resetFields();
        setBankOptions([]);
        if (user?.level === "teacher" && teacherOpts.length > 0) {
          form.setFieldsValue({ teacher: user.id });
          const teacherData = teacherOpts.find((opt) => opt.value === user.id);
          if (teacherData) {
            const initialBankOptions = (teacherData.banks || []).map(
              (bank) => ({
                value: bank.id,
                label: bank.name,
                type: bank.type,
              })
            );
            setBankOptions(initialBankOptions);
          }
        }
      }
    }
  }, [open, exam, teachers, user, form, teacherOpts]);

  const handleTeacherChange = (value, option) => {
    form.setFieldsValue({ bank: [] });
    if (option) {
      setBankOptions(
        (option.banks || []).map((bank) => ({
          value: bank.id,
          label: bank.name,
          type: bank.type,
        }))
      );
    } else {
      setBankOptions([]);
    }
  };

  const handleBankChange = (selectedIds) => {
    if (selectedIds.length === 0) return;

    const lastSelectedId = selectedIds[selectedIds.length - 1];
    const lastSelectedBank = bankOptions.find(
      (b) => b.value === lastSelectedId
    );

    if (lastSelectedBank?.type === "paket") {
      form.setFieldsValue({ bank: [lastSelectedId] });
    } else {
      const nonPaketIds = selectedIds.filter((id) => {
        const bank = bankOptions.find((b) => b.value === id);
        return bank && bank.type !== "paket";
      });
      form.setFieldsValue({ bank: nonPaketIds });
    }
  };

  // ## FUNGSI HANDLE SUBMIT YANG TELAH DISESUAIKAN ##
  const handleSubmit = async (values) => {
    // 1. Transformasi 'bank' dari array ID menjadi array of object
    // Backend mengharapkan: [{ bankid, pg, essay }]
    // Karena UI tidak menyediakan input untuk pg/essay, kita kirim null
    const transformedBank = values.bank.map((bankId) => ({
      bankid: bankId,
      pg: null,
      essay: null,
    }));

    // 2. Transformasi 'classes' dari array ID menjadi array of object
    // Backend mengharapkan: [{ value }]
    const transformedClasses = values.classes.map((classId) => ({
      value: classId,
    }));

    // 3. Buat payload dengan struktur yang benar
    const payload = {
      ...values,
      bank: transformedBank,
      classes: transformedClasses,
      isshuffle: values.isshuffle || false,
    };

    // 4. Jika 'exam' ada (mode edit), tambahkan 'examid' dan 'token' ke payload
    if (exam) {
      payload.examid = exam.id;
      payload.token = exam.token; // Pastikan object 'exam' memiliki properti token
    }

    try {
      await createExam(payload).unwrap();
      message.success(`Ujian berhasil ${exam ? "diperbarui" : "dibuat"}!`);
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan ujian:", error);
      message.error("Terjadi kesalahan saat menyimpan ujian.");
    }
  };

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onClose}
      destroyOnHidden // Ganti destroyOnHidden menjadi destroyOnClose
      okText='Simpan'
      cancelText='Batal'
      onOk={form.submit} // Disederhanakan
      confirmLoading={isCreating}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        initialValues={{ mc_score: 100, essay_score: 0, isshuffle: false }}
      >
        <Form.Item
          name='teacher'
          label='Pilih Guru'
          rules={[{ required: true, message: "Pilih guru terlebih dahulu" }]}
        >
          <Select
            placeholder='Cari Guru'
            options={teacherOpts}
            onChange={handleTeacherChange}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            virtual={false}
          />
        </Form.Item>

        <Form.Item
          name='bank'
          label='Pilih Bank Soal'
          rules={[
            { required: true, message: "Pilih bank soal terlebih dahulu" },
          ]}
        >
          <Select
            mode='multiple'
            placeholder='Pilih satu atau lebih bank soal'
            options={bankOptions}
            onChange={handleBankChange}
            allowClear
            virtual={false}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name='classes'
          label='Untuk Kelas'
          rules={[{ required: true, message: "Pilih kelas terlebih dahulu" }]}
        >
          <Select
            mode='multiple'
            placeholder='Pilih satu atau lebih kelas'
            options={classOpts}
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
          label='Nama Ujian'
          rules={[{ required: true, message: "Masukkan nama ujian" }]}
        >
          <Input placeholder='maks 30 karakter' maxLength={30} />
        </Form.Item>

        <Form.Item
          name='duration'
          label='Durasi (Menit)'
          rules={[{ required: true, message: "Masukkan durasi ujian" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder='Masukkan durasi dalam menit'
            min={1}
          />
        </Form.Item>

        <Form.Item
          name='mc_score'
          label='Persentase Nilai PG'
          rules={[{ required: true, message: "Masukkan persentase nilai PG" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} />
        </Form.Item>

        <Form.Item
          name='essay_score'
          label='Persentase Nilai Essay'
          rules={[
            { required: true, message: "Masukkan persentase nilai essay" },
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} />
        </Form.Item>

        <Form.Item name='isshuffle' label='Acak Soal?' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormExam;
