"use client";
import React from "react";

function PrintMediaSolutions() {
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
            From Concept to Impact — Print That Drives Success
          </h6>

          <div className="text">
            <p className="mb-15">
              At Sham Marianas, we transform print into powerful brand
              experiences. Each project is approached with a single goal in
              mind: to design materials that not only stand out but also work
              tirelessly to elevate your brand. Whether launching a bold
              campaign or showcasing your latest product, our print solutions
              are engineered to captivate, build trust, and spark engagement. We
              take care of everything — from initial concept and creative
              ideation to design, production, and delivery — ensuring your print
              materials are aligned with your brand&apos;s voice, laser-focused
              on your message, and optimized for maximum impact. Because great
              print isn&apos;t just a visual; it&apos;s a strategic tool that
              moves your brand forward.
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
                    Print That Captivates and Converts
                  </h6>
                  <p>
                    Print isn&apos;t just paper and ink — it&apos;s your
                    brand&apos;s chance to make a lasting impression. At Sham
                    Marianas, we craft more than just visually striking
                    materials; we create experiences that connect, resonate, and
                    move your audience to act. From bold, captivating visuals to
                    precisely crafted messaging, every piece is designed to stop
                    the scroll, ignite curiosity, and inspire action. Whether
                    it&apos;s a sleek brochure, a powerful business card, or a
                    standout flyer, every design is carefully tailored to leave
                    a lasting mark. We blend cutting-edge design with smart
                    marketing strategy, ensuring your print materials don&apos;t
                    just look great — they perform and deliver measurable
                    results.
                  </p>
                </div>

                <h6 className="sub-title main-color mb-15">
                  Frequently Asked Questions
                </h6>
                <div className="accordion bord">
                  <div
                    className="item active wow fadeInUp"
                    data-wow-delay=".1s"
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>Why Are Print Media Solutions Necessary?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        In today&apos;s digital world, print media solutions
                        create a lasting, tangible connection that digital ads
                        can&apos;t. Materials like brochures, business cards,
                        and posters build trust, leave a memorable impression,
                        and make your brand stand out with a personal touch.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        What makes your print media solutions different from
                        others?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Our focus is on creating impactful print that not only
                        looks great but also works hard to elevate your brand.
                        We combine creative excellence with strategic marketing,
                        ensuring that every print piece is purposeful,
                        memorable, and drives business growth.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Can I get short-run prints or bulk printing?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We offer both short-run and bulk printing options
                        depending on your needs. Whether you need a few items
                        for a special event or a large batch for a nationwide
                        campaign, we have you covered.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        How do you ensure the print materials align with my
                        brand?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Our design process involves understanding your
                        brand&apos;s identity, voice, and goals. We collaborate
                        closely with you from the first idea to the finished
                        print, making sure that every piece reflects your brand
                        and appeals to your target market.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        How do I get started with your print media services?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        To get started, simply reach out through our contact
                        form or schedule a discovery call. We&apos;ll discuss
                        your vision, goals, and how our print media solutions
                        can help you make an impact.
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

export default PrintMediaSolutions;
