import React from "react";

import { Link } from "react-router-dom";

function TemplateFooter() {
  return (
    <footer className="clean-footer crev">
      <div className="container pb-40 pt-40 ontop">
        <div className="row justify-content-between">
          <div className="col-lg-2">
            <div className="logo icon-img-100 md-mb80">
              <img src="/assets/imgs/logo.png" alt="" />
            </div>
          </div>
         
          <div className="d-flex col-lg-4 justify-content-between footer-tem-nav">
            <div className="column md-mb50">
              <h6 className="sub-title mb-30">Company</h6>
              <ul className="rest fz-14 opacity-7">
                <li className="mb-15">
                  <a href="/">Home</a>
                </li>
                <li className="mb-15">
                  <a href="#services">Services</a>
                </li>
                <li className="mb-15">
                  <a href="#portfolio">Portfolio</a>
                </li>
                <li className="mb-15">
                  <Link to="/stock">Templates</Link>
                </li>
                <li className="mb-15">
                  <a href="#about">About</a>
                </li>
                <li className="mb-15">
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#contact">Contact us</a>
                </li>
              </ul>
            </div>
             <div className="column md-mb50">
              <h6 className="sub-title mb-30">Resources</h6>
              <ul className="rest fz-14 opacity-7">
                <li className="mb-15">
                  <a href="#">Privacy Policy</a>
                </li>
                <li className="mb-15">
                  <a href="#">Terms & Conditions</a>
                </li>
                <li className="mb-15">
                  <a href="#">Community</a>
                </li>
                <li className="mb-15">
                  <a href="#">Help Center</a>
                </li>
                <li className="mb-15">
                  <a href="#">Support</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="column subscribe-minimal">
              <h6 className="sub-title mb-30">Newsletter</h6>
              <div className="form-group mb-40">
                <input type="text" name="subscrib" placeholder="Your Email" />
                <button>
                  <span className="ti-location-arrow"></span>
                </button>
              </div>
              {/* Social icon */}
              <ul className="rest social-icon d-flex align-items-center">
                <li className="hover-this cursor-pointer ml-10">
                  <a
                    href="https://www.youtube.com/c/ShamMarianasSM"
                    target="_blank"
                   className="hover-anim"
                  >
                    <i class="fa-brands fa-youtube"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer  ml-10">
                  <a
                    href="https://www.facebook.com/shammarianas"
                    className="hover-anim"
                    target="_blank">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a
                    href="https://www.behance.net/shammarianas"
                    target="_blank"
                    className="hover-anim"
                  >
                    <i className="fab fa-behance"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a
                    href="https://www.pinterest.com/shammarianas"
                    className="hover-anim"
                  >
                    <i class="fa-brands fa-pinterest"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a href="https://www.instagram.com/sham_marianas" className="hover-anim">
                    <i className="fab fa-instagram"></i>
                  </a>
                </li>
                
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-30 pb-30 mt-80 bord-thin-top">
          <div className="text-center">
            <p className="fz-14">
              © 2025 All Rights Reserved By{" "}
              <span className="underline main-color">
                <a href="/" target="_blank">
                  Sham Marianas
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="circle-blur">
        <img src="/assets/imgs/patterns/blur1.png" alt="" />
      </div>
    </footer>
  );
}

export default TemplateFooter;
