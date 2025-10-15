import React from "react";

function Contact() {
  return (
    <>
      <section className="contact section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 valign">
              <div className="sec-head info-box full-width md-mb80">
                <div className="phone fz-22 fw-600 underline main-color">
                  <a href="tel:+971528036012">+971 52 803 6012</a>
                </div>
                <div className="morinfo mt-50 pb-30 bord-thin-bottom">
                  <h6 className="mb-15">Address</h6>
                  <p>Punjab, Pakistan</p>
                </div>
                <div className="morinfo mt-30 pb-30 bord-thin-bottom">
                  <h6 className="mb-15">Email</h6>
                  <p>info@shammarians.com</p>
                </div>

                <div className=" Contact-socialIcons mt-50">
                  {/* Social icon */}
              <ul className="rest social-icon d-flex align-items-start">
                <li className="hover-this cursor-pointer mr-10">
                  <a
                    href="https://www.youtube.com/c/ShamMarianasSM"
                    target="_blank"
                   className="hover-anim"
                  >
                    <i class="fa-brands fa-youtube"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer  mr-10">
                  <a
                    href=" https://www.facebook.com/shammarianas"
                    className="hover-anim"
                    target="_blank">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer mr-10">
                  <a
                    href="https://www.behance.net/shammarianas"
                    target="_blank"
                    className="hover-anim"
                  >
                    <i className="fab fa-behance"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer mr-10">
                  <a
                    href="https://www.pinterest.com/shammarianas"
                    className="hover-anim"
                  >
                    <i class="fa-brands fa-pinterest"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer mr-10">
                  <a href="https://www.instagram.com/sham_marianas/" className="hover-anim">
                    <i className="fab fa-instagram"></i>
                  </a>
                </li>
                
              </ul>
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
          src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d109241.94327058276!2d72.62731335962093!3d31.170526945982616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e0!4m0!4m5!1s0x38df948974419acb%3A0x3a9e3018d24eeca0!2sPunjab%2C%20Pakistan!3m2!1d31.1704063!2d72.7097161!5e0!3m2!1sen!2s!4v1760521308547!5m2!1sen!2s"
        ></iframe>
      </div>
    </>
  );
}

export default Contact;
