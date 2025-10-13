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
                    Creating the Unreal — VFX & CGI Ads That Captivate and
                    Convert
                  </h3>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we turn imagination into impact — crafting
                    cinematic visuals that not only dazzle the eye but also
                    drive real results. Our VFX (visual effects) and CGI
                    (computer-generated imagery) services merge storytelling
                    with next-level design to create ads that demand attention
                    and inspire action. From surreal animations to lifelike 3D
                    worlds, we breathe digital life into your ideas — building
                    visual experiences that break boundaries, stir emotions, and
                    amplify your brand message. Whether it’s a high-energy
                    product ad or a futuristic brand film, we bring creativity
                    and precision to every frame.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">VFX & CGI Ad Services We Offer</li>
                      <li className="mb-10">
                        3D Product Animations & Commercials
                      </li>
                      <li className="mb-10">CGI Brand Videos</li>
                      <li className="mb-10">
                        Motion Graphics & Visual Effects
                      </li>
                      <li className="mb-10">
                        Virtual Environments & Set Extensions
                      </li>
                      <li className="mb-10">Animated Explainer Ads</li>
                      <li className="mb-10">Logo Animations & Visual Intros</li>
                      <li className="mb-10">
                        Cinematic CGI for TVCs & Digital Ads
                      </li>
                      <li className="mb-10">
                        Post-Production FX & Compositing
                      </li>
                      <li className="mb-10">
                        Custom CGI for Social Media Campaigns
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
