const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Helper to check if caller is admin (primary or in adminUsers)
async function isCallerAdmin(context) {
  if (!context.auth) return false;
  const email = (context.auth.token.email || "").toLowerCase();
  if (!email) return false;
  const PRIMARY_ADMIN = "shammarianas@gmail.com";
  if (email === PRIMARY_ADMIN) return true;
  try {
    const snap = await admin.firestore().doc(`adminUsers/${email}`).get();
    return snap.exists;
  } catch (e) {
    logger.error("Admin check failed", e);
    return false;
  }
}
// const Stripe = require("stripe");
// const {google} = require("googleapis");

// Add CORS configuration
exports.createOrder = onCall({
  cors: true,
}, async (data, context) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  try {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new HttpsError(
          "unauthenticated",
          "User must be logged in.",
      );
    }

    const {amount} = data;

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      metadata: {
        userId: context.auth.uid,
      },
    });

    // Return the client secret to the client
    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    logger.error("Error creating Payment Intent:", error);
    throw new HttpsError("internal", "Unable to create order");
  }
});


// Email configuration using environment variables for security
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Project owner's email from environment variable
const projectOwnerEmail = process.env.PROJECT_OWNER_EMAIL;

// Firestore trigger function (root Support - legacy)
exports.notifyProjectOwner = functions.firestore
    .document("Support/{messageId}")
    .onCreate(async (snap) => {
      const data = snap.data();
      const mailOptions = {
        from: "shammarianas@gmail.com",
        to: projectOwnerEmail,
        subject: `New Support Message: ${data.subject || "Support"}`,
        text: `New support message\nFrom: ${data.email}\nSubject: ${data.subject}\nMessage: ${data.description || data.body || ""}`,
      };
      try { await transporter.sendMail(mailOptions); } catch (error) { console.error("Error sending email:", error); }
    });

// Firestore trigger for user subcollection Support
exports.notifyProjectOwnerFromProfile = functions.firestore
  .document("Profiles/{profileId}/Support/{messageId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const mailOptions = {
      from: "shammarianas@gmail.com",
      to: projectOwnerEmail,
      subject: `New Support Message: ${data.subject || "Support"}`,
      text: `New support message\nFrom: ${data.email}\nUserId: ${context.params.profileId}\nSubject: ${data.subject}\nMessage: ${data.description || ""}`,
    };
    try { await transporter.sendMail(mailOptions); } catch (error) { console.error("Error sending email:", error); }
  });


// Callable: set user role and adminUsers membership
exports.setUserRole = onCall({ cors: true }, async (data, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }
  const authorized = await isCallerAdmin(context);
  if (!authorized) {
    throw new HttpsError("permission-denied", "Only admins can modify roles.");
  }

  const targetEmail = String(data.targetEmail || "").toLowerCase();
  const userId = String(data.userId || "");
  const role = String(data.role || "").toLowerCase();
  if (!targetEmail || !userId || !role) {
    throw new HttpsError("invalid-argument", "targetEmail, userId and role are required.");
  }

  const db = admin.firestore();
  try {
    await db.doc(`Profiles/${userId}`).set({ role }, { merge: true });

    if (role === "admin") {
      await db.doc(`adminUsers/${targetEmail}`).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        promotedBy: (context.auth.token.email || "").toLowerCase(),
      }, { merge: true });
    } else {
      await db.doc(`adminUsers/${targetEmail}`).delete().catch(() => {});
    }

    return { success: true };
  } catch (e) {
    logger.error("setUserRole failed", e);
    throw new HttpsError("internal", "Failed to update role");
  }
});

exports.setUserStatus = onCall({ cors: true }, async (data, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }
  const authorized = await isCallerAdmin(context);
  if (!authorized) {
    throw new HttpsError("permission-denied", "Only admins can modify status.");
  }
  const userId = String(data.userId || "");
  const status = String(data.status || "");
  if (!userId || !status) {
    throw new HttpsError("invalid-argument", "userId and status are required.");
  }
  try {
    await admin.firestore().doc(`Profiles/${userId}`).set({ status }, { merge: true });
    return { success: true };
  } catch (e) {
    logger.error("setUserStatus failed", e);
    throw new HttpsError("internal", "Failed to update status");
  }
});

exports.deleteUser = onCall({ cors: true }, async (data, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }
  const authorized = await isCallerAdmin(context);
  if (!authorized) {
    throw new HttpsError("permission-denied", "Only admins can delete users.");
  }
  const userId = String(data.userId || "");
  const email = String(data.email || "").toLowerCase();
  if (!userId) {
    throw new HttpsError("invalid-argument", "userId is required.");
  }
  const db = admin.firestore();
  try {
    await db.doc(`Profiles/${userId}`).delete();
    if (email) {
      await db.doc(`adminUsers/${email}`).delete().catch(() => {});
    }
    return { success: true };
  } catch (e) {
    logger.error("deleteUser failed", e);
    throw new HttpsError("internal", "Failed to delete user");
  }
});

// exports.checkUserRole = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError(
// "unauthenticated", "User must be authenticated.");
//   }

//   try {
//     const projectId = "your-project-id";
//     const email = context.auth.token.email;

//     const auth = new google.auth.GoogleAuth({
//       scopes: ["https://www.googleapis.com/auth/cloud-platform"],
//     });

//     const cloudResourceManager = google.cloudresourcemanager({
//       version: "v1",
//       auth: await auth.getClient(),
//     });

//     const iamPolicy = await cloudResourceManager.projects.getIamPolicy({
//       resource: projectId,
//       requestBody: {}, // Required to avoid errors
//     });

//     const isAdmin = iamPolicy.data.bindings?.some((binding) =>
//       binding.role.includes("roles/owner")
// && binding.members.includes(`user:${email}`)
//     );

//     return { isAdmin: !!isAdmin };
//   } catch (error) {
//     console.error("Error checking user role:", error);
//     throw new functions.https.HttpsError("internal",
// "Error checking user role.");
//   }
// });
