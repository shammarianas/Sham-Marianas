"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import loadBackgroudImages from "../../common/loadBackgroudImages";

function Next() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(projectsQuery);
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProjects(projectsData);

        // Find the index of the current project
        const index = projectsData.findIndex((project) => project.id === id);
        console.log("Current project ID:", id, "Index:", index);
        setCurrentIndex(index);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [id]);

  useEffect(() => {
    if (projects.length > 0) {
      loadBackgroudImages();
    }
  }, [projects]); // Re-run when projects change to update background images

  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  // Navigation handlers
  const handlePrevClick = () => {
    if (prevProject) {
      console.log("Navigating to prev project:", prevProject.id); // Debug: Log navigation
      navigate(`/project-details/${prevProject.id}`);
    }
  };

  const handleNextClick = () => {
    if (nextProject) {
      console.log("Navigating to next project:", nextProject.id); // Debug: Log navigation
      navigate(`/project-details/${nextProject.id}`);
    }
  };

  if (loading) {
    return (
      <section className="next-project sub-bg">
        <div className="container-fluid rest">
          <div className="row">
            <div className="col-12 text-center">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="next-project sub-bg">
        <div className="container-fluid rest">
          <div className="row">
            <div className="col-12 text-center">
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="next-project sub-bg">
      <div className="container-fluid rest">
        <div className="row">
          <div className="col-md-6 rest">
            {prevProject ? (
              <div className="text-left box bg-img" data-background={prevProject.coverImgUrl || "https://via.placeholder.com/600x400?text=No+Image"}>
                <div className="cont d-flex align-items-center">
                  <div>
                    <span className="mr-30 fz-30 ti-arrow-left cursor-pointer" onClick={handlePrevClick} style={{ cursor: prevProject ? "pointer" : "default" }}></span>
                  </div>
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Prev Project</h6>
                    <a href={`/project-details/${prevProject.id}`} className="fz-40 fw-600 stroke">
                      {prevProject.title}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-left box">
                <div className="cont d-flex align-items-center">
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Prev Project</h6>
                    <span className="fz-40 fw-600 stroke text-gray-500">No Previous Project</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="col-md-6 rest">
            {nextProject ? (
              <div className="text-right d-flex box bg-img" data-background={nextProject.coverImgUrl || "https://via.placeholder.com/600x400?text=No+Image"}>
                <div className="ml-auto">
                  <div className="cont d-flex align-items-center">
                    <div>
                      <h6 className="sub-title fz-16 mb-5">Next Project</h6>
                      <a href={`/project-details/${nextProject.id}`} className="fz-40 fw-600 stroke">
                        {nextProject.title}
                      </a>
                    </div>
                    <div>
                      <span className="ml-30 fz-30 ti-arrow-right cursor-pointer" onClick={handleNextClick} style={{ cursor: nextProject ? "pointer" : "default" }}></span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-right d-flex box">
                <div className="ml-auto">
                  <div className="cont d-flex align-items-center">
                    <div>
                      <h6 className="sub-title fz-16 mb-5">Next Project</h6>
                      <span className="fz-40 fw-600 stroke text-gray-500">No Next Project</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <a href="/#portfolio" className="all-works-butn text-center">
          <span className="ti-view-grid fz-24 mb-10"></span>
          <span className="d-block fz-12 text-u ls1">All Projects</span>
        </a>
      </div>
    </section>
  );
}

export default Next;
