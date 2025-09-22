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
                    Product
                    <span className="fw-300">Design</span>
                    <span className="fw-300">Service</span>
                  </h3>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we do more than product design — we bring
                    bold ideas to life. Whether it&apos;s a sleek gadget or a smart
                    everyday solution, we turn your vision into a tangible
                    product that looks incredible, feels right, and works
                    flawlessly. From concept to creation, our designs are
                    crafted with purpose, precision, and people in mind. We
                    balance beauty with functionality to create market-ready
                    products that stand out on the shelf and in your customer&apos;s
                    hands. With us, your product doesn&apos;t just exist — it makes
                    an impact.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">
                        Explore Our Product Design Services
                      </li>
                      <li className="mb-10">Industrial Product Design</li>
                      <li className="mb-10">Concept Development & Sketching</li>
                      <li className="mb-10">3D Product Modeling & Rendering</li>
                      <li className="mb-10">Product Prototyping</li>
                      <li className="mb-10">Material & Finish Selection</li>
                      <li className="mb-10">Design for Manufacturing (DFM)</li>
                      <li className="mb-10">User-Centered Design</li>
                      <li className="mb-10">Ergonomic Design</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="numbers mt-80 md-mb50">
              <div className="row lg-marg">
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20 sm-mb30">
                    <div>
                      <h3 className="fw-300 mb-10">100%</h3>
                      <h6 className="p-color sub-title">
                        Clients Satisfaction
                      </h6>
                    </div>
                    <div className="ml-auto">
                      <div className="icon-img-40">
                        <img src="/assets/imgs/arw0.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20">
                    <div>
                      <h3 className="fw-300 mb-10">6700</h3>
                      <h6 className="p-color sub-title">Projects Completed</h6>
                    </div>
                    <div className="ml-auto">
                      <div className="icon-img-40">
                        <img src="/assets/imgs/arw0.png" alt="" />
                      </div>
                    </div>
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
