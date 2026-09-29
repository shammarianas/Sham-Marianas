import { useState, useEffect, useMemo } from "react";
import { FiDollarSign, FiUsers, FiCalendar, FiBarChart2, FiFilter, FiCheckCircle, FiXCircle, FiEye, FiClock, FiSearch, FiRefreshCw, FiList, FiX } from "react-icons/fi";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";

const SellerEarning = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setTypeFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic data state
  const [contributors, setContributors] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date from Firebase timestamp
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 🔥 Fetch dynamic data from Firebase - Updated to use contributor collection
  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      try {
        // Query from contributor collection
        const contributorsRef = collection(db, "Contributors");
        const q = query(contributorsRef, orderBy("totalEarnings", "desc"));

        // Real-time listener
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const contributorData = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();

              // Calculate completed payouts (totalEarnings - pendingEarnings)
               // Set to 0 for demo
               // Set to 0 for demo
              const completedPayouts = 0;
              contributorData.push({
                id: doc.id,
                name:
                  data.fullName ||
                  data.displayUsername ||
                  "Unknown Contributor",
                email: data.email || "No email",
                username: data.username || "N/A",
                totalEarnings: data.totalEarnings || 0,
                pendingPayout: data.pendingEarnings || 0, // This is pendingEarnings in your data
                completedPayouts: completedPayouts, // Calculated field
                totalSales: data.totalUploads || 0, // Using totalUploads as sales count
                avgOrderValue:
                  data.totalEarnings > 0 && data.totalUploads > 0
                    ? (data.totalEarnings / data.totalUploads).toFixed(2)
                    : 0,
                growth: 0, // You might want to add this field to your data
                joinDate: formatDate(data.joinDate) || "N/A",
                lastPayout: data.lastUpdated
                  ? formatDate(data.lastUpdated)
                  : "N/A",
                lastLogin: data.lastLogin ? formatDate(data.lastLogin) : "N/A",
                status: data.status || "pending",
                role: data.role || "contributor",
                specialization: data.specialization || "Not specified",
                skills: data.skills || [],
                rating: data.rating || 0,
                reviews: data.reviews || 0,
                approvedUploads: data.approvedUploads || 0,
              });
            });
            setContributors(contributorData);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("Firebase error:", error);
            setError("Failed to load contributors data");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching contributors:", err);
        setError("Failed to load contributors data");
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  // Prepare export data function
  const prepareExportData = (contributors) => {
    return contributors.map((contributor) => ({
      name: contributor.name,
      email: contributor.email,
      username: contributor.username,
      totalEarnings: contributor.totalEarnings,
      pendingPayout: contributor.pendingPayout,
      completedPayouts: contributor.completedPayouts,
      totalSales: contributor.totalSales,
      avgOrderValue: contributor.avgOrderValue,
      growth: contributor.growth,
      joinDate: contributor.joinDate,
      lastPayout: contributor.lastPayout,
      status: contributor.status,
      role: contributor.role,
      specialization: contributor.specialization,
      rating: contributor.rating,
      reviews: contributor.reviews,
      approvedUploads: contributor.approvedUploads,
    }));
  };

  // Export handler with callbacks
  const handleExportStart = () => {
    console.log("Export started...");
  };

  const handleExportComplete = (success) => {
    if (success) {
      console.log("Export completed successfully");
    } else {
      console.log("Export failed");
    }
  };

  const handleExportError = (error) => {
    console.error("Export error:", error);
  };

  // Dynamic statistics calculation
  const stats = useMemo(() => {
    const totalEarnings = contributors.reduce(
      (sum, contributor) => sum + (contributor.totalEarnings || 0),
      0
    );
    const totalPending = contributors.reduce(
      (sum, contributor) => sum + (contributor.pendingPayout || 0),
      0
    );
    const totalCompleted = contributors.reduce(
      (sum, contributor) => sum + (contributor.completedPayouts || 0),
      0
    );
    const totalSales = contributors.reduce(
      (sum, contributor) => sum + (contributor.totalSales || 0),
      0
    );
    const totalSellers = contributors.length;
    const activeSellers = contributors.filter(
      (c) => c.status === "verified"
    ).length;

    return {
      totalEarnings,
      totalPending,
      totalCompleted,
      totalSales,
      totalSellers,
      activeSellers,
    };
  }, [contributors]);

  // Filter contributors based on search and filters
  const filteredContributors = useMemo(() => {
    return contributors.filter((contributor) => {
      const matchesSearch =
        contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || contributor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contributors, searchTerm, statusFilter]);

  // Status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="report-status-badge resolved">
            <FiCheckCircle /> Verified
          </span>
        );
      case "suspended":
        return (
          <span className="report-status-badge in-progress">
            <FiXCircle /> Suspended
          </span>
        );
      case "pending":
        return (
          <span className="report-status-badge pending">
            <FiClock /> Pending
          </span>
        );
      default:
        return (
          <span className="report-status-badge pending">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // Growth badge component


  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Refresh data
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const contributorsRef = collection(db, "contributor");
      const q = query(contributorsRef, orderBy("totalEarnings", "desc"));
      const querySnapshot = await getDocs(q);
      const contributorData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const completedPayouts =
          (data.totalEarnings || 0) - (data.pendingEarnings || 0);

        return {
          id: doc.id,
          name: data.fullName || data.displayUsername || "Unknown Contributor",
          email: data.email || "No email",
          username: data.username || "N/A",
          totalEarnings: data.totalEarnings || 0,
          pendingPayout: data.pendingEarnings || 0,
          completedPayouts: completedPayouts,
          totalSales: data.totalUploads || 0,
          avgOrderValue:
            data.totalEarnings > 0 && data.totalUploads > 0
              ? (data.totalEarnings / data.totalUploads).toFixed(2)
              : 0,
          growth: 0,
          joinDate: formatDate(data.joinDate) || "N/A",
          lastPayout: data.lastUpdated ? formatDate(data.lastUpdated) : "N/A",
          lastLogin: data.lastLogin ? formatDate(data.lastLogin) : "N/A",
          status: data.status || "pending",
          role: data.role || "contributor",
          specialization: data.specialization || "Not specified",
          skills: data.skills || [],
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          approvedUploads: data.approvedUploads || 0,
        };
      });
      setContributors(contributorData);
      setError(null);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  // Process payout for a contributor
  const handleProcessPayout = async (contributor) => {
    if (
      window.confirm(
        `Process payout of ${formatCurrency(contributor.pendingPayout)} to ${
          contributor.name
        }?`
      )
    ) {
      try {
        // Here you would update Firestore to move pendingEarnings to completed payouts
        // For now, we'll just show an alert
        alert(
          `Payout of ${formatCurrency(
            contributor.pendingPayout
          )} processed for ${contributor.name}`
        );

        // Refresh data after processing
        handleRefreshData();
      } catch (error) {
        console.error("Error processing payout:", error);
        alert("Failed to process payout");
      }
    }
  };

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading contributors data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDollarSign className="header-icon" />
            Contributor Earnings Dashboard
            {loading && <span className="loading-badge">Loading...</span>}
          </h2>
          <p className="header-subtitle">
            Monitor contributor earnings, payouts, and performance metrics
            {error && <span className="error-text"> • {error}</span>}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="action-button secondary"
            onClick={handleRefreshData}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin-animation" : ""} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
          <span className="user-badge-count">
            {stats.totalSellers} total contributors
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Total Earnings</h3>
              <div className="report-stat-value">
                {formatCurrency(stats.totalEarnings)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All time earnings from all contributors
            </div>
            <div className="report-stat-trend positive">
              Active contributors: {stats.activeSellers}
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCalendar />
            </div>
            <div>
              <h3 className="report-stat-title">Pending Payout</h3>
              <div className="report-stat-value">
                {formatCurrency(stats.totalPending)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Awaiting processing</div>
            <div className="report-stat-trend warning">
              {contributors.filter((c) => c.pendingPayout > 0).length}{" "}
              contributors
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Completed Payouts</h3>
              <div className="report-stat-value">
                {formatCurrency(stats.totalCompleted)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Successfully paid out</div>
            <div className="report-stat-trend positive">
              Average:{" "}
              {formatCurrency(stats.totalCompleted / stats.totalSellers)}
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Active Contributors</h3>
              <div className="report-stat-value">{stats.activeSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Currently verified and active
            </div>
            <div className="report-stat-trend positive">
              {Math.round((stats.activeSellers / stats.totalSellers) * 100)}% of
              total
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Contributors
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredContributors.length} of {stats.totalSellers}{" "}
              contributors
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search contributors by name, email, or username..."
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
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Contributors Earnings Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Contributor Earnings Breakdown
          </h3>
          <ExportButton
            data={prepareExportData(
              filteredContributors.length > 0
                ? filteredContributors
                : contributors
            )}
            filename="contributor-earning-reports"
            variant="secondary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
          />
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Contributor</th>
                <th>Total Earnings</th>
                <th>Pending Payout</th>
                <th>Completed Payouts</th>
                <th>Total Uploads</th>
                {/* <th>Avg. Value/Upload</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContributors.map((contributor) => (
                <tr key={contributor.id}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {contributor.name.charAt(0)}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">
                          {contributor.name}
                        </div>
                        <div className="report-user-email">
                          {contributor.email}
                        </div>
                        <div className="report-user-meta">
                          @{contributor.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: "4px" }} />
                      {formatCurrency(contributor.totalEarnings)}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiCalendar style={{ marginRight: "4px" }} />
                      {formatCurrency(contributor.pendingPayout)}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: "4px" }} />
                      {formatCurrency(contributor.completedPayouts)}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiUsers style={{ marginRight: "4px" }} />
                      {contributor.totalSales} uploads
                    </div>
                  </td>
                  {/* <td>
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: "4px" }} />
                      {formatCurrency(contributor.avgOrderValue)}
                    </div>
                  </td> */}
                  <td>{getStatusBadge(contributor.status)}</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => {
                          setSelectedSeller(contributor);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="action-button small"
                        title="Process Payout"
                        onClick={() => handleProcessPayout(contributor)}
                        disabled={contributor.pendingPayout <= 0}
                      >
                        <FiDollarSign />
                      </button>
                      <button
                        className="action-button warning small"
                        title="View Uploads"
                        onClick={() =>
                          alert(`Viewing uploads for ${contributor.name}`)
                        }
                      >
                        <FiUsers />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContributors.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="no-reports">
                    No contributors found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contributor Details Modal */}
      {showDetailsModal && selectedSeller && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contributor Earnings Details</h3>
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
                  <h4>Contributor Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedSeller.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedSeller.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">
                      @{selectedSeller.username}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Join Date:</span>
                    <span className="detail-value">
                      {selectedSeller.joinDate}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">
                      {selectedSeller.lastLogin}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedSeller.status)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Earnings Summary</h4>
                  <div className="detail-item">
                    <span className="detail-label">Total Earnings:</span>
                    <span className="detail-value">
                      {formatCurrency(selectedSeller.totalEarnings)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pending Payout:</span>
                    <span className="detail-value">
                      {formatCurrency(selectedSeller.pendingPayout)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Completed Payouts:</span>
                    <span className="detail-value">
                      {formatCurrency(selectedSeller.completedPayouts)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Payout:</span>
                    <span className="detail-value">
                      {selectedSeller.lastPayout}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Performance Metrics</h4>
                  <div className="detail-item">
                    <span className="detail-label">Total Uploads:</span>
                    <span className="detail-value">
                      {selectedSeller.totalSales}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Approved Uploads:</span>
                    <span className="detail-value">
                      {selectedSeller.approvedUploads}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Average Value/Upload:</span>
                    <span className="detail-value">
                      {formatCurrency(selectedSeller.avgOrderValue)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rating:</span>
                    <span className="detail-value">
                      {selectedSeller.rating} ⭐
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Reviews:</span>
                    <span className="detail-value">
                      {selectedSeller.reviews}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Profile Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{selectedSeller.role}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Specialization:</span>
                    <span className="detail-value">
                      {selectedSeller.specialization}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Skills:</span>
                    <span className="detail-value">
                      {selectedSeller.skills && selectedSeller.skills.length > 0
                        ? selectedSeller.skills.join(", ")
                        : "None specified"}
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

              <button
                className="action-button"
                onClick={() => {
                  handleProcessPayout(selectedSeller);
                  setShowDetailsModal(false);
                }}
                disabled={selectedSeller.pendingPayout <= 0}
              >
                <FiDollarSign /> Process Payout
              </button>

              <button
                className="action-button warning"
                onClick={() => {
                  alert(`Viewing uploads analytics for ${selectedSeller.name}`);
                  setShowDetailsModal(false);
                }}
              >
                <FiBarChart2 /> View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerEarning;
