/* ─────────────────────────────────────────────────────────────────────────────
   UserInformation.tsx  (UI UNCHANGED – only logic + setUsers added)
   ───────────────────────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiShield,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiUserCheck,
  FiTrash2,
  FiUser,
  FiActivity,
  FiTrendingUp,
  FiShoppingCart,
  FiDollarSign,
  FiDownload,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";

import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../firebase"; // <-- Apna path adjust karein

const UserInformation = ({ users, setUsers, formatCurrency, formatDate }) => {
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
  const [visibleUsersCount, setVisibleUsersCount] = useState(10); // Initial limit

  /* ──────────────────────  Firestore Functions (INSIDE COMPONENT)  ────────────────────── */
  const changeUserRole = async (userId, newRole, email) => {
    try {
      await updateDoc(doc(db, "Profiles", userId), {
        role: newRole,
        admin: newRole === "admin",
      });
      return { success: true };
    } catch (error) {
      console.error("Role change error:", error);
      return { success: false, error };
    }
  };

  const changeUserStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "Profiles", userId), { status: newStatus });
      return { success: true };
    } catch (error) {
      console.error("Status change error:", error);
      return { success: false, error };
    }
  };

  const deleteUserAccount = async (userId) => {
    try {
      await deleteDoc(doc(db, "Profiles", userId));
      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return { success: false, error };
    }
  };

  /* ──────────────────────  Stats  ────────────────────── */
  useEffect(() => {
    if (users.length > 0) {
      const stats = {
        total: users.length,
        active: users.filter((u) => (u.status || "active") === "active").length,
        admins: users.filter((u) => u.role === "admin").length,
        countries: {},
      };
      users.forEach((u) => {
        const country = u.country || u.location || "Unknown";
        stats.countries[country] = (stats.countries[country] || 0) + 1;
      });
      setUserStats(stats);
    }
  }, [users]);

  /* ──────────────────────  Filters  ────────────────────── */
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.email || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.name || user.displayName || "")
        .toLowerCase()
        .includes(userSearchTerm.toLowerCase()) ||
      (user.country || "").toLowerCase().includes(userSearchTerm.toLowerCase());

    const matchesRole =
      selectedUserRole === "all" || user.role === selectedUserRole;
    const matchesStatus =
      selectedUserStatus === "all" ||
      (user.status || "active") === selectedUserStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get limited users for display
  const displayedUsers = filteredUsers.slice(0, visibleUsersCount);

  /* ──────────────────────  Handlers with UI Refresh  ────────────────────── */
  const handleUserStatusToggle = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus =
      (user.status || "active") === "active" ? "inactive" : "active";

    const res = await changeUserStatus(userId, newStatus);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      alert(`Status updated to "${newStatus}"`);
    } else {
      alert(`Failed: ${res.error?.message || "Try again"}`);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const res = await changeUserRole(userId, newRole, user.email);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole, admin: newRole === "admin" }
            : u
        )
      );
      alert(`Role changed to "${newRole}"`);
    } else {
      alert(`Failed: ${res.error?.message || "Try again"}`);
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (!selectedUsers.length) return;
    if (
      !window.confirm(`Change ${selectedUsers.length} users to "${newRole}"?`)
    )
      return;

    let success = 0;
    await Promise.all(
      selectedUsers.map(async (id) => {
        const u = users.find((x) => x.id === id);
        if (u?.email) {
          const res = await changeUserRole(id, newRole, u.email);
          if (res.success) success++;
        }
      })
    );

    setUsers((prev) =>
      prev.map((u) =>
        selectedUsers.includes(u.id)
          ? { ...u, role: newRole, admin: newRole === "admin" }
          : u
      )
    );
    alert(`Bulk update: ${success} succeeded`);
    setSelectedUsers([]);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;

    const res = await deleteUserAccount(userId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert("User deleted successfully!");
      setShowUserDialog(false);
    } else {
      alert(`Delete failed: ${res.error?.message || "Try again"}`);
    }
  };

  // Load more users function
  const handleLoadMore = () => {
    setVisibleUsersCount(prevCount => prevCount + 10);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleUsersCount(4);
  }, [userSearchTerm, selectedUserRole, selectedUserStatus]);

  /* ──────────────────────  Top countries  ────────────────────── */
  const topCountries = Object.entries(userStats.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ──────────────────────  Render  ────────────────────── */
  return (
    <div className="user-dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiUsers className="header-icon" /> User Management Dashboard
          </h2>
          <p className="header-subtitle">
            Manage and monitor user accounts across your platform
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">{filteredUsers.length} users</span>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="reports-stats-grid">
  <div className="report-stat-card primary">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiUsers />
      </div>
      <div>
        <h3 className="report-stat-title">Total Users</h3>
        <div className="report-stat-value">{userStats.total}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        All registered users
      </div>
    </div>
  </div>

  <div className="report-stat-card success">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiUserCheck />
      </div>
      <div>
        <h3 className="report-stat-title">Active Users</h3>
        <div className="report-stat-value">{userStats.active}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        Currently active users
      </div>
    </div>
  </div>

  <div className="report-stat-card warning">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiShield />
      </div>
      <div>
        <h3 className="report-stat-title">Administrators</h3>
        <div className="report-stat-value">{userStats.admins}</div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        System administrators
      </div>
    </div>
  </div>

  <div className="report-stat-card info">
    <div className="report-stat-header">
      <div className="report-stat-icon">
        <FiMapPin />
      </div>
      <div>
        <h3 className="report-stat-title">Countries</h3>
        <div className="report-stat-value">
          {Object.keys(userStats.countries).length}
        </div>
      </div>
    </div>
    <div className="report-stat-content">
      <div className="report-stat-subtext">
        Total countries represented
      </div>
    </div>
  </div>
</div>

      <div className="dashboard-content">
        {/* ── LEFT – Analytics ── */}
        <div className="analytics-column">
          {/* Country distribution */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiMapPin className="panel-icon" /> User Distribution by Country
              </h3>
            </div>
            <div className="card-body">
              {topCountries.length ? (
                <div className="country-list">
                  {topCountries.map(([c, n]) => (
                    <div key={c} className="country-item">
                      <div className="country-info">
                        <span className="country-name">{c}</span>
                        <span className="country-count">{n} users</span>
                      </div>
                      <div className="country-progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${(n / userStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No country data available</div>
              )}
            </div>
          </div>

          {/* Role distribution */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="panel-title">
                <FiShield className="panel-icon" /> User Roles
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
                  <span className="role-count">
                    {users.filter((u) => u.role === "moderator").length}
                  </span>
                </div>
                <div className="role-item">
                  <span className="role-label">Users</span>
                  <span className="role-count">
                    {users.filter((u) => !u.role || u.role === "user").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT – User List ── */}
        <div className="users-column">
          {/* Filters */}
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
                  <span className="filter-text">
                    {filteredUsers.length} results
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedUsers.length > 0 && (
            <div className="content-card bulk-actions-card">
              <div className="card-body">
                <div className="bulk-actions">
                  <span className="bulk-selected">
                    {selectedUsers.length} users selected
                  </span>
                  <div className="bulk-buttons">
                    <button
                      onClick={() => handleBulkRoleChange("admin")}
                      className="action-button"
                    >
                      Make Admin
                    </button>
                    <button
                      onClick={() => handleBulkRoleChange("moderator")}
                      className="action-button"
                    >
                      Make Moderator
                    </button>
                    <button
                      onClick={() => handleBulkRoleChange("user")}
                      className="action-button"
                    >
                      Make User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users grid */}
          {displayedUsers.length > 0 ? (
            <>
              <div className="recent-reports-card">
                <div className="recent-reports-body">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>User</th>
                        <th>Role</th>
                        <th>Downloads</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.map((user) => {
                        const name =
                          user.name ||
                          user.displayName ||
                          user.email?.split("@")[0] ||
                          "Unknown";
                        const status = (user.status || "active").toLowerCase();
                        const isActive = status === "active";
                        return (
                          <tr key={user.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => {
                                  const newSel = selectedUsers.includes(user.id)
                                    ? selectedUsers.filter((id) => id !== user.id)
                                    : [...selectedUsers, user.id];
                                  setSelectedUsers(newSel);
                                }}
                              />
                            </td>
                            <td className="user-cell">
                              <div className="user-cell-info">
                                
                                <div className="user-name-wrap">
                                  <div className="user-name">{name}</div>
                                  <div className="user-username">
                                    @{user.username || ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td>{user.role || "User"}</td>
                            
                            
                            <td>{user.totalDownloads || 0}</td>
                            <td>{formatDate(user.createdAt || user.joinDate)}</td>
                            <td >
                              <div className="table-actions">
                                <button
                                className="action-button secondary small"
                                title="View Details"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDialog(true);
                                }}
                              >
                                <FiEye />
                              </button>
                              <button
                                className="action-button small"
                                title={isActive ? "Deactivate" : "Activate"}
                                onClick={() => handleUserStatusToggle(user.id)}
                              >
                                {isActive ? <FiX /> : <FiUserCheck />}
                              </button>
                              <button
                                className="action-button danger small"
                                title="Delete"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete ${name}'s account? This action cannot be undone.`
                                    )
                                  ) {
                                    handleDelete(user.id);
                                  }
                                }}
                              >
                                <FiTrash2 />
                              </button>
                                </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* See More Button */}
              {filteredUsers.length > visibleUsersCount && (
                <div className="load-more-container">
                  <button 
                    className="see-more-button" 
                    onClick={handleLoadMore}
                  >
                    <FiChevronDown className="button-icon" />
                    See More ({filteredUsers.length - visibleUsersCount} more users)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="recent-reports-card">
              <div className="recent-reports-body empty-state">
                <FiUsers className="empty-icon" />
                <h3 className="empty-title">No users found</h3>
                <p className="empty-text">
                  {userSearchTerm
                    ? "No users match your search criteria."
                    : "No users are currently registered."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Details Modal ── */}
      {showUserDialog && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowUserDialog(false)}
          onStatusToggle={handleUserStatusToggle}
          onRoleChange={handleUserRoleChange}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// ... (UserCard and UserDetailsModal components remain exactly the same)

/* ────────────────────────────────────────────────────────────────────────
   UserCard – UI unchanged
   ──────────────────────────────────────────────────────────────────────── */
const UserCard = ({
  user,
  onSelect,
  isSelected,
  onViewDetails,
  onStatusToggle,
  onRoleChange,
  onDelete,
  formatCurrency,
  formatDate,
}) => {
  const name =
    user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
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
              <div className="avatar-initials">
                {(name[0] || "").toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-badges">
            <span
              className={`status-badge ${isActive ? "active" : "inactive"}`}
            >
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
              <span className="stat-value">
                {formatCurrency(user.totalSpent || 0)}
              </span>
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
          <button
            className="action-button secondary"
            onClick={() => setShowUserModal(true)}
          >
            <FiEye className="button-icon" />
            View Details
          </button>
          <button
            className="action-button secondary"
            onClick={() => onStatusToggle(user.id)}
          >
            {isActive ? <FiX /> : <FiUserCheck />}
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* ── Small modal inside card ── */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal user-details-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <FiUser className="modal-icon" />
                User Profile Details
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="close-button"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-profile-header">
                <div className="profile-avatar-large">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={name}
                      className="avatar-img-large"
                    />
                  ) : (
                    <div className="avatar-initials-large">
                      {(name[0] || "").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-main-info">
                  <h2 className="profile-name">{name}</h2>
                  <p className="profile-username">
                    @{user.username || "username"}
                  </p>
                </div>
              </div>

              <div className="user-details-grid">
                <div className="detail-section">
                  <h4 className="section-title">
                    <FiUser className="section-icon" /> Personal Information
                  </h4>
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">Full Name:</span>
                      <span className="detail-value">
                        {user.name || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        {user.email || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {user.phone || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Birthday:</span>
                      <span className="detail-value">
                        {user.birthday
                          ? formatDate(user.birthday)
                          : "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <FiShield className="section-icon" /> Account Information
                  </h4>
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">User ID:</span>
                      <span className="detail-value uid">
                        {user.uid || user.id}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Password:</span>
                      <span className="detail-value password-masked">
                        ••••••••
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Join Date:</span>
                      <span className="detail-value">
                        {formatDate(user.createdAt || user.joinDate)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Last Login:</span>
                      <span className="detail-value">
                        {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <FiActivity className="section-icon" /> Account Status &
                    Role
                  </h4>
                  <div className="role-status-section">
                    <div className="status-badge-large">
                      <span
                        className={`status-indicator ${
                          isActive ? "active" : "inactive"
                        }`}
                      ></span>
                      <span className="status-text">
                        {isActive ? "Active" : "Inactive"} Account
                      </span>
                    </div>

                    <div className="role-selector">
                      <label className="role-label">User Role:</label>
                      <select
                        className="role-select"
                        value={user.role || "user"}
                        onChange={(e) => onRoleChange(user.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </div>

                    <div className="verification-badge">
                      <FiCheckCircle className="verify-icon" />
                      <span>
                        Email Verified: {user.emailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="user-stats-modal">
                <h4 className="section-title">
                  <FiTrendingUp className="section-icon" /> User Statistics
                </h4>
                <div className="stats-grid-modal">
                  <div className="stat-card-modal">
                    <div className="stat-value">{user.totalPurchases || 0}</div>
                    <div className="stat-label">Total Purchases</div>
                  </div>
                  <div className="stat-card-modal">
                    <div className="stat-value currency">
                      {formatCurrency(user.totalSpent || 0)}
                    </div>
                    <div className="stat-label">Total Spent</div>
                  </div>
                  <div className="stat-card-modal">
                    <div className="stat-value">{user.totalDownloads || 0}</div>
                    <div className="stat-label">Downloads</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-button secondary"
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
              {/* Card ke andar chhota modal */}
              <button
                className="action-button danger"
                onClick={() => {
                  if (window.confirm(`Delete ${name}'s account?`)) {
                    onDelete(user.id); // Ab yeh sahi function call karega
                    setShowUserModal(false);
                  }
                }}
              >
                <FiTrash2 className="button-icon" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   UserDetailsModal – UI unchanged
   ──────────────────────────────────────────────────────────────────────── */
const UserDetailsModal = ({
  user,
  onClose,
  onStatusToggle,
  onRoleChange,
  onDelete,
  formatCurrency,
  formatDate,
}) => {
  const name =
    user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
  const status = (user.status || "active").toLowerCase();
  const isActive = status === "active";

  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUser className="modal-icon" /> User Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>

        <div className="modal-body enhanced-modal-body">
          <div className="user-profile-header">
            <div className="profile-avatar">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={name}
                  className="avatar-img large"
                />
              ) : (
                <div className="avatar-initials large">
                  {(name[0] || "").toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{name}</h3>
              <p className="profile-email">{user.email}</p>
              <div className="profile-badges">
                <span className={`role-badge enhanced ${user.role || "user"}`}>
                  {user.role || "user"}
                </span>
                <span
                  className={`status-badge enhanced ${
                    isActive ? "active" : "inactive"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="location-section">
            <h4 className="section-title">
              <FiMapPin className="section-icon" /> Location Information
            </h4>
            <div className="location-details">
              <div className="location-item">
                <span className="location-label">Detected Country:</span>
                <span className="location-value">
                  <span className="country-flag-large"></span>
                </span>
              </div>

              {user.phoneNumber && (
                <div className="location-item">
                  <span className="location-label">Phone Number:</span>
                  <span className="location-value">
                    {user.phoneNumber}
                    <span className="phone-country-detected"></span>
                  </span>
                </div>
              )}

              {user.country && (
                <div className="location-item">
                  <span className="location-label">Manual Country:</span>
                  <span className="location-value">{user.country}</span>
                </div>
              )}

              {user.location && (
                <div className="location-item">
                  <span className="location-label">Location:</span>
                  <span className="location-value">{user.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.totalPurchases || 0}</div>
              <div className="stat-label">
                <FiShoppingCart className="stat-icon" />
                Total Purchases
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value currency">
                {formatCurrency(user.totalSpent || 0)}
              </div>
              <div className="stat-label">
                <FiDollarSign className="stat-icon" />
                Total Spent
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value downloads">
                {user.totalDownloads || 0}
              </div>
              <div className="stat-label">
                <FiDownload className="stat-icon" />
                Downloads
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {user.isEmailVerified ? "Yes" : "No"}
              </div>
              <div className="stat-label">
                <FiCheckCircle className="stat-icon" />
                Email Verified
              </div>
            </div>
          </div>

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

          <div className="modal-actions">
            <button
              className="action-button secondary"
              onClick={() => onStatusToggle(user.id)}
            >
              {isActive ? (
                <FiX className="button-icon" />
              ) : (
                <FiUserCheck className="button-icon" />
              )}
              {isActive ? "Deactivate" : "Activate"}
            </button>

            {user.role !== "admin" && (
              <>
                <button
                  className="action-button"
                  onClick={() => onRoleChange(user.id, "admin")}
                >
                  <FiShield className="button-icon" />
                  Make Admin
                </button>

                <button
                  className="action-button danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete user "${name}"? This action cannot be undone.`
                      )
                    ) {
                      onDelete(user.id, user.email);
                      onClose();
                    }
                  }}
                >
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