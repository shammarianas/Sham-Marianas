import { useState, useEffect } from "react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import eye_icon from "../../assets/Icons/eye.png";

const PasswordReset = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetCode, setResetCode] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("oobCode");
    if (code) {
      setResetCode(code);
    } else {
      setError("Invalid or missing password reset code.");
    }
  }, [location.search]);

  const handlePasswordReset = async (event) => {
    event.preventDefault();

    if (!resetCode) {
      setError("Invalid or missing password reset code.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await confirmPasswordReset(auth, resetCode, newPassword);
      setSuccess("Password reset successful! Redirecting to login...");
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Error during password reset:", error);
      if (error.code === "auth/invalid-action-code") {
        setError(
          "The reset code is invalid or has expired. Please request a new password reset."
        );
      } else {
        setError("Password reset failed: " + error.message);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | Shammarianas</title>
        <meta name="description" content="Reset your Shammarianas account password" />
      </Helmet>

      <div className="login">
        <div className="login_tab">
          <div className="title">
            <span>Reset Password</span>
            <span className="link" onClick={() => navigate("/login")}>
              Login <i className="icon fas fa-arrow-right"></i>
            </span>
          </div>

          <form onSubmit={handlePasswordReset}>
            <label htmlFor="new_password">New Password</label>
            <div className="input">
              <input
                type={isPasswordVisible ? "text" : "password"}
                id="new_password"
                name="new_password"
                placeholder="******"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {newPassword && (
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="view_btn"
                >
                  <img  loading="lazy"  src={eye_icon} alt="view" />
                </button>
              )}
            </div>

            <label htmlFor="confirm_password">Confirm Password</label>
            <div className="input">
              <input
                type={isPasswordVisible ? "text" : "password"}
                id="confirm_password"
                name="confirm_password"
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="view_btn"
                >
                  <img  loading="lazy"  src={eye_icon} alt="view" />
                </button>
              )}
            </div>

            {error && <span className="error">{error}</span>}
            {success && <span className="success">{success}</span>}

            <button className="login_btn" type="submit">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordReset;
