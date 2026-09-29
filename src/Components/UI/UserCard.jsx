import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const getUserDisplayName = (user) => {
  if (!user) return "User";

  const firstName = user.firstName || user.firstname || user.first_name;
  const lastName = user.lastName || user.lastname || user.last_name;

  if (firstName && lastName) return `${firstName} ${lastName}`.trim();
  if (firstName) return firstName.trim();
  if (lastName) return lastName.trim();
  if (user.fullName?.trim()) return user.fullName.trim();
  if (user.displayUsername?.trim()) return user.displayUsername.trim();
  if (user.username?.trim()) return user.username.trim();
  if (user.displayName?.trim()) return user.displayName.trim();
  if (user.authorName?.trim()) return user.authorName.trim();

  if (user.email) {
    const emailName = user.email.split("@")[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }

  return "User";
};

const UserCard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [profilePath, setProfilePath] = useState(null); // Start as null

  const displayName = getUserDisplayName(user);

  const getInitials = () => {
    if (displayName === "User") return "U";

    const words = displayName.split(" ");
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  const formatUsernameForURL = (username) => {
    if (!username) return null;

    // ✅ Remove all spaces and convert to lowercase
    return username
      .toLowerCase()
      .replace(/\s+/g, "") // ✅ spaces
      .replace(/[^\w]/g, ""); // Optional: special characters  remove
  };

  const getUsernameFromDisplayName = (displayName) => {
    if (!displayName) return null;
    // ✅ Display name spaces username
    return displayName
      .toLowerCase()
      .replace(/\s+/g, "") // ✅ spaces
      .replace(/[^\w]/g, ""); // Optional: special characters remove
  };

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        // Try Profiles collection first
        const profileRef = doc(db, "Profiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const userData = profileSnap.data();
          setUser(userData);

          // Set profile path - prefer username, fallback to generated username
          if (userData.username) {
            const urlUsername = formatUsernameForURL(userData.username);
            setProfilePath(`/${urlUsername}`);
          } else {
            // Generate username from display name
            const fetchedDisplayName = getUserDisplayName(userData);
            if (fetchedDisplayName !== "User") {
              const generatedUsername = getUsernameFromDisplayName(fetchedDisplayName);
              setProfilePath(`/${generatedUsername}`);
            } else {
              setProfilePath(`/user/${userId}`);
            }
          }
        } else {
          // Try Contributors collection
          const contributorRef = doc(db, "Contributors", userId);
          const contributorSnap = await getDoc(contributorRef);

          if (contributorSnap.exists()) {
            const contributorData = contributorSnap.data();
            const userObj = {
              ...contributorData,
              username: contributorData.username || null,
              profilePic:
                contributorData.profilePic ||
                "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-man-people-user.png",
            };
            setUser(userObj);

            if (contributorData.username) {
              const urlUsername = formatUsernameForURL(
                contributorData.username
              );
              setProfilePath(`/${urlUsername}`);
            } else {
              const fetchedDisplayName = getUserDisplayName(userObj);
              if (fetchedDisplayName !== "User") {
                const generatedUsername =
                  getUsernameFromDisplayName(fetchedDisplayName);
                setProfilePath(`/${generatedUsername}`);
              } else {
                setProfilePath(`/user/${userId}`);
              }
            }
          } else {
            setUser(null);
            setProfilePath(`/user/${userId}`);
          }
        }
      } catch (error) {
        console.warn("UserCard fetch error:", error);
        setUser(null);
        setProfilePath(`/user/${userId}`);
      }
    };

    fetchUser();
  }, [userId]);

  if (!profilePath) {
    return (
      <div className="user">
        <div className="user_image">
          <div className="profile-initials">U</div>
        </div>
        <span className="username">User</span>
      </div>
    );
  }

  return (
    <div className="user">
      <div className="user_image">
        {user?.profilePic ? (
          <img  loading="lazy"  src={user.profilePic} alt={displayName} />
        ) : (
          <div className="profile-initials">{getInitials()}</div>
        )}
      </div>
      <Link to={profilePath}>
        <span className="username">{displayName}</span>
      </Link>
    </div>
  );
};

export default UserCard;
