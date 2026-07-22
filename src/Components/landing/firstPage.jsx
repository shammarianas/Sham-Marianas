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

function FirstPage() {
  const [selectedCountryCode, setSelectedCountryCode] = useState("+971");
  const [selectedRegion, setSelectedRegion] = useState("");

  useEffect(() => {
    loadBackgroudImages();
  }, []);

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
              <h4>
                We Build <span className="main-color">Brand</span>  the Future Remembers
              </h4>

            </div>

            <div className="mt-4">
              <div className="icon-img">
                <img src="/assets/imgs/icon-img/arrow-down-big.png" alt="" />
              </div>
            </div>
          </div>

          <div className="col-lg-6 hero-form">
            <div>
              <h4 style={{ color: "#fff", marginBottom: "8px" }}>Start with a brief</h4>
              <p style={{ marginBottom: "20px", lineHeight: 1.4 }}>
                Tell us what you want to create. We&apos;ll review your idea and contact you with the
                right creative direction, scope and next steps.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
            >
              
                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Name *
                    </label>
                    <input type="text" class="input" placeholder="Your name" />
                  </div>

                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Company *
                    </label>
                    <input type="text" class="input" placeholder="Your company" />
                  </div>
                </div>

                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Email *
                    </label>
                    <input type="email" class="input" placeholder="you@example.com" />
                  </div>

                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Contact Number *
                    </label>
                    <div className="input phone-input-container">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
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
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-1 mb-0">
                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Service *
                    </label>
                    <select class="input" defaultValue=""
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
                      <option value="AI Commercial Production">AI Commercial Production</option>
                      <option value="CGI / FOOH Activation">CGI / FOOH Activation</option>
                      <option value="Premium Video Production">Premium Video Production</option>
                      <option value="Hybrid AI + CGI + VFX">Hybrid AI + CGI + VFX</option>
                      <option value="Not sure yet">Not sure yet</option>
                    </select>
                  </div>

                  <div className="width-50">
                    <label style={{ display: "block", color: "#fff", marginBottom: "6px" }}>
                      Budget *
                    </label>
                    <select class="input" defaultValue=""
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
                    Project Idea — optional
                  </label>
                  <textarea
                    rows="4"
                     className="input"
                    placeholder="Share your idea, references, or goals..."
                  />
                </div>
              

              <p style={{   lineHeight: 1.4 }}>
                For faster response, you can also send references or a short voice note through
                WhatsApp.
              </p>

              <a
                type="submit"
                className="butn butn-sm butn-bg main-colorbg radius-5"
              >
                Submit
              </a>

            </form>

          </div>
        </div>
      </div>
    </header>
  );
}



const phoneInputWrapperStyle = {
  display: "flex",
  alignItems: "center",
};



export default FirstPage;
