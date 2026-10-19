import { useEffect, useState } from "react"; // ✅ Add useState import // ✅ Add useState import
import WhatsAppButton from "../Components/whatsappButton";
import ProgressScroll from "../common/ProgressScroll";
import SEO from "../common/SEO.jsx";
import { SEO_CONFIG } from "../utils/seoConfig";
import loadBackgroudImages from "../common/loadBackgroudImages.js";
import SchemaMarkup from "../Components/SchemaMarkup";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: null,
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        success: false,
        message: "Please fill in all required fields (Name, Email, Message)",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: "" });

    try {
      // ✅ Update this URL with your actual Firebase Function URL
      const CLOUD_FUNCTION_URL =
        " https://us-central1-sham-marianas.cloudfunctions.net/sendContactFormEmail";

      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          success: true,
          message:
            "Thank you! Your message has been sent successfully. We'll respond within 24-48 hours.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ success: null, message: "" });
        }, 5000);
      } else {
        setSubmitStatus({
          success: false,
          message: `Failed to send: ${result.error || "Please try again later."
            }`,
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
      padding: "15px",
      borderRadius: "5px",
      marginBottom: "20px",
      border: "1px solid #c3e6cb",
    },
    error: {
      backgroundColor: "#f8d7da",
      borderColor: "#f5c6cb",
      color: "#721c24",
      padding: "15px",
      borderRadius: "5px",
      marginBottom: "20px",
      border: "1px solid #f5c6cb",
    },
  };

  useEffect(() => {
    loadBackgroudImages();
  }, []);

  return (
    <>
      <ProgressScroll />
      <SchemaMarkup type="contact" />
      <SEO {...SEO_CONFIG.contact} />
      <header
        className="page-header bg-img section-padding valign"
        data-background="/assets/imgs/background/bg4.webp"
        data-overlay-dark="8"
      >
        <div className="container pt-80">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-u ls1 fz-80">
                  Contact <span className="fw-200">US</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className="contact section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 valign">
              <div className="sec-head info-box full-width md-mb80">
                <div className="phone fz-22 fw-600 main-color">
                  <a href="tel:+971528036012" aria-label="Call us in Dubai">+971 52 803 6012</a>
                </div>
                <div className="morinfo mt-5 pb-30 bord-thin-bottom">
                  <p>
                    <a
                      href="https://maps.app.goo.gl/thRj1sBv5sg2mHwLA"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open Sham Marianas Dubai location in Google Maps"
                    >
                      Dubai, United Arab Emirates
                    </a>
                  </p>
                </div>
                <div className="phone fz-22 mt-6 fw-600 main-color">
                  <a href="tel:+923116788423" aria-label="Call us in Pakistan">+92 311 678 8423</a>
                </div>
                <div className="morinfo mt-5 pb-30 bord-thin-bottom">
                  <p>Multan, Pakistan</p>
                </div>
                <div className="morinfo mt-30 pb-30 bord-thin-bottom">
                  <h6 className="mb-15">Email</h6>
                  <p>info@shammarianas.com</p>
                </div>
                <div className="Contact-socialIcons mt-50">
                  <div className="social-list">
                    <a
                      href="https://www.facebook.com/shammarianas/"
                      className="hover-this"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook Profile"
                    >
                      <div className="hover-anim">
                        <i className="fab fa-facebook-f"></i>
                      </div>
                    </a>
                    <a
                      href="https://twitter.com/shammarianas"
                      className="hover-this"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter Profile"
                    >
                      <div className="hover-anim">
                        <i className="fab fa-twitter"></i>
                      </div>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/shammarianas/"
                      className="hover-this"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Profile"
                    >
                      <div className="hover-anim">
                        <i className="fab fa-linkedin-in"></i>
                      </div>
                    </a>
                    <a
                      href="https://www.instagram.com/sham_marianas/"
                      className="hover-this"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Profile"
                    >
                      <div className="hover-anim">
                        <i className="fab fa-instagram"></i>
                      </div>
                    </a>
                    <a
                      href="https://www.behance.net/shammarianas"
                      className="hover-this"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Behance Profile"
                    >
                      <div className="hover-anim">
                        <i className="fab fa-behance"></i>
                      </div>
                    </a>
                    <a
                      href="https://www.pinterest.com/shammarianas"
                      className="hover-this"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Pinterest Profile"
                    >
                      <div className="hover-anim">
                        <i className="fab fa-pinterest"></i>
                      </div>
                    </a>
                  </div>

                  <style>{`
                    .social-list {
                      display: flex;
                      gap: 8px;
                    }

                    .social-list a {
                      width: 37px;
                      height: 37px;
                      line-height: 40px;
                      text-align: center;
                      font-size: 13px;
                      border-radius: 50%;
                      color: #fff;
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      position: relative;
                    }

                    .hover-this {
                      transition: all 0.3s ease;
                    }

                    .hover-this:hover {
                      transform: translateY(-5px);
                    }

                    .hover-this .hover-anim {
                      position: relative;
                      width: 100%;
                      height: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                  `}</style>
                </div>
              </div>
            </div>
            <div className="col-lg-7 offset-lg-1 valign">
              <div className="full-width">
                <div className="sec-head mb-50">
                  <h6 className="sub-title main-color mb-15">
                    Let&apos;s Chat
                  </h6>
                  <h3 className="text-u ls1">
                    Send a <span className="fw-200">message</span>
                  </h3>
                </div>

                {/* Status Messages */}
                {submitStatus.success === true && (
                  <div style={statusStyles.success}>
                    ✓ {submitStatus.message}
                  </div>
                )}
                {submitStatus.success === false && (
                  <div style={statusStyles.error}>✗ {submitStatus.message}</div>
                )}

                <form
                  id="contact-form"
                  className="form2"
                  onSubmit={handleSubmit} // ✅ Add onSubmit handler
                  noValidate
                >
                  <div className="messages"></div>

                  <div className="controls row">
                    <div className="col-lg-6">
                      <div className="form-group mb-30">
                        <input
                          id="form_name"
                          type="text"
                          name="name"
                          placeholder="Name "
                          required
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group mb-30">
                        <input
                          id="form_email"
                          type="email"
                          name="email"
                          placeholder="Email "
                          required
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group mb-30">
                        <input
                          id="form_subject"
                          type="text"
                          name="subject"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <textarea
                          id="form_message"
                          name="message"
                          placeholder="Message "
                          rows="4"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        ></textarea>
                      </div>
                      <div className="mt-30">
                        <button
                          type="submit"
                          className="butn butn-full butn-bord radius-5"
                          disabled={isSubmitting}
                        >
                          <span className="text">
                            {isSubmitting ? "Sending..." : "Submit"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="google-map">
        <iframe
          id="gmap_canvas"
          src="https://www.google.com/maps?q=Sham+Marianas+-+Best+Advertising+Agency+in+Dubai&z=17&output=embed"
          title="Dubai Location"
          loading="lazy"
        ></iframe>
      </div>
      <WhatsAppButton />
    </>
  );
}

export default Contact;
