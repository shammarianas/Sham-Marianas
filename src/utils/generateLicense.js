import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const logoUrl = '/assets/imgs/logo.png';
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

// Convert image to base64 for PDF (cached)
let _cachedLogoDataUrl = null;
const getLogoImage = async () => {
  if (_cachedLogoDataUrl) return _cachedLogoDataUrl;
  try {
    const resp = await fetch('/assets/imgs/logo.png', { cache: 'no-cache' });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    _cachedLogoDataUrl = dataUrl;
    return dataUrl;
  } catch (e) {
    console.warn('getLogoImage failed:', e);
    return null;
  }
};

// Get license terms content based on license type
const getLicenseTermsContent = (licenseType, asset) => {
  const commonHeader = { text: 'License Terms', style: 'section', margin: [0, 20, 0, 15] };
  
  if (licenseType === 'Free for Personal Use') {
    return [
      commonHeader,
      { text: 'Permitted Uses:', style: 'subSection', color: '#27ae60', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'Personal projects and non-commercial work',
          'Educational purposes and learning materials',
          'Personal websites and blogs (non-commercial)',
          'Social media posts for personal use',
          'Hobby projects and personal creative work'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Restrictions:', style: 'subSection', color: '#e74c3c', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'No commercial use or resale',
          'Cannot be used in products for sale',
          'Cannot be used in client work',
          'No redistribution or sharing of the asset files',
          'No use in templates or themes for sale'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Attribution (Optional but Appreciated):', style: 'subSection', color: '#3498db', margin: [0, 0, 0, 5] },
      { text: 'While not required, attribution to the original creator is appreciated.', margin: [0, 0, 0, 20] },
      { text: 'Important Notes:', style: 'subSection', color: '#2c3e50', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'This license is non-transferable',
          'License is valid for lifetime use',
          'Creator retains all copyrights',
          'No warranty is provided with this asset',
          'Creator is not liable for any damages'
        ]
      }
    ];
  } else if (licenseType === 'Free for Commercial Use') {
    return [
      commonHeader,
      { text: 'Permitted Commercial Uses:', style: 'subSection', color: '#2980b9', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'Commercial projects and client work',
          'Products for sale (up to 10,000 units)',
          'Advertising and marketing materials',
          'Website and app development',
          'Video production and films',
          'Print materials and publications',
          'Social media campaigns'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Restrictions:', style: 'subSection', color: '#e74c3c', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'Cannot resell or redistribute the asset files',
          'Cannot use in templates/themes for sale',
          'Cannot use in stock media platforms',
          'Cannot claim authorship of the asset',
          'Mass production limited to 10,000 units'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Attribution:', style: 'subSection', color: '#27ae60', margin: [0, 0, 0, 5] },
      { text: 'Not required but attribution to the creator is appreciated.', margin: [0, 0, 0, 20] },
      { text: 'Commercial Rights:', style: 'subSection', color: '#2c3e50', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'Unlimited commercial projects',
          'Multiple client projects allowed',
          'No royalties or additional fees',
          'Lifetime commercial rights',
          'Worldwide distribution rights'
        ]
      }
    ];
   } else {
    // Default license
    return [
      commonHeader,
      { text: 'This digital asset is licensed for use according to the terms specified by the creator. Please refer to the specific license type for detailed permissions and restrictions.', margin: [0, 0, 0, 20] },
      { text: 'General Terms:', style: 'subSection', color: '#2c3e50', margin: [0, 0, 0, 5] },
      { 
        ul: [
          'License is non-transferable',
          'Creator retains copyright',
          'No warranty provided',
          'Use as per license type restrictions'
        ]
      }
    ];
  }
};

