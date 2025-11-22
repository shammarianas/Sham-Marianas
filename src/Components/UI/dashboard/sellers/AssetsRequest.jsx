import React, { useState, useEffect } from "react";
import { 
  FiPackage, 
  FiCheckCircle, 
  FiXCircle, 
  FiEye, 
  FiClock, 
  FiSearch, 
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiList,
  FiTrendingUp,
  FiX,
  FiUser,
  FiDollarSign,
  FiFileText
} from "react-icons/fi";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebase";

const AssetRequestsDashboard = () => {
  const [assetRequests, setAssetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch only contributor assets from Firebase
  useEffect(() => {
    const fetchAssetRequests = async () => {
      try {
        setLoading(true);
        const assetsRef = collection(db, "Assets");
        
        // Query to get only contributor assets (not admin uploaded)
        const q = query(
          assetsRef, 
          where("uploadedBy", "!=", "admin")
        );
        
        const assetsSnapshot = await getDocs(q);

        const contributorAssets = [];

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Only include assets from contributors
          if (data.uploadedBy !== "admin" && data.uploadedBy !== "Admin") {
            contributorAssets.push({
              id: doc.id,
              ...data,
              title: data.title || "Untitled Asset",
              type: data.category || "other",
              category: data.category || "Other",
              author: data.authorName || data.author || data.uploadedBy || "Unknown Contributor",
              authorEmail: data.authorEmail || data.email || "No email provided",
              submitDate: data.createdAt || data.uploadDate || new Date(),
              status: data.status || "pending",
              priceType: data.isFree ? "free" : "paid",
              fileSize: data.fileSize || "Unknown",
              description: data.description || "No description provided",
              files: data.files || [],
              thumbnail: data.thumbnail || data.imageUrl || "",
              rejectionReason: data.rejectionReason || ""
            });
          }
        });

        // Sort by creation date (newest first)
        contributorAssets.sort((a, b) => {
          const timeA = a.submitDate?.toDate?.() || new Date(a.submitDate);
          const timeB = b.submitDate?.toDate?.() || new Date(b.submitDate);
          return timeB - timeA;
        });

        setAssetRequests(contributorAssets);
      } catch (error) {
        console.error("Error loading contributor asset requests:", error);
        // Fallback to empty array if no contributor assets found
        setAssetRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetRequests();
  }, []);

  // Handle approve asset
  const handleApprove = (assetId) => {
    setAssetRequests(assetRequests.map(asset => 
      asset.id === assetId ? { ...asset, status: "approved" } : asset
    ));
  };

  // Handle reject asset
  const handleReject = (assetId, reason = "") => {
    setAssetRequests(assetRequests.map(asset => 
      asset.id === assetId ? { ...asset, status: "rejected", rejectionReason: reason } : asset
    ));
  };

  // Handle move back to pending
  const handleMoveToPending = (assetId) => {
    setAssetRequests(assetRequests.map(asset => 
      asset.id === assetId ? { ...asset, status: "pending", rejectionReason: "" } : asset
    ));
  };

  // Filter assets based on search and filters
  const filteredAssets = assetRequests.filter(asset => {
    const matchesSearch = 
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="report-status-badge resolved"><FiCheckCircle /> Approved</span>;
      case "pending":
        return <span className="report-status-badge pending"><FiClock /> Pending</span>;
      case "rejected":
        return <span className="report-status-badge in-progress"><FiXCircle /> Rejected</span>;
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  // Price type badge
  const getPriceBadge = (priceType) => {
    return priceType === "paid" 
      ? <span className="price-badge paid"><FiDollarSign /> Paid</span>
      : <span className="price-badge free">Free</span>;
  };

  // Asset type icon and label
  const getAssetTypeInfo = (type) => {
    const types = {
      "3d_model": { icon: "📦", label: "3D Model" },
      "texture": { icon: "🎨", label: "Texture" },
      "audio": { icon: "🎵", label: "Audio" },
      "video": { icon: "🎥", label: "Video" },
      "image": { icon: "🖼️", label: "Image" },
      "graphics": { icon: "🎨", label: "Graphics" },
      "script": { icon: "💻", label: "Script" },
      "other": { icon: "📄", label: "Other" }
    };
    return types[type] || { icon: "📄", label: "Asset" };
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Statistics
  const stats = {
    totalAssets: assetRequests.length,
    approvedAssets: assetRequests.filter(a => a.status === "approved").length,
    pendingAssets: assetRequests.filter(a => a.status === "pending").length,
    rejectedAssets: assetRequests.filter(a => a.status === "rejected").length
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  if (loading) {
    return (
      <div className="user-reports-dashboard">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading contributor assets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiPackage className="header-icon" />
            Contributor Asset Requests
          </h2>
          <p className="header-subtitle">
            Review and manage asset upload requests from contributors
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalAssets} contributor requests
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Approved Assets</h3>
              <div className="report-stat-value">{stats.approvedAssets}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Published to marketplace
            </div>
            <div className="report-stat-trend positive">
              +15% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">Pending Review</h3>
              <div className="report-stat-value">{stats.pendingAssets}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Awaiting approval
            </div>
            <div className="report-stat-trend negative">
              +8% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiPackage />
            </div>
            <div>
              <h3 className="report-stat-title">Total Requests</h3>
              <div className="report-stat-value">{stats.totalAssets}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Contributor submissions
            </div>
            <div className="report-stat-trend positive">
              +12% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiXCircle />
            </div>
            <div>
              <h3 className="report-stat-title">Rejected</h3>
              <div className="report-stat-value">{stats.rejectedAssets}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Rejected submissions
            </div>
            <div className="report-stat-trend negative">
              +5% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Assets
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredAssets.length} of {stats.totalAssets} contributor requests
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search contributor assets by title, author, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="3d_model">3D Models</option>
            <option value="texture">Textures</option>
            <option value="audio">Audio</option>
            <option value="video">Videos</option>
            <option value="image">Images</option>
            <option value="graphics">Graphics</option>
            <option value="script">Scripts</option>
            <option value="other">Other</option>
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Contributor Asset Requests
          </h3>
          <button className="action-button secondary">
            <FiDownload className="button-icon" /> Export Data
          </button>
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Contributor</th>
                <th>Price</th>
                <th>Size</th>
                <th>Submit Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => {
                const typeInfo = getAssetTypeInfo(asset.type);
                return (
                  <tr key={asset.id}>
                    <td>
                      <div className="report-user">
                        <div className="report-user-info">
                          <div className="report-user-name">{asset.title}</div>
                          <div className="report-user-email">{asset.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`report-category-badge ${
                        asset.type === '3d_model' ? 'technical' : 
                        asset.type === 'video' ? 'billing' : 
                        asset.type === 'image' ? 'general' : 'feature'
                      }`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="comp-dis">
                        <FiUser style={{ marginRight: '4px' }} />
                        {asset.author}
                      </div>
                    </td>
                    <td>
                      {getPriceBadge(asset.priceType)}
                    </td>
                    <td>
                      <div className="comp-dis">
                        <FiFileText style={{ marginRight: '4px' }} />
                        {asset.fileSize}
                      </div>
                    </td>
                    <td>
                      <div className="comp-dis">
                        <FiClock style={{ marginRight: '4px' }} />
                        {formatDate(asset.submitDate)}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(asset.status)}
                    </td>
                    <td>
                      <div className="report-actions">
                        <button
                          className="action-button secondary small"
                          title="View Details"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowDetailsModal(true);
                          }}
                        >
                          <FiEye />
                        </button>
                        
                        {/* Always show Reject button for non-rejected assets */}
                        {asset.status !== "rejected" && (
                          <button
                            className="action-button danger small"
                            title="Reject Asset"
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason) handleReject(asset.id, reason);
                            }}
                          >
                            <FiXCircle />
                          </button>
                        )}
                        {/* Always show Approve button for non-approved assets */}
                        {asset.status !== "approved" && (
                          <button
                            className="action-button small"
                            title="Approve Asset"
                            onClick={() => handleApprove(asset.id)}
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        {/* Always show Move to Pending button for approved/rejected assets */}
                        {(asset.status === "approved" || asset.status === "rejected") && (
                          <button
                            className="action-button warning small"
                            title="Move to Pending"
                            onClick={() => handleMoveToPending(asset.id)}
                          >
                            <FiClock />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-reports">
                    {assetRequests.length === 0 ? 'No contributor asset requests found' : 'No contributor assets found matching your filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Details Modal */}
      {showDetailsModal && selectedAsset && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contributor Asset Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Asset Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{selectedAsset.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {getAssetTypeInfo(selectedAsset.type).label}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedAsset.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price Type:</span>
                    <span className="detail-value">
                      {getPriceBadge(selectedAsset.priceType)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">File Size:</span>
                    <span className="detail-value">{selectedAsset.fileSize}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Contributor Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Contributor:</span>
                    <span className="detail-value">{selectedAsset.author}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedAsset.authorEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submit Date:</span>
                    <span className="detail-value">{formatDate(selectedAsset.submitDate)}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Description</h4>
                  <div className="detail-description">
                    {selectedAsset.description}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Submitted Files</h4>
                  <div className="documents-list">
                    {selectedAsset.files && selectedAsset.files.length > 0 ? (
                      selectedAsset.files.map((file, index) => (
                        <div key={index} className="document-item">
                          <div className="document-icon">📄</div>
                          <div className="document-info">
                            <div className="document-name">{file}</div>
                            <button className="action-button secondary small">
                              Download File
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-files">No files submitted</div>
                    )}
                  </div>
                </div>

                {selectedAsset.rejectionReason && (
                  <div className="detail-section full-width">
                    <h4>Rejection Reason</h4>
                    <div className="detail-description warning">
                      {selectedAsset.rejectionReason}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Current Status</h4>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedAsset.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              
              {/* Always show all action buttons in modal */}
              <button
                className="action-button"
                onClick={() => {
                  handleApprove(selectedAsset.id);
                  setShowDetailsModal(false);
                }}
              >
                <FiCheckCircle /> Approve Asset
              </button>
              
              <button
                className="action-button danger"
                onClick={() => {
                  const reason = prompt("Enter rejection reason:");
                  if (reason) {
                    handleReject(selectedAsset.id, reason);
                    setShowDetailsModal(false);
                  }
                }}
              >
                <FiXCircle /> Reject Asset
              </button>
              
              <button
                className="action-button warning"
                onClick={() => {
                  handleMoveToPending(selectedAsset.id);
                  setShowDetailsModal(false);
                }}
              >
                <FiClock /> Move to Pending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRequestsDashboard;