import React, { useEffect } from "react";
import { Form, Modal, Select, message, notification } from "antd";
import {
  useGetGradesQuery,
  useAddTargetMutation,
} from "../../../../service/api/tahfiz/ApiScoring";
import { useGetJuzQuery } from "../../../../service/api/tahfiz/ApiQuran";

const FormTarget = ({ open, onClose }) => {
  const [form] = Form.useForm();

  // Mengambil data untuk mengisi dropdown
  const { data: gradesData, isLoading: isGradesLoading } = useGetGradesQuery();
  const { data: juzsData, isLoading: isJuzsLoading } = useGetJuzQuery({
    page: "",
    limit: "",
    search: "",
  });

  const [addTarget, { isLoading: isSubmitting }] = useAddTargetMutation();

  // Menyiapkan options untuk komponen Select
  const gradeOptions = gradesData?.map((grade) => ({
    label: grade.name,
    value: grade.id,
  }));

  const juzOptions = juzsData?.map((juz) => ({
    label: juz.name,
    value: juz.id,
  }));

  // Membersihkan form setiap kali modal ditutup
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open]);

  // Handler saat form disubmit
  const handleFinish = async (values) => {
    const { grade_id, juz_ids } = values;

    // Mereplikasi logika dari FormJuz.jsx: membuat array of promises
    const targetPayloads = juz_ids.map((juzId) => ({
      gradeId: grade_id,
      juzId: juzId,
    }));

    // Menjalankan semua mutasi secara paralel
    const promises = targetPayloads.map((target) => addTarget(target).unwrap());

    try {
      await Promise.all(promises);
      message.success(
        `Berhasil menambahkan ${promises.length} target hafalan baru.`
      );
      onClose(); // Tutup modal setelah semua berhasil
    } catch (err) {
      notification.error({
        message: "Gagal Menyimpan Target",
        description:
          err.data?.message ||
          "Terjadi kesalahan saat menyimpan salah satu target.",
      });
    }
  };

  return (
    <Modal
      title="Tambah Target Hafalan Baru"
      open={open}
      onCancel={onClose}
      okText="Simpan Semua"
      cancelText="Batal"
      confirmLoading={isSubmitting}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          name="grade_id"
          label="Tingkat"
          rules={[{ required: true, message: "Silakan pilih tingkat!" }]}
        >
          <Select
            placeholder="Pilih Tingkat"
            options={gradeOptions}
            loading={isGradesLoading}
            virtual={false}
          />
        </Form.Item>

        <Form.Item
          name="juz_ids"
          label="Juz yang Ditargetkan"
          rules={[
            { required: true, message: "Silakan pilih minimal satu juz!" },
          ]}
        >
          <Select
            mode="multiple" // Mengaktifkan mode multi-select
            allowClear
            placeholder="Pilih satu atau lebih juz"
            options={juzOptions}
            loading={isJuzsLoading}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            virtual={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormTarget;
