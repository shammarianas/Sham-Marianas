import React, { useState, useRef, useEffect, useCallback } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useQuill } from "react-quilljs";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

const modules = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
      ["link", "image", "video"],
    ],
    handlers: { image: null },
  },
};

const formats = [
  "header", "bold", "italic", "underline", "strike",
  "blockquote", "code-block",
  "list", "bullet", "indent", "script", "link", "image",
  "video", "color", "background", "align",
];

const extractPureContent = (quillHtml) => {
  if (!quillHtml) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = quillHtml;
  const qlEditor = tempDiv.querySelector(".ql-editor");
  const content = qlEditor ? qlEditor.innerHTML : quillHtml;

  return sanitizeHtml(content, {
    allowedTags: [
      "p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "b", "i",
      "ul", "ol", "li", "a", "img", "div", "span", "br", "blockquote", "code", "pre"
    ],
    allowedAttributes: {
      '*': ['class', 'style', 'data-list'],
      a: ["href", "target", "rel"],
      span: ["class"],
      img: ["src", "alt", "width", "height", "class"],
    },
    allowedClasses: { '*': ['ql-align-*', 'ql-indent-*'] },
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left|center|right|justify$/],
        'float': [/^left|right|none$/],
        'margin': [/^[\d.]+(px|rem|em)?$/],
        'padding': [/^[\d.]+(px|rem|em)?$/],
        'max-width': [/^[\d.]+(px|%)?$/],
        'display': [/^block|inline-block$/],
      }
    }
  });
};

