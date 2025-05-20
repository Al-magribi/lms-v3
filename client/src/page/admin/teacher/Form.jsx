import { useEffect, useState } from "react";
import Select from "react-select";
import { useAddTeacherMutation } from "../../../controller/api/admin/ApiTeacher";
import toast from "react-hot-toast";
import { useGetClassQuery } from "../../../controller/api/admin/ApiClass";
import { useGetSubjectQuery } from "../../../controller/api/admin/ApiSubject";

const Form = ({ detail, setDetail }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    name: "",
    homeroom: false,
    classid: "",
    gender: "",
    subjects: [],
  });

  const { data } = useGetClassQuery({ page: "", limit: "", search: "" });
  const { data: subjectsData } = useGetSubjectQuery({
    page: "",
    limit: "",
    search: "",
  });

  const [addTeacher, { isSuccess, isLoading, isError, reset }] =
    useAddTeacherMutation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubjectsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      subjects: selectedOptions || [],
    }));
  };

  const addHandler = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) {
      return toast.error("Lengkapi data");
    }
    toast.promise(
      addTeacher(formData)
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
      username: "",
      name: "",
      homeroom: false,
      classid: "",
      gender: "",
      subjects: [],
    });
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      cancel();
      const closeModal = document.querySelector("[data-bs-dismiss='modal']");
      closeModal.click();
    }
    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id || "",
        username: detail.username || "",
        name: detail.name || "",
        homeroom: detail.homeroom || false,
        classid: detail.class || "",
        gender: detail.gender || "",
        subjects:
          detail.subjects?.map((subject) => ({
            value: subject.id,
            label: subject.name,
          })) || [],
      });
    }
  }, [detail]);

  useEffect(() => {
    const modal = document.getElementById("addteacher");
    if (!modal) return;
    const handler = () => {
      setFormData({
        id: "",
        username: "",
        name: "",
        homeroom: false,
        classid: "",
        gender: "",
        subjects: [],
      });
    };
    modal.addEventListener("hidden.bs.modal", handler);
    return () => modal.removeEventListener("hidden.bs.modal", handler);
  }, []);

  const subjectOptions =
    subjectsData?.map((item) => ({ value: item.id, label: item.name })) || [];

  return (
    <div
      className="modal fade"
      id="addteacher"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="teacherModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <form onSubmit={addHandler} className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title" id="teacherModalLabel">
              {formData.id ? "Edit Guru" : "Tambah Guru"}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={cancel}
            ></button>
          </div>
          <div className="modal-body d-flex flex-column gap-3">
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Nama Guru"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <select
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="" hidden>
                Jenis Kelamin
              </option>
              <option value="L">Laki Laki</option>
              <option value="P">Perempuan</option>
            </select>
            <Select
              isMulti
              options={subjectOptions}
              value={formData.subjects}
              onChange={handleSubjectsChange}
              className="mb-2"
              placeholder="Mata Pelajaran"
            />
            <div className="form-check">
              <input
                type="checkbox"
                name="homeroom"
                className="form-check-input"
                checked={formData.homeroom}
                onChange={handleChange}
                id="homeroomCheck"
              />
              <label className="form-check-label" htmlFor="homeroomCheck">
                Wali Kelas
              </label>
            </div>
            {formData.homeroom && (
              <select
                name="classid"
                className="form-select"
                value={formData.classid}
                onChange={handleChange}
                required
              >
                <option value="" hidden>
                  Pilih Kelas
                </option>
                {data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-warning"
              data-bs-dismiss="modal"
              onClick={cancel}
            >
              <i className="bi bi-x-lg me-1"></i>Batal
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
            >
              <i className="bi bi-save me-1"></i>Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
