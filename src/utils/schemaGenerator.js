// utils/schemaGenerator.js

const SITE_URL = "https://www.shammarianas.com";
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const FOUNDER_ID = `${SITE_URL}/about/#founder`;

// =========================================================
//   ORGANIZATION SCHEMA (Global - reference ke tor par har page par reuse hoga)
// =========================================================
const organizationSchema = {
  "@type": "Organization",
  "@id": ORG_ID,
  "name": "Sham Marianas F.Z.C.",
  "url": `${SITE_URL}/`,
  "logo": {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    "url": `${SITE_URL}/assets/imgs/logo.png`,
    "contentUrl": `${SITE_URL}/assets/imgs/logo.png`
  },
  "image": `${SITE_URL}/assets/imgs/arrow-image.png`,
  "email": "info@shammarianas.com",
  "telephone": "+971528036012",
  "legalName": "Sham Marianas F.Z.C.",
  "foundingDate": "2022",
  "founder": { "@id": FOUNDER_ID },
  "hasOfferCatalog": { "@id": `${SITE_URL}/about/#services-offered` },
  "priceRange": "$$",
  "knowsLanguage": ["en", "ur"],
  "areaServed": [
    { "@type": "Country", "name": "United Arab Emirates" },
    { "@type": "Country", "name": "Pakistan" },
    { "@type": "Place", "name": "Worldwide" }
  ],
  "knowsAbout": [
    "Advertising",
    "Branding",
    "Digital Marketing",
    "Search Engine Optimization",
    "SEO",
    "AI Optimization",
    "Generative Engine Optimization",
    "AI Search Visibility",
    "Social Media Marketing",
    "Web Development",
    "E-Commerce",
    "Graphic Design",
    "UI UX Design",
    "Content Writing",
    "Product Design",
    "Photography",
    "Video Production",
    "VFX and CGI",
    "Print Media",
    "AI Automation",
    "Exhibition Booth Design"
  ],
  "sameAs": [
    "https://www.youtube.com/c/ShamMarianasSM",
    "https://www.facebook.com/shammarianas",
    "https://www.behance.net/shammarianas",
    "https://www.pinterest.com/shammarianas/",
    "https://www.instagram.com/sham_marianas/",
    "https://www.linkedin.com/in/shammarianas/"
  ],
  "address": [
    { "@type": "PostalAddress", "addressLocality": "Dubai", "addressCountry": "AE" },
    { "@type": "PostalAddress", "addressLocality": "Multan", "addressCountry": "PK" }
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+971528036012",
      "contactType": "customer service",
      "areaServed": "AE",
      "availableLanguage": ["English"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+923116788423",
      "contactType": "customer service",
      "areaServed": "PK",
      "availableLanguage": ["English", "Urdu"]
    }
  ]
};

// =========================================================
//   WEBSITE SCHEMA (Global - reference ke tor par reuse hoga)
// =========================================================
const websiteSchema = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  "url": `${SITE_URL}/`,
  "name": "Sham Marianas F.Z.C.",
  "publisher": { "@id": ORG_ID },
  "inLanguage": "en"
};

