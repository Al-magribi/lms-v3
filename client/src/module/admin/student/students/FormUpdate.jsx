import { Form, Input, Modal, Select, message } from "antd"; // Ditambahkan Select dan message
import React from "react";
import { useGetClassQuery } from "../../../../service/api/main/ApiClass";
import { useUpdateStudentMutation } from "../../../../service/api/main/ApiStudent";

const FormUpdate = ({ title, open, onClose, student }) => {
  const [form] = Form.useForm();

  // Ubah nama variabel agar tidak konflik
  const { data: classData, isLoading: isClassLoading } = useGetClassQuery({
    page: "",
    limit: "",
    search: "",
  });

  // Dapatkan isLoading dari mutasi dan ubah namanya
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  // Data kelas (dari gambar Anda) sekarang ada di 'classData'
  // console.log(classData);

  const handleSubmit = async (values) => {
    try {
      // Gabungkan ID siswa (dari prop) dengan nilai form
      const payload = {
        id: student.id,
        ...values,
      };

      // Panggil mutasi
      await updateStudent(payload).unwrap();

      message.success("Data siswa berhasil diperbarui");
      onClose(); // Tutup modal jika berhasil
    } catch (error) {
      console.error("Gagal memperbarui siswa:", error);
      message.error(error.data?.message || "Gagal memperbarui siswa");
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      destroyOnHidden
      confirmLoading={isUpdating} // Tambahkan confirmLoading
    >
      {/* Gunakan initialValues untuk mengisi form secara otomatis.
        Prop 'destroyOnHidden' akan memastikan ini di-reset setiap kali modal dibuka.
      */}
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          name: student?.name,
          nis: student?.nis,
          gender: student?.gender,
          classid: student?.classid,
        }}
      >
        <Form.Item
          name={"name"}
          label="Nama Lengkap"
          rules={[{ required: true, message: "Wajid diisi" }]}
        >
          <Input placeholder="Nama Lengkap" />
        </Form.Item>

        {/* BIDANG BARU: NIS */}
        <Form.Item
          name={"nis"}
          label="NIS"
          rules={[{ required: true, message: "Wajid diisi" }]}
        >
          <Input placeholder="Nomor Induk Siswa" />
        </Form.Item>

        {/* BIDANG BARU: Jenis Kelamin */}
        <Form.Item
          name={"gender"}
          label="Jenis Kelamin"
          rules={[{ required: true, message: "Wajid diisi" }]}
        >
          <Select placeholder="Pilih Jenis Kelamin">
            <Select.Option value="L">Laki-laki</Select.Option>
            <Select.Option value="P">Perempuan</Select.Option>
          </Select>
        </Form.Item>

        {/* BIDANG BARU: Kelas */}
        <Form.Item
          name={"classid"}
          label="Kelas"
          rules={[{ required: true, message: "Wajid diisi" }]}
        >
          <Select
            placeholder="Pilih Kelas"
            loading={isClassLoading} // Tampilkan loading saat mengambil data kelas
            options={classData?.map((cls) => ({
              // Map data kelas ke options
              value: cls.id,
              label: cls.name,
            }))}
            showSearch // Opsional: jika daftar kelas panjang
            optionFilterProp="label" // Opsional: untuk memfilter berdasarkan 'label' (nama kelas)
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormUpdate;
