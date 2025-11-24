import {
  Flex,
  Modal,
  Select,
  Form,
  InputNumber,
  Button,
  Row,
  Col,
  message,
} from "antd";
import Editor from "../../../components/editor/Editor";
import { useState, useEffect } from "react";
import { useAddQuestionMutation } from "../../../service/api/cbt/ApiBank";

const FormQues = ({ open, onClose, title, ques, bankid }) => {
  const [form] = Form.useForm();

  const [type, setType] = useState(1);

  const [addQuestion, { data, isSuccess, error, isLoading }] =
    useAddQuestionMutation();

  const handleSubmit = (values) => {
    const payload = {
      id: ques?.id ? ques?.id : "",
      qtype: values.type,
      poin: values.poin,
      question: values.question,
      bank: bankid,
      qkey: values.qkey,
      a: values.choiceA,
      b: values.choiceB,
      c: values.choiceC,
      d: values.choiceD,
      e: values.choiceE,
    };
    console.log(payload);
    addQuestion(payload);
  };

  useEffect(() => {
    if (open) {
      if (ques) {
        console.log(ques);
        form.setFieldsValue({
          qtype: ques.type || 1,
          qkey: ques.qkey || null,
          poin: ques.poin || 0,
          question: ques.question || "",
          choiceA: ques.a || "",
          choiceB: ques.b || "",
          choiceC: ques.c || "",
          choiceD: ques.d || "",
          choiceE: ques.e || "",
        });
        setType(ques.type || 1);
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 1, poin: 0 });
      }
    }
  }, [open, ques, form]);

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      form.resetFields();
      onClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, isSuccess, error]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={900}
      destroyOnHidden
      okText="Simpan"
      cancelText="Tutup"
      confirmLoading={isLoading}
      loading={isLoading}
      onOk={() => form.submit()}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 1, poin: 0 }}
        style={{
          height: 600,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          padding: "16px",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Tipe Pertanyaan"
              rules={[
                { required: true, message: "Silakan pilih tipe pertanyaan!" },
              ]}
            >
              <Select
                placeholder="Pilih Tipe Pertanyaan"
                onChange={(value) => setType(value)}
                options={[
                  { label: "Pilihan Ganda", value: 1 },
                  { label: "Essai", value: 2 },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="poin"
              label="Poin"
              rules={[{ required: true, message: "Silakan masukkan poin!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="Masukkan Poin"
              />
            </Form.Item>
          </Col>
        </Row>

        {type === 1 && (
          <Form.Item
            name="qkey"
            label="Kunci Jawaban"
            rules={[
              { required: true, message: "Silakan pilih kunci jawaban!" },
            ]}
          >
            <Select
              placeholder="Pilih Kunci Jawaban"
              options={[
                { label: "A", value: "A" },
                { label: "B", value: "B" },
                { label: "C", value: "C" },
                { label: "D", value: "D" },
                { label: "E", value: "E" },
              ]}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>
        )}

        <Form.Item
          name="question"
          label="Pertanyaan"
          rules={[
            { required: true, message: "Pertanyaan tidak boleh kosong!" },
          ]}
        >
          <Editor placeholder="Ketikan pertanyaan di sini ..." height={200} />
        </Form.Item>

        {type === 1 &&
          ["A", "B", "C", "D", "E"].map((choice) => (
            <Form.Item
              key={choice}
              name={`choice${choice}`}
              label={`Pilihan ${choice}`}
            >
              <Editor
                placeholder={`Ketikan jawaban untuk pilihan ${choice} ...`}
                height={150}
              />
            </Form.Item>
          ))}
      </Form>
    </Modal>
  );
};

export default FormQues;
