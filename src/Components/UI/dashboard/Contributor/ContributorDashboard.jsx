import { auth, db, storage } from "../../../../firebase";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

// Import icons
import {
  FiHome,
  FiUpload,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiPieChart,
  FiList,
  FiSearch,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMessageSquare,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiClock,
} from "react-icons/fi";

// Import Components
import DashboardOverview from "../Contributor-tabs/DashboardOverview";
import UploadFiles from "../Contributor-tabs/UploadFiles";
import UnderRevision from "../Contributor-tabs/UnderRevision";
import Rejections from "../Contributor-tabs/Rejections";
import PublishedFiles from "../Contributor-tabs/PublishedFiles";
import Statistics from "../Contributor-tabs/Statistics";
import SearchTrends from "../Contributor-tabs/SearchTrends";
import Support from "../../../../Pages/Support"
import ReportTrack from "../Contributor-tabs/ReportTrack";
import BillingInvoices from "../Contributor-tabs/BillingInvoices";
// ✅ ADDED: Import Profile component
import Profile from "../../../../Pages/Profile"; // Adjust path as needed

import "../../../../assets/Styles/contribute-style.css";

const UnauthorizedAccess = ({ error }) => {
  return (
    <div className="unauthorized-access">
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};
const ProfileWrapper = ({ userId }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (userId) {
      // Direct profile page par navigate karo
      navigate(`/profile/${userId}`);
    }
  }, [userId, navigate]);
}

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [assets, setAssets] = useState([]);
   const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    underRevision: 0,
    rejections: 0,
    published: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();

  // ✅ ADDED: Profile tab handler
  const handleProfileTab = () => {
    setActiveTab("profile");
  };
