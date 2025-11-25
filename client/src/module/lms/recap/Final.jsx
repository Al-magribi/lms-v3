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
import * as XLSX from "xlsx"; // 1. Import library xlsx
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

  // 2. Fungsi Handle Download Excel
  const handleDownload = () => {
    if (!scoreData || !scoreData.data || scoreData.data.length === 0) {
      message.warning("Tidak ada data untuk diunduh");
      return;
    }

    const weights = scoreData.weights || {
      presensi: 0,
      attitude: 0,
      daily: 0,
      final: 0,
    };
    const className = getClassName();
    const subjectName = getSubjectName();

    // A. Susun Header Info (Baris 1)
    const headerInfo = [
      [
        "Semester",
        selectedSemester,
        "Kelas",
        className,
        "Pelajaran",
        subjectName,
      ],
      [], // Baris kosong untuk pemisah
    ];

    // B. Susun Judul Kolom dengan Bobot (Baris 3)
    const tableHeaders = [
      "No",
      "NIS",
      "Nama Siswa",
      `Kehadiran (${weights.presensi}%)`,
      `Sikap (${weights.attitude}%)`,
      `Harian (${weights.daily}%)`,
      `Ujian Akhir (${weights.final}%)`,
      "Nilai Akhir",
    ];

    // C. Mapping Data Siswa ke Array
    const tableData = scoreData.data.map((row) => [
      row.no,
      row.nis,
      row.nama_siswa,
      parseFloat(row.kehadiran), // Convert ke number agar Excel membacanya sebagai angka
      parseFloat(row.sikap),
      parseFloat(row.harian),
      parseFloat(row.ujian_akhir),
      parseFloat(row.nilai_akhir),
    ]);

    // D. Gabungkan Semua
    const finalSheetData = [...headerInfo, tableHeaders, ...tableData];

    // E. Buat Worksheet
    const ws = XLSX.utils.aoa_to_sheet(finalSheetData);

    // F. Atur Lebar Kolom (Opsional, agar rapi saat dibuka)
    ws["!cols"] = [
      { wch: 5 }, // No
      { wch: 15 }, // NIS
      { wch: 30 }, // Nama
      { wch: 15 }, // Kehadiran
      { wch: 15 }, // Sikap
      { wch: 15 }, // Harian
      { wch: 15 }, // Ujian
      { wch: 15 }, // Akhir
    ];

    // G. Buat Workbook & Download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nilai Akhir");

    // Nama file dinamis
    const fileName =
      `Nilai_Akhir_${className}_${subjectName}_Semester_${selectedSemester}.xlsx`.replace(
        /\s+/g,
        "_"
      );

    XLSX.writeFile(wb, fileName);
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 50,
      align: "center",
    },
    {
      title: "NIS",
      dataIndex: "nis",
      key: "nis",
      width: 100,
    },
    {
      title: "Nama Siswa",
      dataIndex: "nama_siswa",
      key: "nama_siswa",
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
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Sumatif <br />
          <Text type="secondary" style={{ fontSize: "0.8em" }}>
            {scoreData?.weights?.daily || 0}%
          </Text>
        </div>
      ),
      dataIndex: "harian",
      key: "harian",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Ujian Akhir <br />
          <Text type="secondary" style={{ fontSize: "0.8em" }}>
            {scoreData?.weights?.final || 0}%
          </Text>
        </div>
      ),
      dataIndex: "ujian_akhir",
      key: "ujian_akhir",
      align: "center",
      width: 100,
    },
    {
      title: "Nilai Akhir",
      dataIndex: "nilai_akhir",
      key: "nilai_akhir",
      align: "center",
      fixed: "right",
      width: 100,
      render: (text) => <strong>{text}</strong>,
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

          {/* 3. Pasang Handler di Button */}
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!scoreData || isLoading || isFetching} // Disable jika data belum siap
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
            scroll={{ x: 800 }}
          />
        </Card>
      )}
    </Flex>
  );
};

export default Final;
