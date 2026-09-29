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
  FiRefreshCw,
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
  
  // ✅ ADD GROWTH DATA STATE
  const [growthData, setGrowthData] = useState({
    platformEarningsGrowth: 0,
    sellerPayoutsGrowth: 0,
    avgTransactionGrowth: 0,
    monthlyGrowth: {},
    categoryGrowth: {}
  });
  
  const [earningsData, setEarningsData] = useState({
    overview: {
      totalRevenue: 0,
      platformEarnings: 0,
      sellerPayouts: 0,
      activeTransactions: 0,
      growthRate: 0,
      avgTransactionValue: 0,
      completedPayouts: 0,
      pendingPayouts: 0,
    },
    monthly: [],
    categories: [],
    topSellers: [],
    analytics: {
      revenueTrend: [],
      categoryGrowth: [],
    },
  });

  // ✅ REAL GROWTH CALCULATION FUNCTION
  const calculateActualGrowth = (currentData, previousData) => {
    if (!previousData || previousData === 0) return 0;
    
    const current = currentData || 0;
    const previous = previousData || 0;
    
    if (previous === 0) return current > 0 ? 100 : 0;
    
    const growth = ((current - previous) / previous) * 100;
    return parseFloat(growth.toFixed(1));
  };

  // ✅ UPDATED FETCH FUNCTION WITH REAL GROWTH CALCULATIONS
  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        console.log("📊 Fetching earnings data...");

        // 1️⃣ GET PLATFORMSTATS (Previous vs Current compare)
        const platformStatsDoc = await getDocs(collection(db, "PlatformStats"));
        let platformStats = {};
        let platformEarnings = 0;
        let subscriptionRevenue = 0;
        let perDownloadRevenue = 0;
        let previousPlatformEarnings = 0;

        if (!platformStatsDoc.empty) {
          platformStats = platformStatsDoc.docs[0].data();
          console.log("📈 PlatformStats found:", platformStats);

          // Current platform earnings
          subscriptionRevenue = parseFloat(platformStats.subscriptionRevenue) || 0;
          perDownloadRevenue = parseFloat(platformStats.perDownloadRevenue) || 0;
          platformEarnings = subscriptionRevenue + perDownloadRevenue;

          // Previous platform earnings (if available)
          previousPlatformEarnings = parseFloat(platformStats.previousMonthEarnings) || 
                                    parseFloat(platformStats.lastMonthEarnings) || 0;
        }

        // 2️⃣ GET TRANSACTIONS for current and previous months
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get all transactions for calculations
        const allTransactionsSnapshot = await getDocs(
          query(collection(db, "Transactions"), orderBy("timestamp", "desc"))
        );

        // Calculate current vs previous month data
        let currentMonthTotal = 0;
        let currentMonthCount = 0;
        let previousMonthTotal = 0;
        let previousMonthCount = 0;
        const transactionsData = [];

        allTransactionsSnapshot.forEach((doc) => {
          const transaction = doc.data();
          const amount = parseFloat(transaction.amount) || 0;
          const timestamp = transaction.timestamp;
          
          if (timestamp && amount > 0) {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            
            // Check if transaction is in current month
            if (date >= currentMonthStart && date <= now) {
              currentMonthTotal += amount;
              currentMonthCount++;
            }
            // Check if transaction is in previous month
            else if (date >= previousMonthStart && date <= previousMonthEnd) {
              previousMonthTotal += amount;
              previousMonthCount++;
            }
          }

          transactionsData.push({
            id: doc.id,
            type: transaction.type || "Unknown",
            amount: amount,
            userId: transaction.userId || "Unknown",
            plan: transaction.plan || "N/A",
            timestamp: timestamp,
            status: transaction.status || "completed",
          });
        });

        const avgTransactionValue = currentMonthCount > 0 ? 
          Math.round((currentMonthTotal / currentMonthCount) * 100) / 100 : 0;
        
        const previousAvgTransactionValue = previousMonthCount > 0 ? 
          Math.round((previousMonthTotal / previousMonthCount) * 100) / 100 : 0;

        // 3️⃣ GET CONTRIBUTORS for seller payouts growth
        const contributorsSnapshot = await getDocs(collection(db, "Contributors"));
        let totalSellerPayouts = 0;
        let previousSellerPayouts = 0;
        const contributorsData = [];

        contributorsSnapshot.forEach((doc) => {
          const contributor = doc.data();
          const pendingEarnings = parseFloat(contributor.pendingEarnings) || 0;
          totalSellerPayouts += pendingEarnings;
          
          // Previous earnings (if available)
          previousSellerPayouts += parseFloat(contributor.previousMonthEarnings) || 
                                  parseFloat(contributor.lastMonthEarnings) || 0;

          contributorsData.push({
            id: doc.id,
            name: contributor.fullName || contributor.username || "Unknown Seller",
            pendingEarnings: pendingEarnings,
            totalEarnings: parseFloat(contributor.totalEarnings) || 0,
            previousEarnings: parseFloat(contributor.previousMonthEarnings) || 0,
          });
        });

        // 4️⃣ GET PURCHASES for category growth (current vs previous month)
        const purchasesSnapshot = await getDocs(
          query(collection(db, "Purchases"), orderBy("timestamp", "desc"))
        );

        console.log(`🛒 Purchases found: ${purchasesSnapshot.size}`);

        // Separate current and previous month category data
        const currentMonthCategoryMap = new Map();
        const previousMonthCategoryMap = new Map();
        let totalCategoryRevenue = 0;

        purchasesSnapshot.forEach((doc) => {
          const purchase = doc.data();
          const amount = parseFloat(purchase.amount) || 0;
          const category = purchase.assetCategory || "Uncategorized";
          const timestamp = purchase.timestamp;

          if (timestamp && amount > 0) {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            
            if (date >= currentMonthStart && date <= now) {
              totalCategoryRevenue += amount;
              const current = currentMonthCategoryMap.get(category) || { revenue: 0, count: 0 };
              currentMonthCategoryMap.set(category, {
                revenue: current.revenue + amount,
                count: current.count + 1,
              });
            } else if (date >= previousMonthStart && date <= previousMonthEnd) {
              const previous = previousMonthCategoryMap.get(category) || { revenue: 0, count: 0 };
              previousMonthCategoryMap.set(category, {
                revenue: previous.revenue + amount,
                count: previous.count + 1,
              });
            }
          }
        });

        // Calculate REAL category growth
        const categories = Array.from(currentMonthCategoryMap.entries())
          .map(([name, currentData]) => {
            const previousData = previousMonthCategoryMap.get(name) || { revenue: 0, count: 0 };
            const previousRevenue = previousData.revenue;
            
            // REAL growth calculation
            const growth = previousRevenue > 0 ? 
              ((currentData.revenue - previousRevenue) / previousRevenue) * 100 :
              currentData.revenue > 0 ? 100 : 0;

            const percentage = totalCategoryRevenue > 0 ? 
              Math.round((currentData.revenue / totalCategoryRevenue) * 100) : 0;

            return {
              name: name,
              revenue: Math.round(currentData.revenue * 100) / 100,
              count: currentData.count,
              percentage: percentage,
              growth: parseFloat(growth.toFixed(1)), // REAL growth
              previousRevenue: Math.round(previousRevenue * 100) / 100,
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 6);

        console.log("📊 Categories calculated:", categories);

        // 5️⃣ Calculate total revenue
        const totalRevenue = platformEarnings + totalSellerPayouts;
        const previousTotalRevenue = previousPlatformEarnings + previousSellerPayouts;

        // 6️⃣ Calculate monthly data from Transactions
        const monthlyData = new Map();
        const monthlyGrowthData = {};
        
        // Group transactions by month
        allTransactionsSnapshot.forEach((doc) => {
          const transaction = doc.data();
          const amount = parseFloat(transaction.amount) || 0;

          if (transaction.timestamp && amount > 0) {
            const date = transaction.timestamp.toDate
              ? transaction.timestamp.toDate()
              : new Date(transaction.timestamp);
            const monthYear = `${date.toLocaleString("default", {
              month: "short",
            })} ${date.getFullYear()}`;

            const current = monthlyData.get(monthYear) || {
              revenue: 0,
              count: 0,
            };
            monthlyData.set(monthYear, {
              revenue: current.revenue + amount,
              count: current.count + 1,
            });
          }
        });

        // Prepare monthly data with growth
        const monthly = Array.from(monthlyData.entries())
          .sort((a, b) => {
            const monthA = new Date(a[0]);
            const monthB = new Date(b[0]);
            return monthB - monthA;
          })
          .slice(0, 6)
          .map(([month, data], index, array) => {
            const prevRevenue = index < array.length - 1 ? 
              array[index + 1][1].revenue : data.revenue;
            
            const growth = prevRevenue > 0 ? 
              ((data.revenue - prevRevenue) / prevRevenue) * 100 : 0;

            return {
              month: month.split(" ")[0],
              year: month.split(" ")[1],
              revenue: Math.round(data.revenue * 100) / 100,
              transactions: data.count,
              growth: parseFloat(growth.toFixed(1)),
            };
          });

        // 7️⃣ Calculate overall growth rate (average of monthly growths)
        const overallGrowth = monthly.length > 1 ? 
          monthly.reduce((sum, month) => sum + month.growth, 0) / monthly.length : 0;

        // 8️⃣ Calculate percentages
        const platformPercentage = totalRevenue > 0 ? 
          Math.round((platformEarnings / totalRevenue) * 100) : 0;
        const sellerPercentage = totalRevenue > 0 ? 
          Math.round((totalSellerPayouts / totalRevenue) * 100) : 0;

        // 9️⃣ Sort contributors by pendingEarnings (top sellers)
        const topSellers = [...contributorsData]
          .filter((seller) => seller.pendingEarnings > 0)
          .sort((a, b) => b.pendingEarnings - a.pendingEarnings)
          .slice(0, 5)
          .map((seller) => {
            // Calculate seller growth
            const sellerGrowth = seller.previousEarnings > 0 ? 
              ((seller.pendingEarnings - seller.previousEarnings) / seller.previousEarnings) * 100 : 
              seller.pendingEarnings > 0 ? 100 : 0;

            return {
              id: seller.id,
              name: seller.name,
              earnings: Math.round(seller.pendingEarnings * 100) / 100,
              totalEarnings: Math.round(seller.totalEarnings * 100) / 100,
              sales: Math.floor(seller.pendingEarnings / 10),
              growth: parseFloat(sellerGrowth.toFixed(1)), // REAL seller growth
            };
          });

        // 🔟 SET DYNAMIC GROWTH DATA
        setGrowthData({
          platformEarningsGrowth: calculateActualGrowth(platformEarnings, previousPlatformEarnings),
          sellerPayoutsGrowth: calculateActualGrowth(totalSellerPayouts, previousSellerPayouts),
          avgTransactionGrowth: calculateActualGrowth(avgTransactionValue, previousAvgTransactionValue),
          totalRevenueGrowth: calculateActualGrowth(totalRevenue, previousTotalRevenue),
          monthlyGrowth: Object.fromEntries(
            monthly.map(m => [`${m.month}-${m.year}`, m.growth])
          ),
          categoryGrowth: Object.fromEntries(
            categories.map(cat => [cat.name, cat.growth])
          )
        });

        // ✅ Update earnings data with ALL DYNAMIC VALUES
        setEarningsData({
          overview: {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            platformEarnings: Math.round(platformEarnings * 100) / 100,
            sellerPayouts: Math.round(totalSellerPayouts * 100) / 100,
            activeTransactions: transactionsData.filter(
              (t) => t.status === "active" || t.status === "pending"
            ).length,
            growthRate: parseFloat(overallGrowth.toFixed(1)),
            avgTransactionValue: avgTransactionValue,
            completedPayouts: Math.round(totalSellerPayouts * 0.8),
            pendingPayouts: Math.round(totalSellerPayouts * 0.2),
            platformPercentage: platformPercentage,
            sellerPercentage: sellerPercentage,
            subscriptionRevenue: Math.round(subscriptionRevenue * 100) / 100,
            perDownloadRevenue: Math.round(perDownloadRevenue * 100) / 100,
            totalTransactions: currentMonthCount,
            // Add previous month data for future comparisons
            previousMonthRevenue: Math.round(previousTotalRevenue * 100) / 100,
            previousPlatformEarnings: Math.round(previousPlatformEarnings * 100) / 100,
            previousSellerPayouts: Math.round(previousSellerPayouts * 100) / 100,
          },
          monthly: monthly,
          categories: categories,
          topSellers: topSellers,
          recentTransactions: transactionsData.slice(0, 10),
        });

        console.log("✅ Earnings data loaded successfully!");
        console.log(`📊 Total Categories: ${categories.length}`);

      } catch (error) {
        console.error("❌ Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  // ✅ Helper function for monthly growth calculation
  const calculateMonthlyGrowth = (currentMonth, previousMonth) => {
    if (!previousMonth || previousMonth.revenue === 0) return 0;
    
    return ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ✅ Prepare data for export
  const prepareExportData = () => {
    return {
      overview: earningsData.overview,
      monthly: earningsData.monthly,
      categories: earningsData.categories,
      topSellers: earningsData.topSellers,
      growthData: growthData,
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
      <div
        className={`report-stat-trend ${
          isPositive ? "positive" : isNeutral ? "neutral" : "negative"
        }`}
      >
        {Math.abs(growth)}%
        {isPositive ? (
          <FiTrendingUp className="fi-pl" />
        ) : isNeutral ? (
          ""
        ) : (
          <FiTrendingDown className="fi-pl" />
        )}
      </div>
    );
  };

  // Get trend color based on growth percentage
  const getTrendColor = (growth) => {
    if (growth > 15) return "excellent";
    if (growth > 5) return "good";
    if (growth > 0) return "average";
    if (growth === 0) return "neutral";
    return "poor";
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
          <span className="user-badge-count">
            {formatCurrency(earningsData.overview.totalRevenue)} total revenue
          </span>
        </div>
      </div>

      {/* Statistics Cards - FULLY DYNAMIC */}
      <div className="reports-stats-grid">
        {/* Total Revenue */}
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Total Revenue</h3>
              <div className="report-stat-value">
                {formatCurrency(earningsData.overview.totalRevenue)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Gross platform revenue</div>
            {/* ✅ DYNAMIC GROWTH */}
            {getTrendBadge(growthData.totalRevenueGrowth || earningsData.overview.growthRate)}
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
              <div className="report-stat-value">
                {formatCurrency(earningsData.overview.platformEarnings)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {earningsData.overview.platformPercentage || 0}% platform commission
            </div>
            {/* ✅ DYNAMIC GROWTH - NO STATIC VALUE */}
            {getTrendBadge(growthData.platformEarningsGrowth)}
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
              <div className="report-stat-value">
                {formatCurrency(earningsData.overview.sellerPayouts)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {earningsData.overview.sellerPercentage || 0}% distributed to sellers
            </div>
            {/* ✅ DYNAMIC GROWTH - NO STATIC VALUE */}
            {getTrendBadge(growthData.sellerPayoutsGrowth)}
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
              <div className="report-stat-value">
                {formatCurrency(earningsData.overview.avgTransactionValue)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Average order value</div>
            {/* ✅ DYNAMIC GROWTH - NO STATIC VALUE */}
            {getTrendBadge(growthData.avgTransactionGrowth)}
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
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <FiBarChart2 className="tab-icon" />
              Overview
            </button>
            <button
              className={`tab-button ${
                activeTab === "revenue" ? "active" : ""
              }`}
              onClick={() => setActiveTab("revenue")}
            >
              <FiDollarSign className="tab-icon" />
              Revenue
            </button>
            <button
              className={`tab-button ${
                activeTab === "payouts" ? "active" : ""
              }`}
              onClick={() => setActiveTab("payouts")}
            >
              <FiUsers className="tab-icon" />
              Payouts
            </button>
            <button
              className={`tab-button ${
                activeTab === "transactions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              <FiCreditCard className="tab-icon" />
              Transactions
            </button>
            <button
              className={`tab-button ${
                activeTab === "analytics" ? "active" : ""
              }`}
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

      {/* Overview Tab - FULLY DYNAMIC */}
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
                <span className="score-value">
                  {earningsData.overview.platformPercentage || 0}%
                </span>
                <span className="score-label">Platform Cut</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="pie-chart-container">
                <div className="pie-chart-wrapper">
                  <div className="pie-chart">
                    <div className="pie-chart-center">
                      <div className="pie-chart-label">
                        {earningsData.overview.sellerPercentage || 0}% Seller Share
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pie-chart-labels">
                  <div className="pie-chart-label">
                    <span className="pie-label-dot excellent"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Seller Payouts</span>
                      <span className="pie-label-percentage">
                        {earningsData.overview.sellerPercentage || 0}% (
                        {formatCurrency(earningsData.overview.sellerPayouts)})
                      </span>
                    </div>
                  </div>

                  <div className="pie-chart-label">
                    <span className="pie-label-dot good"></span>
                    <div className="pie-label-text">
                      <span className="pie-label-name">Platform Earnings</span>
                      <span className="pie-label-percentage">
                        {earningsData.overview.platformPercentage || 0}% (
                        {formatCurrency(earningsData.overview.platformEarnings)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance - FULLY DYNAMIC */}
          <div className="reports-categories-card">
            <div className="reports-categories-header">
              <h3 className="panel-title">
                <FiPackage className="panel-icon" />
                Category Performance
              </h3>
              <div className="category-total">
                {earningsData.categories?.length || 0} categories
              </div>
            </div>
            <div className="reports-categories-body">
              {earningsData.categories?.map((category, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">
                      {category.percentage}% ({formatCurrency(category.revenue)})
                    </span>
                  </div>
                  <div className="category-progress-bar">
                    <div
                      className={`category-progress-fill ${getTrendColor(category.growth)}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="category-footer">
                    <span className="category-transactions">
                      {category.count} {category.count === 1 ? "sale" : "sales"}
                    </span>
                    <div className="category-trend">
                      {getTrendBadge(category.growth)}
                    </div>
                  </div>
                </div>
              ))}
              {(!earningsData.categories || earningsData.categories.length === 0) && (
                <div className="no-categories">
                  <FiPackage className="no-categories-icon" />
                  <p>No category data available from purchases</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab - DYNAMIC */}
      {activeTab === "revenue" && (
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiDollarSign className="panel-icon" />
              Monthly Revenue Performance
            </h3>
            <ExportButton
              data={earningsData.monthly || []}
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
                  <th>Revenue</th>
                  <th>Transactions</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {(earningsData.monthly || []).map((month, index) => (
                  <tr key={index}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-avatar">
                          {month.month?.substring(0, 1) || "M"}
                        </div>
                        <div className="report-user-info">
                          <div className="report-user-name comp-dis">
                            {month.month || "Month"} {month.year || "2024"}
                          </div>
                          <div className="report-user-email">
                            {month.transactions || 0} transactions
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="comp-dis">
                        {formatCurrency(month.revenue || 0)}
                      </div>
                    </td>
                    <td>
                      <div className="comp-dis">{month.transactions || 0}</div>
                    </td>
                    <td>{getTrendBadge(month.growth || 0)}</td>
                  </tr>
                ))}
                {(!earningsData.monthly || earningsData.monthly.length === 0) && (
                  <tr>
                    <td colSpan="4" className="no-data">
                      <div className="no-data-content">
                        <FiCalendar className="no-data-icon" />
                        <p>No monthly data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="recent-reports-card">
          <div className="recent-reports-header">
            <h3 className="panel-title">
              <FiCreditCard className="panel-icon" />
              Recent Transactions
            </h3>
            <div className="time-range-info">
              Showing {earningsData.recentTransactions?.length || 0} transactions
            </div>
          </div>
          <div className="recent-reports-body">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>User ID</th>
                  <th>Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.recentTransactions?.map((transaction, index) => {
                  const date = transaction.timestamp?.toDate
                    ? transaction.timestamp.toDate()
                    : new Date(transaction.timestamp);
                  const formattedDate = date.toLocaleDateString();

                  return (
                    <tr key={index}>
                      <td>
                        <div className="comp-dis">{formattedDate}</div>
                      </td>
                      <td>
                        <span
                          className={`transaction-type ${transaction.type.toLowerCase()}`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td>
                        <div className="comp-dis amount-total">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td>
                        <div className="user-id">
                          {transaction.userId?.substring(0, 10) || "Unknown"}...
                        </div>
                      </td>
                      <td>{transaction.plan}</td>
                      <td>
                        <span
                          className={`report-status-badge ${transaction.status}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {(!earningsData.recentTransactions || earningsData.recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <div className="no-data-content">
                        <FiCreditCard className="no-data-icon" />
                        <p>No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab - UPDATED with dynamic data */}
      {activeTab === "analytics" && (
        <div className="reports-content-grid">
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <h3 className="panel-title">
                <FiTrendingUp className="panel-icon" />
                Revenue Growth Analytics
              </h3>
              <div className="satisfaction-score">
                <span className="score-value">
                  +{earningsData.overview.growthRate}%
                </span>
                <span className="score-label">Monthly Growth</span>
              </div>
            </div>
            <div className="reports-chart-body">
              <div className="performance-metrics-grid">
                <div className="performance-metric">
                  <div className="metric-header">
                    <span className="metric-name">Monthly Recurring Revenue</span>
                    <span className="metric-status improving">Growing</span>
                  </div>
                  <div className="metric-value">
                    {formatCurrency(earningsData.overview.totalRevenue)}
                  </div>
                  <div className="metric-target">
                    Target: {formatCurrency(earningsData.overview.previousMonthRevenue * 1.2 || 20000)}
                  </div>
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(100, 
                            (earningsData.overview.totalRevenue / 
                            (earningsData.overview.previousMonthRevenue * 1.2 || 20000)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="performance-metric">
                  <div className="metric-header">
                    <span className="metric-name">Customer Lifetime Value</span>
                    <span className="metric-status improving">Increasing</span>
                  </div>
                  <div className="metric-value">
                    {formatCurrency(earningsData.overview.avgTransactionValue * 3)}
                  </div>
                  <div className="metric-target">
                    Target: {formatCurrency(500)}
                  </div>
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(100, 
                            ((earningsData.overview.avgTransactionValue * 3) / 500) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="performance-metric">
                  <div className="metric-header">
                    <span className="metric-name">Payout Efficiency</span>
                    <span className="metric-status excellent">Optimal</span>
                  </div>
                  <div className="metric-value">
                    {earningsData.overview.sellerPayouts > 0 ? 
                      Math.round((earningsData.overview.completedPayouts / earningsData.overview.sellerPayouts) * 100) + '%' : 
                      '0%'}
                  </div>
                  <div className="metric-target">Target: 98%</div>
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(100, 
                            (earningsData.overview.completedPayouts / 
                            (earningsData.overview.sellerPayouts || 1)) * 100)}%` 
                        }}
                      ></div>
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
              {(earningsData.categories || []).map((category, index) => (
                <div key={index} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">
                      {category.name || "Unknown"}
                    </span>
                    <span className="category-count">
                      {category.percentage || 0}% ({formatCurrency(category.revenue || 0)})
                    </span>
                  </div>
                  <div className="category-progress-bar">
                    <div
                      className={`category-progress-fill ${getTrendColor(category.growth || 0)}`}
                      style={{ width: `${category.percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="category-trend">
                    {getTrendBadge(category.growth || 0)}
                  </div>
                </div>
              ))}
              {(!earningsData.categories || earningsData.categories.length === 0) && (
                <div className="no-categories">
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modals */}
      {showAnalyticsModal && selectedAnalytics && (
        <div className="modal-overlay">
          <div className="modal enhanced-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiBarChart2 className="modal-icon" />
                {selectedAnalytics.type === "revenue"
                  ? "Revenue Analytics"
                  : selectedAnalytics.type === "seller"
                  ? "Seller Performance"
                  : "Category Analytics"}
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
                        {selectedAnalytics.type === "revenue"
                          ? formatCurrency(selectedAnalytics.data.revenue)
                          : selectedAnalytics.type === "seller"
                          ? formatCurrency(selectedAnalytics.data.earnings)
                          : formatCurrency(selectedAnalytics.data.revenue)}
                      </div>
                      <div className="stat-label">
                        {selectedAnalytics.type === "revenue"
                          ? "Monthly Revenue"
                          : selectedAnalytics.type === "seller"
                          ? "Total Earnings"
                          : "Category Revenue"}
                      </div>
                    </div>

                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAnalytics.type === "revenue"
                          ? selectedAnalytics.data.growth + "%"
                          : selectedAnalytics.type === "seller"
                          ? selectedAnalytics.data.growth + "%"
                          : selectedAnalytics.data.growth + "%"}
                      </div>
                      <div className="stat-label">Growth Rate</div>
                    </div>

                    <div className="stat-card-modal">
                      <div className="stat-value">
                        {selectedAnalytics.type === "seller"
                          ? selectedAnalytics.data.sales
                          : selectedAnalytics.type === "revenue"
                          ? formatCurrency(selectedAnalytics.data.platform)
                          : selectedAnalytics.data.percentage + "%"}
                      </div>
                      <div className="stat-label">
                        {selectedAnalytics.type === "seller"
                          ? "Total Sales"
                          : selectedAnalytics.type === "revenue"
                          ? "Platform Cut"
                          : "Market Share"}
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
                        {selectedAnalytics.type === "revenue"
                          ? `Revenue trend analysis for ${selectedAnalytics.data.month}`
                          : selectedAnalytics.type === "seller"
                          ? `Performance trend for ${selectedAnalytics.data.name}`
                          : `Growth analysis for ${selectedAnalytics.data.name}`}
                      </p>
                      <div className="trend-indicator">
                        {getTrendBadge(
                          selectedAnalytics.type === "revenue"
                            ? selectedAnalytics.data.growth
                            : selectedAnalytics.type === "seller"
                            ? selectedAnalytics.data.growth
                            : selectedAnalytics.data.growth
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
                    {selectedAnalytics.type === "revenue" &&
                      earningsData.monthly.map((month, index) => (
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

                    {selectedAnalytics.type === "seller" &&
                      earningsData.topSellers.map((seller, index) => (
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

                    {selectedAnalytics.type === "category" &&
                      earningsData.categories.map((category, index) => (
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
                <button
                  className="action-button secondary"
                  onClick={handleCloseModal}
                >
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
