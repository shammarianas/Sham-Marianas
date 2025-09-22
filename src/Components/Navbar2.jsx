"use client";
import React, { useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import Search from "./Search";
import "../assets/Styles/navbar-logo.css";

const Navbar = () => {
  const { currentUser } = useUser() || "";
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length;
  const currentPage = useLocation().pathname;

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 300) navbar?.classList.add("nav-scroll");
      else navbar?.classList.remove("nav-scroll");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navbar

  function handleScroll() {
    const bodyScroll = window.scrollY;
    const navbar = document.querySelector(".navbar");

    if (bodyScroll > 300) navbar.classList.add("nav-scroll");
    else navbar.classList.remove("nav-scroll");
  }
  useEffect(() => {
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
  // If user is NOT logged in
  if (!currentUser) {
    return (
      <>
        <nav className="navbar navbar-expand-lg bord blur">
          <div className="container o-hidden">

            <Link to="/" className="logo site-logo-link" aria-label="Home">
              <img src="assets/imgs/logo.png" className="site-logo-img" alt="Sham Marianas logo" />
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
                  <Link to="/Login" className="nav-link">
                    <span className="rolling-text">Sign In</span>
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
                    to="/stock"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Templates</span>
                  </Link>
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
            <div className="contact-button ">
              <Link
                to="/login"
                className="butn butn-sm butn-bg main-colorbg radius-5"
              >
                <span className="text">Sign In</span>
              </Link>
            </div>
          </div>
        </nav>

        {["/stock"].includes(currentPage) && (
          <div className="bottom-bar">
            <div className="links">
              <ul style={{ whiteSpace: "nowrap", alignItems: "center" }}>
                {[
                  { path: "/hot", label: "Hot" },
                  { path: "/Videos", label: "Videos" },
                  { path: "/Models", label: "3D Models" },
                  { path: "/templates", label: "Video Template" },
                  { path: "/images", label: "Pictures" },
                  { path: "/graphics", label: "Graphic Templates" },
                  { path: "/Mockups", label: "Mockups" },
                  { path: "/Fonts", label: "Fonts" },
                  { path: "/More", label: "More" },
                ].map(({ path, icon, label }) => {
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
                                  {[
                                    { label: "Icons", href: "/stock#icons" },
                                    { label: "Textures", href: "/stock#textures" },
                                    { label: "Scripts", href: "/stock#scripts" },
                                    { label: "Plugins", href: "/stock#plugins" },
                                    { label: "HDRIs", href: "/stock#hdris" },
                                  ].map(({ label, href }) => (
                                    <li key={href}>
                                      <a className="dropdown-item" href={href}>
                                        {label}
                                      </a>
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
                {/* Separate Navigation Bar */}
              </ul>
            </div>

            <div className="buttons"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="navbar navbar-expand-lg bord blur">
        {/* <nav className="navbar navbar-expand-lg bord blur"> */}

        <Link to="/" className="logo site-logo-link" aria-label="Home">
          <img
            src="assets/imgs/logo.png"
            className="site-logo-img"
            alt="Sham Marianas logo"
          />
        </Link>
        <Link to="/stock">
          <div className="ml-auto vi-more">
            <span className="butn butn-sm butn-bord radius-30">
              <span>Explore</span>
            </span>
            <span className="icon ti-arrow-top-right"></span>
          </div>
        </Link>
        <Search />
        <div className="right">
          <div className="nav_buttons">
            <Link to="/Cart">
              <button>
                <i className="icon fa-solid fa-shopping-cart"></i>
                {cartCount > 0 && (
                  <span className="cart_count">{cartCount}</span>
                )}
              </button>
            </Link>
            <div className="navbar_dropdown"> 

              
              {currentUser?.uid ? (
                <Link to={`/Profile/${currentUser?.uid}`}>
                  <button className="signed_in">
                    <i className="icon fa-solid fa-user"></i>
                    <span className="username">
                      {currentUser?.displayName || "User"}
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
                    {/* <Link to="/Library">My Library</Link> */}
                    <Link to="/Favorites">My Favorites</Link>
                  </li>

                  <li>
                    <Link to={`/Profile/${currentUser?.uid}`}>Profile</Link>
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

      {!["/", "/Login", "/Upload", "/reset"].includes(currentPage) && (
        <div className="bottom-bar">
          <div className="links">
            <ul style={{ whiteSpace: "nowrap", alignItems: "center" }}>
              {[
                { path: "/hot", label: "Hot" },
                { path: "/Videos", label: "Videos" },
                { path: "/Models", label: "3D Models" },
                { path: "/templates", label: "Video Template" },
                { path: "/images", label: "Pictures" },
                { path: "/graphics", label: "Graphic Templates" },
                { path: "/Mockups", label: "Mockups" },
                { path: "/Fonts", label: "Fonts" },
                { path: "/More", label: "More" },
              ].map(({ path, icon, label }) => {
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
                                {[
                                  { label: "Icons", href: "/stock#icons" },
                                  { label: "Textures", href: "/stock#textures" },
                                  { label: "Scripts", href: "/stock#scripts" },
                                  { label: "Plugins", href: "/stock#plugins" },
                                  { label: "HDRIs", href: "/stock#hdris" },
                                ].map(({ label, href }) => (
                                  <li key={href}>
                                    <a className="dropdown-item" href={href}>
                                      {label}
                                    </a>
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
              {/* Separate Navigation Bar */}
            </ul>
          </div>

          <div className="buttons"></div>
        </div>
      )}
    </>
  );
};

export default Navbar;
