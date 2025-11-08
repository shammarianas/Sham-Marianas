import React, { useEffect, useRef, useState } from "react";
import { FiX, FiPlay, FiPause, FiMaximize2, FiMinimize2, FiDownload } from "react-icons/fi";
// import { saveAs } from "file-saver";

const AssetFullScreen = ({ 
  asset, 
  isOpen, 
  onClose,
  assetType,
  onDownload 
}) => {
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get asset URL based on type
  const getAssetUrl = () => {
    switch (assetType) {
      case "videos":
        return asset.video;
      case "images":
        return asset.thumbnail || asset.images?.[0];
      case "models":
        return asset.model;
      case "scripts":
        return asset.script;
      case "hdris":
        return asset.hdri;
      case "graphics":
        return asset.template;
      case "video-templates":
        return asset.videoTemplate;
      case "textures":
        return asset.thumbnail || asset.textures?.[0];
      case "icons":
        return asset.thumbnail || asset.icons?.[0];
      default:
        return asset.thumbnail;
    }
  };

  const getAssetName = () => {
    return asset.title || "Asset Preview";
  };

  const getFileExtension = (url) => {
    if (!url) return "";
    return url.split('.').pop().toLowerCase();
  };

  const isVideo = () => {
    const url = getAssetUrl();
    const ext = getFileExtension(url);
    return ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext) || 
           assetType === "videos" || 
           assetType === "video-templates";
  };

  const isImage = () => {
    const url = getAssetUrl();
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext) || 
           assetType === "images" || 
           assetType === "textures" || 
           assetType === "icons" || 
           assetType === "graphics";
  };

  const is3DModel = () => {
    const url = getAssetUrl();
    const ext = getFileExtension(url);
    return ['glb', 'gltf', 'obj', 'fbx', 'stl'].includes(ext) || 
           assetType === "models";
  };

  // Video controls
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
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else {
      try {
        const response = await fetch(getAssetUrl());
        const blob = await response.blob();
        saveAs(blob, `${asset.title || 'asset'}.${getFileExtension(getAssetUrl())}`);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  // Event handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === " " && isVideo()) {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsLoading(true);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const assetUrl = getAssetUrl();
  const assetName = getAssetName();

  return (
    <>
      <style>
        {`
          .asset-fullscreen-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 2rem;
          }

          .asset-fullscreen-container {
            position: relative;
            width: 100%;
            max-width: 95vw;
            max-height: 95vh;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          }

          .asset-fullscreen-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
            z-index: 10;
          }

          .asset-fullscreen-title {
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0;
            max-width: 70%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .asset-fullscreen-controls {
            display: flex;
            gap: 0.5rem;
          }

          .asset-fullscreen-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            backdrop-filter: blur(10px);
          }

          .asset-fullscreen-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
          }

          .asset-fullscreen-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem 1rem 2rem 1rem;
          }

          .asset-fullscreen-video {
            width: 100%;
            height: 100%;
            max-height: 80vh;
            object-fit: contain;
            outline: none;
          }

          .asset-fullscreen-image {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 8px;
          }

          .asset-fullscreen-model {
            width: 100%;
            height: 600px;
            border: none;
            border-radius: 8px;
          }

          .asset-fullscreen-unsupported {
            color: white;
            text-align: center;
            padding: 2rem;
          }

          .asset-fullscreen-loading {
            color: white;
            font-size: 1.1rem;
          }

          .asset-fullscreen-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1rem 1.5rem;
            background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
            display: flex;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
          }

          .asset-fullscreen-container:hover .asset-fullscreen-footer {
            opacity: 1;
          }

          .video-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .play-pause-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            backdrop-filter: blur(10px);
          }

          .play-pause-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
          }

          @media (max-width: 768px) {
            .asset-fullscreen-overlay {
              padding: 1rem;
            }
            
            .asset-fullscreen-container {
              max-width: 98vw;
              max-height: 98vh;
            }
            
            .asset-fullscreen-header {
              padding: 0.75rem 1rem;
            }
            
            .asset-fullscreen-title {
              font-size: 1rem;
              max-width: 60%;
            }
          }
        `}
      </style>

      <div className="asset-fullscreen-overlay" onClick={onClose}>
        <div 
          ref={containerRef}
          className="asset-fullscreen-container" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="asset-fullscreen-header">
            <h3 className="asset-fullscreen-title">{assetName}</h3>
            <div className="asset-fullscreen-controls">
              {assetUrl && (
                <button 
                  className="asset-fullscreen-btn"
                  onClick={handleDownload}
                  aria-label="Download asset"
                >
                  <FiDownload size={18} />
                </button>
              )}
              <button 
                className="asset-fullscreen-btn"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
              </button>
              <button 
                className="asset-fullscreen-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="asset-fullscreen-content">
            {isLoading && (
              <div className="asset-fullscreen-loading">Loading...</div>
            )}
            
            {isVideo() && assetUrl ? (
              <>
                <video
                  ref={videoRef}
                  className="asset-fullscreen-video"
                  src={assetUrl}
                  controls={false}
                  autoPlay
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                >
                  Your browser does not support the video tag.
                </video>
              </>
            ) : isImage() && assetUrl ? (
              <img
                ref={imageRef}
                className="asset-fullscreen-image"
                src={assetUrl}
                alt={assetName}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : is3DModel() && assetUrl ? (
              <iframe
                className="asset-fullscreen-model"
                src={assetUrl}
                title={assetName}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : assetUrl ? (
              <div className="asset-fullscreen-unsupported">
                <p>This asset type cannot be previewed in fullscreen.</p>
                <button 
                  className="asset-fullscreen-btn"
                  onClick={handleDownload}
                  style={{ marginTop: '1rem' }}
                >
                  <FiDownload size={18} /> Download
                </button>
              </div>
            ) : (
              <div className="asset-fullscreen-unsupported">
                <p>No preview available for this asset.</p>
              </div>
            )}
          </div>

          {isVideo() && assetUrl && (
            <div className="asset-fullscreen-footer">
              <div className="video-controls">
                <button 
                  className="play-pause-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssetFullScreen;