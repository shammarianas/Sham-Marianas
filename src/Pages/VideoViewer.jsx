import { useRef, useState, useEffect } from "react";

const VideoViewer = ({
  videoUrl,
  videoName,
  previewUrl
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if preview is video or image
  const isPreviewVideo = previewUrl && (
    previewUrl.includes('.mp4') ||
    previewUrl.includes('.mov') ||
    previewUrl.includes('.webm') ||
    previewUrl.includes('video/')
  );

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (videoRef.current) {
      videoRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const video = videoRef.current;
    if (video) {
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (video) {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.code === "KeyF") {
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`video_viewer_main ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="container">
        <div className="video_wrapper">
          {/* ✅ AGAR PREVIEW VIDEO HAI - VIDEO PLAY HO */}
          {previewUrl && isPreviewVideo ? (
            <video
              ref={videoRef}
              controls
              width="100%"
              style={{ width: '100%', height: '-webkit-fill-available' }}
            >
              <source src={previewUrl} type="video/mp4" />
              <source src={previewUrl} type="video/quicktime" />
              <source src={previewUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : /* ✅ AGAR PREVIEW IMAGE HAI - IMAGE SHOW HO */
          previewUrl && !isPreviewVideo ? (
            <img
              src={previewUrl}
              alt={videoName || "Preview Image"}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          ) : /* ✅ AGAR PREVIEW NAHI HAI - ACTUAL VIDEO SHOW HO */
          videoUrl ? (
            <video
              ref={videoRef}
              controls
              width="100%"
              style={{ width: '100%', height: 'auto' }}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          ) : (
            /* ✅ KOI BHI CONTENT NAHI HAI */
            <div className="no-content" style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
              border: '2px dashed #ddd',
              borderRadius: '8px'
            }}>
              No video or image available
            </div>
          )}
        </div>

        {/* ✅ CONTROLS SIRF VIDEO KE LIYE */}
        {(previewUrl && isPreviewVideo) || videoUrl ? (
          <div className="controls" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button onClick={togglePlay} >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={toggleFullscreen} >
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VideoViewer;