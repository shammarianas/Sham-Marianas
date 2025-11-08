import React from "react";

const InfoItem = (props) => {
  const displayValue =
    typeof props.value === "boolean"
      ? props.value
        ? "Yes"
        : "No"
      : props.value || "Not specified";

  return (
    <div className="info_item">
      <span className="label">{props.label}</span>
      <span className="value">{displayValue}</span>
    </div>
  );
};

const ItemInfoTable = (props) => {
  // Agar direct details array pass hua hai toh wahi use karo
  if (props.details && Array.isArray(props.details)) {
    return (
      <div className="item_info_table">
        {props.details.map((item, index) => (
          <InfoItem key={index} label={item.label} value={item.value} />
        ))}
      </div>
    );
  }

  // Agar asset object pass hua hai toh automatically generate karo
  if (props.asset) {
    const asset = props.asset;
    
    // Common attributes for all asset types
    const commonAttributes = [
      { label: "Asset Type", value: asset.type },
      { label: "Category", value: asset.category },
      { label: "Price Type", value: asset.price === "free" ? "Free" : "Paid" },
      { label: "License Type", value: asset.licenseType },
      { label: "AI Generated", value: asset.aiGenerated },
    ];

    // Type-specific attributes - ALL FILTERS FROM UPLOAD FORM
    const typeSpecificAttributes = [];
    
    // 3D Models
    if (asset.type === "models" || asset.type === "3DModels") {
      typeSpecificAttributes.push(
        { label: "Object Type", value: asset.objectType },
        { label: "File Format", value: asset.fileFormat },
        { label: "Resolution", value: asset.resolution },
        { label: "Vertices", value: asset.vertices },
        { label: "Physical Size", value: asset.physicalSize },
        { label: "Rigged", value: asset.rigged },
        { label: "Animated", value: asset.animated },
        { label: "Properties", value: Array.isArray(asset.properties) ? asset.properties.join(", ") : asset.properties }
      );
    }
    
    // Videos
    else if (asset.type === "videos") {
      typeSpecificAttributes.push(
        { label: "Resolution", value: asset.resolution },
        { label: "Frame Rate", value: asset.frameRate },
        { label: "Properties", value: Array.isArray(asset.properties) ? asset.properties.join(", ") : asset.properties },
        { label: "AI Generated", value: asset.aiGenerated }
      );
    }
    
    // Images/Pictures
    else if (asset.type === "images" || asset.type === "Pictures") {
      typeSpecificAttributes.push(
        { label: "Orientation", value: asset.orientation },
        { label: "Resolution", value: asset.resolution },
        { label: "AI Generated", value: asset.aiGenerated },
        { label: "License Type", value: asset.licenseType }
      );
    }
    
    // Scripts
    else if (asset.type === "scripts") {
      typeSpecificAttributes.push(
        { label: "Script Type", value: asset.scriptType },
        { label: "Programming Language", value: asset.programmingLanguage },
        { label: "Framework", value: asset.framework },
        { label: "License Type", value: asset.licenseType },
        { label: "Integration Ready", value: Array.isArray(asset.integrationReady) ? asset.integrationReady.join(", ") : asset.integrationReady }
      );
    }
    
    // Graphics Templates
    else if (asset.type === "graphics" || asset.type === "GraphicTemplates") {
      typeSpecificAttributes.push(
        { label: "Color Space", value: asset.colorSpace },
        { label: "Orientation", value: asset.orientation },
        { label: "Applications Supported", value: Array.isArray(asset.applicationsSupported) ? asset.applicationsSupported.join(", ") : asset.applicationsSupported },
        { label: "Properties", value: Array.isArray(asset.properties) ? asset.properties.join(", ") : asset.properties }
      );
    }
    
    // Textures
    else if (asset.type === "textures") {
      typeSpecificAttributes.push(
        { label: "Surface Material", value: asset.surfaceMaterial },
        { label: "Resolution", value: asset.resolution },
        { label: "Style", value: asset.style }
      );
    }
    
    // HDRIs
    else if (asset.type === "hdris" || asset.type === "HDRIs") {
      typeSpecificAttributes.push(
        { label: "Environment Type", value: asset.environmentType },
        { label: "Lighting Condition", value: asset.lightingCondition },
        { label: "Resolution", value: asset.resolution },
        { label: "File Format", value: asset.fileFormat }
      );
    }
    
    // Icons
    else if (asset.type === "icons") {
      typeSpecificAttributes.push(
        { label: "Icon Type", value: asset.category },
        { label: "Properties", value: Array.isArray(asset.properties) ? asset.properties.join(", ") : asset.properties }
      );
    }
    
    // Fonts
    else if (asset.type === "fonts") {
      typeSpecificAttributes.push(
        { label: "Properties", value: Array.isArray(asset.properties) ? asset.properties.join(", ") : asset.properties },
        { label: "License Type", value: asset.licenseType }
      );
    }
    
    // Mockups
    else if (asset.type === "mockups") {
      typeSpecificAttributes.push(
        { label: "File Format", value: asset.fileFormat },
        { label: "License Type", value: asset.licenseType }
      );
    }
    
    // Video Templates
    else if (asset.type === "video-templates" || asset.type === "VideoTemplates") {
      typeSpecificAttributes.push(
        { label: "Applications Supported", value: Array.isArray(asset.applicationsSupported) ? asset.applicationsSupported.join(", ") : asset.applicationsSupported },
        { label: "Resolution", value: asset.resolution }
      );
    }

    // Additional filters that might be present for any asset type
    const additionalFilters = [
      { label: "Applications Supported", value: Array.isArray(asset.applicationsSupported) ? asset.applicationsSupported.join(", ") : asset.applicationsSupported },
      { label: "Properties", value: Array.isArray(asset.properties) ? asset.properties.join(", ") : asset.properties },
      { label: "Orientation", value: asset.orientation },
      { label: "Surface Material", value: asset.surfaceMaterial },
      { label: "Style", value: asset.style },
      { label: "Environment Type", value: asset.environmentType },
      { label: "Lighting Condition", value: asset.lightingCondition },
      { label: "Script Type", value: asset.scriptType },
      { label: "Programming Language", value: asset.programmingLanguage },
      { label: "Framework", value: asset.framework },
      { label: "Integration Ready", value: Array.isArray(asset.integrationReady) ? asset.integrationReady.join(", ") : asset.integrationReady },
      { label: "Color Space", value: asset.colorSpace },
      { label: "Object Type", value: asset.objectType },
      { label: "File Format", value: asset.fileFormat },
      { label: "Frame Rate", value: asset.frameRate },
      { label: "Resolution", value: asset.resolution },
      { label: "AI Generated", value: asset.aiGenerated },
      { label: "License Type", value: asset.licenseType }
    ];

    // Combine all attributes
    const allAttributes = [
      ...commonAttributes, 
      ...typeSpecificAttributes, 
      ...additionalFilters
    ];

    // Filter out empty, duplicate, and "Not specified" values
    const uniqueAttributes = allAttributes.filter((item, index, self) => {
      // Remove empty values
      if (!item.value || item.value === "Not specified" || item.value === "") {
        return false;
      }
      // Remove duplicates based on label
      return index === self.findIndex(i => i.label === item.label);
    });

    return (
      <div className="item_info_table">
        {uniqueAttributes.map((item, index) => (
          <InfoItem key={index} label={item.label} value={item.value} />
        ))}
      </div>
    );
  }

  // Agar kuch bhi nahi mila toh empty return karo
  return (
    <div className="item_info_table">
      <div className="info_item">
        <span className="label">No information available</span>
        <span className="value">-</span>
      </div>
    </div>
  );
};

export default ItemInfoTable;