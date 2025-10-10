import { useEffect, useState } from "react";
import {
  useDeleteJuzMutation,
  useGetJuzQuery,
} from "../../../../service/api/tahfiz/ApiQuran";
import {
  Card,
  Table,
  Input,
  Typography,
  Tag,
  Space,
  Button,
  Alert,
  Flex,
  Dropdown,
  message,
  Tooltip,
  Modal,
} from "antd";
import {
  BookOutlined,
  ClusterOutlined,
  ContainerOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import FormJuz from "./FormJuz";
import FormAddVerse from "./FormAddVerse";

const { Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const Juzs = () => {
  // State modal
  const [openJuz, setOpenJuz] = useState(false); // Gunakan boolean
  const [detailJuz, setDetailJuz] = useState(null); // Gunakan null untuk initial state
  const [openVerse, setOpenVerse] = useState(false); // Gunakan boolean
  const [detailVerse, setDetailVerse] = useState(null); // Gunakan null untuk initial state

  const [
    deleteJuz,
    { data: delMessage, error: delError, isLoading: delLoading, isSuccess },
  ] = useDeleteJuzMutation();

  // --- Handlers untuk Modal Juz ---
  const handleEditJuz = (item) => {
    setDetailJuz(item);
    setOpenJuz(true);
  };

  const handleCloseJuz = () => {
    setDetailJuz(null);
    setOpenJuz(false);
  };

  // --- Handlers untuk Modal Surah/Verse ---
  const handleAddVerse = (juz) => {
    setDetailJuz(juz);
    setDetailVerse(null); // Pastikan detailVerse kosong untuk mode "Tambah"
    setOpenVerse(true);
  };

  const handleEditVerse = (surah, juz) => {
    setDetailJuz(juz);
    setDetailVerse(surah); // Isi detailVerse dengan data surah yang akan diedit
    setOpenVerse(true);
  };

  const handleCloseVerse = () => {
    setDetailJuz(null);
    setDetailVerse(null);
    setOpenVerse(false);
  };

  // State management untuk pagination dan pencarian
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  const { data, error, isLoading, refetch } = useGetJuzQuery({
    page,
    limit,
    search: searchDebounce,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounce(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "add":
        handleAddVerse(record); // Panggil handler baru
        break;
      case "edit":
        handleEditJuz(record);
        break;
      case "delete":
        confirm({
          title: `Anda yakin ingin menghapus ${record.name}?`,
          content: "Tindakan ini tidak dapat dibatalkan.",
          okText: "Ya, Hapus",
          okType: "danger",
          cancelText: "Batal",
          onOk: () => deleteJuz(record.id),
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
      refetch();
      setPage(1);
    }
    if (delError) {
      message.error(delError.data.message);
    }
  }, [delMessage, delError, isSuccess]);

  const columns = [
    {
      title: "Juz",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Surah yang Terkandung",
      dataIndex: "surah",
      key: "surah",
      render: (surahs, record) => (
        <Space wrap>
          {surahs.map((s) => (
            <Tag
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                margin: "2px",
              }}
            >
              {s.surah} ({s.from_ayat}-{s.to_ayat})
              <Tooltip title="Edit Surah">
                <EditOutlined
                  style={{ marginLeft: 8, cursor: "pointer", color: "#1890ff" }}
                  onClick={() => handleEditVerse(s, record)} // Panggil handler edit dengan data surah (s) dan juz (record)
                />
              </Tooltip>
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Total Ayat",
      dataIndex: "total_ayat",
      key: "total_ayat",
      align: "center",
      width: 100,
    },
    {
      title: "Total Baris",
      dataIndex: "total_line",
      key: "total_line",
      align: "center",
      width: 100,
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: "add",
                label: "Tambah Surah",
                icon: <ContainerOutlined />,
              },
              { key: "edit", label: "Edit Juz", icon: <EditOutlined /> },
              {
                key: "delete",
                label: "Hapus Juz",
                icon: <DeleteOutlined />,
                danger: true,
              },
            ],
            onClick: ({ key }) => handleSelect(record, { key }),
          }}
        >
          Pilihan Aksi
        </Dropdown.Button>
      ),
    },
  ];

  if (error) {
    return (
      <Alert
        message="Error"
        description="Gagal memuat data juz."
        type="error"
        showIcon
      />
    );
  }

  return (
    <>
      <Card
        title={
          <Flex align="center" justify="space-between">
            <Space>
              <BookOutlined />
              <Text>Daftar Juz Al-Qur'an</Text>
            </Space>
            <Button
              color="primary"
              variant="outlined"
              icon={<ClusterOutlined />}
              onClick={() => {
                setDetailJuz(null); // Pastikan detail null untuk mode tambah
                setOpenJuz(true);
              }}
            >
              Tambah Juz
            </Button>
          </Flex>
        }
      >
        <Search
          placeholder="Cari berdasarkan nama juz..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
          enterButton
        />
        <Table
          columns={columns}
          dataSource={data?.juz}
          rowKey="id"
          loading={isLoading || delLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.totalData,
            onChange: (page, pageSize) => {
              setPage(page);
              setLimit(pageSize);
            },
            showSizeChanger: true,
            position: ["bottomRight"],
          }}
          bordered
        />
      </Card>

      <FormJuz
        title={detailJuz ? "Edit Juz" : "Simpan Juz"}
        open={openJuz}
        onClose={handleCloseJuz}
        juz={detailJuz}
      />

      <FormAddVerse
        title={
          detailVerse
            ? `Edit Surah di ${detailJuz?.name}`
            : `Tambahkan surah di ${detailJuz?.name}`
        }
        open={openVerse}
        onClose={handleCloseVerse}
        juz={detailJuz}
        detail={detailVerse} // Kirim `detailVerse` sebagai prop `detail`
      />
    </>
  );
};

export default Juzs;
