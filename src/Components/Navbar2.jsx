"use client";
import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import Search from "./Search";
import "../assets/Styles/navbar-logo.css";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const { currentUser } = useUser() || "";
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length;
  const currentPage = useLocation().pathname;
  const [username, setUsername] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const showTemplateButton = [
    "/",
    "/about",
    "/services",
    "/portfolio",
    "/blog",
    "/contact",
    "/project-details",
    "/Blog-details",
  ].some((path) =>
    path === "/" ? currentPage === "/" : currentPage.startsWith(path)
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        setUsername(null);
        setUserProfileData(null);
        return;
      }

      try {
        const profileRef = doc(db, "Profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setUsername(profileData.username || null);
          setUserProfileData(profileData);
        } else {
          const contributorRef = doc(db, "Contributors", currentUser.uid);
          const contributorSnap = await getDoc(contributorRef);

          if (contributorSnap.exists()) {
            const contributorData = contributorSnap.data();
            setUsername(contributorData.username || null);
            setUserProfileData(contributorData);
          } else {
            setUsername(null);
            setUserProfileData(null);
          }
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername(null);
        setUserProfileData(null);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const getDisplayName = () => {
    if (!userProfileData) {
      if (currentUser?.displayName) return currentUser.displayName;
      if (currentUser?.email) {
        const emailName = currentUser.email.split("@")[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
      return "User";
    }

    const firstName = userProfileData.firstName || userProfileData.firstname || userProfileData.first_name;
    const lastName = userProfileData.lastName || userProfileData.lastname || userProfileData.last_name;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      return firstName.trim();
    } else if (lastName) {
      return lastName.trim();
    }

    if (userProfileData.fullName && userProfileData.fullName.trim()) {
      return userProfileData.fullName.trim();
    }

    if (userProfileData.displayUsername && userProfileData.displayUsername.trim()) {
      return userProfileData.displayUsername.trim();
    }

    if (userProfileData.username && userProfileData.username.trim()) {
      return userProfileData.username.trim();
    }

    if (userProfileData.displayName && userProfileData.displayName.trim()) {
      return userProfileData.displayName.trim();
    }

    if (userProfileData.authorName && userProfileData.authorName.trim()) {
      return userProfileData.authorName.trim();
    }

    if (userProfileData.email) {
      const emailName = userProfileData.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) {
      const emailName = currentUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return "User";
  };

  const getProfileLink = () => {
    if (!currentUser?.uid) return "/login";
    if (username) return `/profile/${username}`;
    return `/profile`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 300) navbar?.classList.add("nav-scroll");
      else navbar?.classList.remove("nav-scroll");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleDropdownMouseMove(event) {
    const menu = event.currentTarget?.querySelector?.(".dropdown-menu");
    if (!menu) return;
    menu.classList.add("show");
  }

  function handleDropdownMouseLeave(event) {
    const menu = event.currentTarget?.querySelector?.(".dropdown-menu");
    if (!menu) return;
    menu.classList.remove("show");
  }

  function handleToggleNav() {
    const collapse = document.querySelector(".navbar .navbar-collapse");
    if (!collapse) return;
    collapse.classList.toggle("show");
  }

  // Mobile menu toggle function
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Add/remove body scroll lock
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  // Close mobile menu when clicking on a link
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  // Navigation items array for consistency
  const navItems = [
    { path: "/Videos", label: "Videos" },
    { path: "/Models", label: "3D Models" },
    { path: "/video-templates", label: "Video Template" },
    { path: "/images", label: "Images" },
    { path: "/graphics", label: "Graphic Templates" },
    { path: "/Mockups", label: "Mockups" },
    { path: "/Fonts", label: "Fonts" },
    { path: "/More", label: "More" },
  ];

  // More dropdown items
  const moreDropdownItems = [
    { path: "/icons", label: "Icons" },
    { path: "/textures", label: "Textures" },
    { path: "/scripts", label: "Scripts" },
    { path: "/hdris", label: "HDRIs" },
  ];

  // If user is NOT logged in
  if (!currentUser) {
    return (
      <>
        <nav className="navbar navbar-expand-lg bord blur">
          <div className="container o-hidden">
            <Link to="/" className="logo site-logo-link" aria-label="Home">
              <img
                src="/assets/imgs/logo.png"
                className="site-logo-img"
                alt="Sham Marianas logo"
              />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              onClick={handleToggleNav}
            >
              <span className="icon-bar">
                <i className="fas fa-bars"></i>
              </span>
            </button>
            <div
              className="collapse navbar-collapse justify-content-center"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav">
                <li className="nav-item d-lg-none">
                  <Link to="/stock" className="nav-link">
                    <span className="rolling-text">Template</span>
                  </Link>
                </li>
                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <Link
                    className="nav-link dropdown-toggle"
                    data-toggle="dropdown"
                    to="/"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Home</span>
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/about">
                        About us
                      </Link>
                    </li>
                  </ul>
                </li>

                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseLeave}
                  className="nav-item dropdown"
                >
                  <Link
                    className="nav-link"
                    to="/services"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Services</span>
                  </Link>
                </li>
                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <Link
                    className="nav-link"
                    to="/portfolio"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Portfolio</span>
                  </Link>
                </li>

                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <Link
                    className="nav-link"
                    to="/blog"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Blogs</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">
                    <span className="rolling-text">Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="contact-button">
              {showTemplateButton ? (
                <Link
                  to="/stock"
                  className="butn butn-sm butn-bg main-colorbg radius-5"
                >
                  <span className="text">Template</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="butn butn-sm butn-bg main-colorbg radius-5"
                >
                  <span className="text">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Menu Toggle Button for Bottom Bar - Only on /stock */}
        {currentPage === "/stock" && (
          <>
            {/* Mobile Hamburger Button - Only show on mobile */}
            <div className="mobile-menu-toggle d-lg-none" style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 1000,
              background: "#09f",
              color: "white",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 153, 255, 0.5)",
              cursor: "pointer"
            }}>
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`} style={{ fontSize: "24px" }} onClick={toggleMobileMenu}></i>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.9)",
              zIndex: 999,
              display: isMobileMenuOpen ? "block" : "none",
              paddingTop: "80px"
            }}>
              <div className="mobile-menu-content" style={{
                padding: "20px",
                overflowY: "auto",
                height: "calc(100% - 80px)"
              }}>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0
                }}>
                  {navItems.map(({ path, label }) => (
                    <li key={path} style={{ marginBottom: "15px" }}>
                      <NavLink
                        to={path}
                        className={({ isActive }) => 
                          isActive ? "active-mobile-link" : "mobile-link"
                        }
                        style={{
                          display: "block",
                          padding: "15px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "10px",
                          color: "white",
                          textDecoration: "none",
                          fontSize: "18px",
                          textAlign: "center",
                          transition: "all 0.3s ease"
                        }}
                        onClick={handleMobileLinkClick}
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                  
                  {/* More dropdown items in mobile */}
                  {moreDropdownItems.map(({ path, label }) => (
                    <li key={path} style={{ marginBottom: "15px" }}>
                      <Link
                        to={path}
                        className="mobile-link"
                        style={{
                          display: "block",
                          padding: "15px",
                          background: "rgba(0, 153, 255, 0.1)",
                          borderRadius: "10px",
                          color: "#09f",
                          textDecoration: "none",
                          fontSize: "18px",
                          textAlign: "center",
                          transition: "all 0.3s ease"
                        }}
                        onClick={handleMobileLinkClick}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {currentPage === "/stock" && (
          <div className="bottom-bar d-none d-lg-flex">
            <div className="links">
              <ul style={{ whiteSpace: "nowrap", alignItems: "center" }}>
                {navItems.map(({ path, icon, label }) => {
                  if (label == "More") {
                    return (
                      <nav
                        key={path}
                        style={{ position: "relative" }}
                        className="navbar navbar-expand-lg"
                      >
                        <div className="">
                          <div
                            className="collapse navbar-collapse justify-content-center"
                            id="navbarSupportedContent"
                          >
                            <span className="navbar-nav">
                              <li
                                onMouseLeave={handleDropdownMouseLeave}
                                onMouseMove={handleDropdownMouseMove}
                                className="nav-item dropdown"
                              >
                                <p
                                  className="nav-link dropdown-toggle"
                                  data-toggle="dropdown"
                                  href=""
                                  role="button"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <span
                                    style={{ marginTop: "3px" }}
                                    className="rolling-text"
                                  >
                                    More
                                  </span>
                                </p>
                                <ul
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                  className="dropdown-menu"
                                >
                                  {moreDropdownItems.map(({ path, label }) => (
                                    <li key={path}>
                                      <Link className="dropdown-item" to={path}>
                                        {label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            </span>
                          </div>
                        </div>
                      </nav>
                    );
                  }
                  return (
                    <li key={path}>
                      <NavLink
                        className={({ isActive }) =>
                          isActive ? "active" : undefined
                        }
                        to={path}
                      >
                        <i className={`fa-solid ${icon}`}></i>
                        {label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </>
    );
  }

  // ✅ LOGGED IN USER
  return (
    <>
      <div className="navbar navbar-expand-lg bord blur">
        <Link to="/" className="logo site-logo-link" aria-label="Home">
          <img
            src="/assets/imgs/logo.png"
            className="site-logo-img"
            alt="Sham Marianas logo"
          />
        </Link>

        {/* Mobile Hamburger Button for Logged In Users - Only on pages with bottom bar */}
        {![
          "/",
          "/Login",
          "/Upload",
          "/reset",
          "/admin",
          "/Contributor",
          "/contributor/dashboard",
          "/contributordashboard",
        ].includes(currentPage) && (
          <div className="mobile-menu-toggle d-lg-none" style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 100,
            background: "transparent",
            color: "white",
            fontSize: "20px",
            cursor: "pointer"
          }}>
            <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`} onClick={toggleMobileMenu}></i>
          </div>
        )}

        {![
          "/Login",
          "/Upload",
          "/reset",
          "/admin",
          "/Contributor",
          "/contributor/dashboard",
          "/contributordashboard",
        ].includes(currentPage) && (
          <>
            <Link to="/stock">
              <div className="d-none d-md-block  ml-auto vi-more">
                <span className="butn butn-sm butn-bord radius-30">
                  <span>Explore</span>
                </span>
                <span className="icon ti-arrow-top-right"></span>
              </div>
            </Link>
            <Search />
          </>
        )}

        <div className="right">
          <div className="nav_buttons">
            <div className="navbar_dropdown">
              {currentUser?.uid ? (
                <Link to={getProfileLink()}>
                  <button className="signed_in">
                    <i className="icon fa-solid fa-user"></i>
                    <span className="username">
                      {getDisplayName()}
                    </span>
                  </button>
                </Link>
              ) : (
                <Link to="/Login">
                  <button className="">Sign In</button>
                </Link>
              )}

              <div className={currentUser?.uid ? "dropdown" : "hidden none"}>
                <ul className="links">
                  <li>
                    <Link to="/MyDownloads">My Downloads</Link>
                  </li>
                  <li>
                    <Link to="/Favorites">My Favorites</Link>
                  </li>
                  <li>
                    <Link to={getProfileLink()}>Profile</Link>
                  </li>
                  <li>
                    <Link to="/Support">Support</Link>
                  </li>
                  <li>
                    <Link className="logout" to="/Logout">
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay for Logged In Users */}
      {![
        "/",
        "/Login",
        "/Upload",
        "/reset",
        "/admin",
        "/Contributor",
        "/contributor/dashboard",
        "/contributordashboard",
      ].includes(currentPage) && (
        <>
          <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 999,
            display: isMobileMenuOpen ? "block" : "none",
            paddingTop: "80px"
          }}>
            <div className="mobile-menu-content" style={{
              padding: "20px",
              overflowY: "auto",
              height: "calc(100% - 80px)"
            }}>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0
              }}>
                {navItems.map(({ path, label }) => (
                  <li key={path} style={{ marginBottom: "15px" }}>
                    <NavLink
                      to={path}
                      className={({ isActive }) => 
                        isActive ? "active-mobile-link" : "mobile-link"
                      }
                      style={{
                        display: "block",
                        padding: "15px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "10px",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "18px",
                        textAlign: "center",
                        transition: "all 0.3s ease"
                      }}
                      onClick={handleMobileLinkClick}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
                
                {/* More dropdown items in mobile */}
                {moreDropdownItems.map(({ path, label }) => (
                  <li key={path} style={{ marginBottom: "15px" }}>
                    <Link
                      to={path}
                      className="mobile-link"
                      style={{
                        display: "block",
                        padding: "15px",
                        background: "rgba(0, 153, 255, 0.1)",
                        borderRadius: "10px",
                        color: "#09f",
                        textDecoration: "none",
                        fontSize: "18px",
                        textAlign: "center",
                        transition: "all 0.3s ease"
                      }}
                      onClick={handleMobileLinkClick}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar ONLY on non-main pages (Desktop only) */}
          <div className="bottom-bar d-none d-lg-flex">
            <div className="links">
              <ul style={{ whiteSpace: "nowrap", alignItems: "center" }}>
                {navItems.map(({ path, icon, label }) => {
                  if (label == "More") {
                    return (
                      <nav
                        key={path}
                        style={{ position: "relative" }}
                        className="navbar navbar-expand-lg"
                      >
                        <div className="">
                          <div
                            className="collapse navbar-collapse justify-content-center"
                            id="navbarSupportedContent"
                          >
                            <span className="navbar-nav">
                              <li
                                onMouseLeave={handleDropdownMouseLeave}
                                onMouseMove={handleDropdownMouseMove}
                                className="nav-item dropdown"
                              >
                                <p
                                  className="nav-link dropdown-toggle"
                                  data-toggle="dropdown"
                                  href="#"
                                  role="button"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <span
                                    style={{ marginTop: "3px" }}
                                    className="rolling-text"
                                  >
                                    More
                                  </span>
                                </p>
                                <ul
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                  className="dropdown-menu"
                                >
                                  {moreDropdownItems.map(({ path, label }) => (
                                    <li key={path}>
                                      <Link className="dropdown-item" to={path}>
                                        {label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            </span>
                          </div>
                        </div>
                      </nav>
                    );
                  }
                  return (
                    <li key={path}>
                      <NavLink
                        className={({ isActive }) =>
                          isActive ? "active" : undefined
                        }
                        to={path}
                      >
                        <i className={`fa-solid ${icon}`}></i>
                        {label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="buttons"></div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;