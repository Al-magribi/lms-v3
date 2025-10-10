import React, { useState } from "react";
import {
  Button,
  Dropdown,
  Flex,
  Progress,
  Space,
  Typography,
  message,
} from "antd";
import { useGetDatabaseQuery } from "../../service/api/database/ApiDatabase";
import TableLayout from "../../components/table/TableLayout";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import MainLayout from "../../components/layout/MainLayout";
import { useSearchParams } from "react-router-dom";
import SingleDatabase from "./SingleDatabase";

const { Text } = Typography;

const conicColors = {
  "0%": "#ffccc7",
  "50%": "#ffe58f",
  "100%": "#87d068",
};

const Database = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const formInput = searchParams.get("form");
  const studentid = searchParams.get("studentid");
  const nis = searchParams.get("nis");
  const name = searchParams.get("name");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetDatabaseQuery({ page, limit, search });

  //   Functions
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const handleInput = (student) => {
    setSearchParams({
      form: "teacher-input",
      studentid: student.student_id,
      nis: student.student_nis,
      name: student.student_name.replace(/\s+/g, "-"),
    });
  };

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
      render: (record, text) => (
        <Flex vertical gap={"small"}>
          <Text strong>{record}</Text>
          <Space>
            <small>
              {text.student_nis} • {text.student_grade} • {text.student_class}
            </small>
          </Space>
        </Flex>
      ),
    },
    {
      title: "L/P",
      dataIndex: "student_gender",
      key: "student_gender",
      render: (record) => (
        <Text>
          {record === "P" ? "Perempuan" : record === "L" ? "Laki-laki" : "-"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "completeness",
      key: "completeness",
      render: (record) => (
        <Progress percent={record} strokeColor={conicColors} />
      ),
    },
    {
      title: "Aksi",
      key: "student_id",
      render: (record, text) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleInput(text)}
        >
          Input Data
        </Button>
      ),
    },
  ];
  return (
    <MainLayout title={"Data Pusat"} levels={["admin", "center", "teacher"]}>
      {formInput ? (
        <Flex vertical gap={"middle"}>
          <Space>
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => setSearchParams({})}
            />
            <Typography.Title
              style={{ margin: 0 }}
              level={5}
            >{`Data Siswa ${name?.replace(/-/g, " ")}`}</Typography.Title>
          </Space>
          <SingleDatabase
            formInput={formInput}
            studentid={studentid}
            nis={nis}
            name={name}
          />
        </Flex>
      ) : (
        <Flex vertical gap={"middle"}>
          <Typography.Title level={5}>Managemen Database</Typography.Title>
          <TableLayout
            onSearch={handleSearch}
            isLoading={isLoading}
            columns={columns}
            source={data?.students}
            rowKey="student_id"
            page={page}
            limit={limit}
            totalData={data?.totalData}
            onChange={handleTableChange}
          />
        </Flex>
      )}
    </MainLayout>
  );
};

export default Database;
