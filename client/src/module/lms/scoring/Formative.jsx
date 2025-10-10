import React, { useState, useEffect } from "react";
import { Card, Table, Input, Button, Space, message } from "antd";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  useGetFormativeQuery,
  useUpsertFormativeMutation,
  useBulkUpsertFormativeMutation,
} from "../../../service/api/lms/ApiScore";
import UploadBulk from "./UploadBulk";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

const Formative = ({
  students,
  totalData,
  page,
  limit,
  setPage,
  setLimit,
  isLoading,
}) => {
  const [formativeScores, setFormativeScores] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const teacher_id = user?.id;
  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("subjectid");
  const chapterid = searchParams.get("chapter");
  const classid = searchParams.get("class");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  const { data: formativeData, refetch } = useGetFormativeQuery(
    { classid, subjectid, chapterid, month, semester },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
      refetchOnMountOrArgChange: true,
    }
  );

  const [upsertFormative, { isLoading: isSaving }] =
    useUpsertFormativeMutation();
  const [
    bulkUpsertFormative,
    { isLoading: isBulkUpserting, data, error, isSuccess, reset },
  ] = useBulkUpsertFormativeMutation();

  // Mengisi state skor dari data yang diambil
  useEffect(() => {
    if (formativeData && Array.isArray(formativeData)) {
      const mapped = formativeData.reduce((acc, row) => {
        acc[row.student_id] = {
          f_1: row.f_1 ?? "",
          f_2: row.f_2 ?? "",
          f_3: row.f_3 ?? "",
          f_4: row.f_4 ?? "",
          f_5: row.f_5 ?? "",
          f_6: row.f_6 ?? "",
          f_7: row.f_7 ?? "",
          f_8: row.f_8 ?? "",
        };
        return acc;
      }, {});
      setFormativeScores(mapped);
    }
  }, [formativeData]);

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
  const handleScoreChange = (studentId, taskNumber, value) => {
    setFormativeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [`f_${taskNumber}`]: value,
      },
    }));
  };

  // Fungsi untuk menghitung rata-rata
  const calculateAverage = (studentId) => {
    const scores = formativeScores[studentId];
    if (!scores) return 0;
    const values = Object.values(scores).filter(
      (score) => score !== "" && score != null
    );
    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + Number(score), 0) / values.length
    ).toFixed(1);
  };

  // Handler untuk menyimpan nilai per siswa
  const handleSave = async (student) => {
    const studentId = student.student;
    const scores = formativeScores[studentId] || {};

    const payload = {
      student_id: studentId,
      subject_id: Number(subjectid),
      class_id: Number(classid),
      chapter_id: Number(chapterid),
      teacher_id,
      month,
      semester,
      F_1: scores.f_1 ? Number(scores.f_1) : null,
      F_2: scores.f_2 ? Number(scores.f_2) : null,
      F_3: scores.f_3 ? Number(scores.f_3) : null,
      F_4: scores.f_4 ? Number(scores.f_4) : null,
      F_5: scores.f_5 ? Number(scores.f_5) : null,
      F_6: scores.f_6 ? Number(scores.f_6) : null,
      F_7: scores.f_7 ? Number(scores.f_7) : null,
      F_8: scores.f_8 ? Number(scores.f_8) : null,
    };

    upsertFormative(payload);
  };

  // Handler untuk mengunduh template Excel
  const handleDownloadTemplate = () => {
    const headers = ["NIS", "Nama Siswa"];
    for (let i = 1; i <= 8; i++) headers.push(`F_${i}`);
    headers.push("Rerata");

    const excelData = [headers];

    if (students) {
      students.forEach((student) => {
        const row = [student.nis || "", student.student_name || ""];
        for (let i = 1; i <= 10; i++) row.push(""); // 8 kolom nilai + 1 rerata
        excelData.push(row);
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penilaian Formatif");
    XLSX.writeFile(workbook, "template_penilaian_formatif.xlsx");
    message.success("Template berhasil diunduh!");
  };

  // Handler untuk unggah massal
  const handleBulkUpload = async (dataToUpload) => {
    const payload = {
      classid: Number(classid),
      subjectid: Number(subjectid),
      chapterid: Number(chapterid),
      month,
      semester,
      data: dataToUpload,
    };

    bulkUpsertFormative(payload);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  // --- Definisi Kolom Tabel ---
  const fixedColumns = [
    {
      title: "No",
      key: "index",
      render: (_, __, index) => (page - 1) * limit + index + 1,
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
  ];

  const formativeColumns = Array.from({ length: 8 }, (_, i) => {
    const taskNumber = i + 1;
    return {
      title: `f_${taskNumber}`,
      key: `f_${taskNumber}`,
      width: 100,
      render: (_, record) => (
        <Input
          type='number'
          min={0}
          max={100}
          style={{ textAlign: "center" }}
          placeholder='0-100'
          value={formativeScores[record.student]?.[`f_${taskNumber}`] ?? ""}
          onChange={(e) =>
            handleScoreChange(record.student, taskNumber, e.target.value)
          }
        />
      ),
    };
  });

  const actionColumns = [
    {
      title: "Rerata",
      key: "average",
      width: 80,
      fixed: "right",
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
          type='primary'
          size='small'
          onClick={() => handleSave(record)}
          loading={isSaving}
        >
          Simpan
        </Button>
      ),
    },
  ];

  const columns = [...fixedColumns, ...formativeColumns, ...actionColumns];

  return (
    <Card
      title='Penilaian Formatif'
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
            type='primary'
          >
            Download Template
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={students}
        rowKey='id'
        bordered
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total: totalData,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />
      <UploadBulk
        title='Upload Nilai Formatif (Bulk)'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onUpload={handleBulkUpload}
        isLoading={isBulkUpserting}
      />
    </Card>
  );
};

export default Formative;
