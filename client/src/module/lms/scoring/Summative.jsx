import React, { useState, useEffect } from "react";
import { Card, Table, Input, Button, Space, message } from "antd";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  useGetSummativeQuery,
  useUpsertSummativeMutation,
  useBulkUpsertSummativeMutation,
} from "../../../service/api/lms/ApiScore";
import UploadBulk from "./UploadBulk";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

const Summative = ({
  students,
  totalData,
  page,
  limit,
  setPage,
  setLimit,
  isLoading,
}) => {
  const [summativeScores, setSummativeScores] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const teacher_id = user?.id;
  const [searchParams] = useSearchParams();
  const subjectname = searchParams.get("name");
  const subjectid = searchParams.get("subjectid");
  const chapterid = searchParams.get("chapter");
  const classid = searchParams.get("class");
  const month = searchParams.get("month");
  const semester = searchParams.get("semester");

  const { data: summativeData, refetch } = useGetSummativeQuery(
    { classid, subjectid, chapterid, month, semester },
    {
      skip: !classid || !subjectid || !chapterid || !month || !semester,
      refetchOnMountOrArgChange: true,
    }
  );

  const [upsertSummative, { isLoading: isSaving }] =
    useUpsertSummativeMutation();
  const [
    bulkUpsertSummative,
    { isLoading: isBulkUpserting, isSuccess, data, error, reset },
  ] = useBulkUpsertSummativeMutation();

  const calculateAverage = (studentId) => {
    const scores = summativeScores[studentId];
    if (!scores) return 0;
    const values = Object.values(scores).filter(
      (score) => score !== "" && score != null
    );
    if (values.length === 0) return 0;
    return (
      values.reduce((sum, score) => sum + Number(score), 0) / values.length
    ).toFixed(1);
  };

  const handleSave = async (student) => {
    const studentId = student.student;
    const scores = summativeScores[studentId] || {};

    const payload = {
      student_id: studentId,
      subject_id: Number(subjectid),
      class_id: Number(classid),
      chapter_id: Number(chapterid),
      teacher_id,
      month,
      semester,
      oral: scores.oral ? Number(scores.oral) : null,
      written: scores.written ? Number(scores.written) : null,
      project: scores.project ? Number(scores.project) : null,
      performance: scores.performance ? Number(scores.performance) : null,
    };

    try {
      const result = await upsertSummative(payload).unwrap();
      message.success(result.message || "Nilai berhasil disimpan!");
      refetch();
    } catch (err) {
      message.error(err.data?.message || "Gagal menyimpan nilai.");
    }
  };

  const handleDownloadTemplate = () => {
    const excelData = [
      [
        "NIS",
        "Nama Siswa",
        "Lisan",
        "Tulis",
        "Proyek",
        "Keterampilan",
        "Rata2",
      ],
    ];

    if (students) {
      students.forEach((student) => {
        const studentId = student.student;
        const scores = summativeScores[studentId] || {};
        const average = calculateAverage(studentId);

        excelData.push([
          student.nis || "",
          student.student_name || "",
          scores.oral ?? "",
          scores.written ?? "",
          scores.project ?? "",
          scores.performance ?? "",
          average > 0 ? average : "",
        ]);
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penilaian Sumatif");
    XLSX.writeFile(
      workbook,
      `penilaian_sumatif_${subjectname?.replace(/-/g, " ")}.xlsx`
    );
    message.success("Template berhasil diunduh!");
  };

  const handleBulkUpload = async (dataToUpload) => {
    const payload = {
      classid: Number(classid),
      subjectid: Number(subjectid),
      chapterid: Number(chapterid),
      month,
      semester,
      data: dataToUpload,
    };

    bulkUpsertSummative(payload);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  useEffect(() => {
    if (summativeData && Array.isArray(summativeData)) {
      const mapped = summativeData.reduce((acc, row) => {
        acc[row.student_id] = {
          oral: row.oral ?? "",
          written: row.written ?? "",
          project: row.project ?? "",
          performance: row.performance ?? "",
        };
        return acc;
      }, {});
      setSummativeScores(mapped);
    }
  }, [summativeData]);

  const handleScoreChange = (studentId, field, value) => {
    setSummativeScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

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

  const scoreColumnsConfig = [
    { title: "Lisan", key: "oral" },
    { title: "Tulis", key: "written" },
    { title: "Proyek", key: "project" },
    { title: "Keterampilan", key: "performance" }, // DIGANTI MENJADI "Keterampilan"
  ];

  const columns = [
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
      width: 250,
      fixed: "left",
    },
    ...scoreColumnsConfig.map((col) => ({
      title: col.title,
      key: col.key,
      width: 120,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="0-100"
          value={summativeScores[record.student]?.[col.key] ?? ""}
          onChange={(e) =>
            handleScoreChange(record.student, col.key, e.target.value)
          }
        />
      ),
    })),
    {
      title: "Rata2",
      key: "average",
      width: 100,

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
      title="Penilaian Sumatif"
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
        rowKey="id"
        bordered
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total: totalData,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
      <UploadBulk
        title="Upload Nilai Sumatif (Bulk)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onUpload={handleBulkUpload}
        isLoading={isBulkUpserting}
      />
    </Card>
  );
};

export default Summative;
