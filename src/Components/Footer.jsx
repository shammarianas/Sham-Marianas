import React from "react";
import { Link, useLocation } from "react-router-dom";
import Cursor from "../common/cusor";


function Footer() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Check if the current page is /stock or a category template page
  const isTemplatePage = path === "/stock" || path.includes("/category");
  
  return (
    <>
<Cursor /> 
          
    <footer className="clean-footer crev">
      <div className="container pb-40 pt-40 ontop">
        <div className="row justify-content-between">
          <div className="col-lg-2">
            <div className="logo icon-img-100 md-mb80">
              <img src="/assets/imgs/logo.png" alt="" />
            </div>
          </div>
          {/* Conditionally render contact details */}
          {!isTemplatePage && (
            <div className="col-lg-3">
              <div className="column md-mb50">
                <h6 className="sub-title mb-30">Contact</h6>
                <h6 className="p-color fw-400 mb-15">Multan, Pakistan</h6>
                <h6 className="p-color fw-400 mb-15">
                  <a href="mailto:info@shammarianas.com">info@shammarianas.com</a>
                </h6>
                <a href="#0" className="underline mb-15">
                  <span className="fz-18 main-color p-color fw-400 lh-base">
                    +971 52 803 6012 <br />
                    +92 311 678 8423
                  </span>
                </a>
              </div>
            </div>
          )}
          <div className={`d-flex ${isTemplatePage ? "col-lg-4" : "col-lg-3"} justify-content-between footer-tem-nav`}>
            <div className="column md-mb50">
              <h6 className="sub-title mb-30">Company</h6>
              <ul className="rest fz-14 opacity-7">
                <li className="mb-15">
                  <a href="/">Home</a>
                </li>
                <li className="mb-15">
                  <a href="/services">Services</a>
                </li>
                <li className="mb-15">
                  <a href="/portfolio">Portfolio</a>
                </li>
                <li className="mb-15">
                  <Link to="/stock">Templates</Link>
                </li>
                <li className="mb-15">
                  <a href="/about">About</a>
                </li>
                <li className="mb-15">
                  <a href="/blog">Blog</a>
                </li>
                <li>
                  <a href="/contact">Contact us</a>
                </li>
              </ul>
            </div>
            <div className="column md-mb50">
              {/* Conditionally render Get Started or Resources menu */}
              {isTemplatePage ? (
                <>
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
                </>
              ) : (
                <>
                  <h6 className="sub-title mb-30">Get Started</h6>
                  <ul className="rest fz-14 opacity-7">
                    <li className="mb-15">
                      <Link to="/privacy-policy">Privacy Policy</Link>
                    </li>
                    <li className="mb-15">
                      <a href="/terms-and-conditions">Terms & Conditions</a>
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
                </>
              )}
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
                  <a href="https://www.youtube.com/c/ShamMarianasSM" target="_blank">
                    <div className="hover-anim circle-a">
                    <i className="fa-brands fa-youtube"></i>
                  </div>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                <a href="https://www.facebook.com/shammarianas"
                    target="_blank">
                    <div
                    className="hover-anim circle-a"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </div>
                </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                 <a  href="https://www.behance.net/shammarianas"
                    target="_blank">
                   <div
                   
                    className="hover-anim circle-a"
                  >
                    <i className="fab fa-behance"></i>
                  </div>
                 </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a  href="https://www.pinterest.com/shammarianas"
                    target="_blank">
                    <div
                      className="hover-anim circle-a"
                    >
                      <i className="fa-brands fa-pinterest"></i>
                  </div>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a href="https://www.instagram.com/sham_marianas"
                    target="_blank">
                    <div className="hover-anim circle-a" >
                    <i className="fab fa-instagram"></i>
                  </div>
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

    </>
  );
}

export default Footer;