import React, { useState, useRef, useEffect } from "react";
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../Context/UserProvider";
import { Helmet } from "react-helmet-async";
import {
  FiUpload,
  FiX,
  FiPlus,
  FiImage,
  FiVideo,
  FiFile,
  FiCode,
  FiMusic,
  FiBox,
  FiChevronDown,
  FiPlay,
  FiPause,
  FiFileText,
} from "react-icons/fi";
import useImageSizeConverter from "../hooks/ImageSizeConverter";

const filterData = {
  Videos: {
    categories: {
      label: "Categories",
      options: [
        "Buildings",
        "Business, Corporate",
        "Cartoons",
        "City",
        "Construction",
        "Education",
        "Food",
        "Holidays",
        "Industrial",
        "Kids",
        "Lifestyle",
        "Medical",
        "Military",
        "Nature",
        "Overhead",
        "People",
        "Religious",
        "Science",
        "Slow Motion",
        "Special Events",
        "Sports",
        "Stop Motion",
        "Technology",
        "Time Lapse",
        "Vehicles",
        "Weather",
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
      options: [
        "23.98 fps",
        "24 fps",
        "25 fps",
        "29.97 fps",
        "30 fps",
        "50 fps",
        "60 fps",
      ],
    },
    properties: {
      label: "Properties",
      options: ["Alpha Channel", "Looped"],
    },
  },
  VideoTemplates: {
    categories: {
      label: "Categories",
      options: [
        "Broadcast Packages",
        "Elements",
        "Infographics",
        "Logo Stings",
        "Openers",
        "Product Promo",
        "Titles",
        "Video Displays",
      ],
    },
    applicationsSupported: {
      label: "Applications Supported",
      options: [
        "After Effects",
        "Premiere Pro",
        "Apple Motion",
        "Final Cut Pro",
        "DaVinci Resolve",
      ],
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
        "People",
        "Business & Office",
        "Technology",
        "Nature / Landscape",
        "Architecture / Interior",
        "Fashion / Lifestyle",
        "Fitness / Sports",
        "Food & Drink",
        "Health / Medical",
        "Education",
        "Travel",
        "Art & Culture",
        "Holidays / Events",
        "Abstract / Textures",
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
      options: [
        "Free for Personal Use",
        "Free for Commercial Use",
        "Editorial Use Only",
        "Extended License",
      ],
    },
  },
  GraphicTemplates: {
    categories: {
      label: "Categories",
      options: [
        "Print Templates",
        "Packaging",
        "Logo",
        "Social Media",
        "Letterheads",
        "Business Cards",
        "Banners",
        "Infographics",
        "Other",
      ],
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
      options: [
        "Products",
        "Advertising",
        "Social Media",
        "Stationary",
        "Places",
        "Vehicles",
        "Website / UI Display",
      ],
    },
    fileFormat: {
      label: "File Format",
      options: [".PSD (Photoshop)"],
    },
    licenseType: {
      label: "License Type",
      options: [
        "Free Use",
        "Commercial Use",
        "Extended License",
        "Personal Use Only",
      ],
    },
  },
  Fonts: {
    properties: {
      label: "Properties",
      options: ["Any Type"],
    },
    licenseType: {
      label: "License Type",
      options: [
        "Free for Personal Use",
        "Free for Commercial Use",
        "Paid / Premium License",
        "Extended / Unlimited Use",
        "Desktop License",
        "Webfont License",
        "App / eBook License",
      ],
    },
    categories: {
      label: "Categories",
      options: ["Any Type"],
    },
  },
  "3DModels": {
    objectType: {
      label: "Object Type",
      options: [
        "Characters",
        "Vehicles",
        "Architecture / Buildings",
        "Furniture",
        "Weapons / Military",
        "Clothing / Accessories",
        "Electronics / Gadgets",
        "Nature / Plants / Trees",
        "Animals / Creatures",
        "Food & Drink",
        "Household Items",
        "Fantasy / Sci-fi",
        "Medical / Anatomy",
        "Industrial / Mechanical",
        "Props / Miscellaneous",
      ],
    },
    fileFormat: {
      label: "File Format",
      options: [
        ".FBX",
        ".OBJ",
        ".BLEND (Blender)",
        ".MAX (3ds Max)",
        ".MA / .MB (Maya)",
        ".GLTF / .GLB",
        ".STL (3D Print)",
        ".C4D (Cinema 4D)",
      ],
    },
    properties: {
      label: "Properties",
      options: ["Rigged", "Animated", "Game Ready", "Textured"],
    },
    categories: {
      label: "Categories",
      options: [
        "Characters",
        "Vehicles",
        "Architecture / Buildings",
        "Furniture",
        "Weapons / Military",
        "Clothing / Accessories",
        "Electronics / Gadgets",
        "Nature / Plants / Trees",
        "Animals / Creatures",
        "Food & Drink",
        "Household Items",
        "Fantasy / Sci-fi",
        "Medical / Anatomy",
        "Industrial / Mechanical",
        "Props / Miscellaneous",
      ],
    },
  },
  Icons: {
    categories: {
      label: "Categories",
      options: [
        "Static Icons",
        "Interface Icons",
        "Animated Icons",
        "Stickers",
      ],
    },
  },
  Textures: {
    surfaceMaterial: {
      label: "Surface Material",
      options: [
        "Wood",
        "Metal",
        "Concrete",
        "Brick",
        "Fabric / Cloth",
        "Leather",
        "Stone / Rock",
        "Plastic",
        "Glass",
        "Water",
        "Sand / Soil",
        "Paper / Cardboard",
        "Asphalt / Road",
      ],
    },
    resolution: {
      label: "Resolution",
      options: ["512x512", "1K (1024x1024)", "2K", "4K", "8K"],
    },
    style: {
      label: "Style / Look",
      options: [
        "Realistic",
        "Cartoon / Stylized",
        "Minimal",
        "Abstract",
        "Vintage",
        "Futuristic",
        "Sci-fi",
        "Fantasy",
      ],
    },
    categories: {
      label: "Surface Material",
      options: [
        "Wood",
        "Metal",
        "Concrete",
        "Brick",
        "Fabric / Cloth",
        "Leather",
        "Stone / Rock",
        "Plastic",
        "Glass",
        "Water",
        "Sand / Soil",
        "Paper / Cardboard",
        "Asphalt / Road",
      ],
    },
  },
  HDRIs: {
    environmentType: {
      label: "Environment Type",
      options: [
        "Studio",
        "Indoor",
        "Outdoor",
        "Urban / Cityscape",
        "Nature / Forest",
        "Desert",
        "Mountains / Hills",
        "Beach / Ocean",
        "Industrial / Factory",
        "Room / Apartment",
        "Rooftop / Terrace",
        "HDRI Domes / Sci-fi Rooms",
      ],
    },
    lightingCondition: {
      label: "Lighting Condition",
      options: [
        "Daylight",
        "Golden Hour",
        "Night",
        "Sunset / Sunrise",
        "Overcast",
        "Dramatic / Moody Light",
        "High Contrast / Harsh Light",
        "Soft Light / Diffused",
        "Artificial Light / Lamp-lit",
        "Colored Lighting / Stylized",
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
    categories: {
      label: "Environment Type",
      options: [
        "Studio",
        "Indoor",
        "Outdoor",
        "Urban / Cityscape",
        "Nature / Forest",
        "Desert",
        "Mountains / Hills",
        "Beach / Ocean",
        "Industrial / Factory",
        "Room / Apartment",
        "Rooftop / Terrace",
        "HDRI Domes / Sci-fi Rooms",
      ],
    },
  },
  Scripts: {
    scriptType: {
      label: "Script Type",
      options: [
        "Frontend Scripts",
        "Backend Scripts",
        "Automation Scripts",
        "API Integration Scripts",
        "Form Validation Scripts",
        "Animation Scripts",
        "Payment Gateway Scripts",
        "Email / Newsletter Scripts",
        "Database Scripts",
        "AI/ML Scripts",
        "Authentication Scripts",
        "Chatbot Scripts",
      ],
    },
    programmingLanguage: {
      label: "Programming Language",
      options: [
        "JavaScript",
        "Python",
        "PHP",
        "HTML / CSS",
        "TypeScript",
        "Node.js",
        "Ruby",
        "Go",
        "Shell / Bash",
        "SQL",
        "Lua",
        "C# (Unity)",
      ],
    },
    framework: {
      label: "Framework / Library",
      options: [
        "React",
        "Vue.js",
        "Next.js / Nuxt.js",
        "jQuery",
        "Laravel",
        "Express.js",
        "Flask / Django",
        "Tailwind / Bootstrap",
        "Three.js / Babylon.js (3D)",
        "TensorFlow.js / ML5.js (AI)",
      ],
    },
    licenseType: {
      label: "License Type",
      options: [
        "Free",
        "Commercial Use",
        "Extended License",
        "Open Source (MIT / GPL)",
      ],
    },
    integrationReady: {
      label: "Integration Ready",
      options: [
        "Stripe / PayPal",
        "Firebase",
        "MongoDB / MySQL / PostgreSQL",
        "Mailchimp / SendGrid",
        "Google Maps / APIs",
        "Auth0 / Firebase Auth",
        "ChatGPT / OpenAI API",
      ],
    },
    categories: {
      label: "Categories",
      options: [
        "Frontend Scripts",
        "Backend Scripts",
        "Automation Scripts",
        "API Integration Scripts",
        "Form Validation Scripts",
        "Animation Scripts",
        "Payment Gateway Scripts",
        "Email / Newsletter Scripts",
        "Database Scripts",
        "AI/ML Scripts",
        "Authentication Scripts",
        "Chatbot Scripts",
      ],
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
  other: null,
};

const Upload = ({
  onUploadSuccess,
  onUploadClose,
  compactView = false,
  editMode = false,
  assetToEdit = null,
  isUpdating = false,
  setIsUpdating = () => {},
}) => {
  const { currentUser } = useUser();
  const { converting, generateAllSizes, uploadAllSizes } =
    useImageSizeConverter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    thumbnail: "",
    description: "",
    is3d: false,
    price: "free",
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
  const [thumbnailType, setThumbnailType] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // File preview states
  const [filePreviews, setFilePreviews] = useState({
    model: null,
    video: null,
    script: null,
    hdri: null,
    graphicsTemplate: null,
    mockupFile: null,
    fontFile: null,
    videoTemplateFile: null,
    other: null,
    images: [],
    icons: [],
    textures: [],
  });

  const [filePreviewTypes, setFilePreviewTypes] = useState({
    model: null,
    video: null,
    script: null,
    hdri: null,
    graphicsTemplate: null,
    mockupFile: null,
    fontFile: null,
    videoTemplateFile: null,
    other: null,
  });

  const tagInputRef = useRef(null);
  const videoRef = useRef(null);

  // ✅ Function to get user profile data
  const getUserProfileData = async () => {
    if (!currentUser?.uid) return null;

    try {
      // Pehle Contributors check karo
      let userDoc = await getDoc(doc(db, "Contributors", currentUser.uid));
      if (!userDoc.exists()) {
        // Agar contributor nahi, phir Profiles check karo
        userDoc = await getDoc(doc(db, "Profiles", currentUser.uid));
      }

      if (userDoc.exists()) {
        return userDoc.data();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }

    return null;
  };

  // Function to generate slug from title
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

  // Initialize form data with existing asset data when in edit mode
  useEffect(() => {
    if (editMode && assetToEdit) {
      setFormData((prev) => ({
        ...prev,
        title: assetToEdit.title || "",
        slug: assetToEdit.slug || generateSlug(assetToEdit.title || ""),
        description: assetToEdit.description || "",
        price: assetToEdit.price || "free",
        category: assetToEdit.category || "",
        type: assetToEdit.type || "",
        is3d: assetToEdit.is3d || false,
        aiGenerated: assetToEdit.aiGenerated || "",
        resolution: assetToEdit.resolution || "",
        frameRate: assetToEdit.frameRate || "",
        properties: assetToEdit.properties || [],
        applicationsSupported: assetToEdit.applicationsSupported || [],
        orientation: assetToEdit.orientation || "",
        licenseType: assetToEdit.licenseType || "",
        surfaceMaterial: assetToEdit.surfaceMaterial || "",
        style: assetToEdit.style || "",
        environmentType: assetToEdit.environmentType || "",
        lightingCondition: assetToEdit.lightingCondition || "",
        scriptType: assetToEdit.scriptType || "",
        programmingLanguage: assetToEdit.programmingLanguage || "",
        framework: assetToEdit.framework || "",
        integrationReady: assetToEdit.integrationReady || [],
        colorSpace: assetToEdit.colorSpace || "",
        objectType: assetToEdit.objectType || "",
        fileFormat: assetToEdit.fileFormat || "",
      }));

      if (assetToEdit.tags && Array.isArray(assetToEdit.tags)) {
        setTags(assetToEdit.tags);
      }

      if (assetToEdit.thumbnail) {
        setThumbnailPreview(assetToEdit.thumbnail);
        if (
          assetToEdit.thumbnail.includes(".mp4") ||
          assetToEdit.thumbnail.includes(".mov") ||
          assetToEdit.thumbnail.includes(".webm")
        ) {
          setThumbnailType("video");
        } else {
          setThumbnailType("image");
        }
      }
    }
  }, [editMode, assetToEdit]);

  // File preview handling function
  const handleFilePreview = (file, fileType) => {
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [fileType]: reader.result,
        }));
        setFilePreviewTypes((prev) => ({
          ...prev,
          [fileType]: "image",
        }));
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      const videoURL = URL.createObjectURL(file);
      setFilePreviews((prev) => ({
        ...prev,
        [fileType]: videoURL,
      }));
      setFilePreviewTypes((prev) => ({
        ...prev,
        [fileType]: "video",
      }));
    } else {
      // For other file types, show file info
      setFilePreviews((prev) => ({
        ...prev,
        [fileType]: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      }));
      setFilePreviewTypes((prev) => ({
        ...prev,
        [fileType]: "file",
      }));
    }
  };

  // Handle multiple files preview (for images, icons, textures)
  const handleMultipleFilesPreview = (files, fileType) => {
    if (!files || files.length === 0) return;

    const previews = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setFilePreviews((prev) => ({
              ...prev,
              [fileType]: previews,
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Video playback functions
  const handleVideoPlay = async () => {
    if (videoRef.current) {
      try {
        if (isVideoPlaying) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        } else {
          if (videoRef.current.readyState < 3) {
            videoRef.current.load();
          }

          const playPromise = videoRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video playing successfully");
                setIsVideoPlaying(true);
              })
              .catch((error) => {
                console.error("Error playing video:", error);
                videoRef.current.controls = true;
              });
          }
        }
      } catch (error) {
        console.error("Video play error:", error);
        videoRef.current.controls = true;
      }
    }
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoLoaded = () => {
    console.log("Video loaded successfully");
    if (videoRef.current) {
      videoRef.current.controls = false;
    }
  };

  const handleVideoError = (e) => {
    console.error("Video error:", e);
    if (videoRef.current) {
      videoRef.current.controls = true;
    }
  };

  // Thumbnail file handling
  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Check if it's a 3D model file
      const is3DFile = file.name
        .toLowerCase()
        .match(/\.(gltf|glb|obj|stl|fbx|blend)$/);

      if (is3DFile) {
        // 3D Model file hai - automatically set type to models
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          type: "models", // Automatically set type to models
          category: prev.category || "Props / Miscellaneous",
          // 👇 MODEL FIELD KO TOUCH MAT KARO - SIRF THUMBNAIL SET KARO
        }));

        setThumbnailType("3dmodel");
        setThumbnailPreview(null);
        console.log("✅ 3D Model file selected in thumbnail - PREVIEW ke liye");
      } else if (file.type.startsWith("video/")) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
        }));

        setThumbnailType("video");
        const videoURL = URL.createObjectURL(file);
        setThumbnailPreview(videoURL);
        setIsVideoPlaying(false);
      } else if (file.type.startsWith("image/")) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
        }));

        setThumbnailType("image");
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailType === "video") {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview, thumbnailType]);

  // Tag handling functions
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tags: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !tags.includes(value) && tags.length < 10) {
        setTags([...tags, value]);
        setFormData((prev) => ({ ...prev, tags: "" }));
      }
    } else if (
      e.key === "Backspace" &&
      formData.tags === "" &&
      tags.length > 0
    ) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleTagRemove = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // File upload functions
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
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadFile(file, fileType))
      );
      return urls.filter((url) => url !== null);
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return [];
    }
  };

  // Main form change handler - UPDATED for title to slug conversion
  const handleChange = (event) => {
    const target = event.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    if (target.type === "file") {
      if (name === "thumbnail") {
        handleThumbnailChange(event);
      } else if (name === "images" || name === "icons" || name === "textures") {
        const files = target.files;
        if (files && files.length > 0) {
          setFormData((prev) => ({
            ...prev,
            [name]: Array.from(files),
            [`${name}Size`]: Array.from(files).map((file) => file.size),
          }));
          handleMultipleFilesPreview(files, name);
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: [],
            [`${name}Size`]: [],
          }));
          setFilePreviews((prev) => ({ ...prev, [name]: [] }));
        }
      } else {
        const file = target.files[0];
        if (file) {
          setFormData((prev) => ({
            ...prev,
            [name]: file,
            [`${name}Size`]: file.size,
          }));
          handleFilePreview(file, name);
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: "",
            [`${name}Size`]: "",
          }));
          setFilePreviews((prev) => ({ ...prev, [name]: null }));
          setFilePreviewTypes((prev) => ({ ...prev, [name]: null }));
        }
      }
    } else if (
      ["properties", "applicationsSupported", "integrationReady"].includes(name)
    ) {
      const options = Array.from(target.selectedOptions).map(
        (option) => option.value
      );
      setFormData((prev) => ({
        ...prev,
        [name]: options,
      }));
    } else {
      // Auto-generate slug when title changes
      if (name === "title") {
        const slug = generateSlug(value);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          slug: slug, // Automatically set slug based on title
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  // File Preview Component
  const renderFilePreview = (fileType, label) => {
    const preview = filePreviews[fileType];
    const previewType = filePreviewTypes[fileType];

    if (!preview) return null;

    if (previewType === "image") {
      return (
        <div className="file-preview-container">
          <h4>{label} Preview:</h4>
          <img
            src={preview}
            alt={`${label} preview`}
            className="file-preview-image"
          />
        </div>
      );
    } else if (previewType === "video") {
      return (
        <div className="file-preview-container">
          <h4>{label} Preview:</h4>
          <video src={preview} className="file-preview-video" controls muted>
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (previewType === "file") {
      return (
        <div className="file-preview-container">
          <h4>{label} Info:</h4>
          <div className="file-info-preview">
            <FiFileText className="file-icon" />
            <div className="file-info">
              <strong>{preview.name}</strong>
              <span>Size: {(preview.size / 1024 / 1024).toFixed(2)} MB</span>
              <span>Type: {preview.type}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Multiple Files Preview Component
  const renderMultipleFilesPreview = (fileType, label) => {
    const previews = filePreviews[fileType];

    if (!previews || previews.length === 0) return null;

    return (
      <div className="file-preview-container">
        <h4>
          {label} Previews ({previews.length} files):
        </h4>
        <div className="file-preview-grid">
          {previews.map((preview, index) => (
            <div key={index} className="file-preview-item">
              <img
                src={preview}
                alt={`${label} ${index + 1}`}
                className="file-preview-image"
              />
              <span className="file-preview-index">#{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ MAIN SUBMIT FUNCTION - UPDATED WITH getUserProfileData
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode) setIsUpdating(true);
    else setIsSubmitting(true);

    setLoadingState(editMode ? "Updating asset..." : "Uploading asset...");

    try {
      // ✅ Get user profile data
      const userProfile = await getUserProfileData();
      const userName =
        userProfile?.displayName ||
        userProfile?.name ||
        currentUser?.displayName ||
        "Unknown Author";

      let docData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title), // Ensure slug is included
        description: formData.description,
        type: formData.type,
        price: formData.price,
        tags,
        is3d: formData.is3d,
        licenseType: formData.licenseType,
        category: formData.category,
        properties: formData.properties,
        applicationsSupported: formData.applicationsSupported,
        orientation: formData.orientation,
        vertices: formData.vertices,
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
        aiGenerated: formData.aiGenerated,
        resolution: formData.resolution,
        frameRate: formData.frameRate,
        date: formData.date,
        userId: currentUser?.uid ?? "anonymous",

        ownerId: currentUser.uid, // <-- THIS MAKES THE ASSET PRIVATE TO THE CONTRIBUTOR

        // ✅ CONSISTENT NAME FIELD
        authorName: userName,
        author: userName,
        createdBy: userName, // new assets
        updatedBy: userName, // edits

        // Timestamps
        createdAt: editMode ? assetToEdit.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // ✅ For new assets, also set createdBy with displayName
      if (!editMode) {
        docData.createdBy = userName;
        docData.createdAt = serverTimestamp();
      }

      if (formData.thumbnail && typeof formData.thumbnail !== "string") {
        const is3DFile = formData.thumbnail.name
          .toLowerCase()
          .match(/\.(gltf|glb|obj|stl|fbx|blend)$/);

        if (is3DFile && formData.type === "models") {
          console.log("🔄 Thumbnail se 3D model - PREVIEW ke liye");

          // ✅ THUMBNAIL SE 3D MODEL KO 'thumbnailModel' FIELD MEIN SAVE KARO
          const thumbnailModelUrl = await uploadFile(
            formData.thumbnail,
            "models"
          );
          docData.thumbnailModel = thumbnailModelUrl; // 👈 YEH LINE ZAROORI HAI

          // Thumbnail ke liye default image set karo
          docData.thumbnail = "/default-model-thumbnail.jpg";

          console.log("✅ ThumbnailModel saved:", docData.thumbnailModel);
        } else {
          // Regular image/video thumbnail hai
          console.log("🖼️ Uploading regular thumbnail");
          docData.thumbnail = await uploadThumbnail(formData.thumbnail);
        }
      } else if (editMode && assetToEdit.thumbnail && !formData.thumbnail) {
        docData.thumbnail = assetToEdit.thumbnail;
      }

      // ✅ MODEL FIELD - SIRF DOWNLOAD KE LIYE
      if (formData.model && formData.model instanceof File) {
        console.log("📥 Uploading model for DOWNLOAD:", formData.model.name);
        docData.model = await uploadFile(formData.model, "models");
      } else if (editMode && assetToEdit.model && !formData.model) {
        docData.model = assetToEdit.model;
      }

      // ✅ FIXED: handle assets by type
      if (formData.type === "images") {
        console.log("🖼️ Processing images...", {
          hasImages: !!formData.images,
          isArray: Array.isArray(formData.images),
          length: Array.isArray(formData.images) ? formData.images.length : 0,
          firstItem: Array.isArray(formData.images) ? formData.images[0] : null,
        });

        if (
          Array.isArray(formData.images) &&
          formData.images.length > 0 &&
          formData.images[0] instanceof File
        ) {
          console.log("🖼️ Uploading NEW images");
          const allImageUrls = [];

          for (const imageFile of formData.images) {
            setLoadingState(`Generating sizes for ${imageFile.name}...`);

            const imageSizes = await generateAllSizes(imageFile);

            if (imageSizes) {
              setLoadingState(`Uploading ${imageFile.name} in all sizes...`);

              const uploadedUrls = await uploadAllSizes(
                imageSizes,
                `assets/images/${currentUser?.uid || "anonymous"}/${Date.now()}`
              );

              if (uploadedUrls) {
                allImageUrls.push({
                  originalName: imageFile.name,
                  sizes: uploadedUrls,
                });
              }
            }
          }

          docData.images = allImageUrls;
          docData.hasMultipleSizes = true;
        } else if (editMode && assetToEdit.images) {
          console.log("🖼️ Keeping EXISTING images");
          docData.images = assetToEdit.images;
        }
      }

      if (formData.type === "videos") {
        console.log("🎥 Processing video...", {
          hasVideo: !!formData.video,
          isFile: formData.video instanceof File,
        });

        if (formData.video && formData.video instanceof File) {
          console.log("🎥 Uploading NEW video");
          docData.video = await uploadFile(formData.video, "videos");
        } else if (editMode && assetToEdit.video) {
          console.log("🎥 Keeping EXISTING video");
          docData.video = assetToEdit.video;
        }
      }

      // ✅ THUMBNAIL FIELD - SIRF PREVIEW KE LIYE (IMAGE/VIDEO/3D MODEL)
      if (formData.thumbnail && typeof formData.thumbnail !== "string") {
        const is3DFile = formData.thumbnail.name
          .toLowerCase()
          .match(/\.(gltf|glb|obj|stl|fbx|blend)$/);

        if (is3DFile && formData.type === "models") {
          console.log("🔄 Thumbnail se 3D model - PREVIEW ke liye");
          // THUMBNAIL SE 3D MODEL KO 'thumbnailModel' FIELD MEIN SAVE KARO
          docData.thumbnailModel = await uploadFile(
            formData.thumbnail,
            "models"
          );
          docData.thumbnail = "/default-model-thumbnail.jpg"; // Default image
        } else {
          // Regular image/video thumbnail hai
          console.log("🖼️ Uploading regular thumbnail");
          docData.thumbnail = await uploadThumbnail(formData.thumbnail);
        }
      } else if (editMode && assetToEdit.thumbnail && !formData.thumbnail) {
        docData.thumbnail = assetToEdit.thumbnail;
      }

      // ✅ MODEL FIELD - SIRF DOWNLOAD KE LIYE (ALAG SE)
      if (formData.model && formData.model instanceof File) {
        console.log("📥 Uploading model for DOWNLOAD:", formData.model.name);
        docData.model = await uploadFile(formData.model, "models");
      } else if (editMode && assetToEdit.model && !formData.model) {
        docData.model = assetToEdit.model;
      }
      if (formData.type === "scripts" && formData.script) {
        docData.script = await uploadFile(formData.script, "scripts");
      } else if (editMode && assetToEdit.script && !formData.script) {
        docData.script = assetToEdit.script;
      }

      if (formData.type === "hdris" && formData.hdri) {
        docData.hdri = await uploadFile(formData.hdri, "hdris");
      } else if (editMode && assetToEdit.hdri && !formData.hdri) {
        docData.hdri = assetToEdit.hdri;
      }

      if (formData.type === "graphics" && formData.graphicsTemplate) {
        docData.graphicsTemplate = await uploadFile(
          formData.graphicsTemplate,
          "graphics"
        );
      } else if (
        editMode &&
        assetToEdit.graphicsTemplate &&
        !formData.graphicsTemplate
      ) {
        docData.graphicsTemplate = assetToEdit.graphicsTemplate;
      }

      if (formData.type === "mockups" && formData.mockupFile) {
        docData.mockupFile = await uploadFile(formData.mockupFile, "mockups");
      } else if (editMode && assetToEdit.mockupFile && !formData.mockupFile) {
        docData.mockupFile = assetToEdit.mockupFile;
      }

      if (formData.type === "fonts" && formData.fontFile) {
        docData.fontFile = await uploadFile(formData.fontFile, "fonts");
      } else if (editMode && assetToEdit.fontFile && !formData.fontFile) {
        docData.fontFile = assetToEdit.fontFile;
      }

      if (formData.type === "video-templates" && formData.videoTemplateFile) {
        docData.videoTemplateFile = await uploadFile(
          formData.videoTemplateFile,
          "video-templates"
        );
      } else if (
        editMode &&
        assetToEdit.videoTemplateFile &&
        !formData.videoTemplateFile
      ) {
        docData.videoTemplateFile = assetToEdit.videoTemplateFile;
      }

      if (formData.type === "icons" && formData.icons) {
        if (Array.isArray(formData.icons) && formData.icons.length > 0) {
          docData.icons = await uploadImages(formData.icons, "icons");
        }
      } else if (editMode && assetToEdit.icons && !formData.icons) {
        docData.icons = assetToEdit.icons;
      }

      if (formData.type === "textures" && formData.textures) {
        if (Array.isArray(formData.textures) && formData.textures.length > 0) {
          docData.textures = await uploadImages(formData.textures, "textures");
        }
      } else if (editMode && assetToEdit.textures && !formData.textures) {
        docData.textures = assetToEdit.textures;
      }

      if (formData.type === "other" && formData.other) {
        docData.other = await uploadFile(formData.other, "other");
      } else if (editMode && assetToEdit.other && !formData.other) {
        docData.other = assetToEdit.other;
      }

      // ✅ Clean empty fields but preserve existing data in edit mode
      docData = Object.fromEntries(
        Object.entries(docData).filter(([k, v]) => {
          if (v === undefined || v === null) return false;
          if (Array.isArray(v) && v.length === 0) return false;
          if (typeof v === "string" && v.trim() === "") return false;
          return true;
        })
      );

      // ✅ Update Mode
      if (editMode && assetToEdit?.id) {
        await updateDoc(doc(db, "Assets", assetToEdit.id), docData);
        setLoadingState("success");
        if (onUploadSuccess) onUploadSuccess();
      } else {
        // ✅ Create new asset
        await addDoc(collection(db, "Assets"), docData);
        setLoadingState("success");
        if (onUploadSuccess) onUploadSuccess();
        // Reset form for new upload
        setFormData({
          title: "",
          slug: "",
          description: "",
          thumbnail: "",
          type: "",
          images: "",
          video: "",
          model: "",
          script: "",
          tags: "",
          category: "",
          is3d: false,
          price: "",
          date: new Date()
            .toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
            .replace(/ /g, ", "),
          aiGenerated: "",
          resolution: "",
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
        setTags([]);
        setThumbnailPreview(null);
        setFilePreviews({
          model: null,
          video: null,
          script: null,
          hdri: null,
          graphicsTemplate: null,
          mockupFile: null,
          fontFile: null,
          videoTemplateFile: null,
          other: null,
          images: [],
          icons: [],
          textures: [],
        });
        setFilePreviewTypes({
          model: null,
          video: null,
          script: null,
          hdri: null,
          graphicsTemplate: null,
          mockupFile: null,
          fontFile: null,
          videoTemplateFile: null,
          other: null,
        });
      }
    } catch (error) {
      console.error("UPLOAD ERROR →", error);
      setLoadingState("error");
      alert(
        `Error ${editMode ? "updating" : "uploading"} asset: ${error.message}`
      );
    } finally {
      if (editMode) setIsUpdating(false);
      else setIsSubmitting(false);
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
        <label className="blog-form-label">
          {label} <span className="blog-form-required">*</span>
        </label>
        <div className="select-wrapper">
          <select
            name={name}
            className="blog-form-select"
            onChange={handleChange}
            value={isMulti ? formData[name] : formData[name] || ""}
            required={!isMulti}
          >
            <option value="" disabled>
              Select {label}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FiChevronDown className="select-arrow" />
        </div>
      </div>
    );
  };

  const getAssetTypeIcon = (type) => {
    switch (type) {
      case "models":
        return <FiBox />;
      case "videos":
        return <FiVideo />;
      case "images":
        return <FiImage />;
      case "scripts":
        return <FiCode />;
      default:
        return <FiFile />;
    }
  };

  // Update your modal title based on mode
  const modalTitle = editMode ? "Edit Asset" : "Upload New Asset";
  const submitButtonText = editMode
    ? isUpdating
      ? "Updating..."
      : "Update Asset"
    : isSubmitting
    ? "Uploading..."
    : "Upload Asset";

  if (!currentUser) {
    return (
      <div className="blog-modal-overlay">
        <div className="blog-modal-container">
          <div className="blog-modal-content">
            <div className="blog-modal-header">
              <h1 className="blog-modal-title">{modalTitle}</h1>
              {onUploadClose && (
                <button
                  onClick={onUploadClose}
                  className="blog-modal-close"
                  aria-label="Close"
                >
                  <FiX />
                </button>
              )}
            </div>
            <div className="not-logged-in-message">
              <h3>Please log in to upload assets</h3>
              <p>
                You need to be logged in to upload assets to the marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {editMode ? "Edit Asset" : "Upload New Asset"} | Shammarianas
        </title>
        <meta
          name="description"
          content={`${
            editMode ? "Edit" : "Upload"
          } your assets to Shammarianas`}
        />
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
          .blog-form-input, .blog-form-textarea {
            width: 100%; padding: 0.875rem 1rem; border: 2px solid #e5e7eb; 
            border-radius: 0.75rem; font-size: 1rem; outline: none; 
            transition: all 0.2s; background: #fafafa; font-family: inherit;
          }
          .blog-form-input:focus, .blog-form-textarea:focus {
            border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #fff;
          }
          
          .select-wrapper {
            position: relative;
            width: 100%;
          }
          .blog-form-select {
            width: 100%; 
            padding: 0.875rem 1rem; 
            border: 2px solid #e5e7eb; 
            border-radius: 0.75rem; 
            font-size: 1rem; 
            outline: none; 
            transition: all 0.2s; 
            background: #fafafa; 
            font-family: inherit;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            cursor: pointer;
          }
          .blog-form-select:focus {
            border-color: #3b82f6; 
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #fff;
          }
          .blog-form-select[multiple] {
            height: auto;
            min-height: 120px;
            padding: 0.75rem;
            background: #fafafa;
          }
          .blog-form-select[multiple] option {
            padding: 0.5rem 0.75rem;
            margin: 2px 0;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .blog-form-select[multiple] option:hover {
            background-color: #3b82f6;
            color: white;
          }
          .blog-form-select[multiple] option:checked {
            background-color: #3b82f6;
            color: white;
          }
          .select-arrow {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: #6b7280;
            transition: transform 0.2s;
          }
          .select-wrapper .blog-form-select:focus + .select-arrow {
            color: #3b82f6;
            transform: translateY(-50%) rotate(180deg);
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
            .video-preview-container {
            position: relative;
            display: inline-block;
            cursor: pointer;
          }
          
          .blog-video-preview {
            width: 250px;
            height: 150px;
            border-radius: 0.75rem;
            border: 2px solid #e5e7eb;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            object-fit: cover;
            background: #000;
          }
          
          .video-play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
          }
          
          .video-play-button:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: translate(-50%, -50%) scale(1.1);
          }
          
          .video-play-button svg {
            color: white;
            font-size: 24px;
          }
          
          .video-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
          }

          .blog-form-file:hover { border-color: #3b82f6; background: #eff6ff; }
          .blog-form-hint { text-align: left; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; font-style: italic; }
          .modal-actions-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
                gap: 20px;
            padding: 1rem 0;
            border-top: 1px solid #e5e7eb;
            margin-top: 1rem;
          }
          .cancel-button {
            padding: 0.75rem 1.5rem;
            border: 2px solid #d1d5db;
            border-radius: 0.75rem;
            background: white;
            color: #374151;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .cancel-button:hover {
            background: #f9fafb;
            border-color: #9ca3af;
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
          text-align: left;
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

          /* New File Preview Styles */
          .file-preview-container {
            margin-top: 1rem;
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            background: #f8fafc;
          }

          .file-preview-container h4 {
            margin: 0 0 0.75rem 0;
            color: #374151;
            font-size: 0.95rem;
            font-weight: 600;
          }

          .file-preview-image {
            max-width: 100%;
            max-height: 200px;
            border-radius: 0.5rem;
            border: 2px solid #e5e7eb;
          }

          .file-preview-video {
            max-width: 100%;
            max-height: 200px;
            border-radius: 0.5rem;
            border: 2px solid #e5e7eb;
          }

          .file-info-preview {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
          }

          .file-icon {
            font-size: 2rem;
            color: #3b82f6;
          }

          .file-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .file-info strong {
            color: #374151;
          }

          .file-info span {
            font-size: 0.875rem;
            color: #6b7280;
          }

          .file-preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.75rem;
          }

          .file-preview-item {
            position: relative;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 0.5rem;
            background: white;
            text-align: center;
          }

          .file-preview-index {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: bold;
          }

          @media (max-width: 768px) {
            .blog-modal-content { padding: 1.5rem; }
            .blog-modal-title { font-size: 1.25rem; }
            .blog-tags-container { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
            .modal-actions-row { flex-direction: column; gap: 1rem; }
            .blog-form-select[multiple] {
              min-height: 100px;
            }
          }
        `}
      </style>

      <div className="blog-modal-overlay">
        <div className="blog-modal-container">
          <div className="blog-modal-content">
            <div className="blog-modal-header">
              <h1 className="blog-modal-title">
                <FiUpload className="asset-type-icon" />
                {editMode ? "Edit Asset" : "Upload New Asset"}
              </h1>
              {onUploadClose && (
                <button
                  onClick={onUploadClose}
                  className="blog-modal-close"
                  aria-label="Close"
                >
                  <FiX />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="blog-form-group">
                <label className="blog-form-label">
                  Title <span className="blog-form-required">*</span>
                </label>
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
                <label className="blog-form-label">
                  Slug <span className="blog-form-required">*</span>
                </label>
                {formData.slug && (
                  <input
                    type="text"
                    name="Slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="blog-form-input"
                    placeholder="URL Auto Generate"
                  />
                )}
                {/* {formData.slug && (
                  <p className="blog-form-hint" style={{ color: '#059669', fontStyle: 'normal' }}>
                    Slug: {formData.slug}
                  </p>
                )} */}
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">
                  Thumbnail <span className="blog-form-required">*</span>
                </label>
                <input
                  type="file"
                  name="thumbnail"
                  onChange={handleThumbnailChange}
                  accept="image/*, video/*, .glb"
                  className="blog-form-file"
                />
                <p className="blog-form-hint">
                  JPG, PNG, MP4, (.glb for 3d model) • Max 500KB • 705x472px
                  recommended
                </p>

                {thumbnailPreview && thumbnailType === "image" && (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="blog-image-preview"
                  />
                )}

                {thumbnailPreview && thumbnailType === "video" && (
                  <div
                    className="video-preview-container"
                    onClick={handleVideoPlay}
                  >
                    <video
                      ref={videoRef}
                      src={thumbnailPreview}
                      className="blog-video-preview"
                      preload="metadata"
                      onLoadedData={handleVideoLoaded}
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={handleVideoPause}
                      onEnded={handleVideoEnded}
                      onError={handleVideoError}
                      playsInline
                      webkit-playsinline="true"
                      muted
                    >
                      Your browser does not support the video tag.
                    </video>

                    {!isVideoPlaying && (
                      <button
                        type="button"
                        className="video-play-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoPlay();
                        }}
                      >
                        <FiPlay />
                      </button>
                    )}

                    {isVideoPlaying && (
                      <button
                        type="button"
                        className="video-play-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoPlay();
                        }}
                      >
                        <FiPause />
                      </button>
                    )}
                  </div>
                )}

                {editMode && assetToEdit?.thumbnail && !thumbnailPreview && (
                  <p className="current-image-note">
                    Current thumbnail will be kept if no new file is selected
                  </p>
                )}
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">
                  Description <span className="blog-form-required">*</span>
                </label>
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
                <label className="blog-form-label">
                  Asset Type <span className="blog-form-required">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="blog-form-select"
                >
                  <option value="" disabled>
                    Select Asset Type
                  </option>
                  <option value="models">3D Model</option>
                  <option value="textures">Texture</option>
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
                <label className="blog-form-label">
                  Category <span className="blog-form-required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="blog-form-select"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {getCategoryOptions().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">
                  Price Type <span className="blog-form-required">*</span>
                </label>
                <select
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="blog-form-select"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
                <p className="blog-form-hint">
                  Select whether this asset is free or paid
                </p>
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Tags (Max 10)</label>
                <div className="blog-tags-container" tabIndex="0">
                  {tags.map((tag, index) => (
                    <div key={index} className="blog-tag">
                      #{tag}
                      <span
                        className="blog-tag-remove"
                        onClick={() => handleTagRemove(tag)}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    className="blog-tag-input"
                    value={formData.tags}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    placeholder={
                      tags.length === 0
                        ? "Type tag and press Enter..."
                        : "Press Enter to add tag..."
                    }
                    maxLength={20}
                  />
                </div>
                <p className="blog-form-hint">
                  Type tag name and press Enter. Max 10 tags. Click × to remove.
                </p>
                {tags.length > 0 && (
                  <p
                    className="current-image-note"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {tags.length} tag{tags.length > 1 ? "s" : ""} added
                  </p>
                )}
              </div>

              {renderFilterSelect("aiGenerated", "AI-Generated", "aiGenerated")}
              {renderFilterSelect("resolution", "Resolution", "resolution")}
              {renderFilterSelect("frameRate", "Frame Rate", "frameRate")}
              {renderFilterSelect("properties", "Properties", "properties")}
              {renderFilterSelect(
                "applicationsSupported",
                "Applications Supported",
                "applicationsSupported"
              )}
              {renderFilterSelect("orientation", "Orientation", "orientation")}
              {renderFilterSelect("licenseType", "License Type", "licenseType")}
              {renderFilterSelect(
                "surfaceMaterial",
                "Surface Material",
                "surfaceMaterial"
              )}
              {renderFilterSelect("style", "Style", "style")}
              {renderFilterSelect(
                "environmentType",
                "Environment Type",
                "environmentType"
              )}
              {renderFilterSelect(
                "lightingCondition",
                "Lighting Condition",
                "lightingCondition"
              )}
              {renderFilterSelect("scriptType", "Script Type", "scriptType")}
              {renderFilterSelect(
                "programmingLanguage",
                "Programming Language",
                "programmingLanguage"
              )}
              {renderFilterSelect("framework", "Framework", "framework")}
              {renderFilterSelect(
                "integrationReady",
                "Integration Ready",
                "integrationReady",
                true
              )}
              {renderFilterSelect("colorSpace", "Color Space", "colorSpace")}
              {renderFilterSelect("objectType", "Object Type", "objectType")}
              {renderFilterSelect("fileFormat", "File Format", "fileFormat")}

              {formData.type === "models" && (
                <>
                  {/* Model Field - VISIBLE but OPTIONAL since we're using thumbnail field */}
                  <div className="blog-form-group">
                    <label className="blog-form-label">
                      3D Model File (Optional)
                      {/* Required star hata do */}
                    </label>
                    <input
                      type="file"
                      name="model"
                      onChange={handleChange}
                      accept=".glb,.gltf,.stl,.obj,.fbx,.blend,.zip"
                      className="blog-form-file"
                      // required={!editMode} 👈 REQUIRED HATA DO
                    />
                    <p className="blog-form-hint">
                      Supported formats: .glb, .gltf, .stl, .obj, .fbx, .blend,
                      .zip
                    </p>
                    {renderFilePreview("model", "3D Model")}
                    {editMode && assetToEdit.model && (
                      <p className="current-image-note">
                        Current model file will be kept if no new file is
                        selected
                      </p>
                    )}
                  </div>
                </>
              )}

              {formData.type === "images" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Image Files{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="images"
                    onChange={handleChange}
                    accept="image/*, .png, .jpg, .jpeg"
                    multiple
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">Select image files</p>
                  {renderMultipleFilesPreview("images", "Image")}
                  {editMode && assetToEdit.images && (
                    <p className="current-image-note">
                      Current images will be kept if no new files are selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "videos" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Video File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="video"
                    onChange={handleChange}
                    accept="video/*, .zip"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported video formats .mov, & .zip
                  </p>
                  {renderFilePreview("video", "Video")}
                  {editMode && assetToEdit.video && (
                    <p className="current-image-note">
                      Current video file will be kept if no new file is selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "scripts" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Script File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="script"
                    onChange={handleChange}
                    accept=".js,.py,.php,.html,.css,.ts,.rb,.go,.sh,.sql,.lua,.cs,.json,.xml,.zip"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported formats: JS, Python, PHP, HTML, CSS, TypeScript,
                    Ruby, Go, Shell, SQL, Lua, C#, .zip
                  </p>
                  {renderFilePreview("script", "Script")}
                  {editMode && assetToEdit.script && (
                    <p className="current-image-note">
                      Current script file will be kept if no new file is
                      selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "textures" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Texture Files{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="textures"
                    onChange={handleChange}
                    accept="image/*, .png, .jpg, .jpeg, .psd"
                    multiple
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Select multiple texture image files & .psd, .zip
                  </p>
                  {renderMultipleFilesPreview("textures", "Texture")}
                  {editMode && assetToEdit.textures && (
                    <p className="current-image-note">
                      Current texture files will be kept if no new files are
                      selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "hdris" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    HDRI File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="hdri"
                    onChange={handleChange}
                    accept=".hdr,.exr,.zip"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported formats: .HDR, .EXR, .zip
                  </p>
                  {renderFilePreview("hdri", "HDRI")}
                  {editMode && assetToEdit.hdri && (
                    <p className="current-image-note">
                      Current HDRI file will be kept if no new file is selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "icons" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Icon Files{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="icons"
                    onChange={handleChange}
                    accept="image/*,.svg,.png,.ico"
                    multiple
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Select multiple icon files PNG, SVG, ICO
                  </p>
                  {renderMultipleFilesPreview("icons", "Icon")}
                  {editMode && assetToEdit.icons && (
                    <p className="current-image-note">
                      Current icon files will be kept if no new files are
                      selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "graphics" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Graphics Template File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="graphicsTemplate"
                    onChange={handleChange}
                    accept=".psd,.ai,.eps,.pdf"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported formats: PSD, AI, EPS, PDF
                  </p>
                  {renderFilePreview("graphicsTemplate", "Graphics Template")}
                  {editMode && assetToEdit.graphicsTemplate && (
                    <p className="current-image-note">
                      Current graphics template file will be kept if no new file
                      is selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "mockups" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Mockup File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="mockupFile"
                    onChange={handleChange}
                    accept=".psd,.zip"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">Supported formats: PSD, .zip</p>
                  {renderFilePreview("mockupFile", "Mockup")}
                  {editMode && assetToEdit.mockupFile && (
                    <p className="current-image-note">
                      Current mockup file will be kept if no new file is
                      selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "fonts" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Font File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="fontFile"
                    onChange={handleChange}
                    accept=".eps,.ttf,.otf,.woff,.woff2,.zip"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported formats: TTF, OTF, WOFF, WOFF2, .zip
                  </p>
                  {renderFilePreview("fontFile", "Font")}
                  {editMode && assetToEdit.fontFile && (
                    <p className="current-image-note">
                      Current font file will be kept if no new file is selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "video-templates" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Video Template File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="videoTemplateFile"
                    onChange={handleChange}
                    accept="video/*,.zip"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported formats: .MOV, .MP4, .zip
                  </p>
                  {renderFilePreview("videoTemplateFile", "Video Template")}
                  {editMode && assetToEdit.videoTemplateFile && (
                    <p className="current-image-note">
                      Current video template file will be kept if no new file is
                      selected
                    </p>
                  )}
                </div>
              )}

              {formData.type === "other" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Asset File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="other"
                    onChange={handleChange}
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">Upload your asset file</p>
                  {renderFilePreview("other", "Asset")}
                  {editMode && assetToEdit.other && (
                    <p className="current-image-note">
                      Current asset file will be kept if no new file is selected
                    </p>
                  )}
                </div>
              )}

              <div className="modal-actions-row">
                {onUploadClose && (
                  <button
                    type="button"
                    onClick={onUploadClose}
                    className="cancel-button"
                    disabled={isSubmitting || isUpdating}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || isUpdating || converting}
                  className="blog-btn blog-btn-submit"
                >
                  {converting
                    ? "Converting Images..."
                    : editMode
                    ? isUpdating
                      ? "Updating..."
                      : "Update Asset"
                    : isSubmitting
                    ? "Uploading..."
                    : "Upload Asset"}
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
