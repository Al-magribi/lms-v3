import React, { useState, useEffect } from "react";
import { Card, Table, Input, Button, Space, message } from "antd";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  useGetAttitudeQuery,
  useUpsertAttitudeMutation,
  useBulkUpsertAttitudeMutation,
} from "../../../service/api/lms/ApiScore";
import UploadBulk from "./UploadBulk";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

const Attitude = ({
  students,
  totalData,
  page,
  limit,
  setPage,
  setLimit,
  isLoading,
}) => {
  // State untuk menyimpan skor dan visibilitas modal
  const [attitudeScores, setAttitudeScores] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mengambil data pengguna dan parameter dari URL
  const { user } = useSelector((state) => state.auth);
  const teacher_id = user?.id;
  const [searchParams] = useSearchParams();
  const subjectname = searchParams.get("name");
  const subjectid = searchParams.get("subjectid");
  const chapterid = searchParams.get("chapter");
  const classid = searchParams.get("class");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  // RTK Query Hooks untuk mengambil dan mengirim data
  const { data: attitudeData, refetch } = useGetAttitudeQuery(
    { classid, subjectid, chapterid, month, semester },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
      refetchOnMountOrArgChange: true,
    }
  );

  const [upsertAttitude, { isLoading: isSaving }] = useUpsertAttitudeMutation();
  const [
    bulkUpsertAttitude,
    { isLoading: isBulkUpserting, data, error, isSuccess, reset },
  ] = useBulkUpsertAttitudeMutation();

  // Efek untuk mereset skor jika parameter URL berubah
  useEffect(() => {
    setAttitudeScores({});
  }, [classid, subjectid, chapterid, month, semester]);

  // Efek untuk mengisi state skor dari data yang berhasil diambil
  useEffect(() => {
    if (attitudeData && Array.isArray(attitudeData)) {
      const mapped = attitudeData.reduce((acc, row) => {
        // Menggunakan student_id sebagai key, yang seharusnya cocok dengan 'student.student'
        acc[row.student_id] = {
          kinerja: row.kinerja ?? "",
          kedisiplinan: row.kedisiplinan ?? "",
          keaktifan: row.keaktifan ?? "",
          percayaDiri: row.percaya_diri ?? "",
          catatan: row.catatan_guru ?? "",
        };
        return acc;
      }, {});
      if (Object.keys(mapped).length > 0) setAttitudeScores(mapped);
    }
  }, [attitudeData]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      reset();
      setIsModalOpen(false);
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [data, error, isSuccess]);

  // Handler untuk perubahan input nilai
  const handleScoreChange = (studentId, field, value) => {
    setAttitudeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Handler untuk menyimpan nilai per siswa
  const handleSave = async (student) => {
    const studentId = student.student; // ID Siswa yang benar (e.g., 2220)
    const studentScores = attitudeScores[studentId] || {}; // Mengambil skor dengan key yang benar

    const payload = {
      student_id: studentId,
      subject_id: Number(subjectid),
      class_id: Number(classid),
      chapter_id: Number(chapterid),
      teacher_id,
      month,
      semester,
      kinerja: studentScores.kinerja ? Number(studentScores.kinerja) : null,
      kedisiplinan: studentScores.kedisiplinan
        ? Number(studentScores.kedisiplinan)
        : null,
      keaktifan: studentScores.keaktifan
        ? Number(studentScores.keaktifan)
        : null,
      percaya_diri: studentScores.percayaDiri
        ? Number(studentScores.percayaDiri)
        : null,
      catatan_guru: studentScores.catatan || null,
    };

    try {
      const result = await upsertAttitude(payload).unwrap();
      message.success(result.message || "Nilai berhasil disimpan!");
      refetch();
    } catch (err) {
      message.error(err.data?.message || "Gagal menyimpan nilai.");
    }
  };

  // Fungsi untuk menghitung rata-rata nilai
  const calculateAverage = (studentId) => {
    const scores = attitudeScores[studentId];
    if (!scores) return 0;

    const values = [
      scores.kinerja,
      scores.kedisiplinan,
      scores.keaktifan,
      scores.percayaDiri,
    ].filter((score) => score !== "" && score != null);

    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + Number(score), 0) / values.length
    ).toFixed(1);
  };

  // Handler untuk mengunduh template Excel
  const handleDownloadTemplate = () => {
    const excelData = [
      [
        "NIS",
        "Nama Siswa",
        "Kinerja",
        "Kedisiplinan",
        "Keaktifan",
        "Percaya Diri",
        "Catatan",
        "Rerata",
      ],
    ];

    if (students) {
      students.forEach((student) => {
        const studentId = student.student;
        const scores = attitudeScores[studentId] || {};
        const average = calculateAverage(studentId);

        excelData.push([
          student.nis || "",
          student.student_name || "",
          scores.kinerja ?? "",
          scores.kedisiplinan ?? "",
          scores.keaktifan ?? "",
          scores.percayaDiri ?? "",
          scores.catatan ?? "",
          average > 0 ? average : "",
        ]);
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 15 }, // NIS
      { wch: 30 }, // Nama Siswa
      { wch: 12 }, // Kinerja
      { wch: 15 }, // Kedisiplinan
      { wch: 12 }, // Keaktifan
      { wch: 15 }, // Percaya Diri
      { wch: 40 }, // Catatan
      { wch: 12 }, // Rerata
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Penilaian Sikap");
    const filename = `penilaian_sikap_${subjectname?.replace(/-/g, " ")}.xlsx`;
    XLSX.writeFile(workbook, filename);
    message.success("Template berhasil diunduh!");
  };

  // Handler untuk memproses file Excel yang diunggah
  const handleBulkUpload = async (dataToUpload) => {
    if (!dataToUpload || dataToUpload.length === 0) {
      message.error("Tidak ada data untuk diunggah.");
      return;
    }

    const payload = {
      classid: Number(classid),
      subjectid: Number(subjectid),
      chapterid: Number(chapterid),
      month,
      semester,
      data: dataToUpload, // Langsung gunakan data dari modal pratinjau
    };

    try {
      await bulkUpsertAttitude(payload).unwrap();
      message.success("Data nilai berhasil di-upload!");
      setIsModalOpen(false); // Tutup modal setelah berhasil
      refetch(); // Ambil data terbaru
    } catch (err) {
      message.error(err.data?.message || "Gagal mengupload file.");
    }
  };

  //   Handle table

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // Definisi kolom untuk tabel Ant Design
  const columns = [
    {
      title: "No",
      key: "index",
      render: (text, record, index) => (page - 1) * limit + index + 1,
      width: 60,
      fixed: "left",
    },
    { title: "NIS", dataIndex: "nis", key: "nis", width: 120, fixed: "left" },
    {
      title: "Nama Siswa",
      dataIndex: "student_name",
      key: "student_name",
      width: 200,
      fixed: "left",
    },
    {
      title: "Kinerja",
      key: "kinerja",
      width: 120,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          // PERBAIKAN: Gunakan record.student sebagai key
          value={attitudeScores[record.student]?.kinerja ?? ""}
          onChange={(e) =>
            handleScoreChange(record.student, "kinerja", e.target.value)
          }
          placeholder="0-100"
        />
      ),
    },
    {
      title: "Kedisiplinan",
      key: "kedisiplinan",
      width: 120,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          // PERBAIKAN: Gunakan record.student sebagai key
          value={attitudeScores[record.student]?.kedisiplinan ?? ""}
          onChange={(e) =>
            handleScoreChange(record.student, "kedisiplinan", e.target.value)
          }
          placeholder="0-100"
        />
      ),
    },
    {
      title: "Keaktifan",
      key: "keaktifan",
      width: 120,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          // PERBAIKAN: Gunakan record.student sebagai key
          value={attitudeScores[record.student]?.keaktifan ?? ""}
          onChange={(e) =>
            handleScoreChange(record.student, "keaktifan", e.target.value)
          }
          placeholder="0-100"
        />
      ),
    },
    {
      title: "Percaya Diri",
      key: "percayaDiri",
      width: 120,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          // PERBAIKAN: Gunakan record.student sebagai key
          value={attitudeScores[record.student]?.percayaDiri ?? ""}
          onChange={(e) =>
            handleScoreChange(record.student, "percayaDiri", e.target.value)
          }
          placeholder="0-100"
        />
      ),
    },
    {
      title: "Catatan Guru",
      key: "catatan",
      width: 250,
      render: (_, record) => (
        <Input.TextArea
          rows={3}
          // PERBAIKAN: Gunakan record.student sebagai key
          value={attitudeScores[record.student]?.catatan || ""}
          onChange={(e) =>
            handleScoreChange(record.student, "catatan", e.target.value)
          }
          placeholder="Catatan..."
        />
      ),
    },
    {
      title: "Rerata",
      key: "average",
      width: 100,
      // PERBAIKAN: Gunakan record.student sebagai key
      render: (_, record) => (
        <strong>{calculateAverage(record.student)}</strong>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSave(record)}
          loading={isSaving}
        >
          Simpan
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Penilaian Sikap"
      extra={
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Upload Nilai
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            type="primary"
          >
            Download
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={students}
        // rowKey tetap 'id' karena ini adalah unique key untuk setiap baris data di prop 'students'
        rowKey="id"
        bordered
        // 3. Konfigurasi pagination dan loading sebagai controlled component
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total: totalData,
          showSizeChanger: true,
        }}
        onChange={handleTableChange} // 4. Hubungkan handler
        scroll={{ x: 1500 }}
      />

      <UploadBulk
        title="Upload Nilai Sikap (Bulk)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onUpload={handleBulkUpload}
        isLoading={isBulkUpserting}
      />
    </Card>
  );
};

export default Attitude;
