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
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import eye_icon from "../../assets/Icons/eye.png";
import { loginWithGoogle } from "./GoogleLogin";
import { loginWithApple } from "./AppleLogin";
import { useLocation } from "react-router-dom";

// Country code data
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

// Country list
const countries = [
  {
    name: "United States",
    code: "US",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  },
  {
    name: "United Kingdom",
    code: "GB",
    cities: ["London", "Manchester", "Birmingham", "Liverpool", "Glasgow"],
  },
  {
    name: "India",
    code: "IN",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"],
  },
  {
    name: "Pakistan",
    code: "PK",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"],
  },
  {
    name: "Canada",
    code: "CA",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  },
  {
    name: "Australia",
    code: "AU",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  },
  {
    name: "Germany",
    code: "DE",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  },
  {
    name: "France",
    code: "FR",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  },
  {
    name: "Japan",
    code: "JP",
    cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"],
  },
  {
    name: "China",
    code: "CN",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
  },
  {
    name: "Brazil",
    code: "BR",
    cities: [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Salvador",
      "Fortaleza",
    ],
  },
  {
    name: "South Africa",
    code: "ZA",
    cities: [
      "Johannesburg",
      "Cape Town",
      "Durban",
      "Pretoria",
      "Port Elizabeth",
    ],
  },
  {
    name: "UAE",
    code: "AE",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman"],
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  },
  { name: "Singapore", code: "SG", cities: ["Singapore"] },
  {
    name: "Malaysia",
    code: "MY",
    cities: ["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh", "Malacca"],
  },
  {
    name: "Turkey",
    code: "TR",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],
  },
  {
    name: "Spain",
    code: "ES",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"],
  },
  {
    name: "Italy",
    code: "IT",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo"],
  },
  {
    name: "Russia",
    code: "RU",
    cities: [
      "Moscow",
      "Saint Petersburg",
      "Novosibirsk",
      "Yekaterinburg",
      "Kazan",
    ],
  },
];

