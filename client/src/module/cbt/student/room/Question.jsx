import React from "react";
import {
  Card,
  Typography,
  Input,
  Button,
  Flex,
  Spin,
  Row,
  Col,
  Divider,
} from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

// Helper function untuk merender HTML
const createMarkup = (html) => {
  return { __html: html || "" };
};

const Question = ({
  currentQuestion,
  currentPage,
  totalQuestions,
  questionsData,
  answers,
  essay,
  setEssay,
  handleSubmit,
  isLoadingAnswer,
  onPrevious,
  onNext,
  onFinish,
}) => {
  if (!currentQuestion) {
    return (
      <Card style={{ margin: "16px" }}>
        <Spin tip='Memuat soal...' />
      </Card>
    );
  }

  const handleChoiceClick = (choiceKey) => {
    handleSubmit(choiceKey);
  };

  const isAllAnswered = () => {
    // Jika tidak ada soal sama sekali, anggap sudah selesai.
    if (totalQuestions === 0) {
      return true;
    }

    // Cek cepat: jika jumlah jawaban di state tidak sama dengan jumlah soal,
    // maka sudah pasti belum semua terjawab.
    if (Object.keys(answers).length !== totalQuestions) {
      return false;
    }

    // Iterasi setiap soal untuk memvalidasi jawabannya.
    // Ini lebih kuat karena memeriksa isi jawaban, bukan hanya keberadaannya.
    for (const question of questionsData) {
      const savedAnswer = answers[question.id];

      // Jika ada satu soal saja yang belum punya objek jawaban, maka belum selesai.
      if (!savedAnswer) {
        return false;
      }

      // Validasi berdasarkan tipe soal (qtype)
      // qtype 2 adalah Esai, selain itu Pilihan Ganda
      const isAnswerValid =
        question.qtype === 2
          ? // Untuk Esai: pastikan properti 'essay' ada dan isinya bukan string kosong
            Boolean(savedAnswer.essay && savedAnswer.essay.trim() !== "")
          : // Untuk Pilihan Ganda: pastikan properti 'mc' punya nilai (bukan null/undefined)
            savedAnswer.mc != null;

      // Jika ditemukan satu saja jawaban yang tidak valid, langsung kembalikan false.
      if (!isAnswerValid) {
        return false;
      }
    }

    // Jika loop selesai tanpa menemukan jawaban yang tidak valid, berarti semua sudah terjawab.
    return true;
  };

  const selectedAnswer = answers[currentQuestion.id]?.mc || null;

  return (
    <Card style={{ margin: "16px" }}>
      <Title level={5}>Pertanyaan No. {currentPage}</Title>
      <article
        style={{ maxWidth: "100%", overflow: "auto" }}
        dangerouslySetInnerHTML={createMarkup(currentQuestion.question)}
      />

      <Divider orientation='left'>Opsi Jawaban</Divider>

      {isLoadingAnswer ? (
        <Spin />
      ) : currentQuestion.qtype === 2 ? (
        <TextArea
          rows={4}
          placeholder='Ketikkan jawabanmu disini...'
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          onBlur={() => handleSubmit()}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {currentQuestion.choices?.map((choice) => {
            const isSelected = selectedAnswer === choice.key;
            return (
              choice.text &&
              choice.text.trim() !== "" && (
                <Col key={choice.key} xs={24} sm={24} md={12}>
                  <Flex
                    align='start'
                    gap='small'
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: isSelected
                        ? "1px solid #52c41a"
                        : "1px solid #d9d9d9",
                      background: isSelected ? "#f6ffed" : "transparent",
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      transition: "border 0.2s, background-color 0.2s",
                    }}
                    onClick={() => handleChoiceClick(choice.key)}
                  >
                    <div
                      style={{ flex: 1 }}
                      dangerouslySetInnerHTML={createMarkup(choice.text)}
                    />
                    {isSelected && (
                      <CheckCircleFilled
                        style={{
                          color: "#52c41a",
                          fontSize: "16px",
                          marginTop: "2px",
                        }}
                      />
                    )}
                  </Flex>
                </Col>
              )
            );
          })}
        </Row>
      )}

      {/* Navigasi Bawah yang Lebih Responsif */}

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={8}>
          <Button
            style={{ width: "100%" }}
            onClick={onPrevious}
            disabled={currentPage === 1}
          >
            Sebelumnya
          </Button>
        </Col>
        <Col xs={24} md={8}>
          <Button
            style={{ width: "100%" }}
            type='primary'
            danger
            onClick={onFinish}
            disabled={!isAllAnswered()}
            title={
              !isAllAnswered()
                ? "Jawab semua pertanyaan untuk menyelesaikan"
                : "Selesaikan ujian dan lihat hasil"
            }
          >
            Selesaikan Ujian
          </Button>
        </Col>
        <Col xs={24} md={8}>
          <Button
            style={{ width: "100%" }}
            type='primary'
            onClick={onNext}
            disabled={currentPage === totalQuestions}
          >
            Selanjutnya
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default Question;
