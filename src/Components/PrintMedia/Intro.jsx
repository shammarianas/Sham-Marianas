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
                    Print That Powers Your Brand — Creative, Strategic, and
                    Impactful
                  </h3>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we transform your brand vision into
                    reality with print media solutions that captivate and
                    convert. Our design process blends bold creativity with
                    strategic thinking to create print materials that not only
                    look stunning but also drive business results. Whether you
                    need a high-impact brochure or a sleek business card, we
                    craft print experiences that demand attention and leave a
                    lasting impression. From concept to final print, we ensure
                    every piece is crafted with purpose — capturing your brand’s
                    essence while inspiring action. Print media isn’t just about
                    aesthetics; it’s about creating materials that move your
                    audience, and that’s exactly what we deliver just look good…
                    It leaves a lasting mark.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">
                        Services We Offer for Print Media
                      </li>
                      <li className="mb-10">Brochure & Catalog Design</li>
                      <li className="mb-10">Business Cards & Stationery</li>
                      <li className="mb-10">Flyers, Posters & Banners</li>
                      <li className="mb-10">Packaging & Labels</li>
                      <li className="mb-10">Magazines & Booklets</li>
                      <li className="mb-10">
                        Event & Corporate Print Collateral
                      </li>
                      <li className="mb-10">Billboard & Signboard</li>
                      <li className="mb-10">
                        Digital Printing & Offset Printing
                      </li>
                      <li className="mb-10">Screen Printing</li>
                      <li className="mb-10">Laser Printing</li>
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
