// src/utils/assetDataHelper.js

/**
 * Extracts complete asset data from any asset object format
 * This ensures consistent data structure for license generation
 */
export const getCompleteAssetData = (asset) => {
  // If asset is already in correct format, return as is
  if (asset && asset.id && asset.title && asset.licenseType) {
    return asset;
  }

  // Extract data from various possible field names
  const data = {
    // ID - highest priority
    id: asset?.id || asset?.assetId || asset?.documentId || 'N/A',
    
    // Title/Name - check all possible fields
    title: asset?.title || asset?.name || asset?.assetName || 'Unknown Asset',
    
    // Author/Creator - check all possible fields
    authorName: asset?.authorName || asset?.author || asset?.createdBy || 
               asset?.publisher || asset?.userDisplayName || asset?.uploadedBy || 
               asset?.displayName || 'Unknown Author',
    
    // Price - convert to number if needed
    price: typeof asset?.price === 'string' && asset.price.toLowerCase() === 'free' 
           ? 0 
           : Number(asset?.price) || 0,
    
    // Discount
    discount: Number(asset?.discount) || 0,
    
    // License Type - with intelligent detection
    licenseType: detectLicenseTypeFromAsset(asset),
    
    // Dates
    downloadDate: asset?.downloadDate || asset?.createdAt || asset?.lastDownloadedAt || new Date().toISOString(),
    createdAt: asset?.createdAt || asset?.uploadedAt || new Date().toISOString(),
    
    // Type/Category
    type: asset?.type || asset?.category || 'Digital Asset',
    
    // Description
    description: asset?.description || asset?.desc || '',
    
    // Additional fields for PDF
    author: asset?.author || asset?.authorName,
    createdBy: asset?.createdBy,
    publisher: asset?.publisher,
    userDisplayName: asset?.userDisplayName,
    displayName: asset?.displayName,
    
    // Legacy fields for compatibility
    ...asset
  };

  console.log('Extracted asset data:', {
    id: data.id,
    title: data.title,
    authorName: data.authorName,
    licenseType: data.licenseType,
    price: data.price
  });

  return data;
};

/**
 * Detects license type from asset data
 */
const detectLicenseTypeFromAsset = (asset) => {
  // 1. First check if licenseType is explicitly set
  if (asset?.licenseType && asset.licenseType !== 'default') {
    return asset.licenseType;
  }
  
  // 2. Check if asset has price info
  const price = typeof asset?.price === 'string' && asset.price.toLowerCase() === 'free' 
                ? 0 
                : Number(asset?.price) || 0;
  const discount = Number(asset?.discount ?? 0) || 0;
  const finalPrice = Math.max(0, price - (price * discount) / 100);
  
  // 3. Return based on price
  if (finalPrice === 0) {
    return 'Free for Personal Use';
  } else if (finalPrice > 0 && finalPrice < 50) {
    return 'Free for Commercial Use';
  } else if (finalPrice >= 50) {
    return 'Extended License';
  }
  
  // 4. Default fallback
  return 'Free for Personal Use';
};

/**
 * Formats price for display
 */
export const formatAssetPrice = (asset) => {
  const price = typeof asset?.price === 'string' && asset.price.toLowerCase() === 'free' 
                ? 0 
                : Number(asset?.price) || 0;
  const discount = Number(asset?.discount ?? 0) || 0;
  const finalPrice = Math.max(0, price - (price * discount) / 100);
  
  return finalPrice === 0 ? 'Free' : `$${finalPrice.toFixed(2)}`;
};

/**
 * Extracts author name from asset
 */
export const getAssetAuthor = (asset) => {
  return asset?.authorName || asset?.author || asset?.createdBy || 
         asset?.publisher || asset?.userDisplayName || asset?.uploadedBy || 
         asset?.displayName || 'Unknown Author';
};

/**
 * Formats date for display
 */
export const formatAssetDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};