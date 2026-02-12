export const SEO_CONFIG = {
  // =========================================================
  //   Main Pages SEO
  // =========================================================
  home: {
    title: "Sham Marianas F.Z.C | Advertising Agency in Dubai, UAE",
    description: "Sham Marianas F.Z.C is the best advertising agency in Dubai. We help with online marketing, managing your social media, creating strong brands, and developing plans that deliver real results and increased revenue. Let us help your business grow in the UAE! ",
    keywords: " Digital marketing agency Dubai, advertising agency UAE, social media marketing Dubai, brand building UAE, ROI advertising Dubai",
  },
  about: {
    title: "About Sham Marianas F.Z.C | Dubai's Top Advertising Agency",
    description: "Sham Marianas F.Z.C started in 2022. We're a full-service digital agency. We bring fresh marketing, websites, and creative ideas to help UAE businesses grow.",
    keywords: "about advertising agency Dubai, digital agency UAE, branding specialists Dubai, social campaigns UAE",
  },
  services: {
    title: "Our Services - Shammarianas | Digital Marketing Solutions",
    description: "Explore our comprehensive digital marketing services including Web Development, SEO, Social Media Marketing, Branding, and more to grow your business.",
    keywords: "Digital Marketing Services, Web Development Services, SEO Services, Social Media Marketing, Branding Services",
  },
  aiAutomation: {
    title: " AI Automation Dubai, UAE",
    description: "Sham Marianas F.Z.C creates AI automation for UAE ops. BPA, chatbots, analytics, CRM—smart systems boost efficiency and growth.",
    keywords: "AI automation Dubai, business automation UAE, chatbots Dubai, workflow automation UAE, CRM automation Dubai",
  },
  boothDesign: {
    title: "Exhibition Booth Design Dubai",
    description: " Impress at events with custom booth designs by Sham Marianas F.Z.C. Eye-catching structures built for UAE trade shows and exhibitions.",
    keywords: " exhibition booth Dubai, trade show design UAE, booth fabrication Dubai",
  },
  branding: {
    title: " Branding Design Agency Dubai, UAE",
    description: "Sham Marianas F.Z.C creates compelling brand identities with logos, visuals, and strategies tailored for UAE markets. Stand out and connect with your audience effectively.",
    keywords: " branding design Dubai, logo design UAE, brand identity Dubai",
  },
  content: {
    title: "Content Writing Services Dubai",
    description: "Engage audiences with high-quality content from Sham Marianas F.Z.C. SEO-optimized blogs, copies, and scripts that drive traffic for Dubai brands.",
    keywords: "content writing Dubai, SEO content UAE, blog writing Dubai",
  },
  digitalMarketer: {
    title: "Social Media Digital Marketing Dubai",
    description: "Grow your presence with Sham Marianas F.Z.C' social media and digital strategies. Targeted campaigns across platforms for maximum UAE engagement.",
    keywords: "social media Dubai, digital marketing UAE, meta ads Dubai",
  },
  ecommerce: {
    title: " E-Commerce Development Dubai, UAE",
    description: "Launch thriving online stores with Sham Marianas F.Z.C' e-commerce solutions. Secure, scalable platforms designed to boost sales for UAE retailers.",
    keywords: "E e-commerce Dubai, online store UAE, Shopify Dubai, WooCommerce Dubai",
  },
  Photography: {
    title: " Photography Video Production Dubai",
    description: " Professional photography and video services creating high-impact visuals for Dubai brands and events.",
    keywords: "photography Dubai, video production UAE, product shoots Dubai",
  },
  printMediaSolutions: {
    title: "Print Media Solutions Dubai, UAE",
    description: "Sham Marianas F.Z.C crafts impactful print for UAE brands: brochures, cards, banners, packaging. Bold design meets strategy—captivate and convert.",
    keywords: "print media Dubai, brochure printing UAE, banners Dubai",
  },
  productDesign: {
    title: "Product Design Agency Dubai, UAE",
    description: "Innovative product design services that transform your ideas into functional, attractive products with user-centric design principles.",
    keywords: " product design Dubai, prototype design UAE, industrial design Dubai",
  },
  uiUxDesign: {
    title: " UI UX Design Services Dubai, UAE",
    description: " User-centric UI/UX design services that combine intuitive interface design with seamless usability to enhance customer experience and engagement.",
    keywords: "UI UX design Dubai, user experience UAE, app design Dubai",
  },
  vfxAndCgiAds: {
    title: "VFX CGI Ads Agency Dubai",
    description: "Create mesmerizing ads with Sham Marianas F.Z.C' VFX and CGI expertise. Cinematic effects and animations that captivate UAE audiences.",
    keywords: "VFX Dubai, CGI ads UAE, motion graphics Dubai",
  },
  webDevelopment: {
    title: "Web Development Company Dubai, UAE",
    description: "Build fast, responsive websites with Sham Marianas F.Z.C. Our expert developers deliver custom solutions powering UAE business growth online.",
    keywords: "web development Dubai, website developer UAE, custom web development Dubai",
  },

  // =========================================================
  //   Blog Categories SEO
  // =========================================================
  blogCategories: {
    business: {
      title: "Business Strategy & Growth Insights | Shammarianas Blog",
      description: "Explore expert business strategy, growth hacking, and entrepreneurial insights from Dubai's leading advertising agency.",
      keywords: "business strategy Dubai, business growth UAE, entrepreneurship tips, startup advice Dubai",
    },
    technology: {
      title: "Technology Trends & Digital Innovation | Shammarianas Blog",
      description: "Stay updated with latest technology trends, digital innovation, and tech insights from UAE's top advertising experts.",
      keywords: "technology trends UAE, digital innovation Dubai, tech insights, digital transformation",
    },
    design: {
      title: "Design Tips & Creative Strategies | Shammarianas Blog",
      description: "Discover creative design tips, branding strategies, and visual communication insights from Dubai's creative agency.",
      keywords: "design tips Dubai, creative strategy UAE, branding design, visual communication",
    },
    lifestyle: {
      title: "Lifestyle & Creative Living Insights | Shammarianas Blog",
      description: "Explore lifestyle insights, creative living tips, and personal development strategies from Dubai's creative community.",
      keywords: "lifestyle Dubai, creative living UAE, personal development, wellness tips",
    },
    ai: {
      title: "AI & Automation Insights | Shammarianas Blog",
      description: "Learn about Artificial Intelligence, automation strategies, and AI tools for business growth from Dubai's tech experts.",
      keywords: "artificial intelligence Dubai, AI automation UAE, machine learning, AI tools for business",
    },
    marketing: {
      title: "Marketing Strategies & Advertising Insights | Shammarianas Blog",
      description: "Get expert marketing strategies, advertising insights, and digital marketing tips from Dubai's top advertising agency.",
      keywords: "marketing strategies Dubai, advertising insights UAE, digital marketing tips, social media marketing",
    },
    // Default for any other category
    default: {
      title: "Blog Category | Shammarianas Blog",
      description: "Explore insightful articles and expert advice from Dubai's leading advertising agency.",
      keywords: "blog articles, expert insights, Dubai advertising agency, UAE business tips",
    }
  },

  // Dynamic Blog SEO Template
  getBlogSEO: (blogData) => {
    if (!blogData) return null;

    const getDescription = () => {
      if (blogData.excerpt && blogData.excerpt.trim()) {
        return blogData.excerpt;
      }

      if (blogData.content) {
        const plainText = blogData.content.replace(/<[^>]*>/g, "").trim();
        return plainText.length > 160
          ? plainText.substring(0, 160) + "..."
          : plainText;
      }

      return "Read this informative article on digital marketing, SEO, and business growth strategies.";
    };

    const getKeywords = () => {
      const baseKeywords = [blogData.title];
      let keywords = [...baseKeywords];

      if (blogData.category) {
        const categoryMap = {
          "business": "Business Strategy",
          "technology": "Technology Trends",
          "design": "Design Tips",
          "lifestyle": "Lifestyle",
          "ai": "Artificial Intelligence AI",
          "marketing": "Marketing Techniques"
        };
        keywords.push(categoryMap[blogData.category] || blogData.category);
      }

      if (blogData.tags && Array.isArray(blogData.tags) && blogData.tags.length > 0) {
        keywords = [...keywords, ...blogData.tags];
      }

      return [...new Set(keywords)].slice(0, 15).join(", ");
    };

    return {
      title: `${blogData.title} | Shammarianas Blog`,
      description: getDescription(),
      keywords: getKeywords(),
      ogImage: blogData.featuredImageUrl || blogData.featureImgUrl || blogData.coverImageUrl || "/assets/imgs/og-default.jpg",
      twitterImage: blogData.featuredImageUrl || blogData.featureImgUrl || blogData.coverImageUrl || "/assets/imgs/twitter-default.jpg",
      ogType: "article",
      twitterCard: "summary_large_image",
      publishedTime: blogData.publishedAt ? blogData.publishedAt.toDate().toISOString() : new Date().toISOString(),
      author: blogData.author || "Shammarianas Team",
      section: blogData.category || "Digital Marketing"
    };
  },

  // =========================================================
  //   Digital Assets & Products SEO
  // =========================================================

  // ✅ ASSET/VIEW PAGE DYNAMIC SEO
  getAssetSEO: (assetData) => {
    if (!assetData || !assetData.title) return null;

    // Asset type mapping for better display
    const assetTypeMap = {
      "videos": "Stock Video",
      "models": "3D Model",
      "video-templates": "Video Template",
      "images": "Stock Image",
      "graphics": "Graphic Template",
      "mockups": "Mockup",
      "fonts": "Font",
      "icons": "Icon Set",
      "textures": "Texture",
      "scripts": "Script",
      "hdris": "HDRI",
      "printables": "Printable",
      "more": "Digital Asset"
    };

    const assetType = assetTypeMap[assetData.type] || "Digital Asset";
    const priceType = assetData.price === "free" ? "Free" : "Premium";

    // Clean description
    const cleanDescription = () => {
      if (assetData.description) {
        const plainText = assetData.description
          .replace(/<[^>]*>/g, "")
          .replace(/\[.*?\]\(.*?\)/g, '')
          .replace(/#{1,6}\s*/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/`/g, '')
          .replace(/\n/g, ' ')
          .trim();

        return plainText.length > 160
          ? plainText.substring(0, 160) + "..."
          : plainText;
      }

      return `${assetData.title} - High quality ${assetType.toLowerCase()} available for ${priceType.toLowerCase()} download on Shammarianas.`;
    };

    // Generate keywords
    const getKeywords = () => {
      const baseKeywords = [assetData.title, assetType, priceType, "Download"];

      if (assetData.tags && Array.isArray(assetData.tags)) {
        baseKeywords.push(...assetData.tags.slice(0, 8));
      }

      if (assetData.category) {
        baseKeywords.push(assetData.category);
      }

      return [...new Set(baseKeywords)].slice(0, 15).join(", ");
    };

    // Get appropriate image
    const getImage = () => {
      return assetData.thumbnail ||
        assetData.previewImage ||
        assetData.featuredImage ||
        "/assets/imgs/default-asset.jpg";
    };

    return {
      title: `${assetData.title} - ${priceType} ${assetType} | Shammarianas`,
      description: cleanDescription(),
      keywords: getKeywords(),
      canonical: `https://www.shammarianas.com/view/${assetData.slug || assetData.id}`,
      ogImage: getImage(),
      twitterImage: getImage(),
      ogType: "product",
      twitterCard: "summary_large_image",
      // Additional structured data props
      price: assetData.price === 'free' ? '0' : 'premium',
      assetType: assetType,
      // For structured data
      author: assetData.username || "Shammarianas Contributor",
      fileFormat: assetData.fileFormat || "Various",
      fileSize: assetData.fileSize || "N/A",
      license: assetData.license || "Royalty Free"
    };
  },

  // ✅ CATEGORY PAGES SEO
  getCategorySEO: (categoryName, categorySlug) => {
    const categoryMap = {
      "videos": {
        title: "Stock Videos | Shammarianas - HD & 4K Footage",
        description: "Browse premium stock videos, HD and 4K footage for films, commercials, and social media. Royalty-free video downloads.",
        keywords: "Stock Videos, HD Footage, 4K Videos, Royalty-Free Videos, Video Clips, Background Videos",
        ogImage: "/assets/imgs/categories/videos-og.jpg"
      },
      "models": {
        title: "3D Models | Shammarianas - 3D Assets & CGI Models",
        description: "High-quality 3D models for animation, gaming, and design. Ready-to-use assets for Blender, Maya, 3ds Max.",
        keywords: "3D Models, 3D Assets, CGI Models, Animation Models, Game Assets, Blender Models",
        ogImage: "/assets/imgs/categories/3d-models-og.jpg"
      },
      "video-templates": {
        title: "Video Templates | Shammarianas - Motion Graphics",
        description: "Professional video templates for After Effects, Premiere Pro. Motion graphics, intros, and social media templates.",
        keywords: "Video Templates, After Effects Templates, Premiere Pro Templates, Motion Graphics, Social Media Templates",
        ogImage: "/assets/imgs/categories/video-templates-og.jpg"
      },
      "images": {
        title: "Stock Images | Shammarianas - High-Resolution Photos",
        description: "Download stunning stock photos and images for websites, marketing, and creative projects. Royalty-free high-resolution photos.",
        keywords: "Stock Photos, Royalty-Free Images, High-Resolution Photos, Background Images, Commercial Photos",
        ogImage: "/assets/imgs/categories/images-og.jpg"
      },
      "graphics": {
        title: "Graphic Templates | Shammarianas - Design Assets",
        description: "Creative graphic templates for Photoshop, Illustrator. Social media posts, banners, flyers, and business cards.",
        keywords: "Graphic Templates, Photoshop Templates, Illustrator Templates, Social Media Templates, Design Templates",
        ogImage: "/assets/imgs/categories/graphics-og.jpg"
      },
      "mockups": {
        title: "Mockups | Shammarianas - Product Presentation",
        description: "Realistic product mockups for branding and presentation. App mockups, packaging, stationery, and device mockups.",
        keywords: "Product Mockups, App Mockups, Packaging Mockups, Device Mockups, Branding Mockups",
        ogImage: "/assets/imgs/categories/mockups-og.jpg"
      },
      "fonts": {
        title: "Fonts | Shammarianas - Typography & Typefaces",
        description: "Beautiful typography and font collections for web and print. Modern, classic, and decorative fonts.",
        keywords: "Fonts, Typography, Web Fonts, Google Fonts, Display Fonts, Script Fonts",
        ogImage: "/assets/imgs/categories/fonts-og.jpg"
      },
      "icons": {
        title: "Icons | Shammarianas - Icon Sets & UI Assets",
        description: "Icon sets for UI/UX design and applications. Vector icons, app icons, and web icons in multiple formats.",
        keywords: "Icons, UI Icons, App Icons, Vector Icons, Icon Sets, Web Icons",
        ogImage: "/assets/imgs/categories/icons-og.jpg"
      },
      "textures": {
        title: "Textures | Shammarianas - Seamless Textures",
        description: "High-resolution textures for 3D modeling and design. Seamless textures, materials, and patterns.",
        keywords: "Textures, Seamless Textures, 3D Textures, Materials, Patterns, Background Textures",
        ogImage: "/assets/imgs/categories/textures-og.jpg"
      },
      "scripts": {
        title: "Scripts | Shammarianas - Automation & Plugins",
        description: "Useful scripts and plugins for creative software. Automation tools and productivity enhancers.",
        keywords: "Scripts, Plugins, Automation Scripts, Photoshop Scripts, Blender Scripts, Productivity Tools",
        ogImage: "/assets/imgs/categories/scripts-og.jpg"
      },
      "hdris": {
        title: "HDRIs | Shammarianas - HDRI Environments",
        description: "HDRI environments for realistic 3D rendering. Studio lighting, outdoor scenes, and panoramic environments.",
        keywords: "HDRI, HDR Environments, Panoramic Images, Lighting HDRIs, Studio HDRIs, Outdoor HDRIs",
        ogImage: "/assets/imgs/categories/hdris-og.jpg"
      },
      "hot": {
        title: "Trending Assets | Shammarianas - Popular Downloads",
        description: "Trending and popular assets on Shammarianas. Best-selling and most downloaded creative resources.",
        keywords: "Trending Assets, Popular Downloads, Best Sellers, Featured Assets, Top Downloads",
        ogImage: "/assets/imgs/categories/hot-og.jpg"
      }
    };

    const defaultSEO = {
      title: `${categoryName} | Shammarianas - Digital Assets`,
      description: `Browse through a wide range of ${categoryName} on Shammarianas. Download premium digital assets for your creative projects.`,
      keywords: `${categoryName}, Digital Assets, Creative Resources, Downloadable Files, ${categoryName} Collection`,
      ogImage: "/assets/imgs/categories/default-og.jpg"
    };

    return categoryMap[categorySlug] || defaultSEO;
  },

  // =========================================================
  //   Portfolio & Project SEO
  // =========================================================
  portfolio: {
    title: "Sham Marianas F.Z.C Portfolio | Dubai Creative Projects ",
    description: "Explore Shammarianas portfolio of successful projects including web design, development, digital marketing, and branding solutions.",
    keywords: "Portfolio, Projects, Case Studies, Web Design, Development, Digital Marketing, Branding",
  },

  getProjectSEO: (projectData) => {
    if (!projectData) return null;

    const baseKeywords = ["Portfolio Project", "Case Study", "Shammarianas"];
    const categoryKeywords = {
      design: ["UI/UX Design", "Graphic Design", "Visual Design"],
      development: ["Web Development", "Custom Website", "Application"],
      marketing: ["Digital Marketing", "SEO", "Social Media"],
      printing: ["Print Design", "Printing", "Packaging"]
    };

    const keywords = [
      ...baseKeywords,
      ...(categoryKeywords[projectData.category] || []),
      projectData.title,
      projectData.client,
      projectData.category.charAt(0).toUpperCase() + projectData.category.slice(1)
    ].filter(Boolean).slice(0, 10).join(", ");

    const description = projectData.challengeDescription
      ? `${projectData.title} - ${projectData.challengeDescription.substring(0, 120)}...`
      : `${projectData.title} - A ${projectData.category} project${projectData.client ? ' for ' + projectData.client : ''} by Shammarianas.`;

    return {
      title: `${projectData.title} - Shammarianas Portfolio`,
      description: description.length > 160 ? description.substring(0, 160) + '...' : description,
      keywords: keywords,
      ogImage: projectData.featureImgUrl || projectData.coverImgUrl || "/assets/imgs/og-default.jpg",
      twitterImage: projectData.featureImgUrl || projectData.coverImgUrl || "/assets/imgs/twitter-default.jpg",
      ogType: "article",
      twitterCard: "summary_large_image"
    };
  },

  privacy: {
    title: " Privacy Policy | Sham Marianas F.Z.C Dubai",
    description: "Sham Marianas F.Z.C Privacy Policy details how we protect your data in Dubai per UAE standards for advertising services. Review our secure practices",
     keywords: " privacy policy, Dubai agency, Sham Marianas F.Z.C data protection, UAE privacy advertising",
  },

  terms: {
    title: " Terms & Conditions | Sham Marianas F.Z.C Dubai",
    description: " Sham Marianas F.Z.C' Terms and Conditions govern our Dubai advertising, branding, and AI services. Please review them for secure engagement.",
    keywords: "terms and conditions Dubai agency, Sham Marianas F.Z.C T&C, advertising terms Dubai",
  },

  contact: {
    title: "Contact Sham Marianas F.Z.C | Dubai Agency",
    description: " Reach out to Sham Marianas F.Z.C for Dubai advertising and branding. Our team elevates UAE businesses—connect now!",
    keywords: "contact Sham Marianas F.Z.C Dubai, advertising agency UAE, branding inquiry Dubai, AI services contact UAE",
  },

  // =========================================================
  //   Legal & Authentication Pages
  // =========================================================

  login: {
    title: "Login | Shammarianas",
    description: "Access Shammarianas features through login. Contributors share work, users explore resources",
    keywords: " secure login, platform access",
    robots: "noindex, follow"
  },

  signup: {
    title: "Sign Up | Shammarianas - Create Account",
    description: "Create your free Shammarianas account to access digital marketing tools, portfolio features, and exclusive resources.",
    keywords: "Sign Up Shammarianas, Create Account, Register, Join Shammarianas, Digital Marketing Account",
    robots: "noindex, follow"
  },

  forgotPassword: {
    title: "Forgot Password | Shammarianas",
    description: "Reset your Shammarianas account password. Enter your email to receive password reset instructions.",
    keywords: "Forgot Password, Password Reset, Account Recovery, Reset Login",
    robots: "noindex, nofollow"
  },

  contributorLogin: {
    title: " Contribute Login | Shammarianas Marketplace",
    description: "Sham Marianas F.Z.C Marketplace: Upload 3D, videos, textures & assets to earn. Get the dashboard, download everything, and use it freely.",
    keywords: "contribute assets, upload 3D marketplace, login download assets, contributor marketplace, upload videos earn, asset dashboard"
  },

  contributorSignup: {
    title: " Register | Shammarianas Marketplace",
    description: "Join Shammarianas by registering. Gain contributor status for asset sharing and project access.",
    keywords: " sign up contributor, new account assets, register marketplace, join Shammarianas, contributor access"
  },

  contributorForgotPassword: {
    title: " Password Recovery Shammarianas",
    description: "Recover Shammarianas access via email. Quick reset restores full platform features securely.Enter registered email to receive Shammarianas password reset link. Submit for instant recovery—sign in once restored",
    keywords: "password recovery, account reset, Shammarianas access, contributor password, secure reset",
    robots: "noindex, nofollow"
  },

  templates: {
    title: "Templates | Sham Marianas F.Z.C Dubai Designs",
    description: "Check out Sham Marianas F.Z.C' ready-to-use website templates. Modern, easy-to-customize designs perfect for UAE businesses. Get online quickly and grow your brand!",
    keywords: " Sham Marianas F.Z.C Website templates, Get online fast, Brand styles, Business growth"
  },

  // =========================================================
  //   Asset Types Default Images
  // =========================================================
  // assetDefaults: {
  //   videos: {
  //     ogImage: "/assets/imgs/categories/videos-og.jpg",
  //     twitterImage: "/assets/imgs/categories/videos-twitter.jpg"
  //   },
  //   models: {
  //     ogImage: "/assets/imgs/categories/3d-models-og.jpg",
  //     twitterImage: "/assets/imgs/categories/3d-models-twitter.jpg"
  //   },
  //   "video-templates": {
  //     ogImage: "/assets/imgs/categories/video-templates-og.jpg",
  //     twitterImage: "/assets/imgs/categories/video-templates-twitter.jpg"
  //   },
  //   images: {
  //     ogImage: "/assets/imgs/categories/images-og.jpg",
  //     twitterImage: "/assets/imgs/categories/images-twitter.jpg"
  //   },
  //   graphics: {
  //     ogImage: "/assets/imgs/categories/graphics-og.jpg",
  //     twitterImage: "/assets/imgs/categories/graphics-twitter.jpg"
  //   },
  //   mockups: {
  //     ogImage: "/assets/imgs/categories/mockups-og.jpg",
  //     twitterImage: "/assets/imgs/categories/mockups-twitter.jpg"
  //   },
  //   fonts: {
  //     ogImage: "/assets/imgs/categories/fonts-og.jpg",
  //     twitterImage: "/assets/imgs/categories/fonts-twitter.jpg"
  //   },
  //   icons: {
  //     ogImage: "/assets/imgs/categories/icons-og.jpg",
  //     twitterImage: "/assets/imgs/categories/icons-twitter.jpg"
  //   },
  //   textures: {
  //     ogImage: "/assets/imgs/categories/textures-og.jpg",
  //     twitterImage: "/assets/imgs/categories/textures-twitter.jpg"
  //   },
  //   scripts: {
  //     ogImage: "/assets/imgs/categories/scripts-og.jpg",
  //     twitterImage: "/assets/imgs/categories/scripts-twitter.jpg"
  //   },
  //   hdris: {
  //     ogImage: "/assets/imgs/categories/hdris-og.jpg",
  //     twitterImage: "/assets/imgs/categories/hdris-twitter.jpg"
  //   },
  //   hot: {
  //     ogImage: "/assets/imgs/categories/hot-og.jpg",
  //     twitterImage: "/assets/imgs/categories/hot-twitter.jpg"
  //   }
  // },


  contributerPolices: {
    title: "Website Templates - Shammarianas | Professional Designs",
    description: "Browse professional website templates and designs from Shammarianas. Responsive templates for businesses, portfolios, and e-commerce.",
    keywords: "Website Templates, Web Design Templates, Professional Templates, Responsive Templates, Business Templates"
  },
  pricesFees: {
    title: "Pricing & Fees | Shammarianas",
    description: " View Shammarianas' pricing: asset download fees, seller commissions, payout thresholds. Clear costs for 3D models, videos, textures, and creative resources.",
    keywords: "marketplace pricing fees, asset commissions, download costs, seller payouts"
  },
  privacyPolicyTemplate: {
    title: "Privacy Policy Template | Shammarianas",
    description: "Download Shammarianas privacy policy template for your 3D/video marketplace. Covers user data, cookies, sharing practices, and legal compliance requirements",
    keywords: "privacy policy template, marketplace data protection, contributor privacy template, asset site compliance"
  },
  sellerGuidlines: {
    title: "Website Templates - Shammarianas | Professional Designs",
    description: "Browse professional website templates and designs from Shammarianas. Responsive templates for businesses, portfolios, and e-commerce.",
    keywords: "Website Templates, Web Design Templates, Professional Templates, Responsive Templates, Business Templates"
  },
  termsConditionTemplate: {
    title: "Terms & Conditions Template | Shammarianas",
    description: "Shammarianas terms template covers payments, liabilities, conduct for asset platform. Essential legal clauses protect operations and users.",
    keywords: "service terms template, platform rules agreement"
  }
};




