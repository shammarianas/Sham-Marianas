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
  FiX,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import Upload from "../../../../Pages/Upload";

const DashboardOverview = ({
  userData,
  assets,
  stats,
  refreshData,
  formatCurrency,
  formatDate,
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Calculate additional stats
  const approvalRate =
    stats.totalUploads > 0
      ? ((stats.published / stats.totalUploads) * 100).toFixed(1)
      : 0;

  // Pagination for recent assets
  const totalPages = Math.ceil(assets.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentAssets = assets.slice(startIndex, endIndex);
  const recentAssets = currentAssets.slice(0, 10); // Show 10 rows per page

  const topPerformingAssets = assets
    .filter((asset) => asset.status === "published")
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 3);

  // Calculate trends
  const trends = {
    totalUploads: { value: 12.5, isPositive: true },
    underRevision: { value: -5.2, isPositive: false },
    published: { value: 8.3, isPositive: true },
    earnings: { value: 15.7, isPositive: true },
  };

  // Upload handlers
  const handleOpenUpload = () => {
    setUploadKey((prev) => prev + 1);
    setShowUploadDialog(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    refreshData();
  };

  const handleUploadClose = () => {
    setShowUploadDialog(false);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleSeeMore = () => {
    setRowsPerPage(rowsPerPage + 10);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="user-reports-dashboard">
      {/* Upload Modal */}
      {showUploadDialog && (
        <div className="modal-overlay" onClick={handleUploadClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload New Asset</h3>
              <button className="modal-close" onClick={handleUploadClose}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
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
      )}

      {/* Header */}
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

      {/* Statistics Cards */}
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
            <div
              className={`report-stat-trend ${
                trends.totalUploads.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.totalUploads.value > 0 ? "+" : ""}
              {trends.totalUploads.value.toFixed(1)}%
              {trends.totalUploads.isPositive ? (
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
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Under Revision</h3>
              <div className="report-stat-value">{stats.underRevision}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">In review process</div>
            <div
              className={`report-stat-trend ${
                trends.underRevision.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.underRevision.value > 0 ? "+" : ""}
              {trends.underRevision.value.toFixed(1)}%
              {trends.underRevision.isPositive ? (
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
              <h3 className="report-stat-title">Published</h3>
              <div className="report-stat-value">{stats.published}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {approvalRate}% approval rate
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

      {/* Charts and Performance */}
      <div className="reports-content-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiStar className="panel-icon" /> Performance Metrics
            </h3>
            <div className="satisfaction-score">
              <span className="score-value">{approvalRate}%</span>
              <span className="score-label">Approval Rate</span>
            </div>
          </div>
          <div className="reports-chart-body">
            <div className="performance-metrics-grid">
              <div className="performance-metric">
                <div className="metric-header">
                  <span className="metric-name">Approval Rate</span>
                  <span className="metric-status excellent">Excellent</span>
                </div>
                <div className="metric-value">{approvalRate}%</div>
                <div className="metric-target">Target: 80%</div>
                <div className="category-progress-bar">
                  <div
                    className="category-progress-fill excellent"
                    style={{
                      width: `${approvalRate}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="performance-metric">
                <div className="metric-header">
                  <span className="metric-name">Rejection Rate</span>
                  <span className="metric-status poor">Poor</span>
                </div>
                <div className="metric-value">
                  {stats.totalUploads > 0
                    ? ((stats.rejections / stats.totalUploads) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="metric-target">Target: Below 10%</div>
                <div className="category-progress-bar">
                  <div
                    className="category-progress-fill poor"
                    style={{
                      width: `${
                        stats.totalUploads > 0
                          ? (stats.rejections / stats.totalUploads) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="performance-metric">
                <div className="metric-header">
                  <span className="metric-name">Under Review</span>
                  <span className="metric-status average">Average</span>
                </div>
                <div className="metric-value">
                  {stats.totalUploads > 0
                    ? (
                        (stats.underRevision / stats.totalUploads) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="metric-target">Target: Below 15%</div>
                <div className="category-progress-bar">
                  <div
                    className="category-progress-fill average"
                    style={{
                      width: `${
                        stats.totalUploads > 0
                          ? (stats.underRevision / stats.totalUploads) * 100
                          : 0
                      }%`,
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
              <button className="action-button" onClick={handleOpenUpload}>
                <FiUpload className="button-icon" />
                Upload New File
              </button>

              <button
                className="action-button secondary"
                onClick={() => console.log("View All Files")}
              >
                <FiEye className="button-icon" />
                View All Files
              </button>

              <button
                className="action-button secondary"
                onClick={() => console.log("View Analytics")}
              >
                <FiTrendingUp className="button-icon" />
                View Analytics
              </button>

              <button
                className="action-button secondary"
                onClick={() => console.log("Guidelines")}
              >
                <FiStar className="button-icon" />
                Guidelines
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Recent Activity
          </h3>
          <div className="table-controls">
            <div className="table-info">
              Showing {startIndex + 1}-{Math.min(endIndex, assets.length)} of{" "}
              {assets.length} assets
            </div>
            <button className="action-button secondary">
              <FiDownload className="button-icon" /> Export Data
            </button>
          </div>
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
                        {asset.title?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">
                          {asset.title || "Untitled Asset"}
                        </div>
                        <div className="report-user-email">
                          {asset.category || "No category"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`report-status-badge ${
                        asset.status || "pending"
                      }`}
                    >
                      {asset.status === "approved"
                        ? "Approved"
                        : asset.status === "pending"
                        ? "Pending"
                        : asset.status === "rejected"
                        ? "Rejected"
                        : "Pending"}
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
                  <td>{formatDate(asset.createdAt)}</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => console.log("View asset details")}
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentAssets.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">
                    No assets found.{" "}
                    <button
                      className="action-button small"
                      onClick={handleOpenUpload}
                    >
                      Upload your first file
                    </button>{" "}
                    to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {assets.length > 10 && (
            <div className="table-footer">
              <div className="pagination-controls">
                <button
                  className="pagination-button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                  Previous
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`pagination-number ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => handlePageClick(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                </div>

                <button
                  className="pagination-button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>

              {/* See More Button */}
              {endIndex < assets.length && (
                <div className="see-more-section">
                  <button className="see-more-button" onClick={handleSeeMore}>
                    <FiPlus className="button-icon" />
                    Load More Assets ({assets.length - endIndex} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiUsers className="panel-icon" /> Top Performing Assets
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {topPerformingAssets.length} of {stats.published}{" "}
              published assets
            </span>
          </div>
        </div>

        <div className="performers-grid">
          {topPerformingAssets.map((asset, index) => (
            <div key={asset.id} className="performer-card">
              <div className="performer-header">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-title">
                  {asset.title || "Untitled Asset"}
                </div>
              </div>
              <div className="performer-stats">
                <div className="performer-stat">
                  <FiDownload className="stat-icon" />
                  <span className="stat-value">{asset.downloads || 0}</span>
                  <span className="stat-label">Downloads</span>
                </div>
                {asset.rating && (
                  <div className="performer-stat">
                    <FiStar className="stat-icon" />
                    <span className="stat-value">{asset.rating}</span>
                    <span className="stat-label">Rating</span>
                  </div>
                )}
                <div className="performer-stat">
                  <FiDollarSign className="stat-icon" />
                  <span className="stat-value currency">
                    {formatCurrency(asset.earnings || 0)}
                  </span>
                  <span className="stat-label">Earnings</span>
                </div>
              </div>
              <div className="performer-actions">
                <button className="action-button secondary small">
                  <FiEye /> View
                </button>
              </div>
            </div>
          ))}
          {topPerformingAssets.length === 0 && (
            <div className="empty-state">
              <FiFileText className="empty-icon" />
              <h4 className="empty-title">No published assets yet</h4>
              <p className="empty-text">
                <button className="action-button" onClick={handleOpenUpload}>
                  Upload your first file
                </button>{" "}
                to see your top performers here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CONTRIBUTOR CONTENT</h4>
            <p>Manage and track your content performance</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="#upload" onClick={handleOpenUpload}>
                Upload New File
              </a>
              <a href="#guidelines">Content Guidelines</a>
              <a href="#support">Support</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Stats Summary</h4>
            <div className="footer-stats">
              <span>Total Uploads: {stats.totalUploads}</span>
              <span>Published: {stats.published}</span>
              <span>Earnings: {formatCurrency(stats.totalEarnings)}</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Content Dashboard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
