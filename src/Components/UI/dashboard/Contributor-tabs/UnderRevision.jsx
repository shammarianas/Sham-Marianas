import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiPackage,
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiFilter,
  FiSearch,
  FiDownload,
  FiList,
  FiEye,
  FiCheckCircle,
  FiCornerUpLeft,
  FiX,
  FiUser,
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

const UnderRevisionAssets = () => {
  const { currentUser } = useUser(); // Get current user
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
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

  // ✅ UPDATED: Fetch only current user's pending assets
  useEffect(() => {
    const fetchAssetsUnderRevision = async () => {
      try {
        setLoading(true);
        const assetsRef = collection(db, "Assets");
        const assetsSnapshot = await getDocs(assetsRef);

        const revisionAssets = [];

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();

          // ✅ UPDATED: Filter assets that are:
          // 1. Under revision (pending status)
          // 2. Belong to current user
          // 3. NOT approved
          const isCurrentUserAsset = data.ownerId === currentUser?.uid;
          const isPendingAsset = data.status === "pending";

          if (isCurrentUserAsset && isPendingAsset) {
            revisionAssets.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt || data.uploadDate || new Date(),
            });
          }
        });

        // Sort by creation date (newest first)
        revisionAssets.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return timeB - timeA;
        });

        setAllAssets(revisionAssets);
        console.log("✅ Loaded user's pending assets:", revisionAssets.length);
      } catch (error) {
        console.error("Error loading assets under revision:", error);
        alert("Failed to load assets under revision");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAssetsUnderRevision();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Calculate trends compared to previous period
  const trends = useMemo(() => {
    if (loading || !currentUser)
      return {
        total: { value: 0, isPositive: true },
        highPriority: { value: 0, isPositive: true },
        completed: { value: 0, isPositive: true },
        averageTime: { value: 0, isPositive: true },
      };

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPeriodAssets = allAssets.filter((asset) => {
      const assetDate =
        asset.createdAt?.toDate?.() || new Date(asset.createdAt);
      return assetDate >= last30Days;
    });

    const previousPeriodAssets = allAssets.filter((asset) => {
      const assetDate =
        asset.createdAt?.toDate?.() || new Date(asset.createdAt);
      return assetDate >= previous30Days && assetDate < last30Days;
    });

    const currentTotal = currentPeriodAssets.length;
    const previousTotal = previousPeriodAssets.length;
    const totalTrend =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    const currentHighPriority = currentPeriodAssets.filter(
      (a) => a.priority === "high"
    ).length;
    const previousHighPriority = previousPeriodAssets.filter(
      (a) => a.priority === "high"
    ).length;
    const highPriorityTrend =
      previousHighPriority > 0
        ? ((currentHighPriority - previousHighPriority) /
            previousHighPriority) *
          100
        : 0;

    const currentCompleted = currentPeriodAssets.filter(
      (a) => a.revisionStatus === "completed"
    ).length;
    const previousCompleted = previousPeriodAssets.filter(
      (a) => a.revisionStatus === "completed"
    ).length;
    const completedTrend =
      previousCompleted > 0
        ? ((currentCompleted - previousCompleted) / previousCompleted) * 100
        : 0;

    // Calculate revision time trend
    const currentCompletedWithTime = currentPeriodAssets
      .filter(
        (a) =>
          a.revisionStatus === "completed" &&
          a.revisionCompletedAt &&
          a.createdAt
      )
      .map((a) => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const completed =
          a.revisionCompletedAt?.toDate?.() ||
          new Date(a.revisionCompletedAt) ||
          new Date();
        return (completed - created) / (1000 * 60 * 60 * 24); // Convert to days
      });

    const previousCompletedWithTime = previousPeriodAssets
      .filter(
        (a) =>
          a.revisionStatus === "completed" &&
          a.revisionCompletedAt &&
          a.createdAt
      )
      .map((a) => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const completed =
          a.revisionCompletedAt?.toDate?.() ||
          new Date(a.revisionCompletedAt) ||
          new Date();
        return (completed - created) / (1000 * 60 * 60 * 24);
      });

    const currentAvgTime =
      currentCompletedWithTime.length > 0
        ? currentCompletedWithTime.reduce((a, b) => a + b, 0) /
          currentCompletedWithTime.length
        : 0;

    const previousAvgTime =
      previousCompletedWithTime.length > 0
        ? previousCompletedWithTime.reduce((a, b) => a + b, 0) /
          previousCompletedWithTime.length
        : 0;

    const averageTimeTrend =
      previousAvgTime > 0
        ? ((previousAvgTime - currentAvgTime) / previousAvgTime) * 100
        : 0;

    return {
      total: {
        value: totalTrend,
        isPositive: totalTrend <= 0, // Lower growth is better
      },
      highPriority: {
        value: highPriorityTrend,
        isPositive: highPriorityTrend <= 0, // Lower high priority is better
      },
      completed: {
        value: completedTrend,
        isPositive: completedTrend >= 0, // Higher completion is better
      },
      averageTime: {
        value: averageTimeTrend,
        isPositive: averageTimeTrend >= 0, // Lower revision time is better
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
          asset.category || ""
        }`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.category && asset.category !== filters.category) {
        return false;
      }

      if (filters.status && asset.revisionStatus !== filters.status) {
        return false;
      }

      if (filters.date && asset.createdAt) {
        const assetDate =
          asset.createdAt?.toDate?.() || new Date(asset.createdAt);
        const now = new Date();

        switch (filters.date) {
          case "today":
            if (assetDate.toDateString() !== now.toDateString()) return false;
            break;
          case "week": {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (assetDate < weekAgo) return false;
            break;
          }
          case "month": {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (assetDate < monthAgo) return false;
            break;
          }
          case "older": {
            const olderThanMonth = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            if (assetDate >= olderThanMonth) return false;
            break;
          }
          default:
            break;
        }
      }

      return true;
    });
  }, [allAssets, filters, loading, currentUser]);

  // Calculate quality metrics
  const qualityMetrics = useMemo(() => {
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

    const completedRevisions = allAssets.filter(
      (a) => a.revisionStatus === "completed"
    );

    if (completedRevisions.length === 0) {
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

    // Calculate quality score based on revision factors
    let overall = 7.5; // Base score

    // Adjust based on revision completion rate
    const completionRate = (completedRevisions.length / allAssets.length) * 100;
    if (completionRate > 80) overall += 1.0;
    else if (completionRate > 60) overall += 0.5;
    else if (completionRate < 30) overall -= 1.0;

    // Adjust based on average revision time
    const revisionTimes = completedRevisions
      .filter((a) => a.revisionCompletedAt && a.createdAt)
      .map((a) => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const completed =
          a.revisionCompletedAt?.toDate?.() ||
          new Date(a.revisionCompletedAt) ||
          new Date();
        return (completed - created) / (1000 * 60 * 60 * 24);
      });

    const avgRevisionTime =
      revisionTimes.length > 0
        ? revisionTimes.reduce((a, b) => a + b, 0) / revisionTimes.length
        : 0;

    if (avgRevisionTime <= 2) overall += 1.0; // Fast revisions
    else if (avgRevisionTime > 7) overall -= 1.0; // Slow revisions

    // Clamp between 0-10
    overall = Math.min(10, Math.max(0, overall));

    // Calculate distribution
    const distribution = {
      excellent: Math.round(completedRevisions.length * 0.3),
      good: Math.round(completedRevisions.length * 0.45),
      average: Math.round(completedRevisions.length * 0.2),
      poor: Math.round(completedRevisions.length * 0.05),
    };

    // Adjust distribution based on actual performance
    if (avgRevisionTime <= 2) {
      distribution.excellent += Math.round(completedRevisions.length * 0.1);
      distribution.good -= Math.round(completedRevisions.length * 0.1);
    } else if (avgRevisionTime > 7) {
      distribution.poor += Math.round(completedRevisions.length * 0.1);
      distribution.average -= Math.round(completedRevisions.length * 0.1);
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
        totalAssets: 0,
        highPriority: 0,
        completedRevisions: 0,
        averageRevisionTime: "N/A",
        qualityScore: 0,
      };
    }

    const totalAssets = allAssets.length;
    const filteredTotal = assets.length;

    const highPriority = assets.filter((a) => a.priority === "high").length;
    const completedRevisions = assets.filter(
      (a) => a.revisionStatus === "completed"
    ).length;

    const completedWithTime = assets
      .filter(
        (a) =>
          a.revisionStatus === "completed" &&
          a.revisionCompletedAt &&
          a.createdAt
      )
      .map((a) => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const completed =
          a.revisionCompletedAt?.toDate?.() ||
          new Date(a.revisionCompletedAt) ||
          new Date();
        return (completed - created) / (1000 * 60 * 60 * 24);
      });

    const averageRevisionTime =
      completedWithTime.length > 0
        ? (
            completedWithTime.reduce((a, b) => a + b, 0) /
            completedWithTime.length
          ).toFixed(1)
        : "N/A";

    return {
      totalAssets,
      highPriority,
      completedRevisions,
      averageRevisionTime,
      qualityScore: qualityMetrics.overall,
    };
  }, [allAssets, assets, qualityMetrics, loading, currentUser]);

  const updateAssetStatus = async (assetId, newStatus) => {
    try {
      const assetRef = doc(db, "Assets", assetId);
      const updateData = {
        revisionStatus: newStatus,
        updatedAt: new Date(),
      };
      if (newStatus === "completed") {
        updateData.revisionCompletedAt = new Date();
        updateData.status = "approved"; // Move to approved status after revision
      }
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
    setFilters({ search: "", category: "", status: "", date: "" });
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
  const totalRatedAssets = Object.values(qualityMetrics.distribution).reduce(
    (a, b) => a + b,
    0
  );

  // Calculate percentages for quality distribution
  const qualityPercentages = {
    excellent:
      totalRatedAssets > 0
        ? (qualityMetrics.distribution.excellent / totalRatedAssets) * 100
        : 0,
    good:
      totalRatedAssets > 0
        ? (qualityMetrics.distribution.good / totalRatedAssets) * 100
        : 0,
    average:
      totalRatedAssets > 0
        ? (qualityMetrics.distribution.average / totalRatedAssets) * 100
        : 0,
    poor:
      totalRatedAssets > 0
        ? (qualityMetrics.distribution.poor / totalRatedAssets) * 100
        : 0,
  };

  // Show message if no user is logged in
  if (!currentUser) {
    return (
      <div className="user-reports-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="header-title">
              <FiPackage className="header-icon" />
              Assets Under Revision
            </h2>
            <p className="header-subtitle">
              Please log in to view your assets under revision
            </p>
          </div>
        </div>
        <div className="no-data-message">
          <FiUser size={48} />
          <h3>Authentication Required</h3>
          <p>You need to be logged in to view your assets under revision.</p>
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
            <p className="loading-text">
              Loading your assets under revision...
            </p>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showModal && selectedAsset && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Your Asset Revision Details</h3>
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
                  <h4>Revision Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span
                      className={`detail-value report-status-badge ${
                        selectedAsset.revisionStatus || "pending"
                      }`}
                    >
                      {selectedAsset.revisionStatus === "completed"
                        ? "Completed"
                        : selectedAsset.revisionStatus === "in-progress"
                        ? "In Progress"
                        : "Pending Review"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <span
                      className={`detail-value report-status-badge ${
                        selectedAsset.priority || "medium"
                      }`}
                    >
                      {selectedAsset.priority === "high"
                        ? "High Priority"
                        : selectedAsset.priority === "medium"
                        ? "Medium Priority"
                        : "Low Priority"}
                    </span>
                  </div>
                  {selectedAsset.revisionNotes && (
                    <div className="detail-item">
                      <span className="detail-label">Revision Notes:</span>
                      <span className="detail-value">
                        {selectedAsset.revisionNotes}
                      </span>
                    </div>
                  )}
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
                  {selectedAsset.updatedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">
                        {formatDate(selectedAsset.updatedAt)}
                      </span>
                    </div>
                  )}
                  {selectedAsset.revisionCompletedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Revision Completed:</span>
                      <span className="detail-value">
                        {formatDate(selectedAsset.revisionCompletedAt)}
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
              {selectedAsset.revisionStatus !== "completed" ? (
                <button
                  className="action-button"
                  onClick={() => {
                    updateAssetStatus(selectedAsset.id, "completed");
                    closeModal();
                  }}
                >
                  <FiCheckCircle /> Mark Revision Complete
                </button>
              ) : (
                <button
                  className="action-button"
                  onClick={() => {
                    updateAssetStatus(selectedAsset.id, "pending");
                    closeModal();
                  }}
                >
                  <FiCornerUpLeft /> Reopen Revision
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiPackage className="header-icon" />
            Your Assets Under Revision
          </h2>
          <p className="header-subtitle">
            Monitor and manage your assets currently undergoing revision and
            quality review
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalAssets} of your assets in revision
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
                <h3 className="report-stat-title">Your Pending Assets</h3>
                <div className="report-stat-value">{stats.totalAssets}</div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">
                Your assets awaiting review
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

          <div className="report-stat-card warning">
            <div className="report-stat-header">
              <div className="report-stat-icon">
                <FiAlertTriangle />
              </div>
              <div>
                <h3 className="report-stat-title">High Priority</h3>
                <div className="report-stat-value">{stats.highPriority}</div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">
                {stats.totalAssets > 0
                  ? `${((stats.highPriority / assets.length) * 100).toFixed(
                      1
                    )}% of your assets`
                  : "0% of your assets"}
              </div>
              <div
                className={`report-stat-trend ${
                  trends.highPriority.isPositive ? "positive" : "negative"
                }`}
              >
                {trends.highPriority.value > 0 ? "+" : ""}
                {trends.highPriority.value.toFixed(1)}%
                {trends.highPriority.isPositive ? (
                  <FiTrendingDown />
                ) : (
                  <FiTrendingUp />
                )}
              </div>
            </div>
          </div>

          <div className="report-stat-card success">
            <div className="report-stat-header">
              <div className="report-stat-icon">
                <FiCheckCircle />
              </div>
              <div>
                <h3 className="report-stat-title">Completed Revisions</h3>
                <div className="report-stat-value">
                  {stats.completedRevisions}
                </div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">
                {assets.length > 0
                  ? `${(
                      (stats.completedRevisions / assets.length) *
                      100
                    ).toFixed(1)}% completion rate`
                  : "0% completion rate"}
              </div>
              <div
                className={`report-stat-trend ${
                  trends.completed.isPositive ? "positive" : "negative"
                }`}
              >
                {trends.completed.value > 0 ? "+" : ""}
                {trends.completed.value.toFixed(1)}%
                {trends.completed.isPositive ? (
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
                <FiClock />
              </div>
              <div>
                <h3 className="report-stat-title">Avg. Revision Time</h3>
                <div className="report-stat-value">
                  {stats.averageRevisionTime === "N/A"
                    ? "N/A"
                    : `${stats.averageRevisionTime} days`}
                </div>
              </div>
            </div>
            <div className="report-stat-content">
              <div className="report-stat-subtext">days average revision</div>
              <div
                className={`report-stat-trend ${
                  trends.averageTime.isPositive ? "positive" : "negative"
                }`}
              >
                {trends.averageTime.value > 0 ? "+" : ""}
                {trends.averageTime.value.toFixed(1)}%
                {trends.averageTime.isPositive ? (
                  <FiTrendingDown />
                ) : (
                  <FiTrendingUp />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="reports-filter-bar">
          <div className="filter-bar-header">
            <h3 className="filter-bar-title">
              <FiFilter className="panel-icon" /> Filter Your Assets
            </h3>
            <div className="filter-results">
              <span className="filter-text">
                Showing {assets.length} of {stats.totalAssets} of your assets
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
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
              <FiList className="panel-icon" /> Your Assets Under Revision
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
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
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
                      <div className="comp-dis" title={asset.description}>
                        {asset.description || "No description"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`report-status-badge ${
                          asset.revisionStatus || "pending"
                        }`}
                      >
                        {asset.revisionStatus === "completed"
                          ? "Completed"
                          : asset.revisionStatus === "in-progress"
                          ? "In Progress"
                          : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`report-status-badge ${
                          asset.priority || "medium"
                        }`}
                      >
                        {asset.priority === "high"
                          ? "High"
                          : asset.priority === "medium"
                          ? "Medium"
                          : "Low"}
                      </span>
                    </td>
                    <td>{formatDate(asset.createdAt)}</td>
                    <td>
                      <div className="report-actions">
                        <button
                          className="action-button secondary small"
                          title="View Details"
                          onClick={() => openAssetDetails(asset)}
                        >
                          <FiEye />
                        </button>
                        {asset.revisionStatus !== "completed" ? (
                          <button
                            className="action-button small"
                            title="Mark Complete"
                            onClick={() =>
                              updateAssetStatus(asset.id, "completed")
                            }
                          >
                            <FiCheckCircle />
                          </button>
                        ) : (
                          <button
                            className="action-button small"
                            title="Reopen"
                            onClick={() =>
                              updateAssetStatus(asset.id, "pending")
                            }
                          >
                            <FiCornerUpLeft />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="no-reports">
                      No assets found matching your filters
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

export default UnderRevisionAssets;
