import React, { useState, useRef, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../Context/UserProvider";
import { Helmet } from "react-helmet-async";
import { FiUpload, FiX, FiPlus, FiImage, FiVideo, FiFile, FiCode, FiMusic, FiBox } from "react-icons/fi";

const filterData = {
  Videos: {
    categories: {
      label: "Categories",
      options: [
        "Buildings", "Business, Corporate", "Cartoons", "City", "Construction", "Education", "Food", "Holidays",
        "Industrial", "Kids", "Lifestyle", "Medical", "Military", "Nature", "Overhead", "People", "Religious",
        "Science", "Slow Motion", "Special Events", "Sports", "Stop Motion", "Technology", "Time Lapse", "Vehicles", "Weather",
      ],
    },
    aiGenerated: {
      label: "AI-Generated",
      options: ["Exclude AI-Generated", "Only AI-Generated"],
    },
    resolution: {
      label: "Resolution",
      options: ["720 (HD)", "1080 (Full HD)", "2K", "4K (UHD)"],
    },
    frameRate: {
      label: "Frame Rate",
      options: ["23.98 fps", "24 fps", "25 fps", "29.97 fps", "30 fps", "50 fps", "60 fps"],
    },
    properties: {
      label: "Properties",
      options: ["Alpha Channel", "Looped"],
    },
  },
  VideoTemplates: {
    categories: {
      label: "Categories",
      options: ["Broadcast Packages", "Elements", "Infographics", "Logo Stings", "Openers", "Product Promo", "Titles", "Video Displays"],
    },
    applicationsSupported: {
      label: "Applications Supported",
      options: ["After Effects", "Premiere Pro", "Apple Motion", "Final Cut Pro", "DaVinci Resolve"],
    },
    resolution: {
      label: "Resolution",
      options: ["720 (HD)", "1080 (Full HD)", "2K", "4K (UHD)"],
    },
  },
  Pictures: {
    categories: {
      label: "Category / Subject",
      options: [
        "People", "Business & Office", "Technology", "Nature / Landscape", "Architecture / Interior",
        "Fashion / Lifestyle", "Fitness / Sports", "Food & Drink", "Health / Medical", "Education",
        "Travel", "Art & Culture", "Holidays / Events", "Abstract / Textures",
      ],
    },
    orientation: {
      label: "Orientation",
      options: ["Landscape", "Portrait", "Square", "Panoramic / Wide"],
    },
    aiGenerated: {
      label: "AI-Generated",
      options: ["Exclude AI-Generated", "Only AI-Generated"],
    },
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use", "Editorial Use Only", "Extended License"],
    },
  },
  GraphicTemplates: {
    categories: {
      label: "Categories",
      options: ["Print Templates", "Packaging", "Logo", "Social Media", "Letterheads", "Business Cards", "Banners", "Infographics", "Other"],
    },
    colorSpace: {
      label: "Color Space",
      options: ["RGB", "CMYK"],
    },
    orientation: {
      label: "Orientation",
      options: ["Landscape", "Portrait", "Square"],
    },
    applicationsSupported: {
      label: "Applications Supported",
      options: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
    },
    properties: {
      label: "Properties",
      options: ["Vector", "Layered"],
    },
  },
  Mockups: {
    categories: {
      label: "Categories",
      options: ["Products", "Advertising", "Social Media", "Stationary", "Places", "Vehicles", "Website / UI Display"],
    },
    fileFormat: {
      label: "File Format",
      options: [".PSD (Photoshop)"],
    },
    licenseType: {
      label: "License Type",
      options: ["Free Use", "Commercial Use", "Extended License", "Personal Use Only"],
    },
  },
  Fonts: {
    properties: {
      label: "Properties",
      options: ["Any Type"],
    },
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use", "Paid / Premium License", "Extended / Unlimited Use", "Desktop License", "Webfont License", "App / eBook License"],
    },
  },
  "3DModels": {
    objectType: {
      label: "Object Type",
      options: [
        "Characters", "Vehicles", "Architecture / Buildings", "Furniture", "Weapons / Military",
        "Clothing / Accessories", "Electronics / Gadgets", "Nature / Plants / Trees", "Animals / Creatures",
        "Food & Drink", "Household Items", "Fantasy / Sci-fi", "Medical / Anatomy", "Industrial / Mechanical", "Props / Miscellaneous",
      ],
    },
    fileFormat: {
      label: "File Format",
      options: [".FBX", ".OBJ", ".BLEND (Blender)", ".MAX (3ds Max)", ".MA / .MB (Maya)", ".GLTF / .GLB", ".STL (3D Print)", ".C4D (Cinema 4D)"],
    },
    properties: {
      label: "Properties",
      options: ["Rigged", "Animated", "Game Ready", "Textured"],
    },
  },
  Icons: {
    categories: {
      label: "Categories",
      options: ["Static Icons", "Interface Icons", "Animated Icons", "Stickers"],
    },
  },
  Textures: {
    surfaceMaterial: {
      label: "Surface Material",
      options: ["Wood", "Metal", "Concrete", "Brick", "Fabric / Cloth", "Leather", "Stone / Rock", "Plastic", "Glass", "Water", "Sand / Soil", "Paper / Cardboard", "Asphalt / Road"],
    },
    resolution: {
      label: "Resolution",
      options: ["512x512", "1K (1024x1024)", "2K", "4K", "8K"],
    },
    style: {
      label: "Style / Look",
      options: ["Realistic", "Cartoon / Stylized", "Minimal", "Abstract", "Vintage", "Futuristic", "Sci-fi", "Fantasy"],
    },
  },
  HDRIs: {
    environmentType: {
      label: "Environment Type",
      options: [
        "Studio", "Indoor", "Outdoor", "Urban / Cityscape", "Nature / Forest", "Desert", "Mountains / Hills",
        "Beach / Ocean", "Industrial / Factory", "Room / Apartment", "Rooftop / Terrace", "HDRI Domes / Sci-fi Rooms",
      ],
    },
    lightingCondition: {
      label: "Lighting Condition",
      options: [
        "Daylight", "Golden Hour", "Night", "Sunset / Sunrise", "Overcast", "Dramatic / Moody Light",
        "High Contrast / Harsh Light", "Soft Light / Diffused", "Artificial Light / Lamp-lit", "Colored Lighting / Stylized",
      ],
    },
    resolution: {
      label: "Resolution",
      options: ["2K (2048x1024)", "4K (4096x2048)", "8K", "16K", "32K+"],
    },
    fileFormat: {
      label: "File Format",
      options: [".HDR", ".EXR"],
    },
  },
  Scripts: {
    scriptType: {
      label: "Script Type",
      options: [
        "Frontend Scripts", "Backend Scripts", "Automation Scripts", "API Integration Scripts", "Form Validation Scripts",
        "Animation Scripts", "Payment Gateway Scripts", "Email / Newsletter Scripts", "Database Scripts", "AI/ML Scripts",
        "Authentication Scripts", "Chatbot Scripts",
      ],
    },
    programmingLanguage: {
      label: "Programming Language",
      options: ["JavaScript", "Python", "PHP", "HTML / CSS", "TypeScript", "Node.js", "Ruby", "Go", "Shell / Bash", "SQL", "Lua", "C# (Unity)"],
    },
    framework: {
      label: "Framework / Library",
      options: ["React", "Vue.js", "Next.js / Nuxt.js", "jQuery", "Laravel", "Express.js", "Flask / Django", "Tailwind / Bootstrap", "Three.js / Babylon.js (3D)", "TensorFlow.js / ML5.js (AI)"],
    },
    licenseType: {
      label: "License Type",
      options: ["Free", "Commercial Use", "Extended License", "Open Source (MIT / GPL)"],
    },
    integrationReady: {
      label: "Integration Ready",
      options: ["Stripe / PayPal", "Firebase", "MongoDB / MySQL / PostgreSQL", "Mailchimp / SendGrid", "Google Maps / APIs", "Auth0 / Firebase Auth", "ChatGPT / OpenAI API"],
    },
  },
};

