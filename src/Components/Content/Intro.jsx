import React from "react";
import { Link } from "react-router-dom";

function Intro() {
  return (
    <section className="intro section-padding">
      <div className="container">
        <div className="row lg-marg">
          <div className="col-lg-8 md-mb80">
            <div className="row lg-marg align-items-center">
              <div className="col-md-6">
                <div className="img1 sm-mb50">
                  <img src="/assets/imgs/intro/04.webp" alt="intro" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <h3 className="mb-30">
                    Sham Marianas{" "}
                    <span className="fw-300">
                      Powering Creativity & Boosting Digital Growth with Top
                      Advertising Strategies
                    </span>
                  </h3>
                  <p>
                    <span className="text-bold underline main-color">
                      Sham Marianas
                    </span>{" "}
                    is a top advertising agency that helps businesses grow with
                    digital marketing, brand building, and ROI-focused
                    advertising. We employ tried-and-true marketing techniques
                    to increase our internet presence, draw in new clients, and
                    provide tangible outcomes. Let's grow your company to new
                    heights!
                  </p>

                  <Link to="/about" className="underline main-color mt-40">
                    <span className="text">
                      More About Us <i className="ti-arrow-top-right"></i>
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="numbers mt-80">
              <div className="row lg-marg">
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20">
                    <div>
                      <h3 className="fw-300 mb-10">100%</h3>
                      <h6 className="p-color sub-title">Clients Satisfaction</h6>
                    </div>
                    <div className="ml-auto">
                      <div className="icon-img-40">
                        <img src="/assets/imgs/arrow-image.webp" alt="arrow" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20">
                    <div>
                      <h3 className="fw-300 mb-10">6745</h3>
                      <h6 className="p-color sub-title">Projects Completed</h6>
                    </div>
                    <div className="ml-auto">
                      <div className="icon-img-40">
                        <img src="/assets/imgs/arrow-image.webp" alt="arrow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="img-full fit-img">
              <img src="/assets/imgs/intro/04.jpg" alt="intro full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
