import { useEffect, useState } from "react";
// 1. Import Modal from 'antd'
import { Dropdown, Flex, Typography, message, Modal } from "antd";
import TableLayout from "../../../../components/table/TableLayout";
import {
  useDeleteClassMutation,
  useGetClassQuery,
} from "../../../../service/api/main/ApiClass";
import Students from "./Students";

const { Text } = Typography;
// Destructure confirm for easier use
const { confirm } = Modal;

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [classData, setClassData] = useState("");

  const { data, isLoading } = useGetClassQuery({ page, limit, search });

  const [
    deleteClass,
    { data: delMessage, isLoading: delLoading, isSuccess, error },
  ] = useDeleteClassMutation();

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

  // 2. Updated handleDelete function
  const handleDelete = (id) => {
    confirm({
      title: "Konfirmasi Hapus Data",
      content: "Apakah anda yakin akan menghapus data ini?!",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        // This function is called when the user clicks 'OK'
        deleteClass(id);
      },
      onCancel() {
        // This function is called when the user clicks 'Cancel' or closes the modal
        message.warning("Aksi dibatalkan");
      },
    });
  };

  const handleOpen = (record) => {
    setClassData(record);
    setOpen(true);
  };

  const handleClose = () => {
    setClassData({});
    setOpen(false);
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;

      case "detail":
        handleOpen(record);
        break;

      case "delete":
        handleDelete(record.id);
        break;

      default:
        break;
    }
  };

  //   Effects
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
    { title: "Tingkat", dataIndex: "grade_name", key: "grade_name" },
    { title: "Jurusan", dataIndex: "major_name", key: "major_name" },
    {
      title: "Kelas",
      dataIndex: "name",
      key: "name",
      render: (record, text) => (
        <Flex vertical gap={"small"}>
          <Text>{record}</Text>
          <small>id : {text.id}</small>
        </Flex>
      ),
    },
    { title: "Jumlah Siswa", dataIndex: "students", key: "students" },
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
                key: "detail",
                label: "Detail",
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
    <>
      <TableLayout
        onSearch={handleSearch}
        isLoading={isLoading || delLoading}
        columns={columns}
        source={data?.classes}
        rowKey="id"
        page={page}
        limit={limit}
        totalData={data?.totalData}
        onChange={handleTableChange}
      />

      <Students
        open={open}
        onClose={() => handleClose()}
        classname={classData?.name}
        classid={classData?.id}
      />
    </>
  );
};

export default TableData;
