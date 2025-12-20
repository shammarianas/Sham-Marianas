// components/common/SEO.jsx
import React, { useEffect } from 'react'; 
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Shammarianas", // ✅ Added default value
  description = "Sham Marianas is a top advertising agency that helps businesses grow with digital marketing, brand building, and ROI-focused advertising. We employ tried-and-true marketing techniques to increase our internet presence, draw in new clients, and provide tangible outcomes. Let's grow your company to new heights!", 
  keywords = "Web development, Digital Marketing, SEO, Social Media Marketing, Branding, Advertising Agency", 
  canonical = "https://www.shammarianas.com", 
  ogImage = "https://www.shammarianas.com/assets/imgs/arrow-image.webp" ,
  ogType = "website",
  twitterCard = "summary_large_image"
}) => {
  const siteTitle = "Shammarianas";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteUrl = "https://www.shammarianas.com";

  // ✅ Debug console log - remove in production
  console.log("SEO Component - Title:", title);
  console.log("SEO Component - Full Title:", fullTitle);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph Tags (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
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
      
      {/* Structured Data (JSON-LD) - Optional but recommended for SEO */}
      <script type="application/ld+json">
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
      </script>
    </Helmet>
  );
};

export default SEO;