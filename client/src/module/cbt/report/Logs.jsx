import React, { useState, useRef, useEffect } from "react";
import {
  useFinishCbtMutation,
  useGetExamLogQuery,
  useRejoinExamMutation,
  useRetakeExamMutation,
} from "../../../service/api/log/ApiLog";
import TableLayout from "../../../components/table/TableLayout";
import { Dropdown, Modal, Tag, message, Checkbox, Select, Space } from "antd";
import AnswerSheet from "./AnswerSheet";

const { confirm } = Modal;

const Logs = ({ examid, classid, tableRef, syncTrigger }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [autoRefetchEnabled, setAutoRefetchEnabled] = useState(false);
  const [refetchInterval, setRefetchInterval] = useState(300000); // Default 5 menit (dalam ms)

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState("");

  const {
    data,
    isLoading,
    refetch: logRefetch,
  } = useGetExamLogQuery({
    page,
    limit,
    search,
    exam: examid,
    classid,
  });

  const [finishCbt, { isLoading: finishLoading }] = useFinishCbtMutation();
  const [rejoinExam, { isLoading: rejoingLoading }] = useRejoinExamMutation();
  const [retakeExam, { isLoading: retakeLoading }] = useRetakeExamMutation();

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      logRefetch();
    }
  }, [syncTrigger, logRefetch]);

  // useEffect untuk menangani logika auto-refetch
  useEffect(() => {
    let intervalId = null;

    if (autoRefetchEnabled) {
      // Set interval hanya jika auto-refetch diaktifkan
      intervalId = setInterval(() => {
        logRefetch();
        message.success("Data berhasil di-refresh secara otomatis");
      }, refetchInterval);
    }

    // Cleanup function untuk membersihkan interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefetchEnabled, refetchInterval, logRefetch]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleOpen = (record) => {
    setOpen(true);
    setDetail(record);
  };

  const handleClose = () => {
    setOpen(false);
    setDetail("");
  };

  const handleSelect = (record, { key }) => {
    switch (key) {
      case "detail":
        handleOpen(record);
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
              console.log(record);
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
              await finishCbt({ id: record.log_id, exam: examid });
              message.success(
                `Ujian ${record.student_name} telah diselesaikan`
              );
            } catch (error) {
              console.log(error);
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
              await retakeExam({
                id: record.log_id,
                exam: examid,
                student: record.student_id,
              });
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
        <Tag color="volcano">{text && new Date(text).toLocaleString()}</Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record) =>
        record.ispenalty ? (
          <Tag color="red">Melanggar</Tag>
        ) : record.isdone ? (
          <Tag color="green">Selesai</Tag>
        ) : record.isactive ? (
          <Tag color="blue">Mengerjakan</Tag>
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
                disabled: record.isdone || !record.isactive,
              },
              {
                key: "finish",
                label: "Selesaikan Ujian",
                disabled: record.isdone || !record.isactive,
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
    <>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Checkbox
            checked={autoRefetchEnabled}
            onChange={(e) => setAutoRefetchEnabled(e.target.checked)}
          >
            Auto Refetch
          </Checkbox>
          <Select
            value={refetchInterval}
            onChange={setRefetchInterval}
            disabled={!autoRefetchEnabled}
            style={{ width: 150 }}
          >
            <Select.Option value={300000}>Setiap 5 Menit</Select.Option>
            <Select.Option value={600000}>Setiap 10 Menit</Select.Option>
          </Select>
        </Space>
      </div>
      <TableLayout
        tableRef={tableRef}
        onSearch={handleSearch}
        isLoading={
          isLoading || rejoingLoading || finishLoading || retakeLoading
        }
        columns={columns}
        source={data?.result}
        rowKey="student_id"
        page={page}
        limit={limit}
        totalData={data?.totalData}
        onChange={handleTableChange}
      />

      <AnswerSheet open={open} onClose={handleClose} detail={detail} />
    </>
  );
};

export default Logs;
