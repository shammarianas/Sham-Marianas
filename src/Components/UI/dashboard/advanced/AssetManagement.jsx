import React, { useState, useEffect, useCallback } from "react";
import {
  FiBox,
  FiTrendingUp,
  FiDownload,
  FiUsers,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiStar,
  FiTag,
  FiUser,
  FiCalendar,
  FiImage,
  FiMoreHorizontal,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../../../firebase";
import Upload from "../../../../Pages/Upload";
import { useUser } from "../../../../Context/UserProvider";
import SimpleModelViewer from "../../../UI/SimpleModelViewer"; // Adjust path as needed

const AssetManagement = ({ createAssetNotification }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showCreateAssetDialog, setShowCreateAssetDialog] = useState(false);
  const [showEditAssetDialog, setShowEditAssetDialog] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Asset categories
  const ASSET_CATEGORIES = [
    "3D Models",
    "Textures",
    "HDRIs",
    "Videos",
    "Images",
    "Graphics",
    "Icons",
    "Fonts",
    "Scripts",
    "Mockups",
    "Audio",
    "Templates",
  ];

  const { currentUser } = useUser();

// When approving an asset
const handleApproveAsset = async (assetId, assetName, contributorId) => {
  try {
    // Your existing approval logic...
    
    // Create notification
    await createAssetNotification(contributorId, assetId, assetName, 'approved');
  } catch (error) {
    console.error("Error approving asset:", error);
  }
};

// When rejecting an asset  
const handleRejectAsset = async (assetId, assetName, contributorId) => {
  try {
    // Your existing rejection logic...
    
    // Create notification
    await createAssetNotification(contributorId, assetId, assetName, 'rejected');
  } catch (error) {
    console.error("Error rejecting asset:", error);
  }
};

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = normalizeDate(date);
    return d ? d.toLocaleDateString() : "N/A";
  };

  const normalizeDate = (value) => {
    if (!value) return null;
    if (value.toDate) {
      try {
        return value.toDate();
      } catch {
        return null;
      }
    }
    if (value.seconds) return new Date(value.seconds * 1000);
    if (typeof value === "number") return new Date(value);
    if (value instanceof Date) return value;
    return null;
  };

  // Function to detect 3D model files
  const is3DModel = (url) => {
    if (!url) return false;
    const extension = url.split(".").pop()?.toLowerCase().split("?")[0];
    return ["glb", "gltf", "fbx", "obj", "stl", "3ds"].includes(extension);
  };

  // Get 3D model URL from asset data
  const get3DModelUrl = (asset) => {
  if (!asset) return null;

  // Debug log
  console.log("🔍 Checking 3D model for asset:", {
    id: asset.id,
    title: asset.title,
    thumbnailModel: asset.thumbnailModel,
    model: asset.model,
    type: asset.type
  });

  // Priority 1: thumbnailModel field (preview ke liye)
  if (asset.thumbnailModel) {
    console.log("✅ Using thumbnailModel:", asset.thumbnailModel);
    return asset.thumbnailModel;
  }
  
  // Priority 2: Direct model file (check if it's 3D format)
  if (asset.model) {
    const is3DFile = asset.model.toLowerCase().match(/\.(gltf|glb|obj|stl|fbx|blend)($|\?)/);
    if (is3DFile) {
      console.log("✅ Using model field (3D format):", asset.model);
      return asset.model;
    } else {
      console.log("❌ Model field but not 3D format:", asset.model);
    }
  }
  
  // Priority 3: Thumbnail is 3D model (unlikely but check)
  if (asset.thumbnail) {
    const is3DFile = asset.thumbnail.toLowerCase().match(/\.(gltf|glb|obj|stl|fbx|blend)($|\?)/);
    if (is3DFile) {
      console.log("✅ Using thumbnail (3D format):", asset.thumbnail);
      return asset.thumbnail;
    }
  }

  console.log("❌ No suitable 3D model URL found");
  return null;
};

  // Check if asset has 3D model
 const has3DModel = (asset) => {
  if (!asset) return false;
  
  const hasThumbnailModel = !!asset.thumbnailModel;
  const has3DModelFile = asset.model && asset.model.toLowerCase().match(/\.(gltf|glb|obj|stl|fbx|blend)($|\?)/);
  const has3DThumbnail = asset.thumbnail && asset.thumbnail.toLowerCase().match(/\.(gltf|glb|obj|stl|fbx|blend)($|\?)/);
  
  const result = hasThumbnailModel || has3DModelFile || has3DThumbnail;
  
  console.log("🔍 has3DModel check:", {
    title: asset.title,
    hasThumbnailModel,
    has3DModelFile,
    has3DThumbnail,
    result
  });
  
  return result;
};

  // Download tracking function
  const trackDownload = async (assetId) => {
    try {
      const assetRef = doc(db, "Assets", assetId);
      const assetDoc = await getDoc(assetRef);

      if (assetDoc.exists()) {
        const currentDownloads = assetDoc.data().downloads || 0;
        await updateDoc(assetRef, {
          downloads: currentDownloads + 1,
          lastDownloadedAt: serverTimestamp(),
        });
        console.log("✅ Download tracked for asset:", assetId);
      }
    } catch (error) {
      console.error("❌ Failed to track download:", error);
    }
  };


  
  // Consistent author name extraction
  const getAuthorName = (asset) => {
    // 1. Highest priority – the fields we write in Upload
    if (asset.authorName && asset.authorName !== "Unknown Author")
      return asset.authorName;
    if (asset.author && asset.author !== "Unknown Author") return asset.author;
    if (asset.createdBy && asset.createdBy !== "Unknown Author")
      return asset.createdBy;
    if (asset.updatedBy && asset.updatedBy !== "Unknown Author")
      return asset.updatedBy;

    // 2. Legacy / profile fields
    if (asset.userDisplayName) return asset.userDisplayName;
    if (asset.displayName) return asset.displayName;
    if (asset.uploadedBy) return asset.uploadedBy;

    // 3. Fallback to email **only** if you really want it
    if (asset.userEmail) return asset.userEmail;
    if (asset.email) return asset.email;

    // 4. Absolute fallback
    return "Unknown Author";
  };

  // Get price display text
  const getPriceDisplay = (asset) => {
    // Check if price is string "free" or "paid"
    if (asset.price === "free") return "Free";
    if (asset.price === "paid") return "Paid";

    // Fallback for legacy numeric prices
    if (typeof asset.price === "number") {
      return asset.price > 0 ? "Paid" : "Free";
    }

    // Default to Free if no price set
    return "Free";
  };

  // Fetch All Assets with Real-time Updates
  const fetchAssets = useCallback(() => {
    setLoading(true);
    try {
      const q = query(collection(db, "Assets"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const assetsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAssets(assetsData);
          setLoading(false);
        },
        (error) => {
          console.error("Assets real-time listener error:", error);
          setError(`Failed to load assets: ${error.message}`);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      setError(`Failed to load assets: ${error.message}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = fetchAssets();

    // Cleanup on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchAssets]);

  // Manual refresh function
  const refreshAssets = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    setRefreshKey((prev) => prev + 1);
    setLoading(true);

    // Force re-fetch
    const q = query(collection(db, "Assets"));
    getDocs(q)
      .then((querySnapshot) => {
        const assetsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("✅ Assets refreshed:", assetsData.length);
        setAssets(assetsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Refresh failed:", error);
        setError(`Failed to refresh assets: ${error.message}`);
        setLoading(false);
      });
  }, []);

  // Asset management handlers
  const handleToggleAssetFeatured = async (assetId) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      try {
        await updateDoc(doc(db, "Assets", assetId), {
          isFeatured: !asset.isFeatured,
          updatedAt: serverTimestamp(),
        });
        console.log("✅ Asset featured status toggled");
      } catch (error) {
        console.error("❌ Failed to toggle featured:", error);
        setError(`Failed to update asset: ${error.message}`);
      }
    }
  };

  const handleToggleAssetTrending = async (assetId) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      try {
        await updateDoc(doc(db, "Assets", assetId), {
          isTrending: !asset.isTrending,
          updatedAt: serverTimestamp(),
        });
        console.log("✅ Asset trending status toggled");
      } catch (error) {
        console.error("❌ Failed to toggle trending:", error);
        setError(`Failed to update asset: ${error.message}`);
      }
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteDoc(doc(db, "Assets", assetId));
        console.log("✅ Asset deleted");
        setShowAssetDialog(false);
      } catch (error) {
        console.error("❌ Failed to delete asset:", error);
        setError(`Failed to delete asset: ${error.message}`);
      }
    }
  };

  const handleEditAsset = (asset) => {
    setAssetToEdit(asset);
    setShowEditAssetDialog(true);
  };

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesText =
      (asset.name || asset.title || "")
        .toLowerCase()
        .includes(assetSearchTerm.toLowerCase()) ||
      (asset.description || "")
        .toLowerCase()
        .includes(assetSearchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || !selectedCategory
        ? true
        : (asset.category || asset.type || "").toLowerCase() ===
          selectedCategory.toLowerCase();

    return matchesText && matchesCategory;
  });

  // Statistics
  const stats = {
    total: assets.length,
    featured: assets.filter((a) => a.isFeatured).length,
    trending: assets.filter((a) => a.isTrending).length,
    totalDownloads: assets.reduce((sum, a) => sum + (a.downloads || 0), 0),
    freeAssets: assets.filter(
      (a) =>
        a.price === "free" || (typeof a.price === "number" && a.price === 0)
    ).length,
    paidAssets: assets.filter(
      (a) => a.price === "paid" || (typeof a.price === "number" && a.price > 0)
    ).length,
  };

  return (
    <div className="asset-management-enhanced">
      {/* Header */}
      <div className="asset-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBox className="header-icon asset-icon" />
            Asset Management
          </h2>
          <p className="header-subtitle">
            Manage and monitor all digital assets on the platform
          </p>
        </div>
        <div className="header-actions">
          <span className="asset-badge-count">
            {filteredAssets.length} assets
          </span>
          <button
            className="action-button secondary"
            onClick={refreshAssets}
            title="Refresh Assets"
            disabled={loading}
          >
            <FiRefreshCw
              className={`button-icon ${loading ? "spinning" : ""}`}
            />
            Refresh
          </button>
          <button
            className="action-button upload-button"
            onClick={() => setShowCreateAssetDialog(true)}
          >
            <FiPlus className="button-icon" />
            Upload Asset
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          {error}
          <button onClick={() => setError(null)} className="close-error">
            <FiX />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
  <div className="report-stat-card primary">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiBox />
      </div>
      <div>
        <h3 className="report-stat-title">Total Assets</h3>
        <div className="report-stat-value">{stats.total}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        All platform assets
      </div>
    </div>
  </div>

  <div className="report-stat-card success">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiDownload />
      </div>
      <div>
        <h3 className="report-stat-title">Total Downloads</h3>
        <div className="report-stat-value">{stats.totalDownloads}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        All time downloads
      </div>
    </div>
  </div>

  <div className="report-stat-card warning">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiDollarSign />
      </div>
      <div>
        <h3 className="report-stat-title">Free Assets</h3>
        <div className="report-stat-value">{stats.freeAssets}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        Available for free
      </div>
    </div>
  </div>

  <div className="report-stat-card info">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiUsers />
      </div>
      <div>
        <h3 className="report-stat-title">Paid Assets</h3>
        <div className="report-stat-value">{stats.paidAssets}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        Premium content
      </div>
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="content-card filters-card w-100">
        <div className="card-body">
          <div className="asset-filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search assets..."
                value={assetSearchTerm}
                onChange={(e) => setAssetSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {ASSET_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredAssets.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiBox className="empty-icon" />
            <h3 className="empty-title">No assets found</h3>
            <p className="empty-text">
              {assetSearchTerm
                ? "No assets match your search criteria."
                : "No assets are currently available."}
            </p>
            <button
              className="action-button upload-button"
              onClick={() => setShowCreateAssetDialog(true)}
            >
              <FiUpload className="button-icon" />
              Upload First Asset
            </button>
          </div>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredAssets.map((asset) => {
            const modelUrl = get3DModelUrl(asset);
            const is3D = modelUrl !== null;

            console.log("🔍 Asset Debug:", {
              assetId: asset.id,
              assetTitle: asset.title,
              is3D: is3D,
              modelUrl: modelUrl,
              thumbnailModel: asset.thumbnailModel,
              model: asset.model,
              thumbnail: asset.thumbnail,
            });
            return (
              <div key={asset.id} className="asset-card">
                <div className="asset-image-wrapper">
                  {/* 3D Model Preview */}
                  {is3D ? (
                    <div className="asset-3d-preview">
                      <SimpleModelViewer modelUrl={modelUrl} />
                      <div className="asset-3d-badge">3D MODEL</div>
                    </div>
                  ) : asset.thumbnail ||
                    asset.images?.[0] ||
                    asset.icons?.[0] ? (
                    (() => {
                      const src =
                        asset.thumbnail ||
                        (Array.isArray(asset.images) && asset.images[0]) ||
                        (Array.isArray(asset.icons) && asset.icons[0]) ||
                        "";

                      const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(src);

                      if (isVideo) {
                        return (
                          <div
                            className="asset-image"
                            style={{ position: "relative", overflow: "hidden" }}
                            onMouseEnter={(e) => {
                              const video =
                                e.currentTarget.querySelector("video");
                              if (video) video.play();
                            }}
                            onMouseLeave={(e) => {
                              const video =
                                e.currentTarget.querySelector("video");
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

                      // ✅ Image fallback
                      return (
                        <img
                          src={src}
                          alt={asset.title || asset.name || "Asset"}
                          className="asset-image"
                        />
                      );
                    })()
                  ) : (
                    <div className="asset-placeholder">
                      <FiImage className="placeholder-icon" />
                    </div>
                  )}

                  {/* Asset badges */}
                  <div className="asset-badges">
                    {asset.isFeatured && (
                      <span className="asset-badge featured">
                        <FiStar className="badge-icon" />
                        Featured
                      </span>
                    )}
                    {asset.isTrending && (
                      <span className="asset-badge trending">
                        <FiTrendingUp className="badge-icon" />
                        Trending
                      </span>
                    )}
                    {is3D && (
                      <span className="asset-badge info">
                        <FiBox className="badge-icon" />
                        3D
                      </span>
                    )}
                  </div>

                  {/* Price badge  */}
                  <div className="asset-price-badge">
                    <span
                      className={`price-badge ${
                        getPriceDisplay(asset) === "Paid" ? "premium" : "free"
                      }`}
                    >
                      {getPriceDisplay(asset)}
                    </span>
                  </div>
                </div>

                <div className="asset-content">
                  <div className="asset-header-row">
                    <h3 className="asset-title">
                      {asset.title || asset.name || "Untitled"}
                    </h3>
                    <div className="asset-menu">
                      <button
                        className="action-button secondary"
                        onClick={() => handleToggleAssetFeatured(asset.id)}
                      >
                        {asset.isFeatured ? "UnFeatured" : "Featured"}
                      </button>
                    </div>
                  </div>

                  <div className="asset-meta">
                    <span className="meta-item">
                      <FiTag className="meta-icon" />
                      {asset.category || asset.type || "Uncategorized"}
                    </span>
                    <span className="meta-item">
                      <FiDownload className="meta-icon" />
                      {asset.downloads || 0} downloads
                    </span>
                    {is3D && (
                      <span className="meta-item">
                        <FiBox className="meta-icon" />
                        3D Model
                      </span>
                    )}
                  </div>

                  <div className="asset-footer">
                    <span className="asset-author">
                      <FiUser className="author-icon" />
                      by {getAuthorName(asset)}
                    </span>
                    <span className="asset-date">
                      {formatDate(asset.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="table-actions">
                    <div>
                      <button
                        className="action-button secondary"
                        onClick={() => handleToggleAssetTrending(asset.id)}
                      >
                        {asset.isTrending ? "Remove Trending" : "Mark Trending"}
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="action-button secondary"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowAssetDialog(true);
                        }}
                      >
                        <FiEye className="button-icon" />
                      </button>
                      <button
                        className="action-button secondary"
                        onClick={() => handleEditAsset(asset)}
                      >
                        <FiEdit className="button-icon" />
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
                        <FiTrash2 className="button-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && <div className="loading-overlay">Loading Asset Management...</div>}

      {/* Asset Details Modal */}
      {showAssetDialog && selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          onClose={() => setShowAssetDialog(false)}
          onDelete={handleDeleteAsset}
          onToggleFeatured={handleToggleAssetFeatured}
          onToggleTrending={handleToggleAssetTrending}
          getPriceDisplay={getPriceDisplay}
          formatDate={formatDate}
          getAuthorName={getAuthorName}
          get3DModelUrl={get3DModelUrl}
        />
      )}

      {/* Create Asset Modal */}
      {showCreateAssetDialog && (
        <CreateAssetModal
          isOpen={showCreateAssetDialog}
          onClose={() => setShowCreateAssetDialog(false)}
          onAssetCreated={refreshAssets}
        />
      )}

      {/* Edit Asset Modal - Fixed Version */}
      {showEditAssetDialog && assetToEdit && (
        <EditAssetModal
          asset={assetToEdit}
          isOpen={showEditAssetDialog}
          onClose={() => {
            setShowEditAssetDialog(false);
            setAssetToEdit(null);
          }}
          onAssetUpdated={refreshAssets}
        />
      )}
    </div>
  );
};

// Asset Details Modal Component - UPDATED with 3D support
const AssetDetailsModal = ({
  asset,
  onClose,
  onDelete,
  onToggleFeatured,
  onToggleTrending,
  getPriceDisplay,
  formatDate,
  getAuthorName,
  get3DModelUrl,
}) => {
  const modelUrl = get3DModelUrl(asset);
  const is3D = modelUrl !== null;

  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiBox className="modal-icon" />
            Asset Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body enhanced-modal-body">
          {/* Asset Preview */}
          <div className="asset-preview">
            {is3D ? (
              <div className="asset-3d-preview-large">
                <SimpleModelViewer modelUrl={modelUrl} />
                <div className="asset-3d-badge-large">3D MODEL</div>
              </div>
            ) : asset.thumbnail || asset.images?.[0] || asset.icons?.[0] ? (
              <img
                src={
                  asset.thumbnail ||
                  (Array.isArray(asset.images) && asset.images[0]) ||
                  (Array.isArray(asset.icons) && asset.icons[0]) ||
                  ""
                }
                alt={asset.title || asset.name || "Asset"}
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <FiImage className="placeholder-icon large" />
              </div>
            )}
          </div>

          {/* Asset Info */}
          <div className="asset-info-section">
            <h3 className="asset-info-title">
              {asset.title || asset.name || "Untitled"}
            </h3>
            <p className="asset-info-description">
              {asset.description || "No description available"}
            </p>

            <div className="asset-info-grid">
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">
                  {asset.category || asset.type || "Uncategorized"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Price</span>
                <span className="info-value">{getPriceDisplay(asset)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Downloads</span>
                <span className="info-value">{asset.downloads || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created</span>
                <span className="info-value">
                  {formatDate(asset.createdAt)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Author</span>
                <span className="info-value">{getAuthorName(asset)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Type</span>
                <span className="info-value">
                  {is3D ? "3D Model" : "2D Asset"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <div className="status-badges">
                  {asset.isFeatured && (
                    <span className="status-badge featured">Featured</span>
                  )}
                  {asset.isTrending && (
                    <span className="status-badge trending">Trending</span>
                  )}
                  {!asset.isFeatured && !asset.isTrending && (
                    <span className="status-badge normal">Normal</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              className="action-button secondary"
              onClick={() => onToggleFeatured(asset.id)}
            >
              <FiStar className="button-icon" />
              {asset.isFeatured ? "Remove Featured" : "Mark Featured"}
            </button>

            <button
              className="action-button secondary"
              onClick={() => onToggleTrending(asset.id)}
            >
              <FiTrendingUp className="button-icon" />
              {asset.isTrending ? "Remove Trending" : "Mark Trending"}
            </button>

            <button
              className="action-button danger"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete asset "${
                      asset.title || asset.name
                    }"? This action cannot be undone.`
                  )
                ) {
                  onDelete(asset.id);
                  onClose();
                }
              }}
            >
              <FiTrash2 className="button-icon" />
              Delete Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Asset Modal Component - FIXED
const CreateAssetModal = ({ isOpen, onClose, onAssetCreated }) => {
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setUploadKey((prev) => prev + 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay">
      <div className="blog-modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiPlus className="modal-icon" />
            Upload New Asset
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="upload-wrapper">
            <Upload
              key={`create-${uploadKey}`}
              editMode={false}
              assetToEdit={null}
              onUploadSuccess={() => {
                onAssetCreated();
                onClose();
              }}
              onUploadClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Asset Modal Component - FIXED
const EditAssetModal = ({ asset, isOpen, onClose, onAssetUpdated }) => {
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    if (isOpen && asset) {
      setUploadKey((prev) => prev + 1);
    }
  }, [isOpen, asset]);

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay">
      <div className="blog-modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiEdit className="modal-icon" />
            Edit Asset
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="upload-wrapper">
            <Upload
              key={`edit-${asset?.id}-${uploadKey}`}
              editMode={true}
              assetToEdit={asset}
              onUploadSuccess={() => {
                onAssetUpdated();
                onClose();
              }}
              onUploadClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagement;
