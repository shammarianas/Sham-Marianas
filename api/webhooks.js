// import Stripe from "stripe";
// import { buffer } from "micro";
// import { db } from "../../firebase";
// import { doc, setDoc } from "firebase/firestore";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   try {
//     const buf = await buffer(req);
//     event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
//   } catch (err) {
//     console.error("Webhook error:", err);
//     return res.status(400).json({ error: "Webhook error" });
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const userId = session.metadata.userId;

//     if (userId) {
//       const purchaseRef = doc(db, `Profiles/${userId}/purchases/${session.id}`);
//       await setDoc(purchaseRef, {
//         sessionId: session.id,
//         amount_total: session.amount_total / 100, // Convert from cents
//         currency: session.currency,
//         purchasedAt: new Date(),
//       });
//     }
//   }

//   res.status(200).json({ received: true });
// }



// api/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Handle successful payment (e.g., update database)
        break;
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        // Fulfill the purchase, e.g., create an order in your database
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
