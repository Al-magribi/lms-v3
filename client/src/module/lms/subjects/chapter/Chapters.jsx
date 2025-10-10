import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Modal,
  Row,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import MainLayout from "../../../../components/layout/MainLayout";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  FileTextOutlined,
  ReadOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Add from "../../../../components/buttons/Add";
import {
  useDeleteChapterMutation,
  useGetChaptersQuery,
} from "../../../../service/api/lms/ApiChapter";
import { useEffect, useState } from "react";
import ContentsList from "../content/ContentList";
import FormChapter from "./FormChapter";
import FormContent from "../content/FormContent";

const createMarkup = (html) => {
  return { __html: html };
};

const { confirm } = Modal;

const Chapters = ({ name, id }) => {
  const navigate = useNavigate();

  const [openContent, setOpenContent] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [chapter, setChapter] = useState("");

  const { data, isLoading } = useGetChaptersQuery(id, { skip: !id });
  const [
    deleteChaper,
    { isLoading: delLoading, isSuccess, error, data: delMessage },
  ] = useDeleteChapterMutation();

  const handleEdit = (item) => {
    setChapter(item);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    confirm({
      title: "Apakah anda yakin akan menghapus bab ini?",
      content: "Semua file akan ikut terhapus permanen",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk() {
        deleteChaper(id);
      },
    });
  };

  const handleAddContent = (chapter) => {
    setChapter(chapter);
    setOpenContent(true);
  };

  const handleBack = () => {
    navigate("/learning-management-system");
  };

  const handleClose = () => {
    setChapter("");
    setIsEdit(false);
    setOpen(false);
  };

  const handleContentClose = () => {
    setChapter("");
    setOpenContent(false);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [delMessage, isSuccess, error]);

  return (
    <MainLayout title={name.replace(/-/g, " ")} levels={["teacher"]}>
      <Flex vertical gap="middle">
        <Flex align="center" justify="space-between">
          <Space>
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            />
            <div>
              <Typography.Title style={{ margin: 0 }} level={5}>
                {`Pelajaran: ${name.replace(/-/g, " ")}`}
              </Typography.Title>
              <Typography.Text type="secondary">Daftar Bab</Typography.Text>
            </div>
          </Space>

          <Add onClick={() => setOpen(true)} />
        </Flex>

        <Row gutter={[16, 16]}>
          {data?.length > 0 ? (
            data?.map((item, index) => (
              <Col key={item.chapter_id} sm={24}>
                <Card
                  hoverable
                  loading={isLoading || delLoading}
                  title={<Tag color="green">{item.chapter_name}</Tag>}
                  actions={[
                    <Tooltip title="Edit Bab">
                      <EditOutlined
                        key="edit"
                        onClick={() => handleEdit(item)}
                      />
                    </Tooltip>,
                    <Tooltip title="Hapus Bab">
                      <DeleteOutlined
                        key="add_content"
                        onClick={() => handleDelete(item.chapter_id)}
                      />
                    </Tooltip>,
                  ]}
                  extra={
                    <Button
                      icon={<FileAddOutlined />}
                      onClick={() => handleAddContent(item)}
                    >
                      Tambah Materi
                    </Button>
                  }
                >
                  <Flex vertical gap="small">
                    <Tabs
                      defaultActiveKey="1"
                      items={[
                        {
                          label: "Capaian",
                          key: "1",
                          children: (
                            <article
                              dangerouslySetInnerHTML={createMarkup(
                                item.target
                              )}
                            />
                          ),
                        },
                        {
                          label: "Materi",
                          key: "2",
                          children: (
                            <ContentsList
                              contents={item.contents}
                              chapterId={item.chapter_id}
                            />
                          ),
                        },
                      ]}
                    />

                    <Typography.Text>
                      <strong>Pengajar:</strong> {item.teacher_name}
                    </Typography.Text>

                    <Space size={[0, 8]} wrap>
                      <strong style={{ marginRight: 5 }}>Kelas: </strong>
                      {item.class?.map((cls) => (
                        <Tag key={cls.id} color="blue">
                          {cls.name}
                        </Tag>
                      ))}
                    </Space>

                    <Space size="middle" wrap style={{ marginTop: 16 }}>
                      <Typography.Text type="secondary">
                        <ReadOutlined /> {item.content} Konten
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        <FileTextOutlined /> {item.file} File
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        <YoutubeOutlined /> {item.video} Video
                      </Typography.Text>
                    </Space>
                  </Flex>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: "center", marginTop: "2rem" }}>
              <Empty
                description={
                  <Typography.Text type="secondary">
                    {`Bab untuk pelajaran ${name.replace(
                      /-/g,
                      " "
                    )} belum tersedia`}
                  </Typography.Text>
                }
              />
            </Col>
          )}
        </Row>
      </Flex>

      <FormChapter
        title={isEdit ? "Perbaiki Bab" : "Tambah Bab baru"}
        open={open}
        onClose={handleClose}
        chapter={chapter}
      />

      <FormContent
        title={`Tambah Materi ${chapter.chapter_name}`}
        open={openContent}
        onClose={handleContentClose}
        chapterid={chapter.chapter_id}
      />
    </MainLayout>
  );
};

export default Chapters;
