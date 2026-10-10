import { useState, useEffect } from "react";
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
  FiList,
  FiUsers,
  FiTrendingUp,
  FiX,
  FiUser,
  FiPhone,
  FiGlobe,
  FiLink,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";
import "../../../../utils/exportUtils";

const normalizeDate = (value) => {
  if (!value) return null;
  if (value.toDate) {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  return null;
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const normalized = normalizeDate(date);
  return normalized ? normalized.toLocaleDateString() : "N/A";
};

const SellerAccountVerify = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const sellerColumns = [
    { header: "Seller Name", accessor: (item) => item.name || "N/A" },
    { header: "Email", accessor: (item) => item.email || "N/A" },
    {
      header: "Specialization",
      accessor: (item) => item.specialization || "Unknown",
    },
    {
      header: "Location",
      accessor: (item) => {
        if (item.city && item.country) {
          return `${item.city}, ${item.country}`;
        } else if (item.city) {
          return item.city;
        } else if (item.country) {
          return item.country;
        }
        return "N/A";
      }
    },
    {
      header: "Join Date",
      accessor: (item) => {
        if (!item.joinDate) return "N/A";
        const dateObj = new Date(item.joinDate);
        if (isNaN(dateObj.getTime())) return item.joinDate;
        return dateObj.toISOString().split("T")[0];
      },
    },
    { header: "Status", accessor: (item) => item.status || "Pending" },
  ];

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const ref = collection(db, "Contributors");
        const snapshot = await getDocs(ref);
        console.info("Loaded contributor accounts:", snapshot.size);

        const data = snapshot.docs.map((docSnap) => {
          const sellerData = docSnap.data();

          return {
            id: docSnap.id,
            ...sellerData,

            // Personal Information
            name: sellerData.fullName || sellerData.username || "N/A",
            username: sellerData.username || "N/A",
            email: sellerData.email || "N/A",
            phone: sellerData.phone || "N/A",
           birthday: formatDate(sellerData.birthday),

            // Location Information
            city: sellerData.city || "N/A",
            country: sellerData.country || sellerData.countryCode || "N/A",

            // Professional Information
            specialization: sellerData.specialization || "Unknown",
            portfolioLink: sellerData.portfolioLink || sellerData.website || "N/A",
            keywords: sellerData.keywords || sellerData.skills || "N/A",
            bio: sellerData.bio || sellerData.description || "N/A",

            // Dates
            joinDate: formatDate(sellerData.joinDate),

            // Status
            status: sellerData.status || "pending",

            // Other
            documents: sellerData.documents || [],
          };
        });

        setSellers(data);
      } catch (error) {
        console.error("Error fetching sellers:", error);
        setLoadError(error.message || "Could not load contributor accounts.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleVerify = async (seller) => {
    const { id, email, name } = seller;

    // Update Firestore status
    await updateDoc(doc(db, "Contributors", id), { status: "verified" });

    // Update local state for UI
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "verified" } : s))
    );

    // Send email
    try {
      await fetch(
        "https://us-central1-sham-marianas.cloudfunctions.net/sendContributorStatusEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: name,
            status: "verified",
          }),
        }
      );
    } catch (error) {
      console.error("Error sending approval email:", error);
    }
  };

  const handleReject = async (seller) => {
    const { id, email, name } = seller;

    // Update Firestore status
    await updateDoc(doc(db, "Contributors", id), { status: "rejected" });

    // Update local state for UI
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s))
    );

    // Send email
    try {
      await fetch(
        "https://us-central1-sham-marianas.cloudfunctions.net/sendContributorStatusEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: name,
            status: "rejected",
          }),
        }
      );
    } catch (error) {
      console.error("Error sending rejection email:", error);
    }
  };

  const handleUnverify = async (sellerId) => {
    await updateDoc(doc(db, "Contributors", sellerId), { status: "pending" });

    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: "pending" } : s))
    );
  };

  // Export handler with callbacks


  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.username.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Helper function to get formatted location
  const getFormattedLocation = (seller) => seller.country || "N/A";

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
              placeholder="Search sellers by name, email, username, or business..."
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
          {loadError && (
            <div className="no-reports" role="alert">
              Could not load contributor accounts: {loadError}
            </div>
          )}
          <table className="report-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Specialization</th>
                <th>Country</th>
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
                    <div className="comp-dis" title={seller.specialization}>
                      {seller.specialization}
                    </div>
                  </td>

                  <td>
                    <div className="comp-dis">
                      <FiMapPin style={{ marginRight: "4px" }} />
                      {getFormattedLocation(seller)}
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
                          onClick={() => handleVerify(seller)}
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
                          onClick={() => handleReject(seller)}
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

              {loading && (
                <tr>
                  <td colSpan="6" className="no-reports">
                    Loading contributor accounts...
                  </td>
                </tr>
              )}
              {!loading && !loadError && filteredSellers.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-reports">
                    {sellers.length === 0
                      ? "No contributor accounts found in the Contributors collection"
                      : "No sellers found matching your filters"}
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
                {/* Personal Information Section */}
                <div className="detail-section">
                  <h4>
                    <FiUser style={{ marginRight: "8px" }} />
                    Personal Information
                  </h4>
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{selectedSeller.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{selectedSeller.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      <FiMail style={{ marginRight: "6px" }} />
                      {selectedSeller.email}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      <FiPhone style={{ marginRight: "6px" }} />
                      {selectedSeller.phone}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">
                      <FiCalendar style={{ marginRight: "6px" }} />
                      {selectedSeller.birthday}
                    </span>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="detail-section">
                  <h4>
                    <FiMapPin style={{ marginRight: "8px" }} />
                    Location Information
                  </h4>
                  <div className="detail-item">
                    <span className="detail-label">City:</span>
                    <span className="detail-value">{selectedSeller.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Country:</span>
                    <span className="detail-value">
                      <FiGlobe style={{ marginRight: "6px" }} />
                      {selectedSeller.country}
                    </span>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="detail-section">
                  <h4>
                    <FiUserCheck style={{ marginRight: "8px" }} />
                    Professional Information
                  </h4>
                  <div className="detail-item">
                    <span className="detail-label">Specialization:</span>
                    <span className="detail-value">{selectedSeller.specialization}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Portfolio Link:</span>
                    <span className="detail-value">
                      <FiLink style={{ marginRight: "6px" }} />
                      {selectedSeller.portfolioLink && selectedSeller.portfolioLink !== "N/A" ? (
                        <a href={selectedSeller.portfolioLink} target="_blank" rel="noopener noreferrer" aria-label={`View ${selectedSeller.name}'s Portfolio`}>
                          View Portfolio
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Keywords/Skills:</span>
                    <span className="detail-value">
                      <FiTag style={{ marginRight: "6px" }} />
                      {selectedSeller.keywords}
                    </span>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="detail-section">
                  <h4>
                    <FiCalendar style={{ marginRight: "8px" }} />
                    Dates
                  </h4>
                  <div className="detail-item">
                    <span className="detail-label">Joining Date:</span>
                    <span className="detail-value">{selectedSeller.joinDate}</span>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="detail-section full-width">
                  <h4>
                    <FiFileText style={{ marginRight: "8px" }} />
                    Biography
                  </h4>
                  <div className="detail-bio">
                    <p>{selectedSeller.bio}</p>
                  </div>
                </div>

                {/* Verification Status Section */}
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
                  handleVerify(selectedSeller);
                  setShowDetailsModal(false);
                }}
              >
                <FiCheckCircle /> Approve Seller
              </button>

              <button
                className="action-button danger"
                onClick={() => {
                  handleReject(selectedSeller);
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
