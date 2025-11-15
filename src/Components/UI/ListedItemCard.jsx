import React from "react";
import { Link } from "react-router-dom";
import AddToBookmark from "./AddToBookmark";
import { useUser } from "../../Context/UserProvider";
import { useNavigate } from "react-router-dom";

const ListedItemCard = ({ id, data, rating }) => {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  // ✅ FIXED: Consistent author name extraction
  const getAuthorName = (assetData) => {
    if (!assetData) return "Unknown Author";

    // Priority order for author name - same as AssetManagement.jsx
    if (assetData.authorName && assetData.authorName !== "Unknown Author")
      return assetData.authorName;
    if (assetData.author && assetData.author !== "Unknown Author")
      return assetData.author;
    if (assetData.userDisplayName) return assetData.userDisplayName;
    if (assetData.userName) return assetData.userName;
    if (assetData.displayName) return assetData.displayName;
    if (assetData.uploadedBy) return assetData.uploadedBy;
    if (assetData.createdBy) return assetData.createdBy;
    if (assetData.updatedBy) return assetData.updatedBy;

    // Fallback to email only if no name found
    if (assetData.userEmail) return assetData.userEmail;
    if (assetData.email) return assetData.email;

    return "Unknown Author";
  };

  // Get author name from data
  const authorName = getAuthorName(data);

  // Check if item is free or paid
  const isFree = data.price === "free" || data.price === 0;
  const isPaid = data.price === "paid";

  // Check if user has active subscription
  const hasActiveSubscription = currentUser?.subscriptionActive === true;

  // Check if user has purchased this specific item
  const hasPurchasedItem = currentUser?.purchasedItems?.includes(id);

  const getAssetUrls = () => {
    const urls = [];
    switch ((data.type || "").toLowerCase()) {
      case "models":
      case "printables":
        if (data.model) urls.push(data.model);
        break;
      case "scripts":
        if (data.script) urls.push(data.script);
        break;
      case "videos":
        if (data.video) urls.push(data.video);
        break;
      case "graphics":
        if (data.graphicsTemplate) urls.push(data.graphicsTemplate);
        break;
      case "mockups":
        if (data.mockupFile) urls.push(data.mockupFile);
        break;
      case "fonts":
        if (data.fontFile) urls.push(data.fontFile);
        break;
      case "video-templates":
        if (data.videoTemplateFile) urls.push(data.videoTemplateFile);
        break;
      case "hdris":
        if (data.hdri) urls.push(data.hdri);
        break;
      case "icons":
        if (Array.isArray(data.icons)) urls.push(...data.icons);
        break;
      case "images":
        if (Array.isArray(data.images)) urls.push(...data.images);
        break;
      case "textures":
        if (data.maps && typeof data.maps === "object") {
          urls.push(...Object.values(data.maps).filter(Boolean));
        }
        break;
      default:
        if (data.other) urls.push(data.other);
        break;
    }
    return urls.filter(Boolean);
  };

  const downloadURL = (url) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      // window.open(url, '_blank');
    }
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();

    const urls = getAssetUrls();

    // Free items: download immediately
    if (isFree) {
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // Purchased items or users with active subscription: allow download
    if (hasPurchasedItem || hasActiveSubscription) {
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // For paid items without subscription, redirect to subscription page
    if (isPaid && !hasActiveSubscription) {
      navigate("/subscription");
      return;
    }

    // Fallback for old numeric prices
    const price = Number(data.price) || 0;
    if (price > 0 && !hasActiveSubscription && !hasPurchasedItem) {
      navigate("/subscription");
      return;
    }
  };

  return (
    <div className="">
      <div className="item_card" key={id}>
        <div
          className="card_image"
          style={{
            aspectRatio: data.type === "textures" ? "1 / 1" : undefined,
          }}
        >
          {data.discount > 0 ? (
            <div className="discount_card">
              <span>
                <strong>-{data.discount}%</strong>
              </span>
            </div>
          ) : null}
          <Link className="card_image" to={`/View/${id}`}>
            {(() => {
              const src = data.thumbnail;

              // Detect video
              const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(src);

              if (isVideo) {
                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      if (video) video.play();
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      if (video) {
                        video.pause();
                        video.currentTime = 0;
                      }
                    }}
                  >
                    <video
                      src={src}
                      muted
                      loop
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                );
              }

              // ✅ Image fallback (normal case)
              return <img src={src} alt="placeholder" />;
            })()}
          </Link>
        </div>

        <div className="card_content">
          <div className="title">
            <Link
              to={`/View/${id}`}
              className="title-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {data.title}
            </Link>
            <br />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "5px",
              }}
            >
              <span className="publisher">by {authorName}</span>

              <span style={{ display: "flex", gap: "12px" }}>
                <a
                  href="#"
                  onClick={handleDownloadClick}
                  style={{ cursor: "pointer", color: "inherit" }}
                >
                  <i className="fa-solid fa-download"></i>
                </a>
                <AddToBookmark assetId={id} />
              </span>
            </div>
          </div>

          <div className="details">
            <span className="price">
              <strong>
                {data.price === "free" || data.price === 0 ? "Free" : "Paid"}
              </strong>
            </span>
            {/* <span className="rating">
              <div className="icons">
                {Array.from({ length: rating }, (_, i) => (
                  <i key={`filled_${i}`} className="icon fas fa-star"></i> // Added unique key here
                ))}
                {Array.from({ length: 5 - rating }, (_, i) => (
                  <i key={`unfilled_${i}`} className="icon far fa-star"></i> // And here
                ))}
              </div>
              <span className="rating_count">125</span>
            </span> */}
          </div>
          {/* <button className="add_to_cart_btn">
          <i className="icon fas fa-shopping-cart"></i> Add to cart
        </button> */}
        </div>
      </div>
    </div>
  );
};

export default ListedItemCard;
