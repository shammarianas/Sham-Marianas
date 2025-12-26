// sitemap-auto-generator.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config (you need to add your config here)
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

const WEBSITE = 'https://shammarianas.com';
const TODAY = new Date().toISOString().split('T')[0];

// Define all routes from your AppRoutes component
const ROUTES_CONFIG = [
  // Static routes
  { path: '/', dynamic: false },
  { path: '/login', dynamic: false },
  { path: '/cart', dynamic: false },
  { path: '/upload', dynamic: false },
  { path: '/checkout', dynamic: false },
  { path: '/blog', dynamic: false },
  { path: '/portfolio', dynamic: false },
  { path: '/contact', dynamic: false },
  { path: '/about', dynamic: false },
  { path: '/services', dynamic: false },
  { path: '/templates', dynamic: false },
  { path: '/category/fonts', dynamic: false },
  { path: '/category/video-templates', dynamic: false },
  { path: '/category/icons', dynamic: false },
  { path: '/category/models', dynamic: false },
  { path: '/category/mockups', dynamic: false },
  { path: '/category/graphics', dynamic: false },
  { path: '/category/videos', dynamic: false },
  { path: '/category/images', dynamic: false },
  { path: '/category/scripts', dynamic: false },
  { path: '/category/hdri', dynamic: false },
  { path: '/category/textures', dynamic: false },
  { path: '/category/more', dynamic: false },
  
  // Dynamic routes - will be fetched from database
  { path: '/view/:slug', dynamic: true, collection: 'Assets', field: 'slug' },
  { path: '/blog/:id', dynamic: true, collection: 'blogs', field: 'id' },
  { path: '/project-details/:id', dynamic: true, collection: 'projects', field: 'id' },
  { path: '/blog-category/:category', dynamic: true, samples: ['technology', 'design', 'marketing'] },
  { path: '/profile/:username', dynamic: true, collection: 'Contributors', field: 'username' },
  { path: '/:username', dynamic: true, collection: 'Contributors', field: 'username' },
];

const generateUrlsFromRoutes = async () => {
  const urls = [];
  
  for (const route of ROUTES_CONFIG) {
    if (!route.dynamic) {
      // Static route
      urls.push({
        url: route.path,
        priority: route.path === '/' ? '1.0' : '0.8',
        freq: route.path === '/' ? 'daily' : 'weekly'
      });
    } else {
      // Dynamic route - fetch from database
      try {
        const querySnapshot = await getDocs(collection(db, route.collection));
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const value = data[route.field] || doc.id;
          if (value) items.push(value);
        });
        
        items.forEach(item => {
          const url = route.path.replace(/:(\w+)/, item);
          urls.push({
            url: url,
            priority: '0.7',
            freq: 'monthly'
          });
        });
        
        console.log(`Fetched ${items.length} items for ${route.path}`);
      } catch (error) {
        console.error(`Error fetching ${route.collection}:`, error);
        // Fallback to empty
      }
    }
  }
  
  return urls;
};

const urls = await generateUrlsFromRoutes();

// Generate XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

urls.forEach(page => {
  xml += `
  <url>
    <loc>${WEBSITE}${page.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
});

xml += '\n</urlset>';

// Save file
const publicFolder = path.join(__dirname, 'public');
if (!fs.existsSync(publicFolder)) {
  fs.mkdirSync(publicFolder, { recursive: true });
}

fs.writeFileSync(path.join(publicFolder, 'sitemap.xml'), xml);

console.log(`✅ Sitemap generated: ${urls.length} URLs`);
console.log(`🔗 ${WEBSITE}/sitemap.xml`);