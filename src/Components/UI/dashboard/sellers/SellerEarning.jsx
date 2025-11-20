import React, { useState } from "react";
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

const SellerEarning = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [sellersEarnings, setSellersEarnings] = useState([
    {
      id: 1,
      name: "Ali Designs",
      email: "ali.ahmed@example.com",
      totalEarnings: 12500,
      pendingPayout: 2500,
      completedPayouts: 10000,
      totalSales: 45,
      avgOrderValue: 278,
      growth: 15.2,
      joinDate: "2023-05-15",
      lastPayout: "2024-01-10",
      status: "active"
    },
    {
      id: 2,
      name: "Sara Creations",
      email: "sara.khan@example.com",
      totalEarnings: 8900,
      pendingPayout: 1200,
      completedPayouts: 7700,
      totalSales: 32,
      avgOrderValue: 278,
      growth: 8.7,
      joinDate: "2023-08-22",
      lastPayout: "2024-01-08",
      status: "active"
    },
    {
      id: 3,
      name: "UR Designs",
      email: "usman.riaz@example.com",
      totalEarnings: 15600,
      pendingPayout: 3100,
      completedPayouts: 12500,
      totalSales: 58,
      avgOrderValue: 269,
      growth: 22.1,
      joinDate: "2023-03-10",
      lastPayout: "2024-01-12",
      status: "active"
    },
    {
      id: 4,
      name: "Digital Assets Co",
      email: "fatima.noor@example.com",
      totalEarnings: 7200,
      pendingPayout: 800,
      completedPayouts: 6400,
      totalSales: 28,
      avgOrderValue: 257,
      growth: -5.3,
      joinDate: "2023-11-05",
      lastPayout: "2024-01-05",
      status: "suspended"
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter sellers based on search and filters
  const filteredSellers = sellersEarnings.filter(seller => {
    const matchesSearch = 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || seller.status === statusFilter;
    const matchesType = typeFilter === "all"; // You can add type filters if needed
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    totalEarnings: sellersEarnings.reduce((sum, seller) => sum + seller.totalEarnings, 0),
    totalPending: sellersEarnings.reduce((sum, seller) => sum + seller.pendingPayout, 0),
    totalCompleted: sellersEarnings.reduce((sum, seller) => sum + seller.completedPayouts, 0),
    totalSales: sellersEarnings.reduce((sum, seller) => sum + seller.totalSales, 0),
    totalSellers: sellersEarnings.length,
    activeSellers: sellersEarnings.filter(s => s.status === "active").length
  };

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

  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDollarSign className="header-icon" />
            Seller Earnings Dashboard
          </h2>
          <p className="header-subtitle">
            Monitor seller earnings, payouts, and revenue performance
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
            <button className="filter-button primary">
              <FiDownload /> Export Report
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
          <button className="action-button secondary">
            <FiDownload className="button-icon" /> Export Data
          </button>
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
              
              {filteredSellers.length === 0 && (
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