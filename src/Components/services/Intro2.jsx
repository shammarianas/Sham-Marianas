"use client";
import React from "react";

function Intro2() {
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
    <section className="section-padding intro-accord mt-20 mb-20">
      <div className="container">
        <div className="row xlg-marg mb-80">
          <div className="col-lg-6">
            <div className="img md-mb50">
              <img src="/assets/imgs/arw2.png" alt="" />
            </div>
          </div>
          <div className="col-lg-6 valign">
            <div>
              <div className="sec-head mb-50 mt-50">
                <h6 className="sub-title main-color mb-50">Why choose us?</h6>
                <h3>
                  We exceed expectations by blending creativity, <br />
                  expertise, and innovation to drive your success.
                </h3>
              </div>
              <div className="accordion bord">
                <div className="item active wow fadeInUp" data-wow-delay=".1s">
                  <div onClick={openAccordion} className="title">
                    <h6>Tailored Strategies</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div className="accordion-info">
                    <p className="">
                      At Sham Marianas, we believe in tailored strategies —
                      because one size never fits all. Backed by in-depth
                      research and the power of AI, we create smart, data-driven
                      solutions that take your brand to the next level with
                      precision and innovation.
                    </p>
                  </div>
                </div>

                <div className="item wow fadeInUp" data-wow-delay=".3s">
                  <div onClick={openAccordion} className="title">
                    <h6>Expertise</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div className="accordion-info">
                    <p className="">
                      With over 12 years in brand marketing, we’ve collaborated
                      with diverse industries, offering deep insights and
                      delivering tailored solutions that drive impactful
                      results.
                    </p>
                  </div>
                </div>

                <div className="item wow fadeInUp" data-wow-delay=".5s">
                  <div onClick={openAccordion} className="title">
                    <h6>Affordable Plans</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div className="accordion-info">
                    <p className="">
                      We know every business is different, whether you're new or
                      well-established. That's why we offer affordable packages
                      that fit your business's size and needs.
                    </p>
                  </div>
                </div>
                <div className="item wow fadeInUp" data-wow-delay=".5s">
                  <div onClick={openAccordion} className="title">
                    <h6>Impactful Outcomes</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div className="accordion-info">
                    <p className="">
                      After working with countless clients, we've learned what
                      truly works. Our team is dedicated to providing solutions
                      that get real, measurable results for your business.
                    </p>
                  </div>
                </div>
                <div className="item wow fadeInUp" data-wow-delay=".5s">
                  <div onClick={openAccordion} className="title">
                    <h6>At Your Services</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div className="accordion-info">
                    <p className="">
                      We prioritize your concerns, responding within 24 hours.
                      Our team is always available to assist with any urgent
                      needs or emergencies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro2;
