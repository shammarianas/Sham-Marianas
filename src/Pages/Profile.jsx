import React, { useEffect, useState } from "react";
import Breadcrumbs from "../Components/Breadcrumbs";
import { Link, useParams, useNavigate } from "react-router-dom";
import ListedItemCard from "../Components/UI/ListedItemCard";
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
} from "firebase/firestore";
// Firebase storage imports
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";

import { db } from "../../firebase";
import { useUser } from "../Context/UserProvider";
import ItemsListing from "../Components/ItemsListing";
import { Helmet } from "react-helmet-async";

const Profile = () => {
  const { username: urlUsername } = useParams(); // ✅ URL سے username لیں (variable name conflict سے بچنے کے لیے)
  const { currentUser } = useUser();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // نیا state

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState(""); // Bio state added

  // Profile image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize Firebase Storage
  const storage = getStorage();

  // State for active tab
  const [activeTab, setActiveTab] = useState("profile");

  // State for billing history modal
  const [showBillingModal, setShowBillingModal] = useState(false);

  const isOwnProfile = currentUser?.uid === userId;
  // Real-time username availability check
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    const findUserByUsername = async () => {
      if (!urlUsername) {
        console.log("No username in URL");
        return;
      }

      console.log("Finding user with username:", urlUsername);
      setLoading(true);

      try {
        const usernameLower = urlUsername.toLowerCase();

        // ✅ Check Profiles collection first
        let q = query(
          collection(db, "Profiles"),
          where("username", "==", usernameLower)
        );
        let querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          console.log("User found in Profiles:", userDoc.id, userDoc.data());
          setUserId(userDoc.id);
          setUser(userDoc.data());
          setLoading(false);
          return;
        }

        // ✅ If not found, check Contributors collection
        q = query(
          collection(db, "Contributors"),
          where("username", "==", usernameLower)
        );
        querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          console.log(
            "User found in Contributors:",
            userDoc.id,
            userDoc.data()
          );

          // Map contributor fields to match your profile structure
          setUserId(userDoc.id);
          setUser({
            username:
              userDoc.data().username ||
              userDoc.data().displayName ||
              "Contributor",
            profilePic:
              userDoc.data().profilePic ||
              "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png",
            ...userDoc.data(), // include other fields if needed
          });
          setLoading(false);
          return;
        }

        // ❌ Not found in either collection
        console.log("User not found in Profiles or Contributors");
        setUserId(null);
        setUser(null);
        setLoading("not_found");
        // navigate("/404"); // optional
      } catch (error) {
        console.error("Error finding user:", error);
        setLoading("error");
      }
    };

    findUserByUsername();
  }, [urlUsername]);

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      const trimmedUsername = username.trim().toLowerCase();

      if (trimmedUsername.length < 3) {
        setUsernameAvailable(false);
        return;
      }

      // Don't check if username is same as current user
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

    // Debounce the check (wait 500ms after user stops typing)
    const timer = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  // Get full name for display
  const getDisplayName = () => {
    if (!user) return "User";

    // ✅ Priority 1: firstName + lastName combination (Pehle yeh check)
    const firstName = user.firstName || user.firstname || user.first_name;
    const lastName = user.lastName || user.lastname || user.last_name;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      return firstName.trim();
    } else if (lastName) {
      return lastName.trim();
    }

    // ✅ Priority 2: fullName (Contributor mein yeh field hai)
    if (user.fullName && user.fullName.trim()) {
      return user.fullName.trim();
    }

    // ✅ Priority 3: displayUsername (Contributor ka specific field)
    if (user.displayUsername && user.displayUsername.trim()) {
      return user.displayUsername.trim();
    }

    // ✅ Priority 4: username (common field)
    if (user.username && user.username.trim()) {
      return user.username.trim();
    }

    // ✅ Priority 5: displayName (agar exist kare)
    if (user.displayName && user.displayName.trim()) {
      return user.displayName.trim();
    }

    // ✅ Priority 6: authorName
    if (user.authorName && user.authorName.trim()) {
      return user.authorName.trim();
    }

    // ✅ Priority 7: email se name extract karen
    if (user.email) {
      const emailName = user.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return "User";
  };
  // Email get karne ka function
  const getDisplayEmail = () => {
    if (!user) return "Email not available";

    // Priority order for email
    if (user.email && user.email.trim()) {
      return user.email.trim();
    }

    // Check if there's email in user object
    if (user.userEmail && user.userEmail.trim()) {
      return user.userEmail.trim();
    }

    // Check current user's email if it's own profile
    if (isOwnProfile && currentUser?.email) {
      return currentUser.email;
    }

    // Check if there's contactEmail
    if (user.contactEmail && user.contactEmail.trim()) {
      return user.contactEmail.trim();
    }

    return "Email not available";
  };

  // Get initials for avatar
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

  const getAuthorName = (assetData) => {
    if (!assetData) return "Unknown Author";

    // Priority order for author name - same as AssetManagement.jsx
    if (assetData.authorName && assetData.authorName !== "Unknown Author")
      return assetData.authorName;
    if (assetData.author && assetData.author !== "Unknown Author")
      return assetData.author;
    if (assetData.userDisplayName) return assetData.userDisplayName;
    if (assetData.userName) return assetData.userName;
    if (assetData.displayName) return assetData.displayName;
    if (assetData.uploadedBy) return assetData.uploadedBy;
    if (assetData.createdBy) return assetData.createdBy;
    if (assetData.updatedBy) return assetData.updatedBy;

    // Fallback to username if no name found (instead of email)
    if (assetData.username) return assetData.username;

    return "Unknown Author";
  };

  // Get author name from user
  const authorName = getAuthorName(user);

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
          // Unfollow
          userFollowers = userFollowers.filter(
            (uid) => uid !== currentUser.uid
          );
          followerFollowing = followerFollowing.filter((uid) => uid !== userId);
          setIsFollowing(false);
        } else {
          // Follow
          if (!userFollowers.includes(currentUser.uid)) {
            userFollowers.push(currentUser.uid);
          }
          if (!followerFollowing.includes(userId)) {
            followerFollowing.push(userId);
          }
          setIsFollowing(true);
        }

        // Update both documents
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

        // Show success message
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
  // Effect for updating URL when username changes
  useEffect(() => {
    if (user?.username && isOwnProfile) {
      // Create a better URL with username
      const newUrl = `/profile/${user.username}`;

      // Replace history without reloading
      window.history.replaceState(null, "", newUrl);
    }
  }, [user?.username, isOwnProfile]);

  //// ✅ Real-time data update (uncomment this)
  useEffect(() => {
    if (!userId) {
      console.log("No userId, skipping real-time update");
      return;
    }

    console.log("Setting up real-time listener for userId:", userId);

    const userRef = doc(db, "Profiles", userId);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        console.log("Real-time update received:", docSnap.exists());
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("User data updated:", data);

          // ✅ Merge new data with existing user state
          setUser((prevUser) => ({
            ...prevUser,
            ...data,
          }));

          // If it's own profile, set form fields
          if (currentUser && currentUser.uid === userId) {
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setUsername(data.username || "");
            setPhoneNumber(data.phoneNumber || "");
            setBio(data.bio || ""); // Set bio from Firestore
          }

          // Check if current user is following this user
          if (currentUser && currentUser.uid && data.followers) {
            setIsFollowing(data.followers.includes(currentUser.uid));
          } else {
            setIsFollowing(false);
          }
        } else {
          console.log("User document doesn't exist");
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

  // Check followers count
  useEffect(() => {
    const checkFollowersCount = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "Profiles", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const followersCount = data.followers?.length || 0;

          // Ensure followersCount is updated in state
          if (followersCount !== (user.followers?.length || 0)) {
            setUser((prev) => ({
              ...prev,
              followers: data.followers || [],
              followersCount: followersCount,
            }));
          }
        }
      } catch (error) {
        console.error("Error checking followers count:", error);
      }
    };

    checkFollowersCount();
  }, [user, userId]);

  useEffect(() => {
    const fetchItems = async () => {
      let itemsQuery;

      itemsQuery = query(
        collection(db, "Assets"),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(itemsQuery);
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
      itemsData && setLoading(false);

      itemsData.length === 0 && setLoading("no_item");
    };

    fetchItems();
  }, [userId]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match("image.*")) {
        alert("Please select an image file (jpg, png, gif, etc.)");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setShowImageUploadModal(true);
    }
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    if (!selectedImage || !isOwnProfile || !currentUser || !userId) return;

    try {
      setUploadingImage(true);

      // Upload to Firebase Storage
      const storageRef = ref(
        storage,
        `profile-images/${currentUser.uid}/${Date.now()}_${selectedImage.name}`
      );
      await uploadBytes(storageRef, selectedImage);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile in Firestore
      const profileRef = doc(db, "Profiles", userId);
      await updateDoc(profileRef, {
        profilePic: downloadURL,
        updatedAt: new Date(),
      });

      // Clear states
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

  // Remove profile image
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
    if (!isOwnProfile || !userId) return; // ✅ userId check
    const trimmedUsername = (username || "").trim().toLowerCase(); // ✅ Added toLowerCase()

    // Password validation
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    // Username validation
    if (!trimmedUsername) {
      alert("Username is required!");
      return;
    }

    // ✅ ADDED: Check if username contains only allowed characters
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      alert(
        "Username can only contain letters, numbers, dots, hyphens, and underscores!"
      );
      return;
    }

    // ✅ ADDED: Check minimum length
    if (trimmedUsername.length < 3) {
      alert("Username must be at least 3 characters long!");
      return;
    }

    // ✅ ADDED: Check maximum length
    if (trimmedUsername.length > 20) {
      alert("Username must be less than 20 characters!");
      return;
    }

    // ✅ ADDED: Check if username is same as current (no change needed)
    if (trimmedUsername === user?.username?.toLowerCase()) {
      // Username hasn't changed, proceed with other updates
    } else {
      // ✅ ADDED: Check if username already exists in Firestore
      try {
        const usernameQuery = query(
          collection(db, "Profiles"),
          where("username", "==", trimmedUsername)
        );
        const querySnapshot = await getDocs(usernameQuery);

        // Check if username exists and belongs to a different user
        let usernameExists = false;
        querySnapshot.forEach((doc) => {
          if (doc.id !== userId) {
            // Different user has this username
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
        bio: bio.trim(), // Add bio to updates
        updatedAt: new Date(),
      };

      if (snap.exists()) {
        // Document exists, check username change limit
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

        // Update existing document
        await updateDoc(profileRef, updates);

        // Update password if provided
        if (newPassword) {
          alert(
            "Password change requires re-authentication. Please use the password reset feature."
          );
        }
      } else {
        // Document doesn't exist, create new
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

      // Clear password fields
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

      // Check the provider
      const providerId = user.providerData[0]?.providerId;

      if (providerId === "password") {
        // Prompt for password
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

        // Reauthenticate
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else {
        alert(
          `Account deletion for ${providerId} login is not supported. Please use your original provider to reauthenticate.`
        );
        return;
      }

      // Delete subcollections
      const subcollections = ["favorites", "downloads"];
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, "Profiles", userId, sub));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, "Profiles", userId, sub, docSnap.id));
        }
      }

      // Delete profile
      await deleteDoc(doc(db, "Profiles", userId));

      // Remove from followers arrays
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

      // Delete Firebase Auth account
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

      // Update status
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

      // Update status
      await updateDoc(profileRef, { status: "deactivated" });

      alert("Your account has been deactivated.");

      // Logout user
      await auth.signOut();

      // Navigate to Stack page (replace '/stack' with your actual Stack page route)
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
    setBio(user?.bio || ""); // Reset bio
    setNewPassword("");
    setConfirmPassword("");
  };

  // Open billing history modal
  const handleOpenBillingModal = () => {
    setShowBillingModal(true);
  };

  // Close billing history modal
  const handleCloseBillingModal = () => {
    setShowBillingModal(false);
  };

  // Close image upload modal
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
      <Helmet>
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
          href={`https://shammarianas.me/#/${user?.username}`} // ✅ update
        />
      </Helmet>

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
                    <img src={imagePreview} alt="Preview" />
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
                      <img src={user.profilePic} alt={getDisplayName()} />
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
                    </span>{" "}
                    {/* <span className="bio">{user?.bio || "No bio yet"}</span>  */}
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
                    {/* <div className="info-banner">
                      <span className="icon">i</span>
                      <span>
                        Some fields are not editable here. Please update them
                        via your Google account.
                      </span>
                    </div> */}
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
                        className="butn butn-sm butn-bg main-colorbg radius-5"
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
                  <div className="subscription-card">
                    <div className="subscription-header">
                      <h2>Subscription</h2>
                      <div className="subscription-status">
                        <span className="status-badge free">Free Plan</span>
                      </div>
                    </div>

                    <div className="subscription-plans">
                      <div className="plan-section">
                        <h3>Plan</h3>
                        <div className="plan-card current-plan">
                          <div className="plan-header">
                            <h4>Free</h4>
                            <span className="plan-price">$0/month</span>
                          </div>
                          <ul className="plan-features">
                            <li>Basic access to platform</li>
                            <li>Limited daily uploads</li>
                            <li>Standard resolution downloads</li>
                          </ul>
                          <Link
                            to="/subscription"
                            className="butn butn-sm butn-bg main-colorbg radius-5 upgrade-btn"
                          >
                            <i className="icon fas fa-arrow-up"></i>
                            <span>Upgrade plan</span>
                          </Link>
                        </div>
                      </div>

                      <div className="plan-section">
                        <h3>Credits</h3>
                        <div className="credits-info">
                          <p>
                            <strong>
                              Limited daily use of generative AI and editing
                              tools
                            </strong>
                          </p>
                          <p className="credits-note">
                            See limits on the Pricing page
                          </p>
                          <div className="credits-balance">
                            <div className="balance-item">
                              <span className="balance-label">
                                Daily Credits:
                              </span>
                              <span className="balance-value">50/100</span>
                            </div>
                            <div className="balance-item">
                              <span className="balance-label">
                                Monthly Credits:
                              </span>
                              <span className="balance-value">350/500</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="plan-section">
                        <h3>Billing information</h3>
                        <div className="billing-info">
                          <div className="billing-details">
                            <p>
                              <strong>{getDisplayName()}</strong>
                            </p>
                            <p>
                              {user?.email ||
                                currentUser?.email ||
                                "Email not available"}
                            </p>
                            <p style={{ color: "#999", fontSize: "0.9rem" }}>
                              {user?.bio || "No bio added yet"}
                            </p>
                          </div>
                          <div className="billing-history">
                            <button
                              className="butn butn-sm butn-bord radius-5"
                              onClick={handleOpenBillingModal}
                            >
                              <i className="icon fas fa-history"></i>
                              <span>Billing history</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
