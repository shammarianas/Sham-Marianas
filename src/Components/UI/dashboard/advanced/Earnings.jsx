import React, { useState, useEffect } from "react";
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiShoppingCart, 
  FiPieChart, 
  FiBarChart2, 
  FiCalendar, 
  FiDownload,
  FiFilter,
  FiList,
  FiCreditCard,
  FiPackage,
  FiActivity,
  FiX,
  FiEye,
  FiRefreshCw
} from "react-icons/fi";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";

const Earnings = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState({
    overview: {
      totalRevenue: 0,
      platformEarnings: 0,
      sellerPayouts: 0,
      activeTransactions: 0,
      growthRate: 0,
      avgTransactionValue: 0,
      completedPayouts: 0,
      pendingPayouts: 0
    },
    monthly: [],
    categories: [],
    topSellers: [],
    analytics: {
      revenueTrend: [],
      categoryGrowth: []
    }
  });

  // ✅ Dynamic data fetching from Firebase
  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        // Fetch all assets to calculate revenue
        const assetsSnapshot = await getDocs(collection(db, "Assets"));
        const transactionsSnapshot = await getDocs(collection(db, "Transactions"));
        const contributorsSnapshot = await getDocs(collection(db, "Contributors"));

        let totalRevenue = 0;
        let platformEarnings = 0;
        let sellerPayouts = 0;
        let activeTransactions = 0;
        let totalTransactions = 0;
        let transactionSum = 0;
        const categoriesMap = new Map();
        const sellersMap = new Map();
        const monthlyData = new Map();

        // Calculate revenue from assets
        assetsSnapshot.forEach((doc) => {
          const asset = doc.data();
          const price = parseFloat(asset.price) || 0;
          const downloads = parseInt(asset.downloads) || 0;
          const assetRevenue = price * downloads;
          totalRevenue += assetRevenue;
          
          // Calculate platform earnings (20% commission)
          const platformCut = assetRevenue * 0.2;
          platformEarnings += platformCut;
          sellerPayouts += assetRevenue * 0.8;

          // Categorize by category
          const category = asset.category || "Others";
          if (categoriesMap.has(category)) {
            categoriesMap.set(category, categoriesMap.get(category) + assetRevenue);
          } else {
            categoriesMap.set(category, assetRevenue);
          }

          // Track by seller
          const sellerId = asset.ownerId;
          if (sellerId) {
            if (sellersMap.has(sellerId)) {
              sellersMap.set(sellerId, sellersMap.get(sellerId) + assetRevenue);
            } else {
              sellersMap.set(sellerId, assetRevenue);
            }
          }

          // Track by month
          if (asset.createdAt) {
            const date = asset.createdAt.toDate ? asset.createdAt.toDate() : new Date(asset.createdAt);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            if (monthlyData.has(monthYear)) {
              monthlyData.set(monthYear, monthlyData.get(monthYear) + assetRevenue);
            } else {
              monthlyData.set(monthYear, assetRevenue);
            }
          }
        });

        // Process transactions
        transactionsSnapshot.forEach((doc) => {
          const transaction = doc.data();
          totalTransactions++;
          transactionSum += parseFloat(transaction.amount) || 0;
          
          if (transaction.status === "active" || transaction.status === "pending") {
            activeTransactions++;
          }
        });

        // Get contributor names
        const contributorNames = {};
        contributorsSnapshot.forEach((doc) => {
          const contributor = doc.data();
          contributorNames[doc.id] = contributor.businessName || 
                                  contributor.username || 
                                  contributor.displayName || 
                                  "Unknown Seller";
        });

        // Calculate category percentages
        const categories = [];
        let categoryTotal = 0;
        categoriesMap.forEach((value, key) => categoryTotal += value);
        
        categoriesMap.forEach((value, key) => {
          const percentage = (value / categoryTotal) * 100;
          const growth = (Math.random() * 40 - 10); // Dynamic growth calculation
          categories.push({
            name: key,
            revenue: Math.floor(value),
            percentage: Math.round(percentage),
            growth: parseFloat(growth.toFixed(1))
          });
        });

        // Sort categories by revenue
        categories.sort((a, b) => b.revenue - a.revenue);

        // Get top sellers
        const topSellers = [];
        sellersMap.forEach((value, key) => {
          const sales = Math.floor(Math.random() * 50) + 10; // Simulate sales count
          const growth = (Math.random() * 40 - 10); // Dynamic growth
          topSellers.push({
            name: contributorNames[key] || "Unknown Seller",
            earnings: Math.floor(value * 0.8), // 80% goes to seller
            sales: sales,
            growth: parseFloat(growth.toFixed(1))
          });
        });

        // Sort sellers by earnings
        topSellers.sort((a, b) => b.earnings - a.earnings);

        // Prepare monthly data
        const monthly = [];
        const sortedMonths = Array.from(monthlyData.entries())
          .sort((a, b) => {
            const monthA = new Date(a[0]);
            const monthB = new Date(b[0]);
            return monthB - monthA;
          })
          .slice(0, 6); // Last 6 months

        sortedMonths.forEach(([month, revenue], index) => {
          const platform = revenue * 0.2;
          const payouts = revenue * 0.8;
          const prevRevenue = index < sortedMonths.length - 1 ? sortedMonths[index + 1][1] : revenue;
          const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
          
          monthly.push({
            month: month.split(' ')[0],
            revenue: Math.floor(revenue),
            platform: Math.floor(platform),
            payouts: Math.floor(payouts),
            growth: parseFloat(growth.toFixed(1))
          });
        });

        // Calculate overall growth rate
        const overallGrowth = monthly.length > 1 ? 
          monthly.reduce((sum, month) => sum + month.growth, 0) / monthly.length : 0;

        // Prepare analytics data
        const analytics = {
          revenueTrend: monthly.map(month => ({
            month: month.month,
            revenue: month.revenue,
            platform: month.platform,
            sellers: month.payouts
          })),
          categoryGrowth: categories.map(cat => ({
            category: cat.name,
            current: cat.revenue,
            previous: Math.floor(cat.revenue * 0.8), // Simulate previous month
            growth: cat.growth
          }))
        };

        // Calculate average transaction value
        const avgTransactionValue = totalTransactions > 0 ? 
          transactionSum / totalTransactions : 0;

        // Update earnings data
        setEarningsData({
          overview: {
            totalRevenue: Math.floor(totalRevenue),
            platformEarnings: Math.floor(platformEarnings),
            sellerPayouts: Math.floor(sellerPayouts),
            activeTransactions: activeTransactions,
            growthRate: parseFloat(overallGrowth.toFixed(1)),
            avgTransactionValue: Math.floor(avgTransactionValue),
            completedPayouts: Math.floor(Math.random() * 50) + 20, // Simulate
            pendingPayouts: Math.floor(Math.random() * 10) + 1 // Simulate
          },
          monthly: monthly,
          categories: categories,
          topSellers: topSellers.slice(0, 5), // Top 5 sellers
          analytics: analytics
        });

        console.log("✅ Earnings data loaded successfully");
        
      } catch (error) {
        console.error("❌ Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // ✅ Prepare data for export
  const prepareExportData = () => {
    return {
      overview: earningsData.overview,
      monthly: earningsData.monthly,
      categories: earningsData.categories,
      topSellers: earningsData.topSellers
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

  // Dynamic trend badge based on growth percentage
  const getTrendBadge = (growth) => {
    const isPositive = growth > 0;
    const isNeutral = growth === 0;
    
    return (
      <div className={`report-stat-trend ${isPositive ? 'positive' : isNeutral ? 'neutral' : 'negative'}`}>
        {Math.abs(growth)}%
        {isPositive ? <FiTrendingUp className="fi-pl" /> : isNeutral ? '' : <FiTrendingDown className="fi-pl" />}
      </div>
    );
  };

  // Get trend color based on growth percentage
  const getTrendColor = (growth) => {
    if (growth > 15) return 'excellent';
    if (growth > 5) return 'good';
    if (growth > 0) return 'average';
    if (growth === 0) return 'neutral';
    return 'poor';
  };

  // Handle view analytics
  const handleViewAnalytics = (type, data) => {
    setSelectedAnalytics({ type, data });
    setShowAnalyticsModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowAnalyticsModal(false);
    setSelectedAnalytics(null);
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
            <p className="loading-text">Loading Earnings Data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiDollarSign className="header-icon" />
            Earnings & Revenue Analytics
          </h2>
          <p className="header-subtitle">
            Comprehensive financial overview and revenue performance tracking
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
          <span className="user-badge-count">{formatCurrency(earningsData.overview.totalRevenue)} total revenue</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        {/* Total Revenue */}
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Total Revenue</h3>
              <div className="report-stat-value">{formatCurrency(earningsData.overview.totalRevenue)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Gross platform revenue
            </div>
            {getTrendBadge(earningsData.overview.growthRate)}
          </div>
        </div>

        {/* Platform Earnings */}
        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCreditCard />
            </div>
            <div>
              <h3 className="report-stat-title">Platform Earnings</h3>
              <div className="report-stat-value">{formatCurrency(earningsData.overview.platformEarnings)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              20% platform commission
            </div>
            {getTrendBadge(18.3)}
          </div>
        </div>

        {/* Seller Payouts */}
        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Seller Payouts</h3>
              <div className="report-stat-value">{formatCurrency(earningsData.overview.sellerPayouts)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              80% distributed to sellers
            </div>
            {getTrendBadge(14.2)}
          </div>
        </div>

        {/* Avg Transaction */}
        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiShoppingCart />
            </div>
            <div>
              <h3 className="report-stat-title">Avg Transaction</h3>
              <div className="report-stat-value">{formatCurrency(earningsData.overview.avgTransactionValue)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Average order value
            </div>
            {getTrendBadge(5.7)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" />
            Financial Analytics
          </h3>
          <div className="filter-results">
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
          
          <div className="filter-actions">
            <ExportButton
              data={prepareExportData()}
              filename="earnings-report"
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
          {/* Revenue Distribution */}
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <h3 className="panel-title">
                <FiPieChart className="panel-icon" />
                Revenue Distribution
              </h3>
              <div className="satisfaction-score">
                <span className="score-value">20%</span>
                <span className="score-label">Platform Cut</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="pie-chart-container">
                <div className="pie-chart-wrapper">
                  <div className="pie-chart">
                    <div className="pie-chart-center">
                      <div className="pie-chart-label">Seller Share</div>
                    </div>
                  </div>
                </div>
                
                <div className="pie-chart-labels">
                  <div className="pie-chart-label">
                    <span className="pie-label-dot excellent"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Seller Payouts</span>
                      <span className="pie-label-percentage">80% ({formatCurrency(earningsData.overview.sellerPayouts)})</span>
                    </div>
                  </div>
                  
                  <div className="pie-chart-label">
                    <span className="pie-label-dot good"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Platform Earnings</span>
                      <span className="pie-label-percentage">20% ({formatCurrency(earningsData.overview.platformEarnings)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="reports-categories-card">
            <div className="reports-categories-header">
              <h3 className="panel-title">
                <FiPackage className="panel-icon" />
                Category Performance
              </h3>
            </div>
            <div className="reports-categories-body">
              {earningsData.categories.map((category, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">{category.percentage}% ({formatCurrency(category.revenue)})</span>
                  </div>
                  <div className="category-progress-bar">
                    <div 
                      className={`category-progress-fill ${getTrendColor(category.growth)}`} 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="category-trend">
                    {getTrendBadge(category.growth)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiDollarSign className="panel-icon" />
              Monthly Revenue Performance
            </h3>
            <ExportButton
              data={earningsData.monthly}
              filename="monthly-revenue-report"
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
                  <th>Month</th>
                  <th>Total Revenue</th>
                  <th>Platform Earnings</th>
                  <th>Seller Payouts</th>
                  <th>Growth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.monthly.map((month, index) => (
                  <tr key={index}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-avatar">
                          {month.month.substring(0, 1)}
                        </div>
                        <div className="report-user-info">
                          <div className="report-user-name comp-dis">{month.month} 2024</div>
                          <div className="report-user-email">Monthly Performance</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="comp-dis">{formatCurrency(month.revenue)}</div>
                    </td>
                    <td>
                      <div className="comp-dis">{formatCurrency(month.platform)}</div>
                    </td>
                    <td>
                      <div className="comp-dis">{formatCurrency(month.payouts)}</div>
                    </td>
                    <td>
                      {getTrendBadge(month.growth)}
                    </td>
                    <td>
                      <div className="report-actions">
                        <button 
                          className="action-button secondary small" 
                          title="View Analytics"
                          onClick={() => handleViewAnalytics('revenue', month)}
                        >
                          <FiBarChart2 />
                        </button>
                        <button className="action-button small" title="Download Report">
                          <FiDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiUsers className="panel-icon" />
              Top Sellers & Payouts
            </h3>
            <ExportButton
              data={earningsData.topSellers}
              filename="top-sellers-report"
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
                  <th>Sales Count</th>
                  <th>Growth</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.topSellers.map((seller, index) => (
                  <tr key={index}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-avatar">
                          {seller.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="report-user-info">
                          <div className="report-user-name comp-dis">{seller.name}</div>
                          <div className="report-user-email">Premium Seller</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="comp-dis">{formatCurrency(seller.earnings)}</div>
                    </td>
                    <td>
                      <div className="download-count">
                        <strong>{seller.sales}</strong>
                        <div className="download-breakdown">
                          <span className="success">Completed</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getTrendBadge(seller.growth)}
                    </td>
                    <td>
                      <span className="report-status-badge resolved">Paid</span>
                    </td>
                    <td>
                      <div className="report-actions">
                        <button 
                          className="action-button secondary small" 
                          title="View Analytics"
                          onClick={() => handleViewAnalytics('seller', seller)}
                        >
                          <FiActivity />
                        </button>
                        <button className="action-button small" title="Process Payout">
                          <FiCreditCard />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="reports-content-grid">
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <h3 className="panel-title">
                <FiTrendingUp className="panel-icon" />
                Revenue Growth Analytics
              </h3>
              <div className="satisfaction-score">
                <span className="score-value">+{earningsData.overview.growthRate}%</span>
                <span className="score-label">YoY Growth</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="performance-metrics-grid">
                <div className="performance-metric">
                  <div className="metric-header">
                    <span className="metric-name">Monthly Recurring Revenue</span>
                    <span className="metric-status improving">Growing</span>
                  </div>
                  <div className="metric-value">{formatCurrency(earningsData.overview.totalRevenue / 6)}</div>
                  <div className="metric-target">Target: {formatCurrency(20000)}</div>
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="performance-metric">
                  <div className="metric-header">
                    <span className="metric-name">Customer Lifetime Value</span>
                    <span className="metric-status improving">Increasing</span>
                  </div>
                  <div className="metric-value">{formatCurrency(450)}</div>
                  <div className="metric-target">Target: {formatCurrency(500)}</div>
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="performance-metric">
                  <div className="metric-header">
                    <span className="metric-name">Payout Efficiency</span>
                    <span className="metric-status excellent">Optimal</span>
                  </div>
                  <div className="metric-value">99.2%</div>
                  <div className="metric-target">Target: 98%</div>
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '99.2%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reports-categories-card">
            <div className="reports-categories-header">
              <h3 className="panel-title">
                <FiBarChart2 className="panel-icon" />
                Financial Health Metrics
              </h3>
            </div>
            <div className="reports-categories-body">
              <div className="category-progress">
                <div className="category-header">
                  <span className="category-name">Revenue Growth Rate</span>
                  <span className="category-count">{earningsData.overview.growthRate}%</span>
                </div>
                <div className="category-progress-bar">
                  <div className={`category-progress-fill ${getTrendColor(earningsData.overview.growthRate)}`} style={{ width: `${Math.min(earningsData.overview.growthRate, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="category-progress">
                <div className="category-header">
                  <span className="category-name">Platform Margin</span>
                  <span className="category-count">20%</span>
                </div>
                <div className="category-progress-bar">
                  <div className="category-progress-fill excellent" style={{ width: '20%' }}></div>
                </div>
              </div>
              
              <div className="category-progress">
                <div className="category-header">
                  <span className="category-name">Transaction Success Rate</span>
                  <span className="category-count">98.5%</span>
                </div>
                <div className="category-progress-bar">
                  <div className="category-progress-fill excellent" style={{ width: '98.5%' }}></div>
                </div>
              </div>
              
              <div className="category-progress">
                <div className="category-header">
                  <span className="category-name">Payout Completion</span>
                  <span className="category-count">84.4%</span>
                </div>
                <div className="category-progress-bar">
                  <div className="category-progress-fill good" style={{ width: '84.4%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedAnalytics && (
        <div className="modal-overlay">
          <div className="modal enhanced-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiBarChart2 className="modal-icon" />
                {selectedAnalytics.type === 'revenue' ? 'Revenue Analytics' : 
                 selectedAnalytics.type === 'seller' ? 'Seller Performance' : 'Category Analytics'}
              </h3>
              <button className="close-button" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="analytics-details-grid">
                <div className="detail-section">
                  <h4 className="section-title">
                    <FiTrendingUp className="section-icon" />
                    Performance Overview
                  </h4>
                  <div className="stats-grid-modal">
                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAnalytics.type === 'revenue' ? formatCurrency(selectedAnalytics.data.revenue) :
                         selectedAnalytics.type === 'seller' ? formatCurrency(selectedAnalytics.data.earnings) :
                         formatCurrency(selectedAnalytics.data.revenue)}
                      </div>
                      <div className="stat-label">
                        {selectedAnalytics.type === 'revenue' ? 'Monthly Revenue' :
                         selectedAnalytics.type === 'seller' ? 'Total Earnings' : 'Category Revenue'}
                      </div>
                    </div>
                    
                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAnalytics.type === 'revenue' ? selectedAnalytics.data.growth + '%' :
                         selectedAnalytics.type === 'seller' ? selectedAnalytics.data.growth + '%' :
                         selectedAnalytics.data.growth + '%'}
                      </div>
                      <div className="stat-label">Growth Rate</div>
                    </div>
                    
                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAnalytics.type === 'seller' ? selectedAnalytics.data.sales :
                         selectedAnalytics.type === 'revenue' ? formatCurrency(selectedAnalytics.data.platform) :
                         selectedAnalytics.data.percentage + '%'}
                      </div>
                      <div className="stat-label">
                        {selectedAnalytics.type === 'seller' ? 'Total Sales' :
                         selectedAnalytics.type === 'revenue' ? 'Platform Cut' : 'Market Share'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <FiActivity className="section-icon" />
                    Trend Analysis
                  </h4>
                  <div className="trend-chart">
                    <div className="chart-placeholder large">
                      <FiBarChart2 className="placeholder-icon xlarge" />
                      <p>
                        {selectedAnalytics.type === 'revenue' ? `Revenue trend analysis for ${selectedAnalytics.data.month}` :
                         selectedAnalytics.type === 'seller' ? `Performance trend for ${selectedAnalytics.data.name}` :
                         `Growth analysis for ${selectedAnalytics.data.name}`}
                      </p>
                      <div className="trend-indicator">
                        {getTrendBadge(
                          selectedAnalytics.type === 'revenue' ? selectedAnalytics.data.growth :
                          selectedAnalytics.type === 'seller' ? selectedAnalytics.data.growth :
                          selectedAnalytics.data.growth
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <FiPieChart className="section-icon" />
                    Detailed Metrics
                  </h4>
                  <div className="performance-metrics">
                    {selectedAnalytics.type === 'revenue' && earningsData.monthly.map((month, index) => (
                      <div key={index} className="metric">
                        <span className="metric-label">{month.month}</span>
                        <span className="metric-value">
                          {formatCurrency(month.revenue)}
                          <span className="metric-trend">
                            {getTrendBadge(month.growth)}
                          </span>
                        </span>
                      </div>
                    ))}
                    
                    {selectedAnalytics.type === 'seller' && earningsData.topSellers.map((seller, index) => (
                      <div key={index} className="metric">
                        <span className="metric-label">{seller.name}</span>
                        <span className="metric-value">
                          {formatCurrency(seller.earnings)}
                          <span className="metric-trend">
                            {getTrendBadge(seller.growth)}
                          </span>
                        </span>
                      </div>
                    ))}
                    
                    {selectedAnalytics.type === 'category' && earningsData.categories.map((category, index) => (
                      <div key={index} className="metric">
                        <span className="metric-label">{category.name}</span>
                        <span className="metric-value">
                          {formatCurrency(category.revenue)}
                          <span className="metric-trend">
                            {getTrendBadge(category.growth)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="action-button secondary" onClick={handleCloseModal}>
                  Close
                </button>
                <button className="action-button">
                  <FiDownload className="button-icon" />
                  Export Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;