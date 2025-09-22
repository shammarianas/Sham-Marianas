import { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase";
import { doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import { useNavigate } from "react-router-dom";

const useSaveToDownloads = (assetId, assetData = null) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check if the asset is already downloaded
  useEffect(() => {
    if (!currentUser || !assetId) return;

    const checkIfDownloaded = async () => {
      try {
        const downloadDocRef = doc(
          db,
          `Profiles/${currentUser.uid}/downloads/${assetId}`
        );
        const downloadDoc = await getDoc(downloadDocRef);
        setIsDownloaded(downloadDoc.exists());
      } catch (err) {
        console.error("Error checking download status:", err);
      }
    };

    checkIfDownloaded();
  }, [currentUser, assetId]);

  const addToDownloads = useCallback(
    async (itemData = null) => {
      if (!currentUser) {
        navigate("/login");
        setError("User not logged in.");
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const downloadDocRef = doc(
          db,
          `Profiles/${currentUser.uid}/downloads/${assetId}`
        );
        let dataToStore = itemData || assetData;

        if (!dataToStore) {
          const assetDocRef = doc(db, "Assets", assetId);
          const assetDoc = await getDoc(assetDocRef);
          if (!assetDoc.exists()) throw new Error("Asset not found");
          dataToStore = assetDoc.data();
        }

        const cleanData = Object.fromEntries(
          Object.entries(dataToStore).filter(
            ([_, value]) =>
              value !== null &&
              value !== undefined &&
              typeof value !== "function" &&
              !(
                typeof value === "object" &&
                !(value instanceof Date || Array.isArray(value))
              )
          )
        );

        await setDoc(downloadDocRef, {
          ...cleanData,
          downloaded_at: new Date(),
        });
        setIsDownloaded(true);
      } catch (error) {
        console.error("Error saving to downloads:", error);
        setError(error.message || "Failed to save download.");
      } finally {
        setIsSaving(false);
      }
    },
    [currentUser, assetId, assetData, navigate]
  );

  const removeFromDownloads = useCallback(async () => {
    if (!currentUser) return;

    setIsSaving(true);
    setError(null);

    try {
      const downloadDocRef = doc(
        db,
        `Profiles/${currentUser.uid}/downloads/${assetId}`
      );
      await deleteDoc(downloadDocRef);
      setIsDownloaded(false);
    } catch (error) {
      console.error("Error removing from downloads:", error);
      setError(error.message || "Failed to remove download.");
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, assetId]);

  return { isDownloaded, addToDownloads, removeFromDownloads, isSaving, error };
};

export default useSaveToDownloads;
