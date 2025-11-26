import { FiDownload } from "react-icons/fi";

// Smart header name generator
const generateHeaderName = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Export to CSV
export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.map((h) => `"${generateHeaderName(h)}"`).join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          if (value === null || value === undefined) return '""';
          if (typeof value === "object") value = JSON.stringify(value);
          if (typeof value === "string" && value.includes(","))
            value = `"${value}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Export to Excel
export const exportToExcel = (data, filename = "export.xlsx") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  let html = "<table><tr>";
  headers.forEach((h) => {
    html += `<th>${generateHeaderName(h)}</th>`;
  });
  html += "</tr>";

  data.forEach((row) => {
    html += "<tr>";
    headers.forEach((header) => {
      let value = row[header];
      if (typeof value === "object") value = JSON.stringify(value);
      html += `<td>${value || ""}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Export to JSON
export const exportToJSON = (data, filename = "export.json") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// ===== SPECIFIC EXPORT FUNCTIONS FOR DASHBOARD TABLES =====

// Users Export
export const exportUsersData = (users, format = "csv") => {
  const formattedData = users.map((user) => ({
    "User Name": user.name || user.displayName || "N/A",
    Email: user.email || "N/A",
    Username: user.username || "N/A",
    Role: user.role || "User",
    Status: user.status || "Active",
    "Total Purchases": user.totalPurchases || 0,
    "Total Spent": user.totalSpent || 0,
    "Total Downloads": user.totalDownloads || 0,
    "Joined Date": user.createdAt || user.joinDate || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `users_report_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// User Reports Export
export const exportUserReportsData = (reports, format = "csv") => {
  const formattedData = reports.map((report) => ({
    "User Name": report.userName || "N/A",
    Email: report.userEmail || "N/A",
    "Report Type": report.reportType || "N/A",
    Subject: report.subject || "N/A",
    Description: report.description || "N/A",
    Status: report.status || "Pending",
    "Created Date": report.createdAt || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `user_reports_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Sellers Export
export const exportSellersData = (sellers, format = "csv") => {
  const formattedData = sellers.map((seller) => ({
    "Seller Name": seller.name || seller.displayName || "N/A",
    Email: seller.email || "N/A",
    "Business Name": seller.businessName || "N/A",
    Status: seller.status || "Active",
    "Verification Status": seller.verificationStatus || "Pending",
    "Total Assets": seller.totalAssets || 0,
    "Total Earning": seller.totalEarning || 0,
    "Joined Date": seller.createdAt || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `sellers_report_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Seller Reports Export
export const exportSellerReportsData = (reports, format = "csv") => {
  const formattedData = reports.map((report) => ({
    "Seller Name": report.sellerName || "N/A",
    Email: report.sellerEmail || "N/A",
    "Report Type": report.reportType || "N/A",
    Subject: report.subject || "N/A",
    Description: report.description || "N/A",
    Status: report.status || "Pending",
    "Created Date": report.createdAt || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `seller_reports_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Downloads Export
export const exportDownloadsData = (downloads, format = "csv") => {
  const formattedData = downloads.map((download) => ({
    "User Name": download.userName || "N/A",
    Email: download.userEmail || "N/A",
    "Asset Name": download.assetName || "N/A",
    "Asset Type": download.assetType || "N/A",
    "Download Date": download.downloadDate || "N/A",
    "Seller Name": download.sellerName || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `downloads_report_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Assets Export
export const exportAssetsData = (assets, format = "csv") => {
  const formattedData = assets.map((asset) => ({
    "Asset Name": asset.title || asset.name || "N/A",
    Category: asset.category || "N/A",
    Type: asset.type || "N/A",
    "Seller Name": asset.sellerName || "N/A",
    Price: asset.price || 0,
    Downloads: asset.downloads || 0,
    Status: asset.status || "Active",
    "Created Date": asset.createdAt || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `assets_report_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Asset Requests Export
export const exportAssetRequestsData = (requests, format = "csv") => {
  const formattedData = requests.map((request) => ({
    "Seller Name": request.sellerName || "N/A",
    Email: request.sellerEmail || "N/A",
    "Asset Name": request.assetName || "N/A",
    Category: request.category || "N/A",
    Status: request.status || "Pending",
    "Request Date": request.requestDate || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `asset_requests_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Payments Export
export const exportPaymentsData = (payments, format = "csv") => {
  const formattedData = payments.map((payment) => ({
    "User Name": payment.userName || "N/A",
    Email: payment.userEmail || "N/A",
    Amount: payment.amount || 0,
    Plan: payment.plan || "N/A",
    Status: payment.status || "Pending",
    "Payment Date": payment.paymentDate || "N/A",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `payments_report_${timestamp}.${format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"}`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};

// Seller Verification Export - matches SellerAccountVerify table
export const exportSellersVerifyData = (sellers, format = "csv") => {
  const formattedData = sellers.map((seller) => ({
    "Seller Name": seller.name || seller.fullName || seller.username || "N/A",
    Email: seller.email || "N/A",
    "Business Name": seller.businessName || seller.specialization || "Unknown",
    Category: seller.category || seller.specialization || "General",
    Location: seller.location || seller.countryCode || "N/A",
    "Join Date": seller.joinDate || "N/A",
    Status: seller.status || "Pending",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `seller-verification_${timestamp}.${
    format === "json" ? "json" : format === "excel" ? "xlsx" : "csv"
  }`;

  if (format === "json") exportToJSON(formattedData, filename);
  else if (format === "excel") exportToExcel(formattedData, filename);
  else exportToCSV(formattedData, filename);
};