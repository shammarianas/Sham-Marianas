import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
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
  FiCornerUpLeft,
  FiX,
  FiUser,
  FiXCircle,
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

const Rejections = () => {
  const { currentUser } = useUser(); // Get current user
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    rejectionReason: "",
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

  // ✅ UPDATED: Fetch only current user's rejected assets
  useEffect(() => {
    const fetchRejectedAssets = async () => {
      try {
        setLoading(true);
        const assetsRef = collection(db, "Assets");
        const assetsSnapshot = await getDocs(assetsRef);

        const rejectedAssets = [];

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // ✅ UPDATED: Filter assets that are:
          // 1. Rejected
          // 2. Belong to current user
          const isCurrentUserAsset = data.ownerId === currentUser?.uid;
          const isRejectedAsset = data.status === "rejected" || data.isRejected === true;
          
          if (isCurrentUserAsset && isRejectedAsset) {
            rejectedAssets.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt || data.uploadDate || new Date(),
              rejectedAt: data.rejectedAt || data.updatedAt || new Date(),
            });
          }
        });

        // Sort by rejection date (newest first)
        rejectedAssets.sort((a, b) => {
          const timeA = a.rejectedAt?.toDate?.() || new Date(a.rejectedAt);
          const timeB = b.rejectedAt?.toDate?.() || new Date(b.rejectedAt);
          return timeB - timeA;
        });

        setAllAssets(rejectedAssets);
        console.log("✅ Loaded user's rejected assets:", rejectedAssets.length);
      } catch (error) {
        console.error("Error loading rejected assets:", error);
        alert("Failed to load rejected assets");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRejectedAssets();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Calculate trends compared to previous period
  const trends = useMemo(() => {
    if (loading || !currentUser) return {
      total: { value: 0, isPositive: true },
      qualityIssues: { value: 0, isPositive: true },
      resubmitted: { value: 0, isPositive: true },
      averageTimeToReject: { value: 0, isPositive: true }
    };

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const currentPeriodAssets = allAssets.filter(asset => {
      const assetDate = asset.rejectedAt?.toDate?.() || new Date(asset.rejectedAt);
      return assetDate >= last30Days;
    });
    
    const previousPeriodAssets = allAssets.filter(asset => {
      const assetDate = asset.rejectedAt?.toDate?.() || new Date(asset.rejectedAt);
      return assetDate >= previous30Days && assetDate < last30Days;
    });

    const currentTotal = currentPeriodAssets.length;
    const previousTotal = previousPeriodAssets.length;
    const totalTrend = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const currentQualityIssues = currentPeriodAssets.filter(a => 
      a.rejectionReason === "quality" || a.rejectionReason === "technical_issues"
    ).length;
    const previousQualityIssues = previousPeriodAssets.filter(a => 
      a.rejectionReason === "quality" || a.rejectionReason === "technical_issues"
    ).length;
    const qualityIssuesTrend = previousQualityIssues > 0 ? 
      ((currentQualityIssues - previousQualityIssues) / previousQualityIssues) * 100 : 0;

    const currentResubmitted = currentPeriodAssets.filter(a => a.resubmitted === true).length;
    const previousResubmitted = previousPeriodAssets.filter(a => a.resubmitted === true).length;
    const resubmittedTrend = previousResubmitted > 0 ? 
      ((currentResubmitted - previousResubmitted) / previousResubmitted) * 100 : 0;

    // Calculate rejection time trend
    const currentWithTime = currentPeriodAssets
      .filter(a => a.rejectedAt && a.createdAt)
      .map(a => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const rejected = a.rejectedAt?.toDate?.() || new Date(a.rejectedAt);
        return (rejected - created) / (1000 * 60 * 60 * 24); // Convert to days
      });

    const previousWithTime = previousPeriodAssets
      .filter(a => a.rejectedAt && a.createdAt)
      .map(a => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const rejected = a.rejectedAt?.toDate?.() || new Date(a.rejectedAt);
        return (rejected - created) / (1000 * 60 * 60 * 24);
      });

    const currentAvgTime = currentWithTime.length > 0 
      ? currentWithTime.reduce((a, b) => a + b, 0) / currentWithTime.length 
      : 0;
    
    const previousAvgTime = previousWithTime.length > 0 
      ? previousWithTime.reduce((a, b) => a + b, 0) / previousWithTime.length 
      : 0;

    const averageTimeTrend = previousAvgTime > 0 ? 
      ((previousAvgTime - currentAvgTime) / previousAvgTime) * 100 : 0;

    return {
      total: {
        value: totalTrend,
        isPositive: totalTrend <= 0 // Lower rejection rate is better
      },
      qualityIssues: {
        value: qualityIssuesTrend,
        isPositive: qualityIssuesTrend <= 0 // Lower quality issues is better
      },
      resubmitted: {
        value: resubmittedTrend,
        isPositive: resubmittedTrend >= 0 // Higher resubmission is better
      },
      averageTimeToReject: {
        value: averageTimeTrend,
        isPositive: averageTimeTrend >= 0 // Faster review time is better
      }
    };
  }, [allAssets, loading, currentUser]);

  // Client-side filtering
  const assets = useMemo(() => {
    if (loading || !currentUser) return [];
    
    return allAssets.filter((asset) => {
      if (
        filters.search &&
        !`${asset.title || ""} ${asset.description || ""} ${asset.type || ""} ${asset.rejectionNotes || ""}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.category && asset.type !== filters.category) {
        return false;
      }

      if (filters.rejectionReason && asset.rejectionReason !== filters.rejectionReason) {
        return false;
      }

      if (filters.date && asset.rejectedAt) {
        const assetDate = asset.rejectedAt?.toDate?.() || new Date(asset.rejectedAt);
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
            const olderThanMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
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

  // Calculate rejection metrics
  const rejectionMetrics = useMemo(() => {
    if (loading || !currentUser) {
      return {
        overall: 0,
        distribution: {
          quality: 0,
          guidelines: 0,
          technical: 0,
          other: 0
        }
      };
    }

    if (allAssets.length === 0) {
      return {
        overall: 0,
        distribution: {
          quality: 0,
          guidelines: 0,
          technical: 0,
          other: 0
        }
      };
    }

    // Calculate rejection score (lower is better)
    let overall = 3.0; // Base score

    // Adjust based on resubmission rate
    const resubmissionRate = (allAssets.filter(a => a.resubmitted === true).length / allAssets.length) * 100;
    if (resubmissionRate > 50) overall += 2.0; // High resubmission is good
    else if (resubmissionRate < 20) overall -= 1.0; // Low resubmission is bad

    // Adjust based on rejection reasons distribution
    const qualityRejections = allAssets.filter(a => 
      a.rejectionReason === "quality" || a.rejectionReason === "technical_issues"
    ).length;
    
    const qualityPercentage = (qualityRejections / allAssets.length) * 100;
    if (qualityPercentage > 60) overall -= 1.5; // High quality issues is bad
    else if (qualityPercentage < 30) overall += 1.0; // Low quality issues is good

    // Clamp between 0-10
    overall = Math.min(10, Math.max(0, overall));

    // Calculate distribution
    const distribution = {
      quality: allAssets.filter(a => a.rejectionReason === "quality").length,
      guidelines: allAssets.filter(a => a.rejectionReason === "guidelines_violation").length,
      technical: allAssets.filter(a => a.rejectionReason === "technical_issues").length,
      other: allAssets.filter(a => !a.rejectionReason || 
        !["quality", "guidelines_violation", "technical_issues"].includes(a.rejectionReason)).length
    };

    return {
      overall: parseFloat(overall.toFixed(1)),
      distribution
    };
  }, [allAssets, loading, currentUser]);

  // Recalculate stats from filtered assets
  const stats = useMemo(() => {
    if (loading || !currentUser) {
      return {
        totalRejections: 0,
        qualityIssues: 0,
        resubmitted: 0,
        averageTimeToReject: "N/A",
        rejectionScore: 0,
      };
    }

    const totalRejections = allAssets.length;
    const filteredTotal = assets.length;

    const qualityIssues = assets.filter((a) => 
      a.rejectionReason === "quality" || a.rejectionReason === "technical_issues"
    ).length;

    const resubmitted = assets.filter((a) => a.resubmitted === true).length;

    const assetsWithTime = assets
      .filter((a) => a.rejectedAt && a.createdAt)
      .map((a) => {
        const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const rejected = a.rejectedAt?.toDate?.() || new Date(a.rejectedAt);
        return (rejected - created) / (1000 * 60 * 60 * 24);
      });

    const averageTimeToReject =
      assetsWithTime.length > 0
        ? (assetsWithTime.reduce((a, b) => a + b, 0) / assetsWithTime.length).toFixed(1)
        : "N/A";

    return {
      totalRejections,
      qualityIssues,
      resubmitted,
      averageTimeToReject,
      rejectionScore: rejectionMetrics.overall,
    };
  }, [allAssets, assets, rejectionMetrics, loading, currentUser]);

  const updateAssetStatus = async (assetId, newStatus) => {
    try {
      const assetRef = doc(db, "Assets", assetId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };
      
      if (newStatus === "pending") {
        updateData.resubmitted = true;
        updateData.resubmittedAt = new Date();
      }
      
      await updateDoc(assetRef, updateData);

      setAllAssets((prev) =>
        prev.map((a) =>
          a.id === assetId ? { ...a, ...updateData } : a
        )
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
    setFilters({ search: "", category: "", rejectionReason: "", date: "" });
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

 

  const getRejectionReasonText = (reason) => {
    switch (reason) {
      case "quality":
        return "Quality Issues";
      case "guidelines_violation":
        return "Guidelines Violation";
      case "technical_issues":
        return "Technical Issues";
      case "duplicate":
        return "Duplicate Content";
      case "copyright":
        return "Copyright Issues";
      default:
        return "Other Reasons";
    }
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
  const totalRejectedAssets = Object.values(rejectionMetrics.distribution).reduce((a, b) => a + b, 0);

  // Calculate percentages for rejection distribution
  const rejectionPercentages = {
    quality: totalRejectedAssets > 0 ? (rejectionMetrics.distribution.quality / totalRejectedAssets) * 100 : 0,
    guidelines: totalRejectedAssets > 0 ? (rejectionMetrics.distribution.guidelines / totalRejectedAssets) * 100 : 0,
    technical: totalRejectedAssets > 0 ? (rejectionMetrics.distribution.technical / totalRejectedAssets) * 100 : 0,
    other: totalRejectedAssets > 0 ? (rejectionMetrics.distribution.other / totalRejectedAssets) * 100 : 0,
  };

  // Show message if no user is logged in
  if (!currentUser) {
    return (
      <div className="user-reports-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="header-title">
              <FiXCircle className="header-icon" />
              Rejected Assets
            </h2>
            <p className="header-subtitle">
              Please log in to view your rejected assets
            </p>
          </div>
        </div>
        <div className="no-data-message">
          <FiUser size={48} />
          <h3>Authentication Required</h3>
          <p>You need to be logged in to view your rejected assets.</p>
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
            <p className="loading-text">Loading your rejected assets...</p>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showModal && selectedAsset && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Your Rejection Details</h3>
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
                    <span className="detail-value">{selectedAsset.title || "Untitled Asset"}</span>
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
                  <h4>Rejection Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Rejection Reason:</span>
                    <span className={`detail-value report-status-badge rejected`}>
                      {getRejectionReasonText(selectedAsset.rejectionReason)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Resubmitted:</span>
                    <span className={`detail-value report-status-badge ${selectedAsset.resubmitted ? 'success' : 'warning'}`}>
                      {selectedAsset.resubmitted ? "Yes" : "No"}
                    </span>
                  </div>
                  {selectedAsset.rejectionNotes && (
                    <div className="detail-item">
                      <span className="detail-label">Rejection Notes:</span>
                      <span className="detail-value">{selectedAsset.rejectionNotes}</span>
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
                    <span className="detail-value">{formatDate(selectedAsset.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rejected:</span>
                    <span className="detail-value">{formatDate(selectedAsset.rejectedAt)}</span>
                  </div>
                  {selectedAsset.resubmittedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Resubmitted:</span>
                      <span className="detail-value">{formatDate(selectedAsset.resubmittedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="action-button secondary" onClick={closeModal}>
                Close
              </button>
              {!selectedAsset.resubmitted ? (
                <button
                  className="action-button"
                  onClick={() => {
                    updateAssetStatus(selectedAsset.id, "pending");
                    closeModal();
                  }}
                >
                  <FiCornerUpLeft /> Resubmit for Review
                </button>
              ) : (
                <button
                  className="action-button secondary"
                  onClick={() => {
                    updateAssetStatus(selectedAsset.id, "rejected");
                    closeModal();
                  }}
                >
                  <FiXCircle /> Mark as Not Resubmitted
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
            <FiXCircle className="header-icon" />
            Your Rejected Assets
          </h2>
          <p className="header-subtitle">
            Review and manage your assets that have been rejected and need attention
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalRejections} of your rejected assets
          </span>
        </div>
      </div>

        <>
          {/* Statistics Cards */}
          <div className="reports-stats-grid">
            <div className="report-stat-card primary">
              <div className="report-stat-header">
                <div className="report-stat-icon">
                  <FiXCircle />
                </div>
                <div>
                  <h3 className="report-stat-title">Your Total Rejections</h3>
                  <div className="report-stat-value">{stats.totalRejections}</div>
                </div>
              </div>
              <div className="report-stat-content">
                <div className="report-stat-subtext">
                  Your assets rejected overall
                </div>
                <div className={`report-stat-trend ${trends.total.isPositive ? 'positive' : 'negative'}`}>
                  {trends.total.value > 0 ? '+' : ''}{trends.total.value.toFixed(1)}% 
                  {trends.total.isPositive ? <FiTrendingDown /> : <FiTrendingUp />}
                </div>
              </div>
            </div>

            <div className="report-stat-card warning">
              <div className="report-stat-header">
                <div className="report-stat-icon">
                  <FiAlertTriangle />
                </div>
                <div>
                  <h3 className="report-stat-title">Your Quality Issues</h3>
                  <div className="report-stat-value">{stats.qualityIssues}</div>
                </div>
              </div>
              <div className="report-stat-content">
                <div className="report-stat-subtext">
                  {stats.totalRejections > 0
                    ? `${((stats.qualityIssues / assets.length) * 100).toFixed(1)}% of your rejections`
                    : "0% of your rejections"}
                </div>
                <div className={`report-stat-trend ${trends.qualityIssues.isPositive ? 'positive' : 'negative'}`}>
                  {trends.qualityIssues.value > 0 ? '+' : ''}{trends.qualityIssues.value.toFixed(1)}% 
                  {trends.qualityIssues.isPositive ? <FiTrendingDown /> : <FiTrendingUp />}
                </div>
              </div>
            </div>

            <div className="report-stat-card success">
              <div className="report-stat-header">
                <div className="report-stat-icon">
                  <FiRefreshCw />
                </div>
                <div>
                  <h3 className="report-stat-title">Your Resubmitted</h3>
                  <div className="report-stat-value">{stats.resubmitted}</div>
                </div>
              </div>
              <div className="report-stat-content">
                <div className="report-stat-subtext">
                  {assets.length > 0
                    ? `${((stats.resubmitted / assets.length) * 100).toFixed(1)}% of your resubmission rate`
                    : "0% resubmission rate"}
                </div>
                <div className={`report-stat-trend ${trends.resubmitted.isPositive ? 'positive' : 'negative'}`}>
                  {trends.resubmitted.value > 0 ? '+' : ''}{trends.resubmitted.value.toFixed(1)}% 
                  {trends.resubmitted.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                </div>
              </div>
            </div>

            <div className="report-stat-card info">
              <div className="report-stat-header">
                <div className="report-stat-icon">
                  <FiClock />
                </div>
                <div>
                  <h3 className="report-stat-title">Avg. Review Time</h3>
                  <div className="report-stat-value">
                    {stats.averageTimeToReject === "N/A"
                      ? "N/A"
                      : `${stats.averageTimeToReject} days`}
                  </div>
                </div>
              </div>
              <div className="report-stat-content">
                <div className="report-stat-subtext">days to rejection</div>
                <div className={`report-stat-trend ${trends.averageTimeToReject.isPositive ? 'positive' : 'negative'}`}>
                  {trends.averageTimeToReject.value > 0 ? '+' : ''}{trends.averageTimeToReject.value.toFixed(1)}% 
                  {trends.averageTimeToReject.isPositive ? <FiTrendingDown /> : <FiTrendingUp />}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="reports-filter-bar">
            <div className="filter-bar-header">
              <h3 className="filter-bar-title">
                <FiFilter className="panel-icon" /> Filter Your Rejected Assets
              </h3>
              <div className="filter-results">
                <span className="filter-text">
                  Showing {assets.length} of {stats.totalRejections} of your assets
                </span>
              </div>
            </div>

            <div className="filter-controls-grid">
              <div className="filter-search-wrapper">
                <FiSearch className="filter-search-icon" />
                <input
                  type="text"
                  className="filter-search-input"
                  placeholder="Search your assets by title, description, category, or rejection notes..."
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
                value={filters.rejectionReason}
                onChange={(e) => handleFilterChange("rejectionReason", e.target.value)}
              >
                <option value="">All Reasons</option>
                <option value="quality">Quality Issues</option>
                <option value="guidelines_violation">Guidelines Violation</option>
                <option value="technical_issues">Technical Issues</option>
                <option value="duplicate">Duplicate Content</option>
                <option value="copyright">Copyright Issues</option>
                <option value="other">Other Reasons</option>
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
                <FiList className="panel-icon" /> Your Rejected Assets
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
                    <th>Rejection Reason</th>
                    <th>Resubmitted</th>
                    <th>Rejection Date</th>
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
                            <div className="report-user-email">ID: {asset.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`report-category-badge ${asset.type || "other"}`}>
                          {getCategoryDisplayName(asset.type)}
                        </span>
                      </td>
                      <td>
                        <span className={`report-status-badge rejected`}>
                          {getRejectionReasonText(asset.rejectionReason)}
                        </span>
                      </td>
                      <td>
                        <span className={`report-status-badge ${asset.resubmitted ? 'success' : 'warning'}`}>
                          {asset.resubmitted ? "Resubmitted" : "Not Resubmitted"}
                        </span>
                      </td>
                      <td>{formatDate(asset.rejectedAt)}</td>
                      <td>
                        <div className="report-actions">
                          <button
                            className="action-button secondary small"
                            title="View Details"
                            onClick={() => openAssetDetails(asset)}
                          >
                            <FiEye />
                          </button>
                          {!asset.resubmitted ? (
                            <button
                              className="action-button small"
                              title="Resubmit"
                              onClick={() =>
                                updateAssetStatus(asset.id, "pending")
                              }
                            >
                              <FiCornerUpLeft />
                            </button>
                          ) : (
                            <button
                              className="action-button small warning"
                              title="Mark Not Resubmitted"
                              onClick={() =>
                                updateAssetStatus(asset.id, "rejected")
                              }
                            >
                              <FiXCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && !loading && (
                    <tr>
                      <td colSpan="6" className="no-reports">
                        No rejected assets found matching your filters
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

export default Rejections;
