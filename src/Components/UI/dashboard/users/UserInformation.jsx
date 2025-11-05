import React, { useState, useEffect } from "react";
import { FiUsers, FiShield, FiMapPin, FiSearch, FiFilter, FiEye, FiX, FiUserCheck, FiTrash2, FiUser, FiActivity, FiTrendingUp, FiShoppingCart, FiDollarSign, FiDownload, FiCalendar } from "react-icons/fi";

const UserInformation = ({ 
  users, 
  onRoleChange, 
  onUpdateStatus, 
  onDelete, 
  formatCurrency, 
  formatDate 
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("all");
  const [selectedUserStatus, setSelectedUserStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    countries: {},
  });

  // Calculate user statistics
  useEffect(() => {
    if (users.length > 0) {
      const stats = {
        total: users.length,
        active: users.filter((user) => (user.status || "active") === "active").length,
        admins: users.filter((user) => user.role === "admin").length,
        countries: {},
      };

      users.forEach((user) => {
        const country = user.country || user.location || "Unknown";
        stats.countries[country] = (stats.countries[country] || 0) + 1;
      });

      setUserStats(stats);
    }
  }, [users]);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.email || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.name || user.displayName || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.country || "").toLowerCase().includes(userSearchTerm.toLowerCase());

    const matchesRole = selectedUserRole === "all" || user.role === selectedUserRole;
    const matchesStatus = selectedUserStatus === "all" || (user.status || "active") === selectedUserStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserStatusToggle = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await onUpdateStatus(userId, newStatus);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      await onRoleChange(userId, newRole, user.email);
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} user(s) to "${newRole}"?`)) {
      try {
        await Promise.all(
          selectedUsers.map(async (userId) => {
            const user = users.find((u) => u.id === userId);
            if (!user || !user.email) return;
            await onRoleChange(userId, newRole, user.email);
          })
        );
        setSelectedUsers([]);
      } catch (error) {
        console.error("Failed to update user roles:", error);
      }
    }
  };

  // Get top countries
  const topCountries = Object.entries(userStats.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="user-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiUsers className="header-icon" />
            User Management Dashboard
          </h2>
          <p className="header-subtitle">
            Manage and monitor user accounts across your platform
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">{filteredUsers.length} users</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.active}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiShield />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.admins}</div>
            <div className="stat-label">Administrators</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiMapPin />
          </div>
          <div className="stat-content">
            <div className="stat-value">{Object.keys(userStats.countries).length}</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column - Analytics */}
        <div className="analytics-column">
          {/* Country Distribution */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiMapPin className="panel-icon" />
                User Distribution by Country
              </h3>
            </div>
            <div className="card-body">
              {topCountries.length > 0 ? (
                <div className="country-list">
                  {topCountries.map(([country, count]) => (
                    <div key={country} className="country-item">
                      <div className="country-info">
                        <span className="country-name">{country}</span>
                        <span className="country-count">{count} users</span>
                      </div>
                      <div className="country-progress">
                        <div className="progress-bar" style={{ width: `${(count / userStats.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No country data available</div>
              )}
            </div>
          </div>

          {/* Role Distribution */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiShield className="panel-icon" />
                User Roles
              </h3>
            </div>
            <div className="card-body">
              <div className="role-distribution">
                <div className="role-item">
                  <span className="role-label">Admins</span>
                  <span className="role-count">{userStats.admins}</span>
                </div>
                <div className="role-item">
                  <span className="role-label">Moderators</span>
                  <span className="role-count">{users.filter((user) => user.role === "moderator").length}</span>
                </div>
                <div className="role-item">
                  <span className="role-label">Users</span>
                  <span className="role-count">{users.filter((user) => user.role === "user" || !user.role).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - User List */}
        <div className="users-column">
          {/* Filters Card */}
          <div className="content-card filters-card">
            <div className="card-body">
              <div className="filters-grid">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or country..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <select
                  value={selectedUserRole}
                  onChange={(e) => setSelectedUserRole(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={selectedUserStatus}
                  onChange={(e) => setSelectedUserStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>

                <div className="filter-result">
                  <FiFilter className="filter-icon" />
                  <span className="filter-text">{filteredUsers.length} results</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="content-card bulk-actions-card">
              <div className="card-body">
                <div className="bulk-actions">
                  <span className="bulk-selected">{selectedUsers.length} users selected</span>
                  <div className="bulk-buttons">
                    <button onClick={() => handleBulkRoleChange("admin")} className="action-button">
                      Make Admin
                    </button>
                    <button onClick={() => handleBulkRoleChange("moderator")} className="action-button">
                      Make Moderator
                    </button>
                    <button onClick={() => handleBulkRoleChange("user")} className="action-button">
                      Make User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Grid */}
          {filteredUsers.length > 0 ? (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSelect={() => {
                    const newSelected = selectedUsers.includes(user.id)
                      ? selectedUsers.filter((id) => id !== user.id)
                      : [...selectedUsers, user.id];
                    setSelectedUsers(newSelected);
                  }}
                  isSelected={selectedUsers.includes(user.id)}
                  onViewDetails={() => {
                    setSelectedUser(user);
                    setShowUserDialog(true);
                  }}
                  onStatusToggle={handleUserStatusToggle}
                  onRoleChange={handleUserRoleChange}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <div className="content-card">
              <div className="card-body empty-state">
                <FiUsers className="empty-icon" />
                <h3 className="empty-title">No users found</h3>
                <p className="empty-text">
                  {userSearchTerm ? "No users match your search criteria." : "No users are currently registered."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDialog && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowUserDialog(false)}
          onStatusToggle={handleUserStatusToggle}
          onRoleChange={handleUserRoleChange}
          onDelete={onDelete}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// User Card Component
const UserCard = ({
  user,
  onSelect,
  isSelected,
  onViewDetails,
  onStatusToggle,
  onRoleChange,
  formatCurrency,
  formatDate,
}) => {
  const name = user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
  const status = (user.status || "active").toLowerCase();
  const isActive = status === "active";
  const [showUserModal, setShowUserModal] = useState(false);

  return (
    <>
      <div className={`user-card ${isSelected ? "selected" : ""}`}>
        <div className="user-card-header">
          <div className="user-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt={name} className="avatar-img" />
            ) : (
              <div className="avatar-initials">{(name[0] || "").toUpperCase()}</div>
            )}
          </div>
          <div className="user-badges">
            <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
              {isActive ? "Active" : "Inactive"}
            </span>
            <span className={`role-badge ${user.role || "user"}`}>
              {user.role || "User"}
            </span>
          </div>
          <div className="user-checkbox">
            <input type="checkbox" checked={isSelected} onChange={onSelect} />
          </div>
        </div>

        <div className="user-card-body">
          <h3 className="user-name">{name}</h3>
          <p className="user-email">{user.email}</p>

          {user.country && (
            <div className="user-location">
              <FiMapPin className="location-icon" />
              <span>{user.country}</span>
            </div>
          )}

          <div className="user-stats">
            <div className="user-stat">
              <span className="stat-label">Purchases</span>
              <span className="stat-value">{user.totalPurchases || 0}</span>
            </div>
            <div className="user-stat">
              <span className="stat-label">Spent</span>
              <span className="stat-value">{formatCurrency(user.totalSpent || 0)}</span>
            </div>
            <div className="user-stat">
              <span className="stat-label">Downloads</span>
              <span className="stat-value">{user.totalDownloads || 0}</span>
            </div>
          </div>

          <div className="user-meta">
            <span className="join-date">
              Joined: {formatDate(user.createdAt || user.joinDate)}
            </span>
          </div>
        </div>

        <div className="user-card-actions">
          <button className="action-button secondary" onClick={() => setShowUserModal(true)}>
            <FiEye className="button-icon" />
            View Details
          </button>
          <button className="action-button secondary" onClick={() => onStatusToggle(user.id)}>
            {isActive ? <FiX /> : <FiUserCheck />}
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal user-details-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiUser className="modal-icon" />
                User Profile Details
              </h3>
              <button onClick={() => setShowUserModal(false)} className="close-button">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* User details modal content from the original code */}
              <div className="user-profile-header">
                <div className="profile-avatar-large">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={name} className="avatar-img-large" />
                  ) : (
                    <div className="avatar-initials-large">{(name[0] || "").toUpperCase()}</div>
                  )}
                </div>
                <div className="profile-main-info">
                  <h2 className="profile-name">{name}</h2>
                  <p className="profile-username">@{user.username || "username"}</p>
                </div>
              </div>

              {/* Rest of the user details modal content */}
              {/* ... (include all the user details modal content from the original) */}
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={() => setShowUserModal(false)}>
                Close
              </button>
              <button className="action-button danger" onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${name}'s account?`)) {
                  // Delete function call here
                  setShowUserModal(false);
                }
              }}>
                <FiTrash2 className="button-icon" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onStatusToggle, onRoleChange, onDelete, formatCurrency, formatDate }) => {
  const name = user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
  const status = (user.status || "active").toLowerCase();
  const isActive = status === "active";

  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUser className="modal-icon" />
            User Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body enhanced-modal-body">
          {/* User Profile Header */}
          <div className="user-profile-header">
            <div className="profile-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt={name} className="avatar-img large" />
              ) : (
                <div className="avatar-initials large">{(name[0] || "").toUpperCase()}</div>
              )}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{name}</h3>
              <p className="profile-email">{user.email}</p>
              <div className="profile-badges">
                <span className={`role-badge enhanced ${user.role || "user"}`}>
                  {user.role || "user"}
                </span>
                <span className={`status-badge enhanced ${isActive ? "active" : "inactive"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.totalPurchases || 0}</div>
              <div className="stat-label">
                <FiShoppingCart className="stat-icon" />
                Total Purchases
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value currency">{formatCurrency(user.totalSpent || 0)}</div>
              <div className="stat-label">
                <FiDollarSign className="stat-icon" />
                Total Spent
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value downloads">{user.totalDownloads || 0}</div>
              <div className="stat-label">
                <FiDownload className="stat-icon" />
                Downloads
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.isEmailVerified ? "Yes" : "No"}</div>
              <div className="stat-label">
                <FiCheckCircle className="stat-icon" />
                Email Verified
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="user-details-section">
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Join Date</div>
                <div className="detail-value">
                  <FiCalendar className="detail-icon" />
                  <span>{formatDate(user.createdAt || user.joinDate)}</span>
                </div>
              </div>
              {user.lastLogin && (
                <div className="detail-item">
                  <div className="detail-label">Last Login</div>
                  <div className="detail-value">
                    <FiCalendar className="detail-icon" />
                    <span>{formatDate(user.lastLogin)}</span>
                  </div>
                </div>
              )}
              {user.location && (
                <div className="detail-item">
                  <div className="detail-label">Location</div>
                  <div className="detail-value">
                    <FiMapPin className="detail-icon" />
                    <span>{user.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button className="action-button secondary" onClick={() => onStatusToggle(user.id)}>
              {isActive ? <FiX className="button-icon" /> : <FiUserCheck className="button-icon" />}
              {isActive ? "Deactivate" : "Activate"}
            </button>

            {user.role !== "admin" && (
              <>
                <button className="action-button" onClick={() => onRoleChange(user.id, "admin")}>
                  <FiShield className="button-icon" />
                  Make Admin
                </button>
                <button className="action-button danger" onClick={() => {
                  if (window.confirm(`Delete user "${name}"? This action cannot be undone.`)) {
                    onDelete(user.id, user.email);
                    onClose();
                  }
                }}>
                  <FiTrash2 className="button-icon" />
                  Delete User
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformation;