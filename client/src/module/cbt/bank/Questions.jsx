import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Space,
  Typography,
  Alert,
  Divider,
  Tag,
  Popconfirm,
  Skeleton,
  Row,
  Col,
  message,
  Pagination,
  Empty,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Add from "../../../components/buttons/Add";
import FormQues from "./FormQues";
import {
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
} from "../../../service/api/cbt/ApiBank";
import Upload from "../../../components/buttons/Upload";
import FormUpload from "./FormUpload";

const createMarkup = (html) => {
  return { __html: html || "" };
};

const questionTypeMap = {
  1: { label: "Pilihan Ganda", color: "blue" },
  2: { label: "Esai", color: "purple" },
};

const Questions = ({ subject, bankid, name }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const { data, isLoading, error } = useGetQuestionsQuery({
    page,
    limit,
    search,
    bankid,
  });
  const [
    deleteQuestion,
    { data: delMessage, isLoading: delLoading, isSuccess, error: delError },
  ] = useDeleteQuestionMutation();

  const handleOpenForm = (question = null) => {
    setEditingQuestion(question);
    setOpen(true);
  };

  const handleCloseForm = () => {
    setEditingQuestion(null);
    setOpen(false);
  };

  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setLimit(newPageSize);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMessage.message);
    }

    if (delError) {
      message.error(delError.data.message);
    }
  }, [delMessage, isSuccess, delError]);

  const renderQuestionList = () => {
    if (error) {
      return (
        <Alert
          type='warning'
          showIcon
          message='Soal Belum Tersedia'
          description={
            error
              ? error.data?.message || "Gagal memuat soal."
              : "Silakan unggah atau buat soal terlebih dahulu."
          }
        />
      );
    }

    // Success State
    return data?.questions.map((item, index) => {
      const qType = questionTypeMap[item.qtype] || {
        label: "Tipe Tidak Dikenal",
        color: "default",
      };
      const options = [
        { key: "A", text: item.a },
        { key: "B", text: item.b },
        { key: "C", text: item.c },
        { key: "D", text: item.d },
        { key: "E", text: item.e },
      ];

      return (
        <Card
          key={item.id}
          loading={isLoading || delLoading}
          title={
            <Flex vertical>
              <Typography.Text>
                {`Pertanyaan ${(page - 1) * limit + index + 1}`}
              </Typography.Text>
              <Space size={"small"}>
                <Tag color={qType.color}>{qType.label}</Tag>
                <Tag>
                  <strong>{item.poin || 0}</strong> Poin
                </Tag>
              </Space>
            </Flex>
          }
          extra={
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleOpenForm(item)}
              >
                Ubah
              </Button>
              <Popconfirm
                title='Hapus Soal'
                description='Apakah Anda yakin ingin menghapus soal ini?'
                onConfirm={() => deleteQuestion(item.id)}
                okText='Ya, Hapus'
                cancelText='Batal'
              >
                <Button danger icon={<DeleteOutlined />}>
                  Hapus
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          <div
            style={{ maxWidth: "100%", overflow: "auto" }}
            dangerouslySetInnerHTML={createMarkup(item.question)}
          />

          {item.qtype === 1 && (
            <>
              <Divider orientation='left' plain>
                Opsi Jawaban
              </Divider>
              {/* -- UI OPSI JAWABAN YANG DIPERBAIKI DIMULAI DI SINI -- */}
              <Row gutter={[16, 16]}>
                {options.map(
                  (opt) =>
                    // Menggunakan logika pengecekan yang lebih kuat
                    opt.text &&
                    opt.text.trim() !== "" && (
                      <Col key={opt.key} xs={24} sm={24} md={12}>
                        <Flex
                          align='start'
                          gap='small'
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border:
                              item.qkey === opt.key
                                ? "1px solid #52c41a"
                                : "1px solid #d9d9d9",
                            background:
                              item.qkey === opt.key ? "#f6ffed" : "transparent",
                            width: "100%",
                            height: "100%", // Memastikan tinggi kolom sama
                          }}
                        >
                          <Tag>{opt.key}</Tag>
                          <div
                            style={{ flex: 1 }}
                            dangerouslySetInnerHTML={createMarkup(opt.text)}
                          />
                          {item.qkey === opt.key && (
                            <CheckCircleFilled
                              style={{
                                color: "#52c41a",
                                fontSize: "16px",
                                marginTop: "2px",
                              }}
                            />
                          )}
                        </Flex>
                      </Col>
                    )
                )}
              </Row>
              {/* -- UI OPSI JAWABAN BERAKHIR DI SINI -- */}
            </>
          )}
        </Card>
      );
    });
  };

  return (
    <Flex vertical gap='large'>
      <Flex align='center' justify='space-between'>
        <Space>
          <Button
            shape='circle'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/computer-based-test")}
          />
          <div>
            <Typography.Title style={{ margin: 0 }} level={4}>
              Bank Soal: {name}
            </Typography.Title>
            <Typography.Text type='secondary'>{subject}</Typography.Text>
          </div>
        </Space>

        <Space>
          <Upload onClick={() => setOpenUpload(true)} />
          <Add onClick={() => handleOpenForm(null)} />
        </Space>
      </Flex>

      {data?.questions.length === 0 ? (
        <Empty description='Data pertanyaan belum tersedia' />
      ) : (
        <Spin tip='Memuat data...' spinning={isLoading || delLoading}>
          <Flex vertical gap='large'>
            {renderQuestionList()}

            <Pagination
              size='small'
              align='center'
              total={data?.totalData}
              pageSize={limit}
              current={page}
              onChange={handlePaginationChange}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} dari ${total}`
              }
            />
          </Flex>
        </Spin>
      )}

      {/* Question List */}

      <FormQues
        title={editingQuestion ? "Ubah Soal" : "Tambah Soal"}
        open={open}
        onClose={handleCloseForm}
        bankid={bankid}
        ques={editingQuestion} // Pass question data to form for editing
      />

      <FormUpload
        title={`Upload pertanyaan ${name?.replace(/-/g, " ")}`}
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        bankid={bankid}
      />
    </Flex>
  );
};

export default Questions;
