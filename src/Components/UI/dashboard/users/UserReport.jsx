import React, { useState, useEffect } from "react";
import { 
  FiFileText, 
  FiRefreshCw, 
  FiUsers, 
  FiAlertCircle, 
  FiClock, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiStar, 
  FiPieChart, 
  FiFilter, 
  FiSearch, 
  FiDownload, 
  FiList, 
  FiEye, 
  FiCheckCircle, 
  FiCornerUpLeft, 
  FiMapPin 
} from "react-icons/fi";
// import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";

const UserReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    unresolvedReports: 0,
    resolvedReports: 0,
    averageResolutionTime: 0,
    userSatisfaction: 8.2
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    date: ""
  });

  // Fetch reports from Firebase
  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsRef = collection(db, "Profiles");
      const reportsSnapshot = await getDocs(reportsRef);
      
      let allReports = [];
      let totalReports = 0;
      let unresolvedReports = 0;
      let resolvedReports = 0;

      // Get all support reports from all users
      for (const userDoc of reportsSnapshot.docs) {
        const supportRef = collection(db, `Profiles/${userDoc.id}/Support`);
        const supportSnapshot = await getDocs(supportRef);
        
        supportSnapshot.forEach((doc) => {
          const reportData = {
            id: doc.id,
            userId: userDoc.id,
            ...doc.data()
          };
          allReports.push(reportData);
          totalReports++;
          
          // Count status
          if (reportData.status === "resolved") {
            resolvedReports++;
          } else {
            unresolvedReports++;
          }
        });
      }

      // Apply filters
      let filteredReports = allReports;
      
      if (filters.search) {
        filteredReports = filteredReports.filter(report => 
          report.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
          report.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
          report.email?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.category) {
        filteredReports = filteredReports.filter(report => 
          report.issueType === filters.category
        );
      }
      
      if (filters.status) {
        filteredReports = filteredReports.filter(report => 
          report.status === filters.status
        );
      }

      // Apply date filter
      if (filters.date) {
        const now = new Date();
        filteredReports = filteredReports.filter(report => {
          const reportDate = report.createdAt?.toDate();
          if (!reportDate) return false;
          
          switch (filters.date) {
            case 'today':
              return reportDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return reportDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return reportDate >= monthAgo;
            case 'older':
              const monthAgoOlder = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return reportDate < monthAgoOlder;
            default:
              return true;
          }
        });
      }

      // Calculate average resolution time (mock data for now)
      const averageResolutionTime = 2.5; // In days

      setStats({
        totalReports,
        unresolvedReports,
        resolvedReports,
        averageResolutionTime,
        userSatisfaction: 8.2
      });

      setReports(filteredReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, userId, newStatus) => {
    try {
      const reportRef = doc(db, `Profiles/${userId}/Support`, reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Refresh reports
      fetchReports();
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Error updating report status");
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      date: ""
    });
  };

  const getCategoryStats = () => {
    const categories = {
      technical: { name: "Technical Issue", count: 0, color: "technical" },
      billing: { name: "Billing Issue", count: 0, color: "billing" },
      general: { name: "General Inquiry", count: 0, color: "general" }
    };

    reports.forEach(report => {
      if (categories[report.issueType]) {
        categories[report.issueType].count++;
      }
    });

    return Object.values(categories);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = (email) => {
    if (!email) return "UU";
    return email.substring(0, 2).toUpperCase();
  };

  const getUserName = (email) => {
    if (!email) return "Unknown User";
    return email.split('@')[0];
  };

  const categoryStats = getCategoryStats();
  const totalReportsCount = reports.length;

  if (loading) {
    return (
      <div className="user-reports-dashboard">
        <div className="loading-state">Loading reports...</div>
      </div>
    );
  }

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
          <span className="user-badge-count">{stats.totalReports} total reports</span>
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
              <div className="report-stat-value">{stats.totalReports}</div>
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
              <div className="report-stat-value">{stats.unresolvedReports}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {stats.totalReports > 0 ? 
                `${((stats.unresolvedReports / stats.totalReports) * 100).toFixed(1)}% of total reports` 
                : '0% of total reports'
              }
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
              <div className="report-stat-value">{stats.resolvedReports}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {stats.totalReports > 0 ? 
                `${((stats.resolvedReports / stats.totalReports) * 100).toFixed(1)}% resolution rate` 
                : '0% resolution rate'
              }
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
              <div className="report-stat-value">{stats.averageResolutionTime}</div>
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
              <span className="score-value">{stats.userSatisfaction}/10</span>
              <span className="score-label">Overall Rating</span>
            </div>
          </div>
          <div className="reports-chart-body">
            <div className="pie-chart-container">
              <div className="pie-chart-wrapper">
                <div className="pie-chart">
                  <div className="pie-chart-center">
                    <div className="pie-chart-value">{stats.userSatisfaction}</div>
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
              Report Categories
            </h3>
          </div>
          <div className="reports-categories-body">
            {categoryStats.map((category, index) => (
              <div key={index} className="category-progress">
                <div className="category-header">
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">
                    {stats.totalReports > 0 ? 
                      `${Math.round((category.count / stats.totalReports) * 100)}% (${category.count})` 
                      : '0% (0)'
                    }
                  </span>
                </div>
                <div className="category-progress-bar">
                  <div 
                    className={`category-progress-fill ${category.color}`} 
                    style={{ 
                      width: stats.totalReports > 0 ? 
                        `${(category.count / stats.totalReports) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            ))}
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
            <span className="filter-text">
              Showing {reports.length} of {stats.totalReports} reports
            </span>
          </div>
        </div>
        
        <div className="filter-controls-grid">
          {/* Search by Name/Email */}
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search by subject, description, or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <select 
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing Issue</option>
            <option value="general">General Inquiry</option>
          </select>
          
          {/* Status Filter */}
          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          
          {/* Date Filter */}
          <select 
            className="filter-select"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          >
            <option value="">Any Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="older">Older</option>
          </select>
          
          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="filter-button" onClick={fetchReports}>
              <FiFilter />
              Apply
            </button>
            <button className="filter-button" onClick={resetFilters}>
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
              {reports.slice(0, 10).map((report) => (
                <tr key={`${report.userId}-${report.id}`}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {getUserInitials(report.email)}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">
                          {getUserName(report.email)}
                        </div>
                        <div className="report-user-email">{report.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`report-category-badge ${report.issueType}`}>
                      {report.issueType === 'technical' && 'Technical Issue'}
                      {report.issueType === 'billing' && 'Billing Issue'}
                      {report.issueType === 'general' && 'General Inquiry'}
                    </span>
                  </td>
                  <td>
                    <div className="comp-dis" title={report.description}>
                      {report.subject || "No subject"}
                    </div>
                  </td>
                  <td>
                    <span className={`report-status-badge ${report.status || 'pending'}`}>
                      {report.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <div className="report-actions">
                      <button className="action-button secondary small" title="View Details">
                        <FiEye />
                      </button>
                      {report.status !== 'resolved' ? (
                        <button 
                          className="action-button small" 
                          title="Mark Resolved"
                          onClick={() => updateReportStatus(report.id, report.userId, 'resolved')}
                        >
                          <FiCheckCircle />
                        </button>
                      ) : (
                        <button 
                          className="action-button small" 
                          title="Reopen"
                          onClick={() => updateReportStatus(report.id, report.userId, 'pending')}
                        >
                          <FiCornerUpLeft />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-reports">
                    No reports found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserReport;