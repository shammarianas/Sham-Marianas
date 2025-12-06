import React from "react";
import { Link, useLocation } from "react-router-dom";
import Cursor from "../common/cusor";

function Footer() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Check if the current page is /stock or a category template page
  const isTemplatePage = 
    path === "/stock" || 
    path === "/contributorlogin" ||
    path === "/login" ||
    path == "/support" ||
    path === "/profile" ||
    path === "//Favorites" ||  
    path === "/MyDownloads" ||  
    path.startsWith("/profile/") ||   // ✅ ADDED: /profile/username
    path.startsWith("/view/") ||  
    path.includes("/category");

  
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
        <div className="container pb-40 pt-40 ontop">
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
                  <h6 className="p-color fw-400 mb-15">Multan, Pakistan</h6>
                  <h6 className="p-color fw-400 mb-15">
                    <a href="mailto:info@shammarianas.com">info@shammarianas.com</a>
                  </h6>
                  <a href="#0" className="underline mb-15">
                    <span className="fz-18 main-color p-color fw-400 lh-base">
                      +92 311 678 8423
                    </span>
                  </a>
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
                        <a href="/seller-guidelines">Seller Guidelines</a>
                      </li>
                      <li className="mb-15">
                        <a href="/subscription">Pricing & Fees</a>
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
                      <li className="mb-15"><a href="/">Home</a></li>
                      <li className="mb-15"><a href="/services">Services</a></li>
                      <li className="mb-15"><a href="/portfolio">Portfolio</a></li>
                      <li className="mb-15"><Link to="/stock">Templates</Link></li>
                      <li className="mb-15"><a href="/about">About</a></li>
                      <li className="mb-15"><a href="/blog">Blog</a></li>
                      <li><a href="/contact">Contact us</a></li>
                    </ul>
                  </div>

                  {/* Get Started (non-template) */}
                  <div className="column md-mb50">
                    <h6 className="sub-title mb-30">Get Started</h6>
                    <ul className="rest fz-14 opacity-7">
                      <li className="mb-15"><Link to="/privacy-policy">Privacy Policy</Link></li>
                      <li className="mb-15"><a href="/terms-and-conditions">Terms & Conditions</a></li>
                      <li className="mb-15"><a href="#">Help Center</a></li>
                    </ul>
                  </div>
                </>
              )}

              {/* Resources (only on template pages) */}
              {isTemplatePage && (
                <div className="column md-mb50">
                  <h6 className="sub-title mb-30">Resources</h6>
                  <ul className="rest fz-14 opacity-7">
                    <li className="mb-15"><a href="#">Privacy Policy</a></li>
                    <li className="mb-15"><a href="#">Terms & Conditions</a></li>
                    <li className="mb-15"><a href="#">Support</a></li>
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