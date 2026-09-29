import React from "react";
import { Link } from "react-router-dom";
import data from "../../data/team.json";
function Team() {
  return (
    <section className="team section-padding pt-0">
      <div className="container">
        <div className="sec-head mb-80">
          <div className="d-flex align-items-center">
            <div>
              <span className="sub-title main-color mb-5">Our Team</span>
              <h3 className="fw-600 fz-50 text-u d-rotate wow">
                <span className="rotate-text">
                  Meet our <span className="fw-200">legends</span>
                </span>
              </h3>
            </div>
            <div className="ml-auto vi-more">
              <Link to="/contact-us" className="butn butn-sm butn-bord radius-30">
                <span>Join to us</span>
             </Link>
              <span className="icon ti-arrow-top-right"></span>
            </div>
          </div>
        </div>
        <div className="row">
          {data.map((item, i) => (
            <div key={i} className="col-lg-4">
              <div className="item mb-4 lg-mb50">
                <div className="img-team img">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={item.img}
                    width={item.width}
                    height={item.height}
                    alt={`${item.name}, ${item.subName} at Sham Marianas F.Z.C`}
                  />
                  <div className="info">
                    <span className="fz-12">{item.subName}</span>
                    <h6 className="fz-18">{item.name}</h6>
                  </div>
                </div>
                <div className="social">
                  <div className="links">
                    <a href="https://www.youtube.com/c/ShamMarianasSM" aria-label="Visit Sham Marianas YouTube channel">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://www.behance.net/shammarianas" aria-label="Visit Sham Marianas Behance profile">
                      <i className="fab fa-behance"></i>
                    </a>
                    <a href="https://www.instagram.com/sham_marianas/" aria-label="Visit Sham Marianas Instagram profile">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Team;
