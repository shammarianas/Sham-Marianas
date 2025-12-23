import React, { useState, useRef, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const ProjectModal = ({ isOpen, onClose, projectToEdit }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    category: "design",
    client: "",
    startDate: "",
    designer: "",
    challengeTitle: "The Challenge",
    challengeDescription: "",
    description: "",
    descriptionImages: [],
    coverImage: null,
    featureImage: null,
    coverImgUrl: "",
    featureImgUrl: "",
    descriptionImgUrls: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const coverImageInputRef = useRef(null);
  const descriptionImageInputRef = useRef(null);
  const featureImageInputRef = useRef(null);

  // Edit mode mein data set karo
  useEffect(() => {
    if (projectToEdit) {
      setIsEditMode(true);
      setProjectData({
        title: projectToEdit.title || "",
        category: projectToEdit.category || "design",
        client: projectToEdit.client || "",
        startDate: projectToEdit.startDate || "",
        designer: projectToEdit.designer || "",
        challengeTitle: projectToEdit.challengeTitle || "The Challenge",
        challengeDescription: projectToEdit.challengeDescription || "",
        description: projectToEdit.description || "",
        descriptionImages: [],
        coverImage: null,
        featureImage: null,
        coverImgUrl: projectToEdit.coverImgUrl || "",
        featureImgUrl: projectToEdit.featureImgUrl || "",
        descriptionImgUrls: projectToEdit.descriptionImgUrls || [],
      });
    } else {
      setIsEditMode(false);
      setProjectData({
        title: "",
        category: "design",
        client: "",
        startDate: "",
        designer: "",
        challengeTitle: "The Challenge",
        challengeDescription: "",
        description: "",
        descriptionImages: [],
        coverImage: null,
        featureImage: null,
        coverImgUrl: "",
        featureImgUrl: "",
        descriptionImgUrls: [],
      });
    }
  }, [projectToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverImgChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validImageTypes.includes(file.type)) {
        alert(`Image ${file.name} is not a valid image type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return;
      }
      if (file.size > 1250000) {
        alert(`Image ${file.name} must be smaller than 1.25MB`);
        return;
      }
      setProjectData((prev) => ({
        ...prev,
        coverImage: file,
        coverImgUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleFeatureImgChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validImageTypes.includes(file.type)) {
        alert(`Image ${file.name} is not a valid image type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return;
      }
      if (file.size > 1250000) {
        alert(`Image ${file.name} must be smaller than 1.25MB`);
        return;
      }
      setProjectData((prev) => ({
        ...prev,
        featureImage: file,
        featureImgUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleDescriptionImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter((file) => {
        const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validImageTypes.includes(file.type)) {
          alert(`Image ${file.name} is not a valid image type. Only JPEG, PNG, GIF, and WebP are allowed.`);
          return false;
        }
        if (file.size > 1250000) {
          alert(`Image ${file.name} must be smaller than 1.25MB`);
          return false;
        }
        return true;
      });

      const imagePreviews = filesArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setProjectData((prev) => ({
        ...prev,
        descriptionImages: [...prev.descriptionImages, ...imagePreviews],
      }));
    }
  };

  const removeDescriptionImage = (index) => {
    setProjectData((prev) => {
      const newImages = [...prev.descriptionImages];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return { ...prev, descriptionImages: newImages };
    });
  };

  const removeExistingDescriptionImage = (index) => {
    setProjectData((prev) => {
      const newImgUrls = [...prev.descriptionImgUrls];
      newImgUrls.splice(index, 1);
      return { ...prev, descriptionImgUrls: newImgUrls };
    });
  };

  const clearDescriptionImages = () => {
    setProjectData((prev) => {
      prev.descriptionImages.forEach((image) => URL.revokeObjectURL(image.preview));
      return { ...prev, descriptionImages: [] };
    });
    if (descriptionImageInputRef.current) {
      descriptionImageInputRef.current.value = "";
    }
  };

  const clearCoverImage = () => {
    setProjectData((prev) => {
      if (prev.coverImgUrl && prev.coverImgUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prev.coverImgUrl);
      }
      return { ...prev, coverImage: null, coverImgUrl: "" };
    });
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const clearFeatureImage = () => {
    setProjectData((prev) => {
      if (prev.featureImgUrl && prev.featureImgUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prev.featureImgUrl);
      }
      return { ...prev, featureImage: null, featureImgUrl: "" };
    });
    if (featureImageInputRef.current) {
      featureImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let descriptionImgUrls = [...projectData.descriptionImgUrls];
      
      // New description images upload karo
      if (projectData.descriptionImages.length > 0) {
        const uploadPromises = projectData.descriptionImages.map(async (image) => {
          const storageRef = ref(storage, `projects/${image.file.name}-${Date.now()}`);
          await uploadBytes(storageRef, image.file);
          return await getDownloadURL(storageRef);
        });
        const newUrls = await Promise.all(uploadPromises);
        descriptionImgUrls = [...descriptionImgUrls, ...newUrls];
      }

      let coverImgUrl = projectData.coverImgUrl;
      // Agar new cover image upload kiya hai
      if (projectData.coverImage) {
        // Purani image delete karo agar edit mode mein hai
        if (isEditMode && projectToEdit.coverImgUrl) {
          try {
            const oldImageRef = ref(storage, projectToEdit.coverImgUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log("Old cover image delete nahi hui:", error);
          }
        }
        const storageRef = ref(storage, `projects/${projectData.coverImage.name}-${Date.now()}`);
        await uploadBytes(storageRef, projectData.coverImage);
        coverImgUrl = await getDownloadURL(storageRef);
      }

      let featureImgUrl = projectData.featureImgUrl;
      // Agar new feature image upload kiya hai
      if (projectData.featureImage) {
        // Purani image delete karo agar edit mode mein hai
        if (isEditMode && projectToEdit.featureImgUrl) {
          try {
            const oldImageRef = ref(storage, projectToEdit.featureImgUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log("Old feature image delete nahi hui:", error);
          }
        }
        const storageRef = ref(storage, `projects/${projectData.featureImage.name}-${Date.now()}`);
        await uploadBytes(storageRef, projectData.featureImage);
        featureImgUrl = await getDownloadURL(storageRef);
      }

      const projectDataToSave = {
        title: projectData.title,
        category: projectData.category,
        client: projectData.client,
        startDate: projectData.startDate,
        designer: projectData.designer,
        challengeTitle: projectData.challengeTitle,
        challengeDescription: projectData.challengeDescription,
        description: projectData.description,
        descriptionImgUrls,
        coverImgUrl,
        featureImgUrl,
        updatedAt: new Date(),
      };

      if (isEditMode) {
        // Update existing project
        await updateDoc(doc(db, "projects", projectToEdit.id), projectDataToSave);
      } else {
        // Create new project
        projectDataToSave.createdAt = new Date();
        await addDoc(collection(db, "projects"), projectDataToSave);
      }

      // Form reset karo
      setProjectData({
        title: "",
        category: "design",
        client: "",
        startDate: "",
        designer: "",
        challengeTitle: "The Challenge",
        challengeDescription: "",
        description: "",
        descriptionImages: [],
        coverImage: null,
        featureImage: null,
        coverImgUrl: "",
        featureImgUrl: "",
        descriptionImgUrls: [],
      });
      clearDescriptionImages();
      clearCoverImage();
      clearFeatureImage();
      onClose();
    } catch (error) {
      console.error("Error saving project: ", error);
      alert("Error saving project: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay">
      <style>{`
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
        .blog-modal-title { 
          font-size: 1.5rem; font-weight: 700; color: #1f2937; 
          margin: 0; 
        }
        .blog-modal-close {
          background: none; border: none; color: #6b7280; cursor: pointer; 
          padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s;
        }
        .blog-modal-close:hover { 
          background: #fee2e2; color: #dc2626; 
        }
        .blog-form-group { margin-bottom: 1.75rem; }
        .blog-form-label {
          display: block; font-size: 0.95rem; font-weight: 600; 
          color: #374151; margin-bottom: 0.5rem;
        }
        .blog-form-required { color: #dc2626; }
        .blog-form-input, .blog-form-select, .blog-form-textarea {
          width: 100%; padding: 0.875rem 1rem; border: 2px solid #e5e7eb; 
          border-radius: 0.75rem; font-size: 1rem; outline: none; 
          transition: all 0.2s; background: #fafafa;
          font-family: inherit;
        }
        .blog-form-input:focus, .blog-form-select:focus, .blog-form-textarea:focus {
          border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #fff;
        }
        .blog-form-file {
          color:#000;
          width: 100%; font-size: 0.95rem; border: 2px dashed #d1d5db; 
          border-radius: 0.75rem; padding: 2rem; text-align: center; 
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          transition: all 0.2s; cursor: pointer;
        }
        .blog-form-file:hover { border-color: #3b82f6; background: #eff6ff; }
        .blog-form-hint { 
          font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; 
          font-style: italic;
        }
        .blog-form-buttons {
          display: flex; justify-content: flex-end; gap: 1rem; 
          padding-top: 2rem; border-top: 1px solid #e5e7eb; margin-top: 2rem;
        }
        .blog-btn {
          padding: 0.75rem 2rem; border-radius: 0.75rem; border: none; 
          font-size: 1rem; font-weight: 600; cursor: pointer; 
          transition: all 0.2s;
        }
        .blog-btn-cancel { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          color: #374151; 
        }
        .blog-btn-cancel:hover { 
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); 
          transform: translateY(-1px);
        }
        .blog-btn-submit { 
          background: #52b0b4; 
          color: #fff; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }
        .blog-btn-submit:hover:not(:disabled) { 
          background: #52b0b4; 
          transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        .blog-btn-submit:disabled { 
          opacity: 0.6; cursor: not-allowed; transform: none; 
        }
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
        .image-preview-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .image-preview {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .image-preview:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-image-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #dc2626;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 16px;
        }
        .image-preview:hover .remove-image-btn {
          opacity: 1;
        }
        .image-filename {
          font-size: 0.85rem;
          color: #4b5563;
          text-align: center;
          margin-top: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .existing-images-section {
          margin-top: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 0.75rem;
          border: 2px solid #e5e7eb;
        }
        .existing-images-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }
        .mt-2 { margin-top: 0.5rem; }
        @media (max-width: 768px) {
          .blog-modal-content { padding: 1.5rem; }
          .blog-modal-title { font-size: 1.25rem; }
        }
      `}</style>

      <div className="blog-modal-container">
        <div className="blog-modal-content">
          <div className="blog-modal-header">
            <h1 className="blog-modal-title">
              {isEditMode ? "Edit Project" : "Create New Project"}
            </h1>
            <button onClick={onClose} className="blog-modal-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 24, width: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="blog-form-group">
              <label className="blog-form-label">
                Project Title <span className="blog-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={projectData.title} 
                onChange={handleInputChange} 
                required 
                className="blog-form-input" 
                placeholder="Enter project title" 
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Category <span className="blog-form-required">*</span>
              </label>
              <select name="category" value={projectData.category} onChange={handleInputChange} required className="blog-form-select">
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="marketing">Printing</option>
              </select>
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Country <span className="blog-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="client" 
                value={projectData.client} 
                onChange={handleInputChange} 
                required 
                className="blog-form-input" 
                placeholder="Enter client name" 
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Start Date <span className="blog-form-required">*</span>
              </label>
              <input 
                type="date" 
                name="startDate" 
                value={projectData.startDate} 
                onChange={handleInputChange} 
                required 
                className="blog-form-input" 
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Designer <span className="blog-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="designer" 
                value={projectData.designer} 
                onChange={handleInputChange} 
                required 
                className="blog-form-input" 
                placeholder="Enter designer name" 
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Challenge Title <span className="blog-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="challengeTitle" 
                value={projectData.challengeTitle} 
                onChange={handleInputChange} 
                required 
                className="blog-form-input" 
                placeholder="Enter challenge title" 
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Challenge Description <span className="blog-form-required">*</span>
              </label>
              <textarea
                name="challengeDescription"
                value={projectData.challengeDescription}
                onChange={handleInputChange}
                required
                className="blog-form-textarea"
                placeholder="Enter challenge description"
                rows="4"
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Project Cover Image {!isEditMode && <span className="blog-form-required">*</span>}
              </label>
              <input 
                type="file" 
                ref={coverImageInputRef} 
                onChange={handleCoverImgChange} 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                className="blog-form-file" 
              />
              <p className="blog-form-hint">🖼️ JPG, PNG, WebP • Max 1.25MB • 1600x900px recommended</p>
              {(projectData.coverImage || projectData.coverImgUrl) && (
                <div className="mt-2">
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img  loading="lazy"  
                        src={projectData.coverImgUrl} 
                        alt="Cover preview" 
                      />
                      <button 
                        type="button" 
                        onClick={clearCoverImage} 
                        className="remove-image-btn" 
                        title="Remove image"
                      >
                        ×
                      </button>
                      <p className="image-filename">
                        {projectData.coverImage ? projectData.coverImage.name : "Existing Image"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Project Feature Image {!isEditMode && <span className="blog-form-required">*</span>}
              </label>
              <input 
                type="file" 
                ref={featureImageInputRef} 
                onChange={handleFeatureImgChange} 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                className="blog-form-file" 
              />
              <p className="blog-form-hint">⭐ JPG, PNG, WebP • Max 1.25MB • 1200x630px recommended</p>
              {(projectData.featureImage || projectData.featureImgUrl) && (
                <div className="mt-2">
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img  loading="lazy"  
                        src={projectData.featureImgUrl} 
                        alt="Feature preview" 
                      />
                      <button 
                        type="button" 
                        onClick={clearFeatureImage} 
                        className="remove-image-btn" 
                        title="Remove image"
                      >
                        ×
                      </button>
                      <p className="image-filename">
                        {projectData.featureImage ? projectData.featureImage.name : "Existing Image"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label">
                Project Description Images (Multiple) {!isEditMode && <span className="blog-form-required">*</span>}
              </label>
              <input
                type="file"
                ref={descriptionImageInputRef}
                onChange={handleDescriptionImageChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="blog-form-file"
              />
              <p className="blog-form-hint">📸 JPG, PNG, WebP • Max 1.25MB • Multiple images supported</p>
              
              {/* Existing description images (edit mode mein) */}
              {isEditMode && projectData.descriptionImgUrls.length > 0 && (
                <div className="existing-images-section">
                  <div className="existing-images-title">📂 Existing Description Images:</div>
                  <div className="image-preview-container">
                    {projectData.descriptionImgUrls.map((imgUrl, index) => (
                      <div key={index} className="image-preview">
                        <img  loading="lazy"  src={imgUrl} alt={`Description ${index}`} />
                        <button 
                          type="button" 
                          onClick={() => removeExistingDescriptionImage(index)} 
                          className="remove-image-btn" 
                          title="Remove image"
                        >
                          ×
                        </button>
                        <p className="image-filename">Existing Image {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New description images */}
              {projectData.descriptionImages.length > 0 && (
                <div className="mt-2">
                  <div className="image-preview-container">
                    {projectData.descriptionImages.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img  loading="lazy"  src={image.preview} alt={`Preview ${index}`} />
                        <button type="button" onClick={() => removeDescriptionImage(index)} className="remove-image-btn" title="Remove image">
                          ×
                        </button>
                        <p className="image-filename">{image.file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="blog-form-buttons">
              <button type="button" onClick={onClose} className="blog-btn blog-btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="blog-btn blog-btn-submit">
                {isSubmitting ? (
                  <>
                    {isEditMode ? "Updating..." : "Publishing..."}
                  </>
                ) : isEditMode ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;