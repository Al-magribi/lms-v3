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

      const closeMoadal = document.querySelector('[data-bs-dismiss="modal"]');
      if (closeMoadal) {
        closeMoadal.click();
      }
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
      <div className="modal-dialog ">
        <form onSubmit={addHandler} className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title" id="classModalLabel">
              {id ? "Edit Kelas" : "Tambah Kelas"}
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
          </div>

          <div className="modal-footer">
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
  );
};

export default Form;
