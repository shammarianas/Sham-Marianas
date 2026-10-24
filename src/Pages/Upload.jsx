import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db, functions, storage } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  deleteField,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { useUser } from "../Context/UserProvider";
import { Helmet } from "react-helmet-async";
import { FiUpload, FiX, FiImage, FiVideo, FiFile, FiCode, FiBox, FiChevronDown, FiPlay, FiPause, FiFileText } from "react-icons/fi";
import useImageSizeConverter from "../hooks/ImageSizeConverter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

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
        "VFX",
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
    },
  },
  Images: {
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
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
    licenseType: {
      label: "License Type",
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
      options: ["Free for Personal Use", "Free for Commercial Use"],
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
  Prompts: {
    categories: {
      label: "Categories",
      options: [
        "Image Prompt",
        "Video Prompt",
        "Song Prompt",
        "Website Prompt",
        "3D model Prompt",
        "Claude Ai Skills",
      ],
    },
    interests: {
      label: "Interests",
      options: [
        "Personal",
        "Builders",
        "Food",
        "Car",
        "Bikes",
        "Place",
        "Medical",
        "Health",
        "Technology",
      ],
    },
  },
};

const getStoredFileUrl = (value) => {
  if (typeof value === "string") return value;
  return value?.url || value?.downloadUrl || value?.path || "";
};

const getStoredFileName = (value, fallback = "Current file") => {
  const fileUrl = getStoredFileUrl(value);
  if (!fileUrl) return fallback;

  try {
    const pathname = new URL(fileUrl).pathname;
    const encodedName = pathname.split("/").filter(Boolean).pop();
    return encodedName ? decodeURIComponent(encodedName) : fallback;
  } catch {
    const encodedName = fileUrl.split("?")[0].split("/").filter(Boolean).pop();
    return encodedName ? decodeURIComponent(encodedName) : fallback;
  }
};

const assetTypeToFilterData = {
  videos: "Videos",
  "video-templates": "VideoTemplates",
  images: "Images",
  graphics: "GraphicTemplates",
  mockups: "Mockups",
  fonts: "Fonts",
  models: "3DModels",
  icons: "Icons",
  textures: "Textures",
  hdris: "HDRIs",
  scripts: "Scripts",
  prompts: "Prompts",
  other: null,
};

const specializationToAssetTypes = {
  videos: ["videos"],
  "3d-models": ["models"],
  "video-templates": ["video-templates"],
  images: ["images"],
  mockups: ["mockups"],
  "graphic-templates": ["graphics"],
  fonts: ["fonts"],
  icons: ["icons"],
  scripts: ["scripts"],
  prompts: ["prompts"],
  hdris: ["hdris"],
  textures: ["textures"],
};

const Upload = ({
  onUploadSuccess,
  onUploadClose,
  editMode = false,
  assetToEdit = null,
  isUpdating = false
}) => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const { converting } = useImageSizeConverter();
  const handleUploadClose = onUploadClose || (() => navigate("/templates"));

  // State definitions
  const [userRole, setUserRole] = useState("contributor");
  const [deletedStoredFiles, setDeletedStoredFiles] = useState({
    preview: false,
    model: false,
  });
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    thumbnail: null,
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
    interest: "",
    type: "",
    model: null,
    images: [],
    video: null,
    icons: [],
    script: null,
    promptFile: null,
    previewUrl: "",
    previewModel: null,
    hdri: null,
    graphicsTemplate: null,
    mockupFile: null,
    fontFile: null,
    videoTemplateFile: null,
    other: null,
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
    textures: [],
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
  const [, setLoadingState] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailType, setThumbnailType] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [specialization, setSpecialization] = useState(null);

  // File preview states
  const [filePreviews, setFilePreviews] = useState({
    model: null,
    video: null,
    script: null,
    promptFile: null,
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
    promptFile: null,
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

  // ✅ Function to fetch user role
  const fetchUserRole = useCallback(async () => {
    if (!currentUser) return "contributor";

    try {
      // Check Profiles collection for admin
      const profileDoc = await getDoc(doc(db, "Profiles", currentUser.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        if (profileData.role === "admin") return "admin";
      }

      return "contributor";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "contributor";
    }
  }, [currentUser]);

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

  // Fetch user role and specialization when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;

      try {
        // Fetch user role
        const role = await fetchUserRole();
        setUserRole(role);

        // Fetch specialization only for contributors
        if (role !== "admin") {
          const docSnap = await getDoc(
            doc(db, "Contributors", currentUser.uid)
          );
          if (docSnap.exists()) {
            const spec = docSnap.data().specialization;
            setSpecialization(spec);
            const allowedTypes = specializationToAssetTypes[spec] || [];

            // Auto-select first allowed type for new uploads
            if (!editMode) {
              if (
                allowedTypes.length > 0 &&
                !allowedTypes.includes(formData.type)
              ) {
                setFormData((prev) => ({
                  ...prev,
                  type: allowedTypes[0],
                }));
              }
            }

            // For edit mode, validate if current asset type is allowed
            if (
              editMode &&
              assetToEdit &&
              !allowedTypes.includes(assetToEdit.type)
            ) {
              alert(
                `This asset type is not allowed for your specialization. You can only edit ${spec} assets.`
              );
              if (onUploadClose) onUploadClose();
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentUser?.uid, editMode, assetToEdit, fetchUserRole, formData.type, onUploadClose]);

  // Initialize form data with existing asset data when in edit mode
  useEffect(() => {
    if (editMode && assetToEdit) {
      setDeletedStoredFiles({ preview: false, model: false });
      setFormData((prev) => ({
        ...prev,
        title: assetToEdit.title || "",
        slug: assetToEdit.slug || generateSlug(assetToEdit.title || ""),
        description: assetToEdit.description || "",
        price: assetToEdit.price || "free",
        category: assetToEdit.category || "",
        interest: assetToEdit.interest || "",
        type: String(assetToEdit.type || "").toLowerCase(),
        previewModel: null,
        previewUrl: assetToEdit.previewUrl || "",
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
        objectType: assetToEdit.objectType || assetToEdit.category || "",
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
      // 3D Model thumbnails are image previews only. The actual model file
      // is uploaded through the dedicated model field below.
      if (formData.type === "models" && !file.type.startsWith("image/")) {
        alert("3D Model thumbnail must be a JPG, PNG, or WebP image.");
        event.target.value = "";
        return;
      }

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

  const addTagsFromText = (text) => {
    const incomingTags = String(text || "")
      .split(/[,;\n]+/)
      .map((tag) => tag.trim().replace(/^#+/, ""))
      .filter(Boolean);

    if (!incomingTags.length) return;

    setTags((currentTags) => {
      const mergedTags = [...currentTags];
      incomingTags.forEach((tag) => {
        if (mergedTags.length < 10 && !mergedTags.includes(tag)) {
          mergedTags.push(tag);
        }
      });
      return mergedTags;
    });
    setFormData((prev) => ({ ...prev, tags: "" }));
  };

  const handleTagPaste = (e) => {
    const pastedText = e.clipboardData?.getData("text") || "";
    if (pastedText.includes(",") || pastedText.includes(";") || pastedText.includes("\n")) {
      e.preventDefault();
      addTagsFromText(pastedText);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTagsFromText(e.target.value);
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

  const handleDeleteStoredFile = async (fileKind) => {
    if (!editMode || !assetToEdit?.id) return;

    const isPreview = fileKind === "preview";
    const storedValue = isPreview
      ? assetToEdit.thumbnailModel
      : assetToEdit.model || assetToEdit.downloadUrl;
    const storedPath = getStoredFileUrl(storedValue);
    if (!storedPath) return;

    const label = isPreview ? "3D preview file" : "3D model download file";
    if (!window.confirm(`Delete this ${label} permanently from Firebase?`)) {
      return;
    }

    try {
      setLoadingState(`Deleting ${label}...`);
      try {
        await deleteObject(ref(storage, storedPath));
      } catch (storageError) {
        // If the object is already missing, still remove its stale database reference.
        if (storageError?.code !== "storage/object-not-found") throw storageError;
      }

      const fieldsToRemove = isPreview
        ? { thumbnailModel: deleteField(), updatedAt: serverTimestamp() }
        : {
            model: deleteField(),
            downloadUrl: deleteField(),
            fileName: deleteField(),
            updatedAt: serverTimestamp(),
          };
      await updateDoc(doc(db, "Assets", assetToEdit.id), fieldsToRemove);
      setDeletedStoredFiles((current) => ({ ...current, [fileKind]: true }));
      setLoadingState(false);
      alert(`${label} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete ${label}:`, error);
      setLoadingState(false);
      alert(`Failed to delete ${label}: ${error.message || "Unknown error"}`);
    }
  };

  const PREVIEW_MODEL_MAX_BYTES = 100 * 1024 * 1024;

  // Preview models are re-exported as a smaller self-contained GLB before upload.
  // The original model file remains untouched and is still used for downloads.
  const optimizePreviewGlb = async (file) => {
    if (file.size <= PREVIEW_MODEL_MAX_BYTES) return file;

    setLoadingState("Optimizing 3D preview... 0%");
    let bestOptimizedSize = file.size;
    const formatMegabytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)}MB`;

    const sourceBuffer = await file.arrayBuffer();
    const loader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      loader.parse(sourceBuffer, "", resolve, reject);
    });

    const textures = new Set();
    gltf.scene.traverse((node) => {
      const materials = Array.isArray(node.material)
        ? node.material
        : node.material
          ? [node.material]
          : [];

      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture && value.image) textures.add(value);
        });
      });
    });

    const resizeTextures = async (maxTextureSize) => {
      await Promise.all(
        Array.from(textures).map(async (texture) => {
          const image = texture.image;
          const width = image.width || image.videoWidth;
          const height = image.height || image.videoHeight;
          if (!width || !height) return;

          const scale = Math.min(1, maxTextureSize / Math.max(width, height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          texture.image = canvas;
          texture.needsUpdate = true;
        })
      );
    };

    const reducePreviewMaterials = (scene, keepBaseColor) => {
      const secondaryTextureProperties = [
        "roughnessMap",
        "metalnessMap",
        "aoMap",
        "emissiveMap",
        "alphaMap",
        "lightMap",
        "bumpMap",
        "displacementMap",
        "clearcoatMap",
        "clearcoatNormalMap",
        "clearcoatRoughnessMap",
        "sheenColorMap",
        "sheenRoughnessMap",
        "specularColorMap",
        "specularIntensityMap",
        "iridescenceMap",
        "iridescenceThicknessMap",
        "transmissionMap",
        "thicknessMap",
      ];

      scene.traverse((node) => {
        if (!node.isMesh) return;

        const materials = Array.isArray(node.material)
          ? node.material
          : node.material
            ? [node.material]
            : [];
        const lightweightMaterials = materials.map((material) => {
          const clone = material.clone();
          secondaryTextureProperties.forEach((property) => {
            if (property in clone) clone[property] = null;
          });
          if (!keepBaseColor && "map" in clone) clone.map = null;
          clone.needsUpdate = true;
          return clone;
        });
        node.material = Array.isArray(node.material)
          ? lightweightMaterials
          : lightweightMaterials[0];
      });
    };

    const exportGlb = (scene, animations) =>
      new Promise((resolve, reject) => {
        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (result) => resolve(result),
          reject,
          {
            binary: true,
            onlyVisible: true,
            maxTextureSize: 72,
            animations,
          }
        );
      });

    // Keep geometry exactly as uploaded. Only resize textures and remove
    // secondary material maps; the original downloadable model is untouched.
    for (const textureSize of [72]) {
      await resizeTextures(textureSize);
      const previewScene = gltf.scene.clone(true);
      reducePreviewMaterials(previewScene, true);
      const exported = await exportGlb(previewScene, gltf.animations || []);
      const optimizedBlob = new Blob([exported], { type: "model/gltf-binary" });
      bestOptimizedSize = Math.min(bestOptimizedSize, optimizedBlob.size);

      if (optimizedBlob.size <= PREVIEW_MODEL_MAX_BYTES) {
        const optimizedName = file.name.replace(/\.glb$/i, "-preview.glb");
        const reduction = Math.round((1 - optimizedBlob.size / file.size) * 100);
        setLoadingState(`3D preview optimized: ${reduction}% smaller`);
        return new File([optimizedBlob], optimizedName, {
          type: "model/gltf-binary",
          lastModified: Date.now(),
        });
      }

      setLoadingState(
        `Optimizing 3D preview... ${textureSize}px textures, mesh unchanged`
      );
    }

    // Last-resort preview: preserve the complete mesh and remove all material
    // texture payloads. The model shape and geometry remain unchanged.
    const lightweightScene = gltf.scene.clone(true);
    reducePreviewMaterials(lightweightScene, false);
    const lightweightExport = await exportGlb(lightweightScene, []);
    const lightweightBlob = new Blob([lightweightExport], {
      type: "model/gltf-binary",
    });
    bestOptimizedSize = Math.min(bestOptimizedSize, lightweightBlob.size);
    if (lightweightBlob.size <= PREVIEW_MODEL_MAX_BYTES) {
      const optimizedName = file.name.replace(/\.glb$/i, "-preview.glb");
      const reduction = Math.round(
        (1 - lightweightBlob.size / file.size) * 100
      );
      setLoadingState(`3D preview optimized: ${reduction}% smaller`);
      return new File([lightweightBlob], optimizedName, {
        type: "model/gltf-binary",
        lastModified: Date.now(),
      });
    }

    throw new Error(
      `3D preview could not be reduced below 100MB. Original: ${formatMegabytes(
        file.size
      )}; best result: ${formatMegabytes(
        bestOptimizedSize
      )}. Please upload a lighter GLB file.`
    );
  };

  // File upload functions
  const uploadFile = async (file, fileType, userId) => {
    try {
      // ✅ STEP 1: Image optimization BEFORE upload
      let optimizedFile = file;

      if (file.type.startsWith("image/") && fileType !== "thumbnails") {
        // WebP conversion for images
        optimizedFile = await convertImageToWebP(file);
      }

      if (fileType === "model-previews") {
        optimizedFile = await optimizePreviewGlb(file);
      }

      // ✅ STEP 2: Create unique filename with timestamp
      const timestamp = Date.now();
      const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const extension = file.type.startsWith("image/")
        ? ".webp"
        : file.name.substring(file.name.lastIndexOf("."));

      const fileName = `${originalName}_${timestamp}${extension}`;

      // ✅ STEP 3: Set metadata for CACHING
      const metadata = {
        cacheControl: "public, max-age=31536000", // 1 year cache
        contentType:
          optimizedFile.type ||
          (fileType === "prompts"
            ? {
                ".pdf": "application/pdf",
                ".docx":
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".txt": "text/plain",
              }[file.name.slice(file.name.lastIndexOf(".")).toLowerCase()] ||
              "application/octet-stream"
            : "application/octet-stream"),
        customMetadata: {
          originalSize: file.size.toString(),
          optimizedSize: optimizedFile.size.toString(),
          userId: userId || "anonymous",
          uploadedAt: timestamp.toString(),
        },
      };

      // ✅ STEP 4: Upload to user-specific folder
      const storageRef = ref(
        storage,
        `assets/${fileType}/${userId}/${fileName}`
      );
      const uploadSnapshot = await new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(
          storageRef,
          optimizedFile,
          metadata
        );

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setLoadingState(`Uploading ${fileType}... ${progress}%`);
          },
          reject,
          () => resolve(uploadTask.snapshot)
        );
      });
      const downloadURL = await getDownloadURL(uploadSnapshot.ref);

      console.log(`✅ Uploaded ${fileType}: ${downloadURL}`);
      console.log(
        `📊 Size reduced: ${file.size} → ${optimizedFile.size} bytes`
      );

      return {
        url: downloadURL,
        sizes: {
          original: file.size,
          optimized: optimizedFile.size,
          reduction: Math.round((1 - optimizedFile.size / file.size) * 100),
        },
        fileName: fileName,
      };
    } catch (error) {
      console.error(`❌ Error uploading ${fileType}:`, error);
      throw error;
    }
  };

  // ✅ HELPER: Convert image to WebP
  const convertImageToWebP = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        resolve(file); // Non-images ko as-is return
        return;
      }

      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Calculate optimal dimensions
        const maxWidth = 1200;
        const maxHeight = 1200;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP with quality 80%
        canvas.toBlob(
          (blob) => {
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              {
                type: "image/webp",
              }
            );
            resolve(webpFile);
          },
          "image/webp",
          0.8
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadThumbnail = async (file) => {
    try {
      console.log("🖼️ Uploading thumbnail started...", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + "MB",
        userId: currentUser?.uid,
        userRole: userRole,
      });

      setLoadingState(`Uploading thumbnail...`);

      // ✅ STEP 1: File type validation
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/quicktime",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type: ${file.type}. Only images (JPG, PNG, WebP, GIF) and videos (MP4, MOV) are allowed.`
        );
      }

      // ✅ STEP 2: Create optimized filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      let fileExtension = "";
      let optimizedFile = file;

      // Auto-convert images to WebP for better compression.
      // Video thumbnails are re-encoded by the server-side FFmpeg function.
      if (file.type.startsWith("video/")) {
        setLoadingState("Converting video thumbnail on the server...");
        const safeName = file.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
        const storagePath = `thumbnail-temp/${currentUser.uid}/${Date.now()}_${safeName}`;
        await uploadBytes(ref(storage, storagePath), file, {
          contentType: file.type || "video/quicktime",
        });

        const convertVideoThumbnail = httpsCallable(
          functions,
          "convertVideoThumbnail"
        );
        const result = await convertVideoThumbnail({
          storagePath,
          fileName: file.name,
        });
        return result.data.downloadURL;
      } else if (file.type.startsWith("image/")) {
        try {
          // Convert to WebP with 80% quality
          optimizedFile = await convertToWebP(file);
          fileExtension = ".webp";
        } catch (convError) {
          console.warn("WebP conversion failed, using original:", convError);
          fileExtension = file.name.substring(file.name.lastIndexOf("."));
        }
      } else {
        fileExtension = file.name.substring(file.name.lastIndexOf("."));
      }

      const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const safeFileName = originalName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .substring(0, 50);

      const fileName = `thumb_${safeFileName}_${timestamp}_${randomId}${fileExtension}`;

      // ✅ STEP 3: Determine storage path based on user role
      let storagePath = "";

      if (userRole === "admin") {
        // Admin ke liye projects folder
        storagePath = `projects/${fileName}`;
      } else if (userRole === "contributor") {
        // Contributor ke liye user-specific folder
        if (!currentUser?.uid) {
          throw new Error("User not authenticated");
        }
        storagePath = `thumbnails/${currentUser.uid}/${fileName}`;
      } else {
        // Default for other users
        storagePath = `thumbnails/public/${fileName}`;
      }

      console.log("📤 Storage Path:", storagePath);

      // ✅ STEP 5: Set metadata for CACHING and SEO
      const metadata = {
        cacheControl: "public, max-age=31536000", // 1 year cache
        contentType: optimizedFile.type,
        customMetadata: {
          originalName: file.name,
          originalSize: file.size.toString(),
          optimizedSize: optimizedFile.size.toString(),
          userId: currentUser?.uid || "anonymous",
          userRole: userRole,
          uploadedAt: timestamp.toString(),
          reductionPercent: Math.round(
            ((file.size - optimizedFile.size) / file.size) * 100
          ).toString(),
        },
      };

      // ✅ STEP 6: Upload to Firebase Storage
      const storageRef = ref(storage, storagePath);
      console.log("📤 Uploading to:", storageRef.fullPath);

      const uploadSnapshot = await uploadBytes(
        storageRef,
        optimizedFile,
        metadata
      );
      const downloadURL = await getDownloadURL(uploadSnapshot.ref);

      console.log("✅ Thumbnail uploaded successfully!");
      console.log("🔗 Download URL:", downloadURL);
      console.log("📊 Size reduction:", {
        original: (file.size / 1024).toFixed(2) + "KB",
        optimized: (optimizedFile.size / 1024).toFixed(2) + "KB",
        reduction:
          Math.round(((file.size - optimizedFile.size) / file.size) * 100) +
          "%",
      });

      return downloadURL;
    } catch (error) {
      console.error("❌ Thumbnail upload failed:", {
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error,
        fileInfo: {
          name: file?.name,
          type: file?.type,
          size: file?.size,
        },
        userInfo: {
          uid: currentUser?.uid,
          role: userRole,
        },
      });

      // User-friendly error messages
      let errorMessage = `Failed to upload thumbnail${
        error.code ? ` (${error.code})` : ""
      }. `;

      if (error.message.includes("storage/unauthorized")) {
        errorMessage +=
          "Permission denied. Please check your storage rules or contact admin.";
      } else if (error.message.includes("storage/retry-limit-exceeded")) {
        errorMessage +=
          "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes("exceeds")) {
        errorMessage += error.message;
      } else if (error.message.includes("Invalid file type")) {
        errorMessage += error.message;
      } else if (error.message.includes("User not authenticated")) {
        errorMessage += "Please log in to upload files.";
      } else {
        errorMessage +=
          `${error.message || "Unknown error occurred."} ` +
          "Check that Firebase Storage is enabled, the configured bucket exists, " +
          "and its CORS policy allows this site origin.";
      }

      throw new Error(errorMessage);
    }
  };

  // ✅ HELPER: Convert image to WebP
  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Optimize dimensions for thumbnail
        const maxWidth = 800;
        const maxHeight = 600;

        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while resizing
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // White background for transparent images
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP with 80% quality
        canvas.toBlob(
          (blob) => {
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              {
                type: "image/webp",
              }
            );
            console.log("🔄 WebP conversion successful:", {
              original: (file.size / 1024).toFixed(2) + "KB",
              webp: (blob.size / 1024).toFixed(2) + "KB",
              reduction:
                Math.round(((file.size - blob.size) / file.size) * 100) + "%",
            });
            resolve(webpFile);
          },
          "image/webp",
          0.8
        );
      };

      img.onerror = (err) => {
        console.warn("⚠️ Image load failed, using original file:", err);
        resolve(file); // Fallback to original file
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImages = async (files, fileType, userId) => {
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Create multiple sizes for each image
        const sizes = await generateImageSizes(file);

        const sizePromises = sizes.map(async (size) => {
          const sizeName = `${size.width}x${size.height}`;
          const fileName = `${file.name.replace(
            /\.[^/.]+$/,
            ""
          )}_${sizeName}_${Date.now()}.webp`;

          const metadata = {
            cacheControl: "public, max-age=31536000",
            contentType: "image/webp",
            customMetadata: {
              size: sizeName,
              originalName: file.name,
              index: index.toString(),
            },
          };

          const storageRef = ref(
            storage,
            `assets/${fileType}/${userId}/resized/${fileName}`
          );

          const uploadSnapshot = await uploadBytes(
            storageRef,
            size.blob,
            metadata
          );

          // ✅ Get the download URL
          const url = await getDownloadURL(uploadSnapshot.ref);

          return {
            url: url, // ✅ Make sure this is included
            size: sizeName,
            width: size.width,
            height: size.height,
          };
        });

        const allSizes = await Promise.all(sizePromises);

        // ✅ Find the primary size (800x800 or first)
        const primarySize =
          allSizes.find((s) => s.size === "800x800") || allSizes[0];

        return {
          originalName: file.name,
          sizes: allSizes,
          primary: {
            url: primarySize.url, // ✅ ADD URL TO PRIMARY OBJECT
            size: primarySize.size,
            width: primarySize.width,
            height: primarySize.height,
          },
          // ✅ ALSO ADD DIRECT URL FIELD FOR EASY ACCESS
          url: primarySize.url,
        };
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      throw error;
    }
  };
  // Generate multiple image sizes
  const generateImageSizes = async (file) => {
    const sizes = [
      { width: 400, height: 400 }, // Thumbnail
      { width: 800, height: 800 }, // Mobile
      { width: 1200, height: 1200 }, // Desktop
    ];

    return Promise.all(
      sizes.map((size) => resizeImage(file, size.width, size.height))
    );
  };

  const resizeImage = (file, targetWidth, targetHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Maintain aspect ratio
        let { width, height, x, y } = calculateAspectRatioFit(
          img.width,
          img.height,
          targetWidth,
          targetHeight
        );

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, x, y, width, height);

        canvas.toBlob(
          (blob) => {
            resolve({
              blob,
              width: targetWidth,
              height: targetHeight,
            });
          },
          "image/webp",
          0.8
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: srcWidth * ratio,
      height: srcHeight * ratio,
      x: (maxWidth - srcWidth * ratio) / 2,
      y: (maxHeight - srcHeight * ratio) / 2,
    };
  }

  // Main form change handler - UPDATED for title to slug conversion
  const handleChange = (e) => {
    const { name, files, value, type } = e.target;

    if (type === "file") {
      if (!files?.length) return;

      if (name === "thumbnail") {
        handleThumbnailChange(e);
        return;
      }

      // Videos and 3D models allow up to 200MB source files; preview GLBs are
      // automatically optimized to a maximum of 100MB before upload.
      const file = files[0];
      const largeAsset = name === "video" || name === "model" || name === "previewModel";
      const maxSize = largeAsset ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
      const maxSizeLabel = largeAsset ? "200MB" : "10MB";
      if (name === "previewModel" && !/\.glb$/i.test(file.name)) {
        alert("3D Preview File must be a .glb file.");
        e.target.value = "";
        return;
      }
      if (
        name === "promptFile" &&
        !/\.(pdf|docx|txt)$/i.test(file.name)
      ) {
        alert("Prompt files must be PDF, DOCX, or TXT files.");
        e.target.value = "";
        return;
      }
      if (file && file.size > maxSize) {
        alert(`${name} file size must be under ${maxSizeLabel}!`);
        e.target.value = "";
        return;
      }

      if (["images", "icons", "textures"].includes(name)) {
        const fileArray = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
        if (fileArray.length !== files.length) {
          alert("Some files were skipped because they exceed 10MB limit.");
        }
        setFormData(prev => ({ ...prev, [name]: fileArray }));
      } else {
        setFormData(prev => ({ ...prev, [name]: file }));
      }
      return;
    }

    if (name === "title") {
      setFormData(prev => ({ ...prev, title: value, slug: generateSlug(value) }));
    } else if (name === "type") {
      setFormData(prev => ({ ...prev, type: value, category: "", interest: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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

  //notifications save
  const saveContributorNotification = async (
    assetId,
    title,
    ownerId,
    ownerName,
    status = "pending"
  ) => {
    console.log("🔔 Attempting to save contributor notification...", {
      assetId,
      title,
      ownerId,
    });

    try {
      const docRef = await addDoc(collection(db, "ContributorNotifications"), {
        assetId,
        title,
        ownerId,
        ownerName,
        status,
        message: `Your asset "${title}" uploaded by ${ownerName} is currently ${status}.`,
        read: false,
        createdAt: serverTimestamp(),
      });
      console.log("✅ Contributor notification saved with ID:", docRef.id);
    } catch (error) {
      console.error("❌ Error saving contributor notification:", error);
    }
  };

  // ✅ ADDED: Function to create admin notification for asset approval request
  const createAdminAssetNotification = async (
    assetId,
    assetTitle,
    contributorName,
    contributorId
  ) => {
    console.log(
      "🔔 Creating admin notification for asset approval request...",
      {
        assetId,
        assetTitle,
        contributorName,
        contributorId,
      }
    );

    try {
      const notificationData = {
        type: "asset_approval_request",
        message: `New asset "${assetTitle}" uploaded by ${contributorName} requires approval`,
        assetId: assetId,
        contributorId: contributorId,
        contributorName: contributorName,
        assetTitle: assetTitle,
        read: false,
        timestamp: serverTimestamp(),
        status: "pending",
      };

      const docRef = await addDoc(
        collection(db, "AdminNotifications"),
        notificationData
      );
      console.log(
        "✅ Admin notification created for asset approval:",
        docRef.id
      );
      return docRef.id;
    } catch (error) {
      console.error("❌ Error creating admin notification for asset:", error);
      return null;
    }
  };

  // ✅ ADDED: Function to check if user is contributor
  const isContributor = async (uid) => {
    if (!uid) return false;
    try {
      const docSnap = await getDoc(doc(db, "Contributors", uid));
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking contributor:", error);
      return false;
    }
  };

  // ✅ MAIN SUBMIT FUNCTION - UPDATED WITH getUserProfileData
 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.type) {
      alert("Title and Asset Type are required!");
      return;
    }

    if (userRole !== "admin" && specialization) {
      const allowed = specializationToAssetTypes[specialization] || [];
      if (!allowed.includes(formData.type)) {
        alert(`You can only upload ${specialization} assets.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const userProfile = await getUserProfileData();
      const userName = userProfile?.displayName || userProfile?.name || currentUser?.displayName || "Unknown";

      const isContrib = await isContributor(currentUser.uid);
      const status = isContrib ? "pending" : "approved";

      let docData = {
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description?.trim() || "",
        type: formData.type,
        price: formData.price,
        tags,
        category:
          formData.type === "models"
            ? formData.objectType || ""
            : formData.category || "",
        interest: formData.interest || "",
        // Keep filter metadata on the asset so public listing filters can
        // match the values selected during upload.
        aiGenerated: formData.aiGenerated || "",
        resolution: formData.resolution || "",
        frameRate: formData.frameRate || "",
        properties: formData.properties || [],
        applicationsSupported: formData.applicationsSupported || [],
        orientation: formData.orientation || "",
        licenseType: formData.licenseType || "",
        surfaceMaterial: formData.surfaceMaterial || "",
        style: formData.style || "",
        environmentType: formData.environmentType || "",
        lightingCondition: formData.lightingCondition || "",
        scriptType: formData.scriptType || "",
        programmingLanguage: formData.programmingLanguage || "",
        framework: formData.framework || "",
        integrationReady: formData.integrationReady || [],
        colorSpace: formData.colorSpace || "",
        objectType: formData.objectType || "",
        fileFormat: formData.fileFormat || "",
        ...(formData.type?.toLowerCase() === "prompts"
          ? { previewUrl: formData.previewUrl.trim() }
          : {}),
        userId: currentUser.uid,
        ownerId: currentUser.uid,
        authorName: userName,
        status,
        createdAt: editMode ? assetToEdit?.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Upload Thumbnail
      if (formData.thumbnail instanceof File) {
        docData.thumbnail = await uploadThumbnail(formData.thumbnail);
      } else if (editMode && assetToEdit?.thumbnail) {
        docData.thumbnail = assetToEdit.thumbnail;
      }

      // 2. Upload the dedicated GLB preview file separately from the original
      // download file. The public 3D viewer uses thumbnailModel, while model
      // remains the original file offered for download.
      if (formData.previewModel instanceof File) {
        const previewUpload = await uploadFile(
          formData.previewModel,
          "model-previews",
          currentUser.uid
        );
        docData.thumbnailModel = previewUpload?.url;
      } else if (editMode && deletedStoredFiles.preview) {
        docData.thumbnailModel = deleteField();
      } else if (editMode && assetToEdit?.thumbnailModel) {
        docData.thumbnailModel = assetToEdit.thumbnailModel;
      }

      // 3. Upload Main Asset File(s)
      const uploadResult = await uploadMainAsset(formData.type, formData, currentUser.uid);
      if (uploadResult) {
        Object.assign(docData, uploadResult.docFields);
        docData.downloadUrl = uploadResult.downloadUrl;
        docData.fileName = uploadResult.fileName;
      } else if (editMode && deletedStoredFiles.model) {
        docData.model = deleteField();
        docData.downloadUrl = deleteField();
        docData.fileName = deleteField();
      }

      console.log("Final document to save:", docData);

      if (editMode && assetToEdit?.id) {
        await updateDoc(doc(db, "Assets", assetToEdit.id), docData);
      } else {
        const newAssetRef = await addDoc(collection(db, "Assets"), docData);

        if (isContrib) {
          await createAdminAssetNotification(newAssetRef.id, formData.title, userName, currentUser.uid);
          await saveContributorNotification(newAssetRef.id, formData.title, currentUser.uid, userName, "pending");
        }
      }

      alert("Asset uploaded successfully!");
      onUploadSuccess?.();
    } catch (err) {
      console.error("UPLOAD FAILED:", err);
      alert("Failed to upload: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Centralized main asset upload logic
  const uploadMainAsset = async (type, formData, uid) => {
    const config = {
      images: { field: "images", multiple: true, folder: "images" },
      icons: { field: "icons", multiple: true, folder: "icons" },
      textures: { field: "textures", multiple: true, folder: "textures" },
      videos: { field: "video", multiple: false, folder: "videos" },
      models: { field: "model", multiple: false, folder: "models" },
      scripts: { field: "script", multiple: false, folder: "scripts" },
      hdris: { field: "hdri", multiple: false, folder: "hdris" },
      graphics: { field: "graphicsTemplate", multiple: false, folder: "graphics" },
      mockups: { field: "mockupFile", multiple: false, folder: "mockups" },
      fonts: { field: "fontFile", multiple: false, folder: "fonts" },
      "video-templates": { field: "videoTemplateFile", multiple: false, folder: "video-templates" },
      prompts: { field: "promptFile", multiple: false, folder: "prompts" },
      other: { field: "other", multiple: false, folder: "other" },
    }[type];

    if (!config) return null;

    const { field, multiple, folder } = config;

    if (multiple) {
      const files = formData[field] || [];
      if (!files.length) return null;

      const uploaded = await uploadImages(files, folder, uid); // Keep your existing uploadImages
      if (!uploaded?.length) return null;

      return {
        docFields: { [field]: uploaded },
        downloadUrl: uploaded[0]?.url || uploaded[0]?.primary?.url,
        fileName: uploaded[0]?.originalName
      };
    } else {
      const file = formData[field];
      if (!(file instanceof File)) return null;

      const uploaded = await uploadFile(file, folder, uid);
      if (!uploaded) return null;

      return {
        docFields: { [field]: uploaded },
        downloadUrl: uploaded.url,
        fileName: uploaded.fileName || file.name
      };
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

  // Update your modal title based on mode
  const modalTitle = editMode ? "Edit Asset" : "Upload New Asset";
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
          .current-file-note {
            display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.9rem;
            text-align: left; margin-top: 0.5rem; padding: 0.65rem 0.75rem;
            color: #065f46; background: #ecfdf5; border-left: 4px solid #10b981;
            border-radius: 0.5rem; font-size: 0.875rem;
          }
          .current-file-note span { flex: 1 1 100%; overflow-wrap: anywhere; font-weight: 600; }
          .current-file-note small { color: #047857; font-style: italic; }
          .delete-current-file-button {
            border: 1px solid #dc2626; border-radius: 0.4rem; padding: 0.35rem 0.65rem;
            color: #b91c1c; background: #fff; font-weight: 600; cursor: pointer;
          }
          .delete-current-file-button:hover { color: #fff; background: #dc2626; }
          .deleted-file-note {
            margin-top: 0.5rem; padding: 0.65rem 0.75rem; color: #991b1b;
            background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0.5rem;
            text-align: left; font-size: 0.875rem;
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
                  Asset Type <span className="blog-form-required">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="blog-form-select"
                  disabled={editMode && userRole !== "admin"}
                >
                  <option value="" disabled>
                    Select Asset Type
                  </option>
                  {userRole === "admin" ? (
                    <>
                      <option value="models">3D Model</option>
                      <option value="textures">Texture</option>
                      <option value="scripts">Script</option>
                      <option value="images">Image</option>
                      <option value="graphics">Graphics Templates</option>
                      <option value="mockups">Mockups</option>
                      <option value="fonts">Fonts</option>
                      <option value="videos">Videos</option>
                      <option value="video-templates">Video Templates</option>
                      <option value="icons">Icons</option>
                      <option value="hdris">HDRIs</option>
                      <option value="prompts">Prompts</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    (() => {
                      const allowedTypes =
                        specializationToAssetTypes[specialization] || [];
                      const typeLabels = {
                        models: "3D Model",
                        textures: "Texture",
                        scripts: "Script",
                        images: "Image",
                        graphics: "Graphics Templates",
                        mockups: "Mockups",
                        fonts: "Fonts",
                        videos: "Videos",
                        "video-templates": "Video Templates",
                        icons: "Icons",
                        hdris: "HDRIs",
                        prompts: "Prompts",
                      };

                      if (allowedTypes.length === 0) {
                        return (
                          <option value="" disabled>
                            No asset types available for your specialization
                          </option>
                        );
                      }

                      const isCurrentTypeAllowed = allowedTypes.includes(
                        formData.type
                      );

                      return (
                        <>
                          {!isCurrentTypeAllowed && formData.type && (
                            <option value={formData.type} disabled>
                              {formData.type} (Not allowed for your
                              specialization)
                            </option>
                          )}
                          {allowedTypes.map((type) => (
                            <option key={type} value={type}>
                              {typeLabels[type] || type}
                            </option>
                          ))}
                        </>
                      );
                    })()
                  )}
                </select>
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">
                  Title <span className="blog-form-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  maxLength={100}
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="blog-form-input"
                  placeholder="Enter asset title..."
                />
                <div className="blog-form-hint">
                  <span
                    className={formData.title.length > 100 ? "char-over" : ""}
                  >
                    {formData.title.length}
                  </span>
                  /100 characters
                </div>
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
              </div>

              {formData.type !== "models" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Thumbnail <span className="blog-form-required">*</span>
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleThumbnailChange}
                    accept="image/*, video/*"
                    required={!editMode}
                    className="blog-form-file"
                  />
                  <p className="blog-form-hint">
                    .MP4, .MOV • Max 2MB after auto-compression • 705x472px recommended
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
              )}

              <div className="blog-form-group">
                <label className="blog-form-label">
                  Description <span className="blog-form-required">*</span>
                </label>
                <textarea
                  name="description"
                  maxLength={500}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="blog-form-textarea"
                  placeholder="Describe your asset..."
                  rows="4"
                />
                <div className="blog-form-hint">
                  <span
                    className={
                      formData.description.length > 500 ? "char-over" : ""
                    }
                  >
                    {formData.description.length}
                  </span>
                  /500 characters
                </div>
              </div>

              {formData.type !== "models" && (
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
              )}

              {formData.type === "prompts" && (
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Interests <span className="blog-form-required">*</span>
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                    className="blog-form-select"
                  >
                    <option value="" disabled>
                      Select Interest
                    </option>
                    {getFilterOptions("interests").map((interest) => (
                      <option key={interest} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  {/* <option value="paid">Paid</option> */}
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
                    onPaste={handleTagPaste}
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
                  <div className="blog-form-group">
                    <label className="blog-form-label">
                      3D Preview File <span className="blog-form-required">*</span>
                    </label>
                    <input
                      type="file"
                      name="previewModel"
                      onChange={handleChange}
                      accept=".glb,model/gltf-binary"
                      required={!editMode && !assetToEdit?.thumbnailModel}
                      className="blog-form-file"
                    />
                    <p className="blog-form-hint">
                      Supported format: .glb only • Source max 200MB • Textures/materials optimized to max 100MB • Mesh unchanged
                    </p>
                    {editMode && assetToEdit?.thumbnailModel && !deletedStoredFiles.preview && (
                      <div className="current-file-note">
                        <span>
                          Current preview: {getStoredFileName(assetToEdit.thumbnailModel)}
                        </span>
                        <button
                          type="button"
                          className="delete-current-file-button"
                          onClick={() => handleDeleteStoredFile("preview")}
                        >
                          Delete current preview
                        </button>
                        <small>It will be kept if no new file is selected.</small>
                      </div>
                    )}
                    {deletedStoredFiles.preview && (
                      <p className="deleted-file-note">Current preview deleted from Firebase. Select a new .glb file before saving if a preview is required.</p>
                    )}
                  </div>

                  <div className="blog-form-group">
                    <label className="blog-form-label">
                      3D Model File <span className="blog-form-required">*</span>
                    </label>
                    <input
                      type="file"
                      name="model"
                      onChange={handleChange}
                      accept=".glb,.gltf,.stl,.obj,.fbx,.blend,.zip"
                      required={!editMode}
                      className="blog-form-file"
                    />
                    <p className="blog-form-hint">
                      Supported formats: .glb, .gltf, .stl, .obj, .fbx, .blend,
                      .zip • Max 200MB • Used for download
                    </p>
                    {renderFilePreview("model", "3D Model")}
                    {editMode && getStoredFileUrl(assetToEdit.model || assetToEdit.downloadUrl) && !deletedStoredFiles.model && (
                      <div className="current-file-note">
                        <span>
                          Current model: {getStoredFileName(assetToEdit.model || assetToEdit.downloadUrl)}
                        </span>
                        <button
                          type="button"
                          className="delete-current-file-button"
                          onClick={() => handleDeleteStoredFile("model")}
                        >
                          Delete current model
                        </button>
                        <small>It will be kept if no new file is selected.</small>
                      </div>
                    )}
                    {deletedStoredFiles.model && (
                      <p className="deleted-file-note">Current model deleted from Firebase. Select a new model file before saving if a download file is required.</p>
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
                    Supported video formats .MOV, .MP4 & .ZIP
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

              {formData.type?.toLowerCase() === "prompts" && (
                <>
                <div className="blog-form-group">
                  <label className="blog-form-label" htmlFor="prompt-preview-url">
                    Preview Button URL
                  </label>
                  <input
                    id="prompt-preview-url"
                    type="url"
                    name="previewUrl"
                    value={formData.previewUrl}
                    onChange={handleChange}
                    className="blog-form-input"
                    placeholder="https://example.com/preview"
                  />
                  <p className="blog-form-hint">
                    Add a link for the Preview button on the asset page.
                  </p>
                </div>
                <div className="blog-form-group">
                  <label className="blog-form-label">
                    Prompt File{" "}
                    {!editMode && <span className="blog-form-required">*</span>}
                  </label>
                  <input
                    type="file"
                    name="promptFile"
                    onChange={handleChange}
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="blog-form-file"
                    required={!editMode}
                  />
                  <p className="blog-form-hint">
                    Supported formats: PDF, DOCX, TXT • Max 10MB
                  </p>
                  {editMode && assetToEdit.promptFile && (
                    <p className="current-image-note">
                      Current prompt file will be kept if no new file is selected
                    </p>
                  )}
                </div>
                </>
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
                <button
                  type="button"
                  onClick={handleUploadClose}
                  className="cancel-button"
                  disabled={isSubmitting || isUpdating}
                >
                  Cancel
                </button>
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
