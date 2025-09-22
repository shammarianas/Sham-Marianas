import React, { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useFilters } from "../Context/FilterContext";
import checkmark from "../assets/Icons/check_mark.png";

// Define filterData
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

// Map route paths to filterData keys
const categoryMapping = {
  Videos: "Videos",
  templates: "VideoTemplates",
  images: "Pictures",
  graphics: "GraphicTemplates",
  Mockups: "Mockups",
  Fonts: "Fonts",
  Models: "3DModels",
  Icons: "Icons",
  Textures: "Textures",
  HDRIs: "HDRIs",
  Scripts: "Scripts",
  hot: "Hot", // No filters for "Hot"
};

const ListingSidebar = () => {
  const { Category } = useParams();
  const normalizedCategory = Category ? categoryMapping[Category] || Category.charAt(0).toUpperCase() + Category.slice(1) : "Videos";
  const categoryFilters = normalizedCategory !== "Hot" ? filterData[normalizedCategory] || {} : {};

  const defaultPrice = 1000;
  const [price, setPrice] = React.useState(defaultPrice);
  const { filters, updateFilters } = useFilters();

  const updatePriceFilter = useCallback(() => {
    updateFilters("price", price);
  }, [price, updateFilters]);

  useEffect(() => {
    updatePriceFilter();
  }, [price, updatePriceFilter]);

  const handleFilterChange = (filterKey, value, isChecked) => {
    const currentFilterValues = filters[filterKey] || [];
    const newFilterValues = isChecked ? [...currentFilterValues, value] : currentFilterValues.filter((v) => v !== value);
    updateFilters(filterKey, newFilterValues);
  };

  const clearFilters = () => {
    Object.keys(categoryFilters).forEach((filterKey) => {
      updateFilters(filterKey, []);
    });
    updateFilters("price", defaultPrice);
    setPrice(defaultPrice);
  };

  return (
    <div className="listing_sidebar">
      <form>
        <div className="title">
          <h3>Filter by</h3>
          <button type="reset" className="clr_btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        {Object.entries(categoryFilters).map(([filterKey, filter]) => (
          <div className="filter_section" key={filterKey}>
            <div className="section_title">
              <h4>{filter.label}</h4>
            </div>
            <div className="filter_options">
              <ul>
                {filter.options.map((option) => (
                  <li key={option}>
                    <label className={filters[filterKey]?.includes(option) ? "active" : ""}>
                      <input type="checkbox" value={option} checked={filters[filterKey]?.includes(option) || false} onChange={(event) => handleFilterChange(filterKey, option, event.target.checked)} />
                      {option}
                      {filters[filterKey]?.includes(option) && <img className="checkmark" src={checkmark} alt="" />}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className="filter_section">
          <div className="section_title">
            <h4>Price</h4>
          </div>
          <div className="filter_options">
            <div className="range">
              <input className="price_range" type="range" min={0} max={1000} value={price} onChange={(e) => setPrice(e.target.value)} />
              <div className="range_values">
                <span className="value">Free</span>
                <span className="value">${price > 999 ? "999+" : price}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ListingSidebar;
