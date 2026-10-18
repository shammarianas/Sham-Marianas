// prerender.js
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_URL = 'https://www.shammarianas.com';
const DIST_DIR = path.resolve(process.env.PRERENDER_DIST_DIR || path.join(__dirname, 'dist'));
const PORT = Number.parseInt(process.env.PRERENDER_PORT || '4173', 10);
const publishedBlogs = new Map();

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error(`Invalid PRERENDER_PORT: ${process.env.PRERENDER_PORT}`);
}

// Standalone Firebase config (Node.js safe, no window dependencies)
const firebaseConfig = {
  apiKey: "AIzaSyCC_cEqxB99hMW16aowMs6AJ3-k52VasW0",
  authDomain: "sham-marianas.firebaseapp.com",
  projectId: "sham-marianas",
  storageBucket: "sham-marianas.firebasestorage.app",
  messagingSenderId: "607689609153",
  appId: "1:607689609153:web:3d76a1c337979a691a6940",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

// 1. Static HTTP server for serving dist/ during pre-rendering
function startStaticServer(fallbackHtml) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
        let filePath = path.join(DIST_DIR, urlPath);

        // Direct file match
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        // SPA Navigation fallback
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackHtml);
      } catch (_err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`🌐 Local pre-render server listening on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

// Some managed/macOS environments block Chromium's Mach rendezvous service.
// Keep the production pipeline usable there by writing crawlable SPA shells
// with route-specific metadata when a browser cannot be launched.
const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const plainText = (value = '') => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function buildFallbackHtml(baseHtml, route) {
  const blog = publishedBlogs.get(route);
  const isBlogListing = route === '/blog';
  const isBlogDetail = Boolean(blog);
  const categoryMatch = route.match(/^\/blog-category\/([^/]+)$/);
  const blogCategory = categoryMatch
    ? decodeURIComponent(categoryMatch[1]).toLowerCase()
    : null;
  const isBlogCategory = Boolean(blogCategory);
  const categoryLabel = blogCategory === 'ai'
    ? 'AI'
    : blogCategory
      ? blogCategory.charAt(0).toUpperCase() + blogCategory.slice(1)
      : '';
  const categoryPosts = isBlogCategory
    ? [...publishedBlogs.values()].filter(
      (post) => (post.category || 'business').toString().toLowerCase() === blogCategory
    )
    : [];
  const labels = {
    '/': 'Sham Marianas F.Z.C | Marketing Agency in Dubai, UAE',
    '/about': "About Sham Marianas F.Z.C | Dubai's Top Marketing Agency",
    '/services': 'Dubai Marketing Agency Services | Sham Marianas F.Z.C.',
    '/case-study': 'Sham Marianas F.Z.C Portfolio | Dubai Creative Projects',
    '/blog': 'Digital Marketing & IT Solutions Blog | Sham Marianas',
    '/contact-us': 'Contact Sham Marianas F.Z.C | Dubai Agency',
    '/templates': 'Templates | Sham Marianas F.Z.C Dubai Designs',
  };
  const categoryTitles = {
    business: 'Dubai Business & Marketing Blog | Sham Marianas',
    technology: 'Technology & Digital Innovation Blog | Sham Marianas',
    design: 'Design & Branding Blog | Sham Marianas',
    lifestyle: 'Lifestyle & Creative Insights Blog | Sham Marianas',
    ai: 'AI & Automation Blog | Sham Marianas',
    marketing: 'Digital Marketing & Advertising Blog | Sham Marianas',
  };
  const title = isBlogDetail
    ? `${blog.title} | Sham Marianas Blog`
    : isBlogCategory
      ? categoryTitles[blogCategory] || `${categoryLabel} Blog | Sham Marianas`
    : labels[route] || `${route.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Sham Marianas'} | Sham Marianas F.Z.C.`;
  const canonical = `${SITE_URL}${route === '/' ? '/' : route}`;
  const description = isBlogListing
    ? 'Explore the Sham Marianas blog for expert insights on digital marketing, IT solutions, branding, web design, and business growth strategies in Dubai.'
    : isBlogCategory
      ? `Explore ${categoryLabel} marketing, technology, branding, and business insights from Sham Marianas.`
    : isBlogDetail
      ? plainText(blog.excerpt || blog.content).slice(0, 160) || 'Read expert digital marketing and business growth insights from Sham Marianas.'
      : 'Sham Marianas F.Z.C. provides advertising, branding, digital marketing and creative services in Dubai, UAE.';
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const metadata = `
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${safeCanonical}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeCanonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${SITE_URL}/assets/imgs/arrow-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${SITE_URL}/assets/imgs/arrow-image.png" />`;
  // Keep the fallback shell crawlable even when Puppeteer cannot run. The
  // React homepage renders this heading after hydration, but crawlers that
  // only receive the static shell still need a real H1 to evaluate.
  const blogListingContent = isBlogListing
    ? `<main class="seo-fallback-content">
        <h1>Blog</h1>
        <p>${escapeHtml(description)}</p>
        <nav aria-label="Blog categories">
          ${['business', 'technology', 'design', 'lifestyle', 'ai', 'marketing'].map((category) => `<a href="/blog-category/${category}">${escapeHtml(category === 'ai' ? 'AI' : category.charAt(0).toUpperCase() + category.slice(1))}</a>`).join(' ')}
        </nav>
        <ul>${[...publishedBlogs.values()].map((post) => `<li><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title || 'Untitled blog')}</a>${post.excerpt ? `: ${escapeHtml(plainText(post.excerpt))}` : ''}</li>`).join('')}</ul>
        <nav aria-label="Blog pagination">
          ${Array.from({ length: Math.ceil(publishedBlogs.size / 10) }, (_, index) => {
            const page = index + 1;
            return `<a href="/blog${page > 1 ? `?page=${page}` : ''}"${page === 1 ? ' aria-current="page"' : ''}>${page}</a>`;
          }).join(' ')}
        </nav>
      </main>`
    : '';
  const blogCategoryContent = isBlogCategory
    ? `<main class="seo-fallback-content">
        <h1>${escapeHtml(categoryLabel)} Blog</h1>
        <p>${escapeHtml(description)}</p>
        <nav aria-label="Blog categories">
          ${['business', 'technology', 'design', 'lifestyle', 'ai', 'marketing'].map((category) => `<a href="/blog-category/${category}"${category === blogCategory ? ' aria-current="page"' : ''}>${escapeHtml(category === 'ai' ? 'AI' : category.charAt(0).toUpperCase() + category.slice(1))}</a>`).join(' ')}
        </nav>
        <ul>${categoryPosts.map((post) => `<li><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title || 'Untitled blog')}</a>${post.excerpt ? `: ${escapeHtml(plainText(post.excerpt))}` : ''}</li>`).join('')}</ul>
      </main>`
    : '';
  const blogDetailContent = isBlogDetail
    ? `<article class="seo-fallback-content">
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> /
          <a href="/blog">Blog</a> /
          <a href="/blog-category/${encodeURIComponent((blog.category || 'business').toString().toLowerCase())}">${escapeHtml(blog.category || 'Business')}</a> /
          <span aria-current="page">${escapeHtml(blog.title || 'Blog article')}</span>
        </nav>
        <p><a href="/blog-category/${encodeURIComponent((blog.category || 'business').toString().toLowerCase())}">${escapeHtml(blog.category || 'Business')}</a></p>
        <h1>${escapeHtml(blog.title || 'Blog article')}</h1>
        ${blog.excerpt ? `<p>${escapeHtml(plainText(blog.excerpt))}</p>` : ''}
        ${blog.content ? `<div><p>${escapeHtml(plainText(blog.content))}</p></div>` : ''}
        <nav aria-label="Related blog posts">
          ${[...publishedBlogs.values()]
            .filter((post) => post.slug !== blog.slug && (post.category || 'business').toString().toLowerCase() === (blog.category || 'business').toString().toLowerCase())
            .slice(0, 3)
            .map((post) => `<a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title || 'Related blog post')}</a>`)
            .join(' ')}
        </nav>
      </article>`
    : '';
  const schemaPosts = isBlogCategory
    ? categoryPosts
    : isBlogListing
      ? [...publishedBlogs.values()]
      : [];
  const schemaUrl = isBlogCategory ? `${SITE_URL}${route}` : `${SITE_URL}/blog`;
  const schemaName = isBlogCategory
    ? `${categoryLabel} Blog | Sham Marianas`
    : 'Digital Marketing, SEO, AI & Branding Blog';
  const schemaArticleNodes = schemaPosts
    .filter((post) => post.slug || post.id)
    .map((post) => {
      const articleUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug || post.id)}`;
      return {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        "url": articleUrl,
        "headline": post.title || 'Blog article',
        "description": plainText(post.excerpt || post.content || ''),
        "author": { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
        "publisher": { "@id": `${SITE_URL}/#organization` }
      };
    });
  const structuredData = (isBlogListing || isBlogCategory)
    ? `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          "name": "Sham Marianas F.Z.C.",
          "url": `${SITE_URL}/`
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          "url": `${SITE_URL}/`,
          "name": "Sham Marianas F.Z.C.",
          "publisher": { "@id": `${SITE_URL}/#organization` }
        },
        {
          "@type": "Blog",
          "@id": `${schemaUrl}#blog`,
          "url": schemaUrl,
          "name": schemaName,
          "publisher": { "@id": `${SITE_URL}/#organization` },
          "blogPost": schemaArticleNodes.map((post) => ({ "@id": post["@id"] }))
        },
        {
          "@type": "CollectionPage",
          "@id": `${schemaUrl}#webpage`,
          "url": schemaUrl,
          "name": schemaName,
          "mainEntity": { "@id": `${schemaUrl}#article-list` },
          "isPartOf": { "@id": `${SITE_URL}/#website` }
        },
        {
          "@type": "ItemList",
          "@id": `${schemaUrl}#article-list`,
          "numberOfItems": schemaArticleNodes.length,
          "itemListElement": schemaArticleNodes.map((post, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": { "@id": post["@id"] }
          }))
        },
        ...schemaArticleNodes
      ]
    }).replace(/</g, '\\u003c')}</script>`
    : '';
  const crawlableContent = route === '/'
    ? `<main class="seo-fallback-content">
        <h1>Let's Scale Your Business</h1>
        <p>Sham Marianas F.Z.C. is a Dubai-based advertising and creative agency helping businesses grow through clear strategy, memorable branding, digital marketing and high-performing websites.</p>
        <h2>Creative services for growing businesses</h2>
        <p>Our team delivers branding, web development, social media marketing, content creation, AI automation, video production and print media solutions tailored to each business goal.</p>
        <nav aria-label="Main services">
          <a href="/services">Explore our services</a>
          <a href="/case-study">View our portfolio</a>
          <a href="/contact-us">Contact Sham Marianas</a>
        </nav>
      </main>`
    : blogListingContent || blogCategoryContent || blogDetailContent || `<nav class="seo-fallback-navigation" aria-label="Site navigation">
        <a href="${SITE_URL}/">Sham Marianas F.Z.C. Home</a>
      </nav>`;
  const fallbackHtml = baseHtml.replace(
    '<div id="root">',
    `<div id="root">${crawlableContent}`
  );

  const cleanedHtml = fallbackHtml
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

  return cleanedHtml.replace(
    '</head>',
    `<title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    ${metadata}
    ${structuredData}
