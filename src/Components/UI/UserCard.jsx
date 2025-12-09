import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const UserCard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [profilePath, setProfilePath] = useState(`/profile/${userId}`); // ✅ ابتدائی value

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        // ✅ PEHLE PROFILES COLLECTION CHECK KARO
        const profileRef = doc(db, "Profiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const userData = profileSnap.data();
          setUser(userData);

          // ✅ اگر username موجود ہے تو اسے استعمال کریں
          if (userData.username) {
            setProfilePath(`/Profile/${userData.username}`); // ✅ نیا path
          }
        } else {
          // ✅ AGAR PROFILES MAI NAHI MILA, TO CONTRIBUTORS CHECK KARO
          const contributorRef = doc(db, "Contributors", userId);
          const contributorSnap = await getDoc(contributorRef);

          if (contributorSnap.exists()) {
            const contributorData = contributorSnap.data();
            const userObj = {
              username:
                contributorData.username ||
                contributorData.displayName ||
                "Contributor",
              profilePic:
                contributorData.profilePic ||
                "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png",
            };
            setUser(userObj);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        if (error?.code === "permission-denied") {
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
      <Link to={profilePath}>
        {" "}
        {/* ✅ یہاں profilePath استعمال کریں */}
        <span className="username">{user?.username || "User"}</span>
      </Link>
    </div>
  );
};

export default UserCard;
