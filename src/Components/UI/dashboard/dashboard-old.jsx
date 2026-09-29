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
import Cursor from "../../../common/cusor";

// Import modals
import BlogEditorModal from "../../../Pages/BlogEditor";
import ProjectModal from "../../../Pages/PortfolioUpload";

// Import icons - اضافی آئیکن شامل کیا
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
  FiMessageCircle,
  FiMenu, // ہیمبرگر مینو آئیکن
  FiChevronLeft, // بند کرنے کا آئیکن
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

// Updated: Notification Dropdown Component
const NotificationDropdown = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

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
              className={`notification-item ${
                notification.read ? "read" : "unread"
              } ${notification.type}`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === "approved" && (
                  <FiCheckCircle className="icon-approved" />
                )}
                {notification.type === "rejected" && (
                  <FiX className="icon-rejected" />
                )}
                {notification.type === "revision" && (
                  <FiClock className="icon-revision" />
                )}
                {notification.type === "contributor_request" && (
                  <FiUser className="icon-contributor-request" />
                )}
                {notification.type === "support_complaint" && (
                  <FiMessageCircle className="icon-support-complaint" />
                )}
                {notification.type === "asset_approval_request" && (
                  <FiBriefcase className="icon-asset-request" />
                )}
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

// Format notification time
const formatNotificationTime = (timestamp) => {
  if (!timestamp) return "Just now";

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch (error) {
    return "Just now";
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // نیا state sidebar کے لیے
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // State variables for request counts
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingAssets, setPendingAssets] = useState(0);
  const [pendingSellers, setPendingSellers] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  // Use ref for current notifications to avoid stale state
  const notificationsRef = useRef([]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768) {
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(event.target) &&
          sidebarOpen
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Setup real-time count listeners
  useEffect(() => {
    if (!isAdmin) return;

    const setupCountListeners = async () => {
      try {
        console.log("Setting up count listeners...");

        // 1. User Reports/Support Messages Count (pending or in_progress)
        const supportQuery = query(
          collectionGroup(db, "Support"),
          where("status", "in", ["pending", "in_progress"])
        );

        const unsubscribeSupport = onSnapshot(supportQuery, (snapshot) => {
          console.log("Support requests count:", snapshot.size);
          setPendingRequests(snapshot.size);
        });

        // 2. Asset Requests Count (pending status in Assets collection)
        const assetsQuery = query(
          collection(db, "Assets"),
          where("status", "==", "pending")
        );

        const unsubscribeAssets = onSnapshot(assetsQuery, (snapshot) => {
          console.log("Asset requests count:", snapshot.size);
          setPendingAssets(snapshot.size);
        });

        // 3. Seller Verification Requests Count (pending status in Contributors)
        const sellersQuery = query(
          collection(db, "Contributors"),
          where("status", "==", "pending")
        );

        const unsubscribeSellers = onSnapshot(sellersQuery, (snapshot) => {
          console.log("Seller verification count:", snapshot.size);
          setPendingSellers(snapshot.size);
        });

        // 4. Seller Complaints Count (specifically from sellers/support)
        const complaintsQuery = query(
          collectionGroup(db, "Support"),
          where("type", "==", "complaint"),
          where("status", "in", ["pending", "in_progress"])
        );

        const unsubscribeComplaints = onSnapshot(
          complaintsQuery,
          (snapshot) => {
            console.log("Seller complaints count:", snapshot.size);
            setPendingComplaints(snapshot.size);
          }
        );

        return () => {
          unsubscribeSupport();
          unsubscribeAssets();
          unsubscribeSellers();
          unsubscribeComplaints();
        };
      } catch (error) {
        console.error("Error setting up count listeners:", error);
        setError("Failed to load request counts");
      }
    };

    setupCountListeners();
  }, [isAdmin]);

  // Setup real-time notifications listener
  const setupAdminNotificationsListener = useCallback(() => {
    console.log("Setting up admin notifications listener...");

    const notificationsQuery = query(
      collection(db, "AdminNotifications"),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(
      notificationsQuery,
      (snapshot) => {
        console.log(
          "Notifications snapshot received:",
          snapshot.size,
          "notifications"
        );

        const notificationsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notificationsData.push({
            id: doc.id,
            ...data,
          });
          console.log("Notification:", {
            id: doc.id,
            type: data.type,
            read: data.read,
          });
        });

        setNotifications(notificationsData);

        // Calculate unread count
        const unread = notificationsData.filter(
          (notification) => !notification.read
        ).length;
        setUnreadCount(unread);
        console.log("Unread count:", unread);
      },
      (error) => {
        console.error("Error in notifications listener:", error);
        setError("Failed to load notifications");
      }
    );
  }, []);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    console.log("Marking notification as read:", notificationId);

    try {
      // Immediate UI update
      const updatedNotifications = notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);

      // Update in Firestore
      const notificationRef = doc(db, "AdminNotifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });

      console.log("Notification marked as read successfully");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read");

      // Revert UI on error
      const revertedNotifications = notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: false } : notif
      );
      setNotifications(revertedNotifications);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    console.log("Marking all notifications as read");

    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );
    if (unreadNotifications.length === 0) return;

    try {
      // Immediate UI update
      const updatedNotifications = notifications.map((notif) =>
        !notif.read ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);

      // Update all in Firestore
      const updatePromises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, "AdminNotifications", notification.id), {
          read: true,
          readAt: serverTimestamp(),
        })
      );

      await Promise.all(updatePromises);
      console.log("All notifications marked as read successfully");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to mark all notifications as read");
    }
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle tab click on mobile - close sidebar
  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Create notification for admin
  const createAdminNotification = async (
    type,
    message,
    relatedId = null,
    userId = null
  ) => {
    try {
      const currentNotifications = notificationsRef.current;

      // Enhanced duplicate check
      const isDuplicate = currentNotifications.some(
        (notif) =>
          notif.type === type &&
          notif.relatedId === relatedId &&
          notif.message === message &&
          !notif.read
      );

      if (isDuplicate) {
        console.log("Duplicate notification prevented:", { type, message });
        return;
      }

      const notificationData = {
        type,
        message,
        relatedId,
        userId,
        read: false,
        timestamp: serverTimestamp(),
        adminId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(db, "AdminNotifications"),
        notificationData
      );
      console.log("New admin notification created:", {
        id: docRef.id,
        type,
        message,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating admin notification:", error);
      throw error;
    }
  };

  // Authorization and data fetching logic
  useEffect(() => {
    console.log("AdminDashboard mounted - Setting up auth listener");

    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
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

        console.log("Checking admin status for:", email);
        const isAdminUser = await checkAdminStatus(email, uid);

        if (isAdminUser) {
          console.log("User is admin, setting up dashboard");
          setIsAdmin(true);

          // Setup notifications listener
          const unsubscribeNotifications = setupAdminNotificationsListener();

          // Fetch initial data
          await Promise.all([fetchUsers(), fetchSupportMessages(null)]);

          setSelectedProfileId(uid);

          // Cleanup function
          return () => {
            console.log("Cleaning up admin dashboard listeners");
            unsubscribeNotifications();
          };
        } else {
          setError("You do not have admin privileges");
          navigate("/");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setError(`Failed to verify admin privileges: ${error.message}`);
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribeAuth();
    };
  }, [navigate, setupAdminNotificationsListener]);

  // Check admin status function
  const checkAdminStatus = async (email, uid) => {
    if (!email || !uid) return false;

    const PRIMARY_ADMIN = "admin@shammarianas.com";

    // Primary admin always authorized
    if (email === PRIMARY_ADMIN) {
      try {
        await setDoc(
          doc(db, "adminUsers", email),
          { createdAt: serverTimestamp(), promotedBy: "system" },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to ensure primary admin record:", error);
      }
      return true;
    }

    try {
      // Check adminUsers collection
      const adminDoc = await getDoc(doc(db, "adminUsers", email));
      if (adminDoc.exists()) return true;

      // Check Profiles collection for role
      const profileDoc = await getDoc(doc(db, "Profiles", uid));
      if (profileDoc.exists()) {
        const role = profileDoc.data()?.role?.toLowerCase();
        console.log("User Role:", role);
        if (role === "admin" || role === "moderator") return true;
      }

      return false;
    } catch (error) {
      setError(`Failed to check admin status: ${error.message}`);
      return false;
    }
  };

  // Rest of your existing functions (fetchUsers, fetchSupportMessages, etc.)
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

    // Handle Firestore Timestamp
    if (value.toDate) {
      try {
        return value.toDate();
      } catch {
        return null;
      }
    }

    // Handle Firestore timestamp object with seconds
    if (value.seconds) return new Date(value.seconds * 1000);

    // Handle number (timestamp)
    if (typeof value === "number") return new Date(value);

    // Handle Date object
    if (value instanceof Date) return value;

    // Handle string (NEW - this is what you need!)
    if (typeof value === "string") {
      try {
        // Handle "YYYY-MM-DD" format specifically
        if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Parse as UTC to avoid timezone issues
          return new Date(value + "T00:00:00Z");
        }
        // Handle any other date string
        return new Date(value);
      } catch {
        return null;
      }
    }

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
        // Your role change logic here
        // ...
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
      await updateDoc(doc(db, "Profiles", userId), { status: newStatus });
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
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
      await deleteDoc(doc(db, "Profiles", userId));
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
    <>
      <Cursor />

      {/* Inline Styles for Dashboard */}
      <style>
        {`
          /* Desktop Styles */
          @media (min-width: 769px) {
            .admin-sidebar {
              position: fixed !important;
              left: 0 !important;
              width: 270px !important;
              height: 100vh !important;
              color: white !important;
              padding: 1.5rem 0 !important;
              z-index: 1000 !important;
              overflow-y: auto !important;
              overflow-x: hidden;
              transform: translateX(0) !important;
              transition: transform 0.3s ease-in-out !important;
            }
            
            .admin-main-content {
              margin-left: 260px !important;
              padding: 2rem !important;
              min-height: 100vh !important;
              background-color: #121212 !important;
              transition: margin-left 0.3s ease-in-out !important;
            }
            
            .mobile-header {
              display: none !important;
            }
          }
          
          /* Mobile Styles */
          @media (max-width: 768px) {
            .admin-sidebar {
              position: fixed !important;
              top: 60px !important;
              left: 0 !important;
              width: 260px !important;
              height: calc(100vh - 60px) !important;
              background-color: #0f0f0f !important;
              color: white !important;
              padding: 1.5rem 0 !important;
              z-index: 1000 !important;
              overflow-y: auto !important;
              transform: translateX(-100%) !important;
              transition: transform 0.3s ease-in-out !important;
              box-shadow: 2px 0 10px rgba(0,0,0,0.3) !important;
            }
            
            .admin-sidebar.open {
              transform: translateX(0) !important;
            }
            
            .admin-sidebar.closed {
              transform: translateX(-100%) !important;
            }
            
            .admin-main-content {
              margin-left: 0 !important;
              padding: 5rem 1rem 1rem 1rem !important;
              min-height: 100vh !important;
              background-color: #121212 !important;
            }
            
            .mobile-header {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              padding: 1rem !important;
              background-color: #121212 !important;
              color: white !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 1100 !important;
              height: 60px !important;
              border-bottom: 1px solid #333 !important;
            }
            
            .hamburger-menu {
              background: none !important;
              border: none !important;
              color: white !important;
              font-size: 1.5rem !important;
              cursor: pointer !important;
              padding: 0.5rem !important;
            }
            
            .sidebar-overlay {
              display: block !important;
              position: fixed !important;
              top: 60px !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              background: rgba(0, 0, 0, 0.7) !important;
              z-index: 999 !important;
            }
          }
          
          /* Common Styles */
          .admin-dashboard-container {
            position: relative;
            min-height: 100vh;
            background-color: #121212;
            color: white;
          }
          
        
          
          .header-btn {
            position: relative;
            background: none;
            border: none;
            padding: 8px;
            border-radius: 6px;
            cursor: pointer;
            color: #b0b0b0;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .header-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
          }
            ul{
            padding:0 1rem !important;
            }
        `}
      </style>

      <div className="admin-dashboard-container">
        {/* ===== MOBILE HEADER ===== */}
        {window.innerWidth <= 768 && (
          <div className="mobile-header">
            <button className="hamburger-menu" onClick={toggleSidebar}>
              {sidebarOpen ? (
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="close-icon"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <FiMenu className="hamburger-icon" />
              )}
            </button>

            <div
              style={{ color: "white", fontSize: "1rem", fontWeight: "600" }}
            >
              {selectedDashboard === "admin"
                ? "Admin Dashboard"
                : "Company Dashboard"}
            </div>

            <button className="header-btn" onClick={toggleNotifications}>
              <FiBell style={{ fontSize: "1.2rem" }} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ===== SIDEBAR ===== */}
        <div
          className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}
          ref={sidebarRef}
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
              <FiChevronDown style={{ fontSize: "1rem" }} />
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu p-3">
                <li
                  style={{
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    color: selectedDashboard === "admin" ? "#52b0b4" : "white",
                    borderBottom: "1px solid #333",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1a1a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                  onClick={() => handleDashboardChange("admin")}
                >
                  Admin Dashboard
                </li>
                <li
                  style={{
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    color:
                      selectedDashboard === "company" ? "#52b0b4" : "white",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1a1a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
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
                <ul
                  style={{
                    listStyle: "none",
                    margin: "1rem 0 0rem 0",
                    padding: "0.5rem",
                    display: "grid",
                    borderTop: "1px solid #333",
                  }}
                >
                  {/* Users Section */}
                  <li
                    style={{
                      borderRadius: "8px",
                      margin: "0 0.5rem",
                      color: "#b0b0b0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "0.75rem 0",
                        color: "#52b0b4",
                      }}
                    >
                      <FiUsers
                        style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}
                      />
                      <span style={{ whiteSpace: "nowrap" }}>Users</span>
                    </div>
                    <ul
                      style={{
                        width: "100%",
                        listStyle: "none",
                        margin: "0",
                        borderRadius: "0.5rem",
                        display: "grid",
                        padding: "0rem 1rem",
                      }}
                    >
                      <li
                        style={{
                          fontSize: "12px",
                          padding: "0rem 0.6rem 0.2rem 0.6rem",
                          cursor: "pointer",
                          color: activeTab === 1 ? "white" : "#b0b0b0",
                          transition: "all 0.2s",
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          textAlign: "left",
                          borderRadius: "0.5rem",
                        }}
                        onClick={() => handleTabClick(1)}
                      >
                        User Information
                      </li>
                      <li
                        style={{
                          fontSize: "12px",
                          padding: "0rem 0.6rem 0.2rem 0.6rem",
                          cursor: "pointer",
                          color: activeTab === 2 ? "white" : "#b0b0b0",
                          transition: "all 0.2s",
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          textAlign: "left",
                          borderRadius: "0.5rem",
                        }}
                        onClick={() => handleTabClick(2)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>User Report</span>
                          {pendingRequests > 0 && (
                            <span
                              style={{
                                background: "rgb(82, 176, 180, 0.2)",
                                color: "#52b0b4",
                                border: "1px solid rgba(82, 176, 180, 0.3)",
                                padding: "0.07rem 0.3rem",
                                borderRadius: "999px",
                                fontSize: "0.65rem",
                                fontWeight: "600",
                              }}
                            >
                              {pendingRequests}
                            </span>
                          )}
                        </div>
                      </li>
                      <li
                        style={{
                          fontSize: "12px",
                          padding: "0rem 0.6rem 0.2rem 0.6rem",
                          cursor: "pointer",
                          color: activeTab === 3 ? "white" : "#b0b0b0",
                          transition: "all 0.2s",
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          textAlign: "left",
                          borderRadius: "0.5rem",
                        }}
                        onClick={() => handleTabClick(3)}
                      >
                        Payment & Plan
                      </li>
                    </ul>
                  </li>

                  {/* Sellers Section */}
                  <li
                    style={{
                      borderRadius: "8px",
                      margin: "0 0.5rem",
                      color: "#b0b0b0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "0.75rem 0",
                        color: "#52b0b4",
                      }}
                    >
                      <FiUser
                        style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}
                      />
                      <span style={{ whiteSpace: "nowrap" }}>Sellers</span>
                    </div>
                    <ul
                      style={{
                        width: "100%",
                        listStyle: "none",
                        margin: "0",
                        borderRadius: "0.5rem",
                        display: "grid",
                        padding: "0rem 1rem",
                      }}
                    >
                      <li
                        style={{
                          fontSize: "12px",
                          padding: "0rem 0.6rem 0.2rem 0.6rem",
                          cursor: "pointer",
                          color: activeTab === 4 ? "white" : "#b0b0b0",
                          transition: "all 0.2s",
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          textAlign: "left",
                          borderRadius: "0.5rem",
                        }}
                        onClick={() => handleTabClick(4)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>Seller Account Verify</span>
                          {pendingSellers > 0 && (
                            <span
                              style={{
                                background: "rgb(82, 176, 180, 0.2)",
                                color: "#52b0b4",
                                border: "1px solid rgba(82, 176, 180, 0.3)",
                                padding: "0.07rem 0.3rem",
                                borderRadius: "999px",
                                fontSize: "0.65rem",
                                fontWeight: "600",
                              }}
                            >
                              {pendingSellers}
                            </span>
                          )}
                        </div>
                      </li>
                      <li
                        style={{
                          fontSize: "12px",
                          padding: "0rem 0.6rem 0.2rem 0.6rem",
                          cursor: "pointer",
                          color: activeTab === 5 ? "white" : "#b0b0b0",
                          transition: "all 0.2s",
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          textAlign: "left",
                          borderRadius: "0.5rem",
                        }}
                        onClick={() => handleTabClick(5)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>Asset Request</span>
                          {pendingAssets > 0 && (
                            <span
                              style={{
                                background: "rgb(82, 176, 180, 0.2)",
                                color: "#52b0b4",
                                border: "1px solid rgba(82, 176, 180, 0.3)",
                                padding: "0.07rem 0.3rem",
                                borderRadius: "999px",
                                fontSize: "0.65rem",
                                fontWeight: "600",
                              }}
                            >
                              {pendingAssets}
                            </span>
                          )}
                        </div>
                      </li>
                      {[6, 7, 8, 9].map((tabNum) => (
                        <li
                          key={tabNum}
                          style={{
                            fontSize: "12px",
                            padding: "0rem 0.6rem 0.2rem 0.6rem",
                            cursor: "pointer",
                            color: activeTab === tabNum ? "white" : "#b0b0b0",
                            transition: "all 0.2s",
                            border: "none",
                            background: "transparent",
                            width: "100%",
                            textAlign: "left",
                            borderRadius: "0.5rem",
                          }}
                          onClick={() => handleTabClick(tabNum)}
                        >
                          {tabNum === 6 && "Seller Earning"}
                          {tabNum === 7 && "Seller Report"}
                          {tabNum === 8 && "Seller Analytic"}
                          {tabNum === 9 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <span>Seller Complaints</span>
                              {pendingComplaints > 0 && (
                                <span
                                  style={{
                                    background: "rgb(82, 176, 180, 0.2)",
                                    color: "#52b0b4",
                                    border: "1px solid rgba(82, 176, 180, 0.3)",
                                    padding: "0.07rem 0.3rem",
                                    borderRadius: "999px",
                                    fontSize: "0.65rem",
                                    fontWeight: "600",
                                  }}
                                >
                                  {pendingComplaints}
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* Advanced Section */}
                  <li
                    style={{
                      borderRadius: "8px",
                      margin: "0 0.5rem",
                      color: "#b0b0b0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "0.75rem 0",
                        color: "#52b0b4",
                      }}
                    >
                      <FiSettings
                        style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}
                      />
                      <span style={{ whiteSpace: "nowrap" }}>Advanced</span>
                    </div>
                    <ul
                      style={{
                        width: "100%",
                        listStyle: "none",
                        margin: "0",
                        borderRadius: "0.5rem",
                        display: "grid",
                        padding: "0rem 1rem",
                      }}
                    >
                      {[10, 11, 12, 13].map((tabNum) => (
                        <li
                          key={tabNum}
                          style={{
                            fontSize: "12px",
                            padding: "0rem 0.6rem 0.2rem 0.6rem",
                            cursor: "pointer",
                            color: activeTab === tabNum ? "white" : "#b0b0b0",
                            transition: "all 0.2s",
                            border: "none",
                            background: "transparent",
                            width: "100%",
                            textAlign: "left",
                            borderRadius: "0.5rem",
                          }}
                          onClick={() => handleTabClick(tabNum)}
                        >
                          {tabNum === 10 && "Download"}
                          {tabNum === 11 && "Earning"}
                          {tabNum === 12 && "Analytic"}
                          {tabNum === 13 && "Asset"}
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    margin: "1rem 0 0rem 0",
                    padding: "0.5rem",
                    display: "grid",
                    gap: "10px",
                    borderTop: "1px solid #333",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "0.75rem 1.5rem",
                      color: activeTab === 1 ? "white" : "#b0b0b0",
                      transition: "all 0.2s",
                      borderRadius: "8px",
                    }}
                    onClick={() => handleTabClick(1)}
                  >
                    <FiFileText
                      style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}
                    />
                    <span style={{ whiteSpace: "nowrap" }}>Blogs</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "0.75rem 1.5rem",
                      color: activeTab === 2 ? "white" : "#b0b0b0",
                      transition: "all 0.2s",
                      borderRadius: "8px",
                    }}
                    onClick={() => handleTabClick(2)}
                  >
                    <FiBriefcase
                      style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}
                    />
                    <span style={{ whiteSpace: "nowrap" }}>Portfolio</span>
                  </li>
                </ul>
              )}
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "1rem",
                borderTop: "1px solid #333",
              }}
            >
              <div
                style={{
                  position: "relative",
                  fontSize: "12px",
                  marginTop: "auto",
                  padding: "0.2rem 0",
                  display: "grid",
                }}
              >
                <button
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "0.2rem 0.75rem",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    color: "#b0b0b0",
                    cursor: "pointer",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <FiSettings style={{ fontSize: "1.1rem" }} />
                  <span style={{ whiteSpace: "nowrap" }}>Settings</span>
                </button>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "0.2rem 0.75rem",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    color: "#b0b0b0",
                    cursor: "pointer",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                  onClick={async () => {
                    try {
                      await signOut(auth);
                      navigate("/");
                    } catch (error) {
                      setError(`Failed to log out: ${error.message}`);
                    }
                  }}
                >
                  <FiLogOut style={{ fontSize: "1.1rem" }} />
                  <span style={{ whiteSpace: "nowrap" }}>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MOBILE OVERLAY ===== */}
        {sidebarOpen && window.innerWidth <= 768 && (
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <div className="admin-main-content">
          {/* Desktop Header */}
          {window.innerWidth > 768 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "600",
                  color: "white",
                }}
              >
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
                {activeTab === 1 && selectedDashboard === "company" && ""}
                {activeTab === 2 && selectedDashboard === "company" && ""}
              </h1>

              {/* Desktop Notification Button */}
              <div style={{ position: "relative" }} ref={notificationRef}>
                <button className="header-btn" onClick={toggleNotifications}>
                  <FiBell style={{ fontSize: "1.2rem" }} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
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
          )}

          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "rgba(247, 37, 133, 0.2)",
                color: "#f72585",
                border: "1px solid rgba(247, 37, 133, 0.3)",
                borderRadius: "4px",
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {error}
              <button
                onClick={() => setError(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f72585",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
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
                  formatCurrency={(amount) =>
                    `$${amount?.toFixed(2) || "0.00"}`
                  }
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
                  createAssetNotification={createAdminNotification}
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
                  createAssetNotification={createAdminNotification}
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

          {loading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                color: "white",
                fontSize: "1.5rem",
              }}
            >
              Loading...
            </div>
          )}

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
    </>
  );
};

export default AdminDashboard;
