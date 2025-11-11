import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

const DownloadButton = ({
  item,
  userProfile,
  setToastMessage,
  setToastState,
  setShowToast,
}) => {
  const { isDownloaded, addToDownloads, error } = useSaveToDownloads(item.id, item);
  const navigate = useNavigate();

  // Check if item is free or paid
  const isFree = item.price === "free";
  const isPaid = item.price === "paid";

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscriptionActive === true;

  // Check if user has purchased this specific item
  const hasPurchasedItem = userProfile?.purchasedItems?.includes(item.id);

  const getAssetUrls = () => {
    const urls = [];
    
    console.log("📥 Downloading item data:", {
      id: item.id,
      type: item.type,
      title: item.title,
      availableFiles: Object.keys(item).filter(key => 
        typeof item[key] === 'string' && item[key].includes('http')
      )
    });

    switch ((item.type || '').toLowerCase()) {
      case 'models':
      case 'printables':
        if (item.model) {
          console.log("📦 Model URL found:", item.model);
          urls.push(item.model);
        }
        break;
      case 'scripts':
        if (item.script) {
          console.log("📜 Script URL found:", item.script);
          urls.push(item.script);
        }
        break;
      case 'videos':
        if (item.video) {
          console.log("🎥 Video URL found:", item.video);
          urls.push(item.video);
        }
        break;
      case 'graphics':
        if (item.graphicsTemplate) {
          console.log("🎨 Graphics Template URL found:", item.graphicsTemplate);
          urls.push(item.graphicsTemplate);
        }
        break;
      case 'mockups':
        if (item.mockupFile) {
          console.log("📱 Mockup File URL found:", item.mockupFile);
          urls.push(item.mockupFile);
        }
        break;
      case 'fonts':
        if (item.fontFile) {
          console.log("🔤 Font File URL found:", item.fontFile);
          urls.push(item.fontFile);
        }
        break;
      case 'video-templates':
        if (item.videoTemplateFile) {
          console.log("🎬 Video Template URL found:", item.videoTemplateFile);
          urls.push(item.videoTemplateFile);
        }
        break;
      case 'hdris':
        if (item.hdri) {
          console.log("🌅 HDRI URL found:", item.hdri);
          urls.push(item.hdri);
        }
        break;
      case 'icons':
        if (Array.isArray(item.icons)) {
          console.log("🖼️ Icons URLs found:", item.icons.length);
          urls.push(...item.icons);
        } else if (item.icons) {
          console.log("🖼️ Single Icon URL found:", item.icons);
          urls.push(item.icons);
        }
        break;
      case 'images':
        if (Array.isArray(item.images)) {
          console.log("🖼️ Images array found:", item.images.length);
          // Handle multiple sizes structure
          item.images.forEach((img, index) => {
            if (img.sizes && typeof img.sizes === 'object') {
              // Get the highest quality image (original)
              const originalUrl = img.sizes.original || Object.values(img.sizes)[0];
              if (originalUrl) {
                console.log(`🖼️ Image ${index + 1} URL:`, originalUrl);
                urls.push(originalUrl);
              }
            } else if (typeof img === 'string') {
              console.log(`🖼️ Image ${index + 1} URL:`, img);
              urls.push(img);
            }
          });
        } else if (item.images) {
          console.log("🖼️ Single Image URL found:", item.images);
          urls.push(item.images);
        }
        break;
      case 'textures':
        if (Array.isArray(item.textures)) {
          console.log("🎨 Textures URLs found:", item.textures.length);
          urls.push(...item.textures);
        } else if (item.textures) {
          console.log("🎨 Single Texture URL found:", item.textures);
          urls.push(item.textures);
        }
        
        // Also check for individual texture maps
        const textureMaps = ['ambientOcclusion', 'baseColor', 'displacement', 'normal', 'roughness', 'metallic', 'bump', 'idmap'];
        textureMaps.forEach(map => {
          if (item[map]) {
            console.log(`🎨 ${map} map URL found:`, item[map]);
            urls.push(item[map]);
          }
        });
        break;
      default:
        if (item.other) {
          console.log("📄 Other file URL found:", item.other);
          urls.push(item.other);
        }
        break;
    }

    console.log("📥 Final URLs to download:", urls);
    return urls.filter(Boolean);
  };

  const downloadURL = (url) => {
    try {
      console.log("⬇️ Downloading:", url);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from URL
      const filename = url.split('/').pop().split('?')[0];
      a.download = filename || 'download';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log("✅ Download initiated for:", filename);
    } catch (e) {
      console.error("❌ Download error:", e);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const handleDownload = async () => {
    console.log("🚀 Starting download process...");
    const urls = getAssetUrls();

    if (urls.length === 0) {
      console.error("❌ No downloadable files found for this asset");
      setToastMessage('No downloadable files found for this asset');
      setToastState('error');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    console.log(`📁 Found ${urls.length} file(s) to download`);

    // Free items: download immediately
    if (isFree) {
      console.log("🆓 Free asset - downloading immediately");
      try {
        // Save to downloads first
        await addToDownloads(item);
        console.log("✅ Saved to downloads collection");
        
        // Then download files
        urls.forEach((url, index) => {
          setTimeout(() => {
            downloadURL(url);
          }, index * 500); // Stagger downloads by 500ms
        });
        
        setToastMessage(`Downloading ${urls.length} file(s)...`);
        setToastState('success');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (error) {
        console.error("❌ Error saving to downloads:", error);
        // Still try to download even if save fails
        urls.forEach(downloadURL);
      }
      return;
    }

    // Purchased items or users with active subscription: allow download
    if (hasPurchasedItem || hasActiveSubscription) {
      console.log("💳 Paid asset with access - downloading");
      try {
        // Save to downloads first
        await addToDownloads(item);
        console.log("✅ Saved to downloads collection");
        
        // Then download files
        urls.forEach((url, index) => {
          setTimeout(() => {
            downloadURL(url);
          }, index * 500);
        });
        
        setToastMessage(`Downloading ${urls.length} file(s)...`);
        setToastState('success');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (error) {
        console.error("❌ Error saving to downloads:", error);
        // Still try to download even if save fails
        urls.forEach(downloadURL);
      }
      return;
    }

    // For paid items without subscription, show subscription message
    if (isPaid && !hasActiveSubscription) {
      console.log("🔒 Paid asset without subscription - redirecting");
      setToastMessage('Subscription required to download paid assets');
      setToastState('warning');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    // Fallback for old numeric prices
    const price = Number(item.price) || 0;
    if (price > 0 && !hasActiveSubscription && !hasPurchasedItem) {
      console.log("💰 Old paid asset without subscription - redirecting");
      setToastMessage('Subscription required to download paid assets');
      setToastState('warning');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }
  };

  const handleSubscription = () => {
    console.log("👑 Redirecting to subscription page");
    navigate('/subscription');
  };

  // Determine button state and content
  const getButtonContent = () => {
    // Free items - always downloadable
    if (isFree) {
      return {
        text: isDownloaded ? 'Downloaded' : 'Download',
        icon: 'fas fa-download',
        onClick: handleDownload,
        enabled: true,
        className: 'download_btn'
      };
    }

    // Paid items with subscription or purchase - downloadable
    if (hasActiveSubscription || hasPurchasedItem) {
      return {
        text: isDownloaded ? 'Downloaded' : 'Download',
        icon: 'fas fa-download',
        onClick: handleDownload,
        enabled: true,
        className: 'download_btn'
      };
    }

    // Paid items without subscription - show subscribe button
    if (isPaid && !hasActiveSubscription) {
      return {
        text: 'Subscribe to Download',
        icon: 'fas fa-crown',
        onClick: handleSubscription,
        enabled: true,
        className: 'subscribe_btn'
      };
    }

    // Fallback for old numeric prices (backward compatibility)
    const price = Number(item.price) || 0;
    if (price === 0) {
      return {
        text: isDownloaded ? 'Downloaded' : 'Download',
        icon: 'fas fa-download',
        onClick: handleDownload,
        enabled: true,
        className: 'download_btn'
      };
    }

    // Old paid items without subscription
    return {
      text: 'Subscribe to Download',
      icon: 'fas fa-crown',
      onClick: handleSubscription,
      enabled: true,
      className: 'subscribe_btn'
    };
  };

  const buttonConfig = getButtonContent();

  return (
    <button 
      className={`action_button ${buttonConfig.className}`}
      onClick={buttonConfig.onClick}
      disabled={!buttonConfig.enabled}
    >
      <i className={`icon ${buttonConfig.icon}`}></i>
      {buttonConfig.text}
    </button>
  );
};

DownloadButton.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    model: PropTypes.string,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    images: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    video: PropTypes.string,
    script: PropTypes.string,
    hdri: PropTypes.string,
    graphicsTemplate: PropTypes.string,
    mockupFile: PropTypes.string,
    fontFile: PropTypes.string,
    videoTemplateFile: PropTypes.string,
    icons: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    textures: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    other: PropTypes.string,
  }).isRequired,
  userProfile: PropTypes.shape({
    purchasedItems: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    subscriptionActive: PropTypes.bool,
  }),
  setToastMessage: PropTypes.func.isRequired,
  setToastState: PropTypes.func.isRequired,
  setShowToast: PropTypes.func.isRequired,
};

export default DownloadButton;