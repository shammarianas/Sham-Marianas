import React, { useState } from "react";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingCart, FiPieChart, FiBarChart2, FiCalendar, FiDownload } from "react-icons/fi";

const Earnings = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");

  const earningsData = {
    overview: {
      totalRevenue: 125000,
      platformEarnings: 25000,
      sellerPayouts: 100000,
      activeTransactions: 45,
      growthRate: 15.2,
      avgTransactionValue: 278
    },
    monthly: [
      { month: "Jan", revenue: 115000, platform: 23000, payouts: 92000 },
      { month: "Feb", revenue: 125000, platform: 25000, payouts: 100000 },
      { month: "Mar", revenue: 118000, platform: 23600, payouts: 94400 },
      { month: "Apr", revenue: 132000, platform: 26400, payouts: 105600 },
      { month: "May", revenue: 128000, platform: 25600, payouts: 102400 },
      { month: "Jun", revenue: 142000, platform: 28400, payouts: 113600 }
    ],
    categories: [
      { name: "3D Models", revenue: 43750, percentage: 35 },
      { name: "Graphics", revenue: 31250, percentage: 25 },
      { name: "Templates", revenue: 25000, percentage: 20 },
      { name: "Fonts", revenue: 12500, percentage: 10 },
      { name: "Others", revenue: 12500, percentage: 10 }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="earnings-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDollarSign className="header-icon" />
            Earnings & Revenue
          </h2>
          <p className="header-subtitle">
            Comprehensive earnings overview and revenue analytics
          </p>
        </div>
        <div className="header-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="action-button secondary">
            <FiDownload className="button-icon" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="earnings-tabs">
        <button 
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <FiBarChart2 className="tab-icon" />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === "revenue" ? "active" : ""}`}
          onClick={() => setActiveTab("revenue")}
        >
          <FiDollarSign className="tab-icon" />
          Revenue
        </button>
        <button 
          className={`tab-button ${activeTab === "payouts" ? "active" : ""}`}
          onClick={() => setActiveTab("payouts")}
        >
          <FiUsers className="tab-icon" />
          Payouts
        </button>
        <button 
          className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <FiPieChart className="tab-icon" />
          Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="earnings-content">
          {/* Key Metrics */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(earningsData.overview.totalRevenue)}
                </div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +{earningsData.overview.growthRate}%
                </div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(earningsData.overview.platformEarnings)}
                </div>
                <div className="stat-label">Platform Earnings</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +18.3%
                </div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(earningsData.overview.sellerPayouts)}
                </div>
                <div className="stat-label">Seller Payouts</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +14.2%
                </div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <FiShoppingCart />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(earningsData.overview.avgTransactionValue)}
                </div>
                <div className="stat-label">Avg Transaction</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +5.7%
                </div>
              </div>
            </div>
          </div>

          <div className="earnings-grid">
            {/* Revenue Chart */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="panel-title">
                  <FiTrendingUp className="panel-icon" />
                  Revenue Trend
                </h3>
              </div>
              <div className="card-body">
                <div className="revenue-chart">
                  <div className="chart-placeholder large">
                    <FiBarChart2 className="placeholder-icon xlarge" />
                    <p>Revenue trend chart showing monthly performance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Distribution */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="panel-title">
                  <FiPieChart className="panel-icon" />
                  Earnings Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="earnings-distribution">
                  <div className="distribution-item platform">
                    <div className="distribution-label">
                      <span className="dot"></span>
                      Platform Earnings
                    </div>
                    <div className="distribution-value">
                      {formatCurrency(earningsData.overview.platformEarnings)}
                      <span className="percentage">20%</span>
                    </div>
                  </div>
                  <div className="distribution-item sellers">
                    <div className="distribution-label">
                      <span className="dot"></span>
                      Seller Payouts
                    </div>
                    <div className="distribution-value">
                      {formatCurrency(earningsData.overview.sellerPayouts)}
                      <span className="percentage">80%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">Category Performance</h3>
            </div>
            <div className="card-body">
              <div className="category-performance">
                {earningsData.categories.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category.name}</span>
                      <span className="category-revenue">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                    <div className="category-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="category-percentage">
                      {category.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="earnings-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Revenue Analytics</h3>
              <p>Detailed revenue breakdown and transaction analysis.</p>
            </div>
          </div>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="earnings-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Payouts Management</h3>
              <p>Seller payout schedules and transaction history.</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="earnings-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Advanced Analytics</h3>
              <p>Detailed financial analytics and forecasting.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;