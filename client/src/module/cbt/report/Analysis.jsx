import React, { useMemo, useState, useRef, useEffect } from "react";
import { useGetExamAnalysisQuery } from "../../../service/api/cbt/ApiAnswer";
import TableLayout from "../../../components/table/TableLayout";
import { Tag, Tooltip, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const Analysis = ({ examid, classid, tableRef, syncTrigger }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    refetch: analysisRefetch,
  } = useGetExamAnalysisQuery({
    page,
    limit,
    search,
    exam: examid,
    classid,
  });

  const isInitialMount = useRef(true); // Untuk mencegah refetch pada render pertama

  // 3. Gunakan useEffect untuk memanggil refetch saat syncTrigger berubah
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      analysisRefetch();
    }
  }, [syncTrigger, analysisRefetch]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const columns = useMemo(() => {
    if (!data) return [];

    // --- Kolom Statis di Kiri (Info & Ringkasan) ---
    const leftFixedColumns = [
      {
        title: "No",
        key: "no",
        width: 60,
        fixed: "left",
        align: "center",
        render: (text, record, index) => (page - 1) * limit + index + 1,
      },
      {
        title: "Nama Siswa",
        dataIndex: "name",
        key: "name",
        width: 250,
        fixed: "left",
      },
    ];

    // --- Kolom Grup Jawaban (Dinamis dengan Ikon) ---
    const answerColumns = {
      title: "Analisis Jawaban Siswa",
      align: "center",
      children: data.questions.map((question, index) => ({
        // Header dengan Tooltip untuk info Kunci Jawaban & Poin
        title: (
          <Tooltip title={`Kunci: ${question.qkey} | Poin: ${question.poin}`}>
            {`S${index + 1}`}
          </Tooltip>
        ),
        dataIndex: "answers",
        key: `question_${question.id}`,
        width: 75,
        align: "center",
        render: (answers) => {
          const studentAnswerObj = answers?.find(
            (ans) => ans.id === question.id
          );
          const studentAnswer = studentAnswerObj
            ? studentAnswerObj.mc.toUpperCase()
            : "-";
          const isCorrect = studentAnswer === question.qkey.toUpperCase();

          if (!studentAnswerObj) {
            return <Typography.Text type='secondary'>-</Typography.Text>;
          }

          return (
            <Typography.Text
              style={{
                marginLeft: "4px",
                color: isCorrect ? "#52c41a" : "#f5222d",
              }}
            >
              {studentAnswer}
            </Typography.Text>
          );
        },
      })),
    };

    // --- Kolom Statis di Kanan (Hasil Akhir) ---
    const rightFixedColumns = [
      {
        title: "Benar",
        dataIndex: "correct",
        key: "correct",
        width: 80,
        fixed: "right",
        align: "center",
        render: (text) => (
          <Typography.Text strong style={{ color: "#52c41a" }}>
            {text}
          </Typography.Text>
        ),
      },
      {
        title: "Salah",
        dataIndex: "incorrect",
        key: "incorrect",
        width: 80,
        fixed: "right",
        render: (text) => (
          <Typography.Text strong style={{ color: "#f5222d" }}>
            {text}
          </Typography.Text>
        ),
      },
      {
        title: "Nilai Akhir",
        dataIndex: "mc_score",
        key: "mc_score",
        width: 100,
        fixed: "right",
        align: "center",
        render: (score) => (
          <Tag
            color={score >= 75 ? "blue" : "volcano"}
            style={{ fontSize: 14, padding: "4px 8px" }}
          >
            {score}
          </Tag>
        ),
      },
    ];

    return [...leftFixedColumns, answerColumns, ...rightFixedColumns];
  }, [data, page, limit]);

  return (
    <TableLayout
      tableRef={tableRef}
      onSearch={handleSearch}
      isLoading={isLoading}
      columns={columns}
      source={data?.students}
      rowKey='id'
      page={page}
      limit={limit}
      totalData={data?.totalData}
      onChange={handleTableChange}
      bordered
      scroll={{ x: "max-content" }}
    />
  );
};

export default Analysis;
