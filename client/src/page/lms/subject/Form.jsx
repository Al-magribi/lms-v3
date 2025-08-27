import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "../../../components/editor/Editor";
import { toast } from "react-hot-toast";
import {
  useAddChapterMutation,
  useGetClassesQuery,
} from "../../../controller/api/lms/ApiChapter";
import Select from "react-select";

const Form = ({ detail, setDetail }) => {
  const params = useParams();
  const { id } = params;

  const { data: classes } = useGetClassesQuery();
  const [addChapter, { isSuccess, isError, reset, isLoading }] =
    useAddChapterMutation();

  const [chapterid, setChapterid] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);

  const classOptions = classes?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const addHandler = (e) => {
    e.preventDefault();

    if (!title || !target) {
      toast.error("Harap isi semua data");
      return;
    }

    if (selectedClasses.length === 0) {
      toast.error("Harap pilih minimal satu kelas");
      return;
    }

    const data = {
      subjectid: id,
      chapterid,
      title,
      target,
      classes: selectedClasses.map((cls) => cls.value),
    };

    toast.promise(
      addChapter(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClasses(selectedOption || []);
  };

  const resetForm = () => {
    setTitle("");
    setTarget("");
    setSelectedClasses([]);
    setChapterid("");
  };

  useEffect(() => {
    if (isSuccess || isError) {
      resetForm();
      reset();
    }
  }, [isSuccess, isError, reset]);

  useEffect(() => {
    if (detail) {
      setChapterid(detail.chapter_id);
      setTitle(detail.chapter_name);
      setTarget(detail.target);
      setSelectedClasses(
        detail.class?.map((cls) => ({ value: cls.id, label: cls.name })) || []
      );
    }
  }, [detail]);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-gradient-primary text-white border-0">
        <div className="d-flex align-items-center">
          <i className="bi bi-plus-circle me-2 fs-4"></i>
          <h5 className="card-title mb-0">Manajemen Bab</h5>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={addHandler} className="d-flex flex-column gap-3">
          <div>
            <label htmlFor="title" className="form-label fw-bold">
              <i className="bi bi-book me-2 text-primary"></i>
              Nama Bab
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="form-control form-control-lg"
              placeholder="Contoh: Pengenalan Fisika"
              required
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label fw-bold">
              <i className="bi bi-target me-2 text-primary"></i>
              Capaian Pembelajaran
            </label>
            <Editor
              placeholder="Tuliskan capaian pembelajaran yang ingin dicapai siswa..."
              value={target}
              onChange={(html) => setTarget(html)}
              height={150}
            />
          </div>

          <div>
            <label className="form-label fw-bold">
              <i className="bi bi-people me-2 text-primary"></i>
              Pilih Kelas
            </label>
            <Select
              isClearable
              isSearchable
              isMulti
              placeholder="Pilih kelas yang akan mengikuti bab ini..."
              value={selectedClasses}
              options={classOptions}
              onChange={handleClassChange}
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={() => "Tidak ada kelas tersedia"}
              loadingMessage={() => "Memuat kelas..."}
            />
            <div className="form-text">
              Pilih kelas yang akan mengikuti materi dalam bab ini
            </div>
          </div>

          <div className="d-flex gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline-secondary flex-fill"
              onClick={resetForm}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-fill"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
