import { Modal, message, Form, Input, Upload, Button, Select } from "antd";
import {
  useAddSubjectMutation,
  useGetCategoriesQuery,
} from "../../../../service/api/main/ApiSubject";
// PERBAIKAN 1: Impor hook yang dibutuhkan dari React
import { useEffect, useState, useMemo } from "react";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";

const page = "";
const limit = "";
const search = "";

const FormSubject = ({ open, onClose, title, subject }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  // PERBAIKAN 2: State untuk menyimpan ID kategori yang dipilih
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [addSubject, { data, isLoading, isSuccess, error, reset }] =
    useAddSubjectMutation();

  const { data: categories, isLoading: catsLoading } = useGetCategoriesQuery({
    page,
    limit,
    search,
  });

  // --- PERBAIKAN 3: Logika Pengambilan Data Rumpun (Branch) ---
  // Hapus useGetBranchesQuery yang tidak diperlukan

  // Opsi untuk dropdown Kategori
  const catsOpts =
    categories?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  // Opsi untuk dropdown Rumpun, dihitung ulang saat kategori atau data kategori berubah
  const branchesOpts = useMemo(() => {
    if (!selectedCategoryId || !categories) {
      return []; // Kembalikan array kosong jika tidak ada kategori dipilih
    }
    // Cari kategori yang cocok dengan ID yang dipilih
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    // Jika kategori ditemukan dan memiliki branches, map menjadi opsi dropdown
    if (selectedCategory && selectedCategory.branches) {
      return selectedCategory.branches.map((branch) => ({
        value: branch.id,
        label: branch.name,
      }));
    }
    return []; // Kembalikan array kosong jika tidak ditemukan
  }, [selectedCategoryId, categories]);
  // -----------------------------------------------------------------

  useEffect(() => {
    if (open) {
      // Reset semua state saat modal dibuka
      form.resetFields();
      setFile(null);
      setImageUrl(null);
      setSelectedCategoryId(null);

      if (subject) {
        // Jika mode edit, set state dan nilai form
        setSelectedCategoryId(subject.category_id); // Set ID kategori terpilih
        form.setFieldsValue({
          name: subject.name,
          categoryid: {
            value: subject.category_id,
            label: subject.category_name,
          },
          branchid: { value: subject.branch_id, label: subject.branch_name },
        });
        setImageUrl(subject.cover || null);
      }
    }
  }, [subject, form, open]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      onClose();
      reset();
    }
    if (error) {
      message.error(error?.data?.message || "Terjadi kesalahan");
      reset();
    }
  }, [isSuccess, error, data, onClose, reset]);

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.categoryid) {
      formData.append("categoryid", values.categoryid.value);
    }
    if (values.branchid) {
      formData.append("branchid", values.branchid.value);
    }
    if (file) {
      formData.append("cover", file);
    }
    if (subject) {
      formData.append("id", subject.id);
    }
    addSubject(formData);
  };

  // PERBAIKAN 4: Fungsi untuk menangani perubahan pada dropdown Kategori
  const handleCategoryChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedCategoryId(selectedOption.value);
    } else {
      setSelectedCategoryId(null);
    }
    // Reset pilihan Rumpun setiap kali Kategori berubah
    form.setFieldsValue({ branchid: null });
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Anda hanya bisa mengunggah file gambar!");
      } else {
        setFile(file);
        setImageUrl(URL.createObjectURL(file));
      }
      return false;
    },
    onRemove: () => {
      setFile(null);
      setImageUrl(subject ? subject.cover : null);
    },
    showUploadList: false,
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      destroyOnHidden
      okText="Simpan"
      cancelText="Tutup"
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="categoryid"
          label="Pilih Kategori"
          rules={[{ required: true, message: "Kategori wajib dipilih" }]}
        >
          <Select
            allowClear
            placeholder="Pilih Kategori"
            options={catsOpts}
            loading={catsLoading}
            labelInValue
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            // Tambahkan onChange handler
            onChange={handleCategoryChange}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            virtual={false}
          />
        </Form.Item>

        <Form.Item name="branchid" label="Pilih Rumpun">
          <Select
            allowClear
            placeholder="Pilih Rumpun"
            // Gunakan options yang sudah dinamis
            options={branchesOpts}
            // PERBAIKAN 5: Nonaktifkan jika belum memilih kategori
            disabled={!selectedCategoryId}
            // Loading mengikuti loading kategori
            loading={catsLoading}
            labelInValue
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            virtual={false}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Nama Pelajaran"
          rules={[
            { required: true, message: "Nama pelajaran tidak boleh kosong!" },
          ]}
        >
          <Input placeholder="Contoh: Matematika" />
        </Form.Item>

        <Form.Item label="Cover Gambar">
          <Upload.Dragger {...uploadProps}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "180px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Klik atau seret file ke area ini
                </p>
              </>
            )}
          </Upload.Dragger>
          {imageUrl && (
            <Button
              type="text"
              danger
              onClick={uploadProps.onRemove}
              style={{ marginTop: 8, padding: 0 }}
            >
              Hapus atau Ganti Gambar
            </Button>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormSubject;
