import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  collection,
  getDocs,
  deleteDoc,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";

import { db, auth } from "../../firebase";
import { useUser } from "../Context/UserProvider";
import ListedItemCard from "../Components/UI/ListedItemCard";
import { Helmet } from "react-helmet-async";
// Add these URLs at the top of your Profile.js or in a config file
const CLOUD_FUNCTIONS = {
  addTeamMember: "https://addteammember-xc6vtzxljq-uc.a.run.app",
  autoAcceptTeamInvitation:
    "https://us-central1-sham-marianas.cloudfunctions.net/autoAcceptTeamInvitation",
  getTeamDetails:
    "https://us-central1-sham-marianas.cloudfunctions.net/getTeamDetails",
  getPendingInvitations:
    "https://us-central1-sham-marianas.cloudfunctions.net/getPendingInvitations",
  cancelTeamInvite:
    "https://us-central1-sham-marianas.cloudfunctions.net/cancelTeamInvite",
  removeTeamMember:
    "https://us-central1-sham-marianas.cloudfunctions.net/removeTeamMember",
  checkUserInvitations: "checkUserInvitations", // Callable function
};
const Profile = () => {
  const { username: urlUsername } = useParams();
  const { currentUser } = useUser();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  // ✅ SEO State
  const [seoData, setSeoData] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Add these to your state declarations (around line 60)
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const storage = getStorage();
  const [activeTab, setActiveTab] = useState("profile");
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Subscription states
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);

  const isOwnProfile = currentUser?.uid === userId;

  // ✅ SEO Function - Optimized
  const getProfileSEO = (userData, userItems = []) => {
    if (!userData) return null;

    // Helper function to get display name
    const getDisplayName = () => {
      const firstName = userData.firstName || userData.firstname || "";
      const lastName = userData.lastName || userData.lastname || "";

      if (firstName && lastName) {
        return `${firstName} ${lastName}`.trim();
      } else if (firstName) {
        return firstName.trim();
      } else if (lastName) {
        return lastName.trim();
      }

      if (userData.fullName && userData.fullName.trim()) {
        return userData.fullName.trim();
      }

      if (userData.username && userData.username.trim()) {
        return userData.username.trim();
      }

      if (userData.displayName && userData.displayName.trim()) {
        return userData.displayName.trim();
      }

      if (userData.email) {
        const emailName = userData.email.split("@")[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }

      return "User";
    };

    const displayName = getDisplayName();
    const username = userData.username || "";
    const userBio = userData.bio || userData.about || "";

    // Generate SEO title
    const getTitle = () => {
      if (username) {
        return `${displayName}`;
      }
      return `${displayName}`;
    };

    // Generate SEO description
    const getDescription = () => {
      if (userBio && userBio.trim()) {
        const plainText = userBio
          .replace(/<[^>]*>/g, "")
          .replace(/\n/g, " ")
          .trim();

        if (plainText.length > 150) {
          return plainText.substring(0, 150) + "...";
        }
        return plainText;
      }

      // Default description based on user stats
      const itemsCount = userItems.length;
      const followerCount = userData.followersCount || 0;

      let baseDescription = `${displayName}'s profile`;

      if (itemsCount > 0) {
        baseDescription += ` with ${itemsCount} digital assets`;
      }

      if (followerCount > 0) {
        baseDescription += ` | ${followerCount} followers`;
      }

      return `${baseDescription} on Shammarianas. View portfolio, 3D models, videos, and creative resources.`;
    };

    // Generate SEO keywords
    const getKeywords = () => {
      const baseKeywords = [
        displayName,
        "Shammarianas",
        "Digital Portfolio",
        "Creative Profile",
      ];

      // Add username if available
      if (username) {
        baseKeywords.push(`@${username}`);
      }

      // Add user skills
      if (userData.skills && Array.isArray(userData.skills)) {
        baseKeywords.push(...userData.skills.slice(0, 3));
      }

      // Add user role/specialization
      if (userData.role) {
        baseKeywords.push(userData.role);
      }

      if (userData.specialization) {
        baseKeywords.push(userData.specialization);
      }

      // Add categories from user's items
      if (userItems.length > 0) {
        const categories = [...new Set(userItems.map((item) => item.type))];
        categories.slice(0, 3).forEach((category) => {
          baseKeywords.push(`${category} creator`);
        });
      }

      // Add location if available
      if (userData.location) {
        baseKeywords.push(userData.location);
      }

      // Remove empty keywords and limit to 15
      return [...new Set(baseKeywords.filter((k) => k && k.trim()))]
        .slice(0, 15)
        .join(", ");
    };

    // Get profile image URL
    const getProfileImage = () => {
      if (userData.profilePic) return userData.profilePic;
      if (userData.avatar) return userData.avatar;
      return "/assets/imgs/default-profile.jpg";
    };

    // Get canonical URL
    const getCanonicalUrl = () => {
      if (username) {
        return `https://www.shammarianas.com/profile/${username}`;
      }
      if (userData.id) {
        return `https://www.shammarianas.com/profile/${userData.id}`;
      }
      return `https://www.shammarianas.com/profile`;
    };

    return {
      title: getTitle(),
      description: getDescription(),
      keywords: getKeywords(),
      canonical: getCanonicalUrl(),
      ogImage: getProfileImage(),
      twitterImage: getProfileImage(),
      ogType: "profile",
      twitterCard: "summary_large_image",
      // Additional structured data for profiles
      profile: {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: username,
        gender: userData.gender || "",
        location: userData.location || "",
        jobTitle: userData.role || "",
        worksFor: userData.company || "",
        joinedDate: userData.createdAt
          ? userData.createdAt.toDate
            ? userData.createdAt.toDate().toISOString()
            : userData.createdAt
          : new Date().toISOString(),
      },
    };
  };

  // ✅ Loading SEO for initial state
  const getLoadingSEO = () => ({
    title: "Loading Profile | Shammarianas",
    description: "Loading user profile information...",
    keywords: "profile, user, loading, Shammarianas",
    ogImage: "/assets/imgs/default-profile.jpg",
    twitterImage: "/assets/imgs/default-profile.jpg",
  });

  // ✅ Update SEO when user data or items change
  useEffect(() => {
    if (user) {
      const seo = getProfileSEO(user, items);
      setSeoData(seo);
    }
  }, [user, items]);

  useEffect(() => {
    const findUserByUsername = async () => {
      if (!urlUsername) return;

      const decodedUsername = decodeURIComponent(urlUsername);
      console.log("Finding user with username:", decodedUsername);
      setLoading(true);

      try {
        const searchVariations = [
          decodedUsername,
          decodedUsername.replace(/-/g, " "),
          decodedUsername.replace(/-/g, " ").toLowerCase(),
          decodedUsername.toLowerCase(),
          decodedUsername.replace(/-/g, ""),
        ];

        let foundUser = null;
        let foundUserId = null;
        let foundInCollection = null;

        for (const variation of searchVariations) {
          let q = query(
            collection(db, "Profiles"),
            where("username", "==", variation)
          );
          let querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            foundUser = userDoc.data();
            foundUserId = userDoc.id;
            foundInCollection = "Profiles";
            break;
          }

          q = query(
            collection(db, "Profiles"),
            where("username_lowercase", "==", variation.toLowerCase())
          );
          querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            foundUser = userDoc.data();
            foundUserId = userDoc.id;
            foundInCollection = "Profiles";
            break;
          }
        }

        if (!foundUser) {
          for (const variation of searchVariations) {
            let q = query(
              collection(db, "Contributors"),
              where("username", "==", variation)
            );
            let querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              foundUser = userDoc.data();
              foundUserId = userDoc.id;
              foundInCollection = "Contributors";
              break;
            }

            q = query(
              collection(db, "Contributors"),
              where("username_lowercase", "==", variation.toLowerCase())
            );
            querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              foundUser = userDoc.data();
              foundUserId = userDoc.id;
              foundInCollection = "Contributors";
              break;
            }
          }
        }

        if (foundUser) {
          setUserId(foundUserId);
          if (foundInCollection === "Contributors") {
            setUser({
              username:
                foundUser.username || foundUser.displayName || "Contributor",
              profilePic:
                foundUser.profilePic ||
                "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png",
              ...foundUser,
            });
          } else {
            setUser(foundUser);
          }
          setLoading(false);
          return;
        }

        setUserId(null);
        setUser(null);
        setLoading("not_found");
      } catch (error) {
        console.error("Error finding user:", error);
        setLoading("error");
      }
    };

    findUserByUsername();
  }, [urlUsername]);

  // Fetch subscription data
  useEffect(() => {
    if (isOwnProfile && userId) {
      fetchTeamDetails();
    }
  }, [isOwnProfile, userId]);

  const fetchTeamDetails = async () => {
    if (!isOwnProfile || !userId) return;

    try {
      setLoadingSubscription(true);

      // First, get the user's profile to check subscription
      const profileRef = doc(db, "Profiles", userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        console.log("❌ User profile not found");
        setSubscription(null);
        return;
      }

      const profileData = profileSnap.data();
      const userSubscription = profileData.subscription || {};

      console.log("📄 User subscription from Profile:", userSubscription);

      // If user is not on a team plan, just show individual subscription
      if (userSubscription.type !== "team") {
        console.log("ℹ️ User is on individual plan");
        setSubscription({
          ...userSubscription,
          subscriptionType: userSubscription.type || "individual",
          billingCycle: userSubscription.billingCycle || "monthly",
          plan: userSubscription.plan || "individual",
          status: userSubscription.status || "inactive",
          price: userSubscription.price || 0,
          expiresAt: userSubscription.expiresAt,
          startDate: userSubscription.startDate,
          downloadLimit: userSubscription.downloadLimit || 200,
          downloadsUsed: userSubscription.downloadsUsed || 0,
        });
        setTeamMembers([]);
        setPendingInvites([]);
        return;
      }

      // If user is on team plan, fetch team details
      if (userSubscription.teamId) {
        // Try to get team details from Cloud Function first
        try {
          const idToken = await auth.currentUser.getIdToken();
          console.log(
            "🔍 Fetching team details for team:",
            userSubscription.teamId
          );

          const response = await fetch(CLOUD_FUNCTIONS.getTeamDetails, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          console.log("📊 Cloud Function response status:", response.status);

          if (response.ok) {
            const result = await response.json();
            console.log("✅ Cloud Function result:", result);

            if (result.success) {
              // Combine user subscription with team data
              const combinedSubscription = {
                // User's personal subscription data
                ...userSubscription,
                subscriptionType: userSubscription.type || "team",
                billingCycle: userSubscription.billingCycle || "monthly",
                plan: userSubscription.plan || "team",
                status: userSubscription.status || "active",
                price: userSubscription.price || 0,
                expiresAt: userSubscription.expiresAt,
                startDate: userSubscription.startDate,
                downloadLimit: userSubscription.downloadLimit || 200,
                downloadsUsed: userSubscription.downloadsUsed || 0,
                totalDownloads: userSubscription.totalDownloads || 0,
                teamId: userSubscription.teamId,
                monthlyReset: userSubscription.monthlyReset,

                // Team data from Cloud Function
                team: result.team,
                members: result.members || [],
                pendingInvites: result.pendingInvites || [],
                userRole: result.userRole || "member",

                // Calculated fields
                availableSlots: result.team?.availableSlots || 0,
                memberLimit: result.team?.memberLimit || 2,
                currentMembers: result.members?.length || 1,
                perMemberPrice: result.team?.perMemberPrice || 7,
                downloadsPerMember: result.team?.downloadsPerMember || 200,
                totalTeamDownloads: result.team?.totalDownloads || 0,
                totalDownloadsUsed: result.team?.totalDownloadsUsed || 0,
              };

              console.log(
                "📊 Combined subscription data:",
                combinedSubscription
              );
              setSubscription(combinedSubscription);
              setTeamMembers(result.members || []);
              setPendingInvites(result.pendingInvites || []);
              return;
            }
          } else {
            console.warn(
              "⚠️ Cloud Function failed, falling back to direct Firestore"
            );
          }
        } catch (cloudError) {
          console.error("❌ Cloud Function error:", cloudError);
        }

        // Fallback: Get team data directly from Firestore
        console.log("🔄 Falling back to direct Firestore team data");
        const teamRef = doc(db, "Teams", userSubscription.teamId);
        const teamSnap = await getDoc(teamRef);

        if (teamSnap.exists()) {
          const teamData = teamSnap.data();
          console.log("🏢 Team data from Firestore:", teamData);

          // Get all team members' profiles
          const memberPromises = (teamData.members || []).map(
            async (memberId) => {
              const memberProfileRef = doc(db, "Profiles", memberId);
              const memberProfileSnap = await getDoc(memberProfileRef);
              if (memberProfileSnap.exists()) {
                const memberProfile = memberProfileSnap.data();
                return {
                  id: memberId,
                  email: memberProfile.email,
                  name:
                    memberProfile.name ||
                    `${memberProfile.firstName || ""} ${
                      memberProfile.lastName || ""
                    }`.trim(),
                  role: memberId === teamData.ownerId ? "owner" : "member",
                  joinedAt: memberProfile.joinDate || memberProfile.createdAt,
                  profilePic: memberProfile.profilePic,
                  downloadsUsed: teamData.memberDownloads?.[memberId] || 0,
                  downloadLimit: teamData.downloadsPerMember || 200,
                };
              }
              return null;
            }
          );

          const members = (await Promise.all(memberPromises)).filter(Boolean);

          // Get pending invites
          const invitesQuery = await getDocs(
            query(
              collection(db, "TeamInvites"),
              where("teamId", "==", userSubscription.teamId),
              where("status", "==", "pending")
            )
          );

          const invites = [];
          invitesQuery.forEach((doc) => {
            invites.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          // Calculate available slots (memberLimit - 1 for owner)
          const maxInvitableMembers = teamData.memberLimit - 1;
          const availableSlots = Math.max(
            0,
            maxInvitableMembers - (members.length - 1)
          );

          const combinedSubscription = {
            // User's personal subscription data
            ...userSubscription,
            subscriptionType: userSubscription.type || "team",
            billingCycle: userSubscription.billingCycle || "monthly",
            plan: userSubscription.plan || "team",
            status: userSubscription.status || "active",
            price: userSubscription.price || 0,
            expiresAt: userSubscription.expiresAt,
            startDate: userSubscription.startDate,
            downloadLimit: userSubscription.downloadLimit || 200,
            downloadsUsed: userSubscription.downloadsUsed || 0,
            totalDownloads: userSubscription.totalDownloads || 0,
            teamId: userSubscription.teamId,
            monthlyReset: userSubscription.monthlyReset,

            // Team data
            team: teamData,
            members: members,
            pendingInvites: invites,
            userRole: teamData.ownerId === userId ? "owner" : "member",

            // Calculated fields
            availableSlots: availableSlots,
            memberLimit: teamData.memberLimit || 2,
            currentMembers: members.length,
            perMemberPrice: teamData.perMemberPrice || 7,
            downloadsPerMember: teamData.downloadsPerMember || 200,
            totalTeamDownloads: teamData.totalDownloads || 0,
            totalDownloadsUsed: teamData.totalDownloadsUsed || 0,
          };

          console.log(
            "📊 Combined subscription data (fallback):",
            combinedSubscription
          );
          setSubscription(combinedSubscription);
          setTeamMembers(members);
          setPendingInvites(invites);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching team details:", error);
      setSubscription(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const fetchPendingInvites = async () => {
    if (!userId) return;

    try {
      const invitesRef = collection(db, "TeamInvites");
      const q = query(
        invitesRef,
        where("ownerId", "==", userId),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);

      const invites = [];
      querySnapshot.forEach((doc) => {
        invites.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setPendingInvites(invites);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
    }
  };

  const inviteTeamMember = async () => {
    if (!inviteEmail || !userId) return;

    try {
      setInviting(true);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        alert("Please enter a valid email address");
        return;
      }

      if (inviteEmail === currentUser.email) {
        alert("You cannot invite yourself");
        return;
      }

      // Get the current user's token
      const idToken = await auth.currentUser.getIdToken();

      // Call the Cloud Function with only memberEmail
      const response = await fetch(CLOUD_FUNCTIONS.addTeamMember, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          memberEmail: inviteEmail, // Only send memberEmail, not teamId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to add team member");
      }

      // For local testing - show direct link
      if (process.env.NODE_ENV === "development" || result.directLink) {
        console.log(
          "📧 Local Testing - Direct Invite Link:",
          result.directLink
        );
        alert(
          `For local testing, use this direct link:\n${result.directLink}\n\nOr invitation code: ${result.inviteCode}`
        );
      } else {
        alert(`Invitation sent to ${inviteEmail}`);
      }

      setInviteEmail("");

      // Refresh data
      fetchTeamDetails();
    } catch (error) {
      console.error("Error inviting team member:", error);
      alert(error.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const removeTeamMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this team member?"))
      return;

    try {
      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(CLOUD_FUNCTIONS.removeTeamMember, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          teamId: subscription.teamId,
          memberId: memberId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTeamMembers((prev) =>
          prev.filter((member) => member.id !== memberId)
        );
        alert("Team member removed successfully");
      } else {
        throw new Error(
          result.error?.message || "Failed to remove team member"
        );
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      alert(error.message || "Failed to remove team member");
    }
  };

  const cancelInvite = async (inviteId) => {
    try {
      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(CLOUD_FUNCTIONS.cancelTeamInvite, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          inviteId: inviteId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPendingInvites((prev) =>
          prev.filter((invite) => invite.id !== inviteId)
        );
        alert("Invitation cancelled");
      } else {
        throw new Error(result.error?.message || "Failed to cancel invitation");
      }
    } catch (error) {
      console.error("Error cancelling invite:", error);
      alert("Failed to cancel invitation");
    }
  };

  const formatSubscriptionStatus = (status) => {
    if (!status) return { text: "Free Plan", class: "free" };

    switch (status.toLowerCase()) {
      case "active":
        return { text: "Active", class: "active" };
      case "canceled":
      case "cancelled":
        return { text: "Cancelled", class: "canceled" };
      case "past_due":
        return { text: "Past Due", class: "past-due" };
      case "trialing":
        return { text: "Free Trial", class: "trialing" };
      case "incomplete":
        return { text: "Incomplete", class: "incomplete" };
      default:
        return { text: "Inactive", class: "inactive" };
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      const timestamp = date.toDate ? date.toDate() : new Date(date);
      return timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getSubscriptionTypeDisplay = (type) => {
    switch (type) {
      case "individual":
        return "Individual";
      case "team":
        return "Team";
      case "enterprise":
        return "Enterprise";
      default:
        return "Free";
    }
  };

  const cancelSubscription = async () => {
    if (
      !subscription ||
      !window.confirm(
        "Are you sure you want to cancel your subscription?\n\n" +
          "You will continue to have access until the end of your current billing period."
      )
    )
      return;

    try {
      const profileRef = doc(db, "Profiles", userId);

      await updateDoc(profileRef, {
        "subscription.status": "cancelled",
        "subscription.cancelledAt": Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setSubscription((prev) => ({
        ...prev,
        status: "cancelled",
        cancelledAt: Timestamp.now(),
      }));

      alert("Subscription cancelled successfully");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription");
    }
  };

  // Username availability check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      const trimmedUsername = username.trim().toLowerCase();

      if (trimmedUsername.length < 3) {
        setUsernameAvailable(false);
        return;
      }

      if (trimmedUsername === user?.username?.toLowerCase()) {
        setUsernameAvailable(true);
        return;
      }

      try {
        setCheckingUsername(true);
        const usernameQuery = query(
          collection(db, "Profiles"),
          where("username", "==", trimmedUsername)
        );
        const querySnapshot = await getDocs(usernameQuery);

        const isAvailable = querySnapshot.empty;
        setUsernameAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timer = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  // Real-time user listener
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "Profiles", userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser((prevUser) => ({
            ...prevUser,
            ...data,
          }));

          // ✅ Update SEO when user data changes
          const seo = getProfileSEO({ ...data, id: userId }, items);
          setSeoData(seo);

          if (currentUser && currentUser.uid === userId) {
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setUsername(data.username || "");
            setPhoneNumber(data.phoneNumber || "");
            setBio(data.bio || "");
            if (data.subscription) {
              const subData = data.subscription;
              setSubscription({
                ...subData,
                subscriptionType: subData.type || subData.plan || "individual",
                billingCycle: subData.billingCycle || "monthly",
                price: subData.price || 0,
                status: subData.status || "active",
              });
            }
          }

          if (currentUser && currentUser.uid && data.followers) {
            setIsFollowing(data.followers.includes(currentUser.uid));
          } else {
            setIsFollowing(false);
          }
        } else {
          setUser(null);
          setIsFollowing(false);
        }
      },
      (error) => {
        console.error("Error in real-time listener:", error);
      }
    );

    return () => unsubscribe();
  }, [userId, currentUser]);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      if (!userId) return;

      try {
        const itemsQuery = query(
          collection(db, "Assets"),
          where("userId", "==", userId)
        );
        const snapshot = await getDocs(itemsQuery);
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsData);
        setLoading(false);
        // ✅ Update SEO with new items
        if (user) {
          const seo = getProfileSEO(user, itemsData);
          setSeoData(seo);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setLoading("error");
      }
    };

    fetchItems();
  }, [userId]);

  const getDisplayName = () => {
    if (!user) return "User";

    const firstName = user.firstName || user.firstname || user.first_name;
    const lastName = user.lastName || user.lastname || user.last_name;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      return firstName.trim();
    } else if (lastName) {
      return lastName.trim();
    }

    if (user.fullName && user.fullName.trim()) {
      return user.fullName.trim();
    }

    if (user.displayUsername && user.displayUsername.trim()) {
      return user.displayUsername.trim();
    }

    if (user.username && user.username.trim()) {
      return user.username.trim();
    }

    if (user.displayName && user.displayName.trim()) {
      return user.displayName.trim();
    }

    if (user.authorName && user.authorName.trim()) {
      return user.authorName.trim();
    }

    if (user.email) {
      const emailName = user.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return "User";
  };

  const getInitials = () => {
    if (!user) return "U";

    const firstNameInitial = user.firstName
      ? user.firstName.charAt(0).toUpperCase()
      : "";
    const lastNameInitial = user.lastName
      ? user.lastName.charAt(0).toUpperCase()
      : "";
    const usernameInitial = user.username
      ? user.username.charAt(0).toUpperCase()
      : "";

    if (firstNameInitial && lastNameInitial) {
      return firstNameInitial + lastNameInitial;
    } else if (firstNameInitial) {
      return firstNameInitial;
    } else if (usernameInitial) {
      return usernameInitial;
    }
    return "U";
  };

  const followUser = async () => {
    if (!user || !currentUser || !userId) {
      alert("Please login to follow this user");
      return;
    }

    if (currentUser.uid === userId) {
      alert("You cannot follow yourself");
      return;
    }

    try {
      const userRef = doc(db, "Profiles", userId);
      const followerRef = doc(db, "Profiles", currentUser.uid);

      const [userDoc, followerDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(followerRef),
      ]);

      if (userDoc.exists() && followerDoc.exists()) {
        const userData = userDoc.data();
        const followerData = followerDoc.data();

        let userFollowers = userData.followers || [];
        let followerFollowing = followerData.following || [];

        const isCurrentlyFollowing = userFollowers.includes(currentUser.uid);

        if (isCurrentlyFollowing) {
          userFollowers = userFollowers.filter(
            (uid) => uid !== currentUser.uid
          );
          followerFollowing = followerFollowing.filter((uid) => uid !== userId);
          setIsFollowing(false);
        } else {
          if (!userFollowers.includes(currentUser.uid)) {
            userFollowers.push(currentUser.uid);
          }
          if (!followerFollowing.includes(userId)) {
            followerFollowing.push(userId);
          }
          setIsFollowing(true);
        }

        await Promise.all([
          updateDoc(userRef, {
            followers: userFollowers,
            followersCount: userFollowers.length,
          }),
          updateDoc(followerRef, {
            following: followerFollowing,
            followingCount: followerFollowing.length,
          }),
        ]);

        alert(
          isCurrentlyFollowing
            ? "Unfollowed successfully!"
            : "Followed successfully!"
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
      alert("Failed to follow/unfollow user. Please try again.");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        alert("Please select an image file (jpg, png, gif, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setShowImageUploadModal(true);
    }
  };

  const uploadProfileImage = async () => {
    if (!selectedImage || !isOwnProfile || !currentUser || !userId) return;

    try {
      setUploadingImage(true);

      const storageRef = ref(
        storage,
        `profile-images/${currentUser.uid}/${Date.now()}_${selectedImage.name}`
      );
      await uploadBytes(storageRef, selectedImage);

      const downloadURL = await getDownloadURL(storageRef);

      const profileRef = doc(db, "Profiles", userId);
      await updateDoc(profileRef, {
        profilePic: downloadURL,
        updatedAt: new Date(),
      });

      setSelectedImage(null);
      setImagePreview(null);
      setShowImageUploadModal(false);

      alert("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProfileImage = async () => {
    if (!isOwnProfile || !userId) return;

    try {
      const confirmed = window.confirm(
        "Are you sure you want to remove your profile image?"
      );
      if (!confirmed) return;

      const profileRef = doc(db, "Profiles", userId);
      await updateDoc(profileRef, {
        profilePic: null,
        updatedAt: new Date(),
      });

      alert("Profile image removed successfully!");
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image. Please try again.");
    }
  };

  const handleSaveAccount = async () => {
    if (!isOwnProfile || !userId) return;
    const trimmedUsername = (username || "").trim().toLowerCase();

    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (!trimmedUsername) {
      alert("Username is required!");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      alert(
        "Username can only contain letters, numbers, dots, hyphens, and underscores!"
      );
      return;
    }

    if (trimmedUsername.length < 3) {
      alert("Username must be at least 3 characters long!");
      return;
    }

    if (trimmedUsername.length > 20) {
      alert("Username must be less than 20 characters!");
      return;
    }

    if (trimmedUsername === user?.username?.toLowerCase()) {
      // Username hasn't changed
    } else {
      try {
        const usernameQuery = query(
          collection(db, "Profiles"),
          where("username", "==", trimmedUsername)
        );
        const querySnapshot = await getDocs(usernameQuery);

        let usernameExists = false;
        querySnapshot.forEach((doc) => {
          if (doc.id !== userId) {
            usernameExists = true;
          }
        });

        if (usernameExists) {
          alert("This username is already taken. Please choose another one.");
          return;
        }
      } catch (error) {
        console.error("Error checking username:", error);
        alert("Error checking username availability. Please try again.");
        return;
      }
    }

    try {
      setSaving(true);
      const profileRef = doc(db, "Profiles", userId);
      const snap = await getDoc(profileRef);

      let updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: trimmedUsername,
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
        updatedAt: new Date(),
      };

      if (snap.exists()) {
        const d = snap.data();
        let changeCount = d.usernameChangeCount || 0;
        let changeYear = d.usernameChangeYear || new Date().getFullYear();

        if (d.username?.toLowerCase() !== trimmedUsername) {
          const nowYear = new Date().getFullYear();
          if (changeYear !== nowYear) {
            changeYear = nowYear;
            changeCount = 0;
          }
          if (changeCount >= 3) {
            alert(
              "You have reached the maximum of 3 username changes this year."
            );
            setSaving(false);
            return;
          }
          updates.usernameChangeCount = changeCount + 1;
          updates.usernameChangeYear = changeYear;
        }

        await updateDoc(profileRef, updates);
      } else {
        updates.uid = currentUser.uid;
        updates.createdAt = new Date();
        updates.usernameChangeCount = 0;
        updates.usernameChangeYear = new Date().getFullYear();
        updates.followers = [];
        updates.following = [];
        updates.followersCount = 0;
        updates.followingCount = 0;
        await setDoc(profileRef, updates);
      }

      setNewPassword("");
      setConfirmPassword("");
      alert("Changes saved successfully!");
    } catch (e) {
      alert(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isOwnProfile) return;

    try {
      const user = auth.currentUser;
      const providerId = user.providerData[0]?.providerId;

      if (providerId === "password") {
        const password = prompt(
          "To permanently delete your account, please enter your password:"
        );
        if (!password) {
          alert("Password is required.");
          return;
        }

        const confirmed = window.confirm(
          "Are you sure? This action CANNOT be undone!"
        );
        if (!confirmed) return;

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else {
        alert(
          `Account deletion for ${providerId} login is not supported. Please use your original provider to reauthenticate.`
        );
        return;
      }

      const subcollections = ["favorites", "downloads"];
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, "Profiles", userId, sub));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, "Profiles", userId, sub, docSnap.id));
        }
      }

      await deleteDoc(doc(db, "Profiles", userId));

      const profileQuery = query(collection(db, "Profiles"));
      const usersSnap = await getDocs(profileQuery);

      for (const u of usersSnap.docs) {
        const data = u.data();
        if (data.followers?.includes(userId)) {
          await updateDoc(doc(db, "Profiles", u.id), {
            followers: data.followers.filter((f) => f !== userId),
            followersCount: data.followersCount ? data.followersCount - 1 : 0,
          });
        }
        if (data.following?.includes(userId)) {
          await updateDoc(doc(db, "Profiles", u.id), {
            following: data.following.filter((f) => f !== userId),
            followingCount: data.followingCount ? data.followingCount - 1 : 0,
          });
        }
      }

      await deleteUser(user);
      alert("Your account has been permanently deleted.");
      navigate("/templates", { replace: true });
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        alert("The password you entered is incorrect.");
      } else {
        alert("Failed to delete account: " + err.message);
      }
    }
  };

  const handleActivateAccount = async () => {
    if (!isOwnProfile) return;

    try {
      const profileRef = doc(db, "Profiles", userId);
      await updateDoc(profileRef, { status: "active" });
      alert("Your account has been activated.");
    } catch (err) {
      alert("Failed to activate: " + err.message);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!isOwnProfile) return;

    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? You can reactivate it later by logging in."
    );
    if (!confirmed) return;

    try {
      const profileRef = doc(db, "Profiles", userId);
      await updateDoc(profileRef, { status: "deactivated" });
      alert("Your account has been deactivated.");
      await auth.signOut();
      navigate("/templates", { replace: true });
    } catch (err) {
      alert("Failed to deactivate: " + err.message);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setUsername(user?.username || "");
    setPhoneNumber(user?.phoneNumber || "");
    setBio(user?.bio || "");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleOpenBillingModal = () => {
    setShowBillingModal(true);
  };

  const handleCloseBillingModal = () => {
    setShowBillingModal(false);
  };

  const handleCloseImageUploadModal = () => {
    setShowImageUploadModal(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* ✅ SEO Component - Replace Helmet */}
      {seoData ? <SEO {...seoData} /> : <SEO {...getLoadingSEO()} />}

      {/* <Helmet>
        <title>{getDisplayName()} | shammarianas</title>
        <meta
          name="description"
          content={`View ${getDisplayName()}'s profile on shammarianas`}
        />
        <meta
          property="og:title"
          content={`${getDisplayName()} | shammarianas`}
        />
        <meta
          property="og:description"
          content={`View ${getDisplayName()}'s profile on shammarianas`}
        />
        <meta
          property="og:image"
          content={
            user?.profilePic ||
            `https://avatar.iran.liara.run/username?username=${getInitials()}`
          }
        />
        <meta
          property="og:url"
          content={`https://shammarianas.vercel.app/#/profile/${userId}`}
        />
        <meta
          name="twitter:title"
          content={`${getDisplayName()} | shammarianas`}
        />
        <meta
          name="twitter:description"
          content={`View ${getDisplayName()}'s profile on shammarianas`}
        />
        <meta
          name="twitter:image"
          content={
            user?.profilePic ||
            `https://avatar.iran.liara.run/username?username=${getInitials()}`
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="canonical"
          href={`https://shammarianas.me/#/${user?.username}`}
        />
      </Helmet> */}

      {/* Billing History Modal */}
      {showBillingModal && (
        <div className="modal-overlay" onClick={handleCloseBillingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Billing history</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseBillingModal}
              >
                <i className="icon fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="empty-billing-state">
                <div className="empty-icon">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <h3>No invoices yet</h3>
                <p>
                  You don't have any invoices available yet
                  <br />
                  Once your first invoice is generated, you'll be able to view
                  it here.
                </p>
                <div className="empty-actions">
                  <p className="support-note">
                    If you think this is an error or need more information,
                    please contact us.
                  </p>
                  <button className="butn butn-sm butn-bg main-colorbg radius-5">
                    <i className="icon fas fa-headset"></i>
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div className="modal-overlay" onClick={handleCloseImageUploadModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Profile Image</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseImageUploadModal}
              >
                <i className="icon fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="image-upload-preview">
                {imagePreview && (
                  <div className="preview-image">
                    <img loading="lazy" src={imagePreview} alt="Preview" />
                  </div>
                )}
                <div className="upload-actions">
                  <button
                    className="butn butn-sm butn-bg main-colorbg radius-5"
                    onClick={uploadProfileImage}
                    disabled={uploadingImage || !selectedImage}
                  >
                    <i className="icon fas fa-upload"></i>
                    <span>
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </span>
                  </button>
                  <button
                    className="butn butn-sm butn-bord radius-5"
                    onClick={handleCloseImageUploadModal}
                    disabled={uploadingImage}
                  >
                    <span>Cancel</span>
                  </button>
                </div>
                <p className="upload-note">
                  Maximum file size: 5MB
                  <br />
                  Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page_content">
        <div className="profile_background">
          <img
            src="https://img.freepik.com/free-vector/psychedelic-groovy-background-with-abstract-shapes_23-2148858139.jpg"
            alt=""
          />
        </div>

        <div className="profile_main">
          <div className="profile">
            <div className="top">
              <div className="left">
                <div className="profile_image_container">
                  <div className="profile_image">
                    {user?.profilePic ? (
                      <img
                        loading="lazy"
                        src={user.profilePic}
                        alt={getDisplayName()}
                      />
                    ) : (
                      <div className="profile-initials">{getInitials()}</div>
                    )}
                    {isOwnProfile && (
                      <div className="profile-image-actions">
                        <label
                          className="change-image-btn"
                          htmlFor="profile-image-upload"
                        >
                          <i className="icon fas fa-camera"></i>
                          <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: "none" }}
                          />
                        </label>
                        {user?.profilePic && (
                          <button
                            className="remove-image-btn"
                            onClick={removeProfileImage}
                            title="Remove profile image"
                          >
                            <i className="icon fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile_details">
                  <div className="details">
                    <h1 className="username">{getDisplayName()}</h1>
                    <span className="email">
                      {user?.email ||
                        (isOwnProfile && currentUser?.email) ||
                        user?.userEmail ||
                        user?.contactEmail ||
                        "Email not available"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="stats">
                  <span className="following_count">
                    {user?.followingCount || user?.following?.length || 0}{" "}
                    Following
                  </span>
                </div>
                <div className="actions">
                  {currentUser ? (
                    <button
                      className={`follow_btn ${
                        currentUser.uid === userId ? "disabled" : ""
                      }`}
                      onClick={
                        currentUser.uid === userId ? () => {} : followUser
                      }
                      disabled={currentUser.uid === userId}
                    >
                      <i
                        className={`icon fas ${
                          isFollowing ? "fa-check" : "fa-plus"
                        }`}
                      ></i>
                      <span>{isFollowing ? "Following" : "Follow"}</span>
                    </button>
                  ) : (
                    <button
                      className="follow_btn"
                      onClick={() => navigate("/login")}
                    >
                      <i className="icon fas fa-user-plus"></i>
                      <span>Login to Follow</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <>
              {/* Navigation Tabs */}
              <div className="profile-nav-tabs">
                <button
                  className={`profile-nav-tab ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="icon fas fa-user-cog"></i>
                  <span>Profile Settings</span>
                </button>
                <button
                  className={`profile-nav-tab ${
                    activeTab === "subscription" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("subscription")}
                >
                  <i className="icon fas fa-crown"></i>
                  <span>Subscription</span>
                </button>
              </div>

              {/* Profile Settings Tab Content */}
              {activeTab === "profile" && (
                <div className="tab-content">
                  <div className="account-details-card">
                    <div className="form-grid">
                      <div className="form-field">
                        <label>First name</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                        />
                      </div>
                      <div className="form-field">
                        <label>Last name</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                        />
                      </div>
                      <div className="form-field">
                        <label>Email</label>
                        <input value={currentUser?.email || ""} disabled />
                      </div>
                      <div className="form-field">
                        <label>Phone Number</label>
                        <input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="form-field full">
                        <label>Username</label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="username"
                          className={
                            username && username.trim() && !usernameAvailable
                              ? "input-error"
                              : ""
                          }
                        />
                        <div className="username-feedback">
                          {checkingUsername ? (
                            <small>Checking availability...</small>
                          ) : username && username.trim() ? (
                            usernameAvailable ? (
                              <small className="text-success">
                                ✓ Username is available
                              </small>
                            ) : username.trim().toLowerCase() ===
                              user?.username?.toLowerCase() ? (
                              <small className="text-info">
                                This is your current username
                              </small>
                            ) : (
                              <small className="text-danger">
                                ✗ Username is already taken
                              </small>
                            )
                          ) : (
                            <small>
                              We allow 3 username changes per year. You have{" "}
                              {Math.max(
                                0,
                                3 - (user?.usernameChangeCount || 0)
                              )}{" "}
                              changes remaining.
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="form-field full">
                        <label>Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell others about yourself..."
                          rows="3"
                          maxLength="200"
                        />
                        <small>{bio.length}/200 characters</small>
                      </div>
                      <div className="form-field">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="form-field">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        className="butn butn-sm butn-bg main-colorbg color-white radius-5"
                        onClick={handleSaveAccount}
                        disabled={saving}
                      >
                        <span>{saving ? "Saving..." : "Save Changes"}</span>
                      </button>
                      <button
                        className="butn butn-sm butn-bord radius-5"
                        onClick={handleCancel}
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Delete/Deactivate Account Section */}
                  <div className="danger-zone-card">
                    <div className="danger-zone-content">
                      <div className="danger-actions">
                        <button
                          className={`butn butn-sm butn-bord ${
                            user?.status === "deactivated"
                              ? "butn-bg main-colorbg"
                              : "butn-danger"
                          } radius-5`}
                          onClick={
                            user?.status === "deactivated"
                              ? handleActivateAccount
                              : handleDeactivateAccount
                          }
                        >
                          <i
                            className={`icon fas ${
                              user?.status === "deactivated"
                                ? "fa-play"
                                : "fa-pause"
                            }`}
                          ></i>
                          <span>
                            {user?.status === "deactivated"
                              ? "Activate Account"
                              : "Deactivate Account"}
                          </span>
                        </button>

                        <button
                          className="butn butn-sm butn-bg butn-danger radius-5"
                          onClick={handleDeleteAccount}
                        >
                          <i className="icon fas fa-trash"></i>
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab Content */}
              {activeTab === "subscription" && (
                <div className="tab-content">
                  {loadingSubscription ? (
                    <div className="subscription-loading">
                      <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                      <p>Loading subscription details...</p>
                    </div>
                  ) : user?.subscription?.type === "team" ||
                    subscription?.subscriptionType === "team" ? (
                    // Team Plan - Show team management
                    <div className="subscription-container">
                      <div className="subscription-card active">
                        <div className="subscription-header">
                          <div className="header-left">
                            <h2>Team Subscription</h2>
                            <div
                              className={`status-badge ${
                                formatSubscriptionStatus(subscription?.status)
                                  .class
                              }`}
                            >
                              {
                                formatSubscriptionStatus(subscription?.status)
                                  .text
                              }
                            </div>
                          </div>
                          <div className="header-right">
                            <Link
                              to="/subscription"
                              className="butn butn-sm butn-bg main-colorbg radius-5"
                            >
                              <i className="icon fas fa-sync-alt"></i>
                              <span>Change Plan</span>
                            </Link>
                          </div>
                        </div>

                        <div className="subscription-info-grid">
                          <div className="info-item">
                            <span className="info-label">Plan Type:</span>
                            <span className="info-value">Team</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Billing Cycle:</span>
                            <span className="info-value capitalize">
                              {user?.subscription?.billingCycle ||
                                subscription?.billingCycle ||
                                "Monthly"}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Billing Cycle:</span>
                            <span className="info-value capitalize">
                              {user?.subscription?.billingCycle ||
                                subscription?.billingCycle ||
                                "Monthly"}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Price:</span>
                            <span className="info-value">
                              $
                              {user?.subscription?.price ||
                                subscription?.price ||
                                "0"}
                              /
                              {(user?.subscription?.billingCycle ||
                                subscription?.billingCycle ||
                                "monthly") === "yearly"
                                ? "year"
                                : "month"}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">
                              Your Downloads Used:
                            </span>
                            <span className="info-value">
                              {user?.subscription?.downloadsUsed ||
                                subscription?.downloadsUsed ||
                                0}{" "}
                              /
                              {user?.subscription?.downloadLimit ||
                                subscription?.downloadLimit ||
                                200}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Renews:</span>
                            <span className="info-value">
                              {formatDate(
                                user?.subscription?.expiresAt ||
                                  subscription?.expiresAt
                              ) || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Team Management Section */}
                        <div className="team-management-section">
                          <div className="section-header">
                            <h3>Team Management</h3>
                            <div className="member-count">
                              <i className="fas fa-users"></i>
                              <span>
                                {teamMembers.length} /{" "}
                                {subscription?.memberLimit || 2} members
                                <span className="available-slots">
                                  (
                                  {Math.max(
                                    0,
                                    (subscription?.memberLimit || 2) -
                                      teamMembers.length
                                  )}{" "}
                                  slots available)
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Invite Team Member */}
                          <div className="invite-member-form">
                            <h4>Add Team Member</h4>
                            <p className="form-description">
                              Invite team members by email. They'll receive an
                              invitation to join your team.
                            </p>

                            <div className="input-with-button">
                              <input
                                type="email"
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="invite-email-input"
                              />
                              <button
                                className="butn butn-sm butn-bg main-colorbg color-white radius-5"
                                onClick={inviteTeamMember}
                                disabled={inviting || !inviteEmail}
                              >
                                <i className="icon fas fa-paper-plane pr-3"></i>
                                <span>
                                  {inviting ? "Sending..." : "Invite"}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Current Team Members */}
                          {teamMembers.length > 0 && (
                            <div className="team-members-list">
                              <h4>Team Members</h4>
                              <div className="members-grid">
                                {teamMembers.map((member) => (
                                  <div key={member.id} className="member-card">
                                    <div className="member-info">
                                      <div className="member-avatar">
                                        {member.profilePic ? (
                                          <img
                                            loading="lazy"
                                            src={member.profilePic}
                                            alt={member.email}
                                          />
                                        ) : (
                                          <div className="avatar-initials">
                                            {member.email
                                              ?.charAt(0)
                                              .toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      <div className="member-details">
                                        <div className="member-email">
                                          {member.email}
                                        </div>
                                        <div className="member-role">
                                          <span className="role-badge">
                                            {member.role || "Member"}
                                          </span>
                                        </div>
                                        <div className="member-joined">
                                          Joined: {formatDate(member.joinedAt)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pending Invites */}
                          {pendingInvites.length > 0 && (
                            <div className="pending-invites">
                              <h4>Pending Invitations</h4>
                              <div className="invites-list">
                                {pendingInvites.map((invite) => (
                                  <div key={invite.id} className="invite-item">
                                    <div className="invite-info">
                                      <i className="fas fa-envelope"></i>
                                      <span className="invite-email">
                                        {invite.inviteEmail}
                                      </span>
                                      <span className="invite-status pending">
                                        Pending
                                      </span>
                                      <span className="invite-sent">
                                        Sent: {formatDate(invite.invitedAt)}
                                      </span>
                                    </div>
                                    <div className="invite-actions">
                                      <button
                                        className="cancel-invite-btn"
                                        onClick={() => cancelInvite(invite.id)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Cancel Subscription Option */}
                        {subscription?.status === "active" && (
                          <div className="cancel-subscription-section">
                            <div className="cancel-warning">
                              <i className="fas fa-exclamation-triangle"></i>
                              <div>
                                <h4>Cancel Subscription</h4>
                                <p>
                                  If you cancel, you'll lose access to premium
                                  features at the end of your current billing
                                  period.
                                </p>
                              </div>
                            </div>
                            <button
                              className="butn butn-sm butn-danger radius-5"
                              onClick={cancelSubscription}
                            >
                              Cancel Subscription
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : user?.subscription?.type === "individual" ||
                    subscription?.subscriptionType === "individual" ? (
                    // Individual Paid Plan
                    <div className="subscription-container">
                      <div className="subscription-card active">
                        <div className="subscription-header">
                          <div className="header-left">
                            <h2>Premium Subscription</h2>
                            <div
                              className={`status-badge ${
                                formatSubscriptionStatus(subscription?.status)
                                  .class
                              }`}
                            >
                              {
                                formatSubscriptionStatus(subscription?.status)
                                  .text
                              }
                            </div>
                          </div>
                          <div className="header-right">
                            <Link
                              to="/subscription"
                              className="butn butn-sm butn-bg main-colorbg radius-5"
                            >
                              <i className="icon fas fa-sync-alt"></i>
                              <span>Change Plan</span>
                            </Link>
                          </div>
                        </div>

                        <div className="subscription-info-grid">
                          <div className="info-item">
                            <span className="info-label">Plan Type:</span>
                            <span className="info-value">Premium</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Billing Cycle:</span>
                            <span className="info-value capitalize">
                              {user?.subscription?.billingCycle ||
                                subscription?.billingCycle ||
                                "Monthly"}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Price:</span>
                            <span className="info-value">
                              $
                              {user?.subscription?.price ||
                                subscription?.price ||
                                "0"}
                              /
                              {(user?.subscription?.billingCycle ||
                                subscription?.billingCycle ||
                                "monthly") === "yearly"
                                ? "year"
                                : "month"}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Downloads Used:</span>
                            <span className="info-value">
                              {user?.subscription?.downloadsUsed ||
                                subscription?.downloadsUsed ||
                                0}{" "}
                              /
                              {user?.subscription?.downloadLimit ||
                                subscription?.downloadLimit ||
                                200}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Renews:</span>
                            <span className="info-value">
                              {formatDate(
                                user?.subscription?.expiresAt ||
                                  subscription?.expiresAt
                              ) || "N/A"}
                            </span>
                          </div>
                        </div>

                        {subscription?.status === "active" && (
                          <div className="cancel-subscription-section">
                            <div className="cancel-warning">
                              <i className="fas fa-exclamation-triangle"></i>
                              <div>
                                <h4>Cancel Subscription</h4>
                                <p>
                                  If you cancel, you'll lose access to premium
                                  features at the end of your current billing
                                  period.
                                </p>
                              </div>
                            </div>
                            <button
                              className="butn butn-sm butn-danger radius-5"
                              onClick={cancelSubscription}
                            >
                              Cancel Subscription
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Free Plan - User is not subscribed */
                    <div className="free-plan-container">
                      {/* Header */}
                      <div className="free-plan-header">
                        <h2>Your Current Plan</h2>
                        <div className="status-badge free">Free</div>
                      </div>

                      {/* Current Plan Info */}
                      <div className="current-plan-card">
                        <div className="plan-icon">
                          <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="plan-details">
                          <h3>Free Plan</h3>
                          <p className="plan-price">$0/month</p>
                          <p className="plan-description">
                            Basic access to our platform with limited features
                          </p>
                        </div>
                      </div>

                      {/* Limitations Section */}
                      <div className="limitations-section">
                        <h4>What's included:</h4>
                        <div className="features-list">
                          <div className="feature-item included">
                            <i className="fas fa-check-circle"></i>
                            <span>Access to basic templates</span>
                          </div>
                          <div className="feature-item included">
                            <i className="fas fa-check-circle"></i>
                            <span>5 downloads per month</span>
                          </div>
                          <div className="feature-item included">
                            <i className="fas fa-check-circle"></i>
                            <span>Standard quality downloads</span>
                          </div>
                          <div className="feature-item not-included">
                            <i className="fas fa-times-circle"></i>
                            <span>Unlimited downloads</span>
                          </div>
                          <div className="feature-item not-included">
                            <i className="fas fa-times-circle"></i>
                            <span>HD quality downloads</span>
                          </div>
                          <div className="feature-item not-included">
                            <i className="fas fa-times-circle"></i>
                            <span>AI-powered features</span>
                          </div>
                          <div className="feature-item not-included">
                            <i className="fas fa-times-circle"></i>
                            <span>Team collaboration</span>
                          </div>
                          <div className="feature-item not-included">
                            <i className="fas fa-times-circle"></i>
                            <span>Commercial license</span>
                          </div>
                        </div>
                      </div>

                      {/* Usage Stats */}
                      <div className="usage-stats-section">
                        <h4>Your Usage This Month</h4>
                        <div className="stats-grid">
                          <div className="stat-card">
                            <div className="stat-icon">
                              <i className="fas fa-download"></i>
                            </div>
                            <div className="stat-content">
                              <div className="stat-value">
                                {user?.subscription?.downloadsUsed || 0}/5
                              </div>
                              <div className="stat-label">Downloads Used</div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((user?.subscription?.downloadsUsed ||
                                        0) /
                                        5) *
                                        100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-icon">
                              <i className="fas fa-calendar"></i>
                            </div>
                            <div className="stat-content">
                              <div className="stat-value">
                                {new Date().getDate()}/30
                              </div>
                              <div className="stat-label">Days Remaining</div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${
                                      (new Date().getDate() / 30) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upgrade CTA */}
                      <div className="upgrade-cta-section">
                        <div className="upgrade-content">
                          <h3>Ready for more?</h3>
                          <p>
                            Upgrade to unlock unlimited downloads, premium
                            features, and team collaboration capabilities.
                          </p>
                          <div className="upgrade-benefits">
                            <div className="benefit-item">
                              <i className="fas fa-infinity"></i>
                              <span>Unlimited Downloads</span>
                            </div>
                            <div className="benefit-item">
                              <i className="fas fa-users"></i>
                              <span>Team Collaboration</span>
                            </div>
                            <div className="benefit-item">
                              <i className="fas fa-robot"></i>
                              <span>AI Features</span>
                            </div>
                            <div className="benefit-item">
                              <i className="fas fa-crown"></i>
                              <span>Priority Support</span>
                            </div>
                          </div>
                        </div>
                        <div className="upgrade-actions">
                          <Link
                            to="/subscription"
                            className="butn butn-lg butn-bg main-colorbg radius-5 upgrade-btn"
                          >
                            <i className="icon fas fa-arrow-up"></i>
                            <span>Upgrade Now</span>
                          </Link>
                          <p className="upgrade-note">
                            Start your 7-day free trial with any paid plan
                          </p>
                        </div>
                      </div>

                      {/* Compare Plans */}
                      <div className="compare-plans-section">
                        <h4>Compare Plans</h4>
                        <div className="plans-comparison">
                          <div className="plan-column free">
                            <div className="plan-header">
                              <h5>Free</h5>
                              <div className="plan-price">$0/mo</div>
                            </div>
                            <ul className="plan-features">
                              <li>✓ 5 downloads/month</li>
                              <li>✓ Basic templates</li>
                              <li>✗ HD quality</li>
                              <li>✗ AI features</li>
                              <li>✗ Team features</li>
                              <li>✗ Commercial license</li>
                            </ul>
                          </div>
                          <div className="plan-column popular">
                            <div className="plan-header">
                              <h5>Premium</h5>
                              <div className="plan-price">$9/mo</div>
                              <div className="popular-badge">Most Popular</div>
                            </div>
                            <ul className="plan-features">
                              <li>✓ 200 downloads/month</li>
                              <li>✓ All templates</li>
                              <li>✓ HD quality</li>
                              <li>✓ Basic AI features</li>
                              <li>✗ Team features</li>
                              <li>✓ Personal license</li>
                            </ul>
                            <Link
                              to="/subscription"
                              className="butn butn-sm butn-bg main-colorbg radius-5"
                            >
                              Choose Premium
                            </Link>
                          </div>
                          <div className="plan-column team">
                            <div className="plan-header">
                              <h5>Team</h5>
                              <div className="plan-price">$16/mo</div>
                            </div>
                            <ul className="plan-features">
                              <li>✓ 200 downloads/user</li>
                              <li>✓ All templates</li>
                              <li>✓ 4K quality</li>
                              <li>✓ Advanced AI features</li>
                              <li>✓ Team collaboration</li>
                              <li>✓ Commercial license</li>
                            </ul>
                            <Link
                              to="/subscription"
                              className="butn butn-sm butn-bord radius-5"
                            >
                              Choose Team
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="bottom">
            {Object.keys(groupedItems).map((category) => (
              <div className="section" key={category}>
                <div className="title">
                  <h2>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                </div>
                <div className="item_listing">
                  {groupedItems[category].map((item, index) => (
                    <ListedItemCard key={item.id} id={item.id} data={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
