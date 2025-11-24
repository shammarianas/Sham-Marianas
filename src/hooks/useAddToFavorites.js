import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import { useNavigate } from "react-router-dom";

const useAddToFavorites = (assetId, assetData = null) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check if the asset is already favorited
  useEffect(() => {
    const checkIfFavorited = async () => {
      if (!currentUser || !assetId) return;

      try {
        const favoriteDocRef = doc(
          db,
          `Profiles/${currentUser.uid}/favorites/${assetId}`
        );
        const favoriteDoc = await getDoc(favoriteDocRef);
        setIsFavorited(favoriteDoc.exists());
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };

    checkIfFavorited();
  }, [currentUser, assetId]);

  const toggleFavorite = async (itemData = null) => {
    if (!currentUser) {
      navigate("/login");
      setError("User not logged in.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const favoriteDocRef = doc(
        db,
        `Profiles/${currentUser.uid}/favorites/${assetId}`
      );

      if (isFavorited) {
        // Remove from favorites
        await deleteDoc(favoriteDocRef);
        setIsFavorited(false);
      } else {
        // Add to favorites
        let dataToStore = null;

        // Avoid storing event objects
        if (
          itemData &&
          (itemData.nativeEvent || itemData.target || itemData.currentTarget)
        ) {
          dataToStore = assetData;
        } else {
          dataToStore = itemData || assetData;
        }

        if (!dataToStore) {
          // Fetch asset from Assets collection if not provided
          const assetDocRef = doc(db, "Assets", assetId);
          const assetDoc = await getDoc(assetDocRef);

          if (!assetDoc.exists()) throw new Error("Asset not found");

          dataToStore = assetDoc.data();
        }

        // Clean serializable data
        const cleanData = {};
        Object.keys(dataToStore).forEach((key) => {
          const value = dataToStore[key];
          const type = typeof value;
          if (
            value === null ||
            value === undefined ||
            type === "function" ||
            (type === "object" &&
              value.constructor !== Array &&
              value.constructor !== Object &&
              !(value instanceof Date))
          )
            return;

          cleanData[key] = value;
        });

        // Store in favorites with author info
        await setDoc(favoriteDocRef, {
          ...cleanData,
          author: dataToStore.author || dataToStore.userId || "unknown_author",
          authorName:
            dataToStore.authorName || dataToStore.userDisplayName || "Unknown",
          userId: currentUser.uid, // the user who favorited
          favorited_at: new Date(),
        });

        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Failed to update favorites. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return { isFavorited, toggleFavorite, isSaving, error };
};

export default useAddToFavorites;
