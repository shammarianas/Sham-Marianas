import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import PropTypes from 'prop-types';

const DownloadButton = ({
  item,
  userProfile,
  setToastMessage,
  setToastState,
  setShowToast,
}) => {
  const { isDownloaded, addToDownloads, error } = useSaveToDownloads( item.id, item, );

  // console.log("DownloadButton:", { item, id:item.id, userProfile  });

  const price = Number(item.price) || 0;
  const discount = Number(item.discount ?? 0) || 0;
  const finalPrice = price - (price * discount) / 100;

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
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    const urls = getAssetUrls();

    // Free items: download immediately
    if (finalPrice === 0) {
      addToDownloads(item);
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // Purchased items: allow download
    if (
      userProfile &&
      userProfile.purchasedItems &&
      userProfile.purchasedItems.includes(item.id)
    ) {
      addToDownloads(item);
      if (urls.length) {
        urls.forEach(downloadURL);
      }
      return;
    }

    // Otherwise add to cart
    let cart = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];

    if (cart.find((cartItem) => cartItem.id === item.id)) {
      setToastMessage('Item already in cart');
      setToastState('warning');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    setToastMessage('Item added to cart');
    setToastState('success');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <button className="add_to_cart_btn" onClick={handleDownload}>
      {(finalPrice === 0 || (userProfile && userProfile.purchasedItems && userProfile.purchasedItems.includes(item.id))) ? (
        <>
          <i className="icon fas fa-download"></i>
          Download
        </>
      ) : (
        <>
          {isDownloaded ? (
            <>
              <i className="icon fas fa-download"></i>
              Downloaded
            </>
          ) : (
            <>
              <i className="icon fas fa-shopping-cart"></i>
              Add to cart
            </>
          )}
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
