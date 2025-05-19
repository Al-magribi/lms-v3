import { useEffect, useState } from "react";
import { useGetPeriodesQuery } from "../../../controller/api/admin/ApiPeriode";
import { useAddStudentMutation } from "../../../controller/api/admin/ApiStudent";
import { toast } from "react-hot-toast";

const inputs = [
  { id: "nis", name: "nis", placeholder: "NIS" },
  { id: "name", name: "name", placeholder: "Name" },
];

const Form = ({ detail, setDetail }) => {
  const page = "";
  const limit = "";
  const search = "";

  const [formData, setFormData] = useState({
    id: "",
    entry: "",
    nis: "",
    name: "",
    gender: "",
  });

  const { data } = useGetPeriodesQuery({ page, limit, search });
  const [addStudent, { isSuccess, isLoading, isError, reset }] =
    useAddStudentMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addHandler = (e) => {
    e.preventDefault();
    toast.promise(
      addStudent(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan Data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setFormData({ id: "", entry: "", nis: "", name: "", gender: "" });
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setDetail({});
      setFormData({ id: "", entry: "", nis: "", name: "", gender: "" });

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
        entry: detail.entry_id || "",
        name: detail.name || "",
        nis: detail.nis || "",
        gender: detail.gender || "",
      });
    }
  }, [detail]);

  // Fix aria-hidden/focus warning on modal close
  useEffect(() => {
    const modal = document.getElementById("addstudent");
    if (!modal) return;
    const handler = () => {
      setFormData({ id: "", entry: "", nis: "", name: "", gender: "" });
      if (document.activeElement) document.activeElement.blur();
    };
    modal.addEventListener("hidden.bs.modal", handler);
    return () => modal.removeEventListener("hidden.bs.modal", handler);
  }, []);

  return (
    <div
      className="modal fade"
      id="addstudent"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="studentModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="studentModalLabel">
              {formData.id ? "Edit Siswa" : "Tambah Siswa"}
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
              <select
                name="entry"
                id="entry"
                className="form-select"
                value={formData.entry}
                onChange={handleChange}
                required
              >
                <option value="" hidden>
                  Tahun Masuk
                </option>
                {data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              {inputs?.map((item, i) => (
                <input
                  key={i}
                  type="text"
                  className="form-control"
                  placeholder={item.placeholder}
                  name={item.name}
                  id={item.name}
                  value={formData[item.name] || ""}
                  onChange={handleChange}
                  required
                />
              ))}

              <select
                name="gender"
                id="gender"
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
