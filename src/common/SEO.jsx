// components/common/SEO.jsx - CORRECTED
import React from 'react'; 
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom'; // USE THIS
import { SEO_CONFIG } from '../utils/seoConfig';

const SEO = ({ 
  title = "Shammarianas",
  description = "Sham Marianas is a top advertising agency that helps businesses grow with digital marketing, brand building, and ROI-focused advertising. We employ tried-and-true marketing techniques to increase our internet presence, draw in new clients, and provide tangible outcomes. Let's grow your company to new heights!", 
  keywords = "Web development, Digital Marketing, SEO, Social Media Marketing, Branding, Advertising Agency", 
  canonical, 
  ogImage = "https://www.shammarianas.com/assets/imgs/arrow-image.webp",
  ogType = "website",
  twitterCard = "summary_large_image", 
  publishedTime, author
}) => {
  const location = useLocation(); // Get current URL path
  const siteUrl = "https://www.shammarianas.com";
  
  // ✅ DYNAMIC CANONICAL URL
  const getCanonicalUrl = () => {
    // If canonical prop provided from page, use it
    if (canonical) return canonical;
    
    // Otherwise, generate from current path
    const path = location.pathname;
    return `${siteUrl}${path}`;
  };
  
  // ✅ 1. Decide schema type based on ogType
  let schemaType = "agency";
  if (ogType === "article") schemaType = "blog";
  // Agar page main agency page nahi hai to use service schema
  else if (location.pathname !== "/") schemaType = "service";

  // ✅ 2. Get the schema data from config
  const schemaData = SEO_CONFIG.getSchema(schemaType, {
    title, description, ogImage, publishedTime, author
  });

  const canonicalUrl = getCanonicalUrl();
  const siteTitle = "Shammarianas";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* ✅ DYNAMIC CANONICAL LINK */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} /> {/* ✅ Same canonical */}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Shammarianas" />
      
      {/* Structured Data */}
      {/* <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Shammarianas",
          "url": siteUrl,
          "logo": "https://www.shammarianas.com/logo.png",
          "description": description,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Your City",
            "addressRegion": "Your State",
            "addressCountry": "Your Country"
          }
        })}
      </script> */}

      <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
    </Helmet>
  );
};

export default SEO;