const Login = () => {
  const [page, setPage] = useState("login");
  const [currentStep, setCurrentStep] = useState(1); // 1: Signup form, 2: Email verification
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
  const [availableCities, setAvailableCities] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState(""); // "", "checking", "available", "taken"

  const location = useLocation();
  const navigate = useNavigate();
  const usernameTimeoutRef = useRef(null);

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
        // Reload user to get updated email verification status
        await user.reload();
        if (user.emailVerified) {
          setIsEmailVerified(true);
          setSuccess("Email verified successfully!");
          // Store the verified user
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
    // Rule 1: No spaces allowed
    if (/\s/.test(username)) {
      return "Username cannot contain spaces";
    }

    // Rule 2: Only underscores allowed, no other special characters
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers and underscores (_)";
    }

    // Rule 3: Minimum length
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (username.length > 20) {
      return "Username must be less than 20 characters";
    }

    // Rule 4: Check if username already exists in Firestore
    try {
      // Query Firestore to check if username exists in Profiles collection
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

    return null; // No error
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
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setError("Please enter a valid email address");
    } else if (value && emailRegex.test(value)) {
      setError("");
    }
  };

  const handleUsernameChange = (e) => {
    // Koi .toLowerCase() mat lagao yahan!
    // Bas raw value lo aur state mein save karo
    const value = e.target.value.trim();
    setUsername(value);

    // Baaki sab same rahega...
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    if (!value) {
      setUsernameStatus("");
      setError("");
      setSuccess("");
      return;
    }

    // ... baaki validation same

    // Check karte waqt hi lowercase karo (sirf query ke liye)
    usernameTimeoutRef.current = setTimeout(async () => {
      try {
        const q = query(
          collection(db, "Profiles"),
          where("username", "==", value.toLowerCase()) // ← Sirf yahan lowercase!
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
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
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
    minAgeDate.setFullYear(today.getFullYear() - 13); // Minimum 13 years old

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
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);

    // Country change hone par cities update karein
    const countryData = countries.find((c) => c.name === selectedCountry);
    if (countryData) {
      setAvailableCities(countryData.cities);
      setCity(countryData.cities[0] || "");
    } else {
      setAvailableCities([]);
      setCity("");
    }
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

  // Send email verification (Firebase style - link bhejega)
  const sendVerificationEmail = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate email first
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Validate step 1
      if (!validateStep1()) {
        return;
      }

      // Create temporary user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, {
        displayName: username,
      });

      // Send verification email (Firebase will send a LINK, not code)
      await sendEmailVerification(user, {
        url: window.location.origin + "/email-verified", // Redirect URL after verification
        handleCodeInApp: false,
      });

      // Store temp user reference
      setTempUser(user);

      setIsVerificationSent(true);
      setResendTimer(60); // 60 seconds timer
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
        // Reload user to get latest verification status
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

    // Move to email verification step
    setCurrentStep(2);
    await sendVerificationEmail();
  };

  // Complete signup after email verification
  const completeSignup = async () => {
    try {
      // Use the already verified temp user or create new
      let user;
      if (tempUser && tempUser.emailVerified) {
        user = tempUser;
      } else {
        // Create final user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = userCredential.user;

        // Update profile
        await updateProfile(user, { displayName: username });

        // Send verification email if not verified
        if (!user.emailVerified) {
          await sendEmailVerification(user, {
            url: window.location.origin + "/email-verified",
          });
          setError("Please verify your email first. Check your inbox.");
          return;
        }
      }

      // Create user profile in Firestore
      const userProfileRef = doc(db, "Profiles", user.uid);
      await setDoc(
        userProfileRef,
        {
          username: user.displayName,
          email: user.email,
          profilePic: user.photoURL,
          uid: user.uid,
          role: "user",
          // ✅ NEW FIELDS ADDED
          name: name,
          phone: `${countryCode} ${phone}`,
          emailVerified: true,
          birthday: birthday,
          countryCode: countryCode,
          country: country,
          city: city,
          // ✅ JOIN DATE FIELDS
          createdAt: serverTimestamp(),
          joinDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess("Sign-up successful! Redirecting...");

      // Send welcome email
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

      setTimeout(() => {
        window.location.reload(); // Ya navigate("/", { replace: true })
      }, 3000);
    } catch (err) {
      setError("Sign-up failed: " + err.message);
    }
  };

  const loginWithEmailPassword = async (e) => {
    e.preventDefault();
    try {
      // ✅ Step 1: Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setError(
          "Please verify your email first. Check your inbox for verification link."
        );
        await signOut(auth);
        return;
      }

      setSuccess("Login successful!");

      // ✅ Step 2: Call the cloud function to send login email
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

      // ✅ Step 3: Redirect after 3 seconds
      setTimeout(() => {
        window.location.reload(); // Ya navigate("/", { replace: true })
      }, 3000);
    } catch (err) {
      setError("Login failed: " + err.message);
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
      <Helmet>
        <title>Login | Shammarianas</title>
        <meta name="description" content="Login with Google or Apple" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Login | Shammarianas" />
        <meta property="og:description" content="Login with Google or Apple" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

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
                    <img src={eye_icon} alt="view" />
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
                        autoCapitalize="none" // Keyboard mein capital off
                        spellCheck={false}
                        style={{
                          // Yeh sab hata do → textTransform, border etc
                          // Sirf default input style rahega (email jaisa)
                          paddingRight:
                            username && username.length >= 3 ? "90px" : "12px", // Status ke liye jagah
                        }}
                      />

                      {/* Yeh status indicator abhi bhi dikhega, bilkul email field ki tarah clean */}
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

                    {/* Error/Success message same as before */}
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

                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label htmlFor="country" className="mb-2">
                      Country *
                    </label>
                    <div className="input">
                      <select
                        id="country"
                        value={country}
                        onChange={handleCountryChange}
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
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="width-50">
                    <label htmlFor="city" className="mb-2">
                      City *
                    </label>
                    <div className="input">
                      <select
                        id="city"
                        value={city}
                        onChange={handleCityChange}
                        required
                        disabled={!country}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "4px",
                          backgroundColor: "#181818",
                          color: "#f5f5f5",
                          fontSize: "14px",
                          opacity: country ? 1 : 0.6,
                        }}
                      >
                        <option value="">
                          {country ? "Select City" : "Select country first"}
                        </option>
                        {availableCities.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      <img src={eye_icon} alt="view" />
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
                      <img src={eye_icon} alt="view" />
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
