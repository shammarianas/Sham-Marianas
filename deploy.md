# Deployment Guide (Firebase + Env + cPanel)

This guide explains how to configure Firebase, set environment variables, build the app, and deploy to cPanel hosting with proper client‑side routing.

## 1) Prerequisites
- Node 18+ and npm
- Firebase project (Web app)
- cPanel access to your domain (e.g., shammarianas.com)

---
## 2) Firebase Setup (one‑time)
1. Create/Use a Firebase project at https://console.firebase.google.com.
2. Add a Web App; copy the config (apiKey, authDomain, projectId, storageBucket, etc.).
3. Authentication → Sign‑in method:
   - Enable providers you need (Google, GitHub, Email/Password, etc.)
   - Settings → Authorized domains: add shammarianas.com and www.shammarianas.com
4. Firestore → Create a database (Production). Apply the provided firestore.rules.
5. Storage → Ensure bucket matches this pattern: `PROJECT_ID.appspot.com`
   - For this project: `sham-marianas.appspot.com` (NOT firebasestorage.app)
6. (Optional) Firebase Functions (if you’ll use admin actions):
   - Deploy `functions/` with `firebase deploy --only functions` from your local dev machine. These cannot run on cPanel; they run on Firebase.

---
## 3) Environment Variables
Create a file named `.env.production` in the project root before building (used by Vite at build time):

```
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyCC_cEqxB99hMW16aowMs6AJ3-k52VasW0
VITE_FIREBASE_AUTH_DOMAIN=sham-marianas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sham-marianas
VITE_FIREBASE_STORAGE_BUCKET=sham-marianas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=607689609153
VITE_FIREBASE_APP_ID=1:607689609153:web:3d76a1c337979a691a6940
VITE_FIREBASE_MEASUREMENT_ID=G-Y0VR1HQNCG

# Client‑side Stripe (public key only)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QmWWnGh23sSN6BpCw6zF1ZcMhQaz0d0bkmHUHNV2OGJiBOasWO5WASDViEHSwQ1IDUmwKABJTwKoy6BZUZy1PXV00dIB9lEuJ

# Admin emails used by app at build time (comma‑separated)
REACT_APP_DEV_ADMIN_EMAILS=adebayour66265@gmail.com,admin@shammarianas.com,shammarianas@gmail.com
```

Important:
- Do NOT include any secret keys (e.g., Stripe secret key) in client env files; they will be exposed. Use serverless/API for secret operations.
- Remove dev‑only vars like `VITE_SERVER_URL` and `NODE_ENV=development` for production builds.
- Any env change requires rebuilding the app.

---
## 4) Build the App
Run locally:

```
npm ci
npm run build
```

This produces a `dist/` folder containing the production site.

---
## 5) Configure cPanel for SPA Routing
Ensure Apache serves `index.html` for client‑side routes.

Place this `.htaccess` in your web root (public_html/.htaccess):

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
```

Notes:
- If deploying to a subfolder (e.g., /app), set `RewriteBase /app/` and ensure `vite.config.js` base is `./` (already configured).

---
## 6) Upload to cPanel
1. Open cPanel → File Manager → `public_html/`.
2. Upload the CONTENTS of `dist/` directly into `public_html/` (i.e., `index.html`, `assets/`, etc.). Do not upload the `dist` folder itself.
3. Confirm `public_html/index.html` exists and `public_html/assets/...` paths are present.
4. Ensure the `.htaccess` above is present in `public_html/`.

---
## 7) Post‑Deploy Checklist
- Visit https://shammarianas.com/
- Test deep links: https://shammarianas.com/portfolio, /blog, /services, /contact, /Login
- Sign‑in flows:
  - Providers enabled in Firebase (Google/GitHub/etc.)
  - Authorized domains include your domain(s)
- Admin actions (if used) require Firebase Functions deployed and callable.

---
## 8) Updating the Site
- Make code or env changes locally
- Rebuild: `npm run build`
- Re‑upload updated `dist/` contents to `public_html/` (overwrite old files)
- Clear browser cache / hard refresh if assets are cached

---
## 9) Troubleshooting
- 404s on deep links → Check `.htaccess` rewrite rules and that `index.html` is in `public_html`.
- Login not working → Verify Firebase `storageBucket` is `...appspot.com`, Auth providers enabled, Authorized domains configured; rebuild after env changes.
- Blank page after deploy → Ensure you uploaded the contents of `dist/` (not the folder itself) and paths are relative (this project already uses subpath‑safe asset paths).

---
## (Optional) Vercel Deployment
- Add `vercel.json`:
```
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```
- Set VITE_* env vars in Vercel Project Settings → Environment Variables
- Deploy; test clean URLs and auth.
