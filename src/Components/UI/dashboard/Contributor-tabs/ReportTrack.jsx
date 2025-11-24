// src/Components/Contributor-tabs/ReportTrack.js
import React, { useState, useEffect } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiCalendar,
  FiUser,
  FiFileText,
  FiTrendingUp,
  FiXCircle,
  FiList
} from "react-icons/fi";
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useUser } from "../../../../Context/UserProvider";

const ReportTrack = () => {
  const { currentUser } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch user's reports
  useEffect(() => {
    const fetchUserReports = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const supportQuery = query(
          collection(db, `Profiles/${currentUser.uid}/Support`),
          orderBy("createdAt", "desc")
        );
        
        const supportSnapshot = await getDocs(supportQuery);
        const userReports = [];

        supportSnapshot.forEach((doc) => {
          const reportData = doc.data();
          userReports.push({
            id: doc.id,
            ...reportData,
            createdAt: reportData.createdAt?.toDate?.() || new Date(),
            updatedAt: reportData.updatedAt?.toDate?.() || new Date()
          });
        });

        setReports(userReports);
      } catch (error) {
        console.error("Error fetching user reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [currentUser]);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.issueType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="report-status-badge pending"><FiClock /> Pending</span>;
      case "in_progress":
        return <span className="report-status-badge in-progress"><FiMessageSquare /> In Progress</span>;
      case "resolved":
        return <span className="report-status-badge resolved"><FiCheckCircle /> Resolved</span>;
      default:
        return <span className="report-status-badge pending"><FiClock /> Pending</span>;
    }
  };

  // Get type badge
  const getTypeBadge = (issueType) => {
    const typeMap = {
      technical: "Technical Issue",
      billing: "Billing Issue", 
      general: "General Inquiry",
      content_approval: "Content Approval",
      earnings: "Earnings Issue",
      account_verification: "Account Verification"
    };
    
    const typeClasses = {
      "Technical Issue": "technical",
      "Billing Issue": "billing", 
      "General Inquiry": "general",
      "Content Approval": "feature",
      "Earnings Issue": "warning",
      "Account Verification": "info"
    };
    
    const typeName = typeMap[issueType] || "General Inquiry";
    
    return (
      <span className={`report-category-badge ${typeClasses[typeName] || 'general'}`}>
        {typeName}
      </span>
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  };

  if (!currentUser) {
    return (
      <div className="user-reports-dashboard">
        <div className="no-data-message">
          <FiUser size={48} />
          <h3>Authentication Required</h3>
          <p>Please log in to view your support reports.</p>
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
            <p>Loading your support reports...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            Your Support Reports
          </h2>
          <p className="header-subtitle">
            Track the progress of your support requests and reports
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.total} total reports
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
              <div className="report-stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All your support requests
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Pending</h3>
              <div className="report-stat-value">{stats.pending}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Awaiting response
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiMessageSquare />
            </div>
            <div>
              <h3 className="report-stat-title">In Progress</h3>
              <div className="report-stat-value">{stats.in_progress}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Under investigation
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Resolved</h3>
              <div className="report-stat-value">{stats.resolved}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Successfully resolved
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
              Showing {filteredReports.length} of {stats.total} reports
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search reports by subject or description..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Your Support Reports
          </h3>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="report-subject" title={report.subject}>
                      {report.subject}
                    </div>
                  </td>
                  <td>
                    {getTypeBadge(report.issueType)}
                  </td>
                  <td>
                    {getStatusBadge(report.status)}
                  </td>
                  <td>
                    <div className="report-date">
                      <FiCalendar style={{ marginRight: '4px' }} />
                      {formatDate(report.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div className="report-date">
                      <FiCalendar style={{ marginRight: '4px' }} />
                      {formatDate(report.updatedAt)}
                    </div>
                  </td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => openReportDetails(report)}
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredReports.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="no-reports">
                    {reports.length === 0 ? "No support reports found" : "No reports found matching your filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Report Details</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value">{selectedReport.subject}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {getTypeBadge(selectedReport.issueType)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedReport.status)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Timeline</h4>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{formatDate(selectedReport.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{formatDate(selectedReport.updatedAt)}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Description</h4>
                  <div className="detail-description">
                    {selectedReport.description || "No description provided."}
                  </div>
                </div>

                {selectedReport.file && (
                  <div className="detail-section">
                    <h4>Attachment</h4>
                    <div className="detail-item">
                      <span className="detail-label">File:</span>
                      <span className="detail-value">{selectedReport.file}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={closeModal}>
                Close
              </button>
              <button
                className="action-button warning"
                onClick={() => {
                  // Email support functionality
                  const subject = `Follow up: ${selectedReport.subject}`;
                  const body = `Report ID: ${selectedReport.id}\n\nOriginal Description: ${selectedReport.description}`;
                  window.location.href = `mailto:support@shammarianas.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
              >
                <FiMail /> Follow Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTrack;