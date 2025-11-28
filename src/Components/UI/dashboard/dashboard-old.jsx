import { auth, db, storage } from "../../../../firebase";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  collectionGroup,
  updateDoc,
  setDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

// Import components
import UserInformation from "./users/UserInformation";
import UserReport from "./users/UserReport";
import PaymentPlan from "./users/PaymentPlan";
import SellerAccountVerify from "./sellers/SellerAccountVerify";
import AssetRequestsDashboard from "./sellers/AssetsRequest";
import SellerEarning from "./sellers/SellerEarning";
import SellerReports from "./sellers/SellerReports";
import SellerAnalytics from "./sellers/SellerAnalytics";
import SellerComplaints from "./sellers/SellerComplaints";
import Downloads from "./advanced/Downloads";
import Earnings from "./advanced/Earnings";
import Analytics from "./advanced/Analytics";
import AssetManagement from "./advanced/AssetManagement";
import BlogSection from "./company/BlogSection";
import PortfolioList from "./company/PortfolioList";

// Import modals
import BlogEditorModal from "../../../Pages/BlogEditor";
import ProjectModal from "../../../Pages/PortfolioUpload";

// Import icons
import {
  FiUsers,
  FiFileText,
  FiChevronDown,
  FiX,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiBriefcase,
} from "react-icons/fi";

import "./style.css";

