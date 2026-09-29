"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import ProgressScroll from "../common/ProgressScroll";
import { Link } from "react-router-dom";
import loadBackgroundImages from "../common/loadBackgroudImages";
import Marq2 from "../Components/marq2";
import SEO from "../common/SEO.jsx";
import { SEO_CONFIG } from "../utils/seoConfig.js";
import SchemaMarkup from "../Components/SchemaMarkup.jsx";

const SingleImage = ({ coverImgUrl, title }) => {
  return (
    <div className="img-gallery relative">
      <img
        src={coverImgUrl || "/assets/imgs/works/2/1.jpg"}
        alt={title}
        className="gallery-image w-full h-[200px] object-cover rounded-lg"
      />
    </div>
  );
};

function Header() {
  const [projects, setProjects] = useState([]);
  const [, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectQuery = query(
          collection(db, "projects"),
          where("status", "==", "published")
        );

        const querySnapshot = await getDocs(projectQuery);
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort: Featured first, then by date (newest first)
        const sortedProjects = projectsData.sort((a, b) => {
          // Featured projects first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;

          // Then sort by createdAt (latest first)
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const checkAdminStatus = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userProfileRef = doc(db, "Profiles", currentUser.uid);
          const userDoc = await getDoc(userProfileRef);
          setIsAdmin(userDoc.exists() && userDoc.data().role === "admin");
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    fetchProjects();
    checkAdminStatus();
    loadBackgroundImages();
  }, []);

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = filter === "*" || project.category === filter.slice(1);
    const matchesSearch =
      !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
    <SEO {...SEO_CONFIG.portfolio} />
      <SchemaMarkup type="portfolioListing" />
      <ProgressScroll />
      <header
        className="page-header bg-img section-padding valign"
        data-background="/assets/imgs/background/bg4.webp"
        data-overlay-dark="8"
      >
        <div className="container pt-80">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-u ls1 fz-80">
                  Portfolio <span className="fw-200"></span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="work-grid section-padding pb-0">
        <div className="container">
          <div className="row mb-80">
            <div className="col-lg-4">
              <div className="sec-head">
                <h6 className="sub-title main-color mb-10">
                  DISCOVER OUR CASES
                </h6>
                <h3>Latest Projects</h3>
              </div>
            </div>
            <div className="filtering col-lg-8 d-flex justify-content-end align-items-end">
              <div className="filter-container" style={{ position: "relative" }}>
                <div className="filter">
                  <span
                    data-filter="*"
                    className={filter === "*" ? "active" : ""}
                    onClick={() => handleFilterChange("*")}
                    style={{ cursor: "pointer" }}
                  >
                    All ({projects.length})
                  </span>
                  <span
                    data-filter=".design"
                    className={filter === ".design" ? "active" : ""}
                    onClick={() => handleFilterChange(".design")}
                    style={{ cursor: "pointer" }}
                  >
                    Design ({projects.filter((p) => p.category === "design").length})
                  </span>
                  <span
                    data-filter=".development"
                    className={filter === ".development" ? "active" : ""}
                    onClick={() => handleFilterChange(".development")}
                    style={{ cursor: "pointer" }}
                  >
                    Development ({projects.filter((p) => p.category === "development").length})
                  </span>
                  <span
                    data-filter=".marketing"
                    className={filter === ".marketing" ? "active" : ""}
                    onClick={() => handleFilterChange(".marketing")}
                    style={{ cursor: "pointer" }}
                  >
                    Marketing ({projects.filter((p) => p.category === "marketing").length})
                  </span>
                </div>

                {/* Search Icon - Always Visible */}
                <div
                  className="search-icon-container"
                  onClick={toggleSearch}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-45px",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    background: "#52b0b4",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    zIndex: 10,
                  }}
                  title="Search projects"
                >
                  <i className="fa-solid fa-magnifying-glass" style={{ color: "#fff" }}></i>
                </div>

                {/* Search Bar - Dropdown */}
                {showSearch && (
                  <div
                    className="search-bar-container"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: "-45px",
                      minWidth: "280px",
                      borderRadius: "8px",
                      background: "#0f0f0f",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      zIndex: 1000,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                      padding: "12px",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects by title..."
                        style={{
                          width: "100%",
                          padding: "12px 16px 12px 45px",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "15px",
                          outline: "none",
                          background: "transparent",
                          color: "#fff",
                          caretColor: "#fff",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                          e.target.style.background = "#1a1a1a";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "transparent";
                        }}
                      />
                      <i
                        className="fa-solid fa-magnifying-glass"
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b7280",
                          pointerEvents: "none",
                        }}
                      ></i>

                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          style={{
                            position: "absolute",
                            right: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6b7280",
                            fontSize: "18px",
                            fontWeight: "bold",
                            borderRadius: "50%",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
                          onMouseLeave={(e) => (e.target.style.background = "none")}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {searchQuery && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "8px",
                          textAlign: "center",
                        }}
                      >
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="gallery row md-marg">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`col-lg-4 col-md-6 items ${project.category}`}
                >
                  <div className="item card-pro mb-50">
                    <SingleImage
                      coverImgUrl={project.coverImgUrl}
                      title={project.title}
                    />
                    <div className="cont row p-3">
                      <div className="col-8">
                        <span className="p-color mb-5 sub-title">
                          {project.category.charAt(0).toUpperCase() +
                            project.category.slice(1)}
                        </span>
                        <h6>{project.title}</h6>
                      </div>
                      <div className="col-4 d-flex flex-column align-items-end justify-content-between">
                        <span>{project.client || "Client"}</span>
                        <div className="pt-3">
                          <Link to={`/project-details/${project.id}`}>
                            <span className="ti-arrow-top-right"></span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p className="text-light">
                  {searchQuery
                    ? `No projects found matching "${searchQuery}"`
                    : "No projects found for this category."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Marq2 />

      <style>{`
        .search-icon-container:hover {
          transform: translateY(-50%) scale(1.05) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
        }
        .search-bar-container {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .filter span {
          margin-right: 20px;
          font-size: 15px;
          color: #aaa;
          transition: color 0.3s;
        }
        .filter span.active,
        .filter span:hover {
          color: #52b0b4;
        }
      `}</style>
    </>
  );
}

export default Header;
