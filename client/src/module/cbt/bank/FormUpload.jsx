import {
  Alert,
  Button,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useUploadQuestionMutation } from "../../../service/api/cbt/ApiBank";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { InboxOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Dragger } = Upload;

const FormUpload = ({ title, open, onClose, bankid }) => {
  const [uploadQuestion, { isLoading, isSuccess, error, data, reset }] =
    useUploadQuestionMutation();

  const [fileList, setFileList] = useState([]);
  const [dataSoal, setDataSoal] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleDownload = () => {
    // Pastikan path ini benar menuju file template di folder public Anda
    window.open("/template/template_soal.xlsx", "_blank");
  };

  /**
   * Menangani pengiriman data hasil parsing Excel.
   * Fungsi ini mengubah data dari array of objects (untuk preview tabel)
   * menjadi array of arrays sesuai format yang diharapkan backend.
   *
   * PERBAIKAN: Menambahkan konversi tipe data eksplisit (Number, String)
   * untuk memastikan backend menerima format yang benar, terutama untuk
   * kolom 'Jenis' dan 'Poin' yang memerlukan operasi numerik.
   */
  const handleUpload = () => {
    if (dataSoal.length === 0) {
      message.error(
        "Tidak ada data untuk diunggah. Silakan pilih file yang valid."
      );
      return;
    }

    // Ubah data menjadi array of arrays untuk dikirim ke backend
    const payload = dataSoal.map((item) => [
      Number(item["Jenis"]), // qtype (question[0]) - Pastikan berupa Angka
      String(item["Pertanyaan"]), // question (question[1])
      item["A"] ? String(item["A"]) : null, // a (question[2])
      item["B"] ? String(item["B"]) : null, // b (question[3])
      item["C"] ? String(item["C"]) : null, // c (question[4])
      item["D"] ? String(item["D"]) : null, // d (question[5])
      item["E"] ? String(item["E"]) : null, // e (question[6])
      String(item["Jawaban"]), // qkey (question[7])
      Number(item["Poin"] || 0), // poin (question[8]) - Pastikan berupa Angka
    ]);

    // Panggil mutation dengan bankid dan payload yang sudah diubah
    uploadQuestion({ body: payload, bankid: bankid });
  };

  // Efek untuk menangani pesan sukses dan error dari mutation
  useEffect(() => {
    if (isSuccess) {
      message.success(data?.message || "Soal berhasil diunggah!");
      setDataSoal([]);
      setFileList([]);
      onClose(); // Menutup modal setelah sukses
      // Tidak perlu reset() di sini jika onClose sudah membersihkan state di parent
    }

    if (error) {
      message.error(
        error.data?.message || "Terjadi kesalahan saat mengunggah."
      );
      // Tidak perlu reset() di sini agar user bisa melihat error tanpa kehilangan konteks
    }
  }, [data, isSuccess, error, onClose]);

  // Props untuk komponen Upload dari Ant Design
  const propsUpload = {
    name: "file",
    multiple: false,
    accept:
      ".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
    fileList,
    onRemove: () => {
      setFileList([]);
      setDataSoal([]);
      setColumns([]);
    },
    // customRequest untuk membaca dan mem-parsing file secara lokal
    customRequest: ({ file, onSuccess, onError }) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Membaca baris sebagai array
            range: 1, // Mulai membaca dari baris kedua (indeks 1) untuk melewati header
          });

          // Filter baris kosong dari spreadsheet
          const filteredData = jsonData.filter(
            (row) =>
              row.length > 0 &&
              row.some(
                (cell) => cell !== null && cell !== undefined && cell !== ""
              )
          );

          // Proses setiap baris menjadi objek untuk preview di tabel
          const processedData = filteredData.map((row) => {
            const [colA, colB, colC, colD, colE, colF, colG, colH, colI] = row;
            // Menangani soal esai (Jenis 2)
            if (Number(colA) === 2) {
              return {
                Jenis: colA,
                Pertanyaan: colB,
                A: null,
                B: null,
                C: null,
                D: null,
                E: null,
                Jawaban: colH,
                Poin: colI,
              };
            }
            // Menangani soal pilihan ganda
            return {
              Jenis: colA,
              Pertanyaan: colB,
              A: colC,
              B: colD,
              C: colE,
              D: colF,
              E: colG,
              Jawaban: colH,
              Poin: colI,
            };
          });

          // Membuat kolom tabel secara dinamis untuk preview
          if (processedData.length > 0) {
            const header = Object.keys(processedData[0]);
            const tableColumns = header.map((key) => ({
              title: key,
              dataIndex: key,
              key: key,
              // Renderer khusus untuk kolom 'Jenis'
              ...(key === "Jenis" && {
                render: (jenis) => (
                  <Tag color={Number(jenis) === 1 ? "green" : "blue"}>
                    {Number(jenis) === 1 ? "Pilihan Ganda" : "Essay"}
                  </Tag>
                ),
                width: 150,
              }),
            }));
            setColumns(tableColumns);
          }

          setDataSoal(processedData);
          setFileList([file]);
          onSuccess("ok");
        } catch (err) {
          console.error("File processing error:", err);
          message.error("Gagal memproses file. Periksa kembali formatnya.");
          onError(err);
        }
      };
      reader.readAsArrayBuffer(file);
    },
  };

  const handleCancel = () => {
    setDataSoal([]);
    setFileList([]);
    setColumns([]);
    if (error || isSuccess) {
      reset(); // Reset status mutation saat modal ditutup
    }
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={handleUpload}
      okText='Simpan'
      cancelText='Tutup'
      width={1000}
      confirmLoading={isLoading}
    >
      <Space direction='vertical' style={{ width: "100%" }} size='large'>
        <Alert
          message='Ikuti langkah-langkah berikut'
          description={
            <Space direction='vertical' size={2}>
              <Text>1. Unduh template Excel yang disediakan.</Text>
              <Text>2. Isi data soal sesuai dengan kolom yang tersedia.</Text>
              <Text>
                3. Unggah file yang sudah diisi pada area di bawah ini.
              </Text>
              <Button type='primary' size='small' onClick={handleDownload}>
                Unduh Template
              </Button>
            </Space>
          }
          type='info'
          showIcon
        />

        <Dragger {...propsUpload}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>
            Klik atau seret file ke area ini untuk mengunggah
          </p>
          <p className='ant-upload-hint'>
            Hanya mendukung file .xlsx atau .xls.
          </p>
        </Dragger>

        {dataSoal.length > 0 && (
          <>
            <Text strong>Pratinjau Data:</Text>
            <Table
              columns={columns}
              dataSource={dataSoal}
              bordered
              size='small'
              rowKey={(record, index) => index}
              loading={isLoading}
              pagination={{ pageSize: 5 }}
              scroll={{ x: "max-content" }}
            />
          </>
        )}
      </Space>
    </Modal>
  );
};

export default FormUpload;
