import React, { useState } from "react";
import { FiBox, FiTrendingUp, FiDownload, FiUsers, FiDollarSign, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const AssetManagement = () => {
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Modern 3D Car Model",
      type: "3D Model",
      category: "Vehicles",
      price: 49.99,
      downloads: 125,
      rating: 4.8,
      status: "published",
      featured: true,
      trending: true,
      createdAt: "2024-01-15",
      seller: "Ali Designs"
    },
    {
      id: 2,
      name: "Business Presentation Template",
      type: "Template",
      category: "Business",
      price: 24.99,
      downloads: 89,
      rating: 4.6,
      status: "published",
      featured: false,
      trending: true,
      createdAt: "2024-01-20",
      seller: "Sara Creations"
    },
    {
      id: 3,
      name: "Premium Icon Pack",
      type: "Icons",
      category: "UI/UX",
      price: 14.99,
      downloads: 203,
      rating: 4.9,
      status: "published",
      featured: true,
      trending: false,
      createdAt: "2024-01-10",
      seller: "UR Designs"
    },
    {
      id: 4,
      name: "4K HDRI Environment",
      type: "HDRI",
      category: "Environments",
      price: 39.99,
      downloads: 67,
      rating: 4.7,
      status: "draft",
      featured: false,
      trending: false,
      createdAt: "2024-02-01",
      seller: "Digital Assets Co"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: assets.length,
    published: assets.filter(a => a.status === "published").length,
    draft: assets.filter(a => a.status === "draft").length,
    featured: assets.filter(a => a.featured).length,
    totalDownloads: assets.reduce((sum, a) => sum + a.downloads, 0),
    totalRevenue: assets.reduce((sum, a) => sum + (a.price * a.downloads), 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <span className="status-badge success">Published</span>;
      case "draft":
        return <span className="status-badge warning">Draft</span>;
      case "archived":
        return <span className="status-badge">Archived</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  const handleToggleFeatured = (assetId) => {
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, featured: !asset.featured } : asset
    ));
  };

  const handleToggleTrending = (assetId) => {
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, trending: !asset.trending } : asset
    ));
  };

  const handleStatusChange = (assetId, newStatus) => {
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, status: newStatus } : asset
    ));
  };

  const handleDeleteAsset = (assetId) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setAssets(assets.filter(asset => asset.id !== assetId));
    }
  };

  return (
    <div className="asset-management-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBox className="header-icon" />
            Asset Management
          </h2>
          <p className="header-subtitle">
            Manage and monitor all digital assets on the platform
          </p>
        </div>
        <div className="header-actions">
          <button className="action-button">
            <FiPlus className="button-icon" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiBox />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Assets</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +8.3%
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiDownload />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDownloads}</div>
            <div className="stat-label">Total Downloads</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +15.7%
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +22.1%
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.featured}</div>
            <div className="stat-label">Featured Assets</div>
            <div className="stat-trend positive">
              <FiTrendingUp />
              +5.2%
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card filters-card">
        <div className="card-body">
          <div className="filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search assets..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Business">Business</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Environments">Environments</option>
            </select>

            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredAssets.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="assets-grid">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="asset-card">
            <div className="asset-header">
              <div className="asset-image">
                <div className="image-placeholder">
                  {asset.type.charAt(0)}
                </div>
                <div className="asset-badges">
                  {asset.featured && <span className="badge featured">Featured</span>}
                  {asset.trending && <span className="badge trending">Trending</span>}
                  {getStatusBadge(asset.status)}
                </div>
              </div>
            </div>

            <div className="asset-body">
              <h3 className="asset-name">{asset.name}</h3>
              <div className="asset-meta">
                <span className="asset-type">{asset.type}</span>
                <span className="asset-category">{asset.category}</span>
              </div>
              
              <div className="asset-stats">
                <div className="stat">
                  <FiDownload className="stat-icon" />
                  <span>{asset.downloads} downloads</span>
                </div>
                <div className="stat">
                  <span className="rating">⭐ {asset.rating}</span>
                </div>
              </div>

              <div className="asset-seller">
                <span>By {asset.seller}</span>
              </div>

              <div className="asset-price">
                {formatCurrency(asset.price)}
              </div>
            </div>

            <div className="asset-actions">
              <button
                className="action-button secondary small"
                onClick={() => {
                  setSelectedAsset(asset);
                  setShowDetailsModal(true);
                }}
              >
                <FiEye />
                View
              </button>
              <button
                className="action-button secondary small"
                onClick={() => handleToggleFeatured(asset.id)}
              >
                {asset.featured ? 'Unfeature' : 'Feature'}
              </button>
              <button
                className="action-button danger small"
                onClick={() => handleDeleteAsset(asset.id)}
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiBox className="empty-icon" />
            <h3 className="empty-title">No assets found</h3>
            <p className="empty-text">
              {searchTerm 
                ? "No assets match your search criteria." 
                : "No assets are currently available."}
            </p>
            <button className="action-button">
              <FiPlus className="button-icon" />
              Add First Asset
            </button>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showDetailsModal && selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          onClose={() => setShowDetailsModal(false)}
          onToggleFeatured={handleToggleFeatured}
          onToggleTrending={handleToggleTrending}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteAsset}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

// Asset Details Modal Component
const AssetDetailsModal = ({ 
  asset, 
  onClose, 
  onToggleFeatured, 
  onToggleTrending, 
  onStatusChange, 
  onDelete,
  formatCurrency 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiBox className="modal-icon" />
            Asset Details
          </h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="asset-details">
            <div className="details-grid">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-item">
                  <strong>Name:</strong> {asset.name}
                </div>
                <div className="detail-item">
                  <strong>Type:</strong> {asset.type}
                </div>
                <div className="detail-item">
                  <strong>Category:</strong> {asset.category}
                </div>
                <div className="detail-item">
                  <strong>Seller:</strong> {asset.seller}
                </div>
                <div className="detail-item">
                  <strong>Created:</strong> {asset.createdAt}
                </div>
              </div>

              <div className="detail-section">
                <h4>Pricing & Stats</h4>
                <div className="detail-item">
                  <strong>Price:</strong> {formatCurrency(asset.price)}
                </div>
                <div className="detail-item">
                  <strong>Downloads:</strong> {asset.downloads}
                </div>
                <div className="detail-item">
                  <strong>Rating:</strong> ⭐ {asset.rating}/5
                </div>
                <div className="detail-item">
                  <strong>Revenue:</strong> {formatCurrency(asset.price * asset.downloads)}
                </div>
              </div>

              <div className="detail-section">
                <h4>Status & Features</h4>
                <div className="detail-item">
                  <strong>Status:</strong> 
                  <select
                    value={asset.status}
                    onChange={(e) => onStatusChange(asset.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="detail-item">
                  <strong>Featured:</strong> 
                  <button
                    className={`toggle-button ${asset.featured ? 'active' : ''}`}
                    onClick={() => onToggleFeatured(asset.id)}
                  >
                    {asset.featured ? 'Yes' : 'No'}
                  </button>
                </div>
                <div className="detail-item">
                  <strong>Trending:</strong> 
                  <button
                    className={`toggle-button ${asset.trending ? 'active' : ''}`}
                    onClick={() => onToggleTrending(asset.id)}
                  >
                    {asset.trending ? 'Yes' : 'No'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="action-button danger"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this asset?")) {
                onDelete(asset.id);
                onClose();
              }
            }}
          >
            <FiTrash2 className="button-icon" />
            Delete Asset
          </button>
          <button className="action-button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetManagement;