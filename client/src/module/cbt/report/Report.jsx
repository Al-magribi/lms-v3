import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Flex, Select, Space, Tabs, Typography, message } from "antd";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logs from "./Logs";
import Analysis from "./Analysis";
import Scores from "./Scores";
import { useGetFilterQuery } from "../../../service/api/log/ApiLog";
import * as XLSX from "xlsx";

const Report = ({ name, examid, token }) => {
  const navigate = useNavigate();

  const [classid, setClassid] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  const logsTableRef = useRef(null);
  const analysisTableRef = useRef(null);
  const scoreTableRef = useRef(null);

  const { data } = useGetFilterQuery({ exam: examid }, { skip: !examid });

  const classOpts = data?.map((item) => ({ value: item.id, label: item.name }));

  const handleBack = () => {
    navigate("/computer-based-test");
  };

  const handleSelect = (value) => {
    setClassid(value);
  };

  const exportHtmlTableToExcel = (ref, fileName) => {
    if (!ref.current) {
      message.error("Tabel tidak ditemukan, tidak dapat mengunduh data.");
      return;
    }
    // Cari elemen <table> di dalam div yang direferensikan
    const table = ref.current.querySelector("table");
    if (!table) {
      message.error("Elemen tabel HTML tidak ditemukan.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleDownload = () => {
    switch (activeTab) {
      case "1":
        exportHtmlTableToExcel(
          logsTableRef,
          `Absensi_${name.replace(/-/g, "_")}`
        );
        break;
      case "2":
        exportHtmlTableToExcel(
          analysisTableRef,
          `Analisis_${name.replace(/-/g, "_")}`
        );

        break;
      case "3":
        exportHtmlTableToExcel(
          scoreTableRef,
          `Nilai_${name.replace(/-/g, "_")}`
        );

        break;
      default:
        break;
    }
  };

  const items = [
    {
      label: "Absen",
      key: "1",
      children: (
        <Logs examid={examid} classid={classid} tableRef={logsTableRef} />
      ),
    },
    {
      label: "Analisis",
      key: "2",
      children: (
        <Analysis
          examid={examid}
          classid={classid}
          tableRef={analysisTableRef}
        />
      ),
    },
    {
      label: "Nilai",
      key: "3",
      children: (
        <Scores examid={examid} classid={classid} tableRef={scoreTableRef} />
      ),
    },
  ];
  return (
    <Flex vertical gap={"small"}>
      <Flex align="center" justify="space-between">
        <Space>
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          />
          <div>
            <Typography.Title style={{ margin: 0 }} level={5}>
              {name?.replace(/-/g, " ")}
            </Typography.Title>

            <Typography.Text copyable strong>
              {token}
            </Typography.Text>
          </div>
        </Space>

        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Pilih Kelas"
            options={classOpts}
            onChange={handleSelect}
            allowClear
          />

          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            Unduh Data
          </Button>
        </Space>
      </Flex>

      <Tabs centered items={items} onChange={(key) => setActiveTab(key)} />
    </Flex>
  );
};

export default Report;
