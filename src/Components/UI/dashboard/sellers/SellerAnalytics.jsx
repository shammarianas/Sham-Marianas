import React, { useState } from "react";
import { 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp,
  FiTrendingDown, 
  FiUsers, 
  FiDollarSign, 
  FiShoppingCart, 
  FiEye, 
  FiCalendar, 
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiList,
  FiX,
  FiSearch,
  FiCheckCircle,
  FiStar
} from "react-icons/fi";

const SellerAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const analyticsData = {
    overview: {
      totalRevenue: 125000,
      totalSellers: 45,
      activeSellers: 38,
      avgRevenuePerSeller: 2778,
      growthRate: 15.2,
      topCategories: [
        { name: "3D Models", value: 35, growth: 12.5 },
        { name: "Graphics", value: 25, growth: 8.3 },
        { name: "Templates", value: 20, growth: 15.7 },
        { name: "Fonts", value: 12, growth: -2.1 },
        { name: "Others", value: 8, growth: 5.4 }
      ]
    },
    performance: {
      topPerformers: [
        {
          id: 1,
          name: "Ali Designs",
          email: "ali.ahmed@example.com",
          revenue: 15600,
          growth: 22.1,
          products: 24,
          rating: 4.8,
          joinDate: "2023-05-15",
          status: "active"
        },
        {
          id: 2,
          name: "UR Designs",
          email: "usman.riaz@example.com",
          revenue: 14200,
          growth: 18.7,
          products: 18,
          rating: 4.9,
          joinDate: "2023-03-10",
          status: "active"
        },
        {
          id: 3,
          name: "Sara Creations",
          email: "sara.khan@example.com",
          revenue: 11800,
          growth: 12.3,
          products: 32,
          rating: 4.7,
          joinDate: "2023-08-22",
          status: "active"
        }
      ]
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Statistics
  const stats = {
    totalRevenue: analyticsData.overview.totalRevenue,
    totalSellers: analyticsData.overview.totalSellers,
    activeSellers: analyticsData.overview.activeSellers,
    avgRevenuePerSeller: analyticsData.overview.avgRevenuePerSeller
  };

  const getGrowthBadge = (growth) => {
    return growth >= 0 
      ? <span className="report-stat-trend positive">+{growth}% <FiTrendingUp className="fi-pl" /></span>
      : <span className="report-stat-trend negative">{growth}% <FiTrendingDown className="fi-pl" /></span>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="report-status-badge resolved"><FiCheckCircle /> Active</span>;
      case "suspended":
        return <span className="report-status-badge in-progress"><FiXCircle /> Suspended</span>;
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
  };

  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBarChart2 className="header-icon" />
            Seller Analytics
          </h2>
          <p className="header-subtitle">
            Comprehensive analytics and insights for seller performance
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
              <h3 className="report-stat-title">Total Revenue</h3>
              <div className="report-stat-value">{formatCurrency(stats.totalRevenue)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All time revenue
            </div>
            <div className="report-stat-trend positive">
              +{analyticsData.overview.growthRate}% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Total Sellers</h3>
              <div className="report-stat-value">{stats.totalSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Registered sellers
            </div>
            <div className="report-stat-trend positive">
              +8.3% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiShoppingCart />
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
              +12.1% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Avg Revenue/Seller</h3>
              <div className="report-stat-value">{formatCurrency(stats.avgRevenuePerSeller)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Average per seller
            </div>
            <div className="report-stat-trend positive">
              +5.7% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Analytics Dashboard
          </h3>
          <div className="filter-results">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
              style={{ width: 'auto' }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="analytics-tabs" style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1' }}>
            <button 
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <FiBarChart2 className="tab-icon" />
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <FiTrendingUp className="tab-icon" />
              Performance
            </button>
            <button 
              className={`tab-button ${activeTab === "growth" ? "active" : ""}`}
              onClick={() => setActiveTab("growth")}
            >
              <FiUsers className="tab-icon" />
              Growth
            </button>
            <button 
              className={`tab-button ${activeTab === "insights" ? "active" : ""}`}
              onClick={() => setActiveTab("insights")}
            >
              <FiEye className="tab-icon" />
              Insights
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="analytics-content">
          {/* Charts Grid */}
          <div className="reports-content-grid">
            {/* Revenue Chart */}
            <div className="reports-chart-card">
              <div className="reports-chart-header">
                <h3 className="panel-title">
                  <FiTrendingUp className="panel-icon" />
                  Revenue Trend
                </h3>
                <button className="action-button secondary small">
                  <FiDownload /> Export
                </button>
              </div>
              <div className="reports-chart-body">
                <div className="chart-placeholder" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <FiBarChart2 className="placeholder-icon large" />
                  <p>Revenue trend chart showing monthly growth</p>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="reports-categories-card">
              <div className="reports-chart-header">
                <h3 className="panel-title">
                  <FiPieChart className="panel-icon" />
                  Category Distribution
                </h3>
              </div>
              <div className="reports-categories-body">
                <div className="category-progress">
                  {analyticsData.overview.topCategories.map((category, index) => (
                    <div key={index} className="category-progress" style={{ marginBottom: '1rem' }}>
                      <div className="category-header">
                        <div className="category-name">{category.name}</div>
                        <div className="category-count">{category.value}%</div>
                      </div>
                      <div className="category-progress-bar">
                        <div 
                          className={`category-progress-fill ${category.growth >= 0 ? 'excellent' : 'poor'}`}
                          style={{ width: `${category.value}%` }}
                        ></div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {getGrowthBadge(category.growth)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Seller Performance Table */}
          <div className="recent-reports-card">
            <div className="recent-reports-header">
              <h3 className="panel-title">
                <FiList className="panel-icon" /> Top Performing Sellers
              </h3>
              <div className="filter-controls-grid" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="filter-search-wrapper">
                  <FiSearch className="filter-search-icon" />
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                </div>
                <button className="filter-button" onClick={resetFilters}>
                  <FiRefreshCw /> Reset
                </button>
              </div>
            </div>
            <div className="recent-reports-body">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th>Revenue</th>
                    <th>Growth</th>
                    <th>Products</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.performance.topPerformers.map((seller) => (
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
                          {formatCurrency(seller.revenue)}
                        </div>
                      </td>
                      <td>
                        {getGrowthBadge(seller.growth)}
                      </td>
                      <td>
                        <div className="comp-dis">
                          <FiShoppingCart style={{ marginRight: '4px' }} />
                          {seller.products} products
                        </div>
                      </td>
                      <td>
                        <div className="comp-dis">
                          <FiStar style={{ marginRight: '4px', color: '#fbbf24' }} />
                          {seller.rating}/5.0
                        </div>
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
                            title="View Analytics"
                            onClick={() => alert(`Viewing analytics for ${seller.name}`)}
                          >
                            <FiBarChart2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="analytics-content">
          <div className="recent-reports-card">
            <div className="recent-reports-header">
              <h3 className="panel-title">Performance Analytics</h3>
            </div>
            <div className="recent-reports-body">
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FiTrendingUp className="placeholder-icon large" />
                <p>Detailed performance metrics and comparative analysis</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Tab */}
      {activeTab === "growth" && (
        <div className="analytics-content">
          <div className="recent-reports-card">
            <div className="recent-reports-header">
              <h3 className="panel-title">Growth Analytics</h3>
            </div>
            <div className="recent-reports-body">
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FiUsers className="placeholder-icon large" />
                <p>Seller growth trends and acquisition metrics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="analytics-content">
          <div className="recent-reports-card">
            <div className="recent-reports-header">
              <h3 className="panel-title">Business Insights</h3>
            </div>
            <div className="recent-reports-body">
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FiEye className="placeholder-icon large" />
                <p>Actionable insights and recommendations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {showDetailsModal && selectedSeller && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Seller Performance Details</h3>
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
                  <h4>Performance Metrics</h4>
                  <div className="detail-item">
                    <span className="detail-label">Total Revenue:</span>
                    <span className="detail-value">{formatCurrency(selectedSeller.revenue)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Growth Rate:</span>
                    <span className="detail-value">
                      {getGrowthBadge(selectedSeller.growth)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Products:</span>
                    <span className="detail-value">{selectedSeller.products}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rating:</span>
                    <span className="detail-value">
                      <FiStar style={{ color: '#fbbf24', marginRight: '4px' }} />
                      {selectedSeller.rating}/5.0
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Performance Insights</h4>
                  <div className="detail-description">
                    {selectedSeller.name} is performing exceptionally well with a {selectedSeller.growth}% growth rate. 
                    Their product catalog of {selectedSeller.products} items is generating consistent revenue with high customer satisfaction.
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
                  alert(`Viewing detailed analytics for ${selectedSeller.name}`);
                  setShowDetailsModal(false);
                }}
              >
                <FiBarChart2 /> View Analytics
              </button>
              
              <button
                className="action-button warning"
                onClick={() => {
                  alert(`Generating report for ${selectedSeller.name}`);
                  setShowDetailsModal(false);
                }}
              >
                <FiDownload /> Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;