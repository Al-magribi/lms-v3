import {
  Button,
  Flex,
  Select,
  Space,
  Typography,
  Table,
  Card,
  message,
  Input,
} from "antd";
import React, { useState, useEffect } from "react";
import { useGetClassQuery } from "../../../service/api/main/ApiClass";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  SaveOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import MainLayout from "../../../components/layout/MainLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetFinalScoreQuery,
  useUpSertFinalScoreMutation,
} from "../../../service/api/lms/ApiScore";
import UploadBulk from "./UploadBulk";
import * as XLSX from "xlsx";

const { Title } = Typography;

const FinalScore = () => {
  const [searchParams] = useSearchParams();

  const subjectid = searchParams.get("subjectid");
  const name = searchParams.get("name");

  const navigate = useNavigate();

  const [selectedSemester, setSemester] = useState(null);
  const [classid, setClassid] = useState(null);

  const [localScores, setLocalScores] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Data Kelas
  const { data: clsData } = useGetClassQuery({
    page: "",
    limit: "",
    search: "",
  });

  const semesterOpt = [
    { label: "Semester 1", value: 1 },
    { label: "Semester 2", value: 2 },
  ];
  const clsOpt = clsData?.map((c) => ({ label: c.name, value: c.id }));

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  // 2. Fetch Data Nilai
  const {
    data: finalScoreData,
    isLoading: isLoadingData,
    refetch,
  } = useGetFinalScoreQuery(
    {
      semester: selectedSemester,
      classid,
      subjectid,
    },
    {
      skip: !selectedSemester || !classid || !subjectid,
      refetchOnMountOrArgChange: true,
    }
  );

  // 3. Mutation untuk Simpan (Upsert)
  const [upsertFinalScore, { isLoading: isSaving }] =
    useUpSertFinalScoreMutation();

  // 4. Sinkronisasi data API ke State Lokal
  useEffect(() => {
    if (finalScoreData && Array.isArray(finalScoreData)) {
      const initialScores = {};
      finalScoreData.forEach((item) => {
        initialScores[item.studentid] = item.score;
      });
      setLocalScores(initialScores);
    } else {
      setLocalScores({});
    }
  }, [finalScoreData]);

  const handleBack = () => navigate("/learning-management-system");

  // Handler: Update State Lokal saat input berubah
  const handleScoreChange = (studentId, value) => {
    setLocalScores((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  // Handler: Simpan SEMUA Data (Bulk Save)
  const handleSaveAll = async () => {
    // Validasi awal
    if (!classid || !selectedSemester) {
      message.warning("Mohon pilih Kelas dan Semester terlebih dahulu.");
      return;
    }

    // Mengumpulkan data dari state localScores berdasarkan siswa yang ada di tabel
    const dataToSave = finalScoreData
      .map((student) => {
        const scoreVal = localScores[student.studentid];
        // Pastikan nilai valid (tidak undefined/null/empty string) untuk dikirim
        // Backend logic sebelumnya akan skip jika score kosong,
        // tapi kita bisa filter di sini juga untuk efisiensi payload.
        if (scoreVal !== undefined && scoreVal !== "" && scoreVal !== null) {
          return {
            studentid: student.studentid,
            score: Number(scoreVal),
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Hapus data yang null (tidak ada nilai)

    if (dataToSave.length === 0) {
      message.info("Tidak ada nilai yang diisi untuk disimpan.");
      return;
    }

    const payload = {
      semester: selectedSemester,
      classid: Number(classid),
      subjectid: Number(subjectid),
      data: dataToSave, // Array of objects { studentid, score }
    };

    try {
      await upsertFinalScore(payload).unwrap();
      message.success(`Berhasil menyimpan ${dataToSave.length} data nilai!`);
      refetch();
    } catch (err) {
      console.error(err);
      message.error(err.data?.message || "Gagal menyimpan data.");
    }
  };

  // Tambahkan helper function ini atau taruh di dalam component
  const handleParseAndUpload = async (uploadedRows) => {
    // 1. Cek apakah data ada (uploadedRows dikirim dari UploadBulk berupa Array of Arrays)
    if (!uploadedRows || uploadedRows.length === 0) {
      message.error("Data kosong atau tidak valid.");
      return;
    }

    // 2. Mapping data Excel ke format API
    // UploadBulk menggunakan { header: 1 }, jadi data berupa array baris: [NIS, Nama, Nilai]
    // Berdasarkan template download: Index 0 = NIS, Index 1 = Nama, Index 2 = Nilai Akhir
    const formattedData = uploadedRows
      .map((row) => {
        // Ambil NIS (index 0) dan Nilai (index 2)
        const nisXls = row[0];
        const scoreXls = row[2];

        // Cari student di state 'finalScoreData' berdasarkan NIS
        const student = finalScoreData.find(
          (s) => String(s.nis).trim() === String(nisXls).trim()
        );

        // Validasi: Siswa ditemukan & Nilai tidak kosong
        if (
          student &&
          scoreXls !== undefined &&
          scoreXls !== null &&
          scoreXls !== ""
        ) {
          return {
            studentid: student.studentid,
            score: Number(scoreXls),
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Hapus data yang tidak valid/tidak cocok

    // 3. Validasi hasil mapping
    if (formattedData.length === 0) {
      message.error(
        "Data Excel tidak cocok. Pastikan NIS sesuai dengan data kelas ini."
      );
      return;
    }

    // 4. Kirim ke API
    try {
      const payload = {
        semester: selectedSemester,
        classid: Number(classid),
        subjectid: Number(subjectid),
        data: formattedData,
      };

      await upsertFinalScore(payload).unwrap();

      message.success(
        `Berhasil mengupload ${formattedData.length} data nilai!`
      );
      setIsModalOpen(false); // Tutup modal
      refetch(); // Refresh data tabel
    } catch (err) {
      console.error(err);
      message.error("Gagal menyimpan data ke server.");
    }
  };

  const handleDownloadTemplate = () => {
    if (!finalScoreData || finalScoreData.length === 0) {
      message.warning("Tidak ada data siswa untuk didownload.");
      return;
    }
    const excelData = [["NIS", "Nama Siswa", "Nilai Akhir"]];
    finalScoreData.forEach((row) => {
      excelData.push([
        row.nis,
        row.student_name,
        localScores[row.studentid] ?? "",
      ]);
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    worksheet["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai Akhir");
    XLSX.writeFile(workbook, `Nilai_Akhir_${name.replace(/-/g, " ")}.xlsx`);
  };

  // Kolom Tabel (Tanpa kolom Aksi "Simpan" per baris)
  const columns = [
    {
      title: "No",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "NIS",
      dataIndex: "nis",
      key: "nis",
      width: 150,
    },
    {
      title: "Nama Siswa",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Nilai",
      key: "score",
      width: 150,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          value={localScores[record.studentid] ?? ""}
          onChange={(e) => handleScoreChange(record.studentid, e.target.value)}
          placeholder="0-100"
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  return (
    <MainLayout title={"Penilaian Akhir Semester"} levels={["teacher"]}>
      <Flex vertical gap={"middle"}>
        <Flex align="center" justify="space-between" wrap>
          <Space>
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            />
            <Title level={5} style={{ margin: 0 }}>
              {` Penilaian Akhir Semester ${name?.replace(/-/g, " ")}`}
            </Title>
          </Space>

          <Space wrap>
            <Select
              style={{ width: 150 }}
              placeholder="Pilih Semester"
              allowClear
              options={semesterOpt}
              onChange={(value) => setSemester(value)}
              value={selectedSemester}
            />

            <Select
              style={{ width: 150 }}
              placeholder="Pilih Kelas"
              allowClear
              options={clsOpt}
              onChange={(value) => setClassid(value)}
              showSearch
              filterOption={filterOption}
              value={classid}
            />

            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              disabled={!finalScoreData?.length}
            >
              Download
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsModalOpen(true)}
              disabled={!classid || !selectedSemester}
            >
              Upload
            </Button>

            {/* Tombol Simpan (Bulk) */}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAll}
              loading={isSaving}
              disabled={
                !classid || !selectedSemester || !finalScoreData?.length
              }
            >
              Simpan Data
            </Button>
          </Space>
        </Flex>

        <Table
          bordered
          dataSource={finalScoreData || []}
          columns={columns}
          rowKey="studentid"
          loading={isLoadingData}
          pagination={false}
          scroll={{ y: 500 }}
          locale={{
            emptyText: "Silakan pilih Semester dan Kelas terlebih dahulu",
          }}
        />

        <UploadBulk
          title="Upload Nilai Akhir"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onUpload={(file) => handleParseAndUpload(file)}
          isLoading={isSaving}
        />
      </Flex>
    </MainLayout>
  );
};

export default FinalScore;
