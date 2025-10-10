import {
  Collapse,
  List,
  Typography,
  Empty,
  Button,
  Flex,
  Tooltip,
  Space,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  PaperClipOutlined,
  YoutubeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileAddOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import FormContent from "./FormContent";
import { useEffect, useState } from "react";
import FormFile from "./FormFile";
import {
  useDeleteContentMutation,
  useDeleteFileMutation,
} from "../../../../service/api/lms/ApiChapter";
import FormVideo from "./FormVideo";
import VideoPlayer from "./VideoPlayer";

const { Panel } = Collapse;
const { Text, Paragraph, Title } = Typography;

const ContentList = ({ contents, chapterId }) => {
  const [deleteFile, { isSuccess, isLoading, data, error, reset }] =
    useDeleteFileMutation();
  const [deleteContent] = useDeleteContentMutation();

  const [openContent, setOpenContent] = useState(false);
  const [content, setContent] = useState("");
  const [contentid, setContentid] = useState("");

  const [openFile, setOpenFile] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);

  const [playVideo, setPlayVideo] = useState(false);
  const [video, setVideo] = useState("");

  // Content Function
  const handleEditContent = (content) => {
    setContent(content);
    setOpenContent(true);
  };

  const handleCloseContent = () => {
    setContent("");
    setOpenContent(false);
  };

  const handleDeleteContent = (id) => {
    deleteContent(id);
  };

  // File Function
  const handleAddFile = (contentid) => {
    setContentid(contentid);
    setOpenFile(true);
  };

  const handleCloseAddFile = () => {
    setContentid("");
    setOpenFile(false);
  };

  const handleDeleteFile = (id) => {
    deleteFile(id);
  };

  // Video Function
  const handleAddVideo = (contentid) => {
    setContentid(contentid);
    setOpenVideo(true);
  };

  const handleCloseVideo = () => {
    setContentid("");
    setOpenVideo(false);
  };

  const handlePlayVideo = (video) => {
    setVideo(video);
    setPlayVideo(true);
  };

  const handleClosePlay = () => {
    setVideo("");
    setPlayVideo(false);
  };

  // Effect
  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [data, isSuccess, error]);

  console.log(contents);

  if (!contents || contents.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Belum ada materi untuk bab ini."
      />
    );
  }

  const collapseItems = contents.map((content, index) => ({
    key: content.content_id,
    label: (
      <Title level={5} style={{ margin: 0 }}>
        {content.content_title}
      </Title>
    ),
    extra: (
      <Space onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Edit Materi">
          <Button
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEditContent(content)}
          />
        </Tooltip>
        <Popconfirm
          title="Hapus materi ini?"
          description="Semua file dan video di dalamnya akan ikut terhapus."
          onConfirm={() => handleDeleteContent(content.content_id)}
          okText="Ya, Hapus"
          cancelText="Batal"
        >
          <Tooltip title="Hapus Materi">
            <Button danger shape="circle" icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
    children: (
      <Flex vertical gap="large">
        {/* Bagian Tujuan Pembelajaran */}
        <div>
          <Text strong>Tujuan Pembelajaran:</Text>
          <Paragraph>
            <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
              {content.content_target || "-"}
            </Text>
          </Paragraph>
        </div>

        {/* Bagian File Materi */}
        <div>
          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
            <Text strong>File Materi:</Text>
            <Tooltip title="Tambah File Baru">
              <Button
                icon={<FileAddOutlined />}
                onClick={() => handleAddFile(content.content_id)}
              >
                Tambah File
              </Button>
            </Tooltip>
          </Flex>
          <List
            itemLayout="horizontal"
            dataSource={content.files}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key={`delete-${file.id}`}
                    title="Hapus file ini?"
                    onConfirm={() => handleDeleteFile(file.id)}
                    okText="Ya"
                    cancelText="Tidak"
                  >
                    <Tooltip title="Hapus File">
                      <Button
                        type="text"
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<PaperClipOutlined />}
                  title={
                    <a
                      href={file.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.title}
                    </a>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Bagian Video Materi (dengan tombol tambah) */}
        <div>
          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
            <Text strong>Video Materi:</Text>
            <Tooltip title="Tambah Video Baru">
              <Button
                icon={<VideoCameraAddOutlined />}
                onClick={() => handleAddVideo(content.content_id)}
              >
                Tambah Video
              </Button>
            </Tooltip>
          </Flex>
          <List
            dataSource={content.videos}
            renderItem={(video) => (
              <List.Item
                actions={[
                  <Button
                    key={`Play-${video.id}`}
                    shape="circle"
                    icon={<VideoCameraAddOutlined />}
                    onClick={() => handlePlayVideo(video)}
                  />,
                  <Popconfirm
                    key={`delete-${video.id}`}
                    title="Hapus file ini?"
                    onConfirm={() => handleDeleteFile(video.id)}
                    okText="Ya"
                    cancelText="Tidak"
                  >
                    <Tooltip title="Hapus File">
                      <Button
                        type="text"
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<YoutubeOutlined style={{ color: "#CD201F" }} />}
                  title={<Text>{video.title}</Text>}
                />
              </List.Item>
            )}
          />
        </div>
      </Flex>
    ),
  }));

  return (
    <>
      <Collapse accordion items={collapseItems} />

      <FormContent
        title={`Edit Materi ${content.content_title}`}
        open={openContent}
        content={content}
        onClose={handleCloseContent}
      />

      <FormFile
        title="Simpan File Baru"
        open={openFile}
        onClose={handleCloseAddFile}
        contentid={contentid}
      />

      <FormVideo
        title="Simpan YouTube Video"
        open={openVideo}
        onClose={handleCloseVideo}
        contentid={contentid}
      />

      <VideoPlayer open={playVideo} onClose={handleClosePlay} video={video} />
    </>
  );
};

export default ContentList;
