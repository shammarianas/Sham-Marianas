import "react";
import { Link, useLocation } from "react-router-dom";
import Cursor from "../common/cusor";

function Footer() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // List of non-template single-segment paths
  const nonTemplateSinglePaths = [
    "/",
    "/services",
    "/about",
    "/contact-us",
    "/blog",
    "/case-study",
    "/support",
    "/page-team",
    "/analytics",
    "/terms",
    "/privacy",
    "/cart",
    "/groups",
    "/upload",
    "/checkout",
    "/library",
    "/mydownloads",
    "/favorites",
    "/texture",
    "/success",
    "/error",
    "/privacy-policy",
    "/terms-and-conditions",
    "/seller-guideline",
    "/prices-and-fees",
    "/contributor-policies",
    "/coming-soon",
    "/blogs",
    "/subscription",
    "/login",
    "/contributorlogin",
    "/contributordashboard",
    "/admin",
    "/reset",
    "/logout",
    "/auto-login-team"
  ];

  // Check if the current page is /templates or a category template page
  const isTemplatePage =
    path === "/templates" ||
    path === "/contributorlogin" ||
    path === "/login" ||
    path == "/support" ||
    path === "/favorites" ||
    path === "/mydownloads" ||
    path === "/privacy-policy-template" ||
    path === "/terms-condition-template" ||
    path === "/seller-guideline" ||
    path === "/contributor-policies" ||
    path === "/prices-and-fees" ||
    path === "/coming-soon" ||
    path.startsWith("/profile") ||
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
    path.startsWith("/category/prompts") ||
    path.startsWith("/subscription") ||
    path.startsWith("/view/") ||
    (path.match(/^\/[^/]+$/) && !nonTemplateSinglePaths.includes(path.toLowerCase()));




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



  // Agar dashboard page hai to footer show nahi karo
  if (isDashboardPage) {
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
                <img  loading="lazy"  src="/assets/imgs/logo.png" alt="" />
              </div>
            </div>

            {/* Conditionally render contact details */}
            {!isTemplatePage && (
              <div className="col-lg-3">
                <div className="column md-mb50">
                  <h6 className="sub-title mb-30">Contact</h6>
                  <a href="tel:+971528036012" className=" " aria-label="Call Sham Marianas Dubai">
                    <span className="fz-18 main-color p-color fw-400 lh-base">
                      +971 52 803 6012
                    </span>
                  </a>
                  <h6 className="p-color fw-400 mb-15">Dubai, United Arab Emirates</h6>

                   <a href="tel:+923116788423" className=" " aria-label="Call Sham Marianas Multan">
                    <span className="fz-18 main-color p-color fw-400 lh-base">
                      +92 311 678 8423
                    </span>
                  </a>
                  <h6 className="p-color fw-400 mb-15">Multan, Pakistan</h6>
                  <h6 className="p-color fw-400 mb-15">
                    <a href="mailto:info@shammarianas.com" aria-label="Email Sham Marianas">info@shammarianas.com</a>
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
                        <Link to="/coming-soon">AI Image Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/coming-soon">AI Video Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/coming-soon">AI 3D Model Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/coming-soon">AI Script Generator</Link>
                      </li>
                      <li className="mb-15">
                        <Link to="/coming-soon">All AI Tools</Link>
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
                        {/* <Link to="/prices-and-fees">Pricing & Fees</Link> */}
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
                      <li className="mb-15"><Link to="/case-study">Case Study</Link></li>
                      <li className="mb-15"><Link to="/templates">Templates</Link></li>
                      <li className="mb-15"><Link to="/about">About us</Link></li>
                      <li className="mb-15"><Link to="/blog">Blog</Link></li>
                      <li><Link to="/contact-us">Contact us</Link></li>
                    </ul>
                  </div>

                  {/* Get Started (non-template) */}
                  <div className="column md-mb50">
                    <h6 className="sub-title mb-30">Get Started</h6>
                    <ul className="rest fz-14 opacity-7">
                      <li className="mb-15"><Link to="/privacy-policy">Privacy Policy</Link></li>
                      <li className="mb-15"><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
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
                  <button  aria-label="Subscribe to Newsletter">
                    <span className="ti-location-arrow"></span>
                  </button>
                </div>

                <ul className="rest social-icon d-flex align-items-center">
                  {/* Conditional Social Media Links for Template vs Non-Template Pages */}
                  {isTemplatePage ? (
                    /* TEMPLATE PAGE SOCIAL LINKS */
                    <>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.instagram.com/shammarianastemplate/" target="_blank" rel="noreferrer" aria-label="Instagram Template Channel of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-instagram"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.youtube.com/@ShamMarianasTemplate" target="_blank" rel="noreferrer" aria-label="YouTube Template Channel of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-youtube"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.reddit.com/user/shammarianastemplate/" target="_blank" rel="noreferrer" aria-label="Reddit Template Profile of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-reddit-alien"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.facebook.com/profile.php?id=61595174736095" target="_blank" rel="noreferrer" aria-label="Facebook Template Profile of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-facebook-f"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.pinterest.com/shammarianast/" target="_blank" rel="noreferrer" aria-label="Pinterest Template Profile of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-pinterest"></i>
                          </div>
                        </a>
                      </li>
                    </>
                  ) : (
                    /* NON-TEMPLATE PAGE SOCIAL LINKS (Regular Website) */
                    <>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.youtube.com/c/ShamMarianasSM" target="_blank" rel="noreferrer" aria-label="YouTube Channel of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-youtube"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.facebook.com/shammarianas" target="_blank" rel="noreferrer" aria-label="Facebook Page of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-facebook-f"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.behance.net/shammarianas" target="_blank" rel="noreferrer"  aria-label="Behance Profile of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-behance"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.pinterest.com/shammarianas" target="_blank" rel="noreferrer" aria-label="Pinterest Profile of Sham Marianas">
                          <div className="hover-anim circle-a">
                            <i className="fab fa-pinterest"></i>
                          </div>
                        </a>
                      </li>
                      <li className="hover-this cursor-pointer ml-10">
                        <a href="https://www.instagram.com/sham_marianas" target="_blank" rel="noreferrer" aria-label="Instagram Profile of Sham Marianas">
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
                  <a href="/" target="_blank" rel="noreferrer" aria-label="Visit Sham Marianas F.Z.C Website">
                    Sham Marianas F.Z.C
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="circle-blur">
          <img  loading="lazy"  src="/assets/imgs/patterns/blur1.png" alt="" />
        </div>
      </footer>
    </>
  );
}

export default Footer;
