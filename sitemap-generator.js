// sitemap-auto-generator.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  // Dynamic routes with sample data
  { path: '/view/:slug', dynamic: true, samples: ['model-1', 'model-2', 'template-1', 'texture-1'] },
  { path: '/blog/:id', dynamic: true, samples: ['post-1', 'post-2', 'post-3', 'post-4'] },
  { path: '/project-details/:id', dynamic: true, samples: ['project-1', 'project-2', 'project-3'] },
  { path: '/blog-category/:category', dynamic: true, samples: ['technology', 'design', 'marketing'] },
  { path: '/profile/:username', dynamic: true, samples: ['john', 'jane', 'alex', 'admin'] },
  { path: '/:username', dynamic: true, samples: ['john', 'jane', 'alex', 'admin'] },
];

const generateUrlsFromRoutes = () => {
  const urls = [];
  
  ROUTES_CONFIG.forEach(route => {
    if (!route.dynamic) {
      // Static route
      urls.push({
        url: route.path,
        priority: route.path === '/' ? '1.0' : '0.8',
        freq: route.path === '/' ? 'daily' : 'weekly'
      });
    } else {
      // Dynamic route - generate sample URLs
      route.samples.forEach(sample => {
        const url = route.path.replace(/:(\w+)/, sample);
        urls.push({
          url: url,
          priority: '0.7',
          freq: 'monthly'
        });
      });
    }
  });
  
  return urls;
};

const urls = generateUrlsFromRoutes();

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