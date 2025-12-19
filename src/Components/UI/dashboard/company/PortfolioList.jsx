import React, { useState } from "react";
import { FiBriefcase, FiSearch, FiFilter, FiPlus, FiEye, FiTrash2, FiUser, FiImage, FiTag, FiStar, FiX } from "react-icons/fi";
import ProjectModal from "../../../../Pages/PortfolioUpload";

// PortfolioDetailsModal Component
const PortfolioDetailsModal = ({ portfolio, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiBriefcase className="modal-icon" /> Portfolio Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body enhanced-modal-body">
          <div className="asset-preview">
            {portfolio.image ||
            portfolio.coverImgUrl ||
            portfolio.featureImgUrl ? (
              <img
                src={
                  portfolio.image ||
                  portfolio.coverImgUrl ||
                  portfolio.featureImgUrl
                }
                alt={portfolio.title}
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder" />
            )}
          </div>
          <div className="asset-info-section">
            <h4 className="asset-info-title">{portfolio.title}</h4>
            <p className="asset-info-description">
              {portfolio.description || "No description"}
            </p>

            <div className="asset-info-grid">
              <div className="info-item">
                <div className="info-label">Category</div>
                <div className="info-value">
                  {portfolio.category || portfolio.type || "Uncategorized"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Author</div>
                <div className="info-value">
                  {portfolio.authorName ||
                    portfolio.owner ||
                    portfolio.userId ||
                    "Unknown"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Created</div>
                <div className="info-value">
                  {portfolio.createdAt?.toDate?.().toLocaleDateString?.() ||
                    "N/A"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Status</div>
                <div className="info-value">{portfolio.status || "draft"}</div>
              </div>
            </div>

            {Array.isArray(portfolio.technologies) &&
              portfolio.technologies.length > 0 && (
                <div className="asset-info-section">
                  <div className="info-label">Technologies</div>
                  <div className="usage-list">
                    {portfolio.technologies.map((t, i) => (
                      <span key={i} className="role-badge user">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main PortfolioList Component
const PortfolioList = ({
  portfolios,
  onDelete,
  onCreate,
  onToggleFeatured,
  onUpdateStatus,
  formatDate,
}) => {
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState("");
  const [selectedPortfolioCategory, setSelectedPortfolioCategory] = useState("all");
  const [selectedPortfolioStatus, setSelectedPortfolioStatus] = useState("all");
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [portfolioToEdit, setPortfolioToEdit] = useState(null);

  // Edit Icon Component
  const EditIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const handleEditPortfolio = (portfolio) => {
    setPortfolioToEdit(portfolio);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setPortfolioToEdit(null);
    // Refresh the portfolio list after editing
    if (typeof onCreate === 'function') {
      // This will trigger a refresh in the parent component
      onCreate();
    }
  };

  const handleCreateNew = () => {
    setPortfolioToEdit(null); // Ensure it's in create mode
    if (typeof onCreate === 'function') {
      onCreate();
    }
  };

  const uniqueCategories = Array.from(
    new Set(
      portfolios
        .map((p) => (p.category || p.type || "").toString().trim())
        .filter(Boolean)
    )
  );

  const filteredPortfolios = portfolios.filter((p) => {
    try {
      const matchesSearch = ((p.title || "").toLowerCase()).includes((portfolioSearchTerm || "").toLowerCase());
      
      // FIX: Safely handle undefined category
      const portfolioCategory = (p.category || p.type || "").toString().trim();
      const matchesCategory =
        selectedPortfolioCategory === "all" ||
        portfolioCategory === selectedPortfolioCategory;
      
      // FIX: Safely handle undefined status
      const status = (p.status || "draft").toLowerCase();
      const matchesStatus =
        selectedPortfolioStatus === "all" ||
        status === selectedPortfolioStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    } catch (error) {
      console.error("Error filtering portfolio:", p, error);
      return false;
    }
  });

  const getImage = (p) =>
    p.image ||
    p.coverImgUrl ||
    p.featureImgUrl ||
    p.thumbnail ||
    (Array.isArray(p.images) && p.images[0]) ||
    p.cover ||
    "";

  return (
    <div className="asset-management-enhanced">
      <div className="asset-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBriefcase className="header-icon asset-icon" />
            Portfolio Management
          </h2>
          <p className="header-subtitle">
            Manage portfolio projects and showcase work
          </p>
        </div>
        <div className="header-actions">
          <span className="asset-badge-count">
            {filteredPortfolios.length} projects
          </span>
          <button className="action-button upload-button" onClick={handleCreateNew}>
            <FiPlus className="button-icon" />
            Add Project
          </button>
        </div>
      </div>

      <div className="content-card filters-card w-100">
        <div className="card-body">
          <div className="asset-filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search portfolio..."
                value={portfolioSearchTerm}
                onChange={(e) => setPortfolioSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedPortfolioCategory}
              onChange={(e) => setSelectedPortfolioCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedPortfolioStatus}
              onChange={(e) => setSelectedPortfolioStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredPortfolios.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {filteredPortfolios.length === 0 ? (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiBriefcase className="empty-icon" />
            <h3 className="empty-title">No portfolio projects found</h3>
            <p className="empty-text">
              {portfolioSearchTerm
                ? "No projects match your search criteria."
                : "No portfolio projects are currently available."}
            </p>
            <button className="action-button upload-button" onClick={handleCreateNew}>
              <FiPlus className="button-icon" />
              Create First Project
            </button>
          </div>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredPortfolios.map((p) => (
            <div key={p.id} className="asset-card">
              <div className="asset-image-wrapper">
                {getImage(p) ? (
                  <img
                    src={getImage(p)}
                    alt={p.title || "Project"}
                    className="asset-image"
                  />
                ) : (
                  <div className="asset-placeholder">
                    <FiImage className="placeholder-icon" />
                  </div>
                )}
                <div className="asset-badges">
                  {p.featured && (
                    <span className="asset-badge featured">
                      <FiStar className="badge-icon" /> Featured
                    </span>
                  )}
                  <span
                    className={`status-badge ${
                      ((p.status || "draft").toLowerCase()) === "published"
                        ? "active"
                        : "pending"
                    }`}
                  >
                    {p.status || "draft"}
                  </span>
                </div>
              </div>

              <div className="asset-content">
                <div className="asset-header-row">
                  <h3 className="asset-title">{p.title || "Untitled"}</h3>
                  <div className="asset-menu">
                    <button
                      className="action-button secondary"
                      onClick={() => onToggleFeatured(p.id)}
                    >
                      <FiStar className="button-icon" />
                      {p.featured ? "Unfeature" : "Feature"}
                    </button>
                  </div>
                </div>

                <p className="asset-description">
                  {p.description || "No description available"}
                </p>

                <div className="asset-meta">
                  <span className="meta-item">
                    <FiTag className="meta-icon" />
                    {p.category || p.type || "Uncategorized"}
                  </span>
                </div>

                <div className="asset-footer">
                  <span className="asset-author">
                    <FiUser className="author-icon" /> by{" "}
                    {p.authorName || p.owner || p.userId || "Unknown"}
                  </span>
                  <span className="asset-date">
                    {formatDate && formatDate(p.createdAt)}
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="table-actions">
                  <div>
                    <button
                      className="action-button secondary"
                      onClick={() =>
                        onUpdateStatus(
                          p.id,
                          ((p.status || "draft").toLowerCase()) === "published"
                            ? "draft"
                            : "published"
                        )
                      }
                    >
                      {((p.status || "draft").toLowerCase()) === "published"
                        ? "Make Draft"
                        : "Publish"}
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="action-button secondary"
                      onClick={() => {
                        setSelectedPortfolio(p);
                        setShowPortfolioDialog(true);
                      }}
                    >
                      <FiEye className="button-icon" />
                    </button>
                    <button
                      className="action-button secondary"
                      onClick={() => handleEditPortfolio(p)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="action-button danger"
                      onClick={() => onDelete(p.id)}
                    >
                      <FiTrash2 className="button-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPortfolioDialog && selectedPortfolio && (
        <PortfolioDetailsModal
          portfolio={selectedPortfolio}
          onClose={() => setShowPortfolioDialog(false)}
        />
      )}

      {/* Edit Portfolio Modal */}
      {isEditModalOpen && (
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          projectToEdit={portfolioToEdit}
        />
      )}

      {/* Create Portfolio Modal - Parent component se control hoga */}
    </div>
  );
};

export default PortfolioList;