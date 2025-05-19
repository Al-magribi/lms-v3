import React, { useEffect, useState } from "react";
import {
  useAddBankMutation,
  useGetTeachersQuery,
} from "../../../controller/api/cbt/ApiBank";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const Form = ({ detail, setDetail }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    id: "",
    teacher: user?.id || null,
    subject: null,
    btype: "",
    name: "",
  });

  const { data: teachers } = useGetTeachersQuery();
  const [addBank, { isSuccess, isLoading, isError, reset }] =
    useAddBankMutation();

  const teacherOptions = teachers?.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
    subjects: teacher.subjects,
  }));

  const selectedTeacher = teachers?.find((t) => t.id === formData.teacher);

  const subjectOptions =
    selectedTeacher?.subjects?.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })) || [];

  const handleTeacherChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      teacher: selectedOption?.value || null,
      subject: null,
    }));
  };

  const handleSubjectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      subject: selectedOption?.value || null,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addHandler = (e) => {
    e.preventDefault();
    toast.promise(
      addBank(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setFormData({
      id: "",
      teacher: user?.id || null,
      subject: null,
      btype: "",
      name: "",
    });
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setFormData({
        id: "",
        teacher: user?.id || null,
        btype: "",
        subject: null,
        name: "",
      });
      reset();
      const closeModal = document.querySelector("[data-bs-dismiss='modal']");
      closeModal.click();
    }
  }, [isSuccess, isError, user, reset]);

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id,
        teacher: detail.teacher || user?.id || null,
        subject: detail.subject,
        name: detail.name,
        btype: detail.btype,
      });
    }
  }, [detail, user]);

  useEffect(() => {
    const modal = document.getElementById("addbank");
    if (!modal) return;
    const handler = () => {
      setFormData({
        id: "",
        teacher: user?.id || null,
        subject: null,
        btype: "",
        name: "",
      });
    };
    modal.addEventListener("hidden.bs.modal", handler);
    return () => modal.removeEventListener("hidden.bs.modal", handler);
  }, [user]);

  return (
    <div
      className="modal fade"
      id="addbank"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="bankModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="bankModalLabel">
              {formData.id ? "Edit Bank Soal" : "Tambah Bank Soal"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={cancel}
            ></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={addHandler} className="d-flex flex-column gap-3">
              <Select
                isClearable
                isSearchable
                placeholder="Cari Guru"
                value={
                  teacherOptions?.find(
                    (opt) => opt.value === formData.teacher
                  ) || null
                }
                options={teacherOptions}
                onChange={handleTeacherChange}
                className="mb-2"
              />
              <Select
                isClearable
                isSearchable
                placeholder="Pilih Mata Pelajaran"
                value={
                  subjectOptions?.find(
                    (opt) => opt.value === formData.subject
                  ) || null
                }
                options={subjectOptions}
                onChange={handleSubjectChange}
                isDisabled={!formData.teacher}
                className="mb-2"
              />
              <select
                name="btype"
                id="btype"
                className="form-select"
                value={formData.btype}
                onChange={handleInputChange}
                required
              >
                <option value="" hidden>
                  Jenis Bank Soal
                </option>
                <option value="bank">Bank</option>
                <option value="paket">Paket</option>
              </select>
              <input
                name="name"
                className="form-control"
                placeholder="Nama Bank Soal"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-warning"
                  data-bs-dismiss="modal"
                  onClick={cancel}
                >
                  <i className="bi bi-x-lg me-1"></i>Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-success"
                  disabled={isLoading}
                >
                  <i className="bi bi-save me-1"></i>Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
