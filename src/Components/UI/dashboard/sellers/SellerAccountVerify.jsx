import React, { useState } from "react";
import { FiUserCheck, FiUserX, FiEye, FiMail, FiCalendar, FiMapPin, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter } from "react-icons/fi";

const SellerAccountVerify = () => {
  const [sellers, setSellers] = useState([
    {
      id: 1,
      name: "Ali Ahmed",
      email: "ali.ahmed@example.com",
      businessName: "Ali Designs",
      category: "3D Models",
      joinDate: "2024-01-15",
      status: "pending",
      documents: ["id_card.pdf", "business_license.pdf"],
      location: "Karachi, Pakistan"
    },
    {
      id: 2,
      name: "Sara Khan",
      email: "sara.khan@example.com",
      businessName: "Sara Creations",
      category: "Graphics",
      joinDate: "2024-01-10",
      status: "verified",
      documents: ["id_card.pdf", "tax_certificate.pdf"],
      location: "Lahore, Pakistan"
    },
    {
      id: 3,
      name: "Usman Riaz",
      email: "usman.riaz@example.com",
      businessName: "UR Designs",
      category: "Templates",
      joinDate: "2024-01-20",
      status: "rejected",
      documents: ["id_card.pdf"],
      location: "Islamabad, Pakistan"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleVerify = (sellerId) => {
    setSellers(sellers.map(seller => 
      seller.id === sellerId ? { ...seller, status: "verified" } : seller
    ));
  };

  const handleReject = (sellerId) => {
    setSellers(sellers.map(seller => 
      seller.id === sellerId ? { ...seller, status: "rejected" } : seller
    ));
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || seller.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return <span className="status-badge success"><FiCheckCircle /> Verified</span>;
      case "pending":
        return <span className="status-badge warning"><FiClock /> Pending</span>;
      case "rejected":
        return <span className="status-badge danger"><FiXCircle /> Rejected</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  return (
    <div className="seller-verification-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiUserCheck className="header-icon" />
            Seller Account Verification
          </h2>
          <p className="header-subtitle">
            Review and verify seller accounts for marketplace access
          </p>
        </div>
        <div className="header-actions">
          <span className="seller-badge-count">
            {filteredSellers.length} sellers
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {sellers.filter(s => s.status === "verified").length}
            </div>
            <div className="stat-label">Verified Sellers</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {sellers.filter(s => s.status === "pending").length}
            </div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <FiUserX />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {sellers.filter(s => s.status === "rejected").length}
            </div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiMail />
          </div>
          <div className="stat-content">
            <div className="stat-value">{sellers.length}</div>
            <div className="stat-label">Total Applications</div>
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
                placeholder="Search sellers by name, email, or business..."
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
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredSellers.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="content-card">
        <div className="card-body">
          {filteredSellers.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Seller Info</th>
                    <th>Business</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {seller.name.charAt(0)}
                          </div>
                          <div className="user-details">
                            <div className="user-name">{seller.name}</div>
                            <div className="user-email">{seller.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="business-name">{seller.businessName}</div>
                      </td>
                      <td>
                        <span className="category-badge">{seller.category}</span>
                      </td>
                      <td>
                        <div className="location">
                          <FiMapPin className="location-icon" />
                          {seller.location}
                        </div>
                      </td>
                      <td>
                        <div className="join-date">
                          <FiCalendar className="date-icon" />
                          {seller.joinDate}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(seller.status)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button secondary small"
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowDetailsModal(true);
                            }}
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          
                          {seller.status === "pending" && (
                            <>
                              <button
                                className="action-button success small"
                                onClick={() => handleVerify(seller.id)}
                                title="Verify Seller"
                              >
                                <FiCheckCircle />
                              </button>
                              <button
                                className="action-button danger small"
                                onClick={() => handleReject(seller.id)}
                                title="Reject Seller"
                              >
                                <FiXCircle />
                              </button>
                            </>
                          )}
                          
                          {seller.status === "rejected" && (
                            <button
                              className="action-button success small"
                              onClick={() => handleVerify(seller.id)}
                              title="Re-verify Seller"
                            >
                              <FiCheckCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FiUserCheck className="empty-icon" />
              <h3 className="empty-title">No sellers found</h3>
              <p className="empty-text">
                {searchTerm 
                  ? "No sellers match your search criteria." 
                  : "No seller applications available for review."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Details Modal */}
      {showDetailsModal && selectedSeller && (
        <SellerDetailsModal
          seller={selectedSeller}
          onClose={() => setShowDetailsModal(false)}
          onVerify={() => {
            handleVerify(selectedSeller.id);
            setShowDetailsModal(false);
          }}
          onReject={() => {
            handleReject(selectedSeller.id);
            setShowDetailsModal(false);
          }}
        />
      )}
    </div>
  );
};

// Seller Details Modal Component
const SellerDetailsModal = ({ seller, onClose, onVerify, onReject }) => {
  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUserCheck className="modal-icon" />
            Seller Application Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiXCircle />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="seller-profile-section">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {seller.name.charAt(0)}
              </div>
              <div className="profile-info">
                <h3 className="profile-name">{seller.name}</h3>
                <p className="profile-email">{seller.email}</p>
                <div className="profile-badges">
                  <span className={`status-badge ${seller.status}`}>
                    {seller.status === "verified" && <FiCheckCircle />}
                    {seller.status === "pending" && <FiClock />}
                    {seller.status === "rejected" && <FiXCircle />}
                    {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-section">
                <h4 className="section-title">Business Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Business Name:</span>
                  <span className="detail-value">{seller.businessName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{seller.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{seller.location}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="section-title">Application Details</h4>
                <div className="detail-item">
                  <span className="detail-label">Join Date:</span>
                  <span className="detail-value">{seller.joinDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${seller.status}`}>
                      {seller.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="documents-section">
              <h4 className="section-title">Submitted Documents</h4>
              <div className="documents-list">
                {seller.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">📄</div>
                    <div className="document-info">
                      <div className="document-name">{doc}</div>
                      <button className="action-button secondary small">
                        View Document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {seller.status === "pending" && (
            <>
              <button className="action-button success" onClick={onVerify}>
                <FiCheckCircle className="button-icon" />
                Approve Seller
              </button>
              <button className="action-button danger" onClick={onReject}>
                <FiXCircle className="button-icon" />
                Reject Application
              </button>
            </>
          )}
          <button className="action-button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerAccountVerify;