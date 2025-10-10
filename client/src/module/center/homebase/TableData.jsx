import React, { useEffect, useState } from "react";
import {
  useDeleteHomebaseMutation,
  useGetHomebaseQuery,
} from "../../../service/api/center/ApiHomebase";
import { Dropdown, Popconfirm, message } from "antd";
import TableLayout from "../../../components/table/TableLayout";

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetHomebaseQuery({ page, limit, search });
  const [
    deleteHomebase,
    { isLoading: delLoading, isSuccess, data: delMessage, error },
  ] = useDeleteHomebaseMutation();

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const handleEdit = (record) => {
    onEdit(record);
  };

  const handleDelete = (id) => {
    deleteHomebase(id);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, delMessage, error]);

  const columns = [
    {
      title: "No", // Mengganti judul kolom menjadi "No"
      key: "nomor",
      render: (text, record, index) => (page - 1) * limit + index + 1, // Menghitung nomor urut
    },
    {
      title: "Satuan",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Aksi",
      key: "action",
      render: (record, text) => (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: "edit",
                label: <span onClick={() => handleEdit(record)}>Edit</span>,
              },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title={`Apakah Anda yakin ingin menghapus ${text.name}?`}
                    okText="Ya"
                    cancelText="Batal"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <span style={{ color: "red" }}>Hapus</span>
                  </Popconfirm>
                ),
              },
            ],
          }}
        >
          Pilihan Aksi
        </Dropdown.Button>
      ),
    },
  ];

  return (
    <TableLayout
      onSearch={handleSearch}
      isLoading={isLoading || delLoading}
      columns={columns}
      source={data?.homebase}
      rowKey="id"
      page={page}
      limit={limit}
      totalData={data?.totalData}
      onChange={handleTableChange}
    />
  );
};

export default TableData;
