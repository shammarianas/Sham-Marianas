"use client";
import React from "react";

function EcommerceDev() {
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
            Effective E-Commerce Design is Crucial for Success
          </h6>

          <div className="text">
            <p className="mb-15">
              Effective E-Commerce Design is Crucial for Success In today&apos;s
              fast-paced digital world, your e-commerce website is your most
              powerful sales tool, available 24/7 and reaching customers across
              the globe. A well-designed online store does more than just
              display products — it builds trust, drives conversions, and
              ensures your customers keep coming back for more. Speed, clarity,
              and simplicity are everything in e-commerce. From fast loading
              times to clear product listings and a seamless checkout process,
              every second counts. At Sham Marianas, we focus on mobile-friendly
              designs, SEO optimization, and user-friendly navigation to ensure
              your store performs at its peak. With features like secure payment
              gateways, easy inventory management, and customized product pages,
              we create an experience that&apos;s not just smooth but memorable
              — helping you convert visitors into loyal customers.
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
                    E-Commerce That Delivers Results and Drives Growth
                  </h6>
                  <p>
                    E-Commerce That Delivers Results and Drives Growth In
                    today&apos;s world, simply having a website isn&apos;t
                    enough — customers expect a seamless e-commerce experience
                    that&apos;s fast, secure, and easy to navigate. Our tailored
                    e-commerce solutions are designed to meet these high
                    expectations, giving your business the tools it needs to
                    grow and succeed online. We combine sleek design with robust
                    functionality and cutting-edge SEO strategies to create an
                    e-commerce store that not only looks impressive but also
                    works tirelessly to convert visitors into loyal customers.
                    Whether you&apos;re selling a handful of products or scaling
                    a large inventory, we ensure your e-commerce website is
                    built to grow with your business, delivering results and
                    keeping customers engaged for the long run.
                  </p>
                </div>

                <div className="accordion bord">
                  <div
                    className="item active wow fadeInUp"
                    data-wow-delay=".1s"
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>Frequently Questions</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>Why is a custom e-commerce website important?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        A unique e-commerce website improves user experience,
                        increases conversions, and represents your brand. We
                        ensure it&apos;s mobile-friendly, SEO-optimized, and
                        performance-driven.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>What makes Sham Marianas different?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We focus on creating e-commerce experiences that are
                        user-friendly, SEO-optimized, and conversion-driven,
                        ensuring your success.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Is my e-commerce site secure?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We implement secure payment gateways and SSL encryption,
                        ensuring your customers&apos; data is always safe.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Will my website be mobile-friendly?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes! Every e-commerce store we create is
                        mobile-responsive, meaning it looks and functions
                        beautifully on smartphones, tablets, and desktops. This
                        guarantees that your clients will have a seamless
                        purchasing experience regardless of how they browse.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Can I manage my store on my own?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes! We provide an easy-to-use admin panel that allows
                        you to manage products, orders, and inventory without
                        any technical knowledge.
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
                        Simply contact us through our website, and we&apos;ll
                        schedule a consultation to kickstart your project.
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

export default EcommerceDev;
