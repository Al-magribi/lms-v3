import React, { useState } from "react";
import {
  useFinishCbtMutation,
  useGetExamLogQuery,
  useRejoinExamMutation,
  useRetakeExamMutation,
} from "../../../service/api/log/ApiLog";
import TableLayout from "../../../components/table/TableLayout";
import { Dropdown, Modal, Tag, message } from "antd";

const { confirm } = Modal;

const Logs = ({ examid, classid, tableRef }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetExamLogQuery({
    page,
    limit,
    search,
    exam: examid,
    classid,
  });

  const [finishCbt, { isLoading: finishLoading }] = useFinishCbtMutation();
  const [rejoinExam, { isLoading: rejoingLoading }] = useRejoinExamMutation();
  const [retakeExam, { isLoading: retakeLoading }] = useRetakeExamMutation();

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "detail":
        message.info("detail");
        break;

      case "allow":
        confirm({
          title: "Apakah anda yakin mengizinkan peserta mengikuti ujian ini?",
          content:
            "peserta harus refresh halaman ujian agar dapat mengikuti ujian ini",
          okText: "Ya, Izinkan",
          cancelText: "Tutup",
          okType: "danger",
          async onOk() {
            try {
              await rejoinExam(record.log_id);
              message.success(
                `${record.student_name} telah diizinkan masuk kembali`
              );
            } catch (error) {
              message.error(error?.data?.message || "Terjadi kesalahan");
            }
          },
          onCancel() {
            message.info("Aksi dibatalkan");
          },
        });
        break;

      case "finish":
        confirm({
          title: `Apakah anda yakin menyelesaikan ujian ${record.student_name} ?`,
          content: "Setelah diselesaikan peserta tidak ada ikut ujian ini",
          okText: "Ya, Selesaikan",
          cancelText: "Tutup",
          okType: "danger",
          async onOk() {
            try {
              await finishCbt(record.log_id);
              message.success(
                `Ujian ${record.student_name} telah diselesaikan`
              );
            } catch (error) {
              message.error(error?.data?.message || "Terjadi kesalahan");
            }
          },
          onCancel() {
            message.info("Aksi dibatalkan");
          },
        });
        break;

      case "retake":
        confirm({
          title: `Apakah anda yakin mengulang ujian ${record.student_name} ?`,
          content: "Jawaban dan nilai yang telah diperoleh akan dihapus",
          okText: `Ya, Ulangi Ujian ${record.student_name}`,
          cancelText: "Tutup",
          okType: "danger",
          async onOk() {
            try {
              await retakeExam(record.log_id);
              message.success(
                `Data ujian ${record.student_name} telah direset`
              );
            } catch (error) {
              message.error(error?.data?.message || "Terjadi Kesalahan");
            }
          },
          onCancel() {
            message.info("Aksi dibatalkan");
          },
        });
        break;

      default:
        break;
    }
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    { title: "NIS", dataIndex: "nis", key: "nis" },
    { title: "Nama Siswa", dataIndex: "student_name", key: "student_name" },
    { title: "Tingkat", dataIndex: "grade_name", key: "grade_name" },
    { title: "Kelas", dataIndex: "class_name", key: "class_name" },
    { title: "Ip", dataIndex: "ip", key: "ip" },
    { title: "Browser", dataIndex: "browser", key: "browser" },
    {
      title: "Mulai",
      dataIndex: "createdat",
      key: "createdat",
      render: (text) => (
        <Tag color='volcano'>{text && new Date(text).toLocaleString()}</Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record) =>
        record.ispenalty ? (
          <Tag color='red'>Melanggar</Tag>
        ) : record.isactive ? (
          <Tag color='blue'>Mengerjakan</Tag>
        ) : record.isdone ? (
          <Tag color='green'>Selesai</Tag>
        ) : (
          <Tag>Belum Masuk</Tag>
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
                label: "Lihat Jawaban",
                disabled: !record.log_id,
              },
              {
                key: "allow",
                label: "Izikan Masuk",
                disabled: !record.isactive,
              },
              {
                key: "finish",
                label: "Selesaikan Ujian",
                disabled: !record.isdone || !record.isactive,
              },
              {
                key: "retake",
                label: "Ulangi Ujian",
                disabled: !record.isdone,
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
      tableRef={tableRef}
      onSearch={handleSearch}
      isLoading={isLoading || rejoingLoading || finishLoading || retakeLoading}
      columns={columns}
      source={data?.result}
      rowKey='student_id'
      page={page}
      limit={limit}
      totalData={data?.totalData}
      onChange={handleTableChange}
    />
  );
};

export default Logs;
