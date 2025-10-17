import React from "react";
import { Card, Tabs, Table, Skeleton, Typography, Alert } from "antd";
import { useGetHomeInfografisQuery } from "../../../../service/api/dashboard/ApiDashboard";

const { TabPane } = Tabs;
const { Title } = Typography;

// Konfigurasi kolom untuk setiap tabel
const provinceColumns = [
  {
    title: "Nama Provinsi",
    dataIndex: "province_name",
    key: "province_name",
    sorter: (a, b) => a.province_name.length - b.province_name.length,
  },
  {
    title: "Jumlah Siswa",
    dataIndex: "student_count",
    key: "student_count",
    sorter: (a, b) => a.student_count - b.student_count,
    align: "right",
  },
];

const cityColumns = [
  {
    title: "Nama Kota/Kabupaten",
    dataIndex: "city_name",
    key: "city_name",
  },
  {
    title: "Provinsi",
    dataIndex: "province_name",
    key: "province_name",
  },
  {
    title: "Jumlah Siswa",
    dataIndex: "student_count",
    key: "student_count",
    sorter: (a, b) => a.student_count - b.student_count,
    align: "right",
  },
];

const districtColumns = [
  {
    title: "Nama Kecamatan",
    dataIndex: "district_name",
    key: "district_name",
  },
  {
    title: "Kota/Kabupaten",
    dataIndex: "city_name",
    key: "city_name",
  },
  {
    title: "Jumlah Siswa",
    dataIndex: "student_count",
    key: "student_count",
    sorter: (a, b) => a.student_count - b.student_count,
    align: "right",
  },
];

const villageColumns = [
  {
    title: "Nama Desa/Kelurahan",
    dataIndex: "village_name",
    key: "village_name",
  },
  {
    title: "Kecamatan",
    dataIndex: "district_name",
    key: "district_name",
  },
  {
    title: "Kota/Kabupaten",
    dataIndex: "city_name",
    key: "city_name",
  },
  {
    title: "Jumlah Siswa",
    dataIndex: "student_count",
    key: "student_count",
    sorter: (a, b) => a.student_count - b.student_count,
    align: "right",
  },
];

const Geographic = () => {
  const { data, isLoading, isError } = useGetHomeInfografisQuery();

  // Menampilkan skeleton loading saat data diambil
  if (isLoading) {
    return (
      <Card title={<Title level={4}>Distribusi Geografis Siswa</Title>}>
        <Skeleton active paragraph={{ rows: 12 }} />
      </Card>
    );
  }

  // Menampilkan pesan error jika terjadi kegagalan fetch
  if (isError) {
    return (
      <Card title={<Title level={4}>Distribusi Geografis Siswa</Title>}>
        <Alert
          message="Error"
          description="Gagal memuat data geografis. Silakan coba lagi nanti."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card title={<Title level={4}>Distribusi Geografis Siswa</Title>}>
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Provinsi" key="1">
          <Table
            dataSource={data?.provinces}
            columns={provinceColumns}
            rowKey="province_name"
            pagination={false}
            scroll={{ x: "max-content" }} // Membuat tabel scroll horizontal di layar kecil
          />
        </TabPane>
        <TabPane tab="Kota/Kabupaten" key="2">
          <Table
            dataSource={data?.cities}
            columns={cityColumns}
            rowKey="city_name"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </TabPane>
        <TabPane tab="Kecamatan" key="3">
          <Table
            dataSource={data?.districts}
            columns={districtColumns}
            rowKey={(record) => `${record.district_name}-${record.city_name}`}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </TabPane>
        <TabPane tab="Desa/Kelurahan" key="4">
          <Table
            dataSource={data?.villages}
            columns={villageColumns}
            rowKey={(record) =>
              `${record.village_name}-${record.district_name}`
            }
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default Geographic;
