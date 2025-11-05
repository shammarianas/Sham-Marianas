import React, { useState } from "react";
import { FiDownload, FiTrendingUp, FiUsers, FiCalendar, FiFilter, FiSearch, FiEye, FiBarChart2 } from "react-icons/fi";

const Downloads = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [downloads, setDownloads] = useState([
    {
      id: 1,
      assetName: "Modern 3D Car Model",
      assetType: "3D Model",
      user: "John Smith",
      userEmail: "john@example.com",
      date: "2024-02-15",
      time: "14:30",
      fileSize: "45.2 MB",
      status: "completed",
      license: "Commercial"
    },
    {
      id: 2,
      assetName: "Business Presentation Template",
      assetType: "Template",
      user: "Sarah Johnson",
      userEmail: "sarah@example.com",
      date: "2024-02-15",
      time: "13:15",
      fileSize: "12.8 MB",
      status: "completed",
      license: "Personal"
    },
    {
      id: 3,
      assetName: "Premium Icon Pack",
      assetType: "Icons",
      user: "Mike Brown",
      userEmail: "mike@example.com",
      date: "2024-02-14",
      time: "16:45",
      fileSize: "8.3 MB",
      status: "failed",
      license: "Commercial"
    },
    {
      id: 4,
      assetName: "4K HDRI Environment",
      assetType: "HDRI",
      user: "Emma Wilson",
      userEmail: "emma@example.com",
      date: "2024-02-14",
      time: "11:20",
      fileSize: "156.7 MB",
      status: "completed",
      license: "Enterprise"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = 
      download.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || download.status === statusFilter;
    const matchesType = typeFilter === "all" || download.assetType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: downloads.length,
    completed: downloads.filter(d => d.status === "completed").length,
    failed: downloads.filter(d => d.status === "failed").length,
    totalSize: downloads.reduce((sum, d) => sum + parseFloat(d.fileSize), 0)
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="status-badge success">Completed</span>;
      case "failed":
        return <span className="status-badge danger">Failed</span>;
      case "processing":
        return <span className="status-badge warning">Processing</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  const getLicenseBadge = (license) => {
    switch (license) {
      case "Commercial":
        return <span className="license-badge commercial">Commercial</span>;
      case "Enterprise":
        return <span className="license-badge enterprise">Enterprise</span>;
      case "Personal":
        return <span className="license-badge personal">Personal</span>;
      default:
        return <span className="license-badge">Unknown</span>;
    }
  };

  return (
    <div className="downloads-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDownload className="header-icon" />
            Downloads Management
          </h2>
          <p className="header-subtitle">
            Monitor and manage asset downloads across the platform
          </p>
        </div>
        <div className="header-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="action-button secondary">
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiDownload />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Downloads</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +15.3%
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiDownload />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Successful</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +12.7%
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <FiDownload />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.failed}</div>
            <div className="stat-label">Failed</div>
            <div className="stat-trend negative">
              -2.1%
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiDownload />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSize.toFixed(1)} MB</div>
            <div className="stat-label">Total Size</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +18.5%
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column - Charts */}
        <div className="charts-column">
          {/* Download Trends */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiBarChart2 className="panel-icon" />
                Download Trends
              </h3>
            </div>
            <div className="card-body">
              <div className="chart-placeholder">
                <FiBarChart2 className="placeholder-icon large" />
                <p>Download trends chart showing daily/weekly patterns</p>
              </div>
            </div>
          </div>

          {/* Asset Type Distribution */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">Asset Type Distribution</h3>
            </div>
            <div className="card-body">
              <div className="type-distribution">
                <div className="type-item">
                  <div className="type-header">
                    <span className="type-name">3D Models</span>
                    <span className="type-percentage">35%</span>
                  </div>
                  <div className="type-progress">
                    <div className="progress-bar" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="type-item">
                  <div className="type-header">
                    <span className="type-name">Templates</span>
                    <span className="type-percentage">25%</span>
                  </div>
                  <div className="type-progress">
                    <div className="progress-bar" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div className="type-item">
                  <div className="type-header">
                    <span className="type-name">Graphics</span>
                    <span className="type-percentage">20%</span>
                  </div>
                  <div className="type-progress">
                    <div className="progress-bar" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className="type-item">
                  <div className="type-header">
                    <span className="type-name">Others</span>
                    <span className="type-percentage">20%</span>
                  </div>
                  <div className="type-progress">
                    <div className="progress-bar" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Downloads */}
        <div className="downloads-column">
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">Recent Downloads</h3>
            </div>
            <div className="card-body">
              <div className="recent-downloads-list">
                {downloads.slice(0, 5).map((download) => (
                  <div key={download.id} className="download-item">
                    <div className="download-info">
                      <div className="asset-name">{download.assetName}</div>
                      <div className="download-meta">
                        <span className="user">{download.user}</span>
                        <span className="date">{download.date} at {download.time}</span>
                      </div>
                    </div>
                    <div className="download-stats">
                      {getStatusBadge(download.status)}
                      <span className="file-size">{download.fileSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card filters-card">
        <div className="card-body">
          <div className="filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search downloads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="3D Model">3D Models</option>
              <option value="Template">Templates</option>
              <option value="Icons">Icons</option>
              <option value="HDRI">HDRIs</option>
            </select>

            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredDownloads.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="content-card">
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>File Size</th>
                  <th>License</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.map((download) => (
                  <tr key={download.id}>
                    <td>
                      <div className="asset-info">
                        <div className="asset-name">{download.assetName}</div>
                        <div className="asset-type">{download.assetType}</div>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{download.user}</div>
                        <div className="user-email">{download.userEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="download-date">
                        <div className="date">{download.date}</div>
                        <div className="time">{download.time}</div>
                      </div>
                    </td>
                    <td>
                      <div className="file-size">{download.fileSize}</div>
                    </td>
                    <td>
                      {getLicenseBadge(download.license)}
                    </td>
                    <td>
                      {getStatusBadge(download.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button secondary small">
                          <FiEye />
                          Details
                        </button>
                        {download.status === "failed" && (
                          <button className="action-button small">
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDownloads.length === 0 && (
            <div className="empty-state">
              <FiDownload className="empty-icon" />
              <h3 className="empty-title">No downloads found</h3>
              <p className="empty-text">
                {searchTerm 
                  ? "No downloads match your search criteria." 
                  : "No download records available for the selected period."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Downloads;