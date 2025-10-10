import React, { useEffect, useState } from "react";
import {
  useDeleteSurahMutation,
  useGetSurahQuery,
} from "../../../../service/api/tahfiz/ApiQuran";
import { Flex, Input, Table, Button, Space, Popconfirm, message } from "antd";
import Add from "../../../../components/buttons/Add";
import FormVerse from "./FormVerse";

const Verses = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const { data, isLoading } = useGetSurahQuery({
    page,
    limit,
    search: searchDebounce,
  });
  const [
    deleteSurah,
    {
      data: delMessage,
      error: delError,
      isLoading: delLoading,
      isSuccess: delIsSuccess,
    },
  ] = useDeleteSurahMutation();

  const handleEdit = (surah) => {
    setDetail(surah);
    setOpen(true);
  };

  const handleDelete = (id) => {
    deleteSurah(id);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounce(search);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    if (delIsSuccess) {
      message.success(delMessage.message);
    }

    if (delError) {
      message.error(delError.data.message);
    }
  }, [delIsSuccess, delError, delMessage]);

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Nama Surah",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Jumlah Ayat",
      dataIndex: "ayat",
      key: "ayat",
    },
    {
      title: "Jumlah Baris",
      dataIndex: "lines",
      key: "lines",
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Apakah Anda yakin ingin menghapus surah ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center">
        <Input.Search
          placeholder="Cari Surah ..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />

        <Add
          onClick={() => {
            setDetail(null);
            setOpen(true);
          }}
        />
      </Flex>

      <Table
        columns={columns}
        dataSource={data?.result}
        loading={isLoading || delLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.totalData,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        }}
      />

      <FormVerse
        title={detail ? "Edit Surah" : "Simpan Surah"}
        open={open}
        onClose={() => setOpen(false)}
        surah={detail}
      />
    </Flex>
  );
};

export default Verses;
