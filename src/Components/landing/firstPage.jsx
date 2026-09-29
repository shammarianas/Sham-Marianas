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
  "https://n8n.agentixsystem.com/webhook/Sham-Marianas-Inquires";

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

            <div className="mt-4">
              <div className="icon-img">
                <img src="/assets/imgs/icon-img/arrow-down-big.png" alt="" />
              </div>
            </div>
          </div>

          <div className="col-lg-6 hero-form" id="INQUIRY_FORM">
            <div>
              <h4 style={{ color: "#fff", marginBottom: "8px" }}>Start with a brief</h4>
              <p style={{ marginBottom: "20px", lineHeight: 1.4 }}>
                Tell us what you want to create. We&apos;ll review your idea and contact you with the
                right creative direction, scope and next steps.
              </p>
            </div>

            {/* Status Messages */}
            {submitStatus.success === true && (
              <div style={statusStyles.success}>✓ {submitStatus.message}</div>
            )}
            {submitStatus.success === false && (
              <div style={statusStyles.error}>✗ {submitStatus.message}</div>
            )}

            <form
              onSubmit={(e) => e.preventDefault()}
            >
              
                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Company *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Your company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Contact Number *
                    </label>
                    <div className="input phone-input-container">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        disabled={isSubmitting}
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
                        {countryOptions.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Service *
                    </label>
                    <select
                      className="input"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      disabled={isSubmitting}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "1px solid rgba(255, 255, 255, .1215686275)",
                        borderRadius: "8px",
                        backgroundColor: "#0f0f0f",
                        color: "rgb(245, 245, 245)",
                        fontSize: "14px",
                        opacity: 1,
                      }}
                    >
                      <option value="" disabled>
                        Please choose an option
                      </option>
                      <option value="Branding Design">Branding Design</option>
                      <option value="UI-UX Design">UI-UX Design</option>
                      <option value="Web Development">Web Development</option>
                      <option value="E-Commerce Solutions">E-Commerce Solutions</option>
                      <option value="Content Writing">Content Writing</option>
                      <option value="Product Design">Product Design</option>
                      <option value="Social Media & Digital Marketing">Social Media & Digital Marketing</option>
                      <option value="Photography & Video Production">Photography & Video Production</option>
                      <option value="VFX and CGI ADs">VFX and CGI ADs</option>
                      <option value="Print Media Solution">Print Media Solution</option>
                      <option value="AI & Automation">AI & Automation</option>
                      <option value="Exhibition Booth Design">Exhibition Booth Design</option>

                    </select>
                  </div>

                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Budget *
                    </label>
                    <select
                      className="input"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      disabled={isSubmitting}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "1px solid rgba(255, 255, 255, .1215686275)",
                        borderRadius: "8px",
                        backgroundColor: "#0f0f0f",
                        color: "rgb(245, 245, 245)",
                        fontSize: "14px",
                        opacity: 1,
                      }}
                    >
                      <option value="" disabled>
                        Please choose an option
                      </option>
                      <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                      <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                      <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                      <option value="$10,000 - $15,000">$10,000 - $15,000</option>
                      <option value="$15,000+">$15,000+</option>
                      <option value="Not confirmed yet">Not confirmed yet</option>
                    </select>
                  </div>
                </div>

                <div className="col-12">
                  <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                    Project Idea (optional)
                  </label>
                  <textarea
                    rows="4"
                     className="input"
                    placeholder="Share your idea, references, or goals..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              

              <a
                type="submit"
                className="butn butn-sm butn-bg main-colorbg radius-5"
                onClick={!isSubmitting ? handleSubmit : undefined}
                style={isSubmitting ? { opacity: 0.6, pointerEvents: "none" } : {}}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </a>

            </form>

          </div>
        </div>
      </div>
    </header>
  );
}

export default FirstPage;
