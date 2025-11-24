import React, { useState, useEffect } from "react";
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
  FiPieChart
} from "react-icons/fi";
import ExportButton from "../../../ExportButton";
import { reportsExportConfig } from "../../../../utils/exportUtils";


const PaymentPlan = ({ users, formatCurrency, formatDate }) => {
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [expandedSubscription, setExpandedSubscription] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  

  // Default format functions agar props mein nahi aaye
  const defaultFormatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const defaultFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Use provided functions or defaults
  const currencyFormatter = formatCurrency || defaultFormatCurrency;
  const dateFormatter = formatDate || defaultFormatDate;

  // Mock subscription data - in real app, ye Firebase se aayega
  const mockSubscriptions = [
    {
      id: "sub_001",
      userId: "user1",
      userName: "John Doe",
      userEmail: "john@example.com",
      plan: "Professional",
      status: "active",
      billingCycle: "Monthly",
      price: 29.99,
      nextBillingDate: "2024-01-15",
      startDate: "2023-06-15",
      paymentMethod: "Visa ending in 4242",
      features: ["100 GB Storage", "Unlimited Projects", "Priority Support"],
      joinDate: "2023-05-10",
      lastLogin: "2024-01-10",
      downloads: 45,
      totalSpent: 179.94,
      location: "New York, USA"
    },
    {
      id: "sub_002",
      userId: "user2",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      plan: "Enterprise",
      status: "active",
      billingCycle: "Yearly",
      price: 299.99,
      nextBillingDate: "2024-06-15",
      startDate: "2023-12-15",
      paymentMethod: "Mastercard ending in 8888",
      features: ["1 TB Storage", "Unlimited Projects", "24/7 Support"],
      joinDate: "2023-11-20",
      lastLogin: "2024-01-12",
      downloads: 128,
      totalSpent: 299.99,
      location: "London, UK"
    },
    {
      id: "sub_003",
      userId: "user3",
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      plan: "Starter",
      status: "expired",
      billingCycle: "Monthly", 
      price: 9.99,
      nextBillingDate: "2023-11-15",
      startDate: "2023-05-15",
      paymentMethod: "PayPal",
      features: ["10 GB Storage", "5 Projects", "Basic Support"],
      joinDate: "2023-04-05",
      lastLogin: "2023-11-10",
      downloads: 8,
      totalSpent: 59.94,
      location: "Toronto, Canada"
    },
    {
      id: "sub_004",
      userId: "user4",
      userName: "Sarah Wilson",
      userEmail: "sarah@example.com",
      plan: "Professional", 
      status: "pending",
      billingCycle: "Monthly",
      price: 29.99,
      nextBillingDate: "2024-02-01",
      startDate: "2024-01-01",
      paymentMethod: "Amex ending in 1001",
      features: ["100 GB Storage", "Unlimited Projects", "Priority Support"],
      joinDate: "2023-12-28",
      lastLogin: "2024-01-15",
      downloads: 12,
      totalSpent: 29.99,
      location: "Sydney, Australia"
    }
  ];

  // Initialize data
  useEffect(() => {
    setSubscriptionData(mockSubscriptions);
    setFilteredUsers(users || []);
  }, [users]);

  // Filter subscriptions
  useEffect(() => {
    let filtered = mockSubscriptions;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }
    
    if (planFilter !== "all") {
      filtered = filtered.filter(sub => sub.plan === planFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setSubscriptionData(filtered);
  }, [searchTerm, statusFilter, planFilter]);

  // Stats calculation
  const stats = {
    totalSubscriptions: subscriptionData.length,
    activeSubscriptions: subscriptionData.filter(sub => sub.status === 'active').length,
    totalRevenue: subscriptionData
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.price, 0),
    pendingSubscriptions: subscriptionData.filter(sub => sub.status === 'pending').length
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
      case "active": return "Active";
      case "expired": return "Expired";
      case "pending": return "Pending";
      case "canceled": return "Canceled";
      default: return "Unknown";
    }
  };

  // Handle subscription actions
  const handleSubscriptionAction = (action, subscriptionId) => {
    console.log(`${action} subscription: ${subscriptionId}`);
    alert(`${action} action triggered for subscription ${subscriptionId}`);
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
 // Export handler with callbacks
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



  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiCreditCard className="header-icon" />
            Payment & Subscription Management
          </h2>
          <p className="header-subtitle">
            Manage subscriptions, billing, and payment methods for all users
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">{stats.totalSubscriptions} total subscriptions</span>
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
              <div className="report-stat-value">{stats.totalSubscriptions}</div>
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
              <div className="report-stat-value">{stats.activeSubscriptions}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Currently active plans
            </div>
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
              <div className="report-stat-value">{currencyFormatter(stats.totalRevenue)}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Recurring monthly income
            </div>
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
              <div className="report-stat-value">{stats.pendingSubscriptions}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Awaiting activation
            </div>
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
            <span className="filter-text">Showing {subscriptionData.length} of {mockSubscriptions.length} subscriptions</span>
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
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="canceled">Canceled</option>
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
          <select className="filter-select">
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
            <button 
              className="filter-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPlanFilter("all");
              }}
            >
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
    data={subscriptionData.length > 0 ? subscriptionData : mockSubscriptions}
    filename="subscription-reports"
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
                <th>Plan</th>
                <th>Billing</th>
                <th>Status</th>
                <th>Next Billing</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionData.map((subscription) => (
                <tr key={subscription.id}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-avatar">
                        {subscription.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="report-user-info">
                        <div className="report-user-name">{subscription.userName}</div>
                        <div className="report-user-email">{subscription.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`report-category-badge ${
                      subscription.plan === 'Enterprise' ? 'fraud' : 
                      subscription.plan === 'Professional' ? 'content' : 'spam'
                    }`}>
                      {subscription.plan}
                    </span>
                  </td>
                  <td>
                    <div className="comp-dis">
                      {currencyFormatter(subscription.price)}/{subscription.billingCycle}
                    </div>
                  </td>
                  <td>
                    <span className={`report-status-badge ${
                      subscription.status === 'active' ? 'resolved' :
                      subscription.status === 'pending' ? 'pending' : 'in-progress'
                    }`}>
                      {getStatusText(subscription.status)}
                    </span>
                  </td>
                  <td>{dateFormatter(subscription.nextBillingDate)}</td>
                  <td>
                    <div className="comp-dis">{currencyFormatter(subscription.totalSpent)}</div>
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
                        onClick={() => handleSubscriptionAction('manage', subscription.id)}
                      >
                        <FiRefreshCw />
                      </button>
                      {subscription.status === 'active' && (
                        <button 
                          className="action-button danger small" 
                          title="Cancel Subscription"
                          onClick={() => handleSubscriptionAction('cancel', subscription.id)}
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

          {subscriptionData.length === 0 && (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <h3 className="empty-title">No subscriptions found</h3>
              <p className="empty-text">
                {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                  ? "Try adjusting your search filters" 
                  : "No subscriptions available"}
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
                    {selectedSubscription.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{selectedSubscription.userName}</h2>
                  <p className="profile-email">{selectedSubscription.userEmail}</p>
                  <div className="user-badges">
                    <span className={`status-badge ${getStatusColor(selectedSubscription.status)}`}>
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
                  <div className="stat-value currency">{currencyFormatter(selectedSubscription.totalSpent)}</div>
                  <div className="stat-label">
                    <FiDollarSign className="stat-icon" />
                    Total Spent
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-value downloads">{selectedSubscription.downloads}</div>
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
                      {selectedSubscription.plan} • {selectedSubscription.billingCycle}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Price</span>
                    <span className="detail-value">
                      <FiDollarSign className="detail-icon" />
                      {currencyFormatter(selectedSubscription.price)}
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
                      {selectedSubscription.paymentMethod}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">
                      <FiMapPin className="detail-icon" />
                      {selectedSubscription.location}
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
                  {selectedSubscription.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="action-button secondary" onClick={handleCloseModal}>
                  Close
                </button>
                <button 
                  className="action-button" 
                  onClick={() => handleSubscriptionAction('manage', selectedSubscription.id)}
                >
                  <FiRefreshCw className="button-icon" />
                  Manage Subscription
                </button>
                {selectedSubscription.status === 'active' && (
                  <button 
                    className="action-button danger"
                    onClick={() => {
                      handleSubscriptionAction('cancel', selectedSubscription.id);
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

    </div>
  );
};

export default PaymentPlan;