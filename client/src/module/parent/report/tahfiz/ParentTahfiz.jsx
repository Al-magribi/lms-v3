import { useSelector } from "react-redux";
import MainLayout from "../../../../components/layout/MainLayout";
import History from "../../../tahfiz/Memorization/history/History";

const ParentTahfiz = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <MainLayout title={`Laporan Tahfiz ${user?.student}`} levels={["parent"]}>
      <History userid={user?.student_id} name={user?.student} />
    </MainLayout>
  );
};

export default ParentTahfiz;
