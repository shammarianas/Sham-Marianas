import React, { useState } from "react";
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiTrendingUp,
  FiClock, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiMessageSquare, 
  FiUser, 
  FiXCircle,
  FiRefreshCw,
  FiDownload,
  FiList,
  FiX,
  FiMail,
  FiCalendar
} from "react-icons/fi";

const SellerComplaints = () => {
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      sellerName: "Ali Designs",
      sellerEmail: "ali.ahmed@example.com",
      complainant: "John Smith",
      complainantEmail: "john.smith@example.com",
      type: "Product Quality",
      subject: "Low quality 3D model",
      description: "The purchased 3D model has poor texture quality and doesn't match the preview images. The textures are blurry and the model has several mesh issues that make it unusable for professional projects.",
      status: "open",
      createdAt: "2024-02-15",
      updatedAt: "2024-02-15",
      orderId: "ORD-001234",
      product: "Modern Office Building 3D Model"
    },
    {
      id: 2,
      sellerName: "Sara Creations",
      sellerEmail: "sara.khan@example.com",
      complainant: "Emma Wilson",
      complainantEmail: "emma.wilson@example.com",
      type: "Delivery Issue",
      subject: "File not delivered",
      description: "Paid for the graphics pack but didn't receive download link after payment. The transaction was completed successfully but no files were accessible.",
      status: "in_progress",
      createdAt: "2024-02-14",
      updatedAt: "2024-02-15",
      orderId: "ORD-001235",
      product: "Professional Graphics Pack"
    },
    {
      id: 3,
      sellerName: "UR Designs",
      sellerEmail: "usman.riaz@example.com",
      complainant: "Mike Johnson",
      complainantEmail: "mike.johnson@example.com",
      type: "Refund Request",
      subject: "Wrong product delivered",
      description: "Received different template than what was shown in the product listing. The features and design elements are completely different from the advertised product.",
      status: "resolved",
      createdAt: "2024-02-10",
      updatedAt: "2024-02-12",
      orderId: "ORD-001236",
      product: "Dashboard UI Template"
    },
    {
      id: 4,
      sellerName: "Digital Assets Co",
      sellerEmail: "fatima.noor@example.com",
      complainant: "Sarah Brown",
      complainantEmail: "sarah.brown@example.com",
      type: "Copyright Issue",
      subject: "Possible copyright violation",
      description: "Seller might be using copyrighted material without permission. The 3D model appears to be copied from a commercial product.",
      status: "open",
      createdAt: "2024-02-16",
      updatedAt: "2024-02-16",
      orderId: "ORD-001237",
      product: "Character Model Pack"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "open").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <span className="report-status-badge pending"><FiClock /> Open</span>;
      case "in_progress":
        return <span className="report-status-badge in-progress"><FiMessageSquare /> In Progress</span>;
      case "resolved":
        return <span className="report-status-badge resolved"><FiCheckCircle /> Resolved</span>;
      case "closed":
        return <span className="report-status-badge">Closed</span>;
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      "Product Quality": "technical",
      "Delivery Issue": "billing",
      "Refund Request": "general",
      "Copyright Issue": "feature"
    };
    
    return (
      <span className={`report-category-badge ${typeClasses[type] || 'general'}`}>
        {type}
      </span>
    );
  };

  const handleStatusChange = (complaintId, newStatus) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : complaint
    ));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiAlertTriangle className="header-icon" />
            Seller Complaints Management
          </h2>
          <p className="header-subtitle">
            Manage and resolve customer complaints against sellers
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.total} total complaints
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiAlertTriangle />
            </div>
            <div>
              <h3 className="report-stat-title">Total Complaints</h3>
              <div className="report-stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All complaints received
            </div>
            <div className="report-stat-trend negative">
              +12% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Open Complaints</h3>
              <div className="report-stat-value">{stats.open}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Awaiting resolution
            </div>
            <div className="report-stat-trend negative">
              +8% <FiTrendingUp className="fi-pl" />
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
              <div className="report-stat-value">{stats.inProgress}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Under investigation
            </div>
            <div className="report-stat-trend positive">
              +15% <FiTrendingUp className="fi-pl" />
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
            <div className="report-stat-trend positive">
              +22% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Complaints
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredComplaints.length} of {stats.total} complaints
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search complaints by seller, complainant, or subject..."
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
            <button className="filter-button primary">
              <FiDownload /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Customer Complaints
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
                <th>Complainant</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>
                    <div className="report-user">
                     
                      <div className="report-user-info">
                        <div className="report-user-name">{complaint.sellerName}</div>
                        <div className="report-user-email">{complaint.sellerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="report-user">
                      
                      <div className="report-user-info">
                        <div className="report-user-name">{complaint.complainant}</div>
                        <div className="report-user-email">{complaint.complainantEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {getTypeBadge(complaint.type)}
                  </td>
                  <td>
                    <div className="comp-dis" title={complaint.subject}>
                      {complaint.subject}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiCalendar style={{ marginRight: '4px' }} />
                      {complaint.createdAt}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(complaint.status)}
                  </td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye />
                      </button>
                      
                      {complaint.status === "open" && (
                        <button
                          className="action-button small"
                          title="Start Investigation"
                          onClick={() => handleStatusChange(complaint.id, "in_progress")}
                        >
                          <FiMessageSquare />
                        </button>
                      )}
                      
                      {complaint.status === "in_progress" && (
                        <button
                          className="action-button success small"
                          title="Mark Resolved"
                          onClick={() => handleStatusChange(complaint.id, "resolved")}
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                      
                      <button
                        className="action-button warning small"
                        title="Contact Parties"
                        onClick={() => alert(`Contacting ${complaint.sellerName} and ${complaint.complainant}`)}
                      >
                        <FiMail />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-reports">
                    No complaints found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Complaint Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Seller Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Seller Name:</span>
                    <span className="detail-value">{selectedComplaint.sellerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Seller Email:</span>
                    <span className="detail-value">{selectedComplaint.sellerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Product:</span>
                    <span className="detail-value">{selectedComplaint.product}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{selectedComplaint.orderId}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Complainant Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedComplaint.complainant}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedComplaint.complainantEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Complaint Type:</span>
                    <span className="detail-value">
                      {getTypeBadge(selectedComplaint.type)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Complaint Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedComplaint.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{selectedComplaint.createdAt}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{selectedComplaint.updatedAt}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Subject & Description</h4>
                  <div className="detail-item">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value">{selectedComplaint.subject}</span>
                  </div>
                  <div className="detail-description">
                    {selectedComplaint.description}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Admin Response</h4>
                  <textarea
                    className="response-textarea"
                    placeholder="Type your response to the complainant here..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      background: 'var(--darker)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              
              {selectedComplaint.status === "open" && (
                <button
                  className="action-button"
                  onClick={() => {
                    handleStatusChange(selectedComplaint.id, "in_progress");
                    setShowDetailsModal(false);
                  }}
                >
                  <FiMessageSquare /> Start Investigation
                </button>
              )}
              
              {selectedComplaint.status === "in_progress" && (
                <button
                  className="action-button success"
                  onClick={() => {
                    handleStatusChange(selectedComplaint.id, "resolved");
                    setShowDetailsModal(false);
                  }}
                >
                  <FiCheckCircle /> Mark Resolved
                </button>
              )}
              
              <button
                className="action-button warning"
                onClick={() => {
                  alert(`Sending email to ${selectedComplaint.complainantEmail}`);
                  setShowDetailsModal(false);
                }}
              >
                <FiMail /> Contact Complainant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerComplaints;