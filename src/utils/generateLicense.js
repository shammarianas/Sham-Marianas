import html2pdf from 'html2pdf.js';

// License templates for different license types
const LICENSE_TEMPLATES = {
  // Free for Personal Use
  'Free for Personal Use': `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">FREE FOR PERSONAL USE LICENSE</h1>
        <p style="color: #7f8c8d; font-size: 16px;">Digital Asset License Agreement</p>
        <div style="height: 3px; background: #2c3e50; width: 100px; margin: 20px auto;"></div>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Asset Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset Title:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_TITLE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_ID}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Author/Creator:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{AUTHOR_NAME}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Download Date:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{DOWNLOAD_DATE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">License Type:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #27ae60; font-weight: bold;">Free for Personal Use</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">License Terms</h2>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #27ae60; border-radius: 5px;">
          <h3 style="color: #27ae60; margin-top: 0;">Permitted Uses:</h3>
          <ul style="line-height: 1.8;">
            <li>Personal projects and non-commercial work</li>
            <li>Educational purposes and learning materials</li>
            <li>Personal websites and blogs (non-commercial)</li>
            <li>Social media posts for personal use</li>
            <li>Hobby projects and personal creative work</li>
          </ul>

          <h3 style="color: #e74c3c; margin-top: 20px;">Restrictions:</h3>
          <ul style="line-height: 1.8;">
            <li>No commercial use or resale</li>
            <li>Cannot be used in products for sale</li>
            <li>Cannot be used in client work</li>
            <li>No redistribution or sharing of the asset files</li>
            <li>No use in templates or themes for sale</li>
          </ul>

          <h3 style="color: #3498db; margin-top: 20px;">Attribution (Optional but Appreciated):</h3>
          <p>While not required, attribution to the original creator is appreciated.</p>
        </div>
      </div>

      <div style="background: #ecf0f1; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Important Notes:</h3>
        <ul style="line-height: 1.8;">
          <li>This license is non-transferable</li>
          <li>License is valid for lifetime use</li>
          <li>Creator retains all copyrights</li>
          <li>No warranty is provided with this asset</li>
          <li>Creator is not liable for any damages</li>
        </ul>
      </div>

      <div style="border-top: 2px solid #2c3e50; padding-top: 20px; margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Generated on: {{GENERATION_DATE}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">License ID: {{LICENSE_ID}}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Shammarianas Marketplace</p>
            <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Official License Document</p>
          </div>
        </div>
      </div>
    </div>
  `,

  // Free for Commercial Use
  'Free for Commercial Use': `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">FREE FOR COMMERCIAL USE LICENSE</h1>
        <p style="color: #7f8c8d; font-size: 16px;">Digital Asset License Agreement</p>
        <div style="height: 3px; background: #2c3e50; width: 100px; margin: 20px auto;"></div>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Asset Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset Title:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_TITLE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_ID}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Author/Creator:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{AUTHOR_NAME}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">License Type:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #2980b9; font-weight: bold;">Free for Commercial Use</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Price:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_PRICE}}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">Commercial Use License Terms</h2>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #2980b9; border-radius: 5px;">
          <h3 style="color: #2980b9; margin-top: 0;">Permitted Commercial Uses:</h3>
          <ul style="line-height: 1.8;">
            <li>Commercial projects and client work</li>
            <li>Products for sale (up to 10,000 units)</li>
            <li>Advertising and marketing materials</li>
            <li>Website and app development</li>
            <li>Video production and films</li>
            <li>Print materials and publications</li>
            <li>Social media campaigns</li>
          </ul>

          <h3 style="color: #e74c3c; margin-top: 20px;">Restrictions:</h3>
          <ul style="line-height: 1.8;">
            <li>Cannot resell or redistribute the asset files</li>
            <li>Cannot use in templates/themes for sale</li>
            <li>Cannot use in stock media platforms</li>
            <li>Cannot claim authorship of the asset</li>
            <li>Mass production limited to 10,000 units</li>
          </ul>

          <h3 style="color: #27ae60; margin-top: 20px;">Attribution:</h3>
          <p>Not required but attribution to the creator is appreciated.</p>
        </div>
      </div>

      <div style="background: #e8f4f8; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Commercial Rights:</h3>
        <ul style="line-height: 1.8;">
          <li>Unlimited commercial projects</li>
          <li>Multiple client projects allowed</li>
          <li>No royalties or additional fees</li>
          <li>Lifetime commercial rights</li>
          <li>Worldwide distribution rights</li>
        </ul>
      </div>

      <div style="border-top: 2px solid #2c3e50; padding-top: 20px; margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Generated on: {{GENERATION_DATE}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">License ID: {{LICENSE_ID}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">Downloaded: {{DOWNLOAD_DATE}}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Shammarianas Marketplace</p>
            <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Official Commercial License</p>
          </div>
        </div>
      </div>
    </div>
  `,

  // Editorial Use Only
  'Editorial Use Only': `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">EDITORIAL USE ONLY LICENSE</h1>
        <p style="color: #7f8c8d; font-size: 16px;">Digital Asset License Agreement</p>
        <div style="height: 3px; background: #2c3e50; width: 100px; margin: 20px auto;"></div>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Asset Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset Title:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_TITLE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_ID}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Author/Creator:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{AUTHOR_NAME}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">License Type:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #e67e22; font-weight: bold;">Editorial Use Only</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Price:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_PRICE}}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">Editorial License Terms</h2>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #e67e22; border-radius: 5px;">
          <h3 style="color: #e67e22; margin-top: 0;">Permitted Editorial Uses:</h3>
          <ul style="line-height: 1.8;">
            <li>News reporting and articles</li>
            <li>Blog posts and commentary</li>
            <li>Educational materials and textbooks</li>
            <li>Documentaries and non-fiction content</li>
            <li>Criticism and reviews</li>
            <li>Historical documentation</li>
            <li>Research publications</li>
          </ul>

          <h3 style="color: #e74c3c; margin-top: 20px;">Important Restrictions:</h3>
          <ul style="line-height: 1.8;">
            <li><strong>NO COMMERCIAL ADVERTISING</strong></li>
            <li>Cannot be used to sell products or services</li>
            <li>Cannot be used in marketing materials</li>
            <li>Cannot be used for promotional purposes</li>
            <li>Cannot be used in logos or branding</li>
            <li>Cannot be used in product packaging</li>
          </ul>

          <h3 style="color: #3498db; margin-top: 20px;">Required Attribution:</h3>
          <p>Credit must be given to the creator in the following format: "Asset by {{AUTHOR_NAME}}"</p>
        </div>
      </div>

      <div style="background: #fef9e7; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Editorial Use Definition:</h3>
        <p>This asset is licensed for editorial use only, meaning it can be used to illustrate newsworthy events, provide commentary, or for educational purposes, but not for commercial promotion or advertising.</p>
      </div>

      <div style="border-top: 2px solid #2c3e50; padding-top: 20px; margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Generated on: {{GENERATION_DATE}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">License ID: {{LICENSE_ID}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">Editorial License - Non-Commercial</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Shammarianas Marketplace</p>
            <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Official Editorial License</p>
          </div>
        </div>
      </div>
    </div>
  `,

  // Extended License
  'Extended License': `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">EXTENDED COMMERCIAL LICENSE</h1>
        <p style="color: #7f8c8d; font-size: 16px;">Premium Digital Asset License Agreement</p>
        <div style="height: 3px; background: #2c3e50; width: 100px; margin: 20px auto;"></div>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Asset Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset Title:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_TITLE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_ID}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Author/Creator:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{AUTHOR_NAME}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">License Type:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #8e44ad; font-weight: bold;">Extended Commercial License</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Purchase Price:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">{{ASSET_PRICE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Download Date:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{DOWNLOAD_DATE}}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">Extended License Rights</h2>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #8e44ad; border-radius: 5px;">
          <h3 style="color: #8e44ad; margin-top: 0;">Premium Usage Rights:</h3>
          <ul style="line-height: 1.8;">
            <li><strong>Unlimited Commercial Use</strong></li>
            <li>Use in products for sale (unlimited units)</li>
            <li>Use in templates/themes for sale</li>
            <li>Use in software/SaaS applications</li>
            <li>Use in merchandise and physical products</li>
            <li>Use in mobile apps and games</li>
            <li>Broadcast and film production</li>
            <li>Large-scale advertising campaigns</li>
          </ul>

          <h3 style="color: #27ae60; margin-top: 20px;">Additional Permissions:</h3>
          <ul style="line-height: 1.8;">
            <li>No attribution required</li>
            <li>Modification and adaptation allowed</li>
            <li>Use across multiple projects</li>
            <li>Transferable to clients</li>
            <li>Worldwide distribution rights</li>
            <li>Lifetime usage rights</li>
          </ul>

          <h3 style="color: #e74c3c; margin-top: 20px;">Only Restriction:</h3>
          <p>Cannot resell or redistribute the original asset files.</p>
        </div>
      </div>

      <div style="background: #f4ecf7; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Extended License Benefits:</h3>
        <ul style="line-height: 1.8;">
          <li>Highest level of commercial freedom</li>
          <li>No unit limits or production caps</li>
          <li>Ideal for large corporations and agencies</li>
          <li>Perfect for high-volume production</li>
          <li>Suitable for resale products</li>
          <li>Global rights and permissions</li>
        </ul>
      </div>

      <div style="border-top: 2px solid #2c3e50; padding-top: 20px; margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Generated on: {{GENERATION_DATE}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">License ID: {{LICENSE_ID}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">Extended License - Premium Tier</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Shammarianas Marketplace</p>
            <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Premium License Document</p>
          </div>
        </div>
      </div>
    </div>
  `,

  // Default/Standard License (if no specific type found)
  'default': `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">DIGITAL ASSET LICENSE</h1>
        <p style="color: #7f8c8d; font-size: 16px;">License Agreement</p>
        <div style="height: 3px; background: #2c3e50; width: 100px; margin: 20px auto;"></div>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Asset Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset Title:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_TITLE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_ID}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Author/Creator:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{AUTHOR_NAME}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">License Type:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{LICENSE_TYPE}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Price:</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{ASSET_PRICE}}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">License Terms</h2>
        <div style="background: #fff; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
          <p>This digital asset is licensed for use according to the terms specified by the creator. Please refer to the specific license type for detailed permissions and restrictions.</p>
          
          <h3 style="color: #2c3e50; margin-top: 20px;">General Terms:</h3>
          <ul style="line-height: 1.8;">
            <li>License is non-transferable</li>
            <li>Creator retains copyright</li>
            <li>No warranty provided</li>
            <li>Use as per license type restrictions</li>
          </ul>
        </div>
      </div>

      <div style="border-top: 2px solid #2c3e50; padding-top: 20px; margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Generated on: {{GENERATION_DATE}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">License ID: {{LICENSE_ID}}</p>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">Downloaded: {{DOWNLOAD_DATE}}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Shammarianas Marketplace</p>
            <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Official License Document</p>
          </div>
        </div>
      </div>
    </div>
  `
};

