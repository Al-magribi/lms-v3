import { useEffect, useState } from "react";
import { useAddMajorMutation } from "../../../controller/api/admin/ApiMajor";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const [addMajor, { isSuccess, isLoading, error, reset }] =
    useAddMajorMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { id, name };

    toast.promise(
      addMajor(data)
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
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setName("");
      setId("");
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
    }
  }, [detail]);

  return (
    <form onSubmit={addHandler} className="bg-white rounded border p-3">
      <div className="form-floating">
        <input
          type="text"
          name="major"
          id="major"
          className="form-control"
          placeholder="Jurusan"
          required
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="major">Nama Jurusan</label>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-2">
        <button
          type="button"
          className="btn btn-sm btn-warning"
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
  );
};

export default Form;
