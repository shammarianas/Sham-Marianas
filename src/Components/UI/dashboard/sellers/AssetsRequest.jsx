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
import { addDoc, collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import ExportButton from "../../../ExportButton";
import { exportAssetRequestsData } from "../../../../utils/exportUtils";


const AssetRequestsDashboard = () => {
  const [assetRequests, setAssetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ✅ UPDATED: Fetch ONLY contributor assets (not admin uploaded)
  useEffect(() => {
    const fetchAssetRequests = async () => {
      try {
        setLoading(true);
        const assetsRef = collection(db, "Assets");
        
        // ✅ GET ALL ASSETS first, then filter for contributors only
        const assetsSnapshot = await getDocs(assetsRef);

        const contributorAssets = [];

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // ✅ CONDITION: Only include contributor assets (not admin uploaded)
          const isContributorAsset = 
            data.uploadedBy !== "admin" && 
            data.uploadedBy !== "Admin" &&
            data.ownerId && // Contributor assets have ownerId
            data.status !== "admin_uploaded"; // Exclude admin uploaded status

          if (isContributorAsset) {
            contributorAssets.push({
              id: doc.id,
              ...data,
              title: data.title || "Untitled Asset",
              type: data.type || data.category || "other",
              category: data.category || "Other",
              author: data.authorName || data.author || data.createdBy || data.uploadedBy || "Unknown Contributor",
              authorEmail: data.authorEmail || data.email || "No email provided",
              submitDate: data.createdAt || data.uploadDate || new Date(),
              status: data.status || "pending",
              priceType: data.price === "paid" ? "paid" : "free",
              fileSize: data.fileSize || "Unknown",
              description: data.description || "No description provided",
              files: data.files || [],
              thumbnail: data.thumbnail || data.imageUrl || "",
              rejectionReason: data.rejectionReason || "",
              ownerId: data.ownerId,
              uploadedBy: data.uploadedBy,
              is3d: data.is3d || false,
              tags: data.tags || []
            });
          }
        });

        // Sort by creation date (newest first)
        contributorAssets.sort((a, b) => {
          const timeA = a.submitDate?.toDate?.() || new Date(a.submitDate);
          const timeB = b.submitDate?.toDate?.() || new Date(b.submitDate);
          return timeB - timeA;
        });

        console.log("✅ Loaded contributor assets:", contributorAssets.length);
        setAssetRequests(contributorAssets);
      } catch (error) {
        console.error("Error loading contributor asset requests:", error);
        setAssetRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetRequests();
  }, []);

  // Create notifications
  const createAssetNotification = async (contributorId, assetId, assetName, type) => {
    const messages = {
      approved: `Your asset "${assetName}" has been approved and published!`,
      rejected: `Your asset "${assetName}" has been rejected.`,
    };

    try {
      // Notification for contributor
      await addDoc(collection(db, `Contributors/${contributorId}/Notifications`), {
        type,
        message: messages[type],
        assetId,
        assetName,
        read: false,
        timestamp: serverTimestamp(),
      });

      // Notification for admin
      await addDoc(collection(db, "AdminNotifications"), {
        type: `asset_${type}`,
        message: `Asset "${assetName}" has been ${type} by admin`,
        assetId,
        contributorId,
        read: false,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Notifications created for both contributor and admin");
    } catch (error) {
      console.error("Error creating notifications:", error);
    }
  };

  // ✅ Handle approve asset - Update Firestore
  const handleApprove = async (assetId) => {
    try {
      const asset = assetRequests.find(a => a.id === assetId);
      
      const assetRef = doc(db, "Assets", assetId);
      await updateDoc(assetRef, {
        status: "approved",
        updatedAt: new Date()
      });

      // ✅ Create notifications
      await createAssetNotification(asset.ownerId, assetId, asset.title, "approved");

      // Update local state
      setAssetRequests(assetRequests.map(a => 
        a.id === assetId ? { ...a, status: "approved" } : a
      ));
      
      console.log("✅ Asset approved and notifications sent");
    } catch (error) {
      console.error("Error approving asset:", error);
      alert("Failed to approve asset");
    }
  };

  // ✅ Handle reject asset - Update Firestore
  const handleReject = async (assetId, reason = "") => {
    try {
      const asset = assetRequests.find(a => a.id === assetId);
      
      const assetRef = doc(db, "Assets", assetId);
      await updateDoc(assetRef, {
        status: "rejected",
        rejectionReason: reason,
        updatedAt: new Date()
      });

      // ✅ Create notifications
      await createAssetNotification(asset.ownerId, assetId, asset.title, "rejected");

      // Update local state
      setAssetRequests(assetRequests.map(a => 
        a.id === assetId ? { ...a, status: "rejected", rejectionReason: reason } : a
      ));
      
      console.log("✅ Asset rejected and notifications sent");
    } catch (error) {
      console.error("Error rejecting asset:", error);
      alert("Failed to reject asset");
    }
  };

  // ✅ Handle move back to pending - Update Firestore
  const handleMoveToPending = async (assetId) => {
    try {
      const assetRef = doc(db, "Assets", assetId);
      await updateDoc(assetRef, {
        status: "pending",
        rejectionReason: "",
        updatedAt: new Date()
      });

      // Update local state
      setAssetRequests(assetRequests.map(asset => 
        asset.id === assetId ? { ...asset, status: "pending", rejectionReason: "" } : asset
      ));
      
      console.log("✅ Asset moved to pending:", assetId);
    } catch (error) {
      console.error("Error moving asset to pending:", error);
      alert("Failed to move asset to pending");
    }
  };

  // ✅ Prepare data for export - WITHOUT ANY CHANGES to the export function
  const prepareExportData = (assets) => {
    // Convert asset data to request data format that exportAssetRequestsData expects
    return assets.map(asset => ({
      sellerName: asset.author,
      sellerEmail: asset.authorEmail,
      assetName: asset.title,
      category: asset.category,
      status: asset.status,
      requestDate: asset.submitDate
    }));
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

  // ✅ Filter assets based on search and filters
  const filteredAssets = assetRequests.filter(asset => {
    const matchesSearch = 
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.author && asset.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      "models": { label: "3D Model" },
      "3d_model": { label: "3D Model" },
      "texture": { label: "Texture" },
      "textures": { label: "Texture" },
      "audio": { label: "Audio" },
      "video": { label: "Video" },
      "videos": { label: "Video" },
      "image": { label: "Image" },
      "images": { label: "Image" },
      "graphics": { label: "Graphics" },
      "script": { label: "Script" },
      "scripts": { label: "Script" },
      "hdris": { label: "HDRI" },
      "icons": { label: "Icons" },
      "mockups": { label: "Mockup" },
      "fonts": { label: "Font" },
      "video-templates": { label: "Video Template" },
      "other": { label: "Other" }
    };
    return types[type] || {label: type || "Asset" };
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
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
            Review and manage asset upload requests from contributors only
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
            <option value="models">3D Models</option>
            <option value="textures">Textures</option>
            <option value="audio">Audio</option>
            <option value="videos">Videos</option>
            <option value="images">Images</option>
            <option value="graphics">Graphics</option>
            <option value="scripts">Scripts</option>
            <option value="hdris">HDRIs</option>
            <option value="icons">Icons</option>
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
         <ExportButton
            data={prepareExportData(filteredAssets.length > 0 ? filteredAssets : assetRequests)}
            columns={[
              { header: "Seller Name", accessor: (r) => r.sellerName || r.author || "N/A" },
              // { header: "Seller Email", accessor: (r) => r.sellerEmail || r.authorEmail || "N/A" },
              { header: "Asset Name", accessor: (r) => r.assetName || r.title || "N/A" },
              { header: "Category", accessor: (r) => r.category || "N/A" },
              { header: "Status", accessor: (r) => r.status || "Pending" },
              { header: "Request Date", accessor: (r) => {
                  if (!r.requestDate) return "N/A";
                  try {
                    const d = r.requestDate.toDate ? r.requestDate.toDate() : new Date(r.requestDate);
                    return d.toISOString().split("T")[0];
                  } catch { return String(r.requestDate); }
                }
              }
            ]}
            filename="assets-request-reports"
            onExport={(format) =>
              exportAssetRequestsData(
                prepareExportData(filteredAssets.length > 0 ? filteredAssets : assetRequests),
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
                <th>Asset</th>
                <th>Type</th>
                <th>Contributor</th>
                <th>Price</th>
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
                        asset.type === 'models' ? 'technical' : 
                        asset.type === 'videos' ? 'billing' : 
                        asset.type === 'images' ? 'general' : 'feature'
                      }`}>
                        {typeInfo.icon} {typeInfo.label}
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
                  <td colSpan="7" className="no-reports">
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
                    <span className="detail-label">Asset ID:</span>
                    <span className="detail-value">{selectedAsset.id}</span>
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
                  <div className="detail-item">
                    <span className="detail-label">Owner ID:</span>
                    <span className="detail-value">{selectedAsset.ownerId || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Description</h4>
                  <div className="detail-description">
                    {selectedAsset.description}
                  </div>
                </div>

                {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                  <div className="detail-section">
                    <h4>Tags</h4>
                    <div className="tags-container">
                      {selectedAsset.tags.map((tag, index) => (
                        <span key={index} className="tag-badge">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

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
              {selectedAsset.status !== "approved" && (
                <button
                  className="action-button"
                  onClick={() => {
                    handleApprove(selectedAsset.id);
                    setShowDetailsModal(false);
                  }}
                >
                  <FiCheckCircle /> Approve Asset
                </button>
              )}
              
              {selectedAsset.status !== "rejected" && (
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
              )}
              
              {(selectedAsset.status === "approved" || selectedAsset.status === "rejected") && (
                <button
                  className="action-button warning"
                  onClick={() => {
                    handleMoveToPending(selectedAsset.id);
                    setShowDetailsModal(false);
                  }}
                >
                  <FiClock /> Move to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRequestsDashboard;