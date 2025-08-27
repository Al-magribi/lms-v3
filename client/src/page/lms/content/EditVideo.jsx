import React, { useState, useEffect } from "react";
import { useUpdateVideoMutation } from "../../../controller/api/lms/ApiChapter";
import { toast } from "react-hot-toast";

const EditVideo = ({ video, onCancel, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [updateVideo, { isLoading }] = useUpdateVideoMutation();

  useEffect(() => {
    if (video) {
      setTitle(video.title || "");
      setVideoUrl(video.video || "");
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Nama video tidak boleh kosong");
      return;
    }

    if (!videoUrl.trim()) {
      toast.error("URL video tidak boleh kosong");
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(videoUrl)) {
      toast.error("URL tidak valid. Pastikan URL dari YouTube");
      return;
    }

    try {
      await updateVideo({
        id: video.id,
        title: title.trim(),
        video: videoUrl.trim(),
      }).unwrap();

      toast.success("Video berhasil diperbarui");
      onSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Terjadi kesalahan");
    }
  };

  const handleCancel = () => {
    setTitle(video?.title || "");
    setVideoUrl(video?.video || "");
    onCancel();
  };

  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-light border-0">
        <h6 className="m-0 fw-bold text-primary">
          <i className="bi bi-youtube me-2"></i>
          Edit Video YouTube
        </h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="videoTitle" className="form-label">
              <i className="bi bi-tag me-2"></i>
              Nama Video
            </label>
            <input
              type="text"
              className="form-control"
              id="videoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan nama video"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="videoUrl" className="form-label">
              <i className="bi bi-link-45deg me-2"></i>
              URL Video YouTube
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-youtube text-danger"></i>
              </span>
              <input
                type="url"
                className="form-control"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <div className="form-text">
              <i className="bi bi-info-circle me-1"></i>
              Masukkan URL lengkap video YouTube
            </div>
          </div>

          {videoId && (
            <div className="mb-3">
              <label className="form-label">Preview Video:</label>
              <div className="ratio ratio-16x9">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded"
                ></iframe>
              </div>
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <i className="bi bi-x me-2"></i>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Perbarui
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideo;
