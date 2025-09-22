"use client";
import React from "react";

function UiUx() {
  function openAccordion(event) {
    document.querySelectorAll(".accordion-info").forEach((element) => {
      element.classList.remove("active");
      element.style.maxHeight = 0;
      element.parentElement.classList.remove("active");
    });
    event.currentTarget.parentElement.classList.add("active");
    event.currentTarget.nextElementSibling.style.maxHeight = "300px";
    event.currentTarget.nextElementSibling.classList.add("active");
  }
  return (
    <>
      <section className="container section-padding">
        <div className="col-md-6">
          <h6 className="sub-title main-color mb-15">
            The Power of UI/UX Design
          </h6>

          <div className="text">
            <p className="mb-15">
              A user-friendly interface and intuitive design captivate users,
              boosting user engagement and driving higher conversion rates. A
              seamless UI/UX experience not only enhances user satisfaction but
              also builds brand trust and loyalty, ensuring repeat visits and
              long-term engagement with your brand.
            </p>
          </div>
        </div>
      </section>
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img src="/assets/imgs/arw2.png" alt="" />
              </div>
            </div>
            <div className="col-lg-6 valign">
              <div>
                <div className="sec-head mb-50">
                  <h6 className="sub-title main-color mb-15">
                    Why Do You Need UI/UX Services in Today&apos;s Digital
                    World?
                  </h6>
                  <p>
                    To make an impact on a wider audience, it&apos;s essential
                    to cater to different user preferences. At Sham Marianas,
                    our tailored UI/UX solutions are designed to provide
                    personalized experiences that meet diverse needs. In the
                    fast-paced digital landscape, staying up-to-date is key.
                    What&apos;s trendy today may be outdated tomorrow. Regularly
                    updating your UI/UX design ensures your platform remains
                    fresh, relevant, and engaging. An intuitive,
                    easy-to-navigate interface encourages users to explore more.
                    The longer they engage with your platform, the higher the
                    chances of conversion. Discover how Shammarianas can
                    transform your digital presence with innovative mobile UI/UX
                    design solutions. Stay ahead of the competition and lead the
                    market with expert design services.
                  </p>
                </div>
                <div className="accordion bord">
                  <div
                    className="item active wow fadeInUp"
                    data-wow-delay=".1s"
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>Why is UI/UX design important?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Good UI/UX design helps improve user engagement, boosts
                        conversion rates, and builds brand loyalty. It makes
                        your platform more intuitive, ensuring users have a
                        positive experience.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>How Does UI Design Differ from UX Design?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        UI design focuses on the visual aspects of a
                        product—like colors, buttons, and layout—making it look
                        appealing and easy to interact with. UX design, on the
                        other hand, focuses on the overall experience, ensuring
                        the product is user-friendly, intuitive, and enjoyable
                        to use.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How Can Good UI/UX Design Enhance My Product? </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Good UI/UX design enhances your product by improving
                        user engagement and creating an intuitive, visually
                        appealing interface. A seamless user experience
                        increases user retention, boosts conversion rates, and
                        ensures your product remains competitive and
                        user-friendly
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>What makes your UI/UX design services different? </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        At Shammarianas, we focus on personalized, user-centered
                        designs. We combine creativity with functionality to
                        deliver seamless, engaging experiences that enhance your
                        brand's digital presence.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        Do You Include User Testing in Your Design Workflow?{" "}
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes, user testing is integral to our design workflow. We
                        conduct usability testing to ensure our UI/UX designs
                        are intuitive, user-friendly, and meet audience needs.
                        This helps improve user engagement, boost conversion
                        rates, and enhance user retention.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        What UI/UX design tools and technologies do you use?{" "}
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        At Sham Marianas, we use top UI/UX design tools like
                        Adobe XD, Sketch, and Figma for wireframing,
                        prototyping, and creating intuitive designs. We also
                        utilize InVision and UsabilityHub for user testing to
                        ensure a seamless user experience, improve user
                        engagement, and boost conversion rates.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        How Long Does It Take to Complete a UI/UX Design?{" "}
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        The time to complete a UI/UX design project varies but
                        typically takes 4 to 8 weeks. This includes stages like
                        user research, wireframing, prototyping, and user
                        testing. We focus on enhancing user engagement, boosting
                        conversion rates, and improving user retention.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default UiUx;
