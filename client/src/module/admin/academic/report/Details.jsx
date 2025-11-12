import {
  Modal,
  Typography,
  List,
  Empty, // Divider tidak lagi dipakai
  Row, // Tambahkan Row
  Col,
  Flex,
  Divider, // Tambahkan Col
} from "antd";
import {
  CheckCircleOutlined, // Tambahkan icon
  ClockCircleOutlined, // Tambahkan icon
} from "@ant-design/icons";
import React from "react";

// Impor komponen Chart Anda
import DoughnutChart from "./Chart"; // <-- PASTIKAN PATH INI BENAR

const { Title } = Typography;

/**
 * Helper function untuk merender list siswa
 * Modifikasi: Tambahkan parameter 'icon'
 */
const renderStudentList = (data, listTitle, icon) => (
  <>
    <Title
      level={5}
      style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
    >
      {/* Render Ikon di sini */}
      {icon}
      <span style={{ marginLeft: 8 }}>
        {listTitle} ({data.length})
      </span>
    </Title>
    {data.length > 0 ? (
      <List
        size="small"
        bordered
        dataSource={data}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        style={{
          maxHeight: 220, // Kurangi sedikit tingginya
          overflowY: "auto",
          marginBottom: 16,
          backgroundColor: "#fff", // Tambahkan background putih
        }}
      />
    ) : (
      // Buat 'Empty' state memiliki box yang sama
      // agar layout tetap seimbang
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 2,
          backgroundColor: "#fff",
          maxHeight: 220,
          height: 220, // Samakan tinggi agar sejajar
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Empty
          description="Tidak ada data siswa"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: 0, padding: 0 }} // Buat lebih compact
        />
      </div>
    )}
  </>
);

const Details = ({ title, open, onClose, doneList, undoneList }) => {
  // Hitung jumlah dari panjang array
  const doneCount = doneList.length;
  const undoneCount = undoneList.length;

  // Siapkan elemen ikon dengan warna
  const doneIcon = <CheckCircleOutlined style={{ color: "#52c41a" }} />;
  const undoneIcon = <ClockCircleOutlined style={{ color: "#faad14" }} />;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null} // Tidak perlu footer
      width={720}
      style={{ top: 20 }} // <-- PERLEBAR MODAL untuk 2 kolom
    >
      {/* ========================================
         CHART TETAP DI ATAS
         ========================================
      */}
      <Flex
        align="center"
        justify="center"
        style={{ width: "100%", height: 350 }}
      >
        <DoughnutChart done={doneCount} undone={undoneCount} />
      </Flex>

      <Divider />

      {/* ========================================
         LIST SISWA (LAYOUT 2 KOLOM)
         ========================================
      */}
      <Row gutter={[16, 16]}>
        {/* Beri jarak antar kolom */}
        <Col xs={24} md={12}>
          {/* Kolom Kiri */}
          {/* Render list siswa yang sudah selesai */}
          {renderStudentList(doneList, "Siswa Selesai", doneIcon)}
        </Col>
        <Col xs={24} md={12}>
          {/* Kolom Kanan */}
          {/* Render list siswa yang belum selesai */}
          {renderStudentList(undoneList, "Siswa Belum Selesai", undoneIcon)}
        </Col>
      </Row>
    </Modal>
  );
};

export default Details;
