import { useEffect, useState } from "react";
import { Dropdown, Flex, Space, Typography, message } from "antd";
import TableLayout from "../../../../components/table/TableLayout";
import {
  useDeleteStudentMutation,
  useGetStudentsQuery,
} from "../../../../service/api/main/ApiStudent";
import FormUpdate from "./FormUpdate";

const { Text } = Typography;

const TableData = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState("");

  const { data, isLoading } = useGetStudentsQuery({ page, limit, search });

  const [
    deleteStudent,
    { data: delMessage, isLoading: delLoading, isSuccess, error },
  ] = useDeleteStudentMutation();

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
    setOpen(true);
    setStudent(record);
  };

  const handleClose = () => {
    setOpen(false);
    setStudent("");
  };

  const handleDelete = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin akan menghapus siswa ini?!"
    );

    if (confirm) {
      deleteStudent(id);
    } else {
      message.warning("Aksi dibatalkan");
    }
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
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
    {
      title: "Nama Siswa",
      dataIndex: "name",
      key: "name",
      render: (record, text) => (
        <Flex vertical gap={"small"}>
          <Text strong type={text.isactive ? "success" : "danger"}>
            {record}
          </Text>
          <Space>
            <small>
              {`Periode: ${text.periode_name}`} • {text.nis}{" "}
            </small>
          </Space>
        </Flex>
      ),
    },
    {
      title: "Kelas",
      dataIndex: "classname",
      key: "classname",
      render: (record) => (
        <Text type={!record ? "danger" : ""}>
          {record ? record : "Belum ada kelas"}
        </Text>
      ),
    },
    {
      title: "L/P",
      dataIndex: "gender",
      key: "gender",
      render: (record) => (
        <Text>{record === "P" ? "Perempuan" : "Laki Laki"}</Text>
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
        source={data?.students}
        rowKey="id"
        page={page}
        limit={limit}
        totalData={data?.totalData}
        onChange={handleTableChange}
      />

      <FormUpdate
        title={`Perbarui data ${student?.name}`}
        open={open}
        onClose={handleClose}
        student={student}
      />
    </>
  );
};

export default TableData;
