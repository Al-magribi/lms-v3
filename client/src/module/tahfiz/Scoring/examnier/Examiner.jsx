import React, { useEffect, useState } from "react";
import {
  useDeleteExaminerMutation,
  useGetExaminersQuery,
} from "../../../../service/api/tahfiz/ApiExaminer";
import { Dropdown, Flex, Input, Table, message } from "antd";
import Add from "../../../../components/buttons/Add";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import FormExaminer from "./FormExaminer";

const Examiner = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [examiner, setExaminer] = useState("");

  const { data, isLoading } = useGetExaminersQuery({
    page,
    limit,
    search: debounced,
  });
  const [
    deleteExaminer,
    { data: delMessage, isLoading: delLoading, error, isSuccess, reset },
  ] = useDeleteExaminerMutation();

  const handleClose = () => {
    setExaminer("");
    setOpen(false);
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "edit":
        setExaminer(record);
        setOpen(true);
        break;
      case "delete":
        confirm({
          title: `Anda yakin ingin menghapus ${record.name}?`,
          content: "Tindakan ini tidak dapat dibatalkan.",
          okText: "Ya, Hapus",
          okType: "danger",
          cancelText: "Batal",
          onOk: () => deleteExaminer(record.id),
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [delMessage, error, isSuccess]);

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Penguji",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Dropdown.Button
          menu={{
            items: [
              { key: "edit", label: "Edit", icon: <EditOutlined /> },
              {
                key: "delete",
                label: "Hapus",
                icon: <DeleteOutlined />,
                danger: true,
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
      <Flex align="center" justify="space-between">
        <Input.Search
          style={{ width: 300 }}
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari Penguji ..."
        />

        <Add onClick={() => setOpen(true)} />
      </Flex>

      <Table
        columns={columns}
        dataSource={data?.examiners}
        loading={isLoading || delLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.totalData,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,

          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        }}
      />

      <FormExaminer
        title={examiner ? "Edit Penguji" : "Simpan Penguji"}
        open={open}
        onClose={handleClose}
        examiner={examiner}
      />
    </Flex>
  );
};

export default Examiner;
