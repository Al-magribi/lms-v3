import { Card, Col, Flex, Row, Typography } from "antd";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const { Meta } = Card;

const Subjects = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth);
  const subjectsData = user?.subjects;

  const handleSelect = (item) => {
    setSearchParams({
      mode: "lms",
      name: item.name?.replace(/\s+/g, "-"),
      subjectid: item.id,
    });
  };
  return (
    <Flex vertical gap="middle">
      <Typography.Title level={5}>Daftar Mata Pelajaran</Typography.Title>

      <Row gutter={[16, 16]}>
        {subjectsData?.map((item) => (
          <Col key={item.id} sm={24} md={12} lg={6}>
            <Card
              hoverable
              cover={
                <img
                  src={item.cover ? item.cover : "/logo.png"}
                  alt={item.name}
                />
              }
              onClick={() => handleSelect(item)}
            >
              <Meta title={item.name} />
            </Card>
          </Col>
        ))}
      </Row>
    </Flex>
  );
};

export default Subjects;
