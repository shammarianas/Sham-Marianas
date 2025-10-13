import React from "react";

function Contact() {
  return (
    <>
      <section className="contact section-padding pt-0">
        <div className="container col-md-6 d-flex justify-content-center">
          <div>
            <div className=" valign">
              <div className="full-width">
                <div className="sec-head text-center mb-50">
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

                    <div className="col-12 d-flex flex-column align-items-center">
                      <div className="form-group col-12">
                        <textarea
                          id="form_message"
                          name="message"
                          placeholder="Message"
                          rows="4"
                          required="required"
                        ></textarea>
                      </div>
                      <div className="mt-30 col-3">
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
     
    </>
  );
}

export default Contact;
