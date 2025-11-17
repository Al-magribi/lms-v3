import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button, Layout, message, Modal, Typography, Drawer } from "antd";
import { ExclamationCircleOutlined, MenuOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetExamAndQuestionsQuery } from "../../../../service/api/cbt/ApiExam";
import {
  useFinishCbtMutation,
  useGetUserLogQuery,
  usePenaltyMutation,
} from "../../../../service/api/log/ApiLog";
import {
  useAddAnswerMutation,
  useGetStudentAnswerQuery,
} from "../../../../service/api/cbt/ApiAnswer";
import LoadingScreen from "../../../../components/loaders/LoadingScreen";
import Top from "./Top";
import Numbers from "./Numbers";
import Question from "./Question";

const { Header, Footer, Sider, Content } = Layout;
const { confirm } = Modal;
const { Text } = Typography;

const Room = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const examid = searchParams.get("examid");

  // --- RTK Query Hooks ---
  const { data: examData = {}, isLoading: isExamLoading } =
    useGetExamAndQuestionsQuery({ examid });
  const { exam, questions } = examData;

  const {
    data: log,
    isLoading: isLogLoading,
    error,
  } = useGetUserLogQuery(
    {
      exam: examid,
      student: user?.id,
    },
    { skip: !examid || !user?.id }
  );

  const { data: existingAnswers, isLoading: isAnswerLoading } =
    useGetStudentAnswerQuery({ exam: examid, student: user?.id });

  const [addAnswer, { isLoading: isSubmittingAnswer }] = useAddAnswerMutation();
  const [finishCbt] = useFinishCbtMutation();

  // --- Component State ---
  const [questionsData, setQuestionsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [essay, setEssay] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isFinishingExam, setIsFinishingExam] = useState(false); // <-- TAMBAHKAN STATE INI

  // --- Effects ---

  // Penalty
  const [penalty] = usePenaltyMutation();
  const layoutRef = useRef(null);
  const [isInFullScreen, setIsInFullScreen] = useState(false);

  const requestFullScreen = async () => {
    const element = layoutRef.current;
    if (element) {
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      } catch (error) {
        console.error("Gagal masuk mode layar penuh:", error);
        message.warning(
          "Browser Anda mungkin tidak mendukung mode layar penuh atau izin ditolak."
        );
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFullScreen = document.fullscreenElement != null;
      setIsInFullScreen(isFullScreen);
      // <-- UBAH LOGIKA KONDISI DI BAWAH INI
      if (!isFullScreen && isExamStarted && !isFinishingExam) {
        message.loading({ content: "Menerapkan penalti...", key: "penalty" });
        penalty({ student: user?.id, exam: examid })
          .unwrap()
          .then(() => {
            message.success({
              content:
                "Pelanggaran terdeteksi! Ujian Anda telah dihentikan karena keluar dari mode layar penuh.",
              key: "penalty",
              duration: 5,
            });
            navigate(`/siswa-cbt`);
          })
          .catch((err) => {
            console.error("Gagal menerapkan penalti:", err);
            message.error({
              content: "Gagal menerapkan penalti.",
              key: "penalty",
            });
          });
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
    // <-- TAMBAHKAN isFinishingExam DI DEPENDENCY ARRAY
  }, [isExamStarted, penalty, user?.id, examid, navigate, isFinishingExam]);

  useEffect(() => {
    if (questions && Array.isArray(questions)) {
      setQuestionsData(questions);
    }
  }, [questions]);

  useEffect(() => {
    if (existingAnswers) {
      const formattedAnswers = existingAnswers.reduce((acc, ans) => {
        acc[ans.question_id] = ans;
        return acc;
      }, {});
      setAnswers(formattedAnswers);
    }
  }, [existingAnswers]);

  useEffect(() => {
    if (log && exam) {
      const startTime = new Date(log.start_time).getTime();
      const durationInSeconds = exam.duration * 60;
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = durationInSeconds - elapsed;
        if (remaining > 0) {
          setTimeLeft(remaining);
          setIsExamStarted(true);
        } else {
          setTimeLeft(0);
          clearInterval(interval);
          message.warning(
            "Waktu ujian telah habis! Jawaban Anda akan dikumpulkan secara otomatis.",
            5
          );
          handleFinishExam();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [log, exam]);

  useEffect(() => {
    const currentQuestion = questionsData[currentPage - 1];
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id];
      if (currentQuestion.qtype === 2) {
        setEssay(savedAnswer?.essay || "");
      } else {
        setEssay("");
      }
    }
  }, [currentPage, questionsData, answers]);

  // --- Event Handlers ---

  const handleQuestionNumberClick = (questionNumber) => {
    setCurrentPage(questionNumber);
    if (drawerVisible) {
      setDrawerVisible(false); // Tutup drawer setelah nomor soal diklik
    }
  };

  const handleNextQuestion = () => {
    if (currentPage < questionsData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmitAnswer = useCallback(
    async (selectedKey = null) => {
      const currentQuestion = questionsData[currentPage - 1];
      if (!currentQuestion || isSubmittingAnswer) return;
      const isEssayQuestion = currentQuestion.qtype === 2;
      const answerValue = isEssayQuestion ? essay : selectedKey;
      if (
        answerValue === null ||
        answerValue === undefined ||
        (isEssayQuestion && answerValue.trim() === "")
      ) {
        return;
      }
      const existingAnswerId = answers[currentQuestion.id]?.id || null;
      const payload = {
        id: existingAnswerId,
        student: user.id,
        exam: examid,
        question: currentQuestion.id,
        mc: isEssayQuestion ? null : answerValue,
        essay: isEssayQuestion ? answerValue : null,
      };
      try {
        const result = await addAnswer(payload).unwrap();
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: result.answer,
        }));
      } catch (error) {
        console.error("Failed to save answer:", error);
        message.error("Gagal menyimpan jawaban. Periksa koneksi Anda.");
      }
    },
    [
      addAnswer,
      currentPage,
      essay,
      examid,
      questionsData,
      user.id,
      isSubmittingAnswer,
      answers,
    ]
  );

  const handleFinishExam = async () => {
    try {
      await finishCbt({ id: log.id, exam: examid }).unwrap();
      message.success("Ujian berhasil diselesaikan!");
      localStorage.removeItem(`questions_${examid}`);
      navigate(`/siswa-cbt`);
    } catch (error) {
      console.error("Failed to finish exam:", error);
      message.error("Gagal menyelesaikan ujian.");
    }
  };

  const showFinishConfirm = () => {
    confirm({
      title: "Apakah Anda yakin ingin menyelesaikan ujian?",
      icon: <ExclamationCircleOutlined />,
      content:
        "Setelah selesai, Anda tidak akan bisa mengubah jawaban Anda lagi.",
      okText: "Ya, Selesaikan",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        setIsFinishingExam(true); // <-- TAMBAHKAN BARIS INI
        handleFinishExam();
      },
      getContainer: () => layoutRef.current,
    });
  };

  if (isExamLoading || isLogLoading || isAnswerLoading) {
    return <LoadingScreen />;
  }

  const currentQuestion = questionsData[currentPage - 1];
  const numberProps = {
    questionsData,
    currentPage,
    answers,
    isLoading: isExamLoading,
    onQuestionNumberClick: handleQuestionNumberClick,
  };

  return (
    <Layout ref={layoutRef} style={{ minHeight: "100vh" }}>
      <Modal
        title="Mode Ujian Layar Penuh"
        open={isExamStarted && !isInFullScreen}
        closable={false}
        maskClosable={false}
        footer={[
          <Button key="enter" type="primary" onClick={requestFullScreen}>
            Masuk Layar Penuh & Mulai Ujian
          </Button>,
        ]}
      >
        <Text>
          Untuk menjaga integritas ujian, Anda **wajib** berada dalam mode layar
          penuh (fullscreen) selama mengerjakan soal.
        </Text>
        <br />
        <Text type="danger">
          Keluar dari mode layar penuh akan dianggap sebagai pelanggaran dan
          ujian Anda akan dihentikan secara otomatis.
        </Text>
      </Modal>

      <title>{`Ujian ${name?.replace(/-/g, " ")}`}</title>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Top
          name={name}
          user={user}
          timeLeft={timeLeft}
          isExamStarted={isExamStarted}
          onMenuClick={() => setDrawerVisible(true)}
        />
      </Header>
      <Layout>
        <Sider
          width={280}
          breakpoint="lg"
          collapsedWidth="0"
          trigger={null}
          style={{
            overflow: "auto",
            height: "calc(100vh - 112px)",
            position: "sticky",
            top: "64px",
            backgroundColor: "#fff",
          }}
        >
          <Numbers {...numberProps} />
        </Sider>

        <Drawer
          title="Navigasi Soal"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          getContainer={false}
          rootStyle={{ position: "absolute", padding: 0 }}
        >
          <Numbers {...numberProps} />
        </Drawer>

        <Content
          style={{
            overflowY: "auto",
            height: "calc(100vh - 112px)",
          }}
        >
          <Question
            currentQuestion={currentQuestion}
            currentPage={currentPage}
            totalQuestions={questionsData.length}
            questionsData={questionsData}
            answers={answers}
            essay={essay}
            setEssay={setEssay}
            handleSubmit={handleSubmitAnswer}
            isLoadingAnswer={isSubmittingAnswer}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
            onFinish={showFinishConfirm}
          />
        </Content>
      </Layout>
      <Footer
        style={{
          textAlign: "center",
          backgroundColor: "#001529",
          color: "rgba(255, 255, 255, 0.5)",
          padding: "12px 24px",
        }}
      >
        <span>&copy; {new Date().getFullYear()}</span> NIBS
      </Footer>
    </Layout>
  );
};

export default Room;
