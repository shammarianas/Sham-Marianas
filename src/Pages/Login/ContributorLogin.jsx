import React, { useRef, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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

const ContributorLogin = () => {
  const [page, setPage] = useState("login");
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Portfolio, 3: Agreement, 4: Success
  const passwordRef = useRef(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ✅ CONTRIBUTOR SPECIFIC FIELDS
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [portfolio, setPortfolio] = useState("");
  const [skills, setSkills] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

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

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);

  // ✅ CONTRIBUTOR HANDLERS
  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handlePhoneChange = (e) => setPhone(e.target.value);
  const handleBirthdayChange = (e) => setBirthday(e.target.value);
  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);
  const handlePortfolioChange = (e) => setPortfolio(e.target.value);
  const handleSkillsChange = (e) =>
    setSkills(e.target.value.split(",").map((skill) => skill.trim()));
  const handleSpecializationChange = (e) => setSpecialization(e.target.value);
  const handleExperienceChange = (e) => setExperience(e.target.value);
  const handleBioChange = (e) => setBio(e.target.value);

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
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
    setError("");
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  const loginWithEmailPassword = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful!");
      setTimeout(
        () => navigate("/contributor/dashboard", { replace: true }),
        3000
      );
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  // ✅ CONTRIBUTOR SIGNUP FUNCTION
  // ✅ CONTRIBUTOR SIGNUP FUNCTION (Updated)
  // 🔵 Creates/updates contributor profile
  const handleContributorProfile = async (user) => {
    await updateProfile(user, { displayName: username });

    const contributorRef = doc(db, "Contributors", user.uid);

    await setDoc(
      contributorRef,
      {
        username,
        fullName,
        email: user.email,
        profilePic: user.photoURL,
        uid: user.uid,
        role: "contributor",
        status: "pending",

        // 👉 Contributor specific details
        phone: `${countryCode} ${phone}`,
        birthday,
        countryCode,
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

    setCurrentStep(4);
    setSuccess(
      "Contributor account created/updated successfully! Under review."
    );

    setTimeout(
      () => navigate("/contributor/dashboard", { replace: true }),
      2000
    );
  };

  const signUpwithEmailPassword = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Try creating NEW user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await handleContributorProfile(user);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        // ✅ Email exists → fetch the user from Firebase Auth
        try {
          const user = auth.currentUser;
          if (user) {
            // User is already signed in, create contributor profile
            await handleContributorProfile(user);
          } else {
            setError(
              "Email already exists. Please login first and then create your contributor profile."
            );
          }
        } catch (profileErr) {
          setError(
            "Failed to create contributor profile: " + profileErr.message
          );
        }
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
      {[1, 2, 3, 4].map((step) => (
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
            {step === 2 && "Portfolio"}
            {step === 3 && "Agreement"}
            {step === 4 && "Success"}
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
                {currentStep === 2 && "Professional Portfolio"}
                {currentStep === 3 && "Contributor Agreement"}
                {currentStep === 4 && "Registration Complete"}
              </span>
              <span
                className="link"
                onClick={() => {
                  setPage("login");
                  setError("");
                  setCurrentStep(1);
                }}
              >
                Back to Login <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>

            <form
              onSubmit={
                currentStep === 3
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
                        Phone Number *
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
                          placeholder="234 567 8900"
                          value={phone}
                          onChange={handlePhoneChange}
                          required
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div className="width-50">
                      <label htmlFor="birthday" className="mb-2">
                        Birthday *
                      </label>
                      <div className="input">
                        <input
                          type="date"
                          id="birthday"
                          value={birthday}
                          onChange={handleBirthdayChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <label htmlFor="password">Password *</label>
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

              {/* ========== STEP 2: PROFESSIONAL PORTFOLIO ========== */}
              {currentStep === 2 && (
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
                          <option value="photography">Photography</option>
                          <option value="illustration">Illustration</option>
                          <option value="vector">Vector Graphics</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                          <option value="3d">3D Models</option>
                          <option value="ui-ux">UI/UX Design</option>
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

                  <label htmlFor="skills">Skills (comma separated)</label>
                  <div className="input">
                    <input
                      type="text"
                      id="skills"
                      placeholder="Photoshop, Illustrator, Photography, UI Design"
                      value={skills.join(", ")}
                      onChange={handleSkillsChange}
                    />
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

              {/* ========== STEP 3: AGREEMENT ========== */}
              {currentStep === 3 && (
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

                    <p>
                      <strong>4. Content Moderation</strong>
                    </p>
                    <p>
                      We reserve the right to review, modify, or remove any
                      content that doesn't meet our guidelines.
                    </p>

                    <p>
                      <strong>5. Account Termination</strong>
                    </p>
                    <p>
                      Either party may terminate this agreement with 30 days
                      written notice.
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

              {/* ========== STEP 4: SUCCESS ========== */}
              {currentStep === 4 && (
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
                      color: "#4caf50",
                      marginBottom: "1rem",
                    }}
                  >
                    ✓
                  </div>
                  <h3 style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
                    Registration Successful!
                  </h3>
                  <p
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.8,
                      marginBottom: "2rem",
                    }}
                  >
                    Your contributor account has been created and is under
                    review. You will be redirected to your dashboard shortly.
                  </p>
                  <button
                    className="login_btn"
                    type="button"
                    onClick={() => navigate("/ContributorDashboard")}
                    style={{ backgroundColor: "#4caf50" }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}

              {error && <span className="error">{error}</span>}
              {success && <span className="success">{success}</span>}

              {/* ========== BUTTONS ========== */}
              {currentStep < 4 && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  {currentStep > 1 && (
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

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="login_btn"
                      onClick={nextStep}
                      style={{ flex: 1 }}
                    >
                      Next
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
