// components/common/SEO.jsx - CORRECTED
import 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom'; // USE THIS
import '../utils/seoConfig';

const SEO = ({
  title = "Sham Marianas F.Z.C",
  description = "Sham Marianas FZC is a top marketing agency that helps businesses grow with digital marketing, IT Solution, brand building, and ROI-focused advertising. We employ tried-and-true marketing techniques to increase our internet presence, draw in new clients, and provide tangible outcomes. Let's grow your company to new heights!",
  keywords = "Web development, Digital Marketing, SEO, Social Media Marketing, Branding, Marketing Agency",
  canonical,
  ogImage = "https://www.shammarianas.com/assets/imgs/arrow-image.png",
  twitterImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  robots = "index, follow",
  noCanonical = false
}) => {
  const location = useLocation(); // Get current URL path
  const siteUrl = "https://www.shammarianas.com";

  const normalizeCanonicalUrl = (value) => {
    try {
      const url = new URL(value, siteUrl);
      if (url.origin !== siteUrl) return value;
      url.pathname = url.pathname === '/'
        ? '/'
        : `${url.pathname.replace(/\/+$/, '')}/`;
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch (_error) {
      return value;
    }
  };

  // ✅ DYNAMIC CANONICAL URL
  const getCanonicalUrl = () => {
    // If canonical prop provided from page, use it
    if (canonical) return normalizeCanonicalUrl(canonical);

    // Otherwise, generate from current path
    const path = location.pathname;
    return normalizeCanonicalUrl(`${siteUrl}${path}`);
  };


  const canonicalUrl = getCanonicalUrl();
  const siteTitle = "Sham Marianas F.Z.C.";
  const fullTitle = title || siteTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {!noCanonical && <meta name="twitter:url" content={canonicalUrl} />}

      {/* ✅ DYNAMIC CANONICAL LINK */}
      {!noCanonical && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {!noCanonical && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />

      {/* Additional Tags */}
      <meta name="robots" content={robots} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Shammarianas" />
    </Helmet>
  );
};

export default SEO;
