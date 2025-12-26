import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const WEBSITE = process.env.WEBSITE_URL || 'https://shammarianas.com';
const TODAY = new Date().toISOString().split('T')[0];

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

  // Dynamic routes
  { path: '/view/:slug', dynamic: true, collection: 'Assets', field: 'slug' },
  { path: '/blog/:id', dynamic: true, collection: 'blogs', field: 'id' },
  { path: '/project-details/:id', dynamic: true, collection: 'projects', field: 'id' },
  { path: '/profile/:username', dynamic: true, collection: 'Contributors', field: 'username' },
  { path: '/:username', dynamic: true, collection: 'Contributors', field: 'username' },
];

const generateUrlsFromRoutes = async () => {
  const urls = [];

  for (const route of ROUTES_CONFIG) {
    if (!route.dynamic) {
      urls.push({
        url: route.path,
        priority: route.path === '/' ? '1.0' : '0.8',
        freq: route.path === '/' ? 'daily' : 'weekly'
      });
    } else {
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
      } catch (error) {
        console.error(`Error fetching ${route.collection}:`, error);
      }
    }
  }

  return urls;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const urls = await generateUrlsFromRoutes();

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

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}