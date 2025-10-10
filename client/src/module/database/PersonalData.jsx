import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Select,
  DatePicker,
  InputNumber,
  message,
  Typography,
  Space,
  Spin,
} from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import {
  useGetProvinceQuery,
  useGetCityQuery,
  useGetDistrictQuery,
  useGetVillageQuery,
} from "../../service/api/database/ApiArea";
import {
  useAddStudentDataMutation,
  useGetPeriodeQuery,
  useGetHomebaseQuery,
} from "../../service/api/database/ApiDatabase";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const { Title } = Typography;

const PersonalData = ({ studentData, onRefetch, userid }) => {
  const { user } = useSelector((state) => state.auth);
  // Jika tidak ada studentData.userid, anggap ini form baru dan langsung masuk mode edit
  const [isEditing, setIsEditing] = useState(!studentData?.userid);
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState(
    studentData?.provinceid
  );
  const [selectedCity, setSelectedCity] = useState(studentData?.cityid);
  const [selectedDistrict, setSelectedDistrict] = useState(
    studentData?.districtid
  );

  const { data: periodeData, isLoading: isPeriodeLoading } = useGetPeriodeQuery(
    user?.homebase_id
  );

  const { data: homebaseData, isLoading: isHomebaseLoading } =
    useGetHomebaseQuery();

  const { data: provinces, isLoading: isProvinceLoading } =
    useGetProvinceQuery();

  const { data: cities, isLoading: isCityLoading } = useGetCityQuery(
    selectedProvince,
    { skip: !selectedProvince }
  );
  const { data: districts, isLoading: isDistrictLoading } = useGetDistrictQuery(
    selectedCity,
    { skip: !selectedCity }
  );
  const { data: villages, isLoading: isVillageLoading } = useGetVillageQuery(
    selectedDistrict,
    { skip: !selectedDistrict }
  );

  const [addStudentData, { isLoading: isUpdating }] =
    useAddStudentDataMutation();

  useEffect(() => {
    if (studentData) {
      const initialValues = {
        ...studentData,
        entryid: studentData.entryid?.toString(),
        homebaseid: studentData.homebaseid?.toString(),
        provinceid: studentData.provinceid?.toString(),
        cityid: studentData.cityid?.toString(),
        districtid: studentData.districtid?.toString(),
        villageid: studentData.villageid?.toString().trim(),
        birth_date: studentData.birth_date
          ? dayjs(studentData.birth_date)
          : null,
      };
      form.setFieldsValue(initialValues);
      setSelectedProvince(studentData.provinceid);
      setSelectedCity(studentData.cityid);
      setSelectedDistrict(studentData.districtid);
    }
  }, [studentData, form]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    if (studentData) {
      form.resetFields();
      const initialValues = {
        ...studentData,
        entryid: studentData.entryid?.toString(),
        homebaseid: studentData.homebaseid?.toString(),
        provinceid: studentData.provinceid?.toString(),
        cityid: studentData.cityid?.toString(),
        districtid: studentData.districtid?.toString(),
        villageid: studentData.villageid?.toString().trim(),
        birth_date: studentData.birth_date
          ? dayjs(studentData.birth_date)
          : null,
      };
      form.setFieldsValue(initialValues);
    }
  };

  const onFinish = async (values) => {
    const selectedPeriode = periodeData?.find(
      (p) => p.id.toString() === values.entryid
    );
    const selectedHomebase = homebaseData?.find(
      (h) => h.id.toString() === values.homebaseid
    );
    const selectedProvince = provinces?.find(
      (p) => p.id.toString() === values.provinceid
    );
    const selectedCity = cities?.find((c) => c.id.toString() === values.cityid);
    const selectedDistrict = districts?.find(
      (d) => d.id.toString() === values.districtid
    );
    const selectedVillage = villages?.find(
      (v) => v.id.toString().trim() === values.villageid
    );

    const payload = {
      ...values,
      userid: userid, // Gunakan userid dari props
      entry_name: selectedPeriode ? selectedPeriode.name : "",
      homebase_name: selectedHomebase ? selectedHomebase.name : "",
      province_name: selectedProvince ? selectedProvince.name : "",
      city_name: selectedCity ? selectedCity.name : "",
      district_name: selectedDistrict ? selectedDistrict.name : "",
      village_name: selectedVillage ? selectedVillage.name : "",
      birth_date: values.birth_date
        ? dayjs(values.birth_date).format("YYYY-MM-DD")
        : null,
    };

    try {
      await addStudentData(payload).unwrap();
      message.success("Data siswa berhasil disimpan!");
      setIsEditing(false);
      if (onRefetch) onRefetch();
    } catch (error) {
      message.error(error.data?.message || "Gagal menyimpan data.");
    }
  };

  const handleValuesChange = (changedValues) => {
    if (changedValues.provinceid) {
      setSelectedProvince(changedValues.provinceid);
      setSelectedCity(null);
      setSelectedDistrict(null);
      form.setFieldsValue({ cityid: null, districtid: null, villageid: null });
    }
    if (changedValues.cityid) {
      setSelectedCity(changedValues.cityid);
      setSelectedDistrict(null);
      form.setFieldsValue({ districtid: null, villageid: null });
    }
    if (changedValues.districtid) {
      setSelectedDistrict(changedValues.districtid);
      form.setFieldsValue({ villageid: null });
    }
  };

  const mapToOptions = (data) =>
    data?.map((item) => ({
      value: item.id.toString().trim(),
      label: item.name,
    })) || [];

  const renderViewMode = () => (
    <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} layout="vertical">
      <Descriptions.Item label="Tahun Pelajaran">
        {studentData?.entry_name}
      </Descriptions.Item>
      <Descriptions.Item label="Satuan Pendidikan">
        {studentData?.homebase_name}
      </Descriptions.Item>
      <Descriptions.Item label="Nama Lengkap">
        {studentData?.name}
      </Descriptions.Item>
      <Descriptions.Item label="Jenis Kelamin">
        {studentData?.gender === "P" ? "Perempuan" : "Laki-laki"}
      </Descriptions.Item>
      <Descriptions.Item label="NIS">{studentData?.nis}</Descriptions.Item>
      <Descriptions.Item label="NISN">{studentData?.nisn}</Descriptions.Item>
      <Descriptions.Item label="Tempat & Tanggal Lahir">{`${
        studentData?.birth_place || "-"
      }, ${
        studentData?.birth_date
          ? dayjs(studentData?.birth_date).format("DD MMMM YYYY")
          : "-"
      }`}</Descriptions.Item>
      <Descriptions.Item label="Anak Ke / Dari Bersaudara">{`${
        studentData?.order_number || "-"
      } / ${studentData?.siblings || "-"} bersaudara`}</Descriptions.Item>
      <Descriptions.Item label="Tinggi / Berat / Kepala">{`${
        studentData?.height || "-"
      } cm / ${studentData?.weight || "-"} kg / ${
        studentData?.head || "-"
      } cm`}</Descriptions.Item>
      <Descriptions.Item label="Alamat" span={2}>{`${
        studentData?.address || ""
      }, ${studentData?.village_name || ""}, ${
        studentData?.district_name || ""
      }, ${studentData?.city_name || ""}, ${studentData?.province_name || ""} ${
        studentData?.postal_code || ""
      }`}</Descriptions.Item>
    </Descriptions>
  );

  const renderEditMode = () => (
    <Row gutter={[16, 0]}>
      <Col xs={24} md={12}>
        <Form.Item
          name="entryid"
          label="Tahun Pelajaran"
          rules={[{ required: true }]}
        >
          <Select
            loading={isPeriodeLoading}
            options={mapToOptions(periodeData)}
            placeholder="Pilih Tahun Pelajaran"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="homebaseid"
          label="Satuan Pendidikan"
          rules={[{ required: true }]}
        >
          <Select
            loading={isHomebaseLoading}
            options={mapToOptions(homebaseData)}
            placeholder="Pilih Satuan Pendidikan"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="name"
          label="Nama Lengkap"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="gender"
          label="Jenis Kelamin"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "L", label: "Laki-laki" },
              { value: "P", label: "Perempuan" },
            ]}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="nis" label="NIS">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="nisn" label="NISN">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="birth_place" label="Tempat Lahir">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="birth_date" label="Tanggal Lahir">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={8}>
        <Form.Item name="height" label="Tinggi (cm)">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={8}>
        <Form.Item name="weight" label="Berat (kg)">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="head" label="Kepala (cm)">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={12}>
        <Form.Item name="order_number" label="Anak Ke-">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={12}>
        <Form.Item name="siblings" label="Jumlah Saudara">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="provinceid"
          label="Provinsi"
          rules={[{ required: true }]}
        >
          <Select
            loading={isProvinceLoading}
            options={mapToOptions(provinces)}
            showSearch
            virtual={false}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="cityid"
          label="Kota/Kabupaten"
          rules={[{ required: true }]}
        >
          <Select
            loading={isCityLoading}
            disabled={!selectedProvince}
            options={mapToOptions(cities)}
            showSearch
            virtual={false}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="districtid"
          label="Kecamatan"
          rules={[{ required: true }]}
        >
          <Select
            loading={isDistrictLoading}
            disabled={!selectedCity}
            options={mapToOptions(districts)}
            showSearch
            virtual={false}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="villageid"
          label="Desa/Kelurahan"
          rules={[{ required: true }]}
        >
          <Select
            loading={isVillageLoading}
            disabled={!selectedDistrict}
            options={mapToOptions(villages)}
            showSearch
            virtual={false}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="postal_code" label="Kode Pos">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24}>
        <Form.Item name="address" label="Alamat Lengkap (Nama Jalan, RT/RW)">
          <Input.TextArea />
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <Spin spinning={isUpdating}>
      <Card
        title={<Title level={5}>Informasi Pribadi Siswa</Title>}
        extra={
          isEditing ? (
            <Space>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={() => form.submit()}
                loading={isUpdating}
              >
                Simpan
              </Button>
              {/* Hanya tampilkan tombol Batal jika ada data awal (mode edit) */}
              {studentData?.userid && (
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Batal
                </Button>
              )}
            </Space>
          ) : (
            <Button icon={<EditOutlined />} type="primary" onClick={handleEdit}>
              Edit
            </Button>
          )
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
        >
          {isEditing ? renderEditMode() : renderViewMode()}
        </Form>
      </Card>
    </Spin>
  );
};

export default PersonalData;
