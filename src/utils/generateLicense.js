import html2pdf from 'html2pdf.js';

// License templates
const FREE_LICENSE_TEMPLATE = `...free template content...`;
const COMMERCIAL_LICENSE_TEMPLATE = `...commercial template content...`;

export const generateLicensePDF = async (asset, user) => {
    // Determine license type based on price
    const isFree = (Number(asset.price) || 0) === 0;
    const template = isFree ? FREE_LICENSE_TEMPLATE : COMMERCIAL_LICENSE_TEMPLATE;
    
    // Replace placeholders with actual data
    const licenseHTML = template
        .replace(/{{ASSET_TITLE}}/g, asset.title || 'Unknown Asset')
        .replace(/{{AUTHOR_NAME}}/g, asset.publisher || asset.userDisplayName || asset.authorName || 'Unknown Author')
        .replace(/{{ASSET_PRICE}}/g, `$${(Number(asset.price) || 0).toFixed(2)}`)
        .replace(/{{DOWNLOAD_DATE}}/g, new Date(asset.downloadDate || asset.createdAt).toLocaleDateString())
        .replace(/{{ASSET_ID}}/g, asset.id || 'N/A')
        .replace(/{{GENERATION_DATE}}/g, new Date().toLocaleDateString());

    // Generate PDF
    const opt = {
        margin: 1,
        filename: `${asset.title}_License.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        const pdf = await html2pdf().from(licenseHTML).set(opt).outputPdf('blob');
        return pdf;
    } catch (error) {
        console.error('Error generating PDF:', error);
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
        link.download = `${asset.title}_License.pdf`;
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