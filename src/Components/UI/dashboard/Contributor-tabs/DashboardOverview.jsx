import React, { useState } from "react";
import {
  FiUpload,
  FiClock,
  FiXCircle,
  FiCheckCircle,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiDownload,
  FiStar,
  FiFileText,
  FiUsers,
  FiAlertCircle,
  FiTrendingDown,
  FiPieChart,
  FiList,
  FiPlus,
  FiX
} from "react-icons/fi";
import Upload from "../../../../Pages/Upload"; // Adjust path according to your structure

const DashboardOverview = ({ 
  userData, 
  assets, 
  stats, 
  refreshData, 
  formatCurrency, 
  formatDate 
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  // Calculate additional stats
  const approvalRate = stats.totalUploads > 0 
    ? ((stats.published / stats.totalUploads) * 100).toFixed(1)
    : 0;

  const recentAssets = assets.slice(0, 5);
  const topPerformingAssets = assets
    .filter(asset => asset.status === 'published')
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 3);

  // Calculate trends (similar to User Report)
  const trends = {
    totalUploads: { value: 12.5, isPositive: true },
    underRevision: { value: -5.2, isPositive: false },
    published: { value: 8.3, isPositive: true },
    earnings: { value: 15.7, isPositive: true }
  };

  // Function to handle tab navigation
  const handleNavigateToTab = (tabName) => {
    console.log(`Navigate to tab: ${tabName}`);
  };

  // Upload handlers
  const handleOpenUpload = () => {
    setUploadKey(prev => prev + 1);
    setShowUploadDialog(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    refreshData(); // Refresh the dashboard data
  };

  const handleUploadClose = () => {
    setShowUploadDialog(false);
  };

  return (
    <div className="user-reports-dashboard">
      {/* Upload Modal */}
      {showUploadDialog && (
        <div className="blog-modal-overlay">
          <div className="blog-modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiPlus className="modal-icon" />
                Upload New Asset
              </h3>
              <button onClick={handleUploadClose} className="close-button">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-wrapper">
                <Upload
                  key={`dashboard-upload-${uploadKey}`}
                  editMode={false}
                  assetToEdit={null}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadClose={handleUploadClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Same as User Report */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            Content Dashboard
          </h2>
          <p className="header-subtitle">
            Monitor and manage your content performance and earnings
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalUploads} total uploads
          </span>
        </div>
      </div>

      {/* Statistics Cards - Same structure as User Report */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUpload />
            </div>
            <div>
              <h3 className="report-stat-title">Total Uploads</h3>
              <div className="report-stat-value">{stats.totalUploads}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All time content submissions
            </div>
            <div className={`report-stat-trend ${trends.totalUploads.isPositive ? 'positive' : 'negative'}`}>
              {trends.totalUploads.value > 0 ? '+' : ''}{trends.totalUploads.value.toFixed(1)}% 
              {trends.totalUploads.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Under Revision</h3>
              <div className="report-stat-value">{stats.underRevision}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              In review process
            </div>
            <div className={`report-stat-trend ${trends.underRevision.isPositive ? 'positive' : 'negative'}`}>
              {trends.underRevision.value > 0 ? '+' : ''}{trends.underRevision.value.toFixed(1)}% 
              {trends.underRevision.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Published</h3>
              <div className="report-stat-value">{stats.published}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {approvalRate}% approval rate
            </div>
            <div className={`report-stat-trend ${trends.published.isPositive ? 'positive' : 'negative'}`}>
              {trends.published.value > 0 ? '+' : ''}{trends.published.value.toFixed(1)}% 
              {trends.published.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Total Earnings</h3>
              <div className="report-stat-value">
                {formatCurrency(stats.totalEarnings)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Lifetime earnings</div>
            <div className={`report-stat-trend ${trends.earnings.isPositive ? 'positive' : 'negative'}`}>
              {trends.earnings.value > 0 ? '+' : ''}{trends.earnings.value.toFixed(1)}% 
              {trends.earnings.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Performance - Same structure as User Report */}
      <div className="reports-content-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiStar className="panel-icon" /> Performance Metrics
            </h3>
          </div>
          <div className="reports-chart-body">
            <div className="performance-metrics">
              <div className="metric-item">
                <div className="metric-label">Approval Rate</div>
                <div className="metric-value">{approvalRate}%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{ width: `${approvalRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="metric-item">
                <div className="metric-label">Rejection Rate</div>
                <div className="metric-value">
                  {stats.totalUploads > 0 
                    ? ((stats.rejections / stats.totalUploads) * 100).toFixed(1) 
                    : 0
                  }%
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill rejection" 
                    style={{ 
                      width: `${stats.totalUploads > 0 
                        ? (stats.rejections / stats.totalUploads) * 100 
                        : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="metric-item">
                <div className="metric-label">Under Review</div>
                <div className="metric-value">
                  {stats.totalUploads > 0 
                    ? ((stats.underRevision / stats.totalUploads) * 100).toFixed(1) 
                    : 0
                  }%
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill review" 
                    style={{ 
                      width: `${stats.totalUploads > 0 
                        ? (stats.underRevision / stats.totalUploads) * 100 
                        : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reports-categories-card">
          <div className="reports-categories-header">
            <h3 className="panel-title">
              <FiPieChart className="panel-icon" /> Quick Actions
            </h3>
          </div>
          <div className="reports-categories-body">
            <div className="quick-actions">
              <button 
                className="action-btn"
                onClick={handleOpenUpload}
              >
                <FiUpload className="action-icon" />
                <span>Upload New File</span>
              </button>
              
              <button 
                className="action-btn"
                onClick={() => handleNavigateToTab('files')}
              >
                <FiEye className="action-icon" />
                <span>View All Files</span>
              </button>
              
              <button 
                className="action-btn"
                onClick={() => handleNavigateToTab('stats')}
              >
                <FiTrendingUp className="action-icon" />
                <span>View Analytics</span>
              </button>
              
              <button 
                className="action-btn"
                onClick={() => handleNavigateToTab('guidelines')}
              >
                <FiStar className="action-icon" />
                <span>Guidelines</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Using table structure like User Report */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Recent Activity
          </h3>
          <button className="action-button secondary">
            <FiDownload className="button-icon" /> Export Data
          </button>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Status</th>
                <th>Downloads</th>
                <th>Earnings</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {asset.title?.charAt(0) || 'A'}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">
                          {asset.title || "Untitled Asset"}
                        </div>
                        <div className="report-user-email">{asset.category || "No category"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`report-status-badge ${asset.status || "pending"}`}>
                      {asset.status === "published" ? "Published" : 
                       asset.status === "rejected" ? "Rejected" : 
                       asset.status === "under_review" ? "In Review" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="download-count">
                      <span className="metric-value">{asset.downloads || 0}</span>
                    </div>
                  </td>
                  <td>
                    <div className="performer-earnings">
                      {formatCurrency(asset.earnings || 0)}
                    </div>
                  </td>
                  <td>{formatDate(asset.createdAt)}</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => handleNavigateToTab('files')}
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentAssets.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-reports">
                    No assets found. <button className="btn-outline" onClick={handleOpenUpload}>Upload your first file</button> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiUsers className="panel-icon" /> Top Performing Assets
          </h3>
        </div>
        <div className="performers-list">
          {topPerformingAssets.map((asset, index) => (
            <div key={asset.id} className="performer-item">
              <div className="performer-rank">
                #{index + 1}
              </div>
              <div className="performer-details">
                <p className="performer-title">
                  {asset.title || "Untitled Asset"}
                </p>
                <div className="performer-stats">
                  <span className="stat">
                    <FiDownload className="stat-icon" />
                    {asset.downloads || 0} downloads
                  </span>
                  {asset.rating && (
                    <span className="stat">
                      <FiStar className="stat-icon" />
                      {asset.rating}
                    </span>
                  )}
                </div>
              </div>
              <div className="performer-earnings">
                {formatCurrency(asset.earnings || 0)}
              </div>
            </div>
          ))}
          {topPerformingAssets.length === 0 && (
            <div className="no-performers">
              <p>No published assets yet</p>
              <p className="subtext">
                <button className="btn-outline" onClick={handleOpenUpload}>
                  Upload your first file
                </button> to see your top performers here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;