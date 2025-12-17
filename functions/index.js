const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const { setGlobalOptions } = require("firebase-functions/v2");
admin.initializeApp();

require("dotenv").config(); // load .env file

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors")({ origin: true });

if (process.env.FUNCTIONS_EMULATOR === "true") {
  // This bypasses App Check validation in emulator
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  process.env.FIREBASE_APPCHECK_EMULATOR_HOST = "localhost:8089";

  // This is the key line that fixes the "Login required" error
  process.env.FIREBASE_APP_CHECK_EMULATOR_TOKEN = "true";
}
// =============================
// CONSTANTS
// =============================
const PER_DOWNLOAD_VALUE_INDIVIDUAL = 0.045;
const SELLER_SHARE_INDIVIDUAL = 0.018;
const COMPANY_SHARE_INDIVIDUAL = 0.027;

const PER_DOWNLOAD_VALUE_TEAM = 0.035;
const SELLER_SHARE_TEAM = 0.014;
const COMPANY_SHARE_TEAM = 0.021;

// ============================
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
// STRIPE WEBHOOK (ENHANCED)
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

    const db = admin.firestore();

    // Handle successful payment
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const amount = (paymentIntent.amount_received || 0) / 100;

      // 🆕 IMPROVED: Multiple ways to detect subscription type
      const buyerId = metadata.userId || metadata.buyerId || null;
      const assetId = metadata.assetId;

      // Plan detection - priority order
      let plan = "individual"; // default
      if (metadata.plan) {
        plan = metadata.plan.toLowerCase(); // "individual" یا "team"
      } else if (metadata.type) {
        plan = metadata.type.toLowerCase();
      } else if (
        metadata.subscriptionName &&
        metadata.subscriptionName.toLowerCase().includes("team")
      ) {
        plan = "team";
      }

      const subscriptionType = plan;
      const teamSize = parseInt(metadata.teamSize || "1", 10) || 1;
      const billingCycle = metadata.billingCycle || "monthly";

      try {
        // ============ SUBSCRIPTION HANDLING ============
        if (plan && buyerId && buyerId !== "guest") {
          const now = Date.now();
          const expiresAt = admin.firestore.Timestamp.fromMillis(
            now + 30 * 24 * 60 * 60 * 1000
          );

          // INDIVIDUAL SUBSCRIPTION
          if (plan === "individual") {
            await db
              .collection("Profiles")
              .doc(buyerId)
              .set(
                {
                  subscription: {
                    status: "active",
                    plan: "individual",
                    type: "individual",
                    startDate: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt,
                    downloadsUsed: 0,
                    downloadLimit: 200,
                    billingCycle: billingCycle,
                    monthlyReset: new Date(
                      now + 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    price: 9, // $9/month
                  },
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );

            // Record transaction
            await db.collection("Transactions").doc().set({
              type: "subscription_payment",
              userId: buyerId,
              plan: "individual",
              amount,
              paymentIntentId: paymentIntent.id,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`✅ Individual subscription activated for ${buyerId}`);
          }
          // TEAM SUBSCRIPTION
          else if (plan === "team") {
            const teamId = `team_${buyerId}_${Date.now()}`;

            // Create team document
            await db
              .collection("Teams")
              .doc(teamId)
              .set({
                ownerId: buyerId,
                teamId,
                members: [buyerId],
                memberLimit: Math.min(teamSize, 10),
                perMemberPrice: 7, // $7 per member
                plan: "team",
                active: true,
                startDate: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt,
                downloadsPerMember: 200,
                totalDownloadsUsed: 0,
                totalMembers: teamSize,
              });

            // Update owner's profile
            await db
              .collection("Profiles")
              .doc(buyerId)
              .set(
                {
                  subscription: {
                    status: "active",
                    plan: "team",
                    type: "team",
                    teamId,
                    startDate: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt,
                    downloadsUsed: 0,
                    downloadLimit: 200,
                    billingCycle: billingCycle,
                    monthlyReset: new Date(
                      now + 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    price: 7 * teamSize, // $7 × teamSize
                  },
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );

            // Record transaction
            await db.collection("Transactions").doc().set({
              type: "subscription_payment",
              userId: buyerId,
              plan: "team",
              teamId,
              teamSize,
              amount,
              paymentIntentId: paymentIntent.id,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(
              `✅ Team subscription created (${teamId}) for ${buyerId}`
            );
          }

          // Update platform stats
          await db
            .collection("PlatformStats")
            .doc("revenue")
            .set(
              {
                subscriptionRevenue:
                  admin.firestore.FieldValue.increment(amount),
                totalRevenue: admin.firestore.FieldValue.increment(amount),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
        }

        // ============ ASSET PURCHASE HANDLING ============
        if (assetId && buyerId) {
          const assetRef = db.collection("Assets").doc(assetId);
          const assetSnap = await assetRef.get();

          if (assetSnap.exists) {
            const asset = assetSnap.data();
            const ownerId = asset.ownerId;

            // ============ IMPORTANT FIX ============
            // Detect if asset is paid (string "paid" से)
            let isPaidAsset = false;
            let assetPrice = amount; // Default: payment amount

            // Method 1: Check price field (string "paid" or number)
            if (asset.price) {
              if (typeof asset.price === "string") {
                // String "paid" को detect करें
                isPaidAsset = asset.price.toLowerCase() === "paid";
                assetPrice = isPaidAsset ? amount : 0;
              } else if (typeof asset.price === "number" && asset.price > 0) {
                isPaidAsset = true;
                assetPrice = asset.price;
              }
            }

            // Method 2: Check licenseType
            if (!isPaidAsset && asset.licenseType) {
              isPaidAsset = asset.licenseType.toLowerCase() !== "free use";
            }

            // Method 3: If still not sure, assume paid (because payment happened)
            if (!isPaidAsset && amount > 0) {
              isPaidAsset = true;
              console.log(
                `ℹ️ Assuming paid asset based on payment amount: $${amount}`
              );
            }
            // ============ FIX END ============

            // Free asset handling
            if (!isPaidAsset) {
              console.log(`ℹ️ Free asset ${assetId} accessed by ${buyerId}`);
              await db.collection("Downloads").doc().set({
                assetId,
                buyerId,
                ownerId,
                amount: 0,
                type: "free_access",
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
              });
              return;
            }

            // Check owner type: admin vs contributor
            const ownerProfileSnap = await db
              .collection("Profiles")
              .doc(ownerId)
              .get();
            const isAdmin =
              ownerProfileSnap.exists &&
              ownerProfileSnap.data().role === "admin";

            // 🆕 FIXED: Admin کو 100%, Contributor کو 40% commission
            let sellerEarning, companyEarning;
            if (isAdmin) {
              sellerEarning = amount; // Admin کو پوری amount
              companyEarning = 0; // Platform کو کچھ نہیں
            } else {
              sellerEarning = parseFloat((amount * 0.4).toFixed(6)); // Contributor کو 40%
              companyEarning = parseFloat((amount * 0.6).toFixed(6)); // Platform کو 60%
            }

            // Create purchase record
            await db
              .collection("Purchases")
              .doc()
              .set({
                assetId,
                buyerId,
                ownerId,
                sellerType: isAdmin ? "admin" : "contributor",
                amount,
                sellerEarning,
                companyEarning,
                paymentIntentId: paymentIntent.id,
                assetPrice: asset.price || amount,
                isPaidAsset: true,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
              });

            // Update asset stats
            await assetRef.update({
              salesCount: admin.firestore.FieldValue.increment(1),
              lastPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
              totalEarnings:
                admin.firestore.FieldValue.increment(sellerEarning),
            });

            // Credit seller earnings
            const ownerUpdate = {
              earnings: admin.firestore.FieldValue.increment(sellerEarning),
              totalEarnings:
                admin.firestore.FieldValue.increment(sellerEarning),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // 🆕 اگر contributor ہے تو Contributors collection میں بھی update کریں
            if (!isAdmin) {
              const contributorRef = db.collection("Contributors").doc(ownerId);
              await contributorRef.set(
                {
                  pendingPayout:
                    admin.firestore.FieldValue.increment(sellerEarning),
                  totalEarnings:
                    admin.firestore.FieldValue.increment(sellerEarning),
                  lastSaleDate: admin.firestore.FieldValue.serverTimestamp(),
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            }

            await db
              .collection("Profiles")
              .doc(ownerId)
              .set(ownerUpdate, { merge: true });

            // Update platform stats
            await db
              .collection("PlatformStats")
              .doc("revenue")
              .set(
                {
                  assetSalesRevenue:
                    admin.firestore.FieldValue.increment(companyEarning),
                  totalRevenue:
                    admin.firestore.FieldValue.increment(companyEarning),
                  lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );

            console.log(`✅ Paid asset ${assetId} purchased by ${buyerId}`);
            console.log(
              `💰 Seller (${
                isAdmin ? "admin" : "contributor"
              }) earned: $${sellerEarning}`
            );
            console.log(`🏢 Platform earned: $${companyEarning}`);
          } else {
            console.error(`❌ Asset not found: ${assetId}`);
          }
        }
      } catch (err) {
        console.error("❌ Webhook processing error:", err);
        // Important: Still respond 200 to Stripe
      }
    }

    // Always respond 200 to Stripe
    res.json({ received: true });
  }
);
// =============================
// EMAIL FUNCTIONS (UNCHANGED)
// =============================
const nodemailer = require("nodemailer");
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

// =============================
// GENERATE DOWNLOAD URL (ENHANCED)
// =============================
// exports.generateDownloadUrl = functions.https.onRequest(async (req, res) => {
//   // ✅ CORS headers
//   res.set("Access-Control-Allow-Origin", "*");
//   res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   if (req.method === "OPTIONS") {
//     return res.status(204).send("");
//   }

//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     // ✅ Authentication
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "Login required" });
//     }

//     const token = authHeader.split("Bearer ")[1];
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     const uid = decodedToken.uid;

//     console.log(`✅ User authenticated: ${uid}`);

//     // ✅ Get assetId
//     const { assetId } = req.body;
//     if (!assetId) {
//       return res.status(400).json({ error: "assetId required" });
//     }

//     const db = admin.firestore();

//     // ✅ **TRANSACTION**
//     const transactionResult = await db.runTransaction(async (transaction) => {
//       console.log("🔍 Starting transaction for asset:", assetId);

//       // ============ READ PHASE ============
//       const assetRef = db.collection("Assets").doc(assetId);
//       const assetSnap = await transaction.get(assetRef);
//       if (!assetSnap.exists) {
//         throw new Error("Asset not found");
//       }
//       const asset = assetSnap.data();

//       // ============ ✅ CRITICAL FIX: ADD DOWNLOAD TRACKING HERE ============

//       // 1️⃣ Update ASSET download count (for both individual & team)
//       transaction.update(assetRef, {
//         downloadsCount: (asset.downloadsCount || 0) + 1,
//         lastDownloadedAt: admin.firestore.FieldValue.serverTimestamp(),
//         updatedAt: admin.firestore.FieldValue.serverTimestamp()
//       });

//       console.log(`📈 Asset download count incremented: ${(asset.downloadsCount || 0) + 1}`);

//       // 2️⃣ Create download record in Downloads collection
//       const downloadId = `${uid}_${assetId}_${Date.now()}`;
//       const downloadRef = db.collection("Downloads").doc(downloadId);

//       transaction.set(downloadRef, {
//         id: downloadId,
//         assetId: assetId,
//         assetTitle: asset.title || "Untitled Asset",
//         assetType: asset.type || "unknown",
//         userId: uid,
//         userEmail: decodedToken.email || null,
//         userName: decodedToken.name || "User",
//         downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
//         timestamp: Date.now(),
//         downloadMethod: "direct", // or "team_subscription"
//         status: "completed"
//       });

//       console.log(`📝 Download record created: ${downloadId}`);

//       // 3️⃣ Update USER'S Profile collection
//       const userProfileRef = db.collection("Profiles").doc(uid);
//       const userProfileSnap = await transaction.get(userProfileRef);

//       if (userProfileSnap.exists) {
//         const userProfile = userProfileSnap.data();
//         const userTotalDownloads = userProfile.totalDownloads || 0;

//         transaction.update(userProfileRef, {
//           totalDownloads: userTotalDownloads + 1,
//           lastDownloadAt: admin.firestore.FieldValue.serverTimestamp(),
//           [`downloadHistory.${downloadId}`]: {
//             assetId: assetId,
//             assetTitle: asset.title || "Untitled",
//             downloadedAt: admin.firestore.FieldValue.serverTimestamp()
//           }
//         });

//         console.log(`👤 User profile updated. Total downloads: ${userTotalDownloads + 1}`);
//       }

//       // 4️⃣ CHECK IF THIS IS A TEAM DOWNLOAD & UPDATE TEAM COLLECTION
//       // First, check if user has any active team subscription
//       const userTeamsQuery = db.collection("Teams")
//         .where("members", "array-contains", uid)
//         .where("subscriptionStatus", "==", "active")
//         .limit(1);

//       const userTeamsSnap = await transaction.get(userTeamsQuery);

//       if (!userTeamsSnap.empty) {
//         // User is part of an active team
//         const teamDoc = userTeamsSnap.docs[0];
//         const teamId = teamDoc.id;
//         const teamData = teamDoc.data();

//         console.log(`👥 User ${uid} is part of active team: ${teamId}`);

//         // Update Team collection - Team's download stats
//         const teamRef = db.collection("Teams").doc(teamId);

//         // Get current team downloads
//         const currentTeamDownloads = teamData.totalDownloads || 0;

//         transaction.update(teamRef, {
//           totalDownloads: currentTeamDownloads + 1,
//           lastDownloadAt: admin.firestore.FieldValue.serverTimestamp(),
//           [`memberDownloads.${uid}`]: admin.firestore.FieldValue.increment(1),
//           [`assetDownloads.${assetId}`]: admin.firestore.FieldValue.increment(1)
//         });

//         console.log(`🏢 Team ${teamId} download count: ${currentTeamDownloads + 1}`);

//         // Create team-specific download record
//         const teamDownloadRef = db.collection("Teams").doc(teamId)
//           .collection("TeamDownloads").doc(downloadId);

//         transaction.set(teamDownloadRef, {
//           id: downloadId,
//           assetId: assetId,
//           assetTitle: asset.title || "Untitled",
//           downloadedBy: uid,
//           downloadedByEmail: decodedToken.email,
//           downloadedByName: decodedToken.name || "Team Member",
//           downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
//           teamId: teamId,
//           teamName: teamData.name || "Team"
//         });

//         console.log(`📊 Team download record created for team: ${teamId}`);

//         // Also update the main download record with team info
//         transaction.update(downloadRef, {
//           teamId: teamId,
//           teamName: teamData.name || "Team",
//           downloadMethod: "team_subscription"
//         });
//       } else {
//         console.log(`👤 User ${uid} is downloading as individual (no active team)`);
//       }

//       // ... [Keep all your existing purchase/subscription logic] ...
//       // ... [Keep your URL extraction logic] ...

//       return {
//         foundUrl,
//         filePath,
//         assetType: asset.type,
//         assetTitle: asset.title || "download",
//         isFirebaseStorageUrl,
//         // Return new counts for response
//         newDownloadCount: (asset.downloadsCount || 0) + 1,
//         isTeamDownload: !userTeamsSnap.empty
//       };
//     });

//     // ✅ Extract the result
//     const {
//       foundUrl,
//       filePath,
//       assetType,
//       assetTitle,
//       isFirebaseStorageUrl,
//       newDownloadCount,
//       isTeamDownload
//     } = transactionResult;

//     let downloadUrl = foundUrl;

//     // ✅ Generate signed URL if needed (keep your existing code)
//     if (isFirebaseStorageUrl) {
//       // ... [Your existing signed URL generation code] ...
//     }

//     // ✅ Set file name for response (keep your existing code)
//     let fileName = (assetTitle || "download").replace(/[^\w\s.-]/gi, "_");
//     // ... [Your existing file naming code] ...

//     // ✅ Success response with team info
//     console.log("✅ Transaction successful! File:", fileName);

//     return res.status(200).json({
//       success: true,
//       url: downloadUrl,
//       fileName: fileName,
//       isPublicUrl: true,
//       message: "Download ready",
//       forceDownload: true,
//       // Add tracking info
//       downloadCount: newDownloadCount,
//       isTeamDownload: isTeamDownload,
//       tracked: true
//     });

//   } catch (err) {
//     console.error("❌ Cloud Function error:", err);
//     console.error("❌ Error stack:", err.stack);

//     if (err.message.includes("Login required") || err.message.includes("token")) {
//       return res.status(401).json({ error: "Login required" });
//     } else if (err.message.includes("not found")) {
//       return res.status(404).json({ error: err.message });
//     } else if (err.message.includes("limit reached") || err.message.includes("permission")) {
//       return res.status(403).json({ error: err.message });
//     } else {
//       return res.status(500).json({
//         error: "Download failed: " + err.message,
//         details: process.env.NODE_ENV === "development" ? err.stack : undefined,
//       });
//     }
//   }
// });
exports.generateDownloadUrl = functions.https.onRequest(async (req, res) => {
  // ✅ CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Login required" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const userEmail = decodedToken.email || null;
    const userName = decodedToken.name || "User";

    console.log(`✅ User authenticated: ${uid} (${userEmail})`);

    // ✅ Get assetId
    const { assetId } = req.body;
    if (!assetId) {
      return res.status(400).json({ error: "assetId required" });
    }

    const db = admin.firestore();

    // ✅ **TRANSACTION - FIXED ORDER: READS FIRST, THEN WRITES**
    const transactionResult = await db.runTransaction(async (transaction) => {
      console.log("🔍 Starting transaction for asset:", assetId);

      // ============ PHASE 1: ALL READS FIRST ============
      console.log("📖 Phase 1: Reading all data...");

      // 1. Read Asset data
      const assetRef = db.collection("Assets").doc(assetId);
      const assetSnap = await transaction.get(assetRef);
      if (!assetSnap.exists) {
        throw new Error("Asset not found");
      }
      const asset = assetSnap.data();
      console.log(`✅ Asset found: ${asset.title || assetId}`);

      // 2. Read User Profile data
      const userProfileRef = db.collection("Profiles").doc(uid);
      const userProfileSnap = await transaction.get(userProfileRef);

      // 3. Read Team data (if any) - BEFORE ANY WRITES!
      let teamData = null;
      let teamId = null;

      const userTeamsQuery = db
        .collection("Teams")
        .where("members", "array-contains", uid)
        .where("subscriptionStatus", "==", "active")
        .limit(1);

      const userTeamsSnap = await transaction.get(userTeamsQuery);

      if (!userTeamsSnap.empty) {
        const teamDoc = userTeamsSnap.docs[0];
        teamId = teamDoc.id;
        teamData = teamDoc.data();
        console.log(`👥 User is in active team: ${teamId}`);
      }

      // 4. Check purchase/subscription logic (READS ONLY)
      // ... [Add your purchase validation reads here if any] ...

      // ============ PHASE 2: URL EXTRACTION (READ-ONLY) ============
      console.log("🔗 Phase 2: Extracting download URL...");

      // ✅ URL extraction functions
      const extractUrl = (data) => {
        if (!data) return null;

        if (typeof data === "string") return data;

        if (data && typeof data === "object") {
          if (data.url && typeof data.url === "string") return data.url;

          if (data.sizes && data.sizes.original) {
            if (typeof data.sizes.original === "string")
              return data.sizes.original;
            if (
              data.sizes.original &&
              typeof data.sizes.original === "object" &&
              data.sizes.original.url
            ) {
              return data.sizes.original.url;
            }
          }

          if (data.downloadUrl && typeof data.downloadUrl === "string")
            return data.downloadUrl;
        }

        return null;
      };

      const extractFilePath = (data) => {
        if (!data) return null;

        if (typeof data === "string") return data;

        if (data && typeof data === "object") {
          if (data.path && typeof data.path === "string") return data.path;
          if (data.filePath && typeof data.filePath === "string")
            return data.filePath;
          if (data.url && typeof data.url === "string") {
            const match = data.url.match(/\/o\/(.*?)\?/);
            return match ? decodeURIComponent(match[1]) : null;
          }
        }

        return null;
      };

      // Find download URL
      let foundUrl = null;
      let filePath = null;
      let isFirebaseStorageUrl = false;

      console.log("🔍 Looking for download URL for asset type:", asset.type);

      // Asset type based extraction
      const urlFields = {
        mockups: "mockupFile",
        models: "model",
        printables: "model",
        videos: "video",
        scripts: "script",
        graphics: "graphicsTemplate",
        fonts: "fontFile",
        "video-templates": "videoTemplateFile",
        hdris: "hdri",
        other: "other",
      };

      const fieldName = urlFields[asset.type];
      if (fieldName && asset[fieldName]) {
        foundUrl = extractUrl(asset[fieldName]);
        filePath = extractFilePath(asset[fieldName]);
      }

      // Special handling for arrays
      if (!foundUrl) {
        if (
          asset.type === "images" &&
          asset.images &&
          Array.isArray(asset.images) &&
          asset.images.length > 0
        ) {
          foundUrl = extractUrl(asset.images[0]);
          filePath = extractFilePath(asset.images[0]);
        } else if (
          asset.type === "icons" &&
          asset.icons &&
          Array.isArray(asset.icons) &&
          asset.icons.length > 0
        ) {
          foundUrl = extractUrl(asset.icons[0]);
          filePath = extractFilePath(asset.icons[0]);
        } else if (
          asset.type === "textures" &&
          asset.textures &&
          Array.isArray(asset.textures) &&
          asset.textures.length > 0
        ) {
          foundUrl = extractUrl(asset.textures[0]);
          filePath = extractFilePath(asset.textures[0]);
        }
      }

      // If still not found, try general fields
      if (!foundUrl) {
        const fallbackFields = [
          "downloadUrl",
          "filePath",
          "url",
          "file",
          "downloadLink",
          "fileUrl",
        ];
        for (const field of fallbackFields) {
          if (asset[field]) {
            foundUrl = extractUrl(asset[field]);
            filePath = extractFilePath(asset[field]);
            if (foundUrl) break;
          }
        }
      }

      // Validate found URL
      if (!foundUrl || typeof foundUrl !== "string" || foundUrl.trim() === "") {
        throw new Error(`No downloadable file found for ${asset.type} asset.`);
      }

      // Check if it's a Firebase Storage URL
      if (
        typeof foundUrl === "string" &&
        foundUrl.includes("firebasestorage.googleapis.com")
      ) {
        isFirebaseStorageUrl = true;
      }

      console.log("✅ URL extraction complete");

      // ============ PHASE 3: ALL WRITES (AFTER ALL READS) ============
      console.log("📝 Phase 3: Writing all updates...");

      // ✅ 1. Update ASSET download count
      transaction.update(assetRef, {
        downloadsCount: (asset.downloadsCount || 0) + 1,
        lastDownloadedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `📈 Asset download count incremented: ${
          (asset.downloadsCount || 0) + 1
        }`
      );

      // ✅ 2. Create download record
      const downloadId = `${uid}_${assetId}_${Date.now()}`;
      const downloadRef = db.collection("Downloads").doc(downloadId);

      const downloadData = {
        id: downloadId,
        assetId: assetId,
        assetTitle: asset.title || "Untitled Asset",
        assetType: asset.type || "unknown",
        userId: uid,
        userEmail: userEmail,
        userName: userName,
        downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: Date.now(),
        downloadMethod: "direct",
        status: "completed",
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      };

      // ✅ 3. Update USER Profile
      if (userProfileSnap.exists) {
        const userProfile = userProfileSnap.data();
        const userTotalDownloads = userProfile.totalDownloads || 0;

        transaction.update(userProfileRef, {
          totalDownloads: userTotalDownloads + 1,
          lastDownloadAt: admin.firestore.FieldValue.serverTimestamp(),
          [`downloadHistory.${downloadId}`]: {
            assetId: assetId,
            assetTitle: asset.title || "Untitled",
            downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        });

        console.log(
          `👤 User profile updated. Total downloads: ${userTotalDownloads + 1}`
        );
      }

      // ✅ 4. Update TEAM Collection (if team exists)
      if (teamId && teamData) {
        downloadData.teamId = teamId;
        downloadData.teamName = teamData.name || "Team";
        downloadData.downloadMethod = "team_subscription";

        const teamRef = db.collection("Teams").doc(teamId);
        const currentTeamDownloads = teamData.totalDownloads || 0;

        transaction.update(teamRef, {
          totalDownloads: currentTeamDownloads + 1,
          lastDownloadAt: admin.firestore.FieldValue.serverTimestamp(),
          [`memberDownloads.${uid}`]: admin.firestore.FieldValue.increment(1),
          [`assetDownloads.${assetId}`]:
            admin.firestore.FieldValue.increment(1),
        });

        console.log(
          `🏢 Team ${teamId} download count: ${currentTeamDownloads + 1}`
        );

        // Create team-specific download record
        const teamDownloadRef = db
          .collection("Teams")
          .doc(teamId)
          .collection("TeamDownloads")
          .doc(downloadId);

        transaction.set(teamDownloadRef, {
          id: downloadId,
          assetId: assetId,
          assetTitle: asset.title || "Untitled",
          downloadedBy: uid,
          downloadedByEmail: userEmail,
          downloadedByName: userName,
          downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
          teamId: teamId,
          teamName: teamData.name || "Team",
        });

        console.log(`📊 Team download record created`);
      }

      // Set the download record
      transaction.set(downloadRef, downloadData);
      console.log(`📝 Download record created: ${downloadId}`);

      return {
        foundUrl,
        filePath,
        assetType: asset.type,
        assetTitle: asset.title || "download",
        isFirebaseStorageUrl,
        newDownloadCount: (asset.downloadsCount || 0) + 1,
        isTeamDownload: !!(teamId && teamData),
      };
    });

    // ✅ Extract the result
    const {
      foundUrl,
      filePath,
      assetType,
      assetTitle,
      isFirebaseStorageUrl,
      newDownloadCount,
      isTeamDownload,
    } = transactionResult;

    let downloadUrl = foundUrl;

    // ✅ CRITICAL: FORCE DOWNLOAD IN BROWSER (User paid for this!)
    if (isFirebaseStorageUrl) {
      try {
        console.log("🔧 Generating signed URL for Firebase Storage...");

        let storagePath = filePath;

        // Extract path from URL if no filePath
        if (
          !storagePath &&
          foundUrl.includes("firebasestorage.googleapis.com")
        ) {
          const urlMatch = foundUrl.match(/\/o\/(.*?)\?/);
          if (urlMatch) {
            storagePath = decodeURIComponent(urlMatch[1]);
          }
        }

        if (storagePath) {
          const bucket = admin.storage().bucket();
          const file = bucket.file(storagePath);

          // ✅ Clean filename
          let fileNameForDownload = (assetTitle || "download")
            .replace(/[^\w\s.-]/gi, "_")
            .replace(/\s+/g, "_");

          // ✅ Add correct extension
          const getFileExtension = () => {
            if (typeof foundUrl === "string") {
              if (foundUrl.includes(".png")) return ".png";
              if (foundUrl.includes(".jpg") || foundUrl.includes(".jpeg"))
                return ".jpg";
              if (foundUrl.includes(".gif")) return ".gif";
              if (foundUrl.includes(".svg")) return ".svg";
              if (foundUrl.includes(".webp")) return ".webp";
              if (foundUrl.includes(".pdf")) return ".pdf";
              if (foundUrl.includes(".zip")) return ".zip";
              if (foundUrl.includes(".rar")) return ".rar";
              if (foundUrl.includes(".7z")) return ".7z";
              if (foundUrl.includes(".mp4")) return ".mp4";
              if (foundUrl.includes(".mov")) return ".mov";
              if (foundUrl.includes(".avi")) return ".avi";
              if (foundUrl.includes(".mp3")) return ".mp3";
              if (foundUrl.includes(".wav")) return ".wav";
              if (foundUrl.includes(".glb")) return ".glb";
              if (foundUrl.includes(".gltf")) return ".gltf";
              if (foundUrl.includes(".fbx")) return ".fbx";
              if (foundUrl.includes(".obj")) return ".obj";
              if (foundUrl.includes(".stl")) return ".stl";
              if (foundUrl.includes(".blend")) return ".blend";
              if (foundUrl.includes(".psd")) return ".psd";
              if (foundUrl.includes(".ai")) return ".ai";
              if (foundUrl.includes(".eps")) return ".eps";
              if (foundUrl.includes(".ttf")) return ".ttf";
              if (foundUrl.includes(".otf")) return ".otf";
              if (foundUrl.includes(".hdr")) return ".hdr";
              if (foundUrl.includes(".exr")) return ".exr";
              if (foundUrl.includes(".aep")) return ".aep";
              if (foundUrl.includes(".prproj")) return ".prproj";
              if (foundUrl.includes(".js")) return ".js";
              if (foundUrl.includes(".css")) return ".css";
              if (foundUrl.includes(".html")) return ".html";
              if (foundUrl.includes(".json")) return ".json";
              if (foundUrl.includes(".txt")) return ".txt";
            }

            // Fallback based on asset type
            switch (assetType) {
              case "images":
              case "icons":
              case "textures":
                return ".png";
              case "videos":
                return ".mp4";
              case "models":
              case "printables":
                return ".glb";
              case "fonts":
                return ".ttf";
              case "graphics":
                return ".psd";
              case "mockups":
                return ".zip";
              case "hdris":
                return ".hdr";
              case "video-templates":
                return ".aep";
              case "scripts":
                return ".js";
              default:
                return ".zip";
            }
          };

          const extension = getFileExtension();
          if (
            !fileNameForDownload.toLowerCase().endsWith(extension.toLowerCase())
          ) {
            fileNameForDownload += extension;
          }

          // ✅ CRITICAL: FORCE DOWNLOAD (NOT OPEN IN BROWSER)
          const [signedUrl] = await file.getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            // ✅ THIS IS KEY: Forces browser to download instead of opening
            responseDisposition: `attachment; filename="${encodeURIComponent(
              fileNameForDownload
            )}"`,
            // Optional: Force binary response type
            responseType: "arraybuffer",
          });

          downloadUrl = signedUrl;
          console.log("✅ Generated signed URL with FORCE DOWNLOAD header");
          console.log("📁 File will download as:", fileNameForDownload);
        }
      } catch (storageError) {
        console.error("❌ Error generating signed URL:", storageError);
        // Keep original URL as fallback
      }
    }

    // ✅ Set file name for response
    let fileName = (assetTitle || "download")
      .replace(/[^\w\s.-]/gi, "_")
      .replace(/\s+/g, "_");

    // Add extension if not present
    const addExtension = (filename, url, type) => {
      if (typeof url === "string") {
        if (url.includes(".png") && !filename.endsWith(".png"))
          return filename + ".png";
        if (
          (url.includes(".jpg") || url.includes(".jpeg")) &&
          !filename.endsWith(".jpg")
        )
          return filename + ".jpg";
        if (url.includes(".gif") && !filename.endsWith(".gif"))
          return filename + ".gif";
        if (url.includes(".svg") && !filename.endsWith(".svg"))
          return filename + ".svg";
        if (url.includes(".webp") && !filename.endsWith(".webp"))
          return filename + ".webp";
        if (url.includes(".pdf") && !filename.endsWith(".pdf"))
          return filename + ".pdf";
        if (url.includes(".zip") && !filename.endsWith(".zip"))
          return filename + ".zip";
        if (url.includes(".mp4") && !filename.endsWith(".mp4"))
          return filename + ".mp4";
        if (url.includes(".glb") && !filename.endsWith(".glb"))
          return filename + ".glb";
        if (url.includes(".psd") && !filename.endsWith(".psd"))
          return filename + ".psd";
      }

      switch (type) {
        case "images":
        case "icons":
        case "textures":
          return filename.endsWith(".png") ? filename : filename + ".png";
        case "videos":
          return filename.endsWith(".mp4") ? filename : filename + ".mp4";
        case "models":
        case "printables":
          return filename.endsWith(".glb") ? filename : filename + ".glb";
        case "fonts":
          return filename.endsWith(".ttf") ? filename : filename + ".ttf";
        case "graphics":
          return filename.endsWith(".psd") ? filename : filename + ".psd";
        case "mockups":
          return filename.endsWith(".zip") ? filename : filename + ".zip";
        default:
          return filename.endsWith(".zip") ? filename : filename + ".zip";
      }
    };

    fileName = addExtension(fileName, downloadUrl, assetType);

    // ✅ Success response
    console.log("✅ Transaction successful! Download ready.");

    return res.status(200).json({
      success: true,
      url: downloadUrl,
      fileName: fileName,
      isPublicUrl: true,
      message: "Download ready",
      forceDownload: true, // Frontend should use this to force download
      downloadCount: newDownloadCount,
      isTeamDownload: isTeamDownload,
      tracked: true,
      // ✅ Add instruction for frontend
      downloadInstructions:
        "Use this URL with download attribute or trigger download programmatically",
    });
  } catch (err) {
    console.error("❌ Cloud Function error:", err);
    console.error("❌ Error stack:", err.stack);

    // Handle transaction error specifically
    if (err.message.includes("Firestore transactions require all reads")) {
      console.error("⚠️ Transaction error: Reads must come before writes");
      return res.status(500).json({
        error: "Download failed due to system error. Please try again.",
        code: "TRANSACTION_ERROR",
      });
    }

    if (
      err.message.includes("Login required") ||
      err.message.includes("token")
    ) {
      return res.status(401).json({ error: "Login required" });
    } else if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    } else if (
      err.message.includes("limit reached") ||
      err.message.includes("permission")
    ) {
      return res.status(403).json({ error: err.message });
    } else {
      return res.status(500).json({
        error: "Download failed: " + err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }
});
// =============================
// MONTHLY RESET FUNCTION
// =============================

// =============================
// NEW: ADD TEAM MEMBER
// =============================
exports.addTeamMember = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  try {
    // Extract Authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: {
          message: "Login required",
          code: "unauthenticated",
        },
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminId = decodedToken.uid;

    const { teamId, memberEmail } = req.body;

    // Validate request body
    if (!teamId || !memberEmail) {
      return res.status(400).json({
        error: {
          message: "Missing required fields: teamId and memberEmail",
          code: "invalid-argument",
        },
      });
    }

    const db = admin.firestore();

    // Get team info
    const teamRef = db.collection("Teams").doc(teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return res.status(404).json({
        error: {
          message: "Team not found",
          code: "not-found",
        },
      });
    }

    const team = teamSnap.data();

    // Verify admin is team owner
    if (team.ownerId !== adminId) {
      return res.status(403).json({
        error: {
          message: "Only team owner can add members",
          code: "permission-denied",
        },
      });
    }

    // Check member limit
    if (team.members.length >= team.memberLimit) {
      return res.status(403).json({
        error: {
          message: "Team member limit reached",
          code: "resource-exhausted",
        },
      });
    }

    // Find user by email
    const usersQuery = await db
      .collection("Profiles")
      .where("email", "==", memberEmail)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      return res.status(404).json({
        error: {
          message: "User not found",
          code: "not-found",
        },
      });
    }

    const memberDoc = usersQuery.docs[0];
    const memberId = memberDoc.id;

    // Check if already a member
    if (team.members.includes(memberId)) {
      return res.status(409).json({
        error: {
          message: "User is already a team member",
          code: "already-exists",
        },
      });
    }

    // Add member to team
    await teamRef.update({
      members: admin.firestore.FieldValue.arrayUnion(memberId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update member's profile
    await db
      .collection("Profiles")
      .doc(memberId)
      .update({
        subscription: {
          status: "active",
          plan: "team",
          type: "team",
          teamId,
          startDate: admin.firestore.FieldValue.serverTimestamp(),
          downloadsUsed: 0,
          downloadLimit: 200,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Send invitation email
    await mailTransport.sendMail({
      from: `Sham Marianas <${process.env.LOGIN_EMAIL_USER}>`,
      to: memberEmail,
      subject: "You've been added to a team",
      html: `
        <h2>Team Invitation</h2>
        <p>You have been added to team <strong>${teamId}</strong>.</p>
        <p>You now have access to 200 downloads per month as part of this team subscription.</p>
        <br/>
        <strong>Sham Marianas Team</strong>
      `,
    });

    return res.status(200).json({
      success: true,
      teamId,
      memberId,
      message: "Member added successfully",
    });
  } catch (err) {
    console.error("Add team member error:", err);

    // Handle Firebase Auth errors
    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: {
          message: "Token expired",
          code: "unauthenticated",
        },
      });
    }

    if (
      err.code === "auth/id-token-revoked" ||
      err.code === "auth/invalid-id-token"
    ) {
      return res.status(401).json({
        error: {
          message: "Invalid token",
          code: "unauthenticated",
        },
      });
    }

    // For other errors
    return res.status(500).json({
      error: {
        message: err.message || "Internal server error",
        code: "internal",
      },
    });
  }
});
exports.resetDownloadsMonthly = onSchedule(
  {
    schedule: "0 0 1 * *",
    timeZone: "UTC",
    retryCount: 3, // Optional: retry if fails
  },
  async (event) => {
    try {
      const db = admin.firestore();

      // Reset individual downloads
      const profiles = await db.collection("Profiles").get();
      const batch = db.batch();
      let count = 0;

      profiles.docs.forEach((doc) => {
        if (doc.data().subscription) {
          batch.update(doc.ref, {
            "subscription.downloadsUsed": 0,
            "subscription.monthlyReset": new Date().toISOString(),
          });
          count++;
        }
      });

      await batch.commit();
      logger.log(`Reset ${count} individual user downloads`);

      // Reset team downloads
      const teams = await db.collection("Teams").get();
      const teamBatch = db.batch();
      let teamCount = 0;

      teams.docs.forEach((doc) => {
        teamBatch.update(doc.ref, {
          totalDownloadsUsed: 0,
        });
        teamCount++;
      });

      await teamBatch.commit();
      logger.log(`Reset ${teamCount} team downloads`);

      logger.log("Monthly reset completed successfully");
    } catch (err) {
      logger.error("Reset error:", err);
      throw err; // Important: throw error so Cloud Scheduler knows it failed
    }
  }
);
// =============================
// NEW: GET USER DASHBOARD
// =============================
exports.getUserDashboard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  try {
    const profileSnap = await db.collection("Profiles").doc(uid).get();

    if (!profileSnap.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const profile = profileSnap.data();
    const subscription = profile.subscription || {};

    // Get download history
    const downloadsSnap = await db
      .collection("Downloads")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const downloads = downloadsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get purchases
    const purchasesSnap = await db
      .collection("Purchases")
      .where("buyerId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const purchases = purchasesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get team info if applicable
    let teamInfo = null;
    if (subscription.type === "team" && subscription.teamId) {
      const teamSnap = await db
        .collection("Teams")
        .doc(subscription.teamId)
        .get();
      if (teamSnap.exists) {
        teamInfo = teamSnap.data();
      }
    }

    return {
      user: {
        displayName: profile.displayName,
        email: profile.email,
        role: profile.role || "user",
        earnings: profile.earnings || 0,
      },
      subscription: {
        ...subscription,
        downloadsLeft:
          subscription.downloadLimit - (subscription.downloadsUsed || 0),
      },
      team: teamInfo,
      stats: {
        totalDownloads: downloads.length,
        totalPurchases: purchases.length,
      },
      recentDownloads: downloads,
      recentPurchases: purchases,
    };
  } catch (err) {
    console.error("Dashboard error:", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});

// =============================
// NEW: PROCESS SELLER PAYOUT
// =============================
exports.processPayout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const { amount, payoutMethod } = data;
  const sellerId = context.auth.uid;

  const db = admin.firestore();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const profileRef = db.collection("Profiles").doc(sellerId);
      const profileSnap = await transaction.get(profileRef);

      if (!profileSnap.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      const profile = profileSnap.data();
      const currentEarnings = profile.earnings || 0;

      if (currentEarnings < amount) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Insufficient earnings balance"
        );
      }

      // Create payout record
      const payoutRef = db.collection("Payouts").doc();
      transaction.set(payoutRef, {
        sellerId,
        amount,
        payoutMethod,
        status: "pending",
        requestedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedAt: null,
      });

      // Deduct from earnings
      transaction.update(profileRef, {
        earnings: admin.firestore.FieldValue.increment(-amount),
        totalPayouts: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { payoutId: payoutRef.id };
    });

    // Send email notification
    await mailTransport.sendMail({
      from: `Sham Marianas Payouts <${process.env.LOGIN_EMAIL_USER}>`,
      to: profile.email,
      subject: "Payout Request Received",
      html: `
        <h2>Payout Request Confirmation</h2>
        <p>Your payout request has been received.</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Payout Method:</strong> ${payoutMethod}</p>
        <p><strong>Status:</strong> Pending approval</p>
        <p>You will receive payment within 3-5 business days.</p>
        <br/>
        <strong>Sham Marianas Team</strong>
      `,
    });

    return {
      success: true,
      payoutId: result.payoutId,
      message: "Payout request submitted",
    };
  } catch (err) {
    console.error("Payout error:", err);
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError("internal", err.message);
  }
});
