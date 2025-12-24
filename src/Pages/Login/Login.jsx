import React, { useRef, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../../../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import eye_icon from "../../assets/Icons/eye.png";
import { loginWithGoogle } from "./GoogleLogin";
import { loginWithApple } from "./AppleLogin";
import { useLocation } from "react-router-dom";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";
import { getFunctions, httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase"; // Make sure you export functions from firebase.js

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

const Login = () => {
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

  // Email verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [tempUser, setTempUser] = useState(null);

  // ✅ NEW FIELDS
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [countryCode, setCountryCode] = useState("+1");

  // ✅ CONTRIBUTOR SPECIFIC FIELDS
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [allCountries, setAllCountries] = useState([]); // Changed from countries to allCountries
  const [usernameStatus, setUsernameStatus] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true); // Add loading state

  const location = useLocation();
  const navigate = useNavigate();
  const usernameTimeoutRef = useRef(null);

  // ✅ FETCH COUNTRIES FROM API
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        // Using the exact API URL you asked about
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format countries data correctly
        const formattedCountries = data
          .map((country) => ({
            name: country.name.common,
            code: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllCountries(formattedCountries); // Store in allCountries state
        console.log(`Fetched ${formattedCountries.length} countries`);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        // Fallback to basic countries if API fails
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
  // Add this useEffect after your existing useEffect for countries
  useEffect(() => {
    // Handle invitation codes from URL
    const searchParams = new URLSearchParams(location.search);
    const inviteCode = searchParams.get("inviteCode");
    const inviteEmail = searchParams.get("email");

    if (inviteEmail) {
      setEmail(inviteEmail);
    }

    // Store invitation code for later use in completeSignup
    if (inviteCode) {
      localStorage.setItem("inviteCode", inviteCode);
    }

    console.log("Invitation params:", { inviteCode, inviteEmail });
  }, [location]);
  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
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
  }, [location]);

  // Username validation function
  const validateUsername = async (username) => {
    if (/\s/.test(username)) {
      return "Username cannot contain spaces";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers and underscores (_)";
    }

    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (username.length > 20) {
      return "Username must be less than 20 characters";
    }

    try {
      const querySnapshot = await getDocs(
        query(collection(db, "Profiles"), where("username", "==", username))
      );

      if (!querySnapshot.empty) {
        return "Username already taken. Please choose another one.";
      }
    } catch (err) {
      console.error("Error checking username:", err);
      return "Error checking username availability";
    }

    return null;
  };

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

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s/g, "").trim();
    setUsername(value);

    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    if (!value) {
      setUsernameStatus("");
      setError("");
      setSuccess("");
      return;
    }

    usernameTimeoutRef.current = setTimeout(async () => {
      try {
        const q = query(
          collection(db, "Profiles"),
          where("username", "==", value.toLowerCase())
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setUsernameStatus("available");
          setSuccess("Username available!");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setUsernameStatus("taken");
          setError("This username is already taken");
        }
      } catch (err) {
        setUsernameStatus("error");
        setError("Failed to check username");
      }
    }, 600);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) clearTimeout(usernameTimeoutRef.current);
    };
  }, []);

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

  const handleNameChange = (e) => setName(e.target.value);

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

  // ✅ CONTRIBUTOR HANDLERS
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  useEffect(() => {
    if (page === "signup") {
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
  }, [password, confirmPassword, page]);

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      setError("");
      setSuccess("");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!validateStep1()) {
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username,
      });

      await sendEmailVerification(user, {
        url: window.location.origin + "/email-verified",
        handleCodeInApp: false,
      });

      setTempUser(user);
      setIsVerificationSent(true);
      setResendTimer(60);
      setSuccess(
        "Verification email sent! Check your inbox and click the link to verify."
      );
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "Email already registered. Please login or use a different email."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to send verification: " + err.message);
      }
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      if (tempUser) {
        await sendEmailVerification(tempUser, {
          url: window.location.origin + "/email-verified",
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

  // Validation for step 1 (signup form)
  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !name ||
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

    // Username validation
    if (/\s/.test(username)) {
      setError("Username cannot contain spaces");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(
        "Username can only contain letters, numbers and underscores (_)"
      );
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    // Email validation
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Phone validation
    if (phone.length !== 10) {
      setError("Phone number must be 10 digits");
      return false;
    }

    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (
      usernameStatus === "taken" ||
      usernameStatus === "invalid" ||
      usernameStatus === "checking"
    ) {
      setError("Please choose a valid and available username");
      return false;
    }

    if (username && usernameStatus !== "available") {
      setError("Username is not available or invalid");
      return false;
    }
    return true;
  };

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    const isValid = validateStep1();
    if (!isValid) return;

    setCurrentStep(2);
    await sendVerificationEmail();
  };

  // Complete signup after email verification
  // Complete signup after email verification
  const completeSignup = async () => {
    try {
      let user;

      // Check if user is already logged in (tempUser)
      if (tempUser && tempUser.emailVerified) {
        user = tempUser;

        // Reload user to get latest email verification status
        await user.reload();
        user = auth.currentUser;
      } else {
        // If no tempUser, try to sign in
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = userCredential.user;
      }

      // Double check email verification
      if (!user.emailVerified) {
        setError("Please verify your email first. Check your inbox.");
        return;
      }

      // Update profile with username
      await updateProfile(user, {
        displayName: username,
      });

      // Create profile in Firestore
      const userProfileRef = doc(db, "Profiles", user.uid);

      // Prepare profile data
      const profileData = {
        username: username,
        email: user.email,
        profilePic: user.photoURL || "",
        uid: user.uid,
        role: "user",
        name: name,
        phone: `${countryCode} ${phone}`,
        emailVerified: true,
        birthday: birthday,
        countryCode: countryCode,
        country: country,
        city: city,
        createdAt: serverTimestamp(),
        joinDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving profile data:", profileData); // Debug log

      // Save to Firestore
      await setDoc(userProfileRef, profileData, { merge: true });

      // Verify the data was saved
      const savedDoc = await getDoc(userProfileRef);
      if (savedDoc.exists()) {
        console.log(
          "Profile successfully saved to Firestore:",
          savedDoc.data()
        );
      } else {
        console.error("Profile document not found after saving!");
      }

      // Send welcome email
      try {
        await fetch(
          "https://us-central1-sham-marianas.cloudfunctions.net/sendWelcomeEmail",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              name: name || username,
            }),
          }
        );
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
        // Continue even if email fails
      }

      setSuccess("Sign-up successful! Redirecting to dashboard...");

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/templates", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Sign-up error details:", err);

      if (err.code === "auth/user-not-found") {
        setError("User not found. Please try signing up again.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Sign-up failed: " + err.message);
      }
    }
  };
  // Add this function after other functions like completeSignup

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

      setTimeout(() => navigate("/templates", { replace: true }), 3000);
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    const autoCompleteSignup = async () => {
      if (
        isEmailVerified &&
        currentStep === 2 &&
        !success.includes("Redirecting")
      ) {
        // Wait 2 seconds then automatically complete signup
        setTimeout(async () => {
          await completeSignup();
        }, 2000);
      }
    };

    autoCompleteSignup();
  }, [isEmailVerified, currentStep, success]);

  // Add this useEffect to clear invitation codes on logout

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent!");
    } catch (err) {
      setError("Failed: " + err.message);
    }
  };

  // Reset form when switching pages
  const resetForm = () => {
    setCurrentStep(1);
    setIsEmailVerified(false);
    setIsVerificationSent(false);
    setTempUser(null);
    setError("");
    setSuccess("");
    setResendTimer(0);
  };

  return (
    <>
      {page === "login" && <SEO {...SEO_CONFIG.login} />}
      {page === "signup" && <SEO {...SEO_CONFIG.signup} />}
      {page === "forgot" && <SEO {...SEO_CONFIG.forgotPassword} />}

      <div className="login">
        {/* =================== LOGIN PAGE =================== */}
        {page === "login" && (
          <div className="login_tab">
            <div className="title">
              <span>Login</span>
              <span
                className="link"
                onClick={() => {
                  setPage("signup");
                  resetForm();
                }}
              >
                Sign Up <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>
            <form onSubmit={loginWithEmailPassword}>
              <label htmlFor="email">Email</label>
              <div className="input">
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="example@mail.com"
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
                Login
              </button>
              <div className="separator"></div>

              <div className="buttons">
                <button
                  className="google"
                  type="button"
                  onClick={loginWithGoogle}
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

        {/* =================== SIGNUP PAGE =================== */}
        {page === "signup" && (
          <div className="login_tab">
            <div className="title">
              <span>
                {currentStep === 1 ? "Sign up" : "Email Verification"}
              </span>
              <span
                className="link"
                onClick={() => {
                  setPage("login");
                  resetForm();
                }}
              >
                Login <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>

            {currentStep === 1 ? (
              // STEP 1: SIGNUP FORM
              <form onSubmit={handleSignupSubmit}>
                {/* ✅ NAME & USERNAME IN ONE ROW */}
                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label htmlFor="name" className="mb-2">
                      Full Name *
                    </label>
                    <div className="input">
                      <input
                        type="text"
                        id="name"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={handleNameChange}
                      />
                    </div>
                  </div>
                  <div className="width-50">
                    <label htmlFor="username" className="mb-2">
                      Username *
                      <small
                        style={{
                          color: "#888",
                          marginLeft: "8px",
                          fontWeight: "normal",
                        }}
                      >
                        (lowercase only)
                      </small>
                    </label>
                    <div className="input" style={{ position: "relative" }}>
                      <input
                        type="text"
                        id="username"
                        required
                        placeholder="john_doe123"
                        value={username}
                        onChange={handleUsernameChange}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        style={{
                          paddingRight:
                            username && username.length >= 3 ? "90px" : "12px",
                        }}
                      />

                      {/* Status indicator */}
                      {username && username.length >= 3 && (
                        <div
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            color:
                              usernameStatus === "available"
                                ? "#4caf50"
                                : "#ff6b6b",
                            backgroundColor: "rgba(0,0,0,0.4)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            pointerEvents: "none",
                          }}
                        >
                          {usernameStatus === "checking" && "Checking..."}
                          {usernameStatus === "available" && "Available"}
                          {usernameStatus === "taken" && "Taken"}
                          {usernameStatus === "invalid" && "Invalid"}
                        </div>
                      )}
                    </div>

                    {/* Error/Success message */}
                    {username && username.length >= 3 && (
                      <small
                        style={{
                          color:
                            usernameStatus === "available"
                              ? "#4caf50"
                              : "#ff6b6b",
                          fontSize: "0.8rem",
                          marginTop: "0.25rem",
                          display: "block",
                        }}
                      >
                        {usernameStatus === "checking" &&
                          "Checking availability..."}
                        {usernameStatus === "available" &&
                          "This username is available!"}
                        {usernameStatus === "taken" &&
                          "This username is already taken"}
                        {usernameStatus === "invalid" && error}
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
                    placeholder="example@mail.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>

                {/* ✅ PHONE & BIRTHDAY IN ONE ROW */}
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

                {/* ✅ COUNTRY & CITY IN ONE ROW - FIXED VERSION */}
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

                <label htmlFor="password">Password * (Min. 6 characters)</label>
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

                <div className="accept_terms">
                  <input
                    type="checkbox"
                    id="accept"
                    required
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="accept">
                    I accept the{" "}
                    <Link to="/Terms" target="_blank">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/Privacy" target="_blank">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {error && <span className="error">{error}</span>}
                {success && <span className="success">{success}</span>}

                <button
                  className={`login_btn ${
                    error || !termsAccepted ? "disabled" : ""
                  }`}
                  disabled={error || !termsAccepted}
                  type="submit"
                >
                  Continue to Email Verification
                </button>

                <div className="separator"></div>
                <div className="buttons">
                  <button
                    className="google"
                    type="button"
                    onClick={loginWithGoogle}
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
            ) : (
              // STEP 2: EMAIL VERIFICATION
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
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
                  We've sent a verification link to:
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
                        <strong>Important:</strong> Check your email inbox and
                        click the verification link. After clicking the link,
                        come back here and click "I've Verified".
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
                        className="login_btn"
                        type="button"
                        onClick={checkEmailVerification}
                        style={{ flex: 1 }}
                      >
                        {isEmailVerified ? "✓ Verified" : "I've Verified"}
                      </button>
                      <button
                        className="login_btn"
                        type="button"
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
                          ✓ Email verified successfully! You can now proceed.
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
                  <p style={{ color: "#f5f5f5", opacity: 0.7, margin: 0 }}>
                    <strong>Note:</strong> If you don't see the email, check
                    your spam folder.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== FORGOT PASSWORD =================== */}
        {page === "forgot" && (
          <div className="login forgot-password-section">
            <div className="login_tab">
              <div className="title">
                <span>Forgot Password</span>
                <span className="link" onClick={() => setPage("login")}>
                  Login <i className="icon fas fa-arrow-right"></i>
                </span>
              </div>

              <form onSubmit={handlePasswordReset}>
                <label htmlFor="email">Email</label>
                <div className="input">
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="example@mail.com"
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
                  Enter your registered email address, and we'll send you a link
                  to reset your password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
