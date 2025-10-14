import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import Subjects from "../../lms/subjects/Subjects";
import ChaptersStudentView from "../../lms/subjects/chapter/ChaptersStudentView";

const StudentLms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const subjectid = searchParams.get("subjectid");
  const mode = searchParams.get("mode");

  const handleBack = () => {
    navigate("/siswa-lms");
  };

  if (mode === "lms") {
    return (
      <ChaptersStudentView name={name} id={subjectid} onBack={handleBack} />
    );
  }

  return (
    <MainLayout title={`Daftar Mata Pelajaran`} levels={["student"]}>
      <Subjects />
    </MainLayout>
  );
};

export default StudentLms;
