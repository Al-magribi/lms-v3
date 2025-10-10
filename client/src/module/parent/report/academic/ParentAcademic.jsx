import MainLayout from "../../../../components/layout/MainLayout";
import { Flex, Spin, Tabs, Typography } from "antd";
import { useSelector } from "react-redux";
import Monthly from "./Monthly";
import Annual from "./Annual";

const ParentAcademic = () => {
  const { user } = useSelector((state) => state.auth);

  const items = [
    { label: "Bulanan", key: "1", children: <Monthly /> },
    { label: "Semester", key: "2", children: <Annual /> },
  ];
  return (
    <MainLayout title={"Laporan Akademik"} levels={["parent"]}>
      <Typography.Title
        level={5}
      >{`Laporan Akademik ${user?.student}`}</Typography.Title>

      <Tabs centered defaultActiveKey="1" items={items} />
    </MainLayout>
  );
};

export default ParentAcademic;
