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

// =============================
// SEND LOGIN EMAIL
// =============================
const nodemailer = require("nodemailer");

// Gmail SMTP setup
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.LOGIN_EMAIL_USER,
    pass: process.env.LOGIN_EMAIL_PASSWORD,
  },
});

exports.sendLoginEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email missing in request" });
    }

    const mailOptions = {
      from: `Sham Marianas <${process.env.LOGIN_EMAIL_USER}>`,
      to: email,
      subject: "Login Alert",
      html: `
        <h2>Hello ${name || "User"},</h2>
        <p>You have successfully logged into your account.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If this wasn't you, please change your password immediately.</p>
        <br/>
        <strong>Sham Marianas Team</strong>
      `,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Email send error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// =============================
// CONTRIBUTOR STATUS EMAIL (v1 Firestore trigger)
// =============================
exports.sendContributorStatusEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST")
      return res.status(405).send("Method Not Allowed");

    const { email, username, status } = req.body;

    if (!email) return res.status(400).send("Email is required");

    let subject = "";
    let message = "";

    if (status === "verified") {
      subject = "Your Contributor Account Has Been Approved 🎉";
      message = `<h2>Hello ${username || "Contributor"},</h2>
                 <p>Congratulations! Your contributor account has been <strong>approved</strong> by the Admin.</p>
                 <p>You can now upload assets and manage your contributor profile.</p>
                 <br/><strong>- Sham Marianas Team</strong>`;
    } else if (status === "rejected") {
      subject = "Your Contributor Request Was Rejected";
      message = `<h2>Hello ${username || "Contributor"},</h2>
                 <p>We're sorry to inform you that your contributor request has been <strong>rejected</strong>.</p>
                 <p>You can contact support if you believe this was a mistake.</p>
                 <br/><strong>- Sham Marianas Team</strong>`;
    } else {
      return res.status(400).send("Invalid status");
    }

    try {
      await mailTransport.sendMail({
        from: `Sham Marianas <${process.env.LOGIN_EMAIL_USER}>`,
        to: email,
        subject,
        html: message,
      });

      console.log(`Contributor status email sent to ${email}`);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error sending contributor status email:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