// Additional license types (Mockups specific)
LICENSE_TEMPLATES['Free Use'] = LICENSE_TEMPLATES['Free for Personal Use'];
LICENSE_TEMPLATES['Commercial Use'] = LICENSE_TEMPLATES['Free for Commercial Use'];
LICENSE_TEMPLATES['Personal Use Only'] = LICENSE_TEMPLATES['Free for Personal Use'];

// Helper function to generate unique license ID
const generateLicenseId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `LIC-${timestamp}-${random}`.toUpperCase();
};

export const generateLicensePDF = async (asset, user) => {
  try {
    // Determine license type
    let licenseType = asset.licenseType || 'default';
    
    // Fallback for old assets without licenseType
    if (licenseType === 'default') {
      const price = Number(asset.price) || 0;
      const discount = Number(asset.discount ?? 0) || 0;
      const finalPrice = Math.max(0, price - (price * discount) / 100);
      
      if (finalPrice === 0) {
        licenseType = 'Free for Personal Use';
      } else {
        licenseType = 'Free for Commercial Use';
      }
    }

    // Get the appropriate template
    const template = LICENSE_TEMPLATES[licenseType] || LICENSE_TEMPLATES['default'];
    
    // Generate unique license ID
    const licenseId = generateLicenseId();
    
    // Prepare data for replacement
    const data = {
      ASSET_TITLE: asset.title || 'Unknown Asset',
      AUTHOR_NAME: asset.authorName || asset.author || asset.createdBy || asset.publisher || asset.userDisplayName || 'Unknown Author',
      ASSET_PRICE: asset.price ? `$${Number(asset.price).toFixed(2)}` : 'Free',
      DOWNLOAD_DATE: new Date(asset.downloadDate || asset.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      ASSET_ID: asset.id || 'N/A',
      GENERATION_DATE: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      LICENSE_ID: licenseId,
      LICENSE_TYPE: licenseType,
      USER_NAME: user?.displayName || user?.email || 'User',
      USER_EMAIL: user?.email || 'N/A',
      ASSET_TYPE: asset.type || 'Digital Asset'
    };

    // Replace placeholders in template
    let licenseHTML = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      licenseHTML = licenseHTML.replace(regex, value);
    });

    // Generate PDF
    const opt = {
      margin: 0.5,
      filename: `${data.ASSET_TITLE.replace(/[^a-z0-9]/gi, '_')}_License_${licenseId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      }
    };

    // Generate and return PDF
    const element = document.createElement('div');
    element.innerHTML = licenseHTML;
    document.body.appendChild(element);
    
    const pdfBlob = await html2pdf()
      .from(element)
      .set(opt)
      .outputPdf('blob');
    
    document.body.removeChild(element);
    
    return pdfBlob;
    
  } catch (error) {
    console.error('Error generating license PDF:', error);
    throw error;
  }
};

export const downloadLicense = async (asset, user) => {
  try {
    const pdfBlob = await generateLicensePDF(asset, user);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const filename = `${asset.title || 'asset'}_license_${Date.now()}.pdf`
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading license:', error);
    return false;
  }
};

// ✅ ADD THIS MISSING EXPORT
export const downloadSimpleLicense = downloadLicense;