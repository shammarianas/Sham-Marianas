import { auth, db, storage } from "../../../../firebase";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, collectionGroup, updateDoc, setDoc, deleteDoc, orderBy, query, addDoc } from "firebase/firestore";
import Upload from "../../../Pages/Upload";
import BlogEditorModal from "../../../Pages/BlogEditor";
import ProjectModal from "../../../Pages/PortfolioUpload";
import {
  FiUsers,
  FiMail,
  FiUpload,
  FiFileText,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
  FiTrash2,
  FiBox,
  FiHome,
  FiBell,
  FiSettings,
  FiUser,
  FiShield,
  FiUserCheck,
  FiChevronLeft,
  FiMenu,
  FiLogOut,
  FiActivity,
  FiFilter,
  FiEye,
  FiMapPin,
  FiCalendar,
  FiShoppingCart,
  FiDollarSign,
  FiDownload,
  FiCheckCircle,
  FiMoreHorizontal,
  FiStar,
  FiTrendingUp,
  FiTag,
  FiImage,
  FiBriefcase,
  FiPlus,
  FiCornerUpLeft,
  FiMessageSquare,
  FiAlertCircle
} from "react-icons/fi";
import "./style.css";
import { serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../../firebase";
import { signOut } from "firebase/auth";
import { seedAll } from "../../../utils/seedFirestore";
import { wipeCollections, DEFAULT_WIPE_TARGETS } from "../../../utils/wipeFirestore";

const UnauthorizedAccess = ({ error }) => {
  return (
    <div className="unauthorized-access">
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Overview
  const [users, setUsers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("all");
  const [selectedUserStatus, setSelectedUserStatus] = useState("all");
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showCreateAssetDialog, setShowCreateAssetDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogSearchTerm, setBlogSearchTerm] = useState("");
  const [selectedBlogStatus, setSelectedBlogStatus] = useState("all");
  const [showBlogDialog, setShowBlogDialog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [supportStatusFilter, setSupportStatusFilter] = useState("all");
  const [supportCategoryFilter, setSupportCategoryFilter] = useState("all");
  const [showSupportTicketDialog, setShowSupportTicketDialog] = useState(false);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [supportResponse, setSupportResponse] = useState("");
  const navigate = useNavigate();

  // Asset categories
  const ASSET_CATEGORIES = [
    "3D Models", "Textures", "HDRIs", "Videos", "Images", "Graphics",
    "Icons", "Fonts", "Scripts", "Mockups", "Audio", "Templates"
  ];

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = normalizeDate(date);
    return d ? d.toLocaleDateString() : 'N/A';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'moderator': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleUserStatusToggle = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await handleUpdateUserStatus(userId, newStatus);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      await handleRoleChange(userId, newRole, user.email);
    }
  };

  // Asset management handlers
  const handleToggleAssetFeatured = async (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      try {
        await updateDoc(doc(db, "Assets", assetId), {
          isFeatured: !asset.isFeatured,
          updatedAt: serverTimestamp()
        });
        setAssets(prev => prev.map(a =>
          a.id === assetId ? { ...a, isFeatured: !a.isFeatured } : a
        ));
      } catch (error) {
        setError(`Failed to update asset: ${error.message}`);
      }
    }
  };

  const handleToggleAssetTrending = async (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      try {
        await updateDoc(doc(db, "Assets", assetId), {
          isTrending: !asset.isTrending,
          updatedAt: serverTimestamp()
        });
        setAssets(prev => prev.map(a =>
          a.id === assetId ? { ...a, isTrending: !a.isTrending } : a
        ));
      } catch (error) {
        setError(`Failed to update asset: ${error.message}`);
      }
    }
  };

  // Authorized admins list
  const AUTHORIZED_ADMINS = [
    "admin@shammarianas.com",
    "adebayour66265@gmail.com",
    "shammarianas@gmail.com"
  ];

  // Check admin status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {

      if (!currentUser) {
        setError("Please log in to access the admin dashboard");
        navigate('/Login');
        return;
      }

      try {
        const email = currentUser.email?.toLowerCase();
        if (!email) {
          setError("User email not available");
          return;
        }


        if (await checkAdminStatus(email)) {
          setIsAdmin(true);

          // Primary admin can seed additional authorized admins
          const PRIMARY_ADMIN = "admin@shammarianas.com";
          if (email === PRIMARY_ADMIN) {
            try {
              await Promise.all(
                AUTHORIZED_ADMINS
                  .filter((e) => e && e !== PRIMARY_ADMIN)
                  .map((e) => setDoc(
                    doc(db, "adminUsers", e),
                    { createdAt: serverTimestamp(), promotedBy: email },
                    { merge: true }
                  ))
              );
            } catch {}
          }

          await Promise.all([fetchUsers(), fetchSupportMessages(null)]);
          setSelectedProfileId(currentUser.uid);
        } else {
          setError("You do not have admin privileges");
          navigate('/');
        }
      } catch (error) {
        setError(`Failed to verify admin privileges: ${error.message}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (email) => {
    if (!email) return false;

    // Primary admin (must match Firestore rules)
    const PRIMARY_ADMIN = "admin@shammarianas.com";
    const ALSO_AUTHORIZED = ["adebayour66265@gmail.com","shammarianas@gmail.com"];
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
      if (!db) return false;
      // Allow UI access for pre-authorized emails once seeded
      const adminDoc = await getDoc(doc(db, "adminUsers", email));
      if (adminDoc.exists()) return true;
      if (ALSO_AUTHORIZED.includes(email)) return false; // needs seeding by primary admin
      return false;
    } catch (error) {
      setError(`Failed to check admin status: ${error.message}`);
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Firebase not initialized");
      const querySnapshot = await getDocs(collection(db, "Profiles"));
      const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
        const q = query(collectionGroup(db, "Support"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const messages = snap.docs.map((d) => ({ id: d.id, profileId: d.ref.parent.parent?.id || "", ...d.data() }));
        setSupportMessages(messages);
      } else {
        const uid = profileId || auth.currentUser?.uid;
        if (!uid) { setSupportMessages([]); return; }
        const q = query(collection(db, `Profiles/${uid}/Support`), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const messages = snap.docs.map((d) => ({ id: d.id, profileId: uid, ...d.data() }));
        setSupportMessages(messages);
      }
    } catch (error) {
      setError(`Failed to load support messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs when Blog tab is selected
  const loadBlogs = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      const blogsData = [];
      querySnapshot.forEach((doc) => {
        blogsData.push({ id: doc.id, ...doc.data() });
      });
      setBlogs(blogsData);
    } catch (error) {
      setError(`Failed to load blogs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 4) {
      loadBlogs();
    }
  }, [activeTab]);

  // Load portfolios (projects)
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

  // Fetch portfolios (projects) when Portfolio tab is selected
  useEffect(() => {
    if (activeTab === 5) {
      loadProjects();
    }
  }, [activeTab]);

  // Fetch All Assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "Assets"));
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssets(assetsData);
    } catch (error) {
      setError(`Failed to load assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assets when Uploads or Stock Management tab is selected
  useEffect(() => {
    if (activeTab === 3 || activeTab === 6) {
      fetchAssets();
    }
  }, [activeTab, fetchAssets]);

  const handleRoleChange = async (userId, newRole, userEmail) => {
    if (!isAdmin) {
      setError("Only admins can change user roles");
      return;
    }
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        const lowerCaseEmail = (userEmail || "").toLowerCase();
        const setUserRoleFn = httpsCallable(functions, "setUserRole");
        await setUserRoleFn({ targetEmail: lowerCaseEmail, userId, role: newRole });
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      } catch (error) {
        setError(`Failed to update role: ${error.message}`);
      }
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    if (!isAdmin) { setError("Only admins can change user status"); return; }
    try {
      const setUserStatusFn = httpsCallable(functions, "setUserStatus");
      await setUserStatusFn({ userId, status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (error) {
      setError(`Failed to update status: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!isAdmin) { setError("Only admins can delete users"); return; }
    try {
      const deleteUserFn = httpsCallable(functions, "deleteUser");
      await deleteUserFn({ userId, email: (email || "").toLowerCase() });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      setError(`Failed to delete user: ${error.message}`);
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (!isAdmin) {
      setError("Only admins can perform bulk role changes");
      return;
    }
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} user(s) to "${newRole}"?`)) {
      try {
        await Promise.all(
          selectedUsers.map(async (userId) => {
            const user = users.find((u) => u.id === userId);
            if (!user || !user.email) return;
            const lowerCaseEmail = (user.email || "").toLowerCase();
            const setUserRoleFn = httpsCallable(functions, "setUserRole");
            await setUserRoleFn({ targetEmail: lowerCaseEmail, userId, role: newRole });
          })
        );
        setUsers(users.map((user) => (selectedUsers.includes(user.id) ? { ...user, role: newRole } : user)));
        setSelectedUsers([]);
      } catch (error) {
        setError(`Failed to update user roles: ${error.message}`);
      }
    }
  };

  const handleStatusChange = async (profileId, messageId, newStatus) => {
    if (!isAdmin && profileId !== auth.currentUser?.uid) {
      setError("Only admins can change other users' message status");
      return;
    }
    if (window.confirm("Are you sure you want to change this message's status?")) {
      try {
        await updateDoc(doc(db, `Profiles/${profileId}/Support`, messageId), { status: newStatus });
        setSupportMessages(supportMessages.map((msg) => (msg.id === messageId && msg.profileId === profileId ? { ...msg, status: newStatus } : msg)));
      } catch (error) {
        setError(`Failed to update message status: ${error.message}`);
      }
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!isAdmin && selectedMessages.some((id) => supportMessages.find((msg) => msg.id === id).profileId !== auth.currentUser?.uid)) {
      setError("Only admins can perform bulk status changes for other users' messages");
      return;
    }
    if (selectedMessages.length === 0) return;
    if (window.confirm(`Change status of ${selectedMessages.length} message(s) to ${newStatus}?`)) {
      try {
        await Promise.all(
          selectedMessages.map((messageId) => {
            const message = supportMessages.find((msg) => msg.id === messageId);
            return updateDoc(doc(db, `Profiles/${message.profileId}/Support`, messageId), { status: newStatus });
          })
        );
        setSupportMessages(supportMessages.map((msg) => (selectedMessages.includes(msg.id) ? { ...msg, status: newStatus } : msg)));
        setSelectedMessages([]);
      } catch (error) {
        setError(`Failed to update message statuses: ${error.message}`);
      }
    }
  };

  const handleRespondToTicket = async (ticketId, response, newStatus) => {
    try {
      const profileId = selectedSupportTicket?.profileId || selectedProfileId || auth.currentUser?.uid;
      if (!profileId) { setError("No profile selected for this ticket"); return; }
      await updateDoc(doc(db, `Profiles/${profileId}/Support`, ticketId), {
        adminResponse: response,
        status: newStatus,
        respondedAt: serverTimestamp()
      });
      setSupportMessages(prev => prev.map(m => (m.id === ticketId && m.profileId === profileId) ? { ...m, adminResponse: response, status: newStatus } : m));
      setShowSupportTicketDialog(false);
      setSupportResponse("");
    } catch (e) {
      setError(`Failed to respond: ${e.message}`);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await deleteDoc(doc(db, "blogs", blogId));
      await loadBlogs();
    } catch (error) {
      console.error("Delete blog error:", error);
      setError("Failed to delete blog post");
    }
  };

  const handleToggleBlogStatus = async (blogId, currentStatus) => {
    const newStatus = (currentStatus || "draft").toLowerCase() === "published" ? "DRAFT" : "PUBLISHED";
    try {
      await updateDoc(doc(db, "blogs", blogId), { status: newStatus, updatedAt: serverTimestamp() });
      await loadBlogs();
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
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        await deleteDoc(doc(db, "projects", portfolioId));
        setPortfolios(portfolios.filter((portfolio) => portfolio.id !== portfolioId));
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
      await updateDoc(doc(db, "projects", portfolioId), { status: newStatus, updatedAt: serverTimestamp() });
      setPortfolios((prev) => prev.map((p) => (p.id === portfolioId ? { ...p, status: newStatus } : p)));
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
      await updateDoc(doc(db, "projects", portfolioId), { featured: !current, updatedAt: serverTimestamp() });
      setPortfolios((prev) => prev.map((p) => (p.id === portfolioId ? { ...p, featured: !current } : p)));
    } catch (error) {
      setError(`Failed to update portfolio: ${error.message}`);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!isAdmin) {
      setError("Only admins can delete assets");
      return;
    }
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteDoc(doc(db, "Assets", assetId));
        setAssets(assets.filter((asset) => asset.id !== assetId));
      } catch (error) {
        setError(`Failed to delete asset: ${error.message}`);
      }
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const withinDate = (createdAt) => {
    if (!dateFilter) return true;
    const days = parseInt(dateFilter, 10);
    const d = normalizeDate(createdAt);
    if (!d) return false;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return d.getTime() >= cutoff;
  };

  const filteredUsers = users.filter((user) => {
    const searchTerm = activeTab === 1 ? userSearchTerm : search;
    const roleFilterValue = activeTab === 1 ? selectedUserRole : roleFilter;
    const statusFilterValue = activeTab === 1 ? selectedUserStatus : statusFilter;

    const matchesText = (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (user.name || user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilterValue === "all" || !roleFilterValue ? true : user.role === roleFilterValue;
    const matchesStatus = statusFilterValue === "all" || !statusFilterValue ? true : (user.status || "active") === statusFilterValue;
    const matchesDate = withinDate(user.createdAt);
    return matchesText && matchesRole && matchesStatus && matchesDate;
  });

  const valueByKey = (obj, key) => {
    if (key === "lastActive") return normalizeDate(obj.lastActive)?.getTime() || 0;
    return (obj[key] || "").toString().toLowerCase();
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const av = valueByKey(a, sortConfig.key);
    const bv = valueByKey(b, sortConfig.key);
    return sortConfig.direction === "ascending" ? (av < bv ? -1 : av > bv ? 1 : 0) : av > bv ? -1 : av < bv ? 1 : 0;
  });

  const filteredMessages = supportMessages.filter((msg) => {
    const matchesSearch = msg.subject?.toLowerCase().includes(search.toLowerCase()) || msg.email?.toLowerCase().includes(search.toLowerCase());
    return messageFilter === "all" ? matchesSearch : msg.status === messageFilter && matchesSearch;
  });
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const filteredBlogs = blogs.filter((blog) => blog.title?.toLowerCase().includes(search.toLowerCase()) || !blog.title);
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const filteredPortfolios = portfolios.filter((portfolio) => portfolio.title?.toLowerCase().includes(search.toLowerCase()) || !portfolio.title);
  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const filteredAssets = assets.filter((asset) => {
    const searchTerm = activeTab === 6 ? assetSearchTerm : search;
    const categoryFilter = activeTab === 6 ? selectedCategory : "";

    const matchesText = (asset.name || asset.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (asset.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || !categoryFilter ? true :
                           (asset.category || asset.type || "").toLowerCase() === categoryFilter.toLowerCase();

    return matchesText && matchesCategory;
  });
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const currentMessages = sortedMessages.slice(indexOfFirstItem, indexOfLastItem);
  const currentBlogs = sortedBlogs.slice(indexOfFirstItem, indexOfLastItem);
  const currentPortfolios = sortedPortfolios.slice(indexOfFirstItem, indexOfLastItem);
  const currentAssets = sortedAssets.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter((user) => user.role === "admin").length,
    pendingMessages: supportMessages.filter((msg) => msg.status === "unopened").length,
    totalBlogs: blogs.length,
    totalPortfolios: portfolios.length,
    totalAssets: assets.length,
  };

  const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const lastNMonths = (n=12) => {
    const arr = [];
    const now = new Date();
    for (let i = n-1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      arr.push({ key: monthKey(d), label: d.toLocaleString('en-US',{ month:'short', year:'numeric' }) });
    }
    return arr;
  };

  const analytics = React.useMemo(() => {
    const totalDownloads = assets.reduce((s,a)=> s + (a.downloads||0), 0);
    const totalRevenue = assets.reduce((s,a)=> s + ((a.price||0) * (a.downloads||0)), 0);
    const categories = assets.reduce((acc,a)=>{ const k=(a.category||a.type||'other').toString().toLowerCase(); acc[k]=(acc[k]||0)+1; return acc; },{});
    const popularCategories = Object.entries(categories).map(([category,count])=>({ category, count }));

    const months = lastNMonths(12);
    const monthlyRevenue = months.map(m=>{
      const rev = assets.filter(a=>{ const d=normalizeDate(a.createdAt); return d && monthKey(d)===m.key; }).reduce((s,a)=> s + ((a.price||0)*(a.downloads||0)),0);
      return { month: m.label, revenue: rev };
    });
    const monthlyDownloads = months.map(m=>{
      const dls = assets.filter(a=>{ const d=normalizeDate(a.createdAt); return d && monthKey(d)===m.key; }).reduce((s,a)=> s + (a.downloads||0),0);
      return { month: m.label, downloads: dls };
    });

    const totalOrders = totalDownloads;
    const conversionRate = users.length ? Math.min(100, (totalOrders / users.length) * 100) : 0;
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalUsers: users.length,
      popularCategories,
      salesReport: { totalOrders, conversionRate, averageOrderValue },
      monthlyRevenue,
      monthlyDownloads,
      recentSales: [],
    };
  }, [assets, users]);

  const revenueData = React.useMemo(() => {
    const months = lastNMonths(12);
    return months.map(m=>{
      const revenue = assets.filter(a=>{ const d=normalizeDate(a.createdAt); return d && monthKey(d)===m.key; }).reduce((s,a)=> s + ((a.price||0)*(a.downloads||0)),0);
      const orders = assets.filter(a=>{ const d=normalizeDate(a.createdAt); return d && monthKey(d)===m.key; }).reduce((s,a)=> s + (a.downloads||0),0);
      const usersInMonth = users.filter(u=>{ const d=normalizeDate(u.createdAt); return d && monthKey(d)===m.key; }).length;
      return { month: m.label, revenue, orders, users: usersInMonth };
    });
  }, [assets, users]);

  const userGrowthData = React.useMemo(() => {
    const days = 30;
    const arr = [];
    let total = 0;
    const byDay = users.reduce((acc,u)=>{ const d=normalizeDate(u.createdAt); if(!d) return acc; const k=d.toISOString().slice(0,10); acc[k]=(acc[k]||0)+1; return acc; },{});
    for (let i = days-1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      const newUsers = byDay[key]||0;
      total += newUsers;
      arr.push({ date: key, newUsers, totalUsers: total });
    }
    return arr;
  }, [users]);

  const formatDateForFilename = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const generateCSVContent = () => {
    const rows = [];
    rows.push(["Analytics Report", `Generated on ${new Date().toLocaleDateString()}`]);
    rows.push([""]);
    rows.push(["Key Metrics"]);
    rows.push(["Metric","Value","Change"]);
    rows.push(["Total Revenue", formatCurrency(analytics.totalRevenue), "+12.3%"]);
    rows.push(["Total Orders", analytics.salesReport.totalOrders.toLocaleString(), "+8.7%"]);
    rows.push(["Active Users", analytics.totalUsers.toLocaleString(), "+15.2%"]);
    rows.push(["Conversion Rate", `${analytics.salesReport.conversionRate.toFixed(1)}%`, "-2.1%"]);
    rows.push([""]);
    rows.push(["Monthly Revenue Trend"]);
    rows.push(["Month","Revenue","Orders","Users"]);
    revenueData.forEach(item=>{
      rows.push([item.month, formatCurrency(item.revenue), item.orders.toString(), item.users.toString()]);
    });
    rows.push([""]);
    rows.push(["User Growth (Last 7 Days)"]);
    rows.push(["Date","New Users","Total Users"]);
    userGrowthData.slice(-7).forEach(item=>{
      rows.push([item.date, item.newUsers.toString(), item.totalUsers.toString()]);
    });
    rows.push([""]);
    rows.push(["Asset Categories"]);
    rows.push(["Category","Count","Percentage"]);
    const totalAssets = analytics.popularCategories.reduce((s,c)=> s + c.count, 0) || 1;
    analytics.popularCategories.forEach(category=>{
      const percentage = ((category.count/totalAssets)*100).toFixed(1);
      rows.push([category.category, category.count.toString(), `${percentage}%`]);
    });
    rows.push([""]);
    rows.push(["Top Performing Assets"]);
    rows.push(["Asset","Category","Downloads","Revenue","Growth"]);
    const topAssets = assets
      .map(a=>({ name: a.title||a.name||'Asset', category: a.category||a.type||'other', downloads: a.downloads||0, revenue: (a.price||0)*(a.downloads||0), growth: 0 }))
      .sort((a,b)=> b.revenue - a.revenue)
      .slice(0,5);
    topAssets.forEach(asset=>{
      rows.push([asset.name, asset.category, asset.downloads.toLocaleString(), formatCurrency(asset.revenue), `${asset.growth}%`]);
    });
    return rows.map(row=> row.map(cell=>`"${cell.toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  };

  const generateJSONReport = () => ({
    reportMetadata: { generatedAt: new Date().toISOString(), reportType: 'Analytics Report', timeRange: 'Last 12 months' },
    keyMetrics: {
      totalRevenue: analytics.totalRevenue,
      totalOrders: analytics.salesReport.totalOrders,
      activeUsers: analytics.totalUsers,
      conversionRate: analytics.salesReport.conversionRate,
      averageOrderValue: analytics.salesReport.averageOrderValue,
      monthlyRevenue: analytics.monthlyRevenue,
      monthlyDownloads: analytics.monthlyDownloads,
    },
    revenueData,
    userGrowthData,
    categoryDistribution: analytics.popularCategories,
    topPerformingAssets: assets
      .map(a=>({ name: a.title||a.name||'Asset', category: a.category||a.type||'other', downloads: a.downloads||0, revenue: (a.price||0)*(a.downloads||0), growth: 0 }))
      .sort((a,b)=> b.revenue - a.revenue)
      .slice(0,5),
    recentSales: [],
  });

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = generateCSVContent();
      const filename = `analytics-report-${formatDateForFilename()}.csv`;
      downloadFile(csv, filename, 'text/csv;charset=utf-8;');
      alert('CSV report exported successfully!');
    } catch (e) {
      console.error('Export error:', e);
      setError('Failed to export CSV report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const json = JSON.stringify(generateJSONReport(), null, 2);
      const filename = `analytics-report-${formatDateForFilename()}.json`;
      downloadFile(json, filename, 'application/json;charset=utf-8;');
      alert('JSON report exported successfully!');
    } catch (e) {
      console.error('Export error:', e);
      setError('Failed to export JSON report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = generateJSONReport();
      const printWindow = window.open('', '_blank');
      if (!printWindow) { setError('Please allow popups to generate PDF'); setIsExporting(false); return; }
      const pdfContent = `<!DOCTYPE html><html><head><title>Analytics Report - ${formatDateForFilename()}</title><style>@page{margin:1cm;size:A4}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;color:#333;line-height:1.6;font-size:12px}.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #2563eb;padding-bottom:20px}.header h1{color:#2563eb;margin:0;font-size:28px;font-weight:bold}.header .subtitle{color:#6b7280;margin-top:5px;font-size:14px}.section{margin-bottom:25px;page-break-inside:avoid}.section h2{color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:15px;font-size:18px;font-weight:600}.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin:15px 0}.metric-card{border:1px solid #d1d5db;padding:15px;border-radius:8px;background:#f9fafb;text-align:center}.metric-value{font-size:20px;font-weight:bold;color:#059669;margin-bottom:5px}.metric-label{color:#6b7280;font-size:12px;font-weight:500}.metric-change{font-size:11px;margin-top:3px}.change-positive{color:#059669}.change-negative{color:#dc2626}table{width:100%;border-collapse:collapse;margin:15px 0;font-size:11px}th,td{border:1px solid #d1d5db;padding:8px 6px;text-align:left}th{background-color:#f3f4f6;font-weight:600;color:#374151}tr:nth-child(even){background-color:#f9fafb}.revenue-table td:nth-child(3),.revenue-table td:nth-child(4){text-align:right}.footer{margin-top:30px;padding-top:15px;border-top:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:10px}@media print{body{margin:0}.no-print{display:none}}</style></head><body><div class="header"><h1>Analytics Report</h1><div class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div></div><div class="section"><h2>Executive Summary</h2><div class="metrics"><div class="metric-card"><div class="metric-value">${formatCurrency(reportData.keyMetrics.totalRevenue)}</div><div class="metric-label">Total Revenue</div><div class="metric-change change-positive">+12.3% vs last month</div></div><div class="metric-card"><div class="metric-value">${reportData.keyMetrics.totalOrders.toLocaleString()}</div><div class="metric-label">Total Orders</div><div class="metric-change change-positive">+8.7% vs last month</div></div><div class="metric-card"><div class="metric-value">${reportData.keyMetrics.activeUsers.toLocaleString()}</div><div class="metric-label">Active Users</div><div class="metric-change change-positive">+15.2% vs last month</div></div><div class="metric-card"><div class="metric-value">${reportData.keyMetrics.conversionRate.toFixed(1)}%</div><div class="metric-label">Conversion Rate</div><div class="metric-change change-negative">-2.1% vs last month</div></div></div></div><div class="section"><h2>Monthly Revenue Performance</h2><table class="revenue-table"><thead><tr><th>Month</th><th>Revenue</th><th>Orders</th><th>Users</th></tr></thead><tbody>${revenueData.map(item=>`<tr><td>${item.month}</td><td>${formatCurrency(item.revenue)}</td><td>${item.orders}</td><td>${item.users}</td></tr>`).join('')}</tbody></table></div><div class="section"><h2>Asset Category Distribution</h2><table><thead><tr><th>Category</th><th>Count</th><th>Percentage</th></tr></thead><tbody>${analytics.popularCategories.map(cat=>{const total=analytics.popularCategories.reduce((s,c)=>s+c.count,0)||1;const pct=((cat.count/total)*100).toFixed(1);return `<tr><td>${cat.category}</td><td>${cat.count}</td><td>${pct}%</td></tr>`}).join('')}</tbody></table></div><div class="section"><h2>Top Performing Assets</h2><table><thead><tr><th>Asset Name</th><th>Category</th><th>Downloads</th><th>Revenue</th><th>Growth</th></tr></thead><tbody>${assets.map(a=>({ name:a.title||a.name||'Asset', category:a.category||a.type||'other', downloads:a.downloads||0, revenue:(a.price||0)*(a.downloads||0), growth:0 })).sort((a,b)=>b.revenue-a.revenue).slice(0,5).map(asset=>`<tr><td>${asset.name}</td><td>${asset.category}</td><td>${asset.downloads.toLocaleString()}</td><td>${formatCurrency(asset.revenue)}</td><td class="change-positive">+${asset.growth}%</td></tr>`).join('')}</tbody></table></div><div class="footer"><p>This report contains confidential business information. Generated by Digital Marketplace Analytics System.</p></div></body></html>`;
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      setTimeout(()=>{ printWindow.focus(); printWindow.print(); setTimeout(()=>{ alert("PDF report ready! Use your browser's print dialog to save as PDF."); setIsExporting(false); }, 500); }, 300);
    } catch (e) {
      console.error('PDF export error:', e);
      setError('Failed to generate PDF report');
      setIsExporting(false);
    }
  };

  if (error && !isAdmin) {
    return <UnauthorizedAccess error={error} />;
  }

  return (
    <div className="admin-dashboard">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-full">Admin Panel</div>
            <div className="logo-compact">AP</div>
          </div>
          <button className="sidebar-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? 'Expand' : 'Collapse'}>
            <FiChevronLeft className={`toggle-icon ${isSidebarCollapsed ? 'rotated' : ''}`} />
          </button>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => { setActiveTab(0); setIsSidebarOpen(false); }} title="Dashboard">
            <FiHome className="menu-icon" />
            <span className="nav-label">Dashboard</span>
          </li>
          <li className={`menu-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => { setActiveTab(1); setIsSidebarOpen(false); }} title="Users">
            <FiUsers className="menu-icon" />
            <span className="nav-label">Users</span>
          </li>
          <li className={`menu-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => { setActiveTab(2); setIsSidebarOpen(false); }} title="Support">
            <FiMail className="menu-icon" />
            <span className="nav-label">Support</span>
          </li>
          <li className={`menu-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => { setActiveTab(3); setIsSidebarOpen(false); }} title="Uploads">
            <FiUpload className="menu-icon" />
            <span className="nav-label">Uploads</span>
          </li>
          <li className={`menu-item ${activeTab === 4 ? 'active' : ''}`} onClick={() => { setActiveTab(4); setIsSidebarOpen(false); }} title="Blog">
            <FiFileText className="menu-icon" />
            <span className="nav-label">Blog</span>
          </li>
          <li className={`menu-item ${activeTab === 5 ? 'active' : ''}`} onClick={() => { setActiveTab(5); setIsSidebarOpen(false); }} title="Portfolio">
            <FiFileText className="menu-icon" />
            <span className="nav-label">Portfolio</span>
          </li>
          <li className={`menu-item ${activeTab === 6 ? 'active' : ''}`} onClick={() => { setActiveTab(6); setIsSidebarOpen(false); }} title="Stock Management">
            <FiBox className="menu-icon" />
            <span className="nav-label">Stock Management</span>
          </li>
          <li className={`menu-item ${activeTab === 7 ? 'active' : ''}`} onClick={() => { setActiveTab(7); setIsSidebarOpen(false); }} title="Admin Manager">
            <FiShield className="menu-icon" />
            <span className="nav-label">Admin Manager</span>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="menu-item compact" title="Settings">
            <FiSettings className="menu-icon" />
            <span className="nav-label">Settings</span>
          </button>
          <button className="menu-item compact" title="Logout" onClick={async () => { try { await signOut(auth); navigate('/'); } catch {} }}>
            <FiLogOut className="menu-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-only" onClick={() => setIsSidebarOpen(true)} title="Open Menu">
              <FiMenu />
            </button>
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={
                  activeTab === 1
                    ? "Search users..."
                    : activeTab === 2
                    ? "Search messages..."
                    : activeTab === 4
                    ? "Search blogs..."
                    : activeTab === 5
                    ? "Search portfolios..."
                    : activeTab === 6
                    ? "Search assets..."
                    : activeTab === 7
                    ? "Search admins..."
                    : "Search..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="topbar-right">
            <div className="notification-button" title="Notifications">
              <FiBell />
              {stats.pendingMessages > 0 && <span className="notification-badge">{stats.pendingMessages}</span>}
            </div>
            <button className="icon-button" title="Settings">
              <FiSettings />
            </button>
            <div className="profile-chip" title={auth.currentUser?.email || "Admin"}>
              <FiUser className="profile-icon" />
              <span className="profile-email">{auth.currentUser?.email || "Admin"}</span>
            </div>
          </div>
        </div>

        <div className="header">
          <h1 className="page-title">
            {activeTab === 0 && "Dashboard Overview"}
            {activeTab === 1 && "User Management"}
            {activeTab === 2 && "Support Messages"}
            {activeTab === 3 && "File Uploads"}
            {activeTab === 4 && "Blog Editor"}
            {activeTab === 5 && "Portfolio Uploads"}
            {activeTab === 6 && "Stock Management"}
            {activeTab === 7 && "Admin Manager"}
          </h1>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              <FiX />
            </button>
          </div>
        )}

        {activeTab === 0 && (
          <div className="overview-grid">
            <WelcomeBanner
              name={auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Admin"}
              totalUsers={users.length}
              totalAssets={assets.length}
            />

            <KPICards
              users={users}
              admins={users.filter((u) => u.role === "admin").length}
              messages={supportMessages}
              blogs={blogs}
              portfolios={portfolios}
              assets={assets}
            />

            <div className="insights-grid">
              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Popular Categories</h3>
                </div>
                <div className="card-body">
                  <UsageDistribution assets={assets} />
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Recent Activity</h3>
                </div>
                <div className="card-body">
                  <RecentActivity messages={supportMessages} blogs={blogs} portfolios={portfolios} assets={assets} />
                </div>
              </div>
            </div>

            <QuickActions onNavigate={(tab) => setActiveTab(tab)} onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} onExportPDF={handleExportPDF} isExporting={isExporting} />

            <div className="overview-panels">
              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Recent Users</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map((u) => (
                          <tr key={u.id}>
                            <td>{u.email || "Unknown"}</td>
                            <td>
                              <span className={`role-badge ${u.role}`}>{u.role || "Unknown"}</span>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan="2" className="no-data">No users yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Recent Support</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportMessages.slice(0, 5).map((m) => (
                          <tr key={m.id}>
                            <td>{m.subject || "No Subject"}</td>
                            <td>
                              <span className={`status-badge ${m.status}`}>{m.status || "Unknown"}</span>
                            </td>
                          </tr>
                        ))}
                        {supportMessages.length === 0 && (
                          <tr>
                            <td colSpan="2" className="no-data">No messages</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading-overlay">Loading...</div>}

        {activeTab !== 0 && (
          <div className="content-card">
            <div className="card-header">
              <div className="filters">
                {activeTab === 1 && (
                  <>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="user">User</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="banned">Banned</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
                      <option value="">Any Time</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                    <div className="filter-group-responsive">
                      <button onClick={() => handleSort("name")} className={`sort-button ${sortConfig.key === "name" ? "active" : ""}`}>
                        Name {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                      <button onClick={() => handleSort("email")} className={`sort-button ${sortConfig.key === "email" ? "active" : ""}`}>
                        Email {sortConfig.key === "email" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                      <button onClick={() => handleSort("role")} className={`sort-button ${sortConfig.key === "role" ? "active" : ""}`}>
                        Role {sortConfig.key === "role" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                      <button onClick={() => handleSort("lastActive")} className={`sort-button ${sortConfig.key === "lastActive" ? "active" : ""}`}>
                        Last Active {sortConfig.key === "lastActive" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                    </div>
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    {isAdmin && (
                      <select
                        value={selectedProfileId || ""}
                        onChange={(e) => {
                          setSelectedProfileId(e.target.value);
                          fetchSupportMessages(e.target.value);
                        }}
                        className="filter-select"
                      >
                        <option value="" disabled>
                          Select User
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.email}
                          </option>
                        ))}
                      </select>
                    )}
                    <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)} className="filter-select">
                      <option value="all">All Messages</option>
                      <option value="unopened">Unopened</option>
                      <option value="opened">Opened</option>
                      <option value="responded">Responded</option>
                    </select>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("subject")} className={`sort-button ${sortConfig.key === "subject" ? "active" : ""}`}>
                      Subject {sortConfig.key === "subject" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
                {activeTab === 4 && (
                  <>
                    <button onClick={() => handleSort("title")} className={`sort-button ${sortConfig.key === "title" ? "active" : ""}`}>
                      Title {sortConfig.key === "title" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
                {activeTab === 5 && (
                  <>
                    <button onClick={() => handleSort("title")} className={`sort-button ${sortConfig.key === "title" ? "active" : ""}`}>
                      Title {sortConfig.key === "title" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
                {activeTab === 6 && (
                  <>
                    <button onClick={() => handleSort("name")} className={`sort-button ${sortConfig.key === "name" ? "active" : ""}`}>
                      Name {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="card-body">
              {activeTab === 1 && (
                <UserList
                  users={currentUsers}
                  onRoleChange={handleRoleChange}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  handleBulkRoleChange={handleBulkRoleChange}
                  onUpdateStatus={handleUpdateUserStatus}
                  onDelete={handleDeleteUser}
                  userSearchTerm={userSearchTerm}
                  setUserSearchTerm={setUserSearchTerm}
                  selectedUserRole={selectedUserRole}
                  setSelectedUserRole={setSelectedUserRole}
                  selectedUserStatus={selectedUserStatus}
                  setSelectedUserStatus={setSelectedUserStatus}
                  showUserDialog={showUserDialog}
                  setShowUserDialog={setShowUserDialog}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getRoleColor={getRoleColor}
                  handleUserStatusToggle={handleUserStatusToggle}
                  handleUserRoleChange={handleUserRoleChange}
                />
              )}
              {activeTab === 2 && (
                <>
                  <div className="user-header">
                    <div className="header-content">
                      <h2 className="header-title"><FiMail className="header-icon" /> Support Tickets</h2>
                      <p className="header-subtitle">Manage customer support requests</p>
                    </div>
                    <div className="filter-group-responsive">
                      <select className="filter-select" value={supportStatusFilter} onChange={(e)=>setSupportStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <select className="filter-select" value={supportCategoryFilter} onChange={(e)=>setSupportCategoryFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="general">General</option>
                        <option value="bug-report">Bug Report</option>
                        <option value="feature-request">Feature Request</option>
                      </select>
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="card-body table-wrapper">
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Ticket</th>
                              <th>User</th>
                              <th>Category</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Created</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {supportMessages.filter((t)=>{
                              const s=(t.status||'unopened').toLowerCase();
                              const openSet=['unopened','opened'];
                              const statusOk = supportStatusFilter==='all' ? true : supportStatusFilter==='open' ? openSet.includes(s) : supportStatusFilter==='in-progress' ? s==='opened' : supportStatusFilter==='resolved' ? ['responded','closed','resolved'].includes(s) : supportStatusFilter==='closed' ? s==='closed' : true;
                              const c=(t.category||'general').toLowerCase();
                              const catOk = supportCategoryFilter==='all' || c===supportCategoryFilter;
                              return statusOk && catOk;
                            }).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="no-data">No support tickets found</td>
                              </tr>
                            ) : (
                              supportMessages.filter((t)=>{
                                const s=(t.status||'unopened').toLowerCase();
                                const openSet=['unopened','opened'];
                                const statusOk = supportStatusFilter==='all' ? true : supportStatusFilter==='open' ? openSet.includes(s) : supportStatusFilter==='in-progress' ? s==='opened' : supportStatusFilter==='resolved' ? ['responded','closed','resolved'].includes(s) : supportStatusFilter==='closed' ? s==='closed' : true;
                                const c=(t.category||'general').toLowerCase();
                                const catOk = supportCategoryFilter==='all' || c===supportCategoryFilter;
                                return statusOk && catOk;
                              }).map((ticket)=>{
                                const priority=(ticket.priority||'medium').toLowerCase();
                                const status=(ticket.status||'unopened').toLowerCase();
                                return (
                                  <tr key={ticket.id}>
                                    <td>
                                      <div className="inbox-title">{ticket.subject || 'No Subject'}</div>
                                      <div className="inbox-email">{(ticket.description||ticket.message||'').slice(0,120)}</div>
                                    </td>
                                    <td>
                                      <div className="inbox-title">{ticket.userName || ticket.email || 'Unknown'}</div>
                                      <div className="inbox-email">{ticket.userEmail || ''}</div>
                                    </td>
                                    <td>{(ticket.category||'general')}</td>
                                    <td>
                                      <span className={`status-badge ${priority==='urgent'?'banned': priority==='high'?'pending': priority==='medium'?'active':'normal'}`}>{priority}</span>
                                    </td>
                                    <td><span className={`status-badge ${status}`}>{status}</span></td>
                                    <td>{ticket.createdAt?.toDate?.().toLocaleDateString?.() || 'N/A'}</td>
                                    <td>
                                      <button className="action-button" onClick={()=>{ setSelectedSupportTicket(ticket); setSupportResponse(ticket.adminResponse||''); setShowSupportTicketDialog(true); }}>
                                        <FiCornerUpLeft /> {ticket.adminResponse? 'Update' : 'Respond'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {showSupportTicketDialog && selectedSupportTicket && (
                    <div className="modal-overlay">
                      <div className="modal enhanced-modal">
                        <div className="modal-header">
                          <h3 className="modal-title"><FiMessageSquare className="modal-icon" /> Support Ticket Response</h3>
                          <button onClick={()=>setShowSupportTicketDialog(false)} className="close-button"><FiX /></button>
                        </div>
                        <div className="modal-body">
                          <div className="message-content">
                            <div className="drawer-section">
                              <div className="inbox-title">{selectedSupportTicket.subject}</div>
                              <div className="inbox-email">{selectedSupportTicket.userName} ({selectedSupportTicket.userEmail})</div>
                              <div className="message-content" style={{marginTop: '0.5rem'}}>{selectedSupportTicket.message || selectedSupportTicket.description}</div>
                            </div>
                            <div className="drawer-section">
                              <label className="detail-label">Your Response</label>
                              <textarea className="reply-input" rows={4} value={supportResponse} onChange={(e)=>setSupportResponse(e.target.value)} placeholder="Enter your response..." />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button className="action-button" disabled={!supportResponse.trim()} onClick={()=>handleRespondToTicket(selectedSupportTicket.id, supportResponse, 'opened')}><FiAlertCircle /> Mark In Progress</button>
                            <button className="action-button" disabled={!supportResponse.trim()} onClick={()=>handleRespondToTicket(selectedSupportTicket.id, supportResponse, 'responded')}><FiCheckCircle /> Mark Resolved</button>
                            <button className="action-button secondary" onClick={()=>setShowSupportTicketDialog(false)}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {activeTab === 3 && (
                <div className="uploads-layout">
                  <Upload />
                  <div className="uploads-preview">
                    <h3 className="panel-title">Recent Uploads</h3>
                    <PreviewGrid assets={assets.slice(0, 12)} />
                  </div>
                </div>
              )}
              {activeTab === 4 && (
                <BlogSection
                  blogs={currentBlogs}
                  onDelete={handleDeleteBlog}
                  onToggleStatus={handleToggleBlogStatus}
                  blogSearchTerm={blogSearchTerm}
                  setBlogSearchTerm={setBlogSearchTerm}
                  selectedBlogStatus={selectedBlogStatus}
                  setSelectedBlogStatus={setSelectedBlogStatus}
                  showBlogDialog={showBlogDialog}
                  setShowBlogDialog={setShowBlogDialog}
                  selectedBlog={selectedBlog}
                  setSelectedBlog={setSelectedBlog}
                  onCreate={() => { setIsBlogModalOpen(true); }}
                  formatDate={formatDate}
                />
              )}
              {activeTab === 5 && (
                <PortfolioList
                  portfolios={currentPortfolios}
                  onDelete={handleDeletePortfolio}
                  onCreate={() => {
                    setIsPortfolioModalOpen(true);
                  }}
                  onToggleFeatured={handleTogglePortfolioFeatured}
                  onUpdateStatus={handleUpdatePortfolioStatus}
                  formatDate={formatDate}
                />
              )}
              {activeTab === 6 && (
                <AssetList
                  assets={currentAssets}
                  onDelete={handleDeleteAsset}
                  assetSearchTerm={assetSearchTerm}
                  setAssetSearchTerm={setAssetSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  showAssetDialog={showAssetDialog}
                  setShowAssetDialog={setShowAssetDialog}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                  showCreateAssetDialog={showCreateAssetDialog}
                  setShowCreateAssetDialog={setShowCreateAssetDialog}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  handleToggleAssetFeatured={handleToggleAssetFeatured}
                  handleToggleAssetTrending={handleToggleAssetTrending}
                  ASSET_CATEGORIES={ASSET_CATEGORIES}
                />
              )}
              {activeTab === 7 && <AdminManager setError={setError} />}
            </div>

            <div className="card-footer">
              <div className="pagination">
                <button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="page-nav">
                  Previous
                </button>
                {Array.from(
                  {
                    length: Math.ceil(
                      (activeTab === 1
                        ? filteredUsers.length
                        : activeTab === 2
                        ? filteredMessages.length
                        : activeTab === 4
                        ? filteredBlogs.length
                        : activeTab === 5
                        ? filteredPortfolios.length
                        : activeTab === 6
                        ? filteredAssets.length
                        : 1) / itemsPerPage
                    ),
                  },
                  (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                      {i + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    paginate(
                      Math.min(
                        Math.ceil(
                          (activeTab === 1
                            ? filteredUsers.length
                            : activeTab === 2
                            ? filteredMessages.length
                            : activeTab === 4
                            ? filteredBlogs.length
                            : activeTab === 5
                            ? filteredPortfolios.length
                            : activeTab === 6
                            ? filteredAssets.length
                            : 1) / itemsPerPage
                        ),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(
                      (activeTab === 1
                        ? filteredUsers.length
                        : activeTab === 2
                        ? filteredMessages.length
                        : activeTab === 4
                        ? filteredBlogs.length
                        : activeTab === 5
                        ? filteredPortfolios.length
                        : activeTab === 6
                        ? filteredAssets.length
                        : 1) / itemsPerPage
                    )
                  }
                  className="page-nav"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedMessage && <MessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} onStatusChange={handleStatusChange} />}
        {isBlogModalOpen && (
          <BlogEditorModal
            isOpen={isBlogModalOpen}
            onClose={() => { setIsBlogModalOpen(false); loadBlogs(); }}
          />
        )}
        {isPortfolioModalOpen && (
          <ProjectModal
            isOpen={isPortfolioModalOpen}
            onClose={() => { setIsPortfolioModalOpen(false); loadProjects(); }}
          />
        )}
      </div>
    </div>
  );
};

const PreviewGrid = ({ assets }) => {
  return (
    <div className="preview-grid">
      {assets.length === 0 && <div className="no-data">No uploads yet</div>}
      {assets.map((a) => {
        const thumb = a.thumbnail || (Array.isArray(a.images) && a.images[0]) || (Array.isArray(a.icons) && a.icons[0]) || "";
        return (
          <div className="preview-card" key={a.id}>
            {thumb ? <img src={thumb} alt={a.title || a.name || "asset"} className="preview-image" /> : <div className="preview-placeholder" />}
            <div className="preview-info">
              <div className="preview-title">{a.title || a.name || "Untitled"}</div>
              <div className="preview-meta">{a.type || a.category || "Asset"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SupportList = ({ messages, onStatusChange, onMessageClick, selectedMessages, setSelectedMessages, handleBulkStatusChange }) => {
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [viewFilter, setViewFilter] = useState("inbox");
  const [statusFilterLocal, setStatusFilterLocal] = useState("");
  const [cannedOpen, setCannedOpen] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adminUsers"));
        setAdmins(snapshot.docs.map((d) => d.id));
      } catch {}
    };
    loadAdmins();
  }, []);

  useEffect(() => {
    setSelected(null);
    setThread([]);
  }, [viewFilter]);

  const filtered = messages.filter((m) => {
    const s = (m.status || "").toLowerCase();
    const inView = viewFilter === "inbox" ? ["unopened", "opened"].includes(s) : viewFilter === "resolved" ? ["responded", "closed", "resolved"].includes(s) : ["archived"].includes(s);
    const byStatus = statusFilterLocal ? s === statusFilterLocal : true;
    return inView && byStatus;
  });

  const handleSelectAll = () => {
    setSelectedMessages(selectedMessages.length === filtered.length ? [] : filtered.map((msg) => msg.id));
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    try {
      const repliesSnap = await getDocs(collection(db, `Profiles/${msg.profileId}/Support/${msg.id}/Replies`));
      const replies = repliesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const base = [{ id: "root", sender: "user", message: msg.description, createdAt: msg.createdAt }];
      const toTime = (v) => { const d = normalizeDate(v); return d ? d.getTime() : 0; };
      setThread([...base, ...replies].sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt)));
    } catch {
      setThread([{ id: "root", sender: "user", message: msg.description, createdAt: msg.createdAt }]);
    }
    if (msg.status === "unopened") onStatusChange(msg.profileId, msg.id, "opened");
    onMessageClick?.(msg);
  };

  return (
    <div className="support-module">
      <aside className="support-sidebar">
        <div className="support-sections">
          <button className={`support-tab ${viewFilter==='inbox'?'active':''}`} onClick={() => setViewFilter('inbox')}>Inbox</button>
          <button className={`support-tab ${viewFilter==='resolved'?'active':''}`} onClick={() => setViewFilter('resolved')}>Resolved</button>
          <button className={`support-tab ${viewFilter==='archived'?'active':''}`} onClick={() => setViewFilter('archived')}>Archived</button>
        </div>
        <div className="support-filters">
          <select className="filter-select" value={statusFilterLocal} onChange={(e)=>setStatusFilterLocal(e.target.value)}>
            <option value="">All Status</option>
            <option value="unopened">Unopened</option>
            <option value="opened">Opened</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="inbox-toolbar">
          {selectedMessages.length > 0 && (
            <div className="table-actions">
              <button onClick={() => handleBulkStatusChange('opened')} className="action-button">Mark Opened</button>
              <button onClick={() => handleBulkStatusChange('responded')} className="action-button">Mark Responded</button>
            </div>
          )}
        </div>
        <div className="support-inbox-list">
          <div className="inbox-head">
            <label className="user-select-all">
              <input type="checkbox" checked={selectedMessages.length === filtered.length && filtered.length > 0} onChange={handleSelectAll} />
              <span>Select all</span>
            </label>
          </div>
          <div className="inbox-items">
            {filtered.length === 0 && <div className="no-data">No messages</div>}
            {filtered.map((msg) => {
              const isActive = selected?.id === msg.id;
              return (
                <button key={msg.id} className={`inbox-item ${isActive?'active':''}`} onClick={() => openMessage(msg)}>
                  <div className="inbox-title">{msg.subject || 'No Subject'}</div>
                  <div className="inbox-meta">
                    <span className="inbox-email">{msg.email || 'Unknown'}</span>
                    <span className={`status-badge ${msg.status}`}>{msg.status || 'Unknown'}</span>
                    <span className="inbox-time">{msg.createdAt?.toDate?.().toLocaleDateString?.() || 'N/A'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="support-conversation">
        {!selected ? (
          <div className="no-data">Select a message to view conversation</div>
        ) : (
          <div className="conversation-wrapper">
            <div className="conversation-header">
              <div className="conv-title">{selected.subject || 'No Subject'}</div>
              <div className="conv-actions">
                <select className="role-select" value={assignee || selected.assignedTo || ''} onChange={async (e)=>{ const v=e.target.value; try { await updateDoc(doc(db, `Profiles/${selected.profileId}/Support`, selected.id), { assignedTo: v }); setAssignee(v); } catch {} }}>
                  <option value="">Assign to...</option>
                  {admins.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <select className="status-select" value={selected.status || 'opened'} onChange={(e)=>onStatusChange(selected.profileId, selected.id, e.target.value)}>
                  <option value="unopened">Unopened</option>
                  <option value="opened">Open</option>
                  <option value="responded">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="conversation-body">
              {thread.map((m) => {
                const sender = (m.sender || 'user').toLowerCase();
                const tsDate = normalizeDate(m.createdAt);
                const ts = tsDate ? tsDate.toLocaleString() : '';
                return (
                  <div key={m.id} className={`msg-row ${sender==='admin'?'right':'left'}`}>
                    <div className={`msg-bubble ${sender==='admin'?'admin':'user'}`}>
                      {m.message && <div className="msg-text">{m.message}</div>}
                      {m.attachment && (
                        <a className="msg-attachment" href={m.attachment} target="_blank" rel="noreferrer">Attachment</a>
                      )}
                      <div className="msg-time">{ts}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="reply-box">
              <div className="reply-tools">
                <button className="qa-button" onClick={()=>setCannedOpen(!cannedOpen)}>Canned</button>
                {cannedOpen && (
                  <div className="canned-menu">
                    {["Thanks for reaching out! We're looking into this now.","Can you share more details or a screenshot?","This has been resolved. Please confirm on your side."].map((c) => (
                      <button key={c} className="canned-item" onClick={()=>{ setReplyText(c); setCannedOpen(false); }}>{c}</button>
                    ))}
                  </div>
                )}
                <label className="attach-label">
                  <input type="file" className="attach-input" onChange={(e)=> setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                  Attach
                </label>
              </div>
              <textarea className="reply-input" rows={3} placeholder="Write a reply..." value={replyText} onChange={(e)=>setReplyText(e.target.value)} />
              <div className="reply-actions">
                <button className="action-button" onClick={async ()=>{
                  if (!selected || (!replyText && !attachment)) return;
                  let attachmentUrl = null;
                  try {
                    if (attachment) {
                      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                      const path = `support_attachments/${selected.id}/${attachment.name}`;
                      const storageRef = ref(storage, path);
                      const up = await uploadBytes(storageRef, attachment);
                      attachmentUrl = await getDownloadURL(up.ref);
                    }
                    await addDoc(collection(db, `Profiles/${selected.profileId}/Support/${selected.id}/Replies`), { sender: 'admin', message: replyText, attachment: attachmentUrl, createdAt: serverTimestamp(), agent: auth.currentUser?.email || 'admin' });
                    setReplyText('');
                    setAttachment(null);
                    const repliesSnap = await getDocs(collection(db, `Profiles/${selected.profileId}/Support/${selected.id}/Replies`));
                    const replies = repliesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    const base = [{ id: 'root', sender: 'user', message: selected.description, createdAt: selected.createdAt }];
                    setThread([...base, ...replies]);
                    onStatusChange(selected.profileId, selected.id, 'responded');
                  } catch {}
                }}>Send Reply</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const BlogList = ({ blogs, onDelete, onCreate, onToggleStatus }) => {
  return (
    <div className="table-container">
      <div className="table-actions">
        <button onClick={onCreate} className="action-button">Create New Blog</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">No blogs found</td>
            </tr>
          ) : (
            blogs.map((blog) => {
              const status = (blog.status || 'draft').toLowerCase();
              return (
                <tr key={blog.id}>
                  <td>{blog.title || "Untitled"}</td>
                  <td>{blog.author || "Unknown"}</td>
                  <td>{blog.createdAt?.toDate?.().toLocaleDateString?.() || "N/A"}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-button secondary"
                        onClick={() => onToggleStatus(blog.id, status)}
                      >
                        {status === 'published' ? 'Make Draft' : 'Publish'}
                      </button>
                      <button onClick={() => onDelete(blog.id)} className="action-button delete-button">
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

const BlogSection = ({ blogs, onDelete, onToggleStatus, blogSearchTerm, setBlogSearchTerm, selectedBlogStatus, setSelectedBlogStatus, showBlogDialog, setShowBlogDialog, selectedBlog, setSelectedBlog, onCreate, formatDate }) => {
  const filteredBlogs = blogs.filter((blog) => {
    const term = blogSearchTerm.toLowerCase();
    const matchesSearch = (blog.title || "").toLowerCase().includes(term) ||
      (blog.content || "").toLowerCase().includes(term) ||
      (Array.isArray(blog.tags) && blog.tags.some((t) => (t || "").toLowerCase().includes(term)));
    const status = (blog.status || 'draft').toLowerCase();
    const matchesStatus = selectedBlogStatus === 'all' || status === selectedBlogStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="asset-management-enhanced">
      <div className="asset-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiFileText className="header-icon" />
            Blog Management
          </h2>
          <p className="header-subtitle">Create and manage blog posts</p>
        </div>
        <div className="header-actions">
          <span className="asset-badge-count">{filteredBlogs.length} posts</span>
          <button className="action-button upload-button" onClick={onCreate}>
            <FiPlus className="button-icon" /> Create Blog Post
          </button>
        </div>
      </div>

      <div className="content-card filters-card">
        <div className="card-body">
          <div className="asset-filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={blogSearchTerm}
                onChange={(e) => setBlogSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedBlogStatus}
              onChange={(e) => setSelectedBlogStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">{filteredBlogs.length} results</span>
            </div>
          </div>
        </div>
      </div>

      {filteredBlogs.length > 0 ? (
        <div className="assets-grid">
          {filteredBlogs.map((blog) => {
            const status = (blog.status || 'draft').toLowerCase();
            const img = blog.featuredImage || blog.featuredImageUrl || blog.coverImgUrl || blog.coverImageUrl || blog.thumbnail || '';
            const dateText = formatDate ? formatDate(blog.createdAt) : '';
            const firstTag = Array.isArray(blog.tags) && blog.tags.length > 0 ? blog.tags[0] : 'General';
            return (
              <div key={blog.id || blog._id} className="asset-card">
                <div className="asset-image-wrapper">
                  {img ? (
                    <img src={img} alt={blog.title || 'Blog'} className="asset-image" />
                  ) : (
                    <div className="asset-placeholder"><FiFileText className="placeholder-icon" /></div>
                  )}
                  <div className="asset-badges">
                    <span className={`status-badge ${status === 'published' ? 'active' : 'pending'}`}>{status}</span>
                  </div>
                </div>
                <div className="asset-content">
                  <div className="asset-header-row">
                    <h3 className="asset-title">{blog.title || 'Untitled'}</h3>
                    <div className="asset-menu">
                      <span className="role-badge user">{firstTag}</span>
                    </div>
                  </div>
                  <p className="asset-description">{blog.excerpt || ''}</p>
                  <div className="asset-footer">
                    <span className="asset-author"><FiUser className="author-icon" /> by {blog.authorName || 'Unknown'}</span>
                    <span className="asset-date">{dateText}</span>
                  </div>
                  <div className="table-actions">
                    <button className="action-button secondary" onClick={() => { setSelectedBlog(blog); setShowBlogDialog(true); }}>
                      <FiEye className="button-icon" /> View
                    </button>
                    <button className="action-button secondary" onClick={() => onToggleStatus(blog.id || blog._id, status)}>
                      {status === 'published' ? 'Make Draft' : 'Publish'}
                    </button>
                    <button className="action-button danger" onClick={() => onDelete(blog.id || blog._id)}>
                      <FiTrash2 className="button-icon" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiFileText className="empty-icon" />
            <h3 className="empty-title">No blog posts found</h3>
            <p className="empty-text">{blogSearchTerm ? 'No blog posts match your search criteria.' : 'No blog posts are currently available.'}</p>
            <button className="action-button upload-button" onClick={onCreate}>
              <FiPlus className="button-icon" /> Create First Blog Post
            </button>
          </div>
        </div>
      )}

      {showBlogDialog && selectedBlog && (
        <BlogDetailsModal blog={selectedBlog} onClose={() => setShowBlogDialog(false)} />
      )}
    </div>
  );
};

const BlogDetailsModal = ({ blog, onClose }) => {
  const dateText = blog?.createdAt?.toDate?.()?.toLocaleDateString?.() || '';
  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title"><FiFileText className="modal-icon" /> Blog Post Details</h3>
          <button onClick={onClose} className="close-button"><FiX /></button>
        </div>
        <div className="modal-body enhanced-modal-body">
          {blog?.featuredImage && (
            <div className="asset-preview">
              <img src={blog.featuredImage} alt={blog.title || 'Blog'} className="preview-image" />
            </div>
          )}
          <div className="asset-info-section">
            <h4 className="asset-info-title">{blog?.title || 'Untitled'}</h4>
            <p className="asset-info-description">{blog?.excerpt || ''}</p>
            <div className="asset-info-grid">
              <div className="info-item"><div className="info-label">Author</div><div className="info-value">{blog?.authorName || 'Unknown'}</div></div>
              <div className="info-item"><div className="info-label">Status</div><div className="info-value">{blog?.status || 'draft'}</div></div>
              <div className="info-item"><div className="info-label">Views</div><div className="info-value">{blog?.views || 0}</div></div>
              <div className="info-item"><div className="info-label">Created</div><div className="info-value">{dateText}</div></div>
            </div>
            {Array.isArray(blog?.tags) && blog.tags.length > 0 && (
              <div className="asset-info-section">
                <div className="info-label">Tags</div>
                <div className="usage-list">
                  {blog.tags.map((t, i) => (<span key={i} className="role-badge user">{t}</span>))}
                </div>
              </div>
            )}
          </div>
          <div className="asset-info-section">
            <div className="info-label">Content</div>
            <div className="message-content" dangerouslySetInnerHTML={{ __html: blog?.content || '' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PortfolioList = ({ portfolios, onDelete, onCreate, onToggleFeatured, onUpdateStatus, formatDate }) => {
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState("");
  const [selectedPortfolioCategory, setSelectedPortfolioCategory] = useState("all");
  const [selectedPortfolioStatus, setSelectedPortfolioStatus] = useState("all");
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  const uniqueCategories = Array.from(
    new Set(
      portfolios
        .map((p) => (p.category || p.type || "").toString().trim())
        .filter(Boolean)
    )
  );

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesSearch = (p.title || "").toLowerCase().includes(portfolioSearchTerm.toLowerCase());
    const matchesCategory = selectedPortfolioCategory === "all" || (p.category || p.type) === selectedPortfolioCategory;
    const status = (p.status || "draft").toLowerCase();
    const matchesStatus = selectedPortfolioStatus === "all" || status === selectedPortfolioStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getImage = (p) => p.image || p.coverImgUrl || p.featureImgUrl || p.thumbnail || (Array.isArray(p.images) && p.images[0]) || p.cover || "";

  return (
    <div className="asset-management-enhanced">
      <div className="asset-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBriefcase className="header-icon asset-icon" />
            Portfolio Management
          </h2>
          <p className="header-subtitle">Manage portfolio projects and showcase work</p>
        </div>
        <div className="header-actions">
          <span className="asset-badge-count">{filteredPortfolios.length} projects</span>
          <button className="action-button upload-button" onClick={onCreate}>
            <FiPlus className="button-icon" />
            Add Project
          </button>
        </div>
      </div>

      <div className="content-card filters-card">
        <div className="card-body">
          <div className="asset-filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search portfolio..."
                value={portfolioSearchTerm}
                onChange={(e) => setPortfolioSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedPortfolioCategory}
              onChange={(e) => setSelectedPortfolioCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedPortfolioStatus}
              onChange={(e) => setSelectedPortfolioStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">{filteredPortfolios.length} results</span>
            </div>
          </div>
        </div>
      </div>

      {filteredPortfolios.length === 0 ? (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiBriefcase className="empty-icon" />
            <h3 className="empty-title">No portfolio projects found</h3>
            <p className="empty-text">
              {portfolioSearchTerm ? "No projects match your search criteria." : "No portfolio projects are currently available."}
            </p>
            <button className="action-button upload-button" onClick={onCreate}>
              <FiPlus className="button-icon" />
              Create First Project
            </button>
          </div>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredPortfolios.map((p) => (
            <div key={p.id} className="asset-card">
              <div className="asset-image-wrapper">
                {getImage(p) ? (
                  <img src={getImage(p)} alt={p.title || "Project"} className="asset-image" />
                ) : (
                  <div className="asset-placeholder">
                    <FiImage className="placeholder-icon" />
                  </div>
                )}
                <div className="asset-badges">
                  {p.featured && (
                    <span className="asset-badge featured">
                      <FiStar className="badge-icon" /> Featured
                    </span>
                  )}
                  <span className={`status-badge ${((p.status||"draft").toLowerCase()==='published')? 'active' : 'pending'}`}>
                    {(p.status || "draft")}
                  </span>
                </div>
              </div>

              <div className="asset-content">
                <div className="asset-header-row">
                  <h3 className="asset-title">{p.title || "Untitled"}</h3>
                  <div className="asset-menu">
                    <button
                      className="menu-trigger"
                      onClick={() => { setSelectedPortfolio(p); setShowPortfolioDialog(true); }}
                    >
                      <FiMoreHorizontal />
                    </button>
                  </div>
                </div>

                <p className="asset-description">{p.description || "No description available"}</p>

                <div className="asset-meta">
                  <span className="meta-item">
                    <FiTag className="meta-icon" />
                    {p.category || p.type || "Uncategorized"}
                  </span>
                </div>

                <div className="asset-footer">
                  <span className="asset-author">
                    <FiUser className="author-icon" /> by {p.authorName || p.owner || p.userId || "Unknown"}
                  </span>
                  <span className="asset-date">{formatDate && formatDate(p.createdAt)}</span>
                </div>

                <div className="table-actions">
                  <button
                    className="action-button secondary"
                    onClick={() => onToggleFeatured(p.id)}
                  >
                    <FiStar className="button-icon" /> {p.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => onUpdateStatus(p.id, (p.status||"draft").toLowerCase()==="published"?"draft":"published")}
                  >
                    {(p.status||"draft").toLowerCase()==="published"?"Make Draft":"Publish"}
                  </button>
                  <button className="action-button danger" onClick={() => onDelete(p.id)}>
                    <FiTrash2 className="button-icon" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPortfolioDialog && selectedPortfolio && (
        <PortfolioDetailsModal
          portfolio={selectedPortfolio}
          onClose={() => setShowPortfolioDialog(false)}
        />
      )}
    </div>
  );
};

const PortfolioDetailsModal = ({ portfolio, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title"><FiBriefcase className="modal-icon" /> Portfolio Details</h3>
          <button onClick={onClose} className="close-button"><FiX /></button>
        </div>
        <div className="modal-body enhanced-modal-body">
          <div className="asset-preview">
            {portfolio.image || portfolio.coverImgUrl || portfolio.featureImgUrl ? (
              <img src={portfolio.image || portfolio.coverImgUrl || portfolio.featureImgUrl} alt={portfolio.title} className="preview-image" />
            ) : (
              <div className="preview-placeholder" />
            )}
          </div>
          <div className="asset-info-section">
            <h4 className="asset-info-title">{portfolio.title}</h4>
            <p className="asset-info-description">{portfolio.description || "No description"}</p>

            <div className="asset-info-grid">
              <div className="info-item">
                <div className="info-label">Category</div>
                <div className="info-value">{portfolio.category || portfolio.type || "Uncategorized"}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Author</div>
                <div className="info-value">{portfolio.authorName || portfolio.owner || portfolio.userId || "Unknown"}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Created</div>
                <div className="info-value">{portfolio.createdAt?.toDate?.().toLocaleDateString?.() || "N/A"}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Status</div>
                <div className="info-value">{portfolio.status || "draft"}</div>
              </div>
            </div>

            {Array.isArray(portfolio.technologies) && portfolio.technologies.length > 0 && (
              <div className="asset-info-section">
                <div className="info-label">Technologies</div>
                <div className="usage-list">
                  {portfolio.technologies.map((t, i) => (
                    <span key={i} className="role-badge user">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetList = ({ assets, onDelete, assetSearchTerm, setAssetSearchTerm, selectedCategory, setSelectedCategory, showAssetDialog, setShowAssetDialog, selectedAsset, setSelectedAsset, showCreateAssetDialog, setShowCreateAssetDialog, formatCurrency, formatDate, handleToggleAssetFeatured, handleToggleAssetTrending, ASSET_CATEGORIES }) => {
  return (
    <div className="asset-management-enhanced">
      {/* Header */}
      <div className="asset-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiBox className="header-icon asset-icon" />
            Asset Management
          </h2>
          <p className="header-subtitle">Manage digital assets and content</p>
        </div>
        <div className="header-actions">
          <span className="asset-badge-count">{assets.length} assets</span>
          <button
            className="action-button upload-button"
            onClick={() => setShowCreateAssetDialog(true)}
          >
            <FiUpload className="button-icon" />
            Upload Asset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card filters-card">
        <div className="card-body">
          <div className="asset-filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search assets..."
                value={assetSearchTerm}
                onChange={(e) => setAssetSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {ASSET_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">{assets.length} results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="content-card">
          <div className="card-body empty-state">
            <FiBox className="empty-icon" />
            <h3 className="empty-title">No assets found</h3>
            <p className="empty-text">
              {assetSearchTerm ? "No assets match your search criteria." : "No assets are currently available."}
            </p>
            <button
              className="action-button upload-button"
              onClick={() => setShowCreateAssetDialog(true)}
            >
              <FiUpload className="button-icon" />
              Upload First Asset
            </button>
          </div>
        </div>
      ) : (
        <div className="assets-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="asset-card">
              <div className="asset-image-wrapper">
                {asset.thumbnail || asset.images?.[0] || asset.icons?.[0] ? (
                  <img
                    src={asset.thumbnail || (Array.isArray(asset.images) && asset.images[0]) || (Array.isArray(asset.icons) && asset.icons[0]) || ""}
                    alt={asset.title || asset.name || "Asset"}
                    className="asset-image"
                  />
                ) : (
                  <div className="asset-placeholder">
                    <FiImage className="placeholder-icon" />
                  </div>
                )}

                {/* Asset badges */}
                <div className="asset-badges">
                  {asset.isFeatured && (
                    <span className="asset-badge featured">
                      <FiStar className="badge-icon" />
                      Featured
                    </span>
                  )}
                  {asset.isTrending && (
                    <span className="asset-badge trending">
                      <FiTrendingUp className="badge-icon" />
                      Trending
                    </span>
                  )}
                </div>

                {/* Price badge */}
                <div className="asset-price-badge">
                  <span className={`price-badge ${asset.price > 0 ? 'premium' : 'free'}`}>
                    {asset.price > 0 ? formatCurrency(asset.price) : "Free"}
                  </span>
                </div>
              </div>

              <div className="asset-content">
                <div className="asset-header-row">
                  <h3 className="asset-title">{asset.title || asset.name || "Untitled"}</h3>
                  <div className="asset-menu">
                    <button
                      className="menu-trigger"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowAssetDialog(true);
                      }}
                    >
                      <FiMoreHorizontal />
                    </button>
                  </div>
                </div>

                <p className="asset-description">{asset.description || "No description available"}</p>

                <div className="asset-meta">
                  <span className="meta-item">
                    <FiTag className="meta-icon" />
                    {asset.category || asset.type || "Uncategorized"}
                  </span>
                  <span className="meta-item">
                    <FiDownload className="meta-icon" />
                    {asset.downloads || 0} downloads
                  </span>
                </div>

                <div className="asset-footer">
                  <span className="asset-author">
                    <FiUser className="author-icon" />
                    by {asset.authorName || asset.userId || "Unknown"}
                  </span>
                  <span className="asset-date">{formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Details Modal */}
      {showAssetDialog && selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          onClose={() => setShowAssetDialog(false)}
          onDelete={onDelete}
          onToggleFeatured={handleToggleAssetFeatured}
          onToggleTrending={handleToggleAssetTrending}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Create Asset Modal (Upload component) */}
      {showCreateAssetDialog && (
        <CreateAssetModal
          isOpen={showCreateAssetDialog}
          onClose={() => setShowCreateAssetDialog(false)}
        />
      )}
    </div>
  );
};

const MessageModal = ({ message, onClose, onStatusChange }) => {
  const handleMarkAsOpened = () => {
    if (message.status !== "opened") {
      onStatusChange(message.profileId, message.id, "opened");
    }
  };

  const handleMarkAsResponded = () => {
    onStatusChange(message.profileId, message.id, "responded");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{message.subject || "No Subject"}</h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="message-meta">
            <div>
              <strong>From:</strong> {message.email || "Unknown"}
            </div>
            <div>
              <strong>Date:</strong> {message.createdAt?.toDate().toLocaleString() || "N/A"}
            </div>
            <div className={`status-badge ${message.status}`}>{message.status || "Unknown"}</div>
          </div>
          <div className="message-content">{message.description || "No content"}</div>
        </div>
        <div className="modal-footer">
          <button onClick={handleMarkAsOpened} disabled={message.status === "opened"} className={`action-button ${message.status === "opened" ? "disabled" : ""}`}>
            <FiCheck /> {message.status === "opened" ? "Already Opened" : "Mark as Opened"}
          </button>
          <button onClick={handleMarkAsResponded} disabled={message.status === "responded"} className={`action-button ${message.status === "responded" ? "disabled" : ""}`}>
            <FiCheck /> {message.status === "responded" ? "Already Responded" : "Mark as Responded"}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserList = ({ users, onRoleChange, selectedUsers, setSelectedUsers, handleBulkRoleChange, onUpdateStatus, onDelete, userSearchTerm, setUserSearchTerm, selectedUserRole, setSelectedUserRole, selectedUserStatus, setSelectedUserStatus, showUserDialog, setShowUserDialog, selectedUser, setSelectedUser, formatCurrency, formatDate, getRoleColor, handleUserStatusToggle, handleUserRoleChange }) => {
  const handleSelectUser = (userId) => {
    setSelectedUsers(selectedUsers.includes(userId) ? selectedUsers.filter((id) => id !== userId) : [...selectedUsers, userId]);
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((user) => user.id));
  };

  const [confirm, setConfirm] = useState(null);

  return (
    <div className="user-management-enhanced">
      {/* Header */}
      <div className="user-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiUsers className="header-icon" />
            User Management
          </h2>
          <p className="header-subtitle">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="header-badge">
          <span className="badge-count">{users.length} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card filters-card">
        <div className="card-body">
          <div className="filters-grid">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedUserRole}
              onChange={(e) => setSelectedUserRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            <select
              value={selectedUserStatus}
              onChange={(e) => setSelectedUserStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="filter-result">
              <FiFilter className="filter-icon" />
              <span className="filter-text">{users.length} results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="table-actions">
          <button onClick={() => handleBulkRoleChange("admin")} className="action-button">Make Admin</button>
          <button onClick={() => handleBulkRoleChange("moderator")} className="action-button">Make Moderator</button>
          <button onClick={() => handleBulkRoleChange("user")} className="action-button">Make Regular User</button>
        </div>
      )}

      {/* Users Table */}
      <div className="content-card">
        <div className="card-body table-wrapper">
          {users.length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <h3 className="empty-title">No users found</h3>
              <p className="empty-text">
                {userSearchTerm ? "No users match your search criteria." : "No users are currently registered."}
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table enhanced-user-table">
                <thead>
                  <tr>
                    <th className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Purchases</th>
                    <th>Total Spent</th>
                    <th>Downloads</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const name = user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
                    const status = (user.status || "active").toLowerCase();
                    const isActive = status === "active";
                    return (
                      <tr key={user.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td className="user-cell">
                          <div className="user-profile">
                            <div className="user-avatar">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={name} className="avatar-img" />
                              ) : (
                                <div className="avatar-initials">{(name[0] || "").toUpperCase()}</div>
                              )}
                            </div>
                            <div className="user-info">
                              <div className="user-name">{name}</div>
                              <div className="user-email">{user.email || "Unknown"}</div>
                              {user.location && (
                                <div className="user-location">
                                  <FiMapPin className="location-icon" />
                                  <span>{user.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge enhanced ${user.role || 'user'}`}>
                            {user.role === "admin" && <FiShield className="role-icon" />}
                            {user.role === "moderator" && <FiShield className="role-icon" />}
                            {user.role || "user"}
                          </span>
                        </td>
                        <td>
                          <div className="status-column">
                            <span className={`status-badge enhanced ${isActive ? 'active' : 'inactive'}`}>
                              {isActive ? <FiUserCheck className="status-icon" /> : <FiX className="status-icon" />}
                              {isActive ? "Active" : "Inactive"}
                            </span>
                            {user.isEmailVerified && (
                              <span className="verification-badge">
                                <FiCheckCircle className="verify-icon" />
                                Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="metric-value">{user.totalPurchases || 0}</div>
                        </td>
                        <td>
                          <div className="metric-value currency">{formatCurrency(user.totalSpent || 0)}</div>
                        </td>
                        <td>
                          <div className="metric-value downloads">{user.totalDownloads || 0}</div>
                        </td>
                        <td>
                          <div className="date-column">
                            <div className="join-date">{formatDate(user.createdAt || user.joinDate)}</div>
                            {user.lastLogin && (
                              <div className="last-login">Last: {formatDate(user.lastLogin)}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-menu">
                            <button
                              className="menu-trigger"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDialog(true);
                              }}
                            >
                              <FiMoreHorizontal />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDialog && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowUserDialog(false)}
          onStatusToggle={handleUserStatusToggle}
          onRoleChange={handleUserRoleChange}
          onDelete={onDelete}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getRoleColor={getRoleColor}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.type === 'delete' ? 'Delete User' : confirm.type === 'suspend' ? 'Suspend User' : 'Activate User'}
          message={confirm.type === 'delete' ? 'This action cannot be undone.' : confirm.type === 'suspend' ? 'User will be suspended.' : 'User will be re-activated.'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.type === 'delete') onDelete(confirm.user.id, confirm.user.email);
            if (confirm.type === 'suspend') onUpdateStatus(confirm.user.id, 'suspended');
            if (confirm.type === 'activate') onUpdateStatus(confirm.user.id, 'active');
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
};

const AdminManager = ({ setError }) => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [logType, setLogType] = useState("info");
  const [selectedTargets, setSelectedTargets] = useState(DEFAULT_WIPE_TARGETS);
  const [includeProfiles, setIncludeProfiles] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adminUsers"));
        const adminList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAdmins(adminList);
      } catch (error) {
        setError(`Failed to fetch admin list: ${error.message}`);
      }
    };
    fetchAdmins();
  }, [setError]);

  const addAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) {
      setLogMessage("Email cannot be empty.");
      setLogType("error");
      return;
    }
    try {
      await setDoc(doc(db, "adminUsers", email), {
        addedBy: auth.currentUser?.email || "unknown",
        createdAt: serverTimestamp(),
      });
      setAdmins([...admins, { id: email, addedBy: auth.currentUser?.email, createdAt: new Date() }]);
      setNewAdminEmail("");
      setLogMessage(`Admin ${email} added successfully.`);
      setLogType("success");
    } catch (error) {
      setLogMessage(`Failed to add admin ${email}: ${error.message}`);
      setLogType("error");
    }
  };

  const removeAdmin = async (email) => {
    if (!window.confirm(`Remove admin: ${email}?`)) return;
    try {
      await deleteDoc(doc(db, "adminUsers", email));
      setAdmins(admins.filter((a) => a.id !== email));
      setLogMessage(`Admin ${email} removed successfully.`);
      setLogType("success");
    } catch (error) {
      setLogMessage(`Failed to remove admin ${email}: ${error.message}`);
      setLogType("error");
    }
  };

  const toggleTarget = (name) => {
    setSelectedTargets((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const handleWipe = async () => {
    const collections = includeProfiles ? [...selectedTargets, "Profiles"] : selectedTargets;
    if (!collections.length) { setLogMessage("Select at least one collection to wipe."); setLogType("error"); return; }
    if (!window.confirm(`This will permanently delete data in: ${collections.join(", ")}. Continue?`)) return;
    try {
      const summary = await wipeCollections(collections, { includeProfiles: includeProfiles, keepCurrentProfile: true, allowAdminUsersWipe: false });
      setLogMessage(`Wipe completed: ${Object.entries(summary).map(([k,v]) => `${k}:${v}`).join("; ")}`);
      setLogType("success");
    } catch (e) {
      setLogMessage(`Wipe failed: ${e.message}`);
      setLogType("error");
    }
  };

  const handleSeed = async () => {
    try {
      await seedAll();
      setLogMessage("Seeding completed successfully.");
      setLogType("success");
    } catch (e) {
      setLogMessage(`Seeding failed: ${e.message}`);
      setLogType("error");
    }
  };

  return (
    <div className="admin-manager">
      <h3 className="panel-title">Admin Manager</h3>

      <div className="admin-manager-actions">
        <input
          type="email"
          placeholder="Enter admin email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="admin-input"
        />
        <button onClick={addAdmin} className="action-button">Add Admin</button>
      </div>

      <div className="content-card data-tools-card">
        <div className="card-header">
          <h3 className="panel-title">Data Tools</h3>
        </div>
        <div className="card-body">
          <div className="admin-seed-controls">
            <div className="wipe-options">
              {DEFAULT_WIPE_TARGETS.map((name) => (
                <label key={name} className="role-select wipe-option">
                  <input type="checkbox" checked={selectedTargets.includes(name)} onChange={() => toggleTarget(name)} />
                  <span className="wipe-option-label">{name}</span>
                </label>
              ))}
              <label className="role-select wipe-option">
                <input type="checkbox" checked={includeProfiles} onChange={(e) => setIncludeProfiles(e.target.checked)} />
                <span className="wipe-option-label">Profiles (excludes current)</span>
              </label>
            </div>
            <div className="seed-actions">
              <button className="action-button" onClick={handleWipe}><FiTrash2 /> Wipe Selected</button>
              <button className="action-button" onClick={handleSeed}><FiPlus /> Seed Firestore</button>
            </div>
          </div>
          {logMessage && <div className={`admin-log ${logType === "success" ? "log-success" : logType === 'info' ? 'log-info' : "log-error"}`}>{logMessage}</div>}
        </div>
      </div>

      {logMessage && <div className={`admin-log ${logType === "success" ? "log-success" : "log-error"}`}>{logMessage}</div>}

      <ul className="admin-list">
        {admins.map((admin) => (
          <li key={admin.id} className="admin-list-item">
            <span className="admin-email">{admin.id}</span>
            <button onClick={() => removeAdmin(admin.id)} className="remove-admin">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const normalizeDate = (value) => {
  if (!value) return null;
  if (value.toDate) {
    try { return value.toDate(); } catch { return null; }
  }
  if (value.seconds) return new Date(value.seconds * 1000);
  if (typeof value === "number") return new Date(value);
  if (value instanceof Date) return value;
  return null;
};

const countNewInDays = (items, key, days = 7) => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return items.reduce((acc, it) => {
    const d = normalizeDate(it[key]);
    return acc + (d && d.getTime() >= cutoff ? 1 : 0);
  }, 0);
};

const KPICards = ({ users, admins, messages, blogs, portfolios, assets }) => {
  const newUsers = countNewInDays(users, "createdAt");
  const newMsgs = countNewInDays(messages, "createdAt");
  const newBlogs = countNewInDays(blogs, "createdAt");
  const newAssets = countNewInDays(assets, "createdAt");
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon kpi-users"><FiUsers /></div>
        <div className="kpi-content">
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-label">Total Users</div>
        </div>
        <div className="delta-badge">+{newUsers} this week</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-icon kpi-admins"><FiUser /></div>
        <div className="kpi-content">
          <div className="kpi-value">{admins}</div>
          <div className="kpi-label">Admins</div>
        </div>
        <div className="delta-badge">{admins > 0 ? "Active" : "None"}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-icon kpi-messages"><FiMail /></div>
        <div className="kpi-content">
          <div className="kpi-value">{messages.length}</div>
          <div className="kpi-label">Support Tickets</div>
        </div>
        <div className="delta-badge">+{newMsgs} this week</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-icon kpi-assets"><FiBox /></div>
        <div className="kpi-content">
          <div className="kpi-value">{assets.length}</div>
          <div className="kpi-label">Total Assets</div>
        </div>
        <div className="delta-badge">+{newAssets} this week</div>
      </div>
    </div>
  );
};

const UsageDistribution = ({ assets }) => {
  const counts = assets.reduce((acc, a) => {
    const key = (a.type || "other").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = assets.length || 1;
  return (
    <div className="usage-list">
      {entries.length === 0 && <div className="no-data">No assets yet</div>}
      {entries.map(([type, cnt]) => {
        const pct = Math.round((cnt / total) * 100);
        return (
          <div className="usage-row" key={type}>
            <div className="usage-label">{type}</div>
            <div className="progress">
              <div className="progress-bar" style={{ "--progress-width": `${pct}%` }} />
            </div>
            <div className="usage-value">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
};

const RecentActivity = ({ messages, blogs, portfolios, assets }) => {
  const items = [];
  messages.forEach((m) => items.push({ t: normalizeDate(m.createdAt), type: "Support", label: m.subject || "No Subject" }));
  blogs.forEach((b) => items.push({ t: normalizeDate(b.createdAt), type: "Blog", label: b.title || "Untitled" }));
  portfolios.forEach((p) => items.push({ t: normalizeDate(p.createdAt), type: "Portfolio", label: p.title || "Untitled" }));
  assets.forEach((a) => items.push({ t: normalizeDate(a.createdAt), type: "Asset", label: a.title || a.name || "Untitled" }));
  const recent = items
    .filter((i) => i.t)
    .sort((a, b) => b.t - a.t)
    .slice(0, 6);
  return (
    <ul className="activity-list">
      {recent.length === 0 && <li className="no-data">No recent activity</li>}
      {recent.map((i, idx) => (
        <li key={idx} className="activity-item">
          <span className="activity-type">{i.type}</span>
          <span className="activity-label">{i.label}</span>
          <span className="activity-time">{i.t?.toLocaleDateString?.() || ""}</span>
        </li>
      ))}
    </ul>
  );
};

const QuickActions = ({ onNavigate, onExportCSV, onExportJSON, onExportPDF, isExporting }) => {
  return (
    <div className="quick-actions">
      <button className="qa-button" onClick={() => onNavigate(1)}><FiUsers /> Manage Users</button>
      <button className="qa-button" onClick={() => onNavigate(3)}><FiUpload /> Add Upload</button>
      <button className="qa-button" onClick={() => onNavigate(4)}><FiFileText /> Create Blog</button>
      <button className="qa-button" onClick={() => onNavigate(5)}><FiFileText /> Add Portfolio</button>
      <button className="qa-button" onClick={onExportCSV} disabled={isExporting}><FiDownload /> Export CSV</button>
      <button className="qa-button" onClick={onExportJSON} disabled={isExporting}><FiDownload /> Export JSON</button>
      <button className="qa-button" onClick={onExportPDF} disabled={isExporting}><FiDownload /> Export PDF</button>
    </div>
  );
};

const UserProfileDrawer = ({ user, onClose, onUpdateStatus, onRoleChange }) => {
  const [tab, setTab] = useState('overview');
  const name = user.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
  const status = (user.status || 'active').toLowerCase();
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="avatar large">
            {user.photoURL ? <img src={user.photoURL} alt={name} className="avatar-img" /> : <div className="avatar-initials">{(name[0] || '').toUpperCase()}</div>}
          </div>
          <div className="drawer-title">
            <div className="name">{name}</div>
            <div className="meta">{user.email}</div>
          </div>
          <button className="close-button" onClick={onClose}><FiX /></button>
        </div>
        <div className="tabs">
          <button className={`tab ${tab==='overview'?'active':''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab ${tab==='activity'?'active':''}`} onClick={() => setTab('activity')}>Activity Logs</button>
          <button className={`tab ${tab==='permissions'?'active':''}`} onClick={() => setTab('permissions')}>Permissions</button>
          <button className={`tab ${tab==='settings'?'active':''}`} onClick={() => setTab('settings')}>Settings</button>
        </div>
        <div className="drawer-body">
          {tab === 'overview' && (
            <div className="drawer-section">
              <div className="info-grid">
                <div><div className="label">Role</div><div className="value"><span className={`role-badge ${user.role}`}>{user.role || 'user'}</span></div></div>
                <div><div className="label">Status</div><div className="value"><span className={`status-badge ${status}`}>{status}</span></div></div>
                <div><div className="label">Last Active</div><div className="value">{normalizeDate(user.lastActive)?.toLocaleString?.() || 'N/A'}</div></div>
                <div><div className="label">Joined</div><div className="value">{normalizeDate(user.createdAt)?.toLocaleDateString?.() || 'N/A'}</div></div>
              </div>
            </div>
          )}
          {tab === 'activity' && (
            <div className="drawer-section">
              <ul className="activity-list">
                <li className="activity-item"><span className="activity-type">Login</span><span className="activity-label">Signed in</span><span className="activity-time">��</span></li>
              </ul>
            </div>
          )}
          {tab === 'permissions' && (
            <div className="drawer-section">
              <div className="perm-row">
                <label>Role</label>
                <select className="role-select" value={user.role || 'user'} onChange={(e) => onRoleChange(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="perm-row">
                <label>Status</label>
                <select className="role-select" value={status} onChange={(e) => onUpdateStatus(user.id, e.target.value)}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="banned">Banned</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          )}
          {tab === 'settings' && (
            <div className="drawer-section">
              <div className="perm-row">
                <label>Name</label>
                <input className="admin-input" defaultValue={name} />
              </div>
              <div className="perm-row">
                <label>Email</label>
                <input className="admin-input" defaultValue={user.email} />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const ConfirmModal = ({ title, message, onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onCancel}><FiX /></button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="action-button" onClick={onCancel}>Cancel</button>
          <button className="action-button" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const AssetDetailsModal = ({ asset, onClose, onDelete, onToggleFeatured, onToggleTrending, formatCurrency, formatDate }) => {
  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiBox className="modal-icon" />
            Asset Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body enhanced-modal-body">
          {/* Asset Preview */}
          <div className="asset-preview">
            {asset.thumbnail || asset.images?.[0] || asset.icons?.[0] ? (
              <img
                src={asset.thumbnail || (Array.isArray(asset.images) && asset.images[0]) || (Array.isArray(asset.icons) && asset.icons[0]) || ""}
                alt={asset.title || asset.name || "Asset"}
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <FiImage className="placeholder-icon large" />
              </div>
            )}
          </div>

          {/* Asset Info */}
          <div className="asset-info-section">
            <h3 className="asset-info-title">{asset.title || asset.name || "Untitled"}</h3>
            <p className="asset-info-description">{asset.description || "No description available"}</p>

            <div className="asset-info-grid">
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{asset.category || asset.type || "Uncategorized"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Price</span>
                <span className="info-value">{asset.price > 0 ? formatCurrency(asset.price) : "Free"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Downloads</span>
                <span className="info-value">{asset.downloads || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created</span>
                <span className="info-value">{formatDate(asset.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Author</span>
                <span className="info-value">{asset.authorName || asset.userId || "Unknown"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <div className="status-badges">
                  {asset.isFeatured && <span className="status-badge featured">Featured</span>}
                  {asset.isTrending && <span className="status-badge trending">Trending</span>}
                  {!asset.isFeatured && !asset.isTrending && <span className="status-badge normal">Normal</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              className="action-button secondary"
              onClick={() => onToggleFeatured(asset.id)}
            >
              <FiStar className="button-icon" />
              {asset.isFeatured ? "Remove Featured" : "Mark Featured"}
            </button>

            <button
              className="action-button secondary"
              onClick={() => onToggleTrending(asset.id)}
            >
              <FiTrendingUp className="button-icon" />
              {asset.isTrending ? "Remove Trending" : "Mark Trending"}
            </button>

            <button
              className="action-button danger"
              onClick={() => {
                if (window.confirm(`Delete asset "${asset.title || asset.name}"? This action cannot be undone.`)) {
                  onDelete(asset.id);
                  onClose();
                }
              }}
            >
              <FiTrash2 className="button-icon" />
              Delete Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateAssetModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUpload className="modal-icon" />
            Upload New Asset
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="upload-wrapper">
            {/* This will contain the Upload component */}
            <p className="upload-info">Upload component will be integrated here</p>
            <div className="upload-actions">
              <button className="action-button" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ user, onClose, onStatusToggle, onRoleChange, onDelete, formatCurrency, formatDate, getRoleColor }) => {
  return (
    <div className="modal-overlay">
      <div className="modal enhanced-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUser className="modal-icon" />
            User Details
          </h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body enhanced-modal-body">
          {/* User Profile Header */}
          <div className="user-profile-header">
            <div className="profile-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="avatar-img large" />
              ) : (
                <div className="avatar-initials large">{(user.name?.charAt(0) || "").toUpperCase()}</div>
              )}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{user.name || user.displayName || "Unknown"}</h3>
              <p className="profile-email">{user.email}</p>
              <div className="profile-badges">
                <span className={`role-badge enhanced ${user.role || 'user'}`}>
                  {user.role || "user"}
                </span>
                <span className={`status-badge enhanced ${(user.status || 'active') === 'active' ? 'active' : 'inactive'}`}>
                  {(user.status || 'active') === 'active' ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.totalPurchases || 0}</div>
              <div className="stat-label">
                <FiShoppingCart className="stat-icon" />
                Total Purchases
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value currency">{formatCurrency(user.totalSpent || 0)}</div>
              <div className="stat-label">
                <FiDollarSign className="stat-icon" />
                Total Spent
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value downloads">{user.totalDownloads || 0}</div>
              <div className="stat-label">
                <FiDownload className="stat-icon" />
                Downloads
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.isEmailVerified ? "Yes" : "No"}</div>
              <div className="stat-label">
                <FiCheckCircle className="stat-icon" />
                Email Verified
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="user-details-section">
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Join Date</div>
                <div className="detail-value">
                  <FiCalendar className="detail-icon" />
                  <span>{formatDate(user.createdAt || user.joinDate)}</span>
                </div>
              </div>
              {user.lastLogin && (
                <div className="detail-item">
                  <div className="detail-label">Last Login</div>
                  <div className="detail-value">
                    <FiCalendar className="detail-icon" />
                    <span>{formatDate(user.lastLogin)}</span>
                  </div>
                </div>
              )}
              {user.location && (
                <div className="detail-item">
                  <div className="detail-label">Location</div>
                  <div className="detail-value">
                    <FiMapPin className="detail-icon" />
                    <span>{user.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              className="action-button secondary"
              onClick={() => onStatusToggle(user.id || user._id)}
            >
              {(user.status || 'active') === 'active' ? (
                <>
                  <FiX className="button-icon" />
                  Deactivate
                </>
              ) : (
                <>
                  <FiUserCheck className="button-icon" />
                  Activate
                </>
              )}
            </button>

            {user.role !== "admin" && (
              <>
                <button
                  className="action-button"
                  onClick={() => onRoleChange(user.id || user._id, "admin")}
                >
                  <FiShield className="button-icon" />
                  Make Admin
                </button>
                <button
                  className="action-button danger"
                  onClick={() => {
                    if (window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
                      onDelete(user.id || user._id, user.email);
                      onClose();
                    }
                  }}
                >
                  <FiTrash2 className="button-icon" />
                  Delete User
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeBanner = ({ name, totalUsers, totalAssets }) => {
  return (
    <div className="content-card welcome-banner">
      <div className="card-body">
        <div className="welcome-header">
          <div className="welcome-title">
            <h2 className="welcome-text">Welcome back, {name}! 👋</h2>
            <p className="welcome-sub">Here's what's happening with your marketplace today.</p>
            <div className="welcome-meta">
              <div className="welcome-meta-item">
                <FiActivity className="meta-icon online" />
                <span>System Online</span>
              </div>
              <div className="welcome-meta-item">
                <FiUsers className="meta-icon users" />
                <span>{totalUsers} Users</span>
              </div>
              <div className="welcome-meta-item">
                <FiBox className="meta-icon assets" />
                <span>{totalAssets} Assets</span>
              </div>
            </div>
          </div>
          <div className="welcome-graphic">
            <div className="graphic-circle"><FiActivity /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
