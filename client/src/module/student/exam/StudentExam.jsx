import { useSelector } from "react-redux";
import MainLayout from "../../../components/layout/MainLayout";
import ExamList from "../../cbt/student/exam/ExamList";

const StudentExam = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <MainLayout title={`Daftr Ujian Kelas ${user?.class}`} levels={["student"]}>
      <ExamList classid={user?.class_id} />
    </MainLayout>
  );
};

export default StudentExam;
