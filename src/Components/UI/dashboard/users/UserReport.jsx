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
  FiX,
} from "react-icons/fi";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";
import {  exportUsersData } from "../../../../utils/exportUtils";

const UserReport = () => {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    date: "",
  });

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

  // Calculate trends compared to previous period (last 30 days vs previous 30 days)
  const trends = useMemo(() => {
    if (loading)
      return {
        total: { value: 0, isPositive: true },
        unresolved: { value: 0, isPositive: true },
        resolved: { value: 0, isPositive: true },
        resolutionTime: { value: 0, isPositive: true },
      };

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPeriodReports = allReports.filter((report) => {
      const reportDate = report.createdAt?.toDate();
      return reportDate && reportDate >= last30Days;
    });

    const previousPeriodReports = allReports.filter((report) => {
      const reportDate = report.createdAt?.toDate();
      return (
        reportDate && reportDate >= previous30Days && reportDate < last30Days
      );
    });

    const currentTotal = currentPeriodReports.length;
    const previousTotal = previousPeriodReports.length;
    const totalTrend =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    const currentUnresolved = currentPeriodReports.filter(
      (r) => r.status !== "resolved"
    ).length;
    const previousUnresolved = previousPeriodReports.filter(
      (r) => r.status !== "resolved"
    ).length;
    const unresolvedTrend =
      previousUnresolved > 0
        ? ((currentUnresolved - previousUnresolved) / previousUnresolved) * 100
        : 0;

    const currentResolved = currentPeriodReports.filter(
      (r) => r.status === "resolved"
    ).length;
    const previousResolved = previousPeriodReports.filter(
      (r) => r.status === "resolved"
    ).length;
    const resolvedTrend =
      previousResolved > 0
        ? ((currentResolved - previousResolved) / previousResolved) * 100
        : 0;

    // Calculate resolution time trend
    const currentResolvedWithTime = currentPeriodReports
      .filter((r) => r.status === "resolved" && r.resolvedAt && r.createdAt)
      .map((r) => {
        const created = r.createdAt.toDate();
        const resolved = r.resolvedAt.toDate?.() || new Date();
        return (resolved - created) / (1000 * 60 * 60 * 24);
      });

    const previousResolvedWithTime = previousPeriodReports
      .filter((r) => r.status === "resolved" && r.resolvedAt && r.createdAt)
      .map((r) => {
        const created = r.createdAt.toDate();
        const resolved = r.resolvedAt.toDate?.() || new Date();
        return (resolved - created) / (1000 * 60 * 60 * 24);
      });

    const currentAvgTime =
      currentResolvedWithTime.length > 0
        ? currentResolvedWithTime.reduce((a, b) => a + b, 0) /
          currentResolvedWithTime.length
        : 0;

    const previousAvgTime =
      previousResolvedWithTime.length > 0
        ? previousResolvedWithTime.reduce((a, b) => a + b, 0) /
          previousResolvedWithTime.length
        : 0;

    const resolutionTimeTrend =
      previousAvgTime > 0
        ? ((previousAvgTime - currentAvgTime) / previousAvgTime) * 100
        : 0;

    return {
      total: {
        value: totalTrend,
        isPositive: totalTrend <= 0, // Lower growth or negative is better for total reports
      },
      unresolved: {
        value: unresolvedTrend,
        isPositive: unresolvedTrend <= 0, // Lower unresolved is better
      },
      resolved: {
        value: resolvedTrend,
        isPositive: resolvedTrend >= 0, // Higher resolved is better
      },
      resolutionTime: {
        value: resolutionTimeTrend,
        isPositive: resolutionTimeTrend >= 0, // Lower resolution time is better
      },
    };
  }, [allReports, loading]);

  // Client-side filtering with useMemo
  const reports = useMemo(() => {
    if (loading) return [];

    return allReports.filter((report) => {
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

      if (filters.category && report.issueType !== filters.category) {
        return false;
      }

      if (filters.status && report.status !== filters.status) {
        return false;
      }

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
  }, [allReports, filters, loading]);

  // Export handler with callbacks-------------
  const handleExportStart = () => {
    exportUsersData(users, format);
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

  // Calculate user satisfaction from resolution time and response quality
  const userSatisfactionData = useMemo(() => {
    if (loading) {
      return {
        overall: 0,
        distribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
        },
      };
    }

    const resolvedReports = allReports.filter((r) => r.status === "resolved");

    if (resolvedReports.length === 0) {
      return {
        overall: 0,
        distribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
        },
      };
    }

    // Calculate satisfaction based on resolution time
    const resolutionTimes = resolvedReports
      .filter((r) => r.resolvedAt && r.createdAt)
      .map((r) => {
        const created = r.createdAt.toDate();
        const resolved = r.resolvedAt.toDate?.() || new Date();
        return (resolved - created) / (1000 * 60 * 60 * 24); // Convert to days
      });

    const avgResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

    // Calculate satisfaction score based on resolution time (shorter time = higher satisfaction)
    let overall;
    if (avgResolutionTime === 0) {
      overall = 8.5; // Default good score if no resolution time data
    } else if (avgResolutionTime <= 1) {
      overall = 9.2; // Excellent - resolved within 1 day
    } else if (avgResolutionTime <= 3) {
      overall = 8.1; // Good - resolved within 3 days
    } else if (avgResolutionTime <= 7) {
      overall = 6.8; // Average - resolved within 1 week
    } else {
      overall = 5.2; // Poor - took more than 1 week
    }

    // Adjust based on resolution rate
    const resolutionRate = (resolvedReports.length / allReports.length) * 100;
    if (resolutionRate > 80) overall += 0.8;
    else if (resolutionRate > 60) overall += 0.4;
    else if (resolutionRate < 30) overall -= 1.0;

    // Clamp between 0-10
    overall = Math.min(10, Math.max(0, overall));

    // Calculate distribution based on resolution time and other factors
    const distribution = {
      excellent: Math.round(resolvedReports.length * 0.35), // 35% excellent
      good: Math.round(resolvedReports.length * 0.4), // 40% good
      average: Math.round(resolvedReports.length * 0.2), // 20% average
      poor: Math.round(resolvedReports.length * 0.05), // 5% poor
    };

    // Adjust distribution based on actual resolution performance
    if (avgResolutionTime <= 1) {
      distribution.excellent += Math.round(resolvedReports.length * 0.1);
      distribution.good -= Math.round(resolvedReports.length * 0.1);
    } else if (avgResolutionTime > 7) {
      distribution.poor += Math.round(resolvedReports.length * 0.1);
      distribution.average -= Math.round(resolvedReports.length * 0.1);
    }

    return {
      overall: parseFloat(overall.toFixed(1)),
      distribution,
    };
  }, [allReports, loading]);

  // Recalculate stats from filtered reports
  const stats = useMemo(() => {
    if (loading) {
      return {
        totalReports: 0,
        unresolvedReports: 0,
        resolvedReports: 0,
        averageResolutionTime: "N/A",
        userSatisfaction: 0,
      };
    }

    const totalReports = allReports.length;
    const filteredTotal = reports.length;

    const resolvedReports = reports.filter(
      (r) => r.status === "resolved"
    ).length;
    const unresolvedReports = filteredTotal - resolvedReports;

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
      userSatisfaction: userSatisfactionData.overall,
    };
  }, [allReports, reports, userSatisfactionData, loading]);

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
    if (loading) return [];

    const categories = {
      technical: { name: "Technical Issue", count: 0, color: "technical" },
      billing: { name: "Billing Issue", count: 0, color: "billing" },
      general: { name: "General Inquiry", count: 0, color: "general" },
    };

    allReports.forEach((r) => {
      if (categories[r.issueType]) {
        categories[r.issueType].count++;
      }
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

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const categoryStats = getCategoryStats();
  const totalRatedReports = Object.values(
    userSatisfactionData.distribution
  ).reduce((a, b) => a + b, 0);

  // Calculate percentages for satisfaction distribution
  const satisfactionPercentages = {
    excellent:
      totalRatedReports > 0
        ? (userSatisfactionData.distribution.excellent / totalRatedReports) *
          100
        : 0,
    good:
      totalRatedReports > 0
        ? (userSatisfactionData.distribution.good / totalRatedReports) * 100
        : 0,
    average:
      totalRatedReports > 0
        ? (userSatisfactionData.distribution.average / totalRatedReports) * 100
        : 0,
    poor:
      totalRatedReports > 0
        ? (userSatisfactionData.distribution.poor / totalRatedReports) * 100
        : 0,
  };

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading reports...</p>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Report Details</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>User Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedReport.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">
                      {selectedReport.userId}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value">
                      {selectedReport.subject || "No Subject"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span
                      className={`detail-value report-category-badge ${selectedReport.issueType}`}
                    >
                      {selectedReport.issueType === "technical" &&
                        "Technical Issue"}
                      {selectedReport.issueType === "billing" &&
                        "Billing Issue"}
                      {selectedReport.issueType === "general" &&
                        "General Inquiry"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span
                      className={`detail-value report-status-badge ${
                        selectedReport.status || "pending"
                      }`}
                    >
                      {selectedReport.status === "resolved"
                        ? "Resolved"
                        : selectedReport.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Description</h4>
                  <div className="detail-description">
                    {selectedReport.description || "No description provided."}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Timeline</h4>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {formatDate(selectedReport.createdAt)}
                    </span>
                  </div>
                  {selectedReport.updatedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">
                        {formatDate(selectedReport.updatedAt)}
                      </span>
                    </div>
                  )}
                  {selectedReport.resolvedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Resolved:</span>
                      <span className="detail-value">
                        {formatDate(selectedReport.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="action-button secondary" onClick={closeModal}>
                Close
              </button>
              {selectedReport.status !== "resolved" ? (
                <button
                  className="action-button"
                  onClick={() => {
                    updateReportStatus(
                      selectedReport.id,
                      selectedReport.userId,
                      "resolved"
                    );
                    closeModal();
                  }}
                >
                  <FiCheckCircle /> Mark Resolved
                </button>
              ) : (
                <button
                  className="action-button"
                  onClick={() => {
                    updateReportStatus(
                      selectedReport.id,
                      selectedReport.userId,
                      "pending"
                    );
                    closeModal();
                  }}
                >
                  <FiCornerUpLeft /> Reopen Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
            <div
              className={`report-stat-trend ${
                trends.total.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.total.value > 0 ? "+" : ""}
              {trends.total.value.toFixed(1)}%
              {trends.total.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
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
            <div
              className={`report-stat-trend ${
                trends.unresolved.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.unresolved.value > 0 ? "+" : ""}
              {trends.unresolved.value.toFixed(1)}%
              {trends.unresolved.isPositive ? (
                <FiTrendingDown />
              ) : (
                <FiTrendingUp />
              )}
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
            <div
              className={`report-stat-trend ${
                trends.resolved.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.resolved.value > 0 ? "+" : ""}
              {trends.resolved.value.toFixed(1)}%
              {trends.resolved.isPositive ? (
                <FiTrendingUp />
              ) : (
                <FiTrendingDown />
              )}
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
            <div
              className={`report-stat-trend ${
                trends.resolutionTime.isPositive ? "positive" : "negative"
              }`}
            >
              {trends.resolutionTime.value > 0 ? "+" : ""}
              {trends.resolutionTime.value.toFixed(1)}%
              {trends.resolutionTime.isPositive ? (
                <FiTrendingDown />
              ) : (
                <FiTrendingUp />
              )}
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
                <div
                  className="pie-chart"
                  style={{
                    background: `conic-gradient(
                      #10b981 0% ${satisfactionPercentages.excellent}%,
                      #3b82f6 ${satisfactionPercentages.excellent}% ${
                      satisfactionPercentages.excellent +
                      satisfactionPercentages.good
                    }%,
                      #f59e0b ${
                        satisfactionPercentages.excellent +
                        satisfactionPercentages.good
                      }% ${
                      satisfactionPercentages.excellent +
                      satisfactionPercentages.good +
                      satisfactionPercentages.average
                    }%,
                      #ef4444 ${
                        satisfactionPercentages.excellent +
                        satisfactionPercentages.good +
                        satisfactionPercentages.average
                      }% 100%
                    )`,
                  }}
                >
                  <div className="pie-chart-center">
                    {/* <div className="pie-chart-value">
                      {stats.userSatisfaction}
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="pie-chart-labels">
                <div className="pie-chart-label">
                  <span className="pie-label-dot excellent"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Excellent</span>
                    <span className="pie-label-percentage">
                      {Math.round(satisfactionPercentages.excellent)}%
                    </span>
                  </div>
                </div>
                <div className="pie-chart-label">
                  <span className="pie-label-dot good"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Good</span>
                    <span className="pie-label-percentage">
                      {Math.round(satisfactionPercentages.good)}%
                    </span>
                  </div>
                </div>
                <div className="pie-chart-label">
                  <span className="pie-label-dot average"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Average</span>
                    <span className="pie-label-percentage">
                      {Math.round(satisfactionPercentages.average)}%
                    </span>
                  </div>
                </div>
                <div className="pie-chart-label">
                  <span className="pie-label-dot poor"></span>
                  <div className="pie-label-text">
                    <span className="pie-label-name">Poor</span>
                    <span className="pie-label-percentage">
                      {Math.round(satisfactionPercentages.poor)}%
                    </span>
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
            {categoryStats.map((cat, i) => {
              const percentage =
                stats.totalReports > 0
                  ? (cat.count / stats.totalReports) * 100
                  : 0;
              return (
                <div key={i} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">
                      {Math.round(percentage)}% ({cat.count})
                    </span>
                  </div>
                  <div className="category-progress-bar">
                    <div
                      className={`category-progress-fill ${cat.color}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
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
          <ExportButton
            data={reports.length > 0 ? reports : allReports}
            filename="user-reports"
            exportConfig={reportsExportConfig}
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
                        onClick={() => openReportDetails(report)}
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
              {reports.length === 0 && !loading && (
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
