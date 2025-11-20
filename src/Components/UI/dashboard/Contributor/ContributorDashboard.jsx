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
  FiAlertCircle,
  FiShoppingBag,
  FiDollarSign,
  FiDownload,
  FiStar,
  FiClock,
  FiFilter,
  FiEye,
  FiTrash2,
  FiEdit,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import "../../../../assets/Styles/contribute-style.css";

const UnauthorizedAccess = ({ error }) => {
  return (
    <div className="unauthorized-access">
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [assets, setAssets] = useState([]);
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
          setIsSeller(true);
          setUserData(sellerData);
          await fetchSellerData(uid);
        } else {
          setError("You are not registered as a seller/contributor");
          navigate("/become-contributor");
        }
      } catch (error) {
        setError(`Failed to verify seller status: ${error.message}`);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch seller data
  const fetchSellerData = async (uid) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAssets(uid),
        fetchStats(uid),
      ]);
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
        where("contributorId", "==", uid),
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
        where("contributorId", "==", uid)
      );
      const assetsSnapshot = await getDocs(assetsQuery);
      
      let totalUploads = 0;
      let underRevision = 0;
      let rejections = 0;
      let published = 0;

      assetsSnapshot.forEach((doc) => {
        const asset = doc.data();
        totalUploads++;
        
        switch (asset.status?.toLowerCase()) {
          case 'under_review':
          case 'pending':
          case 'review':
            underRevision++;
            break;
          case 'rejected':
          case 'declined':
            rejections++;
            break;
          case 'approved':
          case 'published':
          case 'active':
            published++;
            break;
        }
      });

      // Fetch earnings data (you'll need to implement this based on your database structure)
      const earningsQuery = query(
        collection(db, "Earnings"),
        where("contributorId", "==", uid)
      );
      const earningsSnapshot = await getDocs(earningsQuery);
      
      let totalEarnings = 0;
      let pendingEarnings = 0;

      earningsSnapshot.forEach((doc) => {
        const earning = doc.data();
        if (earning.status === 'paid') {
          totalEarnings += earning.amount || 0;
        } else if (earning.status === 'pending') {
          pendingEarnings += earning.amount || 0;
        }
      });

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

  if (error && !isSeller) {
    return <UnauthorizedAccess error={error} />;
  }

  return (
    <div className="seller-dashboard">
      {/* Sidebar */}
      <div className="seller-sidebar">
        <div className="seller-sidebar-header">
          <div className="seller-brand">
            <FiShoppingBag className="brand-icon" />
            <span className="brand-text">FREEPIK Contributor</span>
          </div>
        </div>

        <nav className="seller-sidebar-nav">
          {/* Main Menu */}
          <div className="nav-section">
            <div className="nav-section-title">MAIN</div>
            <ul className="nav-menu">
              <li 
                className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <FiHome className="nav-icon" />
                <span className="nav-label">Dashboard</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "files" ? "active" : ""}`}
                onClick={() => setActiveTab("files")}
              >
                <FiFileText className="nav-icon" />
                <span className="nav-label">Files</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "upload" ? "active" : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                <FiUpload className="nav-icon" />
                <span className="nav-label">Upload</span>
              </li>
            </ul>
          </div>

          {/* Files Status */}
          <div className="nav-section">
            <div className="nav-section-title">FILES STATUS</div>
            <ul className="nav-menu">
              <li 
                className={`nav-item ${activeTab === "under-revision" ? "active" : ""}`}
                onClick={() => setActiveTab("under-revision")}
              >
                <FiClock className="nav-icon" />
                <span className="nav-label">Under revision</span>
                {stats.underRevision > 0 && (
                  <span className="nav-badge">{stats.underRevision}</span>
                )}
              </li>
              <li 
                className={`nav-item ${activeTab === "rejections" ? "active" : ""}`}
                onClick={() => setActiveTab("rejections")}
              >
                <FiXCircle className="nav-icon" />
                <span className="nav-label">Rejections</span>
                {stats.rejections > 0 && (
                  <span className="nav-badge">{stats.rejections}</span>
                )}
              </li>
              <li 
                className={`nav-item ${activeTab === "published" ? "active" : ""}`}
                onClick={() => setActiveTab("published")}
              >
                <FiCheckCircle className="nav-icon" />
                <span className="nav-label">Published</span>
                {stats.published > 0 && (
                  <span className="nav-badge">{stats.published}</span>
                )}
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="nav-section">
            <div className="nav-section-title">STATS</div>
            <ul className="nav-menu">
              <li 
                className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
                onClick={() => setActiveTab("stats")}
              >
                <FiTrendingUp className="nav-icon" />
                <span className="nav-label">Stats</span>
              </li>
            </ul>
          </div>

          {/* Resources and Help */}
          <div className="nav-section">
            <div className="nav-section-title">RESOURCES AND HELP</div>
            <ul className="nav-menu">
              <li 
                className={`nav-item ${activeTab === "search-trends" ? "active" : ""}`}
                onClick={() => setActiveTab("search-trends")}
              >
                <FiSearch className="nav-icon" />
                <span className="nav-label">Search Trends</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "visual-trends" ? "active" : ""}`}
                onClick={() => setActiveTab("visual-trends")}
              >
                <FiPieChart className="nav-icon" />
                <span className="nav-label">Visual Trends</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "guidelines" ? "active" : ""}`}
                onClick={() => setActiveTab("guidelines")}
              >
                <FiList className="nav-icon" />
                <span className="nav-label">Guidelines</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "contact" ? "active" : ""}`}
                onClick={() => setActiveTab("contact")}
              >
                <FiMessageSquare className="nav-icon" />
                <span className="nav-label">Contact</span>
              </li>
            </ul>
          </div>

          {/* Application */}
          <div className="nav-section">
            <div className="nav-section-title">APPLICATION</div>
            <ul className="nav-menu">
              <li 
                className={`nav-item ${activeTab === "app-store" ? "active" : ""}`}
                onClick={() => setActiveTab("app-store")}
              >
                <FiDownload className="nav-icon" />
                <span className="nav-label">App store</span>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="nav-section">
            <div className="nav-section-title">ACCOUNT</div>
            <ul className="nav-menu">
              <li 
                className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <FiUser className="nav-icon" />
                <span className="nav-label">Profile</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "billing" ? "active" : ""}`}
                onClick={() => setActiveTab("billing")}
              >
                <FiDollarSign className="nav-icon" />
                <span className="nav-label">Billing and invoices</span>
              </li>
              <li 
                className={`nav-item ${activeTab === "feedback" ? "active" : ""}`}
                onClick={() => setActiveTab("feedback")}
              >
                <FiStar className="nav-icon" />
                <span className="nav-label">Feedback</span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="seller-sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userData?.profilePic ? (
                <img src={userData.profilePic} alt={userData?.username} />
              ) : (
                <FiUser className="avatar-icon" />
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{userData?.username || "Seller"}</span>
              <span className="user-role">Contributor</span>
            </div>
          </div>
          <button 
            className="logout-btn"
            onClick={async () => {
              try {
                await signOut(auth);
                navigate("/");
              } catch (error) {
                console.error("Logout error:", error);
              }
            }}
          >
            <FiLogOut className="logout-icon" />
          </button>
        </div>
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
              {activeTab === "app-store" && "App Store"}
              {activeTab === "profile" && "Profile Settings"}
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

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="dashboard-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon total-uploads">
                    <FiUpload />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.totalUploads}</h3>
                    <p className="stat-label">Total Uploads</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon under-revision">
                    <FiClock />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.underRevision}</h3>
                    <p className="stat-label">Under Revision</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon rejections">
                    <FiXCircle />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.rejections}</h3>
                    <p className="stat-label">Rejections</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon published">
                    <FiCheckCircle />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.published}</h3>
                    <p className="stat-label">Published</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon earnings">
                    <FiDollarSign />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{formatCurrency(stats.totalEarnings)}</h3>
                    <p className="stat-label">Total Earnings</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon pending">
                    <FiClock />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{formatCurrency(stats.pendingEarnings)}</h3>
                    <p className="stat-label">Pending Earnings</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-list">
                  {assets.slice(0, 5).map((asset) => (
                    <div key={asset.id} className="activity-item">
                      <div className="activity-icon">
                        {asset.status === 'published' && <FiCheckCircle className="success" />}
                        {asset.status === 'rejected' && <FiXCircle className="error" />}
                        {asset.status === 'under_review' && <FiClock className="warning" />}
                      </div>
                      <div className="activity-details">
                        <p className="activity-title">{asset.title || "Untitled Asset"}</p>
                        <span className="activity-date">{formatDate(asset.createdAt)}</span>
                      </div>
                      <div className="activity-status">
                        <span className={`status-badge ${asset.status}`}>
                          {asset.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <p className="no-activity">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {activeTab !== "dashboard" && (
            <div className="tab-content">
              <h2>This is the {activeTab} tab</h2>
              <p>Content for {activeTab} will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;