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
import Cursor from "../common/cusor";
import { Link } from "react-router-dom";
import loadBackgroundImages from "../common/loadBackgroudImages";
import Marq2 from "../Components/marq2";

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
  const [isAdmin, setIsAdmin] = useState(false);
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

        setProjects(projectsData);
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
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <header
        className="page-header bg-img section-padding valign"
        data-background="/assets/imgs/background/bg4.jpg"
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
                    data-count={projects.length}
                    onClick={() => handleFilterChange("*")}
                    style={{ cursor: "pointer" }}
                  >
                    All
                  </span>
                  <span
                    data-filter=".design"
                    className={filter === ".design" ? "active" : ""}
                    data-count={
                      projects.filter((p) => p.category === "design").length
                    }
                    onClick={() => handleFilterChange(".design")}
                    style={{ cursor: "pointer" }}
                  >
                    Design
                  </span>
                  <span
                    data-filter=".development"
                    className={filter === ".development" ? "active" : ""}
                    data-count={
                      projects.filter((p) => p.category === "development")
                        .length
                    }
                    onClick={() => handleFilterChange(".development")}
                    style={{ cursor: "pointer" }}
                  >
                    Development
                  </span>
                  <span
                    data-filter=".marketing"
                    className={filter === ".marketing" ? "active" : ""}
                    data-count={
                      projects.filter((p) => p.category === "marketing").length
                    }
                    onClick={() => handleFilterChange(".marketing")}
                    style={{ cursor: "pointer" }}
                  >
                    Marketing
                  </span>
                </div>

                {/* **SVG Search Icon - ALWAYS VISIBLE** */}
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
                    zIndex: 10
                  }}
                  title="Search projects"
                >
                 <i class="icon fa-solid fa-magnifying-glass" style={{ color: "#000" }}></i>
                </div>

                {/* **Search Bar - Direct Under Icon** */}
                {showSearch && (
                  <div 
                    className="search-bar-container"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: "-45px",
                      minWidth: "280px",
                      borderRadius: "8px",
                      background:"#0f0f0f",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      zIndex: 1,

                    }}
                  >
                    <div style={{ position: "relative", width: "100%" }}>
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
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          background: "transparent"
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                          e.target.style.background = "#0f0f0f";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "#fafbfc";
                        }}
                      />
                      {/* **Search Icon INSIDE Input** */}
                      <div 
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none"
                        }}
                      >
                      <i class="icon fa-solid fa-magnifying-glass" style={{ color: "#6b7280" }}></i>
                      </div>
                      
                      {/* **Clear Button** */}
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                          }}
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
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                          onMouseLeave={(e) => e.target.style.background = "none"}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "8px",
                        textAlign: "center"
                      }}>
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
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
                      coverImgUrl={project.featureImgUrl}
                      title={project.title}
                    />
                    <div className="cont d-flex align-items-end p-3">
                      <div>
                        <span className="p-color mb-5 sub-title">
                          {project.category.charAt(0).toUpperCase() +
                            project.category.slice(1)}
                        </span>
                        <h6>{project.title}</h6>
                      </div>
                      <div className="ml-auto d-flex align-items-center">
                        <Link to={`/project-details/${project.id}`}>
                          <span className="ti-arrow-top-right"></span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>
                  {searchQuery 
                    ? `No projects found matching "${searchQuery}"` 
                    : "No projects found for this category."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Marq2 />
      
      <style jsx>{`
        .search-icon-container:hover {
          transform: translateY(-50%) scale(1.05) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
        }
        .search-icon-container:hover svg {
          color: #3b82f6 !important;
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
      `}</style>
    </>
  );
}

export default Header;