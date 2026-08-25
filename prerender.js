// prerender.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Import Firebase from your existing config
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from './src/firebase.js'; // 👈 APNI FILE SE IMPORT

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase with your config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🚀 Get all blog slugs from Firebase
async function getBlogSlugs() {
  try {
    const querySnapshot = await getDocs(collection(db, 'blogs'));
    const slugs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      slugs.push({
        slug: slug,
        id: doc.id
      });
    });
    console.log(`✅ Found ${slugs.length} blogs`);
    return slugs;
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    return [];
  }
}

// 🎯 Pre-render all pages
async function prerender() {
  console.log('🚀 Starting prerendering...');
  
  // Get all blog slugs
  const blogs = await getBlogSlugs();
  
  // Create all URLs
  const urls = [
    '/',
    '/blog',
    '/portfolio',
    '/services',
    '/about',
    '/contact-us',
    '/templates',
    '/Login',
    '/profile',
    '/analytics',
    '/Support',
    '/Terms',
    '/Privacy',
    '/success',
    '/error',
    '/coming-soon',
    '/subscription',
    '/Library',
    '/MyDownloads',
    '/Favorites',
    '/Upload',
    '/Checkout',
    '/Groups',
    '/page-team',
    '/Logout',
    '/Reset',
    '/admin',
    '/ContributorLogin',
    '/ContributorDashboard',
    // Category routes
    '/category/fonts',
    '/category/video-templates',
    '/category/icons',
    '/category/models',
    '/category/mockups',
    '/category/graphics',
    '/category/videos',
    '/category/images',
    '/category/scripts',
    '/category/hdri',
    '/category/hdris',
    '/category/textures',
    '/category/more',
    // Blog routes
    ...blogs.map(blog => `/blog/${blog.slug}`),
    ...blogs.map(blog => `/blog-details/${blog.id}`),
    // Service routes
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
    '/services/brandingpage',
    '/services/demo',
    // Privacy and Terms
    '/privacy-policy',
    '/privacy-policy-template',
    '/terms-and-conditions',
    '/terms-condition-template',
    '/seller-guideline',
    '/prices-and-fees',
    '/contributor-policies'
  ];

  console.log(`📄 Total pages to prerender: ${urls.length}`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Create dist directory if not exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Pre-render each URL
  for (const url of urls) {
    try {
      console.log(`🔄 Rendering: ${url}`);
      
      // Navigate to URL
      await page.goto(`http://localhost:5173${url}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // ✅ FIXED: Use setTimeout instead of page.waitForTimeout
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Additional wait for dynamic content
      try {
        await page.waitForSelector('#root', { timeout: 10000 });
      } catch (e) {
        console.log(`⏳ #root not found for ${url}, continuing...`);
      }
      
      // Get HTML
      const html = await page.content();

      // Create directory structure
      const filePath = url === '/' ? 'dist/index.html' : `dist${url}/index.html`;
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save HTML
      fs.writeFileSync(filePath, html);
      console.log(`✅ Saved: ${filePath}`);

    } catch (error) {
      console.error(`❌ Error rendering ${url}:`, error.message);
    }
  }

  await browser.close();
  console.log('🎉 Prerendering complete! All pages are ready for SEO.');
}

// Run prerendering
prerender().catch(console.error);