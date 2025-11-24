import {
  Alert,
  Button,
  Flex,
  Select,
  Space,
  Spin,
  Typography,
  Table,
  Card,
  Descriptions,
  message,
} from "antd";
import React, { useState, useMemo } from "react";
import { useGetClassQuery } from "../../../service/api/main/ApiClass";
import { useGetSubjectQuery } from "../../../service/api/main/ApiSubject";
import { DownloadOutlined } from "@ant-design/icons";
import { useGetPresensiQuery } from "../../../service/api/lms/ApiRecap";
import * as XLSX from "xlsx";
import moment from "moment";

const { Title, Text } = Typography;

const Presensi = () => {
  const page = "";
  const limit = "";
  const search = "";

  const [selectedSemester, setSemester] = useState(null);
  const [classid, setClassid] = useState(null);
  const [subjectid, setSubjectid] = useState(null);

  const { data: clsData } = useGetClassQuery({ page, limit, search });
  const { data: subjectData } = useGetSubjectQuery({ page, limit, search });

  const {
    data: scoreData,
    isLoading,
    isFetching,
  } = useGetPresensiQuery(
    {
      semester: selectedSemester,
      classid,
      subjectid,
    },
    { skip: !selectedSemester || !classid || !subjectid }
  );

  const semester = [
    { label: "Semester 1", value: 1 },
    { label: "Semester 2", value: 2 },
  ];
  const clsOpt = clsData?.map((c) => ({ label: c.name, value: c.id }));
  const subjectOpt = subjectData?.map((s) => ({ label: s.name, value: s.id }));

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const getClassName = () =>
    clsData?.find((c) => c.id === classid)?.name || "-";
  const getSubjectName = () =>
    subjectData?.find((s) => s.id === subjectid)?.name || "-";

  const getCode = (note) => {
    switch (note) {
      case "Hadir":
        return <span style={{ color: "green" }}>H</span>;
      case "Sakit":
        return <span style={{ color: "orange" }}>S</span>;
      case "Izin":
        return <span style={{ color: "blue" }}>I</span>;
      case "Alpa":
        return <span style={{ color: "red" }}>A</span>;
      default:
        return "-";
    }
  };

  // --- Helper: Hitung Total Hari Aktif ---
  // Digunakan sebagai pembagi untuk persentase
  const totalDays = useMemo(() => {
    if (!scoreData || !scoreData.dateMapping) return 0;
    return Object.values(scoreData.dateMapping).flat().length;
  }, [scoreData]);

  console.log(totalDays);

  // --- 1. Definisi Kolom Tabel Dinamis ---
  const columns = useMemo(() => {
    if (!scoreData || !scoreData.dateMapping) return [];

    // A. Kolom Tetap Kiri
    const fixedLeft = [
      {
        title: "No",
        dataIndex: "no",
        key: "no",
        width: 50,
        fixed: "left",
        align: "center",
      },
      {
        title: "NIS",
        dataIndex: "nis",
        key: "nis",
        width: 100,
        fixed: "left",
      },
      {
        title: "Nama Siswa",
        dataIndex: "name",
        key: "name",
        width: 200,
        fixed: "left",
        render: (text) => <Text ellipsis>{text}</Text>,
      },
    ];

    // B. Kolom Dinamis (Bulan -> Tanggal)
    const monthColumns = Object.keys(scoreData.dateMapping).map((month) => ({
      title: month,
      children: scoreData.dateMapping[month].map((dateStr) => ({
        title: moment(dateStr).format("DD"),
        key: dateStr,
        width: 40,
        align: "center",
        render: (row) => getCode(row.attendance[dateStr]),
      })),
    }));

    // C. Kolom Ringkasan (Jumlah H, S, I, A)
    const summaryColumns = [
      {
        title: "Ringkasan", // UBAH NAMA DARI PRESENTASE KE RINGKASAN
        children: [
          {
            title: "H",
            width: 45,
            align: "center",
            render: (row) => row.summary?.H || 0,
          },
          {
            title: "S",
            width: 45,
            align: "center",
            render: (row) => row.summary?.S || 0,
          },
          {
            title: "I",
            width: 45,
            align: "center",
            render: (row) => row.summary?.I || 0,
          },
          {
            title: "A",
            width: 45,
            align: "center",
            render: (row) => row.summary?.A || 0,
          },
        ],
      },
    ];

    // D. Kolom Presentase (Hitungan %) - BARU
    const percentageColumns = [
      {
        title: "Presentase (%)",
        children: ["H", "S", "I", "A"].map((type) => ({
          title: type,
          width: 55,
          align: "center",
          render: (row) => {
            const count = row.summary?.[type] || 0;
            // Rumus: (Jumlah Status / Total Hari) * 100
            const pct = totalDays > 0 ? (count / totalDays) * 100 : 0;
            // Tampilkan 0 angka di belakang koma (bulat), atau ganti 1/2 jika perlu desimal
            return `${pct.toFixed(0)}%`;
          },
        })),
      },
    ];

    return [
      ...fixedLeft,
      ...monthColumns,
      ...summaryColumns,
      ...percentageColumns,
    ];
  }, [scoreData, totalDays]); // Tambahkan totalDays ke dependency

  // --- 2. Logic Download Excel ---
  const handleDownload = () => {
    if (!scoreData || !scoreData.data || scoreData.data.length === 0) {
      message.warning("Data belum tersedia");
      return;
    }

    const className = getClassName();
    const subjectName = getSubjectName();
    const dateMapping = scoreData.dateMapping;

    const metaInfo = [
      ["Laporan Kehadiran"],
      ["Kelas", className],
      ["Pelajaran", subjectName],
      ["Semester", selectedSemester],
      [],
    ];

    const headerRow1 = ["No", "NIS", "Nama Siswa"];
    const headerRow2 = ["", "", ""];
    const merges = [];

    let currentCol = 3;

    // 2.1 Loop Bulan & Tanggal
    Object.keys(dateMapping).forEach((month) => {
      const dates = dateMapping[month];
      const dateCount = dates.length;

      headerRow1.push(month);
      for (let i = 0; i < dateCount - 1; i++) headerRow1.push("");

      merges.push({
        s: { r: 5, c: currentCol },
        e: { r: 5, c: currentCol + dateCount - 1 },
      });

      dates.forEach((date) => {
        headerRow2.push(moment(date).format("DD/MM"));
      });

      currentCol += dateCount;
    });

    // 2.2 Tambah Header Ringkasan
    headerRow1.push("Ringkasan");
    for (let i = 0; i < 3; i++) headerRow1.push(""); // Space H,S,I,A
    merges.push({ s: { r: 5, c: currentCol }, e: { r: 5, c: currentCol + 3 } });
    headerRow2.push("H", "S", "I", "A");
    currentCol += 4;

    // 2.3 Tambah Header Presentase (BARU)
    headerRow1.push("Presentase (%)");
    for (let i = 0; i < 3; i++) headerRow1.push(""); // Space H,S,I,A
    merges.push({ s: { r: 5, c: currentCol }, e: { r: 5, c: currentCol + 3 } });
    headerRow2.push("H", "S", "I", "A");

    // 2.4 Data Body
    const allDatesFlattened = Object.values(dateMapping).flat();
    // Hitung total hari untuk rumus excel (opsional, disini kita hitung manual per row)
    const totalDaysCount = allDatesFlattened.length;

    const bodyData = scoreData.data.map((row) => {
      const rowArr = [row.no, row.nis, row.name];

      // Loop Tanggal
      allDatesFlattened.forEach((date) => {
        const status = row.attendance[date]
          ? row.attendance[date].charAt(0)
          : "-";
        rowArr.push(status);
      });

      // Data Ringkasan
      const h = row.summary.H || 0;
      const s = row.summary.S || 0;
      const i = row.summary.I || 0;
      const a = row.summary.A || 0;
      rowArr.push(h, s, i, a);

      // Data Presentase (BARU)
      const calcPct = (val) =>
        totalDaysCount > 0
          ? ((val / totalDaysCount) * 100).toFixed(2) + "%"
          : "0%";
      rowArr.push(calcPct(h), calcPct(s), calcPct(i), calcPct(a));

      return rowArr;
    });

    const wsData = [...metaInfo, headerRow1, headerRow2, ...bodyData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!merges"] = merges;
    ws["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, `Rekap_Absensi_${className}_${subjectName}.xlsx`);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          Laporan Kehadiran
        </Title>
        <Space>
          <Select
            style={{ width: 150 }}
            placeholder="Pilih Semester ..."
            allowClear
            options={semester}
            onChange={(value) => setSemester(value)}
            virtual={false}
          />
          <Select
            style={{ width: 150 }}
            placeholder="Pilih kelas ..."
            allowClear
            options={clsOpt}
            onChange={(value) => setClassid(value)}
            showSearch
            filterOption={filterOption}
            virtual={false}
          />
          <Select
            style={{ width: 150 }}
            placeholder="Pilih Pelajaran ..."
            allowClear
            options={subjectOpt}
            onChange={(value) => setSubjectid(value)}
            showSearch
            filterOption={filterOption}
            virtual={false}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!scoreData || isLoading || isFetching}
          >
            Download
          </Button>
        </Space>
      </Flex>

      {!classid || !subjectid || !selectedSemester ? (
        <Alert
          showIcon
          type="info"
          description="Pilih Semester, Kelas, dan Pelajaran untuk menampilkan data absensi"
        />
      ) : isLoading || isFetching ? (
        <Flex justify="center" style={{ padding: 50 }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <Card
          size="small"
          variant="borderless"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
          <Descriptions
            bordered
            size="small"
            layout="vertical"
            column={3}
            style={{ marginBottom: 16 }}
          >
            <Descriptions.Item label="Semester">
              {selectedSemester}
            </Descriptions.Item>
            <Descriptions.Item label="Kelas">
              {getClassName()}
            </Descriptions.Item>
            <Descriptions.Item label="Pelajaran">
              {getSubjectName()}
            </Descriptions.Item>
          </Descriptions>

          <Table
            dataSource={scoreData?.data || []}
            columns={columns}
            rowKey="no"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: "max-content" }}
            sticky
          />
        </Card>
      )}
    </Flex>
  );
};

export default Presensi;
