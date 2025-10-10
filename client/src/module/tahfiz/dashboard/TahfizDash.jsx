import {
  Card,
  Col,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tabs,
  Select,
  Typography, // Import Typography
  Flex, // Import Flex
} from "antd";
import { useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useGetAchievementQuery } from "../../../service/api/tahfiz/ApiReport";

const { Option } = Select;
const { Text } = Typography;

const TahfizDash = () => {
  const { data, isLoading } = useGetAchievementQuery();
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);

  const selectedData = data && data[selectedDataIndex];

  const handleDataChange = (value) => {
    setSelectedDataIndex(value);
  };

  const gradeTabs =
    selectedData?.grade.map((grade) => {
      // PERUBAHAN: Tabel kelas dibuat responsif
      const classColumns = [
        {
          title: "Kelas",
          dataIndex: "class_name",
          key: "class_name",
          fixed: "left", // Membuat kolom ini tetap saat scroll horizontal
          width: 100,
        },
        {
          title: "Selesai",
          dataIndex: "completed",
          key: "completed",
          align: "center",
        },
        {
          title: "Belum Selesai",
          dataIndex: "uncompleted",
          key: "uncompleted",
          align: "center",
        },
        {
          title: "Melampaui Target (Selesai)",
          dataIndex: "exceed_completed",
          key: "exceed_completed",
          align: "center",
          // PERUBAHAN: Kolom ini akan disembunyikan di layar lebih kecil dari medium (tablet)
          responsive: ["md"],
        },
        {
          title: "Melampaui Target (Belum Selesai)",
          dataIndex: "exceed_uncompleted",
          key: "exceed_uncompleted",
          align: "center",
          // PERUBAHAN: Kolom ini akan disembunyikan di layar lebih kecil dari medium (tablet)
          responsive: ["md"],
        },
      ];

      // PERUBAHAN: Tabel siswa dibuat responsif
      const studentColumns = [
        {
          title: "NIS",
          dataIndex: "nis",
          key: "nis",
          width: 100,
          fixed: "left",
          responsive: ["sm"], // Sembunyikan NIS di layar ponsel (xs)
        },
        {
          title: "Nama",
          dataIndex: "name",
          key: "name",
          width: 200,
          fixed: "left",
        },
        // PERUBAHAN: Menggabungkan dua kolom progress menjadi satu
        {
          title: "Progress Keseluruhan",
          key: "progress_overall",
          width: 250,
          render: (text, record) => (
            <div>
              <Text strong>Target:</Text>
              {record.progress.map((prog, index) => (
                <div key={index}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {prog.juz}
                  </Text>
                  <Progress percent={prog.persentase} size="small" />
                </div>
              ))}
              {record.exceed.length > 0 && (
                <>
                  <Text strong style={{ marginTop: "8px", display: "block" }}>
                    Melampaui:
                  </Text>
                  {record.exceed.map((exc, index) => (
                    <div key={index}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {exc.juz}
                      </Text>
                      <Progress
                        percent={exc.persentase}
                        size="small"
                        status="success"
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          ),
        },
      ];

      return {
        key: grade.id,
        label: `Kelas ${grade.name}`,
        children: (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {/* PERUBAHAN: Grid untuk kartu statistik dibuat responsif */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Pencapaian Rata-rata"
                      value={grade.achievement}
                      precision={2}
                      suffix="%"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Selesai"
                      value={grade.completed}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Belum Selesai"
                      value={grade.uncompleted}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Melampaui Target"
                      value={grade.exceed_completed}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Table
                columns={classColumns}
                dataSource={grade.classes}
                rowKey="class_id"
                // PERUBAHAN: Aktifkan scroll horizontal jika tabel terlalu lebar
                scroll={{ x: "max-content" }}
                expandable={{
                  expandedRowRender: (record) => (
                    <Table
                      columns={studentColumns}
                      dataSource={record.students}
                      rowKey="userid"
                      pagination={false}
                      scroll={{ x: "max-content" }}
                    />
                  ),
                }}
              />
            </Col>
          </Row>
        ),
      };
    }) || [];

  return (
    <MainLayout title={"Dashboard"} levels={["tahfiz"]}>
      <Spin spinning={isLoading} tip="Memproses data ..." size="large">
        <Card
          title={
            // PERUBAHAN: Menggunakan Flex untuk header yang lebih responsif
            <Flex
              wrap="wrap"
              gap="middle"
              justify="space-between"
              align="center"
            >
              <Text strong style={{ fontSize: "14px" }}>
                Dashboard Tahfiz - Periode {selectedData?.periode}
              </Text>
              <Select
                defaultValue={0}
                style={{ minWidth: 200 }} // Gunakan minWidth agar tidak terlalu kecil
                onChange={handleDataChange}
                value={selectedDataIndex}
              >
                {data?.map((item, index) => (
                  <Option key={item.homebase_id} value={index}>
                    {item.homebase}
                  </Option>
                ))}
              </Select>
            </Flex>
          }
          style={{ marginBottom: "24px" }}
        >
          <Tabs defaultActiveKey="1" items={gradeTabs} />
        </Card>
      </Spin>
    </MainLayout>
  );
};

export default TahfizDash;
