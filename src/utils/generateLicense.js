// generateLicense.js - 100% WORKING IN 2025 (Vite/React/Firestore)

import pdfMake from 'pdfmake/build/pdfmake';

// Fonts ko lazy load karenge taaki "Roboto-Regular.ttf not found" na aaye
const loadFonts = async () => {
  if (window.pdfMakeFontsLoaded) return;
  
  // Try multiple import paths / shapes and be resilient
  const tryImport = async (paths) => {
    for (const p of paths) {
      try {
        return await import(p);
      } catch (e) {
        // ignore and try next
      }
    }
    return null;
  };

  const mod = await tryImport([
    'pdfmake/build/vfs_fonts.js',
    'pdfmake/build/vfs_fonts',
    'pdfmake/build/vfs_fonts.browser.js',
    'pdfmake/build/vfs_fonts.browser',
  ]);

  // resolved VFS may be in different shapes depending on bundler / esm/cjs
  const vfs =
    mod?.pdfMake?.vfs ||
    mod?.default?.pdfMake?.vfs ||
    mod?.default?.vfs ||
    mod?.vfs ||
    null;

  if (vfs) {
    pdfMake.vfs = vfs;
    window.pdfMakeFontsLoaded = true;
    return;
  }

  // Last resort: warn and continue (pdfMake may already have vfs)
  console.warn('pdfmake vfs not found - PDF generation may fail. module:', mod);
  window.pdfMakeFontsLoaded = true;
};

// Beautiful License Template
const getDocDefinition = (asset, licenseType) => ({
  pageSize: 'A4',
  pageMargins: [50, 60, 50, 80],
  background: { canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 842, color: '#fdfdfd' }] },
  content: [
    { text: licenseType === 'Free for Personal Use' ? 'FREE FOR PERSONAL USE LICENSE' : 
            licenseType.includes('Commercial') ? 'FREE FOR COMMERCIAL USE LICENSE' :
            licenseType.includes('Editorial') ? 'EDITORIAL USE ONLY LICENSE' :
            licenseType.includes('Extended') ? 'EXTENDED COMMERCIAL LICENSE' :
            'DIGITAL ASSET LICENSE', 
      style: 'header' },
    { text: 'Digital Asset License Agreement', style: 'subheader' },
    { canvas: [{ type: 'line', x1: 100, y1: 15, x2: 495, y2: 15, lineWidth: 4, lineColor: '#2c3e50' }], margin: [0, 30, 0, 40] },

    { text: 'Asset Information', style: 'section', margin: [0, 20, 0, 10] },
    {
      table: {
        widths: ['30%', '*'],
        body: [
          ['Asset Title', asset.title || 'Unknown Asset'],
          ['Asset ID', asset.id || 'N/A'],
          ['Author', asset.authorName || asset.author || 'Unknown Author'],
          ['Download Date', new Date(asset.downloadDate || Date.now()).toLocaleDateString()],
          ['License Type', { text: licenseType, bold: true, color: licenseType.includes('Personal') ? '#27ae60' : '#2980b9' }],
          ['Price', asset.finalPrice === 0 ? 'Free' : `$${asset.finalPrice.toFixed(2)}`]
        ]
      },
      layout: { hLineColor: () => '#dee2e6', paddingLeft: () => 12, paddingRight: () => 12 }
    },

    { text: 'License Terms', style: 'section', margin: [0, 30, 0, 15] },
    {
      text: licenseType.includes('Personal') 
        ? 'This asset is for personal, non-commercial use only. You may use it in personal projects, education, and hobby work.'
        : 'This asset is licensed for commercial use. You may use it in client work, marketing, and products for sale.',
      margin: [0, 0, 0, 30]
    },

    { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#2c3e50' }], margin: [0, 40] },
    {
      columns: [
        { width: '60%', text: `License ID: LIC-${Date.now().toString(36).toUpperCase()}\nGenerated: ${new Date().toLocaleString()}`, fontSize: 10, color: '#666' },
        { width: '40%', alignment: 'right', text: 'Shammarianas Marketplace\nOfficial License', bold: true, fontSize: 14 }
      ]
    }
  ],
  styles: {
    header: { fontSize: 28, bold: true, alignment: 'center', color: '#2c3e50', margin: [0, 0, 0, 10] },
    subheader: { fontSize: 16, alignment: 'center', color: '#7f8c8d', margin: [0, 0, 0, 30] },
    section: { fontSize: 18, bold: true, color: '#2c3e50' }
  }
});

// MAIN FUNCTION - YE CALL HOGI MyDownloads.jsx SE
export const downloadLicense = async (asset, user = null) => {
  try {
    await loadFonts(); // ← YE SABSE ZAROORI HAI

    const price = Number(asset.price) || 0;
    const discount = Number(asset.discount ?? 0) || 0;
    const finalPrice = Math.max(0, price - (price * discount) / 100);

    let licenseType = asset.licenseType || 'default';
    if (licenseType === 'default') {
      licenseType = finalPrice === 0 ? 'Free for Personal Use' : 'Free for Commercial Use';
    }

    const enrichedAsset = { ...asset, finalPrice };

    const doc = getDocDefinition(enrichedAsset, licenseType);
    const filename = `${asset.title?.replace(/[^a-z0-9]/gi, '_') || 'asset'}_License.pdf`;

    // createPdf may throw if vfs missing; caller will receive false on failure
    pdfMake.createPdf(doc).download(filename);
    return true;
  } catch (err) {
    console.error("PDF Error:", err);
    alert("Failed to generate license. Please try again.");
    return false;
  }
};

export const downloadSimpleLicense = downloadLicense;