import React, { useState, useEffect } from "react";
import { Modal, Button, Upload, message, Alert, Table } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Dragger } = Upload;

const UploadBulk = ({ title, open, onCancel, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewDataSource, setPreviewDataSource] = useState([]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setRawData([]);
      setPreviewColumns([]);
      setPreviewDataSource([]);
    }
  }, [open]);

  const handleOk = () => {
    if (rawData.length > 0) {
      onUpload(rawData);
    } else {
      message.error(
        "Tidak ada data untuk diunggah. Silakan pilih file yang valid."
      );
    }
  };

  const draggerProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx, .xls",
    fileList: file ? [file] : [],
    beforeUpload: (file) => {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (json.length > 1) {
            const headers = json[0]; // Otomatis membaca semua header, termasuk 'Rerata'
            const dataRows = json.slice(1);

            const validRows = dataRows.filter(
              (row) =>
                row[0] !== null &&
                row[0] !== undefined &&
                String(row[0]).trim() !== ""
            );

            // Simpan data mentah (sebagai array) untuk dikirim ke backend
            setRawData(validRows);

            // Buat kolom untuk tabel pratinjau berdasarkan header yang dibaca
            const columns = headers.map((header, index) => ({
              title: header,
              dataIndex: index,
              key: index,
              width: index === 1 ? 250 : 120,
            }));
            setPreviewColumns(columns);

            // Buat dataSource untuk tabel pratinjau
            const dataSourceForTable = validRows.map((row, rowIndex) => {
              const rowData = { key: rowIndex };
              row.forEach((cell, cellIndex) => {
                rowData[cellIndex] = cell;
              });
              return rowData;
            });

            setPreviewDataSource(dataSourceForTable);
            message.success(
              `Berhasil membaca ${validRows.length} baris data dari file.`
            );
          } else {
            message.warn("File excel tidak memiliki data untuk ditampilkan.");
            setRawData([]);
            setPreviewColumns([]);
            setPreviewDataSource([]);
          }
        } catch (error) {
          message.error("Terjadi kesalahan saat membaca file.");
          console.error("File read error:", error);
        }
      };
      reader.readAsArrayBuffer(file);
      return false;
    },
    onRemove: () => {
      setFile(null);
      setRawData([]);
      setPreviewColumns([]);
      setPreviewDataSource([]);
    },
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={1000}
      confirmLoading={isLoading}
      footer={[
        <Button key="back" onClick={onCancel}>
          Batal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleOk}
          disabled={rawData.length === 0}
          icon={<UploadOutlined />}
        >
          Upload Data
        </Button>,
      ]}
    >
      <Dragger {...draggerProps} style={{ marginBottom: 20 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Klik atau seret file ke area ini untuk mengunggah
        </p>
        <p className="ant-upload-hint">
          Gunakan template yang disediakan dan pastikan file dalam format .xlsx
        </p>
      </Dragger>

      {previewDataSource.length > 0 && (
        <>
          <Alert
            message={`Pratinjau Data: Ditemukan ${previewDataSource.length} baris data yang akan diunggah.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={previewColumns}
            dataSource={previewDataSource}
            bordered
            size="small"
            pagination={{ pageSize: 5 }}
            scroll={{ y: 240, x: "max-content" }}
          />
        </>
      )}
    </Modal>
  );
};

export default UploadBulk;
