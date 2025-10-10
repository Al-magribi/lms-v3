import {
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  SaveOutlined, // 1. Impor ikon yang dibutuhkan
} from "@ant-design/icons";
import { Button, Flex, Input, Modal, Space, Typography, message } from "antd";
import React, { useEffect, useState } from "react"; // 2. Impor useEffect
import {
  useAddStudentMutation,
  useDeleteStudentMutation,
  useGetStudentsInClassQuery,
} from "../../../../service/api/main/ApiClass";
import TableLayout from "../../../../components/table/TableLayout";

const { Text } = Typography;

const Students = ({ open, onClose, classname, classid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [nis, setNis] = useState("");

  const { data, isLoading, refetch } = useGetStudentsInClassQuery(
    { page, limit, search, classid },
    { skip: !classid }
  );

  const [
    addStudent,
    {
      isLoading: addLoading,
      isSuccess: addSuccess,
      data: addData,
      error: addError,
    },
  ] = useAddStudentMutation();

  const [
    deleteStudent,
    { data: delMessage, isLoading: delLoading, isSuccess, error },
  ] = useDeleteStudentMutation();

  const handleAdd = () => {
    addStudent({ nis, classid });
  };

  const handleDelete = (id) => {
    console.log(id);
    deleteStudent(id);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const showConfirm = (record) => {
    Modal.confirm({
      title: `Yakin ingin menghapus siswa ini?`,
      icon: <ExclamationCircleFilled />,
      content: (
        <Text strong>
          {record.student_name} ({record.nis})
        </Text>
      ),
      okText: "Hapus",
      okButtonProps: { danger: true },
      cancelText: "Batal",
      onOk() {
        handleDelete(record.student);
      },
      onCancel() {
        message.info("Aksi dibatalkan");
      },
    });
  };

  useEffect(() => {
    if (addSuccess) {
      message.success(addData.message);
      setNis("");
    }

    if (addError) {
      message.error(addError.data.message);
    }
  }, [addSuccess, addError, addData]);

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage?.message);
      refetch();
    }
    if (error) {
      message.error(error?.data?.message);
    }
  }, [isSuccess, error, delMessage, refetch]);

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
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.student_name}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            NIS: {record.nis}
          </Text>
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      // 5. Ubah render props untuk menerima `record` dan hubungkan ke `showConfirm`
      render: (record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => showConfirm(record)}
          loading={delLoading}
        >
          Hapus
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={`Daftar Siswa Kelas ${classname}`}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Tutup
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
    >
      <Flex vertical gap={"middle"}>
        <Space.Compact>
          <Input
            placeholder="Masukan NIS"
            onChange={(e) => setNis(e.target.value)}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleAdd}
            disabled={addLoading}
          ></Button>
        </Space.Compact>

        <TableLayout
          onSearch={handleSearch}
          isLoading={isLoading || delLoading}
          columns={columns}
          source={data?.students}
          rowKey="student"
          page={page}
          limit={limit}
          totalData={data?.totalData}
          onChange={handleTableChange}
        />
      </Flex>
    </Modal>
  );
};

export default Students;
