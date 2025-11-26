import React, { useState, useEffect } from "react";
import {
  FiUserCheck,
  FiUserX,
  FiEye,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiList,
  FiUsers,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";
import { exportSellersVerifyData } from "../../../../utils/exportUtils";

const SellerAccountVerify = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const sellerColumns = [
    { header: "Seller Name", accessor: (item) => item.name || "N/A" },
    { header: "Email", accessor: (item) => item.email || "N/A" },
    {
      header: "Business Name",
      accessor: (item) => item.businessName || "Unknown",
    },
    { header: "Category", accessor: (item) => item.category || "General" },
    { header: "Location", accessor: (item) => item.location || "N/A" },
    {
      header: "Join Date",
      accessor: (item) => {
        if (!item.joinDate) return "N/A";
        const dateObj = new Date(item.joinDate);
        if (isNaN(dateObj.getTime())) return item.joinDate; // fallback if not a valid date
        return dateObj.toISOString().split("T")[0]; // format: YYYY-MM-DD
      },
    },
    { header: "Status", accessor: (item) => item.status || "Pending" },
  ];

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const ref = collection(db, "Contributors");
        const snapshot = await getDocs(ref);

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),

          // Convert Firestore timestamp to readable date--------
          joinDate: docSnap.data().joinDate?.toDate().toLocaleDateString(),
          location: docSnap.data().countryCode || "N/A",
          email: docSnap.data().email || "N/A",
          name: docSnap.data().fullName || docSnap.data().username,
          businessName: docSnap.data().specialization || "Unknown",
          category: docSnap.data().specialization || "General",
          documents: docSnap.data().documents || [], // If you add docs later
        }));

        setSellers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sellers:", error);
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleVerify = async (sellerId) => {
    await updateDoc(doc(db, "Contributors", sellerId), { status: "verified" });

    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: "verified" } : s))
    );
  };

  const handleReject = async (sellerId) => {
    await updateDoc(doc(db, "Contributors", sellerId), { status: "rejected" });

    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: "rejected" } : s))
    );
  };

  const handleUnverify = async (sellerId) => {
    await updateDoc(doc(db, "Contributors", sellerId), { status: "pending" });

    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: "pending" } : s))
    );
  };

  // Export handler with callbacks
  const handleExport = (format) => {
    console.log("Exporting data:", filteredSellers);
    console.log("First seller:", filteredSellers[0]);
    exportSellersVerifyData(filteredSellers, format);
  };

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || seller.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="report-status-badge resolved">
            <FiCheckCircle /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="report-status-badge pending">
            <FiClock /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="report-status-badge in-progress">
            <FiXCircle /> Rejected
          </span>
        );
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  const stats = {
    totalSellers: sellers.length,
    verifiedSellers: sellers.filter((s) => s.status === "verified").length,
    pendingSellers: sellers.filter((s) => s.status === "pending").length,
    rejectedSellers: sellers.filter((s) => s.status === "rejected").length,
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
            <FiUserCheck className="header-icon" />
            Seller Account Verification
          </h2>
          <p className="header-subtitle">
            Review and verify seller accounts for marketplace access
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalSellers} total sellers
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUserCheck />
            </div>
            <div>
              <h3 className="report-stat-title">Verified Sellers</h3>
              <div className="report-stat-value">{stats.verifiedSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Approved seller accounts</div>
            <div className="report-stat-trend positive">
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
              <h3 className="report-stat-title">Pending Review</h3>
              <div className="report-stat-value">{stats.pendingSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Awaiting verification</div>
            <div className="report-stat-trend negative">
              +5% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Total Applications</h3>
              <div className="report-stat-value">{stats.totalSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">All seller applications</div>
            <div className="report-stat-trend positive">
              +8% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUserX />
            </div>
            <div>
              <h3 className="report-stat-title">Rejected</h3>
              <div className="report-stat-value">{stats.rejectedSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Rejected applications</div>
            <div className="report-stat-trend negative">
              +3% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Sellers
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredSellers.length} of {stats.totalSellers} sellers
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search sellers by name, email, or business..."
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
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select className="filter-select" defaultValue="">
            <option value="">All Categories</option>
            <option value="3d">3D Models</option>
            <option value="graphics">Graphics</option>
            <option value="templates">Templates</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Seller Management
          </h3>
          <ExportButton
            data={filteredSellers}
            columns={sellerColumns}
            filename="seller-verification-report"
            buttonText="Export Sellers"
          />
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Seller</th>
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
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {seller.name.charAt(0)}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">{seller.name}</div>
                        <div className="report-user-email">{seller.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis" title={seller.businessName}>
                      {seller.businessName}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`report-category-badge ${
                        seller.category === "3D Models"
                          ? "technical"
                          : seller.category === "Graphics"
                          ? "billing"
                          : "general"
                      }`}
                    >
                      {seller.category}
                    </span>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiMapPin style={{ marginRight: "4px" }} />
                      {seller.location}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiCalendar style={{ marginRight: "4px" }} />
                      {seller.joinDate}
                    </div>
                  </td>
                  <td>{getStatusBadge(seller.status)}</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => {
                          setSelectedSeller(seller);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye />
                      </button>

                      {/* Always show Verify button for non-verified sellers */}
                      {seller.status !== "verified" && (
                        <button
                          className="action-button small"
                          title="Verify Seller"
                          onClick={() => handleVerify(seller.id)}
                        >
                          <FiCheckCircle />
                        </button>
                      )}

                      {/* Always show Unverify button for verified sellers */}
                      {seller.status === "verified" && (
                        <button
                          className="action-button warning small"
                          title="Unverify Seller"
                          onClick={() => handleUnverify(seller.id)}
                        >
                          <FiUserX />
                        </button>
                      )}
                      {/* Always show Reject button for non-rejected sellers */}
                      {seller.status !== "rejected" && (
                        <button
                          className="action-button danger small"
                          title="Reject Seller"
                          onClick={() => handleReject(seller.id)}
                        >
                          <FiXCircle />
                        </button>
                      )}

                      {/* Show Unverify button for rejected sellers to move them back to pending */}
                      {seller.status === "rejected" && (
                        <button
                          className="action-button warning small"
                          title="Move to Pending"
                          onClick={() => handleUnverify(seller.id)}
                        >
                          <FiUserX />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSellers.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-reports">
                    No sellers found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Details Modal */}
      {showDetailsModal && selectedSeller && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Seller Application Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Seller Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedSeller.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedSeller.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">
                      {selectedSeller.location}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Business Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Business Name:</span>
                    <span className="detail-value">
                      {selectedSeller.businessName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">
                      {selectedSeller.category}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Join Date:</span>
                    <span className="detail-value">
                      {selectedSeller.joinDate}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Submitted Documents</h4>
                  <div className="detail-description">
                    <div className="documents-list">
                      {selectedSeller.documents.map((doc, index) => (
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

                <div className="detail-section">
                  <h4>Verification Status</h4>
                  <div className="detail-item">
                    <span className="detail-label">Current Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedSeller.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-button secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>

              {/* Always show all action buttons in modal */}
              <button
                className="action-button"
                onClick={() => {
                  handleVerify(selectedSeller.id);
                  setShowDetailsModal(false);
                }}
              >
                <FiCheckCircle /> Approve Seller
              </button>

              <button
                className="action-button danger"
                onClick={() => {
                  handleReject(selectedSeller.id);
                  setShowDetailsModal(false);
                }}
              >
                <FiXCircle /> Reject Application
              </button>

              <button
                className="action-button warning"
                onClick={() => {
                  handleUnverify(selectedSeller.id);
                  setShowDetailsModal(false);
                }}
              >
                <FiUserX /> Move to Pending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAccountVerify;
