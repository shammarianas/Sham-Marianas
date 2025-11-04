import React, { useRef, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // ✅ serverTimestamp import karein
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import eye_icon from "../../assets/Icons/eye.png";
import { loginWithGoogle } from "./GoogleLogin";
import { loginWithApple } from "./AppleLogin"; // NEW: Apple Login
import { useLocation } from "react-router-dom";

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
      setSuccess("Login successful!");
      setTimeout(() => navigate("/stock", { replace: true }), 3000);
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  // ✅ UPDATED FUNCTION - Join date added
  const signUpwithEmailPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const userProfileRef = doc(db, "Profiles", user.uid);
      await setDoc(userProfileRef, {
        username: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        uid: user.uid,
        role: "user",
        // ✅ YE 3 LINES ADD KAREIN - Join Date ke liye
        createdAt: serverTimestamp(), // Firestore server time
        joinDate: serverTimestamp(), // Alternative field
        lastLogin: serverTimestamp(), // First login time
      }, { merge: true });

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
              <span className="link" onClick={() => { setPage("signup"); setError(""); }}>
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
                  <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="view_btn">
                    <img src={eye_icon} alt="view" />
                  </button>
                )}
              </div>

              <span className="forgot_password" onClick={() => { setPage("forgot"); setError(""); }}>
                <span role="button">Forgot password?</span>
              </span>

              {error && <span className="error">{error}</span>}
              {success && <span className="success">{success}</span>}

              <button className="login_btn" type="submit">Login</button>
              <div className="separator"></div>

              <div className="buttons">
                <button className="google" type="button" onClick={loginWithGoogle}>
                  <i className="fab fa-google"></i>
                </button>
                {/* Apple Button (Replaced GitHub) */}
                <button className="apple" type="button" onClick={loginWithApple}>
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
              <span className="link" onClick={() => { setPage("login"); setError(""); }}>
                Login <i className="icon fas fa-arrow-right"></i>
              </span>
            </div>
            <form onSubmit={signUpwithEmailPassword}>
              <label htmlFor="username">Username</label>
              <div className="input">
                <input
                  type="text"
                  id="username"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                />
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
                  <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="view_btn">
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
                  <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="view_btn">
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
                  I accept the <Link to="/Terms" target="_blank">Terms of Service</Link> and{" "}
                  <Link to="/Privacy" target="_blank">Privacy Policy</Link>
                </label>
              </div>

              {error && <span className="error">{error}</span>}
              {success && <span className="success">{success}</span>}

              <button
                className={`login_btn ${error || !termsAccepted ? "disabled" : ""}`}
                disabled={error || !termsAccepted}
                type="submit"
              >
                Sign up
              </button>

              <div className="separator"></div>
              <div className="buttons">
                <button className="google" type="button" onClick={loginWithGoogle}>
                  <i className="fab fa-google"></i>
                </button>
                {/* Apple Button (Replaced GitHub) */}
                <button className="apple" type="button" onClick={loginWithApple}>
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

                <button className="login_btn" type="submit">Send Reset Link</button>
              </form>

              <div className="info_text">
                <p>
                  Enter your registered email address, and we'll send you a link to reset your password.
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