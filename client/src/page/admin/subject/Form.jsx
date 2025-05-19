import { useEffect, useRef, useState } from "react";
import { useAddSubjectMutation } from "../../../controller/api/admin/ApiSubject";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const [addSubject, { isSuccess, isLoading, isError, reset }] =
    useAddSubjectMutation();

  const addHandler = (e) => {
    e.preventDefault();

    if (!name) {
      return toast.error("Lengkapi data");
    }

    const data = new FormData();
    data.append("id", id ? id : "");
    data.append("name", name);
    data.append("cover", file);

    toast.promise(
      addSubject(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Meyimpan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setId("");
    setName("");
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
      setDetail({});
      setId("");
      setName("");

      if (inputRef.current) {
        inputRef.current.value = null;
      }

      const closeModal = document.querySelector("[data-bs-dismiss='modal']");
      closeModal.click();
    }
  }, [isSuccess, isError]);

  return (
    <div
      className={`modal fade`}
      id="addsubject"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="subjectModalLabel"
      aria-hidden={detail && detail.id ? "false" : "true"}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="subjectModalLabel">
              {id ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              data-bs-dismiss="modal"
              onClick={cancel}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={addHandler} className="d-flex flex-column gap-2">
              <input
                type="text"
                name="name"
                id="name"
                className="form-control"
                placeholder="Nama Mata Pelajaran"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
                  id="inputGroupFile02"
                  ref={inputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label className="input-group-text" htmlFor="inputGroupFile02">
                  Cover
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-warning"
                  data-bs-dismiss="modal"
                  onClick={cancel}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-sm btn-success"
                  disabled={isLoading}
                >
                  Simpan
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
