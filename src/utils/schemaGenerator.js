// utils/schemaGenerator.js
export const getSchema = (type, data = {}) => {
  const baseSchema = { "@context": "https://schema.org" };

  // =========================================================
  //   AGENCY/ORGANIZATION SCHEMA (Global - har page par)
  // =========================================================
  if (type === "agency") {
    return {
      ...baseSchema,
      "@type": "AdvertisingAgency",
      "@id": "https://www.shammarianas.com/#agency",
      "name": "Sham Marianas F.Z.C",
      "url": "https://www.shammarianas.com",
      "logo": "https://www.shammarianas.com/assets/imgs/logo.png",
      "image": {
        "@type": "ImageObject",
        "url": "https://www.shammarianas.com/assets/imgs/arrow-image.webp"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dubai",
        "addressCountry": "AE"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+971528036012",
          "contactType": "customer service",
          "url": "https://www.shammarianas.com/contact-us",
          "areaServed": ["AE", "Worldwide"],
          "availableLanguage": ["English"]
        },
        {
          "@type": "ContactPoint",
          "telephone": "+923116788423",
          "contactType": "customer service",
          "areaServed": ["PK"],
          "availableLanguage": ["English", "Urdu"]
        }
      ],
      "email": "info@shammarianas.com",
      "priceRange": "$$",
      "foundingDate": "2022",
      "sameAs": [
        "https://www.youtube.com/c/ShamMarianasSM",
        "https://www.facebook.com/shammarianas",
        "https://www.behance.net/shammarianas",
        "https://www.pinterest.com/shammarianas/",
        "https://www.instagram.com/sham_marianas/",
        "https://www.linkedin.com/in/shammarianas/"
      ]
    };
  }

  // =========================================================
  //   BLOG SCHEMA (Dynamic - blog page par)
  // =========================================================
  if (type === "blog") {
    return {
      ...baseSchema,
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": data.url || ""
      },
      "url": data.url || "",
      "headline": data.title || "",
      "image": [
        {
          "@type": "ImageObject",
          "url": data.ogImage || "https://www.shammarianas.com/assets/imgs/arrow-image.webp"
        }
      ],
      "author": data.authorName
        ? {
          "@type": "Person",
          "name": data.authorName,
          "sameAs": data.authorSameAs || []
        }
        : {
          "@type": "Organization",
          "name": "Sham Marianas F.Z.C",
          "@id": "https://www.shammarianas.com/#agency"
        },
      "publisher": {
        "@type": "Organization",
        "name": "Sham Marianas F.Z.C",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.shammarianas.com/assets/imgs/logo.png"
        }
      },
      "datePublished": data.publishedTime || "",
      "dateModified": data.updatedTime || data.publishedTime || "",
      "description": data.description || "",
      "wordCount": data.wordCount || undefined,
      "keywords": data.keywords || undefined
    };
  }

  // =========================================================
  //   SERVICE SCHEMA (Dynamic - service page par)
  // =========================================================
  if (type === "service") {
    return {
      ...baseSchema,
      "@type": "Service",
      "serviceType": data.title || "",
      "url": data.url || "",
      "areaServed": ["AE"],
      "provider": {
        "@type": "AdvertisingAgency",
        "@id": "https://www.shammarianas.com/#agency",
        "name": "Sham Marianas F.Z.C"
      },
      "description": data.description || "",
      "offers": {
        "@type": "Offer",
        "priceCurrency": data.priceCurrency || "AED",
        "price": data.price || undefined,
        "availability": data.availability || "https://schema.org/InStock",
        "url": data.url || "https://www.shammarianas.com/services"
      } 
    };
  }

  // =========================================================
  //   WEBSITE SCHEMA (Homepage par)
  // =========================================================
  // if (type === "website") {
  //   return {
  //     ...baseSchema,
  //     "@type": "WebSite",
  //     "url": "https://www.shammarianas.com",
  //     "name": "Sham Marianas F.Z.C",
  //     "description": "Advertising Agency in Dubai, UAE",
  //     "potentialAction": {
  //       "@type": "SearchAction",
  //       "target": "https://www.shammarianas.com/search?q={search_term_string}",
  //       "query-input": "required name=search_term_string"
  //     }
  //   };
  // }

  // HOMEPAGE ke liye alag function
  if (type === "homepage") {
    return null; // Will be handled in getHomepageSchema()
  }


  // =========================================================
  //   PRODUCT/ASSET SCHEMA (Digital assets par)
  // =========================================================
  if (type === "product") {
    return {
      ...baseSchema,
      "@type": "Product",
      "name": data.title || "",
      "description": data.description || "",
      "image": data.image || "https://www.shammarianas.com/assets/imgs/arrow-image.webp",
      "url": data.url || "",
      "offers": {
        "@type": "Offer",
        "price": data.price === "free" ? "0" : data.price || "",
        "priceCurrency": data.priceCurrency || "AED",
        "availability": data.availability || "https://schema.org/InStock"
      },
      "brand": {
        "@type": "Brand",
        "name": "Sham Marianas F.Z.C"
      }
    };
  }

  // =========================================================
  //   PORTFOLIO SCHEMA (Project page par)
  // =========================================================
  if (type === "portfolio") {
    return {
      ...baseSchema,
      "@type": "CreativeWork",
      "name": data.title || "",
      "description": data.description || "",
      "image": data.image || "https://www.shammarianas.com/assets/imgs/arrow-image.webp",
      "url": data.url || "",
      "author": {
        "@type": "AdvertisingAgency",
        "@id": "https://www.shammarianas.com/#agency",
        "name": "Sham Marianas F.Z.C"
      },
      "datePublished": data.datePublished || "",
      "keywords": data.keywords || ""
    };
  }

  return null;
};

