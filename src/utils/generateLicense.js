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

// Beautiful License Template - 2 Page PDF
const getDocDefinition = (asset, licenseType, user) => {
  // Generate license ID
  const licenseId = `LIC-${Date.now().toString(36).toUpperCase()}`;
  
  return {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    
    // Page 1: Asset Information
    content: [
      // Header for Page 1
      { 
        text: licenseType === 'Free for Personal Use' ? 'FREE FOR PERSONAL USE LICENSE' : 
              licenseType === 'Free for Commercial Use' ? 'FREE FOR COMMERCIAL USE LICENSE' :
              'DIGITAL ASSET LICENSE', 
        style: 'header' 
      },
      { text: 'Digital Asset License Agreement', style: 'subheader' },
      { canvas: [{ type: 'line', x1: 100, y1: 15, x2: 495, y2: 15, lineWidth: 4, lineColor: '#2c3e50' }], margin: [0, 20, 0, 30] },

      { text: 'Asset Information', style: 'section', margin: [0, 0, 0, 15] },
      {
        table: {
          widths: ['35%', '*'],
          body: [
            ['Asset Title:', { text: asset.title || 'Unknown Asset', bold: true }],
            ['Asset ID:', asset.id || 'N/A'],
            ['Author/Creator:', asset.authorName || asset.author || 'Unknown Author'],
            ['Download Date:', new Date(asset.downloadDate || asset.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
            ['License Type:', { text: licenseType, bold: true, color: 
              licenseType.includes('Personal') ? '#27ae60' : 
              licenseType.includes('Commercial') ? '#2980b9' : '#2c3e50' }],
            ['Price:', { text: asset.finalPrice === 0 ? 'Free' : `$${asset.finalPrice.toFixed(2)}`, bold: true }],
            ['Asset Type:', asset.type || 'Digital Asset'],
            ['License ID:', { text: licenseId, bold: true }]
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
        margin: [0, 0, 0, 20]
      },

      // Footer for Page 1
      { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#2c3e50' }], margin: [0, 30, 0, 10] },
      {
        columns: [
          { 
            width: '60%', 
            text: [
              { text: `Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`, fontSize: 9 },
              { text: `License ID: ${licenseId}\n`, fontSize: 9 },
              { text: `Downloaded by: ${user?.displayName || user?.email || 'User'}`, fontSize: 9 }
            ],
            color: '#666' 
          },
          { 
            width: '40%', 
            alignment: 'right', 
            text: 'Shammarianas Marketplace\nOfficial License Document',
            bold: true,
            fontSize: 12 
          }
        ],
        margin: [0, 0, 0, 0]
      },

      // Page Break - Start of Page 2
      { text: '', pageBreak: 'before' },

      // Page 2: License Terms (Different for each license type)
      ...getLicenseTermsContent(licenseType, asset),

      // Footer for Page 2
      { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#2c3e50' }], margin: [0, 40, 0, 10] },
      {
        columns: [
          { 
            width: '100%', 
            alignment: 'center',
            text: [
              { text: 'Shammarianas Marketplace\n', bold: true, fontSize: 12 },
              { text: 'This document serves as your official license certificate.\n', fontSize: 9, italics: true },
              { text: 'For questions or support, contact: support@shammarianas.com', fontSize: 8, color: '#666' }
            ]
          }
        ],
        margin: [0, 0, 0, 0]
      }
    ],
    
    styles: {
      header: { fontSize: 24, bold: true, alignment: 'center', color: '#2c3e50', margin: [0, 0, 0, 5] },
      subheader: { fontSize: 14, alignment: 'center', color: '#7f8c8d', margin: [0, 0, 0, 20] },
      section: { fontSize: 16, bold: true, color: '#2c3e50' },
      subSection: { fontSize: 12, bold: true, margin: [0, 5, 0, 5] }
    },
    
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10
    }
  };
};

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

    const enrichedAsset = { 
      ...asset, 
      finalPrice,
      downloadDate: asset.downloadDate || asset.createdAt || new Date().toISOString()
    };

    const doc = getDocDefinition(enrichedAsset, licenseType, user);
    const filename = `${(asset.title || 'asset').replace(/[^a-z0-9]/gi, '_')}_License_${Date.now()}.pdf`;

    pdfMake.createPdf(doc).download(filename);
    return true;
  } catch (err) {
    console.error("PDF Error:", err);
    alert("Failed to generate license. Please try again.");
    return false;
  }
};

export const downloadSimpleLicense = downloadLicense;