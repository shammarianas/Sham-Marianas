const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

require("dotenv").config(); // load .env file

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors")({ origin: true });

// =============================
// CREATE PAYMENT INTENT
// =============================
exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const { amount, metadata } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: metadata || {},
      });

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// =============================
// STRIPE WEBHOOK (RAW BODY REQUIRED)
// =============================
exports.stripeWebhook = functions.https.onRequest(
  { rawBody: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata?.userId;
      const planName = paymentIntent.metadata?.plan?.toLowerCase() || "basic";
      if (userId && userId !== "guest") {
        try {
          await admin
            .firestore()
            .collection("Profiles")
            .doc(userId)
            .set(
              {
                subscription: {
                  status: "active",
                  plan: planName,
                  startDate: new Date().toISOString(),
                  paymentMethod: "card",
                  lastPaymentAmount: paymentIntent.amount_received / 100,
                },
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

          console.log(
            `SUCCESS → ${userId} ka ${planName.toUpperCase()} plan ACTIVE ho gaya!`
          );
        } catch (error) {
          console.error("Firestore update error:", error);
        }
      }
    }

    res.json({ received: true });
  }
);