function BlogEditorModal({ isOpen, onClose, blogToEdit }) {
  const { quill, quillRef } = useQuill({ modules, formats });
  const [blogData, setBlogData] = useState({
    title: "", slug: "", category: "business", excerpt: "", tags: [], status: "DRAFT",
    featuredImage: null, featureImgUrl: "", coverImage: null, coverImageUrl: "", content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const featuredImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const tagInputRef = useRef(null);

  // Generate clean slug
  const generateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .slice(0, 100);
  };

  const loadContent = useCallback(() => {
    if (quill && blogToEdit?.content && isOpen && isEditorLoaded) {
      try {
        const cleanContent = extractPureContent(blogToEdit.content);
        quill.clipboard.dangerouslyPasteHTML(cleanContent);
        quill.setSelection(quill.getLength(), 0);
      } catch (error) {
        console.error("Error loading content:", error);
      }
    }
  }, [quill, blogToEdit?.content, isOpen, isEditorLoaded]);

  const initializeEditor = () => {
    if (quill && isOpen && !blogToEdit) {
      setTimeout(() => {
        quill.clipboard.dangerouslyPasteHTML(0, '<p><br></p>', 'user');
        setIsEditorLoaded(true);
      }, 100);
    }
  };

  const getCurrentContent = () => {
    if (!quill) return "";
    return extractPureContent(quill.root.innerHTML);
  };

  // Load blog data
  useEffect(() => {
    if (blogToEdit && isOpen) {
      const existingTags = Array.isArray(blogToEdit.tags)
        ? blogToEdit.tags
        : blogToEdit.tags?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];

      setBlogData({
        title: blogToEdit.title || "",
        slug: blogToEdit.slug || generateSlug(blogToEdit.title || ""),
        category: blogToEdit.category || "business",
        excerpt: blogToEdit.excerpt || "",
        tags: existingTags,
        status: blogToEdit.status || "DRAFT",
        featuredImage: null,
        featureImgUrl: blogToEdit.featureImgUrl || blogToEdit.featuredImageUrl || "",
        coverImage: null,
        coverImageUrl: blogToEdit.coverImageUrl || "",
        content: blogToEdit.content || "",
      });

      if (blogToEdit.featureImgUrl || blogToEdit.featuredImageUrl) {
        setFeaturedImagePreview(blogToEdit.featureImgUrl || blogToEdit.featuredImageUrl);
      }
      if (blogToEdit.coverImageUrl) {
        setCoverImagePreview(blogToEdit.coverImageUrl);
      }
    } else if (!blogToEdit && isOpen) {
      setBlogData({
        title: "", slug: "", category: "business", excerpt: "", tags: [], status: "DRAFT",
        featuredImage: null, featureImgUrl: "", coverImage: null, coverImageUrl: "", content: "",
      });
      setFeaturedImagePreview(null);
      setCoverImagePreview(null);
      setTagInput("");
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
      if (coverImageInputRef.current) coverImageInputRef.current.value = "";
    }
  }, [blogToEdit, isOpen]);

  // Editor init
  useEffect(() => {
    if (quill && isOpen) {
      setIsEditorLoaded(true);
      if (!blogToEdit) initializeEditor();
    }
  }, [quill, isOpen, blogToEdit]);

  useEffect(() => {
    if (isEditorLoaded && blogToEdit) loadContent();
  }, [isEditorLoaded, loadContent]);

  // Header labels
  useEffect(() => {
    if (quill) {
      const style = document.createElement('style');
      style.textContent = `
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="1"]::after { content: "H1" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="2"]::after { content: "H2" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="3"]::after { content: "H3" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="4"]::after { content: "H4" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="5"]::after { content: "H5" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value="6"]::after { content: "H6" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value=""]::before,
        .blog-quill-editor .ql-picker.ql-header .ql-picker-label[data-value=""]::after { content: "P" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value="1"]::before { content: "H1" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: "H2" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: "H3" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value="4"]::before { content: "H4" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value="5"]::before { content: "H5" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value="6"]::before { content: "H6" !important; }
        .blog-quill-editor .ql-picker.ql-header .ql-picker-item[data-value=""]::before { content: "P" !important; }
      `;
      document.head.appendChild(style);
      return () => document.head.contains(style) && document.head.removeChild(style);
    }
  }, [quill]);

  // IMAGE TOOLTIP + UPLOAD
  useEffect(() => {
    if (!quill) return;

    const ImageBlot = Quill.import("formats/image");
    class CustomImage extends ImageBlot {
      static create(value) {
        const node = super.create();
        if (typeof value === "string") {
          node.setAttribute("src", value);
          node.setAttribute("alt", "Image");
        } else if (value && value.src) {
          node.setAttribute("src", value.src);
          node.setAttribute("alt", value.alt || "Image");
        }
        return node;
      }
      static value(node) {
        return { src: node.getAttribute("src"), alt: node.getAttribute("alt") || "Image" };
      }
    }
    CustomImage.blotName = "image";
    CustomImage.tagName = "img";
    Quill.register(CustomImage, true);

    class ImageTooltip {
      constructor(quill) {
        this.quill = quill;
        this.tooltip = this.createTooltip();
        this.currentImage = null;
        this.hide();
        this.bindEvents();
      }

      createTooltip() {
        const tooltip = document.createElement("div");
        tooltip.className = "ql-image-tooltip";
        tooltip.style.cssText = `
          position: absolute; background: white; border: 1px solid #ccc;
          border-radius: 8px; padding: 10px; box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          z-index: 999999; font-family: inherit; font-size: 13px; min-width: 220px;
          pointer-events: auto;
        `;
        tooltip.innerHTML = `
          <div style="margin-bottom:8px;">
            <label style="display:block;font-weight:600;margin-bottom:4px;color:#374151;">Alt Text:</label>
            <input type="text" class="ql-alt-input" placeholder="Describe image..."
                   style="width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;outline:none;" />
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="ql-align-left" title="Left">L</button>
            <button class="ql-align-center" title="Center">C</button>
            <button class="ql-align-right" title="Right">R</button>
            <button class="ql-remove" title="Remove" style="background:#ef4444;color:white;">Remove</button>
            <button class="ql-save" style="background:#10b981;color:white;flex:1;">Save</button>
          </div>
        `;
        document.body.appendChild(tooltip);
        return tooltip;
      }

      bindEvents() {
        const handleClick = (e) => {
          const img = e.target.closest("img");
          if (img && img.closest(".ql-editor") === this.quill.root) {
            e.preventDefault(); e.stopPropagation();
            this.show(img);
          } else this.hide();
        };
        this.quill.root.addEventListener("click", handleClick);
        this.quill.root.style.cursor = "pointer";

        const handleOutside = (e) => {
          if (!this.tooltip.contains(e.target) && !this.quill.root.contains(e.target)) this.hide();
        };
        document.addEventListener("click", handleOutside);

        this.tooltip.addEventListener("click", (e) => {
          e.stopPropagation();
          const img = this.currentImage;
          if (!img) return;
          const altInput = this.tooltip.querySelector(".ql-alt-input");

          if (e.target.classList.contains("ql-align-left")) {
            img.style.cssText = "float:left;margin:0 12px 12px 0;display:block;max-width:100%;";
          } else if (e.target.classList.contains("ql-align-center")) {
            img.style.cssText = "float:none;display:block;margin:12px auto;max-width:100%;";
          } else if (e.target.classList.contains("ql-align-right")) {
            img.style.cssText = "float:right;margin:0 0 12px 12px;display:block;max-width:100%;";
          } else if (e.target.classList.contains("ql-remove")) {
            const range = this.quill.getSelection();
            if (range) this.quill.deleteText(range.index - 1, 1);
            this.hide();
          } else if (e.target.classList.contains("ql-save")) {
            img.setAttribute("alt", altInput.value.trim() || "Image");
            this.hide();
          }
        });

        this.cleanup = () => {
          this.quill.root.removeEventListener("click", handleClick);
          document.removeEventListener("click", handleOutside);
        };
      }

      show(img) {
        this.currentImage = img;
        const rect = img.getBoundingClientRect();
        const altInput = this.tooltip.querySelector(".ql-alt-input");
        altInput.value = img.getAttribute("alt") || "";
        const centerX = rect.left + window.scrollX + rect.width / 2;
        const centerY = rect.top + window.scrollY + rect.height / 2;
        this.tooltip.style.display = "block";
        this.tooltip.style.left = `${centerX - this.tooltip.offsetWidth / 2}px`;
        this.tooltip.style.top = `${centerY - this.tooltip.offsetHeight / 2}px`;
      }

      hide() {
        this.tooltip.style.display = "none";
        this.currentImage = null;
      }
    }

    const imageTooltip = new ImageTooltip(quill);
    const toolbar = quill.getModule("toolbar");

    toolbar.addHandler("image", () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 1250000) {
          alert("Image must be smaller than 1.25MB");
          return;
        }

        const defaultAlt = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ") || "Image";

        try {
          const storageRef = ref(storage, `blogs/editor-images/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const imageUrl = await getDownloadURL(storageRef);
          const range = quill.getSelection() || { index: 0 };

          quill.insertEmbed(range.index, "image", imageUrl);
          quill.setSelection(range.index + 1);

          setTimeout(() => {
            const img = quill.root.querySelector(`img[src="${imageUrl}"]`);
            if (img) {
              img.setAttribute("alt", defaultAlt);
              imageTooltip.show(img);
            }
          }, 100);
        } catch (error) {
          console.error("Upload error:", error);
          alert("Failed to upload image.");
        }
      };
    });

    return () => {
      if (imageTooltip.cleanup) imageTooltip.cleanup();
      if (imageTooltip.tooltip?.parentNode) {
        imageTooltip.tooltip.parentNode.removeChild(imageTooltip.tooltip);
      }
    };
  }, [quill]);


  useEffect(() => {
    if (!quill) return;

    const List = Quill.import('formats/list');

    class CustomList extends List {
      static create(value) {
        const node = super.create(value);
        if (value === 'bullet') {
          node.setAttribute('data-list', 'bullet');
        } else if (value === 'ordered') {
          node.setAttribute('data-list', 'ordered');
        }
        return node;
      }

      static formats(node) {
        const list = node.getAttribute('data-list');
        if (node.tagName === 'UL' && !list) return 'bullet'; // ← Force bullet for plain <ul>
        return list || 'bullet';
      }
    }

    Quill.register('formats/list', CustomList, true);

    // Force style on load
    const applyStyles = () => {
      quill.root.querySelectorAll('ul').forEach(ul => {
        if (!ul.hasAttribute('data-list')) {
          ul.setAttribute('data-list', 'bullet');
        }
        ul.style.listStyleType = 'disc';
        ul.style.paddingLeft = '1.5em';
      });
      quill.root.querySelectorAll('ol').forEach(ol => {
        ol.style.listStyleType = 'decimal';
      });
    };

    setTimeout(applyStyles, 100);
    const handler = () => setTimeout(applyStyles, 0);
    quill.on('text-change', handler);

    return () => quill.off('text-change', handler);
  }, [quill]);

  // Handlers
  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (blogData.tags.length < 10 && !blogData.tags.includes(newTag)) {
        setBlogData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput("");
      tagInputRef.current?.focus();
    }
  };

  const handleTagRemove = (tag) => {
    setBlogData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // If title changes, also update slug in state
    if (name === "title") {
      const newSlug = generateSlug(value);
      setBlogData(prev => ({ ...prev, title: value, slug: newSlug }));
    } else {
      setBlogData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1250000) {
      setBlogData(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setFeaturedImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Featured image must be smaller than 1.25MB");
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1250000) {
      setBlogData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Cover image must be smaller than 1.25MB");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const content = getCurrentContent();
    if (!blogData.title.trim()) {
      alert("Title is required!");
      setIsSubmitting(false);
      return;
    }
    if (!content.trim()) {
      alert("Please add some content!");
      setIsSubmitting(false);
      return;
    }

    try {
      // SLUG LOGIC
      let slug = blogData.slug;
      if (!slug || blogData.title !== blogToEdit?.title) {
        slug = generateSlug(blogData.title);
      }
      if (!slug) {
        alert("Invalid title for slug. Use letters/numbers.");
        setIsSubmitting(false);
        return;
      }

      let featureImgUrl = blogData.featureImgUrl;
      if (blogData.featuredImage) {
        const storageRef = ref(storage, `blogs/featured-images/${Date.now()}_${blogData.featuredImage.name}`);
        await uploadBytes(storageRef, blogData.featuredImage);
        featureImgUrl = await getDownloadURL(storageRef);
      }

      let coverImageUrl = blogData.coverImageUrl;
      if (blogData.coverImage) {
        const storageRef = ref(storage, `blogs/cover-images/${Date.now()}_${blogData.coverImage.name}`);
        await uploadBytes(storageRef, blogData.coverImage);
        coverImageUrl = await getDownloadURL(storageRef);
      }

      const blogDataToSave = {
        title: blogData.title.trim(),
        slug, // SAVED
        category: blogData.category,
        excerpt: blogData.excerpt || content.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
        tags: blogData.tags,
        content,
        featureImgUrl,
        coverImageUrl,
        status: blogData.status,
        author: "Admin",
        updatedAt: serverTimestamp(),
      };

      if (blogToEdit) {
        await updateDoc(doc(db, "blogs", blogToEdit.id), blogDataToSave);
        alert("Blog updated successfully!");
      } else {
        await addDoc(collection(db, "blogs"), {
          ...blogDataToSave,
          publishedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          commentsCount: 0,
          views: 0,
        });
        alert("Blog published successfully!");
      }

      // Reset
      setBlogData({
        title: "", slug: "", category: "business", excerpt: "", tags: [], status: "DRAFT",
        featuredImage: null, featureImgUrl: "", coverImage: null, coverImageUrl: "", content: ""
      });
      setFeaturedImagePreview(null);
      setCoverImagePreview(null);
      setTagInput("");
      setIsEditorLoaded(false);
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
      if (coverImageInputRef.current) coverImageInputRef.current.value = "";
      if (quill) quill.clipboard.dangerouslyPasteHTML(0, '<p><br></p>', 'user');
      onClose();

    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay">
      <style>{`
        span { display: inline; }
        .blog-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); 
          display: flex; align-items: center; justify-content: center; 
          z-index: 9999; padding: 1rem;
        }
        .blog-modal-container {
          background: #fff; border-radius: 1.25rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25);
          width: 100%; max-width: 1100px; max-height: 90vh; overflow: hidden;
        }
        .blog-modal-content { padding: 2rem; height: 90vh; overflow-y: auto; }
        .blog-modal-header {
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;
        }
        .blog-modal-title { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0; }
        .blog-modal-close {
          background: none; border: none; color: #6b7280; cursor: pointer; 
          padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s;
        }
        .blog-modal-close:hover { background: #fee2e2; color: #dc2626; }
        .blog-form-group { margin-bottom: 1.75rem; }
        .blog-form-label {
          display: block; font-size: 0.95rem; font-weight: 600; 
          color: #374151; margin-bottom: 0.5rem;
        }
        .blog-form-required { color: #dc2626; }
        .blog-form-input, .blog-form-select, .blog-form-textarea {
          width: 100%; padding: 0.875rem 1rem; border: 2px solid #e5e7eb; 
          border-radius: 0.75rem; font-size: 1rem; outline: none; 
          transition: all 0.2s; background: #fafafa; font-family: inherit;
        }
        .blog-form-input:focus, .blog-form-select:focus, .blog-form-textarea:focus {
          border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #fff;
        }
        .blog-tags-container {
          display: flex; flex-wrap: wrap; gap: 0.5rem; 
          padding: 0.875rem 1rem; border: 2px solid #e5e7eb; 
          border-radius: 0.75rem; background: #fafafa;
          min-height: 48px; align-items: center;
        }
        .blog-tags-container:focus-within {
          border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #fff;
        }
        .blog-tag-input {
          flex: 1; border: none; outline: none; background: transparent; 
          font-size: 1rem; min-width: 100px;
        }
        .blog-tag-input::placeholder { color: #9ca3af; }
        .blog-tag {
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.375rem 0.75rem; border-radius: 9999px;
          font-size: 0.875rem; font-weight: 500;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          animation: tagSlideIn 0.2s ease-out;
        }
        .blog-tag:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4); }
        .blog-tag-remove {
          background: rgba(255,255,255,0.3); width: 16px; height: 16px;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 10px; font-weight: bold;
          cursor: pointer; transition: all 0.2s;
        }
        .blog-tag-remove:hover { background: rgba(255,255,255,0.5); transform: scale(1.1); }
        @keyframes tagSlideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .blog-form-file {
          color:#000; width: 100%; font-size: 0.95rem; border: 2px dashed #d1d5db; 
          border-radius: 0.75rem; padding: 2rem; text-align: center; 
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          transition: all 0.2s; cursor: pointer;
        }
        .blog-form-file:hover { border-color: #3b82f6; background: #eff6ff; }
        .blog-form-hint { font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; font-style: italic; }
        .blog-form-buttons {
          display: flex; justify-content: flex-end; gap: 1rem; 
          padding-top: 2rem; border-top: 1px solid #e5e7eb; margin-top: 2rem;
        }
        .blog-btn {
          padding: 0.75rem 2rem; border-radius: 0.75rem; border: none; 
          font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .blog-btn-cancel { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); color: #374151; 
        }
        .blog-btn-cancel:hover { background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); transform: translateY(-1px); }
        .blog-btn-submit { 
          background: #52b0b4; color: #fff; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }
        .blog-btn-submit:hover:not(:disabled) { 
          background: #52b0b4; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        .blog-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .blog-quill-editor .ql-container {
          min-height: 400px; background: #fff; border-radius: 1rem; 
          border: 2px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .blog-quill-editor .ql-toolbar {
          border-radius: 1rem 1rem 0 0; border-color: #e5e7eb; background: #fafafa;
        }
        .blog-quill-editor .ql-editor { max-height: 500px; overflow-y: auto; }
        .blog-image-preview {
          margin-top: 1rem; max-width: 250px; max-height: 150px; 
          object-fit: cover; border-radius: 0.75rem; 
          border: 2px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .current-image-note {
          font-size: 0.875rem; color: #059669; font-style: italic; 
          margin-top: 0.5rem; background: #ecfdf5; padding: 0.5rem 0.75rem;
          border-radius: 0.5rem; border-left: 4px solid #10b981;
        }
        .ql-editor { max-height: 500px; overflow-y: auto; }
        .ql-image-tooltip {
          position: absolute; background: white; border: 1px solid #ccc;
          border-radius: 8px; padding: 10px; box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          z-index: 999999; font-family: inherit; font-size: 13px; min-width: 220px;
          pointer-events: auto; transform: translateX(-50%); transition: none !important;
        }
        .ql-image-tooltip button {
          padding: 6px 10px; border: none; background: #f3f4f6;
          border-radius: 4px; font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .ql-image-tooltip button:hover { background: #e5e7eb; }
        .ql-image-tooltip .ql-save, .ql-image-tooltip .ql-remove { font-weight: 600; }
        .ql-image-tooltip .ql-save:hover { background: #059669 !important; }
        .ql-image-tooltip .ql-remove:hover { background: #dc2626 !important; }
        .ql-snow .ql-editor img { cursor: pointer; }
        @media (max-width: 768px) {
          .blog-modal-content { padding: 1.5rem; }
          .blog-modal-title { font-size: 1.25rem; }
          .blog-quill-editor .ql-container { min-height: 300px; }
          .blog-tags-container { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }


      `}</style>

      <div className="blog-modal-container">
        <div className="blog-modal-content">
          <div className="blog-modal-header">
            <h1 className="blog-modal-title">{blogToEdit ? "Edit Blog Post" : "Create New Blog Post"}</h1>
            <button onClick={onClose} className="blog-modal-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 24, width: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="blog-form-group">
              <label className="blog-form-label">Title <span className="blog-form-required">*</span></label>
              <input type="text" name="title" value={blogData.title} onChange={handleInputChange} required className="blog-form-input" placeholder="Enter an engaging blog title..." />
            </div>

            {/* SLUG DISPLAY */}
            <div className="blog-form-group">
              <div className="flex items-center gap-2">
                <label className="blog-form-label">URL Slug</label>
                <span className="text-sm text-gray-600">yoursite.com/blog/</span>
              </div>
              <input type="text" value={blogData.slug} readOnly className="blog-form-input text-sm bg-gray-50" placeholder="auto-generated" />
              <p className="blog-form-hint">Auto-generated from title. Clean & SEO-friendly.</p>
            </div>

            {/* Rest of form */}
            <div className="blog-form-group">
              <label className="blog-form-label">Tags (Max 10)</label>
              <div className="blog-tags-container" tabIndex="0">
                {blogData.tags.map((tag, index) => (
                  <div key={index} className="blog-tag">
                    #{tag}
                    <span className="blog-tag-remove" onClick={() => handleTagRemove(tag)}>×</span>
                  </div>
                ))}
                <input ref={tagInputRef} type="text" className="blog-tag-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagAdd} placeholder={blogData.tags.length === 0 ? "Type tag and press Enter..." : "Press Enter to add tag..."} maxLength={20} />
              </div>
              <p className="blog-form-hint">Type tag name and press Enter. Max 10 tags. Click × to remove.</p>
              {blogData.tags.length > 0 && (
                <p className="current-image-note" style={{ marginTop: '0.5rem' }}>
                  {blogData.tags.length} tag{blogData.tags.length > 1 ? 's' : ''} added
                </p>
              )}
            </div>

            {/* Featured & Cover Image */}
            <div className="blog-form-group">
              <label className="blog-form-label">Featured Image <span className="blog-form-required">*</span></label>
              <input type="file" ref={featuredImageInputRef} onChange={handleFeaturedImageChange} accept="image/*" className="blog-form-file" />
              <p className="blog-form-hint">JPG, PNG, WebP • Max 1.25MB • 1200x630px recommended</p>
              {blogData.featureImgUrl && !blogData.featuredImage && (
                <p className="current-image-note">Current featured image will be retained</p>
              )}
              {featuredImagePreview && <img src={featuredImagePreview} alt="Preview" className="blog-image-preview" />}
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">Cover Image <span className="blog-form-required">*</span></label>
              <input type="file" ref={coverImageInputRef} onChange={handleCoverImageChange} accept="image/*" className="blog-form-file" />
              <p className="blog-form-hint">JPG, PNG, WebP • Max 1.25MB • 1600x900px recommended</p>
              {blogData.coverImageUrl && !blogData.coverImage && (
                <p className="current-image-note">Current cover image will be retained</p>
              )}
              {coverImagePreview && <img src={coverImagePreview} alt="Preview" className="blog-image-preview" />}
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">Category <span className="blog-form-required">*</span></label>
              <select name="category" value={blogData.category} onChange={handleInputChange} required className="blog-form-select">
                <option value="business">Business</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="ai">Artificial Intelligence</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">Status <span className="blog-form-required">*</span></label>
              <select name="status" value={blogData.status} onChange={handleInputChange} required className="blog-form-select">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">Content <span className="blog-form-required">*</span></label>
              <div ref={quillRef} className="blog-quill-editor" />
              <p className="blog-form-hint">Use the toolbar to format your content. All formatting will be preserved.</p>
            </div>

            <div className="blog-form-buttons">
              <button type="button" onClick={onClose} className="blog-btn blog-btn-cancel">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="blog-btn blog-btn-submit">
                {isSubmitting ? (blogToEdit ? "Updating..." : "Publishing...") : blogToEdit ? "Update Blog" : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogEditorModal;