import Layout from "../../../components/layout/Layout";
import CbtBank from "../../cbt/bank/CbtBank";

const TeacherCbt = () => {
  return (
    <Layout title={"Daftar Bank Soal"} levels={["teacher"]}>
      <CbtBank />
    </Layout>
  );
};

export default TeacherCbt;
