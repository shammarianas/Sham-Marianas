"use client";
import React from "react";

function ReusableSection({
  sectionOne = {},
  sectionTwo = {},
  faqs = [],
  faqImage = "/assets/imgs/FAQ.png",
}) {
  const openAccordion = (event) => {
    document.querySelectorAll(".accordion-info").forEach((element) => {
      element.classList.remove("active");
      element.style.maxHeight = 0;
      element.parentElement.classList.remove("active");
    });
    event.currentTarget.parentElement.classList.add("active");
    event.currentTarget.nextElementSibling.style.maxHeight = "300px";
    event.currentTarget.nextElementSibling.classList.add("active");
  };

  return (
    <>
      {/* Section One */}
      <section className="container section-padding">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-md-6 text-left">
              <h2 className="sub-title-new main-color mb-20">
                {sectionOne.title}
              </h2>
              <div className="text">
                {sectionOne.paragraphs?.map((text, idx) => (
                  <p key={idx} className="mb-15 align-text">
                    {text}
                  </p>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="services-images">
                <img src={sectionOne.image} alt="section one" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Two */}
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <div className="services-images">
                <img src={sectionTwo.image} alt="section two" />
              </div>
            </div>
            <div className="col-lg-6 valign">
              <div className="sec-head mb-50 text-left">
                <h2 className="sub-title-new main-color mb-15">
                  {sectionTwo.title}
                </h2>
                {sectionTwo.paragraphs?.map((text, idx) => (
                  <p key={idx} className="mb-15 align-text">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bord-bottom-grd pb-40 pt-40 ontop"></div>

      {/* FAQ Section */}
      <section className="intro-accord container section-padding">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6 valign">
              <div className="accordion bord">
                <h6 className="sub-title-new main-color mb-15 text-2xl">
                  Frequently Asked Questions
                </h6>
                {faqs.map((faq, index) => (
                  <div
                    className={`item wow fadeInUp ${
                      index === 0 ? "active" : ""
                    }`}
                    data-wow-delay={`.${index + 1}s`}
                    key={index}
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>{faq.question}</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div
                      className={`accordion-info ${
                        index === 0 ? "active" : ""
                      }`}
                      style={{ maxHeight: index === 0 ? "300px" : "0" }}
                    >
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img src={faqImage} alt="FAQ" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ReusableSection;
