import React, { useState, useEffect, useMemo } from "react";
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiDownload, 
  FiCalendar, 
  FiPieChart, 
  FiBarChart2, 
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiList,
  FiX,
  FiUser,
  FiFileText
} from "react-icons/fi";
import { collection, getDocs, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";

const SellerEarning = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dynamic data state
  const [sellersEarnings, setSellersEarnings] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // 🔥 Fetch dynamic data from Firebase
  useEffect(() => {
    const fetchSellersEarnings = async () => {
      setLoading(true);
      try {
        // Adjust this collection path based on your Firestore structure
        const sellersRef = collection(db, "sellers");
        const q = query(sellersRef, orderBy("totalEarnings", "desc"));
        
        // Real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const sellers = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            sellers.push({
              id: doc.id,
              name: data.name || "Unknown Seller",
              email: data.email || "No email",
              totalEarnings: data.totalEarnings || 0,
              pendingPayout: data.pendingPayout || 0,
              completedPayouts: data.completedPayouts || 0,
              totalSales: data.totalSales || 0,
              avgOrderValue: data.avgOrderValue || 0,
              growth: data.growth || 0,
              joinDate: data.joinDate || "N/A",
              lastPayout: data.lastPayout || "N/A",
              status: data.status || "pending"
            });
          });
          setSellersEarnings(sellers);
          setLoading(false);
          setError(null);
        }, (error) => {
          console.error("Firebase error:", error);
          setError("Failed to load sellers data");
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching sellers:", err);
        setError("Failed to load sellers data");
        setLoading(false);
      }
    };

    fetchSellersEarnings();
  }, []);

  // Prepare export data function
  const prepareExportData = (sellers) => {
    return sellers.map(seller => ({
      name: seller.name,
      email: seller.email,
      totalEarnings: seller.totalEarnings,
      pendingPayout: seller.pendingPayout,
      completedPayouts: seller.completedPayouts,
      totalSales: seller.totalSales,
      avgOrderValue: seller.avgOrderValue,
      growth: seller.growth,
      joinDate: seller.joinDate,
      lastPayout: seller.lastPayout,
      status: seller.status
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
    const totalEarnings = sellersEarnings.reduce((sum, seller) => sum + (seller.totalEarnings || 0), 0);
    const totalPending = sellersEarnings.reduce((sum, seller) => sum + (seller.pendingPayout || 0), 0);
    const totalCompleted = sellersEarnings.reduce((sum, seller) => sum + (seller.completedPayouts || 0), 0);
    const totalSales = sellersEarnings.reduce((sum, seller) => sum + (seller.totalSales || 0), 0);
    const totalSellers = sellersEarnings.length;
    const activeSellers = sellersEarnings.filter(s => s.status === "active").length;

    return {
      totalEarnings,
      totalPending,
      totalCompleted,
      totalSales,
      totalSellers,
      activeSellers
    };
  }, [sellersEarnings]);

  // Filter sellers based on search and filters
  const filteredSellers = useMemo(() => {
    return sellersEarnings.filter(seller => {
      const matchesSearch = 
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || seller.status === statusFilter;
      const matchesType = typeFilter === "all";
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sellersEarnings, searchTerm, statusFilter, typeFilter]);

  // Status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="report-status-badge resolved"><FiCheckCircle /> Active</span>;
      case "suspended":
        return <span className="report-status-badge in-progress"><FiXCircle /> Suspended</span>;
      case "pending":
        return <span className="report-status-badge pending"><FiClock /> Pending</span>;
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  // Growth badge component
  const getGrowthBadge = (growth) => {
    return growth >= 0 
      ? <span className="report-stat-trend positive">+{growth}% <FiTrendingUp className="fi-pl" /></span>
      : <span className="report-stat-trend negative">{growth}% <FiTrendingDown className="fi-pl" /></span>;
  };

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
      const sellersRef = collection(db, "sellers");
      const q = query(sellersRef, orderBy("totalEarnings", "desc"));
      const querySnapshot = await getDocs(q);
      const sellers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown Seller",
          email: data.email || "No email",
          totalEarnings: data.totalEarnings || 0,
          pendingPayout: data.pendingPayout || 0,
          completedPayouts: data.completedPayouts || 0,
          totalSales: data.totalSales || 0,
          avgOrderValue: data.avgOrderValue || 0,
          growth: data.growth || 0,
          joinDate: data.joinDate || "N/A",
          lastPayout: data.lastPayout || "N/A",
          status: data.status || "pending"
        };
      });
      setSellersEarnings(sellers);
      setError(null);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading sellers data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDollarSign className="header-icon" />
            Seller Earnings Dashboard
            {loading && <span className="loading-badge">Loading...</span>}
          </h2>
          <p className="header-subtitle">
            Monitor seller earnings, payouts, and revenue performance
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
            {stats.totalSellers} total sellers
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
              <div className="report-stat-value">{formatCurrency(stats.totalEarnings)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All time earnings
            </div>
            <div className="report-stat-trend positive">
              +12.5% <FiTrendingUp className="fi-pl" />
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
              <div className="report-stat-value">{formatCurrency(stats.totalPending)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Awaiting processing
            </div>
            <div className="report-stat-trend negative">
              +8% <FiTrendingUp className="fi-pl" />
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
              <div className="report-stat-value">{formatCurrency(stats.totalCompleted)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Successfully paid out
            </div>
            <div className="report-stat-trend positive">
              +8.3% <FiTrendingUp className="fi-pl" />
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
              <div className="report-stat-value">{stats.activeSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Currently active
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
              placeholder="Search sellers by name or email..."
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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
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

      {/* Sellers Earnings Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Seller Earnings Breakdown
          </h3>
          <ExportButton
            data={prepareExportData(filteredSellers.length > 0 ? filteredSellers : sellersEarnings)}
            filename="seller-earning-reports"
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
                <th>Seller</th>
                <th>Total Earnings</th>
                <th>Pending Payout</th>
                <th>Completed Payouts</th>
                <th>Total Sales</th>
                <th>Avg Order Value</th>
                <th>Growth</th>
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
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: '4px' }} />
                      {formatCurrency(seller.totalEarnings)}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiCalendar style={{ marginRight: '4px' }} />
                      {formatCurrency(seller.pendingPayout)}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: '4px' }} />
                      {formatCurrency(seller.completedPayouts)}
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiUsers style={{ marginRight: '4px' }} />
                      {seller.totalSales} sales
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      <FiDollarSign style={{ marginRight: '4px' }} />
                      {formatCurrency(seller.avgOrderValue)}
                    </div>
                  </td>
                  <td>
                    {getGrowthBadge(seller.growth)}
                  </td>
                  <td>
                    {getStatusBadge(seller.status)}
                  </td>
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
                      <button
                        className="action-button small"
                        title="Process Payout"
                        onClick={() => alert(`Processing payout for ${seller.name}`)}
                      >
                        <FiDollarSign />
                      </button>
                      <button
                        className="action-button warning small"
                        title="View Sales"
                        onClick={() => alert(`Viewing sales for ${seller.name}`)}
                      >
                        <FiUsers />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredSellers.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="no-reports">
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
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Seller Earnings Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
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
                    <span className="detail-label">Join Date:</span>
                    <span className="detail-value">{selectedSeller.joinDate}</span>
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
                    <span className="detail-value">{formatCurrency(selectedSeller.totalEarnings)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pending Payout:</span>
                    <span className="detail-value">{formatCurrency(selectedSeller.pendingPayout)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Completed Payouts:</span>
                    <span className="detail-value">{formatCurrency(selectedSeller.completedPayouts)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Payout:</span>
                    <span className="detail-value">{selectedSeller.lastPayout}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Sales Performance</h4>
                  <div className="detail-item">
                    <span className="detail-label">Total Sales:</span>
                    <span className="detail-value">{selectedSeller.totalSales}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Average Order Value:</span>
                    <span className="detail-value">{formatCurrency(selectedSeller.avgOrderValue)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Revenue Growth:</span>
                    <span className="detail-value">
                      {getGrowthBadge(selectedSeller.growth)}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Recent Activity</h4>
                  <div className="documents-list">
                    <div className="document-item">
                      <div className="document-icon">💰</div>
                      <div className="document-info">
                        <div className="document-name">Last payout processed</div>
                        <div className="document-meta">{selectedSeller.lastPayout} - {formatCurrency(selectedSeller.completedPayouts)}</div>
                      </div>
                    </div>
                    <div className="document-item">
                      <div className="document-icon">📈</div>
                      <div className="document-info">
                        <div className="document-name">Monthly growth</div>
                        <div className="document-meta">{selectedSeller.growth >= 0 ? '+' : ''}{selectedSeller.growth}% this month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              
              <button
                className="action-button"
                onClick={() => {
                  alert(`Processing payout for ${selectedSeller.name}`);
                  setShowDetailsModal(false);
                }}
              >
                <FiDollarSign /> Process Payout
              </button>
              
              <button
                className="action-button warning"
                onClick={() => {
                  alert(`Viewing sales analytics for ${selectedSeller.name}`);
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