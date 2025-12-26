import React, { useState } from "react";

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
      // 🔧 REPLACE THIS WITH YOUR ACTUAL FIREBASE FUNCTION URL
      // After deploying, you'll get a URL like:
      // https://us-central1-your-project-id.cloudfunctions.net/sendContactFormEmail
      const CLOUD_FUNCTION_URL =
        "https://us-central1-sham-marianas.cloudfunctions.net/sendContactFormEmail";

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
          message: `Failed to send: ${
            result.error || "Please try again later."
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

  // Status message styles
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

  return (
    <>
      <section className="contact section-padding pt-0">
        <div className="container col-md-6 d-flex justify-content-center">
          <div>
            <div className="valign">
              <div className="full-width">
                <div className="sec-head text-center mb-50">
                  <h6 className="sub-title main-color mb-15">
                    Let&lsquo;s Chat
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
                  onSubmit={handleSubmit}
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
                          placeholder="Name"
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
                          placeholder="Email"
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

                    <div className="col-12 d-flex flex-column align-items-center">
                      <div className="form-group col-12">
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
                      <div className="mt-30 col-3">
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
    </>
  );
}

export default Contact;
