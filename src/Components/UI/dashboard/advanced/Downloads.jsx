import React, { useState, useEffect } from "react";
import {
  FiDownload,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiEye,
  FiBarChart2,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiPieChart,
  FiList,
  FiRefreshCw,
  FiX,
  FiDollarSign,
  FiPackage,
  FiUser,
} from "react-icons/fi";
// import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useUser } from "../../../../Context/UserProvider";
import { db } from "../../../../firebase";
import { exportDownloadsData } from "../../../../utils/exportUtils";
import ExportButton from "../../../ExportButton";


const Downloads = () => {
  const { currentUser } = useUser();
  const [timeRange, setTimeRange] = useState("30d");
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
const [showUsersModal, setShowUsersModal] = useState(false);
const [selectedAssetUsers, setSelectedAssetUsers] = useState([]);

// Add handler function
const handleViewUsers = (asset) => {
  setSelectedAssetUsers(asset.recentUsers || []);
  setShowUsersModal(true);
};

  // Fetch downloads data from Firebase
 useEffect(() => {
  const fetchDownloadsData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const profilesRef = collection(db, "Profiles");
      const profilesSnapshot = await getDocs(profilesRef);

      if (profilesSnapshot.empty) {
        await fetchUserDownloads();
        return;
      }

      const assetStats = {};
      const downloadDetails = []; // Store individual download details

      const downloadPromises = profilesSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const downloadsRef = collection(db, `Profiles/${userId}/downloads`);
        const downloadsSnapshot = await getDocs(downloadsRef);
        
        return { userId, userData, downloadsSnapshot };
      });

      const allUsersData = await Promise.all(downloadPromises);

      allUsersData.forEach(({ userId, userData, downloadsSnapshot }) => {
        downloadsSnapshot.forEach((doc) => {
          const data = doc.data();
          const assetId = data.assetId || doc.id;

          // Store individual download details for latest user info
          downloadDetails.push({
            assetId,
            userId,
            username: userData.username || userData.name || "Unknown User",
            email: userData.email || "No email",
            downloadDate: data.downloadDate || new Date()
          });

          if (!assetStats[assetId]) {
            assetStats[assetId] = {
              id: assetId,
              assetName: data.title || data.assetName || "Unknown Asset",
              assetType: data.type || data.assetType || "Unknown",
              publisher: data.cre || "Unknown",
              totalDownloads: 0,
              successfulDownloads: 0,
              failedDownloads: 0,
              fileSize: data.fileSize || "0",
              price: data.price || 0,
              license: data.licenseType || data.license || "Personal",
              lastDownload: data.downloadDate || new Date(),
              category: data.category || "General",
              rating: data.rating || 4.5,
              revenue: 0,
              trend: Math.random() > 0.5 ? "up" : "down",
              trendPercentage: Math.floor(Math.random() * 30) + 5,
              // Store recent users who downloaded this asset
              recentUsers: []
            };
          }

          assetStats[assetId].totalDownloads++;
          
          // Add user to recent users list (limit to 5)
          if (assetStats[assetId].recentUsers.length < 5) {
            assetStats[assetId].recentUsers.push({
              username: userData.username || userData.name || "Unknown User",
              email: userData.email || "No email"
            });
          }

          if (data.status === "completed" || !data.status) {
            assetStats[assetId].successfulDownloads++;
            assetStats[assetId].revenue += data.price || 0;
          } else {
            assetStats[assetId].failedDownloads++;
          }
        });
      });

      // Convert to array
      const downloadsArray = Object.values(assetStats)
        .map((asset) => ({
          ...asset,
          successRate:
            asset.totalDownloads > 0
              ? Math.round(
                  (asset.successfulDownloads / asset.totalDownloads) * 100
                )
              : 0,
          // Get the most recent user from downloadDetails
          latestUser: downloadDetails
            .filter(d => d.assetId === asset.id)
            .sort((a, b) => new Date(b.downloadDate) - new Date(a.downloadDate))[0]
        }))
        .sort((a, b) => b.totalDownloads - a.totalDownloads);

      setDownloads(downloadsArray);
    } catch (error) {
      console.error("Error:", error);
      await fetchUserDownloads();
    } finally {
      setLoading(false);
    }
  };

  fetchDownloadsData();
}, [currentUser]);

  // Filter downloads based on search and filters
  const filteredDownloads = downloads.filter((download) => {
    const matchesSearch =
      download.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "high" && download.successRate >= 95) ||
      (statusFilter === "medium" &&
        download.successRate >= 85 &&
        download.successRate < 95) ||
      (statusFilter === "low" && download.successRate < 85);

    const matchesType =
      typeFilter === "all" || download.assetType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const stats = {
    totalDownloads: downloads.reduce((sum, d) => sum + d.totalDownloads, 0),
    totalRevenue: downloads.reduce((sum, d) => sum + d.revenue, 0),
    avgSuccessRate:
      downloads.length > 0
        ? Math.round(
            downloads.reduce((sum, d) => sum + d.successRate, 0) /
              downloads.length
          )
        : 0,
    totalAssets: downloads.length,
  };

  // Calculate category distribution for pie chart
  const categoryDistribution = downloads.reduce((acc, download) => {
    const category = download.category || "Unknown";
    acc[category] = (acc[category] || 0) + download.totalDownloads;
    return acc;
  }, {});

  // Calculate asset type distribution for progress bars
  const assetTypeDistribution = downloads.reduce((acc, download) => {
    const type = download.assetType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const getStatusBadge = (successRate) => {
    if (successRate >= 95) {
      return <span className="report-status-badge resolved">Excellent</span>;
    } else if (successRate >= 85) {
      return <span className="report-status-badge in-progress">Good</span>;
    } else {
      return (
        <span className="report-status-badge pending">Needs Attention</span>
      );
    }
  };

  const getLicenseBadge = (license) => {
    switch (license) {
      case "Commercial":
        return <span className="report-category-badge fraud">Commercial</span>;
      case "Enterprise":
        return (
          <span className="report-category-badge content">Enterprise</span>
        );
      case "Personal":
        return <span className="report-category-badge spam">Personal</span>;
      default:
        return <span className="report-category-badge other">Unknown</span>;
    }
  };

  const getTrendBadge = (trend, percentage) => {
    return (
      <div
        className={`report-stat-trend ${
          trend === "up" ? "positive" : "negative"
        }`}
      >
        {percentage}%
        {trend === "up" ? (
          <FiTrendingUp className="fi-pl" />
        ) : (
          <FiTrendingDown className="fi-pl" />
        )}
      </div>
    );
  };

  // Format file size for display
  const formatFileSize = (sizeInMB) => {
    const size = parseFloat(sizeInMB);
    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} GB`;
    }
    return `${size.toFixed(1)} MB`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Handle view details
  const handleViewDetails = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading Downloads Reports...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDownload className="header-icon" />
            Downloads Analytics
          </h2>
          <p className="header-subtitle">
            Track download performance and asset popularity
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalDownloads.toLocaleString()} total downloads
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        {/* Total Downloads */}
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDownload />
            </div>
            <div>
              <h3 className="report-stat-title">Total Downloads</h3>
              <div className="report-stat-value">
                {stats.totalDownloads.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Across all assets</div>
            <div className="report-stat-trend positive">
              +12%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Total Revenue</h3>
              <div className="report-stat-value">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">From all downloads</div>
            <div className="report-stat-trend positive">
              +15%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Avg Success Rate</h3>
              <div className="report-stat-value">{stats.avgSuccessRate}%</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Download completion rate</div>
            <div className="report-stat-trend positive">
              +2%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Total Assets */}
        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiPackage />
            </div>
            <div>
              <h3 className="report-stat-title">Total Assets</h3>
              <div className="report-stat-value">{stats.totalAssets}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Available for download</div>
            <div className="report-stat-trend positive">
              +8%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Distribution Section */}
      <div className="reports-content-grid">
        {/* Category Distribution Pie Chart */}
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiPieChart className="panel-icon" />
              Downloads by Category
            </h3>
            <div className="satisfaction-score">
              <span className="score-value">
                {Object.keys(categoryDistribution).length}
              </span>
              <span className="score-label">Categories</span>
            </div>
          </div>
          <div className="reports-chart-body">
            <div className="pie-chart-container">
              <div className="pie-chart-wrapper">
                <div className="pie-chart">
                  <div className="pie-chart-center">
                    <div className="pie-chart-label">Top Category</div>
                  </div>
                </div>
              </div>

              <div className="pie-chart-labels">
                {Object.entries(categoryDistribution).map(
                  ([category, count], index) => {
                    const percentage =
                      stats.totalDownloads > 0
                        ? Math.round((count / stats.totalDownloads) * 100)
                        : 0;
                    const colors = ["excellent", "good", "average", "poor"];
                    return (
                      <div key={category} className="pie-chart-label">
                        <span
                          className={`pie-label-dot ${
                            colors[index % colors.length]
                          }`}
                        ></span>
                        <div className="pie-label-text">
                          <span className="pie-label-name">{category}</span>
                          <span className="pie-label-percentage">
                            {percentage}% ({count})
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Asset Type Distribution */}
        <div className="reports-categories-card">
          <div className="reports-categories-header">
            <h3 className="panel-title">
              <FiBarChart2 className="panel-icon" />
              Asset Type Distribution
            </h3>
          </div>
          <div className="reports-categories-body">
            {Object.entries(assetTypeDistribution).map(([type, count]) => {
              const percentage =
                downloads.length > 0 ? (count / downloads.length) * 100 : 0;
              return (
                <div key={type} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{type}</span>
                    <span className="category-count">
                      {percentage.toFixed(1)}% ({count})
                    </span>
                  </div>
                  <div className="category-progress-bar">
                    <div
                      className={`category-progress-fill ${
                        type === "3D Model"
                          ? "harassment"
                          : type === "UI Kit"
                          ? "spam"
                          : type === "Audio"
                          ? "fraud"
                          : type === "Icons"
                          ? "content"
                          : "other"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {Object.keys(assetTypeDistribution).length === 0 && (
              <div className="empty-state">
                <p>No asset types to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" />
            Filter Assets
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredDownloads.length} of {downloads.length} assets
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          {/* Search by Asset/Publisher */}
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search by asset name, publisher, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Success Rate Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Success Rates</option>
            <option value="high">High (95%+)</option>
            <option value="medium">Medium (85-94%)</option>
            <option value="low">Low (&lt;85%)</option>
          </select>

          {/* Type Filter */}
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.keys(assetTypeDistribution).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Time Range Filter */}
          <select
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="filter-button primary">
              <FiFilter />
              Apply
            </button>
            <button
              className="filter-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
                setTimeRange("30d");
              }}
            >
              <FiRefreshCw />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" />
            Asset Download Statistics
          </h3>
          <div>
          <ExportButton
            data={filteredDownloads.length > 0 ? filteredDownloads : downloads}
            filename="downloads-analytics"
            variant="secondary"
            columns={[
              { header: "Asset Name", accessor: (d) => d.assetName || "N/A" },
              { header: "Asset Type", accessor: (d) => d.assetType || "N/A" },
              // { header: "Publisher", accessor: (d) => d.publisher || "N/A" },
              { header: "Total Downloads", accessor: (d) => d.totalDownloads || 0 },
              { header: "Successful", accessor: (d) => d.successfulDownloads || 0 },
              { header: "Failed", accessor: (d) => d.failedDownloads || 0 },
              { header: "Success Rate", accessor: (d) => `${d.successRate || 0}%` },
              { header: "Category", accessor: (d) => d.category || "N/A" },
              { header: "Revenue", accessor: (d) => `$${(parseFloat(d.revenue) || 0).toFixed(2)}` },
              { header: "Last Download", accessor: (d) => formatDate(d.lastDownload) },
            ]}
            onExport={(format) =>
              exportDownloadsData(
                filteredDownloads.length > 0 ? filteredDownloads : downloads,
                format
              )
            }
          />
        </div>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Asset</th>
                 <th>User</th>
                <th>Downloads</th>
                <th>Category</th>
                <th>Status</th>
                <th>Trend</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDownloads.map((download) => (
                <tr key={download.id}>
                  <td>
                    <div className="report-user">
                      
                      <div className="report-user-info">
                        <div className="report-user-name comp-dis">
                          {download.assetName}
                        </div>
                        <div className="report-user-email">
                          {download.assetType}
                        </div>
                        <div className="report-user-email small-text">
                          by {download.publisher}
                        </div>
                      </div>
                    </div>
                  </td>
                 <td>
          <div className="user-info-cell">
            {download.latestUser ? (
              <>
                <div className="user-name comp-dis">
                  {download.latestUser.username}
                </div>
                <div className="user-email small-text">
                  {download.latestUser.email}
                </div>
                {download.recentUsers.length > 1 && (
                  <div className="more-users">
                    +{download.recentUsers.length - 1} more user(s)
                  </div>
                )}
              </>
            ) : (
              <div className="no-user-data">No user data</div>
            )}
          </div>
        </td>
                  <td>
                    <div className="download-count">
                      <strong>
                        {download.totalDownloads.toLocaleString()}
                      </strong>
                      <div className="download-breakdown">
                        <span className="success">
                          {download.successfulDownloads} ✓
                        </span>
                        <span className="failed">
                          {download.failedDownloads} ✗
                        </span>
                      </div>
                    </div>
                  </td>
                  

                  <td>
                    <span className="report-category-badge content">
                      {download.category}
                    </span>
                  </td>
                  <td>{getStatusBadge(download.successRate)}</td>
                  <td>
                    {getTrendBadge(download.trend, download.trendPercentage)}
                  </td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => handleViewDetails(download)}
                      >
                        <FiEye />
                      </button>

                      {download.recentUsers.length > 0 && (
      <button
        className="action-button info small"
        title="View Users"
        onClick={() => handleViewUsers(download)}
      >
        <FiUsers />
      </button>
    )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {filteredDownloads.length === 0 && (
            <div className="empty-state">
              <FiDownload className="empty-icon" />
              <h3 className="empty-title">
                {downloads.length === 0
                  ? "No download data available"
                  : "No assets found"}
              </h3>
              <p className="empty-text">
                {downloads.length === 0
                  ? "Download statistics will appear here once assets are downloaded."
                  : "No assets match your search criteria."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Asset Details Modal */}
      {showModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal enhanced-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiPackage className="modal-icon" />
                {selectedAsset.assetName}
              </h3>
              <button className="close-button" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="asset-details-grid">
                <div className="detail-section">
                  <h4 className="section-title">
                    <FiBarChart2 className="section-icon" />
                    Download Statistics
                  </h4>
                  <div className="stats-grid-modal">
                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAsset.totalDownloads.toLocaleString()}
                      </div>
                      <div className="stat-label">Total Downloads</div>
                    </div>
                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAsset.successRate}%
                      </div>
                      <div className="stat-label">Success Rate</div>
                    </div>
                    <div className="stat-card-modal">
                      <div className="stat-value currency">
                        {formatCurrency(selectedAsset.revenue)}
                      </div>
                      <div className="stat-label">Total Revenue</div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <FiUser className="section-icon" />
                    Asset Information
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Publisher:</span>
                      <span className="info-value">
                        {selectedAsset.publisher}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Asset Type:</span>
                      <span className="info-value">
                        {selectedAsset.assetType}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Category:</span>
                      <span className="info-value">
                        {selectedAsset.category}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">File Size:</span>
                      <span className="info-value">
                        {formatFileSize(selectedAsset.fileSize)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Price:</span>
                      <span className="info-value">
                        {formatCurrency(selectedAsset.price)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">License:</span>
                      <span className="info-value">
                        {getLicenseBadge(selectedAsset.license)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Rating:</span>
                      <span className="info-value">
                        {selectedAsset.rating}/5.0
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Download:</span>
                      <span className="info-value">
                        {formatDate(selectedAsset.lastDownload)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <FiTrendingUp className="section-icon" />
                    Performance Metrics
                  </h4>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-label">
                        Successful Downloads:
                      </span>
                      <span className="metric-value">
                        {selectedAsset.successfulDownloads.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Failed Downloads:</span>
                      <span className="metric-value">
                        {selectedAsset.failedDownloads.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Trend:</span>
                      <span className="metric-value">
                        {getTrendBadge(
                          selectedAsset.trend,
                          selectedAsset.trendPercentage
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-actions">
                <button
                  className="action-button secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      // Add this modal component before the closing div
{showUsersModal && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h3 className="modal-title">
          <FiUsers className="modal-icon" />
          Users Who Downloaded This Asset
        </h3>
        <button className="close-button" onClick={() => setShowUsersModal(false)}>
          <FiX />
        </button>
      </div>
      <div className="modal-body">
        <div className="users-list">
          {selectedAssetUsers.map((user, index) => (
            <div key={index} className="user-item">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Downloads;
