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
  useDeleteReportMutation,
} from "../../../../service/api/tahfiz/ApiReport";
import dayjs from "dayjs";
import "dayjs/locale/id";
// import FormMemo from "./FormMemo";

dayjs.locale("id");

const { Text } = Typography;

// Komponen untuk menampilkan detail hafalan (Juz & Surah)
const ExpandedMemoDetail = ({ record }) => {
  if (!record.juzs || record.juzs.length === 0) {
    return <Empty description="Tidak ada detail hafalan untuk ditampilkan" />;
  }
  return (
    <Flex vertical gap="middle">
      {record.juzs.map((juz) => (
        <Card key={juz.id} type="inner" title={`Hafalan ${juz.name}`}>
          <List
            dataSource={juz.verses}
            renderItem={(verse) => (
              <List.Item>
                <List.Item.Meta
                  title={verse.name}
                  description={`Ayat ${verse.from_ayat} - ${verse.to_ayat} | Baris ${verse.from_line} - ${verse.to_line}`}
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

  const { data: types } = useGetTypesQuery({ page: "", limit: "", search: "" });
  const { data, isLoading, isFetching } = useGetRecordMemoQuery({
    page,
    limit,
    search,
    type,
  });
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // ==================================================================
  // PERBAIKAN: Mengaktifkan fungsi handleDelete
  // ==================================================================
  const handleDelete = async (record) => {
    try {
      // Backend mengharapkan format M/D/YYYY, jadi kita format ulang tanggalnya
      const formattedDateForApi = dayjs(record.date).format("M/D/YYYY");

      await deleteReport({
        userid: record.userid,
        typeId: record.type_id,
        createdat: formattedDateForApi,
      }).unwrap();

      message.success("Laporan berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      message.error(error.data?.message || "Gagal menghapus laporan");
    }
  };

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
      render: (_, record) => `${record.grade} - ${record.classname}`,
    },
    {
      title: "Tanggal Penilaian",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD MMMM YYYY"),
    },
    {
      title: "Tipe & Penguji",
      key: "type",
      render: (_, record) => (
        <div>
          <Tag color="cyan">{record.type}</Tag>
          <br />
          <Text type="secondary">{record.examiner || "N/A"}</Text>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: "Edit",
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: "2",
                label: "Hapus",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () =>
                  Modal.confirm({
                    title: "Anda yakin?",
                    content: `Hapus laporan ${record.name} pada ${dayjs(
                      record.date
                    ).format("DD MMM YYYY")}?`,
                    onOk: () => handleDelete(record),
                    okText: "Ya, Hapus",
                    cancelText: "Batal",
                    confirmLoading: isDeleting,
                  }),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} type="text" />
        </Dropdown>
      ),
    },
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

      <Spin spinning={isLoading || isFetching || isDeleting}>
        <Card>
          <Table
            columns={columns}
            dataSource={data?.report}
            loading={isLoading || isFetching}
            rowKey="id"
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
              expandedRowRender: (record) => (
                <ExpandedMemoDetail record={record} />
              ),
              rowExpandable: (record) => record.juzs && record.juzs.length > 0,
            }}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </Spin>

      {selectedRecord && (
        <Modal
          title={`Edit Hafalan - ${selectedRecord.name}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={1000}
          destroyOnClose
        >
          <p>Komponen FormMemo akan ditampilkan di sini.</p>
          {/* <FormMemo initialData={selectedRecord} onCancel={() => setIsModalOpen(false)} /> */}
        </Modal>
      )}
    </Flex>
  );
};

export default Report;
