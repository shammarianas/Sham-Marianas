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
    <div className="project-modal-overlay">
      <style>{`
        .project-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        .project-modal-container {
          background: #fff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .project-modal-content {
          padding: 1.5rem;
        }
        .project-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .project-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
        }
        .project-modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }
        .project-modal-close:hover {
          color: #374151;
        }
        .project-form-group {
          margin-bottom: 1.5rem;
        }
        .project-form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .project-form-required {
          color: #e53e3e;
        }
        .project-form-input,
        .project-form-select,
        .project-form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .project-form-input:focus,
        .project-form-select:focus,
        .project-form-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px #bfdbfe;
        }
        .project-form-file {
          width: 100%;
          font-size: 0.95rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f9fafb;
        }
        .project-form-hint {
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .project-form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
        }
        .project-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
        }
        .project-btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .project-btn-cancel:hover {
          background: #d1d5db;
        }
        .project-btn-submit {
          background: #2563eb;
          color: #fff;
        }
        .project-btn-submit:hover {
          background: #1d4ed8;
        }
        .project-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .image-preview-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .image-preview {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
        }
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0.5rem;
        }
        .remove-image-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: #e53e3e;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .image-preview:hover .remove-image-btn {
          opacity: 1;
        }
        .image-filename {
          font-size: 0.85rem;
          color: #4b5563;
          text-align: center;
          margin-top: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .existing-images-section {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }
        .existing-images-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .mt-2 {
          margin-top: 0.5rem;
        }
        .flex {
          display: flex;
        }
        .justify-between {
          justify-content: space-between;
        }
        .items-center {
          align-items: center;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-gray-600 {
          color: #6b7280;
        }
        .text-red-600 {
          color: #dc2626;
        }
        .hover\\:text-red-800:hover {
          color: #991b1b;
        }
      `}</style>
      <div className="project-modal-container">
        <div className="project-modal-content">
          <div className="project-modal-header">
            <h1 className="project-modal-title">
              {isEditMode ? "Edit Project" : "Add New Project"}
            </h1>
            <button onClick={onClose} className="project-modal-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 24, width: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="project-form-group">
              <label className="project-form-label">
                Project Title <span className="project-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={projectData.title} 
                onChange={handleInputChange} 
                required 
                className="project-form-input" 
                placeholder="Enter project title" 
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Category <span className="project-form-required">*</span>
              </label>
              <select name="category" value={projectData.category} onChange={handleInputChange} required className="project-form-select">
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Client <span className="project-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="client" 
                value={projectData.client} 
                onChange={handleInputChange} 
                required 
                className="project-form-input" 
                placeholder="Enter client name" 
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Start Date <span className="project-form-required">*</span>
              </label>
              <input 
                type="date" 
                name="startDate" 
                value={projectData.startDate} 
                onChange={handleInputChange} 
                required 
                className="project-form-input" 
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Designer <span className="project-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="designer" 
                value={projectData.designer} 
                onChange={handleInputChange} 
                required 
                className="project-form-input" 
                placeholder="Enter designer name" 
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Challenge Title <span className="project-form-required">*</span>
              </label>
              <input 
                type="text" 
                name="challengeTitle" 
                value={projectData.challengeTitle} 
                onChange={handleInputChange} 
                required 
                className="project-form-input" 
                placeholder="Enter challenge title" 
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Challenge Description <span className="project-form-required">*</span>
              </label>
              <textarea
                name="challengeDescription"
                value={projectData.challengeDescription}
                onChange={handleInputChange}
                required
                className="project-form-textarea"
                placeholder="Enter challenge description"
                rows="4"
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Project Description <span className="project-form-required">*</span>
              </label>
              <textarea
                name="description"
                value={projectData.description}
                onChange={handleInputChange}
                required
                className="project-form-textarea"
                placeholder="Enter project description"
                rows="4"
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Project Cover Image {!isEditMode && <span className="project-form-required">*</span>}
              </label>
              <input 
                type="file" 
                ref={coverImageInputRef} 
                onChange={handleCoverImgChange} 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                required={!isEditMode}
                className="project-form-file" 
              />
              <p className="project-form-hint">* Only JPEG, PNG, GIF, or WebP images below 1.25MB can be uploaded.</p>
              {(projectData.coverImage || projectData.coverImgUrl) && (
                <div className="mt-2">
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img 
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

            <div className="project-form-group">
              <label className="project-form-label">
                Project Feature Image {!isEditMode && <span className="project-form-required">*</span>}
              </label>
              <input 
                type="file" 
                ref={featureImageInputRef} 
                onChange={handleFeatureImgChange} 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                required={!isEditMode}
                className="project-form-file" 
              />
              <p className="project-form-hint">* Only JPEG, PNG, GIF, or WebP images below 1.25MB can be uploaded.</p>
              {(projectData.featureImage || projectData.featureImgUrl) && (
                <div className="mt-2">
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img 
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

            <div className="project-form-group">
              <label className="project-form-label">
                Project Description Images (Multiple) {!isEditMode && <span className="project-form-required">*</span>}
              </label>
              <input
                type="file"
                ref={descriptionImageInputRef}
                onChange={handleDescriptionImageChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                required={!isEditMode}
                className="project-form-file"
              />
              <p className="project-form-hint">* Only JPEG, PNG, GIF, or WebP images below 1.25MB can be uploaded.</p>
              
              {/* Existing description images (edit mode mein) */}
              {isEditMode && projectData.descriptionImgUrls.length > 0 && (
                <div className="existing-images-section">
                  <div className="existing-images-title">Existing Description Images:</div>
                  <div className="image-preview-container">
                    {projectData.descriptionImgUrls.map((imgUrl, index) => (
                      <div key={index} className="image-preview">
                        <img src={imgUrl} alt={`Description ${index}`} />
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
                        <img src={image.preview} alt={`Preview ${index}`} />
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

            <div className="project-form-buttons">
              <button type="button" onClick={onClose} className="project-btn project-btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="project-btn project-btn-submit">
                {isSubmitting ? "Saving..." : (isEditMode ? "Update Project" : "Save Project")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;