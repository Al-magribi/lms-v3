import React from "react";
import { Card, Button, Flex, Typography } from "antd";

const { Title } = Typography;

const Numbers = ({
  questionsData,
  currentPage,
  answers,
  isLoading,
  onQuestionNumberClick,
}) => {
  return (
    <Card
      title={
        <Title style={{ margin: 0 }} level={5}>
          Nomor Soal
        </Title>
      }
    >
      <Flex gap='small' wrap='wrap' justify='center'>
        {questionsData.map((question, index) => {
          const questionNumber = index + 1;
          const isCurrent = questionNumber === currentPage;

          // --- LOGIKA BARU DARI QuestionNumbers.jsx ---
          // 1. Ambil objek jawaban yang tersimpan untuk soal ini
          const savedAnswer = answers[question.id];

          // 2. Lakukan pengecekan mendetail berdasarkan tipe soal (qtype)
          //    qtype === 2 adalah Esai, selain itu Pilihan Ganda
          const isAnswered =
            question.qtype === 2
              ? // Untuk Esai: pastikan ada isinya dan bukan string kosong
                Boolean(savedAnswer?.essay && savedAnswer.essay.trim() !== "")
              : // Untuk Pilihan Ganda: pastikan properti 'mc' ada nilainya
                Boolean(savedAnswer?.mc);
          // --- AKHIR DARI LOGIKA BARU ---

          let buttonType = "default";
          let buttonStyle = {}; // Objek style tambahan untuk kustomisasi

          if (isCurrent) {
            // Tombol biru untuk soal yang sedang aktif
            buttonType = "primary";
          } else if (isAnswered) {
            // Tombol dengan style hijau untuk soal yang sudah dijawab
            buttonType = "default"; // Tetap default agar bisa di-override style-nya
            buttonStyle = {
              backgroundColor: "#52c41a", // Latar belakang hijau muda
              borderColor: "#52c41a", // Border hijau
              color: "#fff", // Warna teks hijau tua
            };
          }

          return (
            <Button
              key={question.id}
              type={buttonType}
              style={buttonStyle} // Terapkan style kustom di sini
              shape='circle'
              loading={isLoading}
              onClick={() => onQuestionNumberClick(questionNumber)}
            >
              {questionNumber}
            </Button>
          );
        })}
      </Flex>
    </Card>
  );
};

export default Numbers;
