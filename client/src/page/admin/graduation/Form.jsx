import React, { useEffect, useState } from "react";
import {
  useAddGraduationMutation,
  useGetStudentsQuery,
} from "../../../controller/api/admin/ApiGraduation";
import { toast } from "react-hot-toast";
import Select from "react-select";

const Form = ({ detail, setDetail }) => {
  const [formData, setFormData] = useState({
    id: "",
    agency: "",
    userid: "",
    description: "",
  });

  const { data: students = [] } = useGetStudentsQuery();

  const studentOptions = students?.map((student) => ({
    value: student.id,
    label: student.name,
  }));

  const [addGraduation, { isLoading, isSuccess, isError, reset }] =
    useAddGraduationMutation();

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.promise(
      addGraduation(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleCancel = () => {
    setDetail({});
    setFormData({
      id: "",
      agency: "",
      userid: "",
      description: "",
    });
  };

  const handleStudentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      userid: selectedOption?.value || null,
    }));
  };

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id ?? "",
        agency: detail.agency ?? "",
        userid: detail.userid ?? "",
        description: detail.description ?? "",
      });
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess || isError) {
      if (isSuccess) {
        setDetail({});
        setFormData({
          id: "",
          agency: "",
          userid: "",
          description: "",
        });
        const closeModal = document.querySelector('[data-bs-dismiss="modal"]');
        closeModal.click();
      }

      reset();
    }
  }, [isSuccess, isError]);

  return (
    <div
      className="modal fade"
      id="addgraduation"
      tabIndex="-1"
      aria-labelledby="addgraduationLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form
            onSubmit={handleSubmit}
            className="border-0 p-3 rounded flex-column gap-3"
          >
            <div className="modal-header">
              <h5 className="modal-title" id="addgraduationLabel">
                Data Lulusan
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={isLoading}
              ></button>
            </div>
            <div className="modal-body d-flex flex-column gap-3">
              <Select
                isClearable
                isSearchable
                placeholder="Cari Murid"
                value={
                  studentOptions?.find(
                    (opt) => opt.value === formData.userid
                  ) || null
                }
                options={studentOptions}
                onChange={handleStudentChange}
              />
              <input
                type="text"
                name="agency"
                id="agency"
                placeholder="Nama Instansi"
                className="form-control"
                required
                value={formData.agency}
                onChange={(e) =>
                  setFormData({ ...formData, agency: e.target.value })
                }
              />
              <textarea
                name="description"
                id="description"
                placeholder="Keterangan"
                className="form-control"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-warning"
                data-bs-dismiss="modal"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isLoading}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form;
