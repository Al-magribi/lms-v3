import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useDeleteChapterMutation } from "../../../controller/api/lms/ApiChapter";
import { toast } from "react-hot-toast";
import Chapter from "./Chapter";
import ContentList from "../content/ContentList";
import Swal from "sweetalert2";
import ModalAddContent from "./ModalAddContent";

const ChapterCard = ({ item, index, moveCard, id, setDetail }) => {
  const ref = React.useRef(null);
  const [activeTab, setActiveTab] = useState("chapter");

  const [deleteChapter, { isSuccess, isLoading, isError, reset }] =
    useDeleteChapterMutation();

  // Group classes by grade
  const groupedClasses = React.useMemo(() => {
    if (!item.class) return {};
    return item.class.reduce((acc, cls) => {
      if (!acc[cls.grade]) {
        acc[cls.grade] = [];
      }
      acc[cls.grade].push(cls);
      return acc;
    }, {});
  }, [item.class]);

  const [{ handlerId }, drop] = useDrop({
    accept: "chapter",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "chapter",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const deleteHandler = (id) => {
    Swal.fire({
      title: "Konfirmasi Penghapusan",
      text: "Apakah anda yakin ingin menghapus bab ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        toast.promise(
          deleteChapter(id)
            .unwrap()
            .then((res) => res.message),
          {
            loading: "Menghapus bab...",
            success: (message) => message,
            error: (err) => err.data.message,
          }
        );
      }
    });
  };

  useEffect(() => {
    if (isError || isSuccess) reset();
  }, [isSuccess, isError]);

  return (
    <div
      className="col-12 mb-3"
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <div
        className={`card border-0 shadow-sm ${isDragging ? "shadow-lg" : ""}`}
      >
        <div className="card-header bg-gradient-primary text-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <span className="badge bg-light text-primary fs-6 fw-bold px-3 py-2">
                  Bab {index + 1}
                </span>
              </div>
              <div className="nav nav-pills">
                <button
                  className={`nav-link btn-sm me-2 ${
                    activeTab === "chapter"
                      ? "active bg-white text-primary"
                      : "text-white"
                  }`}
                  onClick={() => setActiveTab("chapter")}
                >
                  <i className="bi bi-book me-1"></i>
                  Detail
                </button>
                <button
                  className={`nav-link btn-sm ${
                    activeTab === "content"
                      ? "active bg-white text-primary"
                      : "text-white"
                  }`}
                  onClick={() => setActiveTab("content")}
                >
                  <i className="bi bi-collection me-1"></i>
                  Materi ({item.content || 0})
                </button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-light text-primary"
                title="Lihat Detail"
                onClick={() => setDetail(item)}
              >
                <i className="bi bi-eye"></i>
              </button>
              <button
                className="btn btn-sm btn-warning"
                title="Edit Bab"
                onClick={() => setDetail(item)}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
              <button
                className="btn btn-sm btn-info text-white"
                title="Tambah Materi"
                data-bs-toggle="modal"
                data-bs-target={`#add-content-${item.chapter_id}`}
              >
                <i className="bi bi-plus-circle"></i>
              </button>
              <button
                className="btn btn-sm btn-danger"
                title="Hapus Bab"
                disabled={isLoading}
                onClick={() => deleteHandler(item.chapter_id)}
              >
                {isLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <i className="bi bi-trash"></i>
                )}
              </button>
              <button
                className="btn btn-sm btn-secondary"
                title="Pindahkan"
                style={{ cursor: "grab" }}
              >
                <i className="bi bi-grip-vertical"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {activeTab === "chapter" ? (
            <div className="p-4">
              <Chapter item={item} />
            </div>
          ) : (
            <ContentList contents={item.contents} chapterId={item.chapter_id} />
          )}
        </div>

        <div className="card-footer bg-light border-0">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center text-muted mb-2">
                <i className="bi bi-person-workspace me-2 text-primary"></i>
                <span className="small">
                  <strong>Guru:</strong> {item.teacher_name}
                </span>
              </div>

              <div className="d-flex gap-3">
                <span className="badge bg-primary">
                  <i className="bi bi-book me-1"></i>
                  Materi: {item.content || 0}
                </span>
                <span className="badge bg-info">
                  <i className="bi bi-file-earmark me-1"></i>
                  File: {item.file || 0}
                </span>
                <span className="badge bg-success">
                  <i className="bi bi-camera-video me-1"></i>
                  Video: {item.video || 0}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              {Object.entries(groupedClasses).map(([grade, classes]) => (
                <div key={grade} className="mb-2">
                  <div className="d-flex align-items-center text-muted mb-1">
                    <i className="bi bi-mortarboard me-2 text-primary"></i>
                    <span className="small">
                      <strong>Tingkat {grade}</strong>
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {classes.map((cls) => (
                      <span key={cls.id} className="badge bg-secondary">
                        {cls.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ModalAddContent
        modalId={`add-content-${item.chapter_id}`}
        chapter={item}
      />
    </div>
  );
};

export default ChapterCard;
