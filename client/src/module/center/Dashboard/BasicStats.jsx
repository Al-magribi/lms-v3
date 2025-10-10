import { useGetCenterBasicQuery } from "../../../service/api/dashboard/ApiDashboard";
import { Card, Col, Row, Statistic } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  HomeOutlined,
  FileTextOutlined,
  ContainerOutlined,
  ClusterOutlined,
} from "@ant-design/icons";
import LoadingData from "../../../components/loaders/LoadingData";

const cardInfo = [
  { key: "total_students", title: "Total Siswa", icon: <UserOutlined /> },
  { key: "total_teachers", title: "Total Guru", icon: <TeamOutlined /> },
  { key: "total_classes", title: "Total Kelas", icon: <HomeOutlined /> },
  { key: "total_homebase", title: "Total Homebase", icon: <ClusterOutlined /> },
];

const BasicStats = () => {
  const { data, isLoading } = useGetCenterBasicQuery();

  const l = true;

  return (
    <LoadingData isLoading={isLoading}>
      <Row gutter={[24, 24]}>
        {cardInfo.map((card) => (
          <Col xs={24} sm={12} md={8} lg={6} key={card.key}>
            <Card hoverable>
              <Statistic
                title={card.title}
                value={data && data[card.key]}
                valueStyle={{ color: "#3f8600" }}
                prefix={card.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </LoadingData>
  );
};

export default BasicStats;
