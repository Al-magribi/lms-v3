import React, { useState, useEffect } from "react";
import {
  Modal,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Tabs,
  Collapse,
  Typography,
  Tag,
  Divider,
  Button,
  InputNumber,
  Space,
  message,
} from "antd";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  useGetStudentAnswerQuery,
  useGradeEssayMutation, // Import mutation untuk nilai essay
} from "../../../service/api/cbt/ApiAnswer";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const AnswerSheet = ({ open, onClose, detail }) => {
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  // State untuk menyimpan nilai sementara yang sedang diinput
  const [gradingAnswers, setGradingAnswers] = useState({});

  const examid = searchParams.get("examid");
  const isTeacherOrAdmin = user?.level === "teacher" || user?.level === "admin";

  // Query Data Jawaban
  const {
    data,
    isLoading,
    isError,
    error,
    refetch, // Ambil refetch untuk update data setelah menilai
  } = useGetStudentAnswerQuery(
    {
      student: detail.student_id,
      exam: examid,
    },
    {
      skip: !detail.student_id || !examid,
      refetchOnMountOrArgChange: true,
    }
  );

  // Mutation untuk menyimpan nilai essay
  const [gradeEssay, { isLoading: isGrading }] = useGradeEssayMutation();

  // --- LOGIC PENILAIAN ESSAY ---
  const handleGradeEssay = async (answerId, maxPoint) => {
    // Ambil nilai dari state, jika tidak ada di state (belum diedit), ambil dari data asli
    // Namun logic di sini, kita mengandalkan gradingAnswers yang diisi saat onChange
    const point = gradingAnswers[answerId];

    if (point === undefined || point === null || point === "") {
      message.error("Nilai belum diubah atau kosong");
      return;
    }

    if (point < 0 || point > maxPoint) {
      message.error(`Nilai harus antara 0 dan ${maxPoint}`);
      return;
    }

    try {
      await gradeEssay({
        answer_id: answerId,
        point: parseInt(point),
      }).unwrap();

      message.success("Nilai berhasil disimpan");
      refetch(); // Refresh data agar score total terupdate

      // Reset state lokal untuk item ini (opsional, agar kembali mengikuti data server)
      setGradingAnswers((prev) => {
        const newState = { ...prev };
        delete newState[answerId];
        return newState;
      });
    } catch (err) {
      message.error(err?.data?.message || "Gagal menyimpan nilai");
    }
  };

  // Fungsi helper untuk mengubah nilai di input
  const onScoreChange = (val, answerId) => {
    setGradingAnswers((prev) => ({
      ...prev,
      [answerId]: val,
    }));
  };

  // --- RENDER QUESTION LIST ---
  // Dipindahkan ke dalam component agar bisa akses state gradingAnswers & handleGradeEssay
  const renderQuestionList = (questions, type) => {
    if (questions.length === 0) {
      return (
        <Text type="secondary">
          Tidak ada soal {type === "mc" ? "pilihan ganda" : "uraian"}.
        </Text>
      );
    }

    return (
      <Collapse accordion>
        {questions.map((item, index) => {
          const isCorrect = item.point > 0;
          // Tentukan nilai tampilan: prioritas state lokal (sedang diedit) > data dari DB
          const currentPoint =
            gradingAnswers[item.answer_id] !== undefined
              ? gradingAnswers[item.answer_id]
              : item.point;

          const headerExtra = () => {
            if (!isTeacherOrAdmin) return null;

            // Untuk Essay, status Benar/Salah mungkin subjektif tergantung poin penuh atau tidak
            // Di sini kita gunakan logika visual sederhana
            if (type === "mc") {
              return isCorrect ? (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Benar
                </Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="error">
                  Salah
                </Tag>
              );
            } else {
              // Untuk Essay tampilkan poin saat ini di header
              return (
                <Tag color="blue">
                  Poin: {item.point} / {item.max_point}
                </Tag>
              );
            }
          };

          return (
            <Panel
              header={`Soal Nomor ${index + 1}`}
              key={item.answer_id || index} // Gunakan unique key
              extra={headerExtra()}
            >
              <Title level={5}>Pertanyaan:</Title>
              <div dangerouslySetInnerHTML={{ __html: item.question_text }} />
              <Divider />
              <Title level={5}>Jawaban Anda:</Title>
              {type === "mc" ? (
                <Paragraph>
                  <Text strong> ( {item.answer || "-"} )</Text>
                </Paragraph>
              ) : (
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "4px",
                    border: "1px solid #eee",
                    marginBottom: "15px",
                  }}
                >
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "inherit",
                      margin: 0,
                    }}
                  >
                    {item.essay || "(Tidak dijawab)"}
                  </pre>
                </div>
              )}

              {isTeacherOrAdmin && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  {type === "mc" ? (
                    <Paragraph>
                      <Text strong>Kunci Jawaban: </Text>
                      <Text code> ( {item.correct} )</Text>
                    </Paragraph>
                  ) : (
                    // --- AREA PENILAIAN ESSAY ---
                    <div
                      style={{
                        background: "#f0f5ff",
                        padding: "15px",
                        borderRadius: "6px",
                        border: "1px dashed #adc6ff",
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>
                          <EditOutlined /> Berikan Penilaian:
                        </Text>
                        <Space wrap>
                          <Text>Skor (Maks: {item.max_point}):</Text>
                          <InputNumber
                            min={0}
                            max={item.max_point}
                            value={currentPoint}
                            onChange={(val) =>
                              onScoreChange(val, item.answer_id)
                            }
                            style={{ width: 100 }}
                          />
                          <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={isGrading} // Loading global, idealnya per item tapi cukup ok
                            onClick={() =>
                              handleGradeEssay(item.answer_id, item.max_point)
                            }
                          >
                            Simpan Nilai
                          </Button>
                        </Space>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          * Klik simpan untuk memperbarui nilai siswa.
                        </Text>
                      </Space>
                    </div>
                  )}
                </>
              )}
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  // --- FUNGSI DOWNLOAD (Tidak berubah, hanya disalin) ---
  const handleDownload = () => {
    if (!data || !data.answers) return;
    const studentName = detail?.student_name || "Siswa";
    const studentNis = detail?.student_nis || "-";
    const studentClass = detail?.student_class || "-";
    const examName = detail?.exam_name || "Ujian";
    const mcAnswers = data.answers.filter((a) => a.qtype === 1);
    const essayAnswers = data.answers.filter((a) => a.qtype === 2);
    const cleanHtml = (htmlString) => htmlString.replace(/<\/?p[^>]*>/g, "");

    const mcHtml =
      mcAnswers.length > 0
        ? mcAnswers
            .map(
              (item, index) => `
      <li class="question-item">
        <div class="question-text"><span>${index + 1}. </span>${cleanHtml(
                item.question_text
              )}</div>
        <p><strong>Jawaban:</strong> ${item.answer || "-"}</p>
        <p><strong>Kunci:</strong> ${item.correct}</p>
        <p><strong>Poin:</strong> ${item.point}</p>
      </li>`
            )
            .join("")
        : "<li>Tidak ada soal pilihan ganda.</li>";

    const essayHtml =
      essayAnswers.length > 0
        ? essayAnswers
            .map(
              (item, index) => `
      <li class="question-item">
        <div class="question-text"><span>${index + 1}. </span>${cleanHtml(
                item.question_text
              )}</div>
        <p><strong>Jawaban:</strong></p><pre class="answer-essay">${
          item.essay || "(Tidak dijawab)"
        }</pre>
        <p><strong>Poin:</strong> ${item.point} / ${item.max_point}</p>
      </li>`
            )
            .join("")
        : "<li>Tidak ada soal uraian.</li>";

    const htmlContent = `
      <html>
      <head>
        <title>Lembar Jawaban - ${studentName}</title>
        <style>
          body { font-family: sans-serif; margin: 25px; }
          .container { width: 100%; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
          h2 { font-size: 20px; color: #1890ff; border-bottom: 1px solid #f0f0f0; margin-top: 30px; }
          .info-table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          .info-table td { padding: 8px; border: 1px solid #ddd; }
          .question-item { margin-bottom: 20px; border-bottom: 1px solid #eee; }
          .answer-essay { background: #f9f9f9; padding: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Lembar Jawaban Siswa</h1>
          <table class="info-table">
            <tbody>
              <tr><td>Nama Siswa</td><td>${studentName}</td></tr>
              <tr><td>NIS</td><td>${studentNis}</td></tr>
              <tr><td>Kelas</td><td>${studentClass}</td></tr>
              <tr><td>Mata Ujian</td><td>${examName}</td></tr>
              ${
                isTeacherOrAdmin && data.score !== undefined
                  ? `
              <tr><td>Total Skor Akhir</td><td><strong>${data.score}</strong></td></tr>
              <tr><td>Jawaban Benar (PG)</td><td>${data.correct}</td></tr>
              <tr><td>Total Skor PG</td><td>${data.pg_score}</td></tr>
              <tr><td>Total Skor Uraian</td><td>${data.essay_score}</td></tr>`
                  : ""
              }
            </tbody>
          </table>
          <h2>Pilihan Ganda</h2><ol>${mcHtml}</ol>
          <h2>Uraian</h2><ol>${essayHtml}</ol>
        </div>
      </body>
      </html>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // --- RENDER CONTENT UTAMA ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Memuat data jawaban..." />
        </div>
      );
    }
    if (isError) {
      return (
        <Alert
          message="Gagal memuat data"
          description={error?.data?.message || error?.message}
          type="error"
          showIcon
        />
      );
    }
    if (!data || !data.answers) {
      return (
        <Alert message="Data jawaban tidak ditemukan." type="info" showIcon />
      );
    }

    const answers = data.answers || [];
    const mcAnswers = answers.filter((a) => a.qtype === 1);
    const essayAnswers = answers.filter((a) => a.qtype === 2);

    const tabItems = [
      {
        key: "1",
        label: `Pilihan Ganda (${mcAnswers.length})`,
        children: renderQuestionList(mcAnswers, "mc"),
      },
      {
        key: "2",
        label: `Uraian (${essayAnswers.length})`,
        children: renderQuestionList(essayAnswers, "essay"),
      },
    ];

    return (
      <>
        {isTeacherOrAdmin && data.score !== undefined && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Statistic
                title="Total Skor Akhir"
                value={data.score}
                precision={2}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <Statistic title="Jawaban Benar (PG)" value={data.correct} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <Statistic
                title="Skor Pilihan Ganda"
                value={data.pg_score}
                precision={2}
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <Statistic
                title="Skor Uraian"
                value={data.essay_score}
                precision={2}
              />
            </Col>
          </Row>
        )}
        <Tabs defaultActiveKey="1" items={tabItems} />
      </>
    );
  };

  return (
    <Modal
      title={`Lembar Jawaban: ${detail?.student_name}`}
      open={open}
      onCancel={onClose}
      destroyOnHidden
      style={{ top: 20 }}
      width={900}
      footer={[
        <Button key="back" onClick={onClose}>
          Tutup
        </Button>,
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={isLoading || !data?.answers}
          style={{ display: isTeacherOrAdmin ? "inline-block" : "none" }}
        >
          Cetak PDF
        </Button>,
      ]}
    >
      <div
        style={{
          height: 600,
          overflowY: "auto",
          padding: 8,
          scrollbarWidth: "thin",
        }}
      >
        {renderContent()}
      </div>
    </Modal>
  );
};

export default AnswerSheet;
