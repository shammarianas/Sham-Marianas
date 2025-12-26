import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddToBookmark from "./AddToBookmark";
import { useUser } from "../../Context/UserProvider";
import { useNavigate } from "react-router-dom";
import SimpleModelViewer from "./SimpleModelViewer";
import { getFunctions, httpsCallable } from "firebase/functions";
import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import { doc, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";

const ListedItemCard = ({ id, data, rating, userProfile }) => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [isContributor, setIsContributor] = useState(false);
  const profile = userProfile || currentUser;
  const { isDownloaded, addToDownloads, error } = useSaveToDownloads(id, data);
  const auth = getAuth();

  useEffect(() => {
    const checkContributorStatus = async () => {
      if (!currentUser?.uid) {
        setIsContributor(false);
        return;
      }

      try {
        const contributorRef = doc(db, "Contributors", currentUser.uid);
        const contributorSnap = await getDoc(contributorRef);
        setIsContributor(contributorSnap.exists());
      } catch (error) {
        console.error("Error checking contributor status:", error);
        setIsContributor(false);
      }
    };

    if (currentUser?.uid) {
      checkContributorStatus();
    }
  }, [currentUser]);

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
      if (Array.isArray(data.icons)) {
        data.icons.forEach(item => {
          if (typeof item === 'string') urls.push(item);
          else if (item && typeof item === 'object') {
            // Handle icon objects with sizes
            if (item.sizes && typeof item.sizes === 'object') {
              const original = item.sizes.original || Object.values(item.sizes)[0];
              urls.push(original);
            } else if (item.url) {
              urls.push(item.url);
            }
          }
        });
      } else if (data.icons) {
        urls.push(data.icons);
      }
      break;
    case "images":
      if (Array.isArray(data.images)) {
        data.images.forEach(item => {
          if (typeof item === 'string') {
            urls.push(item);
          } else if (item && typeof item === 'object') {
            // ✅ FIXED: Handle image objects with sizes property
            if (item.sizes && typeof item.sizes === 'object') {
              // Get the original size or first available size
              const original = item.sizes.original || Object.values(item.sizes)[0];
              urls.push(original);
            } else if (item.url) {
              urls.push(item.url);
            }
          }
        });
      } else if (data.images) {
        urls.push(data.images);
      }
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

 const downloadURL = async (urlOrObj) => {
  try {
    let url = urlOrObj;
    let filename = "download";

    // ✅ FIXED: Handle image objects with sizes
    if (typeof urlOrObj === "object") {
      if (urlOrObj.sizes && typeof urlOrObj.sizes === "object") {
        // Get the original size or first available size
        url = urlOrObj.sizes.original || Object.values(urlOrObj.sizes)[0];
      } else if (urlOrObj.url) {
        url = urlOrObj.url;
      }
      
      // Try to get filename from originalName property
      if (urlOrObj.originalName) {
        filename = urlOrObj.originalName;
      }
    }

    if (typeof url !== "string") {
      console.warn("Invalid URL for download:", urlOrObj);
      return;
    }

    console.log("⬇️ Downloading:", url);

    // Extract filename from URL if not already set
    if (filename === "download") {
      filename = url.split("/").pop().split("?")[0] || "download";
    }

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

      console.log("✅ Download initiated:", filename);
    } catch (fetchError) {
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

  // ✅ Check subscription validity
  const hasActiveSubscriptionCheck = () => {
    if (!profile?.subscription) return false;

    const sub = profile.subscription;

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
      alert("Monthly download limit reached!");
      return false;
    }

    return true;
  };

  // ✅ Generate download URL via Cloud Function
  const generateDownloadUrl = async () => {
    try {
      console.log("🔗 Generating download URL via HTTP Cloud Function...");

      // ✅ Get current user and token
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
            assetId: id,
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

  // ✅ NEW: Force download method
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

  const handlePaidDownload = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in to download.");
      return;
    }

    try {
      console.log("💰 Handling paid download for asset:", id);

      // Step 1: Call HTTP Cloud Function for download URL
      const downloadData = await generateDownloadUrl();

      // ✅ Check if response has success flag
      if (!downloadData.success) {
        throw new Error(downloadData.error || "Download failed");
      }

      // Step 2: Download file
      await downloadFileFromUrl(downloadData.url, downloadData.fileName);

      // Step 3: Save to downloads collection
      await addToDownloads(data);
      console.log("✅ Saved to downloads collection");

      // Step 4: Track download in Firestore
      await trackDownloadInFirestore(id);
      console.log("✅ Download tracked in Firestore");

      console.log("✅ Paid asset downloaded successfully via force method");
    } catch (error) {
      console.error("❌ Download failed:", error);

      // ✅ Handle HTTP status codes
      if (
        error.message.includes("401") ||
        error.message.includes("Login required")
      ) {
        alert("Please login again");
      } else if (
        error.message.includes("403") ||
        error.message.includes("permission") ||
        error.message.includes("limit")
      ) {
        alert("Subscribe or purchase to download");
      } else if (error.message.includes("404")) {
        alert("Asset not found");
      } else {
        alert("Download failed. Please try again.");
      }
    }
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    console.log("🚀 Starting download process...");

    // ✅ Check if user is contributor - prevent all downloads
    if (isContributor) {
      alert("Contributors cannot download files. Please login as a regular user.");
      return;
    }

    // ✅ login check
    if (!currentUser) {
      alert("Please login to download");
      navigate("/login");
      return;
    }

    const urls = getAssetUrls();

    // ✅ FIXED: Check if item is free or paid
    if (isFree) {
      console.log("🆓 Free asset - downloading immediately");

      if (urls.length === 0) {
        console.error("❌ No downloadable files found for this asset");
        alert("No downloadable files found for this asset");
        return;
      }

      try {
        // Save to downloads first
        await addToDownloads(data);
        console.log("✅ Saved to downloads collection");

        // Track download in Firestore
        await trackDownloadInFirestore(id);

        // Then download files
        for (let i = 0; i < urls.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, i * 500));
          await downloadURL(urls[i]);
        }

        console.log(`✅ Downloading ${urls.length} file(s)...`);
      } catch (error) {
        console.error("❌ Error saving to downloads:", error);
        urls.forEach(downloadURL);
      }
      return;
    }

    // ✅ FIXED: For paid items
    if (isPaid) {
      console.log("💰 Paid asset - checking access...");

      // Check 1: If user purchased this asset
      if (hasPurchasedItem) {
        console.log("✅ User purchased this asset - allowing download");
        await handlePaidDownload();
        return;
      }

      // Check 2: If user has active subscription
      if (hasActiveSubscriptionCheck()) {
        console.log("✅ User has active subscription - allowing download");
        await handlePaidDownload();
        return;
      }

      // If no access, show subscription message
      console.log("🔒 No access to paid asset - redirecting to subscription");
      alert("Subscribe or purchase to download this asset");

      setTimeout(() => {
        navigate("/subscription");
      }, 1000);
      return;
    }

    // Fallback for old numeric prices
    const price = Number(data.price) || 0;
    if (price === 0) {
      // Free item
      if (urls.length) {
        urls.forEach(downloadURL);
      }
    } else {
      // Paid item without access
      alert("Subscribe or purchase to download this asset");
      setTimeout(() => {
        navigate("/subscription");
      }, 1000);
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
              return <img  loading="lazy"  src={src} alt="placeholder" />;
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
  style={{ 
    cursor: isContributor ? "not-allowed" : "pointer", 
    color: "inherit",
    opacity: isContributor ? 0.5 : 1
  }}
  title={isContributor ? "Contributors cannot download" : "Download"}
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