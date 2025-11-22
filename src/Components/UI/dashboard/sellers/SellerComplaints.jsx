import React, { useState, useEffect } from "react";
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
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase"; // Adjust path as needed

const SellerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH REAL COMPLAINTS DATA
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        
        // Get all users who have support tickets
        const usersSnapshot = await getDocs(collection(db, "Profiles"));
        const allComplaints = [];

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const userData = userDoc.data();
          
          // Check if user has support collection
          const supportQuery = query(
            collection(db, `Profiles/${userId}/Support`),
            orderBy("createdAt", "desc")
          );
          
          try {
            const supportSnapshot = await getDocs(supportQuery);
            
            supportSnapshot.forEach((supportDoc) => {
              const complaintData = supportDoc.data();
              
              // ✅ ONLY SHOW CONTRIBUTOR COMPLAINTS
              if (complaintData.userType === "contributor") {
                allComplaints.push({
                  id: supportDoc.id,
                  userId: userId,
                  sellerName: userData.username || userData.displayName || "Unknown Seller",
                  sellerEmail: userData.email || "No email",
                  complainant: complaintData.email || "Unknown",
                  complainantEmail: complaintData.email || "No email",
                  type: getComplaintType(complaintData.issueType),
                  subject: complaintData.subject || "No subject",
                  description: complaintData.description || "No description",
                  status: complaintData.status || "pending",
                  createdAt: complaintData.createdAt?.toDate?.()?.toISOString().split('T')[0] || "Unknown date",
                  updatedAt: complaintData.updatedAt?.toDate?.()?.toISOString().split('T')[0] || "Unknown date",
                  orderId: complaintData.orderId || "N/A",
                  product: complaintData.product || "General Issue",
                  originalData: complaintData
                });
              }
            });
          } catch (error) {
            console.log(`No support collection for user ${userId}`);
          }
        }

        setComplaints(allComplaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getComplaintType = (issueType) => {
    const typeMap = {
      technical: "Technical Issue",
      billing: "Billing Issue", 
      general: "General Inquiry",
      content_approval: "Content Approval",
      earnings: "Earnings Issue",
      account_verification: "Account Verification"
    };
    return typeMap[issueType] || "General Inquiry";
  };

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
    resolved: complaints.filter(c => c.status === "resolved").length,
    pending: complaints.filter(c => c.status === "pending").length
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
      case "pending":
        return <span className="report-status-badge pending"><FiClock /> {status === "pending" ? "Pending" : "Open"}</span>;
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
      "Technical Issue": "technical",
      "Billing Issue": "billing", 
      "General Inquiry": "general",
      "Content Approval": "feature",
      "Earnings Issue": "warning",
      "Account Verification": "info"
    };
    
    return (
      <span className={`report-category-badge ${typeClasses[type] || 'general'}`}>
        {type}
      </span>
    );
  };

  // ✅ UPDATE COMPLAINT STATUS IN FIRESTORE
  const handleStatusChange = async (complaintId, userId, newStatus) => {
    try {
      const complaintRef = doc(db, `Profiles/${userId}/Support`, complaintId);
      await updateDoc(complaintRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setComplaints(complaints.map(complaint => 
        complaint.id === complaintId && complaint.userId === userId
          ? { 
              ...complaint, 
              status: newStatus, 
              updatedAt: new Date().toISOString().split('T')[0] 
            }
          : complaint
      ));

      alert(`Complaint status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating complaint status:", error);
      alert("Failed to update complaint status");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="user-reports-dashboard">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading contributor complaints...</p>
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
            <FiAlertTriangle className="header-icon" />
            Contributor Support Requests
          </h2>
          <p className="header-subtitle">
            Manage and resolve support requests from verified contributors
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.total} contributor requests
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
              <h3 className="report-stat-title">Total Requests</h3>
              <div className="report-stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All contributor requests
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
              <div className="report-stat-value">{stats.inProgress}</div>
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
            <FiFilter className="panel-icon" /> Filter Requests
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredComplaints.length} of {stats.total} requests
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search requests by seller, complainant, or subject..."
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
            <FiList className="panel-icon" /> Contributor Support Requests
          </h3>
          <button className="action-button secondary">
            <FiDownload className="button-icon" /> Export List
          </button>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Contributor</th>
                <th>Contact Email</th>
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
                    <div className="report-user-email-single">
                      {complaint.complainantEmail}
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
                      
                      {complaint.status === "pending" && (
                        <button
                          className="action-button small"
                          title="Start Investigation"
                          onClick={() => handleStatusChange(complaint.id, complaint.userId, "in_progress")}
                        >
                          <FiMessageSquare />
                        </button>
                      )}
                      
                      {complaint.status === "in_progress" && (
                        <button
                          className="action-button success small"
                          title="Mark Resolved"
                          onClick={() => handleStatusChange(complaint.id, complaint.userId, "resolved")}
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                      
                      <button
                        className="action-button warning small"
                        title="Contact Contributor"
                        onClick={() => alert(`Contacting ${complaint.sellerName} at ${complaint.complainantEmail}`)}
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
                    {complaints.length === 0 ? "No contributor support requests found" : "No requests found matching your filters"}
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
              <h3 className="modal-title">Support Request Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Contributor Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Contributor Name:</span>
                    <span className="detail-value">{selectedComplaint.sellerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contributor Email:</span>
                    <span className="detail-value">{selectedComplaint.sellerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Email:</span>
                    <span className="detail-value">{selectedComplaint.complainantEmail}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Request Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Request Type:</span>
                    <span className="detail-value">
                      {getTypeBadge(selectedComplaint.type)}
                    </span>
                  </div>
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
                    placeholder="Type your response to the contributor here..."
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
              
              {selectedComplaint.status === "pending" && (
                <button
                  className="action-button"
                  onClick={() => {
                    handleStatusChange(selectedComplaint.id, selectedComplaint.userId, "in_progress");
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
                    handleStatusChange(selectedComplaint.id, selectedComplaint.userId, "resolved");
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
                <FiMail /> Contact Contributor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerComplaints;