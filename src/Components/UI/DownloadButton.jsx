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
        if (Array.isArray(item.images)) urls.push(...item.images);
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
    } catch (e) {
      // window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    const urls = getAssetUrls();

    // Free items: download immediately
    if (isFree) {
      addToDownloads(item);
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // Purchased items or users with active subscription: allow download
    if (hasPurchasedItem || hasActiveSubscription) {
      addToDownloads(item);
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // For paid items without subscription, show subscription message
    if (isPaid && !hasActiveSubscription) {
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