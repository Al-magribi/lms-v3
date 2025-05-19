import { useEffect, useState } from "react";
import { useAddClassMutation } from "../../../controller/api/admin/ApiClass";
import { toast } from "react-hot-toast";
import { useGetGradeQuery } from "../../../controller/api/admin/ApiGrade";
import { useGetMajorQuery } from "../../../controller/api/admin/ApiMajor";

const Form = ({ detail, setDetail }) => {
  const page = "";
  const limit = "";
  const search = "";

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [majorId, setMajorId] = useState("");

  const { data: grades } = useGetGradeQuery({ page, limit, search });
  const { data: majors } = useGetMajorQuery({ page, limit, search });
  const [addClass, { isSuccess, isLoading, error, reset }] =
    useAddClassMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { id, name, gradeId, majorId };

    toast.promise(
      addClass(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setId("");
    setName("");
    setGradeId("");
    setMajorId("");
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setName("");
      setId("");
      setGradeId("");
      setMajorId("");
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (detail) {
      setId(detail.id || "");
      setName(detail.name || "");
      setGradeId(detail.grade || "");
      setMajorId(detail.major || "");
    }
  }, [detail]);

  useEffect(() => {
    const modal = document.getElementById("addclass");
    if (!modal) return;
    const handler = () => {
      setId("");
      setName("");
      setGradeId("");
      setMajorId("");
    };
    modal.addEventListener("hidden.bs.modal", handler);
    return () => modal.removeEventListener("hidden.bs.modal", handler);
  }, []);

  return (
    <div
      className="modal fade"
      id="addclass"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="classModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="classModalLabel">
              {id ? "Edit Kelas" : "Tambah Kelas"}
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
              {majors?.length > 0 && (
                <select
                  className="form-select"
                  value={majorId || ""}
                  onChange={(e) => setMajorId(e.target.value)}
                  required
                >
                  <option value="" hidden>
                    Pilih Jurusan
                  </option>
                  {majors?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="form-select"
                value={gradeId || ""}
                onChange={(e) => setGradeId(e.target.value)}
                required
              >
                <option value="" hidden>
                  Pilih Tingkat
                </option>
                {grades?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="class"
                id="class"
                className="form-control"
                placeholder="Nama Kelas"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
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
