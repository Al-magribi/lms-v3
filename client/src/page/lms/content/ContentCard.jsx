import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  useDeleteFileMutation,
  useDeleteContentMutation,
} from "../../../controller/api/lms/ApiChapter";
import Swal from "sweetalert2";
import { useDrag, useDrop } from "react-dnd";
import EditContent from "./EditContent";
import FileUpload from "./FileUpload";
import YouTubeUpload from "./YouTubeUpload";
import EditFile from "./EditFile";
import EditVideo from "./EditVideo";

const createMarkup = (html) => {
  return { __html: html };
};

const ContentCard = ({ content, chapterId, index, moveContent, id }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showYouTubeUpload, setShowYouTubeUpload] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteFile] = useDeleteFileMutation();
  const [deleteContent] = useDeleteContentMutation();
  const ref = React.useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: "content",
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

      moveContent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "content",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const openLink = (link) => {
    window.open(`${window.location.origin}${link}`, "_blank");
  };

  const openYoutube = (link) => {
    window.open(link, "_blank");
  };

  const handleSuccess = () => {
    setShowEditForm(false);
    setShowFileUpload(false);
    setShowYouTubeUpload(false);
    setEditingFile(null);
    setEditingVideo(null);
  };

  const handleDeleteFile = async (id, type) => {
    try {
      await deleteFile(id).unwrap();
      toast.success(`${type} berhasil dihapus`);
    } catch (error) {
      toast.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDeleteContent = () => {
    Swal.fire({
      title: "Konfirmasi Penghapusan",
      text: "Apakah anda yakin ingin menghapus materi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        toast.promise(
          deleteContent(content.content_id)
            .unwrap()
            .then((res) => res.message),
          {
            loading: "Menghapus materi...",
            success: (message) => message,
            error: (err) => err.data?.message || "Terjadi kesalahan",
          }
        );
      }
    });
  };

  return (
    <>
      {" "}
      <div
        className="container mb-3"
        ref={ref}
        style={{ opacity }}
        data-handler-id={handlerId}
      >
        <div className="row">
          <div className="col-12">
            <div
              className={`card border-0 shadow-sm ${
                isDragging ? "shadow-lg" : ""
              }`}
            >
              <div className="card-header bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-2">
                      <i className="bi bi-collection me-1"></i>
                      Materi {index + 1}
                    </span>
                    <h6 className="m-0 fw-bold text-primary">
                      {content.content_title}
                    </h6>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Tambah Video Youtube"
                      onClick={() => setShowYouTubeUpload(true)}
                    >
                      <i className="bi bi-youtube"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-primary"
                      title="Tambah File"
                      onClick={() => setShowFileUpload(true)}
                    >
                      <i className="bi bi-file-earmark-plus"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-warning"
                      title="Edit Materi"
                      onClick={() => setShowEditForm(true)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Hapus Materi"
                      onClick={handleDeleteContent}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      title="Pindahkan"
                      style={{ cursor: "grab" }}
                    >
                      <i className="bi bi-grip-vertical"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div
                  className="content-description"
                  dangerouslySetInnerHTML={createMarkup(content.content_target)}
                />
              </div>

              <div className="card-footer bg-light border-0">
                <div className="row g-3">
                  {/* Files Section */}
                  {content.files?.length > 0 ? (
                    <div className="col-12">
                      <h6 className="text-muted mb-2">
                        <i className="bi bi-file-earmark me-2"></i>
                        File Materi ({content.files.length})
                      </h6>
                      <div className="row g-2">
                        {content.files?.map((file, i) => (
                          <div key={i} className="col-12 col-md-6 col-lg-4">
                            <div className="card border-0 bg-light file-video-card">
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2">
                                  <i className="bi bi-file-earmark text-primary me-2"></i>
                                  <span
                                    className="fw-medium text-truncate"
                                    title={file.title}
                                  >
                                    {file.title}
                                  </span>
                                </div>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => openLink(file.file)}
                                    title="Download file"
                                  >
                                    <i className="bi bi-download"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => setEditingFile(file)}
                                    title="Edit file"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      handleDeleteFile(file.id, "File")
                                    }
                                    title="Hapus file"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="col-12">
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-file-earmark fs-4 mb-2"></i>
                        <p className="mb-0">Belum ada file materi</p>
                      </div>
                    </div>
                  )}

                  {/* Videos Section */}
                  {content.videos?.length > 0 ? (
                    <div className="col-12">
                      <h6 className="text-muted mb-2">
                        <i className="bi bi-youtube me-2"></i>
                        Video YouTube ({content.videos.length})
                      </h6>
                      <div className="row g-2">
                        {content.videos?.map((video, i) => (
                          <div key={i} className="col-12 col-md-6 col-lg-4">
                            <div className="card border-0 bg-light file-video-card">
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2">
                                  <i className="bi bi-youtube text-danger me-2"></i>
                                  <span
                                    className="fw-medium text-truncate"
                                    title={video.title}
                                  >
                                    {video.title}
                                  </span>
                                </div>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => openYoutube(video.video)}
                                    title="Tonton video"
                                  >
                                    <i className="bi bi-play-circle"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => setEditingVideo(video)}
                                    title="Edit video"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      handleDeleteFile(video.id, "Video")
                                    }
                                    title="Hapus video"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="col-12">
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-youtube fs-4 mb-2"></i>
                        <p className="mb-0">Belum ada video YouTube</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Content Form */}
      {showEditForm && (
        <div className="container mb-3">
          <EditContent
            content={content}
            chapterId={chapterId}
            onCancel={() => setShowEditForm(false)}
            onSuccess={handleSuccess}
          />
        </div>
      )}
      {/* File Upload Form */}
      {showFileUpload && (
        <div className="container mb-3">
          <FileUpload
            content={{ id: content.content_id }}
            onCancel={() => setShowFileUpload(false)}
            onSuccess={handleSuccess}
          />
        </div>
      )}
      {/* YouTube Upload Form */}
      {showYouTubeUpload && (
        <div className="container mb-3">
          <YouTubeUpload
            content={{ id: content.content_id }}
            onCancel={() => setShowYouTubeUpload(false)}
            onSuccess={handleSuccess}
          />
        </div>
      )}
      {/* Edit File Form */}
      {editingFile && (
        <div className="container mb-3">
          <EditFile
            file={editingFile}
            onCancel={() => setEditingFile(null)}
            onSuccess={handleSuccess}
          />
        </div>
      )}
      {/* Edit Video Form */}
      {editingVideo && (
        <div className="container mb-3">
          <EditVideo
            video={editingVideo}
            onCancel={() => setEditingVideo(null)}
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </>
  );
};

export default ContentCard;
