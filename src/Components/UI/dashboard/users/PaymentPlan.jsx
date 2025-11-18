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
  FiEye
} from "react-icons/fi";

const PaymentPlan = ({ users, formatCurrency, formatDate }) => {
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

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
      features: ["100 GB Storage", "Unlimited Projects", "Priority Support"]
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
      features: ["1 TB Storage", "Unlimited Projects", "24/7 Support"]
    },
    {
      id: "sub_003",
      userId: "user3",
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      plan: "Basic",
      status: "expired",
      billingCycle: "Monthly", 
      price: 9.99,
      nextBillingDate: "2023-11-15",
      startDate: "2023-05-15",
      paymentMethod: "PayPal",
      features: ["10 GB Storage", "5 Projects", "Basic Support"]
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
      features: ["100 GB Storage", "Unlimited Projects", "Priority Support"]
    }
  ];

  // Available plans
  const availablePlans = [
    { 
      name: "Basic", 
      price: "$9.99", 
      originalPrice: "$12.99",
      period: "month",
      popular: false,
      features: ["10 GB Storage", "5 Projects", "Basic Support", "Community Access"],
      description: "Perfect for getting started"
    },
    { 
      name: "Professional", 
      price: "$29.99", 
      originalPrice: "$39.99",
      period: "month", 
      popular: true,
      features: ["100 GB Storage", "Unlimited Projects", "Priority Support", "Team Collaboration", "Advanced Analytics"],
      description: "Best for professionals & teams"
    },
    { 
      name: "Enterprise", 
      price: "$99.99", 
      originalPrice: "$129.99",
      period: "month",
      popular: false,
      features: ["1 TB Storage", "Unlimited Projects", "24/7 Support", "Custom Branding", "Advanced Security", "Dedicated Manager"],
      description: "For large teams & organizations"
    }
  ];

  // Available billing cycles
  const billingCycles = [
    { id: "monthly", name: "Monthly", discount: "" },
    { id: "yearly", name: "Yearly", discount: "Save 20%" },
    { id: "lifetime", name: "Lifetime", discount: "Best Value" }
  ];

  // Payment history mock data
  const paymentHistory = [
    { id: 1, userId: "user1", userName: "John Doe", date: "2023-12-15", amount: 29.99, status: "completed", invoice: "INV-001" },
    { id: 2, userId: "user1", userName: "John Doe", date: "2023-11-15", amount: 29.99, status: "completed", invoice: "INV-002" },
    { id: 3, userId: "user2", userName: "Jane Smith", date: "2023-12-15", amount: 299.99, status: "completed", invoice: "INV-003" },
    { id: 4, userId: "user3", userName: "Mike Johnson", date: "2023-10-15", amount: 9.99, status: "refunded", invoice: "INV-004" },
    { id: 5, userId: "user4", userName: "Sarah Wilson", date: "2024-01-01", amount: 29.99, status: "pending", invoice: "INV-005" }
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
    // Yahan Firebase integration hogi
    alert(`${action} action triggered for subscription ${subscriptionId}`);
  };

  // Handle payment download
  const handleDownloadInvoice = (invoiceId) => {
    console.log(`Downloading invoice: ${invoiceId}`);
    alert(`Downloading invoice ${invoiceId}`);
  };

  return (
    <div className="payment-plan-container">
      <div className="payment-plan-content">
        {/* Header */}
        <div className="payment-plan-header">
          <h1 className="payment-plan-title">Payment & Plan Management</h1>
          <p className="payment-plan-subtitle">
            Manage subscriptions, billing, and payment methods for all users
          </p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <FiUsers className="stat-icon" />
              </div>
              <div className="stat-text">
                <div className="stat-value">{stats.totalSubscriptions}</div>
                <div className="stat-label">Total Subscriptions</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <FiActivity className="stat-icon" />
              </div>
              <div className="stat-text">
                <div className="stat-value">{stats.activeSubscriptions}</div>
                <div className="stat-label">Active Subscriptions</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <FiDollarSign className="stat-icon" />
              </div>
              <div className="stat-text">
                <div className="stat-value">{currencyFormatter(stats.totalRevenue)}</div>
                <div className="stat-label">Monthly Revenue</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <FiClock className="stat-icon" />
              </div>
              <div className="stat-text">
                <div className="stat-value">{stats.pendingSubscriptions}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-plan-grid">
          {/* Left Column - Subscriptions List */}
          <div className="payment-side">
            {/* Filters */}
            <div className="payment-plan-card">
              <div className="filters-grid">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="canceled">Canceled</option>
                </select>
                
                <select 
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Plans</option>
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                
                <div className="filter-result">
                  <span>{subscriptionData.length} subscriptions found</span>
                </div>
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="payment-plan-card">
              <h2 className="plan-title mb-6">Active Subscriptions</h2>
              
              {subscriptionData.length > 0 ? (
                <div className="subscriptions-list">
                  {subscriptionData.map((subscription) => (
                    <div key={subscription.id} className="subscription-item">
                      <div className="subscription-header">
                        <div className="subscription-info">
                          <h3 className="subscription-user">{subscription.userName}</h3>
                          <p className="subscription-email">{subscription.userEmail}</p>
                          <p className="subscription-plan">{subscription.plan} Plan • {subscription.billingCycle}</p>
                        </div>
                        <span className={`status-badge ${getStatusColor(subscription.status)}`}>
                          {getStatusIcon(subscription.status)}
                          <span className="ml-1">{getStatusText(subscription.status)}</span>
                        </span>
                      </div>
                      
                      <div className="subscription-details">
                        <div className="detail-row">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">{currencyFormatter(subscription.price)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Started:</span>
                          <span className="detail-value">{dateFormatter(subscription.startDate)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Next Billing:</span>
                          <span className="detail-value">{dateFormatter(subscription.nextBillingDate)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Payment Method:</span>
                          <span className="detail-value">{subscription.paymentMethod}</span>
                        </div>
                      </div>
                      
                      <div className="subscription-features">
                        <h4 className="features-title">Features:</h4>
                        <div className="features-list-das">
                          {subscription.features.map((feature, index) => (
                            <span key={index} className="feature-tag">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="subscription-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleSubscriptionAction('view', subscription.id)}
                        >
                          <FiEye className="mr-2" />
                          View Details
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleSubscriptionAction('edit', subscription.id)}
                        >
                          <FiRefreshCw className="mr-2" />
                          Modify
                        </button>
                        {subscription.status === 'active' && (
                          <button 
                            className="btn-danger"
                            onClick={() => handleSubscriptionAction('cancel', subscription.id)}
                          >
                            <FiXCircle className="mr-2" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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

            {/* Payment History */}
            <div className="payment-plan-card">
              <h2 className="plan-title mb-6">Recent Payments</h2>
              
              <div className="overflow-x-auto">
                <table className="payment-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Invoice</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td>{dateFormatter(payment.date)}</td>
                        <td>
                          <div>
                            <div className="font-medium">{payment.userName}</div>
                            <div className="text-sm text-gray-400">{payment.userId}</div>
                          </div>
                        </td>
                        <td>{currencyFormatter(payment.amount)}</td>
                        <td>
                          <span className={`payment-status ${
                            payment.status === 'completed' ? 'status-completed' : 
                            payment.status === 'refunded' ? 'status-refunded' : 'status-pending'
                          }`}>
                            {payment.status === 'completed' ? 
                              <FiCheckCircle className="mr-1" /> : 
                              <FiXCircle className="mr-1" />
                            }
                            {payment.status}
                          </span>
                        </td>
                        <td>{payment.invoice}</td>
                        <td>
                          <button 
                            className="download-link"
                            onClick={() => handleDownloadInvoice(payment.invoice)}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Plans & Billing */}
          <div className="payment-side">
            {/* Available Plans */}
            <div className="payment-plan-card">
              <h2 className="plan-title mb-6">Available Plans</h2>
              
              {/* Billing Cycle Toggle */}
              <div className="billing-cycle-toggle">
                {billingCycles.map((cycle) => (
                  <button
                    key={cycle.id}
                    className={`cycle-option ${cycle.id === 'monthly' ? 'active' : ''}`}
                  >
                    <span className="cycle-name">{cycle.name}</span>
                    {cycle.discount && (
                      <span className="cycle-discount">{cycle.discount}</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="plans-grid">
                {availablePlans.map((plan, index) => (
                  <div 
                    key={index} 
                    className={`plan-option ${plan.popular ? 'plan-option-current' : ''}`}
                  >
                    {plan.popular && (
                      <div className="popular-badge-dash">
                        <FiStar className="mr-1" />
                        Most Popular
                      </div>
                    )}
                    
                    <div className="plan-header-row">
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="price-section">
                        <span className="plan-price">{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="original-price">{plan.originalPrice}</span>
                        )}
                        <span className="plan-period">/{plan.period}</span>
                      </div>
                    </div>
                    
                    <p className="plan-description">{plan.description}</p>
                    
                    <ul className="plan-features">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="plan-feature">
                          <FiCheckCircle className="feature-icon" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      className={`plan-select-btn ${
                        plan.popular ? 'plan-select-btn-current' : 'plan-select-btn-other'
                      }`}
                    >
                      {plan.popular ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Billing Information */}
            <div className="payment-plan-card">
              <h2 className="plan-title mb-4">Billing Overview</h2>
              
              <div className="billing-stats">
                <div className="billing-stat">
                  <span className="stat-label">Monthly Recurring Revenue</span>
                  <span className="stat-value">{currencyFormatter(4580)}</span>
                </div>
                <div className="billing-stat">
                  <span className="stat-label">Active Customers</span>
                  <span className="stat-value">124</span>
                </div>
                <div className="billing-stat">
                  <span className="stat-label">Churn Rate</span>
                  <span className="stat-value">2.3%</span>
                </div>
              </div>
              
              <div className="billing-actions">
                <button className="update-payment-btn">
                  <FiDownload className="update-payment-icon" />
                  Export Reports
                </button>
                <button className="update-payment-btn">
                  <FiTrendingUp className="update-payment-icon" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPlan;