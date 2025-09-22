import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import { useNavigate  } from "react-router-dom";

const useAddToFavorites = (assetId, assetData = null) => {
  let navigate = useNavigate();
  const { currentUser } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check if the asset is already favorited
  useEffect(() => {
    const checkIfFavorited = async () => {
      // if (!currentUser) navigate("/login");

      if (!currentUser || !assetId) return;
      
      try {
        const favoriteDocRef = doc(db, `Profiles/${currentUser.uid}/favorites/${assetId}`);
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
      navigate("/login")
      setError("User not logged in.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const favoriteDocRef = doc(db, `Profiles/${currentUser.uid}/favorites/${assetId}`);
      
      // Toggle favorite status
      if (isFavorited) {
        // Remove from favorites by deleting the document
        await deleteDoc(favoriteDocRef);
        setIsFavorited(false);
      } else {
        // Add to favorites by creating a document
        // First, make sure we're not trying to save an event object
        let dataToStore = null;
        
        // If itemData is provided but looks like an event object, ignore it
        if (itemData && (itemData.nativeEvent || itemData.target || itemData.currentTarget)) {
          dataToStore = assetData;
        } else {
          dataToStore = itemData || assetData;
        }
        
        if (!dataToStore) {
          // If no data was provided, fetch it from the Assets collection
          const assetDocRef = doc(db, "Assets", assetId);
          const assetDoc = await getDoc(assetDocRef);
          
          if (!assetDoc.exists()) {
            throw new Error("Asset not found");
          }
          
          dataToStore = assetDoc.data();
        }
        
        // Clean any non-serializable fields before storing
        const cleanData = {};
        
        // Only keep serializable data types that Firestore supports
        Object.keys(dataToStore).forEach(key => {
          const value = dataToStore[key];
          const type = typeof value;
          
          // Skip functions, complex objects, and null values
          if (
            value === null || 
            value === undefined || 
            type === 'function' || 
            (type === 'object' && value.constructor !== Array && value.constructor !== Object && !(value instanceof Date))
          ) {
            return;
          }
          
          cleanData[key] = value;
        });
        
        // Store the asset data in the favorites subcollection
        await setDoc(favoriteDocRef, {
          ...cleanData,
          favorited_at: new Date()
        });
        
        setIsFavorited(true);
      }
    } catch (error) {
      // console.error("Error toggling favorite:", error);
      setError("Failed to update favorites. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return { isFavorited, toggleFavorite, isSaving, error };
};

export default useAddToFavorites;
