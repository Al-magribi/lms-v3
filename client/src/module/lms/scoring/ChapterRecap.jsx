import {
  Alert,
  Flex,
  Card,
  Table,
  Input,
  Typography,
  Spin,
  Button,
} from "antd";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetChapterRecapQuery } from "../../../service/api/lms/ApiRecap";
import { SyncOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

// Komponen untuk menampilkan header tabel yang informatif
const TableHeader = ({ data }) => {
  if (!data?.results?.[0]) return null;

  const firstStudent = data.results[0];
  return (
    <Card size='small'>
      <Flex justify='space-between' wrap='wrap'>
        <Flex vertical>
          <Text strong>Mata Pelajaran</Text>
          <Text>{firstStudent.subject_name}</Text>
        </Flex>
        <Flex vertical>
          <Text strong>Chapter</Text>
          <Text>{firstStudent.chapter_name}</Text>
        </Flex>
        <Flex vertical>
          <Text strong>Kelas</Text>
          <Text>{firstStudent.class_name}</Text>
        </Flex>
        <Flex vertical>
          <Text strong>Guru Pengampu</Text>
          <Text>{firstStudent.teacher_name}</Text>
        </Flex>
      </Flex>
    </Card>
  );
};

const ChapterRecap = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [searchParams] = useSearchParams();
  const month = searchParams.get("month");
  const chapterid = searchParams.get("chapter");
  const classid = searchParams.get("class");

  // Hook RTK Query untuk mengambil data dari API
  const { data, isLoading, isError, refetch } = useGetChapterRecapQuery({
    page,
    limit,
    search: debouncedSearch, // Gunakan debounced search untuk query
    month,
    chapterid,
    classid,
  });

  // Manual Debounce untuk input pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset ke halaman pertama setiap kali ada pencarian baru
    }, 500); // Delay 500ms

    // Cleanup timeout jika user mengetik lagi sebelum delay selesai
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Definisi kolom untuk Ant Design Table
  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
      width: 50,
    },
    {
      title: "Nama Siswa",
      dataIndex: "student_name",
      key: "student_name",
      sorter: (a, b) => a.student_name.localeCompare(b.student_name),
    },
    {
      title: "Kehadiran",
      dataIndex: "attendance",
      key: "attendance",
      align: "center",
      sorter: (a, b) => a.attendance - b.attendance,
    },
    {
      title: "Sikap",
      dataIndex: "attitude",
      key: "attitude",
      align: "center",
      sorter: (a, b) => a.attitude - b.attitude,
    },
    {
      title: "Harian",
      dataIndex: "daily",
      key: "daily",
      align: "center",
      sorter: (a, b) => a.daily - b.daily,
    },
    {
      title: "Nilai Akhir",
      dataIndex: "final_score",
      key: "final_score",
      align: "center",
      sorter: (a, b) => a.final_score - b.final_score,
      render: (score) => <Text strong>{score}</Text>,
    },
  ];

  // Handler untuk perubahan pada tabel (paginasi, sorting)
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // Tampilan jika parameter URL tidak lengkap
  if (!month || !chapterid || !classid) {
    return (
      <Alert
        message='Parameter Tidak Lengkap'
        description='Harap pilih Bulan, Chapter, dan Kelas terlebih dahulu untuk melihat rekapitulasi nilai.'
        type='warning'
        showIcon
      />
    );
  }

  return (
    <Flex vertical gap='large'>
      <Alert
        showIcon
        type='info'
        message='Informasi Rekapitulasi'
        description='Data yang ditampilkan adalah nilai yang sudah dibobotkan berdasarkan pengaturan yang telah ditentukan sebelumnya.'
      />

      <Card>
        <Flex vertical gap='middle'>
          <TableHeader data={data} />

          <Flex justify='space-between'>
            <Search
              placeholder='Cari nama siswa...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 300 }}
              allowClear
            />

            <Button
              icon={<SyncOutlined />}
              onClick={refetch}
              color='cyan'
              variant='solid'
            >
              Sinkron Data
            </Button>
          </Flex>

          <Spin spinning={isLoading}>
            <Table
              columns={columns}
              dataSource={data?.results}
              rowKey='student_id'
              pagination={{
                current: page,
                pageSize: limit,
                total: data?.totalData,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
              }}
              onChange={handleTableChange}
              bordered
              scroll={{ x: "max-content" }}
            />
          </Spin>
        </Flex>
      </Card>
    </Flex>
  );
};

export default ChapterRecap;
