import React, { useState } from "react";
import {
  Col,
  Flex,
  Input,
  Row,
  Select,
  Card,
  Table,
  List,
  Grid,
  Spin,
  Empty,
  Typography,
  Tag,
  Button,
  Dropdown,
  message,
  Modal,
} from "antd";
import { DeleteOutlined, MoreOutlined, EditOutlined } from "@ant-design/icons";
import { useGetTypesQuery } from "../../../../service/api/tahfiz/ApiMetric";
import {
  useGetRecordMemoQuery,
  useDeleteJuzReportMutation,
  useDeleteSurahReportMutation,
} from "../../../../service/api/tahfiz/ApiReport";
import dayjs from "dayjs";
import "dayjs/locale/id";
// import FormMemo from "./FormMemo";

dayjs.locale("id");

const { Text } = Typography;

const ExpandedMemoDetail = ({
  student,
  onEdit,
  onDeleteSurah,
  onDeleteJuz,
  isDeleting,
}) => {
  // ==================================================================
  // PERBAIKAN: Komponen detail hafalan disesuaikan dengan data
  // ==================================================================
  // Gunakan `student.records` bukan `student.juzs`
  if (!student.records || student.records.length === 0) {
    return <Empty description="Tidak ada detail hafalan untuk ditampilkan" />;
  }

  return (
    <Flex vertical gap="middle">
      {/* Ganti `student.juzs` menjadi `student.records` */}
      {student.records.map((juz) => (
        <Card
          key={juz.id}
          type="inner"
          // Ganti `juz.name` menjadi `juz.juzName`
          title={`Hafalan ${juz.JuzName}`}
          extra={
            <Button
              key="delete"
              icon={<DeleteOutlined />}
              type="text"
              danger
              onClick={() =>
                Modal.confirm({
                  title: `Hapus Seluruh Hafalan ${juz.JuzName}?`,
                  content: `Semua data hafalan surah di dalam ${juz.JuzName} untuk siswa ini akan dihapus secara permanen.`,
                  okText: "Ya, Hapus",
                  cancelText: "Batal",
                  confirmLoading: isDeleting,
                  onOk: () => onDeleteJuz(student, juz),
                })
              }
            >
              Hapus
            </Button>
          }
        >
          <List
            dataSource={juz.verses}
            renderItem={(verse) => (
              <List.Item
                // Pindahkan tombol Aksi (Edit/Delete) ke setiap item hafalan
                actions={[
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    type="text"
                    onClick={() => onEdit(verse)} // Kirim data 'verse' ke modal
                  >
                    Edit
                  </Button>,
                  <Button
                    key="delete"
                    icon={<DeleteOutlined />}
                    type="text"
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: "Anda yakin?",
                        content: `Hapus hafalan ${verse.name} pada ${dayjs(
                          verse.date
                        ).format("DD MMM YYYY")}?`,
                        // Kirim 'student' dan 'verse' ke fungsi handleDelete
                        onOk: () => onDeleteSurah(student, verse),
                        okText: "Ya, Hapus",
                        cancelText: "Batal",
                        confirmLoading: isDeleting,
                      })
                    }
                  >
                    Hapus
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Flex justify="space-between">
                      <Text>{verse.name}</Text>
                      {/* Tampilkan tipe (jika ada) atau info lain di sini jika perlu */}
                      {/* <Tag color="cyan">Tipe?</Tag> */}
                    </Flex>
                  }
                  description={
                    <Flex vertical>
                      <Text>
                        Ayat {verse.from_ayat} - {verse.to_ayat} | Baris{" "}
                        {verse.from_line} - {verse.to_line}
                      </Text>
                      <Text type="secondary">
                        Tanggal: {dayjs(verse.date).format("DD MMMM YYYY")}
                      </Text>
                      <Text type="secondary">
                        Penguji: {verse.examiner || "N/A"}
                      </Text>
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}
    </Flex>
  );
};

const Report = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [type, setType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [deleteJuzReport, { isLoading: isDeletingJuz }] =
    useDeleteJuzReportMutation();
  const [deleteSurahReport, { isLoading: isDeletingSurah }] =
    useDeleteSurahReportMutation();
  const { data: types } = useGetTypesQuery({ page: "", limit: "", search: "" });
  const { data, isLoading, isFetching } = useGetRecordMemoQuery({
    page,
    limit,
    search,
    type,
  });

  const handleEdit = (verse) => {
    // Sekarang `selectedRecord` adalah objek 'verse'
    setSelectedRecord(verse);
    setIsModalOpen(true);
  };

  // ==================================================================
  // PERBAIKAN: Fungsi handleDelete disesuaikan untuk menerima
  // data 'student' (untuk userid/typeid) dan 'verse' (untuk tanggal)
  // ==================================================================

  const handleDeleteJuz = async (student, juz) => {
    try {
      await deleteJuzReport({
        userid: student.userid,
        juzId: juz.id,
      }).unwrap();
      message.success(`Seluruh hafalan ${juz.JuzName} berhasil dihapus`);
    } catch (error) {
      console.error("Gagal menghapus laporan juz:", error);
      message.error(error.data?.message || "Gagal menghapus laporan juz");
    }
  };

  const handleDeleteSurah = async (student, surah) => {
    try {
      await deleteSurahReport({
        userid: student.userid,
        surahId: surah.id, // surah.id adalah surah_id dari tabel t_surah
        date: dayjs(surah.date).format("YYYY-MM-DD"),
      }).unwrap();
      message.success(`Hafalan ${surah.name} berhasil dihapus`);
    } catch (error) {
      console.error("Gagal menghapus laporan surah:", error);
      message.error(error.data?.message || "Gagal menghapus laporan surah");
    }
  };

  // ==================================================================
  // PERBAIKAN: Kolom disesuaikan dengan data level atas (Siswa)
  // ==================================================================
  const columns = [
    {
      title: "Nama Siswa",
      key: "student",
      render: (_, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary">NIS: {record.nis}</Text>
        </div>
      ),
    },
    {
      title: "Kelas",
      key: "class",
      // Ganti `record.grade` menjadi `record.classname` sesuai gambar
      render: (_, record) => record.classname,
    },
    // Kolom 'Tanggal Penilaian', 'Tipe & Penguji', dan 'Aksi'
    // dipindahkan ke `ExpandedMemoDetail` karena datanya ada di level nested.
  ];

  return (
    <Flex vertical gap="large">
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input.Search
              placeholder="Cari nama atau NIS siswa..."
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              placeholder="Filter berdasarkan tipe"
              style={{ width: "100%" }}
              onChange={(value) => {
                setType(value);
                setPage(1);
              }}
              allowClear
              options={types?.map((t) => ({ value: t.id, label: t.name }))}
              virtual={false}
            />
          </Col>
        </Row>
      </Card>

      <Spin
        spinning={isLoading || isFetching || isDeletingSurah || isDeletingJuz}
      >
        <Card>
          <Table
            columns={columns}
            dataSource={data?.report}
            loading={isLoading || isFetching}
            rowKey="nis" // Asumsi 'id' ada di level siswa, jika tidak ganti ke 'nis'
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.totalData,
              onChange: (p, ps) => {
                setPage(p);
                setLimit(ps);
              },
              showSizeChanger: true,
            }}
            expandable={{
              // Kirim `onEdit`, `onDelete`, dan `isDeleting` ke komponen detail
              expandedRowRender: (student) => (
                <ExpandedMemoDetail
                  student={student}
                  onEdit={handleEdit}
                  onDeleteSurah={handleDeleteSurah} // Hapus per entry
                  onDeleteJuz={handleDeleteJuz} // Hapus per Juz
                  isDeleting={isDeletingSurah || isDeletingJuz}
                />
              ),
              // Ganti pengecekan ke `record.records`
              rowExpandable: (record) =>
                record.records && record.records.length > 0,
            }}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </Spin>

      {/* MODAL EDIT: 
        Pastikan FormMemo (jika di-uncomment) dirancang untuk 
        menerima data 'verse' dalam 'selectedRecord'
      */}
      {/* <Modal
        title="Edit Hafalan"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <FormMemo
          initialValues={selectedRecord}
          onFinish={() => {
            setIsModalOpen(false);
            // Anda mungkin perlu me-refetch data di sini
          }}
        />
      </Modal> */}
    </Flex>
  );
};

export default Report;
