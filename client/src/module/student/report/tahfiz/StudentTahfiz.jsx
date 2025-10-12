import React from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import History from "../../../tahfiz/Memorization/history/History";
import { useNavigate } from "react-router-dom";

const StudentTahfiz = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleBack = () => {
    navigate("/siswa-dashboard");
  };
  return (
    <MainLayout title={`Laporan Tahfiz ${user?.name}`} levels={["student"]}>
      <History name={user?.name} userid={user?.id} onBack={handleBack} />
    </MainLayout>
  );
};

export default StudentTahfiz;
