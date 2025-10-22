import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  InputNumber,
  Typography,
  Divider,
  message,
  Space,
  Flex,
} from "antd";
import {
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

// Import RTK Query hooks from your service API
import { useGetTypesQuery } from "../../../../service/api/tahfiz/ApiMetric";
import { useGetExaminersQuery } from "../../../../service/api/tahfiz/ApiExaminer";
import { useGetJuzQuery } from "../../../../service/api/tahfiz/ApiQuran";
import {
  useAddscoreMutation,
  useGetCategoriesQuery,
} from "../../../../service/api/tahfiz/ApiScoring";

const { Title, Text } = Typography;
const { Option } = Select;
const page = "";
const limit = "";
const search = "";

const FormMemo = ({ name, userid, onBack }) => {
  // 1. HOOKS AND PARAMS
  const [searchParams] = useSearchParams();
  const periodeId = searchParams.get("periodeId");
  const formattedName = name ? name.replace(/-/g, " ") : "Student";

  // 2. STATE MANAGEMENT
  // Selection States
  const [typeId, setTypeId] = useState(null);
  const [examinerId, setExaminerId] = useState(null);
  const [selectedJuzForBulk, setSelectedJuzForBulk] = useState([]);
  const [selectedJuzForSurah, setSelectedJuzForSurah] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahList, setSurahList] = useState([]);

  // Ayat and Line States
  const [fromAyat, setFromAyat] = useState(null);
  const [toAyat, setToAyat] = useState(null);
  const [fromLine, setFromLine] = useState(null);
  const [toLine, setToLine] = useState(null);

  // Data Table State
  const [memorizedSurahs, setMemorizedSurahs] = useState([]);

  // Scoring State
  const [scores, setScores] = useState({});

  // 3. RTK QUERY API CALLS
  const { data: typesData, isLoading: isLoadingTypes } = useGetTypesQuery({
    page,
    limit,
    search,
  });
  const { data: examinersData, isLoading: isLoadingExaminers } =
    useGetExaminersQuery({ page, limit, search });
  const { data: juzData, isLoading: isLoadingJuz } = useGetJuzQuery({
    page,
    limit,
    search,
  });
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();
  const [addScore, { isLoading: isSaving, isSuccess, isError }] =
    useAddscoreMutation();

  // 4. DATA TRANSFORMATIONS & DERIVED STATE
  const selectedSurahData = surahList.find((s) => s.id === selectedSurah);

  // 5. EVENT HANDLERS
  const handleJuzForSurahChange = (juzId) => {
    const juz = juzData?.find((item) => item.id === juzId);
    setSelectedJuzForSurah(juz);
    setSurahList(juz?.surah || []);
    setSelectedSurah(null);
    setFromAyat(null);
    setToAyat(null);
    setFromLine(null);
    setToLine(null);
  };

  const handleAddSurahBulk = () => {
    if (selectedJuzForBulk.length === 0) {
      message.warning("Please select at least one Juz to add.");
      return;
    }

    const newSurahs = [];
    selectedJuzForBulk.forEach((juzId) => {
      const juz = juzData?.find((item) => item.id === juzId);
      if (juz && juz.surah) {
        juz.surah.forEach((s) => {
          // Avoid duplicates
          if (!memorizedSurahs.some((ms) => ms.fromSurahName === s.surah)) {
            newSurahs.push({
              key: `${juz.id}-${s.surah_id}`,
              juzId: juz.id,
              fromSurah: s.surah_id,
              fromSurahName: s.surah,
              fromAyat: s.from_ayat,
              toAyat: s.to_ayat,
              fromLine: 1,
              toLine: s.lines,
            });
          }
        });
      }
    });

    setMemorizedSurahs((prev) => [...prev, ...newSurahs]);
    setSelectedJuzForBulk([]);
    message.success(`${newSurahs.length} surah(s) added successfully.`);
  };

  const handleAddSingleSurah = () => {
    setMemorizedSurahs((prev) => [
      ...prev,
      {
        key: `${selectedJuzForSurah.id}-${selectedSurahData.surah_id}-${fromAyat}`,
        juzId: selectedJuzForSurah.id,
        fromSurah: selectedSurahData.surah_id,
        fromSurahName: selectedSurahData.surah,
        fromAyat,
        toAyat,
        fromLine,
        toLine,
      },
    ]);

    // Reset fields
    setSelectedSurah(null);
    setFromAyat(null);
    setToAyat(null);
    setFromLine(null);
    setToLine(null);
  };

  const handleDeleteSurah = (key) => {
    setMemorizedSurahs((prev) => prev.filter((item) => item.key !== key));
    message.info("Surah removed.");
  };

  const handleScoreChange = (type, categoryId, indicatorId, value) => {
    setScores((prev) => {
      const newScores = { ...prev };
      if (!newScores[categoryId]) {
        newScores[categoryId] = { category_id: categoryId, indicators: {} };
      }

      if (type === "category") {
        newScores[categoryId].poin = value;
      } else if (type === "indicator") {
        newScores[categoryId].indicators[indicatorId] = {
          indicator_id: indicatorId,
          poin: value,
        };
      }
      return newScores;
    });
  };

  const handleSave = async () => {
    // Validation
    if (!typeId || !examinerId || memorizedSurahs.length === 0) {
      message.error(
        "Assessment Type, Examiner, and at least one Surah are required."
      );
      return;
    }

    // --- FIX STARTS HERE ---

    // Pastikan semua nilai poin (untuk kategori dan indikator) yang dikirim adalah angka.
    // Jika ada input skor yang kosong (null/undefined), ubah menjadi 0.
    const categoriesPayload = Object.values(scores).map((cat) => ({
      category_id: cat.category_id,
      poin: cat.poin ?? 0, // Mengubah null/undefined menjadi 0
      indicators: Object.values(cat.indicators).map((indicator) => ({
        ...indicator,
        poin: indicator.poin ?? 0, // Mengubah null/undefined menjadi 0 untuk setiap indikator
      })),
    }));

    // --- FIX ENDS HERE ---

    const submissionData = {
      userid: parseInt(userid),
      periodeId: parseInt(periodeId),
      surahs: memorizedSurahs.map(
        ({ fromSurah, fromAyat, toAyat, fromLine, toLine, juzId }) => ({
          fromSurah,
          fromAyat,
          toAyat,
          fromLine,
          toLine,
          juzId,
        })
      ),
      examiner: parseInt(examinerId),
      poin: {
        type_id: parseInt(typeId),
        categories: categoriesPayload,
      },
    };

    try {
      const response = await addScore(submissionData).unwrap();
      message.success(response.message || "Scores saved successfully!");
    } catch (error) {
      message.error(error.data?.message || "Failed to save scores.");
    }
  };

  // 6. USEEFFECT
  useEffect(() => {
    if (isSuccess) {
      // Reset all states
      setTypeId(null);
      setExaminerId(null);
      setSelectedJuzForBulk([]);
      setSelectedJuzForSurah(null);
      setSelectedSurah(null);
      setSurahList([]);
      setFromAyat(null);
      setToAyat(null);
      setFromLine(null);
      setToLine(null);
      setMemorizedSurahs([]);
      setScores({});
    }
  }, [isSuccess]);

  // 7. TABLE COLUMNS DEFINITION
  const listSurahColumns = [
    {
      title: "Surah",
      dataIndex: "fromSurahName",
      key: "surah",
      align: "center",
    },
    {
      title: "From Ayat",
      dataIndex: "fromAyat",
      key: "fromAyat",
      align: "center",
    },
    { title: "To Ayat", dataIndex: "toAyat", key: "toAyat", align: "center" },
    {
      title: "From Line",
      dataIndex: "fromLine",
      key: "fromLine",
      align: "center",
    },
    { title: "To Line", dataIndex: "toLine", key: "toLine", align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteSurah(record.key)}
        />
      ),
    },
  ];

  const categoryColumns = [
    { title: "Category", dataIndex: "name", key: "category", width: "20%" },
    {
      title: "Indicator",
      key: "indicator",
      width: "60%",
      render: (_, record) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          {record.indicators &&
          record.indicators.filter((indi) => indi !== null).length > 0 ? (
            record.indicators
              .filter((indi) => indi !== null)
              .map((indicator) => (
                <Row
                  key={indicator.id}
                  align="middle"
                  justify="space-between"
                  style={{ width: "100%" }}
                >
                  <Col>
                    <Text>{indicator.name}</Text>
                  </Col>
                  <Col>
                    <InputNumber
                      placeholder="Score"
                      min={0}
                      max={100}
                      onChange={(value) =>
                        handleScoreChange(
                          "indicator",
                          record.id,
                          indicator.id,
                          value
                        )
                      }
                      style={{ width: 120 }}
                    />
                  </Col>
                </Row>
              ))
          ) : (
            <Text type="secondary">No indicators for this category.</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Final Score",
      key: "score",
      width: "20%",
      align: "center",
      render: (_, record) => (
        <InputNumber
          placeholder="Total"
          min={0}
          max={100}
          onChange={(value) =>
            handleScoreChange("category", record.id, null, value)
          }
          style={{ width: 100 }}
        />
      ),
    },
  ];

  // 8. RENDER
  return (
    <Flex vertical gap={"middle"}>
      <Space>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={onBack} />
        <Title style={{ margin: 0 }} level={5}>
          Penilaian Tahfiz: {formattedName}
        </Title>
      </Space>
      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN: SELECTIONS */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card title="Pilihan Hafalan">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Tambah Juz (Bulk)</Text>
                <Row gutter={8}>
                  <Col flex="auto">
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Pilih 1 atau lebih Juz"
                      loading={isLoadingJuz}
                      value={selectedJuzForBulk}
                      onChange={setSelectedJuzForBulk}
                      virtual={false}
                    >
                      {juzData?.map((juz) => (
                        <Option key={juz.id} value={juz.id}>
                          {juz.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddSurahBulk}
                    />
                  </Col>
                </Row>

                <Divider />

                <Text strong>Tambah Surah (Spesifik)</Text>
                {/* PERBAIKAN 1: Membuat layout input menjadi responsif */}
                <Row gutter={[8, 16]}>
                  <Col xs={24} sm={12}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="1. Pilih Juz"
                      loading={isLoadingJuz}
                      onChange={handleJuzForSurahChange}
                      virtual={false}
                      allowClear
                    >
                      {juzData?.map((juz) => (
                        <Option key={juz.id} value={juz.id}>
                          {juz.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="2. Pilih Surah"
                      disabled={!selectedJuzForSurah}
                      value={selectedSurah}
                      onChange={setSelectedSurah}
                      virtual={false}
                      allowClear
                    >
                      {surahList.map((s) => (
                        <Option key={s.id} value={s.id}>
                          {s.surah}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row gutter={[8, 16]}>
                  <Col xs={24} sm={12}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="3. Dari Ayat"
                      disabled={!selectedSurahData}
                      value={fromAyat}
                      onChange={setFromAyat}
                      virtual={false}
                      allowClear
                    >
                      {selectedSurahData &&
                        Array.from(
                          {
                            length:
                              selectedSurahData.to_ayat -
                              selectedSurahData.from_ayat +
                              1,
                          },
                          (_, i) => selectedSurahData.from_ayat + i
                        ).map((ayat) => (
                          <Option key={ayat} value={ayat}>
                            {ayat}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="4. Sampai Ayat"
                      disabled={!fromAyat}
                      value={toAyat}
                      onChange={setToAyat}
                      virtual={false}
                      allowClear
                    >
                      {selectedSurahData &&
                        Array.from(
                          { length: selectedSurahData.to_ayat - fromAyat + 1 },
                          (_, i) => fromAyat + i
                        ).map((ayat) => (
                          <Option key={ayat} value={ayat}>
                            {ayat}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                </Row>
                <Row gutter={[8, 16]}>
                  <Col xs={24} sm={12}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="5. Dari Baris"
                      disabled={!toAyat}
                      value={fromLine}
                      onChange={setFromLine}
                      virtual={false}
                      allowClear
                    >
                      {selectedSurahData &&
                        Array.from(
                          { length: selectedSurahData.lines },
                          (_, i) => i + 1
                        ).map((line) => (
                          <Option key={line} value={line}>
                            {line}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="6. Sampai Baris"
                      disabled={!fromLine}
                      value={toLine}
                      onChange={setToLine}
                      virtual={false}
                      allowClear
                    >
                      {selectedSurahData &&
                        Array.from(
                          { length: selectedSurahData.lines - fromLine + 1 },
                          (_, i) => fromLine + i
                        ).map((line) => (
                          <Option key={line} value={line}>
                            {line}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  onClick={handleAddSingleSurah}
                  disabled={!toLine}
                  block
                >
                  Simpan Surah
                </Button>
              </Space>
            </Card>

            <Card title="Detail Penilaian">
              {/* PERBAIKAN 2: Membuat layout input menjadi responsif */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Select
                    placeholder="Pilih Jenis Penilaian"
                    style={{ width: "100%" }}
                    loading={isLoadingTypes}
                    value={typeId}
                    onChange={setTypeId}
                    virtual={false}
                  >
                    {typesData?.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={12}>
                  <Select
                    placeholder="Pilih Penguji"
                    style={{ width: "100%" }}
                    loading={isLoadingExaminers}
                    value={examinerId}
                    onChange={setExaminerId}
                    virtual={false}
                  >
                    {examinersData?.map((ex) => (
                      <Option key={ex.id} value={ex.id}>
                        {ex.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>

        {/* RIGHT COLUMN: SCORING */}
        <Col xs={24} lg={12}>
          <Card title="Indikator Penilaian">
            <Table
              bordered
              size="small"
              pagination={false}
              dataSource={categoriesData}
              columns={categoryColumns}
              loading={isLoadingCategories}
              rowKey="id"
              // PERBAIKAN 3: Membuat tabel scrollable di layar kecil
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>
      </Row>

      {/* BOTTOM SECTION: LIST OF SURAHS & SAVE */}
      <Divider />
      <Title level={5}>Daftar Surah</Title>
      <Table
        bordered
        dataSource={memorizedSurahs}
        columns={listSurahColumns}
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: "No surahs have been added yet." }}
        // PERBAIKAN 4: Membuat tabel scrollable di layar kecil
        scroll={{ x: "max-content" }}
      />

      <Row justify="end" style={{ marginTop: "24px" }}>
        <Col>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            disabled={memorizedSurahs.length === 0}
            onClick={handleSave}
          >
            Simpan
          </Button>
        </Col>
      </Row>
    </Flex>
  );
};

export default FormMemo;
