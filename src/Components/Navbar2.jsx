"use client";
import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import Search from "./Search";
import "../assets/Styles/navbar-logo.css";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore"; // ✅ Firestore functions

const Navbar = () => {
  const { currentUser } = useUser() || "";
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length;
  const currentPage = useLocation().pathname;
  const [username, setUsername] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null); // ✅ New state for profile data

  // ✅ NEW: Check if current page needs "Template" button
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
        // ✅ پہلے Profiles collection میں تلاش کریں
        const profileRef = doc(db, "Profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setUsername(profileData.username || null);
          setUserProfileData(profileData);
        } else {
          // ✅ اگر Profiles میں نہیں ملا تو Contributors میں تلاش کریں
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

  // ✅ Profile mein jo getDisplayName function hai usi logic ko yahan implement karna
  const getDisplayName = () => {
    if (!userProfileData) {
      // Agar profile data nahi mila to auth se basic info lein
      if (currentUser?.displayName) return currentUser.displayName;
      if (currentUser?.email) {
        const emailName = currentUser.email.split("@")[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
      return "User";
    }

    // ✅ Priority 1: firstName + lastName combination (Pehle yeh check)
    const firstName = userProfileData.firstName || userProfileData.firstname || userProfileData.first_name;
    const lastName = userProfileData.lastName || userProfileData.lastname || userProfileData.last_name;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      return firstName.trim();
    } else if (lastName) {
      return lastName.trim();
    }

    // ✅ Priority 2: fullName (Contributor mein yeh field hai)
    if (userProfileData.fullName && userProfileData.fullName.trim()) {
      return userProfileData.fullName.trim();
    }

    // ✅ Priority 3: displayUsername (Contributor ka specific field)
    if (userProfileData.displayUsername && userProfileData.displayUsername.trim()) {
      return userProfileData.displayUsername.trim();
    }

    // ✅ Priority 4: username (common field)
    if (userProfileData.username && userProfileData.username.trim()) {
      return userProfileData.username.trim();
    }

    // ✅ Priority 5: displayName (agar exist kare)
    if (userProfileData.displayName && userProfileData.displayName.trim()) {
      return userProfileData.displayName.trim();
    }

    // ✅ Priority 6: authorName
    if (userProfileData.authorName && userProfileData.authorName.trim()) {
      return userProfileData.authorName.trim();
    }

    // ✅ Priority 7: email se name extract karen
    if (userProfileData.email) {
      const emailName = userProfileData.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // ✅ Fallback to auth user info
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) {
      const emailName = currentUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return "User";
  };

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
    // { path: "/plugins", label: "Plugins" },
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
              onClick={() =>
                document
                  .querySelector(".navbar .navbar-collapse")
                  ?.classList.toggle("show")
              }
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
                    {/* Sign In  after tempalte */}
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
            {/* ✅ FIXED: Template Button Logic /stock */}
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

            {/* for coming soon */}
            {/* <div className="contact-button">
              
                <Link
                  to="/comming-soon"
                  className="butn butn-sm butn-bg main-colorbg radius-5"
                >
                  <span className="text">Template</span>
                </Link>
           
            </div> */}
          </div>
        </nav>

        {["/stock"].includes(currentPage) && (
          <div className="bottom-bar">
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
            <div className="buttons"></div>
          </div>
        )}
      </>
    );
  }

  // ✅ LOGGED IN USER - SIMPLIFIED navbar (logo + Sign In only on /stock)
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

        {/* SIRF EXPLORE + SEARCH admin mein hide */}
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
                // ✅ یہاں update کریں - ab getDisplayName function use karen
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

      {/* Bottom bar ONLY on non-main pages */}
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
        <div className="bottom-bar">
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
      )}
    </>
  );
};

export default Navbar;