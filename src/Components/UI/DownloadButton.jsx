import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

const DownloadButton = ({
  item,
  userProfile,
  setToastMessage,
  setToastState,
  setShowToast,
}) => {
  const { isDownloaded, addToDownloads, error } = useSaveToDownloads(
    item.id,
    item
  );
  const navigate = useNavigate();

  // Check if item is free or paid
  const isFree = item.price === "free";
  const isPaid = item.price === "paid";

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscriptionActive === true;

  // Check if user has purchased this specific item
  const hasPurchasedItem = userProfile?.purchasedItems?.includes(item.id);

  // ✅ ADD THIS FUNCTION: Track download in Firestore
  const trackDownloadInFirestore = async (assetId) => {
    try {
      const assetRef = doc(db, "Assets", assetId);
      
      // Use Firestore increment to atomically update download count
      await updateDoc(assetRef, {
        downloads: increment(1),
        lastDownloadedAt: serverTimestamp(),
      });
      
      console.log("✅ Download tracked for asset:", assetId);
      return true;
    } catch (error) {
      console.error("❌ Failed to track download:", error);
      return false;
    }
  };

  const getAssetUrls = () => {
    const urls = [];

    console.log("📥 Downloading item data:", {
      id: item.id,
      type: item.type,
      title: item.title,
    });

    const pushUrl = (u) => {
      if (!u) return;
      if (typeof u === "string") urls.push(u);
      else if (typeof u === "object" && u.url) urls.push(u.url);
    };

    switch ((item.type || "").toLowerCase()) {
      case "models":
      case "printables":
        pushUrl(item.model);
        break;
      case "scripts":
        pushUrl(item.script);
        break;
      case "videos":
        pushUrl(item.video);
        break;
      case "graphics":
        pushUrl(item.graphicsTemplate);
        break;
      case "mockups":
        pushUrl(item.mockupFile);
        break;
      case "fonts":
        pushUrl(item.fontFile);
        break;
      case "video-templates":
        pushUrl(item.videoTemplateFile);
        break;
      case "hdris":
        pushUrl(item.hdri);
        break;
      case "icons":
        if (Array.isArray(item.icons)) {
          item.icons.forEach(pushUrl);
        } else pushUrl(item.icons);
        break;
      case "images":
        if (Array.isArray(item.images)) {
          item.images.forEach((img) => {
            if (typeof img === "string") pushUrl(img);
            else if (img && typeof img === "object") {
              // Check sizes object first
              if (img.sizes && typeof img.sizes === "object") {
                const original =
                  img.sizes.original || Object.values(img.sizes)[0];
                pushUrl(original);
              } else {
                pushUrl(img.url); // fallback
              }
            }
          });
        } else pushUrl(item.images);
        break;
      case "textures":
        if (Array.isArray(item.textures)) {
          item.textures.forEach(pushUrl);
        } else pushUrl(item.textures);

        // Also check individual texture maps
        [
          "ambientOcclusion",
          "baseColor",
          "displacement",
          "normal",
          "roughness",
          "metallic",
          "bump",
          "idmap",
        ].forEach((map) => {
          pushUrl(item[map]);
        });
        break;
      default:
        pushUrl(item.other);
        break;
    }

    console.log("📥 Final URLs to download:", urls);
    return urls.filter(Boolean); // remove any undefined/null
  };

  const downloadURL = (urlOrObj) => {
    try {
      let url = urlOrObj;

      // If it's an object with a url property, extract it
      if (typeof urlOrObj === "object" && urlOrObj.url) {
        url = urlOrObj.url;
      }

      if (typeof url !== "string") {
        console.warn("Invalid URL for download:", urlOrObj);
        return;
      }

      console.log("⬇️ Downloading:", url);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from URL
      const filename = url.split("/").pop().split("?")[0];
      a.download = filename || "download";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      console.log("✅ Download initiated for:", filename);
    } catch (e) {
      console.error("❌ Download error:", e);
      // Fallback: open in new tab
      if (typeof urlOrObj === "string") window.open(urlOrObj, "_blank");
    }
  };

  const handleDownload = async () => {
    console.log("🚀 Starting download process...");
    const urls = getAssetUrls();

    if (urls.length === 0) {
      console.error("❌ No downloadable files found for this asset");
      setToastMessage("No downloadable files found for this asset");
      setToastState("error");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    console.log(`📁 Found ${urls.length} file(s) to download`);

    // ✅ TRACK DOWNLOAD IN FIRESTORE FIRST
    const downloadTracked = await trackDownloadInFirestore(item.id);

    // Free items: download immediately
    if (isFree) {
      console.log("🆓 Free asset - downloading immediately");
      try {
        // Save to downloads first
        await addToDownloads(item);
        console.log("✅ Saved to downloads collection");

        // Then download files
        urls.forEach((url, index) => {
          setTimeout(() => {
            downloadURL(url);
          }, index * 500); // Stagger downloads by 500ms
        });

        setToastMessage(`Downloading ${urls.length} file(s)...`);
        setToastState("success");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (error) {
        console.error("❌ Error saving to downloads:", error);
        // Still try to download even if save fails
        urls.forEach(downloadURL);
      }
      return;
    }

    // Purchased items or users with active subscription: allow download
    if (hasPurchasedItem || hasActiveSubscription) {
      console.log("💳 Paid asset with access - downloading");
      try {
        // Save to downloads first
        await addToDownloads(item);
        console.log("✅ Saved to downloads collection");

        // Then download files
        urls.forEach((url, index) => {
          setTimeout(() => {
            downloadURL(url);
          }, index * 500);
        });

        setToastMessage(`Downloading ${urls.length} file(s)...`);
        setToastState("success");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (error) {
        console.error("❌ Error saving to downloads:", error);
        // Still try to download even if save fails
        urls.forEach(downloadURL);
      }
      return;
    }

    // For paid items without subscription, show subscription message
    if (isPaid && !hasActiveSubscription) {
      console.log("🔒 Paid asset without subscription - redirecting");
      setToastMessage("Subscription required to download paid assets");
      setToastState("warning");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    // Fallback for old numeric prices
    const price = Number(item.price) || 0;
    if (price > 0 && !hasActiveSubscription && !hasPurchasedItem) {
      console.log("💰 Old paid asset without subscription - redirecting");
      setToastMessage("Subscription required to download paid assets");
      setToastState("warning");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }
  };

  const handleSubscription = () => {
    console.log("👑 Redirecting to subscription page");
    navigate("/subscription");
  };

  // Determine button state and content
  const getButtonContent = () => {
    // Free items - always downloadable
    if (isFree) {
      return {
        text: isDownloaded ? "Downloaded" : "Download",
        icon: "fas fa-download",
        onClick: handleDownload,
        enabled: true,
        className: "download_btn",
      };
    }

    // Paid items with subscription or purchase - downloadable
    if (hasActiveSubscription || hasPurchasedItem) {
      return {
        text: isDownloaded ? "Downloaded" : "Download",
        icon: "fas fa-download",
        onClick: handleDownload,
        enabled: true,
        className: "download_btn",
      };
    }

    // Paid items without subscription - show subscribe button
    if (isPaid && !hasActiveSubscription) {
      return {
        text: "Subscribe to Download",
        icon: "fas fa-crown",
        onClick: handleSubscription,
        enabled: true,
        className: "subscribe_btn",
      };
    }

    // Fallback for old numeric prices (backward compatibility)
    const price = Number(item.price) || 0;
    if (price === 0) {
      return {
        text: isDownloaded ? "Downloaded" : "Download",
        icon: "fas fa-download",
        onClick: handleDownload,
        enabled: true,
        className: "download_btn",
      };
    }

    // Old paid items without subscription
    return {
      text: "Subscribe to Download",
      icon: "fas fa-crown",
      onClick: handleSubscription,
      enabled: true,
      className: "subscribe_btn",
    };
  };

  const buttonConfig = getButtonContent();

  return (
    <button
      className={`action_button ${buttonConfig.className}`}
      onClick={buttonConfig.onClick}
      disabled={!buttonConfig.enabled}
    >
      <i className={`icon ${buttonConfig.icon}`}></i>
      {buttonConfig.text}
    </button>
  );
};

DownloadButton.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    model: PropTypes.string,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    images: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    video: PropTypes.string,
    script: PropTypes.string,
    hdri: PropTypes.string,
    graphicsTemplate: PropTypes.string,
    mockupFile: PropTypes.string,
    fontFile: PropTypes.string,
    videoTemplateFile: PropTypes.string,
    icons: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    textures: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    other: PropTypes.string,
  }).isRequired,
  userProfile: PropTypes.shape({
    purchasedItems: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    subscriptionActive: PropTypes.bool,
  }),
  setToastMessage: PropTypes.func.isRequired,
  setToastState: PropTypes.func.isRequired,
  setShowToast: PropTypes.func.isRequired,
};

export default DownloadButton;