// =========================================================
//   Breadcrumb Helper (har page ke liye reuse hoga)
// =========================================================
const buildBreadcrumb = (id, items) => ({
  "@type": "BreadcrumbList",
  "@id": id,
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

const homeCrumb = { name: "Home", url: `${SITE_URL}/` };

// =========================================================
//   getSchema: single-node generator per type
//   (baaki file ka dispatcher-based logic same rakha gaya hai)
// =========================================================
export const getSchema = (type, data = {}) => {
  switch (type) {
    // -----------------------------------------------------
    // Core global nodes
    // -----------------------------------------------------
    case "organization":
      return organizationSchema;

    case "website":
      return websiteSchema;

    // -----------------------------------------------------
    // HOMEPAGE
    // -----------------------------------------------------
    case "homepage":
      return {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        "url": `${SITE_URL}/`,
        "name": data.title || "Sham Marianas F.Z.C. | Marketing Agency in Dubai, UAE",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "mainEntity": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // ABOUT PAGE
    // -----------------------------------------------------
    case "about":
      return {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about/`,
        "name": "About Sham Marianas F.Z.C.",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "mainEntity": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "breadcrumb": { "@id": `${SITE_URL}/about/#breadcrumb` },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // SERVICES LISTING PAGE
    // -----------------------------------------------------
    case "servicesListing":
      return {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/services#webpage`,
        "url": `${SITE_URL}/services`,
        "name": "Services | Sham Marianas F.Z.C.",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "breadcrumb": { "@id": `${SITE_URL}/services#breadcrumb` },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // INDIVIDUAL SERVICE PAGE (Dynamic)
    // -----------------------------------------------------
    case "service": {
      const url = data.url || "";
      const serviceName = data.serviceType || data.name || data.title || "";
      return {
        "@type": "Service",
        "@id": `${url}#service`,
        "name": serviceName,
        "url": url,
        "description": data.description || "",
        "provider": { "@id": ORG_ID },
        "areaServed": data.areaServed || [
          { "@type": "Country", "name": "United Arab Emirates" },
          { "@type": "Country", "name": "Pakistan" },
          { "@type": "Place", "name": "Worldwide" }
        ],
        "serviceType": serviceName,
        ...(data.price
          ? {
              "offers": {
                "@type": "Offer",
                "priceCurrency": data.priceCurrency || "AED",
                "price": data.price,
                "availability": data.availability || "https://schema.org/InStock",
                "url": url
              }
            }
          : {})
      };
    }

    // -----------------------------------------------------
    // BLOG LISTING PAGE
    // -----------------------------------------------------
    case "blogListing":
      return {
        "@type": "Blog",
        "@id": `${SITE_URL}/blog#blog`,
        "url": `${SITE_URL}/blog`,
        "name": "Sham Marianas F.Z.C. Blog",
        "publisher": { "@id": ORG_ID },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // INDIVIDUAL BLOG ARTICLE (Dynamic)
    // -----------------------------------------------------
    case "blog": {
      const url = data.url || "";
      return {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        "url": url,
        "headline": data.title || "",
        "description": data.description || "",
        "mainEntityOfPage": { "@id": `${url}#webpage` },
        "publisher": { "@id": ORG_ID },
        "author": data.authorName
          ? {
              "@type": "Person",
              "name": data.authorName,
              "sameAs": data.authorSameAs || []
            }
          : { "@type": "Organization", "@id": ORG_ID, "name": "Sham Marianas F.Z.C." },
        "image": {
          "@type": "ImageObject",
          "url": data.ogImage || `${SITE_URL}/assets/imgs/arrow-image.png`
        },
        "datePublished": data.publishedTime || "",
        "dateModified": data.updatedTime || data.publishedTime || "",
        "wordCount": data.wordCount || undefined,
        "keywords": data.keywords || undefined,
        "inLanguage": "en"
      };
    }

    // -----------------------------------------------------
    // PORTFOLIO LISTING PAGE
    // -----------------------------------------------------
    case "portfolioListing":
      return {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/case-study#webpage`,
        "url": `${SITE_URL}/case-study`,
        "name": "Portfolio | Sham Marianas F.Z.C.",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "breadcrumb": { "@id": `${SITE_URL}/case-study#breadcrumb` },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // INDIVIDUAL PORTFOLIO PROJECT (Dynamic)
    // -----------------------------------------------------
    case "portfolio": {
      const url = data.url || "";
      return {
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        "url": url,
        "name": data.title || "",
        "description": data.description || "",
        "creator": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "image": [data.image || `${SITE_URL}/assets/imgs/arrow-image.png`],
        "datePublished": data.datePublished || "",
        "keywords": data.keywords || "",
        "inLanguage": "en"
      };
    }

    // -----------------------------------------------------
    // CONTACT PAGE
    // -----------------------------------------------------
    case "contact":
      return {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact-us#webpage`,
        "url": `${SITE_URL}/contact-us`,
        "name": "Contact Sham Marianas F.Z.C.",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "mainEntity": { "@id": ORG_ID },
        "breadcrumb": { "@id": `${SITE_URL}/contact-us#breadcrumb` },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // TEMPLATES PAGE
    // -----------------------------------------------------
    case "templates":
      return {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/templates#webpage`,
        "url": `${SITE_URL}/templates`,
        "name": "Templates | Sham Marianas F.Z.C.",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "inLanguage": "en"
      };

    // -----------------------------------------------------
    // CATEGORY PAGE (Dynamic - fonts, icons, mockups, etc.)
    // -----------------------------------------------------
    case "category": {
      const url = data.url || "";
      return {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": data.title ? `${data.title} | Sham Marianas F.Z.C.` : "",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORG_ID },
        "publisher": { "@id": ORG_ID },
        "breadcrumb": { "@id": `${url}#breadcrumb` },
        "inLanguage": "en"
      };
    }

    // -----------------------------------------------------
    // PRODUCT/ASSET SCHEMA (Digital assets par) - purana logic, org reference update kiya
    // -----------------------------------------------------
    case "product":
      return {
        "@type": "Product",
        "name": data.title || "",
        "description": data.description || "",
        "image": data.image || `${SITE_URL}/assets/imgs/arrow-image.png`,
        "url": data.url || "",
        "offers": {
          "@type": "Offer",
          "price": data.price === "free" ? "0" : data.price || "",
          "priceCurrency": data.priceCurrency || "AED",
          "availability": data.availability || "https://schema.org/InStock"
        },
        "brand": { "@id": ORG_ID }
      };

    default:
      return null;
  }
};

// =========================================================
//   Helper Functions (har page ke liye ready-to-use @graph)
// =========================================================

// Homepage
export const getHomepageSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [organizationSchema, websiteSchema, getSchema("homepage")]
});

// About page
export const getAboutSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    websiteSchema,
    {
      "@type": "Person",
      "@id": FOUNDER_ID,
      "name": "Ehtasham ul Haq",
      "jobTitle": "Founder",
      "description": "Founder of Sham Marianas F.Z.C. with more than 12 years of experience in advertising and digital marketing.",
      "worksFor": { "@id": ORG_ID },
      "knowsAbout": [
        "Digital marketing",
        "Advertising",
        "Search engine optimization",
        "Brand strategy"
      ],
      "url": `${SITE_URL}/about/`
    },
    {
      "@type": "OfferCatalog",
      "@id": `${SITE_URL}/about/#services-offered`,
      "name": "Sham Marianas digital services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Digital marketing",
            "provider": { "@id": ORG_ID },
            "areaServed": { "@type": "Country", "name": "United Arab Emirates" }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Web development",
            "provider": { "@id": ORG_ID },
            "areaServed": { "@type": "Country", "name": "United Arab Emirates" }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Logo and brand design",
            "provider": { "@id": ORG_ID },
            "areaServed": { "@type": "Country", "name": "United Arab Emirates" }
          }
        }
      ]
    },
    getSchema("about"),
    buildBreadcrumb(`${SITE_URL}/about/#breadcrumb`, [
      homeCrumb,
      { name: "About", url: `${SITE_URL}/about/` }
    ])
  ]
});

