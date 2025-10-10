import React, { useEffect, useState } from "react";
import {
  useDeleteCategoryMutation,
  useDeleteIndicatorMutation,
  useGetCategoriesQuery,
} from "../../../../service/api/tahfiz/ApiMetric";
import {
  Dropdown,
  Flex,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
  Modal, // Import Modal untuk konfirmasi
} from "antd";
import Add from "../../../../components/buttons/Add";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined, // Ikon untuk tambah indikator
} from "@ant-design/icons";
import FormCategory from "./FormCategory";
import FormIndicator from "./FormIndicator";

const Indicators = () => {
  // State untuk pagination dan search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // State untuk modal (asumsi Anda akan membuat form terpisah)
  const [openCategory, setOpenCategory] = useState(false);
  const [detailCategory, setDetailCategory] = useState(null);
  const [openIndicator, setOpenIndicator] = useState(false);
  const [detailIndicator, setDetailIndicator] = useState(null);

  // Hook RTK Query
  const { data, isLoading, refetch } = useGetCategoriesQuery({
    page,
    limit,
    search: debounced,
  });

  const [
    deleteCategory,
    {
      isLoading: isCategoryDeleting,
      isSuccess: isCategorySuccess,
      error: categoryError,
    },
  ] = useDeleteCategoryMutation();

  const [
    deleteIndicator,
    {
      isLoading: isIndicatorDeleting,
      isSuccess: isIndicatorSuccess,
      error: indicatorError,
    },
  ] = useDeleteIndicatorMutation();

  // Handler untuk aksi pada Kategori (baris utama)
  const handleCategoryAction = (record, { key }) => {
    switch (key) {
      case "add_indicator":
        // Logika untuk membuka modal tambah indikator
        setDetailCategory(record); // Simpan kategori induk
        setDetailIndicator(null); // Kosongkan detail indikator
        setOpenIndicator(true);
        message.info(`Menambahkan indikator untuk kategori: ${record.name}`);
        break;
      case "edit_category":
        // Logika untuk membuka modal edit kategori
        setDetailCategory(record);
        setOpenCategory(true);
        break;
      case "delete_category":
        Modal.confirm({
          title: `Anda yakin ingin menghapus kategori "${record.name}"?`,
          content: "Semua indikator di dalamnya juga akan terhapus.",
          okText: "Ya, Hapus",
          okType: "danger",
          cancelText: "Batal",
          onOk: () => deleteCategory(record.id),
        });
        break;
      default:
        break;
    }
  };

  // Handler untuk menghapus Indikator
  const handleDeleteIndicator = (indicator) => {
    Modal.confirm({
      title: `Anda yakin ingin menghapus indikator "${indicator.name}"?`,
      content: "Tindakan ini tidak dapat dibatalkan.",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => deleteIndicator(indicator.id),
    });
  };

  // Handler untuk mengedit Indikator
  const handleEditIndicator = (indicator, category) => {
    setDetailCategory(category); // Simpan kategori induk
    setDetailIndicator(indicator); // Simpan detail indikator yang akan diedit
    setOpenIndicator(true);
  };

  // Effect untuk debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // Effect untuk menampilkan message setelah mutasi
  useEffect(() => {
    if (isCategorySuccess || isIndicatorSuccess) {
      message.success("Data berhasil dihapus.");
      refetch(); // Muat ulang data setelah berhasil
    }
    if (categoryError || indicatorError) {
      message.error(
        categoryError?.data?.message ||
          indicatorError?.data?.message ||
          "Gagal menghapus data."
      );
    }
  }, [
    isCategorySuccess,
    isIndicatorSuccess,
    categoryError,
    indicatorError,
    refetch,
  ]);

  const columns = [
    {
      title: "No",
      key: "no",
      width: 70,
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Kategori Penilaian",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Indikator Penilaian",
      dataIndex: "indicators",
      key: "indicators",
      render: (indicators, record) => (
        <Space wrap>
          {/* PERBAIKAN: Cek apakah indicators adalah array dan filter nilai null */}
          {Array.isArray(indicators) &&
            indicators
              .filter((item) => item) // Filter item yang null
              .map((item) => (
                <Tag
                  key={item.id}
                  closable // Jadikan tag bisa dihapus
                  onClose={() => handleDeleteIndicator(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    margin: "2px",
                  }}
                >
                  {item.name}
                  <Tooltip title="Edit Indikator">
                    <EditOutlined
                      style={{
                        marginLeft: 8,
                        cursor: "pointer",
                        color: "#1890ff",
                      }}
                      onClick={() => handleEditIndicator(item, record)}
                    />
                  </Tooltip>
                </Tag>
              ))}
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: "add_indicator",
                label: "Tambah Indikator",
                icon: <PlusOutlined />,
              },
              {
                key: "edit_category",
                label: "Edit Kategori",
                icon: <EditOutlined />,
              },
              {
                key: "delete_category",
                label: "Hapus Kategori",
                icon: <DeleteOutlined />,
                danger: true,
              },
            ],
            onClick: ({ key }) => handleCategoryAction(record, { key }),
          }}
        >
          Pilihan Aksi
        </Dropdown.Button>
      ),
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Input.Search
          style={{ width: 300 }}
          placeholder="Cari Kategori atau Indikator..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Tombol Add ini untuk menambah Kategori baru */}
        <Add
          onClick={() => {
            setDetailCategory(null);
            setOpenCategory(true);
          }}
        >
          Tambah Kategori
        </Add>
      </Flex>

      <Table
        columns={columns}
        dataSource={data?.categories}
        loading={isLoading || isCategoryDeleting || isIndicatorDeleting}
        rowKey="id"
        bordered
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.totalData,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        }}
      />

      <FormCategory
        open={openCategory}
        onClose={() => setOpenCategory(false)}
        detail={detailCategory}
      />
      <FormIndicator
        open={openIndicator}
        onClose={() => setOpenIndicator(false)}
        detail={detailIndicator}
        category={detailCategory}
      />
    </Flex>
  );
};

export default Indicators;
