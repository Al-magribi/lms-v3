import {
  Alert,
  Card,
  Col,
  Divider,
  Flex,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import Add from "../../../components/buttons/Add";
import {
  useDeleteExamMutation,
  useGetExamsQuery,
} from "../../../service/api/cbt/ApiExam";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  UserOutlined,
} from "@ant-design/icons";
import FormExam from "./FormExam";
import { useSearchParams } from "react-router-dom";

const { Text, Title } = Typography;
const { confirm } = Modal;

const Exams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [onSearch, setOnSearch] = useState("");
  const [exam, setExam] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading, error } = useGetExamsQuery({
    page,
    limit,
    search: onSearch,
  });
  const [
    deleteExam,
    {
      data: delMessage,
      isSuccess,
      error: delError,
      isLoading: delLoading,
      reset,
    },
  ] = useDeleteExamMutation();

  const examsData = data?.exams;

  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setLimit(newPageSize);
  };

  const handleEdit = (record) => {
    setExam(record);
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setExam({});
    setIsEdit(false);
    setOpen(false);
  };

  const handleDelete = (id) => {
    confirm({
      title: "Apa anda yakin menghapus data ini?",
      content: "Data yang sudah dihapus tidak bisa dikembalikan",
      okText: "Ya, hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        deleteExam(id);
      },
      onCancel() {
        message.info("Aksi dibatalkan");
      },
    });
  };

  const handleReport = (record) => {
    window.open(
      `/computer-based-test?report=true&examid=${record.id}&token=${
        record.token
      }&name=${record.name?.replace(/\s+/g, "-")}`,
      "_blank"
    );
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
      reset();
    }

    if (delError) {
      message.error(delError.data.message);
      reset();
    }
  }, [delMessage, isSuccess, delError]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setOnSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeOut);
  }, [search]);

  if (error) {
    return (
      <Alert
        showIcon
        type="error"
        message="Terjadi Kesalahan"
        description={error ? error.data.message : "Jadwal ujian belum tersedia"}
      />
    );
  }

  return (
    <Spin tip="Memuat data..." spinning={isLoading}>
      <Flex vertical gap={"large"}>
        <Flex align="center" justify="space-between">
          <Typography.Title style={{ margin: 0 }} level={5}>
            Managemen Penjadwalan
          </Typography.Title>

          <Space>
            <Input.Search
              placeholder="Cari data ..."
              allowClear
              onChange={(e) => setSearch(e.target.value)}
            />

            <Add onClick={() => setOpen(true)} />
          </Space>
        </Flex>

        {/* Exams */}
        <Row gutter={[16, 16]}>
          {examsData?.map((item) => (
            <Col key={item.id} sm={24} md={12} lg={6}>
              <Card
                hoverable
                loading={isLoading || delLoading}
                title={
                  <Tooltip title={item.name}>
                    <Text ellipsis>{item.name}</Text>
                  </Tooltip>
                }
                extra={
                  <Tag color={item.isactive ? "green" : "volcano"}>
                    {item.isactive ? "Aktif" : "Tidak Aktif"}
                  </Tag>
                }
                actions={[
                  <Tooltip title="Detail">
                    <FolderOpenOutlined
                      key={"detail"}
                      onClick={() => handleReport(item)}
                    />
                  </Tooltip>,
                  <Tooltip title="Edit">
                    <EditOutlined
                      key={"edit"}
                      onClick={() => handleEdit(item)}
                    />
                  </Tooltip>,
                  <Tooltip title="Hapus">
                    <DeleteOutlined
                      key={"remove"}
                      onClick={() => handleDelete(item.id)}
                    />
                  </Tooltip>,
                ]}
              >
                <Flex vertical gap="small">
                  {/* Token Section */}
                  <Flex align="center" justify="space-between">
                    <Text type="secondary">Token Ujian</Text>
                    <Text strong copyable>
                      {item.token}
                    </Text>
                  </Flex>

                  <Flex align="center" justify="space-between">
                    <Text type="secondary">Acak Soal</Text>
                    <Tag color={item.isshuffle ? "blue" : "purple"}>
                      {item.isshuffle ? "Acak" : "Urut"}
                    </Tag>
                  </Flex>

                  <Divider style={{ margin: "8px 0" }} />
                  {/* Bank Section */}
                  <Flex vertical>
                    <Text type="secondary">Bank Soal</Text>

                    <Flex vertical gap={"small"}>
                      {item.banks?.map((b, i) => (
                        <Tooltip key={i} title={b.name}>
                          <Typography.Text ellipsis>
                            <Tag color="magenta">{b.name}</Tag>
                          </Typography.Text>
                        </Tooltip>
                      ))}
                    </Flex>
                  </Flex>

                  <Divider style={{ margin: "8px 0" }} />

                  {/* Info Section */}
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Flex align="center" gap={8}>
                      <UserOutlined />
                      <Text>{item.teacher_name}</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <ClockCircleOutlined />
                      <Text>{item.duration} Menit</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <CalendarOutlined />
                      <Text>
                        {new Date(item.createdat).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </Flex>
                  </Space>

                  <Divider style={{ margin: "8px 0" }} />

                  {/* Classes Section */}

                  <Flex wrap="wrap" gap="8px 0">
                    {item.classes.map((kelas) => (
                      <Tag color="cyan" key={kelas.id}>
                        {kelas.name}
                      </Tag>
                    ))}
                  </Flex>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>

        {examsData?.length > 0 && (
          <Pagination
            size="small"
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

        <FormExam
          title={isEdit ? "Ubah Jadwal Ujian" : "Simpan Jadwan Ujian"}
          open={open}
          onClose={handleClose}
          exam={exam}
        />
      </Flex>
    </Spin>
  );
};

export default Exams;
