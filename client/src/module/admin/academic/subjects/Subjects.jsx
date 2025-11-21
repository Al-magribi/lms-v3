import { useState, useEffect } from "react";
import {
  useGetSubjectQuery,
  useDeleteSubjectMutation,
} from "../../../../service/api/main/ApiSubject";
import {
  Card,
  Col,
  Empty,
  Flex,
  Input,
  Modal,
  Pagination,
  Row,
  Typography,
  message,
  Skeleton,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  // --- IKON BARU ---
  TagOutlined,
  BranchesOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Add from "../../../../components/buttons/Add";
import FormSubject from "./FormSubject";
import Teachers from "./Teachers";
import FormWeight from "./FormWeight";

const { Meta } = Card;
const { confirm } = Modal;
const { Text } = Typography;

const Subjects = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [openTeacher, setOpenTeacher] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [subjectName, setSubjectName] = useState("");

  const [openWeight, setOpenWeight] = useState(false);

  const { data, isLoading } = useGetSubjectQuery({
    page,
    limit,
    search,
  });

  const [deleteSubject] = useDeleteSubjectMutation();

  const handleEdit = (data) => {
    setSelectedSubject(data);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    confirm({
      title: "Konfirmasi Hapus Data",
      content: "Apakah Anda yakin akan menghapus data ini?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        try {
          await deleteSubject(id).unwrap();
          message.success("Pelajaran berhasil dihapus");
        } catch (error) {
          message.error("Gagal menghapus pelajaran");
        }
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setSelectedSubject(null);
  };

  const handlePaginationChange = (page, pageSize) => {
    setPage(page);
    setLimit(pageSize);
  };

  const handleTeachersOpen = (data, name) => {
    setTeachers(data);
    setSubjectName(name);
    setOpenTeacher(true);
  };

  const handleTeacherClose = () => {
    setTeachers([]);
    setSubjectName("");
    setOpenTeacher(false);
  };

  const handleWeighting = (data) => {
    setOpenWeight(true);
    setSelectedSubject(data);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const renderSkeletons = () => (
    <Row gutter={[16, 16]}>
      {Array.from({ length: limit }).map((_, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Skeleton active avatar={{ size: "large" }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Flex vertical gap="large">
      <Flex justify="space-between" align="center">
        <Flex vertical gap={4}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Manajemen Pelajaran
          </Typography.Title>
          <Input.Search
            placeholder="Cari pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
        </Flex>
        <Add onClick={() => setOpen(true)} />
      </Flex>

      {isLoading ? (
        renderSkeletons()
      ) : data?.subjects && data.subjects.length > 0 ? (
        <Flex vertical gap="large">
          <Row gutter={[16, 24]}>
            {data.subjects.map((item) => (
              <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={item.name}
                      src={item.cover || "/logo.png"}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                  actions={[
                    <SettingOutlined
                      key="weighting"
                      onClick={() => handleWeighting(item)}
                    />,
                    <UserOutlined
                      key="teachers"
                      onClick={() =>
                        handleTeachersOpen(item.teachers, item.name)
                      }
                    />,
                    <EditOutlined
                      key="edit"
                      onClick={() => handleEdit(item)}
                    />,
                    <DeleteOutlined
                      key="delete"
                      onClick={() => handleDelete(item.id)}
                    />,
                  ]}
                >
                  {/* --- BLOK META YANG DIPERBARUI --- */}
                  <Meta
                    title={
                      <Typography.Title level={5} ellipsis={{ rows: 2 }}>
                        {item.name}
                      </Typography.Title>
                    }
                    description={
                      <Flex vertical gap={8} style={{ marginTop: 8 }}>
                        <Flex align="center" gap={6}>
                          <TagOutlined style={{ color: "#1890ff" }} />
                          <Text type="secondary">Kategori:</Text>
                          <Text strong>{item.category_name || "-"}</Text>
                        </Flex>
                        <Flex align="center" gap={6}>
                          <BranchesOutlined style={{ color: "#52c41a" }} />
                          <Text type="secondary">Rumpun:</Text>
                          <Text strong>{item.branch_name || "-"}</Text>
                        </Flex>
                        <Flex align="center" gap={6}>
                          <TeamOutlined style={{ color: "#faad14" }} />
                          <Text type="secondary">Pengajar:</Text>
                          <Text strong>{item.teachers?.length || 0} Guru</Text>
                        </Flex>
                      </Flex>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Pagination
            align="center"
            current={page}
            pageSize={limit}
            total={data?.totalData}
            onChange={handlePaginationChange}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} data`
            }
          />
        </Flex>
      ) : (
        <Flex justify="center" style={{ padding: "50px 0" }}>
          <Empty description="Tidak ada pelajaran yang ditemukan." />
        </Flex>
      )}

      <FormSubject
        title={isEdit ? "Edit Pelajaran" : "Tambah Pelajaran"}
        open={open}
        onClose={handleClose}
        subject={selectedSubject}
      />
      <Teachers
        open={openTeacher}
        onClose={handleTeacherClose}
        teachers={teachers}
        title={subjectName}
      />

      <FormWeight
        title={`Pembobotan Nilai Akhir ${selectedSubject?.name}`}
        open={openWeight}
        onClose={() => setOpenWeight(false)}
        subject={selectedSubject}
      />
    </Flex>
  );
};

export default Subjects;
