import { useEffect, useState } from "react";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "../../../../service/api/main/ApiSubject";
import { Dropdown, Modal, Tag, Tooltip, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileAddOutlined,
} from "@ant-design/icons";
import TableLayout from "../../../../components/table/TableLayout";
import FormBranch from "./FormBranch";

const { confirm } = Modal;

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [category, setCategory] = useState("");
  const [branch, setBranch] = useState("");

  const { data, isLoading } = useGetCategoriesQuery({ page, limit, search });
  const [
    deleteCategory,
    { data: delMessage, isLoading: delLoading, isSuccess, error },
  ] = useDeleteCategoryMutation();

  // Functions

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const handleEdit = (record) => {
    onEdit(record);
  };

  const handleDelete = (id) => {
    confirm({
      title: "Apakah anda yakin menghapus data ini?",
      icon: <ExclamationCircleFilled />,
      content: "Data yang dihapus tidak bisa dikembalikan",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        deleteCategory(id);
      },
      onCancel() {
        message.warning("Aksi dibatalkan");
      },
    });
  };

  const handleClose = () => {
    setCategory("");
    setOpen(false);
    setIsEdit(false);
  };

  const handleEditBranch = (branch, category) => {
    setBranch(branch);
    setCategory(category);
    setIsEdit(true);
    setOpen(true);
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "add":
        setCategory(record);
        setOpen(true);
        break;
      case "edit":
        handleEdit(record);
        break;
      case "delete":
        handleDelete(record.id);
        break;
      default:
        break;
    }
  };

  //   Effects
  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
    }
    if (error) {
      message.error(error.data.message);
    }
  }, [delMessage, isSuccess, error]);

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    { title: "Kategori", dataIndex: "name", key: "name" },
    {
      title: "Rumpun",
      dataIndex: "branches",
      key: "branches",
      // --- PERBAIKAN DI SINI ---
      render: (branches, record) => (
        // Gunakan Fragment <>...</> untuk mengelompokkan Tag
        <>
          {branches?.map((item) => (
            // Tampilkan nama branch di dalam Tag
            // Berikan 'key' unik untuk setiap item dalam map
            <Tag color="blue" key={item.id}>
              {item.name}{" "}
              <Tooltip title={`Edit rumpun ${item.name}`}>
                <EditOutlined onClick={() => handleEditBranch(item, record)} />
              </Tooltip>
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (record) => (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: "add",
                label: "Tambah Rumpun",
                icon: <FileAddOutlined />,
              },
              {
                key: "edit",
                label: "Edit",
                icon: <EditOutlined />,
              },
              {
                key: "delete",
                label: "Hapus",
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

  return (
    <>
      <TableLayout
        onSearch={handleSearch}
        isLoading={isLoading || delLoading}
        columns={columns}
        source={data?.categories}
        rowKey="id"
        page={page}
        limit={limit}
        totalData={data?.totalData}
        onChange={handleTableChange}
      />

      <FormBranch
        title={
          isEdit
            ? `Edit Rumpun ${branch.name} di kategori ${category.name}`
            : `Tambah Rumpun di kategori ${category.name}`
        }
        open={open}
        onClose={handleClose}
        categoryid={category.id}
        branch={branch}
      />
    </>
  );
};

export default TableData;
