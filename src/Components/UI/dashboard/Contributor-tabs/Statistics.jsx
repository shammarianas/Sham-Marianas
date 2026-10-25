import { useState, useEffect, useMemo } from "react";
import "react-router-dom";
import { FiPackage, FiTrendingUp, FiDownload, FiDollarSign, FiUsers, FiStar, FiCalendar, FiRefreshCw, FiCheckCircle, FiTrendingDown, FiBarChart2, FiPieChart, FiVideo, FiImage, FiCode, FiBox, FiLayers, FiType, FiFile } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useUser } from "../../../../Context/UserProvider";

const Statistics = () => {
  const { currentUser } = useUser();
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all"); // all, today, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");


  // ✅ UPDATED: Fetch only current user's assets
  useEffect(() => {
    const fetchUserAssets = async () => {
      try {
        setLoading(true);
        const assetsRef = collection(db, "Assets");
        const assetsSnapshot = await getDocs(assetsRef);

        const userAssets = [];

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();

          // ✅ Only include current user's assets
          if (data.ownerId === currentUser?.uid) {
            userAssets.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt || data.uploadDate || new Date(),
              publishedAt: data.publishedAt || data.approvedAt || null,
              rejectedAt: data.rejectedAt || null,
            });
          }
        });

        setAllAssets(userAssets);
      } catch (error) {
        console.error("Error loading user assets:", error);
        alert("Failed to load your assets");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserAssets();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Filter assets based on date range
  const filteredAssets = useMemo(() => {
    if (loading) return [];

    let startDate, endDate;
    const now = new Date();

    switch (dateRange) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        endDate = new Date(now);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return allAssets;
        }
        break;
      default:
        return allAssets;
    }

    return allAssets.filter((asset) => {
      const assetDate =
        asset.createdAt?.toDate?.() || new Date(asset.createdAt);
      return assetDate >= startDate && assetDate <= endDate;
    });
  }, [allAssets, dateRange, customStartDate, customEndDate, loading]);

  // Calculate overall statistics
  const Statistics = useMemo(() => {
    if (loading) {
      return {
        totalAssets: 0,
        published: 0,
        rejected: 0,
        underRevision: 0,
        totalDownloads: 0,
        totalEarnings: 0,
        approvalRate: 0,
        averageRating: 0,
      };
    }

    const totalAssets = filteredAssets.length;
    const published = filteredAssets.filter(
      (a) => a.status === "published" || a.status === "approved"
    ).length;
    const rejected = filteredAssets.filter(
      (a) => a.status === "rejected"
    ).length;
    const underRevision = filteredAssets.filter(
      (a) => a.status === "under_revision" || a.underRevision === true
    ).length;

    const totalDownloads = filteredAssets.reduce(
      (sum, asset) => sum + (asset.downloads || 0),
      0
    );
    const totalEarnings = filteredAssets.reduce(
      (sum, asset) => sum + (asset.earnings || 0),
      0
    );

    const ratings = filteredAssets.filter((a) => a.rating).map((a) => a.rating);
    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0;

    const approvalRate = totalAssets > 0 ? (published / totalAssets) * 100 : 0;

    return {
      totalAssets,
      published,
      rejected,
      underRevision,
      totalDownloads,
      totalEarnings,
      averageRating,
      approvalRate: parseFloat(approvalRate.toFixed(1)),
    };
  }, [filteredAssets, loading]);

  // Calculate trends compared to previous period
  const trends = useMemo(() => {
    if (loading)
      return {
        totalAssets: { value: 0, isPositive: true },
        published: { value: 0, isPositive: true },
        downloads: { value: 0, isPositive: true },
        earnings: { value: 0, isPositive: true },
      };

    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (dateRange) {
      case "today":
        currentStart = new Date(now);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(now);
        currentEnd.setHours(23, 59, 59, 999);

        previousStart = new Date(now);
        previousStart.setDate(now.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(now);
        previousEnd.setDate(now.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;

      case "week":
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 7);
        currentEnd = new Date(now);

        previousStart = new Date(now);
        previousStart.setDate(now.getDate() - 14);
        previousEnd = new Date(now);
        previousEnd.setDate(now.getDate() - 7);
        break;

      case "month":
        currentStart = new Date(now);
        currentStart.setMonth(now.getMonth() - 1);
        currentEnd = new Date(now);

        previousStart = new Date(now);
        previousStart.setMonth(now.getMonth() - 2);
        previousEnd = new Date(now);
        previousEnd.setMonth(now.getMonth() - 1);
        break;

      default:
        // For "all" or custom, compare last 30 days vs previous 30 days
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 30);
        currentEnd = new Date(now);

        previousStart = new Date(now);
        previousStart.setDate(now.getDate() - 60);
        previousEnd = new Date(now);
        previousEnd.setDate(now.getDate() - 30);
        break;
    }

    const currentPeriodAssets = allAssets.filter((asset) => {
      const assetDate =
        asset.createdAt?.toDate?.() || new Date(asset.createdAt);
      return assetDate >= currentStart && assetDate <= currentEnd;
    });

    const previousPeriodAssets = allAssets.filter((asset) => {
      const assetDate =
        asset.createdAt?.toDate?.() || new Date(asset.createdAt);
      return assetDate >= previousStart && assetDate <= previousEnd;
    });

    // Calculate trends
    const currentTotal = currentPeriodAssets.length;
    const previousTotal = previousPeriodAssets.length;
    const totalTrend =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    const currentPublished = currentPeriodAssets.filter(
      (a) => a.status === "published" || a.status === "approved"
    ).length;
    const previousPublished = previousPeriodAssets.filter(
      (a) => a.status === "published" || a.status === "approved"
    ).length;
    const publishedTrend =
      previousPublished > 0
        ? ((currentPublished - previousPublished) / previousPublished) * 100
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

    return {
      totalAssets: {
        value: totalTrend,
        isPositive: totalTrend >= 0,
      },
      published: {
        value: publishedTrend,
        isPositive: publishedTrend >= 0,
      },
      downloads: {
        value: downloadsTrend,
        isPositive: downloadsTrend >= 0,
      },
      earnings: {
        value: earningsTrend,
        isPositive: earningsTrend >= 0,
      },
    };
  }, [allAssets, dateRange, loading]);

  // Top performing assets
  const topPerformingAssets = useMemo(() => {
    const publishedAssets = filteredAssets.filter(
      (a) => a.status === "published" || a.status === "approved"
    );
    return [...publishedAssets]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 5);
  }, [filteredAssets]);

  // Top trending assets (based on recent activity)
  const topTrendingAssets = useMemo(() => {
    const publishedAssets = filteredAssets.filter(
      (a) => a.status === "published" || a.status === "approved"
    );

    // Simple trending algorithm: recent downloads and high rating
    return [...publishedAssets]
      .sort((a, b) => {
        const scoreA = (a.downloads || 0) * 0.7 + (a.rating || 0) * 30;
        const scoreB = (b.downloads || 0) * 0.7 + (b.rating || 0) * 30;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [filteredAssets]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    if (loading) return [];

    const distribution = {
      published: filteredAssets.filter(
        (a) => a.status === "published" || a.status === "approved"
      ).length,
      rejected: filteredAssets.filter((a) => a.status === "rejected").length,
      underRevision: filteredAssets.filter(
        (a) => a.status === "under_revision" || a.underRevision === true
      ).length,
      pending: filteredAssets.filter((a) => !a.status || a.status === "pending")
        .length,
    };

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage:
        Statistics.totalAssets > 0 ? (count / Statistics.totalAssets) * 100 : 0,
    }));
  }, [filteredAssets, Statistics.totalAssets, loading]);

  // ✅ UPDATED: Category Distribution - Only show categories that have assets
  const categoryDistribution = useMemo(() => {
    if (loading) return [];

    const categories = {
      models: 0,
      videos: 0,
      images: 0,
      scripts: 0,
      textures: 0,
      hdris: 0,
      icons: 0,
      "website-templates": 0,
      tools: 0,
      "video-templates": 0,
      prompts: 0,
      other: 0,
    };

    filteredAssets.forEach((a) => {
      const category = a.type === "mockups" ? "tools" : a.type || "other";
      if (categories[category] !== undefined) {
        categories[category]++;
      } else {
        categories.other++;
      }
    });

    // ✅ FILTER: Only return categories that have assets
    return Object.entries(categories)
      .filter(([, count]) => count > 0) // Only categories with assets
      .map(([category, count]) => ({
        category,
        count,
        percentage:
          Statistics.totalAssets > 0
            ? (count / Statistics.totalAssets) * 100
            : 0,
      }));
  }, [filteredAssets, Statistics.totalAssets, loading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "underRevision":
        return "#f59e0b";
      case "pending":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  // ✅ UPDATED: Category colors for all categories
  const getCategoryColor = (category) => {
    const colors = {
      models: "#3b82f6",
      videos: "#ef4444",
      images: "#10b981",
      scripts: "#f59e0b",
      textures: "#8b5cf6",
      hdris: "#06b6d4",
      icons: "#84cc16",
      "website-templates": "#f97316",
      "video-templates": "#a855f7",
      prompts: "#f97316",
      other: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Published";
      case "rejected":
        return "Rejected";
      case "underRevision":
        return "Under Revision";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  // ✅ UPDATED: Get category display name
  const getCategoryDisplayName = (category) => {
    switch (category) {
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
      case "website-templates":
        return "Website Templates";
      case "tools":
        return "Tools";
      case "video-templates":
        return "Video Templates";
      case "prompts":
        return "Prompts";
      case "other":
        return "Other";
      default:
        return "Other";
    }
  };

  // ✅ UPDATED: Get asset type icon
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
      case "website-templates":
        return <FiFile />;
      case "tools":
        return <FiBox />;
      case "video-templates":
        return <FiVideo />;
      default:
        return <FiFile />;
    }
  };

  const resetDateFilter = () => {
    setDateRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Show message if no user is logged in
  if (!currentUser) {
    return (
      <div className="user-reports-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="header-title">
              <FiBarChart2 className="header-icon" />
              Statistics Dashboard
            </h2>
            <p className="header-subtitle">
              Please log in to view your statistics
            </p>
          </div>
        </div>
        <div className="no-data-message">
          <FiUsers size={48} />
          <h3>Authentication Required</h3>
          <p>You need to be logged in to view your statistics.</p>
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
            <p className="loading-text">Loading your statistics...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBarChart2 className="header-icon" />
            Your Statistics Dashboard
          </h2>
          <p className="header-subtitle">
            Comprehensive overview of your content performance and analytics
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {formatNumber(Statistics.totalAssets)} of your assets
          </span>
        </div>
      </div>

      {/* Date Filter */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiCalendar className="panel-icon" /> Date Range
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing your data for selected period
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <select
            className="filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === "custom" && (
            <>
              <input
                type="date"
                className="filter-select"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <input
                type="date"
                className="filter-select"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                placeholder="End Date"
              />
            </>
          )}

          <div className="filter-actions">
            <button className="filter-button" onClick={resetDateFilter}>
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiPackage />
            </div>
            <div>
              <h3 className="report-stat-title">Your Total Assets</h3>
              <div className="report-stat-value">
                {formatNumber(Statistics.totalAssets)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Your content submissions</div>
            <div
              className={`report-stat-trend ${
                trends.totalAssets.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.totalAssets.value > 0 ? "+" : ""}
              {trends.totalAssets.value.toFixed(1)}%
              {trends.totalAssets.isPositive ? (
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
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Your Published</h3>
              <div className="report-stat-value">
                {formatNumber(Statistics.published)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {Statistics.approvalRate}% of your approval rate
            </div>
            <div
              className={`report-stat-trend ${
                trends.published.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.published.value > 0 ? "+" : ""}
              {trends.published.value.toFixed(1)}%
              {trends.published.isPositive ? (
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
              <FiDownload />
            </div>
            <div>
              <h3 className="report-stat-title">Your Total Downloads</h3>
              <div className="report-stat-value">
                {formatNumber(Statistics.totalDownloads)}
              </div>
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
                {formatCurrency(Statistics.totalEarnings)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Your lifetime earnings</div>
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

      {/* Charts and Graphs Section */}
      <div className="reports-content-grid">
        {/* Status Distribution Pie Chart */}
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiPieChart className="panel-icon" /> Your Status Distribution
            </h3>
          </div>
          <div className="reports-chart-body">
            <div className="pie-chart-container">
              <div className="pie-chart-wrapper">
                <div
                  className="pie-chart"
                  style={{
                    background: `conic-gradient(
                      ${getStatusColor("published")} 0% ${
                      statusDistribution.find((s) => s.status === "published")
                        ?.percentage || 0
                    }%,
                      ${getStatusColor("rejected")} ${
                      statusDistribution.find((s) => s.status === "published")
                        ?.percentage || 0
                    }% ${
                      (statusDistribution.find((s) => s.status === "published")
                        ?.percentage || 0) +
                      (statusDistribution.find((s) => s.status === "rejected")
                        ?.percentage || 0)
                    }%,
                      ${getStatusColor("underRevision")} ${
                      (statusDistribution.find((s) => s.status === "published")
                        ?.percentage || 0) +
                      (statusDistribution.find((s) => s.status === "rejected")
                        ?.percentage || 0)
                    }% ${
                      (statusDistribution.find((s) => s.status === "published")
                        ?.percentage || 0) +
                      (statusDistribution.find((s) => s.status === "rejected")
                        ?.percentage || 0) +
                      (statusDistribution.find(
                        (s) => s.status === "underRevision"
                      )?.percentage || 0)
                    }%,
                      ${getStatusColor("pending")} ${
                      (statusDistribution.find((s) => s.status === "published")
                        ?.percentage || 0) +
                      (statusDistribution.find((s) => s.status === "rejected")
                        ?.percentage || 0) +
                      (statusDistribution.find(
                        (s) => s.status === "underRevision"
                      )?.percentage || 0)
                    }% 100%
                    )`,
                  }}
                >
                  <div className="pie-chart-center">
                    {/* <div className="pie-chart-value">
                      {Statistics.totalAssets}
                    </div> */}
                    <div className="pie-chart-label">Your Assets</div>
                  </div>
                </div>
              </div>
              <div className="pie-chart-labels">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="pie-chart-label">
                    <span
                      className="pie-label-dot"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    ></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">
                        {getStatusText(item.status)}
                      </span>
                      <span className="pie-label-percentage">
                        {Math.round(item.percentage)}% (
                        {formatNumber(item.count)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="reports-categories-card">
          <div className="reports-categories-header">
            <h3 className="panel-title">
              <FiPackage className="panel-icon" /> Your Category Distribution
            </h3>
          </div>
          <div className="reports-categories-body">
            {categoryDistribution.length > 0 ? (
              categoryDistribution.map((item, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">
                      {getCategoryDisplayName(item.category)}
                    </span>
                    <span className="category-count">
                      {Math.round(item.percentage)}% ({formatNumber(item.count)}
                      )
                    </span>
                  </div>
                  <div className="category-progress-bar">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: getCategoryColor(item.category),
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-categories-message">
                <p>No assets found in any category for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Assets */}
      <div className="reports-content-grid">
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiTrendingUp className="panel-icon" /> Your Top Downloading
              Assets
            </h3>
          </div>
          <div className="recent-reports-body h-100">
            <div>
              <table className="report-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Downloads</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-avatar">
                          {getAssetTypeIcon(asset.type)}
                        </div>
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
                          asset.category || asset.type || "other"
                        }`}
                      >
                        {asset.category || "No category"}
                      </span>
                    </td>
                    <td>
                      <div className="download-count">
                        <span className="metric-value">
                          {formatNumber(asset.downloads || 0)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="metric-value currency">
                        {formatCurrency(asset.earnings || 0)}
                      </div>
                    </td>

                  </tr>
                ))}
                {topPerformingAssets.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="no-reports">
                      No published assets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Top Trending Assets */}
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiStar className="panel-icon" /> Your Top Trending Assets
            </h3>
          </div>
          <div className="recent-reports-body">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Downloads</th>
                </tr>
              </thead>
              <tbody>
                {topTrendingAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-avatar">
                          {getAssetTypeIcon(asset.type)}
                        </div>
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
                          asset.category || asset.type || "other"
                        }`}
                      >
                        {asset.category || "No category"}
                      </span>
                    </td>
                    <td>
                      <div className="download-count">
                        <span className="metric-value">
                          {formatNumber(asset.downloads || 0)}
                        </span>
                      </div>
                    </td>

                  </tr>
                ))}
                {topTrendingAssets.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="no-reports">
                      No trending assets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="reports-content-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiUsers className="panel-icon" /> Your Performance Summary
            </h3>
          </div>
          <div className="reports-chart-body">
            <div className="performance-metrics-grid">
              <div className="performance-metric">
                <div className="metric-header">
                  <span className="metric-name">Your Approval Rate</span>
                  <span
                    className={`metric-status ${
                      Statistics.approvalRate > 80
                        ? "excellent"
                        : Statistics.approvalRate > 60
                        ? "good"
                        : "average"
                    }`}
                  >
                    {Statistics.approvalRate > 80
                      ? "Excellent"
                      : Statistics.approvalRate > 60
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
                <div className="metric-value">{Statistics.approvalRate}%</div>
                <div className="metric-target">Target: 80%</div>
                <div className="category-progress-bar">
                  <div
                    className={`category-progress-fill ${
                      Statistics.approvalRate > 80
                        ? "excellent"
                        : Statistics.approvalRate > 60
                        ? "good"
                        : "average"
                    }`}
                    style={{
                      width: `${Statistics.approvalRate}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="performance-metric">
                <div className="metric-header">
                  <span className="metric-name">Your Average Rating</span>
                  <span
                    className={`metric-status ${
                      Statistics.averageRating > 4.5
                        ? "excellent"
                        : Statistics.averageRating > 4.0
                        ? "good"
                        : "average"
                    }`}
                  >
                    {Statistics.averageRating > 4.5
                      ? "Excellent"
                      : Statistics.averageRating > 4.0
                      ? "Good"
                      : "Average"}
                  </span>
                </div>
                <div className="metric-value">{Statistics.averageRating}/5</div>
                <div className="metric-target">Target: 4.5/5</div>
                <div className="category-progress-bar">
                  <div
                    className={`category-progress-fill ${
                      Statistics.averageRating > 4.5
                        ? "excellent"
                        : Statistics.averageRating > 4.0
                        ? "good"
                        : "average"
                    }`}
                    style={{
                      width: `${(Statistics.averageRating / 5) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="performance-metric">
                <div className="metric-header">
                  <span className="metric-name">Your Revenue per Asset</span>
                  <span
                    className={`metric-status ${
                      Statistics.totalEarnings / Statistics.published > 50
                        ? "excellent"
                        : Statistics.totalEarnings / Statistics.published > 20
                        ? "good"
                        : "average"
                    }`}
                  >
                    {Statistics.published > 0 ? "Good" : "N/A"}
                  </span>
                </div>
                <div className="metric-value">
                  {Statistics.published > 0
                    ? formatCurrency(
                        Statistics.totalEarnings / Statistics.published
                      )
                    : "N/A"}
                </div>
                <div className="metric-target">Target: $50 per asset</div>
                <div className="category-progress-bar">
                  <div
                    className={`category-progress-fill ${
                      Statistics.totalEarnings / Statistics.published > 50
                        ? "excellent"
                        : Statistics.totalEarnings / Statistics.published > 20
                        ? "good"
                        : "average"
                    }`}
                    style={{
                      width: `${
                        Statistics.published > 0
                          ? Math.min(
                              (Statistics.totalEarnings /
                                Statistics.published /
                                50) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
