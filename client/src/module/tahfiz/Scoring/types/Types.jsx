import { Dropdown, Flex, Input, Modal, Table, message } from "antd";
import Add from "../../../../components/buttons/Add";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import {
  useDeleteTypeMutation,
  useGetTypesQuery,
} from "../../../../service/api/tahfiz/ApiMetric";
import FormType from "./FormType";

const { confirm } = Modal;

const Types = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");

  const { data, isLoading } = useGetTypesQuery({
    page,
    limit,
    search: debounced,
  });
  const [
    deleteType,
    { data: delMessage, isLoading: delLoading, error, isSuccess, reset },
  ] = useDeleteTypeMutation();

  const handleClose = () => {
    setType("");
    setOpen(false);
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "edit":
        setType(record);
        setOpen(true);
        break;
      case "delete":
        confirm({
          title: `Anda yakin ingin menghapus ${record.name}?`,
          content: "Tindakan ini tidak dapat dibatalkan.",
          okText: "Ya, Hapus",
          okType: "danger",
          cancelText: "Batal",
          onOk: () => deleteType(record.id),
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
      title: "Jenis Penilaian",
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
        dataSource={data?.types}
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

      <FormType
        title={type ? "Edit Penguji" : "Simpan Penguji"}
        open={open}
        onClose={handleClose}
        type={type}
      />
    </Flex>
  );
};

export default Types;
