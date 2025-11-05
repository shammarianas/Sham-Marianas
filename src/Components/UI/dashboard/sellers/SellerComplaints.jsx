import React, { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiSearch, FiFilter, FiEye, FiMessageSquare, FiUser, FiXCircle } from "react-icons/fi";

const SellerComplaints = () => {
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      sellerName: "Ali Designs",
      complainant: "John Smith",
      complainantEmail: "john.smith@example.com",
      type: "Product Quality",
      subject: "Low quality 3D model",
      description: "The purchased 3D model has poor texture quality and doesn't match the preview images.",
      status: "open",
      priority: "high",
      createdAt: "2024-02-15",
      updatedAt: "2024-02-15"
    },
    {
      id: 2,
      sellerName: "Sara Creations",
      complainant: "Emma Wilson",
      complainantEmail: "emma.wilson@example.com",
      type: "Delivery Issue",
      subject: "File not delivered",
      description: "Paid for the graphics pack but didn't receive download link after payment.",
      status: "in_progress",
      priority: "medium",
      createdAt: "2024-02-14",
      updatedAt: "2024-02-15"
    },
    {
      id: 3,
      sellerName: "UR Designs",
      complainant: "Mike Johnson",
      complainantEmail: "mike.johnson@example.com",
      type: "Refund Request",
      subject: "Wrong product delivered",
      description: "Received different template than what was shown in the product listing.",
      status: "resolved",
      priority: "medium",
      createdAt: "2024-02-10",
      updatedAt: "2024-02-12"
    },
    {
      id: 4,
      sellerName: "Digital Assets Co",
      complainant: "Sarah Brown",
      complainantEmail: "sarah.brown@example.com",
      type: "Copyright Issue",
      subject: "Possible copyright violation",
      description: "Seller might be using copyrighted material without permission.",
      status: "open",
      priority: "critical",
      createdAt: "2024-02-16",
      updatedAt: "2024-02-16"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <span className="status-badge warning"><FiClock /> Open</span>;
      case "in_progress":
        return <span className="status-badge info"><FiMessageSquare /> In Progress</span>;
      case "resolved":
        return <span className="status-badge success"><FiCheckCircle /> Resolved</span>;
      case "closed":
        return <span className="status-badge">Closed</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return <span className="priority-badge critical"><FiAlertTriangle /> Critical</span>;
      case "high":
        return <span className="priority-badge high"><FiAlertTriangle /> High</span>;
      case "medium":
        return <span className="priority-badge medium">Medium</span>;
      case "low":
        return <span className="priority-badge low">Low</span>;
      default:
        return <span className="priority-badge">Unknown</span>;
    }
  };

  const handleStatusChange = (complaintId, newStatus) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : complaint
    ));
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "open").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    critical: complaints.filter(c => c.priority === "critical").length
  };

  return (
    <div className="seller-complaints-dashboard">
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
          <span className="complaint-badge-count">
            {stats.total} complaints
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.open}</div>
            <div className="stat-label">Open Complaints</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiMessageSquare />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical Priority</div>
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
                placeholder="Search complaints..."
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredComplaints.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="content-card">
        <div className="card-body">
          {filteredComplaints.length > 0 ? (
            <div className="complaints-list">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="complaint-item">
                  <div className="complaint-header">
                    <div className="complaint-meta">
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {complaint.sellerName.charAt(0)}
                        </div>
                        <div className="seller-details">
                          <div className="seller-name">{complaint.sellerName}</div>
                          <div className="complaint-type">{complaint.type}</div>
                        </div>
                      </div>
                      <div className="complaint-priority">
                        {getPriorityBadge(complaint.priority)}
                      </div>
                    </div>
                    <div className="complaint-status">
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>

                  <div className="complaint-body">
                    <h4 className="complaint-subject">{complaint.subject}</h4>
                    <p className="complaint-description">{complaint.description}</p>
                    
                    <div className="complainant-info">
                      <div className="complainant">
                        <FiUser className="complainant-icon" />
                        <span className="complainant-name">{complaint.complainant}</span>
                        <span className="complainant-email">({complaint.complainantEmail})</span>
                      </div>
                      <div className="complaint-dates">
                        <span className="created-date">Created: {complaint.createdAt}</span>
                        {complaint.updatedAt !== complaint.createdAt && (
                          <span className="updated-date">Updated: {complaint.updatedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="complaint-actions">
                    <button
                      className="action-button secondary"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowDetailsModal(true);
                      }}
                    >
                      <FiEye className="button-icon" />
                      View Details
                    </button>

                    {complaint.status === "open" && (
                      <button
                        className="action-button"
                        onClick={() => handleStatusChange(complaint.id, "in_progress")}
                      >
                        <FiMessageSquare className="button-icon" />
                        Start Investigation
                      </button>
                    )}

                    {complaint.status === "in_progress" && (
                      <button
                        className="action-button success"
                        onClick={() => handleStatusChange(complaint.id, "resolved")}
                      >
                        <FiCheckCircle className="button-icon" />
                        Mark Resolved
                      </button>
                    )}

                    {(complaint.status === "open" || complaint.status === "in_progress") && (
                      <button
                        className="action-button danger"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to close this complaint?")) {
                            handleStatusChange(complaint.id, "closed");
                          }
                        }}
                      >
                        <FiXCircle className="button-icon" />
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiAlertTriangle className="empty-icon" />
              <h3 className="empty-title">No complaints found</h3>
              <p className="empty-text">
                {searchTerm 
                  ? "No complaints match your search criteria." 
                  : "No complaints have been reported yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setShowDetailsModal(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

// Complaint Details Modal Component
const ComplaintDetailsModal = ({ complaint, onClose, onStatusChange }) => {
  const [response, setResponse] = useState("");

  const handleSubmitResponse = () => {
    if (response.trim()) {
      // Handle response submission
      alert("Response submitted successfully!");
      setResponse("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiAlertTriangle className="modal-icon" />
            Complaint Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiXCircle />
          </button>
        </div>

        <div className="modal-body">
          <div className="complaint-details">
            {/* Complaint Header */}
            <div className="details-header">
              <div className="seller-complainant-info">
                <div className="seller-section">
                  <h4>Seller Information</h4>
                  <div className="info-item">
                    <strong>Seller:</strong> {complaint.sellerName}
                  </div>
                </div>
                <div className="complainant-section">
                  <h4>Complainant Information</h4>
                  <div className="info-item">
                    <strong>Name:</strong> {complaint.complainant}
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong> {complaint.complainantEmail}
                  </div>
                </div>
              </div>

              <div className="status-priority">
                <div className="info-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${complaint.status}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Priority:</strong> 
                  <span className={`priority-badge ${complaint.priority}`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Type:</strong> {complaint.type}
                </div>
              </div>
            </div>

            {/* Complaint Content */}
            <div className="complaint-content">
              <h4>Subject: {complaint.subject}</h4>
              <div className="complaint-description">
                <strong>Description:</strong>
                <p>{complaint.description}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="complaint-dates">
              <div className="date-item">
                <strong>Created:</strong> {complaint.createdAt}
              </div>
              {complaint.updatedAt !== complaint.createdAt && (
                <div className="date-item">
                  <strong>Last Updated:</strong> {complaint.updatedAt}
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="response-section">
              <h4>Admin Response</h4>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                rows="4"
                className="response-textarea"
              />
              <div className="response-actions">
                <button 
                  className="action-button secondary"
                  onClick={handleSubmitResponse}
                  disabled={!response.trim()}
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {complaint.status === "open" && (
            <button
              className="action-button"
              onClick={() => onStatusChange(complaint.id, "in_progress")}
            >
              Start Investigation
            </button>
          )}
          {complaint.status === "in_progress" && (
            <button
              className="action-button success"
              onClick={() => onStatusChange(complaint.id, "resolved")}
            >
              Mark Resolved
            </button>
          )}
          <button className="action-button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerComplaints;