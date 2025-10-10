import { useEffect, useState } from "react";
import {
  useChangeStatusMutation,
  useDeletePeriodeMutation,
  useGetPeriodesQuery,
} from "../../../../service/api/main/ApiPeriode";
import { useGetStudentsQuery } from "../../../../service/api/main/ApiStudent";
import { useGetClassQuery } from "../../../../service/api/main/ApiClass";
import { Button, Dropdown, Popconfirm, Switch, message } from "antd";
import TableLayout from "../../../../components/table/TableLayout";
import Edit from "../../../../components/buttons/Edit";
import { DeleteOutlined } from "@ant-design/icons";

const TableData = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetPeriodesQuery({ page, limit, search });

  const [
    changeStatus,
    {
      data: changeMessge,
      isLoading: changeLoading,
      isSuccess: changeSuccess,
      error: changeError,
    },
  ] = useChangeStatusMutation();
  const [
    deletePeriode,
    { data: delMessage, isLoading: delLoading, isSuccess, error },
  ] = useDeletePeriodeMutation();
  const { refetch: studentRefetch } = useGetStudentsQuery({
    page,
    limit,
    search,
  });
  const { refetch: classRefetch } = useGetClassQuery({ page, limit, search });

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
      deletePeriode(id);
    } else {
      message.warning("Aksi dibatalkan");
    }
  };

  const handleChange = (id) => {
    changeStatus(id);
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
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [delMessage, isSuccess, error]);

  useEffect(() => {
    if (changeSuccess) {
      studentRefetch();
      classRefetch();
      message.success(changeMessge.message);
    }

    if (changeError) {
      message.error(changeError.data.message);
    }
  }, [changeSuccess, changeError, changeMessge]);

  const columns = [
    { title: "_id", dataIndex: "id", key: "id" },
    { title: "Periode", dataIndex: "name", key: "name" },
    {
      title: "Status",
      dataIndex: "isactive",
      key: "isactive",
      render: (text, record) => (
        <Switch
          checked={text}
          checkedChildren="Aktif"
          unCheckedChildren="Non-aktif"
          onChange={() => handleChange(record.id)}
        />
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
      isLoading={isLoading || changeLoading || delLoading}
      columns={columns}
      source={data?.periodes}
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
