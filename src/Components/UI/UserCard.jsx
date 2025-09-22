import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const UserCard = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) return; // Exit early if userId is not provided

    const fetchUser = async () => {
      try {
        const userRef = doc(db, "Profiles", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error?.code === 'permission-denied') {
          // Silent fallback when rules disallow read
          setUser(null);
        } else {
          console.warn("UserCard fetch error:", error);
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [userId]); // Dependency array ensures this effect runs only when userId changes

  return (
    <div className="user">
      <div className="user_image">
        <img
          src={
            user
              ? user.profilePic
              : "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png"
          }
          alt={user ? user.username : "User"}
        />
      </div>
      <Link to={`/Profile/${userId}`}>
        <span className="username">{user ? user.username : "User"}</span>
      </Link>
    </div>
  );
};

export default UserCard;
