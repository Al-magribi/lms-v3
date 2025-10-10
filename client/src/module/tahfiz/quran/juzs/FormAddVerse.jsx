import { Form, Modal, Select, InputNumber, message, notification } from "antd";
import React, { useEffect, useState } from "react";
import {
  useAddSurahToJuzMutation,
  useGetSurahQuery,
} from "../../../../service/api/tahfiz/ApiQuran";

const FormAddVerse = ({ title, open, onClose, juz, detail }) => {
  const [form] = Form.useForm();
  const [selectedSurahId, setSelectedSurahId] = useState(null);

  // Mengambil daftar semua surah untuk dropdown
  const { data: surahList } = useGetSurahQuery({
    page: "",
    limit: "",
    search: "",
  });

  // Hook mutasi untuk menambah/mengedit surah di dalam juz
  const [addSurahToJuz, { isLoading }] = useAddSurahToJuzMutation();

  // Opsi untuk dropdown surah
  const surahOptions = surahList?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // Fungsi untuk menghasilkan opsi ayat berdasarkan surah yang dipilih
  const getAyatOptions = (id) => {
    if (!id || !surahList) return [];
    const selectedSurah = surahList.find((surah) => surah.id === parseInt(id));
    return selectedSurah
      ? Array.from({ length: selectedSurah.ayat }, (_, i) => ({
          label: `Ayat ${i + 1}`,
          value: i + 1,
        }))
      : [];
  };

  // Efek untuk mengisi form saat mode edit
  useEffect(() => {
    if (open) {
      if (detail && juz) {
        // Mode Edit: isi form dengan data `detail`
        form.setFieldsValue({
          id: detail.id,
          juzId: juz.id,
          surahId: detail.surah_id,
          fromAyat: detail.from_ayat,
          toAyat: detail.to_ayat,
          lines: detail.lines,
        });
        setSelectedSurahId(detail.surah_id);
      } else if (juz) {
        // Mode Tambah: pastikan form kosong dan set juzId
        form.resetFields();
        form.setFieldsValue({ juzId: juz.id });
        setSelectedSurahId(null);
      }
    }
  }, [open, detail, juz, form]);

  // Handler saat form disubmit
  const handleFinish = async (values) => {
    try {
      const res = await addSurahToJuz(values).unwrap();
      message.success(res.message);
      onClose(); // Tutup modal setelah berhasil
    } catch (err) {
      notification.error({
        message: "Gagal Menyimpan",
        description: err.data?.message || "Terjadi kesalahan",
      });
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      destroyOnHidden
      confirmLoading={isLoading}
      onOk={() => form.submit()} // Submit form saat tombol OK diklik
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        {/* Field ini disembunyikan, hanya untuk menyimpan data id */}
        <Form.Item name="id" hidden>
          <InputNumber />
        </Form.Item>
        <Form.Item name="juzId" hidden>
          <InputNumber />
        </Form.Item>

        <Form.Item
          name="surahId"
          label="Surah"
          rules={[{ required: true, message: "Silakan pilih surah!" }]}
        >
          <Select
            showSearch
            options={surahOptions}
            placeholder="Pilih Surah"
            onChange={(value) => setSelectedSurahId(value)}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            virtual={false}
          />
        </Form.Item>

        <Form.Item
          name="fromAyat"
          label="Dari Ayat"
          rules={[{ required: true, message: "Silakan pilih ayat awal!" }]}
        >
          <Select
            showSearch
            options={getAyatOptions(selectedSurahId)}
            placeholder="Pilih Ayat Awal"
            disabled={!selectedSurahId}
            virtual={selectedSurahId ? false : true}
          />
        </Form.Item>

        <Form.Item
          name="toAyat"
          label="Sampai Ayat"
          rules={[{ required: true, message: "Silakan pilih ayat akhir!" }]}
        >
          <Select
            showSearch
            options={getAyatOptions(selectedSurahId)}
            placeholder="Pilih Ayat Akhir"
            disabled={!selectedSurahId}
            virtual={selectedSurahId ? false : true}
          />
        </Form.Item>

        <Form.Item name="lines" label="Jumlah Baris">
          <InputNumber
            placeholder="Masukkan jumlah baris"
            style={{ width: "100%" }}
            disabled={!selectedSurahId}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormAddVerse;
