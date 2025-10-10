import { useGetStudentDataQuery } from "../../service/api/database/ApiDatabase";
import { Skeleton, Tabs, Typography } from "antd"; // Import Typography
import PersonalData from "./PersonalData";
import ParentData from "./ParentData";
import FamilyData from "./FamilyData";
import { Fragment } from "react";

const { Title } = Typography;

const SingleDatabase = ({ studentid, name }) => {
  // Mengambil data siswa dan fungsi refetch
  const { data, isLoading, isError, refetch } =
    useGetStudentDataQuery(studentid);

  // Skeleton loading tetap ada
  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  // JIKA isError (data tidak ditemukan), kita tetap render form
  // dengan data kosong. Jika tidak error, kita gunakan data dari API.
  const studentData = data?.data || {}; // Default ke objek kosong jika data tidak ada
  const familyData = data?.data?.family || []; // Default ke array kosong

  const items = [
    {
      label: "Biodata Siswa",
      key: "1",
      children: (
        <PersonalData
          studentData={studentData}
          userid={studentid} // Teruskan studentid sebagai userid
          onRefetch={refetch} // Teruskan fungsi refetch
        />
      ),
    },
    {
      label: "Data Orang Tua",
      key: "2",
      children: (
        <ParentData
          studentData={studentData}
          userid={studentid} // Teruskan studentid sebagai userid
          onRefetch={refetch} // Teruskan fungsi refetch
        />
      ),
    },
    {
      label: "Data Keluarga",
      key: "3",
      children: (
        <FamilyData
          familyData={familyData}
          userid={studentid}
          onRefetch={refetch} // Teruskan fungsi refetch
        />
      ),
    },
  ];

  return (
    <Fragment>
      <title>{`Data Siswa ${name?.replace(/-/g, " ")}`}</title>
      {isError && (
        <Title level={5} type="warning" style={{ marginBottom: 16 }}>
          Data siswa tidak ditemukan. Silakan isi form di bawah untuk
          menambahkan data baru.
        </Title>
      )}
      <Tabs defaultActiveKey="1" centered items={items} />
    </Fragment>
  );
};

export default SingleDatabase;
