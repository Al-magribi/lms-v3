import React, { useState, useCallback, useMemo } from "react";
import {
  Modal,
  Typography,
  Collapse,
  Spin,
  Tag,
  Flex,
  Input,
  Space,
  Button,
  message,
  List,
} from "antd";
import { useGetBranchesQuery } from "../../../../service/api/main/ApiSubject";

const { Text } = Typography;

// --- 1. KOMPONEN PEMBANTU UNTUK INPUT BOBOT DAN SIMPAN ---
/**
 * Komponen untuk menampilkan daftar Mata Pelajaran dalam suatu Kelas
 * dan mengelola input bobotnya.
 */
const SubjectList = React.memo(({ subjects, classId, weights, setWeights }) => {
  // Ambil bobot untuk kelas ini
  const classWeights = weights[classId] || {};

  // Fungsi untuk menangani perubahan pada input bobot
  const handleWeightChange = useCallback(
    (subjectId, value) => {
      // Memastikan input adalah angka dan dalam batas 0-100
      const weight =
        isNaN(value) || value === ""
          ? null
          : Math.max(0, Math.min(100, Number(value)));

      setWeights((prev) => ({
        ...prev,
        [classId]: {
          ...(prev[classId] || {}),
          [subjectId]: weight,
        },
      }));
    },
    [classId, setWeights]
  );

  // Hitung Total Bobot Kelas AKTIF
  const currentTotalWeight = useMemo(() => {
    let sum = 0;
    // Iterasi melalui semua bobot mata pelajaran dalam kelas ini
    Object.values(classWeights).forEach((weight) => {
      if (weight !== null && !isNaN(weight)) {
        sum += weight;
      }
    });
    return sum;
  }, [classWeights]);

  // Tentukan status validasi
  const isValid = currentTotalWeight === 100;
  const filledWeightCount = useMemo(() => {
    return subjects.filter(
      (subject) => classWeights[subject.subject_id] !== null
    ).length;
  }, [subjects, classWeights]);

  // Tentukan status visual untuk total bobot kelas
  const totalWeightColor =
    currentTotalWeight === 100
      ? "success"
      : currentTotalWeight > 100
      ? "error"
      : "warning";
  const totalWeightText =
    currentTotalWeight === 100
      ? "Total Bobot: 100 (Benar)"
      : `Total Bobot: ${currentTotalWeight} (Harus 100)`;

  // Fungsi untuk menangani tombol Simpan per Kelas
  const handleSaveClass = useCallback(() => {
    if (!isValid) {
      message.error(
        `Bobot untuk Kelas ini harus berjumlah 100. Saat ini: ${currentTotalWeight}`
      );
      return;
    }

    // Logika pengiriman bobot kelas tertentu ke API
    console.log(
      `[API CALL] Menyimpan bobot untuk Kelas ID: ${classId}`,
      classWeights
    );
    message.success(
      `Bobot untuk Kelas ${classId} (Total ${currentTotalWeight}) berhasil disimpan.`
    );
  }, [classId, classWeights, currentTotalWeight, isValid]);

  return (
    <Flex vertical gap="middle">
      <List
        dataSource={subjects}
        renderItem={(subject) => (
          <List.Item key={subject.subject_id} style={{ padding: "8px 0" }}>
            <Flex
              align="center"
              justify="space-between"
              style={{ width: "100%" }}
            >
              <Text>{subject.subject_name}</Text>
              <Input
                style={{ width: "100px" }}
                placeholder="0-100"
                value={
                  classWeights[subject.subject_id] === null
                    ? ""
                    : classWeights[subject.subject_id]
                }
                onChange={(e) =>
                  handleWeightChange(subject.subject_id, e.target.value)
                }
                type="number"
                min={0}
                max={100}
                // Jika bobot null (belum diisi) atau 0, border akan menjadi merah
                status={
                  classWeights[subject.subject_id] === null ||
                  classWeights[subject.subject_id] === 0
                    ? "error"
                    : ""
                }
              />
            </Flex>
          </List.Item>
        )}
      />
      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: "8px 0",
          borderTop: "1px solid #f0f0f0",
          marginTop: "8px",
        }}
      >
        <Space>
          <Text type="secondary">
            {filledWeightCount} dari {subjects.length} Bobot Terisi
          </Text>
          <Text type={totalWeightColor} strong>
            | {totalWeightText}
          </Text>
        </Space>
        <Button
          type="primary"
          onClick={handleSaveClass}
          disabled={!isValid} // Tombol hanya aktif jika total bobot kelas = 100
        >
          Simpan Bobot
        </Button>
      </Flex>
    </Flex>
  );
});

