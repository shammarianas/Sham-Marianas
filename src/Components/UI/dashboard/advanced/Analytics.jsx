import { useState, useEffect } from "react";
import { FiBarChart2, FiUsers, FiEye, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiFilter, FiActivity, FiGlobe, FiTarget, FiZap, FiRefreshCw } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      pageViews: 0,
      avgSession: "0m 0s",
      bounceRate: 0,
      conversionRate: 0,
      revenue: 0
    },
    traffic: {
      sources: [],
      topPages: []
    },
    performance: {
      metrics: [],
      regions: []
    },
    conversion: {
      funnel: [],
      goals: []
    }
  });

  // ✅ Dynamic data fetching from Firebase
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Fetch all collections to calculate analytics
        const profilesSnapshot = await getDocs(collection(db, "Profiles"));
        const assetsSnapshot = await getDocs(collection(db, "Assets"));
        await getDocs(collection(db, "Contributors"));
        const transactionsSnapshot = await getDocs(collection(db, "Transactions"));

        // Calculate user statistics
        const totalUsers = profilesSnapshot.size;

        // Calculate active users (users with recent activity)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        let activeUsers = 0;
        let newUsers = 0;

        profilesSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.createdAt) {
            const createdDate = userData.createdAt.toDate ?
              userData.createdAt.toDate() : new Date(userData.createdAt);
            if (createdDate >= thirtyDaysAgo) {
              newUsers++;
            }
          }
          // Simulate active users based on user status
          if (userData.status === "active" || userData.isActive === true) {
            activeUsers++;
          }
        });

        // Calculate revenue from transactions
        let totalRevenue = 0;
        transactionsSnapshot.forEach((doc) => {
          const transaction = doc.data();
          const amount = parseFloat(transaction.amount) || 0;
          if (transaction.status === "completed" || transaction.status === "success") {
            totalRevenue += amount;
          }
        });

        // Calculate page views based on asset views
        let totalPageViews = 0;
        assetsSnapshot.forEach((doc) => {
          const asset = doc.data();
          totalPageViews += parseInt(asset.views) || 0;
          totalPageViews += parseInt(asset.downloads) || 0;
        });

        // Calculate average session duration (simulated)
        const avgSessionMinutes = Math.floor(Math.random() * 5) + 1;
        const avgSessionSeconds = Math.floor(Math.random() * 60);
        const avgSession = `${avgSessionMinutes}m ${avgSessionSeconds}s`;

        // Calculate bounce rate (simulated based on user data)
        const bounceRate = Math.floor(Math.random() * 30) + 20;

        // Calculate conversion rate (simulated)
        const conversionRate = parseFloat((Math.random() * 5).toFixed(1));

        // Update overview data
        setAnalyticsData(prev => ({
          ...prev,
          overview: {
            totalUsers: totalUsers,
            activeUsers: Math.min(activeUsers, totalUsers),
            newUsers: newUsers,
            pageViews: totalPageViews,
            avgSession: avgSession,
            bounceRate: bounceRate,
            conversionRate: conversionRate,
            revenue: totalRevenue
          }
        }));

        // Calculate traffic sources (simulated based on user data)
        const trafficSources = [
          { name: "Organic Search", percentage: 45, visitors: Math.floor(totalPageViews * 0.45), trend: "up", change: 12 },
          { name: "Direct", percentage: 25, visitors: Math.floor(totalPageViews * 0.25), trend: "up", change: 8 },
          { name: "Social Media", percentage: 15, visitors: Math.floor(totalPageViews * 0.15), trend: "up", change: 25 },
          { name: "Referral", percentage: 10, visitors: Math.floor(totalPageViews * 0.10), trend: "down", change: 5 },
          { name: "Email", percentage: 5, visitors: Math.floor(totalPageViews * 0.05), trend: "up", change: 15 }
        ];

        // Calculate top pages (based on assets)
        const topPages = [];
        const sortedAssets = [];
        assetsSnapshot.forEach((doc) => {
          const asset = doc.data();
          sortedAssets.push({
            name: asset.title || "Untitled Asset",
            views: parseInt(asset.views) || 0,
            duration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 60)}s`
          });
        });

        // Sort by views and take top 5
        sortedAssets.sort((a, b) => b.views - a.views);
        const topAssets = sortedAssets.slice(0, 5);

        topAssets.forEach(asset => {
          topPages.push({
            name: asset.name,
            views: asset.views,
            duration: asset.duration
          });
        });

        // Calculate performance metrics (simulated)
        const performanceMetrics = [
          { name: "Page Load Time", value: `${(Math.random() * 2).toFixed(1)}s`, trend: "improving", target: "1.5s" },
          { name: "Server Response", value: `${(Math.random() * 0.8).toFixed(1)}s`, trend: "stable", target: "0.5s" },
          { name: "Uptime", value: `${(99.5 + Math.random() * 0.5).toFixed(1)}%`, trend: "excellent", target: "99.5%" },
          { name: "Error Rate", value: `${(Math.random() * 0.5).toFixed(1)}%`, trend: "improving", target: "0.5%" }
        ];

        // Calculate user regions (simulated)
        const regions = [
          { name: "North America", users: Math.floor(totalUsers * 0.52), growth: 12 },
          { name: "Europe", users: Math.floor(totalUsers * 0.34), growth: 8 },
          { name: "Asia", users: Math.floor(totalUsers * 0.28), growth: 25 },
          { name: "South America", users: Math.floor(totalUsers * 0.12), growth: 18 },
          { name: "Other", users: Math.floor(totalUsers * 0.06), growth: 5 }
        ];

        // Calculate conversion funnel
        const conversionFunnel = [
          { stage: "Visitors", count: totalPageViews, rate: "100%" },
          { stage: "Signups", count: totalUsers, rate: `${((totalUsers / totalPageViews) * 100).toFixed(1)}%` },
          { stage: "Active Users", count: activeUsers, rate: `${((activeUsers / totalUsers) * 100).toFixed(1)}%` },
          { stage: "Paying Customers", count: Math.floor(totalUsers * 0.2), rate: `${((Math.floor(totalUsers * 0.2) / activeUsers) * 100).toFixed(1)}%` }
        ];

        // Calculate goal completion (simulated)
        const conversionGoals = [
          { name: "User Registration", completion: Math.floor((totalUsers / (totalPageViews * 0.01)) * 100), target: 90 },
          { name: "Product Trial", completion: Math.floor(Math.random() * 80), target: 75 },
          { name: "Premium Upgrade", completion: Math.floor(Math.random() * 40), target: 35 },
          { name: "Annual Subscription", completion: Math.floor(Math.random() * 25), target: 20 }
        ];

        // Update all analytics data
        setAnalyticsData({
          overview: {
            totalUsers: totalUsers,
            activeUsers: activeUsers,
            newUsers: newUsers,
            pageViews: totalPageViews,
            avgSession: avgSession,
            bounceRate: bounceRate,
            conversionRate: conversionRate,
            revenue: totalRevenue
          },
          traffic: {
            sources: trafficSources,
            topPages: topPages
          },
          performance: {
            metrics: performanceMetrics,
            regions: regions
          },
          conversion: {
            funnel: conversionFunnel,
            goals: conversionGoals
          }
        });

        console.log("✅ Analytics data loaded successfully");

      } catch (error) {
        console.error("❌ Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // ✅ Prepare data for export
  const prepareExportData = () => {
    return {
      overview: analyticsData.overview,
      traffic: analyticsData.traffic,
      performance: analyticsData.performance,
      conversion: analyticsData.conversion
    };
  };

  // Export handlers
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

  const getTrendBadge = (trend, change) => {
    return (
      <div className={`report-stat-trend ${trend === 'up' ? 'positive' : 'negative'}`}>
        {change}%
        {trend === 'up' ? <FiTrendingUp className="fi-pl" /> : <FiTrendingDown className="fi-pl" />}
      </div>
    );
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Refresh data
  const handleRefreshData = () => {
    window.location.reload();
  };

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading Analytics Data...</p>
          </div>
        </div>
      )}

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
          <button
            className="action-button secondary"
            onClick={handleRefreshData}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin-animation" : ""} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
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
            <ExportButton
              data={prepareExportData()}
              filename="analytics-report"
              variant="secondary"
              onExportStart={handleExportStart}
              onExportComplete={handleExportComplete}
              onExportError={handleExportError}
            />
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
                      <div className="pie-chart-label">Active Rate</div>
                    </div>
                  </div>
                </div>

                <div className="pie-chart-labels">
                  <div className="pie-chart-label">
                    <span className="pie-label-dot excellent"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Active Users</span>
                      <span className="pie-label-percentage">
                        {analyticsData.overview.totalUsers > 0 ?
                          `${((analyticsData.overview.activeUsers / analyticsData.overview.totalUsers) * 100).toFixed(1)}%` :
                          "0%"
                        }
                        ({formatNumber(analyticsData.overview.activeUsers)})
                      </span>
                    </div>
                  </div>

                  <div className="pie-chart-label">
                    <span className="pie-label-dot good"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">New Users</span>
                      <span className="pie-label-percentage">
                        {analyticsData.overview.totalUsers > 0 ?
                          `${((analyticsData.overview.newUsers / analyticsData.overview.totalUsers) * 100).toFixed(1)}%` :
                          "0%"
                        }
                        ({formatNumber(analyticsData.overview.newUsers)})
                      </span>
                    </div>
                  </div>

                  <div className="pie-chart-label">
                    <span className="pie-label-dot average"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Inactive</span>
                      <span className="pie-label-percentage">
                        {analyticsData.overview.totalUsers > 0 ?
                          `${(((analyticsData.overview.totalUsers - analyticsData.overview.activeUsers) / analyticsData.overview.totalUsers) * 100).toFixed(1)}%` :
                          "0%"
                        }
                      </span>
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
            <ExportButton
              data={analyticsData.traffic.topPages}
              filename="traffic-report"
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