import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Flex,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import * as XLSX from "xlsx";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useUploadParentsMutation } from "../../../../service/api/main/ApiParent";

const { Dragger } = Upload;
const { Text } = Typography;

// Konfigurasi kolom untuk tabel pratinjau
const previewColumns = [
  { title: "NIS", dataIndex: "nis", key: "nis" },
  { title: "NAMA ORANG TUA", dataIndex: "name", key: "name" },
  { title: "EMAIL", dataIndex: "email", key: "email" },
  {
    title: "KETERANGAN",
    dataIndex: "issue",
    key: "issue",
    render: (text) => <Tag color="red">{text}</Tag>,
  },
];

const FormUpload = ({ open, onClose }) => {
  // State management
  const [file, setFile] = useState(null);
  const [validRows, setValidRows] = useState([]);
  const [incompleteRows, setIncompleteRows] = useState([]);
  const [duplicateRows, setDuplicateRows] = useState([]);
  const [previewKey, setPreviewKey] = useState(0); // Untuk mereset komponen Dragger

  // RTK Query Mutation Hook
  const [uploadParents, { data, error, isLoading, isSuccess, reset }] =
    useUploadParentsMutation();

  const handleDownload = () => {
    window.open("/template/template_orangtua.xlsx", "_blank");
  };

  // Fungsi untuk memproses file yang di-upload
  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, {
          defval: "", // Beri nilai default string kosong jika sel kosong
        });

        // Proses setiap baris dari file
        const processedRows = json.map((row) => ({
          nis: row.NIS || row.nis,
          name: row["NAMA ORANG TUA"] || row.name,
          // Pastikan email ada, ubah ke string, dan konversi ke lowercase
          email: row.EMAIL
            ? String(row.EMAIL).toLowerCase()
            : row.email
            ? String(row.email).toLowerCase()
            : "",
        }));

        // Lakukan validasi data
        const seenNis = new Set();
        const localValidRows = [];
        const localIncompleteRows = [];
        const localDuplicateRows = [];

        processedRows.forEach((row) => {
          if (!row.nis || !row.name || !row.email) {
            row.issue = "Data tidak lengkap (NIS/Nama/Email wajib diisi)";
            localIncompleteRows.push(row);
          } else if (seenNis.has(row.nis)) {
            row.issue = "NIS duplikat di dalam file ini";
            localDuplicateRows.push(row);
          } else {
            seenNis.add(row.nis);
            localValidRows.push(row);
          }
        });

        // Update state dengan data yang sudah diproses
        setValidRows(localValidRows);
        setIncompleteRows(localIncompleteRows);
        setDuplicateRows(localDuplicateRows);
      } catch (err) {
        message.error(
          "Gagal memproses file. Pastikan format file sudah benar."
        );
        console.error("File processing error:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Konfigurasi untuk komponen Dragger (area upload)
  const draggerProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx, .xls, .csv",
    beforeUpload: (file) => {
      setFile(file);
      handleFile(file);
      return false; // Mencegah upload otomatis oleh Ant Design
    },
    onRemove: () => {
      // Reset semua state jika file dihapus dari Dragger
      setFile(null);
      setValidRows([]);
      setIncompleteRows([]);
      setDuplicateRows([]);
    },
  };

  // Fungsi untuk mengirim data valid ke server
  const handleSubmit = () => {
    if (validRows.length > 0) {
      uploadParents({ parents: validRows });
    } else {
      message.warning("Tidak ada data valid untuk diunggah.");
    }
  };

  // Fungsi untuk membersihkan state dan menutup modal
  const handleClose = () => {
    setFile(null);
    setValidRows([]);
    setIncompleteRows([]);
    setDuplicateRows([]);
    setPreviewKey((prev) => prev + 1); // Trik untuk mereset tampilan Dragger
    onClose();
  };

  // Efek untuk menangani feedback setelah upload
  useEffect(() => {
    if (isSuccess) {
      message.success(data?.message || "Data berhasil diunggah.");
      reset();
      handleClose();
    }
    if (error) {
      message.error(
        error?.data?.message || "Terjadi kesalahan saat mengunggah."
      );
      reset();
    }
  }, [isSuccess, error, data, reset]);

  return (
    <Modal
      title="Upload Data Orang Tua"
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose}>
          Tutup
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={validRows.length === 0 || isLoading}
        >
          {isLoading
            ? "Mengunggah..."
            : `Upload ${validRows.length} Data Valid`}
        </Button>,
      ]}
      width={800}
      destroyOnHidden
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Dragger {...draggerProps} key={previewKey}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Klik atau seret file ke area ini untuk mengunggah
          </p>
          <p className="ant-upload-hint">
            Hanya mendukung file .xlsx, .xls, atau .csv. Pastikan kolom memiliki
            judul: NIS, NAMA ORANG TUA, EMAIL.
          </p>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            Download Template
          </Button>
        </Dragger>

        {file && (
          <div style={{ width: "100%", marginTop: 16 }}>
            <Divider orientation="left" plain>
              <Flex align="center" gap="small">
                <CheckCircleOutlined style={{ color: "green" }} />
                <Text>Data Siap Diupload</Text>
                <Tag color="success">{validRows.length}</Tag>
              </Flex>
            </Divider>
            <Table
              columns={previewColumns.filter((col) => col.key !== "issue")} // Sembunyikan kolom 'Keterangan'
              dataSource={validRows}
              size="small"
              pagination={{ pageSize: 3, hideOnSinglePage: true }}
              scroll={{ x: true }}
            />

            {duplicateRows.length > 0 && (
              <>
                <Divider orientation="left" plain>
                  <Flex align="center" gap="small">
                    <ExclamationCircleOutlined style={{ color: "orange" }} />
                    <Text>Data Duplikat (Dilewati)</Text>
                    <Tag color="warning">{duplicateRows.length}</Tag>
                  </Flex>
                </Divider>
                <Table
                  columns={previewColumns}
                  dataSource={duplicateRows}
                  size="small"
                  pagination={{ pageSize: 3, hideOnSinglePage: true }}
                  scroll={{ x: true }}
                />
              </>
            )}

            {incompleteRows.length > 0 && (
              <>
                <Divider orientation="left" plain>
                  <Flex align="center" gap="small">
                    <CloseCircleOutlined style={{ color: "red" }} />
                    <Text>Data Tidak Lengkap (Dilewati)</Text>
                    <Tag color="error">{incompleteRows.length}</Tag>
                  </Flex>
                </Divider>
                <Table
                  columns={previewColumns}
                  dataSource={incompleteRows}
                  size="small"
                  pagination={{ pageSize: 3, hideOnSinglePage: true }}
                  scroll={{ x: true }}
                />
              </>
            )}
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default FormUpload;