// --- 2. KOMPONEN PEMBANTU UNTUK TAMPILAN KELAS (Menggunakan prop 'items') ---
/**
 * Mengubah Kelas menjadi format 'items' untuk Collapse.
 */
const ClassCollapse = ({ classes, weights, setWeights }) => {
  const classItems = classes.map((classData) => ({
    key: classData.class_id,
    label: (
      <Text strong style={{ fontSize: "1.1em" }}>
        Kelas {classData.class_name}
      </Text>
    ),
    children: (
      <SubjectList
        subjects={classData.subjects}
        classId={classData.class_id}
        weights={weights}
        setWeights={setWeights}
      />
    ),
  }));

  return (
    <Collapse
      accordion
      items={classItems} // Menggunakan prop 'items'
    />
  );
};

// --- 3. KOMPONEN UTAMA ---
const SettingBranch = ({ title, open, onClose, id }) => {
  const { data, isLoading } = useGetBranchesQuery({ id }, { skip: !id });

  // State untuk menyimpan bobot: {classId: {subjectId: weight}}
  const [weights, setWeights] = useState({});

  // Fungsi untuk menangani penutupan modal
  const handleClose = () => {
    // Reset state bobot saat menutup modal
    setWeights({});
    onClose();
  };

  // Fungsi yang dipanggil saat menekan tombol OK/Simpan di Modal.
  // Karena kita ingin Simpan dilakukan per kelas, tombol ini hanya berfungsi sebagai penutup/konfirmasi.
  const handleConfirmClose = () => {
    message.info(
      "Semua perubahan bobot disimpan per Kelas. Menutup jendela konfigurasi."
    );
    onClose();
  };

  const renderContent = (data) => {
    if (!data || !data.grades || data.grades.length === 0) {
      return <Text type="danger">Data struktur kurikulum tidak tersedia.</Text>;
    }

    // Mengubah data Tingkat (Grade) menjadi format 'items' untuk Collapse
    const gradeItems = data.grades.map((grade) => ({
      key: grade.grade_id,
      label: (
        <Space>
          <Text style={{ fontSize: "1.2em" }}>Tingkat {grade.grade_name}</Text>
          <Tag color="blue">{grade.classes.length} Kelas</Tag>
        </Space>
      ),
      children: (
        <ClassCollapse
          classes={grade.classes}
          weights={weights}
          setWeights={setWeights}
        />
      ),
    }));

    return (
      <Collapse
        defaultActiveKey={[data.grades[0].grade_id]}
        items={gradeItems}
      />
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      onOk={handleConfirmClose} // Tombol OK sekarang berfungsi sebagai konfirmasi penutupan
      okText="Selesai & Tutup"
      cancelText="Tutup"
      width={800}
      style={{ top: 20 }}
      // Footer dikustomisasi untuk menghilangkan tombol Simpan/OK dan membiarkan tombol Simpan berada di dalam Collapse
      footer={[
        <Button key="back" onClick={handleClose}>
          Tutup
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirmClose}>
          Selesai & Tutup
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>Instruksi:</Text>
        <Text>
          Total bobot semua mata pelajaran di setiap Kelas
          <strong> harus 100</strong>. Gunakan tombol{" "}
          <strong>Simpan Bobot </strong>
          setelah total bobot mencapai 100.
        </Text>
      </div>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        renderContent(data)
      )}
    </Modal>
  );
};

export default SettingBranch;
