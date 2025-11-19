import React, { useState } from "react";
import { 
  FiBarChart2, 
  FiUsers, 
  FiEye, 
  FiShoppingCart, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiPieChart, 
  FiFilter, 
  FiCalendar, 
  FiDownload,
  FiActivity,
  FiGlobe,
  FiTarget,
  FiClock,
  FiServer,
  FiZap
} from "react-icons/fi";

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
      conversionRate: 3.2,
      revenue: 45280
    },
    traffic: {
      sources: [
        { name: "Organic Search", percentage: 45, visitors: 56250, trend: "up", change: 12 },
        { name: "Direct", percentage: 25, visitors: 31250, trend: "up", change: 8 },
        { name: "Social Media", percentage: 15, visitors: 18750, trend: "up", change: 25 },
        { name: "Referral", percentage: 10, visitors: 12500, trend: "down", change: 5 },
        { name: "Email", percentage: 5, visitors: 6250, trend: "up", change: 15 }
      ],
      topPages: [
        { name: "Homepage", views: 45000, duration: "3m 45s" },
        { name: "Product Catalog", views: 32000, duration: "5m 12s" },
        { name: "Pricing", views: 18000, duration: "2m 30s" },
        { name: "Blog", views: 15000, duration: "6m 15s" },
        { name: "Documentation", views: 12000, duration: "8m 40s" }
      ]
    },
    performance: {
      metrics: [
        { name: "Page Load Time", value: "1.2s", trend: "improving", target: "1.5s" },
        { name: "Server Response", value: "0.4s", trend: "stable", target: "0.5s" },
        { name: "Uptime", value: "99.9%", trend: "excellent", target: "99.5%" },
        { name: "Error Rate", value: "0.2%", trend: "improving", target: "0.5%" }
      ],
      regions: [
        { name: "North America", users: 6500, growth: 12 },
        { name: "Europe", users: 4200, growth: 8 },
        { name: "Asia", users: 3500, growth: 25 },
        { name: "South America", users: 1500, growth: 18 },
        { name: "Other", users: 800, growth: 5 }
      ]
    },
    conversion: {
      funnel: [
        { stage: "Visitors", count: 125000, rate: "100%" },
        { stage: "Signups", count: 12500, rate: "10%" },
        { stage: "Active Users", count: 8400, rate: "67.2%" },
        { stage: "Paying Customers", count: 2500, rate: "29.8%" }
      ],
      goals: [
        { name: "User Registration", completion: 85, target: 90 },
        { name: "Product Trial", completion: 62, target: 75 },
        { name: "Premium Upgrade", completion: 28, target: 35 },
        { name: "Annual Subscription", completion: 15, target: 20 }
      ]
    }
  };

  const getTrendBadge = (trend, change) => {
    return (
      <div className={`report-stat-trend ${trend === 'up' ? 'positive' : 'negative'}`}>
        {change}%
        {trend === 'up' ? <FiTrendingUp className="fi-pl" /> : <FiTrendingDown className="fi-pl" />}
      </div>
    );
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBarChart2 className="header-icon" />
            Platform Analytics
          </h2>
          <p className="header-subtitle">
            Comprehensive analytics and performance metrics for your platform
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">{formatNumber(analyticsData.overview.totalUsers)} total users</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        {/* Total Users */}
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Total Users</h3>
              <div className="report-stat-value">{formatNumber(analyticsData.overview.totalUsers)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Registered platform users
            </div>
            <div className="report-stat-trend positive">
              +12.5%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiActivity />
            </div>
            <div>
              <h3 className="report-stat-title">Active Users</h3>
              <div className="report-stat-value">{formatNumber(analyticsData.overview.activeUsers)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Last 30 days activity
            </div>
            <div className="report-stat-trend positive">
              +8.3%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Page Views */}
        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiEye />
            </div>
            <div>
              <h3 className="report-stat-title">Page Views</h3>
              <div className="report-stat-value">{formatNumber(analyticsData.overview.pageViews)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Total page impressions
            </div>
            <div className="report-stat-trend positive">
              +15.7%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Revenue</h3>
              <div className="report-stat-value">{formatCurrency(analyticsData.overview.revenue)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Monthly recurring revenue
            </div>
            <div className="report-stat-trend positive">
              +18.2%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" />
            Analytics Categories
          </h3>
          <div className="filter-results">
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
          </div>
        </div>
        
        <div className="filter-controls-grid">
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
              <FiGlobe className="tab-icon" />
              Traffic
            </button>
            <button 
              className={`tab-button ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <FiZap className="tab-icon" />
              Performance
            </button>
            <button 
              className={`tab-button ${activeTab === "conversion" ? "active" : ""}`}
              onClick={() => setActiveTab("conversion")}
            >
              <FiTarget className="tab-icon" />
              Conversion
            </button>
          </div>
          
          <div className="filter-actions">
            <button className="filter-button primary">
              <FiFilter />
              Apply
            </button>
            <button className="filter-button">
              <FiDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="reports-content-grid">
          {/* User Growth Chart */}
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <h3 className="panel-title">
                <FiTrendingUp className="panel-icon" />
                User Growth Analytics
              </h3>
              <div className="satisfaction-score">
                <span className="score-value">+12.5%</span>
                <span className="score-label">Growth Rate</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="pie-chart-container">
                <div className="pie-chart-wrapper">
                  <div className="pie-chart">
                    <div className="pie-chart-center">
                      <div className="pie-chart-value">67%</div>
                      <div className="pie-chart-label">Active Rate</div>
                    </div>
                  </div>
                </div>
                
                <div className="pie-chart-labels">
                  <div className="pie-chart-label">
                    <span className="pie-label-dot excellent"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Active Users</span>
                      <span className="pie-label-percentage">67% ({formatNumber(analyticsData.overview.activeUsers)})</span>
                    </div>
                  </div>
                  
                  <div className="pie-chart-label">
                    <span className="pie-label-dot good"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">New Users</span>
                      <span className="pie-label-percentage">3.6% ({formatNumber(analyticsData.overview.newUsers)})</span>
                    </div>
                  </div>
                  
                  <div className="pie-chart-label">
                    <span className="pie-label-dot average"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Inactive</span>
                      <span className="pie-label-percentage">29.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="reports-categories-card">
            <div className="reports-categories-header">
              <h3 className="panel-title">
                <FiPieChart className="panel-icon" />
                Traffic Sources
              </h3>
            </div>
            <div className="reports-categories-body">
              {analyticsData.traffic.sources.map((source, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{source.name}</span>
                    <span className="category-count">{source.percentage}% ({formatNumber(source.visitors)})</span>
                  </div>
                  <div className="category-progress-bar">
                    <div 
                      className={`category-progress-fill ${
                        source.name === 'Organic Search' ? 'harassment' :
                        source.name === 'Direct' ? 'spam' :
                        source.name === 'Social Media' ? 'fraud' :
                        source.name === 'Referral' ? 'content' : 'other'
                      }`} 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <div className="category-trend">
                    {getTrendBadge(source.trend, source.change)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === "traffic" && (
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiGlobe className="panel-icon" />
              Traffic Analytics
            </h3>
            <button className="action-button secondary">
              <FiDownload className="button-icon" />
              Export Report
            </button>
          </div>
          <div className="recent-reports-body">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Views</th>
                  <th>Avg. Duration</th>
                  <th>Bounce Rate</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.traffic.topPages.map((page, index) => (
                  <tr key={index}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-avatar">
                          {page.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="report-user-info">
                          <div className="report-user-name comp-dis">{page.name}</div>
                          <div className="report-user-email">/ {page.name.toLowerCase().replace(' ', '-')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="comp-dis">{formatNumber(page.views)}</div>
                    </td>
                    <td>
                      <div className="comp-dis">{page.duration}</div>
                    </td>
                    <td>
                      <div className="success-rate">
                        <div className="rate-value">28%</div>
                        <div className="rate-bar">
                          <div className="rate-fill" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getTrendBadge('up', 12)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="reports-content-grid">
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <h3 className="panel-title">
                <FiZap className="panel-icon" />
                System Performance
              </h3>
              <div className="satisfaction-score">
                <span className="score-value">99.9%</span>
                <span className="score-label">Uptime</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="performance-metrics-grid">
                {analyticsData.performance.metrics.map((metric, index) => (
                  <div key={index} className="performance-metric">
                    <div className="metric-header">
                      <span className="metric-name">{metric.name}</span>
                      <span className={`metric-status ${metric.trend}`}>{metric.trend}</span>
                    </div>
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-target">Target: {metric.target}</div>
                    <div className="metric-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: metric.name === 'Uptime' ? '99.9%' : 
                                  metric.name === 'Error Rate' ? '40%' : '80%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reports-categories-card">
            <div className="reports-categories-header">
              <h3 className="panel-title">
                <FiGlobe className="panel-icon" />
                User Distribution
              </h3>
            </div>
            <div className="reports-categories-body">
              {analyticsData.performance.regions.map((region, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{region.name}</span>
                    <span className="category-count">{formatNumber(region.users)} users</span>
                  </div>
                  <div className="category-progress-bar">
                    <div 
                      className={`category-progress-fill ${
                        region.name === 'North America' ? 'harassment' :
                        region.name === 'Europe' ? 'spam' :
                        region.name === 'Asia' ? 'fraud' :
                        region.name === 'South America' ? 'content' : 'other'
                      }`} 
                      style={{ width: `${(region.users / analyticsData.overview.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <div className="category-trend">
                    {getTrendBadge('up', region.growth)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conversion Tab */}
      {activeTab === "conversion" && (
        <div className="reports-content-grid">
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <h3 className="panel-title">
                <FiTarget className="panel-icon" />
                Conversion Funnel
              </h3>
              <div className="satisfaction-score">
                <span className="score-value">2.0%</span>
                <span className="score-label">Overall Rate</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="conversion-funnel">
                {analyticsData.conversion.funnel.map((stage, index) => (
                  <div key={index} className="funnel-stage">
                    <div className="stage-header">
                      <span className="stage-name">{stage.stage}</span>
                      <span className="stage-rate">{stage.rate}</span>
                    </div>
                    <div className="stage-count">{formatNumber(stage.count)}</div>
                    <div className="stage-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${(stage.count / analyticsData.conversion.funnel[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reports-categories-card">
            <div className="reports-categories-header">
              <h3 className="panel-title">
                <FiTrendingUp className="panel-icon" />
                Goal Completion
              </h3>
            </div>
            <div className="reports-categories-body">
              {analyticsData.conversion.goals.map((goal, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{goal.name}</span>
                    <span className="category-count">{goal.completion}% / {goal.target}%</span>
                  </div>
                  <div className="category-progress-bar">
                    <div 
                      className={`category-progress-fill ${
                        goal.completion >= goal.target ? 'harassment' :
                        goal.completion >= goal.target * 0.8 ? 'spam' :
                        goal.completion >= goal.target * 0.6 ? 'fraud' : 'content'
                      }`} 
                      style={{ width: `${goal.completion}%` }}
                    ></div>
                  </div>
                  <div className="category-trend">
                    <span className={`status-badge ${goal.completion >= goal.target ? 'resolved' : 'pending'}`}>
                      {goal.completion >= goal.target ? 'Achieved' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;