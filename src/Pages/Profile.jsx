import React, { useEffect, useState } from "react";
import Breadcrumbs from "../Components/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
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
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../Context/UserProvider";
import ItemsListing from "../Components/ItemsListing";
import { Helmet } from "react-helmet-async";

const Profile = () => {
  const { id } = useParams();
  const { currentUser } = useUser();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState("profile");

  const isOwnProfile = currentUser?.uid === id;

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
    if (!user) {
      return;
    }

    const userRef = doc(db, "Profiles", id);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const followers = userData.followers || [];

      if (followers.includes(currentUser.uid)) {
        const index = followers.indexOf(currentUser.uid);
        followers.splice(index, 1);
        setIsFollowing(false);
      } else {
        followers.push(currentUser.uid);
        setIsFollowing(true);
      }

      await updateDoc(userRef, {
        followers,
      });
    }
  };

  useEffect(() => {
    const userRef = doc(db, "Profiles", id);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser(data);
        if (currentUser && currentUser.uid === id) {
          setFirstName(
            data.firstName ||
            (currentUser?.displayName || "").split(" ")[0] ||
            ""
          );
          setLastName(
            data.lastName ||
            (currentUser?.displayName || "").split(" ")[1] ||
            ""
          );
          setUsername(data.username || currentUser?.displayName || "");
          setPhoneNumber(data.phoneNumber || currentUser?.phoneNumber || "");
        }

        if (currentUser && currentUser.uid) {
          setIsFollowing(
            docSnap.data().followers &&
            docSnap.data().followers.includes(currentUser.uid)
          );
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [id, currentUser]);

  useEffect(() => {
    const fetchItems = async () => {
      let itemsQuery;

      itemsQuery = query(collection(db, "Assets"), where("userId", "==", id));

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
  }, []);

  const handleSaveAccount = async () => {
    if (!isOwnProfile) return;
    const trimmedUsername = (username || "").trim();

    // Password validation
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      setSaving(true);
      const profileRef = doc(db, "Profiles", id);
      const snap = await getDoc(profileRef);

      let updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: trimmedUsername,
        phoneNumber: phoneNumber.trim(),
      };

      if (snap.exists()) {
        // Document exists, check username change limit
        const d = snap.data();
        let changeCount = d.usernameChangeCount || 0;
        let changeYear = d.usernameChangeYear || new Date().getFullYear();

        if (d.username !== trimmedUsername) {
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
          // Note: Firebase Authentication password update requires re-authentication
          // You might need to implement separate password update flow
          alert("Password change requires re-authentication. Please use the password reset feature.");
        }
      } else {
        // Document doesn't exist, create new
        updates.uid = currentUser.uid;
        updates.createdAt = new Date();
        updates.usernameChangeCount = 0;
        updates.usernameChangeYear = new Date().getFullYear();
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

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone!"
    );
    if (confirmed) {
      // Implement account deletion logic here
      alert("Account deletion feature will be implemented soon.");
    }
  };

  const handleDeactivateAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? You can reactivate it later by logging in."
    );
    if (confirmed) {
      // Implement account deactivation logic here
      alert("Account deactivation feature will be implemented soon.");
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setUsername(user?.username || "");
    setPhoneNumber(user?.phoneNumber || "");
    setNewPassword("");
    setConfirmPassword("");
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
        <title>{user ? user.username : "User"} | shammarianas</title>
        <meta
          name="description"
          content={`View ${user ? user.username : "User"
            }'s profile on shammarianas`}
        />
        <meta
          property="og:title"
          content={`${user ? user.username : "User"} | shammarianas`}
        />
        <meta
          property="og:description"
          content={`View ${user ? user.username : "User"
            }'s profile on shammarianas`}
        />
        <meta
          property="og:image"
          content={
            user
              ? user.profilePic
              : "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account"
          }
        />
        <meta
          property="og:url"
          content={`https://shammarianas.vercel.app/#/profile/${id}`}
        />
        <meta
          name="twitter:title"
          content={`${user ? user.username : "User"} | shammarianas`}
        />
        <meta
          name="twitter:description"
          content={`View ${user ? user.username : "User"
            }'s profile on shammarianas`}
        />
        <meta
          name="twitter:image"
          content={
            user
              ? user.profilePic
              : "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account"
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="canonical"
          href={`https://shammarianas.me/#/profile/${id}`}
        />
      </Helmet>
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
                <div className="profile_image">
                  <img
                    src={
                      user && user.profilePic !== null
                        ? user.profilePic
                        : `https://avatar.iran.liara.run/username?username=${user ? user.username : "User"
                        }`
                    }
                    alt={user ? user.username : "User"}
                  />
                </div>

                <div className="profile_details">
                  <div className="details">
                    <h1 className="username">
                      {user ? user.username : "User"}
                    </h1>
                    <span className="email">{user ? user.email : "Email"}</span>
                    <span className="bio">{user ? user.bio : "Bio"}</span>
                  </div>
                </div>
              </div>
              <div className="right">
                <span className="follower_count">
                  {user && user.followers ? user.followers.length : 0} Followers
                </span>
                <div className="actions">
                  <button
                    className={`follow_btn  ${currentUser && currentUser.uid == id ? "disabled" : ""
                      }`}
                    onClick={
                      currentUser && currentUser.uid == id
                        ? () => alert("You cannot follow yourself")
                        : currentUser
                          ? followUser
                          : () => alert("Please login to follow this user")
                    }
                  >
                    {isFollowing ? (
                      <i className="icon fas fa-minus"></i>
                    ) : (
                      <i className="icon fas fa-plus"></i>
                    )}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <>
              {/* Navigation Tabs */}
              <div className="profile-nav-tabs">
                <button
                  className={`profile-nav-tab ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="icon fas fa-user-cog"></i>
                  <span>Profile Settings</span>
                </button>
                <button
                  className={`profile-nav-tab ${activeTab === "subscription" ? "active" : ""}`}
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
                        />
                        <small>
                          We allow 3 username changes per year. You have{" "}
                          {Math.max(0, 3 - (user?.usernameChangeCount || 0))} changes
                          remaining.
                        </small>
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
                          className="butn butn-sm butn-bord butn-danger radius-5"
                          onClick={handleDeactivateAccount}
                        >
                          <i className="icon fas fa-pause"></i>
                          <span>Deactivate Account</span>
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
                          <button className="butn butn-sm butn-bg main-colorbg radius-5 upgrade-btn">
                            <i className="icon fas fa-arrow-up"></i>
                            <span>Upgrade plan</span>
                          </button>
                        </div>
                      </div>

                      <div className="plan-section">
                        <h3>Credits</h3>
                        <div className="credits-info">
                          <p><strong>Limited daily use of generative AI and editing tools</strong></p>
                          <p className="credits-note">
                            See limits on the Pricing page
                          </p>
                          <div className="credits-balance">
                            <div className="balance-item">
                              <span className="balance-label">Daily Credits:</span>
                              <span className="balance-value">50/100</span>
                            </div>
                            <div className="balance-item">
                              <span className="balance-label">Monthly Credits:</span>
                              <span className="balance-value">350/500</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="plan-section">
                        <h3>Billing information</h3>
                        <div className="billing-info">
                          <div className="billing-details">
                            <p><strong>{currentUser?.displayName || "Sahrish Anfal"}</strong></p>
                            <p>{currentUser?.email || "Bahrishanfal@gmail.com"}</p>
                          </div>
                          <div className="billing-history">
                            <button className="butn butn-sm butn-bord radius-5">
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