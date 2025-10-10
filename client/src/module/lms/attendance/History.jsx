import { useState } from "react";
import { useGetPresensiMatrixQuery } from "../../../service/api/lms/ApiPresensi";
import {
  Card,
  Table,
  Tag,
  Empty,
  Spin,
  Space,
  Typography,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  HistoryOutlined,
  FileExcelOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Text, Title } = Typography;

const History = ({ classid, subjectid }) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const {
    data: presensiData,
    isLoading,
    isError,
    error,
  } = useGetPresensiMatrixQuery(
    {
      classid,
      subjectid,
      month: selectedMonth?.format("YYYY-MM"),
    },
    { skip: !classid || !subjectid || !selectedMonth }
  );

  const formatHeaderDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("D-MMM-YY"); // Format seperti: 3-Sep-25
  };

  const getTagColor = (note) => {
    // Menggunakan ILIKE di backend, jadi di frontend kita samakan dengan .toLowerCase()
    switch (note?.toLowerCase()) {
      case "hadir":
        return "success";
      case "sakit":
        return "processing";
      case "izin":
        return "warning";
      case "alpa":
        return "error";
      default:
        return "default";
    }
  };

  const generateColumns = () => {
    // Kolom Statis di Awal
    const staticColumns = [
      {
        title: "No",
        key: "index",
        width: 60,
        fixed: "left",
        align: "center",
        render: (text, record, index) => index + 1,
      },
      {
        title: "NIS",
        dataIndex: "nis",
        key: "nis",
        width: 120,
        fixed: "left",
      },
      {
        title: "Nama Siswa",
        dataIndex: "student_name",
        key: "student_name",
        width: 250,
        fixed: "left",
        render: (name) => <Text strong>{name}</Text>,
      },
    ];

    if (!presensiData?.dates || presensiData.dates.length === 0) {
      return staticColumns;
    }

    // Kolom Dinamis (Tanggal)
    const dynamicColumns = presensiData.dates.map((date) => ({
      title: formatHeaderDate(date),
      dataIndex: date,
      key: date,
      align: "center",
      width: 110,
      render: (note) => (
        <Tag
          color={getTagColor(note)}
          style={{ minWidth: "70px", textAlign: "center" }}
        >
          {note || "-"}
        </Tag>
      ),
    }));

    // Kolom Statis di Akhir
    const percentageColumn = {
      title: "Presentase %",
      dataIndex: "presentase",
      key: "presentase",
      width: 120,
      fixed: "right",
      align: "center",
      render: (p) => <Text strong>{p != null ? `${p}%` : "-"}</Text>,
    };

    return [...staticColumns, ...dynamicColumns, percentageColumn];
  };

  const columns = generateColumns();

  if (isError) {
    return <Empty description={error?.data?.message || "Gagal memuat data."} />;
  }

  return (
    <Spin spinning={isLoading} tip="Memuat data riwayat...">
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <Title level={5} style={{ margin: 0 }}>
              Riwayat Presensi
            </Title>
          </Space>
        }
      >
        <Row style={{ marginBottom: 24 }}>
          <Col>
            <Space direction="vertical">
              <Text strong>
                <CalendarOutlined /> Filter Berdasarkan Bulan
              </Text>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                style={{ width: 250 }}
                allowClear={false}
              />
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={presensiData?.students}
          rowKey="studentid"
          bordered
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                image={
                  <FileExcelOutlined
                    style={{ fontSize: 48, color: "#bfbfbf" }}
                  />
                }
                description={
                  !isLoading && presensiData?.students?.length > 0
                    ? `Tidak ada data presensi pada bulan ${selectedMonth.format(
                        "MMMM YYYY"
                      )}`
                    : "Belum ada siswa di kelas ini untuk periode aktif."
                }
              />
            ),
          }}
        />
      </Card>
    </Spin>
  );
};

export default History;
