"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import { Link } from "react-router-dom";
import loadBackgroundImages from "../common/loadBackgroudImages"; // Corrected import
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
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
    loadBackgroundImages(); // Corrected function name
  }, []);

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  const filteredProjects =
    filter === "*"
      ? projects
      : projects.filter((project) => project.category === filter.slice(1));

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
              <div>
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
                  <div className="item mb-50">
                    <SingleImage
                      coverImgUrl={project.featureImgUrl}
                      title={project.title}
                    />
                    <div className="cont d-flex align-items-end mt-30">
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
                <p>No projects found for this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Marq2 />
    </>
  );
}

export default Header;