</head>`
  );
}

function writeFallbackPages(baseHtml, routes) {
  for (const route of routes) {
    const filePath = route === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buildFallbackHtml(baseHtml, route), 'utf8');
  }
}

// 2. Fetch dynamic routes from Firebase Firestore
async function getDynamicRoutes() {
  const dynamicRoutes = [];
  const errors = [];

  // Blogs
  try {
    const blogSnap = await getDocs(
      query(collection(db, 'blogs'), where('status', '==', 'PUBLISHED'))
    );
    blogSnap.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      if (slug) {
        const route = `/blog/${slug}`;
        publishedBlogs.set(route, { id: doc.id, ...data, slug });
        dynamicRoutes.push(route);
      }
    });
    console.log(`✅ Loaded ${dynamicRoutes.length} blog routes from Firestore`);
  } catch (err) {
    console.warn('⚠️ Could not fetch blogs from Firestore:', err.message);
    errors.push(`blogs: ${err.message}`);
  }

  // Projects
  try {
    const projSnap = await getDocs(collection(db, 'projects'));
    let count = 0;
    projSnap.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      if (slug) {
        dynamicRoutes.push(`/project-details/${slug}`);
        count++;
      }
    });
    console.log(`✅ Loaded ${count} project routes from Firestore`);
  } catch (err) {
    console.warn('⚠️ Could not fetch projects from Firestore:', err.message);
    errors.push(`projects: ${err.message}`);
  }

  if (errors.length > 0) {
    throw new Error(`Could not load all dynamic routes (${errors.join('; ')})`);
  }

  return dynamicRoutes;
}

// 3. Main Pre-rendering Engine
async function prerender() {
  console.log('🚀 Initializing Static Pre-rendering (SSG)...');

  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('❌ Error: dist/index.html not found! Please run "npm run build" first.');
    process.exit(1);
  }

  // Keep a copy of the base SPA shell for server fallback
  const baseHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

  // Start local server
  const server = await startStaticServer(baseHtml);

  // Define static routes
  const staticRoutes = [
    '/',
    '/about',
    '/services',
    '/case-study',
    '/blog',
    '/contact-us',
    '/page-team',
    '/templates',

    // Public asset category landing pages
    '/category/videos',
    '/category/models',
    '/category/video-templates',
    '/category/images',
    '/category/graphics',
    '/category/mockups',
    '/category/fonts',
    '/category/more',
    '/category/icons',
    '/category/textures',
    '/category/scripts',
    '/category/hdris',
    '/category/hot',

    // High commercial intent service pages
    '/services/branding-design',
    '/services/uiux-design',
    '/services/web-development',
    '/services/ecommerce-solutions',
    '/services/content-writing',
    '/services/product-design',
    '/services/social-media-digital-marketing',
    '/services/video-production',
    '/services/vfx-and-cgi-ads',
    '/services/print-media-solutions',
    '/services/ai-automation',
    '/services/exhibition-booth-design',
    // Legal & Information
    '/terms-and-conditions',
    '/privacy-policy',
    '/privacy-policy-template',
    '/terms-condition-template',
    '/seller-guideline',
    '/prices-and-fees',
    '/contributor-policies',

    // Blog category landing pages
    '/blog-category/business',
    '/blog-category/technology',
    '/blog-category/design',
    '/blog-category/lifestyle',
    '/blog-category/ai',
    '/blog-category/marketing',
  ];

  // Fetch dynamic routes
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = Array.from(new Set([...staticRoutes, ...dynamicRoutes]));

  console.log(`📄 Total pages to prerender: ${allRoutes.length}`);

  // Auto-detect local Chrome or Edge if available
  function findChromePath() {
    const possiblePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].filter(Boolean);

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }
    return undefined;
  }

  const chromePath = findChromePath();
  if (chromePath) {
    console.log(`🔍 Using browser executable: ${chromePath}`);
  }

  // Launch Puppeteer with optimized flags
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: chromePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  } catch (error) {
    console.warn(`⚠️ Browser prerender unavailable: ${error.message}`);
    console.warn('🧩 Generating crawlable route shells with SEO metadata instead.');
    writeFallbackPages(baseHtml, allRoutes);
    server.close();
    console.log(`\n🎉 Generated ${allRoutes.length} SEO-ready route shells in ${DIST_DIR}`);
    process.exit(0);
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Stub WebGL context to prevent Three.js headless stalls
  await page.evaluateOnNewDocument(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
        const gl = originalGetContext.apply(this, [type, ...args]);
        if (gl) return gl;
        return originalGetContext.apply(this, ['2d', ...args]) || {};
      }
      return originalGetContext.apply(this, [type, ...args]);
    };
  });

  // Intercept requests: abort images, video, audio, fonts for rapid rendering
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resType = req.resourceType();
    if (['image', 'media', 'font'].includes(resType)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  let successCount = 0;

  for (let i = 0; i < allRoutes.length; i++) {
    const route = allRoutes[i];
    const targetUrl = `http://127.0.0.1:${PORT}${route}`;
    const progress = `[${i + 1}/${allRoutes.length}]`;

    try {
      let html;
      let lastError;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 25000,
          });

          await page.waitForFunction(
            (currentRoute, siteUrl) => {
              const root = document.getElementById('root');
              if (!root) return false;

              if (root.querySelector('.loader-wrap')) return false;

              const title = document.querySelector('title')?.textContent?.trim();
              const description = document.querySelector('meta[name="description"]')?.content?.trim();
              const canonical = document.querySelector('link[rel="canonical"]');
              const robots = document.querySelector('meta[name="robots"]')?.content?.toLowerCase() || '';
              const expectedPath = currentRoute.replace(/\/+$/, '') || '/';

              let hasValidCanonical = false;
              if (canonical?.href) {
                try {
                  const canonicalUrl = new URL(canonical.href);
                  const canonicalPath = canonicalUrl.pathname.replace(/\/+$/, '') || '/';
                  hasValidCanonical = canonicalUrl.origin === siteUrl && canonicalPath === expectedPath;
                } catch {
                  hasValidCanonical = false;
                }
              }

              const hasCoreSeo = Boolean(
                root.children.length > 0 &&
                title &&
                description &&
                hasValidCanonical &&
                robots.includes('index') &&
                !robots.includes('noindex')
              );

              if (!hasCoreSeo) return false;

              if (currentRoute.startsWith('/blog/')) {
                return !document.body.innerText.includes('Loading blog...') &&
                  Boolean(document.querySelector('.blog-inside-title'));
              }

              if (currentRoute === '/blog') {
                return !document.body.innerText.includes('Loading...');
              }

              if (currentRoute.startsWith('/project-details/')) {
                return !document.querySelector('.loading-container') &&
                  !document.body.innerText.includes('Loading project details...') &&
                  !document.title.startsWith('Loading Project');
              }

              if (currentRoute.startsWith('/blog-category/')) {
                return !document.body.innerText.includes('Loading...');
              }

              return true;
            },
            { timeout: 30000 },
            route,
            SITE_URL
          );

          await new Promise((resolve) => setTimeout(resolve, 800));
          html = await page.content();
          break;
        } catch (error) {
          lastError = error;
          console.warn(`⚠️ ${progress} Attempt ${attempt}/3 incomplete: ${error.message}`);
        }
      }

      if (!html) {
        throw new Error(`Rendered content was not ready after 3 attempts: ${lastError?.message || 'unknown error'}`);
      }

      // Determine output filepath
      const filePath = route === '/'
        ? path.join(DIST_DIR, 'index.html')
        : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');

      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, html, 'utf8');
      successCount++;
      console.log(`✅ ${progress} Saved: ${route} -> ${path.relative(__dirname, filePath)}`);
    } catch (err) {
      console.error(`❌ ${progress} Failed to prerender ${route}: ${err.message}`);
    }
  }

  // Cleanup
  await browser.close();
  server.close();

  if (successCount !== allRoutes.length) {
    console.error(`\n❌ Prerendering incomplete: generated ${successCount}/${allRoutes.length} pages.`);
    process.exit(1);
  }

  console.log(`\n🎉 Prerendering finished! Successfully generated ${successCount}/${allRoutes.length} pages.`);
  console.log(`📦 All static HTML files are ready for SEO deployment in ${DIST_DIR}`);
  process.exit(0);
}

prerender().catch((err) => {
  console.error('❌ Critical Prerender Failure:', err);
  process.exit(1);
});