// Services listing page
export const getServicesListingSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    getSchema("servicesListing"),
    buildBreadcrumb(`${SITE_URL}/services#breadcrumb`, [
      homeCrumb,
      { name: "Services", url: `${SITE_URL}/services` }
    ])
  ]
});

// Individual service page
export const getServiceSchema = (serviceData) => {
  const url = serviceData.url || "";
  const graph = [
    getSchema("service", serviceData),
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      "url": url,
      "name": serviceData.title ? `${serviceData.title} | Sham Marianas F.Z.C.` : "",
      "isPartOf": { "@id": WEBSITE_ID },
      "about": { "@id": `${url}#service` },
      "breadcrumb": { "@id": `${url}#breadcrumb` },
      "inLanguage": "en"
    },
    buildBreadcrumb(`${url}#breadcrumb`, [
      homeCrumb,
      { name: "Services", url: `${SITE_URL}/services` },
      { name: serviceData.title || "", url }
    ])
  ];

  // Agar page par actually visible FAQs hain to unhe serviceData.faqs mein pass karo
  if (Array.isArray(serviceData.faqs) && serviceData.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      "mainEntity": serviceData.faqs.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer }
      }))
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

// Blog listing page
export const getBlogListingSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    getSchema("blogListing"),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/blog#webpage`,
      "url": `${SITE_URL}/blog`,
      "name": "Digital Marketing, SEO, AI & Branding Blog",
      "isPartOf": { "@id": WEBSITE_ID },
      "about": { "@id": `${SITE_URL}/blog#blog` },
      "breadcrumb": { "@id": `${SITE_URL}/blog#breadcrumb` },
      "inLanguage": "en"
    },
    buildBreadcrumb(`${SITE_URL}/blog#breadcrumb`, [
      homeCrumb,
      { name: "Blog", url: `${SITE_URL}/blog` }
    ])
  ]
});

