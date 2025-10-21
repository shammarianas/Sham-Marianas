// Add this component after the BlogSection component in your file

const UserDashboard = ({ 
  users, 
  onRoleChange, 
  selectedUsers, 
  setSelectedUsers, 
  handleBulkRoleChange, 
  onUpdateStatus, 
  onDelete, 
  userSearchTerm, 
  setUserSearchTerm, 
  selectedUserRole, 
  setSelectedUserRole, 
  selectedUserStatus, 
  setSelectedUserStatus, 
  showUserDialog, 
  setShowUserDialog, 
  selectedUser, 
  setSelectedUser, 
  formatCurrency, 
  formatDate, 
  getRoleColor, 
  handleUserStatusToggle, 
  handleUserRoleChange 
}) => {
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    countries: {}
  });

  // Calculate user statistics
  useEffect(() => {
    if (users.length > 0) {
      const stats = {
        total: users.length,
        active: users.filter(user => (user.status || 'active') === 'active').length,
        admins: users.filter(user => user.role === 'admin').length,
        countries: {}
      };

      // Count users by country
      users.forEach(user => {
        const country = user.country || user.location || 'Unknown';
        stats.countries[country] = (stats.countries[country] || 0) + 1;
      });

      setUserStats(stats);
    }
  }, [users]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.name || user.displayName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.country || '').toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchesRole = selectedUserRole === 'all' || user.role === selectedUserRole;
    const matchesStatus = selectedUserStatus === 'all' || (user.status || 'active') === selectedUserStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
          <p className="header-subtitle">Manage and monitor user accounts across your platform</p>
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
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${(count / userStats.total) * 100}%` 
                          }}
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
                  <span className="role-count">
                    {users.filter(user => user.role === 'moderator').length}
                  </span>
                </div>
                <div className="role-item">
                  <span className="role-label">Users</span>
                  <span className="role-count">
                    {users.filter(user => user.role === 'user' || !user.role).length}
                  </span>
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

          {/* Users Grid */}
          {filteredUsers.length > 0 ? (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSelect={() => {
                    const newSelected = selectedUsers.includes(user.id)
                      ? selectedUsers.filter(id => id !== user.id)
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
                  {userSearchTerm 
                    ? "No users match your search criteria." 
                    : "No users are currently registered."
                  }
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
          getRoleColor={getRoleColor}
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
  formatDate 
}) => {
  const name = user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
  const status = (user.status || "active").toLowerCase();
  const isActive = status === "active";

  return (
    <div className={`user-card ${isSelected ? 'selected' : ''}`}>
      <div className="user-card-header">
        <div className="user-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </div>
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
          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <span className={`role-badge ${user.role || 'user'}`}>
            {user.role || "User"}
          </span>
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
        <button 
          className="action-button secondary" 
          onClick={onViewDetails}
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
  );
};