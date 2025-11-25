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
import React, { useState } from "react";
import { useGetClassQuery } from "../../../service/api/main/ApiClass";
import { useGetSubjectQuery } from "../../../service/api/main/ApiSubject";
import { DownloadOutlined } from "@ant-design/icons";
import { useGetFinalScoreQuery } from "../../../service/api/lms/ApiRecap";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const Final = () => {
  const page = "";
  const limit = "";
  const search = "";

  const user = useSelector((state) => state.auth.user);

  const [selectedSemester, setSemester] = useState(null);
  const [classid, setClassid] = useState(null);
  const [subjectid, setSubjectid] = useState(null);

  const { data: clsData } = useGetClassQuery({ page, limit, search });
  const { data: subjectData } = useGetSubjectQuery({ page, limit, search });

  const {
    data: scoreData,
    isLoading,
    isFetching,
  } = useGetFinalScoreQuery(
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

  const subjectAdmin = subjectData?.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const subjectTeacher = user?.subjects?.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const subjectOpt = user?.level === "admin" ? subjectAdmin : subjectTeacher;

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const getClassName = () =>
    clsData?.find((c) => c.id === classid)?.name || "-";
  const getSubjectName = () =>
    subjectData?.find((s) => s.id === subjectid)?.name || "-";

  // --- 1. Update Logic Download Excel ---
  const handleDownload = () => {
    if (!scoreData || !scoreData.data || scoreData.data.length === 0) {
      message.warning("Tidak ada data untuk diunduh");
      return;
    }

    const weights = scoreData.weights || {
      presensi: 0,
      attitude: 0,
      final: 0,
    };
    const className = getClassName();
    const subjectName = getSubjectName();

    // A. Susun Header Info
    const headerInfo = [
      [
        "Semester",
        selectedSemester,
        "Kelas",
        className,
        "Pelajaran",
        subjectName,
      ],
      [],
    ];

    // B. Susun Header Tabel (Sesuai Gambar Excel)
    const tableHeaders = [
      "No",
      "NIS",
      "Nama Siswa",
      `Kehadiran (${weights.presensi}%)`,
      `Sikap (${weights.attitude}%)`,
      "Sumatif",
      "Ujian Akhir",
      `Rerata Gabungan (${weights.final}%)`, // Kolom E
      "Nilai Akhir",
    ];

    // C. Mapping Data
    const tableData = scoreData.data.map((row) => [
      row.no,
      row.nis,
      row.nama_siswa,
      parseFloat(row.kehadiran),
      parseFloat(row.sikap),
      parseFloat(row.sumatif), // Data Sumatif Murni
      parseFloat(row.ujian_akhir), // Data UAS Murni
      parseFloat(row.rerata_gabungan), // Data (Sumatif+UAS)/2
      parseFloat(row.nilai_akhir),
    ]);

    const finalSheetData = [...headerInfo, tableHeaders, ...tableData];
    const ws = XLSX.utils.aoa_to_sheet(finalSheetData);

    // D. Lebar Kolom
    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nilai Akhir");

    const fileName =
      `Nilai_Akhir_${className}_${subjectName}_Semester_${selectedSemester}.xlsx`.replace(
        /\s+/g,
        "_"
      );

    XLSX.writeFile(wb, fileName);
  };

  // --- 2. Update Struktur Columns Table ---
  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 50,
      align: "center",
      fixed: "left",
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
      dataIndex: "nama_siswa",
      key: "nama_siswa",
      width: 200,
      fixed: "left",
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Kehadiran <br />
          <Text type="secondary" style={{ fontSize: "0.8em" }}>
            {scoreData?.weights?.presensi || 0}%
          </Text>
        </div>
      ),
      dataIndex: "kehadiran",
      key: "kehadiran",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Sikap <br />
          <Text type="secondary" style={{ fontSize: "0.8em" }}>
            {scoreData?.weights?.attitude || 0}%
          </Text>
        </div>
      ),
      dataIndex: "sikap",
      key: "sikap",
      align: "center",
      width: 100,
    },
    // Kolom C: Sumatif (Tanpa bobot di judul, karena bobot ada di rerata)
    {
      title: "Sumatif",
      dataIndex: "sumatif",
      key: "sumatif",
      align: "center",
      width: 100,
    },
    // Kolom D: Ujian Akhir
    {
      title: "Ujian Akhir",
      dataIndex: "ujian_akhir",
      key: "ujian_akhir",
      align: "center",
      width: 100,
    },
    // Kolom E: Rerata Gabungan (Disini Bobot Final diletakkan)
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Rerata (S+U) <br />
          <Text type="secondary" style={{ fontSize: "0.8em" }}>
            {scoreData?.weights?.final || 0}%
          </Text>
        </div>
      ),
      dataIndex: "rerata_gabungan",
      key: "rerata_gabungan",
      align: "center",
      width: 120,
      render: (text) => <Text strong>{text}</Text>, // Optional: tebalkan agar terlihat beda
    },
    {
      title: "Nilai Akhir",
      dataIndex: "nilai_akhir",
      key: "nilai_akhir",
      align: "center",
      fixed: "right",
      width: 100,
      render: (text) => (
        <div
          style={{
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            padding: "4px",
            borderRadius: "4px",
            fontWeight: "bold",
            color: "#389e0d",
          }}
        >
          {text}
        </div>
      ),
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          Rekapitulasi Nilai Akhir
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
          description="Pilih Semester, Kelas, dan Pelajaran untuk menampilkan nilai akhir"
        />
      ) : isLoading || isFetching ? (
        <Flex justify="center" style={{ padding: 50 }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <Card
          variant="borderless"
          size="small"
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
            size="middle"
            scroll={{ x: 1000 }} // Sedikit diperlebar karena ada kolom baru
          />
        </Card>
      )}
    </Flex>
  );
};

export default Final;
