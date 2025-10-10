import {
  Col,
  Dropdown,
  Flex,
  Input,
  Row,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  useGetFilterQuery,
  useGetStudentsQuery,
} from "../../../../service/api/tahfiz/ApiScoring";
import { useEffect, useState } from "react";
import { AuditOutlined, ContainerOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

const Memo = () => {
  // Query state
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "detail":
        setSearchParams({
          view: "detail",
          studentid: record.userid,
          name: record.name.replace(/\s+/g, "-"),
        });
        break;

      case "add":
        setSearchParams({
          view: "form",
          studentid: record.userid,
          name: record.name.replace(/\s+/g, "-"),
        });

        break;

      default:
        break;
    }
  };
  // State
  const [homebaseId, setHomebaseId] = useState("");
  const [gradeId, setGrade] = useState("");
  const [classId, setClass] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Filter
  const { data } = useGetFilterQuery();

  const homebaseOpts = data?.homebases.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const gradeOpts = data?.grades.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const classOpts = data?.classes.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  // Students
  const { data: raw } = useGetStudentsQuery({
    page,
    limit,
    search: debounced,
    homebaseId,
    gradeId,
    classId,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  // Table
  const columns = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    { title: "Satuan", dataIndex: "homebase", key: "homebase" },
    { title: "NIS", dataIndex: "nis", key: "nis" },
    {
      title: "Data Siswa",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Flex vertical align="start">
          <Typography.Text strong>{text}</Typography.Text>
          <Tag color="blue">
            Tingkat {record.grade} - Kelas {record.class}
          </Tag>
        </Flex>
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
                key: "detail",
                label: "Detail Hafalan",
                icon: <ContainerOutlined />,
              },
              {
                key: "add",
                label: "Tambah Hafalan",
                icon: <AuditOutlined />,
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
    <Flex vertical gap={"middle"}>
      <Row gutter={[10, 10]}>
        <Col xs={24} md={12} lg={6}>
          <Input.Search
            style={{ minWidth: 100 }}
            placeholder="Cari Siswa ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Pilih Satuan"
            options={homebaseOpts}
            virtual={false}
            allowClear
            onChange={(value) => setHomebaseId(value)}
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Pilih Tingkat"
            options={gradeOpts}
            virtual={false}
            allowClear
            onChange={(value) => setGrade(value)}
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Pilih Kelas"
            options={classOpts}
            virtual={false}
            allowClear
            onChange={(value) => setClass(value)}
          />
        </Col>
      </Row>

      <Table
        rowKey="userid"
        columns={columns}
        dataSource={raw?.students}
        pagination={{
          size: "small",
          current: page,
          pageSize: limit,
          total: raw?.totalData,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        }}
        scroll={{ x: "max-content" }}
      />
    </Flex>
  );
};

export default Memo;
