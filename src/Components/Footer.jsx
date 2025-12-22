import React from "react";
import { Link, useLocation } from "react-router-dom";
import Cursor from "../common/cusor";

function Footer() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Check if the current page is /templates or a category template page
  const isTemplatePage =
    path === "/templates" ||
    path === "/contributorlogin" ||
    path === "/login" ||
    path == "/support" ||
    path === "/profile" ||
    path === "//Favorites" ||
    path === "/MyDownloads" ||
    path === "/privacy-policy-template" ||
    path === "/terms-condition-template" ||
    path === "/seller-guideline" ||
    path === "/contributor-policies" ||
    path === "/pricing-and-fees" ||
    path.startsWith("/error") ||
    path.startsWith("/category/fonts") ||
    path.startsWith("/category/video-templates") ||
    path.startsWith("/category/icons") ||
    path.startsWith("/category/models") ||
    path.startsWith("/category/mockups") ||
    path.startsWith("/category/graphics") ||
    path.startsWith("/category/videos") ||
    path.startsWith("/category/images") ||
    path.startsWith("/category/scripts") ||
    path.startsWith("/category/hdri") ||
    path.startsWith("/profile/") ||
    path.startsWith("/profile/") ||
    path.startsWith("/subscription") ||
    path.startsWith("/view/");



  // Check if current page is any dashboard page - ALL POSSIBLE DASHBOARD ROUTES
  const isDashboardPage =
    path.includes('/dashboard') ||
    path.includes('/admin-dashboard') ||
    path.includes('/admin/dashboard') ||
    path.includes('/company-dashboard') ||
    path.includes('/company/dashboard') ||
    path.includes('/contributor/dashboard') ||
    path.includes('/contributordashboard') ||
    path === '/dashboard' ||
    path === '/admin' ||
    path === '/company' ||
    path === '/contributor';

  // Debug: Console log to check what's happening
  console.log('Current path:', path);
  console.log('Is dashboard page:', isDashboardPage);

  // Agar dashboard page hai to footer show nahi karo
  if (isDashboardPage) {
    console.log('Footer hidden for dashboard page');
    return null;
  }

  return (
    <>
      <Cursor />

      <footer className="clean-footer crev">
        <div className="container mt-100 pb-40 pt-40 ontop">
          <div className="row justify-content-between">
            <div className="col-lg-2">
              <div className="logo icon-img-100 md-mb80">
                <img src="/assets/imgs/logo.png" alt="" />
              </div>
            </div>

            {/* Conditionally render contact details */}
            {!isTemplatePage && (
              <div className="col-lg-2">
                <div className="column md-mb50">
                  <h6 className="sub-title mb-30">Contact</h6>
                  <a href="tel:+971528036012" className=" ">
                    <span className="fz-18 main-color p-color fw-400 lh-base">
                      +971 52 803 6012
                    </span>
                  </a>
                  <h6 className="p-color fw-400 mb-15">Dubai, United Arab Emirates</h6>

                   <a href="tel:+923116788423" className=" ">
                    <span className="fz-18 main-color p-color fw-400 lh-base">
                      +92 311 678 8423
                    </span>
                  </a>
                  <h6 className="p-color fw-400 mb-15">Multan, Pakistan</h6>
                  <h6 className="p-color fw-400 mb-15">
                    <a href="mailto:info@shammarianas.com">info@shammarianas.com</a>
                  </h6>
                 
                </div>
              </div>
            )}

            {/* Dynamic Middle Section: Company OR Partner/Seller */}
            <div className={`d-sm-flex d-grid  ${isTemplatePage ? "col-lg-6" : "col-lg-3"} justify-content-between footer-tem-nav`}>

              {/* Conditional: Company OR Partner/Seller */}
              {isTemplatePage ? (
                <>
                  {/* AI Tools Section - NEWLY ADDED */}
                  <div className="column md-mb50">
                    <h6 className="sub-title mb-30">AI Tools</h6>
                    <ul className="rest fz-14 opacity-7">
                      <li className="mb-15">
                        <Link to="/ai-image-generator">AI Image Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/ai-video-generator">AI Video Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/ai-3d-generator">AI 3D Model Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/ai-script-generator">AI Script Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/ai-tools">All AI Tools</Link>
                      </li>
                    </ul>
                  </div>

                  {/* Become a Seller */}
                  <div className="column md-mb50">
                    <h6 className="sub-title mb-30">Become a Seller</h6>
                    <ul className="rest fz-14 opacity-7">
                      <li className="mb-15">
                        <Link to="/ContributorLogin">Sell on Marketplace</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/seller-guideline">Seller Guidelines</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/pricing-and-fees">Pricing & Fees</Link>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {/* Regular Company Menu */}
                  <div className="column md-mb50">
                    <h6 className="sub-title mb-30">Company</h6>
                    <ul className="rest fz-14 opacity-7">
                      <li className="mb-15"><Link to="/">Home</Link></li>
                      <li className="mb-15"><Link to="/services">Services</Link></li>
                      <li className="mb-15"><Link to="/portfolio">Portfolio</Link></li>
                      <li className="mb-15"><Link to="/templates">Templates</Link></li>
                      <li className="mb-15"><Link to="/about">About us</Link></li>
                      <li className="mb-15"><Link to="/blog">Blog</Link></li>
                      <li><Link to="/contact">Contact us</Link></li>
                    </ul>
                  </div>

                  {/* Get Started (non-template) */}
                  <div className="column md-mb50">
                    <h6 className="sub-title mb-30">Get Started</h6>
                    <ul className="rest fz-14 opacity-7">
                      <li className="mb-15"><Link to="/privacy-policy">Privacy Policy</Link></li>
                      <li className="mb-15"><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
                      <li className="mb-15"><Link to="/support">Help Center</Link></li>
                    </ul>
                  </div>
                </>
              )}

              {/* Resources (only on template pages) */}
              {isTemplatePage && (
                <div className="column md-mb50">
                  <h6 className="sub-title mb-30">Resources</h6>
                  <ul className="rest fz-14 opacity-7">
                    <li className="mb-15"><Link to="/privacy-policy-template">Privacy Policy</Link></li>
                    <li className="mb-15"><Link to="/terms-condition-template">Terms & Conditions</Link></li>
                    <li className="mb-15"><Link to="/support">Support</Link></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Newsletter & Social */}
            <div className="col-lg-3">
              <div className="column subscribe-minimal">
                <h6 className="sub-title mb-30">Newsletter</h6>
                <div className="form-group mb-40">
                  <input type="text" name="subscrib" placeholder="Your Email" />
                  <button>
                    <span className="ti-location-arrow"></span>
                  </button>
                </div>

                <ul className="rest social-icon d-flex align-items-center">
                  {/* Conditional Social Media Links for Template vs Non-Template Pages */}
                  {isTemplatePage ? (
                    /* TEMPLATE PAGE SOCIAL LINKS */
                    <>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="#" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fa-brands fa-youtube"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.pinterest.com/shammarianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fa-brands fa-pinterest"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.behance.net/shammarianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-behance"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://dribbble.com/shammarianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fa-brands fa-dribbble"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.instagram.com/sham_marianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-instagram"></i>
                          </div>
                        </a>
                      </li>
                    </>
                  ) : (
                    /* NON-TEMPLATE PAGE SOCIAL LINKS (Regular Website) */
                    <>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.youtube.com/c/ShamMarianasSM" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fa-brands fa-youtube"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.facebook.com/shammarianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-facebook-f"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.behance.net/shammarianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-behance"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.pinterest.com/shammarianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fa-brands fa-pinterest"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.instagram.com/sham_marianas" target="_blank" rel="noreferrer">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-instagram"></i>
                          </div>
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-30 pb-30 mt-80 bord-thin-top">
            <div className="text-center">
              <p className="fz-14">
                © 2025 All Rights Reserved By{" "}
                <span className="underline main-color">
                  <a href="/" target="_blank" rel="noreferrer">
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