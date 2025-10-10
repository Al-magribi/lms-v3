import { useEffect, useState } from "react";
import { Dropdown, Flex, Modal, Space, Typography, message } from "antd";
import TableLayout from "../../../../components/table/TableLayout";
import {
  useDeleteParentMutation,
  useGetParentsQuery,
} from "../../../../service/api/main/ApiParent";

const { Text } = Typography;
const { confirm } = Modal;

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetParentsQuery({ page, limit, search });
  const [
    deleteParent,
    { data: delMessage, error, isLoading: delLoading, isSuccess },
  ] = useDeleteParentMutation();

  //   Functions
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
      title: "Apakah anda yakin akan menghapus data ini?",
      content: "Data yang sudah terhapus tidak bisa dikembalikan",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk() {
        deleteParent(id);
      },
    });
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;

      case "reset":
        message.info(`Reset id ${record.parent_id}`);
        break;

      case "delete":
        handleDelete(record.parent_id);
        break;

      default:
        break;
    }
  };

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
    {
      title: "Nama Siswa",
      dataIndex: "student_name",
      key: "student_name",
      render: (record, text) => (
        <Flex vertical gap={"small"}>
          <Text strong>{record}</Text>
          <Space>
            <small>
              {text.nis} • {text.grade} • {text.class}
            </small>
          </Space>
        </Flex>
      ),
    },
    {
      title: "Nama Orang Tua",
      dataIndex: "parent_name",
      key: "parent_name",
      render: (record, text) => (
        <Flex vertical gap={"small"}>
          <Text>{record}</Text>
          <Text type="secondary" italic>
            {text.parent_email}
          </Text>
        </Flex>
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
                key: "edit",
                label: "Edit",
              },
              {
                key: "reset",
                label: "Reset",
              },
              {
                key: "delete",
                label: "Hapus",
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
    <TableLayout
      onSearch={handleSearch}
      isLoading={isLoading || delLoading}
      columns={columns}
      source={data?.data}
      rowKey="parent_id"
      page={page}
      limit={limit}
      totalData={data?.totalData}
      onChange={handleTableChange}
    >
      TableData
    </TableLayout>
  );
};

export default TableData;
