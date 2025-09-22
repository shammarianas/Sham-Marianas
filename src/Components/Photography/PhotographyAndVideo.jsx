"use client";
import React from "react";

function PhotographyAndVideo() {
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
            From Lens to Legacy — Visuals That Resonate
          </h6>

          <div className="text">
            <p className="mb-15">
              At Sham Marianas, our photography & video production services go
              far beyond the lens. We don&apos;t just point and shoot — we tell
              your brand&apos;s story frame by frame. Whether it&apos;s bold
              product photography, cinematic brand videos, or crisp lifestyle
              visuals, we create content that stops the scroll, sparks
              curiosity, and drives action. Every image we capture is built to
              speak your message — loud, clear, and beautifully. From creative
              planning to final edit, we deliver full-scale visual production
              tailored for digital impact. Think scroll-stopping social media
              clips, polished promo videos, striking product shots, and branded
              storytelling — all crafted with pro-level lighting, styling,
              direction, and editing. If your brand needs to be seen and felt;
              we&apos;re here to bring that vision to life — one unforgettable
              visual at a time.
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
                    Framing Brands with Purpose — Photography & Video Production
                    That Converts
                  </h6>
                  <p>
                    At Sham Marianas, we don&apos;t just create visuals — we craft
                    high-impact photo and video content that tells your story,
                    connects with your audience, and fuels business growth. Our
                    photography & video production services are built to elevate
                    your brand through clear, compelling, and conversion-driven
                    visuals. Whether it&apos;s fashion campaigns, product
                    photography, behind-the-scenes content, or cinematic brand
                    videos, we align each frame with your vision and marketing
                    goals. From creative direction to post-production, we
                    deliver polished, platform-ready content that not only looks
                    stunning but also drives real engagement and results.
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
                      <h6>
                        What types of photography and video production services
                        do you offer?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We offer a wide range of visual content services,
                        including product photography, fashion shoots, lifestyle
                        photography, corporate headshots, behind-the-scenes
                        content, promotional videos, brand films, and more — all
                        tailored to your brand&apos;s needs.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>Do you help with concept and creative direction?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Absolutely! From brainstorming visual ideas to
                        storyboarding and art direction, we guide you through
                        the entire creative process to ensure your content
                        aligns with your brand identity and goals.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        Will the content be optimized for social media and
                        websites?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes. All our photo and video content is formatted and
                        optimized for platforms like Instagram, Facebook,
                        TikTok, YouTube, and your website — ensuring
                        high-quality visuals across every channel.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How long does it take to complete a project?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Timelines depend on the scope of your project. We&apos;ll
                        give you a clear timeline during the planning stage and
                        always aim for fast, high-quality delivery.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        Do you provide editing and post-production as well?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes, we handle the full production cycle — from shooting
                        to editing, color grading, sound design, and final
                        delivery.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>. How do I get started?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Just reach out through our website or contact form!
                        We&apos;ll schedule a discovery call to understand your
                        vision and start planning your custom visual content
                        journey.
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

export default PhotographyAndVideo;
