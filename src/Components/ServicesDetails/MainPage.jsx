"use client";
import React, { useState } from "react";

const faqs = [
  {
    question: "How do you determine the right design elements for my brand?",
    answer:
      "We begin with a deep understanding of your business, audience, and goals. Our team conducts research to create a design that aligns with your brand values, ensuring your logo, color scheme, and messaging reflect your identity clearly.",
  },
  {
    question: "Can branding design help increase customer loyalty?",
    answer:
      "Absolutely! Strong branding creates a connection with your audience, making your business more relatable and trustworthy. This emotional connection leads to customer loyalty, repeat visits, and long-term engagement with your brand.",
  },
  {
    question: "How long does the branding design process take?",
    answer:
      "The timeline for branding design varies depending on the complexity of the project. On average, it takes 4-6 weeks to complete the entire process, from initial concepts to final designs.",
  },
  {
    question: "Why is branding design important for my business?",
    answer:
      "Effective branding design builds trust, recognition, and emotional connections with your customers. It sets you apart from competitors, creates a memorable identity, and fosters customer loyalty, which drives long-term success.",
  },
  {
    question: "How do I get started with your branding design services?",
    answer:
      "To get started, simply contact us through our website or reach out to our team at Sham Marianas. We’ll schedule a consultation to understand your needs and begin the process of crafting your unique brand identity.",
  },
];

function MainPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      {/* -- Branding Text + Image Section -- */}
      <section className="container section-padding">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-md-6 text-left">
              <h2 className="sub-title-new main-color mb-20">
                The Importance of Effective Branding Design
              </h2>
              <div className="text">
                <p className="mb-15 align-text">
                  Effective branding design is key to building trust and recognition...
                </p>
                <p className="mb-15 align-text">
                  More than just looks, great branding creates emotional connections...
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="services-images">
                <img src="/assets/imgs/Asset_img.png" alt="services" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Digital World Section -- */}
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <img src="/assets/imgs/Asset_img.png" alt="services" />
            </div>
            <div className="col-lg-6 valign">
              <div className="sec-head mb-50 text-left">
                <h2 className="sub-title-new main-color mb-15">
                  The Role of Branding Design in a Fast-Paced Digital World?
                </h2>
                <p className="mb-15 align-text">
                  In today’s fast-paced digital world, branding design is essential...
                </p>
                <p className="mb-15 align-text">
                  Good branding isn’t just about aesthetics; it’s about consistency and trust...
                </p>
                <p className="mb-15 align-text">
                  In short, effective branding design is key to staying ahead in the digital landscape...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Divider -- */}
      <div className="bord-bottom-grd pb-40 pt-40 ontop" />

      {/* -- FAQ Accordion Section -- */}
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
                    key={index}
                    className={`item wow fadeInUp ${activeIndex === index ? "active" : ""}`}
                    data-wow-delay={`.${index + 1}s`}
                  >
                    <div onClick={() => toggleAccordion(index)} className="title">
                      <h6>{faq.question}</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div
                      className="accordion-info"
                      style={{
                        maxHeight: activeIndex === index ? "300px" : "0",
                        overflow: "hidden",
                        transition: "max-height 0.3s ease",
                      }}
                    >
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <img src="/assets/imgs/FAQ.png" alt="FAQ" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MainPage;
