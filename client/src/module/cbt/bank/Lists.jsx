import React, { useEffect, useState } from "react";
import {
  useDeleteBankMutation,
  useGetBankQuery,
} from "../../../service/api/cbt/ApiBank";
import {
  Card,
  Col,
  Empty,
  Flex,
  Modal,
  Pagination,
  Row,
  Space,
  Spin,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ContainerOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

const { confirm } = Modal;

const Lists = ({ onEdit, search }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [onSearch, setOnSearch] = useState("");

  const { data, isLoading } = useGetBankQuery({
    page,
    limit,
    search: onSearch,
  });
  const banks = data?.banks;

  const [
    deleteBank,
    { data: delMessage, isLoading: delLoading, isSuccess, error, reset },
  ] = useDeleteBankMutation();

  // Functions
  const handleDelete = (id) => {
    confirm({
      title: "Apakah anda yakin akan menghapus data ini?",
      content: "Data yang dihapus tidak bisa dikembalikan",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        deleteBank(id);
      },
      onCancel() {
        message.warning("Aksi dibatalkan");
      },
    });
  };

  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setLimit(newPageSize);
  };

  const handleDetail = (value) => {
    setSearchParams({
      subject: value.subject_name.replace(/\s+/g, "-"),
      bankid: value.id,
      name: value.name.replace(/\s+/g, "-"),
    });
  };

  // Effect

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset;
    }
  }, [delMessage, isSuccess, error]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setOnSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  if (!isLoading && banks?.length === 0) {
    return (
      <Card>
        <Empty
          description={
            onSearch
              ? `Data dengan kata kunci "${onSearch}" tidak ditemukan.`
              : "Belum ada data bank soal yang dapat ditampilkan."
          }
        />
      </Card>
    );
  }

  return (
    <Flex vertical gap={"middle"}>
      <Spin tip="Memuat data..." spinning={isLoading || delLoading}>
        <Row gutter={[16, 16]}>
          {banks?.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={<Tooltip title={item.name}>{item.name}</Tooltip>}
                loading={isLoading || delLoading}
                actions={[
                  <Tooltip title="Detail">
                    <FolderOpenOutlined
                      key={"more"}
                      onClick={() => handleDetail(item)}
                    />
                  </Tooltip>,
                  <Tooltip title="Ubah Data">
                    <EditOutlined key={"edit"} onClick={() => onEdit(item)} />
                  </Tooltip>,
                  <Tooltip title="Hapus Data">
                    <DeleteOutlined
                      key={"delete"}
                      onClick={() => handleDelete(item.id)}
                    />
                  </Tooltip>,
                ]}
              >
                <Card.Meta
                  description={
                    <Flex vertical gap={"small"}>
                      <Space>
                        <FolderOutlined />
                        <Typography.Text>{item.subject_name}</Typography.Text>
                      </Space>
                      <Space>
                        <UserOutlined />
                        <Typography.Text>{item.teacher_name}</Typography.Text>
                      </Space>
                      <Space>
                        <TagsOutlined />
                        <Typography.Text>{item.btype}</Typography.Text>
                      </Space>
                      <Space>
                        <ContainerOutlined />
                        <Typography.Text>
                          {item.question_count} Soal
                        </Typography.Text>
                      </Space>
                    </Flex>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {banks?.length > 0 && (
        <Pagination
          align="center"
          total={data?.totalData}
          pageSize={limit}
          current={page}
          onChange={handlePaginationChange}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} dari ${total} item`
          }
        />
      )}
    </Flex>
  );
};

export default Lists;
