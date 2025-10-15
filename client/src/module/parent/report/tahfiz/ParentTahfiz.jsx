import { useSelector } from "react-redux";
import MainLayout from "../../../../components/layout/MainLayout";
import History from "../../../tahfiz/Memorization/history/History";
import { useNavigate } from "react-router-dom";

const ParentTahfiz = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleBack = () => {
    navigate("/orangtua-dashboard");
  };

  return (
    <MainLayout title={`Laporan Tahfiz ${user?.student}`} levels={["parent"]}>
      <History
        userid={user?.student_id}
        name={user?.student}
        onBack={handleBack}
      />
    </MainLayout>
  );
};

export default ParentTahfiz;
