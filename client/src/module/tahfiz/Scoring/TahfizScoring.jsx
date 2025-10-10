import { Flex, Tabs, Typography } from "antd";
import MainLayout from "../../../components/layout/MainLayout";
import Examiner from "./examnier/Examiner";
import Types from "./types/Types";
import Indicators from "./indicators/Indicators";
import Target from "./target/Target";

const TahfizScoring = () => {
  const items = [
    { label: "Penguji", key: "1", children: <Examiner /> },
    { label: "Jenis Penilaian", key: "2", children: <Types /> },
    { label: "Indikator Penilaian", key: "3", children: <Indicators /> },
    { label: "Target", key: "4", children: <Target /> },
  ];
  return (
    <MainLayout title={"Managemen Penilaian Tahfiz"} levels={["tahfiz"]}>
      <Flex vertical gap={"small"}>
        <Typography.Title style={{ margin: 0 }} level={5}>
          Managemen Penilaian
        </Typography.Title>

        <Tabs centered items={items} defaultActiveKey="1" />
      </Flex>
    </MainLayout>
  );
};

export default TahfizScoring;
