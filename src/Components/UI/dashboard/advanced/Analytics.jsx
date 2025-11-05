import React, { useState } from "react";
import { FiBarChart2, FiUsers, FiEye, FiShoppingCart, FiDollarSign, FiTrendingUp, FiPieChart, FiFilter, FiCalendar, FiDownload } from "react-icons/fi";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const analyticsData = {
    overview: {
      totalUsers: 12500,
      activeUsers: 8400,
      newUsers: 450,
      pageViews: 125000,
      avgSession: "4m 23s",
      bounceRate: 32.5,
      conversionRate: 3.2
    },
    traffic: {
      sources: [
        { name: "Organic Search", percentage: 45, visitors: 56250 },
        { name: "Direct", percentage: 25, visitors: 31250 },
        { name: "Social Media", percentage: 15, visitors: 18750 },
        { name: "Referral", percentage: 10, visitors: 12500 },
        { name: "Email", percentage: 5, visitors: 6250 }
      ]
    },
    performance: {
      metrics: [
        { name: "Page Load Time", value: "1.2s", trend: "improving" },
        { name: "Server Response", value: "0.4s", trend: "stable" },
        { name: "Uptime", value: "99.9%", trend: "excellent" },
        { name: "Error Rate", value: "0.2%", trend: "improving" }
      ]
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBarChart2 className="header-icon" />
            Platform Analytics
          </h2>
          <p className="header-subtitle">
            Comprehensive analytics and performance metrics
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
            <FiDownload className="button-icon" />
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
          className={`tab-button ${activeTab === "traffic" ? "active" : ""}`}
          onClick={() => setActiveTab("traffic")}
        >
          <FiUsers className="tab-icon" />
          Traffic
        </button>
        <button 
          className={`tab-button ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          <FiTrendingUp className="tab-icon" />
          Performance
        </button>
        <button 
          className={`tab-button ${activeTab === "conversion" ? "active" : ""}`}
          onClick={() => setActiveTab("conversion")}
        >
          <FiShoppingCart className="tab-icon" />
          Conversion
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="analytics-content">
          {/* Key Metrics */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {analyticsData.overview.totalUsers.toLocaleString()}
                </div>
                <div className="stat-label">Total Users</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +12.5%
                </div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {analyticsData.overview.activeUsers.toLocaleString()}
                </div>
                <div className="stat-label">Active Users</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +8.3%
                </div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <FiEye />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {analyticsData.overview.pageViews.toLocaleString()}
                </div>
                <div className="stat-label">Page Views</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +15.7%
                </div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <FiShoppingCart />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {analyticsData.overview.conversionRate}%
                </div>
                <div className="stat-label">Conversion Rate</div>
                <div className="stat-trend positive">
                  <FiTrendingUp />
                  +2.1%
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* User Growth Chart */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="panel-title">
                  <FiTrendingUp className="panel-icon" />
                  User Growth
                </h3>
              </div>
              <div className="card-body">
                <div className="chart-placeholder large">
                  <FiBarChart2 className="placeholder-icon xlarge" />
                  <p>User growth chart showing monthly trends</p>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="panel-title">
                  <FiPieChart className="panel-icon" />
                  Traffic Sources
                </h3>
              </div>
              <div className="card-body">
                <div className="traffic-sources">
                  {analyticsData.traffic.sources.map((source, index) => (
                    <div key={index} className="source-item">
                      <div className="source-header">
                        <span className="source-name">{source.name}</span>
                        <span className="source-percentage">{source.percentage}%</span>
                      </div>
                      <div className="source-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <div className="source-visitors">
                        {source.visitors.toLocaleString()} visitors
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">Performance Metrics</h3>
            </div>
            <div className="card-body">
              <div className="performance-metrics">
                {analyticsData.performance.metrics.map((metric, index) => (
                  <div key={index} className="metric-item">
                    <div className="metric-info">
                      <div className="metric-name">{metric.name}</div>
                      <div className="metric-value">{metric.value}</div>
                    </div>
                    <div className={`metric-trend ${metric.trend}`}>
                      {metric.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === "traffic" && (
        <div className="analytics-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Traffic Analytics</h3>
              <p>Detailed traffic analysis and user behavior metrics.</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="analytics-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Performance Monitoring</h3>
              <p>System performance and technical metrics.</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Tab */}
      {activeTab === "conversion" && (
        <div className="analytics-content">
          <div className="content-card">
            <div className="card-body">
              <h3>Conversion Analytics</h3>
              <p>Conversion funnel analysis and optimization insights.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;