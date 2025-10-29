import React from "react";
import WhatsAppButton from "../Components/whatsappButton";

function Contact() {
  return (
    <>
      <section className="contact section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 valign">
              <div className="sec-head info-box full-width md-mb80">
                <div className="phone fz-22 fw-600 underline main-color">
                  <a href="tel:+971528036012">+971 52 803 6012  <br></br>+92 311 678 8423 </a>
                </div>
                <div className="morinfo mt-50 pb-30 bord-thin-bottom">
                  <h6 className="mb-15">Address</h6>
                  <p>Multan, Pakistan</p>
                </div>
                <div className="morinfo mt-30 pb-30 bord-thin-bottom">
                  <h6 className="mb-15">Email</h6>
                  <p>info@shammarians.com</p>
                </div>
                <div className=" Contact-socialIcons mt-50">
                  {/* Social icon */}
 
              <div className="social-list">
  <a href="https://www.facebook.com/shammarianas/" className="hover-this">
    <div className="hover-anim">
      <i className="fab fa-facebook-f"></i>
    </div>
  </a>
  <a href="https://twitter.com/shammarianas" className="hover-this">
    <div className="hover-anim">
      <i className="fab fa-twitter"></i>
    </div>
  </a>
  <a href="https://www.linkedin.com/in/shammarianas/" className="hover-this">
    <div className="hover-anim">
      <i className="fab fa-linkedin-in"></i>
    </div>
  </a>
  <a href="https://www.instagram.com/sham_marianas/" className="hover-this">
    <div className="hover-anim">
      <i className="fab fa-instagram"></i>
    </div>
  </a>
  <a href="https://www.behance.net/shammarianas" className="hover-this">
    <div className="hover-anim">
      <i className="fab fa-behance"></i>
    </div>
  </a>
  <a href="https://www.pinterest.com/shammarianas" className="hover-this">
    <div className="hover-anim">
      <i className="fa-brands fa-pinterest"></i>
    </div>
  </a>
</div>

<style jsx>{`
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
    border: 1px solid rgba(255,255,255,.1);
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
                    Let&lsquo;s Chat
                  </h6>
                  <h3 className="text-u ls1">
                    Send a <span className="fw-200">message</span>
                  </h3>
                </div>
                <form
                  id="contact-form"
                  className="form2"
                  method="post"
                  action="contact.php"
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
                          required="required"
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
                          required="required"
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
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <textarea
                          id="form_message"
                          name="message"
                          placeholder="Message"
                          rows="4"
                          required="required"
                        ></textarea>
                      </div>
                      <div className="mt-30">
                        <button
                          type="submit"
                          className="butn butn-full butn-bord radius-5"
                        >
                          <span className="text">Let&lsquo;s Talk</span>
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
          src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d110360.73535330701!2d71.40617851104531!3d30.18647833761359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e0!4m5!1s0x393b315778dea7d9%3A0xbad72fc74e55d42f!2sMultan!3m2!1d30.1863557!2d71.4885808!4m0!5e0!3m2!1sen!2s!4v1761715617492!5m2!1sen!2s"
        ></iframe>
      </div>
      <WhatsAppButton />
    </>
  );
}

export default Contact;
