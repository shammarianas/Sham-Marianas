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
                  <h3 className="mb-30">
                    Building Brands{" "}
                    <span className="fw-300">That</span>{" "}
                    <span className="fw-300">Speak</span>
                  </h3>
                </div>
              </div>
              <div className="col-md-6 text-left">
                <div className="text-left align-text">
                  <p className="mb-15 text-left align-text">
                    At{" "}
                    <span className="text-bold text-left underline main-color">
                      Sham Marianas
                    </span>
                    , we craft branding and designs that go beyond just visuals we
                    create identities. Your brand is your story, and we help you
                    tell it with clarity, creativity, and consistency.
                  </p>

                  <p className="mb-15 align-text">
                    Whether you're a startup or an established business, our
                    branding design services ensure that your logo, color
                    scheme, typography, and messaging all align to leave a
                    strong and lasting impression.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">Logo Creation</li>
                      <li className="mb-10">Brand Identity Design</li>
                      <li className="mb-10">Visual Style Guides</li>
                      <li className="mb-10">Typography and Color Palette</li>
                      <li className="mb-10">Social Media Branding</li>
                      <li className="mb-10">Brand Strategy & Messaging</li>
                    </ul>
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
