import { useState } from "react";
import {
  useDownloadMarketAnalysisMutation,
  useGetFamilyDataQuery,
} from "../../../../service/api/center/ApiCenterData";
import TableLayout from "../../../../components/table/TableLayout";
import Download from "../../../../components/buttons/Download";
import { Flex, Space, Typography, message } from "antd";

const { Text, Link } = Typography;

const Market = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [downloadMarketAnalysis] = useDownloadMarketAnalysisMutation();

  const { data, isLoading } = useGetFamilyDataQuery({
    page,
    limit,
    search,
    family_age: ageFilter,
    family_gender: genderFilter,
  });

  const { results = [], totalData, totalPages } = data || {};

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const handleDownload = async () => {
    try {
      await downloadMarketAnalysis({
        search,
        family_age: ageFilter,
        family_gender: genderFilter,
      }).unwrap();
      message.success("Berhasil download file analisis market");
    } catch (error) {
      message.error(error?.data?.message || "Gagal download file");
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Nama Siswa",
      key: "student_name",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text>{record.student_name}</Text>
          <small>{record.nis}</small>
        </Space>
      ),
    },
    {
      title: "Nama Keluarga",
      key: "family_name",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text>{record.family_name}</Text>
          <span>
            {record.family_gender === "P" ? (
              <Text type="success">Perempuan</Text>
            ) : (
              <Text type="success">Laki Laki</Text>
            )}
            - <Text strong>{record.family_age} thn</Text>
          </span>
        </Space>
      ),
    },
    {
      title: "Orang Tua",
      key: "parent",
      render: (text, record) => {
        const formattedFatherPhone = record.father_phone
          ? `62${record.father_phone.substring(1)}`
          : "";
        const formattedMotherPhone = record.mother_phone
          ? `62${record.mother_phone.substring(1)}`
          : "";

        return (
          <Space>
            <Space direction="vertical" size="small">
              <Text>{record.father_name}</Text>
              <small>
                <Link
                  href={`https://wa.me/${formattedFatherPhone}`}
                  target="_blank"
                >
                  {record.father_phone} 
                </Link>
              </small>
            </Space>

            <Space direction="vertical" size="small">
              <Text>{record.mother_name}</Text>
              <small>
                <Link
                  href={`https://wa.me/${formattedMotherPhone}`}
                  target="_blank"
                >
                  {record.mother_phone} 
                </Link>
              </small>
            </Space>
          </Space>
        );
      },
    },
  ];

  return (
    <Flex vertical gap="middle">
      <Flex justify="end">
        <Download onClick={handleDownload} />
      </Flex>

      <TableLayout
        onSearch={handleSearch}
        isLoading={isLoading}
        columns={columns}
        source={results}
        rowKey="family_id"
        page={page}
        limit={limit}
        totalData={totalData}
        onChange={handleTableChange}
      />
    </Flex>
  );
};

export default Market;
