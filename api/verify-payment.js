import Stripe from "stripe";
import { db } from "./firebase.js";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { session_id, uid } = req.query;
    if (!session_id) return res.status(400).json({ error: "Session ID required" });
    if (!uid) return res.status(400).json({ error: "User ID required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const itemIds = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    
    // Save each purchased item
    for (const itemId of itemIds) {
      const purchaseRef = doc(db, `Profiles/${uid}/purchases/${itemId}`);
      await setDoc(purchaseRef, {
        purchasedAt: new Date().toISOString(),
        status: 'completed',
        transactionId: session.id
      }, { merge: true });

      // Add to user's library
      const userRef = doc(db, `Profiles/${uid}`);
      await updateDoc(userRef, {
        library: arrayUnion(itemId)
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: error.message });
  }
}