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

// 🔧 ADD THIS HELPER FUNCTION AT TOP (after imports, before stripeWebhook)
// 🔧 UPDATED HELPER FUNCTION - MATCHES YOUR CONTRIBUTOR SCHEMA
async function ensureContributorExists(db, ownerId) {
  try {
    const contributorRef = db.collection("Contributors").doc(ownerId);
    const contributorDoc = await contributorRef.get();

    if (!contributorDoc.exists) {
      console.log(`🆕 Creating contributor document for: ${ownerId}`);

      // Get profile data
      const profileDoc = await db.collection("Profiles").doc(ownerId).get();
      const profileData = profileDoc.exists ? profileDoc.data() : {};

      // ✅ MATCHING YOUR EXACT CONTRIBUTOR SCHEMA
      await contributorRef.set({
        uid: ownerId,
        username: profileData.username || "",
        email: profileData.email || "",
        fullName: profileData.fullName || "",
        role: "contributor",
        status: profileData.status || "verified",
        specialization: profileData.specialization || "",
        totalEarnings: 0,
        pendingEarnings: 0,
        approvedUploads: profileData.approvedUploads || 0,
        totalUploads: profileData.totalUploads || 0,
        rating: profileData.rating || 0,
        reviews: profileData.reviews || 0,
        createdAt:
          profileData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // ✅ ADDING ALL OTHER FIELDS FROM YOUR SCHEMA
        bio: profileData.bio || "",
        birthday: profileData.birthday || "",
        city: profileData.city || "",
        country: profileData.country || "",
        countryCode: profileData.countryCode || "",
        emailVerified: profileData.emailVerified || false,
        experience: profileData.experience || "beginner",
        joinDate:
          profileData.joinDate || admin.firestore.FieldValue.serverTimestamp(),
        lastLogin:
          profileData.lastLogin || admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        phone: profileData.phone || "",
        portfolio: profileData.portfolio || "",
        profilePic: profileData.profilePic || null,
        skills: profileData.skills || [],
      });

      console.log(
        `✅ Contributor document created with complete schema for: ${ownerId}`
      );
      return true;
    }

    return false; // Already exists
  } catch (error) {
    console.error(`❌ Error ensuring contributor exists: ${ownerId}`, error);
    throw error;
  }
}
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
// ===========================

const PER_DOWNLOAD_VALUE_INDIVIDUAL = 0.045; // $0.045 per download for individual plan
const SELLER_SHARE_INDIVIDUAL = 0.018; // Seller gets $0.018 per download
const COMPANY_SHARE_INDIVIDUAL = 0.027; // Platform gets $0.027 per download

