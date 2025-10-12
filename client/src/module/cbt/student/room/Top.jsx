import { Row, Col, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

// Fungsi untuk memformat detik menjadi HH:MM:SS
const formatTime = (seconds) => {
  if (seconds === null || typeof seconds === "undefined" || seconds < 0) {
    return "--:--:--";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
};

const Top = ({ name, user, timeLeft, isExamStarted, onMenuClick }) => {
  const getTimerDisplay = () => {
    const containerStyle = {
      display: "flex",
      flexDirection: "column",
      alignItems: "end",
      justifyContent: "center",
      height: "100%",
    };
    const valueStyle = {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
    };

    if (!isExamStarted) {
      return (
        <div style={containerStyle}>
          <p style={{ ...valueStyle, color: "#faad14" }}>Memulai Ujian...</p>
        </div>
      );
    }

    if (timeLeft === null || typeof timeLeft === "undefined") {
      return (
        <div style={containerStyle}>
          <p style={{ ...valueStyle, color: "#faad14" }}>Memuat Timer...</p>
        </div>
      );
    }

    if (timeLeft <= 0) {
      return (
        <div style={containerStyle}>
          <p style={{ ...valueStyle, color: "#ff4d4f" }}>Waktu Habis</p>
        </div>
      );
    }

    const timerColor =
      timeLeft <= 300 ? "#ff4d4f" : timeLeft <= 600 ? "#faad14" : "#ffffff";

    return (
      <div style={containerStyle}>
        <h3
          style={{
            ...valueStyle,
            color: timerColor,
            fontWeight: "bold",
            fontSize: "24px",
          }}
        >
          {formatTime(timeLeft)}
        </h3>
      </div>
    );
  };

  return (
    <Row align='middle' style={{ width: "100%" }}>
      {/* Kolom Ikon Menu (Hanya tampil di bawah 'lg') */}
      <Col xs={3} md={2} lg={0}>
        <Button
          type='text'
          icon={<MenuOutlined style={{ color: "white", fontSize: "20px" }} />}
          onClick={onMenuClick}
        />
      </Col>

      {/* Kolom Informasi Ujian & Siswa */}
      <Col xs={15} md={12} lg={12}>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontWeight: "600",
              fontSize: "14px",
              color: "white",
              lineHeight: "1.2",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {name?.replace(/-/g, " ")}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: "1.2",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name} | {user?.class}
          </div>
        </div>
      </Col>

      {/* Kolom Timer */}
      <Col xs={6} md={10} lg={12}>
        {getTimerDisplay()}
      </Col>
    </Row>
  );
};

export default Top;
