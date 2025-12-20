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
  const [isContributor, setIsContributor] = useState(false);
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length;
  const currentPage = useLocation().pathname;
  const [username, setUsername] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // State for More menu
  const [displayName, setDisplayName] = useState("User"); // State for display name

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
    const checkContributorStatus = async () => {
      if (!currentUser?.uid) {
        setIsContributor(false);
        return;
      }

      try {
        const contributorRef = doc(db, "Contributors", currentUser.uid);
        const contributorSnap = await getDoc(contributorRef);
        setIsContributor(contributorSnap.exists());
      } catch (error) {
        console.error("Error checking contributor status:", error);
        setIsContributor(false);
      }
    };

    if (currentUser?.uid) {
      checkContributorStatus();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser?.uid) {
        setUsername(null);
        setDisplayName("User");
        return;
      }

      try {
        // First check Profiles collection
        const profileRef = doc(db, "Profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setUserProfileData(profileData);

          // Set username for profile link
          setUsername(profileData.username || null);

          // Set display name - prioritize username, then firstName/lastName, then displayName
          if (profileData.firstName || profileData.lastName) {
            const fullName = `${profileData.firstName || ""} ${
              profileData.lastName || ""
            }`.trim();
            setDisplayName(fullName);
          } else if (profileData.username) {
            setDisplayName(profileData.username);
          } else if (profileData.displayName) {
            setDisplayName(profileData.displayName);
          } else {
            setDisplayName("User");
          }
        } else {
          // Check Contributors collection5
          const contributorRef = doc(db, "Contributors", currentUser.uid);
          const contributorSnap = await getDoc(contributorRef);

          if (contributorSnap.exists()) {
            const contributorData = contributorSnap.data();
            setUserProfileData(contributorData);

            // Set username for profile link
            setUsername(contributorData.username || null);

            // Set display name for contributors
            if (contributorData.username) {
              setDisplayName(contributorData.username);
            } else if (contributorData.firstName || contributorData.lastName) {
              const fullName = `${contributorData.firstName || ""} ${
                contributorData.lastName || ""
              }`.trim();
              setDisplayName(fullName);
            } else if (contributorData.displayName) {
              setDisplayName(contributorData.displayName);
            } else {
              setDisplayName("User");
            }
          } else {
            // Fallback to currentUser from context
            setUsername(null);
            if (currentUser.displayName) {
              setDisplayName(currentUser.displayName);
            } else {
              setDisplayName("User");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUsername(null);
        setDisplayName(currentUser?.displayName || "User");
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  //
  const getProfileLink = () => {
    if (!currentUser?.uid) return "/login";

    if (username) {
      return `/${username}`; // ✅ Twitter style: /username
    }

    return `/profile`; // Fallback
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

  // More menu toggle function for mobile
  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  // Close mobile menu when clicking on a link
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  // Navigation items array for consistency
  const navItems = [
    { path: "/category/videos", label: "Videos" },
    { path: "/category/models", label: "3D Models" },
    { path: "/category/video-templates", label: "Video Template" },
    { path: "/category/images", label: "Images" },
    { path: "/category/graphics", label: "Graphic Templates" },
    { path: "/category/mockups", label: "Mockups" },
    { path: "/category/fonts", label: "Fonts" },
    { path: "/category/more", label: "More" },
  ];

  // More dropdown items
  const moreDropdownItems = [
    { path: "/category/icons", label: "Icons" },
    { path: "/category/textures", label: "Textures" },
    { path: "/category/scripts", label: "Scripts" },
    { path: "/category/hdris", label: "HDRIs" },
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
                  <Link to="/templates" className="nav-link">
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
                  onMouseMove={handleDropdownMouseMove}
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
                  to="/templates"
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

        {/* Mobile Menu Toggle Button for Bottom Bar - Only on /templates */}
        {currentPage === "/templates" && (
          <>
            {/* Mobile Hamburger Button - Only show on mobile */}
            <div
              className="mobile-menu-toggle d-lg-none"
              style={{
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
                cursor: "pointer",
              }}
            >
              <i
                className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
                style={{ fontSize: "24px" }}
                onClick={toggleMobileMenu}
              ></i>
            </div>

            {/* Mobile Menu Overlay */}
            <div
              className={`mobile-menu-overlay ${
                isMobileMenuOpen ? "open" : ""
              }`}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.9)",
                zIndex: 999,
                display: isMobileMenuOpen ? "block" : "none",
                paddingTop: "80px",
              }}
            >
              <div
                className="mobile-menu-content"
                style={{
                  padding: "20px",
                  overflowY: "auto",
                  height: "calc(100% - 80px)",
                }}
              >
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {navItems.map(({ path, label }) => {
                    if (label === "More") {
                      return (
                        <li key={path} style={{ marginBottom: "15px" }}>
                          <div
                            onClick={toggleMoreMenu}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "15px",
                              background: "rgba(255, 255, 255, 0.1)",
                              borderRadius: "10px",
                              color: "white",
                              cursor: "pointer",
                              fontSize: "18px",
                            }}
                          >
                            <span>{label}</span>
                            <i
                              className={`fas fa-chevron-${
                                isMoreMenuOpen ? "up" : "down"
                              }`}
                            ></i>
                          </div>

                          {/* More dropdown items */}
                          {isMoreMenuOpen && (
                            <div
                              style={{
                                marginTop: "10px",
                                paddingLeft: "20px",
                                borderLeft: "2px solid #09f",
                              }}
                            >
                              {moreDropdownItems.map(
                                ({ path: morePath, label: moreLabel }) => (
                                  <Link
                                    key={morePath}
                                    to={morePath}
                                    className="mobile-link"
                                    style={{
                                      display: "block",
                                      padding: "12px",
                                      background: "rgba(0, 153, 255, 0.1)",
                                      borderRadius: "8px",
                                      color: "#09f",
                                      textDecoration: "none",
                                      fontSize: "16px",
                                      marginBottom: "8px",
                                      transition: "all 0.3s ease",
                                    }}
                                    onClick={handleMobileLinkClick}
                                  >
                                    {moreLabel}
                                  </Link>
                                )
                              )}
                            </div>
                          )}
                        </li>
                      );
                    }

                    return (
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
                            transition: "all 0.3s ease",
                          }}
                          onClick={handleMobileLinkClick}
                        >
                          {label}
                        </NavLink>
                      </li>
                    );
                  })}

                  {/* Show more dropdown items separately if More is not in navItems */}
                  {!navItems.find((item) => item.label === "More") &&
                    moreDropdownItems.map(({ path, label }) => (
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
                            transition: "all 0.3s ease",
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

        {currentPage === "/templates" && (
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
          <div
            className="mobile-menu-toggle d-lg-none"
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 100,
              background: "transparent",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            <i
              className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
              onClick={toggleMobileMenu}
            ></i>
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
            <Link to="/templates">
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
                    <span className="username">{displayName}</span>
                  </button>
                </Link>
              ) : (
                <Link to="/Login">
                  <button className="">Sign In</button>
                </Link>
              )}

              <div className={currentUser?.uid ? "dropdown" : "hidden none"}>
                <ul className="links">
                  {/* Dashboard link ONLY for contributors */}
                  {isContributor && (
                    <li>
                      <Link to="/contributordashboard">Dashboard</Link>
                    </li>
                  )}
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
          <div
            className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.95)",
              zIndex: 999,
              display: isMobileMenuOpen ? "block" : "none",
              paddingTop: "80px",
            }}
          >
            <div
              className="mobile-menu-content"
              style={{
                padding: "20px",
                overflowY: "auto",
                height: "calc(100% - 80px)",
              }}
            >
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {navItems.map(({ path, label }) => {
                  if (label === "More") {
                    return (
                      <li key={path} style={{ marginBottom: "15px" }}>
                        <div
                          onClick={toggleMoreMenu}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "15px",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "10px",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                        >
                          <span>{label}</span>
                          <i
                            className={`fas fa-chevron-${
                              isMoreMenuOpen ? "up" : "down"
                            }`}
                          ></i>
                        </div>

                        {/* More dropdown items */}
                        {isMoreMenuOpen && (
                          <div
                            style={{
                              marginTop: "10px",
                              paddingLeft: "20px",
                              borderLeft: "2px solid #09f",
                            }}
                          >
                            {moreDropdownItems.map(
                              ({ path: morePath, label: moreLabel }) => (
                                <Link
                                  key={morePath}
                                  to={morePath}
                                  className="mobile-link"
                                  style={{
                                    display: "block",
                                    padding: "12px",
                                    background: "rgba(0, 153, 255, 0.1)",
                                    borderRadius: "8px",
                                    color: "#09f",
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    marginBottom: "8px",
                                    transition: "all 0.3s ease",
                                  }}
                                  onClick={handleMobileLinkClick}
                                >
                                  {moreLabel}
                                </Link>
                              )
                            )}
                          </div>
                        )}
                      </li>
                    );
                  }

                  return (
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
                          transition: "all 0.3s ease",
                        }}
                        onClick={handleMobileLinkClick}
                      >
                        {label}
                      </NavLink>
                    </li>
                  );
                })}

                {/* Show more dropdown items separately if More is not in navItems */}
                {!navItems.find((item) => item.label === "More") &&
                  moreDropdownItems.map(({ path, label }) => (
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
                          transition: "all 0.3s ease",
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
