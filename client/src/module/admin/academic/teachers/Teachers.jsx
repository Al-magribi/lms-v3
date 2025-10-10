import {
  Flex,
  Input,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Avatar,
  Tag,
  Pagination,
  Empty,
  Skeleton,
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import Add from "../../../../components/buttons/Add";
import FormTeacher from "./FormTeacher";
import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../../service/api/main/ApiTeacher";

const { Meta } = Card;
const { confirm, info } = Modal;

const Teachers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [teacher, setTeacher] = useState({});

  const { data, isLoading } = useGetTeachersQuery({ page, limit, search });
  const [
    deleteTeacher,
    { isLoading: delLoading, data: delMessage, isSuccess, error },
  ] = useDeleteTeacherMutation();

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setTeacher({});
  };

  const handleEdit = (record) => {
    setTeacher(record);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    confirm({
      title: "Konfirmasi Hapus Guru",
      content: "Apakah Anda yakin akan menghapus guru ini?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => {
        deleteTeacher(id);
      },
    });
  };

  const handleSubjects = (data) => {
    info({
      title: "Pelajaran yang diampu",
      content: (
        <>
          {data?.map((subject) => (
            <Tag color="blue" key={subject.id} style={{ marginBottom: 4 }}>
              {subject.name}
            </Tag>
          ))}
        </>
      ),
      okText: "Tutup",
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setPage(page);
    setLimit(pageSize);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, delMessage, error]);

  const renderTeacherCards = () => {
    if (isLoading) {
      return Array.from({ length: limit }).map((_, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <Card style={{ width: "100%" }}>
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ));
    }

    if (!data || data.teachers.length === 0) {
      return (
        <Col span={24} style={{ textAlign: "center", marginTop: "50px" }}>
          <Empty description="Tidak ada data guru yang ditemukan." />
        </Col>
      );
    }

    return data.teachers.map((item) => (
      <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
        <Card
          hoverable
          loading={isLoading || delLoading}
          style={{ width: "100%" }}
          actions={[
            <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
            <DeleteOutlined
              key="delete"
              onClick={() => handleDelete(item.id)}
            />,
          ]}
        >
          <Meta
            avatar={<Avatar src={item.img} icon={<UserOutlined />} />}
            title={item.name}
            description={item.homebase}
          />
          <Flex vertical gap={"small"} style={{ marginTop: "1rem" }}>
            <Space>
              <strong>Wali Kelas:</strong>
              {item.homeroom ? (
                <Tag color="green">{item.class_name}</Tag>
              ) : (
                <Tag color="magenta">
                  <CloseCircleOutlined />
                </Tag>
              )}
            </Space>

            <Tag color="cyan" onClick={() => handleSubjects(item.subjects)}>
              Mata Pelajaran
            </Tag>
          </Flex>
        </Card>
      </Col>
    ));
  };

  return (
    <Flex vertical gap={"large"}>
      <Flex align="center" justify="space-between">
        <Space direction="vertical" size={"small"}>
          <Typography.Title style={{ margin: 0 }} level={5}>
            Manajemen Guru
          </Typography.Title>
          <Input.Search
            placeholder="Cari guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            enterButton
            loading={isLoading && searchTerm.length > 0}
            style={{ width: 250 }}
          />
        </Space>
        <Add onClick={() => setOpen(true)} />
      </Flex>

      <Row gutter={[16, 16]}>{renderTeacherCards()}</Row>

      <Pagination
        current={page}
        pageSize={limit}
        total={data?.totalData}
        onChange={handlePaginationChange}
        align="center"
        showSizeChanger
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} dari ${total} data`
        }
      />

      <FormTeacher
        title={isEdit ? "Edit Guru" : "Tambah Guru"}
        open={open}
        onClose={handleClose}
        teacher={teacher}
      />
    </Flex>
  );
};

export default Teachers;