// =========================================================
//   Helper Functions (har page ke liye ready-to-use)
// =========================================================

// Homepage ke liye schema
export const getHomepageSchema = () => [
  getSchema("website"),
  getSchema("agency")
];

// Blog page ke liye schema
export const getBlogSchema = (blogData) => {
  const schemas = [
    getSchema("agency"),
    getSchema("blog", blogData)
  ];

  // Auto FAQ generate karo agar content available ho
  if (blogData.content) {  // blog.content HTML string hai
    const faqSchema = getAutoFaqSchema(blogData.content, blogData);
    if (faqSchema) {
      schemas.push(faqSchema);
    }
  }

  return schemas;
};

// Service page ke liye schema
export const getServiceSchema = (serviceData) => [
  getSchema("agency"),
  getSchema("service", serviceData)
];

// Product/Asset page ke liye schema
export const getProductSchema = (productData) => [
  getSchema("agency"),
  getSchema("product", productData)
];

// Portfolio page ke liye schema
export const getPortfolioSchema = (projectData) => [
  getSchema("agency"),
  getSchema("portfolio", projectData)
];

// Contact page ke liye schema
export const getContactSchema = () => [
  getSchema("agency"),
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "url": "https://www.shammarianas.com/contact",
    "name": "Contact Sham Marianas F.Z.C"
  }
];


// Automatic FAQ from blog HTML content
export const getAutoFaqSchema = (htmlContent = '', blogData = {}) => {
  if (!htmlContent) return null;

  // Simple DOM parser use karo (browser mein safe hai)
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const faqItems = [];

  // H2 headings ko target karo (aapke blog mein questions H2/H3 hain)
  const headings = doc.querySelectorAll('h2, h3');

  headings.forEach((heading) => {
    const question = heading.textContent.trim();

    // Question-like check (starts with What/How/Why/Which etc. ya ? end pe)
    if (
      question &&
      (question.endsWith('?') ||
        question.toLowerCase().startsWith('what') ||
        question.toLowerCase().startsWith('how') ||
        question.toLowerCase().startsWith('why') ||
        question.toLowerCase().startsWith('tips') ||
        question.toLowerCase().includes('?'))
    ) {
      // Next sibling elements tak answer collect karo (p, ul, ol, etc. tak next heading tak)
      let answer = '';
      let nextElement = heading.nextElementSibling;

      while (nextElement && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.tagName)) {
        answer += nextElement.outerHTML || nextElement.textContent.trim() + ' ';
        nextElement = nextElement.nextElementSibling;
      }

      // Clean answer (strip extra spaces, limit length if needed)
      answer = answer.trim().replace(/\s+/g, ' ');

      if (answer && answer.length > 50) {  // Minimum length to avoid junk
        faqItems.push({
          question,
          answer: answer.substring(0, 800) + (answer.length > 800 ? '...' : '')  // AI ke liye concise rakho
        });
      }
    }
  });

  if (faqItems.length > 0) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
  }

  return null;
};