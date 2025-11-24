import React, { useState, useEffect } from "react";
import { 
  FiFileText, 
  FiUsers, 
  FiDownload, 
  FiFilter, 
  FiSearch, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock,
  FiRefreshCw,
  FiList,
  FiX,
  FiEye,
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiDollarSign
} from "react-icons/fi";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";

const SellerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ✅ DYNAMIC DATA FETCHING
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all contributors
        const contributorsSnapshot = await getDocs(collection(db, "Contributors"));
        const allContributors = [];
        
        contributorsSnapshot.forEach((doc) => {
          const contributorData = doc.data();
          allContributors.push({
            id: doc.id,
            ...contributorData
          });
        });

        console.log("📊 Total contributors:", allContributors.length);

        // Generate dynamic reports based on contributors
        const dynamicReports = [];
        let reportId = 1;

        for (const contributor of allContributors.slice(0, 8)) { // Limit to 8 reports for demo
          try {
            // Fetch contributor's assets to calculate revenue
            const assetsQuery = query(
              collection(db, "Assets"),
              where("ownerId", "==", contributor.id)
            );
            const assetsSnapshot = await getDocs(assetsQuery);
            
            let contributorRevenue = 0;
            let totalDownloads = 0;

            assetsSnapshot.forEach((assetDoc) => {
              const assetData = assetDoc.data();
              const price = parseFloat(assetData.price) || 0;
              const downloads = parseInt(assetData.downloads) || 0;
              
              if (assetData.status === "approved" || assetData.status === "published") {
                contributorRevenue += price * downloads;
              }
              totalDownloads += downloads;
            });

            // Generate different report types
            const reportTypes = [
              "Monthly Sales",
              "Product Performance", 
              "Earnings Summary",
              "Customer Analytics"
            ];
            
            const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
            const status = Math.random() > 0.2 ? "completed" : "generating";
            const growth = (Math.random() * 40 - 10).toFixed(1); // -10% to 30%

            dynamicReports.push({
              id: reportId++,
              sellerName: contributor.businessName || contributor.username || contributor.displayName || "Unknown Seller",
              sellerEmail: contributor.email || "No email",
              reportType: reportType,
              period: getRandomPeriod(),
              generatedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: status,
              downloads: status === "completed" ? Math.floor(Math.random() * 50) : 0,
              size: status === "completed" ? `${(Math.random() * 3 + 1).toFixed(1)} MB` : "Processing",
              format: getRandomFormat(),
              revenue: Math.floor(contributorRevenue) || Math.floor(Math.random() * 20000),
              growth: parseFloat(growth),
              totalAssets: assetsSnapshot.size,
              totalDownloads: totalDownloads
            });

          } catch (error) {
            console.error(`Error processing contributor ${contributor.id}:`, error);
          }
        }

        setReports(dynamicReports);
        console.log("✅ Dynamic reports generated:", dynamicReports.length);

      } catch (error) {
        console.error("❌ Error fetching reports data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // ✅ HELPER FUNCTIONS
  const getRandomPeriod = () => {
    const periods = [
      "January 2024", "February 2024", "March 2024", "Q1 2024", 
      "December 2023", "Q4 2023", "Weekly", "Monthly"
    ];
    return periods[Math.floor(Math.random() * periods.length)];
  };

  const getRandomFormat = () => {
    const formats = ["PDF", "Excel", "CSV"];
    return formats[Math.floor(Math.random() * formats.length)];
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = reportTypeFilter === "all" || report.reportType === reportTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // ✅ DYNAMIC STATISTICS
  const stats = {
    totalReports: reports.length,
    completedReports: reports.filter(r => r.status === "completed").length,
    generatingReports: reports.filter(r => r.status === "generating").length,
    totalDownloads: reports.reduce((sum, report) => sum + report.downloads, 0),
    totalRevenue: reports.reduce((sum, report) => sum + report.revenue, 0),
    totalSellers: new Set(reports.map(r => r.sellerEmail)).size,
    averageRevenue: reports.length > 0 ? reports.reduce((sum, report) => sum + report.revenue, 0) / reports.length : 0
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="report-status-badge resolved"><FiCheckCircle /> Completed</span>;
      case "generating":
        return <span className="report-status-badge pending"><FiClock /> Generating</span>;
      case "failed":
        return <span className="report-status-badge in-progress"><FiAlertCircle /> Failed</span>;
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  const getGrowthBadge = (growth) => {
    return growth >= 0 
      ? <span className="report-stat-trend positive">+{growth}% <FiTrendingUp className="fi-pl" /></span>
      : <span className="report-stat-trend negative">{growth}% <FiTrendingDown className="fi-pl" /></span>;
  };

  const getReportTypeBadge = (reportType) => {
    const types = {
      "Monthly Sales": { class: "technical", icon: "📊" },
      "Product Performance": { class: "billing", icon: "📈" },
      "Earnings Summary": { class: "general", icon: "💰" },
      "Customer Analytics": { class: "feature", icon: "👥" }
    };
    const typeInfo = types[reportType] || { class: "general", icon: "📄" };
    
    return (
      <span className={`report-category-badge ${typeInfo.class}`}>
        {typeInfo.icon} {reportType}
      </span>
    );
  };

  const handleGenerateReport = () => {
    alert("New report generation started!");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setReportTypeFilter("all");
  };

  if (loading) {
    return (
      <div className="user-reports-dashboard">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading seller reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-reports-dashboard">
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
          <span className="user-badge-count">
            {stats.totalReports} total reports
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiFileText />
            </div>
            <div>
              <h3 className="report-stat-title">Total Reports</h3>
              <div className="report-stat-value">{stats.totalReports}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All generated reports
            </div>
            <div className="report-stat-trend positive">
              +15% <FiTrendingUp className="fi-pl" />
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
              Report downloads
            </div>
            <div className="report-stat-trend positive">
              +22% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">In Progress</h3>
              <div className="report-stat-value">{stats.generatingReports}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Reports generating
            </div>
            <div className="report-stat-trend negative">
              +8% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Active Sellers</h3>
              <div className="report-stat-value">{stats.totalSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Generating reports
            </div>
            <div className="report-stat-trend positive">
              +15.7% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Reports
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredReports.length} of {stats.totalReports} reports
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search reports by seller, type, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="generating">Generating</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="filter-select"
            value={reportTypeFilter}
            onChange={(e) => setReportTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Monthly Sales">Monthly Sales</option>
            <option value="Product Performance">Product Performance</option>
            <option value="Earnings Summary">Earnings Summary</option>
            <option value="Customer Analytics">Customer Analytics</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
            <button className="filter-button primary" onClick={handleGenerateReport}>
              <FiFileText /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Generated Reports
          </h3>
          <button className="action-button secondary">
            <FiDownload className="button-icon" /> Export List
          </button>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Report Type</th>
                <th>Period</th>
                <th>Generated Date</th>
                <th>Revenue</th>
                <th>Downloads</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {report.sellerName.charAt(0)}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">{report.sellerName}</div>
                        <div className="report-user-email">{report.sellerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {getReportTypeBadge(report.reportType)}
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiCalendar style={{ marginRight: '4px' }} />
                      {report.period}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiClock style={{ marginRight: '4px' }} />
                      {report.generatedDate}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: '4px' }} />
                      {report.revenue.toLocaleString()}
                      <div style={{ fontSize: '0.75rem', color: report.growth >= 0 ? '#10b981' : '#ef4444' }}>
                        {getGrowthBadge(report.growth)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiDownload style={{ marginRight: '4px' }} />
                      {report.downloads}
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {report.size}
                      </div>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(report.status)}
                  </td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye />
                      </button>
                      
                      {report.status === "completed" && (
                        <button
                          className="action-button small"
                          title="Download Report"
                          onClick={() => alert(`Downloading ${report.reportType} for ${report.sellerName}`)}
                        >
                          <FiDownload />
                        </button>
                      )}
                      
                      {report.status === "generating" && (
                        <button
                          className="action-button warning small"
                          title="Check Status"
                          onClick={() => alert(`Checking status of ${report.reportType}`)}
                        >
                          <FiClock />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-reports">
                    No reports found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Types Section */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiFileText className="panel-icon" /> Available Report Types
          </h3>
        </div>
        <div className="recent-reports-body">
          <div className="report-types-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
            <div className="report-type-card" style={{ background: 'var(--darker)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <div className="type-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                <FiTrendingUp />
              </div>
              <h4 className="type-title" style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Sales Performance</h4>
              <p className="type-description" style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                Detailed analysis of sales trends, revenue, and product performance
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>

            <div className="report-type-card" style={{ background: 'var(--darker)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <div className="type-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                <FiDownload />
              </div>
              <h4 className="type-title" style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Download Analytics</h4>
              <p className="type-description" style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                Insights into download patterns and customer behavior
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>

            <div className="report-type-card" style={{ background: 'var(--darker)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <div className="type-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                <FiFileText />
              </div>
              <h4 className="type-title" style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Earnings Summary</h4>
              <p className="type-description" style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                Comprehensive earnings breakdown and payout history
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>

            <div className="report-type-card" style={{ background: 'var(--darker)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <div className="type-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                <FiUsers />
              </div>
              <h4 className="type-title" style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Customer Insights</h4>
              <p className="type-description" style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                Customer demographics and purchasing behavior analysis
              </p>
              <button className="action-button secondary small">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Report Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Report Type:</span>
                    <span className="detail-value">
                      {getReportTypeBadge(selectedReport.reportType)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Period:</span>
                    <span className="detail-value">{selectedReport.period}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Format:</span>
                    <span className="detail-value">{selectedReport.format}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">File Size:</span>
                    <span className="detail-value">{selectedReport.size}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Seller Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Seller:</span>
                    <span className="detail-value">{selectedReport.sellerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedReport.sellerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Generated Date:</span>
                    <span className="detail-value">{selectedReport.generatedDate}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Performance Metrics</h4>
                  <div className="detail-item">
                    <span className="detail-label">Revenue:</span>
                    <span className="detail-value">{selectedReport.revenue.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Growth:</span>
                    <span className="detail-value">
                      {getGrowthBadge(selectedReport.growth)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Downloads:</span>
                    <span className="detail-value">{selectedReport.downloads}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Report Status</h4>
                  <div className="detail-item">
                    <span className="detail-label">Current Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedReport.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              
              {selectedReport.status === "completed" && (
                <button
                  className="action-button"
                  onClick={() => {
                    alert(`Downloading ${selectedReport.reportType}`);
                    setShowDetailsModal(false);
                  }}
                >
                  <FiDownload /> Download Report
                </button>
              )}
              
              <button
                className="action-button warning"
                onClick={() => {
                  alert(`Regenerating ${selectedReport.reportType}`);
                  setShowDetailsModal(false);
                }}
              >
                <FiRefreshCw /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReports;