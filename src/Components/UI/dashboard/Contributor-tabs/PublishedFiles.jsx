import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiPackage,
  FiRefreshCw,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiPieChart,
  FiFilter,
  FiSearch,
  FiDownload,
  FiList,
  FiEye,
  FiCheckCircle,
  FiX,
  FiDollarSign,
  FiUsers,
  FiHeart,
  FiVideo,
  FiImage,
  FiCode,
  FiBox,
  FiLayers,
  FiType,
  FiFile,
} from "react-icons/fi";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useUser } from "../../../../Context/UserProvider"; // Import user context

const PublishedFiles = () => {
  const { currentUser } = useUser(); // Get current user
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    rating: "",
    date: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useMemo(() => {
    const handler = setTimeout(() => searchInput, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
  }, [debouncedSearch, searchInput]);

  // ✅ UPDATED: Fetch only current user's published assets
  useEffect(() => {
    const fetchPublishedAssets = async () => {
      try {
        setLoading(true);
        const assetsRef = collection(db, "Assets");
        const assetsSnapshot = await getDocs(assetsRef);

        const publishedAssets = [];

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();

          // ✅ UPDATED: Filter assets that are:
          // 1. Published/approved
          // 2. Belong to current user
          const isCurrentUserAsset = data.ownerId === currentUser?.uid;
          const isPublishedAsset =
            data.status === "published" || data.status === "approved";

          if (isCurrentUserAsset && isPublishedAsset) {
            publishedAssets.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt || data.uploadDate || new Date(),
              publishedAt: data.publishedAt || data.approvedAt || new Date(),
            });
          }
        });

        // Sort by publication date (newest first)
        publishedAssets.sort((a, b) => {
          const timeA = a.publishedAt?.toDate?.() || new Date(a.publishedAt);
          const timeB = b.publishedAt?.toDate?.() || new Date(b.publishedAt);
          return timeB - timeA;
        });

        setAllAssets(publishedAssets);
        console.log(
          "✅ Loaded user's published assets:",
          publishedAssets.length
        );
      } catch (error) {
        console.error("Error loading published assets:", error);
        alert("Failed to load published assets");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPublishedAssets();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Calculate trends compared to previous period
  const trends = useMemo(() => {
    if (loading || !currentUser)
      return {
        total: { value: 0, isPositive: true },
        downloads: { value: 0, isPositive: true },
        earnings: { value: 0, isPositive: true },
        rating: { value: 0, isPositive: true },
      };

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPeriodAssets = allAssets.filter((asset) => {
      const assetDate =
        asset.publishedAt?.toDate?.() || new Date(asset.publishedAt);
      return assetDate >= last30Days;
    });

    const previousPeriodAssets = allAssets.filter((asset) => {
      const assetDate =
        asset.publishedAt?.toDate?.() || new Date(asset.publishedAt);
      return assetDate >= previous30Days && assetDate < last30Days;
    });

    const currentTotal = currentPeriodAssets.length;
    const previousTotal = previousPeriodAssets.length;
    const totalTrend =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    const currentDownloads = currentPeriodAssets.reduce(
      (sum, asset) => sum + (asset.downloads || 0),
      0
    );
    const previousDownloads = previousPeriodAssets.reduce(
      (sum, asset) => sum + (asset.downloads || 0),
      0
    );
    const downloadsTrend =
      previousDownloads > 0
        ? ((currentDownloads - previousDownloads) / previousDownloads) * 100
        : 0;

    const currentEarnings = currentPeriodAssets.reduce(
      (sum, asset) => sum + (asset.earnings || 0),
      0
    );
    const previousEarnings = previousPeriodAssets.reduce(
      (sum, asset) => sum + (asset.earnings || 0),
      0
    );
    const earningsTrend =
      previousEarnings > 0
        ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
        : 0;

    const currentRatings = currentPeriodAssets
      .filter((a) => a.rating)
      .map((a) => a.rating);
    const previousRatings = previousPeriodAssets
      .filter((a) => a.rating)
      .map((a) => a.rating);

    const currentAvgRating =
      currentRatings.length > 0
        ? currentRatings.reduce((a, b) => a + b, 0) / currentRatings.length
        : 0;
    const previousAvgRating =
      previousRatings.length > 0
        ? previousRatings.reduce((a, b) => a + b, 0) / previousRatings.length
        : 0;

    const ratingTrend =
      previousAvgRating > 0
        ? ((currentAvgRating - previousAvgRating) / previousAvgRating) * 100
        : 0;

    return {
      total: {
        value: totalTrend,
        isPositive: totalTrend >= 0, // Higher publications is better
      },
      downloads: {
        value: downloadsTrend,
        isPositive: downloadsTrend >= 0, // Higher downloads is better
      },
      earnings: {
        value: earningsTrend,
        isPositive: earningsTrend >= 0, // Higher earnings is better
      },
      rating: {
        value: ratingTrend,
        isPositive: ratingTrend >= 0, // Higher rating is better
      },
    };
  }, [allAssets, loading, currentUser]);

  // Client-side filtering
  const assets = useMemo(() => {
    if (loading || !currentUser) return [];

    return allAssets.filter((asset) => {
      if (
        filters.search &&
        !`${asset.title || ""} ${asset.description || ""} ${
          asset.type || ""
        }`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.category && asset.type !== filters.category) {
        return false;
      }

      if (filters.rating) {
        const assetRating = asset.rating || 0;
        switch (filters.rating) {
          case "5_star":
            if (assetRating < 4.5) return false;
            break;
          case "4_star":
            if (assetRating < 3.5 || assetRating >= 4.5) return false;
            break;
          case "3_star":
            if (assetRating < 2.5 || assetRating >= 3.5) return false;
            break;
          case "2_star":
            if (assetRating < 1.5 || assetRating >= 2.5) return false;
            break;
          case "1_star":
            if (assetRating >= 1.5) return false;
            break;
          default:
            break;
        }
      }

      if (filters.date && asset.publishedAt) {
        const assetDate =
          asset.publishedAt?.toDate?.() || new Date(asset.publishedAt);
        const now = new Date();

        switch (filters.date) {
          case "today":
            if (assetDate.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (assetDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (assetDate < monthAgo) return false;
            break;
          case "older":
            const olderThanMonth = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            if (assetDate >= olderThanMonth) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }, [allAssets, filters, loading, currentUser]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (loading || !currentUser) {
      return {
        overall: 0,
        distribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
        },
      };
    }

    if (allAssets.length === 0) {
      return {
        overall: 0,
        distribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
        },
      };
    }

    // Calculate performance score based on multiple factors
    let overall = 6.0; // Base score

    // Adjust based on average rating
    const ratings = allAssets.filter((a) => a.rating).map((a) => a.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;
    if (avgRating >= 4.5) overall += 2.0;
    else if (avgRating >= 4.0) overall += 1.0;
    else if (avgRating >= 3.0) overall += 0.5;
    else if (avgRating < 2.0) overall -= 1.0;

    // Adjust based on download performance
    const totalDownloads = allAssets.reduce(
      (sum, asset) => sum + (asset.downloads || 0),
      0
    );
    const avgDownloads = totalDownloads / allAssets.length;
    if (avgDownloads > 100) overall += 2.0;
    else if (avgDownloads > 50) overall += 1.0;
    else if (avgDownloads > 20) overall += 0.5;
    else if (avgDownloads < 5) overall -= 1.0;

    // Adjust based on earnings
    const totalEarnings = allAssets.reduce(
      (sum, asset) => sum + (asset.earnings || 0),
      0
    );
    const avgEarnings = totalEarnings / allAssets.length;
    if (avgEarnings > 100) overall += 1.0;
    else if (avgEarnings > 50) overall += 0.5;
    else if (avgEarnings < 10) overall -= 0.5;

    // Clamp between 0-10
    overall = Math.min(10, Math.max(0, overall));

    // Calculate distribution based on performance
    const distribution = {
      excellent: Math.round(allAssets.length * 0.25),
      good: Math.round(allAssets.length * 0.4),
      average: Math.round(allAssets.length * 0.25),
      poor: Math.round(allAssets.length * 0.1),
    };

    // Adjust distribution based on actual performance
    if (avgRating >= 4.5) {
      distribution.excellent += Math.round(allAssets.length * 0.1);
      distribution.good -= Math.round(allAssets.length * 0.1);
    } else if (avgRating < 3.0) {
      distribution.poor += Math.round(allAssets.length * 0.1);
      distribution.average -= Math.round(allAssets.length * 0.1);
    }

    return {
      overall: parseFloat(overall.toFixed(1)),
      distribution,
    };
  }, [allAssets, loading, currentUser]);

  // Recalculate stats from filtered assets
  const stats = useMemo(() => {
    if (loading || !currentUser) {
      return {
        totalPublished: 0,
        totalDownloads: 0,
        totalEarnings: 0,
        averageRating: 0,
        performanceScore: 0,
      };
    }

    const totalPublished = allAssets.length;
    const filteredTotal = assets.length;

    const totalDownloads = assets.reduce(
      (sum, asset) => sum + (asset.downloads || 0),
      0
    );
    const totalEarnings = assets.reduce(
      (sum, asset) => sum + (asset.earnings || 0),
      0
    );

    const ratings = assets.filter((a) => a.rating).map((a) => a.rating);
    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0;

    return {
      totalPublished,
      totalDownloads,
      totalEarnings,
      averageRating,
      performanceScore: performanceMetrics.overall,
    };
  }, [allAssets, assets, performanceMetrics, loading, currentUser]);

  const updateAssetStatus = async (assetId, newStatus) => {
    try {
      const assetRef = doc(db, "Assets", assetId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };

      await updateDoc(assetRef, updateData);

      setAllAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, ...updateData } : a))
      );
    } catch (error) {
      console.error("Error updating asset status:", error);
      alert("Failed to update asset status");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: "", category: "", rating: "", date: "" });
    setSearchInput("");
  };

  // ✅ UPDATED: All categories from your upload form
  const getCategoryStats = () => {
    if (loading || !currentUser) return [];

    const categories = {
      models: { name: "3D Models", count: 0, color: "excellent", icon: <FiBox /> },
      videos: { name: "Videos", count: 0, color: "good", icon: <FiVideo /> },
      images: { name: "Images", count: 0, color: "average", icon: <FiImage /> },
      scripts: { name: "Scripts", count: 0, color: "poor", icon: <FiCode /> },
      textures: { name: "Textures", count: 0, color: "excellent", icon: <FiLayers /> },
      hdris: { name: "HDRIs", count: 0, color: "good", icon: <FiImage /> },
      icons: { name: "Icons", count: 0, color: "average", icon: <FiLayers /> },
      graphics: { name: "Graphics Templates", count: 0, color: "poor", icon: <FiFile /> },
      mockups: { name: "Mockups", count: 0, color: "excellent", icon: <FiBox /> },
      fonts: { name: "Fonts", count: 0, color: "good", icon: <FiType /> },
      "video-templates": { name: "Video Templates", count: 0, color: "average", icon: <FiVideo /> },
      other: { name: "Other", count: 0, color: "poor", icon: <FiFile /> },
    };

    allAssets.forEach((a) => {
      const category = a.type || "other";
      if (categories[category]) {
        categories[category].count++;
      } else {
        categories.other.count++;
      }
    });

    return Object.values(categories);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = Math.abs(now - date);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // ✅ UPDATED: Get asset type icon based on type
  const getAssetTypeIcon = (type) => {
    switch (type) {
      case "models":
        return <FiBox />;
      case "videos":
        return <FiVideo />;
      case "images":
        return <FiImage />;
      case "scripts":
        return <FiCode />;
      case "textures":
        return <FiLayers />;
      case "hdris":
        return <FiImage />;
      case "icons":
        return <FiLayers />;
      case "graphics":
        return <FiFile />;
      case "mockups":
        return <FiBox />;
      case "fonts":
        return <FiType />;
      case "video-templates":
        return <FiVideo />;
      default:
        return <FiFile />;
    }
  };

  const getRatingStars = (rating) => {
    if (!rating) return "No ratings";
    const stars =
      "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    return `${stars} (${rating.toFixed(1)})`;
  };

  // ✅ UPDATED: Get category display name
  const getCategoryDisplayName = (type) => {
    switch (type) {
      case "models":
        return "3D Models";
      case "videos":
        return "Videos";
      case "images":
        return "Images";
      case "scripts":
        return "Scripts";
      case "textures":
        return "Textures";
      case "hdris":
        return "HDRIs";
      case "icons":
        return "Icons";
      case "graphics":
        return "Graphics Templates";
      case "mockups":
        return "Mockups";
      case "fonts":
        return "Fonts";
      case "video-templates":
        return "Video Templates";
      default:
        return "Other";
    }
  };

  const openAssetDetails = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  const categoryStats = getCategoryStats();
  const totalRatedAssets = Object.values(
    performanceMetrics.distribution
  ).reduce((a, b) => a + b, 0);

  // Calculate percentages for performance distribution
  const performancePercentages = {
    excellent:
      totalRatedAssets > 0
        ? (performanceMetrics.distribution.excellent / totalRatedAssets) * 100
        : 0,
    good:
      totalRatedAssets > 0
        ? (performanceMetrics.distribution.good / totalRatedAssets) * 100
        : 0,
    average:
      totalRatedAssets > 0
        ? (performanceMetrics.distribution.average / totalRatedAssets) * 100
        : 0,
    poor:
      totalRatedAssets > 0
        ? (performanceMetrics.distribution.poor / totalRatedAssets) * 100
        : 0,
  };

  // Top performing assets
  const topPerformingAssets = useMemo(() => {
    return [...assets]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 3);
  }, [assets]);

  // Show message if no user is logged in
  if (!currentUser) {
    return (
      <div className="user-reports-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="header-title">
              <FiCheckCircle className="header-icon" />
              Published Files
            </h2>
            <p className="header-subtitle">
              Please log in to view your published assets
            </p>
          </div>
        </div>
        <div className="no-data-message">
          <FiUsers size={48} />
          <h3>Authentication Required</h3>
          <p>You need to be logged in to view your published assets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your published assets...</p>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showModal && selectedAsset && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Your Published Asset Details</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Asset Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">
                      {selectedAsset.title || "Untitled Asset"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">
                      {getCategoryDisplayName(selectedAsset.type)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Asset ID:</span>
                    <span className="detail-value">{selectedAsset.id}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Performance Metrics</h4>
                  <div className="detail-item">
                    <span className="detail-label">Downloads:</span>
                    <span className="detail-value">
                      {selectedAsset.downloads || 0}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Earnings:</span>
                    <span className="detail-value">
                      {formatCurrency(selectedAsset.earnings)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rating:</span>
                    <span className="detail-value">
                      {selectedAsset.rating
                        ? getRatingStars(selectedAsset.rating)
                        : "No ratings"}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Description</h4>
                  <div className="detail-description">
                    {selectedAsset.description || "No description provided."}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Timeline</h4>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {formatDate(selectedAsset.createdAt)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Published:</span>
                    <span className="detail-value">
                      {formatDate(selectedAsset.publishedAt)}
                    </span>
                  </div>
                  {selectedAsset.updatedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">
                        {formatDate(selectedAsset.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="action-button secondary" onClick={closeModal}>
                Close
              </button>
              <button
                className="action-button warning"
                onClick={() => {
                  updateAssetStatus(selectedAsset.id, "under_revision");
                  closeModal();
                }}
              >
                <FiRefreshCw /> Send for Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiCheckCircle className="header-icon" />
            Your Published Files
          </h2>
          <p className="header-subtitle">
            Monitor performance and analytics of your published assets
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalPublished} of your published assets
          </span>
        </div>
      </div>

      <>
        {/* Statistics Cards */}
        <div className="reports-stats-grid">
          <div className="report-stat-card primary">
            <div className="report-stat-header">
              <div className="report-stat-icon">
                <FiPackage />
              </div>
              <div>
                <h3 className="report-stat-title">Your Published Assets</h3>
                <div className="report-stat-value">{stats.totalPublished}</div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">
                Your assets successfully published
              </div>
              <div
                className={`report-stat-trend ${
                  trends.total.isPositive ? "positive" : "negative"
                }`}
              >
                {trends.total.value > 0 ? "+" : ""}
                {trends.total.value.toFixed(1)}%
                {trends.total.isPositive ? (
                  <FiTrendingUp />
                ) : (
                  <FiTrendingDown />
                )}
              </div>
            </div>
          </div>

          <div className="report-stat-card success">
            <div className="report-stat-header">
              <div className="report-stat-icon">
                <FiDownload />
              </div>
              <div>
                <h3 className="report-stat-title">Your Total Downloads</h3>
                <div className="report-stat-value">{stats.totalDownloads}</div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">Your all-time downloads</div>
              <div
                className={`report-stat-trend ${
                  trends.downloads.isPositive ? "positive" : "negative"
                }`}
              >
                {trends.downloads.value > 0 ? "+" : ""}
                {trends.downloads.value.toFixed(1)}%
                {trends.downloads.isPositive ? (
                  <FiTrendingUp />
                ) : (
                  <FiTrendingDown />
                )}
              </div>
            </div>
          </div>

          <div className="report-stat-card info">
            <div className="report-stat-header">
              <div className="report-stat-icon">
                <FiDollarSign />
              </div>
              <div>
                <h3 className="report-stat-title">Your Total Earnings</h3>
                <div className="report-stat-value">
                  {formatCurrency(stats.totalEarnings)}
                </div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">
                Your lifetime earnings from assets
              </div>
              <div
                className={`report-stat-trend ${
                  trends.earnings.isPositive ? "positive" : "negative"
                }`}
              >
                {trends.earnings.value > 0 ? "+" : ""}
                {trends.earnings.value.toFixed(1)}%
                {trends.earnings.isPositive ? (
                  <FiTrendingUp />
                ) : (
                  <FiTrendingDown />
                )}
              </div>
            </div>
          </div>
         
        </div>

        {/* Filter Bar */}
        <div className="reports-filter-bar">
          <div className="filter-bar-header">
            <h3 className="filter-bar-title">
              <FiFilter className="panel-icon" /> Filter Your Published Assets
            </h3>
            <div className="filter-results">
              <span className="filter-text">
                Showing {assets.length} of {stats.totalPublished} of your assets
              </span>
            </div>
          </div>

          <div className="filter-controls-grid">
            <div className="filter-search-wrapper">
              <FiSearch className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input"
                placeholder="Search your assets by title, description, or category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* ✅ UPDATED: All categories from upload form */}
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="models">3D Models</option>
              <option value="videos">Videos</option>
              <option value="images">Images</option>
              <option value="scripts">Scripts</option>
              <option value="textures">Textures</option>
              <option value="hdris">HDRIs</option>
              <option value="icons">Icons</option>
              <option value="graphics">Graphics Templates</option>
              <option value="mockups">Mockups</option>
              <option value="fonts">Fonts</option>
              <option value="video-templates">Video Templates</option>
              <option value="other">Other</option>
            </select>

            

            <select
              className="filter-select"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            >
              <option value="">Any Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="older">Older</option>
            </select>

            <div className="filter-actions">
              <button className="filter-button" onClick={resetFilters}>
                <FiRefreshCw /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiList className="panel-icon" /> Your Published Assets
            </h3>
            <button className="action-button secondary">
              <FiDownload className="button-icon" /> Export Report
            </button>
          </div>
          <div className="recent-reports-body">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Downloads</th>
                  <th>Earnings</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 10).map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div className="report-user">
                        
                        <div className="report-user-info">
                          <div className="report-user-name">
                            {asset.title || "Untitled Asset"}
                          </div>
                          <div className="report-user-email">
                            ID: {asset.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`report-category-badge ${
                          asset.type || "other"
                        }`}
                      >
                        {getCategoryDisplayName(asset.type)}
                      </span>
                    </td>
                    <td>
                      <div className="download-count">
                        <span className="metric-value">
                          {asset.downloads || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="metric-value currency">
                        {formatCurrency(asset.earnings || 0)}
                      </div>
                    </td>
                    
                    <td>{formatDate(asset.publishedAt)}</td>
                    <td>
                      <div className="report-actions">
                        <button
                          className="action-button secondary small"
                          title="View Details"
                          onClick={() => openAssetDetails(asset)}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="action-button small warning"
                          title="Send for Revision"
                          onClick={() =>
                            updateAssetStatus(asset.id, "under_revision")
                          }
                        >
                          <FiRefreshCw />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="no-reports">
                      No published assets found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    </div>
  );
};

export default PublishedFiles;