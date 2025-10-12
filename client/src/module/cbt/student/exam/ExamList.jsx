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
  Grid,
  Empty, // Tambahkan Empty untuk kasus data tidak ada
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import FormModal from "./FormModal";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Search } = Input;

const ExamList = ({ classid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [exam, setExam] = useState("");
  const [open, setOpen] = useState(false);

  const screens = useBreakpoint();

  const { data, isLoading, isFetching } = useGetExamsByClassQuery(
    { classid, page, limit, search: debounced },
    { skip: !classid }
  );

  const handleOpen = (item) => {
    setExam(item);
    setOpen(true);
  };

  const handleClose = () => {
    setExam("");
    setOpen(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
      setPage(1); // Reset ke halaman pertama setiap kali ada pencarian baru
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setLimit(newPageSize);
  };

  const loading = isLoading || isFetching;

  return (
    <Space direction='vertical' size='large' style={{ width: "100%" }}>
      {/* Header: Judul dan Pencarian */}
      <Flex
        vertical={!screens.sm} // Gunakan vertical jika layar lebih kecil dari sm
        justify='space-between'
        align={!screens.sm ? "stretch" : "center"}
        gap={!screens.sm ? 8 : 16}
      >
        <Title level={5} style={{ margin: 0 }}>
          Daftar Ujian Tersedia
        </Title>
        <Search
          placeholder='Cari nama ujian...'
          allowClear
          onSearch={(value) => setSearch(value)}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: !screens.sm ? "100%" : 250 }} // Lebar penuh di mobile
          value={search}
        />
      </Flex>

      {/* Daftar Ujian dalam Bentuk Kartu */}
      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 3,
        }}
        dataSource={data?.exams}
        // Menampilkan pesan jika data kosong
        locale={{
          emptyText: <Empty description='Tidak ada ujian yang ditemukan' />,
        }}
        renderItem={(exam) => (
          <List.Item>
            <Card
              hoverable
              title={
                <Flex justify='space-between' align='center' gap={8}>
                  <Tooltip title={exam.name}>
                    <Text style={{ fontWeight: "bold" }} ellipsis>
                      {exam.name}
                    </Text>
                  </Tooltip>
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
                  key='take-exam'
                  title={
                    !exam.isactive
                      ? "Ujian ini tidak sedang aktif"
                      : "Masuk ke ruang ujian"
                  }
                >
                  <Button
                    type='primary'
                    icon={<LoginOutlined />}
                    disabled={!exam.isactive}
                    style={{ width: "90%" }}
                    onClick={() => handleOpen(exam)}
                  >
                    Ikuti Ujian
                  </Button>
                </Tooltip>,
              ]}
            >
              <Space direction='vertical' style={{ width: "100%" }}>
                <Text type='secondary'>
                  <UserOutlined style={{ marginRight: 8 }} />
                  {exam.teacher_name}
                </Text>
                <Text type='secondary'>
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
        <Flex justify='center'>
          <Pagination
            // ================== PERBAIKAN ==================
            simple={screens.xs} // Gunakan mode simpel di layar mobile (xs)
            current={page}
            pageSize={limit}
            total={data?.totalData || 0}
            onChange={handlePageChange}
            showSizeChanger={!screens.xs} // Sembunyikan size changer di mobile
            showTotal={
              // Sembunyikan total di mobile, perbaiki typo sx -> xs
              !screens.xs
                ? (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} Ujian`
                : undefined
            }
            // ===============================================
          />
        </Flex>
      )}

      <FormModal open={open} onClose={handleClose} exam={exam} />
    </Space>
  );
};

export default ExamList;
