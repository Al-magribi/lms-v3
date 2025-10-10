import {
  Alert,
  Button,
  Flex,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useUploadStudentsMutation } from "../../../../service/api/main/ApiClass";
import {
  CloseCircleOutlined,
  FileExcelOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Dragger } = Upload;
const { Text, Title } = Typography;

const UploadStudents = ({ open, onClose }) => {
  const [file, setFile] = useState(null);
  const [bulk, setBulk] = useState([]);
  const [uploadStudents, { isLoading, isSuccess, error, data }] =
    useUploadStudentsMutation();

  const previewColumns = [
    { title: "TAHUN MASUK", dataIndex: 0, key: "tahunMasuk" },
    { title: "NIS", dataIndex: 1, key: "nis" },
    { title: "NAMA LENGKAP", dataIndex: 2, key: "nama" },
    { title: "Kelamin", dataIndex: 3, key: "kelamin" },
    { title: "Kelas", dataIndex: 4, key: "kelas" },
  ];

  const handleDownload = () => {
    window.open("/template/template_siswa.xlsx", "_blank");
  };

  const handleFile = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            range: 1,
          });

          const filteredData = jsonData
            .map((row) => row.slice(0, 5))
            .filter((row) =>
              row.some(
                (cell) => cell !== null && cell !== undefined && cell !== ""
              )
            );

          if (filteredData.length === 0) {
            message.error("Tidak ada data dalam file atau template salah.");
            setFile(null);
            return;
          }

          setBulk(filteredData);
          message.success(`Jumlah data terbaca ${filteredData.length} siswa.`);
        } catch (error) {
          message.error(
            "Gagal memproses data. Pastikan template yang digunakan benar"
          );
          console.error("Error parsing Excel file:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async () => {
    if (bulk.length === 0) {
      message.warning("Tidak ada data yang diupload, pastikan template sesuai");
      return;
    } else {
      uploadStudents(bulk);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setBulk([]);
    onClose();
  };

  useEffect(() => {
    if (file) {
      handleFile();
    } else {
      setBulk([]);
    }
  }, [file]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      setFile(null);
      setBulk([]);
      onClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [isSuccess, data, error]);

  return (
    <Modal
      title="Bulk Upload Students"
      open={open}
      onCancel={handleCancel}
      destroyOnHidden
      width={700}
      style={{ top: 20 }}
      okText="Simpan"
      cancelText="Tutup"
      onOk={handleSubmit}
      confirmLoading={isLoading}
      loading={isLoading}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Alert
          message="Follow these steps"
          description={
            <Space direction="vertical" size={2}>
              <Text>1. Unduh template excel yang sudah disediakan.</Text>
              <Text>2. Isikan data siswa berdasarkan kolom yang tersedia.</Text>
              <Text>3. Upload kembali file yang sudah diisi.</Text>

              <Button type="primary" size="small" onClick={handleDownload}>
                Download Template
              </Button>
            </Space>
          }
          type="info"
          showIcon
        />

        {!file ? (
          <Dragger
            name="file"
            accept=".xlsx, .xls, .csv"
            beforeUpload={(selectedFile) => {
              setFile(selectedFile);
              return false;
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Ensure the file matches the template format.
            </p>
          </Dragger>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Flex
              align="center"
              justify="space-between"
              style={{
                background: "#f0f0f0",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              <Flex align="center" gap="small">
                <FileExcelOutlined style={{ color: "#217346", fontSize: 20 }} />
                <Text strong>{file.name}</Text>
                <Tag color="green">{bulk.length} records found</Tag>
              </Flex>
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setFile(null)}
              >
                Change File
              </Button>
            </Flex>

            {bulk.length > 0 && (
              <>
                <Title level={5} style={{ marginTop: 16 }}>
                  Data Preview
                </Title>
                <Table
                  columns={previewColumns}
                  dataSource={bulk.map((row, index) => ({
                    key: index,
                    ...row,
                  }))}
                  size="small"
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  scroll={{ y: 240 }}
                />
              </>
            )}
          </Space>
        )}
      </Space>
    </Modal>
  );
};

export default UploadStudents;
