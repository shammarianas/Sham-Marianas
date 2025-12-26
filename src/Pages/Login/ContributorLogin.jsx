import React, { useRef, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  fetchSignInMethodsForEmail, // ✅ ADD THIS LINE
} from "firebase/auth";
import { auth } from "../../../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import eye_icon from "../../assets/Icons/eye.png";
import {
  loginWithGoogle,
  googleContributorSignup,
  loginWithGoogleContributor,
} from "./GoogleLogin";
import { loginWithApple } from "./AppleLogin";
import { useLocation } from "react-router-dom";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";

// Country code data (for phone)
const countryCodes = [
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+86", country: "China" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+27", country: "South Africa" },
  { code: "+20", country: "Egypt" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+63", country: "Philippines" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
  { code: "+62", country: "Indonesia" },
  { code: "+90", country: "Turkey" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+358", country: "Finland" },
  { code: "+353", country: "Ireland" },
  { code: "+351", country: "Portugal" },
  { code: "+30", country: "Greece" },
  { code: "+48", country: "Poland" },
  { code: "+36", country: "Hungary" },
  { code: "+40", country: "Romania" },
  { code: "+420", country: "Czech Republic" },
  { code: "+43", country: "Austria" },
];

const ContributorLogin = () => {
  const [page, setPage] = useState("login");
  const [currentStep, setCurrentStep] = useState(1);
  const passwordRef = useRef(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [tempUser, setTempUser] = useState(null);
  const [authMethod, setAuthMethod] = useState(null); // 'email_password', 'google', or null
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  // ✅ CONTRIBUTOR SPECIFIC FIELDS
  const [fullName, setFullName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [portfolio, setPortfolio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [allCountries, setAllCountries] = useState([]); // API se countries
  const [loadingCountries, setLoadingCountries] = useState(true); // Loading state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ FETCH COUNTRIES FROM API
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const formattedCountries = data
          .map((country) => ({
            name: country.name.common,
            code: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllCountries(formattedCountries);
        console.log(
          `Fetched ${formattedCountries.length} countries for Contributor`
        );
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        const fallbackCountries = [
          { name: "United States", code: "US" },
          { name: "United Kingdom", code: "GB" },
          { name: "India", code: "IN" },
          { name: "Pakistan", code: "PK" },
          { name: "Canada", code: "CA" },
          { name: "Australia", code: "AU" },
          { name: "Germany", code: "DE" },
          { name: "France", code: "FR" },
          { name: "Japan", code: "JP" },
          { name: "China", code: "CN" },
        ];
        setAllCountries(fallbackCountries);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Auth state listener for email verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && currentStep === 2) {
        await user.reload();
        if (user.emailVerified) {
          setIsEmailVerified(true);
          setSuccess("Email verified successfully!");
          setTempUser(user);
        }
      }
    });

    return () => unsubscribe();
  }, [currentStep]);

  // Resend timer effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [location, currentStep]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length < 6) {
      setError("Password must be at least 6 characters");
    } else {
      setError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setError("Please enter a valid email address");
    } else if (value && emailRegex.test(value)) {
      setError("");
    }
  };

  const usernameTimeoutRef = useRef(null);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s/g, "").trim();
    setUsername(value);

    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    if (value.length < 3) {
      setUsernameStatus("");
      setError("");
      return;
    }

    setUsernameStatus("checking");
    setError("");

    usernameTimeoutRef.current = setTimeout(async () => {
      try {
        const q = query(
          collection(db, "Contributors"),
          where("username", "==", value.toLowerCase())
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setUsernameStatus("available");
        } else {
          setUsernameStatus("taken");
          setError("Username already taken");
        }
      } catch (err) {
        console.error("Username check failed:", err);
        setUsernameStatus("");
        setError("Failed to check username");
      }
    }, 400);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  // ✅ CONTRIBUTOR HANDLERS
  const handleFullNameChange = (e) => setFullName(e.target.value);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
      if (value.length !== 10) {
        setError("Phone number must be 10 digits");
      } else {
        setError("");
      }
    }
  };

  const handleBirthdayChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 13);

    if (selectedDate > minAgeDate) {
      setError("You must be at least 13 years old");
    } else {
      setError("");
      setBirthday(e.target.value);
    }
  };

  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);
  const handlePortfolioChange = (e) => setPortfolio(e.target.value);
  const handleSpecializationChange = (e) => setSpecialization(e.target.value);
  const handleExperienceChange = (e) => setExperience(e.target.value);
  const handleBioChange = (e) => setBio(e.target.value);

  // ✅ UPDATED COUNTRY HANDLER - Simple dropdown from API
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  // ✅ UPDATED CITY HANDLER - Simple text input
  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  // Skills handlers
  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  useEffect(() => {
    if (page === "signup" && currentStep === 1) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
      } else if (password.length < 6) {
        setError("Password must be at least 6 characters");
      } else {
        setError("");
      }
    } else if (page === "login" && password.length > 0 && password.length < 6) {
      setError("Password must be 6 characters or more");
    } else if (page === "login" && password.length >= 6) {
      setError("");
    }
  }, [password, confirmPassword, page, currentStep]);

  // ✅ STEP VALIDATION
  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // For existing Google users, skip password validation
    if (isGoogleUser) {
      // Google users ke liye validation (no password required)
      if (
        !fullName ||
        !username ||
        !email ||
        !phone ||
        !birthday ||
        !country ||
        !city
      ) {
        setError("Please fill all required fields");
        return false;
      }
    } else {
      // Email/password users ke liye normal validation
      if (
        !fullName ||
        !username ||
        !email ||
        !phone ||
        !birthday ||
        !password ||
        !confirmPassword ||
        !country ||
        !city
      ) {
        setError("Please fill all required fields");
        return false;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    // Common validation for all users
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (phone.length !== 10) {
      setError("Phone number must be 10 digits");
      return false;
    }

    if (usernameStatus === "taken") {
      setError("Please choose a different username");
      return false;
    }

    if (username && usernameStatus !== "available" && username.length >= 3) {
      setError("Please wait for username check or choose another");
      return false;
    }

    return true;
  };
  const validateStep2 = () => {
    if (!specialization || !experience) {
      setError("Please fill all required professional fields");
      return false;
    }
    return true;
  };
  const nextStep = async () => {
    console.log("🔄 nextStep called. Current step:", currentStep);

    if (currentStep === 1) {
      console.log("  → Validating step 1...");
      if (!validateStep1()) {
        console.error("❌ Step 1 validation failed");
        return;
      }
      console.log("✅ Step 1 validation passed");

      // ✅ FIX: If Google user, SKIP sendVerificationEmail and go directly to step 3
      if (isGoogleUser) {
        console.log("✅ Google user detected, going directly to step 3");
        setCurrentStep(3);
        return; // IMPORTANT: Return here to skip email verification
      }

      // Only for email/password users
      console.log("  → Calling sendVerificationEmail...");
      const success = await sendVerificationEmail();

      if (!success) {
        console.error("❌ sendVerificationEmail failed");
        return;
      }

      // Don't auto-increment step - let sendVerificationEmail handle it
      setCurrentStep(3);
      return;
    }

    if (currentStep === 2) {
      console.log("  → In Step 2 (Email Verification)...");
      // For Google users in step 2 (shouldn't happen), redirect to step 3
      if (isGoogleUser) {
        console.log("✅ Google user in step 2, redirecting to step 3");
        setCurrentStep(3);
        return;
      }

      // For email/password users, proceed normally
      setCurrentStep(3);
      setError("");
      console.log("  → Moved to step:", currentStep + 1);
      return;
    }

    if (currentStep === 3) {
      console.log("  → Validating step 2...");
      if (!validateStep2()) {
        console.error("❌ Step 2 validation failed");
        return;
      }
      console.log("✅ Step 2 validation passed");
    }

    setCurrentStep(currentStep + 1);
    setError("");
    console.log("  → Moved to step:", currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      setError("");
      setSuccess("");

      // 🔍 DEBUG 1: Log current state values
      console.log("📋 DEBUG - Current state values:");
      console.log("  Email:", email);
      console.log("  Password length:", password?.length || 0);
      console.log("  FullName:", fullName);
      console.log("  Current Step:", currentStep);

      // ✅ Input validation before any Firebase call
      if (!email || !password) {
        const errorMsg = !email ? "Email is required" : "Password is required";
        console.error("❌ Validation failed:", errorMsg);
        setError(errorMsg);
        return false; // Return false to indicate failure
      }

      if (password.length < 6) {
        console.error("❌ Password too short:", password.length, "characters");
        setError("Password must be at least 6 characters");
        return false;
      }

      let user;
      console.log("🔑 Attempting Firebase authentication...");

      // For new registration, we should CREATE the user, not try to sign in first
      console.log(
        "  → Creating new user with createUserWithEmailAndPassword..."
      );

      try {
        const createResult = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = createResult.user;
        console.log("✅ New user created:", user.uid);
        console.log("   Email:", user.email);

        // Update profile with full name
        if (fullName) {
          console.log("  → Updating profile with display name:", fullName);
          await updateProfile(user, { displayName: fullName });
        }

        setSuccess("Account created! Sending verification email...");
      } catch (createError) {
        console.error("❌ User creation failed:", createError.code);
        console.error("   Error message:", createError.message);

        if (createError.code === "auth/email-already-in-use") {
          console.log("  → Email already exists, trying to sign in instead...");

          // Try to sign in with existing user
          try {
            const signInResult = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
            user = signInResult.user;
            console.log("✅ Existing user signed in:", user.uid);
            setSuccess("Welcome back! Using your existing account...");
          } catch (signInError) {
            if (signInError.code === "auth/wrong-password") {
              setError(
                "This email is already registered. Please enter the correct password to continue."
              );
            } else {
              setError(
                "Account exists but login failed: " + signInError.message
              );
            }
            return false;
          }
        } else {
          setError("Registration failed: " + createError.message);
          return false;
        }
      }

      // Send verification email
      console.log("📧 Email verification check:");
      console.log("   Email verified?", user.emailVerified);
      console.log("   User email:", user.email);

      if (!user.emailVerified) {
        console.log("  → Sending verification email...");
        try {
          await sendEmailVerification(user, {
            url: window.location.origin + "/contributor/email-verified",
          });
          setIsVerificationSent(true);
          setResendTimer(60);
          setSuccess("Verification email sent! Please check your inbox.");
          console.log("✅ Verification email sent");

          // Store temp user for verification checking
          setTempUser(user);
          return true; // Return true to indicate success
        } catch (verificationError) {
          console.error(
            "❌ Failed to send verification email:",
            verificationError
          );
          setError(
            "Account created but verification email failed: " +
              verificationError.message
          );
          return true; // Still allow proceeding since account was created
        }
      } else {
        console.log("✅ Email already verified");
        setIsEmailVerified(true);
        setSuccess("Email already verified! You can proceed.");
        setTempUser(user);
        return true;
      }
    } catch (err) {
      console.error("🔥 FATAL ERROR in sendVerificationEmail:");
      console.error("  Error code:", err.code);
      console.error("  Error message:", err.message);
      console.error("  Full error object:", err);

      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please try logging in instead."
        );
      } else if (err.code === "auth/operation-not-allowed") {
        setError(
          "Email/password registration is not enabled. Please contact support."
        );
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Registration failed: " + (err.message || "Unknown error"));
      }
      return false;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      if (tempUser) {
        await sendEmailVerification(tempUser, {
          url: window.location.origin + "/contributor/email-verified",
          handleCodeInApp: false,
        });
        setResendTimer(60);
        setSuccess("Verification email resent! Check your inbox.");
      }
    } catch (err) {
      setError("Failed to resend email: " + err.message);
    }
  };

  // Check email verification status
  const checkEmailVerification = async () => {
    try {
      if (tempUser) {
        await tempUser.reload();
        const updatedUser = auth.currentUser;

        if (updatedUser && updatedUser.emailVerified) {
          setIsEmailVerified(true);
          setSuccess("Email verified successfully!");
        } else {
          setError(
            "Email not verified yet. Please check your inbox and click the verification link."
          );
        }
      }
    } catch (err) {
      setError("Failed to check verification status: " + err.message);
    }
  };

  const loginWithEmailPassword = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError(
          "Please verify your email first. Check your inbox for verification link."
        );
        await signOut(auth);
        return;
      }

      const contributorDoc = await getDoc(doc(db, "Contributors", user.uid));

      if (contributorDoc.exists()) {
        const contributorData = contributorDoc.data();

        if (contributorData.status === "verified") {
          setSuccess("Login successful!");
          await fetch(
            "https://us-central1-sham-marianas.cloudfunctions.net/sendLoginEmail",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: email,
                name: username || "User",
              }),
            }
          );
          setTimeout(
            () => navigate("/contributordashboard", { replace: true }),
            3000
          );
        } else if (contributorData.status === "pending") {
          setError(
            "Your account is still under review. Please wait for admin approval."
          );
          await signOut(auth);
        } else if (contributorData.status === "rejected") {
          setError(
            "Your contributor application was rejected. Please contact support."
          );
          await signOut(auth);
        }
      } else {
        setError("Contributor profile not found. Please register first.");
        await signOut(auth);
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  // 🔵 Creates/updates contributor profile
  const handleContributorProfile = async (user) => {
    try {
      const usernameLower = username.toLowerCase().trim();

      if (usernameStatus === "taken") {
        setError("Username is no longer available. Please choose another.");
        return;
      }
      if (!usernameLower) {
        setError("Username is required");
        return;
      }

      const usernameQuery = query(
        collection(db, "Contributors"),
        where("username", "==", usernameLower)
      );
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        setError("This username is already taken. Please choose another.");
        return;
      }

      await updateProfile(user, { displayName: username });

      const contributorRef = doc(db, "Contributors", user.uid);

      await setDoc(
        contributorRef,
        {
          username: usernameLower,
          displayUsername: username,
          fullName,
          email: user.email,
          emailVerified: user.emailVerified,
          profilePic: user.photoURL || "",
          uid: user.uid,
          role: "contributor",
          status: "pending",

          phone: `${countryCode} ${phone}`,
          birthday,
          countryCode,
          country,
          city, // ✅ City as text input
          portfolio,
          skills,
          specialization,
          experience,
          bio,

          totalUploads: 0,
          approvedUploads: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          rating: 0,
          reviews: 0,

          createdAt: serverTimestamp(),
          joinDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      setCurrentStep(5);
      setSuccess("Contributor account created successfully! Under review.");

      // Sign out the user after account creation to require manual login
      await signOut(auth);
    } catch (err) {
      console.error("Profile error:", err);
      setError("Failed to create profile. Try a different username.");
    }
  };

  const signUpwithEmailPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === "password") {
      setError("Please verify your email first. Check your inbox.");
      return;
    }

    // Handle existing Google users
    if (isGoogleUser) {
      try {
        // Get current logged-in Google user
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setError("Please login with Google first.");
          return;
        }

        const usernameLower = username.toLowerCase().trim();

        // Check username availability
        const usernameQuery = query(
          collection(db, "Contributors"),
          where("username", "==", usernameLower)
        );
        const querySnapshot = await getDocs(usernameQuery);

        if (!querySnapshot.empty) {
          setError("This username is already taken. Please choose another.");
          return;
        }

        // Save to Firestore with Google user's UID
        const contributorRef = doc(db, "Contributors", currentUser.uid);

        await setDoc(contributorRef, {
          username: usernameLower,
          displayUsername: username,
          fullName,
          email: currentUser.email,
          emailVerified: true,
          profilePic: currentUser.photoURL || "",
          uid: currentUser.uid,
          role: "contributor",
          status: "pending",
          authMethod: "google",

          phone: `${countryCode} ${phone}`,
          birthday,
          countryCode,
          country,
          city,
          portfolio,
          skills,
          specialization,
          experience,
          bio,

          totalUploads: 0,
          approvedUploads: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          rating: 0,
          reviews: 0,

          createdAt: serverTimestamp(),
          joinDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });

        setCurrentStep(5);
        setSuccess("Contributor application submitted! Under review.");

        // Sign out the user after account creation to require manual login
        await signOut(auth);
      } catch (err) {
        console.error("Google user contributor signup error:", err);
        setError("Failed to submit application: " + err.message);
      }
      return;
    }

    // Original email/password flow (for new users)
    try {
      let user;

      try {
        const signInResult = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = signInResult.user;
        setSuccess("Welcome back! Upgrading you to Contributor role...");
      } catch (loginError) {
        if (loginError.code === "auth/user-not-found") {
          const createResult = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          user = createResult.user;

          await sendEmailVerification(user, {
            url: window.location.origin + "/contributor/email-verified",
          });
          setSuccess(
            "Account created! Please check your email for verification link."
          );
        } else if (loginError.code === "auth/wrong-password") {
          setError(
            "This email is already registered. Please enter your correct password to become a Contributor."
          );
          return;
        } else {
          throw loginError;
        }
      }

      if (
        !user.emailVerified &&
        user.providerData[0]?.providerId === "password"
      ) {
        await sendEmailVerification(user, {
          url: window.location.origin + "/contributor/email-verified",
        });
        setError(
          "Please verify your email first by clicking the link sent to your inbox."
        );
        setTempUser(user);
        return;
      }

      if (!user.displayName || user.displayName !== (fullName || username)) {
        await updateProfile(user, { displayName: fullName || username });
      }

      await handleContributorProfile(user);
    } catch (err) {
      console.error("Contributor signup error:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent!");
    } catch (err) {
      setError("Failed: " + err.message);
    }
  };

  // ✅ STEP PROGRESS INDICATOR
  const renderProgressSteps = () => (
    <div
      className="progress-steps"
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "2rem",
        padding: "0 1rem",
      }}
    >
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: currentStep >= step ? "#52b0b4" : "#181818",
              color: currentStep >= step ? "#0f0f0f" : "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              border:
                currentStep === step
                  ? "2px solid #52b0b4"
                  : "2px solid #181818",
            }}
          >
            {step}
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              color: currentStep >= step ? "#f5f5f5" : "#666",
              textAlign: "center",
            }}
          >
            {step === 1 && "Personal"}
            {step === 2 && "Verify Email"}
            {step === 3 && "Portfolio"}
            {step === 4 && "Agreement"}
            {step === 5 && "Status"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {page === "login" && <SEO {...SEO_CONFIG.contributerLogin} />}
      {page === "signup" && <SEO {...SEO_CONFIG.contributerSignup} />}
      {page === "forgot" && <SEO {...SEO_CONFIG.contributerForgotPassword} />}

      <div className="login">
        {/* =================== LOGIN PAGE =================== */}
        {page === "login" && (
          <div className="login_tab">
            <div className="title">
              <span>Contributor Login</span>
              <span
                className="link"
                onClick={() => {
                  setPage("signup");
                  setError("");
                  setCurrentStep(1);
                  setIsVerificationSent(false);
                  setIsEmailVerified(false);
                  setTempUser(null);
                  setAuthMethod(null);
                  setIsGoogleUser(false);
                }}
              >
                Become Contributor <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>

            <form onSubmit={loginWithEmailPassword}>
              <label htmlFor="email">Email</label>
              <div className="input">
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="contributor@example.com"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>

              <label htmlFor="password">Password</label>
              <div className="input">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  ref={passwordRef}
                  placeholder="******"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="view_btn"
                  >
                    <img loading="lazy" src={eye_icon} alt="view" />
                  </button>
                )}
              </div>

              <span
                className="forgot_password"
                onClick={() => {
                  setPage("forgot");
                  setError("");
                }}
              >
                <span role="button">Forgot password?</span>
              </span>

              {error && <span className="error">{error}</span>}
              {success && <span className="success">{success}</span>}

              <button className="login_btn" type="submit">
                Login as Contributor
              </button>
               <div className="separator"></div>

              <div className="buttons">
                <button
                  className="google"
                  type="button"
                  onClick={loginWithGoogleContributor}
                >
                  <i className="fab fa-google"></i>
                </button>
                <button
                  className="apple"
                  type="button"
                  onClick={loginWithApple}
                >
                  <i className="fab fa-apple"></i>
                </button>
              </div> 
            </form>
          </div>
        )}

        {/* =================== SIGNUP PAGE - MULTI STEP =================== */}
        {page === "signup" && (
          <div className="login_tab">
            {renderProgressSteps()}

            <div className="title">
              <span>
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Email Verification"}
                {currentStep === 3 && "Professional Portfolio"}
                {currentStep === 4 && "Contributor Agreement"}
                {currentStep === 5 && "Application Status"}
              </span>
              <span
                className="link"
                onClick={() => {
                  setPage("login");
                  setError("");
                  setCurrentStep(1);
                  setIsVerificationSent(false);
                  setIsEmailVerified(false);
                  setTempUser(null);
                  setAuthMethod(null);
                  setIsGoogleUser(false);
                }}
              >
                Back to Login <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>

            <form
              onSubmit={
                currentStep === 4
                  ? signUpwithEmailPassword
                  : (e) => e.preventDefault()
              }
            >
              {/* ========== STEP 1: PERSONAL INFORMATION ========== */}
              {currentStep === 1 && (
                <>
                  <div className="form-row-1 mb-0">
                    <div className="width-50">
                      <label htmlFor="fullName" className="mb-2">
                        Full Name *
                      </label>
                      <div className="input">
                        <input
                          type="text"
                          id="fullName"
                          required
                          placeholder="John Doe"
                          value={fullName}
                          onChange={handleFullNameChange}
                        />
                      </div>
                    </div>
                    <div className="width-50">
                      <label htmlFor="username" className="mb-2">
                        Username *
                      </label>
                      <div className="input">
                        <input
                          type="text"
                          id="username"
                          required
                          placeholder="johndoe"
                          autoCapitalize="none"
                          value={username}
                          onChange={handleUsernameChange}
                        />
                      </div>
                      {usernameStatus === "checking" && (
                        <small style={{ color: "#999" }}>Checking...</small>
                      )}
                      {usernameStatus === "available" && (
                        <small style={{ color: "#4caf50" }}>Available!</small>
                      )}
                      {usernameStatus === "taken" && (
                        <small style={{ color: "#ff6b6b" }}>
                          Already taken
                        </small>
                      )}
                    </div>
                  </div>

                  <label htmlFor="email">Email *</label>
                  <div className="input">
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="contributor@example.com"
                      value={email}
                      onChange={handleEmailChange}
                    />
                  </div>

                  <div className="form-row-1 mb-0">
                    <div className="width-50">
                      <label htmlFor="phone" className="mb-2">
                        Phone Number * (10 digits)
                      </label>
                      <div className="input phone-input-container">
                        <select
                          className="country-code-select"
                          value={countryCode}
                          onChange={handleCountryCodeChange}
                          style={{
                            width: "80px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            backgroundColor: "#181818",
                            color: "#f5f5f5",
                            fontSize: "14px",
                            padding: "0 8px",
                          }}
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          id="phone"
                          placeholder="2345678900"
                          value={phone}
                          onChange={handlePhoneChange}
                          required
                          maxLength="10"
                          pattern="[0-9]{10}"
                          style={{ flex: 1 }}
                        />
                      </div>
                      {phone && phone.length !== 10 && (
                        <p
                          style={{
                            color: "#ff6b6b",
                            fontSize: "0.8rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          Phone number must be 10 digits
                        </p>
                      )}
                    </div>
                    <div className="width-50">
                      <label htmlFor="birthday" className="mb-2">
                        Birthday * (Min. 13 years)
                      </label>
                      <div className="input">
                        <input
                          type="date"
                          id="birthday"
                          value={birthday}
                          onChange={handleBirthdayChange}
                          required
                          max={
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() - 13
                              )
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* ✅ UPDATED COUNTRY & CITY FIELDS */}
                  <div className="form-row-1 mb-0">
                    <div className="width-50">
                      <label htmlFor="country" className="mb-2">
                        Country *
                        {loadingCountries && (
                          <small style={{ color: "#888", marginLeft: "8px" }}>
                            (Loading...)
                          </small>
                        )}
                      </label>
                      <div className="input">
                        <select
                          id="country"
                          value={country}
                          onChange={handleCountryChange}
                          required
                          disabled={loadingCountries}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            backgroundColor: "#181818",
                            color: "#f5f5f5",
                            fontSize: "14px",
                            opacity: loadingCountries ? 0.6 : 1,
                          }}
                        >
                          <option value="">
                            {loadingCountries
                              ? "Loading countries..."
                              : "Select Country"}
                          </option>
                          {allCountries.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {!loadingCountries && (
                        <small
                          style={{
                            color: "#888",
                            fontSize: "0.8rem",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {allCountries.length} countries available
                        </small>
                      )}
                    </div>
                    <div className="width-50">
                      <label htmlFor="city" className="mb-2">
                        City *
                      </label>
                      <div className="input">
                        <input
                          type="text"
                          id="city"
                          placeholder="Enter your city"
                          value={city}
                          onChange={handleCityChange}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            backgroundColor: "#181818",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                      <small
                        style={{
                          color: "#888",
                          fontSize: "0.8rem",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        Enter your city name
                      </small>
                    </div>
                  </div>
                  <label htmlFor="password">
                    Password * (Min. 6 characters)
                  </label>
                  <div className="input">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      required
                      placeholder="******"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    {password && (
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="view_btn"
                      >
                        <img loading="lazy" src={eye_icon} alt="view" />
                      </button>
                    )}
                  </div>

                  <label htmlFor="cnfpassword">Confirm password *</label>
                  <div className="input">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      id="cnfpassword"
                      required
                      placeholder="******"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {password && (
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="view_btn"
                      >
                        <img loading="lazy" src={eye_icon} alt="view" />
                      </button>
                    )}
                  </div>

                  {/* Google Sign Up Button - FOR EXISTING GOOGLE USERS ONLY */}
                  <div
                    className="separator"
                    style={{ margin: "1.5rem 0" }}
                  ></div>

                  <div className="buttons">
                    <button
                     className="google"
                  type="button"
                      onClick={async () => {
                        try {
                          const googleUser = await googleContributorSignup();

                          // Auto-fill the form with Google user info
                          setEmail(googleUser.email || "");
                          if (googleUser.fullName)
                            setFullName(googleUser.fullName);
                          setAuthMethod("google");
                          setIsGoogleUser(true);

                          // Auto-suggest username from email
                          if (googleUser.email && !username) {
                            const suggestedUsername = googleUser.email
                              .split("@")[0]
                              .toLowerCase();
                            setUsername(suggestedUsername);
                          }

                          // Hide password fields for Google users
                          setPassword(""); // Clear password
                          setConfirmPassword(""); // Clear confirm password

                          setSuccess(
                            "Google account connected! Please fill remaining details."
                          );
                          setError("");
                        } catch (error) {
                          console.error("Google login error:", error);
                          setError(error.message);
                        }
                      }}
                    >
                      <i className="fab fa-google"></i>
                    </button>
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#888",
                      fontSize: "0.9rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    Already have an account with Google? Use it to sign up with Google
                  </p>

                  {isGoogleUser && (
                    <div
                      style={{
                        padding: "1rem",
                        backgroundColor: "#52b0b412",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <p
                        style={{
                          color: "#52b0b4",
                          margin: 0,
                          fontSize: "0.9rem",
                        }}
                      >
                        <i
                          className="fab fa-google"
                          style={{ marginRight: "8px" }}
                        ></i>
                        <strong>Google account connected</strong> - No password
                        required for existing Google users
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ========== STEP 2: EMAIL VERIFICATION ========== */}
              {currentStep === 2 && (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  {/* GOOGLE USER KO STEP 2 SE AUTOMATICALLY REDIRECT */}
                  {isGoogleUser ? (
                    <>
                      <div
                        style={{
                          fontSize: "3rem",
                          color: "#4285f4",
                          marginBottom: "1rem",
                        }}
                      >
                        🔄
                      </div>

                      <h3 style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
                        Redirecting to Portfolio...
                      </h3>

                      <p
                        style={{
                          color: "#f5f5f5",
                          opacity: 0.8,
                          marginBottom: "1.5rem",
                        }}
                      >
                        Google users skip email verification.
                        <br />
                        Taking you directly to the next step...
                      </p>

                      <div
                        style={{
                          backgroundColor: "rgba(66, 133, 244, 0.1)",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          marginBottom: "1.5rem",
                        }}
                      >
                        <p style={{ color: "#f5f5f5", margin: 0 }}>
                          <i
                            className="fab fa-google"
                            style={{ marginRight: "8px" }}
                          ></i>
                          <strong>Google Account Connected</strong>
                          <br />
                          <small style={{ opacity: 0.8 }}>
                            Your existing Google account is already verified.
                          </small>
                        </p>
                      </div>

                      {/* Auto-redirect after 2 seconds */}
                      {useEffect(() => {
                        const timer = setTimeout(() => {
                          setCurrentStep(3);
                        }, 2000);
                        return () => clearTimeout(timer);
                      }, [])}

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          type="button"
                          className="login_btn"
                          onClick={() => {
                            setCurrentStep(3);
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: "#4285f4",
                          }}
                        >
                          Go to Portfolio Now
                        </button>
                      </div>
                    </>
                  ) : (
                    /* EMAIL/PASSWORD USER FLOW - Your existing code */
                    <>
                      <div
                        style={{
                          fontSize: "3rem",
                          color: "#52b0b4",
                          marginBottom: "1rem",
                        }}
                      >
                        ✉️
                      </div>

                      <h3 style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
                        Verify Your Email
                      </h3>

                      <p
                        style={{
                          color: "#f5f5f5",
                          opacity: 0.8,
                          marginBottom: "1.5rem",
                        }}
                      >
                        {isVerificationSent
                          ? "We've sent a verification link to:"
                          : "We'll send a verification link to:"}
                        <br />
                        <strong>{email}</strong>
                      </p>

                      {!isVerificationSent ? (
                        <div>
                          <p
                            style={{
                              color: "#f5f5f5",
                              opacity: 0.6,
                              fontSize: "0.9rem",
                              marginBottom: "1.5rem",
                            }}
                          >
                            Click "Next" to send verification email
                          </p>
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              backgroundColor: "rgba(82, 176, 180, 0.1)",
                              padding: "1rem",
                              borderRadius: "0.5rem",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <p style={{ color: "#f5f5f5", margin: 0 }}>
                              <strong>Important:</strong> Check your email inbox
                              and click the verification link. After clicking
                              the link, come back here and click "I've
                              Verified".
                            </p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              type="button"
                              className="login_btn"
                              onClick={checkEmailVerification}
                              style={{ flex: 1 }}
                            >
                              {isEmailVerified ? "✓ Verified" : "I've Verified"}
                            </button>
                            <button
                              type="button"
                              className="login_btn"
                              onClick={resendVerificationEmail}
                              disabled={resendTimer > 0}
                              style={{
                                backgroundColor: "transparent",
                                border: "1px solid rgba(255,255,255,0.2)",
                                flex: 1,
                                opacity: resendTimer > 0 ? 0.5 : 1,
                              }}
                            >
                              {resendTimer > 0
                                ? `Resend (${resendTimer}s)`
                                : "Resend Link"}
                            </button>
                          </div>

                          {isEmailVerified && (
                            <div
                              style={{
                                marginTop: "1.5rem",
                                padding: "1rem",
                                backgroundColor: "rgba(76, 175, 80, 0.1)",
                                borderRadius: "0.5rem",
                              }}
                            >
                              <p style={{ color: "#4caf50", margin: 0 }}>
                                ✓ Email verified successfully! You can now
                                proceed.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      <div
                        style={{
                          marginTop: "1.5rem",
                          padding: "1rem",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: "0.5rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        <p
                          style={{ color: "#f5f5f5", opacity: 0.7, margin: 0 }}
                        >
                          <strong>Note:</strong> If you don't see the email,
                          check your spam folder.
                        </p>
                      </div>

                      {/* Back button for email/password users */}
                      <button
                        type="button"
                        className="login_btn"
                        onClick={prevStep}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid rgba(255,255,255,0.2)",
                          marginTop: "1rem",
                          width: "100%",
                        }}
                      >
                        Back to Personal Info
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ========== STEP 3: PROFESSIONAL PORTFOLIO ========== */}
              {currentStep === 3 && (
                <>
                  <label htmlFor="portfolio">Portfolio URL</label>
                  <div className="input">
                    <input
                      type="url"
                      id="portfolio"
                      placeholder="https://yourportfolio.com"
                      value={portfolio}
                      onChange={handlePortfolioChange}
                    />
                  </div>

                  <div className="form-row-1 mb-0">
                    <div className="width-50">
                      <label htmlFor="specialization" className="mb-2">
                        Specialization *
                      </label>
                      <div className="input">
                        <select
                          id="specialization"
                          value={specialization}
                          onChange={handleSpecializationChange}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            backgroundColor: "#181818",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        >
                          <option value="">Select your field</option>
                          <option value="videos">Videos</option>
                          <option value="3d-models">3D Models</option>
                          <option value="video-templates">
                            Video Templates
                          </option>
                          <option value="images">Images</option>
                          <option value="mockups">Mockups</option>
                          <option value="graphic-templates">
                            Graphic Templates
                          </option>
                          <option value="fonts">Fonts</option>
                          <option value="icons">Icons</option>
                          <option value="scripts">Scripts</option>
                          <option value="hdris">HDRIs</option>
                          <option value="textures">Textures</option>
                        </select>
                      </div>
                    </div>
                    <div className="width-50">
                      <label htmlFor="experience" className="mb-2">
                        Experience Level *
                      </label>
                      <div className="input">
                        <select
                          id="experience"
                          value={experience}
                          onChange={handleExperienceChange}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            backgroundColor: "#181818",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        >
                          <option value="">Select experience</option>
                          <option value="beginner">Beginner (0-1 years)</option>
                          <option value="intermediate">
                            Intermediate (1-3 years)
                          </option>
                          <option value="professional">
                            Professional (3-5 years)
                          </option>
                          <option value="expert">Expert (5+ years)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <label htmlFor="skills">Skills (Press Enter)</label>
                  <div
                    className="skills-container"
                    style={{
                      marginBottom: "1rem",
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <div
                      className="input"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem",
                        minHeight: "48px",
                        cursor: "text",
                        width: "100%",
                      }}
                    >
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: "#292929",
                            color: "#fff",
                            padding: "0.25rem 0.75rem 0.25rem 0.5rem",
                            borderRadius: "16px",
                            fontSize: "0.875rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            height: "28px",
                          }}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#fff",
                              cursor: "pointer",
                              fontSize: "1.1rem",
                              padding: "0",
                              lineHeight: "1",
                              marginLeft: "0.25rem",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <input
                        type="text"
                        id="skills"
                        placeholder={skills.length === 0 ? "Type skill" : ""}
                        value={skillInput}
                        onChange={handleSkillInputChange}
                        onKeyDown={handleSkillKeyDown}
                        style={{
                          flex: 1,
                          minWidth: "120px",
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          color: "#f5f5f5",
                          fontSize: "14px",
                          padding: "0",
                        }}
                      />
                    </div>

                    {skills.length > 0 && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#999",
                          marginTop: "0.5rem",
                        }}
                      >
                        {skills.length} skill{skills.length !== 1 ? "s" : ""}{" "}
                        added. Click × to remove.
                      </p>
                    )}
                  </div>

                  <label htmlFor="bio">Bio/Introduction</label>
                  <div className="input">
                    <textarea
                      id="bio"
                      placeholder="Tell us about yourself and your work..."
                      value={bio}
                      onChange={handleBioChange}
                      rows="3"
                      style={{
                        width: "100%",
                        resize: "vertical",
                        minHeight: "80px",
                        fontFamily: "inherit",
                        backgroundColor: "#181818",
                        border: "none",
                        outline: "none",
                        borderRadius: "0.5rem",
                        color: "#f5f5f5",
                        padding: "1rem",
                      }}
                    />
                  </div>
                </>
              )}

              {/* ========== STEP 4: AGREEMENT ========== */}
              {currentStep === 4 && (
                <div
                  className="agreement-section"
                  style={{
                    backgroundColor: "#181818",
                    padding: "1.5rem",
                    borderRadius: "0.5rem",
                    maxHeight: "300px",
                    overflowY: "auto",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
                    Contributor Agreement
                  </h3>

                  <div
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.8,
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      <strong>Important Note:</strong>
                    </p>
                    <p>
                      Your contributor account will be{" "}
                      <strong>under review</strong> after registration. You'll
                      only be able to access the dashboard once your account is
                      approved by an admin. This process usually takes 24-48
                      hours.
                    </p>

                    <p>
                      <strong>1. Content Ownership</strong>
                    </p>
                    <p>
                      You retain ownership of all content you submit but grant
                      us a worldwide, non-exclusive license to use, distribute,
                      and display your content.
                    </p>

                    <p>
                      <strong>2. Content Guidelines</strong>
                    </p>
                    <p>
                      All submitted content must be original and not infringe on
                      any third-party rights. Content must meet our quality
                      standards.
                    </p>

                    <p>
                      <strong>3. Payment Terms</strong>
                    </p>
                    <p>
                      You will receive 60% of the revenue from sales of your
                      content. Payments are processed monthly with a minimum
                      threshold of $50.
                    </p>

                    <p style={{ marginTop: "1rem", fontStyle: "italic" }}>
                      By proceeding, you agree to all terms and conditions
                      outlined in this agreement.
                    </p>
                  </div>

                  <div className="accept_terms" style={{ marginTop: "1.5rem" }}>
                    <input
                      type="checkbox"
                      id="accept"
                      required
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label htmlFor="accept">
                      I accept the{" "}
                      <Link to="/contributor/terms" target="_blank">
                        Contributor Agreement
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" target="_blank">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>
              )}

              {/* ========== STEP 5: SUCCESS ========== */}
              {currentStep === 5 && (
                <div
                  className="success-section"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "4rem",
                      color: "#52b0b4",
                      marginBottom: "1rem",
                    }}
                  >
                    ⏳
                  </div>
                  <h3 style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
                    Registration Submitted!
                  </h3>
                  <p
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.8,
                      marginBottom: "1rem",
                    }}
                  >
                    Your contributor account application has been submitted for
                    review.
                  </p>
                  <p
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.6,
                      fontSize: "0.9rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <strong>Status: Pending Approval</strong>
                    <br />
                    Our admin team will review your application. You'll receive
                    an email notification once your account is approved. This
                    process usually takes 24-48 hours.
                  </p>

                  <button
                    className="login_btn"
                    type="button"
                    onClick={() => {
                      setPage("login");
                      setCurrentStep(1);
                      setEmail("");
                      setPassword("");
                      setConfirmPassword("");
                      setUsername("");
                      setFullName("");
                      setPhone("");
                      setBirthday("");
                      setCountry("");
                      setCity("");
                      setPortfolio("");
                      setSkills([]);
                      setSpecialization("");
                      setExperience("");
                      setBio("");
                      setIsVerificationSent(false);
                      setIsEmailVerified(false);
                      setTempUser(null);
                    }}
                    style={{
                      backgroundColor: "#52b0b4",
                      marginBottom: "1rem",
                    }}
                  >
                    Back to Login
                  </button>

                  <p
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.5,
                      fontSize: "0.8rem",
                    }}
                  >
                    Note: You can only access the dashboard after admin
                    approval.
                  </p>
                </div>
              )}

              {error && <span className="error">{error}</span>}
              {success && <span className="success">{success}</span>}

             
              {/* ========== BUTTONS ========== */}
              {currentStep < 5 && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  {currentStep > 1 && currentStep !== 2 && (
                    <button
                      type="button"
                      className="login_btn"
                      onClick={prevStep}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        flex: 1,
                      }}
                    >
                      Previous
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="login_btn"
                      onClick={nextStep}
                      disabled={
                        currentStep === 2 && !isEmailVerified && !isGoogleUser
                      }
                      style={{
                        flex: 1,
                        opacity:
                          currentStep === 2 && !isEmailVerified && !isGoogleUser
                            ? 0.5
                            : 1,
                      }}
                    >
                      {currentStep === 1 && isGoogleUser
                        ? "Next" 
                        : currentStep === 2
                        ? "Next"
                        : "Next"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={`login_btn ${
                        !termsAccepted ? "disabled" : ""
                      }`}
                      disabled={!termsAccepted}
                      style={{ flex: 1 }}
                    >
                      Complete Registration
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

        {/* =================== FORGOT PASSWORD =================== */}
        {page === "forgot" && (
          <div className="login forgot-password-section">
            <div className="login_tab">
              <div className="title">
                <span>Forgot Password</span>
                <span className="link" onClick={() => setPage("login")}>
                  Back to Login <i className="icon fas fa-arrow-right"></i>
                </span>
              </div>

              <form onSubmit={handlePasswordReset}>
                <label htmlFor="email">Email</label>
                <div className="input">
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="contributor@example.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>

                {error && <span className="error">{error}</span>}
                {success && <span className="success">{success}</span>}

                <button className="login_btn" type="submit">
                  Send Reset Link
                </button>
              </form>

              <div className="info_text">
                <p>
                  Enter your registered contributor email address, and we'll
                  send you a link to reset your password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContributorLogin;
