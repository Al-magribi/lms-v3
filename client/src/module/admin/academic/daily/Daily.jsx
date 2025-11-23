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
import { useGetClassQuery } from "../../../../service/api/main/ApiClass";
import { useGetSubjectQuery } from "../../../../service/api/main/ApiSubject";
import { DownloadOutlined } from "@ant-design/icons";
import { useGetDailyRecapQuery } from "../../../../service/api/lms/ApiRecap";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;

const Daily = () => {
  const page = "";
  const limit = "";
  const search = "";

  const [selectedSemester, setSemester] = useState(null);
  const [classid, setClassid] = useState(null);
  const [subjectid, setSubjectid] = useState(null);

  const { data: clsData } = useGetClassQuery({ page, limit, search });
  const { data: subjectData } = useGetSubjectQuery({ page, limit, search });

  const { data, isLoading, isFetching } = useGetDailyRecapQuery(
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

  // --- 1. Definisi Kolom Tabel (Dinamis berdasarkan Bulan) ---
  const columns = useMemo(() => {
    if (!data || !data.months) return [];

    // Kolom Tetap (Kiri)
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
        dataIndex: "nama_siswa",
        key: "nama_siswa",
        width: 200,
        fixed: "left",
      },
    ];

    // Kolom Dinamis (Bulan -> Sub-kolom)
    const monthColumns = data.months.map((month) => ({
      title: month, // Header Bulan (Juli, Agustus, dst)
      children: [
        // Sub-kolom Formatif (f1 - f8)
        ...Array.from({ length: 8 }, (_, i) => ({
          title: `f_${i + 1}`,
          key: `${month}_f_${i + 1}`,
          width: 50,
          align: "center",
          render: (row) => (
            <Text type='secondary' style={{ fontSize: "0.8em" }}>
              {row.scores[month]?.["f_" + (i + 1)] ?? "-"}
            </Text>
          ),
        })),
        // Sub-kolom Sumatif
        {
          title: "Lisan",
          width: 60,
          align: "center",
          render: (row) => row.scores[month]?.oral ?? "-",
        },
        {
          title: "Tulis",
          width: 60,
          align: "center",
          render: (row) => row.scores[month]?.written ?? "-",
        },
        {
          title: "Projek",
          width: 60,
          align: "center",
          render: (row) => row.scores[month]?.project ?? "-",
        },
        {
          title: "Keterampilan",
          width: 90,
          align: "center",
          render: (row) => row.scores[month]?.performance ?? "-",
        },
      ],
    }));

    // Kolom Tetap (Kanan)
    const fixedRight = [
      {
        title: "Rata - rata",
        dataIndex: "rata_rata",
        key: "rata_rata",
        width: 100,
        fixed: "right",
        align: "center",
        render: (val) => <strong>{val}</strong>,
      },
    ];

    return [...fixedLeft, ...monthColumns, ...fixedRight];
  }, [data]);

  // --- 2. Logic Download Excel (Complex Header) ---
  const handleDownload = () => {
    if (!data || !data.data || data.data.length === 0) {
      message.warning("Data belum tersedia");
      return;
    }

    const className = getClassName();
    const subjectName = getSubjectName();
    const monthList = data.months || [];

    // -- Header Row 1: Judul Bulan --
    // [No, NIS, Nama, Juli, (kosong x 11), Agustus, (kosong x 11)..., Rata-rata]
    const headerRow1 = ["No", "NIS", "Nama Siswa"];
    const merges = []; // Array untuk menyimpan koordinat merge cell

    // Hitung posisi kolom awal untuk bulan (dimulai index 3: No, NIS, Nama)
    let currentCtx = 3;

    monthList.forEach((month) => {
      headerRow1.push(month); // Tulis nama bulan
      // Tambahkan cell kosong sebanyak jumlah sub-kolom (12 sub-kolom: f1-f8 + 4 sumatif) - 1 (karena judul bulan makan 1 cell)
      for (let k = 0; k < 11; k++) headerRow1.push("");

      // Merge Header Bulan (Format: {s: {r, c}, e: {r, c}})
      // r:0 (baris pertama), c: currentCtx (kolom awal), e.c: currentCtx + 11 (kolom akhir)
      merges.push({
        s: { r: 3, c: currentCtx },
        e: { r: 3, c: currentCtx + 11 },
      });

      currentCtx += 12;
    });

    headerRow1.push("Rata - rata");

    // -- Header Row 2: Sub-judul (f1, f2, Lisan, dst) --
    const headerRow2 = ["", "", ""]; // Kosongkan 3 kolom pertama
    const subHeaders = [
      "f_1",
      "f_2",
      "f_3",
      "f_4",
      "f_5",
      "f_6",
      "f_7",
      "f_8",
      "Lisan",
      "Tulis",
      "Projek",
      "Ket.",
    ];

    monthList.forEach(() => {
      headerRow2.push(...subHeaders);
    });
    headerRow2.push("");

    // -- Data Body --
    const bodyData = data.data.map((row) => {
      const rowArr = [row.no, row.nis, row.nama_siswa];

      monthList.forEach((month) => {
        const s = row.scores[month] || {};
        // Push nilai formatif
        for (let i = 1; i <= 8; i++)
          rowArr.push(s[`f_${i}`] ? parseFloat(s[`f_${i}`]) : "");
        // Push nilai sumatif
        rowArr.push(s.oral ? parseFloat(s.oral) : "");
        rowArr.push(s.written ? parseFloat(s.written) : "");
        rowArr.push(s.project ? parseFloat(s.project) : "");
        rowArr.push(s.performance ? parseFloat(s.performance) : "");
      });

      rowArr.push(parseFloat(row.rata_rata));
      return rowArr;
    });

    // -- Metadata Info di atas tabel --
    const metaInfo = [
      ["Laporan Nilai Harian"],
      ["Kelas", className],
      ["Pelajaran", subjectName],
      ["Semester", selectedSemester], // Baris ini index ke-2
      [], // Baris kosong sebelum tabel
    ];
    // Jadi tabel mulai di baris index 4 (Excel Row 5), header bulan di index 3 (Excel Row 4)

    // Gabungkan Semua
    const wsData = [...metaInfo, headerRow1, headerRow2, ...bodyData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Terapkan Merge
    ws["!merges"] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Harian");
    XLSX.writeFile(wb, `Rekap_Harian_${className}_${subjectName}.xlsx`);
  };

  return (
    <Flex vertical gap={"middle"}>
      <Flex align='center' justify='space-between'>
        <Title level={5} style={{ margin: 0 }}>
          Rekap Nilai Harian
        </Title>

        <Space>
          <Select
            style={{ width: 150 }}
            placeholder='Pilih Semester ...'
            allowClear
            options={semester}
            onChange={(value) => setSemester(value)}
            virtual={false}
          />

          <Select
            style={{ width: 150 }}
            placeholder='Pilih kelas ...'
            allowClear
            options={clsOpt}
            onChange={(value) => setClassid(value)}
            showSearch
            filterOption={filterOption}
            virtual={false}
          />

          <Select
            style={{ width: 150 }}
            placeholder='Pilih Pelajaran ...'
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
            disabled={!data || isLoading || isFetching}
          >
            Download
          </Button>
        </Space>
      </Flex>

      {!classid || !subjectid || !selectedSemester ? (
        <Alert
          showIcon
          type='info'
          description='Pilih Semester, Kelas, dan Pelajaran untuk menampilkan rekap nilai harian'
        />
      ) : isLoading || isFetching ? (
        <Flex justify='center' style={{ padding: 50 }}>
          <Spin size='large' tip='Memuat Data...' />
        </Flex>
      ) : (
        <Card
          size='small'
          bordered={false}
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
          <Descriptions size='small' column={3} style={{ marginBottom: 16 }}>
            <Descriptions.Item label='Semester'>
              {selectedSemester}
            </Descriptions.Item>
            <Descriptions.Item label='Kelas'>
              {getClassName()}
            </Descriptions.Item>
            <Descriptions.Item label='Pelajaran'>
              {getSubjectName()}
            </Descriptions.Item>
          </Descriptions>

          <Table
            dataSource={data?.data || []}
            columns={columns}
            rowKey='no'
            pagination={false}
            bordered
            size='small'
            scroll={{ x: "max-content", y: 600 }} // Scroll X WAJIB karena tabel sangat lebar
            sticky
          />
        </Card>
      )}
    </Flex>
  );
};

export default Daily;
