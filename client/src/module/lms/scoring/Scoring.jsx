import { FileTextOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Row, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import FormWeight from "./FormWeight";

const { Meta } = Card;

const Scoring = () => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const subjectsData = user?.subjects;

  const handleSelectScore = (item) => {
    setSearchParams({
      mode: "scoring",
      name: item.name?.replace(/\s+/g, "-"),
      subjectid: item.id,
    });
  };

  const handleSelectWeight = (item) => {
    setSubject(item);
    setOpen(true);
  };

  const handleClose = () => {
    setSubject("");
    setOpen(false);
  };

  return (
    <Flex vertical gap='middle'>
      <Typography.Title level={5}>
        Pilih Mata Pelajaran Untuk Penilaian
      </Typography.Title>

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
              actions={[
                <Tooltip title='Penilaian' key={"scoring"}>
                  <FileTextOutlined onClick={() => handleSelectScore(item)} />
                </Tooltip>,
                <Tooltip title='Pembobotan' key={"setting"}>
                  <SettingOutlined onClick={() => handleSelectWeight(item)} />
                </Tooltip>,
              ]}
            >
              <Meta title={item.name} />
            </Card>
          </Col>
        ))}
      </Row>

      <FormWeight
        title={`Pembobotan Nilai ${subject?.name}`}
        open={open}
        onClose={handleClose}
        subject={subject}
      />
    </Flex>
  );
};

export default Scoring;
