// utils/seoConfig.js
export const SEO_CONFIG = {
  home: {
    title: "Shammarianas - Top Digital Marketing Agency",
    description: "Sham Marianas is a top advertising agency that helps businesses grow with digital marketing, brand building, and ROI-focused advertising.",
    keywords: "Web development, Digital Marketing, SEO, Social Media Marketing, Branding, Advertising Agency",
    // canonical: "https://www.shammarianas.com"
  },
  about: {
    title: "About Us - Shammarianas | Our Story & Mission",
    description: "Learn about Shammarianas - our mission, vision, and team. We are a leading digital marketing agency with expertise in web development, SEO, and brand building.",
    keywords: "About Shammarianas, Our Mission, Our Team, Company History, Digital Marketing Experts",
    // canonical: "https://www.shammarianas.com/about"
  },
  services: {
    title: "Our Services - Shammarianas | Digital Marketing Solutions",
    description: "Explore our comprehensive digital marketing services including Web Development, SEO, Social Media Marketing, Branding, and more to grow your business.",
    keywords: "Digital Marketing Services, Web Development Services, SEO Services, Social Media Marketing, Branding Services",
    // canonical: "https://www.shammarianas.com/services"
  },

  // BLOG PAGES SEO
  blogHome: {
    title: "Blog - Shammarianas | Digital Marketing Insights & Tips",
    description: "Get the latest insights, tips and trends in digital marketing, SEO, social media, and business growth from Shammarianas experts.",
    keywords: "Digital Marketing Blog, SEO Tips, Marketing Strategies, Business Growth, Content Marketing, Social Media Tips",
    // canonical: "https://www.shammarianas.com/blogs"
  },

  // DYNAMIC BLOG SEO TEMPLATE
  getBlogSEO: (blogData) => {
    if (!blogData) return null;

    // Clean content se description create karo
    const getDescription = () => {
      if (blogData.excerpt && blogData.excerpt.trim()) {
        return blogData.excerpt;
      }

      if (blogData.content) {
        // Remove HTML tags
        const plainText = blogData.content.replace(/<[^>]*>/g, "").trim();
        // Take first 160 characters
        return plainText.length > 160
          ? plainText.substring(0, 160) + "..."
          : plainText;
      }

      return "Read this informative article on digital marketing, SEO, and business growth strategies.";
    };

    // Keywords/Tags se create karo
    const getKeywords = () => {
      const baseKeywords = [""];
      let keywords = [...baseKeywords];

      // Add category
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

      // Add tags if available
      if (blogData.tags && Array.isArray(blogData.tags) && blogData.tags.length > 0) {
        keywords = [...keywords, ...blogData.tags];
      }

      // Remove duplicates and join
      return [...new Set(keywords)].slice(0, 15).join(", ");
    };

    return {
      title: `${blogData.title} | Shammarianas Blog`,
      description: getDescription(),
      keywords: getKeywords(),
      canonical: `https://www.shammarianas.com/blog/${blogData.id || blogData.slug || ''}`,
      ogImage: blogData.featuredImageUrl || blogData.featureImgUrl || blogData.coverImageUrl || "/assets/imgs/og-default.jpg",
      twitterImage: blogData.featuredImageUrl || blogData.featureImgUrl || blogData.coverImageUrl || "/assets/imgs/twitter-default.jpg",
      ogType: "article",
      twitterCard: "summary_large_image",
      // Article specific meta
      publishedTime: blogData.publishedAt ? blogData.publishedAt.toDate().toISOString() : new Date().toISOString(),
      author: blogData.author || "Shammarianas Team",
      section: blogData.category || "Digital Marketing"
    };
  },

  // BLOG CATEGORIES SEO
  blogCategories: {
    business: {
      title: "Business Strategy Blog - Shammarianas",
      description: "Expert insights on business strategy, growth hacking, entrepreneurship and company development from Shammarianas.",
      keywords: "Business Strategy, Entrepreneurship, Business Growth, Startup Tips, Company Development",
      // canonical: "https://www.shammarianas.com/blogs/category/business"
    },
    technology: {
      title: "Technology Trends Blog - Shammarianas",
      description: "Latest technology trends, digital innovations, tech news and software insights from Shammarianas experts.",
      keywords: "Technology Trends, Digital Innovation, Tech News, Software Development, Emerging Technologies",
      // canonical: "https://www.shammarianas.com/blogs/category/technology"
    },
    design: {
      title: "Design Tips & Inspiration - Shammarianas Blog",
      description: "UI/UX design tips, web design inspiration, graphic design trends and creative insights from Shammarianas.",
      keywords: "UI Design, UX Design, Web Design, Graphic Design, Creative Inspiration",
      // canonical: "https://www.shammarianas.com/blogs/category/design"
    },
    lifestyle: {
      title: "Lifestyle & Productivity Blog - Shammarianas",
      description: "Tips for work-life balance, productivity hacks, lifestyle improvements and personal development from Shammarianas.",
      keywords: "Lifestyle Tips, Productivity Hacks, Work Life Balance, Personal Development, Self Improvement",
      // canonical: "https://www.shammarianas.com/blogs/category/lifestyle"
    },
    ai: {
      title: "AI & Machine Learning Blog - Shammarianas",
      description: "Latest AI developments, machine learning insights, artificial intelligence applications and tech innovations.",
      keywords: "Artificial Intelligence, Machine Learning, AI Applications, Deep Learning, Tech Innovation",
      // canonical: "https://www.shammarianas.com/blogs/category/ai"
    },
    marketing: {
      title: "Marketing Strategies Blog - Shammarianas",
      description: "Digital marketing strategies, advertising techniques, brand building and marketing insights from industry experts.",
      keywords: "Marketing Strategies, Digital Advertising, Brand Building, Marketing Tips, Campaign Strategies",
      // canonical: "https://www.shammarianas.com/blogs/category/marketing"
    }
  },

  // MORE PAGES
  contact: {
    title: "Contact Us - Shammarianas | Get in Touch",
    description: "Get in touch with Shammarianas for digital marketing solutions, SEO services, and business growth strategies. Contact us today!",
    keywords: "Contact Shammarianas, Get Quote, Digital Marketing Consultation, Business Inquiry, Support",
    // canonical: "https://www.shammarianas.com/contact"
  },

  portfolio: {
    title: "Portfolio - Shammarianas | Our Projects & Work",
    description: "Explore Shammarianas portfolio of successful projects including web design, development, digital marketing, and branding solutions.",
    keywords: "Portfolio, Projects, Case Studies, Web Design, Development, Digital Marketing, Branding",
    // canonical auto-generated hoga
  },

  // Portfolio category specific
  portfolioCategories: {
    design: {
      title: "Design Portfolio - Shammarianas | UI/UX & Graphic Design",
      description: "Browse our design portfolio featuring stunning UI/UX designs, branding solutions, and creative graphic design projects.",
      keywords: "UI Design Portfolio, UX Design, Graphic Design, Brand Identity, Logo Design"
    },
    development: {
      title: "Web Development Portfolio - Shammarianas",
      description: "Explore our web development projects including custom websites, web applications, and e-commerce solutions.",
      keywords: "Web Development Portfolio, Custom Websites, Web Applications, E-commerce Development"
    },
    marketing: {
      title: "Digital Marketing Portfolio - Shammarianas",
      description: "View our successful digital marketing campaigns, SEO projects, and social media marketing case studies.",
      keywords: "Digital Marketing Portfolio, SEO Projects, Social Media Campaigns, Marketing Case Studies"
    },
    printing: {
      title: "Printing Portfolio - Shammarianas | Print Design Projects",
      description: "Check out our printing portfolio featuring brochure designs, business cards, packaging, and other print materials.",
      keywords: "Printing Portfolio, Brochure Design, Business Cards, Packaging Design, Print Materials"
    }
  },

  // Dynamic project SEO
  getProjectSEO: (projectData) => {
    if (!projectData) return null;

    const baseKeywords = ["Portfolio Project", "Case Study", "Shammarianas"];

    // Category specific keywords
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

    // Create description
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
    title: "Privacy Policy - Shammarianas",
    description: "Read Shammarianas privacy policy to understand how we collect, use, and protect your personal information.",
    keywords: "Privacy Policy, Data Protection, Terms of Service, Legal, Compliance",
    // canonical: "https://www.shammarianas.com/privacy"
  },

  terms: {
    title: "Terms of Service - Shammarianas",
    description: "Terms and conditions for using Shammarianas website and services. Please read carefully.",
    keywords: "Terms of Service, Legal Terms, User Agreement, Conditions, Policy",
    // canonical: "https://www.shammarianas.com/terms"
  },



  // =========================================================
  //   Template page SEO
  // =========================================================

 login: {
    title: "Login | Shammarianas - Digital Marketing Platform",
    description: "Login to your Shammarianas account to access digital marketing tools, portfolio management, and exclusive resources.",
    keywords: "Login Shammarianas, Sign In, Account Access, Digital Marketing Login, Portfolio Dashboard",
    robots: "noindex, follow" // ✅ Important
  },
  
  signup: {
    title: "Sign Up | Shammarianas - Create Account",
    description: "Create your free Shammarianas account to access digital marketing tools, portfolio features, and exclusive resources.",
    keywords: "Sign Up Shammarianas, Create Account, Register, Join Shammarianas, Digital Marketing Account",
    robots: "noindex, follow" // ✅ Important
  },
  
  forgotPassword: {
    title: "Forgot Password | Shammarianas",
    description: "Reset your Shammarianas account password. Enter your email to receive password reset instructions.",
    keywords: "Forgot Password, Password Reset, Account Recovery, Reset Login",
    robots: "noindex, nofollow" // ✅ Important
  },

  contributorLogin: {
    title: "Contributor Login - Shammarianas | Access Your Contributor Account",
    description: "Login to your Shammarianas contributor account to manage your articles, blogs, and content submissions.",
    keywords: "Contributor Login, Content Submission, Blog Management, Article Contributor"
  },

  templates: {
    title: "Website Templates - Shammarianas | Professional Designs",
    description: "Browse professional website templates and designs from Shammarianas. Responsive templates for businesses, portfolios, and e-commerce.",
    keywords: "Website Templates, Web Design Templates, Professional Templates, Responsive Templates, Business Templates"
  },

   // Dynamic category SEO generator
  getCategorySEO: (categoryName, categorySlug) => {
    const categoryMap = {
      "videos": {
        title: "Stock Videos | Shammarianas - HD & 4K Footage",
        description: "Browse premium stock videos, HD and 4K footage for films, commercials, and social media.",
        keywords: "Stock Videos, HD Footage, 4K Videos, Royalty-Free Videos, Video Clips",
        ogImage: "/assets/imgs/categories/videos-og.jpg"
      },
      "models": {
        title: "3D Models | Shammarianas - 3D Assets & CGI Models",
        description: "High-quality 3D models for animation, gaming, and design. Ready-to-use assets.",
        keywords: "3D Models, 3D Assets, CGI Models, Animation Models, Game Assets",
        ogImage: "/assets/imgs/categories/3d-models-og.jpg"
      },
      "video-templates": {
        title: "Video Templates | Shammarianas - Motion Graphics",
        description: "Professional video templates for After Effects, Premiere Pro. Motion graphics and intros.",
        keywords: "Video Templates, After Effects Templates, Motion Graphics, Social Media Templates",
        ogImage: "/assets/imgs/categories/video-templates-og.jpg"
      },
      "images": {
        title: "Stock Images | Shammarianas - High-Resolution Photos",
        description: "Download stunning stock photos and images for websites, marketing, and creative projects.",
        keywords: "Stock Photos, Royalty-Free Images, High-Resolution Photos, Background Images",
        ogImage: "/assets/imgs/categories/images-og.jpg"
      },
      // ... add all other categories
    };

    const defaultSEO = {
      title: `${categoryName} | Shammarianas - Digital Assets`,
      description: `Browse through a wide range of ${categoryName} on Shammarianas. Premium digital assets.`,
      keywords: `${categoryName}, Digital Assets, Creative Resources, Downloadable Files`,
      ogImage: "/assets/imgs/categories/default-og.jpg"
    };

    return categoryMap[categorySlug] || defaultSEO;
  },

  

};