// Make getDocDefinition async so it can await logo load
const getDocDefinition = async (asset, licenseType, user) => {
  // Generate license ID
  const licenseId = `LIC-${Date.now().toString(36).toUpperCase()}`;

  // Try to load logo as data URL (optional)
  const logoData = await getLogoImage();

  // Build header columns (include logo only if data URL available)
  const headerColumns = [];
  if (logoData) {
    headerColumns.push({
      width: 160,
      image: logoData,
      fit: [140, 50],
      margin: [40, 10, 0, 0]
    });
  }

  headerColumns.push({
    width: '*',
    text: 'RIMENOFRADEL AND FREE CO',
    color: 'white',
    fontSize: 20,
    bold: true,
    alignment: 'center',
    margin: [0, 20, 40, 0]
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 100, 40, 100],

    // HEADER (Top of every page)
    header: {
      margin: [0, 20, 0, 0],
      stack: [
        // Maroon background
        // { canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 70, color: '#8B0000' }] },
        { columns: headerColumns }
      ]
    },

    // FOOTER (Bottom of every page)
    footer: function (currentPage, pageCount) {
      return {
        margin: [40, 0, 40, 20],
        stack: [
          // Black arrow shape
          {
            canvas: [
              {
                type: 'polyline',
                lineWidth: 1,
                closePath: true,
                color: '#000000',
                points: [
                  { x: 0, y: 30 },
                  { x: 515, y: 30 },
                  { x: 475, y: 0 },
                  { x: 40, y: 0 },
                  { x: 0, y: 30 }
                ]
              },
              { type: 'rect', x: 40, y: 0, w: 435, h: 30, color: '#000000' }
            ]
          },

          // Social icons + contact info
          {
            columns: [
              {
                width: '60%',
                text: '  f   t   in   ig',
                color: 'white',
                fontSize: 14,
                bold: true,
                margin: [60, -22, 0, 0]
              },
              {
                width: '40%',
                text: 'www.shammarianas.com  |  contact@shammarianas.com',
                color: 'white',
                fontSize: 8,
                alignment: 'right',
                margin: [0, -20, 60, 0]
              }
            ]
          }
        ]
      };
    },

    content: [
      // Page 1: Asset Information
      { 
        text: licenseType === 'Free for Personal Use' ? 'FREE FOR PERSONAL USE LICENSE' : 
              licenseType === 'Free for Commercial Use' ? 'FREE FOR COMMERCIAL USE LICENSE' :
              'DIGITAL ASSET LICENSE', 
        style: 'header' 
      },
      { text: 'Digital Asset License Agreement', style: 'subheader' },
      { canvas: [{ type: 'line', x1: 100, y1: 15, x2: 495, y2: 15, lineWidth: 4, lineColor: '#8B0000' }], margin: [0, 20, 0, 30] },

      { text: 'Asset Information', style: 'section', margin: [0, 0, 0, 15] },
      {
        table: {
          widths: ['35%', '*'],
          body: [
            ['Asset Title:', { text: asset.title || 'Unknown Asset', bold: true }],
            ['Asset ID:', asset.id || 'N/A'],
            ['Author/Creator:', asset.authorName || asset.author || 'Unknown Author'],
            ['Download Date:', new Date(asset.downloadDate || asset.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
            ['License Type:', { 
              text: licenseType, 
              bold: true, 
              color: licenseType.includes('Personal') ? '#27ae60' : 
                     licenseType.includes('Commercial') ? '#2980b9' : '#2c3e50' 
            }],
            ['Price:', { 
              text: asset.finalPrice === 0 ? 'Free' : `$${asset.finalPrice.toFixed(2)}`, 
              bold: true 
            }],
            ['Asset Type:', asset.type || 'Digital Asset'],
            ['License ID:', { text: licenseId, bold: true }],
            ['Licensee:', { text: user?.displayName || user?.email || 'User', bold: true }]
          ]
        },
        layout: { 
          hLineColor: () => '#dee2e6',
          vLineColor: () => '#dee2e6',
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 0, 0, 30]
      },

      // Footer note on first page
      {
        text: 'This document serves as your official license certificate. Keep this for your records.',
        style: 'footerNote',
        margin: [0, 20, 0, 0]
      },

      // Page break
      { text: '', pageBreak: 'before' },
      
      // Page 2: License Terms
      ...getLicenseTermsContent(licenseType, asset),
      
      // Final note on second page
      {
        text: '\n\nFor any queries related to this license, please contact support@shammarianas.com',
        style: 'contactNote',
        margin: [0, 30, 0, 0]
      }
    ],
    
    styles: {
      header: { 
        fontSize: 24, 
        bold: true, 
        alignment: 'center', 
        color: '#8B0000', 
        margin: [0, 0, 0, 5] 
      },
      subheader: { 
        fontSize: 14, 
        alignment: 'center', 
        color: '#7f8c8d', 
        margin: [0, 0, 0, 20] 
      },
      section: { 
        fontSize: 16, 
        bold: true, 
        color: '#8B0000' 
      },
      subSection: { 
        fontSize: 12, 
        bold: true, 
        margin: [0, 5, 0, 5] 
      },
      footerNote: {
        fontSize: 9,
        color: '#666',
        italics: true,
        alignment: 'center'
      },
      contactNote: {
        fontSize: 10,
        color: '#444',
        alignment: 'center'
      }
    },
    
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.3
    }
  };
};

// MAIN FUNCTION
export const downloadLicense = async (asset, user = null) => {
  try {
    await loadFonts();

    const price = Number(asset.price) || 0;
    const discount = Number(asset.discount ?? 0) || 0;
    const finalPrice = Math.max(0, price - (price * discount) / 100);

    let licenseType = asset.licenseType || 'default';
    if (licenseType === 'default') {
      licenseType = finalPrice === 0 ? 'Free for Personal Use' : 'Free for Commercial Use';
    }

    const enrichedAsset = { 
      ...asset, 
      finalPrice,
      downloadDate: asset.downloadDate || asset.createdAt || new Date().toISOString(),
      authorName: asset.authorName || asset.author || asset.createdBy || 'Unknown Author'
    };

    // Await async doc generator so logo (base64) is available
    const doc = await getDocDefinition(enrichedAsset, licenseType, user);
    const filename = `${(asset.title || 'asset').replace(/[^a-z0-9]/gi, '_')}_License_Certificate.pdf`;

    pdfMake.createPdf(doc).download(filename);
    return true;
  } catch (err) {
    console.error("PDF Error:", err);
    alert("Failed to generate license. Please try again.");
    return false;
  }
};

export const downloadSimpleLicense = downloadLicense;