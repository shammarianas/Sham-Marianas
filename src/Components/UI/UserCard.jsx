import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const UserCard = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        // ✅ PEHLE PROFILES COLLECTION CHECK KARO
        const profileRef = doc(db, "Profiles", userId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setUser(profileSnap.data());
        } else {
          // ✅ AGAR PROFILES MAI NAHI MILA, TO CONTRIBUTORS CHECK KARO
          const contributorRef = doc(db, "Contributors", userId);
          const contributorSnap = await getDoc(contributorRef);
          
          if (contributorSnap.exists()) {
            const contributorData = contributorSnap.data();
            setUser({
              username: contributorData.username || contributorData.displayName || "Contributor",
              profilePic: contributorData.profilePic || "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png"
            });
          } else {
            setUser(null);
          }
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
  }, [userId]);

  return (
    <div className="user">
      <div className="user_image">
        <img
          src={
            user?.profilePic || 
            "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png"
          }
          alt={user?.username || "User"}
        />
      </div>
      <Link to={`/Profile/${userId}`}>
        <span className="username">{user?.username || "User"}</span>
      </Link>
    </div>
  );
};

export default UserCard;