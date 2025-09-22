import React, { useEffect, useState } from "react";
import Breadcrumbs from "../Components/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
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
  const [saving, setSaving] = useState(false);
  const isOwnProfile = currentUser?.uid === id;

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
          setFirstName(data.firstName || (currentUser?.displayName || "").split(" ")[0] || "");
          setLastName(data.lastName || (currentUser?.displayName || "").split(" ")[1] || "");
          setUsername(data.username || currentUser?.displayName || "");
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
    const updates = { firstName: firstName.trim(), lastName: lastName.trim(), username: trimmedUsername };

    try {
      setSaving(true);
      const profileRef = doc(db, "Profiles", id);
      const snap = await getDoc(profileRef);
      let changeCount = 0;
      let changeYear = new Date().getFullYear();
      if (snap.exists()) {
        const d = snap.data();
        changeCount = d.usernameChangeCount || 0;
        changeYear = d.usernameChangeYear || changeYear;
        if (d.username !== trimmedUsername) {
          const nowYear = new Date().getFullYear();
          if (changeYear !== nowYear) {
            changeYear = nowYear;
            changeCount = 0;
          }
          if (changeCount >= 3) {
            alert("You have reached the maximum of 3 username changes this year.");
            setSaving(false);
            return;
          }
          updates.usernameChangeCount = changeCount + 1;
          updates.usernameChangeYear = changeYear;
        }
      }
      await updateDoc(profileRef, updates);
      alert("Changes saved");
    } catch (e) {
      alert(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
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
          content={`View ${
            user ? user.username : "User"
          }'s profile on shammarianas`}
        />

        <meta
          property="og:title"
          content={`${user ? user.username : "User"} | shammarianas`}
        />
        <meta
          property="og:description"
          content={`View ${
            user ? user.username : "User"
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
          content={`View ${
            user ? user.username : "User"
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

        <link rel="canonical" href={`https://shammarianas.me/#/profile/${id}`} />
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
                  {}
                  <img
                    src={
                      user && user.profilePic !== null
                        ? user.profilePic
                        : `https://avatar.iran.liara.run/username?username=${
                            user ? user.username : "User"
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
                  <div className="rating">
                    <div className="stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={`filled_${i}`}
                          className={`icon fas fa-star ${
                            user &&
                            typeof user.rating === "number" &&
                            user.rating > i
                              ? "filled"
                              : ""
                          }`}
                        ></i>
                      ))}
                    </div>

                    <span className="rating_count">
                      {user && typeof user.rating_count === "number"
                        ? user.rating_count
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="right">
                <span className="follower_count">
                  {user && user.followers ? user.followers.length : 0} Followers
                </span>

                <div className="actions">
                  <button
                    className={`follow_btn  ${
                      currentUser && currentUser.uid == id ? "disabled" : ""
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
            <div className="account-details-card">
              <div className="info-banner">
                <span className="icon">i</span>
                <span>Some fields are not editable here. Please update them via your Google account.</span>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label>First name</label>
                  <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div className="form-field">
                  <label>Last name</label>
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Last name" />
                </div>
                <div className="form-field full">
                  <label>Email</label>
                  <input value={currentUser?.email || ""} disabled />
                </div>
                <div className="form-field full">
                  <label>Username</label>
                  <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username" />
                  <small>We allow 3 username changes per year. You have {Math.max(0, 3 - (user?.usernameChangeCount || 0))} changes remaining.</small>
                </div>
              </div>
              <div className="form-actions">
                <button className="butn butn-sm butn-bg main-colorbg radius-5" onClick={handleSaveAccount} disabled={saving}>
                  <span>{saving?"Saving...":"Save Changes"}</span>
                </button>
                <button className="butn butn-sm butn-bord radius-5" onClick={()=>{ setFirstName(user?.firstName||""); setLastName(user?.lastName||""); setUsername(user?.username||""); }}>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          <div className="bottom">
            {" "}
            {Object.keys(groupedItems).map((category) => (
              <div className="section" key={category}>
                <div className="title">
                  <h2>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                </div>
                <div className="item_listing">
                  {groupedItems[category].map((item, index) => (
                    <Link to={`/View/${item.id}`} key={index}>
                      <div className="item_card" key={index}>
                        <div
                          className="card_image"
                          style={{
                            aspectRatio:
                              item.type === "textures" ? "1 / 1" : undefined,
                          }}
                        >
                          <img src={item.thumbnail} alt="placeholder" />
                        </div>
                        <div className="card_content">
                          <span className="title">
                            {item.title}{" "}
                            <span className="publisher">
                              by Servant {item.publisher}
                            </span>
                          </span>
                          <div className="details">
                            <span className="price">
                              <strong>
                                {(() => {
                                  const price = Number(item.price) || 0;
                                  const discount = Number(item.discount ?? 0) || 0;
                                  const finalPrice = Math.max(0, price - (price * discount) / 100);
                                  return finalPrice === 0 ? "Free" : `$${finalPrice.toFixed(2)}`;
                                })()}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
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
