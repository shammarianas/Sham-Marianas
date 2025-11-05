import React, { useState } from "react";
import { FiFileText, FiUsers, FiDownload, FiFilter, FiSearch, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";

const SellerReports = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      sellerName: "Ali Designs",
      reportType: "Monthly Sales",
      period: "January 2024",
      generatedDate: "2024-02-01",
      status: "completed",
      downloads: 45,
      size: "2.4 MB"
    },
    {
      id: 2,
      sellerName: "Sara Creations",
      reportType: "Product Performance",
      period: "Q4 2023",
      generatedDate: "2024-01-15",
      status: "completed",
      downloads: 28,
      size: "1.8 MB"
    },
    {
      id: 3,
      sellerName: "UR Designs",
      reportType: "Earnings Summary",
      period: "December 2023",
      generatedDate: "2024-01-05",
      status: "completed",
      downloads: 32,
      size: "3.1 MB"
    },
    {
      id: 4,
      sellerName: "Digital Assets Co",
      reportType: "Customer Analytics",
      period: "Weekly",
      generatedDate: "2024-02-10",
      status: "generating",
      downloads: 0,
      size: "Processing"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = reportTypeFilter === "all" || report.reportType === reportTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="status-badge success"><FiCheckCircle /> Completed</span>;
      case "generating":
        return <span className="status-badge warning"><FiClock /> Generating</span>;
      case "failed":
        return <span className="status-badge danger"><FiAlertCircle /> Failed</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  const handleGenerateReport = () => {
    // Report generation logic here
    alert("New report generation started!");
  };

  return (
    <div className="seller-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            Seller Reports
          </h2>
          <p className="header-subtitle">
            Generate and manage seller performance reports
          </p>
        </div>
        <div className="header-actions">
          <button className="action-button" onClick={handleGenerateReport}>
            <FiFileText className="button-icon" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiFileText />
          </div>
          <div className="stat-content">
            <div className="stat-value">{reports.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiDownload />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {reports.reduce((sum, report) => sum + report.downloads, 0)}
            </div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {reports.filter(r => r.status === "generating").length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">12</div>
            <div className="stat-label">Active Sellers</div>
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
                placeholder="Search reports..."
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
              <option value="generating">Generating</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="Monthly Sales">Monthly Sales</option>
              <option value="Product Performance">Product Performance</option>
              <option value="Earnings Summary">Earnings Summary</option>
              <option value="Customer Analytics">Customer Analytics</option>
            </select>

            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredReports.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-type">{report.reportType}</div>
              {getStatusBadge(report.status)}
            </div>
            
            <div className="report-body">
              <div className="report-seller">
                <div className="seller-avatar">
                  {report.sellerName.charAt(0)}
                </div>
                <div className="seller-info">
                  <div className="seller-name">{report.sellerName}</div>
                  <div className="report-period">{report.period}</div>
                </div>
              </div>

              <div className="report-meta">
                <div className="meta-item">
                  <span className="meta-label">Generated:</span>
                  <span className="meta-value">{report.generatedDate}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Size:</span>
                  <span className="meta-value">{report.size}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Downloads:</span>
                  <span className="meta-value">{report.downloads}</span>
                </div>
              </div>
            </div>

            <div className="report-actions">
              {report.status === "completed" && (
                <button className="action-button secondary">
                  <FiDownload className="button-icon" />
                  Download
                </button>
              )}
              {report.status === "generating" && (
                <button className="action-button" disabled>
                  <FiClock className="button-icon" />
                  Generating...
                </button>
              )}
              <button className="action-button">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Types Section */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="panel-title">Available Report Types</h3>
        </div>
        <div className="card-body">
          <div className="report-types-grid">
            <div className="report-type-card">
              <div className="type-icon">
                <FiTrendingUp />
              </div>
              <h4 className="type-title">Sales Performance</h4>
              <p className="type-description">
                Detailed analysis of sales trends, revenue, and product performance
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>

            <div className="report-type-card">
              <div className="type-icon">
                <FiDownload />
              </div>
              <h4 className="type-title">Download Analytics</h4>
              <p className="type-description">
                Insights into download patterns and customer behavior
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>

            <div className="report-type-card">
              <div className="type-icon">
                <FiFileText />
              </div>
              <h4 className="type-title">Earnings Summary</h4>
              <p className="type-description">
                Comprehensive earnings breakdown and payout history
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>

            <div className="report-type-card">
              <div className="type-icon">
                <FiUsers />
              </div>
              <h4 className="type-title">Customer Insights</h4>
              <p className="type-description">
                Customer demographics and purchasing behavior analysis
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerReports;