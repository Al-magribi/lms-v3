import { Form, Input, Modal, Select, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Editor from "../../../../components/editor/Editor";
import {
  useAddChapterMutation,
  useGetClassesQuery,
} from "../../../../service/api/lms/ApiChapter";

const FormChapter = ({ title, open, onClose, chapter }) => {
  console.log(chapter);
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();

  const [chapterid, setChapterid] = useState("");

  const { data: classes } = useGetClassesQuery();

  const [addChapter, { isLoading, isSuccess, data, error }] =
    useAddChapterMutation();

  const subjectid = searchParams.get("subjectid");
  const classOpts = classes?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const hanldeSubmit = (values) => {
    if (chapterid) {
      const data = { subjectid, chapterid, ...values };

      addChapter(data);
    } else {
      const data = { subjectid, ...values };
      addChapter(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      form.resetFields();
      setChapterid("");
      onClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, isSuccess, error]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setChapterid("");

      if (chapter) {
        setChapterid(chapter.chapter_id);
        form.setFieldsValue({
          title: chapter.chapter_name,
          target: chapter.target,
          classes: chapter.class?.map((c) => c.id),
        });
      }
    }
  }, [chapter, open]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText='Simpan'
      cancelText='Tutup'
      destroyOnHidden
      onOk={() => form.submit()}
    >
      <Spin tip='Memproses data' spinning={isLoading}>
        <Form form={form} layout='vertical' onFinish={hanldeSubmit}>
          <Form.Item
            name='title'
            label='Nama Bab'
            rules={[{ required: true, message: "Nama bab wajib diisi" }]}
          >
            <Input placeholder='Nama Bab' />
          </Form.Item>

          <Form.Item name='target' label='Capaian Pembelajaran'>
            <Editor placeholder='Tuliskan Capaian Pembelajaran' height={250} />
          </Form.Item>

          <Form.Item
            name='classes'
            label='Pilih Kelas'
            rules={[{ required: true, message: "Kelas wajib dipilih" }]}
          >
            <Select
              mode='multiple'
              placeholder='Pilih Kelas'
              options={classOpts}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              virtual={false}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormChapter;
