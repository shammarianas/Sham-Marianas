import React, { useState, useEffect } from "react";
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
  FiStar,
  FiXCircle,
} from "react-icons/fi";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";

const SellerAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalSellers: 0,
      activeSellers: 0,
      avgRevenuePerSeller: 0,
      growthRate: 15.2,
      topCategories: [],
    },
    performance: {
      topPerformers: [],
    },
  });

  // ✅ DYNAMIC DATA FETCHING - FIXED
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch all contributors
        const contributorsSnapshot = await getDocs(
          collection(db, "Contributors")
        );
        const allContributors = [];
        let totalRevenue = 0;
        let activeSellers = 0;

        contributorsSnapshot.forEach((doc) => {
          const contributorData = doc.data();
          const contributor = {
            id: doc.id,
            ...contributorData,
            // Ensure totalEarnings is a number
            totalEarnings: parseFloat(contributorData.totalEarnings) || 0,
          };

          allContributors.push(contributor);

          // Count active sellers
          if (contributorData.status === "verified") {
            activeSellers++;
          }

          // Add to total revenue
          totalRevenue += contributor.totalEarnings;
        });

        // Fetch assets for each contributor to get product count and category data
        const topPerformers = [];
        const categoryMap = {};

        for (const contributor of allContributors) {
          try {
            // Fetch contributor's assets
            const assetsQuery = query(
              collection(db, "Assets"),
              where("ownerId", "==", contributor.id)
            );
            const assetsSnapshot = await getDocs(assetsQuery);

            let contributorProducts = 0;

            assetsSnapshot.forEach((assetDoc) => {
              const assetData = assetDoc.data();
              contributorProducts++;

              // Track category distribution
              if (assetData.category) {
                const category = assetData.category;
                categoryMap[category] = (categoryMap[category] || 0) + 1;
              }
            });

            // Only include contributors with revenue or products
            if (contributor.totalEarnings > 0 || contributorProducts > 0) {
              topPerformers.push({
                id: contributor.id,
                name:
                  contributor.businessName ||
                  contributor.username ||
                  contributor.displayName ||
                  contributor.email?.split('@')[0] ||
                  "Unknown Seller",
                email: contributor.email || "No email",
                revenue: contributor.totalEarnings || 0, // ✅ Use actual totalEarnings
                growth: calculateRandomGrowth(),
                products: contributorProducts,
                rating: calculateRandomRating(),
                joinDate: formatFirebaseDate(contributor.createdAt),
                status:
                  contributor.status === "verified" ? "active" : "inactive",
              });
            }
          } catch (error) {
            console.error(
              `Error fetching assets for contributor ${contributor.id}:`,
              error
            );
          }
        }

        // Sort by revenue (descending)
        topPerformers.sort((a, b) => b.revenue - a.revenue);

        // Calculate category distribution from categoryMap
        const topCategories = [];
        const totalProducts = Object.values(categoryMap).reduce((sum, count) => sum + count, 0);

        Object.entries(categoryMap).forEach(([category, count]) => {
          const percentage = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
          topCategories.push({
            name: category || "Uncategorized",
            value: percentage,
            growth: calculateRandomGrowth(),
          });
        });

        // Sort categories by value (descending) and take top 5
        topCategories.sort((a, b) => b.value - a.value);
        const top5Categories = topCategories.slice(0, 5);

        // If we don't have enough categories, add placeholder ones
        while (top5Categories.length < 5) {
          const placeholderCategories = ["3D Models", "Graphics", "Templates", "Fonts", "Others"];
          const existingNames = top5Categories.map(c => c.name);
          const newCategory = placeholderCategories.find(name => !existingNames.includes(name));
          if (newCategory) {
            top5Categories.push({
              name: newCategory,
              value: Math.floor(Math.random() * 20) + 5,
              growth: calculateRandomGrowth(),
            });
          } else {
            break;
          }
        }

        // Calculate average revenue per seller
        const avgRevenuePerSeller = allContributors.length > 0
          ? totalRevenue / allContributors.length
          : 0;

        // Update analytics data
        setAnalyticsData({
          overview: {
            totalRevenue,
            totalSellers: allContributors.length,
            activeSellers,
            avgRevenuePerSeller,
            growthRate: 15.2, // You can calculate this dynamically based on timeRange if needed
            topCategories: top5Categories,
          },
          performance: {
            topPerformers: topPerformers.slice(0, 10), // Top 10 performers
          },
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // ✅ HELPER FUNCTIONS
  const calculateRandomGrowth = () => {
    return (Math.random() * 30 - 5).toFixed(1);
  };

  const calculateRandomRating = () => {
    return (Math.random() * 1 + 4).toFixed(1);
  };

  const formatFirebaseDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Statistics
  const stats = {
    totalRevenue: analyticsData.overview.totalRevenue,
    totalSellers: analyticsData.overview.totalSellers,
    activeSellers: analyticsData.overview.activeSellers,
    avgRevenuePerSeller: analyticsData.overview.avgRevenuePerSeller,
  };

  const getGrowthBadge = (growth) => {
    const growthNum = parseFloat(growth);
    return growthNum >= 0 ? (
      <span className="report-stat-trend positive">
        +{growthNum}% <FiTrendingUp className="fi-pl" />
      </span>
    ) : (
      <span className="report-stat-trend negative">
        {growthNum}% <FiTrendingDown className="fi-pl" />
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="report-status-badge resolved">
            <FiCheckCircle /> Active
          </span>
        );
      case "inactive":
        return (
          <span className="report-status-badge in-progress">
            <FiXCircle /> Inactive
          </span>
        );
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
  };

  // Filter sellers based on search
  const filteredSellers = analyticsData.performance.topPerformers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  )



  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading Seller Analytics...</p>
          </div>
        </div>
      )}
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
              <div className="report-stat-value">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Actual earnings from all sellers {/* Ye line change ki */}
            </div>
            <div className="report-stat-trend positive">
              +{analyticsData.overview.growthRate}%{" "}
              <FiTrendingUp className="fi-pl" />
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
            <div className="report-stat-subtext">Registered sellers</div>
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
            <div className="report-stat-subtext">Currently active</div>
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
              <div className="report-stat-value">
                {formatCurrency(stats.avgRevenuePerSeller)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Average per seller</div>
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
              style={{ width: "auto" }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div
            className="analytics-tabs"
            style={{ display: "flex", gap: "0.5rem", gridColumn: "1 / -1" }}
          >
            <button
              className={`tab-button ${activeTab === "overview" ? "active" : ""
                }`}
              onClick={() => setActiveTab("overview")}
            >
              <FiBarChart2 className="tab-icon" />
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === "performance" ? "active" : ""
                }`}
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
              className={`tab-button ${activeTab === "insights" ? "active" : ""
                }`}
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
                <div
                  className="chart-placeholder"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <FiBarChart2 className="placeholder-icon large" />
                  <p>Total Revenue: {formatCurrency(stats.totalRevenue)}</p>
                  <p>Active Sellers: {stats.activeSellers}</p>
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
                  {analyticsData.overview.topCategories.map(
                    (category, index) => (
                      <div
                        key={index}
                        className="category-progress"
                        style={{ marginBottom: "1rem" }}
                      >
                        <div className="category-header">
                          <div className="category-name">{category.name}</div>
                          <div className="category-count">
                            {category.value}%
                          </div>
                        </div>
                        <div className="category-progress-bar">
                          <div
                            className={`category-progress-fill ${category.growth >= 0 ? "excellent" : "poor"
                              }`}
                            style={{ width: `${category.value}%` }}
                          ></div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {getGrowthBadge(category.growth)}
                        </div>
                      </div>
                    )
                  )}
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
              <div
                className="filter-controls-grid"
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <div className="filter-search-wrapper">
                  <FiSearch className="filter-search-icon" />
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "200px" }}
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
                            <div className="report-user-name">
                              {seller.name}
                            </div>
                            <div className="report-user-email">
                              {seller.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="comp-dis">
                          <FiDollarSign style={{ marginRight: "4px" }} />
                          {formatCurrency(seller.revenue)}
                        </div>
                      </td>
                      <td>{getGrowthBadge(seller.growth)}</td>
                      <td>
                        <div className="comp-dis">{seller.products} Assets</div>
                      </td>

                      <td>{getStatusBadge(seller.status)}</td>
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
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowDetailsModal(true);
                            }}
                          >
                            <FiBarChart2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredSellers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="no-reports">
                        No sellers found matching your search
                      </td>
                    </tr>
                  )}
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
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <FiTrendingUp className="placeholder-icon large" />
                <p>Total Sellers: {stats.totalSellers}</p>
                <p>Active Sellers: {stats.activeSellers}</p>
                <p>Total Revenue: {formatCurrency(stats.totalRevenue)}</p>
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
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <FiUsers className="placeholder-icon large" />
                <p>Seller growth trends and acquisition metrics</p>
                <p>Active Sellers: {stats.activeSellers}</p>
                <p>Growth Rate: +{analyticsData.overview.growthRate}%</p>
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
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <FiEye className="placeholder-icon large" />
                <p>Total Revenue: {formatCurrency(stats.totalRevenue)}</p>
                <p>
                  Average per Seller:{" "}
                  {formatCurrency(stats.avgRevenuePerSeller)}
                </p>
                <p>
                  Active Sellers: {stats.activeSellers} out of{" "}
                  {stats.totalSellers}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {showDetailsModal && selectedSeller && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Seller Performance Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
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
                    <span className="detail-value">
                      {selectedSeller.joinDate}
                    </span>
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
                    <span className="detail-value">
                      {formatCurrency(selectedSeller.revenue)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Growth Rate:</span>
                    <span className="detail-value">
                      {getGrowthBadge(selectedSeller.growth)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Products:</span>
                    <span className="detail-value">
                      {selectedSeller.products}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rating:</span>
                    <span className="detail-value">
                      <FiStar
                        style={{ color: "#fbbf24", marginRight: "4px" }}
                      />
                      {selectedSeller.rating}/5.0
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Performance Insights</h4>
                  <div className="detail-description">
                    {selectedSeller.name} is performing{" "}
                    {selectedSeller.growth >= 0 ? "well" : "below average"} with
                    a {selectedSeller.growth}% growth rate. Their product
                    catalog of {selectedSeller.products} items is generating{" "}
                    {formatCurrency(selectedSeller.revenue)} in revenue.
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-button secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>

              <button
                className="action-button"
                onClick={() => {
                  alert(
                    `Viewing detailed analytics for ${selectedSeller.name}`
                  );
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
