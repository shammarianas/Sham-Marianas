"use client";
import React, { useEffect, useState } from "react";

import loadBackgroudImages from "../../../src/common/loadBackgroudImages";

const countryOptions = [
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+965", country: "Kuwait" },
  { code: "+974", country: "Qatar" },
  { code: "+973", country: "Bahrain" },
  { code: "+968", country: "Oman" },
  { code: "+962", country: "Jordan" },
  { code: "+961", country: "Lebanon" },
  { code: "+20", country: "Egypt" },
  { code: "+90", country: "Turkey" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+1", country: "US / Canada" },
  { code: "+44", country: "UK" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+61", country: "Australia" },
  { code: "+00", country: "Other" },
];

// 🔧 Webhook URL - n8n workflow trigger
// ⚠️ NOTE: Ye "webhook-test" URL hai, sirf testing ke liye kaam karega
// (jab n8n editor mein "Listen for test event" active ho).
// Live website ke liye ise "Production URL" se replace karna hoga
// (n8n Webhook node ke "Production URL" tab se milegi, path mein "-test" nahi hoga)
const WEBHOOK_URL =
  "https://n8n-z5va.srv1917294.hstgr.cloud/webhook/Sham-Marianas-Inquires";

function FirstPage() {
  const [selectedCountryCode, setSelectedCountryCode] = useState("+971");
  const [selectedRegion, setSelectedRegion] = useState("");

  // form data capture karne ke liye
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [idea, setIdea] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: null,
    message: "",
  });

  useEffect(() => {
    loadBackgroudImages();
  }, []);

  const handleSubmit = async () => {
    // Basic validation - required fields
    if (!name || !company || !email || !phone || !service || !budget) {
      setSubmitStatus({
        success: false,
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: "" });

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: name,
          Company: company,
          Email: email,
          "Contact Number": `${selectedCountryCode} ${phone}`,
          Service: service,
          Budget: budget,
          "Project Idea (optional)": idea || "N/A",
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message:
            "Thank you! Your brief has been submitted. We'll get back to you soon.",
        });

        // Reset form
        setName("");
        setCompany("");
        setEmail("");
        setPhone("");
        setService("");
        setBudget("");
        setIdea("");
        setSelectedCountryCode("+971");

        setTimeout(() => {
          setSubmitStatus({ success: null, message: "" });
        }, 5000);
      } else {
        setSubmitStatus({
          success: false,
          message: "Failed to submit. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        success: false,
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusStyles = {
    success: {
      backgroundColor: "#d4edda",
      borderColor: "#c3e6cb",
      color: "#155724",
      padding: "12px",
      borderRadius: "5px",
      marginBottom: "16px",
      border: "1px solid #c3e6cb",
      fontSize: "14px",
    },
    error: {
      backgroundColor: "#f8d7da",
      borderColor: "#f5c6cb",
      color: "#721c24",
      padding: "12px",
      borderRadius: "5px",
      marginBottom: "16px",
      border: "1px solid #f5c6cb",
      fontSize: "14px",
    },
  };

  return (
    <header className="main-header valign" style={{ position: "relative", overflow: "hidden" }}>
      <img
        src="/assets/imgs/background/bg51.jpg"
        alt="Background"
        fetchPriority="high"
        loading="eager"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          filter: "brightness(0.3)",
        }}
      />

      <div className="container ontop" data-aos="fade-up" data-aos-duration="3000">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6">
            <div className="caption" style={{ maxWidth: "620px" }}>
              <h1 className="new">Let's Scale Your Business </h1>
              <h5>
                We Build <span className="main-color">Brand</span>  the Future Remembers
              </h5>

            </div>

        <div className="row mt-80">
          <div className="col-lg-6 order-md-2">
            <div className="icon-img">
              <img src="/assets/imgs/icon-img/arrow-down-big.png" alt="" />
            </div>
          </div>
          <div className="col-lg-6 d-flex justify-content-end order-md-1">
            <div className="info">
              <h2 className="mb-10">6k +</h2>
              <h6>
                Projects completed <br />
                <span className="main-color">successfully</span>
              </h6>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default FirstPage;