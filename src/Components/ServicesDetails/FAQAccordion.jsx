"use client";
import { useState } from "react";

const FAQAccordion = ({ title, faqs = [], imageSrc = "", imageAlt = "Frequently asked questions" }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const renderAnswer = (faq) => {
    const linkConfig = faq.contactLink
      ? { marker: "contact us", href: "/contact-us" }
      : faq.socialMediaLink
        ? {
            marker: "social media",
            href: "/services/social-media-digital-marketing",
          }
        : null;
    if (!linkConfig) return faq.answer;

    const { marker, href } = linkConfig;
    const markerIndex = faq.answer.indexOf(marker);
    if (markerIndex === -1) return faq.answer;

    return (
      <>
        {faq.answer.slice(0, markerIndex)}
        <a href={href} style={{ color: "#8fe3e6" }}>
          {marker}
        </a>
        {faq.answer.slice(markerIndex + marker.length)}
      </>
    );
  };

  const renderQuestion = (faq) => {
    if (!faq.questionBreakAfter) return faq.question;

    const marker = faq.questionBreakAfter;
    const markerIndex = faq.question.indexOf(marker);
    if (markerIndex === -1) return faq.question;

    return (
      <>
        {faq.question.slice(0, markerIndex + marker.length)}
        <br />
        {faq.question.slice(markerIndex + marker.length).trimStart()}
      </>
    );
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
                    <h6>{renderQuestion(faq)}</h6>
                    <span className="ico ti-plus"></span>
                  </div>
                  <div
                    className="accordion-info"
                    style={{ maxHeight: activeIndex === index ? "300px" : 0 }}
                  >
                    <p>{renderAnswer(faq)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {imageSrc && (
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img loading="lazy" src={imageSrc} alt={imageAlt} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
