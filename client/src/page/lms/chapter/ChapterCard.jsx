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
      className='col-12'
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <div className={`card ${isDragging ? "shadow-lg" : ""}`}>
        <div className='card-header d-flex justify-content-between'>
          <ul className='nav nav-tabs card-header-tabs'>
            <li className='nav-item'>
              <p
                className={`nav-link ${
                  activeTab === "chapter" ? "active" : ""
                }`}
                onClick={() => setActiveTab("chapter")}
                style={{ cursor: "pointer" }}
              >
                Bab {index + 1}
              </p>
            </li>
            <li className='nav-item'>
              <p
                className={`nav-link ${
                  activeTab === "content" ? "active" : ""
                }`}
                onClick={() => setActiveTab("content")}
                style={{ cursor: "pointer" }}
              >
                Materi
              </p>
            </li>
          </ul>

          <div className='d-flex gap-2'>
            <button
              className='btn btn-sm btn-danger'
              disabled={isLoading}
              onClick={() => deleteHandler(item.chapter_id)}
            >
              <i className='bi bi-folder-x'></i>
            </button>
            <button
              className='btn btn-sm btn-warning'
              onClick={() => setDetail(item)}
            >
              <i className='bi bi-pencil-square'></i>
            </button>
            <button
              className='btn btn-sm btn-primary'
              data-bs-toggle='modal'
              data-bs-target={`#content-${item.chapter_id}`}
            >
              <i className='bi bi-folder-plus'></i>
            </button>

            <button className='btn btn-sm btn-secondary'>
              <i className='bi bi-arrows-move'></i>
            </button>
          </div>
        </div>
        <div className='card-body'>
          {activeTab === "chapter" ? (
            <Chapter item={item} />
          ) : (
            <ContentList contents={item.contents} chapterId={item.chapter_id} />
          )}
        </div>
        <div className='card-footer text-body-secondary d-flex gap-2 flex-column'>
          <div className='d-flex gap-2 flex-wrap'>
            <p className='m-0'>
              Materi Pembelajaran <span>{item.content}</span>
            </p>
            <p className='m-0'>
              File <span>{item.file}</span>
            </p>
            <p className='m-0'>
              Video <span>{item.video}</span>
            </p>
          </div>

          <p className='m-0'>
            Guru Pengampu <strong>{item.teacher_name}</strong>
          </p>
        </div>
      </div>
      <ModalAddContent chapter={item} modalId={`content-${item.chapter_id}`} />
    </div>
  );
};

export default ChapterCard;
