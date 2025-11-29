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

const Login = () => {
  const [page, setPage] = useState("login");
  const passwordRef = useRef(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ✅ NEW FIELDS
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default country code

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [location]);

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
  // ✅ NEW HANDLERS
  const handleNameChange = (e) => setName(e.target.value);
  const handlePhoneChange = (e) => setPhone(e.target.value);
  const handleBirthdayChange = (e) => setBirthday(e.target.value);
  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);

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

  const loginWithEmailPassword = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await fetch(
        "https://us-central1-sham-marianas.cloudfunctions.net/sendLoginEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: userCredential.user.displayName || "User",
          }),
        }
      );

      setSuccess("Login successful!");
      setTimeout(() => navigate("/stock", { replace: true }), 3000);
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  // ✅ UPDATED SIGNUP FUNCTION WITH NEW FIELDS
  const signUpwithEmailPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username,
      });

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
          phone: `${countryCode} ${phone}`, // Save with country code
          birthday: birthday,
          countryCode: countryCode, // Save country code separately if needed
          // ✅ JOIN DATE FIELDS
          createdAt: serverTimestamp(),
          joinDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess("Sign-up successful! Redirecting...");
      setTimeout(() => navigate("/stock", { replace: true }), 3000);
    } catch (err) {
      setError("Sign-up failed: " + err.message);
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
                  setError("");
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
              <span>Sign up</span>
              <span
                className="link"
                onClick={() => {
                  setPage("login");
                  setError("");
                }}
              >
                Login <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>
            <form onSubmit={signUpwithEmailPassword}>
              {/* ✅ NAME & USERNAME IN ONE ROW */}
              <div className="form-row-1 mb-0">
                <div className="width-50">
                  <label htmlFor="name" className="mb-2">
                    Full Name
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
                    Username
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

              {/* ✅ PHONE & BIRTHDAY IN ONE ROW */}
              <div className="form-row-1 mb-0">
                <div className="width-50">
                  <label htmlFor="phone" className="mb-2">
                    Phone Number
                  </label>
                  <div className="input phone-input-container">
                    <select
                      className="country-code-select"
                      value={countryCode}
                      onChange={handleCountryCodeChange}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} ({country.country})
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
                      className="phone-number-input"
                    />
                  </div>
                </div>
                <div className="width-50">
                  <label htmlFor="birthday" className="mb-2">
                    Birthday
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

              <label htmlFor="password">Password</label>
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

              <label htmlFor="cnfpassword">Confirm password</label>
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
                Sign up
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

      <style jsx>{`
        .phone-input-container {
          display: flex;
          gap: 8px;
        }

        .country-code-select {
          width: 50px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          font-size: 14px;
        }

        .phone-number-input {
          flex: 1;
        }

        @media (max-width: 768px) {
          .phone-input-container {
            flex-direction: column;
          }

          .country-code-select {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Login;
