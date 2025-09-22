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
                    We Don&apos;t
                    <span className="fw-300"> Just Build Stores — </span>
                    <span className="fw-300">We Create Online Success.</span>
                  </h3>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we go beyond designing e-commerce websites
                    — we create immersive digital storefronts that wow your
                    customers and turn casual clicks into loyal buyers. Whether
                    you're launching your first e-commerce venture or looking to
                    expand, our custom-built solutions are designed for growth.
                    Fully optimized for mobile, SEO, and performance, your store
                    will be a smooth, effortless experience that attracts
                    visitors, keeps them engaged, and encourages repeat
                    purchases. With us, your e-commerce success is just a click
                    away.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">E-Commerce Services We Offer</li>
                      <li className="mb-10">
                        Custom E-Commerce Website Design
                      </li>
                      <li className="mb-10">
                        Secure Payment Gateway Integration
                      </li>
                      <li className="mb-10">Product Management Systems</li>
                      <li className="mb-10">
                        Shopping Cart & Checkout Optimization{" "}
                      </li>
                      <li className="mb-10">Mobile-Responsive Store Design</li>
                      <li className="mb-10">User-Friendly Admin Panel</li>
                      <li className="mb-10">
                        Search Engine Optimization (SEO)
                      </li>
                      <li className="mb-10">
                        Third-Party App & Plugin Integrations
                      </li>
                      <li className="mb-10">
                        Performance Tracking & Analytics
                      </li>
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
