import React from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import { useGetSubjectQuery } from "../../../../service/api/lms/ApiLms";
import {
  Button,
  Flex,
  Space,
  Typography,
  Collapse,
  Card,
  List,
  Spin,
  Empty,
  Tag,
} from "antd";
import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// Ganti dengan URL dasar API Anda tempat file disimpan
const API_BASE_URL = "https://your-api-base-url.com";

const ChaptersStudentView = ({ name, id, onBack }) => {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetSubjectQuery(
    {
      subjectid: id,
      classid: user?.class_id,
    },
    { skip: !id || !user?.class_id }
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
          <Spin size="large" />
        </Flex>
      );
    }

    if (!data || data?.chapters?.length === 0) {
      return (
        <Empty
          description="Belum ada bab yang tersedia untuk mata pelajaran ini."
          style={{ marginTop: "2rem" }}
        />
      );
    }

    // Mengubah data chapter menjadi format yang diterima oleh prop `items` di Collapse
    const chapterItems = data.chapters.map((chapter) => ({
      key: chapter.id,
      label: <Text strong>{chapter.title}</Text>,
      children: (
        <Flex vertical gap="middle">
          <Tag>Guru: {chapter.teacher_name}</Tag>
          {chapter.contents.map((content) => (
            <Card
              key={content.id}
              title={content.title}
              size="small"
              // [FIX] Mengganti prop `bordered` yang deprecated dengan `variant`
              variant="bordered"
            >
              <Paragraph>{content.target}</Paragraph>
              {content.files && content.files.length > 0 && (
                <List
                  size="small"
                  header={<Text strong>Materi / Lampiran</Text>}
                  bordered
                  dataSource={content.files}
                  renderItem={(file) => (
                    <List.Item>
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href={file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.title}
                      </Button>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          ))}
        </Flex>
      ),
    }));

    // [FIX] Menggunakan prop `items` daripada merender <Panel> sebagai children
    return <Collapse accordion items={chapterItems} />;
  };

  return (
    <MainLayout
      title={`Bab Mata Pelajaran ${name?.replace(/-/g, " ")}`}
      levels={["student"]}
    >
      <Flex vertical gap={"large"}>
        <Space>
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
          />
          <Title
            style={{ margin: 0 }}
            level={5}
          >{`Bab Mata Pelajaran ${name?.replace(/-/g, " ")}`}</Title>
        </Space>

        {renderContent()}
      </Flex>
    </MainLayout>
  );
};

export default ChaptersStudentView;
