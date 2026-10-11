// sitemap-generator.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config
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

const WEBSITE = 'https://www.shammarianas.com';
const TODAY = new Date().toISOString().split('T')[0];

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[character]));

// Define all routes from your AppRoutes component
const ROUTES_CONFIG = [
  // Primary Static Routes
  { path: '/', dynamic: false, priority: '1.0', freq: 'daily' },
  { path: '/about/', dynamic: false, priority: '0.9', freq: 'weekly' },
  { path: '/services', dynamic: false, priority: '0.9', freq: 'weekly' },
  { path: '/case-study', dynamic: false, priority: '0.9', freq: 'weekly' },
  { path: '/blog', dynamic: false, priority: '0.9', freq: 'daily' },
  { path: '/contact-us', dynamic: false, priority: '0.8', freq: 'monthly' },
  { path: '/page-team', dynamic: false, priority: '0.7', freq: 'monthly' },
  { path: '/templates', dynamic: false, priority: '0.8', freq: 'weekly' },

  // Public asset category landing pages
  ...['videos', 'models', 'video-templates', 'images', 'graphics', 'mockups', 'fonts', 'more', 'icons', 'textures', 'scripts', 'hdris', 'hot']
    .map((category) => ({
      path: `/category/${category}`,
      dynamic: false,
      priority: '0.7',
      freq: 'weekly'
    })),

  // Service Detail Pages (High Commercial Intent)
  { path: '/services/branding-design', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/uiux-design', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/web-development', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/ecommerce-solutions', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/content-writing', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/product-design', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/social-media-digital-marketing', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/video-production', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/vfx-and-cgi-ads', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/print-media-solutions', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/ai-automation', dynamic: false, priority: '0.85', freq: 'weekly' },
  { path: '/services/exhibition-booth-design', dynamic: false, priority: '0.85', freq: 'weekly' },
  // Legal & Info Pages
  { path: '/terms-and-conditions', dynamic: false, priority: '0.5', freq: 'monthly' },
  { path: '/privacy-policy', dynamic: false, priority: '0.5', freq: 'monthly' },
  { path: '/privacy-policy-template', dynamic: false, priority: '0.4', freq: 'yearly' },
  { path: '/terms-condition-template', dynamic: false, priority: '0.4', freq: 'yearly' },
  { path: '/seller-guideline', dynamic: false, priority: '0.5', freq: 'monthly' },
  { path: '/prices-and-fees', dynamic: false, priority: '0.5', freq: 'monthly' },
  { path: '/contributor-policies', dynamic: false, priority: '0.5', freq: 'monthly' },

  // Dynamic routes with samples (no collection)
  { path: '/blog-category/:category', dynamic: true, samples: ['business', 'technology', 'design', 'marketing'] },

  // Dynamic routes fetched from Firebase Firestore
  { path: '/blog/:slug', dynamic: true, collection: 'blogs', field: 'slug' },
  { path: '/project-details/:slug', dynamic: true, collection: 'projects', field: 'slug' },
];

const generateUrlsFromRoutes = async () => {
  const urls = [];

  for (const route of ROUTES_CONFIG) {
    if (!route.dynamic) {
      urls.push({
        url: route.path,
        priority: route.priority || '0.8',
        freq: route.freq || 'weekly'
      });
    } else if (route.samples) {
      route.samples.forEach(sample => {
        urls.push({
          url: route.path.replace(/:(\w+)/, sample),
          priority: '0.7',
          freq: 'weekly'
        });
      });
    } else if (route.collection) {
      try {
        const querySnapshot = await getDocs(collection(db, route.collection));
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const value = data[route.field] || doc.id;
          if (value) items.push(value);
        });

        items.forEach(item => {
          const url = route.path.replace(/:(\w+)/, encodeURIComponent(item));
          urls.push({
            url: url,
            priority: '0.75',
            freq: 'monthly'
          });
        });

        console.log(`✅ Fetched ${items.length} dynamic items for ${route.path}`);
      } catch (error) {
        console.error(`❌ Error fetching ${route.collection}:`, error.message);
      }
    }
  }

  return urls;
};

async function main() {
  try {
    console.log('🚀 Generating sitemap.xml...');
    const urls = await generateUrlsFromRoutes();

    // Deduplicate URLs
    const uniqueUrls = Array.from(new Map(urls.map(u => [u.url, u])).values());

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    uniqueUrls.forEach(page => {
      xml += `
  <url>
    <loc>${escapeXml(`${WEBSITE}${page.url}`)}</loc>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    xml += '\n</urlset>\n';

    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeXml(`${WEBSITE}/sitemap.xml`)}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>\n`;

    // Save to public/sitemap.xml
    const publicFolder = path.join(__dirname, 'public');
    if (!fs.existsSync(publicFolder)) {
      fs.mkdirSync(publicFolder, { recursive: true });
    }
    fs.writeFileSync(path.join(publicFolder, 'sitemap.xml'), xml, 'utf8');
    fs.writeFileSync(path.join(publicFolder, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');

    // Also save to dist/sitemap.xml if dist exists
    const distFolder = path.join(__dirname, 'dist');
    if (fs.existsSync(distFolder)) {
      fs.writeFileSync(path.join(distFolder, 'sitemap.xml'), xml, 'utf8');
      fs.writeFileSync(path.join(distFolder, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');
    }

    console.log(`🎉 Sitemap successfully generated with ${uniqueUrls.length} URLs!`);
    console.log(`🔗 Output saved to public/sitemap.xml and public/sitemap-index.xml`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    process.exit(1);
  }
}

main();
