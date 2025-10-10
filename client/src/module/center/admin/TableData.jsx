import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Spin,
  Dropdown,
  message,
  Flex,
  Popconfirm,
  Button,
} from "antd";
import {
  useDeleteAdminMutation,
  useGetAdminQuery,
} from "../../../service/api/center/ApiAdmin";
import Typography from "antd/es/typography/Typography";
import TableLayout from "../../../components/table/TableLayout";
import Edit from "../../../components/buttons/Edit";
import { DeleteOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Text } = Typography;

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetAdminQuery({ page, limit, search });
  const [
    deleteAdmin,
    { isLoading: delLoading, isSuccess, data: delMessage, error },
  ] = useDeleteAdminMutation();

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
    deleteAdmin(id);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, delMessage, error]);

  const columns = [
    {
      title: "No", // Mengganti judul kolom menjadi "No"
      key: "nomor",
      render: (text, record, index) => (page - 1) * limit + index + 1, // Menghitung nomor urut
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (record, text) => (
        <Text strong type={text.isactive ? "success" : "danger"}>
          {record}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Homebase",
      dataIndex: "homebase",
      key: "homebase",
    },
    {
      title: "Aksi",
      key: "action",
      render: (record) => (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: "edit",
                label: <Edit onClick={() => handleEdit(record)}>Edit</Edit>,
              },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title="Apakah Anda yakin ingin menghapus data ini?"
                    okText="Ya"
                    cancelText="Batal"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Hapus
                    </Button>
                  </Popconfirm>
                ),
              },
            ],
          }}
        >
          Pilihan Aksi
        </Dropdown.Button>
      ),
    },
  ];

  return (
    <TableLayout
      onSearch={handleSearch}
      isLoading={isLoading || delLoading}
      columns={columns}
      source={data?.admin}
      rowKey="id"
      page={page}
      limit={limit}
      totalData={data?.totalData}
      onChange={handleTableChange}
    />
  );
};

export default TableData;