// ✅ ADDED: Report track handler
  const handleReportTrack = () => {
    setActiveTab("report-track");
  };
  // Check seller status and fetch data
 useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setError("Please log in to access the seller dashboard");
        navigate("/contributor-login");
        return;
      }

      try {
        const uid = currentUser.uid;
        const sellerDoc = await getDoc(doc(db, "Contributors", uid));

        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();

          // Check if contributor is active
          if (sellerData.status !== "verified") {
            setError(
              `Your contributor account is ${sellerData.status}. You cannot access the dashboard.`
            );

            if (sellerData.status === "pending") {
              navigate("/contributor-pending");
            } else if (sellerData.status === "rejected") {
              navigate("/contributor-rejected");
            } else {
              navigate("/become-contributor");
            }
            return;
          }

          // If status = active, allow access
          setIsSeller(true);
          setUserData(sellerData);
          await Promise.all([
            fetchSellerData(uid),
            fetchUserReports(uid) // ✅ ADDED: Fetch reports
          ]);
        } else {
          setError("You are not registered as a contributor");
          navigate("/become-contributor");
        }
      } catch (error) {
        setError(`Failed to verify seller status: ${error.message}`);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

// ✅ ADDED: Fetch user reports function
  const fetchUserReports = async (uid) => {
    try {
      const supportQuery = query(
        collection(db, `Profiles/${uid}/Support`),
        orderBy("createdAt", "desc")
      );
      
      const supportSnapshot = await getDocs(supportQuery);
      const userReports = [];

      supportSnapshot.forEach((doc) => {
        const reportData = doc.data();
        userReports.push({
          id: doc.id,
          ...reportData
        });
      });

      setReports(userReports);
    } catch (error) {
      console.error("Error fetching user reports:", error);
    }
  };

  // Fetch seller data
  const fetchSellerData = async (uid) => {
    setLoading(true);
    try {
      await Promise.all([fetchAssets(uid), fetchStats(uid)]);
    } catch (error) {
      setError(`Failed to load seller data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch seller assets
  const fetchAssets = async (uid) => {
    try {
      const q = query(
        collection(db, "Assets"),
        where("ownerId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetsData);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  // Fetch seller stats
  const fetchStats = async (uid) => {
    try {
      const assetsQuery = query(
        collection(db, "Assets"),
        where("ownerId", "==", uid)
      );
      const assetsSnapshot = await getDocs(assetsQuery);

      let totalUploads = 0;
      let underRevision = 0;
      let rejections = 0;
      let published = 0;

      assetsSnapshot.forEach((doc) => {
        const asset = doc.data();
        totalUploads++;

        const status = asset.status?.toLowerCase() || "pending";
        
        switch (status) {
          case "pending":
            underRevision++;
            break;
          case "rejected":
            rejections++;
            break;
          case "approved":
            published++;
            break;
          default:
            if (status.includes("reject") || status.includes("decline")) {
              rejections++;
            } else if (status.includes("approve") || status.includes("publish") || status.includes("active")) {
              published++;
            } else {
              underRevision++;
            }
            break;
        }
      });

      let totalEarnings = 0;
      let pendingEarnings = 0;

      try {
        const earningsQuery = query(
          collection(db, "Earnings"),
          where("contributorId", "==", uid)
        );
        const earningsSnapshot = await getDocs(earningsQuery);

        earningsSnapshot.forEach((doc) => {
          const earning = doc.data();
          if (earning.status === "paid") {
            totalEarnings += earning.amount || 0;
          } else if (earning.status === "pending") {
            pendingEarnings += earning.amount || 0;
          }
        });
      } catch (error) {
        console.log("Earnings collection not found or error:", error);
      }

      setStats({
        totalUploads,
        underRevision,
        rejections,
        published,
        totalEarnings,
        pendingEarnings,
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Real-time listener for assets updates
  useEffect(() => {
    if (!userData?.uid) return;

    const assetsQuery = query(
      collection(db, "Assets"),
      where("ownerId", "==", userData.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(assetsQuery, (snapshot) => {
      const assetsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetsData);
      
      if (userData?.uid) {
        fetchStats(userData.uid);
      }
    }, (error) => {
      console.error("Error in real-time assets listener:", error);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = normalizeDate(date);
    return d ? d.toLocaleDateString() : "N/A";
  };

  const normalizeDate = (value) => {
    if (!value) return null;
    if (value.toDate) {
      try {
        return value.toDate();
      } catch {
        return null;
      }
    }
    if (value.seconds) return new Date(value.seconds * 1000);
    if (typeof value === "number") return new Date(value);
    if (value instanceof Date) return value;
    return null;
  };

  // Function to refresh data when needed
  const refreshData = () => {
    if (userData?.uid) {
      fetchSellerData(userData.uid);
    }
  };

  // Get assets by status for different tabs
  const getAssetsByStatus = (statusType) => {
    return assets.filter(asset => {
      const status = asset.status?.toLowerCase() || "pending";
      
      switch (statusType) {
        case "pending":
          return status === "pending";
        case "rejected":
          return status === "rejected";
        case "approved":
          return status === "approved";
        default:
          return false;
      }
    });
  };

  if (error && !isSeller) {
    return <UnauthorizedAccess error={error} />;
  }

  
  // ✅ UPDATED: Render active tab component with Profile
  const renderActiveTab = () => {
    const commonProps = {
     userData,
      assets,
      stats,
      refreshData,
      formatCurrency,
      formatDate,
      getAssetsByStatus,
       currentUser: userData,
    };

    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview {...commonProps} />;

      case "upload":
        return <UploadFiles {...commonProps} />;

      case "under-revision":
        return <UnderRevision {...commonProps} />;

      case "rejections":
        return <Rejections {...commonProps} />;

      case "published":
        return <PublishedFiles {...commonProps} />;

      case "stats":
        return <Statistics {...commonProps} />;

      case "search-trends":
        return <SearchTrends {...commonProps} />;

      case "visual-trends":
        return <VisualTrends {...commonProps} />;

      case "guidelines":
        return <Guidelines {...commonProps} />;

      case "contact":
        return <Support {...commonProps} />;

      case "report-track":
        return <ReportTrack {...commonProps} />;

      // ✅ ADDED: Profile tab
      case "profile":
        return <ProfileWrapper userId={userData?.uid} />;

      case "billing":
        return <BillingInvoices {...commonProps} />;

      case "feedback":
        return <Feedback {...commonProps} />;

      default:
        return <DashboardOverview {...commonProps} />;
    }
  };

  return (
    <div className="seller-dashboard">
      {/* Sidebar */}
      <div className="seller-sidebar">
        <div className="seller-sidebar-header">
          <div className="seller-brand">
            <FiShoppingBag className="brand-icon" />
            <span className="brand-text">Contributor Dashboard</span>
          </div>
        </div>

        <nav className="seller-sidebar-nav-c">
          {/* Main Menu */}
          <div className="nav-c-section">
            <div className="nav-c-section-title">MAIN</div>
            <ul className="nav-c-menu">
              <li
                className={`nav-c-item ${
                  activeTab === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <FiHome className="nav-c-icon" />
                <span className="nav-c-label">Dashboard</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "upload" ? "active" : ""
                }`}
                onClick={() => setActiveTab("upload")}
              >
                <FiUpload className="nav-c-icon" />
                <span className="nav-c-label">Upload</span>
              </li>
            </ul>
          </div>

          {/* Files Status */}
          <div className="nav-c-section">
            <div className="nav-c-section-title">FILES STATUS</div>
            <ul className="nav-c-menu">
              <li
                className={`nav-c-item ${
                  activeTab === "under-revision" ? "active" : ""
                }`}
                onClick={() => setActiveTab("under-revision")}
              >
                <FiClock className="nav-c-icon" />
                <span className="nav-c-label">Under revision</span>
                {stats.underRevision > 0 && (
                  <span className="nav-c-badge">{stats.underRevision}</span>
                )}
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "rejections" ? "active" : ""
                }`}
                onClick={() => setActiveTab("rejections")}
              >
                <FiXCircle className="nav-c-icon" />
                <span className="nav-c-label">Rejections</span>
                {stats.rejections > 0 && (
                  <span className="nav-c-badge">{stats.rejections}</span>
                )}
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "published" ? "active" : ""
                }`}
                onClick={() => setActiveTab("published")}
              >
                <FiCheckCircle className="nav-c-icon" />
                <span className="nav-c-label">Published</span>
                {stats.published > 0 && (
                  <span className="nav-c-badge">{stats.published}</span>
                )}
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="nav-c-section">
            <div className="nav-c-section-title">STATS</div>
            <ul className="nav-c-menu">
              <li
                className={`nav-c-item ${
                  activeTab === "stats" ? "active" : ""
                }`}
                onClick={() => setActiveTab("stats")}
              >
                <FiTrendingUp className="nav-c-icon" />
                <span className="nav-c-label">Stats</span>
              </li>
            </ul>
          </div>

          {/* Resources and Help */}
          <div className="nav-c-section">
            <div className="nav-c-section-title">RESOURCES AND HELP</div>
            <ul className="nav-c-menu">
              <li
                className={`nav-c-item ${
                  activeTab === "search-trends" ? "active" : ""
                }`}
                onClick={() => setActiveTab("search-trends")}
              >
                <FiSearch className="nav-c-icon" />
                <span className="nav-c-label">Search Trends</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "visual-trends" ? "active" : ""
                }`}
                onClick={() => setActiveTab("visual-trends")}
              >
                <FiPieChart className="nav-c-icon" />
                <span className="nav-c-label">Visual Trends</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "guidelines" ? "active" : ""
                }`}
                onClick={() => setActiveTab("guidelines")}
              >
                <FiList className="nav-c-icon" />
                <span className="nav-c-label">Guidelines</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "contact" ? "active" : ""
                }`}
                onClick={() => setActiveTab("contact")}
              >
                <FiMessageSquare className="nav-c-icon" />
                <span className="nav-c-label">Contact</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "report-track" ? "active" : ""
                }`}
                onClick={handleReportTrack}
              >
                <FiFileText className="nav-c-icon" />
                <span className="nav-c-label">Track Reports</span>
                {reports.length > 0 && (
                  <span className="nav-c-badge">{reports.length}</span>
                )}
              </li>
            </ul>
          </div>



          {/* Account */}
          <div className="nav-c-section">
            <div className="nav-c-section-title">ACCOUNT</div>
            <ul className="nav-c-menu">
              <li
                className={`nav-c-item ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={handleProfileTab}
              >
                <FiUser className="nav-c-icon" />
                <span className="nav-c-label">Profile</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "billing" ? "active" : ""
                }`}
                onClick={() => setActiveTab("billing")}
              >
                <FiDollarSign className="nav-c-icon" />
                <span className="nav-c-label">Billing and invoices</span>
              </li>
              <li
                className={`nav-c-item ${
                  activeTab === "feedback" ? "active" : ""
                }`}
                onClick={() => setActiveTab("feedback")}
              >
                <FiStar className="nav-c-icon" />
                <span className="nav-c-label">Feedback</span>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="seller-main-content">
        <div className="seller-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "files" && "My Files"}
              {activeTab === "upload" && "Upload Files"}
              {activeTab === "under-revision" && "Under Revision"}
              {activeTab === "rejections" && "Rejections"}
              {activeTab === "published" && "Published Files"}
              {activeTab === "stats" && "Statistics"}
              {activeTab === "search-trends" && "Search Trends"}
              {activeTab === "visual-trends" && "Visual Trends"}
              {activeTab === "guidelines" && "Guidelines"}
              {activeTab === "contact" && "Contact Support"}
              {activeTab === "report-track" && "Track Reports"}
              {activeTab === "profile" && "Profile"} {/* ✅ ADDED */}
              {activeTab === "billing" && "Billing & Invoices"}
              {activeTab === "feedback" && "Feedback"}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn">
              <FiBell className="btn-icon" />
            </button>
            <button className="header-btn">
              <FiSettings className="btn-icon" />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              <FiXCircle />
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="seller-content">
          {loading && <div className="loading-overlay">Loading...</div>}

          {/* Render the active tab component */}
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;