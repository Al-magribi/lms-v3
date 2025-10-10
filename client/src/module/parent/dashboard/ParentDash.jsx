import React from "react";
import { useSelector } from "react-redux";
import MainLayout from "../../../components/layout/MainLayout";

// Impor komponen dari Ant Design dan ikon
import {
  Card,
  Avatar,
  Row,
  Col,
  Descriptions,
  Tag,
  Divider,
  Typography,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  ReadOutlined,
  IdcardOutlined,
  CalendarOutlined,
  BankOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ParentDash = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <MainLayout title={"Dashborad"} levels={["parent"]}>
      <Spin spinning={!user}>
        <Card
          style={{ width: "100%", borderRadius: "8px" }}
          title={<Title level={4}>Profil Pengguna</Title>}
        >
          <Row gutter={[24, 24]} align="middle">
            {/* Kolom Kiri: Avatar dan Info Orang Tua */}
            <Col xs={24} sm={24} md={7} style={{ textAlign: "center" }}>
              <Avatar size={100} icon={<UserOutlined />} />
              <Title
                level={5}
                style={{ marginTop: "12px", marginBottom: "4px" }}
              >
                {user.name}
              </Title>
              <Text type="secondary">
                <MailOutlined style={{ marginRight: "8px" }} />
                {user.email}
              </Text>
              <br />
              <Tag
                color="cyan"
                style={{ marginTop: "10px", textTransform: "capitalize" }}
              >
                {user.level}
              </Tag>
            </Col>

            {/* Kolom Kanan: Detail Informasi Akademik Siswa */}
            <Col xs={24} sm={24} md={17}>
              <Divider orientation="left" plain>
                <Title level={5}>Informasi Akademik Siswa</Title>
              </Divider>
              <Descriptions
                bordered
                layout="vertical"
                column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
              >
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> Nama Siswa
                    </>
                  }
                >
                  {user.student}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <IdcardOutlined /> NIS
                    </>
                  }
                >
                  {user.nis}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <BankOutlined /> Sekolah
                    </>
                  }
                >
                  {user.homebase}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined /> Periode Ajaran
                    </>
                  }
                >
                  {user.periode_name}{" "}
                  <Tag color={user.periode_active ? "green" : "red"}>
                    {user.periode_active ? "Aktif" : "Tidak Aktif"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <ReadOutlined /> Kelas
                    </>
                  }
                >
                  {`${user.grade} (${user.class})`}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <BookOutlined /> Jurusan
                    </>
                  }
                >
                  {user.major}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>
      </Spin>
    </MainLayout>
  );
};

export default ParentDash;
