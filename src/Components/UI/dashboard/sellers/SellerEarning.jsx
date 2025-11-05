import React, { useState } from "react";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiDownload, FiCalendar, FiPieChart, FiBarChart2, FiFilter } from "react-icons/fi";

const SellerEarning = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [sellersEarnings, setSellersEarnings] = useState([
    {
      id: 1,
      name: "Ali Designs",
      totalEarnings: 12500,
      pendingPayout: 2500,
      completedPayouts: 10000,
      totalSales: 45,
      avgOrderValue: 278,
      growth: 15.2
    },
    {
      id: 2,
      name: "Sara Creations",
      totalEarnings: 8900,
      pendingPayout: 1200,
      completedPayouts: 7700,
      totalSales: 32,
      avgOrderValue: 278,
      growth: 8.7
    },
    {
      id: 3,
      name: "UR Designs",
      totalEarnings: 15600,
      pendingPayout: 3100,
      completedPayouts: 12500,
      totalSales: 58,
      avgOrderValue: 269,
      growth: 22.1
    },
    {
      id: 4,
      name: "Digital Assets Co",
      totalEarnings: 7200,
      pendingPayout: 800,
      completedPayouts: 6400,
      totalSales: 28,
      avgOrderValue: 257,
      growth: -5.3
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalEarnings = sellersEarnings.reduce((sum, seller) => sum + seller.totalEarnings, 0);
  const totalPending = sellersEarnings.reduce((sum, seller) => sum + seller.pendingPayout, 0);
  const totalCompleted = sellersEarnings.reduce((sum, seller) => sum + seller.completedPayouts, 0);
  const totalSales = sellersEarnings.reduce((sum, seller) => sum + seller.totalSales, 0);

  return (
    <div className="seller-earnings-dashboard">
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

      {/* Summary Statistics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalEarnings)}</div>
            <div className="stat-label">Total Earnings</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +12.5%
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalPending)}</div>
            <div className="stat-label">Pending Payout</div>
            <div className="stat-trend neutral">
              Processing
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalCompleted)}</div>
            <div className="stat-label">Completed Payouts</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +8.3%
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalSales}</div>
            <div className="stat-label">Total Sales</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +15.7%
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column - Charts */}
        <div className="charts-column">
          {/* Earnings Distribution */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiPieChart className="panel-icon" />
                Earnings Distribution
              </h3>
            </div>
            <div className="card-body">
              <div className="earnings-chart">
                <div className="chart-placeholder">
                  <FiPieChart className="placeholder-icon large" />
                  <p>Earnings distribution chart</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiBarChart2 className="panel-icon" />
                Monthly Earnings Trend
              </h3>
            </div>
            <div className="card-body">
              <div className="trend-chart">
                <div className="chart-placeholder">
                  <FiBarChart2 className="placeholder-icon large" />
                  <p>Monthly earnings trend chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sellers List */}
        <div className="sellers-column">
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiUsers className="panel-icon" />
                Seller Earnings Breakdown
              </h3>
              <div className="card-actions">
                <FiFilter className="filter-icon" />
              </div>
            </div>
            <div className="card-body">
              <div className="sellers-earnings-list">
                {sellersEarnings.map((seller) => (
                  <div key={seller.id} className="seller-earning-item">
                    <div className="seller-info">
                      <div className="seller-avatar">
                        {seller.name.charAt(0)}
                      </div>
                      <div className="seller-details">
                        <div className="seller-name">{seller.name}</div>
                        <div className="seller-stats">
                          <span className="stat">{seller.totalSales} sales</span>
                          <span className="stat-dot">•</span>
                          <span className="stat">Avg: {formatCurrency(seller.avgOrderValue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="earning-details">
                      <div className="earning-amount">
                        {formatCurrency(seller.totalEarnings)}
                      </div>
                      <div className="earning-breakdown">
                        <div className="breakdown-item">
                          <span className="label">Pending:</span>
                          <span className="value pending">{formatCurrency(seller.pendingPayout)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="label">Paid:</span>
                          <span className="value paid">{formatCurrency(seller.completedPayouts)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="growth-indicator">
                      <div className={`growth-badge ${seller.growth >= 0 ? 'positive' : 'negative'}`}>
                        {seller.growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        {Math.abs(seller.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payout Schedule */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiCalendar className="panel-icon" />
                Upcoming Payouts
              </h3>
            </div>
            <div className="card-body">
              <div className="payout-schedule">
                <div className="payout-item">
                  <div className="payout-date">
                    <div className="date-day">15</div>
                    <div className="date-month">Jan</div>
                  </div>
                  <div className="payout-info">
                    <div className="payout-amount">{formatCurrency(4500)}</div>
                    <div className="payout-sellers">12 sellers</div>
                  </div>
                  <div className="payout-status pending">Scheduled</div>
                </div>
                
                <div className="payout-item">
                  <div className="payout-date">
                    <div className="date-day">01</div>
                    <div className="date-month">Feb</div>
                  </div>
                  <div className="payout-info">
                    <div className="payout-amount">{formatCurrency(5200)}</div>
                    <div className="payout-sellers">15 sellers</div>
                  </div>
                  <div className="payout-status upcoming">Upcoming</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Earnings Table */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="panel-title">Detailed Earnings Report</h3>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Total Earnings</th>
                  <th>Pending Payout</th>
                  <th>Completed Payouts</th>
                  <th>Total Sales</th>
                  <th>Avg Order Value</th>
                  <th>Growth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellersEarnings.map((seller) => (
                  <tr key={seller.id}>
                    <td>
                      <div className="seller-info">
                        <div className="seller-avatar small">
                          {seller.name.charAt(0)}
                        </div>
                        <span className="seller-name">{seller.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="earning-amount">
                        {formatCurrency(seller.totalEarnings)}
                      </div>
                    </td>
                    <td>
                      <div className="pending-amount">
                        {formatCurrency(seller.pendingPayout)}
                      </div>
                    </td>
                    <td>
                      <div className="completed-amount">
                        {formatCurrency(seller.completedPayouts)}
                      </div>
                    </td>
                    <td>
                      <div className="sales-count">{seller.totalSales}</div>
                    </td>
                    <td>
                      <div className="avg-order">
                        {formatCurrency(seller.avgOrderValue)}
                      </div>
                    </td>
                    <td>
                      <div className={`growth ${seller.growth >= 0 ? 'positive' : 'negative'}`}>
                        {seller.growth >= 0 ? '+' : ''}{seller.growth}%
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button secondary small">
                          View Details
                        </button>
                        <button className="action-button small">
                          Process Payout
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
    </div>
  );
};

export default SellerEarning;