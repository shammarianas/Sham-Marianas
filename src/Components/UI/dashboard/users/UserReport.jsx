import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "react-icons/fi";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase"; // Make sure this is correctly exported

const UserReport = () => {
  // Master data (fetched once)
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    date: "",
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useMemo(() => {
    const handler = setTimeout(() => searchInput, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
  }, [debouncedSearch, searchInput]);

  // Fetch ALL reports ONCE on mount
  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const profilesRef = collection(db, "Profiles");
        const profilesSnapshot = await getDocs(profilesRef);

        const reports = [];

        for (const profileDoc of profilesSnapshot.docs) {
          const supportRef = collection(
            db,
            `Profiles/${profileDoc.id}/Support`
          );
          const supportSnapshot = await getDocs(supportRef);

          supportSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.createdAt) {
              reports.push({
                id: doc.id,
                userId: profileDoc.id,
                email: data.email || profileDoc.id,
                ...data,
              });
            }
          });
        }

        // Sort newest first
        reports.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || 0;
          const timeB = b.createdAt?.toDate?.() || 0;
          return timeB - timeA;
        });

        setAllReports(reports);
      } catch (error) {
        console.error("Error loading reports:", error);
        alert("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  // Client-side filtering with useMemo (super fast)
  const reports = useMemo(() => {
    return allReports.filter((report) => {
      // Search filter
      if (
        filters.search &&
        !`${report.subject || ""} ${report.description || ""} ${
          report.email || ""
        }`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (filters.category && report.issueType !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && report.status !== filters.status) {
        return false;
      }

      // Date filter
      if (filters.date && report.createdAt) {
        const reportDate = report.createdAt.toDate();
        const now = new Date();

        switch (filters.date) {
          case "today":
            if (reportDate.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (reportDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (reportDate < monthAgo) return false;
            break;
          case "older":
            const olderThanMonth = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            if (reportDate >= olderThanMonth) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }, [allReports, filters]);

  // Recalculate stats from filtered reports
  const stats = useMemo(() => {
    const totalReports = allReports.length;
    const filteredTotal = reports.length;

    const resolvedReports = reports.filter(
      (r) => r.status === "resolved"
    ).length;
    const unresolvedReports = filteredTotal - resolvedReports;

    // Calculate real average resolution time
    const resolvedWithTime = reports
      .filter((r) => r.status === "resolved" && r.resolvedAt && r.createdAt)
      .map((r) => {
        const created = r.createdAt.toDate();
        const resolved = r.resolvedAt.toDate?.() || new Date();
        return (resolved - created) / (1000 * 60 * 60 * 24);
      });

    const averageResolutionTime =
      resolvedWithTime.length > 0
        ? (
            resolvedWithTime.reduce((a, b) => a + b, 0) /
            resolvedWithTime.length
          ).toFixed(1)
        : "N/A";

    return {
      totalReports,
      unresolvedReports,
      resolvedReports,
      averageResolutionTime,
      userSatisfaction: 8.2, // You can make this dynamic later
    };
  }, [allReports, reports]);

  const updateReportStatus = async (reportId, userId, newStatus) => {
    try {
      const reportRef = doc(db, `Profiles/${userId}/Support`, reportId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };
      if (newStatus === "resolved") {
        updateData.resolvedAt = new Date();
      }
      await updateDoc(reportRef, updateData);

      // Optimistic UI update
      setAllReports((prev) =>
        prev.map((r) =>
          r.userId === userId && r.id === reportId ? { ...r, ...updateData } : r
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: "", category: "", status: "", date: "" });
    setSearchInput("");
  };

  const getCategoryStats = () => {
    const categories = {
      technical: { name: "Technical Issue", count: 0 },
      billing: { name: "Billing Issue", count: 0 },
      general: { name: "General Inquiry", count: 0 },
    };

    reports.forEach((r) => {
      if (categories[r.issueType]) categories[r.issueType].count++;
    });

    return Object.values(categories);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "N/A";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.abs(now - date);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = (email) =>
    email ? email.substring(0, 2).toUpperCase() : "UU";
  const getUserName = (email) => (email ? email.split("@")[0] : "Unknown User");

  const categoryStats = getCategoryStats();

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
          <span className="user-badge-count">
            {stats.totalReports} total reports
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
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
              +12% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

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
              {stats.totalReports > 0
                ? `${((stats.unresolvedReports / reports.length) * 100).toFixed(
                    1
                  )}% of filtered`
                : "0% of total reports"}
            </div>
            <div className="report-stat-trend negative">
              +5% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

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
              {reports.length > 0
                ? `${((stats.resolvedReports / reports.length) * 100).toFixed(
                    1
                  )}% resolution rate`
                : "0% resolution rate"}
            </div>
            <div className="report-stat-trend positive">
              +8% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Average solution time</h3>
              <div className="report-stat-value">
                {stats.averageResolutionTime === "N/A"
                  ? "N/A"
                  : `${stats.averageResolutionTime} days`}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">days average resolution</div>
            <div className="report-stat-trend positive">
              -0.5 days <FiTrendingDown className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Categories */}
      <div className="reports-content-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiStar className="panel-icon" /> User Satisfaction Score
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
                    <div className="pie-chart-value">
                      {stats.userSatisfaction}
                    </div>
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

        <div className="reports-categories-card">
          <div className="reports-categories-header">
            <h3 className="panel-title">
              <FiPieChart className="panel-icon" /> Report Categories
            </h3>
          </div>
          <div className="reports-categories-body">
            {categoryStats.map((cat, i) => (
              <div key={i} className="category-progress">
                <div className="category-header">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">
                    {stats.totalReports > 0
                      ? `${Math.round(
                          (cat.count / stats.totalReports) * 100
                        )}% (${cat.count})`
                      : "0% (0)"}
                  </span>
                </div>
                <div className="category-progress-bar">
                  <div
                    className={`category-progress-fill ${cat.name
                      .split(" ")[0]
                      .toLowerCase()}`}
                    style={{
                      width:
                        stats.totalReports > 0
                          ? `${(cat.count / stats.totalReports) * 100}%`
                          : "0%",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Reports
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {reports.length} of {stats.totalReports} reports
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search by subject, description, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing Issue</option>
            <option value="general">General Inquiry</option>
          </select>

          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="filter-select"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
          >
            <option value="">Any Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="older">Older</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Recent Reports
          </h3>
          <button className="action-button secondary">
            <FiDownload className="button-icon" /> Export Reports
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
                    <span
                      className={`report-category-badge ${report.issueType}`}
                    >
                      {report.issueType === "technical" && "Technical Issue"}
                      {report.issueType === "billing" && "Billing Issue"}
                      {report.issueType === "general" && "General Inquiry"}
                    </span>
                  </td>
                  <td>
                    <div className="comp-dis" title={report.description}>
                      {report.subject || "No subject"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`report-status-badge ${
                        report.status || "pending"
                      }`}
                    >
                      {report.status === "resolved"
                        ? "Resolved"
                        : report.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                    </span>
                  </td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      {report.status !== "resolved" ? (
                        <button
                          className="action-button small"
                          title="Mark Resolved"
                          onClick={() =>
                            updateReportStatus(
                              report.id,
                              report.userId,
                              "resolved"
                            )
                          }
                        >
                          <FiCheckCircle />
                        </button>
                      ) : (
                        <button
                          className="action-button small"
                          title="Reopen"
                          onClick={() =>
                            updateReportStatus(
                              report.id,
                              report.userId,
                              "pending"
                            )
                          }
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
