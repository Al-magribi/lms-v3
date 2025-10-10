import React from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import History from "../../../tahfiz/Memorization/history/History";

const StudentTahfiz = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <MainLayout title={`Laporan Tahfiz ${user?.name}`} levels={["student"]}>
      <History name={user?.name} userid={user?.id} />
    </MainLayout>
  );
};

export default StudentTahfiz;
