import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Body from "./Body";
import { useSelector } from "react-redux";
import { useGetExamAndQuestionsQuery } from "../../../../controller/api/cbt/ApiExam";
import { useFinishCbtMutation } from "../../../../controller/api/log/ApiLog";
import Meta from "../../../../components/meta/Meta";
import { toast } from "react-hot-toast";
import { useGetUserLogQuery } from "../../../../controller/api/log/ApiLog";

const StartPage = () => {
  const { name, examid, token } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    data = {},
    refetch,
    isLoading,
    error,
  } = useGetExamAndQuestionsQuery({ examid });
  const { exam, banks, questions } = data;

  const [questionsData, setQuestionsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);

  const [finishCbt] = useFinishCbtMutation();

  // Get the log data to calculate remaining time
  const {
    data: log,
    error: logError,
    isLoading: logLoading,
  } = useGetUserLogQuery(
    {
      exam: examid,
      student: user?.id,
    },
    { skip: !examid || !user?.id }
  );

  // Check if user has access to this exam
  useEffect(() => {
    if (error) {
      toast.error("Anda tidak memiliki akses ke ujian ini");
      navigate("/siswa-daftar-ujian");
    }
  }, [error, navigate]);

  // Immediate timer start when component mounts and data is available
  useEffect(() => {
    if (log && exam && log.start_time && !isExamStarted && !logLoading) {
      try {
        const startTime = new Date(log.start_time).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalDuration = exam.duration * 60; // Convert minutes to seconds
        const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds);

        if (remainingSeconds <= 0) {
          finishExam();
          return;
        }

        setTimeLeft(remainingSeconds);
        setIsExamStarted(true);

        // Show success message
        toast.success(
          `Ujian dimulai! Waktu tersisa: ${Math.floor(
            remainingSeconds / 60
          )} menit ${remainingSeconds % 60} detik`
        );
      } catch (error) {
        console.error("Error calculating timer:", error);
        toast.error("Terjadi kesalahan saat memulai timer");
      }
    }
  }, [log, exam, logLoading, isExamStarted]);

  // Check if exam has started and calculate remaining time
  useEffect(() => {
    if (logError && !logLoading) {
      toast.error("Anda belum memulai ujian ini");
      navigate("/siswa-daftar-ujian");
      return;
    }

    // If log exists and exam data is available, start the timer
    if (log && exam && log.start_time && !isExamStarted) {
      try {
        const startTime = new Date(log.start_time).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalDuration = exam.duration * 60; // Convert minutes to seconds
        const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds);

        if (remainingSeconds <= 0) {
          // Time is up, finish the exam
          finishExam();
          return;
        }

        // Set the timer and start the exam
        setTimeLeft(remainingSeconds);
        setIsExamStarted(true);
      } catch (error) {
        console.error("Error calculating timer:", error);
        toast.error("Terjadi kesalahan saat memulai timer");
      }
    }
  }, [log, exam, logLoading, logError, navigate, isExamStarted]);

  // Timer effect - countdown every second
  useEffect(() => {
    if (!isExamStarted || !timeLeft || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }

        // Show warning when time is running low
        if (prev === 300) {
          // 5 minutes left
          toast.warning("⚠️ Waktu tersisa 5 menit!");
        } else if (prev === 60) {
          // 1 minute left
          toast.error("🚨 Waktu tersisa 1 menit!");
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, timeLeft]);

  // Handle exam submission when time is up
  const handleTimeUp = () => {
    if (isExamStarted && timeLeft <= 0) {
      toast.error(
        "⏰ Waktu ujian telah habis! Ujian akan diselesaikan otomatis."
      );
      finishExam();
    }
  };

  // Auto-finish exam when time is up
  useEffect(() => {
    if (timeLeft === 0 && isExamStarted) {
      handleTimeUp();
    }
  }, [timeLeft, isExamStarted]);

  // Handle page refresh/close to warn user
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isExamStarted && timeLeft > 0) {
        e.preventDefault();
        e.returnValue =
          "Anda sedang mengikuti ujian. Yakin ingin meninggalkan halaman ini?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isExamStarted, timeLeft]);

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

  const handleQuestionNumberClick = (index) => {
    setCurrentPage(index + 1);
  };

  const handleReset = () => {
    localStorage.removeItem("questions");
    refetch();

    if (questions && Array.isArray(questions)) {
      localStorage.setItem("questions", JSON.stringify({ questions }));
      setQuestionsData(questions);
    }
  };

  const finishExam = async () => {
    if (!log || !log.id) {
      console.error("No log data available for finishing exam");
      toast.error("Data ujian tidak tersedia");
      navigate("/siswa-daftar-ujian");
      return;
    }

    toast.promise(finishCbt({ id: log.id, exam: examid }).unwrap(), {
      loading:
        timeLeft === 0
          ? "Menyelesaikan ujian otomatis..."
          : "Menyelesaikan ujian...",
      success: (data) => {
        const message =
          timeLeft === 0
            ? "Ujian telah diselesaikan otomatis karena waktu habis"
            : "Ujian berhasil diselesaikan";
        toast.success(message);
        navigate("/siswa-daftar-ujian");
        return data.message || message;
      },
      error: (err) => {
        console.error("Error finishing exam:", err);
        return `Gagal menyelesaikan ujian: ${err.data?.message || err.message}`;
      },
    });
  };

  // Load questions effect
  useEffect(() => {
    if (!questions) return;

    const storedQuestions = localStorage.getItem("questions");

    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions);
        if (Array.isArray(parsedQuestions.questions)) {
          setQuestionsData(parsedQuestions.questions);
        } else {
          setQuestionsData([]);
        }
      } catch (error) {
        console.error("Error parsing stored questions:", error);
        setQuestionsData([]);
      }
    } else {
      if (questions && Array.isArray(questions)) {
        localStorage.setItem("questions", JSON.stringify({ questions }));
        setQuestionsData(questions);
      }
    }
  }, [questions]);

  // Show loading state while waiting for log data
  if (logLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Memverifikasi Akses Ujian</h5>
          <p className="text-muted">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-3">
          <small className="text-muted">Memuat ujian...</small>
        </div>
      </div>
    );
  }

  // Show error if exam data is not available
  if (!exam || !log) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-triangle fs-1"></i>
          </div>
          <h5>Data Ujian Tidak Ditemukan</h5>
          <p className="text-muted">
            {!exam
              ? "Data ujian tidak tersedia"
              : !log
              ? "Anda belum memulai ujian ini"
              : "Data tidak lengkap"}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/siswa-daftar-ujian")}
          >
            Kembali ke Daftar Ujian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }} className="bg-light">
      <Meta title={`Pertanyaan No ${currentPage}`} />

      <Header
        name={name}
        user={user}
        examid={examid}
        timeLeft={timeLeft}
        isExamStarted={isExamStarted}
      />

      <Body
        questionsData={questionsData}
        currentPage={currentPage}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        onQuestionNumberClick={handleQuestionNumberClick}
        onReset={handleReset}
        onFinish={finishExam}
        timeLeft={timeLeft}
        isExamStarted={isExamStarted}
      />
    </div>
  );
};

export default StartPage;
