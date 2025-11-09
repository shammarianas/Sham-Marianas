import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import PropTypes from 'prop-types';

const DownloadButton = ({
  item,
  userProfile,
  setToastMessage,
  setToastState,
  setShowToast,
}) => {
  const { isDownloaded, addToDownloads, error } = useSaveToDownloads(item.id, item);

  const price = Number(item.price) || 0;
  const discount = Number(item.discount ?? 0) || 0;
  const finalPrice = price - (price * discount) / 100;

  // Check if asset is free or purchased
  const isFree = finalPrice === 0;
  const isPurchased = userProfile && userProfile.purchasedItems && userProfile.purchasedItems.includes(item.id);
  const canDownload = isFree || isPurchased;

  const getAssetUrls = () => {
    const urls = [];
    switch ((item.type || '').toLowerCase()) {
      case 'models':
      case 'printables':
        if (item.model) urls.push(item.model);
        break;
      case 'scripts':
        if (item.script) urls.push(item.script);
        break;
      case 'videos':
        if (item.video) urls.push(item.video);
        break;
      case 'graphics':
        if (item.graphicsTemplate) urls.push(item.graphicsTemplate);
        break;
      case 'mockups':
        if (item.mockupFile) urls.push(item.mockupFile);
        break;
      case 'fonts':
        if (item.fontFile) urls.push(item.fontFile);
        break;
      case 'video-templates':
        if (item.videoTemplateFile) urls.push(item.videoTemplateFile);
        break;
      case 'hdris':
        if (item.hdri) urls.push(item.hdri);
        break;
      case 'icons':
        if (Array.isArray(item.icons)) urls.push(...item.icons);
        break;
     case 'images':
        // ✅ ENHANCED: Handle multiple image sizes
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach((imageData) => {
            if (imageData.sizes && typeof imageData.sizes === 'object') {
              // New format with multiple sizes
              Object.values(imageData.sizes).forEach(sizeData => {
                if (sizeData.url) {
                  urls.push(sizeData.url);
                }
              });
            } else if (typeof imageData === 'string') {
              // Old format - single URL (backward compatibility)
              urls.push(imageData);
            } else if (imageData.url) {
              // Alternative object format
              urls.push(imageData.url);
            }
          });
        }
        break;
      case 'textures':
        if (item.maps && typeof item.maps === 'object') {
          urls.push(...Object.values(item.maps).filter(Boolean));
        }
        break;
      default:
        if (item.other) urls.push(item.other);
        break;
    }
    return urls.filter(Boolean);
  };

  const downloadURL = (url) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed for URL:', url, err);
    }
  };

  const handleDownload = () => {
    if (!canDownload) {
      setToastMessage('This is a paid asset. Please purchase to download.');
      setToastState('warning');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    const urls = getAssetUrls();

    // Add to downloads history
    addToDownloads(item);
    
    // Download files
    if (urls.length) {
      urls.forEach(downloadURL);
    }

   // ✅ ENHANCED: Show different message for multiple sizes
    if (item.type === 'images' && urls.length > 1) {
      setToastMessage(`Downloading ${urls.length} image files in multiple sizes!`);
    } else {
      setToastMessage('Download started!');
    }
    
    setToastState('success');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <button 
      className="add_to_cart_btn" 
      onClick={handleDownload}
      disabled={!canDownload}
      style={{
        opacity: canDownload ? 1 : 0.6,
        cursor: canDownload ? 'pointer' : 'not-allowed'
      }}
    >
      {canDownload ? (
        <>
          <i className="icon fas fa-download"></i>
          {isDownloaded ? 'Download Again' : 'Download'}
        </>
      ) : (
        <>
          <i className="icon fas fa-lock"></i>
          Paid Asset
        </>
      )}
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
  }).isRequired,
  userProfile: PropTypes.shape({
    purchasedItems: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
  }),
  setToastMessage: PropTypes.func.isRequired,
  setToastState: PropTypes.func.isRequired,
  setShowToast: PropTypes.func.isRequired,
};

export default DownloadButton;