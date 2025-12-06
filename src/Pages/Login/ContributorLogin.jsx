import React, { useRef, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import eye_icon from "../../assets/Icons/eye.png";
import { loginWithGoogle } from "./GoogleLogin";
import { loginWithApple } from "./AppleLogin";
import { useLocation } from "react-router-dom";

// Country code data-
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
// Country code data (existing) ke neeche country list aur city list add karein
const countries = [
  { name: "United States", code: "US", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"] },
  { name: "United Kingdom", code: "GB", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Glasgow"] },
  { name: "India", code: "IN", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"] },
  { name: "Pakistan", code: "PK", cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"] },
  { name: "Canada", code: "CA", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"] },
  { name: "Australia", code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"] },
  { name: "Germany", code: "DE", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"] },
  { name: "France", code: "FR", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"] },
  { name: "Japan", code: "JP", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"] },
  { name: "China", code: "CN", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"] },
  { name: "Brazil", code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"] },
  { name: "South Africa", code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"] },
  { name: "UAE", code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman"] },
  { name: "Saudi Arabia", code: "SA", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"] },
  { name: "Singapore", code: "SG", cities: ["Singapore"] },
  { name: "Malaysia", code: "MY", cities: ["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh", "Malacca"] },
  { name: "Turkey", code: "TR", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"] },
  { name: "Spain", code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"] },
  { name: "Italy", code: "IT", cities: ["Rome", "Milan", "Naples", "Turin", "Palermo"] },
  { name: "Russia", code: "RU", cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"] },
];

const ContributorLogin = () => {
  const [page, setPage] = useState("login");
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Verify Email, 3: Portfolio, 4: Agreement, 5: Status
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

  // ✅ CONTRIBUTOR SPECIFIC FIELDS
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [portfolio, setPortfolio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [availableCities, setAvailableCities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const location = useLocation();
  const navigate = useNavigate();


  
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
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setError("Please enter a valid email address");
    } else if (value && emailRegex.test(value)) {
      setError("");
    }
  };

  const handleUsernameChange = (e) => setUsername(e.target.value);

  // ✅ CONTRIBUTOR HANDLERS
  const handleFullNameChange = (e) => setFullName(e.target.value);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
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
    minAgeDate.setFullYear(today.getFullYear() - 13); // Minimum 13 years old

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

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);

    // Country change hone par cities update karein
    const countryData = countries.find(c => c.name === selectedCountry);
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

  // Skills handlers
  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
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
    setSkills(skills.filter(skill => skill !== skillToRemove));
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

    if (
      !fullName ||
      !username ||
      !email ||
      !phone ||
      !birthday ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all required fields");
      return false;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (phone.length !== 10) {
      setError("Phone number must be 10 digits");
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

    return true;
  };

  const validateStep2 = () => {
    if (!specialization || !experience) {
      setError("Please fill all required professional fields");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 3 && !validateStep2()) return;

    if (currentStep === 1) {
      // Step 1 se Step 2 jaane par verification email bhejein
      sendVerificationEmail();
    }

    setCurrentStep(currentStep + 1);
    setError("");
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

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

      // Create temporary user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, {
        displayName: fullName || username
      });

      // Send verification email (Firebase will send a LINK, not code)
      await sendEmailVerification(user, {
        url: window.location.origin + '/contributor/email-verified', // Redirect URL after verification
        handleCodeInApp: false
      });

      // Store temp user reference
      setTempUser(user);

      setIsVerificationSent(true);
      setResendTimer(60); // 60 seconds timer
      setSuccess("Verification email sent! Check your inbox and click the link to verify.");

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already registered. Please login or use a different email.");
      } else if (err.code === 'auth/too-many-requests') {
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
          url: window.location.origin + '/contributor/email-verified',
          handleCodeInApp: false
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
          setError("Email not verified yet. Please check your inbox and click the verification link.");
        }
      }
    } catch (err) {
      setError("Failed to check verification status: " + err.message);
    }
  };

  const loginWithEmailPassword = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email first. Check your inbox for verification link.");
        await signOut(auth);
        return;
      }

      // Check contributor status in Firestore
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
          setError("Your account is still under review. Please wait for admin approval.");
          await signOut(auth);
        } else if (contributorData.status === "rejected") {
          setError("Your contributor application was rejected. Please contact support.");
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
      await updateProfile(user, { displayName: username });

      const contributorRef = doc(db, "Contributors", user.uid);

      await setDoc(
        contributorRef,
        {
          username,
          fullName,
          email: user.email,
          emailVerified: user.emailVerified,
          profilePic: user.photoURL,
          uid: user.uid,
          role: "contributor",
          status: "pending",

          // 👉 Contributor specific details
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

          // 👉 Stats
          totalUploads: 0,
          approvedUploads: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          rating: 0,
          reviews: 0,

          // 👉 Timestamps
          createdAt: serverTimestamp(),
          joinDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      setCurrentStep(5);
      setSuccess(
        "Contributor account created successfully! Under review. You'll receive an email when approved."
      );

      // Send welcome email
      await fetch(
        "https://us-central1-sham-marianas.cloudfunctions.net/sendWelcomeEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: fullName || username,
          }),
        }
      );

    } catch (err) {
      setError("Failed to create contributor profile: " + err.message);
    }
  };

  const signUpwithEmailPassword = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Use the already verified temp user or create new
      let user;
      if (tempUser && tempUser.emailVerified) {
        user = tempUser;
      } else {
        // Create final user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Update profile
        await updateProfile(user, { displayName: username });

        // Send verification email if not verified
        if (!user.emailVerified) {
          await sendEmailVerification(user, {
            url: window.location.origin + '/contributor/email-verified'
          });
          setError("Please verify your email first. Check your inbox.");
          return;
        }
      }

      // Create contributor profile
      await handleContributorProfile(user);

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already exists. Please login or use a different email.");
      } else {
        setError("Sign-up failed: " + err.message);
      }
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
      <Helmet>
        <title>Contributor Login | Your Platform Name</title>
        <meta
          name="description"
          content="Login as contributor to upload and manage your content"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Contributor Login | Your Platform Name"
        />
        <meta
          property="og:description"
          content="Login as contributor to upload and manage your content"
        />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

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
                Login as Contributor
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
                          value={username}
                          onChange={handleUsernameChange}
                        />
                      </div>
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
                        <p style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: "0.25rem" }}>
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
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
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
                          <option value="">{country ? "Select City" : "Select country first"}</option>
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
                </>
              )}

              {/* ========== STEP 2: EMAIL VERIFICATION ========== */}
              {currentStep === 2 && (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: "3rem", color: "#52b0b4", marginBottom: "1rem" }}>
                    ✉️
                  </div>
                  <h3 style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
                    Verify Your Email
                  </h3>
                  <p style={{ color: "#f5f5f5", opacity: 0.8, marginBottom: "1.5rem" }}>
                    We've sent a verification link to:<br />
                    <strong>{email}</strong>
                  </p>

                  {!isVerificationSent ? (
                    <div>
                      <p style={{ color: "#f5f5f5", opacity: 0.6, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                        Click "Next" to send verification email
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        backgroundColor: "rgba(82, 176, 180, 0.1)",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        marginBottom: "1.5rem"
                      }}>
                        <p style={{ color: "#f5f5f5", margin: 0 }}>
                          <strong>Important:</strong> Check your email inbox and click the verification link.
                          After clicking the link, come back here and click "I've Verified".
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
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
                            opacity: resendTimer > 0 ? 0.5 : 1
                          }}
                        >
                          {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend Link"}
                        </button>
                      </div>

                      {isEmailVerified && (
                        <div style={{
                          marginTop: "1.5rem",
                          padding: "1rem",
                          backgroundColor: "rgba(76, 175, 80, 0.1)",
                          borderRadius: "0.5rem"
                        }}>
                          <p style={{ color: "#4caf50", margin: 0 }}>
                            ✓ Email verified successfully! You can now proceed.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: "0.5rem",
                    fontSize: "0.9rem"
                  }}>
                    <p style={{ color: "#f5f5f5", opacity: 0.7, margin: 0 }}>
                      <strong>Note:</strong> If you don't see the email, check your spam folder.
                    </p>
                  </div>
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
                          <option value="video-templates">Video Templates</option>
                          <option value="images">Images</option>
                          <option value="mockups">Mockups</option>
                          <option value="graphic-templates">Graphic Templates</option>
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
                  <div className="skills-container" style={{ marginBottom: "1rem", position: "relative", width: "100%" }}>
                    <div className="input" style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      minHeight: "48px",
                      cursor: "text",
                      width: "100%",
                    }}>
                      {/* Skills tags inside input */}
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
                            height: "28px"
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
                              marginLeft: "0.25rem"
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Input field */}
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
                          padding: "0"
                        }}
                      />
                    </div>

                    {skills.length > 0 && (
                      <p style={{
                        fontSize: "0.75rem",
                        color: "#999",
                        marginTop: "0.5rem"
                      }}>
                        {skills.length} skill{skills.length !== 1 ? 's' : ''} added. Click × to remove.
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
                      Your contributor account will be <strong>under review</strong> after registration.
                      You'll only be able to access the dashboard once your account is approved by an admin.
                      This process usually takes 24-48 hours.
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
                    Your contributor account application has been submitted for review.
                  </p>
                  <p
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.6,
                      fontSize: "0.9rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <strong>Status: Pending Approval</strong><br />
                    Our admin team will review your application. You'll receive an email notification once your account is approved.
                    This process usually takes 24-48 hours.
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
                      marginBottom: "1rem"
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
                    Note: You can only access the dashboard after admin approval.
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
                      disabled={currentStep === 2 && !isEmailVerified}
                      style={{
                        flex: 1,
                        opacity: (currentStep === 2 && !isEmailVerified) ? 0.5 : 1
                      }}
                    >
                      {currentStep === 2 ? "Next" : "Next"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={`login_btn ${!termsAccepted ? "disabled" : ""}`}
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