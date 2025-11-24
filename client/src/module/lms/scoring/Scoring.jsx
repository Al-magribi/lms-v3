import {
  AimOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
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

  const handleSelectFinalScore = (item) => {
    setSearchParams({
      mode: "finalscore",
      name: item.name?.replace(/\s+/g, "-"),
      subjectid: item.id,
    });
  };

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
    <Flex vertical gap="middle">
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
                <Tooltip title="Penilaian Akhir Semester" key={"scoring"}>
                  <AimOutlined onClick={() => handleSelectFinalScore(item)} />
                </Tooltip>,
                <Tooltip title="Penilaian Bulanan" key={"scoring"}>
                  <ScheduleOutlined onClick={() => handleSelectScore(item)} />
                </Tooltip>,
                <Tooltip title="Pembobotan" key={"setting"}>
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
        title={`Pembobotan Nilai ${subject?.name} Bulanan`}
        open={open}
        onClose={handleClose}
        subject={subject}
      />
    </Flex>
  );
};

export default Scoring;
