import React from "react";
import PropTypes from "prop-types";
import TextureViewer from "./TextureViewer";

const ViewItemMedia = ({ media }) => {
  let mediaArray = media;

  // Convert object to array if media is an object
  if (!Array.isArray(mediaArray)) {
    mediaArray = Object.keys(mediaArray).map((key) => ({
      [key]: media[key],
    }));
  }

  return (
    <div>
      <div className="view_media_main">
        <div className="texture_viewer_main">
          <TextureViewer textures={media} />
        </div>
        <div className="media">
          {mediaArray.map((map, index) => {
            const label = Object.keys(map)[0];
            const src = Object.values(map)[0];

            if (!src) {
              return null;
            }

            return (
              <div key={index} className="media_item">
                <span className="label">{label}</span>
                {src.includes("video") ? ( // Check if it's a video file
                  <video controls width="200">
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={src} alt={`Media ${index}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ViewItemMedia.propTypes = {
  media: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
    PropTypes.objectOf(PropTypes.string),
  ]).isRequired,
};

ViewItemMedia.defaultProps = {
  media: [],
};

export default ViewItemMedia;
