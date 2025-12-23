import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiPackage,
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiTrendingUp,
  FiActivity,
  FiStar,
  FiDownload,
  FiShoppingCart,
  FiMapPin,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiList,
  FiFileText,
  FiAlertCircle,
  FiPieChart,
} from "react-icons/fi";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";
import { exportPaymentsData } from "../../../../utils/exportUtils";
import { doc, updateDoc } from "firebase/firestore";

const PaymentPlan = ({ users, formatCurrency, formatDate }) => {
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [billingCycle, setBillingCycle] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default format functions
  const defaultFormatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const defaultFormatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const currencyFormatter = formatCurrency || defaultFormatCurrency;
  const dateFormatter = formatDate || defaultFormatDate;

  // 🔥 Firebase Data Fetching
  // 🔥 Firebase Data Fetching - Updated to use Profiles collection
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const profilesRef = collection(db, "Profiles");
        const q = query(profilesRef, where("subscription", "!=", null));

        // Real-time listener
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const subscriptions = [];
            querySnapshot.forEach((doc) => {
              const profileData = doc.data();
              const subscriptionData = profileData.subscription || {};

              // Only add if subscription exists and has required fields
              if (subscriptionData.plan && subscriptionData.status) {
                subscriptions.push({
                  id: doc.id,
                  uid: profileData.uid,
                  userName:
                    profileData.username ||
                    `${profileData.firstName || ""} ${
                      profileData.lastName || ""
                    }`.trim() ||
                    "Unknown User",
                  userEmail: profileData.email || "No email",
                  plan: subscriptionData.plan || "No Plan",
                  type: subscriptionData.type || "individual",
                  status: subscriptionData.status || "active",
                  price: subscriptionData.price || 0,
                  billingCycle: subscriptionData.billingCycle || "monthly",
                  startDate: subscriptionData.startDate
                    ? subscriptionData.startDate.toDate
                      ? subscriptionData.startDate.toDate().toISOString()
                      : subscriptionData.startDate
                    : new Date().toISOString(),
                  nextBillingDate: subscriptionData.expiresAt
                    ? subscriptionData.expiresAt.toDate
                      ? subscriptionData.expiresAt.toDate().toISOString()
                      : subscriptionData.expiresAt
                    : "N/A",
                  totalSpent: profileData.totalEarnings || 0,
                  totalDownloads: profileData.totalDownloads || 0,
                  downloadLimit: subscriptionData.downloadLimit || 0,
                  downloadsUsed: subscriptionData.downloadsUsed || 0,
                  location: "N/A", // You can add location field if available
                  features: getPlanFeatures(subscriptionData.plan),
                });
              }
            });
            setSubscriptionData(subscriptions);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("Firebase error:", error);
            setError("Failed to load subscription data");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscription data");
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);
  // Helper function to get plan features based on plan type
  const getPlanFeatures = (planType) => {
    const featuresMap = {
      individual: ["200 Downloads/Month", "Basic Support", "Standard Quality"],
      team: [
        "500 Downloads/Month",
        "Priority Support",
        "HQ Quality",
        "Team Management",
      ],
      enterprise: [
        "Unlimited Downloads",
        "24/7 Support",
        "4K Quality",
        "Advanced Analytics",
        "Custom Solutions",
      ],
    };

    return featuresMap[planType?.toLowerCase()] || ["Standard Features"];
  };
  // Dynamic Stats Calculation
  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    const totalSubscriptions = subscriptionData.length;
    const activeSubscriptions = subscriptionData.filter(
      (sub) => sub.status === "active"
    ).length;
    const totalRevenue = subscriptionData
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => sum + (sub.price || 0), 0);
    const pendingSubscriptions = subscriptionData.filter(
      (sub) => sub.status === "pending"
    ).length;

    // Calculate total downloads used vs limit
    const totalDownloadsUsed = subscriptionData.reduce(
      (sum, sub) => sum + (sub.downloadsUsed || 0),
      0
    );
    const totalDownloadLimit = subscriptionData.reduce(
      (sum, sub) => sum + (sub.downloadLimit || 0),
      0
    );

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalRevenue,
      pendingSubscriptions,
      totalDownloadsUsed,
      totalDownloadLimit,
    };
  }, [subscriptionData]);

  // Dynamic Filtering
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptionData;

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((sub) => sub.plan === planFilter);
    }

    if (billingCycle !== "all") {
      filtered = filtered.filter(
        (sub) => sub.billingCycle?.toLowerCase() === billingCycle.toLowerCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.userName?.toLowerCase().includes(term) ||
          sub.userEmail?.toLowerCase().includes(term) ||
          sub.plan?.toLowerCase().includes(term) ||
          sub.location?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [subscriptionData, statusFilter, planFilter, billingCycle, searchTerm]);

  // ✅ FIXED: Prepare data for export function (was missing)
  const prepareExportData = (subscriptions) => {
    return subscriptions.map((sub) => ({
      userName: sub.userName || "Unknown User",
      userEmail: sub.userEmail || "No email",
      amount: sub.price || 0,
      plan: sub.plan || "No Plan",
      status: sub.status || "unknown",
      paymentDate: sub.startDate || "N/A",
      billingCycle: sub.billingCycle || "N/A",
      nextBillingDate: sub.nextBillingDate || "N/A",
      totalSpent: sub.totalSpent || 0,
      location: sub.location || "N/A",
    }));
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FiCheckCircle className="text-green-500" />;
      case "expired":
        return <FiXCircle className="text-red-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "canceled":
        return <FiXCircle className="text-gray-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "status-active";
      case "expired":
        return "status-expired";
      case "pending":
        return "status-pending";
      case "canceled":
        return "status-canceled";
      default:
        return "status-pending";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "expired":
        return "Expired";
      case "pending":
        return "Pending";
      case "canceled":
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  // Handle subscription actions
  // Handle subscription actions
  const handleSubscriptionAction = async (
    action,
    subscriptionId,
    subscription
  ) => {
    try {
      console.log(`${action} subscription for user: ${subscription.userName}`);

      // Here you would add Firebase update logic for Profiles collection
      // Example:
      // import { doc, updateDoc } from "firebase/firestore";
      // const profileRef = doc(db, "Profiles", subscriptionId);
      // const updateData = {};
      //
      // if (action === "cancel") {
      //   updateData["subscription.status"] = "canceled";
      // } else if (action === "activate") {
      //   updateData["subscription.status"] = "active";
      // }
      //
      // await updateDoc(profileRef, updateData);

      alert(
        `${action} action triggered for ${subscription.userName}'s subscription`
      );

      // Update local state for immediate feedback
      setSubscriptionData((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId
            ? {
                ...sub,
                status:
                  action === "cancel"
                    ? "canceled"
                    : action === "activate"
                    ? "active"
                    : action === "expire"
                    ? "expired"
                    : sub.status,
              }
            : sub
        )
      );
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      alert(`Error: ${error.message}`);
    }
  };
  // Handle payment download
  const handleDownloadInvoice = (invoiceId) => {
    console.log(`Downloading invoice: ${invoiceId}`);
    alert(`Downloading invoice ${invoiceId}`);
  };

  // View subscription details in modal
  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowSubscriptionModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowSubscriptionModal(false);
    setSelectedSubscription(null);
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

  // Refresh data
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const subscriptionsRef = collection(db, "subscriptions");
      const q = query(subscriptionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const subscriptions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubscriptionData(subscriptions);
      setError(null);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPlanFilter("all");
    setBillingCycle("all");
  };

  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading subscriptions...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiCreditCard className="header-icon" />
            Payment & Subscription Management
            {loading && <span className="loading-badge">Loading...</span>}
          </h2>
          <p className="header-subtitle">
            Manage subscriptions, billing, and payment methods for all users
            {error && <span className="error-text"> • {error}</span>}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="action-button secondary"
            onClick={handleRefreshData}
            disabled={loading}
          >
            Refresh Data
          </button>
          <span className="user-badge-count">
            {stats.totalSubscriptions} total subscriptions
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        {/* Total Subscriptions */}
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Total Subscriptions</h3>
              <div className="report-stat-value">
                {stats.totalSubscriptions}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              All active and inactive plans
            </div>
            <div className="report-stat-trend positive">
              +12%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiActivity />
            </div>
            <div>
              <h3 className="report-stat-title">Active Subscriptions</h3>
              <div className="report-stat-value">
                {stats.activeSubscriptions}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Currently active plans</div>
            <div className="report-stat-trend positive">
              +8%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Monthly Revenue</h3>
              <div className="report-stat-value">
                {currencyFormatter(stats.totalRevenue)}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Recurring monthly income</div>
            <div className="report-stat-trend positive">
              +15%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        {/* Pending Subscriptions */}
        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Pending Subscriptions</h3>
              <div className="report-stat-value">
                {stats.pendingSubscriptions}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Awaiting activation</div>
            <div className="report-stat-trend negative">
              +5%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" />
            Filter Subscriptions
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredSubscriptions.length} of{" "}
              {subscriptionData.length} subscriptions
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
              placeholder="Search by name, email, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          {/* Plan Filter */}
          <select
            className="filter-select"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
            <option value="enterprise">Enterprise</option>
          </select>
          {/* Plan Filter */}
          <select
            className="filter-select"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {/* Billing Cycle Filter */}
          <select
            className="filter-select"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
          >
            <option value="all">All Cycles</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="filter-button primary">
              <FiFilter />
              Apply
            </button>
            <button className="filter-button" onClick={handleResetFilters}>
              <FiRefreshCw />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" />
            Subscription Management
          </h3>
          <ExportButton
            data={prepareExportData(
              filteredSubscriptions.length > 0
                ? filteredSubscriptions
                : subscriptionData
            )}
            filename="subscription-reports"
            onExport={(format) =>
              exportPaymentsData(
                prepareExportData(
                  filteredSubscriptions.length > 0
                    ? filteredSubscriptions
                    : subscriptionData
                ),
                format
              )
            }
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
                <th>Plan</th>
                <th>Billing</th>
                <th>Status</th>
                <th>Downloads Used</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {subscription.userName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">
                          {subscription.userName || "Unknown User"}
                        </div>
                        <div className="report-user-email">
                          {subscription.userEmail || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>

                 

                  {/* Plan Column (NEW) */}
                  <td>
                    <span
                      className={`report-category-badge ${
                        subscription.type === "team" ? "team" : "individual"
                      }`}
                    >
                      {subscription.type || "individual"}
                    </span>
                  </td>

                  <td>
                    <div className="comp-dis">
                      {currencyFormatter(subscription.price || 0)}/
                      {subscription.billingCycle || "N/A"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`report-status-badge ${
                        subscription.status === "active"
                          ? "resolved"
                          : subscription.status === "pending"
                          ? "pending"
                          : "in-progress"
                      }`}
                    >
                      {getStatusText(subscription.status)}
                    </span>
                  </td>

                  {/* Downloads Used Column (NEW) - Next Billing ki jagah */}
                  <td>
                    <div className="downloads-usage">
                      <div className="usage-bar">
                        <div
                          className={`usage-fill ${
                            (subscription.downloadsUsed || 0) >=
                            (subscription.downloadLimit || 1)
                              ? "exceeded"
                              : "normal"
                          }`}
                          style={{
                            width: `${Math.min(
                              ((subscription.downloadsUsed || 0) /
                                (subscription.downloadLimit || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="usage-text">
                        {subscription.downloadsUsed || 0} /{" "}
                        {subscription.downloadLimit || 0}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="comp-dis">
                      {currencyFormatter(subscription.totalSpent || 0)}
                    </div>
                  </td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => handleViewSubscription(subscription)}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="action-button small"
                        title="Manage Subscription"
                        onClick={() =>
                          handleSubscriptionAction(
                            "manage",
                            subscription.id,
                            subscription
                          )
                        }
                      >
                        <FiRefreshCw />
                      </button>
                      {subscription.status === "active" && (
                        <button
                          className="action-button danger small"
                          title="Cancel Subscription"
                          onClick={() =>
                            handleSubscriptionAction(
                              "cancel",
                              subscription.id,
                              subscription
                            )
                          }
                        >
                          <FiXCircle />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscriptions.length === 0 && !loading && (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <h3 className="empty-title">No subscriptions found</h3>
              <p className="empty-text">
                {searchTerm ||
                statusFilter !== "all" ||
                planFilter !== "all" ||
                billingCycle !== "all"
                  ? "Try adjusting your search filters"
                  : "No subscriptions available in the system"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Details Modal */}
      {showSubscriptionModal && selectedSubscription && (
        <div className="modal-overlay">
          <div className="modal enhanced-modal user-details-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiUser className="modal-icon" />
                Subscription Details
              </h3>
              <button className="close-button" onClick={handleCloseModal}>
                <FiXCircle />
              </button>
            </div>

            <div className="modal-body">
              {/* User Profile Header */}
              <div className="user-profile-header">
                <div className="profile-avatar">
                  <div className="avatar-initials large">
                    {selectedSubscription.userName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </div>
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">
                    {selectedSubscription.userName || "Unknown User"}
                  </h2>
                  <p className="profile-email">
                    {selectedSubscription.userEmail || "No email"}
                  </p>
                  <div className="user-badges">
                    <span
                      className={`status-badge ${getStatusColor(
                        selectedSubscription.status
                      )}`}
                    >
                      {getStatusIcon(selectedSubscription.status)}
                      {getStatusText(selectedSubscription.status)}
                    </span>
                    <span className="verification-badge">
                      <FiCheckCircle className="verify-icon" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value currency">
                    {currencyFormatter(selectedSubscription.totalSpent || 0)}
                  </div>
                  <div className="stat-label">
                    <FiDollarSign className="stat-icon" />
                    Total Spent
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-value downloads">
                    {selectedSubscription.downloads || 0}
                  </div>
                  <div className="stat-label">
                    <FiDownload className="stat-icon" />
                    Downloads
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="user-details-section">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Subscription Plan</span>
                    <span className="detail-value">
                      <FiPackage className="detail-icon" />
                      {selectedSubscription.plan || "No Plan"} •{" "}
                      {selectedSubscription.billingCycle || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Price</span>
                    <span className="detail-value">
                      <FiDollarSign className="detail-icon" />
                      {currencyFormatter(selectedSubscription.price || 0)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Start Date</span>
                    <span className="detail-value">
                      <FiCalendar className="detail-icon" />
                      {dateFormatter(selectedSubscription.startDate)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Next Billing</span>
                    <span className="detail-value">
                      <FiCalendar className="detail-icon" />
                      {dateFormatter(selectedSubscription.nextBillingDate)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method</span>
                    <span className="detail-value">
                      <FiCreditCard className="detail-icon" />
                      {selectedSubscription.paymentMethod || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">
                      <FiMapPin className="detail-icon" />
                      {selectedSubscription.location || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="user-details-section">
                <h4 className="section-title">
                  <FiPackage className="section-icon" />
                  Plan Features
                </h4>
                <div className="features-list-das">
                  {(selectedSubscription.features || []).map(
                    (feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    )
                  )}
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
                <button
                  className="action-button"
                  onClick={() =>
                    handleSubscriptionAction(
                      "manage",
                      selectedSubscription.id,
                      selectedSubscription
                    )
                  }
                >
                  <FiRefreshCw className="button-icon" />
                  Manage Subscription
                </button>
                {selectedSubscription.status === "active" && (
                  <button
                    className="action-button danger"
                    onClick={() => {
                      handleSubscriptionAction(
                        "cancel",
                        selectedSubscription.id,
                        selectedSubscription
                      );
                      handleCloseModal();
                    }}
                  >
                    <FiXCircle className="button-icon" />
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        .error-text {
          color: #ef4444;
          margin-left: 1rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default PaymentPlan;