const assetTypeToFilterData = {
  videos: "Videos",
  "video-templates": "VideoTemplates",
  images: "Pictures",
  graphics: "GraphicTemplates",
  mockups: "Mockups",
  fonts: "Fonts",
  models: "3DModels",
  icons: "Icons",
  textures: "Textures",
  hdris: "HDRIs",
  scripts: "Scripts",
  sounds: null,
  other: null,
};

const Upload = ({ onUploadSuccess, onClose, compactView = false }) => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    thumbnail: "",
    description: "",
    is3d: false,
    price: "",
    discount: "",
    tags: "",
    date: new Date()
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .replace(/ /g, ", "),
    category: "",
    type: "",
    model: "",
    images: "",
    video: "",
    icons: "",
    script: "",
    scriptSize: "",
    hdri: "",
    hdriSize: "",
    graphicsTemplate: "",
    graphicsTemplateSize: "",
    mockupFile: "",
    mockupFileSize: "",
    fontFile: "",
    fontFileSize: "",
    videoTemplateFile: "",
    videoTemplateFileSize: "",
    sound: "",
    soundSize: "",
    other: "",
    otherSize: "",
    ambientOcclusion: "",
    baseColor: "",
    displacement: "",
    normal: "",
    roughness: "",
    metallic: "",
    bump: "",
    idmap: "",
    resolution: "",
    physicalSize: "",
    lods: "",
    vertices: "",
    textures: "",
    materials: "",
    uvMapping: false,
    rigged: false,
    animated: false,
    vrArLowPoly: false,
    aiGenerated: "",
    frameRate: "",
    properties: [],
    applicationsSupported: [],
    orientation: "",
    licenseType: "",
    surfaceMaterial: "",
    style: "",
    environmentType: "",
    lightingCondition: "",
    scriptType: "",
    programmingLanguage: "",
    framework: "",
    integrationReady: [],
    colorSpace: "",
    objectType: "",
    fileFormat: "",
  });

  const [tags, setTags] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const tagInputRef = useRef(null);

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    if (value === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
      return;
    }
    if (value.endsWith(" ")) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setFormData({ ...formData, tags: "" });
    } else {
      setFormData({ ...formData, tags: value });
    }
  };

  const handleTagRemove = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const uploadFile = async (file, fileType) => {
    try {
      setLoadingState(`Uploading ${fileType} ${file.name}`);
      const storageRef = ref(storage, `assets/${fileType}/${file.name}`);
      const uploadSnapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadSnapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return null;
    }
  };

  const uploadThumbnail = async (file) => {
    try {
      setLoadingState(`Uploading thumbnail`);
      const storageRef = ref(storage, `thumbnails/${file.name}`);
      const uploadSnapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadSnapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Error uploading thumbnail");
      return null;
    }
  };

  const uploadImages = async (files, fileType) => {
    try {
      setLoadingState(`Uploading ${fileType} (${files.length} files)`);
      const urls = await Promise.all(Array.from(files).map((file) => uploadFile(file, fileType)));
      return urls.filter((url) => url !== null);
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return [];
    }
  };

  const handleChange = (event) => {
    const target = event.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    if (target.type === "file") {
      if (name === "thumbnail") {
        const file = target.files[0];
        if (file) {
          setFormData({
            ...formData,
            [name]: file,
          });
          const reader = new FileReader();
          reader.onloadend = () => setThumbnailPreview(reader.result);
          reader.readAsDataURL(file);
        }
      } else if (name === "images" || name === "icons") {
        const files = target.files;
        setFormData({
          ...formData,
          [name]: files,
          [`${name}Size`]: Array.from(files).map((file) => file.size),
        });
      } else {
        const file = target.files[0];
        if (file) {
          setFormData({
            ...formData,
            [name]: file,
            [`${name}Size`]: file.size,
          });
        } else {
          setFormData({
            ...formData,
            [name]: "",
            [`${name}Size`]: "",
          });
        }
      }
    } else if (["properties", "applicationsSupported", "integrationReady"].includes(name)) {
      const options = Array.from(target.selectedOptions).map((option) => option.value);
      setFormData({
        ...formData,
        [name]: options,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingState("Uploading asset...");

    try {
      let docData = {
        title: formData.title,
        thumbnail: await uploadThumbnail(formData.thumbnail),
        description: formData.description,
        is3d: formData.is3d,
        price: formData.price,
        discount: formData.discount,
        category: formData.category,
        type: formData.type,
        tags: tags,
        date: new Date(formData.date),
        userId: currentUser?.uid ?? "anonymous",
        aiGenerated: formData.aiGenerated,
        resolution: formData.resolution,
        frameRate: formData.frameRate,
        properties: formData.properties,
        applicationsSupported: formData.applicationsSupported,
        orientation: formData.orientation,
        licenseType: formData.licenseType,
        surfaceMaterial: formData.surfaceMaterial,
        style: formData.style,
        environmentType: formData.environmentType,
        lightingCondition: formData.lightingCondition,
        scriptType: formData.scriptType,
        programmingLanguage: formData.programmingLanguage,
        framework: formData.framework,
        integrationReady: formData.integrationReady,
        colorSpace: formData.colorSpace,
        objectType: formData.objectType,
        fileFormat: formData.fileFormat,
      };

      // Handle different asset types
      if (formData.type === "models") {
        docData = {
          ...docData,
          model: await uploadFile(formData.model, "model"),
          resolution: formData.resolution,
          physicalSize: formData.physicalSize,
          lods: formData.lods,
          vertices: formData.vertices,
          textures: formData.textures,
          materials: formData.materials,
          uvMapping: formData.uvMapping,
          rigged: formData.rigged,
          animated: formData.animated,
          vrArLowPoly: formData.vrArLowPoly,
        };
      }

      if (formData.type === "scripts") {
        docData = {
          ...docData,
          script: await uploadFile(formData.script, "script"),
          scriptName: formData.script?.name,
          scriptSize: formData.scriptSize,
        };
      }

      if (formData.type === "hdris") {
        docData = {
          ...docData,
          hdri: await uploadFile(formData.hdri, "hdri"),
          hdriName: formData.hdri?.name,
          hdriSize: formData.hdriSize,
        };
      }

      if (formData.type === "graphics") {
        docData = {
          ...docData,
          graphicsTemplate: await uploadFile(formData.graphicsTemplate, "graphicsTemplate"),
          graphicsTemplateName: formData.graphicsTemplate?.name,
          graphicsTemplateSize: formData.graphicsTemplateSize,
        };
      }

      if (formData.type === "mockups") {
        docData = {
          ...docData,
          mockupFile: await uploadFile(formData.mockupFile, "mockup"),
          mockupFileName: formData.mockupFile?.name,
          mockupFileSize: formData.mockupFileSize,
        };
      }

      if (formData.type === "fonts") {
        docData = {
          ...docData,
          fontFile: await uploadFile(formData.fontFile, "font"),
          fontFileName: formData.fontFile?.name,
          fontFileSize: formData.fontFileSize,
        };
      }

      if (formData.type === "video-templates") {
        docData = {
          ...docData,
          videoTemplateFile: await uploadFile(formData.videoTemplateFile, "videoTemplate"),
          videoTemplateFileName: formData.videoTemplateFile?.name,
          videoTemplateFileSize: formData.videoTemplateFileSize,
        };
      }

      if (formData.type === "videos") {
        docData = {
          ...docData,
          video: await uploadFile(formData.video, "video"),
          videoName: formData.video?.name,
          videoSize: formData.videoSize,
        };
      }

      if (formData.type === "icons") {
        const uploadedIcons = await uploadImages(formData.icons, "icon");
        docData = {
          ...docData,
          icons: uploadedIcons,
          iconNames: Array.from(formData.icons || []).map((icon) => icon.name),
          iconSizes: Array.from(formData.icons || []).map((icon) => icon.size),
        };
      }

      if (formData.type === "images") {
        const uploadedImages = await uploadImages(formData.images, "image");
        docData = {
          ...docData,
          images: uploadedImages,
          imageNames: Array.from(formData.images || []).map((image) => image.name),
          imageSizes: Array.from(formData.images || []).map((image) => image.size),
        };
      }

      if (formData.type === "textures") {
        const maps = ["ambientOcclusion", "baseColor", "displacement", "normal", "roughness", "metallic", "bump", "idmap"];
        const texturePromises = maps.map(async (map) => {
          if (formData[map]) {
            const url = await uploadFile(formData[map], map);
            return { [map]: url, [`${map}Name`]: formData[map]?.name };
          }
          return {};
        });
        const textureResults = await Promise.all(texturePromises);
        const textureResultsObject = textureResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        docData = {
          ...docData,
          maps: textureResultsObject,
        };
      }

      if (formData.type === "sounds") {
        docData = {
          ...docData,
          sound: await uploadFile(formData.sound, "sound"),
          soundName: formData.sound?.name,
          soundSize: formData.soundSize,
        };
      }

      if (formData.type === "other") {
        docData = {
          ...docData,
          other: await uploadFile(formData.other, "other"),
          otherName: formData.other?.name,
          otherSize: formData.otherSize,
        };
      }

      docData = Object.fromEntries(Object.entries(docData).filter(([_, v]) => v !== undefined && v !== ""));

      await addDoc(collection(db, "Assets"), docData);
      setLoadingState("success");
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      // Reset form
      setFormData({
        title: "", thumbnail: "", description: "", is3d: false, price: "", discount: "", tags: "",
        date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" }).replace(/ /g, ", "),
        category: "", type: "", model: "", images: "", video: "", icons: "", script: "", scriptSize: "",
        hdri: "", hdriSize: "", graphicsTemplate: "", graphicsTemplateSize: "", mockupFile: "", mockupFileSize: "",
        fontFile: "", fontFileSize: "", videoTemplateFile: "", videoTemplateFileSize: "", sound: "", soundSize: "",
        other: "", otherSize: "", ambientOcclusion: "", baseColor: "", displacement: "", normal: "", roughness: "",
        metallic: "", bump: "", idmap: "", resolution: "", physicalSize: "", lods: "", vertices: "", textures: "",
        materials: "", uvMapping: false, rigged: false, animated: false, vrArLowPoly: false, aiGenerated: "",
        frameRate: "", properties: [], applicationsSupported: [], orientation: "", licenseType: "", surfaceMaterial: "",
        style: "", environmentType: "", lightingCondition: "", scriptType: "", programmingLanguage: "", framework: "",
        integrationReady: [], colorSpace: "", objectType: "", fileFormat: "",
      });
      setTags([]);
      setThumbnailPreview(null);

    } catch (error) {
      console.error("Error adding document: ", error);
      setLoadingState("Error uploading asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryOptions = () => {
    const filterKey = assetTypeToFilterData[formData.type];
    if (filterKey && filterData[filterKey]?.categories?.options) {
      return filterData[filterKey].categories.options;
    }
    return [];
  };

  const getFilterOptions = (filterKey) => {
    const filterKeyMapped = assetTypeToFilterData[formData.type];
    if (filterKeyMapped && filterData[filterKeyMapped]?.[filterKey]?.options) {
      return filterData[filterKeyMapped][filterKey].options;
    }
    return [];
  };

  const renderFilterSelect = (filterKey, label, name, isMulti = false) => {
    const options = getFilterOptions(filterKey);
    if (options.length === 0) return null;
    return (
      <div className="blog-form-group">
        <label className="blog-form-label">{label} <span className="blog-form-required">*</span></label>
        <select
          name={name}
          className="blog-form-select"
          onChange={handleChange}
          multiple={isMulti}
          value={isMulti ? formData[name] : formData[name] || ""}
          required={!isMulti}
        >
          <option value="" disabled>Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  };

  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'models': return <FiBox />;
      case 'videos': return <FiVideo />;
      case 'images': return <FiImage />;
      case 'scripts': return <FiCode />;
      case 'sounds': return <FiMusic />;
      default: return <FiFile />;
    }
  };

  if (!currentUser) {
    return (
      <div className="blog-modal-overlay">
        <div className="blog-modal-container">
          <div className="blog-modal-content">
            <div className="blog-modal-header">
              <h1 className="blog-modal-title">Upload Asset</h1>
              {onClose && (
                <button onClick={onClose} className="blog-modal-close" aria-label="Close">
                  <FiX />
                </button>
              )}
            </div>
            <div className="not-logged-in-message">
              <h3>Please log in to upload assets</h3>
              <p>You need to be logged in to upload assets to the marketplace.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Upload Asset | Shammarianas</title>
        <meta name="description" content="Upload your assets to Shammarianas" />
      </Helmet>

      <style>
        {`
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
              text-align: left;
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
            width: 100%; font-size: 0.95rem; border: 2px dashed #d1d5db; 
            border-radius: 0.75rem; padding: 2rem; text-align: center; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            transition: all 0.2s; cursor: pointer; color: #374151;
          }
          .blog-form-file:hover { border-color: #3b82f6; background: #eff6ff; }
          .blog-form-hint { text-align: left; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; font-style: italic; }
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
          .not-logged-in-message {
            text-align: center; padding: 3rem 2rem;
          }
          .not-logged-in-message h3 {
            color: #374151; margin-bottom: 1rem;
          }
          .not-logged-in-message p {
            color: #6b7280;
          }
          .file-preview-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 1rem; margin-top: 1rem;
          }
          .file-preview-item {
            border: 2px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem;
            text-align: center; background: #f9fafb;
          }
          .file-preview-item img, .file-preview-item video {
            max-width: 100%; height: 60px; object-fit: cover; border-radius: 0.25rem;
          }
          .file-preview-name {
            font-size: 0.75rem; color: #374151; margin-top: 0.5rem; word-break: break-all;
          }
          .asset-type-icon {
            font-size: 1.5rem; margin-right: 0.5rem; color: #3b82f6;
          }
          @media (max-width: 768px) {
            .blog-modal-content { padding: 1.5rem; }
            .blog-modal-title { font-size: 1.25rem; }
            .blog-tags-container { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
            .blog-form-buttons { flex-direction: column; }
          }
        `}
      </style>

      <div className="blog-modal-overlay">
        <div className="blog-modal-container">
          <div className="blog-modal-content">
            <div className="blog-modal-header">
              <h1 className="blog-modal-title">
                <FiUpload className="asset-type-icon" />
                Upload New Asset
              </h1>
              {onClose && (
                <button onClick={onClose} className="blog-modal-close" aria-label="Close">
                  <FiX />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="blog-form-group">
                <label className="blog-form-label">Title <span className="blog-form-required">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className="blog-form-input" 
                  placeholder="Enter asset title..." 
                />
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Thumbnail <span className="blog-form-required">*</span></label>
                <input 
                  type="file" 
                  name="thumbnail" 
                  onChange={handleChange} 
                  accept="image/*" 
                  className="blog-form-file" 
                />
                <p className="blog-form-hint">JPG, PNG, WebP • Max 1.25MB • 1200x630px recommended</p>
                {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="blog-image-preview" />}
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Description <span className="blog-form-required">*</span></label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  className="blog-form-textarea" 
                  placeholder="Describe your asset..." 
                  rows="4"
                />
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Asset Type <span className="blog-form-required">*</span></label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  required 
                  className="blog-form-select"
                >
                  <option value="" disabled>Select Asset Type</option>
                  <option value="models">3D Model</option>
                  <option value="textures">Texture</option>
                  <option value="sounds">Sound</option>
                  <option value="scripts">Script</option>
                  <option value="images">Image</option>
                  <option value="graphics">Graphics Templates</option>
                  <option value="mockups">Mockups</option>
                  <option value="fonts">Fonts</option>
                  <option value="videos">Video</option>
                  <option value="video-templates">Video Templates</option>
                  <option value="icons">Icons</option>
                  <option value="hdris">HDRIs</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Category <span className="blog-form-required">*</span></label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required 
                  className="blog-form-select"
                >
                  <option value="" disabled>Select Category</option>
                  {getCategoryOptions().map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Price <span className="blog-form-required">*</span></label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  className="blog-form-input" 
                  placeholder="0.00" 
                  step="0.01" 
                  min="0" 
                />
                {formData.price && formData.price > 0 && (
                  <input 
                    type="number" 
                    name="discount" 
                    value={formData.discount} 
                    onChange={handleChange} 
                    className="blog-form-input" 
                    placeholder="Discount" 
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Tags (Max 10)</label>
                <div className="blog-tags-container" tabIndex="0">
                  {tags.map((tag, index) => (
                    <div key={index} className="blog-tag">
                      #{tag}
                      <span className="blog-tag-remove" onClick={() => handleTagRemove(tag)}>×</span>
                    </div>
                  ))}
                  <input 
                    ref={tagInputRef} 
                    type="text" 
                    className="blog-tag-input" 
                    value={formData.tags} 
                    onChange={handleTagInputChange} 
                    placeholder={tags.length === 0 ? "Type tag and press Space..." : "Press Space to add tag..."} 
                    maxLength={20} 
                  />
                </div>
                <p className="blog-form-hint">Type tag name and press Space. Max 10 tags. Click × to remove.</p>
                {tags.length > 0 && (
                  <p className="current-image-note" style={{ marginTop: '0.5rem' }}>
                    {tags.length} tag{tags.length > 1 ? 's' : ''} added
                  </p>
                )}
              </div>

              {/* Additional filters based on asset type */}
              {renderFilterSelect("aiGenerated", "AI-Generated", "aiGenerated")}
              {renderFilterSelect("resolution", "Resolution", "resolution")}
              {renderFilterSelect("frameRate", "Frame Rate", "frameRate")}
              {renderFilterSelect("properties", "Properties", "properties", true)}
              {renderFilterSelect("applicationsSupported", "Applications Supported", "applicationsSupported", true)}
              {renderFilterSelect("orientation", "Orientation", "orientation")}
              {renderFilterSelect("licenseType", "License Type", "licenseType")}
              {renderFilterSelect("surfaceMaterial", "Surface Material", "surfaceMaterial")}
              {renderFilterSelect("style", "Style", "style")}
              {renderFilterSelect("environmentType", "Environment Type", "environmentType")}
              {renderFilterSelect("lightingCondition", "Lighting Condition", "lightingCondition")}
              {renderFilterSelect("scriptType", "Script Type", "scriptType")}
              {renderFilterSelect("programmingLanguage", "Programming Language", "programmingLanguage")}
              {renderFilterSelect("framework", "Framework", "framework")}
              {renderFilterSelect("integrationReady", "Integration Ready", "integrationReady", true)}
              {renderFilterSelect("colorSpace", "Color Space", "colorSpace")}
              {renderFilterSelect("objectType", "Object Type", "objectType")}
              {renderFilterSelect("fileFormat", "File Format", "fileFormat")}

              {/* File upload sections based on asset type */}
              {formData.type === "models" && (
                <>
                  <div className="blog-form-group">
                    <label className="blog-form-label">3D Model File <span className="blog-form-required">*</span></label>
                    <input 
                      type="file" 
                      name="model" 
                      onChange={handleChange} 
                      accept=".glb,.gltf,.stl,.obj,.fbx,.blend" 
                      className="blog-form-file" 
                    />
                    <p className="blog-form-hint">Supported formats: .glb, .gltf, .stl, .obj, .fbx, .blend</p>
                  </div>
                  
                  <div className="blog-form-group">
                    <label className="blog-form-label">Vertices</label>
                    <input 
                      type="number" 
                      name="vertices" 
                      value={formData.vertices} 
                      onChange={handleChange} 
                      className="blog-form-input" 
                      placeholder="Number of vertices" 
                    />
                  </div>

                  <div className="blog-form-group">
                    <label className="blog-form-label">Physical Size</label>
                    <input 
                      type="text" 
                      name="physicalSize" 
                      value={formData.physicalSize} 
                      onChange={handleChange} 
                      className="blog-form-input" 
                      placeholder="e.g., 10x10x10 cm" 
                    />
                  </div>

                  <div className="blog-form-group">
                    <div className="checkboxes" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      {["textures", "materials", "rigged", "animated", "uvMapping", "vrArLowPoly"].map((prop) => (
                        <label key={prop} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            name={prop} 
                            checked={formData[prop]} 
                            onChange={handleChange} 
                          />
                          {prop.split(/(?=[A-Z])/).join(' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {formData.type === "images" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">Image Files <span className="blog-form-required">*</span></label>
                  <input 
                    type="file" 
                    name="images" 
                    onChange={handleChange} 
                    accept="image/*" 
                    multiple 
                    className="blog-form-file" 
                  />
                  <p className="blog-form-hint">Select multiple image files</p>
                </div>
              )}

              {formData.type === "videos" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">Video File <span className="blog-form-required">*</span></label>
                  <input 
                    type="file" 
                    name="video" 
                    onChange={handleChange} 
                    accept="video/*" 
                    className="blog-form-file" 
                  />
                  <p className="blog-form-hint">Supported video formats</p>
                </div>
              )}

              {/* Add similar sections for other asset types as needed */}

              <div className="blog-form-buttons">
                {onClose && (
                  <button type="button" onClick={onClose} className="blog-btn blog-btn-cancel">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} className="blog-btn blog-btn-submit">
                  {isSubmitting ? "Uploading..." : "Upload Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;