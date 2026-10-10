import { useState, useEffect } from "react";
import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "firebase/functions";
import { getAuth } from "firebase/auth";
import "../../../firebase";
import { getAssetDownloadFilename } from "../../utils/assetDownload";

const DownloadButton = ({
  item,
  userProfile,
  setToastMessage,
  setToastState,
  setShowToast,
}) => {
  const {
  isDownloaded,
  addToDownloads
} = useSaveToDownloads(item.id, item);
  const navigate = useNavigate();
  const [isContributor, setIsContributor] = useState(false);

  useEffect(() => {
    const checkContributorStatus = async () => {
      if (!userProfile?.uid) {
        setIsContributor(false);
        return;
      }

      try {
        const contributorRef = doc(db, "Contributors", userProfile.uid);
        const contributorSnap = await getDoc(contributorRef);
        setIsContributor(contributorSnap.exists());
      } catch (error) {
        console.error("Error checking contributor status:", error);
        setIsContributor(false);
      }
    };

    if (userProfile?.uid) {
      checkContributorStatus();
    }
  }, [userProfile]);

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    if (!userProfile?.subscription) return false;

    const sub = userProfile.subscription;

    // Check 1: Status must be "active"
    if (sub.status !== "active") return false;

    // Check 2: Subscription should not be expired
    const now = new Date();
    const expiresAt = sub.expiresAt?.toDate
      ? sub.expiresAt.toDate()
      : new Date(sub.expiresAt);
    if (expiresAt < now) return false;

    // Check 3: Check download limits
    if (sub.downloadsUsed >= sub.downloadLimit) {
      setToastMessage("Monthly download limit reached!");
      setToastState("warning");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return false;
    }

    return true;
  };

  // Check if user has purchased this specific item
  const hasPurchasedItem = userProfile?.purchasedItems?.includes(item.id);

  const isFree = () => {
    if (item.price === "free" || item.price === 0 || item.price === "0")
      return true;
    if (item.price === "paid") return false;

    // For numeric prices
    const price = Number(item.price) || 0;
    return price === 0;
  };

  const isPaid = () => {
    if (item.price === "paid") return true;
    if (item.price === "free") return false;

    // For numeric prices
    const price = Number(item.price) || 0;
    return price > 0;
  };

  // ✅ FIXED: Generate download URL via Cloud Function
  const generateDownloadUrl = async () => {
    try {
      console.log("🔗 Generating download URL via HTTP Cloud Function...");

      // ✅ Get current user and token
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      console.log("🔑 Token obtained, calling HTTP endpoint...");

      // ✅ HTTP POST request to the onRequest function
      const response = await fetch(
        "https://us-central1-sham-marianas.cloudfunctions.net/generateDownloadUrl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assetId: item.id,
          }),
        }
      );

      console.log("📊 Response status:", response.status);

      // ✅ Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ HTTP error response:", errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ HTTP Function response:", result);

      // ✅ Return the data (now it's direct, not wrapped in result.data)
      return result; // {success: true, url: "...", fileName: "...", expiresIn: 900}
    } catch (error) {
      console.error("❌ HTTP Cloud Function error:", error);
      throw error;
    }
  };

  // ✅ Track download in Firestore
  const trackDownloadInFirestore = async (assetId) => {
    try {
      const assetRef = doc(db, "Assets", assetId);

      // Use Firestore increment to atomically update download count
      await updateDoc(assetRef, {
        downloadsCount: increment(1),
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
      case "prompts":
        pushUrl(item.promptFile);
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
              if (img.sizes && typeof img.sizes === "object") {
                const original =
                  img.sizes.original || Object.values(img.sizes)[0];
                pushUrl(original);
              } else {
                pushUrl(img.url);
              }
            }
          });
        } else pushUrl(item.images);
        break;
      case "textures":
        if (Array.isArray(item.textures)) {
          item.textures.forEach(pushUrl);
        } else pushUrl(item.textures);

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
    return urls.filter(Boolean);
  };

  const downloadURL = async (urlOrObj) => {
    try {
      let url = urlOrObj;

      if (typeof urlOrObj === "object" && urlOrObj.url) {
        url = urlOrObj.url;
      }

      if (typeof url !== "string") {
        console.warn("Invalid URL for download:", urlOrObj);
        return;
      }

      console.log("⬇️ Downloading via fetch-blob:", url);

      // Extract filename from URL
      const filename = getAssetDownloadFilename(item.title, url);

      try {
        // Use fetch-blob method for better compatibility
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Failed to fetch: ${response.status}`);

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);

        console.log("✅ Download initiated via blob:", filename);
      } catch (_fetchError) {
        console.log("🔄 Using direct method as fallback");
        // Fallback to original method
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error("❌ Download error:", e);
      if (typeof urlOrObj === "string") window.open(urlOrObj, "_blank");
    }
  };

  const handlePaidDownload = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setToastMessage("Please sign in to download.");
      setToastState("error");
      setShowToast(true);
      return;
    }

    try {
      console.log("💰 Handling paid download for asset:", item.id);

      // Step 1: Call HTTP Cloud Function for download URL
      const downloadData = await generateDownloadUrl();

      // ✅ Check if response has success flag
      if (!downloadData.success) {
        throw new Error(downloadData.error || "Download failed");
      }

      // Step 2: ✅ NEW - FETCH AND DOWNLOAD METHOD (This will force download)
      const fileName = getAssetDownloadFilename(item.title, downloadData.url);
      console.log(
        "⬇️ Force downloading file via fetch-blob method:",
        fileName
      );

      // New function to handle force download
      const downloadFileFromUrl = async (url, fileName) => {
        try {
          console.log("📥 Fetching file as blob...");

          // Fetch the file
          const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
          }

          // Get the blob data
          const blob = await response.blob();

          // Create a blob URL from the blob data
          const blobUrl = window.URL.createObjectURL(blob);

          // Create download link
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = fileName || "download";
          link.style.display = "none";

          // Append to body and click
          document.body.appendChild(link);

          // Try different click methods for compatibility
          if (link.download !== undefined) {
            // Modern browsers with download support
            link.click();
          } else {
            // Fallback for older browsers
            window.open(blobUrl, "_blank");
          }

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);

          console.log("✅ File fetched and download triggered via blob");
          return true;
        } catch (fetchError) {
          console.error("❌ Fetch-blob method failed:", fetchError);

          // Fallback: Direct download method
          console.log("🔄 Trying direct download fallback...");
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName || "download";
          link.target = "_blank";

          document.body.appendChild(link);

          // Use proper click event
          if (document.createEvent) {
            const evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            link.dispatchEvent(evt);
          } else {
            link.click();
          }

          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
          }, 1000);

          return false;
        }
      };

      // Use the new download method
      await downloadFileFromUrl(downloadData.url, fileName);

      // Step 3: Save to downloads collection
      await addToDownloads(item);
      console.log("✅ Saved to downloads collection");

      // Step 5: Show success message
      setToastMessage(
        `"${fileName}" has been downloaded. Check your downloads folder.`
      );
      setToastState("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      console.log("✅ Paid asset downloaded successfully via force method");
    } catch (error) {
      console.error("❌ Download failed:", error);

      // ✅ Handle HTTP status codes
      if (
        error.message.includes("401") ||
        error.message.includes("Login required")
      ) {
        setToastMessage("Please login again");
        setToastState("error");
      } else if (
        error.message.includes("403") ||
        error.message.includes("permission") ||
        error.message.includes("limit")
      ) {
        setToastMessage("Subscribe or purchase to download");
        setToastState("warning");
      } else if (error.message.includes("404")) {
        setToastMessage("Asset not found");
        setToastState("error");
      } else {
        setToastMessage("Download failed. Please try again.");
        setToastState("error");
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleDownload = async () => {
    console.log("🚀 Starting download process...");

    // ✅ Check if user is contributor - prevent all downloads
    if (isContributor) {
      setToastMessage("Contributors cannot download files. Please login as a regular user.");
      setToastState("warning");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    // ✅ FIXED: Check if item is free or paid
    if (isFree()) {
      console.log("🆓 Free asset - downloading immediately");
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

      try {
        // Save to downloads first
        await addToDownloads(item);
        console.log("✅ Saved to downloads collection");

        // Track download in Firestore
        await trackDownloadInFirestore(item.id);

        // Then download files
        urls.forEach(async (url, index) => {
          await new Promise((resolve) => setTimeout(resolve, index * 500));
          await downloadURL(url);
        });

        setToastMessage(`Downloading ${urls.length} file(s)...`);
        setToastState("success");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (error) {
        console.error("❌ Error saving to downloads:", error);
        urls.forEach(downloadURL);
      }
      return;
    }

    // ✅ FIXED: For paid items
    if (isPaid()) {
      console.log("💰 Paid asset - checking access...");

      // Check 1: If user purchased this asset
      if (hasPurchasedItem) {
        console.log("✅ User purchased this asset - allowing download");
        await handlePaidDownload();
        return;
      }

      // Check 2: If user has active subscription
      if (hasActiveSubscription()) {
        console.log("✅ User has active subscription - allowing download");
        await handlePaidDownload();
        return;
      }

      // If no access, show subscription message
      console.log("🔒 No access to paid asset - redirecting to subscription");
      setToastMessage("Subscribe or purchase to download this asset");
      setToastState("warning");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      setTimeout(() => {
        navigate("/subscription");
      }, 1000);
      return;
    }

    // Fallback for old numeric prices
    const price = Number(item.price) || 0;
    if (price === 0) {
      // Free item
      const urls = getAssetUrls();
      urls.forEach(downloadURL);
    } else {
      // Paid item without access
      setToastMessage("Subscribe or purchase to download this asset");
      setToastState("warning");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/subscription");
      }, 1000);
    }
  };

  const handleSubscription = () => {
    console.log("👑 Redirecting to subscription page");
    navigate("/subscription");
  };

  // ✅ FIXED: Determine button state and content
   const getButtonContent = () => {
    // ✅ Check if user is contributor - ALWAYS DISABLE
    if (isContributor) {
      return {
        text: "Not Available",
        icon: "fas fa-ban",
        onClick: () => {
          setToastMessage("Contributors cannot download files.");
          setToastState("warning");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        },
        enabled: false,
        className: "disabled_btn",
      };
    }

    // Paid items with subscription or purchase - downloadable
    if (hasActiveSubscription() || hasPurchasedItem) {
      return {
        text: isDownloaded ? "Downloaded" : "Download",
        icon: "fas fa-download",
        onClick: handleDownload,
        enabled: true,
        className: "download_btn",
      };
    }

 if (isFree()) {
      return {
        text: isDownloaded ? "Downloaded" : "Download",
        icon: "fas fa-download",
        onClick: handleDownload,
        enabled: true,
        className: "download_btn",
      };
    }

    // Paid items without subscription - show subscribe button
    if (isPaid()) {
      return {
        text: "Subscribe to Download",
        icon: "fas fa-crown",
        onClick: handleSubscription,
        enabled: true,
        className: "subscribe_btn",
      };
    }

    // Fallback
    return {
      text: "Download",
      icon: "fas fa-download",
      onClick: handleDownload,
      enabled: true,
      className: "download_btn",
    };
  };

  const buttonConfig = getButtonContent();

  return (
    <button
      className={`action_button ${buttonConfig.className}`}
      onClick={buttonConfig.onClick}
      disabled={!buttonConfig.enabled}
      style={{
        cursor: buttonConfig.enabled ? "pointer" : "not-allowed",
        opacity: buttonConfig.enabled ? 1 : 0.6,
      }}
      title={isContributor ? "Contributors cannot download" : ""}
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
    subscription: PropTypes.shape({
      status: PropTypes.string,
      expiresAt: PropTypes.any,
      downloadsUsed: PropTypes.number,
      downloadLimit: PropTypes.number,
    }),
  }),
  setToastMessage: PropTypes.func.isRequired,
  setToastState: PropTypes.func.isRequired,
  setShowToast: PropTypes.func.isRequired,
};

export default DownloadButton;
