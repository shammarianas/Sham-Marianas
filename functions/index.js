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

          // ✅ FIXED: Use update() for seller earnings to preserve existing fields
          await db
            .collection("Profiles")
            .doc(ownerId)
            .update({
              earnings:
                admin.firestore.FieldValue.increment(finalSellerEarning),
              totalEarnings:
                admin.firestore.FieldValue.increment(finalSellerEarning),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          // 🆕 CRITICAL: Update Contributors collection for non-admin sellers
          if (!isAdmin) {
            try {
              await ensureContributorExists(db, ownerId);

              const contributorRef = db.collection("Contributors").doc(ownerId);
              await contributorRef.update({
                totalEarnings:
                  admin.firestore.FieldValue.increment(finalSellerEarning),
                pendingEarnings:
                  admin.firestore.FieldValue.increment(finalSellerEarning),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
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

          return res.json({ received: true });
        }

        // ============ SUBSCRIPTION HANDLING ============
        if (plan && buyerId && buyerId !== "guest") {
          const now = Date.now();

          // ✅ FIXED: Calculate expiration based on billing cycle
          let expiresAt;
          let monthlyResetDate;
          let subscriptionPrice;
          let perMemberPrice;

          if (billingCycle === "yearly") {
            // Yearly subscription: 365 days
            expiresAt = admin.firestore.Timestamp.fromMillis(
              now + 365 * 24 * 60 * 60 * 1000
            );
            monthlyResetDate = new Date(
              now + 30 * 24 * 60 * 60 * 1000
            ).toISOString();

            // Set price based on plan for yearly
            if (plan === "individual") {
              subscriptionPrice = 108; // $108/year
            } else if (plan === "team") {
              perMemberPrice = 96;
              subscriptionPrice = 96 * teamSize;
            }
          } else {
            // Monthly subscription: 30 days (default)
            expiresAt = admin.firestore.Timestamp.fromMillis(
              now + 30 * 24 * 60 * 60 * 1000
            );
            monthlyResetDate = new Date(
              now + 30 * 24 * 60 * 60 * 1000
            ).toISOString();

            // Set price based on plan for monthly
            if (plan === "individual") {
              subscriptionPrice = 9; // $9/month
            } else if (plan === "team") {
              perMemberPrice = 8;
              subscriptionPrice = 8 * teamSize;
            }
          }

          // Get the current user profile first
          const userProfileRef = db.collection("Profiles").doc(buyerId);
          const userProfileSnap = await userProfileRef.get();
          let userProfile = {};

          if (userProfileSnap.exists) {
            userProfile = userProfileSnap.data();
          }

          // INDIVIDUAL SUBSCRIPTION
          if (plan === "individual") {
            const subscriptionData = {
              status: "active",
              plan: "individual",
              type: "individual",
              startDate: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: expiresAt,
              downloadsUsed: 0,
              downloadLimit: 200,
              billingCycle: billingCycle,
              monthlyReset: monthlyResetDate,
              price: subscriptionPrice,
              perDownloadValue: PER_DOWNLOAD_VALUE_INDIVIDUAL,
              isYearly: billingCycle === "yearly",
              yearlyPrice: billingCycle === "yearly" ? 108 : null,
              monthlyPrice: billingCycle === "monthly" ? 9 : null,
            };

            // ✅ ULTRA-SIMPLE: Use set with merge for subscription field only
            await userProfileRef.set(
              {
                subscription: subscriptionData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            console.log(`✅ Individual subscription saved for ${buyerId}`);
          }

          // TEAM SUBSCRIPTION
          else if (plan === "team") {
            const teamId = `team_${buyerId}_${Date.now()}`;
            const downloadsPerMember = 200; // 200 per month even for yearly

            // Create team document
            await db
              .collection("Teams")
              .doc(teamId)
              .set({
                ownerId: buyerId,
                teamId: teamId,
                members: [buyerId],
                memberLimit: Math.min(teamSize, 10),
                perMemberPrice: perMemberPrice,
                plan: "team",
                active: true,
                startDate: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: expiresAt,
                downloadsPerMember: downloadsPerMember,
                totalMembers: teamSize,
                perDownloadValue: PER_DOWNLOAD_VALUE_TEAM,
                billingCycle: billingCycle,
                isYearly: billingCycle === "yearly",
                yearlyPrice: billingCycle === "yearly" ? 96 * teamSize : null,
                monthlyPrice: billingCycle === "monthly" ? 8 * teamSize : null,
              });

            // ✅ FIXED: Use set() with merge: true to preserve all existing fields
            const subscriptionData = {
              status: "active",
              plan: "team",
              type: "team",
              teamId: teamId,
              startDate: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: expiresAt,
              downloadsUsed: 0,
              totalMembers: teamSize,
              downloadLimit: 200,
              billingCycle: billingCycle,
              monthlyReset: monthlyResetDate,
              price: subscriptionPrice,
              perDownloadValue: PER_DOWNLOAD_VALUE_TEAM,
              isYearly: billingCycle === "yearly",
              yearlyPrice: billingCycle === "yearly" ? 96 * teamSize : null,
              monthlyPrice: billingCycle === "monthly" ? 8 * teamSize : null,
            };

            // ✅ ULTRA-SIMPLE: Use set with merge for subscription field only
            await userProfileRef.set(
              {
                subscription: subscriptionData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            console.log(`✅ Team subscription saved for ${buyerId}`);

            // Record transaction
            await db.collection("Transactions").doc().set({
              type: "subscription_payment",
              userId: buyerId,
              plan: "team",
              billingCycle: billingCycle,
              teamId: teamId,
              teamSize: teamSize,
              amount: amount,
              paymentIntentId: paymentIntent.id,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(
              `✅ Team ${billingCycle} subscription created (${teamId}) for ${buyerId}`
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

            // Detect if asset is paid
            let isPaidAsset = false;
            let assetPrice = amount;

            if (asset.price) {
              if (typeof asset.price === "string") {
                isPaidAsset = asset.price.toLowerCase() === "paid";
                assetPrice = isPaidAsset ? amount : 0;
              } else if (typeof asset.price === "number" && asset.price > 0) {
                isPaidAsset = true;
                assetPrice = asset.price;
              }
            }

            if (!isPaidAsset && asset.licenseType) {
              isPaidAsset = asset.licenseType.toLowerCase() !== "free use";
            }

            if (!isPaidAsset && amount > 0) {
              isPaidAsset = true;
              console.log(
                `ℹ️ Assuming paid asset based on payment amount: $${amount}`
              );
            }

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

            // Calculate earnings
            let sellerEarning, companyEarning;
            if (isAdmin) {
              sellerEarning = amount;
              companyEarning = 0;
            } else {
              sellerEarning = parseFloat((amount * 0.4).toFixed(6));
              companyEarning = parseFloat((amount * 0.6).toFixed(6));
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

            // ✅ FIXED: Use update() for seller earnings
            await db
              .collection("Profiles")
              .doc(ownerId)
              .update({
                earnings: admin.firestore.FieldValue.increment(sellerEarning),
                totalEarnings:
                  admin.firestore.FieldValue.increment(sellerEarning),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

            // Update contributor if not admin
            if (!isAdmin) {
              try {
                await ensureContributorExists(db, ownerId);
                await db
                  .collection("Contributors")
                  .doc(ownerId)
                  .update({
                    totalEarnings:
                      admin.firestore.FieldValue.increment(sellerEarning),
                    pendingEarnings:
                      admin.firestore.FieldValue.increment(sellerEarning),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
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

// =============================
// CONTACT FORM EMAIL FUNCTION
// =============================
exports.sendContactFormEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Missing required fields: name, email, and message are required",
      });
    }

    // Generate a unique ID for tracking
    const submissionId = `CONTACT_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log(
      `📧 Processing contact form submission: ${submissionId} from ${email}`
    );

    // Email to your business
    const mailOptionsToBusiness = {
      from: `"Sham Marianas Contact" <${process.env.LOGIN_EMAIL_USER}>`,
      to: "saeedasif09876@gmail.com",
      cc: process.env.LOGIN_EMAIL_USER, // Optional: Also send to admin
      subject: `[Contact Form] ${subject || "New Message from Website"}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0; }
                .label { font-weight: bold; color: #555; }
                .submission-id { background: #e8f5e9; padding: 10px; border-radius: 4px; font-family: monospace; }
                .message-content { background: white; padding: 15px; border: 1px solid #eee; border-radius: 4px; margin: 15px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>📬 New Contact Form Submission</h2>
                    <p>Submission ID: <strong>${submissionId}</strong></p>
                </div>
                
                <div class="content">
                    <div class="info-box">
                        <p><span class="label">Submission ID:</span> <span class="submission-id">${submissionId}</span></p>
                        <p><span class="label">Name:</span> ${name}</p>
                        <p><span class="label">Email:</span> ${email}</p>
                        <p><span class="label">Received:</span> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <h3>📝 Contact Details</h3>
                    <p><span class="label">Subject:</span> ${
                      subject || "Not specified"
                    }</p>
                    
                    <h3>📄 Message:</h3>
                    <div class="message-content">
                        ${message.replace(/\n/g, "<br>")}
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
                        <h4>🚀 Quick Actions:</h4>
                        <p>1. Reply to: <a href="mailto:${email}">${email}</a></p>
                        <p>2. Call back if needed</p>
                        <p>3. Add to CRM system</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This email was automatically generated by Sham Marianas Contact Form.</p>
                    <p>Submission Time: ${new Date().toLocaleString()}</p>
                    <p>No data stored in Firebase - Direct email notification only.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
        NEW CONTACT FORM SUBMISSION - ${submissionId}
        
        ============================================
        SUBMISSION ID: ${submissionId}
        NAME: ${name}
        EMAIL: ${email}
        RECEIVED: ${new Date().toLocaleString()}
        
        ============================================
        SUBJECT: ${subject || "Not specified"}
        
        MESSAGE:
        ${message}
        
        ============================================
        QUICK ACTIONS:
        1. Reply to: ${email}
        2. Call back if needed
        3. Add to CRM system
        
        ============================================
        Auto-generated by Sham Marianas Contact Form
        No data stored in Firebase - Direct email only.
        ${new Date().toLocaleString()}
      `,
    };

    // Email confirmation to user
    const mailOptionsToUser = {
      from: `"Sham Marianas" <${process.env.LOGIN_EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Contacting Sham Marianas",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .contact-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thank You, ${name}!</h1>
                    <p>We've received your message and will respond within 24-48 hours.</p>
                </div>
                
                <div class="content">
                    <h3>📋 Your Message Summary:</h3>
                    <p><strong>Reference ID:</strong> ${submissionId}</p>
                    <p><strong>Subject:</strong> ${
                      subject || "Not specified"
                    }</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        ${message.replace(/\n/g, "<br>")}
                    </div>
                    
                    <hr>
                    
                    <div class="contact-info">
                        <h3>📞 Our Contact Information</h3>
                        <p><strong>Dubai Office:</strong> +971 52 803 6012</p>
                        <p><strong>Pakistan Office:</strong> +92 311 678 8423</p>
                        <p><strong>Email:</strong> saeedasif09876@gmail.com</p>
                        
                        <div style="margin-top: 20px;">
                            <h4>Follow Us:</h4>
                            <p>
                                <a href="https://www.facebook.com/shammarianas/">Facebook</a> | 
                                <a href="https://www.instagram.com/sham_marianas/">Instagram</a> | 
                                <a href="https://twitter.com/shammarianas">Twitter</a> | 
                                <a href="https://www.linkedin.com/in/shammarianas/">LinkedIn</a>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is an automated confirmation. Please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} Sham Marianas. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    try {
      // Send both emails
      await mailTransport.sendMail(mailOptionsToBusiness);
      await mailTransport.sendMail(mailOptionsToUser);

      console.log(
        `✅ Contact form email sent: ${submissionId} to saeedasif09876@gmail.com`
      );
      console.log(`✅ Confirmation email sent to user: ${email}`);

      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        submissionId: submissionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error sending contact form email:", error);
      return res.status(500).json({ error: error.message });
    }
  });
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
// EMAIL SUPPORT COMPLAINTS
// =============================
exports.sendSupportComplaintEmail = functions.firestore.onDocumentCreated(
  "Profiles/{userId}/Support/{complaintId}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.error("No data associated with the event");
        return;
      }

      const complaintData = snapshot.data();
      const {
        complaintId,
        subject,
        description,
        issueType,
        email: userEmail,
        userType,
        createdAt,
        status = "pending",
      } = complaintData;

      console.log(
        `📧 Processing support complaint: ${complaintId} from ${userEmail}`
      );

      // Format the email content
      const mailOptions = {
        from: `"Sham Marianas Support" <${process.env.LOGIN_EMAIL_USER}>`,
        to: "info@shammarianas.com",
        cc: process.env.LOGIN_EMAIL_USER, // Also send to admin for tracking
        subject: `[Support Complaint ${complaintId}] ${subject}`,
        html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                            .info-box { background: white; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0; }
                            .label { font-weight: bold; color: #555; }
                            .status-pending { color: #ff9800; font-weight: bold; }
                            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px; }
                            .complaint-id { background: #e8f5e9; padding: 10px; border-radius: 4px; font-family: monospace; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>🆘 New Support Complaint Received</h2>
                                <p>Complaint ID: <strong>${complaintId}</strong></p>
                            </div>
                            
                            <div class="content">
                                <div class="info-box">
                                    <p><span class="label">Complaint ID:</span> <span class="complaint-id">${complaintId}</span></p>
                                    <p><span class="label">User Type:</span> ${userType}</p>
                                    <p><span class="label">User Email:</span> ${userEmail}</p>
                                    <p><span class="label">Status:</span> <span class="status-pending">${status}</span></p>
                                    <p><span class="label">Submitted:</span> ${
                                      createdAt?.toDate().toLocaleString() ||
                                      new Date().toLocaleString()
                                    }</p>
                                </div>
                                
                                <h3>📝 Complaint Details</h3>
                                <p><span class="label">Subject:</span> ${subject}</p>
                                <p><span class="label">Issue Type:</span> ${issueType}</p>
                                
                                <h3>📄 Description:</h3>
                                <div style="background: white; padding: 15px; border: 1px solid #eee; border-radius: 4px;">
                                    ${description.replace(/\n/g, "<br>")}
                                </div>
                                
                                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
                                    <h4>🚀 Action Required:</h4>
                                    <p>1. Review this complaint in Firebase Console</p>
                                    <p>2. Update status: <code>Profiles/${
                                      event.params.userId
                                    }/Support/${
          event.params.complaintId
        }</code></p>
                                    <p>3. Respond to user at: ${userEmail}</p>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p>This email was automatically generated by Sham Marianas Support System.</p>
                                <p>Firestore Path: Profiles/${
                                  event.params.userId
                                }/Support/${event.params.complaintId}</p>
                                <p>Timestamp: ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
        // Plain text version for email clients that don't support HTML
        text: `
                    NEW SUPPORT COMPLAINT - ${complaintId}
                    
                    ============================================
                    COMPLAINT ID: ${complaintId}
                    USER TYPE: ${userType}
                    USER EMAIL: ${userEmail}
                    STATUS: ${status}
                    SUBMITTED: ${
                      createdAt?.toDate().toLocaleString() ||
                      new Date().toLocaleString()
                    }
                    
                    ============================================
                    SUBJECT: ${subject}
                    ISSUE TYPE: ${issueType}
                    
                    DESCRIPTION:
                    ${description}
                    
                    ============================================
                    ACTION REQUIRED:
                    1. Review in Firebase Console
                    2. Update status at: Profiles/${
                      event.params.userId
                    }/Support/${event.params.complaintId}
                    3. Respond to user: ${userEmail}
                    
                    ============================================
                    Auto-generated by Sham Marianas Support System
                    ${new Date().toLocaleString()}
                `,
      };

      // Send the email
      await mailTransport.sendMail(mailOptions);
      console.log(
        `✅ Support complaint email sent for: ${complaintId} to info@shammarianas.com
`
      );

      // Optionally, also update the complaint document to mark email sent
      const db = admin.firestore();
      await snapshot.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailRecipient: "info@shammarianas.com",
      });
    } catch (error) {
      console.error("❌ Error sending support complaint email:", error);

      // Log error to Firestore for debugging
      try {
        await event.data.ref.update({
          emailError: error.message,
          emailSent: false,
        });
      } catch (updateError) {
        console.error("Failed to update error status:", updateError);
      }
    }
  }
);

// Also trigger for Contributors collection
exports.sendContributorSupportComplaintEmail =
  functions.firestore.onDocumentCreated(
    "Contributors/{userId}/Support/{complaintId}",
    async (event) => {
      // Same implementation as above, but for Contributors collection
      try {
        const snapshot = event.data;
        if (!snapshot) {
          console.error("No data associated with the event");
          return;
        }

        const complaintData = snapshot.data();
        const {
          complaintId,
          subject,
          description,
          issueType,
          email: userEmail,
          userType = "contributor",
          createdAt,
          status = "pending",
        } = complaintData;

        console.log(
          `📧 Processing contributor support complaint: ${complaintId} from ${userEmail}`
        );

        const mailOptions = {
          from: `"Sham Marianas Support" <${process.env.LOGIN_EMAIL_USER}>`,
          to: "info@shammarianas.com",
          cc: process.env.LOGIN_EMAIL_USER,
          subject: `[CONTRIBUTOR Support ${complaintId}] ${subject}`,
          html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                            <h2>👥 CONTRIBUTOR Support Complaint</h2>
                            <p><strong>Complaint ID:</strong> ${complaintId}</p>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
                            <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50;">
                                <p><strong>📋 Complaint ID:</strong> <code>${complaintId}</code></p>
                                <p><strong>👤 User Type:</strong> ${userType}</p>
                                <p><strong>📧 User Email:</strong> ${userEmail}</p>
                                <p><strong>📅 Submitted:</strong> ${
                                  createdAt?.toDate().toLocaleString() ||
                                  new Date().toLocaleString()
                                }</p>
                                <p><strong>🔧 Issue Type:</strong> ${issueType}</p>
                            </div>
                            
                            <h3>📝 Subject:</h3>
                            <p>${subject}</p>
                            
                            <h3>📄 Description:</h3>
                            <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
                                ${description.replace(/\n/g, "<br>")}
                            </div>
                            
                            <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 4px;">
                                <h4>🚀 Priority: CONTRIBUTOR ISSUE</h4>
                                <p>Contributors are revenue-generating users. Please respond within 24 hours.</p>
                                <p>Firestore Path: Contributors/${
                                  event.params.userId
                                }/Support/${event.params.complaintId}</p>
                            </div>
                        </div>
                    </div>
                `,
        };

        await mailTransport.sendMail(mailOptions);
        console.log(`✅ Contributor support email sent for: ${complaintId}`);

        // Update document
        await snapshot.ref.update({
          emailSent: true,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("❌ Error sending contributor support email:", error);
        await event.data.ref.update({
          emailError: error.message,
          emailSent: false,
        });
      }
    }
  );
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

exports.addTeamMember = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  try {
    // Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: { message: "Login required", code: "unauthenticated" },
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminId = decodedToken.uid;

    const { memberEmail } = req.body;

    if (!memberEmail) {
      return res.status(400).json({
        error: {
          message: "Missing memberEmail",
          code: "invalid-argument",
        },
      });
    }

    const db = admin.firestore();

    // Get admin profile to get teamId
    const adminProfileRef = db.collection("Profiles").doc(adminId);
    const adminProfileSnap = await adminProfileRef.get();

    if (!adminProfileSnap.exists) {
      return res.status(404).json({
        error: { message: "Admin profile not found", code: "not-found" },
      });
    }

    const adminProfile = adminProfileSnap.data();
    const adminSubscription = adminProfile.subscription || {};

    // Check if admin is on team plan
    if (adminSubscription.type !== "team" || !adminSubscription.teamId) {
      return res.status(400).json({
        error: {
          message: "You are not on a team plan",
          code: "not-on-team-plan",
        },
      });
    }

    const teamId = adminSubscription.teamId;

    // Get team
    const teamRef = db.collection("Teams").doc(teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return res.status(404).json({
        error: { message: "Team not found", code: "not-found" },
      });
    }

    const team = teamSnap.data();

    // Check if admin owns team
    if (team.ownerId !== adminId) {
      return res.status(403).json({
        error: {
          message: "Only team owner can add members",
          code: "permission-denied",
        },
      });
    }

    // CRITICAL FIX: Get totalMembers from subscription plan, not from team.members
    // The subscription price determines how many members can be added

    // Extract team size from subscription plan name/price
    // Example: If admin paid for 3 members, team.memberLimit should be 3
    const teamSize = team.memberLimit || 1; // This should be from subscription (e.g., 2, 3, 4 members)
    const currentTeamMembers = team.members || [];
    const currentMemberCount = currentTeamMembers.length;

    console.log(
      `📊 Team Stats: Size=${teamSize}, Current=${currentMemberCount}, Owner=${team.ownerId}`
    );

    // Calculate available slots: teamSize - 1 (owner doesn't count as a slot)
    // If teamSize = 2: owner + 1 member = 1 available slot
    // If teamSize = 3: owner + 2 members = 2 available slots
    // If teamSize = 4: owner + 3 members = 3 available slots
    const maxInvitableMembers = Math.max(0, teamSize - 1);
    const availableSlots = Math.max(
      0,
      maxInvitableMembers - (currentMemberCount - 1)
    );

    console.log(
      `📊 Available slots: ${availableSlots} (Max invitable: ${maxInvitableMembers})`
    );

    if (availableSlots <= 0) {
      return res.status(403).json({
        error: {
          message: `Team member limit reached. You can invite up to ${maxInvitableMembers} member(s). Current team size allows ${teamSize} total members.`,
          code: "resource-exhausted",
          details: {
            teamSize,
            currentMembers: currentMemberCount,
            maxInvitableMembers,
            availableSlots,
            ownerIncluded: true,
          },
        },
      });
    }

    // Check if email already exists in any profile
    const existingUserQuery = await db
      .collection("Profiles")
      .where("email", "==", memberEmail)
      .limit(1)
      .get();

    // Check if user already has subscription
    if (!existingUserQuery.empty) {
      const existingUser = existingUserQuery.docs[0].data();
      const existingUserSubscription = existingUser.subscription || {};

      // Check if user is already in a team
      if (existingUserSubscription.teamId === teamId) {
        return res.status(400).json({
          error: {
            message: "This user is already a member of your team",
            code: "already-member",
          },
        });
      } else if (existingUserSubscription.teamId) {
        return res.status(400).json({
          error: {
            message: "This user is already in another team",
            code: "in-other-team",
          },
        });
      }
    }

    // Check if invitation already exists for this email
    const existingInviteQuery = await db
      .collection("TeamInvites")
      .where("teamId", "==", teamId)
      .where("inviteEmail", "==", memberEmail)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (!existingInviteQuery.empty) {
      return res.status(400).json({
        error: {
          message: "An invitation already exists for this email",
          code: "duplicate-invite",
        },
      });
    }

    // Generate a special token for auto-approval
    const approvalToken = Math.random().toString(36).substr(2, 20);
    const inviteId = `invite_${Date.now()}_${approvalToken.substring(0, 8)}`;

    // Create invitation
    await db
      .collection("TeamInvites")
      .doc(inviteId)
      .set({
        inviteId,
        approvalToken,
        teamId,
        adminId,
        adminEmail: adminProfile.email,
        adminName: `${adminProfile.firstName || ""} ${
          adminProfile.lastName || ""
        }`.trim(),
        inviteEmail: memberEmail,
        status: "pending",
        invitedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        ),
        plan: "team",
        downloadLimit: team.downloadsPerMember || 200,
        memberLimit: team.memberLimit,
        teamSize: teamSize,
        currentMemberCount: currentMemberCount,
        autoApprove: true,
      });

    console.log(
      `✅ Invitation created for ${memberEmail}. Available slots: ${availableSlots}`
    );

    // Determine URLs for local vs production
    const isLocal = process.env.FUNCTIONS_EMULATOR === "true";
    const baseUrl = isLocal
      ? `http://localhost:5001/${process.env.GCLOUD_PROJECT}/us-central1`
      : "https://us-central1-sham-marianas.cloudfunctions.net";

    const frontendUrl = isLocal
      ? "http://localhost:3000"
      : "https://shammarianas.vercel.app";

    // Create the magic link for one-click approval
    const magicLink = `${baseUrl}/oneClickJoinTeam?token=${approvalToken}&email=${encodeURIComponent(
      memberEmail
    )}`;

    return res.status(200).json({
      success: true,
      inviteId,
      approvalToken,
      teamDetails: {
        teamId,
        teamSize,
        currentMembers: currentMemberCount,
        availableSlots: availableSlots,
        maxInvitableMembers: maxInvitableMembers,
      },
      message: `Invitation sent! You have ${availableSlots} slot(s) remaining.`,
    });
  } catch (err) {
    console.error("Add team member error:", err);

    if (
      err.code === "auth/id-token-expired" ||
      err.code === "auth/invalid-id-token"
    ) {
      return res.status(401).json({
        error: { message: "Invalid token", code: "unauthenticated" },
      });
    }

    return res.status(500).json({
      error: {
        message: err.message || "Internal server error",
        code: "internal",
      },
    });
  }
});

exports.oneClickJoinTeam = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).send("Invalid link");
    }

    const db = admin.firestore();

    // 1. Find invitation
    const invitesQuery = await db
      .collection("TeamInvites")
      .where("approvalToken", "==", token)
      .where("inviteEmail", "==", email)
      .limit(1)
      .get();

    if (invitesQuery.empty) {
      return res.status(404).send("Invitation not found");
    }

    const inviteDoc = invitesQuery.docs[0];
    const inviteData = inviteDoc.data();

    // Check if already accepted
    if (inviteData.status !== "pending") {
      return res.send(`
        <!DOCTYPE html>
        <html><head><title>Already Accepted</title></head>
        <body>
          <h1>Invitation Already Used</h1>
          <p>This invitation has already been accepted.</p>
          <a href="https://shammarianas.vercel.app">Go to Homepage</a>
        </body>
        </html>
      `);
    }

    // 2. Get team
    const teamRef = db.collection("Teams").doc(inviteData.teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return res.status(404).send("Team not found");
    }

    const team = teamSnap.data();

    // 3. CHECK IF USER EXISTS
    let userId = null;
    let userExistsInAuth = false;

    // A. Check Firebase Auth first
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      userId = userRecord.uid;
      userExistsInAuth = true;
      console.log(`✅ User found in Firebase Auth: ${userId}`);
    } catch (authError) {
      if (authError.code === "auth/user-not-found") {
        console.log(`ℹ️ User not found in Firebase Auth: ${email}`);
        // We'll create a profile-only user
      } else {
        console.error("Auth lookup error:", authError);
        throw authError;
      }
    }

    // B. Check Profiles collection
    const existingUserQuery = await db
      .collection("Profiles")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingUserQuery.empty) {
      const profileData = existingUserQuery.docs[0].data();
      const profileUserId = existingUserQuery.docs[0].id;

      if (userId && userId !== profileUserId) {
        console.warn(
          `⚠️ Mismatch: Auth ID (${userId}) ≠ Profile ID (${profileUserId})`
        );
        userId = profileUserId; // Use Profile ID
      } else if (!userId) {
        userId = profileUserId;
      }
      console.log(`✅ User found in Profiles: ${userId}`);
    }

    // C. Create user if doesn't exist
    if (!userId) {
      console.log(`🆕 Creating new profile-only user for: ${email}`);

      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db
        .collection("Profiles")
        .doc(userId)
        .set({
          uid: userId,
          email: email,
          username: email.split("@")[0].toLowerCase(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "active",
          role: "user",
          emailVerified: true,
          subscription: null,
          firstName: "",
          lastName: "",
          profilePic: null,
          phoneNumber: "",
          bio: "",
          country: "",
          followers: [],
          following: [],
          followersCount: 0,
          followingCount: 0,
          authMethod: "email_link_only",
        });

      console.log(`✅ Created profile-only user: ${userId}`);
    }

    // 4. Check if user is already in this team
    const teamMembers = team.members || [];
    if (teamMembers.includes(userId)) {
      console.log(`ℹ️ User ${userId} is already in team ${inviteData.teamId}`);

      await inviteDoc.ref.update({
        status: "already_member",
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        acceptedBy: userId,
      });

      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already a Member</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .info { color: #2196F3; font-size: 20px; }
          </style>
        </head>
        <body>
          <div class="info">ℹ️ You're already a member of this team!</div>
          <p>You already have access to ${
            team.downloadsPerMember || 200
          } downloads/month.</p>
          <a href="https://shammarianas.vercel.app/dashboard">Go to Dashboard</a>
        </body>
        </html>
      `);
    }

    // 5. Add user to team - SIMPLE VERSION (NO TRANSACTION)
    console.log(`🎯 Adding user ${userId} to team ${inviteData.teamId}`);

    // Update invitation status
    await inviteDoc.ref.update({
      status: "accepted",
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      acceptedBy: userId,
    });

    // Add user to team members
    const updatedMembers = [...teamMembers, userId];
    const memberDownloads = team.memberDownloads || {};
    memberDownloads[userId] = 0;

    await teamRef.update({
      members: updatedMembers,
      totalMembers: updatedMembers.length,
      memberDownloads: memberDownloads,
    });

    // Update user profile with team subscription
    await db
      .collection("Profiles")
      .doc(userId)
      .update({
        subscription: {
          status: "active",
          plan: "team",
          type: "team",
          teamId: inviteData.teamId,
          downloadLimit: team.downloadsPerMember || 200,
          downloadsUsed: 0,
          startDate: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: team.expiresAt,
          billingCycle: "monthly",
          price: team.perMemberPrice || 8,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`✅ Successfully added ${userId} to team ${inviteData.teamId}`);

    // 6. Generate auto-login token (if user exists in Auth)
    let loginToken = null;
    let autoLoginScript = "";

    if (userExistsInAuth) {
      try {
        loginToken = await admin.auth().createCustomToken(userId);

        autoLoginScript = `
          <script>
            // Store token for auto-login
            localStorage.setItem('teamJoinToken', '${loginToken}');
            localStorage.setItem('teamJoinEmail', '${email}');
            localStorage.setItem('teamJoinUserId', '${userId}');
            
            console.log('Auto-login token stored for ${email}');
            
            // Auto-redirect after 2 seconds
            setTimeout(function() {
              window.location.href = 'https://shammarianas.vercel.app/auto-login-team';
            }, 2000);
          </script>
        `;

        console.log(`🔑 Generated login token for ${userId}`);
      } catch (tokenError) {
        console.error("❌ Failed to generate login token:", tokenError);
        // Continue without auto-login
      }
    }

    // 7. Show success page
    const isLocal = process.env.FUNCTIONS_EMULATOR === "true";
    const dashboardUrl = isLocal
      ? "http://localhost:3000/dashboard"
      : "https://shammarianas.vercel.app/dashboard";
    const loginUrl = isLocal
      ? "http://localhost:3000/login"
      : "https://shammarianas.vercel.app/login";

    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Welcome to the Team!</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.95); 
            padding: 40px; 
            border-radius: 20px; 
            color: #333;
          }
          .success { 
            color: #4CAF50; 
            font-size: 28px;
            margin-bottom: 20px;
          }
          .btn { 
            display: inline-block; 
            padding: 15px 30px; 
            background: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px;
            font-weight: bold;
            border: none;
            cursor: pointer;
          }
          .btn-secondary {
            background: #2196F3;
          }
          .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">🎉 Successfully Joined Team!</div>
          
          <p>Welcome to <strong>${inviteData.adminName}'s</strong> team!</p>
          
          <div class="info-box">
            <h3>What you get:</h3>
            <ul>
              <li>✅ <strong>${
                team.downloadsPerMember || 200
              } downloads/month</strong></li>
              <li>✅ Premium assets & templates</li>
              <li>✅ Team collaboration features</li>
              <li>✅ 4K quality downloads</li>
              <li>✅ Commercial license</li>
            </ul>
            
            <p><strong>Account Status:</strong> 
              ${
                userExistsInAuth
                  ? "✅ Full account access"
                  : "⚠️ Profile access only"
              }
            </p>
          </div>
          
          <div>
            <button onclick="window.location.href='${dashboardUrl}'" class="btn" id="dashboardBtn">
              🚀 Go to Dashboard
            </button>
            <br>
            <button onclick="window.location.href='${loginUrl}'" class="btn btn-secondary">
              🔑 Login to Account
            </button>
          </div>
          
          <p style="color: #666; margin-top: 30px;">
            ${
              userExistsInAuth
                ? "You will be automatically logged in..."
                : "Please login with your email to access your account."
            }
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 40px;">
            Invited by: ${inviteData.adminEmail}
          </p>
        </div>
        
        ${autoLoginScript}
        
        <script>
          // Fallback if auto-login doesn't work
          document.getElementById('dashboardBtn').addEventListener('click', function() {
            if(localStorage.getItem('teamJoinToken')) {
              window.location.href = 'https://shammarianas.vercel.app/auto-login-team';
            }
          });
        </script>
      </body>
      </html>
    `;

    return res.send(successHtml);
  } catch (error) {
    console.error("❌ One-click join error:", error);

    // Detailed error page
    const isLocal = process.env.FUNCTIONS_EMULATOR === "true";
    const homeUrl = isLocal
      ? "http://localhost:3000"
      : "https://shammarianas.vercel.app";
    const contactUrl = isLocal
      ? "http://localhost:3000/contact"
      : "https://shammarianas.vercel.app/contact";

    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial; padding: 50px; text-align: center; }
          .error { color: #ff6b6b; }
          .debug { background: #f5f5f5; padding: 15px; margin: 20px; text-align: left; font-size: 12px; }
          .action-btn {
            padding: 10px 20px; 
            background: #4CAF50; 
            color: white; 
            text-decoration: none; 
            margin: 10px; 
            display: inline-block;
            border-radius: 5px;
          }
          .action-btn-secondary {
            background: #2196F3;
          }
        </style>
      </head>
      <body>
        <h1 class="error">⚠️ Something went wrong</h1>
        <p>We couldn't add you to the team at this time.</p>
        
        <div class="debug">
          <strong>Error Details:</strong><br>
          ${error.message}<br>
          ${error.code || ""}
        </div>
        
        <p>Please try:</p>
        <div>
          <a href="${homeUrl}/login" class="action-btn">
            1. Login to your account
          </a>
          <br>
          <a href="${contactUrl}" class="action-btn action-btn-secondary">
            2. Contact support
          </a>
        </div>
      </body>
      </html>
    `);
  }
});

exports.getTeamDetails = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "GET")
    return res.status(405).send({ error: "Method Not Allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Login required" } });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const db = admin.firestore();

    // Get user profile
    const userProfileRef = db.collection("Profiles").doc(userId);
    const userProfileSnap = await userProfileRef.get();

    if (!userProfileSnap.exists) {
      return res.status(404).json({ error: { message: "User not found" } });
    }

    const userProfile = userProfileSnap.data();
    const subscription = userProfile.subscription || {};

    if (subscription.type !== "team" || !subscription.teamId) {
      return res.status(404).json({ error: { message: "Not in a team" } });
    }

    const teamId = subscription.teamId;

    // Get team
    const teamRef = db.collection("Teams").doc(teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return res.status(404).json({ error: { message: "Team not found" } });
    }

    const team = teamSnap.data();

    // Get all team members' profiles
    const members = [];
    const teamMembers = team.members || [];
    const memberDownloads = team.memberDownloads || {};
    let totalTeamDownloadsUsed = 0;

    for (const memberId of teamMembers) {
      if (memberId) {
        const memberProfileRef = db.collection("Profiles").doc(memberId);
        const memberProfileSnap = await memberProfileRef.get();

        if (memberProfileSnap.exists) {
          const memberProfile = memberProfileSnap.data();
          const downloadsUsed = memberDownloads[memberId] || 0;
          totalTeamDownloadsUsed += downloadsUsed;

          members.push({
            id: memberId,
            email: memberProfile.email,
            name:
              memberProfile.name ||
              `${memberProfile.firstName || ""} ${
                memberProfile.lastName || ""
              }`.trim(),
            role: memberId === team.ownerId ? "owner" : "member",
            joinedAt: memberProfile.joinDate || memberProfile.createdAt,
            profilePic: memberProfile.profilePic,
            downloadsUsed: downloadsUsed,
            downloadLimit: team.downloadsPerMember || 200,
            isOwner: memberId === team.ownerId,
          });
        }
      }
    }

    // Get pending invites
    const pendingInvitesQuery = await db
      .collection("TeamInvites")
      .where("teamId", "==", teamId)
      .where("status", "==", "pending")
      .get();

    const pendingInvites = pendingInvitesQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ✅ FIXED CALCULATION: Team size comes from subscription plan
    // team.memberLimit should be the TOTAL team size (owner + members)
    // Example: If user paid for 3-member team, team.memberLimit = 3

    const totalTeamSize = team.memberLimit || 2; // Total team size (owner + members)
    const currentMemberCount = members.length; // Includes owner

    // ✅ CORRECT LOGIC:
    // - Owner doesn't count as an "invitable" slot
    // - Available slots = (totalTeamSize - 1) - (currentMemberCount - 1)
    // Simplified: Available slots = totalTeamSize - currentMemberCount

    const maxInvitableMembers = Math.max(0, totalTeamSize - 1);
    const availableSlots = Math.max(0, totalTeamSize - currentMemberCount);

    console.log(`📊 Team Stats for ${teamId}:`);
    console.log(`   Total Team Size (from plan): ${totalTeamSize}`);
    console.log(`   Current Members: ${currentMemberCount}`);
    console.log(`   Owner Included: ${team.ownerId ? "Yes" : "No"}`);
    console.log(`   Max Invitable Members: ${maxInvitableMembers}`);
    console.log(`   Available Slots: ${availableSlots}`);

    // Calculate total team downloads
    const downloadsPerMember = team.downloadsPerMember || 200;
    const totalTeamDownloadsAllowed = downloadsPerMember * totalTeamSize;

    return res.status(200).json({
      success: true,
      team: {
        id: teamSnap.id,
        name: team.name || "Team",
        ownerId: team.ownerId,

        // ✅ IMPORTANT: These are the subscription-based limits
        totalTeamSize: totalTeamSize, // Total members allowed (owner + team members)
        memberLimit: totalTeamSize, // Same as totalTeamSize for clarity
        currentMembers: currentMemberCount,
        availableSlots: availableSlots,
        maxInvitableMembers: maxInvitableMembers,

        downloadsPerMember: downloadsPerMember,
        plan: team.plan || "team",
        startDate: team.startDate,
        expiresAt: team.expiresAt,
        active: team.active !== false, // Default to true
        perMemberPrice: team.perMemberPrice || 7,

        // Downloads stats
        totalDownloadsUsed: totalTeamDownloadsUsed,
        totalDownloadsAllowed: totalTeamDownloadsAllowed,
        remainingTeamDownloads: Math.max(
          0,
          totalTeamDownloadsAllowed - totalTeamDownloadsUsed
        ),
        memberDownloads: team.memberDownloads || {},

        // Additional info
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
      members,
      pendingInvites,
      userRole: team.ownerId === userId ? "owner" : "member",

      // ✅ Subscription info from user's profile
      subscriptionInfo: {
        plan: subscription.plan || "team",
        type: subscription.type || "team",
        status: subscription.status || "active",
        price: subscription.price || 0,
        downloadLimit: subscription.downloadLimit || downloadsPerMember,
        downloadsUsed: subscription.downloadsUsed || 0,
        remainingDownloads: Math.max(
          0,
          (subscription.downloadLimit || downloadsPerMember) -
            (subscription.downloadsUsed || 0)
        ),
        expiresAt: subscription.expiresAt,
      },
    });
  } catch (err) {
    console.error("❌ Get team details error:", err);
    return res.status(500).json({
      error: {
        message: err.message || "Internal server error",
        code: err.code || "internal-error",
      },
    });
  }
});

// =============================
// 6. CANCEL TEAM INVITE (NEW)
// =============================
exports.cancelTeamInvite = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST")
    return res.status(405).send({ error: "Method Not Allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Login required" } });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminId = decodedToken.uid;

    const { inviteId } = req.body;

    if (!inviteId) {
      return res.status(400).json({ error: { message: "inviteId required" } });
    }

    const db = admin.firestore();

    // Get invitation
    const inviteRef = db.collection("TeamInvites").doc(inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
      return res
        .status(404)
        .json({ error: { message: "Invitation not found" } });
    }

    const invite = inviteSnap.data();

    // Verify ownership
    if (invite.adminId !== adminId) {
      return res.status(403).json({ error: { message: "Not authorized" } });
    }

    // Cancel invitation
    await inviteRef.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: adminId,
    });

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled",
    });
  } catch (err) {
    console.error("Cancel invite error:", err);
    return res.status(500).json({
      error: { message: err.message || "Internal server error" },
    });
  }
});

// =============================
// 7. REMOVE TEAM MEMBER (NEW)
// =============================
exports.removeTeamMember = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST")
    return res.status(405).send({ error: "Method Not Allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Login required" } });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminId = decodedToken.uid;

    const { teamId, memberId } = req.body;

    if (!teamId || !memberId) {
      return res
        .status(400)
        .json({ error: { message: "teamId and memberId required" } });
    }

    const db = admin.firestore();

    // Verify admin owns team
    const teamRef = db.collection("Teams").doc(teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return res.status(404).json({ error: { message: "Team not found" } });
    }

    const team = teamSnap.data();

    if (team.ownerId !== adminId) {
      return res
        .status(403)
        .json({ error: { message: "Only team owner can remove members" } });
    }

    // Can't remove yourself
    if (memberId === adminId) {
      return res
        .status(400)
        .json({ error: { message: "Cannot remove yourself" } });
    }

    // Remove from team
    await db.runTransaction(async (transaction) => {
      transaction.update(teamRef, {
        members: admin.firestore.FieldValue.arrayRemove(memberId),
        totalMembers: Math.max(0, team.totalMembers - 1),
      });

      // Remove subscription from member
      const memberProfileRef = db.collection("Profiles").doc(memberId);
      transaction.update(memberProfileRef, {
        subscription: admin.firestore.FieldValue.delete(),
      });

      // Update TeamMembers collection
      const teamMembersQuery = await transaction.get(
        db
          .collection("TeamMembers")
          .where("teamId", "==", teamId)
          .where("memberId", "==", memberId)
      );

      teamMembersQuery.forEach((doc) => {
        transaction.update(doc.ref, {
          status: "removed",
          removedAt: admin.firestore.FieldValue.serverTimestamp(),
          removedBy: adminId,
        });
      });
    });

    // Get member email for notification
    const memberProfileRef = db.collection("Profiles").doc(memberId);
    const memberProfileSnap = await memberProfileRef.get();

    if (memberProfileSnap.exists && memberProfileSnap.data().email) {
      await mailTransport.sendMail({
        from: `Sham Marianas <${process.env.LOGIN_EMAIL_USER}>`,
        to: memberProfileSnap.data().email,
        subject: "Removed from Team",
        html: `<p>You have been removed from the team.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team member removed",
    });
  } catch (err) {
    console.error("Remove team member error:", err);
    return res.status(500).json({
      error: { message: err.message || "Internal server error" },
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
