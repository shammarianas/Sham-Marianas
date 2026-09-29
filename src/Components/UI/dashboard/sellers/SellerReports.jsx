import { useState, useEffect } from "react";
import { FiFileText, FiUsers, FiDownload, FiFilter, FiSearch, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw, FiList, FiX, FiEye, FiBarChart2, FiCalendar, FiDollarSign } from "react-icons/fi";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";
import * as XLSX from "xlsx";
import ExportButton from "../../../ExportButton";

const SellerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
 const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(null);

  // ✅ Export handler with callbacks
  const handleExportStart = () => {
    console.log("Export started...");
  };

  const handleExportComplete = (success) => {
    if (success) {
      console.log("Export completed successfully");
    } else {
      console.log("Export failed");
    }
  };

  const handleExportError = (error) => {
    console.error("Export error:", error);
  };

  // ✅ Prepare data for export
  const prepareExportData = (reportsData) => {
    return reportsData.map((report) => ({
      sellerName: report.sellerName || "Unknown Seller",
      sellerEmail: report.sellerEmail || "No email",
      specialization: report.category || "All Types",
      period: report.period || "N/A",
      generatedDate: report.generatedDate || "N/A",
      status: report.status || "unknown",
      revenue: report.revenue || 0,
      growth: report.growth || 0,
      weeklyGrowth: report.weeklyGrowth || 0,
      monthlyGrowth: report.monthlyGrowth || 0,
      totalAssets: report.totalAssets || 0,
      approvedAssets: report.approvedAssets || 0,
      pendingAssets: report.pendingAssets || 0,
      totalDownloads: report.totalDownloads || 0,
      downloads: report.downloads || 0,
      size: report.size || "0 MB",
      format: report.format || "N/A",
    }));
  };

  // ✅ DYNAMIC DATA FETCHING - ENHANCED
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);

        // Fetch all contributors
        const contributorsSnapshot = await getDocs(
          collection(db, "Contributors")
        );
        const allContributors = [];

        contributorsSnapshot.forEach((doc) => {
          const contributorData = doc.data();
          allContributors.push({
            id: doc.id,
            ...contributorData,
          });
        });

        console.log("📊 Total contributors:", allContributors.length);

        // Generate dynamic reports based on contributors
        const dynamicReports = [];
        const allCategories = new Set();
        let reportId = 1;

        for (const contributor of allContributors.slice(0, 12)) {
          // Increased to 12 reports
          try {
            // Fetch contributor's assets to calculate revenue
            const assetsQuery = query(
              collection(db, "Assets"),
              where("ownerId", "==", contributor.id),
              orderBy("createdAt", "desc")
            );
            const assetsSnapshot = await getDocs(assetsQuery);


            let totalDownloads = 0;
            let totalViews = 0;
            let approvedAssets = 0;
            let pendingAssets = 0;

            const assetDetails = [];

            // Calculate time-based statistics
            const now = new Date();
            const oneWeekAgo = new Date(
              now.getTime() - 7 * 24 * 60 * 60 * 1000
            );
            const oneMonthAgo = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );

            let weeklyRevenue = 0;
            let monthlyRevenue = 0;
            let weeklyDownloads = 0;


            assetsSnapshot.forEach((assetDoc) => {
              const assetData = assetDoc.data();
              const price = parseFloat(assetData.price) || 0;
              const downloads = parseInt(assetData.downloads) || 0;
              const views = parseInt(assetData.views) || 0;

              // Calculate asset creation date
              let assetDate = new Date();
              if (assetData.createdAt && assetData.createdAt.toDate) {
                assetDate = assetData.createdAt.toDate();
              } else if (assetData.createdAt) {
                assetDate = new Date(assetData.createdAt);
              }

              const assetRevenue = price * downloads;

              if (
                assetData.status === "approved" ||
                assetData.status === "published"
              ) {
                approvedAssets++;

                // Calculate time-based revenue
                if (assetDate >= oneWeekAgo) {
                  weeklyRevenue += assetRevenue;
                  weeklyDownloads += downloads;
                }
                if (assetDate >= oneMonthAgo) {
                  monthlyRevenue += assetRevenue;
                }
              } else if (assetData.status === "pending") {
                pendingAssets++;
              }

              totalDownloads += downloads;
              totalViews += views;

              assetDetails.push({
                name: assetData.title || "Untitled Asset",
                price: price,
                downloads: downloads,
                views: views,
                rating: parseFloat(assetData.rating) || 0,
                createdAt: assetDate,
                status: assetData.status || "unknown",
                category: assetData.category || 'Other',
              });
            allCategories.add(contributor.specialization || "Unknown");
            });
            // Calculate dynamic growth percentages based on actual data
            let weeklyGrowth = 0;
            let monthlyGrowth = 0;
            let overallGrowth = 0;

            if (assetsSnapshot.size > 0) {
              // Sort assets by date to calculate trends
              const sortedAssets = [...assetDetails].sort(
                (a, b) => a.createdAt - b.createdAt
              );

              if (sortedAssets.length >= 2) {
                const firstHalf = sortedAssets.slice(
                  0,
                  Math.floor(sortedAssets.length / 2)
                );
                const secondHalf = sortedAssets.slice(
                  Math.floor(sortedAssets.length / 2)
                );

                const firstHalfRevenue = firstHalf.reduce(
                  (sum, asset) => sum + asset.price * asset.downloads,
                  0
                );
                const secondHalfRevenue = secondHalf.reduce(
                  (sum, asset) => sum + asset.price * asset.downloads,
                  0
                );

                if (firstHalfRevenue > 0) {
                  overallGrowth =
                    ((secondHalfRevenue - firstHalfRevenue) /
                      firstHalfRevenue) *
                    100;
                }
              }

              // Calculate weekly vs monthly growth
              const olderMonthlyRevenue = monthlyRevenue - weeklyRevenue;
              if (olderMonthlyRevenue > 0) {
                weeklyGrowth =
                  ((weeklyRevenue - olderMonthlyRevenue / 3) /
                    (olderMonthlyRevenue / 3)) *
                  100;
              }

              // Calculate monthly growth
              const olderAssets = assetDetails.filter(
                (asset) => asset.createdAt < oneMonthAgo
              );
              const olderRevenue = olderAssets.reduce(
                (sum, asset) => sum + asset.price * asset.downloads,
                0
              );
              const recentMonthAssets = assetDetails.filter(
                (asset) =>
                  asset.createdAt >= oneMonthAgo && asset.createdAt < oneWeekAgo
              );
              const recentMonthRevenue = recentMonthAssets.reduce(
                (sum, asset) => sum + asset.price * asset.downloads,
                0
              );

              if (olderRevenue > 0 && recentMonthRevenue > 0) {
                monthlyGrowth =
                  ((monthlyRevenue - recentMonthRevenue) / recentMonthRevenue) *
                  100;
              }
            }

            // Calculate primary category from assets
            const categoryCounts = {};
            assetDetails.forEach(asset => {
              const cat = asset.category || 'Other';
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
            Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, 'Other');

            // Dynamic status based on recent activity
            let status = "completed";
            const hasRecentActivity = weeklyDownloads > 0 || weeklyRevenue > 0;

            if (hasRecentActivity && Math.random() > 0.7) {
              status = "generating";
            } else if (approvedAssets === 0 && Math.random() > 0.9) {
              status = "failed";
            }

            // Dynamic period based on actual data
            const periods = [];
            if (weeklyRevenue > 0)
              periods.push(`Week of ${oneWeekAgo.toLocaleDateString()}`);
            if (monthlyRevenue > 0)
              periods.push(
                `${oneMonthAgo.toLocaleString("default", {
                  month: "long",
                })} ${oneMonthAgo.getFullYear()}`
              );
            periods.push("Last Quarter", "Year-to-Date", "All Time");

            const period = periods[Math.floor(Math.random() * periods.length)];

            dynamicReports.push({
              id: `report_${Date.now()}_${reportId}`,
              reportId: reportId++,
              sellerName:
                contributor.businessName ||
                contributor.username ||
                contributor.displayName ||
                "Unknown Seller",
              sellerEmail: contributor.email || "No email",
              sellerId: contributor.id,
              category: contributor.specialization || "Unknown",
              period: period,
              generatedDate: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0],
              lastUpdated: new Date().toISOString(),
              status: status,
              downloads:
                status === "completed"
                  ? Math.floor(Math.random() * 50) +
                    (totalDownloads > 0 ? Math.min(totalDownloads, 20) : 0)
                  : 0,
              size:
                status === "completed"
                  ? `${(Math.random() * 3 + 1).toFixed(1)} MB`
                  : "Processing",
              format: getRandomFormat(),
              // ✅ YAHAN CHANGE HAI - Use contributor's actual totalEarnings
              revenue: contributor.totalEarnings || 0, // Is line ko change kiya hai
              growth: parseFloat(overallGrowth.toFixed(1)),
              weeklyGrowth: parseFloat(weeklyGrowth.toFixed(1)),
              monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
              totalAssets: assetsSnapshot.size,
              approvedAssets: approvedAssets,
              pendingAssets: pendingAssets,
              totalDownloads: totalDownloads,
              totalViews: totalViews,
              weeklyRevenue: Math.floor(weeklyRevenue),
              monthlyRevenue: Math.floor(monthlyRevenue),
              conversionRate:
                totalViews > 0
                  ? ((totalDownloads / totalViews) * 100).toFixed(1)
                  : "0.0",
              assetDetails: assetDetails,
              performanceData: {
                topPerformingAsset:
                  assetDetails.length > 0
                    ? assetDetails.reduce((max, asset) =>
                        asset.downloads > max.downloads
                          ? asset
                          : assetDetails[0]
                      )
                    : null,
                averagePrice:
                  assetDetails.length > 0
                    ? (
                        assetDetails.reduce(
                          (sum, asset) => sum + asset.price,
                          0
                        ) / assetDetails.length
                      ).toFixed(2)
                    : 0,
                bestDay: getBestPerformingDay(assetDetails),
                rating:
                  assetDetails.length > 0
                    ? (
                        assetDetails.reduce(
                          (sum, asset) => sum + asset.rating,
                          0
                        ) / assetDetails.length
                      ).toFixed(1)
                    : 0,
              },
            });
          } catch (error) {
            console.error(
              `Error processing contributor ${contributor.id}:`,
              error
            );
          }
        }

        setAvailableCategories(Array.from(allCategories).sort());
        setReports(dynamicReports);
        console.log("✅ Dynamic reports generated:", dynamicReports.length);
      } catch (error) {
        console.error("❌ Error fetching reports data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();

    // Set up periodic refresh every 2 minutes
    const intervalId = setInterval(() => {
      fetchReportsData();
    }, 120000);

    return () => clearInterval(intervalId);
  }, []);

  // ✅ HELPER FUNCTIONS
  const getRandomPeriod = () => {
    const periods = [
      "January 2024",
      "February 2024",
      "March 2024",
      "Q1 2024",
      "December 2023",
      "Q4 2023",
      "Weekly",
      "Monthly",
    ];
    return periods[Math.floor(Math.random() * periods.length)];
  };

  const getRandomFormat = () => {
    const formats = ["PDF", "Excel", "CSV"];
    return formats[Math.floor(Math.random() * formats.length)];
  };

  const getBestPerformingDay = (assets) => {
    if (!assets || assets.length === 0) return "N/A";

    const dayCounts = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    assets.forEach((asset) => {
      if (asset.createdAt) {
        const day = asset.createdAt.getDay();
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        dayCounts[dayNames[day]] += asset.downloads || 0;
      }
    });

    return Object.keys(dayCounts).reduce((a, b) =>
      dayCounts[a] > dayCounts[b] ? a : b
    );
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesCategory =
    categoryFilter === "all" || report.category === categoryFilter;

     return matchesSearch && matchesStatus && matchesCategory;
  });

  // ✅ DYNAMIC STATISTICS - ENHANCED
  const stats = {
    totalReports: reports.length,
    completedReports: reports.filter((r) => r.status === "completed").length,
    generatingReports: reports.filter((r) => r.status === "generating").length,
    failedReports: reports.filter((r) => r.status === "failed").length,
    totalDownloads: reports.reduce((sum, report) => sum + report.downloads, 0),
    totalRevenue: reports.reduce((sum, report) => sum + report.revenue, 0),
    totalSellers: new Set(reports.map((r) => r.sellerEmail)).size,
    averageRevenue:
      reports.length > 0
        ? reports.reduce((sum, report) => sum + report.revenue, 0) /
          reports.length
        : 0,
    totalGrowth:
      reports.length > 0
        ? reports.reduce((sum, report) => sum + (report.growth || 0), 0) /
          reports.length
        : 0,
    totalAssets: reports.reduce((sum, report) => sum + report.totalAssets, 0),
    weeklyRevenue: reports.reduce(
      (sum, report) => sum + (report.weeklyRevenue || 0),
      0
    ),
    monthlyRevenue: reports.reduce(
      (sum, report) => sum + (report.monthlyRevenue || 0),
      0
    ),
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="report-status-badge resolved">
            <FiCheckCircle /> Completed
          </span>
        );
      case "generating":
        return (
          <span className="report-status-badge pending">
            <FiClock /> Generating
          </span>
        );
      case "failed":
        return (
          <span className="report-status-badge in-progress">
            <FiAlertCircle /> Failed
          </span>
        );
      default:
        return <span className="report-status-badge pending">Unknown</span>;
    }
  };

  const getGrowthBadge = (growth) => {
    const growthValue = parseFloat(growth) || 0;
    return growthValue >= 0 ? (
      <span className="report-stat-trend positive">
        +{growthValue}% <FiTrendingUp className="fi-pl" />
      </span>
    ) : (
      <span className="report-stat-trend negative">
        {growthValue}% <FiTrendingDown className="fi-pl" />
      </span>
    );
  };

 const getCategoryBadge = (category) => {
  const categoryStyles = {
    "Videos": { class: "videos", icon: "🎬" },
    "3D Models": { class: "models", icon: "🎮" },
    "Video Templates": { class: "video-templates", icon: "📹" },
    "Images": { class: "images", icon: "🖼️" },
    "Graphic Templates": { class: "graphics", icon: "🎨" },
    "Mockups": { class: "mockups", icon: "📱" },
    "Fonts": { class: "fonts", icon: "🔤" },
    "Icons": { class: "icons", icon: "⚡" },
    "Textures": { class: "textures", icon: "🧱" },
    "Scripts": { class: "scripts", icon: "💻" },
    "HDRIs": { class: "hdris", icon: "🌅" },
  };

  const style = categoryStyles[category] || { class: "general", icon: "📄" };

  return (
    <span className={`report-category-badge ${style.class}`}>
      {style.icon} {category}
    </span>
  );
};

  // ✅ PROPER REPORT DOWNLOAD FUNCTION
  const downloadReportAsExcel = (report) => {
    if (!report) return;

    // Prepare data for Excel
    const worksheetData = [
      ["Seller Report", report.reportType],
      ["Seller Name", report.sellerName],
      ["Seller Email", report.sellerEmail],
      ["Category", report.category],
      ["Report Period", report.period],
      ["Generated Date", report.generatedDate],
      ["Last Updated", new Date(report.lastUpdated).toLocaleString()],
      ["Status", report.status],
      ["Format", report.format],
      ["File Size", report.size],
      [], // Empty row for spacing

      ["FINANCIAL SUMMARY", ""],
      ["Total Revenue", `$${report.revenue.toLocaleString()}`],
      ["Weekly Revenue", `$${(report.weeklyRevenue || 0).toLocaleString()}`],
      ["Monthly Revenue", `$${(report.monthlyRevenue || 0).toLocaleString()}`],
      ["Overall Growth", `${report.growth >= 0 ? "+" : ""}${report.growth}%`],
      [
        "Weekly Growth",
        `${report.weeklyGrowth >= 0 ? "+" : ""}${report.weeklyGrowth}%`,
      ],
      [
        "Monthly Growth",
        `${report.monthlyGrowth >= 0 ? "+" : ""}${report.monthlyGrowth}%`,
      ],
      [], // Empty row for spacing

      ["PERFORMANCE METRICS", ""],
      ["Total Assets", report.totalAssets],
      ["Approved Assets", report.approvedAssets],
      ["Pending Assets", report.pendingAssets || 0],
      ["Total Downloads", report.totalDownloads],
      ["Total Views", report.totalViews || 0],
      ["Conversion Rate", `${report.conversionRate}%`],
      ["Report Downloads", report.downloads],
      [], // Empty row for spacing

      ["PERFORMANCE INSIGHTS", ""],
      ["Average Price", `$${report.performanceData?.averagePrice || 0}`],
      ["Best Performing Day", report.performanceData?.bestDay || "N/A"],
      ["Top Asset", report.performanceData?.topPerformingAsset?.name || "N/A"],
      [
        "Top Asset Downloads",
        report.performanceData?.topPerformingAsset?.downloads || 0,
      ],
      [
        "Top Asset Revenue",
        `$${(
          report.performanceData?.topPerformingAsset?.price *
            report.performanceData?.topPerformingAsset?.downloads || 0
        ).toFixed(2)}`,
      ],
      [], // Empty row for spacing
    ];

    // Add asset details if available
    if (report.assetDetails && report.assetDetails.length > 0) {
      worksheetData.push(["ASSET DETAILS", ""]);
      worksheetData.push([
        "Asset Name",
        "Price",
        "Downloads",
        "Views",
        "Rating",
        "Status",
        "Created Date",
      ]);

      report.assetDetails.forEach((asset) => {
        worksheetData.push([
          asset.name,
          `$${asset.price}`,
          asset.downloads,
          asset.views,
          asset.rating,
          asset.status,
          asset.createdAt ? asset.createdAt.toLocaleDateString() : "N/A",
        ]);
      });
    }

    // Add trend data
    worksheetData.push([], ["TREND ANALYSIS", ""]);
    worksheetData.push(["Metric", "Value", "Growth"]);
    worksheetData.push([
      "Overall Performance",
      "Excellent",
      `${report.growth >= 0 ? "Positive" : "Negative"}`,
    ]);
    worksheetData.push([
      "Weekly Trend",
      report.weeklyGrowth >= 0 ? "Growing" : "Declining",
      `${report.weeklyGrowth}%`,
    ]);
    worksheetData.push([
      "Monthly Trend",
      report.monthlyGrowth >= 0 ? "Growing" : "Declining",
      `${report.monthlyGrowth}%`,
    ]);
    worksheetData.push([
      "Conversion",
      report.conversionRate > 5 ? "Good" : "Needs Improvement",
      `${report.conversionRate}%`,
    ]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Style the worksheet
    const wscols = [
      { wch: 30 }, // Column A width
      { wch: 25 }, // Column B width
      { wch: 15 }, // Column C width
      { wch: 15 }, // Column D width
      { wch: 10 }, // Column E width
      { wch: 15 }, // Column F width
      { wch: 15 }, // Column G width
    ];
    ws["!cols"] = wscols;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Seller Report");

    // Generate Excel file
    const fileName = `${report.sellerName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_${report.category.replace(/\s+/g, "_")}_${report.period.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Update download count
    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id ? { ...r, downloads: r.downloads + 1 } : r
      )
    );

    console.log(`✅ Report downloaded: ${fileName}`);
  };

  const handleGenerateReport = async (individualReport = null) => {
    if (individualReport) {
      // Generate individual report
      setGeneratingReport(individualReport.id);

      // Simulate report generation process
      setTimeout(() => {
        setReports((prev) =>
          prev.map((r) =>
            r.id === individualReport.id
              ? {
                  ...r,
                  status: "completed",
                  size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
                  downloads: 0,
                  lastUpdated: new Date().toISOString(),
                }
              : r
          )
        );
        setGeneratingReport(null);
        alert(
          `✅ Report for ${individualReport.sellerName} has been generated successfully!`
        );
      }, 2000);
    } else {
      // Generate new report
      const newReport = {
        id: `new_report_${Date.now()}`,
        reportId: reports.length + 1,
        sellerName: "New Seller Report",
        sellerEmail: "report@example.com",
       category: "Videos",
        period: getRandomPeriod(),
        generatedDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString(),
        status: "generating",
        downloads: 0,
        size: "Processing",
        format: "Excel",
        revenue: Math.floor(Math.random() * 20000) + 1000,
        growth: (Math.random() * 40 - 10).toFixed(1),
        totalAssets: Math.floor(Math.random() * 20) + 1,
        approvedAssets: Math.floor(Math.random() * 15) + 1,
        totalDownloads: Math.floor(Math.random() * 100) + 10,
      };

      setReports((prev) => [newReport, ...prev]);

      // Simulate completion
      setTimeout(() => {
        setReports((prev) =>
          prev.map((r) =>
            r.id === newReport.id
              ? {
                  ...r,
                  status: "completed",
                  size: "2.5 MB",
                }
              : r
          )
        );
        alert("✅ New report generated successfully!");
      }, 3000);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };



  return (
    <div className="user-reports-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading Seller Reports...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            Seller Reports
          </h2>
          <p className="header-subtitle">
            Generate and manage seller performance reports
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {stats.totalReports} total reports
          </span>
          <button
            className="action-button secondary"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw /> Refresh Data
          </button>
        </div>
      </div>

      {/* Statistics Cards - Updated with dynamic data */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiFileText />
            </div>
            <div>
              <h3 className="report-stat-title">Total Reports</h3>
              <div className="report-stat-value">{stats.totalReports}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              {stats.completedReports} completed, {stats.generatingReports}{" "}
              generating
            </div>
            <div
              className={`report-stat-trend ${
                stats.totalGrowth >= 0 ? "positive" : "negative"
              }`}
            >
              {stats.totalGrowth >= 0 ? "+" : ""}
              {stats.totalGrowth.toFixed(1)}%
              {stats.totalGrowth >= 0 ? (
                <FiTrendingUp className="fi-pl" />
              ) : (
                <FiTrendingDown className="fi-pl" />
              )}
            </div>
          </div>
        </div>

        {/* <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDownload />
            </div>
            <div>
              <h3 className="report-stat-title">Total Downloads</h3>
              <div className="report-stat-value">{stats.totalDownloads}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Report downloads
            </div>
            <div className="report-stat-trend positive">
              +22.5% <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div> */}

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiClock />
            </div>
            <div>
              <h3 className="report-stat-title">In Progress</h3>
              <div className="report-stat-value">{stats.generatingReports}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Reports generating</div>
            <div className="report-stat-trend positive">
              +
              {((stats.generatingReports / stats.totalReports) * 100).toFixed(
                1
              )}
              %
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Active Sellers</h3>
              <div className="report-stat-value">{stats.totalSellers}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Generating reports</div>
            <div className="report-stat-trend positive">
              +{((stats.totalSellers / reports.length) * 10).toFixed(1)}%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>


      {/* Revenue Stats */}
      <div className="reports-stats-grid">
        <div className="report-stat-card revenue">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <h3 className="report-stat-title">Total Revenue</h3>
              <div className="report-stat-value">
                ${stats.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              From contributor actual earnings {/* Yahan text change kiya */}
            </div>
            <div className="report-stat-trend positive">
              +
              {((stats.totalRevenue / (reports.length * 1000)) * 100).toFixed(
                1
              )}
              %
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>

        <div className="report-stat-card assets">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiBarChart2 />
            </div>
            <div>
              <h3 className="report-stat-title">Total Assets</h3>
              <div className="report-stat-value">{stats.totalAssets}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">Across all sellers</div>
            <div className="report-stat-trend positive">
              +{(stats.totalAssets / reports.length).toFixed(0)}%
              <FiTrendingUp className="fi-pl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Reports
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredReports.length} of {stats.totalReports} reports
            </span>
            {filteredReports.length > 0 && (
              <span className="filter-stats">
                💰 Revenue: $
                {filteredReports
                  .reduce((sum, r) => sum + r.revenue, 0)
                  .toLocaleString()}{" "}
                | 📈 Growth:{" "}
                {(
                  filteredReports.reduce(
                    (sum, r) => sum + parseFloat(r.growth || 0),
                    0
                  ) / filteredReports.length || 0
                ).toFixed(1)}
                %
              </span>
            )}
          </div>
        </div>

        <div className="filter-controls-grid">
          <div className="filter-search-wrapper">
            <FiSearch className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search reports by seller, type, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="generating">Generating</option>
            <option value="failed">Failed</option>
          </select>

          <select
  className="filter-select"
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
>
  <option value="all">All Categories</option>
  {availableCategories.map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>

          <div className="filter-actions">
            <button className="filter-button" onClick={resetFilters}>
              <FiRefreshCw /> Reset
            </button>
            <button
              className="filter-button primary"
              onClick={() => handleGenerateReport()}
            >
              <FiFileText /> Generate New Report
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="recent-reports-card">
        <div className="recent-reports-header">
          <h3 className="panel-title">
            <FiList className="panel-icon" /> Generated Reports
          </h3>
          <ExportButton
            data={prepareExportData(
              filteredReports.length > 0 ? filteredReports : reports
            )}
            filename="seller-reports"
            variant="secondary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
          />
        </div>
        <div className="recent-reports-body">
          <table className="report-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Category</th>
                <th>Generated Date</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="report-user">
                      <div className="report-user-info">
                        <div className="report-user-name">
                          {report.sellerName}
                        </div>
                        <div className="report-user-email">
                          {report.sellerEmail}
                        </div>
                        <div className="report-user-stats">
                          <small>
                            {report.totalAssets} assets •{" "}
                            {report.approvedAssets} approved
                          </small>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{report.category}</td>

                  <td>
                    <div className="comp-dis">
                      {report.generatedDate}
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        <FiCalendar /> Updated:{" "}
                        {new Date(report.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="comp-dis">
                      ${report.revenue.toLocaleString()}
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: report.growth >= 0 ? "#10b981" : "#ef4444",
                        }}
                      >
                        {getGrowthBadge(report.growth)}
                        {report.monthlyGrowth && (
                          <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                            📅 {report.monthlyGrowth}% monthly
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="action-button secondary small"
                        title="View Details"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye />
                      </button>

                      {report.status === "completed" && (
                        <button
                          className="action-button small"
                          title="Download Report (Excel)"
                          onClick={() => downloadReportAsExcel(report)}
                        >
                          <FiDownload />
                        </button>
                      )}

                      <button
                        className="action-button warning small"
                        title="Generate Individual Report"
                        onClick={() => handleGenerateReport(report)}
                        disabled={generatingReport === report.id}
                      >
                        {generatingReport === report.id ? (
                          <FiRefreshCw className="spinning" />
                        ) : (
                          <FiClock />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-reports">
                    No reports found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal - Enhanced */}
      {showDetailsModal && selectedReport && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Report Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="report-detail-grid">
                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">
                      {getCategoryBadge(selectedReport.category)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Format:</span>
                    <span className="detail-value">
                      {selectedReport.format}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">File Size:</span>
                    <span className="detail-value">{selectedReport.size}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {new Date(selectedReport.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Seller Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Seller:</span>
                    <span className="detail-value">
                      {selectedReport.sellerName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {selectedReport.sellerEmail}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Assets:</span>
                    <span className="detail-value">
                      {selectedReport.totalAssets}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Approved Assets:</span>
                    <span className="detail-value">
                      {selectedReport.approvedAssets}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Performance Metrics</h4>
                  <div className="detail-item">
                    <span className="detail-label">Revenue:</span>
                    <span className="detail-value">
                      ${selectedReport.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Weekly Revenue:</span>
                    <span className="detail-value">
                      ${(selectedReport.weeklyRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Revenue:</span>
                    <span className="detail-value">
                      ${(selectedReport.monthlyRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Overall Growth:</span>
                    <span className="detail-value">
                      {getGrowthBadge(selectedReport.growth)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Weekly Growth:</span>
                    <span className="detail-value">
                      <span
                        className={
                          selectedReport.weeklyGrowth >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {selectedReport.weeklyGrowth >= 0 ? "+" : ""}
                        {selectedReport.weeklyGrowth}%
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Growth:</span>
                    <span className="detail-value">
                      <span
                        className={
                          selectedReport.monthlyGrowth >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {selectedReport.monthlyGrowth >= 0 ? "+" : ""}
                        {selectedReport.monthlyGrowth}%
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Downloads:</span>
                    <span className="detail-value">
                      {selectedReport.downloads}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Conversion Rate:</span>
                    <span className="detail-value">
                      {selectedReport.conversionRate}%
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Report Status & Actions</h4>
                  <div className="detail-item">
                    <span className="detail-label">Current Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedReport.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Downloads:</span>
                    <span className="detail-value">
                      {selectedReport.downloads} times
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Generated Date:</span>
                    <span className="detail-value">
                      {selectedReport.generatedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-button secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>

              {selectedReport.status === "completed" && (
                <button
                  className="action-button"
                  onClick={() => {
                    downloadReportAsExcel(selectedReport);
                    setShowDetailsModal(false);
                  }}
                >
                  <FiDownload /> Download Excel Report
                </button>
              )}

              <button
                className="action-button warning"
                onClick={() => {
                  handleGenerateReport(selectedReport);
                  setShowDetailsModal(false);
                }}
                disabled={generatingReport === selectedReport.id}
              >
                {generatingReport === selectedReport.id ? (
                  <>
                    <FiRefreshCw className="spinning" /> Generating...
                  </>
                ) : (
                  <>
                    <FiRefreshCw /> Regenerate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReports;
