import { useState } from "react";
import { FiFileText, FiSearch, FiFilter, FiPlus, FiEye, FiTrash2, FiUser, FiX } from "react-icons/fi";
import BlogEditorModal from "../../../../Pages/BlogEditor";

// BlogDetailsModal Component
const BlogDetailsModal = ({ blog, onClose, formatDate }) => {
  if (!blog) return null;

  const status = (blog.status || "draft").toLowerCase();
  const isPublished = status === "published";

  const img =
    blog.featuredImage ||
    blog.featuredImageUrl ||
    blog.coverImgUrl ||
    blog.coverImageUrl ||
    blog.thumbnail ||
    "";

  // Quill editor ke content ko extract karo
  const extractContentFromQuill = (quillHtml) => {
    if (!quillHtml) return "";

    console.log("🔍 Original blog content:", quillHtml);

    // Create temporary div
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = quillHtml;

    // Find the .ql-editor element
    const editorContent = tempDiv.querySelector(".ql-editor");
    if (editorContent) {
      console.log("✅ Found .ql-editor content:", editorContent.innerHTML);
      return editorContent.innerHTML;
    }

    // Check if it's direct content without wrapper
    const hasQuillWrapper = tempDiv.querySelector('[class*="ql"]');
    if (!hasQuillWrapper) {
      console.log("✅ Direct content (no wrapper):", quillHtml);
      return quillHtml;
    }

    // Agar koi aur Quill wrapper hai
    console.log("⚠️ Other Quill wrapper found, using innerHTML");
    return tempDiv.innerHTML;
  };

  const getCleanContent = (content) => {
    if (!content) return "";

    const extracted = extractContentFromQuill(content);

    // HTML tags remove karo aur clean text banao
    const cleanText = extracted
      .replace(/<p>/gi, "") // Replace opening <p> with new line
      .replace(/<\/p>/gi, "") // Replace closing </p> with new line
      .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with new line
      .replace(/<[^>]*>/g, " ") // Remove any other HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/\n\s*\n/g, "\n") // Remove multiple empty lines
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .trim(); // Trim whitespace
    console.log("🧹 Cleaned content:", cleanText);

    return cleanText;
  };

  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiFileText className="modal-icon" />
            Blog Post Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body enhanced-modal-body">
          {/* Blog Preview */}
          <div className="asset-preview">
            {img ? (
              <img
                src={img}
                alt={blog.title || "Blog"}
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <FiFileText className="placeholder-icon large" />
              </div>
            )}
          </div>

          {/* Blog Info */}
          <div className="asset-info-section">
            <h3 className="asset-info-title">{blog.title || "Untitled"}</h3>
            <p className="asset-info-description">
              {blog.excerpt || "No excerpt available"}
            </p>

            {blog.content && (
              <div className="blog-content-preview">
                <h4>Content Preview:</h4>
                <div className="content-preview pb-3 pt-2">
                  {(() => {
                    const cleanContent = getCleanContent(blog.content);
                    return cleanContent.length > 300
                      ? `${cleanContent.substring(0, 300)}...`
                      : cleanContent;
                  })()}
                </div>
              </div>
            )}

            <div className="asset-info-grid">
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  <span
                    className={`status-badge ${
                      isPublished ? "active" : "pending"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Author</span>
                <span className="info-value">
                  {blog.authorName || "Unknown"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Created</span>
                <span className="info-value">
                  {formatDate ? formatDate(blog.createdAt) : "N/A"}
                </span>
              </div>
            </div>

            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="asset-info-section">
                <div className="info-label">Tags</div>
                <div className="usage-list">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="role-badge user">
                      {tag}
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

// BlogList Component


// Main BlogSection Component
const BlogSection = ({
  blogs,
  onDelete,
  onToggleStatus,
  blogSearchTerm,
  setBlogSearchTerm,
  selectedBlogStatus,
  setSelectedBlogStatus,
  showBlogDialog,
  setShowBlogDialog,
  selectedBlog,
  setSelectedBlog,
  onCreate,
  formatDate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);

  const filteredBlogs = blogs.filter((blog) => {
    try {
      const term = (blogSearchTerm || "").toLowerCase();

      // Safe string conversions
      const blogTitle = (blog.title || "").toLowerCase();
      const blogExcerpt = (blog.excerpt || "").toLowerCase();
      const blogContent = (blog.content || "").toLowerCase();

      const matchesSearch =
        blogTitle.includes(term) ||
        blogExcerpt.includes(term) ||
        blogContent.includes(term) ||
        (Array.isArray(blog.tags) &&
          blog.tags.some((t) => ((t || "").toLowerCase()).includes(term)));

      // FIX: Safely handle undefined status with proper fallback
      const blogStatus = (blog.status || "draft").toLowerCase();
      const selectedStatus = (selectedBlogStatus || "all").toLowerCase();

      const matchesStatus =
        selectedStatus === "all" ||
        blogStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    } catch (error) {
      console.error("Error filtering blog:", blog, error);
      return false;
    }
  });

  const handleEditBlog = (blog) => {
    setBlogToEdit(blog);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setBlogToEdit(null);
  };

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

  // Blog Section
  return (
    <div className="asset-management-enhanced">
      <div className="asset-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            Blog Management
          </h2>
          <p className="header-subtitle">Create and manage blog posts</p>
        </div>
        <div className="header-actions">
          <span className="asset-badge-count">
            {filteredBlogs.length} posts
          </span>
          <button className="action-button upload-button" onClick={onCreate}>
            <FiPlus className="button-icon" /> Create Blog Post
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
                placeholder="Search blog posts..."
                value={blogSearchTerm}
                onChange={(e) => setBlogSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedBlogStatus}
              onChange={(e) => setSelectedBlogStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">
                {filteredBlogs.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {filteredBlogs.length > 0 ? (
        <div className="assets-grid">
          {filteredBlogs.map((blog) => {
            // FIX: Safely handle undefined status
            const status = (blog.status || "draft").toLowerCase();
            const isPublished = status === "published";
            const img =
              blog.featuredImage ||
              blog.featuredImageUrl ||
              blog.coverImgUrl ||
              blog.coverImageUrl ||
              blog.thumbnail ||
              "";
            const dateText = formatDate ? formatDate(blog.createdAt) : "";
            Array.isArray(blog.tags) && blog.tags.length > 0 ? blog.tags[0] : "General";

            return (
              <div key={blog.id || blog._id} className="asset-card">
                <div className="asset-image-wrapper">
                  {img ? (
                    <img
                      src={img}
                      alt={blog.title || blog.excerpt || "Blog"}
                      className="asset-image"
                    />
                  ) : (
                    <div className="asset-placeholder">
                      <FiFileText className="placeholder-icon" />
                    </div>
                  )}
                  <div className="asset-badges">
                    <span
                      className={`status-badge ${
                        isPublished ? "active" : "pending"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="asset-content">
                  <div className="asset-header-row">
                    <h3 className="asset-title">
                      {blog.title || blog.excerpt || "Untitled"}
                    </h3>
                    <div className="asset-menu">
                      <span className="role-badge user">
                        {blog.category
                          ? blog.category.charAt(0).toUpperCase() +
                            blog.category.slice(1)
                          : "General"}
                      </span>
                    </div>
                  </div>
                  <div className="asset-footer">
                    <span className="asset-author">
                      <FiUser className="author-icon" /> by{" "}
                      {blog.authorName || "Unknown"}
                    </span>
                    <span className="asset-date">{dateText}</span>
                  </div>
                  <div className="table-actions">
                    <div>
                      <button
                        className="action-button secondary"
                        onClick={() =>
                          onToggleStatus(blog.id || blog._id, status)
                        }
                      >
                        {isPublished ? "Make Draft" : "Publish"}
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="action-button secondary"
                        onClick={() => {
                          setSelectedBlog(blog);
                          setShowBlogDialog(true);
                        }}
                      >
                        <FiEye className="button-icon" />
                      </button>
                      <button
                        className="action-button secondary"
                        onClick={() => handleEditBlog(blog)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => onDelete(blog.id || blog._id)}
                      >
                        <FiTrash2 className="button-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiFileText className="empty-icon" />
            <h3 className="empty-title">No blog posts found</h3>
            <p className="empty-text">
              {blogSearchTerm
                ? "No blog posts match your search criteria."
                : "No blog posts are currently available."}
            </p>
            <button className="action-button upload-button" onClick={onCreate}>
              <FiPlus className="button-icon" /> Create First Blog Post
            </button>
          </div>
        </div>
      )}

      {showBlogDialog && selectedBlog && (
        <BlogDetailsModal
          blog={selectedBlog}
          onClose={() => setShowBlogDialog(false)}
          formatDate={formatDate}
        />
      )}

      {/* Edit Blog Modal */}
      {isEditModalOpen && blogToEdit && (
        <BlogEditorModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          blogToEdit={blogToEdit}
        />
      )}
    </div>
  );
};

export default BlogSection;