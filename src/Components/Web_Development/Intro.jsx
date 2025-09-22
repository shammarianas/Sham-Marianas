import React from "react";

function Intro() {
  return (
    <section className="intro section-padding">
      <div className="container">
        <div className="row lg-marg">
          <div className="col-lg-8">
            <div className="row lg-marg">
              <div className="col-md-6">
                <div>
                  <h6 className="sub-title main-color mb-15">Description</h6>
                  <h3 className="mb-30">
                    Building Websites
                    <span className="fw-300">That</span>
                    <span className="fw-300">Work.</span>
                  </h3>
                </div>
                <div className="demo-test">
                  <ul className="rest dot-list">
                    <li className="mb-10">Python Development</li>
                    <li className="mb-10">Website Maintenance</li>
                    <li className="mb-10">Enterprise Development</li>
                    <li className="mb-10">Pentesting</li>
                    <li className="mb-10">Joomla Development</li>
                    <li className="mb-10">WhatsApp Integration</li>
                    <li className="mb-10">Drupal Development</li>
                    <li className="mb-10">ASP.Net Development</li>
                    <li className="mb-10">AngularJS Development</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we create websites that do more than just
                    look great — they load fast, run smoothly on all devices,
                    and leave a strong first impression. With responsive
                    layouts, clean code, and SEO-friendly structures, your site
                    will not only look professional but also rank higher and
                    perform consistently across all browsers. We build digital
                    experiences that grow with your business. From fully
                    customized designs that reflect your brand&apos;s voice to
                    smart features like booking systems, forms, and online
                    stores — everything is tailored to your needs. You&apos;ll
                    have full control to update your content easily, without any
                    tech skills — just real results.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">
                        Your Vision, Our Web Development Expertise
                      </li>
                      <li className="mb-10">Ibexa DXP Development</li>
                      <li className="mb-10">Sharepoint Development</li>
                      <li className="mb-10">Wordpress Development</li>
                      <li className="mb-10">Sitecore Development </li>
                      <li className="mb-10">Ruby on Rails Development</li>
                      <li className="mb-10">CMS Development</li>
                      <li className="mb-10">Laravel Development</li>
                      <li className="mb-10">PHP Development</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="numbers mt-80 md-mb50">
              <div className="row lg-marg">
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20 sm-mb30"></div>
                </div>
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="img-full fit-img">
              <img src="/assets/imgs/intro/2.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
