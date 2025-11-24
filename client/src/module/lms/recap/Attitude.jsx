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
import { useGetAttitudeQuery } from "../../../service/api/lms/ApiRecap"; // Pastikan path ini benar sesuai slice redux anda
import * as XLSX from "xlsx";

const { Title } = Typography;

const Attitude = () => {
  const page = "";
  const limit = "";
  const search = "";

  const [selectedSemester, setSemester] = useState(null);
  const [classid, setClassid] = useState(null);
  const [subjectid, setSubjectid] = useState(null);

  const { data: clsData } = useGetClassQuery({ page, limit, search });
  const { data: subjectData } = useGetSubjectQuery({ page, limit, search });

  // Mengambil data dari endpoint yang baru dibuat
  const {
    data: recapData,
    isLoading,
    isFetching,
  } = useGetAttitudeQuery(
    { semester: selectedSemester, classid, subjectid },
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

  // --- 1. Definisi Kolom Tabel Dinamis ---
  const columns = useMemo(() => {
    if (!recapData || !recapData.months) return [];

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
      },
    ];

    // B. Kolom Dinamis per Bulan
    const monthColumns = recapData.months.map((month) => ({
      title: month, // Header Bulan (misal: Juli)
      children: [
        {
          title: "Kinerja",
          width: 80,
          align: "center",
          render: (row) => row.scores[month]?.kinerja ?? "-",
        },
        {
          title: "Kedisiplinan",
          width: 100,
          align: "center",
          render: (row) => row.scores[month]?.kedisiplinan ?? "-",
        },
        {
          title: "Keaktifan",
          width: 80,
          align: "center",
          render: (row) => row.scores[month]?.keaktifan ?? "-",
        },
        {
          title: "Percaya Diri",
          width: 100,
          align: "center",
          render: (row) => row.scores[month]?.percaya_diri ?? "-",
        },
      ],
    }));

    // C. Kolom Rata-Rata Akhir
    const fixedRight = [
      {
        title: "Rata - Rata",
        dataIndex: "final_score",
        key: "final_score",
        width: 100,
        fixed: "right",
        align: "center",
        render: (val) => <strong>{val}</strong>,
      },
    ];

    return [...fixedLeft, ...monthColumns, ...fixedRight];
  }, [recapData]);

  // --- 2. Logic Download Excel ---
  const handleDownload = () => {
    if (!recapData || !recapData.data || recapData.data.length === 0) {
      message.warning("Data belum tersedia");
      return;
    }

    const className = getClassName();
    const subjectName = getSubjectName();
    const months = recapData.months;

    // Metadata
    const metaInfo = [
      ["Rekapitulasi Nilai Sikap"],
      ["Kelas", className],
      ["Pelajaran", subjectName],
      ["Semester", selectedSemester],
      [], // Spasi
    ];

    // Header Baris 1: No, NIS, Nama, [Bulan...], Rata-rata
    const headerRow1 = ["No", "NIS", "Nama Siswa"];
    // Header Baris 2: [Kosong...], [Kinerja, Kedisiplinan...], [Kosong]
    const headerRow2 = ["", "", ""];

    const merges = [];
    let colIndex = 3; // Mulai setelah Nama Siswa

    // Loop Bulan untuk Header dan Merge
    months.forEach((month) => {
      // Header 1: Nama Bulan
      headerRow1.push(month);
      // Tambahkan placeholder kosong untuk merge (total 4 kolom per bulan)
      headerRow1.push("", "", "");

      // Header 2: Sub-kolom
      headerRow2.push("Kinerja", "Kedisiplinan", "Keaktifan", "Percaya Diri");

      // Set Merge Config untuk Bulan tersebut
      // Row index 5 (karena ada 5 baris metaInfo di atasnya)
      merges.push({
        s: { r: 5, c: colIndex },
        e: { r: 5, c: colIndex + 3 },
      });

      colIndex += 4;
    });

    // Tambah Header Rata-Rata
    headerRow1.push("Rata - Rata");
    headerRow2.push("");
    // Merge cell Rata-Rata vertikal (Row 5 ke Row 6)
    merges.push({ s: { r: 5, c: colIndex }, e: { r: 6, c: colIndex } });

    // Merge cell No, NIS, Nama vertikal
    merges.push({ s: { r: 5, c: 0 }, e: { r: 6, c: 0 } }); // No
    merges.push({ s: { r: 5, c: 1 }, e: { r: 6, c: 1 } }); // NIS
    merges.push({ s: { r: 5, c: 2 }, e: { r: 6, c: 2 } }); // Nama

    // Body Data
    const bodyData = recapData.data.map((row) => {
      const rowData = [row.no, row.nis, row.name];

      months.forEach((month) => {
        const score = row.scores[month];
        if (score) {
          rowData.push(
            score.kinerja,
            score.kedisiplinan,
            score.keaktifan,
            score.percaya_diri
          );
        } else {
          rowData.push("-", "-", "-", "-");
        }
      });

      rowData.push(row.final_score);
      return rowData;
    });

    const wsData = [...metaInfo, headerRow1, headerRow2, ...bodyData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!merges"] = merges;
    ws["!cols"] = [
      { wch: 5 }, // No
      { wch: 15 }, // NIS
      { wch: 30 }, // Nama
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nilai Sikap");
    XLSX.writeFile(wb, `Sikap_${className}_${subjectName}.xlsx`);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          Rekapitulasi Nilai Sikap
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
            disabled={!recapData || isLoading || isFetching}
          >
            Download
          </Button>
        </Space>
      </Flex>

      {!classid || !subjectid || !selectedSemester ? (
        <Alert
          showIcon
          type="info"
          description="Pilih Semester, Kelas, dan Pelajaran untuk menampilkan data nilai sikap."
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
            dataSource={recapData?.data || []}
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

export default Attitude;