const PER_DOWNLOAD_VALUE_TEAM = 0.035; // $0.035 per download for team plan
const SELLER_SHARE_TEAM = 0.014; // Seller gets $0.014 per download
const COMPANY_SHARE_TEAM = 0.021; // Platform gets $0.021 per download

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
        plan = metadata.plan.toLowerCase(); // "individual" or "team"
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

      // 🆕 NEW: Detect download count and payment type
      const downloadCount = parseInt(metadata.downloadCount || "1", 10);
      const paymentType = metadata.paymentType || "subscription"; // "subscription" or "per_download"
      const assetCategory = metadata.assetCategory || "uncategorized";

      try {
        // ============ PER-DOWNLOAD PAYMENT HANDLING ============
        if (paymentType === "per_download" && buyerId && assetId) {
          console.log(
            `💰 Per-download payment detected: ${downloadCount} download(s), ${plan} plan`
          );

          const assetRef = db.collection("Assets").doc(assetId);
          const assetSnap = await assetRef.get();

          if (!assetSnap.exists) {
            console.error(`❌ Asset not found: ${assetId}`);
            return res.json({ received: true });
          }

          const asset = assetSnap.data();
          const ownerId = asset.ownerId;
          const assetTitle = asset.title || "Untitled Asset";

          // ✅ 1. Calculate revenue based on subscription type
          let totalDownloadValue,
            sellerEarningPerDownload,
            companyEarningPerDownload;

          if (plan.toLowerCase() === "team") {
            totalDownloadValue = PER_DOWNLOAD_VALUE_TEAM * downloadCount;
            sellerEarningPerDownload = SELLER_SHARE_TEAM;
            companyEarningPerDownload = COMPANY_SHARE_TEAM;
          } else {
            totalDownloadValue = PER_DOWNLOAD_VALUE_INDIVIDUAL * downloadCount;
            sellerEarningPerDownload = SELLER_SHARE_INDIVIDUAL;
            companyEarningPerDownload = COMPANY_SHARE_INDIVIDUAL;
          }

          const sellerTotalEarning = sellerEarningPerDownload * downloadCount;
          const companyTotalEarning = companyEarningPerDownload * downloadCount;

          console.log(`📊 Revenue breakdown for ${downloadCount} download(s):`);
          console.log(`   Total value: $${totalDownloadValue.toFixed(3)}`);
          console.log(
            `   Seller share: $${sellerTotalEarning.toFixed(
              3
            )} ($${sellerEarningPerDownload} each)`
          );
          console.log(
            `   Platform share: $${companyTotalEarning.toFixed(
              3
            )} ($${companyEarningPerDownload} each)`
          );

          // ✅ 2. Get owner info (admin vs contributor)
          const ownerProfileSnap = await db
            .collection("Profiles")
            .doc(ownerId)
            .get();
          const isAdmin =
            ownerProfileSnap.exists && ownerProfileSnap.data().role === "admin";

          // 🎯 Admin gets 100%, Contributor gets the calculated share
          let finalSellerEarning, finalCompanyEarning;

          if (isAdmin) {
            finalSellerEarning = totalDownloadValue; // Admin gets everything
            finalCompanyEarning = 0;
          } else {
            finalSellerEarning = sellerTotalEarning;
            finalCompanyEarning = companyTotalEarning;
          }

          // ✅ 3. Create purchase record
          await db
            .collection("Purchases")
            .doc()
            .set({
              assetId,
              assetTitle,
              assetCategory: asset.category || assetCategory,
              buyerId,
              ownerId,
              sellerType: isAdmin ? "admin" : "contributor",
              paymentType: "per_download",
              subscriptionType: plan,
              downloadCount: downloadCount,
              amount: totalDownloadValue,
              sellerEarning: finalSellerEarning,
              companyEarning: finalCompanyEarning,
              perDownloadValue:
                plan === "team"
                  ? PER_DOWNLOAD_VALUE_TEAM
                  : PER_DOWNLOAD_VALUE_INDIVIDUAL,
              sellerSharePerDownload: sellerEarningPerDownload,
              companySharePerDownload: companyEarningPerDownload,
              paymentIntentId: paymentIntent.id,
              assetPrice: asset.price || totalDownloadValue,
              isPaidAsset: true,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

          // ✅ 4. Update asset stats
          await assetRef.update({
            salesCount: admin.firestore.FieldValue.increment(downloadCount),
            downloadRevenue:
              admin.firestore.FieldValue.increment(totalDownloadValue),
            lastPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            totalEarnings:
              admin.firestore.FieldValue.increment(finalSellerEarning),
          });

          // ✅ 5. Credit seller earnings
          const ownerUpdate = {
            earnings: admin.firestore.FieldValue.increment(finalSellerEarning),
            totalEarnings:
              admin.firestore.FieldValue.increment(finalSellerEarning),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          // Update Profiles collection
          await db
            .collection("Profiles")
            .doc(ownerId)
            .set(ownerUpdate, { merge: true });

          // 🆕 CRITICAL: Update Contributors collection for non-admin sellers
          // 🎯 UPDATED: Match YOUR contributor fields
          if (!isAdmin) {
            try {
              await ensureContributorExists(db, ownerId);

              const contributorRef = db.collection("Contributors").doc(ownerId);

              // ✅ ONLY UPDATE THESE TWO FIELDS
              await contributorRef.update({
                totalEarnings:
                  admin.firestore.FieldValue.increment(finalSellerEarning),
                pendingEarnings:
                  admin.firestore.FieldValue.increment(finalSellerEarning),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(), // Optional timestamp
              });

              console.log(
                `✅ Contributor ${ownerId} earnings updated: +$${finalSellerEarning.toFixed(
                  3
                )}`
              );
            } catch (contributorError) {
              console.error(
                `❌ Failed to update contributor ${ownerId}:`,
                contributorError
              );
            }
          }

          // ✅ 6. Update platform stats with category breakdown
          const finalAssetCategory = asset.category || assetCategory;

          await db
            .collection("PlatformStats")
            .doc("revenue")
            .set(
              {
                [`categoryBreakdown.${finalAssetCategory}`]:
                  admin.firestore.FieldValue.increment(finalCompanyEarning),
                [`downloadCountByCategory.${finalAssetCategory}`]:
                  admin.firestore.FieldValue.increment(downloadCount),
                perDownloadRevenue:
                  admin.firestore.FieldValue.increment(finalCompanyEarning),
                totalRevenue:
                  admin.firestore.FieldValue.increment(finalCompanyEarning),
                totalDownloads:
                  admin.firestore.FieldValue.increment(downloadCount),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

          // ✅ 7. Create transaction record
          await db.collection("Transactions").doc().set({
            type: "per_download_payment",
            userId: buyerId,
            subscriptionType: plan,
            assetId: assetId,
            assetTitle: assetTitle,
            downloadCount: downloadCount,
            amount: totalDownloadValue,
            sellerEarning: finalSellerEarning,
            companyEarning: finalCompanyEarning,
            paymentIntentId: paymentIntent.id,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(
            `✅ Per-download payment processed: ${downloadCount} download(s) of ${assetId}`
          );
          console.log(
            `💰 Final split: Seller=$${finalSellerEarning.toFixed(
              3
            )}, Platform=$${finalCompanyEarning.toFixed(3)}`
          );

          // Return early since per-download payment is handled
          return res.json({ received: true });
        }

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
                    perDownloadValue: PER_DOWNLOAD_VALUE_INDIVIDUAL, // 🆕 Added
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
                perDownloadValue: PER_DOWNLOAD_VALUE_TEAM, // 🆕 Added
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
                    perDownloadValue: PER_DOWNLOAD_VALUE_TEAM, // 🆕 Added
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
        if (assetId && buyerId && paymentType !== "per_download") {
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

            // 🆕 FIXED: Admin को 100%, Contributor को 40% commission
            let sellerEarning, companyEarning;
            if (isAdmin) {
              sellerEarning = amount; // Admin को पूरी amount
              companyEarning = 0; // Platform को कुछ नहीं
            } else {
              sellerEarning = parseFloat((amount * 0.4).toFixed(6)); // Contributor को 40%
              companyEarning = parseFloat((amount * 0.6).toFixed(6)); // Platform को 60%
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

            // 🆕 अगर contributor है तो Contributors collection में भी update करें
            if (!isAdmin) {
              try {
                await ensureContributorExists(db, ownerId);

                const contributorRef = db
                  .collection("Contributors")
                  .doc(ownerId);

                // ✅ ONLY UPDATE THESE TWO FIELDS
                await contributorRef.update({
                  totalEarnings:
                    admin.firestore.FieldValue.increment(sellerEarning),
                  pendingEarnings:
                    admin.firestore.FieldValue.increment(sellerEarning),
                  lastUpdated: admin.firestore.FieldValue.serverTimestamp(), // Optional timestamp
                });

                console.log(
                  `✅ Contributor ${ownerId} earnings updated: +$${sellerEarning.toFixed(
                    3
                  )}`
                );
              } catch (contributorError) {
                console.error(
                  `❌ Failed to update contributor ${ownerId}:`,
                  contributorError
                );
              }
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
      const ownerId = asset.ownerId;
      console.log(`✅ Asset found: ${asset.title || assetId}`);
      console.log(`👤 Asset owner: ${ownerId}`);

      // 2. Read User Profile data
      const userProfileRef = db.collection("Profiles").doc(uid);
      const userProfileSnap = await transaction.get(userProfileRef);

      // 3. Read Asset Owner Profile data (for checking if admin or contributor)
      const ownerProfileRef = db.collection("Profiles").doc(ownerId);
      const ownerProfileSnap = await transaction.get(ownerProfileRef);

      // 4. Read Team data (if any) - BEFORE ANY WRITES!
      let teamData = null;
      let teamId = null;
      let userSubscriptionPlan = "individual"; // Default to individual

      const userTeamsQuery = db
        .collection("Teams")
        .where("members", "array-contains", uid)
        .where("active", "==", true)
        .limit(1);

      const userTeamsSnap = await transaction.get(userTeamsQuery);

      if (!userTeamsSnap.empty) {
        const teamDoc = userTeamsSnap.docs[0];
        teamId = teamDoc.id;
        teamData = teamDoc.data();
        userSubscriptionPlan = "team";
        console.log(`👥 User is in active team: ${teamId}`);
      }

      // 5. Check if user has subscription/download credits
      let hasDownloadCredits = false;
      let remainingCredits = 0;

      if (userProfileSnap.exists) {
        const userProfile = userProfileSnap.data();

        if (
          userProfile.subscription &&
          userProfile.subscription.status === "active"
        ) {
          const subscription = userProfile.subscription;
          const downloadsUsed = subscription.downloadsUsed || 0;
          const downloadLimit = subscription.downloadLimit || 0;

          // Check if subscription is expired
          const now = new Date();
          const expiresAt = subscription.expiresAt
            ? new Date(
                subscription.expiresAt.toDate
                  ? subscription.expiresAt.toDate()
                  : subscription.expiresAt
              )
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

          if (expiresAt > now) {
            hasDownloadCredits = downloadsUsed < downloadLimit;
            remainingCredits = downloadLimit - downloadsUsed;
            userSubscriptionPlan = subscription.plan || "individual";

            console.log(
              `📊 User has ${remainingCredits} download credits remaining (${downloadsUsed}/${downloadLimit} used)`
            );
          } else {
            console.log(`⚠️ User subscription expired on ${expiresAt}`);
          }
        }
      }

      // 6. Check if user has already purchased this asset
      const existingPurchaseQuery = db
        .collection("Purchases")
        .where("assetId", "==", assetId)
        .where("buyerId", "==", uid)
        .limit(1);

      const existingPurchaseSnap = await transaction.get(existingPurchaseQuery);
      const hasExistingPurchase = !existingPurchaseSnap.empty;

      if (hasExistingPurchase) {
        console.log(`✅ User already purchased this asset`);
        hasDownloadCredits = true; // Allow download if already purchased
      }

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
        assetCategory: asset.category || "uncategorized",
        userId: uid,
        userEmail: userEmail,
        userName: userName,
        ownerId: ownerId,
        downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: Date.now(),
        downloadMethod: hasDownloadCredits
          ? "subscription"
          : "requires_payment",
        status: "completed",
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        requiresPayment: !hasDownloadCredits,
        subscriptionPlan: userSubscriptionPlan,
      };

      // ✅ 3. Update USER Profile
      if (userProfileSnap.exists) {
        const userProfile = userProfileSnap.data();
        const userTotalDownloads = userProfile.totalDownloads || 0;

        const userUpdate = {
          totalDownloads: userTotalDownloads + 1,
          lastDownloadAt: admin.firestore.FieldValue.serverTimestamp(),
          [`downloadHistory.${downloadId}`]: {
            assetId: assetId,
            assetTitle: asset.title || "Untitled",
            downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        };

        // If user has subscription credits, decrement them
        if (
          hasDownloadCredits &&
          userProfile.subscription &&
          userProfile.subscription.status === "active"
        ) {
          userUpdate[`subscription.downloadsUsed`] =
            admin.firestore.FieldValue.increment(1);
        }

        transaction.update(userProfileRef, userUpdate);

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

      // ✅ 5. CRITICAL: Calculate and record revenue for per-download
      // This is where we handle the per-download earnings logic
      if (hasDownloadCredits && !hasExistingPurchase) {
        // User is using subscription credits for this download
        // Calculate revenue for the asset owner (contributor)

        // Check if owner is admin or contributor
        const isAdmin =
          ownerProfileSnap.exists && ownerProfileSnap.data().role === "admin";

        // Calculate revenue based on subscription type
        let perDownloadValue, sellerEarning, companyEarning;

        if (userSubscriptionPlan === "team") {
          perDownloadValue = PER_DOWNLOAD_VALUE_TEAM;
          sellerEarning = SELLER_SHARE_TEAM;
          companyEarning = COMPANY_SHARE_TEAM;
        } else {
          perDownloadValue = PER_DOWNLOAD_VALUE_INDIVIDUAL;
          sellerEarning = SELLER_SHARE_INDIVIDUAL;
          companyEarning = COMPANY_SHARE_INDIVIDUAL;
        }

        // Admin gets 100%, Contributor gets calculated share
        let finalSellerEarning, finalCompanyEarning;

        if (isAdmin) {
          finalSellerEarning = perDownloadValue; // Admin gets everything
          finalCompanyEarning = 0;
        } else {
          finalSellerEarning = sellerEarning;
          finalCompanyEarning = companyEarning;
        }

        // Add revenue data to download record
        downloadData.revenueGenerated = true;
        downloadData.perDownloadValue = perDownloadValue;
        downloadData.sellerEarning = finalSellerEarning;
        downloadData.companyEarning = finalCompanyEarning;
        downloadData.sellerType = isAdmin ? "admin" : "contributor";

        console.log(`💰 Revenue calculated for download:`);
        console.log(`   Subscription: ${userSubscriptionPlan}`);
        console.log(`   Per download value: $${perDownloadValue}`);
        console.log(`   Seller earning: $${finalSellerEarning}`);
        console.log(`   Platform earning: $${finalCompanyEarning}`);

        // ✅ Create a purchase record for this subscription-based download
        const purchaseId = `purchase_${uid}_${assetId}_${Date.now()}`;
        const purchaseRef = db.collection("Purchases").doc(purchaseId);

        transaction.set(purchaseRef, {
          id: purchaseId,
          assetId: assetId,
          assetTitle: asset.title || "Untitled Asset",
          assetCategory: asset.category || "uncategorized",
          buyerId: uid,
          ownerId: ownerId,
          sellerType: isAdmin ? "admin" : "contributor",
          paymentType: "subscription_download",
          subscriptionType: userSubscriptionPlan,
          downloadCount: 1,
          amount: perDownloadValue,
          sellerEarning: finalSellerEarning,
          companyEarning: finalCompanyEarning,
          perDownloadValue: perDownloadValue,
          sellerSharePerDownload: sellerEarning,
          companySharePerDownload: companyEarning,
          isPaidAsset: true,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ✅ Update owner's earnings (if contributor)
        if (!isAdmin) {
          const contributorRef = db.collection("Contributors").doc(ownerId);

          // We can't read and write the same document in a transaction
          // So we'll update it after the transaction
          downloadData.needsContributorUpdate = true;
          downloadData.contributorEarning = finalSellerEarning;
        }

        // ✅ Update asset's total earnings
        transaction.update(assetRef, {
          totalEarnings:
            admin.firestore.FieldValue.increment(finalSellerEarning),
        });

        console.log(`📝 Purchase record created for subscription download`);
      }

      // Set the download record
      transaction.set(downloadRef, downloadData);
      console.log(`📝 Download record created: ${downloadId}`);

      return {
        foundUrl,
        filePath,
        assetType: asset.type,
        assetTitle: asset.title || "download",
        assetCategory: asset.category || "uncategorized",
        isFirebaseStorageUrl,
        newDownloadCount: (asset.downloadsCount || 0) + 1,
        isTeamDownload: !!(teamId && teamData),
        requiresPayment: !hasDownloadCredits,
        hasExistingPurchase: hasExistingPurchase,
        subscriptionPlan: userSubscriptionPlan,
        perDownloadValue:
          userSubscriptionPlan === "team"
            ? PER_DOWNLOAD_VALUE_TEAM
            : PER_DOWNLOAD_VALUE_INDIVIDUAL,
        hasDownloadCredits: hasDownloadCredits,
        downloadData: downloadData, // Return for post-transaction updates
      };
    });

    // ✅ POST-TRANSACTION UPDATES (Outside transaction)
    // Update contributor earnings if needed
    // ✅ POST-TRANSACTION UPDATES - MATCH YOUR FIELDS
    // ✅ POST-TRANSACTION UPDATES - ONLY TWO FIELDS
    if (
      transactionResult.downloadData &&
      transactionResult.downloadData.needsContributorUpdate
    ) {
      try {
        const ownerId = transactionResult.downloadData.ownerId;
        const contributorEarning =
          transactionResult.downloadData.contributorEarning;

        // 1. Ensure contributor exists
        await ensureContributorExists(db, ownerId);

        // 2. Update ONLY earnings fields
        await db
          .collection("Contributors")
          .doc(ownerId)
          .update({
            totalEarnings:
              admin.firestore.FieldValue.increment(contributorEarning),
            pendingEarnings:
              admin.firestore.FieldValue.increment(contributorEarning),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(), // Optional
          });

        console.log(
          `✅ Contributor ${ownerId} earnings updated: +$${contributorEarning.toFixed(
            3
          )}`
        );
      } catch (contributorError) {
        console.error("❌ Error updating contributor:", contributorError);
      }
    }

    // ✅ Extract the result
    const {
      foundUrl,
      filePath,
      assetType,
      assetTitle,
      assetCategory,
      isFirebaseStorageUrl,
      newDownloadCount,
      isTeamDownload,
      requiresPayment,
      hasExistingPurchase,
      subscriptionPlan,
      perDownloadValue,
      hasDownloadCredits,
    } = transactionResult;

    // If download requires payment, return payment info instead of URL
    if (requiresPayment && !hasExistingPurchase) {
      console.log(`💰 Download requires payment. User has no credits.`);

      return res.status(402).json({
        success: false,
        requiresPayment: true,
        subscriptionPlan: subscriptionPlan,
        perDownloadValue: perDownloadValue,
        assetId: assetId,
        assetTitle: assetTitle,
        message: "Payment required for download",
        paymentInfo: {
          amount: perDownloadValue,
          description: `Download: ${assetTitle}`,
          metadata: {
            paymentType: "per_download",
            downloadCount: "1",
            plan: subscriptionPlan,
            assetId: assetId,
            assetCategory: assetCategory,
            userId: uid,
          },
        },
      });
    }

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

    const responseData = {
      success: true,
      url: downloadUrl,
      fileName: fileName,
      isPublicUrl: true,
      message: "Download ready",
      forceDownload: true,
      downloadCount: newDownloadCount,
      isTeamDownload: isTeamDownload,
      tracked: true,
      downloadInstructions:
        "Use this URL with download attribute or trigger download programmatically",
    };

    // Add payment info if this was a paid download
    if (hasDownloadCredits && !hasExistingPurchase) {
      responseData.paymentApplied = true;
      responseData.subscriptionPlan = subscriptionPlan;
      responseData.perDownloadValue = perDownloadValue;
      responseData.creditsUsed = true;
    }

    return res.status(200).json(responseData);
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
