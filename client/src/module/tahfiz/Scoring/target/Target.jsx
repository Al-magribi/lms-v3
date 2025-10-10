import React, { useEffect, useState } from "react";
import {
  useDeleteTargetMutation,
  useGetTargetsQuery,
} from "../../../../service/api/tahfiz/ApiScoring";
import { Table, Button, Flex, Typography, Space, Modal, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import FormTarget from "./FormTarget";

const { Title, Text } = Typography;

const Target = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mengambil data target dan mutation untuk hapus
  const { data: targets, isLoading, refetch } = useGetTargetsQuery();
  const [deleteTarget, { isLoading: isDeleting, isSuccess, error }] =
    useDeleteTargetMutation();

  // Handler untuk menghapus target
  const handleDelete = (targetId, gradeName, juzName) => {
    Modal.confirm({
      title: `Hapus Target?`,
      content: `Anda yakin ingin menghapus target ${juzName} dari tingkat ${gradeName}?`,
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => deleteTarget(targetId),
    });
  };

  // Efek untuk menampilkan notifikasi setelah hapus
  useEffect(() => {
    if (isSuccess) {
      message.success("Target berhasil dihapus.");
      refetch(); // Muat ulang data
    }
    if (error) {
      message.error(error.data?.message || "Gagal menghapus target.");
    }
  }, [isSuccess, error, refetch]);

  // Kolom untuk tabel internal (nested table) yang menampilkan Juz
  const expandedRowRender = (record) => {
    const nestedColumns = [
      { title: "Juz", dataIndex: "juz", key: "juz" },
      {
        title: "Jumlah Ayat",
        dataIndex: "total_ayat",
        key: "total_ayat",
        align: "center",
      },
      {
        title: "Jumlah Baris",
        dataIndex: "total_line",
        key: "total_line",
        align: "center",
      },
      {
        title: "Aksi",
        key: "action",
        align: "center",
        render: (_, nestedRecord) => (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              handleDelete(
                nestedRecord.target_id,
                record.grade,
                nestedRecord.juz
              )
            }
          >
            Hapus
          </Button>
        ),
      },
    ];

    return (
      <Table
        columns={nestedColumns}
        dataSource={record.target}
        rowKey="target_id"
        pagination={false}
      />
    );
  };

  // Kolom untuk tabel utama yang menampilkan Tingkat (Grade)
  const mainColumns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => index + 1,
      width: 70,
    },
    { title: "Tingkat", dataIndex: "grade", key: "grade" },
    {
      title: "Total Ayat",
      dataIndex: "total_ayat",
      key: "total_ayat",
      align: "center",
    },
    {
      title: "Total Baris",
      dataIndex: "total_line",
      key: "total_line",
      align: "center",
    },
  ];

  return (
    <Flex vertical gap="large">
      <Flex justify="end" align="center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Tambah Target
        </Button>
      </Flex>

      <Table
        columns={mainColumns}
        dataSource={targets}
        rowKey="grade"
        loading={isLoading || isDeleting}
        expandable={{ expandedRowRender }}
        pagination={false}
        bordered
        title={() => <Text strong>Daftar Target Berdasarkan Tingkat</Text>}
      />

      <FormTarget
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refetch(); // Muat ulang data setelah modal ditutup
        }}
      />
    </Flex>
  );
};

export default Target;