const UnauthorizedAccess = ({ error }) => {
  return (
    <div className="unauthorized-access">
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};

// ✅ ADDED: Notification Dropdown Component
const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
        {unreadCount > 0 && (
          <button className="mark-all-read" onClick={onMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty-state">
            <div className="notification-empty-title">No notifications</div>
            <div className="notification-empty-text">You're all caught up!</div>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'approved' && <FiCheckCircle className="icon-approved" />}
                {notification.type === 'rejected' && <FiX className="icon-rejected" />}
                {notification.type === 'revision' && <FiClock className="icon-revision" />}
                {notification.type === 'contributor_request' && <FiUser className="icon-contributor-request" />}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatNotificationTime(notification.timestamp)}
                </span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ✅ ADDED: Format notification time
const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [users, setUsers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedDashboard, setSelectedDashboard] = useState("admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ ADDED: Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // ✅ ADDED: Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ ADDED: Setup real-time notifications listener for admin
  const setupAdminNotificationsListener = () => {
    const notificationsQuery = query(
      collection(db, "AdminNotifications"),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((doc) => {
        notificationsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    });
  };

// ✅ ADDED: Setup real-time asset approval requests listener
const setupAssetApprovalRequestsListener = () => {
  const assetsQuery = query(
    collection(db, "Assets"),
    where("status", "==", "pending")
  );

  return onSnapshot(assetsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        // New asset approval request
        const assetData = change.doc.data();
        createAdminNotification(
          'asset_approval_request',
          `New asset "${assetData.title}" requires approval`,
          change.doc.id,
          assetData.ownerId
        );
      }
    });
  });
};

  // ✅ ADDED: Setup real-time contributor requests listener
  const setupContributorRequestsListener = () => {
    const contributorsQuery = query(
      collection(db, "Contributors"),
      where("status", "==", "pending")
    );

    return onSnapshot(contributorsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          // New contributor request
          const contributorData = change.doc.data();
          createAdminNotification(
            'contributor_request',
            `New contributor request from ${contributorData.fullName || contributorData.username}`,
            change.doc.id,
            contributorData.uid
          );
        }
      });
    });
  };

  // ✅ ADDED: Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "AdminNotifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ✅ ADDED: Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notification => !notification.read);
      const batch = unreadNotifications.map(notification => 
        updateDoc(doc(db, "AdminNotifications", notification.id), {
          read: true,
          readAt: serverTimestamp()
        })
      );

      await Promise.all(batch);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // ✅ ADDED: Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // ✅ ADDED: Create notification for admin
  const createAdminNotification = async (type, message, relatedId = null, userId = null) => {
    try {
      // Check if similar notification already exists
      const existingNotification = notifications.find(notif => 
        notif.type === type && 
        notif.relatedId === relatedId && 
        !notif.read
      );

      if (existingNotification) {
        return; // Don't create duplicate notifications
      }

      const notificationData = {
        type,
        message,
        relatedId,
        userId,
        read: false,
        timestamp: serverTimestamp(),
        adminId: auth.currentUser?.uid,
      };

      await addDoc(collection(db, "AdminNotifications"), notificationData);
    } catch (error) {
      console.error("Error creating admin notification:", error);
    }
  };

  // ✅ ADDED: Create notification for contributor
  const createAssetNotification = async (contributorId, assetId, assetName, type) => {
    const messages = {
      approved: `Your asset "${assetName}" has been approved and published!`,
      rejected: `Your asset "${assetName}" has been rejected. Please check the reasons.`,
      revision: `Your asset "${assetName}" requires revisions. Please check the comments.`
    };

    const notificationData = {
      type,
      message: messages[type],
      assetId,
      read: false,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, `Contributors/${contributorId}/Notifications`), notificationData);
      
      // ✅ ALSO CREATE ADMIN NOTIFICATION
      await createAdminNotification(
        type, 
        `Asset "${assetName}" ${type} by ${auth.currentUser?.email}`,
        assetId,
        contributorId
      );
    } catch (error) {
      console.error("Error creating asset notification:", error);
    }
  };

  // Authorization and data fetching logic
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setError("Please log in to access the admin dashboard");
        navigate("/Login");
        return;
      }

      try {
        const email = currentUser.email?.toLowerCase();
        const uid = currentUser.uid;

        if (!email || !uid) {
          setError("User information not available");
          return;
        }

        const isAdminUser = await checkAdminStatus(email, uid);

        if (isAdminUser) {
          setIsAdmin(true);

          // Seed additional authorized admins if primary admin
          const PRIMARY_ADMIN = "admin@shammarianas.com";
          if (email === PRIMARY_ADMIN) {
            try {
              await Promise.all(
                AUTHORIZED_ADMINS.filter((e) => e && e !== PRIMARY_ADMIN).map(
                  (e) =>
                    setDoc(
                      doc(db, "adminUsers", e),
                      { createdAt: serverTimestamp(), promotedBy: email },
                      { merge: true }
                    )
                )
              );
            } catch (err) {
              console.warn("Failed to seed authorized admins:", err);
            }
          }

          // Fetch necessary data for admin dashboard
          await Promise.all([
            fetchUsers(), 
            fetchSupportMessages(null),
           setupAdminNotificationsListener(), // ✅ ADDED: Setup notifications
  setupContributorRequestsListener(), // ✅ ADDED: Setup contributor requests listener
  setupAssetApprovalRequestsListener() // ✅ ADDED: Setup asset approval requests listener
          ]);
          setSelectedProfileId(uid);
        } else {
          setError("You do not have admin privileges");
          navigate("/");
        }
      } catch (error) {
        setError(`Failed to verify admin privileges: ${error.message}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check admin status
  const checkAdminStatus = async (email, uid) => {
    if (!email || !uid) return false;

    const PRIMARY_ADMIN = "admin@shammarianas.com";

    // ✅ Primary admin always authorized
    if (email === PRIMARY_ADMIN) {
      try {
        await setDoc(
          doc(db, "adminUsers", email),
          { createdAt: serverTimestamp(), promotedBy: "system" },
          { merge: true }
        );
      } catch {}
      return true;
    }

    try {
      // ✅ Step 1: Check adminUsers collection
      const adminDoc = await getDoc(doc(db, "adminUsers", email));
      if (adminDoc.exists()) return true;

      // ✅ Step 2: Check Profiles collection for role
      const profileDoc = await getDoc(doc(db, "Profiles", uid));
      if (profileDoc.exists()) {
        const role = profileDoc.data()?.role?.toLowerCase();
        console.log("User Role:", role); // Debug line
        if (role === "admin" || role === "Moderator") return true;
      }

      return false;
    } catch (error) {
      setError(`Failed to check admin status: ${error.message}`);
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Profiles"));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      setError(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportMessages = async (profileId) => {
    setLoading(true);
    try {
      if (!db) throw new Error("Firebase not initialized");

      if (isAdmin && !profileId) {
        const q = query(
          collectionGroup(db, "Support"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const messages = snap.docs.map((d) => ({
          id: d.id,
          profileId: d.ref.parent.parent?.id || "",
          ...d.data(),
        }));
        setSupportMessages(messages);
      } else {
        const uid = profileId || auth.currentUser?.uid;
        if (!uid) {
          setSupportMessages([]);
          return;
        }
        const q = query(
          collection(db, `Profiles/${uid}/Support`),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const messages = snap.docs.map((d) => ({
          id: d.id,
          profileId: uid,
          ...d.data(),
        }));
        setSupportMessages(messages);
      }
    } catch (error) {
      setError(`Failed to load support messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = () => {
    setLoading(true);
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(blogsRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const blogsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBlogs(blogsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading blogs:", error);
          setError(`Failed to load blogs: ${error.message}`);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up blog listener:", error);
      setError(`Failed to load blogs: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeTab === 4 ||
      (selectedDashboard === "company" && activeTab === 1)
    ) {
      loadBlogs();
    }
  }, [activeTab, selectedDashboard]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() });
      });
      setPortfolios(projectsData);
    } catch (error) {
      setError(`Failed to load portfolios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeTab === 5 ||
      (selectedDashboard === "company" && activeTab === 2)
    ) {
      loadProjects();
    }
  }, [activeTab, selectedDashboard]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "Assets"));
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetsData);
    } catch (error) {
      setError(`Failed to load assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 3 || activeTab === 6) {
      fetchAssets();
    }
  }, [activeTab, fetchAssets]);

  const handleDashboardChange = (dashboard) => {
    setSelectedDashboard(dashboard);
    setIsDropdownOpen(false);

    if (dashboard === "admin") {
      setActiveTab(1);
    } else {
      setActiveTab(1);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

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

  const handleRoleChange = async (userId, newRole, userEmail) => {
    if (!isAdmin) {
      setError("Only admins can change user roles");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      try {
        const lowerCaseEmail = (userEmail || "").toLowerCase();
        const setUserRoleFn = httpsCallable(functions, "setUserRole");
        await setUserRoleFn({
          targetEmail: lowerCaseEmail,
          userId,
          role: newRole,
        });
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      } catch (error) {
        setError(`Failed to update role: ${error.message}`);
      }
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    if (!isAdmin) {
      setError("Only admins can change user status");
      return;
    }
    try {
      const setUserStatusFn = httpsCallable(functions, "setUserStatus");
      await setUserStatusFn({ userId, status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (error) {
      setError(`Failed to update status: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!isAdmin) {
      setError("Only admins can delete users");
      return;
    }
    try {
      const deleteUserFn = httpsCallable(functions, "deleteUser");
      await deleteUserFn({ userId, email: (email || "").toLowerCase() });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      setError(`Failed to delete user: ${error.message}`);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    try {
      await deleteDoc(doc(db, "blogs", blogId));
      loadBlogs();
    } catch (error) {
      console.error("Delete blog error:", error);
      setError("Failed to delete blog post");
    }
  };

  const handleToggleBlogStatus = async (blogId, currentStatus) => {
    const normalizedStatus = (currentStatus || "draft").toLowerCase();
    const newStatus = normalizedStatus === "published" ? "DRAFT" : "PUBLISHED";

    try {
      await updateDoc(doc(db, "blogs", blogId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === "PUBLISHED" && { publishedAt: serverTimestamp() }),
      });
      loadBlogs();
      alert(
        `Blog ${
          newStatus === "PUBLISHED" ? "published" : "drafted"
        } successfully!`
      );
    } catch (error) {
      console.error("Update blog status error:", error);
      setError("Failed to update blog post status");
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (!isAdmin) {
      setError("Only admins can delete portfolio items");
      return;
    }
    if (
      window.confirm("Are you sure you want to delete this portfolio item?")
    ) {
      try {
        await deleteDoc(doc(db, "projects", portfolioId));
        setPortfolios(
          portfolios.filter((portfolio) => portfolio.id !== portfolioId)
        );
      } catch (error) {
        setError(`Failed to delete portfolio item: ${error.message}`);
      }
    }
  };

  const handleUpdatePortfolioStatus = async (portfolioId, newStatus) => {
    if (!isAdmin) {
      setError("Only admins can change portfolio status");
      return;
    }
    try {
      await updateDoc(doc(db, "projects", portfolioId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId ? { ...p, status: newStatus } : p
        )
      );
    } catch (error) {
      setError(`Failed to update portfolio status: ${error.message}`);
    }
  };

  const handleTogglePortfolioFeatured = async (portfolioId) => {
    if (!isAdmin) {
      setError("Only admins can feature portfolio items");
      return;
    }
    const target = portfolios.find((p) => p.id === portfolioId);
    const current = !!target?.featured;
    try {
      await updateDoc(doc(db, "projects", portfolioId), {
        featured: !current,
        updatedAt: serverTimestamp(),
      });
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId ? { ...p, featured: !current } : p
        )
      );
    } catch (error) {
      setError(`Failed to update portfolio: ${error.message}`);
    }
  };

  if (error && !isAdmin) {
    return <UnauthorizedAccess error={error} />;
  }

  return (
    <div className="admin-dashboard" style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        className="sidebar"
        style={{ position: "fixed", width: "260px", overflowY: "auto" }}
      >
        <div className="custom-dropdown" ref={dropdownRef}>
          <button
            className="dashboard-dropdown"
            onClick={toggleDropdown}
            title="Select Dashboard"
          >
            {selectedDashboard === "admin"
              ? "Admin Dashboard"
              : "Company Dashboard"}
            <FiChevronDown className="dropdown-icon" />
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu">
              <li
                className={selectedDashboard === "admin" ? "selected" : ""}
                onClick={() => handleDashboardChange("admin")}
              >
                Admin Dashboard
              </li>
              <li
                className={selectedDashboard === "company" ? "selected" : ""}
                onClick={() => handleDashboardChange("company")}
              >
                Company Dashboard
              </li>
            </ul>
          )}
        </div>

        <div className="d-flex flex-column">
          <div>
            {selectedDashboard === "admin" ? (
              <ul className="sidebar-menu">
                {/* Users Section */}
                <li className="menu-item dropdown-parent active">
                  <div className="dropdown-header active">
                    <FiUsers className="menu-icon" />
                    <span className="nav-label">Users</span>
                  </div>
                  <ul className="submenu">
                    <li
                      className={`submenu-item ${
                        activeTab === 1 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(1)}
                    >
                      User Information
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 2 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(2)}
                    >
                      User Report
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 3 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(3)}
                    >
                      Payment & Plan
                    </li>
                  </ul>
                </li>

                {/* Sellers Section */}
                <li className="menu-item dropdown-parent active">
                  <div className="dropdown-header active">
                    <FiUser className="menu-icon" />
                    <span className="nav-label">Sellers</span>
                  </div>
                  <ul className="submenu">
                    <li
                      className={`submenu-item ${
                        activeTab === 4 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(4)}
                    >
                      Seller Account Verify
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 5 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(5)}
                    >
                      Asset Request
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 6 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(6)}
                    >
                      Seller Earning
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 7 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(7)}
                    >
                      Seller Report
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 8 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(8)}
                    >
                      Seller Analytic
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 9 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(9)}
                    >
                      Seller Complains
                    </li>
                  </ul>
                </li>

                {/* Advanced Section */}
                <li className="menu-item dropdown-parent active">
                  <div className="dropdown-header active">
                    <FiSettings className="menu-icon" />
                    <span className="nav-label">Advanced</span>
                  </div>
                  <ul className="submenu">
                    <li
                      className={`submenu-item ${
                        activeTab === 10 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(10)}
                    >
                      Download
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 11 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(11)}
                    >
                      Earning
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 12 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(12)}
                    >
                      Analytic
                    </li>
                    <li
                      className={`submenu-item ${
                        activeTab === 13 ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(13)}
                    >
                      Asset
                    </li>
                  </ul>
                </li>
              </ul>
            ) : (
              <ul className="sidebar-menu">
                <li
                  className={`menu-item dropdown-header comp-menu ${
                    activeTab === 1 ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(1)}
                >
                  <FiFileText className="menu-icon" />
                  <span className="nav-label">Blogs</span>
                </li>
                <li
                  className={`menu-item dropdown-header comp-menu ${
                    activeTab === 2 ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(2)}
                >
                  <FiBriefcase className="menu-icon" />
                  <span className="nav-label">Portfolio</span>
                </li>
              </ul>
            )}
          </div>

          <div className="footer-sidebar">
            <div className="sidebar-footer">
              <button className="menu-item compact" title="Settings">
                <FiSettings className="menu-icon" />
                <span className="nav-label">Settings</span>
              </button>
              <button
                className="menu-item compact"
                title="Logout"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    navigate("/");
                  } catch {}
                }}
              >
                <FiLogOut className="menu-icon" />
                <span className="nav-label">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{ marginLeft: "250px", overflowY: "auto" }}
      >
        <div className="header">
          <h1 className="page-title">
            {activeTab === 1 && selectedDashboard === "admin" && ""}
            {activeTab === 2 && ""}
            {activeTab === 3 && ""}
            {activeTab === 4 && ""}
            {activeTab === 5 && ""}
            {activeTab === 6 && ""}
            {activeTab === 7 && ""}
            {activeTab === 8 && ""}
            {activeTab === 9 && ""}
            {activeTab === 10 && ""}
            {activeTab === 11 && ""}
            {activeTab === 12 && ""}
            {activeTab === 13 && ""}
            {activeTab === 1 &&
              selectedDashboard === "company" &&
              "Blog Management"}
            {activeTab === 2 &&
              selectedDashboard === "company" &&
              "Portfolio Management"}
          </h1>
          
          {/* ✅ ADDED: Notification Button in Header */}
          <div className="header-right">
            <div className="notification-container" ref={notificationRef}>
              <button 
                className={`header-btn notification-btn ${unreadCount > 0 ? 'has-new' : ''}`} 
                onClick={toggleNotifications}
              >
                <FiBell className="btn-icon" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onMarkAsRead={markNotificationAsRead}
                  onMarkAllAsRead={markAllNotificationsAsRead}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              <FiX />
            </button>
          </div>
        )}

        {/* Admin Dashboard Content */}
        {selectedDashboard === "admin" && (
          <>
            {activeTab === 1 && (
              <UserInformation
                users={users}
                setUsers={setUsers}
                onRoleChange={handleRoleChange}
                onUpdateStatus={handleUpdateUserStatus}
                onDelete={handleDeleteUser}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}

            {activeTab === 2 && <UserReport />}

            {activeTab === 3 && (
              <PaymentPlan
                users={users}
                formatCurrency={(amount) => `$${amount?.toFixed(2) || "0.00"}`}
                formatDate={(date) => {
                  if (!date) return "N/A";
                  const normalizedDate = normalizeDate(date);
                  return normalizedDate
                    ? normalizedDate.toLocaleDateString()
                    : "N/A";
                }}
              />
            )}

            {activeTab === 4 && <SellerAccountVerify />}

            {activeTab === 5 && (
              <AssetRequestsDashboard 
                createAssetNotification={createAssetNotification}
              />
            )}

            {activeTab === 6 && <SellerEarning />}

            {activeTab === 7 && <SellerReports />}

            {activeTab === 8 && <SellerAnalytics />}

            {activeTab === 9 && <SellerComplaints />}

            {activeTab === 10 && <Downloads />}

            {activeTab === 11 && <Earnings />}

            {activeTab === 12 && <Analytics />}

            {activeTab === 13 && (
              <AssetManagement 
                createAssetNotification={createAssetNotification}
              />
            )}
          </>
        )}

        {/* Company Dashboard Content */}
        {selectedDashboard === "company" && (
          <>
            {activeTab === 1 && (
              <BlogSection
                blogs={blogs}
                onDelete={handleDeleteBlog}
                onToggleStatus={handleToggleBlogStatus}
                onCreate={() => setIsBlogModalOpen(true)}
                formatDate={formatDate}
              />
            )}

            {activeTab === 2 && (
              <PortfolioList
                portfolios={portfolios}
                onDelete={handleDeletePortfolio}
                onCreate={loadProjects}
                onToggleFeatured={handleTogglePortfolioFeatured}
                onUpdateStatus={handleUpdatePortfolioStatus}
                formatDate={formatDate}
              />
            )}
          </>
        )}

        {loading && <div className="loading-overlay">Loading...</div>}

        {/* Modals */}
        {isBlogModalOpen && (
          <BlogEditorModal
            isOpen={isBlogModalOpen}
            onClose={() => {
              setIsBlogModalOpen(false);
              loadBlogs();
            }}
          />
        )}

        {isPortfolioModalOpen && (
          <ProjectModal
            isOpen={isPortfolioModalOpen}
            onClose={() => {
              setIsPortfolioModalOpen(false);
              loadProjects();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;