import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";

const useAddToPurchase = () => {
  const { currentUser } = useUser();

  const addToPurchase = async (asset) => {
    if (!currentUser) {
      console.error("No user is logged in.");
      return;
    }

    try {
      // Reference to the user's purchases subcollection
      const purchaseRef = doc(db, `Profiles/${currentUser.uid}/purchases/${asset.id}`);
      
      // Add the asset to the purchases subcollection
      await setDoc(purchaseRef, {
        ...asset,
        purchasedAt: new Date(), // Add a timestamp for when the purchase was made
      });

    } catch (error) {
      console.error("Error adding asset to purchases:", error);
    }
  };

  return addToPurchase;
};

export default useAddToPurchase;
