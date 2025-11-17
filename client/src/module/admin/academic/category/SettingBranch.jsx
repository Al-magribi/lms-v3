import { Modal, Table, InputNumber, message, Typography } from "antd";
import React, { useState, useEffect } from "react";
import {
  useGetBranchesQuery,
  useUpdateWeightsMutation,
} from "../../../../service/api/main/ApiSubject";

const { Text } = Typography;

const SettingBranch = ({ title, open, onClose, id }) => {
  const { data, isLoading } = useGetBranchesQuery({ id }, { skip: !id });

  const [
    updateWeights,
    { data: updateData, isLoading: updateLoading, isSuccess, error },
  ] = useUpdateWeightsMutation();

  // State untuk menyimpan nilai bobot dari setiap input
  // Strukturnya: { subject_id_1: 20, subject_id_2: 30, ... }
  const [weights, setWeights] = useState({});

  // 1. EFEK: Mereset state bobot ketika modal dibuka/data berubah
  useEffect(() => {
    if (data) {
      // Asumsi: Kita bisa set bobot awal dari data jika ada,
      // tapi untuk kini kita set ke 0 jika belum ada di state.
      const initialWeights = {};
      data.forEach((subject) => {
        initialWeights[subject.subject_id] = weights[subject.subject_id] || 0;
      });
      setWeights(initialWeights);
    }
    // Reset state saat modal ditutup agar tidak bocor
    if (!open) {
      setWeights({});
    }
  }, [data, open]); // <-- Dijalankan saat data atau 'open' berubah

  // 2. VISUALISASI DATA:
  //    Berdasarkan backend di tugas sebelumnya, 'data' akan terlihat seperti ini:
  // [
  //   { "subject_id": 1, "subject_name": "Matematika", "branch_name": "IPA" },
  //   { "subject_id": 2, "subject_name": "Fisika", "branch_name": "IPA" },
  //   { "subject_id": 3, "subject_name": "Kimia", "branch_name": "IPA" }
  // ]

  console.log(data);

  // 3. FUNGSI: Menangani perubahan input bobot
  const handleWeightChange = (subjectId, value) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [subjectId]: value || 0, // Simpan value (atau 0 jika null/undefined)
    }));
  };

  // 5. VALIDASI: Menghitung total bobot saat ini
  const totalWeight = Object.values(weights).reduce((acc, w) => acc + w, 0);

  const handleClose = () => {
    setWeights({});
    onClose();
  };

  // 4. FUNGSI: Menangani submit (tombol "Simpan")
  const handleSubmit = () => {
    // Validasi total harus 100
    if (totalWeight !== 100) {
      message.error(`Total bobot harus 100! (Saat ini: ${totalWeight})`);
      return; // Hentikan submit
    }

    // Ubah format data untuk di-log (sesuai permintaan)
    const dataToSubmit = data.map((subject) => ({
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      weight: weights[subject.subject_id] || 0,
    }));

    updateWeights({ subjects: dataToSubmit });
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(updateData.message);

      handleClose();
    }
    if (error) {
      message.error(error.data.message);
    }
  }, [updateData, isSuccess, error]);

  // 1. EFEK: Mereset state bobot ketika modal dibuka/data berubah
  useEffect(() => {
    // Hanya set state jika modal dibuka DAN data sudah ada
    if (data && open) {
      const initialWeights = {};
      data.forEach((subject) => {
        // AMBIL NILAI DARI 'subject_weight' (sesuai gambar Anda)
        initialWeights[subject.subject_id] = subject.subject_weight || 0;
      });
      setWeights(initialWeights);
    }

    // Reset state saat modal ditutup agar tidak bocor
    if (!open) {
      setWeights({});
    }
  }, [data, open]); // <-- Dijalankan saat data atau 'open' berubah

  // Definisi kolom untuk tabel
  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => index + 1, // Memberi nomor urut
    },
    { title: "Nama rumpun", dataIndex: "branch_name", key: "branch_name" },
    { title: "Pelajaran", dataIndex: "subject_name", key: "subject_name" },
    {
      title: "Bobot (%)",
      dataIndex: "subject_id", // Gunakan subject_id sebagai key
      key: "weight",
      // 3. FUNGSI: Render input untuk setiap baris
      render: (subjectId) => (
        <InputNumber
          min={0}
          max={100}
          value={weights[subjectId] || 0} // Ambil nilai dari state 'weights'
          onChange={(value) => handleWeightChange(subjectId, value)} // Update state saat diubah
          style={{ width: "100px" }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit} // Panggil handleSubmit saat di-klik
      okText="Simpan"
      cancelText="Tutup"
      width={800} // Modal lebih lebar agar tabel muat
      // 5. VALIDASI: Nonaktifkan tombol Simpan jika total bukan 100
      okButtonProps={{ disabled: totalWeight !== 100 }}
      style={{ top: 20 }}
      loading={updateLoading}
      confirmLoading={updateLoading}
    >
      {/* Tambahan: Menampilkan total bobot saat ini */}
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Text strong>Total Bobot: </Text>
        <Text type={totalWeight !== 100 ? "danger" : "success"}>
          {totalWeight} / 100
        </Text>
      </div>

      <div style={{ height: 550, overflowX: "auto" }}>
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={data}
          rowKey="subject_id" // Penting untuk performa dan key React
          pagination={false} // Biasanya tidak perlu pagination di modal
        />
      </div>
    </Modal>
  );
};

export default SettingBranch;
