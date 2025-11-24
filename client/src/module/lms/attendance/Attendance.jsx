import {
  Alert,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Select,
  Tabs,
  Typography,
} from "antd";
import { useGetClassesQuery } from "../../../service/api/lms/ApiChapter";
import { useSelector } from "react-redux";
import { useState } from "react";
import FormAttendance from "./FormAttendance";
import History from "./History";
import { CalendarOutlined, HistoryOutlined } from "@ant-design/icons";

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: classes, isLoading } = useGetClassesQuery();

  const [classid, setClassid] = useState("");
  const [subjectid, setSubjectid] = useState("");

  const subjectOpts = user?.subjects?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const classOpts = classes?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const handleSelectClass = (value) => {
    setClassid(value);
  };

  const handleSelectSubject = (value) => {
    setSubjectid(value);
  };

  const items = [
    {
      label: "Presensi Harian",
      key: "1",
      children: <FormAttendance classid={classid} subjectid={subjectid} />,
      icon: <CalendarOutlined />,
    },
    {
      label: "Riwayat Presensi",
      key: "2",
      children: <History classid={classid} subjectid={subjectid} />,
      icon: <HistoryOutlined />,
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Card hoverable title="Managemen Kehadiran Siswa">
        <Row gutter={[16, 16]}>
          <Col sm={24} md={12}>
            <Select
              style={{ width: "100%" }}
              placeholder="Pilih Mata Pelajran"
              allowClear
              options={subjectOpts}
              onChange={handleSelectSubject}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Col>

          <Col sm={24} md={12}>
            <Select
              style={{ width: "100%" }}
              placeholder="Pilih Kelas"
              allowClear
              options={classOpts}
              onChange={handleSelectClass}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Col>
        </Row>
      </Card>

      {classid && subjectid ? (
        <Tabs items={items} />
      ) : (
        <Alert
          type="info"
          showIcon
          description="Silakan pilih mata pelajaran dan kelas terlebih dahulu untuk
              melihat data presensi"
        />
      )}
    </Flex>
  );
};

export default Attendance;
