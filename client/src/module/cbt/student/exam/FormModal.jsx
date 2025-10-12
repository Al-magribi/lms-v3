import React, { useState } from "react";
import { Input, message, Modal, Typography, Flex, Alert, Space } from "antd";
import { KeyOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  useAddCbtLogsMutation,
  useGetUserLogQuery,
} from "../../../../service/api/log/ApiLog";
import { useSearchParams } from "react-router-dom";

const { Text, Title } = Typography;

const FormModal = ({ open, onClose, exam }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState("");

  const { user } = useSelector((state) => state.auth);
  const { data: log, isLoading: tokenLoading } = useGetUserLogQuery(
    {
      exam: exam.id,
      student: user?.id,
    },
    { skip: !exam.id || !user?.id }
  );

  const [addCbtLog, { isLoading: addLoading }] = useAddCbtLogsMutation();

  const handleSubmit = async () => {
    // 1. Validasi Ujian
    if (!exam || !exam.id) {
      message.error("Ujian tidak ditemukan");
      return;
    }

    // 2. Validasi Pengguna
    if (!user || !user?.id) {
      message.error("Data pengguna tidak valid");
      return;
    }

    // 3. Validasi Token
    if (token !== exam.token) {
      message.error("Token Salah");
      setToken(""); // Kosongkan input jika salah
      return;
    }

    // 4. Cek penalti
    if (log && log.ispenalty) {
      message.error("Anda melanggar ketentuan");
      setToken("");
      return;
    }

    // 5. Cek sesi aktif
    if (log && log.isactive) {
      message.error("Anda sedang mengikuti ujian");
      setToken("");
      return;
    }

    // 6. Cek jika sudah selesai
    if (log && log.isdone) {
      message.error("Anda sudah mengikuti ujian");
      setToken("");
      return;
    }

    const data = {
      exam: exam.id.toString(),
      student: user?.id.toString(),
    };

    try {
      await addCbtLog(data).unwrap();

      // Jika berhasil, lakukan navigasi dan bersihkan state
      setToken("");
      setSearchParams({
        onExam: true,
        name: exam.name?.replace(/\s+/g, "-"),
        examid: exam?.id,
        token: exam?.token,
      });

      localStorage.removeItem("questions");
      onClose();
    } catch (error) {
      message.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  // Fungsi untuk membersihkan state saat modal ditutup
  const handleCancel = () => {
    setToken(""); // Hapus token dari state
    onClose();
  };

  return (
    <Modal
      title={
        <Flex align='center' gap='small'>
          <KeyOutlined />
          Konfirmasi Token Ujian
        </Flex>
      }
      open={open}
      onCancel={handleCancel}
      okText='Mulai Ujian'
      cancelText='Batal'
      destroyOnHidden
      confirmLoading={tokenLoading || addLoading}
      onOk={handleSubmit}
    >
      {/* --- UI BARU DIMULAI DI SINI --- */}
      <Flex vertical gap='large'>
        <Alert
          message='Perhatian'
          description="Masukkan token yang diberikan oleh pengawas untuk memulai. Pastikan Anda sudah siap sebelum menekan 'Mulai Ujian'."
          type='info'
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* Menampilkan Detail Ujian */}
        <Flex vertical>
          <Text type='secondary'>Anda akan mengerjakan:</Text>
          <Title level={4} style={{ margin: 0 }}>
            {exam.name || "Nama Ujian Tidak Tersedia"}
          </Title>
        </Flex>

        {/* Input yang Ditingkatkan */}
        <Space direction='vertical' style={{ width: "100%" }}>
          <Text strong>Token Ujian</Text>
          <Input
            size='large'
            placeholder='Ketik token di sini'
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onPressEnter={handleSubmit}
            prefix={<KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
          />
        </Space>
      </Flex>
      {/* --- UI BARU BERAKHIR DI SINI --- */}
    </Modal>
  );
};

export default FormModal;
