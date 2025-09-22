import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../../firebase";
import PageTitle from "../Components/UI/PageTitle";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../Context/UserProvider";
import { Helmet } from "react-helmet-async";
import plus_icon from "../assets/Icons/plus.png";
import DescriptionBox from "../Components/DescriptionBox";

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

const Upload = () => {
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
      if (name === "images" || name === "icons") {
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
    } catch (error) {
      console.error("Error adding document: ", error);
      setLoadingState("Error uploading asset");
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
      <div className="select-wrapper">
        <label htmlFor={`${name}_select`}>{label}</label>
        <select
          name={name}
          id={`${name}_select`}
          className="filter-select"
          onChange={handleChange}
          multiple={isMulti}
          value={isMulti ? formData[name] : formData[name] || ""}
          required={!isMulti} // Multi-select fields are optional
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
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Upload | Shammarianas</title>
        <meta name="description" content="Upload your assets to Shammarianas" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Upload | Shammarianas" />
        <meta property="og:description" content="Upload your assets to Shammarianas" />
      </Helmet>

      <style>
        {`
          .select-wrapper {
            margin-bottom: 1rem;
          }
          .select-wrapper label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
          }
          .filter-select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
            background-color: #fff;
            color: #333;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            cursor: pointer;
          }
          .filter-select[multiple] {
            height: 100px;
            padding: 0.5rem;
          }
          .filter-select:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0,123,255,0.3);
          }
          .filter-select option {
            padding: 0.5rem;
          }
        `}
      </style>

      {currentUser ? (
        <div className="page_content">
          <div className="upload_section">
            {loadingState && (
              <div className="uploading_overlay">
                <div className={`spinner ${loadingState === "success" ? "success" : ""}`}>{loadingState === "success" && <i className="icon fas fa-check"></i>}</div>
                <span>{loadingState}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <PageTitle title="Upload Asset">Upload</PageTitle>

              <div className="content">
                <div className="left">
                  <label htmlFor="thumbnail_input">Thumbnail</label>
                  <input type="file" required name="thumbnail" id="thumbnail_input" accept="image/*" onChange={handleChange} />
                  <label htmlFor="thumbnail_input" className="thumbnail_input_label">
                    {formData.thumbnail ? (
                      <div className="thumbnail_preview">
                        <img className="image" src={URL.createObjectURL(formData.thumbnail)} alt="thumbnail" />
                        <span className="file_name">{formData.thumbnail.name}</span>
                      </div>
                    ) : (
                      <>
                        <img className="upload_icon" src={plus_icon} alt="Add Thumbnail" />
                        <span className="placeholder">Choose Thumbnail</span>
                      </>
                    )}
                  </label>

                  <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
                </div>

                <div className="right">
                  <DescriptionBox name="description" value={formData.description} onChange={handleChange} />
                  <div className="select-wrapper">
                    <label htmlFor="type_select">Asset Type</label>
                    <select name="type" id="type_select" className="filter-select" onChange={handleChange} required>
                      <option value="" disabled selected>
                        Select Asset Type
                      </option>
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
                  <div className="select-wrapper">
                    <label htmlFor="category_select">Category</label>
                    <select name="category" id="category_select" className="filter-select" onChange={handleChange} required value={formData.category}>
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
                  {renderFilterSelect("aiGenerated", "AI-Generated", "aiGenerated")}
                  {renderFilterSelect("resolution", "Resolution", "resolution")}
                  {renderFilterSelect("frameRate", "Frame Rate", "frameRate")}
                  {renderFilterSelect("properties", "Properties", "properties")}
                  {renderFilterSelect("applicationsSupported", "Applications Supported", "applicationsSupported")}
                  {renderFilterSelect("orientation", "Orientation", "orientation")}
                  {renderFilterSelect("licenseType", "License Type", "licenseType")}
                  {renderFilterSelect("surfaceMaterial", "Surface Material", "surfaceMaterial")}
                  {renderFilterSelect("style", "Style", "style")}
                  {renderFilterSelect("environmentType", "Environment Type", "environmentType")}
                  {renderFilterSelect("lightingCondition", "Lighting Condition", "lightingCondition")}
                  {renderFilterSelect("scriptType", "Script Type", "scriptType")}
                  {renderFilterSelect("programmingLanguage", "Programming Language", "programmingLanguage")}
                  {renderFilterSelect("framework", "Framework", "framework")}
                  {renderFilterSelect("integrationReady", "Integration Ready", "integrationReady")}
                  {renderFilterSelect("colorSpace", "Color Space", "colorSpace")}
                  {renderFilterSelect("objectType", "Object Type", "objectType")}
                  {renderFilterSelect("fileFormat", "File Format", "fileFormat")}
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" maxLength={3} max={999} required />
                  {formData.price && formData.price > 0 && <input name="discount" value={formData.discount} onChange={handleChange} placeholder="Discount" type="number" required />}
                  <div className="tags_input">
                    {tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                    <input name="tags" value={formData.tags} onChange={handleTagInputChange} placeholder="Tags (space-separated)" required />
                  </div>
                  {formData.type === "models" && (
                    <>
                      <label>Is 3D</label>
                      <label>
                        <input name="is3d" type="checkbox" checked={true} disabled />
                        Is 3D
                      </label>
                      <label htmlFor="model_input">Model File</label>
                      <input name="model" id="model_input" type="file" accept=".glb,.gltf,.stl,.obj,.fbx,.blend" onChange={handleChange} required />
                      <label htmlFor="model_input" className="custom-file-input">
                        {formData.model ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.model.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Model" />
                            <span className="placeholder">Choose Model File</span>
                          </>
                        )}
                      </label>
                      <input name="vertices" type="number" placeholder="Vertices" onChange={handleChange} required />
                      <input name="physicalSize" type="text" placeholder="Physical Size" onChange={handleChange} required />
                      <input name="lods" type="number" placeholder="LODs" onChange={handleChange} required />
                      <div className="checkboxes">
                        {["textures", "materials", "rigged", "animated", "uvMapping", "vrArLowPoly"].map((prop) => (
                          <label key={prop}>
                            <input type="checkbox" name={prop} checked={formData[prop]} onChange={handleChange} />
                            {prop
                              .split(/(?=[A-Z])/)
                              .join(" ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {formData.type === "textures" && (
                    <>
                      {["ambientOcclusion", "baseColor", "displacement", "normal", "roughness", "metallic", "bump", "idmap"].map((map) => (
                        <div key={map}>
                          <label htmlFor={`${map}_input`}>
                            {map
                              .split(/(?=[A-Z])/)
                              .join(" ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </label>
                          <input type="file" name={map} id={`${map}_input`} accept=".png,.jpg,.jpeg" onChange={handleChange} />
                          <label htmlFor={`${map}_input`} className="custom-file-input">
                            {formData[map] ? (
                              <div className="file_preview">
                                <img className="image" src={URL.createObjectURL(formData[map])} alt={map} />
                                <span className="file_name">{formData[map].name}</span>
                              </div>
                            ) : (
                              <>
                                <img className="upload_icon" src={plus_icon} alt={`Add ${map}`} />
                                <span className="placeholder">
                                  Choose{" "}
                                  {map
                                    .split(/(?=[A-Z])/)
                                    .join(" ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                                  File
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                  {formData.type === "sounds" && (
                    <>
                      <label htmlFor="sound_input">Sound File</label>
                      <input name="sound" id="sound_input" type="file" accept="audio/*" onChange={handleChange} required />
                      <label htmlFor="sound_input" className="custom-file-input">
                        {formData.sound ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.sound.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Sound" />
                            <span className="placeholder">Choose Sound File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "scripts" && (
                    <>
                      <label htmlFor="script_input">Script File</label>
                      <input name="script" id="script_input" type="file" accept=".js,.cs,.py,.lua,.cpp" onChange={handleChange} required />
                      <label htmlFor="script_input" className="custom-file-input">
                        {formData.script ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.script.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Script" />
                            <span className="placeholder">Choose Script File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "images" && (
                    <>
                      <label htmlFor="images_input">Images</label>
                      <input name="images" id="images_input" type="file" accept="image/*" multiple onChange={handleChange} required />
                      <label htmlFor="images_input" className="custom-file-input">
                        {formData.images && formData.images.length > 0 ? (
                          <div className="file_preview">
                            {Array.from(formData.images).map((image) => (
                              <div key={image.name} className="image-preview">
                                <img src={URL.createObjectURL(image)} alt={image.name} width="50" height="50" />
                                <span className="file_name">{image.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Images" />
                            <span className="placeholder">Choose Image Files</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "graphics" && (
                    <>
                      <label htmlFor="graphicsTemplate_input">Graphics Template File</label>
                      <input name="graphicsTemplate" id="graphicsTemplate_input" type="file" accept=".psd,.ai,.svg,.png,.jpg" onChange={handleChange} required />
                      <label htmlFor="graphicsTemplate_input" className="custom-file-input">
                        {formData.graphicsTemplate ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.graphicsTemplate.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Graphics Template" />
                            <span className="placeholder">Choose Graphics Template File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "mockups" && (
                    <>
                      <label htmlFor="mockupFile_input">Mockup File</label>
                      <input name="mockupFile" id="mockupFile_input" type="file" accept=".psd,.png,.jpg,.jpeg" onChange={handleChange} required />
                      <label htmlFor="mockupFile_input" className="custom-file-input">
                        {formData.mockupFile ? (
                          <div className="file_preview">
                            <img className="image" src={URL.createObjectURL(formData.mockupFile)} alt="mockup" />
                            <span className="file_name">{formData.mockupFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Mockup" />
                            <span className="placeholder">Choose Mockup File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "fonts" && (
                    <>
                      <label htmlFor="fontFile_input">Font File</label>
                      <input name="fontFile" id="fontFile_input" type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleChange} required />
                      <label htmlFor="fontFile_input" className="custom-file-input">
                        {formData.fontFile ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.fontFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Font" />
                            <span className="placeholder">Choose Font File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "video-templates" && (
                    <>
                      <label htmlFor="videoTemplateFile_input">Video Template File</label>
                      <input name="videoTemplateFile" id="videoTemplateFile_input" type="file" accept=".prproj,.aep,.mp4,.mov" onChange={handleChange} required />
                      <label htmlFor="videoTemplateFile_input" className="custom-file-input">
                        {formData.videoTemplateFile ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.videoTemplateFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Video Template" />
                            <span className="placeholder">Choose Video Template File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "videos" && (
                    <>
                      <label htmlFor="video_input">Video File</label>
                      <input name="video" id="video_input" type="file" accept="video/*" onChange={handleChange} required />
                      <label htmlFor="video_input" className="custom-file-input">
                        {formData.video ? (
                          <div className="file_preview">
                            <video controls width="300">
                              <source src={URL.createObjectURL(formData.video)} type={formData.video.type} />
                              Your browser does not support the video tag.
                            </video>
                            <span className="file_name">{formData.video.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Video" />
                            <span className="placeholder">Choose Video File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "icons" && (
                    <>
                      <label htmlFor="icons_input">Icons</label>
                      <input name="icons" id="icons_input" type="file" accept="image/*" multiple onChange={handleChange} required />
                      <label htmlFor="icons_input" className="custom-file-input">
                        {formData.icons && formData.icons.length > 0 ? (
                          <div className="file_preview">
                            {Array.from(formData.icons).map((icon) => (
                              <div key={icon.name} className="icon-preview">
                                <img src={URL.createObjectURL(icon)} alt={icon.name} width="50" height="50" />
                                <span className="file_name">{icon.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Icons" />
                            <span className="placeholder">Choose Icon Files</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "hdris" && (
                    <>
                      <label htmlFor="hdri_input">HDRI File</label>
                      <input name="hdri" id="hdri_input" type="file" accept=".hdr,.exr" onChange={handleChange} required />
                      <label htmlFor="hdri_input" className="custom-file-input">
                        {formData.hdri ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.hdri.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add HDRI" />
                            <span className="placeholder">Choose HDRI File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                  {formData.type === "other" && (
                    <>
                      <label htmlFor="other_input">Other File</label>
                      <input name="other" id="other_input" type="file" onChange={handleChange} required />
                      <label htmlFor="other_input" className="custom-file-input">
                        {formData.other ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.other.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Other" />
                            <span className="placeholder">Choose Other File</span>
                          </>
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>
              <button type="submit">Upload</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="page_content">
          <div className="not_logged_in">
            <h2>Log in to upload assets</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Upload;
