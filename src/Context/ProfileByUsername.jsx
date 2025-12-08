// ProfileByUsername.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Profile from "../Pages/Profile"; // Original Profile component

const ProfileByUsername = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserByUsername = async () => {
      try {
        const q = query(
          collection(db, "Profiles"),
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUserId(userDoc.id);
        } else {
          // User not found
          navigate("/error", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/error", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserByUsername();
    }
  }, [username, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userId) {
    return <Profile id={userId} />;
  }

  return null;
};

export default ProfileByUsername;