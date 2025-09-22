import React, { useState, useRef } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useQuill } from "react-quilljs";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
      ["link", "image", "video"],
    ],
    handlers: {
      image: null, // Will be set in the component
    },
  },
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "script",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
  "code-block",
  "direction",
];

function BlogEditorModal({ isOpen, onClose }) {
  const { quill, quillRef } = useQuill({ modules, formats });
  const [blogData, setBlogData] = useState({
    title: "",
    slug: "",
    category: "business",
    excerpt: "",
    status: "DRAFT",
    featuredImage: null,
    featuredImageUrl: "",
    coverImage: null,
    coverImageUrl: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const featuredImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  // Custom image handler for Quill
  React.useEffect(() => {
    if (quill) {
      const toolbar = quill.getModule("toolbar");
      toolbar.addHandler("image", () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (file) {
            if (file.size > 1250000) {
              alert("Image must be smaller than 1.25MB");
              return;
            }
            try {
              const storageRef = ref(storage, `blogs/editor-images/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              const imageUrl = await getDownloadURL(storageRef);
              const range = quill.getSelection();
              if (range) {
                quill.insertEmbed(range.index, "image", imageUrl);
              }
            } catch (error) {
              console.error("Error uploading image:", error);
              alert("Failed to upload image: " + error.message);
            }
          }
        };
      });
    }
  }, [quill]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1250000) {
        alert("Featured image must be smaller than 1.25MB");
        return;
      }
      setBlogData((prev) => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1250000) {
        alert("Cover image must be smaller than 1.25MB");
        return;
      }
      setBlogData((prev) => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const content = quillRef.current?.innerHTML || "";
    try {
      const slug = generateSlug(blogData.title);

      let featuredImageUrl = "";
      if (blogData.featuredImage) {
        const storageRef = ref(storage, `blogs/featured-images/${Date.now()}_${blogData.featuredImage.name}`);
        await uploadBytes(storageRef, blogData.featuredImage);
        featuredImageUrl = await getDownloadURL(storageRef);
      }

      let coverImageUrl = "";
      if (blogData.coverImage) {
        const storageRef = ref(storage, `blogs/cover-images/${Date.now()}_${blogData.coverImage.name}`);
        await uploadBytes(storageRef, blogData.coverImage);
        coverImageUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, "blogs"), {
        title: blogData.title,
        slug: slug,
        category: blogData.category,
        excerpt: blogData.excerpt || blogData.content.substring(0, 160) + "...",
        content: content,
        featuredImageUrl: featuredImageUrl,
        coverImageUrl: coverImageUrl,
        status: blogData.status,
        author: "Admin",
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        commentsCount: 0,
        views: 0,
      });

      alert("Blog published successfully!");
      setBlogData({
        title: "",
        slug: "",
        category: "business",
        excerpt: "",
        status: "DRAFT",
        featuredImage: null,
        featuredImageUrl: "",
        coverImage: null,
        coverImageUrl: "",
        content: "",
      });
      setFeaturedImagePreview(null);
      setCoverImagePreview(null);
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
      if (coverImageInputRef.current) coverImageInputRef.current.value = "";
      if (quill) quill.setText("");
      onClose();
    } catch (error) {
      console.error("Error publishing blog:", error);
      alert("Error publishing blog: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay">
      <style>{`
        .blog-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        .blog-modal-container {
          background: #fff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .blog-modal-content {
          padding: 1.5rem;
        }
        .blog-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .blog-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
        }
        .blog-modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }
        .blog-modal-close:hover {
          color: #374151;
        }
        .blog-form-group {
          margin-bottom: 1.5rem;
        }
        .blog-form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .blog-form-required {
          color: #e53e3e;
        }
        .blog-form-input,
        .blog-form-select,
        .blog-form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .blog-form-input:focus,
        .blog-form-select:focus,
        .blog-form-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px #bfdbfe;
        }
        .blog-form-file {
          width: 100%;
          font-size: 0.95rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f9fafb;
        }
        .blog-form-hint {
          font-size: 0.9rem;
          color: #e53e3e;
          margin-top: 0.25rem;
        }
        .blog-form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
        }
        .blog-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
        }
        .blog-btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .blog-btn-cancel:hover {
          background: #d1d5db;
        }
        .blog-btn-submit {
          background: #2563eb;
          color: #fff;
        }
        .blog-btn-submit:hover {
          background: #1d4ed8;
        }
        .blog-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .blog-quill-editor .ql-container {
          min-height: 24rem;
          background: #fff;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
        }
        .blog-image-preview {
          margin-top: 0.5rem;
          max-width: 200px;
          max-height: 200px;
          object-fit: cover;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
        }
      `}</style>
      <div className="blog-modal-container">
        <div className="blog-modal-content">
          <div className="blog-modal-header">
            <h1 className="blog-modal-title">Create a New Blog Post</h1>
            <button onClick={onClose} className="blog-modal-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 24, width: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Title <span className="blog-form-required">*</span>
              </label>
              <input type="text" name="title" value={blogData.title} onChange={handleInputChange} required className="blog-form-input" placeholder="Enter blog title" />
            </div>

            {/* Excerpt */}
            <div className="blog-form-group">
              <label className="blog-form-label">Excerpt (Optional)</label>
              <textarea name="excerpt" value={blogData.excerpt} onChange={handleInputChange} className="blog-form-textarea" placeholder="Short description for preview" rows="3" />
            </div>

            {/* Featured Image */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Featured Image <span className="blog-form-required">*</span>
              </label>
              <input type="file" ref={featuredImageInputRef} onChange={handleFeaturedImageChange} accept="image/*" required className="blog-form-file" />
              <p className="blog-form-hint">* Only images below 1.25MB can be uploaded.</p>
              {featuredImagePreview && <img src={featuredImagePreview} alt="Featured preview" className="blog-image-preview" />}
            </div>

            {/* Cover Image */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Cover Image <span className="blog-form-required">*</span>
              </label>
              <input type="file" ref={coverImageInputRef} onChange={handleCoverImageChange} accept="image/*" required className="blog-form-file" />
              <p className="blog-form-hint">* Only images below 1.25MB can be uploaded.</p>
              {coverImagePreview && <img src={coverImagePreview} alt="Cover preview" className="blog-image-preview" />}
            </div>

            {/* Category */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Category <span className="blog-form-required">*</span>
              </label>
              <select name="category" value={blogData.category} onChange={handleInputChange} required className="blog-form-select">
                <option value="business">Business</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Status */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Status <span className="blog-form-required">*</span>
              </label>
              <select name="status" value={blogData.status} onChange={handleInputChange} required className="blog-form-select">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Content */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Content <span className="blog-form-required">*</span>
              </label>
              <div ref={quillRef} className="blog-quill-editor" />
            </div>

            {/* Buttons */}
            <div className="blog-form-buttons">
              <button type="button" onClick={onClose} className="blog-btn blog-btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="blog-btn blog-btn-submit">
                {isSubmitting ? "Publishing..." : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogEditorModal;
