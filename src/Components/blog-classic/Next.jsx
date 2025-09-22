"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import loadBackgroudImages from "../../common/loadBackgroudImages";

function Next() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsQuery = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(blogsQuery);
        const blogsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBlogs(blogsData);
        setCurrentIndex(blogsData.findIndex((blog) => blog.id === id));
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [id]);

  useEffect(() => {
    if (blogs.length > 0) loadBackgroudImages();
  }, [blogs]);

  const prevBlog = currentIndex > 0 ? blogs[currentIndex - 1] : null;
  const nextBlog = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;

  const handlePrevClick = () => prevBlog && navigate(`/blog-details/${prevBlog.id}`);
  const handleNextClick = () => nextBlog && navigate(`/blog-details/${nextBlog.id}`);

  if (loading) {
    return (
      <section className="next-project sub-bg">
        <div className="container-fluid rest">
          <div className="row">
            <div className="col-12 text-center">
              <p className="text-gray-500">Loading blogs...</p>
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
            {prevBlog ? (
              <div className="text-left box bg-img" data-background={prevBlog.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}>
                <div className="cont d-flex align-items-center">
                  <span className="mr-30 fz-30 ti-arrow-left cursor-pointer" onClick={handlePrevClick} style={{ cursor: "pointer" }} />
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Previous Blog</h6>
                    <a href={`/blog-details/${prevBlog.id}`} className="fz-40 fw-600 stroke">
                      {prevBlog.title}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-left box">
                <div className="cont d-flex align-items-center">
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Previous Blog</h6>
                    <span className="fz-40 fw-600 stroke text-gray-500">No Previous Blog</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="col-md-6 rest">
            {nextBlog ? (
              <div className="text-right d-flex box bg-img" data-background={nextBlog.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}>
                <div className="ml-auto">
                  <div className="cont d-flex align-items-center">
                    <div>
                      <h6 className="sub-title fz-16 mb-5">Next Blog</h6>
                      <a href={`/blog-details/${nextBlog.id}`} className="fz-40 fw-600 stroke">
                        {nextBlog.title}
                      </a>
                    </div>
                    <span className="ml-30 fz-30 ti-arrow-right cursor-pointer" onClick={handleNextClick} style={{ cursor: "pointer" }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-right d-flex box">
                <div className="ml-auto">
                  <div className="cont d-flex align-items-center">
                    <div>
                      <h6 className="sub-title fz-16 mb-5">Next Blog</h6>
                      <span className="fz-40 fw-600 stroke text-gray-500">No Next Blog</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <a href="/#blog" className="all-works-butn text-center">
          <span className="ti-view-grid fz-24 mb-10" />
          <span className="d-block fz-12 text-u ls1">All Blogs</span>
        </a>
      </div>
    </section>
  );
}

export default Next;
