import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";

const AutoLoginTeam = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = localStorage.getItem("teamJoinToken");
        const email = localStorage.getItem("teamJoinEmail");

        if (token && email) {
          // Sign in with the custom token
          await auth.signInWithCustomToken(token);

          // Clear the tokens
          localStorage.removeItem("teamJoinToken");
          localStorage.removeItem("teamJoinEmail");

          // Show welcome message
          alert(
            `🎉 Welcome ${email}! You're now logged in and part of the team.`
          );

          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          // No token, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        navigate("/login");
      }
    };

    autoLogin();
  }, [navigate]);

  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
      <p>Logging you in automatically...</p>
    </div>
  );
};

export default AutoLoginTeam;
