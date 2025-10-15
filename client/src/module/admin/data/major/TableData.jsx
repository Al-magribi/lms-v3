import { useEffect, useState } from "react";
import { Dropdown, message } from "antd";
import TableLayout from "../../../../components/table/TableLayout";
import {
  useDeleteMajorMutation,
  useGetMajorQuery,
} from "../../../../service/api/main/ApiMajor";

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetMajorQuery({ page, limit, search });

  const [
    deleteMajor,
    { data: delMessage, isLoading: delLoading, isSuccess, error, reset },
  ] = useDeleteMajorMutation();

  //   Functions
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
    const confirm = window.confirm(
      "Apakah anda yakin akan menghapus data ini?!"
    );

    if (confirm) {
      deleteMajor(id);
    } else {
      message.warning("Aksi dibatalkan");
    }
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;

      case "delete":
        handleDelete(record.id);
        break;

      default:
        break;
    }
  };

  //   Effects
  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [delMessage, isSuccess, error]);

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    { title: "Jurusan", dataIndex: "name", key: "name" },
    {
      title: "Aksi",
      key: "action",
      render: (record) => (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
              },
              {
                key: "delete",
                label: "Hapus",
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
    <TableLayout
      onSearch={handleSearch}
      isLoading={isLoading || delLoading}
      columns={columns}
      source={data?.majors}
      rowKey="id"
      page={page}
      limit={limit}
      totalData={data?.totalData}
      onChange={handleTableChange}
    >
      TableData
    </TableLayout>
  );
};

export default TableData;
