import React, { useState, useEffect } from "react";
import {
  Table,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Space,
  Radio,
  message,
  Modal,
  Empty,
  Typography,
  Popconfirm,
  Avatar,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  MailOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useGetStudentsInClassQuery } from "../../../service/api/main/ApiClass";
import {
  useGetPresensiQuery,
  useAddPresensiMutation,
  useBulkPresensiMutation,
  useDeletePresensiMutation,
  useBulkDeletePresensiMutation,
} from "../../../service/api/lms/ApiPresensi";

// Set locale for dayjs
dayjs.locale("id");

const { Text } = Typography;

const statusColors = {
  Hadir: "#52c41a", // Green
  Telat: "#faad14", // Orange
  Sakit: "#1677ff", // Blue
  Izin: "#722ed1", // Purple
  Alpa: "#f5222d", // Red
};

const FormAttendance = ({ classid, subjectid }) => {
  // State management
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [search, setSearch] = useState(""); // This can be wired to an Input.Search if needed
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const dateString = selectedDate.format("YYYY-MM-DD");

  // Data fetching from RTK Query
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isFetching: isFetchingStudents,
  } = useGetStudentsInClassQuery(
    {
      page: pagination.current,
      limit: pagination.pageSize,
      search,
      classid,
    },
    { skip: !classid }
  );

  const { data: presensiData } = useGetPresensiQuery(
    { classid, subjectid, date: dateString },
    { skip: !classid || !subjectid }
  );

  console.log(presensiData);

  // Mutations from RTK Query
  const [addPresensi] = useAddPresensiMutation();
  const [bulkPresensi] = useBulkPresensiMutation();
  const [deletePresensi] = useDeletePresensiMutation();
  const [bulkDeletePresensi] = useBulkDeletePresensiMutation();

  const { students, totalData } = studentsData || {};
  const hasSelected = selectedRowKeys.length > 0;

  // Effect to reset selection when date or class changes
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [selectedDate, classid, subjectid]);

  // Generic handler for API calls to show loading/success/error messages
  const handleApiCall = async (
    apiCall,
    loadingMessage,
    successFallback,
    errorFallback
  ) => {
    const key = "apiCall";
    message.loading({ content: loadingMessage, key });
    try {
      const result = await apiCall.unwrap();
      message.success({ content: result.message || successFallback, key });
      return true;
    } catch (error) {
      message.error({ content: error.data?.message || errorFallback, key });
      return false;
    }
  };

  // Handler for individual student attendance change
  const handleAttendanceChange = (studentid, note) => {
    const payload = { classid, subjectid, studentid, note, date: dateString };
    handleApiCall(
      addPresensi(payload),
      "Menyimpan presensi...",
      "Presensi berhasil disimpan",
      "Gagal menyimpan presensi"
    );
  };

  // Handler for bulk attendance operations
  const handleBulkOperation = (note) => {
    if (!hasSelected) {
      message.warning("Pilih siswa terlebih dahulu.");
      return;
    }
    const payload = {
      classid,
      subjectid,
      studentids: selectedRowKeys,
      note,
      date: dateString,
    };
    handleApiCall(
      bulkPresensi(payload),
      `Memproses ${note} untuk ${selectedRowKeys.length} siswa...`,
      "Presensi massal berhasil",
      "Gagal memproses presensi massal"
    ).then((success) => {
      if (success) setSelectedRowKeys([]);
    });
  };

  // Handler for deleting single student attendance
  const handleDelete = (studentid) => {
    const payload = { classid, subjectid, studentid, date: dateString };
    handleApiCall(
      deletePresensi(payload),
      "Menghapus presensi...",
      "Presensi berhasil dihapus",
      "Gagal menghapus presensi"
    );
  };

  // Handler for bulk deletion
  const handleBulkDelete = () => {
    if (!hasSelected) {
      message.warning("Pilih siswa terlebih dahulu.");
      return;
    }
    Modal.confirm({
      title: `Hapus Presensi ${selectedRowKeys.length} Siswa?`,
      content:
        "Apakah Anda yakin ingin menghapus data presensi untuk semua siswa yang dipilih pada tanggal ini?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => {
        const payload = {
          classid,
          subjectid,
          studentids: selectedRowKeys,
          date: dateString,
        };
        handleApiCall(
          bulkDeletePresensi(payload),
          "Menghapus presensi massal...",
          "Presensi massal berhasil dihapus",
          "Gagal menghapus presensi massal"
        ).then((success) => {
          if (success) setSelectedRowKeys([]);
        });
      },
    });
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Table columns definition
  const columns = [
    {
      title: "No",
      key: "no",
      width: "5%",
      render: (_, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Siswa",
      dataIndex: "student_name",
      key: "student",
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary">
              NIS: {record.nis} | {record.class_name}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status Presensi",
      key: "attendance",
      width: "40%",
      render: (_, record) => {
        const studentAttendance = presensiData?.find(
          (item) => item.studentid === record.student
        );
        const currentStatus = studentAttendance?.note;

        // Fungsi untuk mendapatkan style berdasarkan status
        const getStyle = (status) => {
          if (currentStatus === status) {
            return {
              backgroundColor: statusColors[status],
              borderColor: statusColors[status],
              color: "#fff",
            };
          }
          return {};
        };

        return (
          <Radio.Group
            value={currentStatus}
            onChange={(e) =>
              handleAttendanceChange(record.student, e.target.value)
            }
            buttonStyle="solid"
            size="small"
            block
          >
            <Radio.Button value="Hadir" style={getStyle("Hadir")}>
              Hadir
            </Radio.Button>
            <Radio.Button value="Telat" style={getStyle("Telat")}>
              Telat
            </Radio.Button>
            <Radio.Button value="Sakit" style={getStyle("Sakit")}>
              Sakit
            </Radio.Button>
            <Radio.Button value="Izin" style={getStyle("Izin")}>
              Izin
            </Radio.Button>
            <Radio.Button value="Alpa" style={getStyle("Alpa")}>
              Alpa
            </Radio.Button>
          </Radio.Group>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Hapus Presensi?"
          description="Anda yakin ingin menghapus presensi siswa ini?"
          onConfirm={() => handleDelete(record.student)}
          okText="Ya"
          cancelText="Tidak"
        >
          <Button icon={<DeleteOutlined />} type="text" danger />
        </Popconfirm>
      ),
    },
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // Render logic
  if (!classid || !subjectid) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Silakan pilih kelas dan mata pelajaran terlebih dahulu."
        />
      </Card>
    );
  }

  return (
    <Card variant="bordered">
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} md={8}>
          <Space direction="vertical">
            <Text strong>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Tanggal Presensi
            </Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="dddd, D MMMM YYYY"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              style={{ width: "100%" }}
            />
          </Space>
        </Col>
        <Col xs={24} md={16}>
          <Space wrap style={{ float: "right" }}>
            <Button
              onClick={() => handleBulkOperation("Hadir")}
              disabled={!hasSelected}
              icon={<CheckCircleOutlined />}
              type="primary"
            >
              Hadir ({selectedRowKeys.length})
            </Button>
            <Button
              onClick={() => handleBulkOperation("Sakit")}
              disabled={!hasSelected}
              icon={<HeartOutlined />}
            >
              Sakit ({selectedRowKeys.length})
            </Button>
            <Button
              onClick={() => handleBulkOperation("Izin")}
              disabled={!hasSelected}
              icon={<MailOutlined />}
            >
              Izin ({selectedRowKeys.length})
            </Button>
            <Button
              onClick={() => handleBulkOperation("Alpa")}
              disabled={!hasSelected}
              icon={<CloseCircleOutlined />}
              danger
            >
              Alpa ({selectedRowKeys.length})
            </Button>
            <Button
              onClick={handleBulkDelete}
              disabled={!hasSelected}
              icon={<DeleteOutlined />}
              danger
              type="primary"
            >
              Hapus ({selectedRowKeys.length})
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        style={{ marginTop: 24 }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={students}
        rowKey="student"
        loading={isLoadingStudents || isFetchingStudents}
        pagination={{
          ...pagination,
          total: totalData,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default FormAttendance;