// Individual blog article page
export const getBlogSchema = (blogData) => {
  const url = blogData.url || "";
  const graph = [
    getSchema("blog", blogData),
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      "url": url,
      "name": blogData.title || "",
      "isPartOf": { "@id": WEBSITE_ID },
      "about": { "@id": `${url}#article` },
      "breadcrumb": { "@id": `${url}#breadcrumb` }
    },
    buildBreadcrumb(`${url}#breadcrumb`, [
      homeCrumb,
      { name: "Blog", url: `${SITE_URL}/blog` },
      { name: blogData.title || "", url }
    ])
  ];

  // Auto FAQ generate karo agar content available ho
  if (blogData.content) {
    const faqSchema = getAutoFaqSchema(blogData.content, blogData, url);
    if (faqSchema) graph.push(faqSchema);
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

// Portfolio listing page
export const getPortfolioListingSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    getSchema("portfolioListing"),
    buildBreadcrumb(`${SITE_URL}/case-study#breadcrumb`, [
      homeCrumb,
      { name: "Case Study", url: `${SITE_URL}/case-study` }
    ])
  ]
});

// Individual portfolio project page
export const getPortfolioSchema = (projectData) => {
  const url = projectData.url || "";
  return {
    "@context": "https://schema.org",
    "@graph": [
      getSchema("portfolio", projectData),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": projectData.title ? `${projectData.title} | Sham Marianas F.Z.C.` : "",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": `${url}#project` },
        "breadcrumb": { "@id": `${url}#breadcrumb` }
      },
      buildBreadcrumb(`${url}#breadcrumb`, [
        homeCrumb,
        { name: "Case Study", url: `${SITE_URL}/case-study` },
        { name: projectData.title || "", url }
      ])
    ]
  };
};

// Contact page
export const getContactSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    getSchema("contact"),
    buildBreadcrumb(`${SITE_URL}/contact-us#breadcrumb`, [
      homeCrumb,
      { name: "Contact", url: `${SITE_URL}/contact-us` }
    ])
  ]
});

// Templates page
export const getTemplatesSchema = () => getSchema("templates");

// Category page (fonts, icons, mockups, models, graphics, videos, images, scripts, HDRI, textures, etc.)
export const getCategorySchema = (categoryData) => {
  const url = categoryData.url || "";
  return {
    "@context": "https://schema.org",
    "@graph": [
      getSchema("category", categoryData),
      buildBreadcrumb(`${url}#breadcrumb`, [
        homeCrumb,
        { name: categoryData.title || "", url }
      ])
    ]
  };
};

// Product/Asset page
export const getProductSchema = (productData) => ({
  "@context": "https://schema.org",
  "@graph": [organizationSchema, getSchema("product", productData)]
});

// =========================================================
//   Automatic FAQ from blog HTML content (logic same rakha gaya hai)
// =========================================================
export const getAutoFaqSchema = (htmlContent = '', _blogData = {}, pageUrl = '') => {
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
      "@type": "FAQPage",
      "@id": pageUrl ? `${pageUrl}#faq` : undefined,
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
