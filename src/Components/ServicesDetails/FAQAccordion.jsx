"use client";
import React, { useState } from "react";

const FAQAccordion = ({ title, faqs = [], imageSrc = "" }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="intro-accord container section-padding">
      <div className="container ontop">
        <div className="row xlg-marg">
          <div className="col-lg-6 valign">
            <div className="accordion bord">
              <h6 className="sub-title-new main-color mb-15 text-2xl">
                {title || "Frequently Asked Questions"}
              </h6>

              {faqs.map((faq, index) => (
                <div
                  className={`item wow fadeInUp ${
                    activeIndex === index ? "active" : ""
                  }`}
                  data-wow-delay={`.${index + 1}s`}
                  key={index}
                >
                  <div onClick={() => toggleAccordion(index)} className="title">
                    <h6>{faq.question}</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div
                    className="accordion-info"
                    style={{ maxHeight: activeIndex === index ? "300px" : 0 }}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {imageSrc && (
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img src={imageSrc} alt="FAQ illustration" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
