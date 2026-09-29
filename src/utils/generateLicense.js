import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;


// Fonts ko lazy load karenge taaki "Roboto-Regular.ttf not found" na aaye
const loadFonts = async () => {
  if (window.pdfMakeFontsLoaded) return;
  window.pdfMakeFontsLoaded = true;
};

// Convert image to base64 for PDF (cached)
let _cachedLogoDataUrl = null;
const getLogoImage = async () => {
  if (_cachedLogoDataUrl) return _cachedLogoDataUrl;
  try {
    const resp = await fetch('/assets/imgs/logo2.png', { cache: 'no-cache' });
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

// Convert image to base64 for PDF (cached)
let _cachedFooterDataUrl = null;
const getFooterImage = async () => {
  if (_cachedFooterDataUrl) return _cachedFooterDataUrl;
  try {
    const resp = await fetch('/assets/imgs/footer.png', { cache: 'no-cache' });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    _cachedFooterDataUrl = dataUrl;
    return dataUrl;
  } catch (e) {
    console.warn('getFooterImage failed:', e);
    return null;
  }
};

// Get license terms content based on license type
const getLicenseTermsContent = (licenseType, _asset) => {
  // Main Heading
  const header = {
    text: licenseType === 'Free for Personal Use' ? 'FREE FOR PERSONAL USE LICENSE' :
      licenseType === 'Free for Commercial Use' ? 'FREE FOR COMMERCIAL USE LICENSE' :
        'DIGITAL ASSET LICENSE',
    style: 'header',
    alignment: 'left',
    bold: true,
    fontSize: 12,
    color: '#2c3e50',
    margin: [0, 0, 0, 4]
  };

  // Subheading style
  const subHeading = {
    style: 'subSection',
    bold: true,
    fontSize: 12,
    margin: [0, 12, 0, 6],
    color: '#2c3e50'
  };

  if (licenseType === 'Free for Personal Use') {
    return [
      header,

      // Intro Paragraph
      {
        text: 'This license lets you use any designs, templates, graphics, logos, photos, videos, or branding material created by Sham Marianas F.Z.C completely free in your personal or commercial projects; you just have to give simple credit in the final work: “Designed by Sham Marianas F.Z.C”.',
        margin: [0, 0, 0, 10],
        lineHeight: 1.4,
        color: '#7f8c8d'
      },

      // How to give credit
      { text: 'How to give credit:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'For websites or online use:'
        ],
        margin: [0, 0, 0, 0],
        color: '#2c3e50'
      },
      {
        text: 'Add this small line (preferably with a link): \'<a href="https://www.shammarianas.com/templates" aria-label="Visit Sham Marianas Templates">Designed by Sham Marianas F.Z.C</a>\'',
        margin: [0, 0, 0, 4],
        italics: true,
        color: '#7f8c8d'
      },
      {
        ul: [
          'Uses different to web:'
        ],
        margin: [0, 0, 0, 0],
        color: '#2c3e50'
      },
      {
        text: 'Just write “Designed by Sham Marianas F.Z.C” next to the design or put it in the description/credits section.',
        margin: [0, 0, 0, 10],
        italics: true,
        color: '#7f8c8d'
      },

      // Where you can use
      { text: 'Where you can use Sham Marianas F.Z.C content:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'Websites',
          'Apps and software',
          'Social media posts, stories, and ads',
          'Print stuff (flyers, posters, banners, business cards, brochures, magazines)',
          'Merchandise (T-shirts, mugs, packaging)',
          'Videos, Reels, TikTok, presentations',
          'Shop signage, events, decorations, basically anywhere!'
        ],
        margin: [0, 0, 0, 10],
        color: '#7f8c8d'
      },

      // What you can do
      { text: 'What you can do:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'Use in unlimited times, forever, anywhere in the world',
          'Edit, change colors, text, mix with your own stuff, make new designs from it',
          'Use it for personal projects or to make money (client work is 100% okay!)'
        ],
        margin: [0, 0, 0, 10],
        color: '#7f8c8d'
      },

      // What you canNOT do
      { text: 'What you cannot do:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'Sell or rent the original source files',
          'Share or distribute the raw files for others to download',
          'Offer the designs (even modified ones) as downloadable resources'
        ],
        margin: [0, 0, 0, 10],
        color: '#7f8c8d'
      },

      // Final Note
      {
        text: 'That’s it! Just add “Designed by Sham Marianas F.Z.C” and enjoy using the work freely.',
        italics: true,
        color: '#7f8c8d',
        margin: [0, 0, 0, 0],
        alignment: 'center'
      }
    ];
  } else if (licenseType === 'Free for Commercial Use') {
    return [
      header,

      // Intro Paragraph
      {
        text: 'This license confirms the rights and obligations for using the item "Certified Guarantee Warranty Verify Stamp Word Concept" on your website under the FREE commercial  LICENSE (WITH ATTRIBUTION) terms.',
        margin: [0, 0, 0, 10],
        lineHeight: 1.4,
        color: '#7f8c8d'
      },

      // How to give credit
      { text: 'How to give credit:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'For websites or online use:'
        ],
        margin: [0, 0, 0, 0],
        color: '#2c3e50'
      },
      {
        text: 'Add this small line (preferably with a link): \'<a href="https://www.shammarianas.com/templates" aria-label="Visit Sham Marianas Templates">Designed by Sham Marianas F.Z.C</a>\'',
        margin: [0, 0, 0, 4],
        italics: true,
        color: '#7f8c8d'
      },
      {
        ul: [
          'Uses different to web:'
        ],
        margin: [0, 0, 0, 0],
        color: '#2c3e50'
      },
      {
        text: 'Just write “Designed by Sham Marianas F.Z.C” next to the design or put it in the description/credits section.',
        margin: [0, 0, 0, 10],
        italics: true,
        color: '#7f8c8d'
      },

      // Where you can use
      { text: 'Where you can use Sham Marianas F.Z.C content:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'Websites',
          'Apps and software',
          'Social media posts, stories, and ads',
          'Print stuff (flyers, posters, banners, business cards, brochures, magazines)',
          'Merchandise (T-shirts, mugs, packaging)',
          'Videos, Reels, TikTok, presentations',
          'Shop signage, events, decorations, basically anywhere!'
        ],
        margin: [0, 0, 0, 10],
        color: '#7f8c8d'
      },

      // What you can do
      { text: 'What you can do:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'Use the licensed material an unlimited number of times in any and all media for the commercial or personal purposes listed above.',
          'Alter and create derivative works from the content.',
          'Use Shammarianas content worldwide during the rights period.'
        ],
        margin: [0, 0, 0, 10],
        color: '#7f8c8d'
      },

      // What you canNOT do
      { text: 'What you cannot do:', ...subHeading, color: '#2c3e50' },
      {
        ul: [
          'Sublicense, sell, or rent any contents (or a modified version of them).',
          'Distribute Shammarianas\' contents unless expressly authorized by Shammarianas.',
          'Offering shammarianas Contents designs (or modified shammarianas Contents versions) for download'
        ],
        margin: [0, 0, 0, 10],
        color: '#7f8c8d'
      },

      // Final Note
      {
        text: 'That’s it! Just add “Designed by Sham Marianas F.Z.C” and enjoy using the work freely.',
        italics: true,
        color: '#7f8c8d',
        margin: [0, 0, 0, 0],
        alignment: 'center'
      }
    ];
  } else {
    // Default license
    return [
      header,
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

// Make getDocDefinition async for auto snapshot
const getDocDefinition = async (asset, licenseType, _user) => {
  const licenseId = `LIC-${Date.now().toString(36).toUpperCase()}`;

  // Auto detect if it's a 3D model
  const is3DModel = asset.type === '3d' ||
    asset.fileType?.includes('glb') ||
    asset.fileType?.includes('gltf') ||
    asset.fileType?.includes('obj') ||
    asset.fileType?.includes('fbx') ||
    asset.extension === '.glb' ||
    asset.extension === '.gltf' ||
    asset.extension === '.obj' ||
    asset.extension === '.fbx';

  let snapshotBase64 = null;

  // Agar 3D model hai toh placeholder use karo
  if (is3DModel) {
    // Option 1: Ek clean placeholder text with 3D icon style
    snapshotBase64 = null; // We'll use text + canvas instead of image
  } else {
    // Normal image/thumbnail logic (jo pehle tha)
    const previewUrl = asset.thumbnail || asset.images?.[0] || asset.icons?.[0] || null;
    if (previewUrl) {
      try {
        const resp = await fetch(previewUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          if (blob.type.startsWith('image/')) {
            snapshotBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }
        }
      } catch (e) {
        console.warn('Snapshot fetch failed:', e);
      }
    }
  }

  // Header columns (same)
  const headerColumns = [];
  const logoData = await getLogoImage();
  if (logoData) {
    headerColumns.push({
      width: 160,
      image: logoData,
      fit: [140, 50],
      margin: [40, 10, 0, 0]
    });
  }

  // Footer columns (same)
  const footerColumns = [];
  const footerimg = await getFooterImage();
  if (footerimg) {
    footerColumns.push({
      // width: 515,
      image: footerimg,
      // fit: [515, 50],
      fit: [595, 50],
      margin: [0, 0, 0, 0]
    });
  }

  return {
    pageSize: 'A4',
    pageMargins: [40, 100, 20, 100],

    header: {
      margin: [0, 20, 0, 0],
      stack: [
        { columns: headerColumns }
      ]
    },

    footer: function () {
      return {
        margin: [0, 0, 0, 0],
        // stack: [
        //   {
        //     canvas: [
        //       {
        //         type: 'polyline',
        //         lineWidth: 1,
        //         closePath: true,
        //         color: '#102935',
        //         points: [
        //           { x: 0, y: 30 },
        //           { x: 515, y: 30 },
        //           { x: 475, y: 0 },
        //           { x: 40, y: 0 },
        //           { x: 0, y: 30 }
        //         ]
        //       },
        //       { type: 'rect', x: 40, y: 0, w: 435, h: 30, color: '#102935' }
        //     ]
        //   },
        //   {
        //     columns: [
        //       {
        //         width: '60%',
        //         text: '  f   t   in   ig',
        //         color: 'white',
        //         fontSize: 14,
        //         bold: true,
        //         margin: [60, -22, 0, 0]
        //       },
        //       {
        //         width: '40%',
        //         text: 'www.shammarianas.com  |  contact@shammarianas.com',
        //         color: 'white',
        //         fontSize: 8,
        //         alignment: 'right',
        //         margin: [0, -20, 60, 0]
        //       }
        //     ]
        //   }
        // ]

        stack: [
          { columns: footerColumns }
        ]
      };
    },

    content: [
      // SMART SNAPSHOT SECTION - Updated for 3D Models
      is3DModel ? {
        stack: [
          {
            canvas: [
              { type: 'rect', x: 0, y: 0, w: 480, h: 270, color: '#f8f9fa', r: 12 },
              { type: 'line', x1: 20, x2: 460, y1: 135, y2: 135, lineWidth: 2, dash: { length: 5 }, color: '#dee2e6' }
            ],
            width: 480,
            alignment: 'center'
          },
          {
            text: '3D Model Preview',
            fontSize: 28,
            bold: true,
            color: '#2c3e50',
            alignment: 'center',
            margin: [0, 10, 0, 5]
          },
          {
            text: 'This is a 3D model file (.glb/.gltf/.obj/.fbx)\nLive preview not available in PDF',
            fontSize: 14,
            color: '#7f8c8d',
            alignment: 'center',
            lineHeight: 1.4
          },
          {
            text: asset.title || 'Untitled 3D Model',
            fontSize: 16,
            color: '#3498db',
            bold: true,
            alignment: 'center',
            margin: [0, 10, 0, 0]
          }
        ],
        margin: [0, 20, 0, 30]
      } : snapshotBase64 ? {
        image: snapshotBase64,
        width: 120,
        alignment: 'center',
        margin: [0, 20, 0, 30]
      } : {
        text: '[3D Model Preview Not Available]',
        color: '#999',
        fontSize: 12,
        italics: true,
        alignment: 'center',
        margin: [0, 20, 0, 30]
      },
      // {
      //   text: licenseType === 'Free for Personal Use' ? 'FREE FOR PERSONAL USE LICENSE' :
      //         licenseType === 'Free for Commercial Use' ? 'FREE FOR COMMERCIAL USE LICENSE' :
      //         'DIGITAL ASSET LICENSE',
      //   style: 'header'
      // },
      // { text: 'Digital Asset License Agreement', style: 'subheader' },
      // { canvas: [{ type: 'line', x1: 100, y1: 15, x2: 495, y2: 15, lineWidth: 4, lineColor: '#102935' }], margin: [0, 20, 0, 30] },

      { text: 'Asset Information', style: 'section', margin: [0, 0, 0, 15] },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'Asset Title:', fillColor: '#4a4a4a', color: 'white' },
              { text: asset.title || 'Unknown Asset', bold: true, fillColor: '#e0e0e0' }
            ],
            [
              { text: 'Author/Creator:', fillColor: '#4a4a4a', color: 'white' },
              { text: asset.authorName || asset.author || 'Unknown Author', fillColor: '#e0e0e0' }
            ],
            [
              { text: 'Download Date:', fillColor: '#4a4a4a', color: 'white' },
              { text: new Date(asset.downloadDate || asset.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), fillColor: '#e0e0e0' }
            ],
            [
              { text: 'License Type:', fillColor: '#4a4a4a', color: 'white' },
              {
                text: licenseType,
                bold: true,
                color: '#52b0b4',
                fillColor: '#e0e0e0'
              }
            ],
            [
              { text: 'Asset Type:', fillColor: '#4a4a4a', color: 'white' },
              { text: asset.type || 'Digital Asset', fillColor: '#e0e0e0' }
            ],
            [
              { text: 'License ID:', fillColor: '#4a4a4a', color: 'white' },
              { text: licenseId, bold: true, fillColor: '#e0e0e0' }
            ],
            // ['Licensee:', { text: user?.displayName || user?.email || 'User', bold: true }],
            [
              { text: 'URL:', fillColor: '#4a4a4a', color: 'white' },
              {
                text: asset.viewUrl || `https://www.shammarianas.com/View/${asset.slug || asset.id || asset._id}`,
                bold: true,
                color: '#52b0b4',
                link: asset.viewUrl || `https://www.shammarianas.com/View/${asset.slug || asset.id || asset._id}`,
                decoration: 'underline',
                fillColor: '#e0e0e0'
              }
            ]
          ]
        },
        layout: {
          hLineColor: () => [255, 255, 255],
          vLineColor: () => [255, 255, 255],
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 0, 0, 10]
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
        text: '\n\nFor any queries related to this license, please contact info@shammarianas.com',
        style: 'contactNote',
        margin: [0, 20, 0, 0]
      }
    ],

    styles: {
      header: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        color: '#102935',
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
        color: '#102935'
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
