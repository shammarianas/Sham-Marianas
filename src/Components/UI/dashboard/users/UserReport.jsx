import React from "react";
import { FiFileText, FiRefreshCw, FiUsers, FiAlertCircle, FiClock, FiTrendingUp, FiTrendingDown, FiStar, FiPieChart, FiFilter, FiSearch, FiDownload, FiList, FiEye, FiCheckCircle, FiCornerUpLeft, FiMapPin } from "react-icons/fi";

const UserReport = () => {
  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            User Reports Dashboard
          </h2>
          <p className="header-subtitle">
            Monitor and manage user reports, complaints, and feedback
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">1,250 total reports</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        {/* Total User Reports */}
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Total Reports</h3>
              <div className="report-stat-value">1,250</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All complaints, feedback, violations
            </div>
            <div className="report-stat-trend positive">
              +12%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiAlertCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Unresolved reports</h3>
              <div className="report-stat-value">45</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              3.6% of total reports
            </div>
            <div className="report-stat-trend negative">
              +5%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Resolved Reports */}
        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Completed Reports</h3>
              <div className="report-stat-value">1,150</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              92% resolution rate
            </div>
            <div className="report-stat-trend positive">
              +8%  
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Average solution time</h3>
              <div className="report-stat-value">2.5</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              days average resolution
            </div>
            <div className="report-stat-trend positive">
              -0.5 days
              <FiTrendingDown className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Categories Section */}
      <div className="reports-content-grid">
        {/* User Satisfaction Score */}
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiStar className="panel-icon" />
              User Satisfaction Score
            </h3>
            <div className="satisfaction-score">
              <span className="score-value">8.2/10</span>
              <span className="score-label">Overall Rating</span>
            </div>
          </div>
          <div className="reports-chart-body">
            <div className="pie-chart-container">
              <div className="pie-chart-wrapper">
                <div className="pie-chart">
                  <div className="pie-chart-center">
                    <div className="pie-chart-value">8.2</div>
                  </div>
                </div>
              </div>
              
              <div className="pie-chart-labels">
                <div className="pie-chart-label">
                  <span className="pie-label-dot excellent"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Excellent</span>
                    <span className="pie-label-percentage">45%</span>
                  </div>
                </div>
                
                <div className="pie-chart-label">
                  <span className="pie-label-dot good"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Good</span>
                    <span className="pie-label-percentage">35%</span>
                  </div>
                </div>
                
                <div className="pie-chart-label">
                  <span className="pie-label-dot average"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Average</span>
                    <span className="pie-label-percentage">15%</span>
                  </div>
                </div>
                
                <div className="pie-chart-label">
                  <span className="pie-label-dot poor"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Poor</span>
                    <span className="pie-label-percentage">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="reports-categories-card">
          <div className="reports-categories-header">
            <h3 className="panel-title">
              <FiPieChart className="panel-icon" />
              Top Report Categories
            </h3>
          </div>
          <div className="reports-categories-body">
            <div className="category-progress">
              <div className="category-header">
                <span className="category-name">Harassment</span>
                <span className="category-count">40% (500)</span>
              </div>
              <div className="category-progress-bar">
                <div className="category-progress-fill harassment" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div className="category-progress">
              <div className="category-header">
                <span className="category-name">Spam Content</span>
                <span className="category-count">25% (312)</span>
              </div>
              <div className="category-progress-bar">
                <div className="category-progress-fill spam" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div className="category-progress">
              <div className="category-header">
                <span className="category-name">Fraud</span>
                <span className="category-count">20% (250)</span>
              </div>
              <div className="category-progress-bar">
                <div className="category-progress-fill fraud" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div className="category-progress">
              <div className="category-header">
                <span className="category-name">Content Violation</span>
                <span className="category-count">10% (125)</span>
              </div>
              <div className="category-progress-bar">
                <div className="category-progress-fill content" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div className="category-progress">
              <div className="category-header">
                <span className="category-name">Other</span>
                <span className="category-count">5% (63)</span>
              </div>
              <div className="category-progress-bar">
                <div className="category-progress-fill other" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" />
            Filter Reports
          </h3>
          <div className="filter-results">
            <span className="filter-text">Showing 45 of 1,250 reports</span>
          </div>
        </div>
        
        <div className="filter-controls-grid">
          {/* Search by Name/Email */}
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search by name, email, or description..."
            />
          </div>
          
          {/* Category Filter */}
          <select className="filter-select">
            <option value="">All Categories</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam Content</option>
            <option value="fraud">Fraud</option>
            <option value="content">Content Violation</option>
            <option value="other">Other</option>
          </select>
          
          {/* Status Filter */}
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          {/* Date Filter */}
          <select className="filter-select">
            <option value="">Any Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="older">Older</option>
          </select>
          
          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="filter-button">
              <FiFilter />
              Apply
            </button>
            <button className="filter-button">
              <FiRefreshCw />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" />
            Recent Reports
          </h3>
          <button className="action-button secondary">
            <FiDownload className="button-icon" />
            Export Reports
          </button>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="report-user">
                    <div className="report-user-avatar">AJ</div>
                    <div className="report-user-info">
                      <div className="report-user-name">Ali Javed</div>
                      <div className="report-user-email">ali@example.com</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="report-category-badge harassment">Harassment</span>
                </td>
                <td>
                  <div className="comp-dis">Inappropriate messages from another user Inappropriate messages from another user Inappropriate messages from another user</div>
                </td>
                <td>
                  <span className="report-status-badge pending">Pending</span>
                </td>
                <td>2 hours ago</td>
                <td>
                  <div className="report-actions">
                    <button className="action-button secondary small" title="View Details">
                      <FiEye />
                    </button>
                    <button className="action-button small" title="Mark Resolved">
                      <FiCheckCircle />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="report-user">
                    <div className="report-user-avatar">SR</div>
                    <div className="report-user-info">
                      <div className="report-user-name">Sara Riaz</div>
                      <div className="report-user-email">sara@example.com</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="report-category-badge spam">Spam</span>
                </td>
                <td>Multiple spam messages in comments</td>
                <td>
                  <span className="report-status-badge resolved">Resolved</span>
                </td>
                <td>1 day ago</td>
                <td>
                  <div className="report-actions">
                    <button className="action-button secondary small" title="View Details">
                      <FiEye />
                    </button>
                    <button className="action-button small" title="Reopen">
                      <FiCornerUpLeft />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserReport;