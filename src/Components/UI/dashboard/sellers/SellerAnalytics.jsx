import React, { useState } from "react";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiUsers, FiDollarSign, FiShoppingCart, FiEye, FiCalendar, FiFilter } from "react-icons/fi";

const SellerAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

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
          revenue: 15600,
          growth: 22.1,
          products: 24,
          rating: 4.8
        },
        {
          id: 2,
          name: "UR Designs",
          revenue: 14200,
          growth: 18.7,
          products: 18,
          rating: 4.9
        },
        {
          id: 3,
          name: "Sara Creations",
          revenue: 11800,
          growth: 12.3,
          products: 32,
          rating: 4.7
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

  return (
    <div className="seller-analytics-dashboard">
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
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="action-button secondary">
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="analytics-content">
          {/* Key Metrics */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +{analyticsData.overview.growthRate}%
                </div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analyticsData.overview.totalSellers}</div>
                <div className="stat-label">Total Sellers</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +8.3%
                </div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <FiShoppingCart />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analyticsData.overview.activeSellers}</div>
                <div className="stat-label">Active Sellers</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +12.1%
                </div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(analyticsData.overview.avgRevenuePerSeller)}
                </div>
                <div className="stat-label">Avg Revenue/Seller</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +5.7%
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* Revenue Chart */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="panel-title">
                  <FiTrendingUp className="panel-icon" />
                  Revenue Trend
                </h3>
              </div>
              <div className="card-body">
                <div className="chart-placeholder large">
                  <FiBarChart2 className="placeholder-icon xlarge" />
                  <p>Revenue trend chart showing monthly growth</p>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="panel-title">
                  <FiPieChart className="panel-icon" />
                  Category Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="category-breakdown">
                  {analyticsData.overview.topCategories.map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{category.name}</span>
                        <span className="category-percentage">{category.value}%</span>
                      </div>
                      <div className="category-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${category.value}%` }}
                        ></div>
                      </div>
                      <div className="category-growth">
                        <span className={`growth ${category.growth >= 0 ? 'positive' : 'negative'}`}>
                          {category.growth >= 0 ? '+' : ''}{category.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Seller Performance Table */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">Top Performing Sellers</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Seller</th>
                      <th>Revenue</th>
                      <th>Growth</th>
                      <th>Products</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.performance.topPerformers.map((seller) => (
                      <tr key={seller.id}>
                        <td>
                          <div className="seller-info">
                            <div className="seller-avatar">
                              {seller.name.charAt(0)}
                            </div>
                            <div className="seller-details">
                              <div className="seller-name">{seller.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="revenue-amount">
                            {formatCurrency(seller.revenue)}
                          </div>
                        </td>
                        <td>
                          <div className={`growth ${seller.growth >= 0 ? 'positive' : 'negative'}`}>
                            {seller.growth >= 0 ? '+' : ''}{seller.growth}%
                          </div>
                        </td>
                        <td>
                          <div className="products-count">{seller.products}</div>
                        </td>
                        <td>
                          <div className="rating">
                            <span className="rating-stars">⭐</span>
                            {seller.rating}
                          </div>
                        </td>
                        <td>
                          <button className="action-button secondary small">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="analytics-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Performance Analytics</h3>
              <p>Detailed performance metrics and comparative analysis.</p>
            </div>
          </div>
        </div>
      )}

      {/* Growth Tab */}
      {activeTab === "growth" && (
        <div className="analytics-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Growth Analytics</h3>
              <p>Seller growth trends and acquisition metrics.</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="analytics-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Business Insights</h3>
              <p>Actionable insights and recommendations.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;