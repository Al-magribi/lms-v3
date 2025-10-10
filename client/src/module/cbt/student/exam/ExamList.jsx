import React, { useEffect, useState } from "react";
import { useGetExamsByClassQuery } from "../../../../service/api/cbt/ApiExam";
import {
  List,
  Card,
  Input,
  Tag,
  Space,
  Button,
  Typography,
  Flex,
  Tooltip,
  Pagination,
  Skeleton,
  Grid, // Gunakan Skeleton untuk loading state yang lebih baik
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  KeyOutlined,
  LoginOutlined, // Ikon untuk tombol "Ikuti Ujian"
} from "@ant-design/icons";

const { screen } = Grid;

const { Title, Text } = Typography;
const { Search } = Input;

const ExamList = ({ classid }) => {
  // State untuk manajemen paginasi dan pencarian
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9); // Sesuaikan limit agar pas dengan grid (misal kelipatan 3)
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // RTK Query hook
  const { data, isLoading, isFetching } = useGetExamsByClassQuery(
    { classid, page, limit, search: debounced },
    { skip: !classid }
  );

  // Efek untuk debouncing
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // Handler untuk paginasi
  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setLimit(newPageSize);
  };

  const loading = isLoading || isFetching;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Header: Judul dan Pencarian */}
      <Card>
        <Flex justify="space-between" align="center">
          <Title level={5} style={{ margin: 0 }}>
            Daftar Ujian Tersedia
          </Title>
          <Search
            placeholder="Cari nama ujian..."
            allowClear
            onSearch={(value) => setSearch(value)}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            value={search}
          />
        </Flex>
      </Card>

      {/* Daftar Ujian dalam Bentuk Kartu */}
      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1, // 1 kolom di layar extra small
          sm: 2, // 2 kolom di layar small
          md: 2, // 2 kolom di layar medium
          lg: 3, // 3 kolom di layar large
          xl: 3, // 3 kolom di layar extra large
          xxl: 3, // 3 kolom di layar extra extra large
        }}
        dataSource={data?.exams || []}
        renderItem={(exam) => (
          <List.Item>
            <Card
              hoverable
              title={
                <Flex justify="space-between" align="center">
                  <Text style={{ fontWeight: "bold" }} ellipsis>
                    {exam.name}
                  </Text>
                  <Tag
                    icon={
                      exam.isactive ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    color={exam.isactive ? "success" : "error"}
                  >
                    {exam.isactive ? "Aktif" : "Selesai"}
                  </Tag>
                </Flex>
              }
              actions={[
                <Tooltip
                  key="take-exam"
                  title={
                    !exam.isactive
                      ? "Ujian ini tidak sedang aktif"
                      : "Masuk ke ruang ujian"
                  }
                >
                  {/* Tombol akan nonaktif jika ujian tidak aktif */}
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    disabled={!exam.isactive}
                    style={{ width: "90%" }}
                  >
                    Ikuti Ujian
                  </Button>
                </Tooltip>,
              ]}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">
                  <UserOutlined style={{ marginRight: 8 }} />
                  {exam.teacher_name}
                </Text>
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Durasi: {exam.duration} menit
                </Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />

      {/* Paginasi di Bawah Daftar */}
      {!loading && data?.totalData > 0 && (
        <Flex justify="center">
          <Pagination
            current={page}
            pageSize={limit}
            total={data?.totalData || 0}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} Ujian`
            }
          />
        </Flex>
      )}
    </Space>
  );
};

export default ExamList;
