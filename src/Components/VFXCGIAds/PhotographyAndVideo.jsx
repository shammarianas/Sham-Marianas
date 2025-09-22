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
            From Concept to Impact — Ads That Hit Different
          </h6>

          <div className="text">
            <p className="mb-15">
              Every VFX and CGI project we create starts with purpose and ends
              with performance. At Sham Marianas, we don&apos;t just make things
              look amazing — we make them work. Each frame is part of a bigger
              plan to grab attention, spark engagement, and drive results. From
              the very first idea to the final pixel, we handle everything —
              concept creation, scriptwriting, storyboarding, animation,
              editing, and platform-specific optimization. It&apos;s a
              full-circle creative process designed to deliver both visual
              impact and marketing value. Launching a new product? Running a
              bold campaign? Want your brand to shine in a sea of sameness? Our
              VFX and CGI-powered ads give you an undeniable edge — blending
              future-forward visuals with storytelling that stops the scroll and
              moves your audience to act.
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
                    From Bold Ideas to Breathtaking Visuals
                  </h6>
                  <p>
                    At Sham Marianas, we bring ambitious ideas to life through
                    cinematic visuals that captivate, connect, and convert.
                    Whether it's a surreal animation, a stylized brand story, or
                    a hyper-real visual experience, every project is crafted
                    with sharp strategy, artistic finesse, and storytelling that
                    resonates. We transform animation into art — immersive
                    visual journeys that make people stop, feel, and act. Every
                    frame is designed to speak louder than words and leave a
                    lasting mark.
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
                      <h6>What&apos;s the difference between VFX and CGI?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        CGI (computer-generated imagery) creates visuals from
                        scratch, like 3D models and animations. VFX (visual
                        effects) adds those visuals into real footage —
                        combining both to build stunning, lifelike results.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>Do you help with concept and storyboarding?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Absolutely! From brainstorming vYes! We guide you from
                        idea to execution — helping shape concepts, write
                        scripts, storyboard scenes, and plan each effect with
                        your brand in mind.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Can you create short CGI ads for social media?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Absolutely. We design optimized short-form VFX/CGI ads
                        tailored for platforms like Instagram, TikTok, YouTube,
                        and Facebook.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        Are your CGI ads mobile-friendly and web-optimized?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes. Every project is rendered in the ideal format and
                        resolution for web, mobile, and social media — ensuring
                        smooth playback and high quality across all devices.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How do I get started?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Just reach out through our website or contact form.
                        We&apos;ll set up a discovery call to understand your
                        vision and start creating visuals that push your brand
                        forward.
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
