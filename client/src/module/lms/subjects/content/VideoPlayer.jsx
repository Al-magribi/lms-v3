import { Modal } from "antd";

const VideoPlayer = ({ open, onClose, video }) => {
  // Ensure video and video.video exist to prevent errors
  if (!video || !video.video) {
    return null;
  }

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    let videoId = "";
    // Regex to find video ID from various YouTube URL formats
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
      videoId = match[1];
    }
    return videoId;
  };

  const videoId = getYouTubeId(video.video);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  return (
    <Modal
      title={video.title ? `Playing Video: ${video.title}` : "Play Video"}
      open={open}
      onCancel={onClose}
      destroyOnHidden // Use destroyOnClose to unmount component and stop video on close
      width={800}
      footer={null} // Remove OK and Cancel buttons
    >
      {videoId ? (
        <div
          className="video-responsive"
          style={{
            position: "relative",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            height: 0,
            overflow: "hidden",
            borderRadius: "15px",
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title={video.title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></iframe>
        </div>
      ) : (
        <p>Invalid YouTube URL provided.</p>
      )}
    </Modal>
  );
};

export default VideoPlayer;
