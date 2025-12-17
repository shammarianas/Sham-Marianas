import React from "react";
import { Link } from "react-router-dom";
import AddToBookmark from "./AddToBookmark";
import { useUser } from "../../Context/UserProvider";
import { useNavigate } from "react-router-dom";
import SimpleModelViewer from "./SimpleModelViewer";
import { getFunctions, httpsCallable } from "firebase/functions";

const ListedItemCard = ({ id, data, rating, userProfile }) => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const profile = userProfile || currentUser;

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

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    const urls = getAssetUrls();

    // ✅ پہلے چیک کریں کہ user login ہے یا نہیں
    if (!currentUser) {
      alert("Please login to download");
      navigate("/login");
      return;
    }

    // Free items: download immediately
    if (isFree) {
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // Purchased items: direct download
    if (hasPurchasedItem) {
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // ✅ Subscription check - یہاں Cloud Function کال ہوگی
    if (hasActiveSubscription) {
      // Check download limits
      if (
        profile?.subscription?.downloadsUsed >=
        profile?.subscription?.downloadLimit
      ) {
        alert("Monthly download limit reached!");
        return;
      }

      // ✅ Cloud Function call for subscribed users
      try {
        const functions = getFunctions();
        const generateDownloadUrlFunc = httpsCallable(
          functions,
          "generateDownloadUrl"
        );

        console.log("📞 Calling Cloud Function for asset:", id);
        const result = await generateDownloadUrlFunc({ assetId: id });

        // Download file
        const a = document.createElement("a");
        a.href = result.data.url;
        a.download = result.data.fileName || `download_${id}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("✅ Download started via Cloud Function");
      } catch (error) {
        console.error("❌ Cloud Function error:", error);

        // Specific error handling
        if (
          error.code === "unauthenticated" ||
          error.message.includes("Login")
        ) {
          alert("Please login again. Session expired.");
        } else if (error.code === "permission-denied") {
          alert("You don't have permission to download this asset.");
        } else {
          alert("Download failed: " + error.message);

          // Fallback: try direct download if Cloud Function fails
          if (urls.length) {
            urls.forEach(downloadURL);
          }
        }
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

    // اگر سب کچھ fail ہو جائے تو direct download کرنے کی کوشش کریں
    if (urls.length) {
      urls.forEach(downloadURL);
    }
  };

  // Function to detect 3D model files
  const is3DModel = (url) => {
    if (!url) return false;
    const extension = url.split(".").pop()?.toLowerCase().split("?")[0];
    return ["glb", "gltf", "fbx", "obj", "stl", "3ds"].includes(extension);
  };

  // Get 3D model URL from data
  const get3DModelUrl = () => {
    console.log("🔍 Checking 3D model data:", {
      thumbnailModel: data.thumbnailModel,
      model: data.model,
      thumbnail: data.thumbnail,
      type: data.type,
    });

    // Function to check if file is supported 3D format (ZIP KO EXCLUDE KARO)
    const isSupported3DFormat = (url) => {
      if (!url) return false;
      const extension = url.split(".").pop()?.toLowerCase().split("?")[0];
      // ZIP KO HATA DO - sirf 3D formats rahenge
      return ["glb", "gltf", "fbx", "obj", "stl", "3ds"].includes(extension);
    };

    // Priority 1: thumbnailModel field (preview ke liye) - ZIP FREE
    if (data.thumbnailModel && isSupported3DFormat(data.thumbnailModel)) {
      console.log(
        "✅ Using thumbnailModel for 3D preview:",
        data.thumbnailModel
      );
      return data.thumbnailModel;
    }

    // Priority 2: Direct model file - ONLY IF NOT ZIP
    if (data.model && isSupported3DFormat(data.model)) {
      console.log("✅ Using model for 3D preview:", data.model);
      return data.model;
    }

    // Priority 3: Thumbnail is 3D model
    if (data.thumbnail && isSupported3DFormat(data.thumbnail)) {
      console.log("✅ Using thumbnail for 3D preview:", data.thumbnail);
      return data.thumbnail;
    }

    console.log("❌ No supported 3D model found for preview");
    return null;
  };

  const modelUrl = get3DModelUrl();
  const is3D = modelUrl !== null;

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
          <Link className="card_image" to={`/View/${data.slug}`}>
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

              // 3D Model Preview
              if (is3D) {
                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <SimpleModelViewer modelUrl={modelUrl} />
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                      }}
                    >
                      3D MODEL
                    </div>
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
              to={`/View/${data.slug}`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListedItemCard;
