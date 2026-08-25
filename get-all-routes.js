// get-all-routes.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getAllRoutes() {
  const routes = {
    static: [
      '/', '/blog', '/portfolio', '/services', '/about',
      '/contact-us', '/templates', '/Login', '/profile',
      // ... all your static routes
    ],
    dynamic: {
      blog: [],
      portfolio: [],
      category: [
        '/category/fonts', '/category/video-templates',
        '/category/icons', '/category/models',
        // ... all category routes
      ]
    }
  };

  // Get blogs
  const blogSnapshot = await getDocs(collection(db, 'blogs'));
  blogSnapshot.forEach(doc => {
    const data = doc.data();
    routes.dynamic.blog.push({
      slug: data.slug || doc.id,
      id: doc.id
    });
  });

  // Get portfolio items (if you have)
  // const portfolioSnapshot = await getDocs(collection(db, 'portfolio'));
  // portfolioSnapshot.forEach(doc => {
  //   routes.dynamic.portfolio.push(doc.data().slug);
  // });

  return routes;
}