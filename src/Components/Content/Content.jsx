"use client";
import React from "react";

function Content() {
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
            Quality Content is the Heart of Online Success
          </h6>

          <div className="text">
            <p className="mb-15">
              Good design gets attention, but great content keeps it. Your
              message must be concise, compelling, and packed with keywords in
              the fast-paced digital world of today. At Sham Marianas, we write
              content that not only ranks on search engines but also builds
              emotional connections with your readers. We use proven SEO
              strategies to ensure your content appears in front of the right
              audience — while keeping the tone natural, human, and easy to
              understand. Whether it&apos;s a blog post or a product page, every
              word we write is focused on one goal: helping you grow.
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
                    Content That Converts, Ranks, and Builds Trust
                  </h6>
                  <p>
                    You don&apos;t need generic content — you need writing that
                    tells your story, matches your tone, and turns interest into
                    action. Our experienced writers combine creativity with
                    strategy to craft content that&apos;s not just informative
                    but persuasive. We research your audience, understand your
                    industry, and align every piece of content with your brand
                    goals. The result? Writing that is intriguing, self-assured,
                    and clear keeps readers interested and maintains Google
                    ranking.
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
                      <h6>Why is professional content writing important?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        It helps you communicate your message clearly, attract
                        your target audience, and rank higher on search engines
                        — all while building a strong brand identity.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>Do you write SEO-optimized content?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Absolutely. Every piece we write is optimized with
                        relevant keywords, metadata, and formatting to improve
                        your search engine visibility without sounding robotic.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Can you match my brand&apos;s tone and voice?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes! We take the time to understand your brand
                        personality and write in a tone that reflects your
                        identity — whether it&apos;s casual, professional,
                        playful, or formal.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Do I need to provide topics or ideas?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Not at all. Based on your company's objectives and
                        keyword analysis, we may assist in coming up with and
                        recommending content ideas. Or we can write based on
                        your brief — whatever works for you.
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
                        Just contact us through our website, and we&apos;ll
                        schedule a quick chat to understand your needs and start
                        crafting content that connects and converts.
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

export default Content;
