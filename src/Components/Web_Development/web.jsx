"use client";
import React from "react";

function WebDev() {
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
            Your Website is Your Business&apos;s Digital Powerhouse
          </h6>

          <div className="text">
            <p className="mb-15">
              In today&apos;s fast-moving digital world, your website is your
              24/7 storefront. A well-developed website builds trust, shows
              credibility, and gives visitors a smooth, satisfying experience —
              no matter the device or browser. At Sham Marianas, we combine fast
              performance, modern design, and strong SEO foundations to build
              websites that attract, engage, and convert. Whether it&apos;s your
              first site or a full redesign, we help you stay ahead of the
              competition and grow with confidence.
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
                    Unlock Your Business&apos;s Potential with a High-Performing
                    Website
                  </h6>
                  <p>
                    In today&apos;s fast-moving digital world, your website is
                    the face of your business online. With attention spans
                    shrinking and competition growing, having a well-designed
                    website can make all the difference. At Sham Marianas, we
                    build websites that not only look amazing but also work
                    flawlessly. We focus on fast load times, mobile-friendly
                    designs, and smooth navigation. Plus, our websites are
                    search engine optimized (SEO), so they&apos;re built to rank
                    higher and bring in more traffic. Our goal is to create a
                    website that&apos;s easy to use and designed to turn
                    visitors into loyal customers. Simply put — if your website
                    isn&apos;t delivering results, it&apos;s holding you back.
                    Don&apos;t let your online presence fall behind — let us
                    help you stand out in today&apos;s competitive digital
                    world.
                  </p>
                </div>
                <div className="mt-30">
                  <ul className="rest dot-list">
                    <li className="mb-10">
                      Modern Tech That Powers Your Project
                    </li>
                    <li className="mb-10">AngularJS</li>
                    <li className="mb-10">C#</li>
                    <li className="mb-10">PHP</li>
                    <li className="mb-10">Laravel </li>
                    <li className="mb-10">Ruby on Rails Development</li>
                    <li className="mb-10">Ruby on Rails</li>
                    <li className="mb-10">Laravel Development</li>
                    <li className="mb-10">Python</li>
                    <li className="mb-10">Swift</li>
                    <li className="mb-10"> Go (Golang)</li>
                    <li className="mb-10">javascript</li>
                    <li className="mb-10"> HTML</li>
                    <li className="mb-10">React</li>
                    <li className="mb-10">ASP.Net</li>
                  </ul>
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
                      <h6>Can you build custom websites for my business?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes, we specialize in custom website development
                        tailored to your business needs. Whether you need a
                        simple website or a complex web application, we ensure
                        the design and functionality align with your
                        brand&apos;s goals.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Can you help improve my website&apos;s SEO?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes, our web development services include SEO
                        optimization to enhance your website&apos;s visibility
                        on search engines. We ensure that your site&apos;s
                        structure, content, and performance align with SEO best
                        practices, helping you rank higher in search results.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Do you provide ongoing website support?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes, we offer website maintenance and support services
                        to keep your site secure, up-to-date, and functioning
                        smoothly. From bug fixes to content updates, we ensure
                        that your website runs optimally.
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
                        Absolutely! All websites we create are responsive and
                        mobile-friendly, ensuring a seamless experience for your
                        users, whether they&apos;re accessing your site from a
                        desktop, tablet, or smartphone.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How long does it take to create a website? </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        The length of time required depends on how complicated
                        the project is. Typically, it takes 4-8 weeks, including
                        design, development, and testing, to create a
                        high-quality, fully functional website.
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

export default WebDev;
