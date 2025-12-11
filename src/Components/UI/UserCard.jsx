import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const UserCard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [profilePath, setProfilePath] = useState(`/profile/${userId}`); // ✅ ابتدائی value

  // ✅ Profile ki tarah hi getDisplayName function
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

  // ✅ Get initials for avatar
  const getInitials = () => {
    const displayName = getDisplayName();
    if (displayName === "User") return "U";
    
    // Get first two letters of display name
    const words = displayName.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

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

          // ✅  username
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
              ...contributorData,
              username:
                contributorData.username ||
                contributorData.displayName ||
                "Contributor",
              profilePic:
                contributorData.profilePic ||
                "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png",
            };
            setUser(userObj);
            
            // ✅ Contributor ka username bhi check karen profile path ke liye
            if (contributorData.username) {
              setProfilePath(`/Profile/${contributorData.username}`);
            }
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
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt={getDisplayName()}
          />
        ) : (
          <div className="profile-initials">{getInitials()}</div>
        )}
      </div>
      <Link to={profilePath}>
        {" "}
        {/* ✅  profilePath   */}
        <span className="username">{getDisplayName()}</span>
      </Link>
    </div>
  );
};

export default UserCard;