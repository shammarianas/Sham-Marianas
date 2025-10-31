import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Marq2 from "../Components/marq2";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  where,
  query,
  getDoc,
} from "firebase/firestore";
import loadBackgroudImages from "../common/loadBackgroudImages";
import ProgressScroll from "../common/ProgressScroll";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsRef = collection(db, "blogs");
        const publishedQuery = query(
          blogsRef,
          where("status", "==", "PUBLISHED")
        );
        const querySnapshot = await getDocs(publishedQuery);

        const blogsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Normalize category to lowercase
          const normalizedCat = data.category?.toString().toLowerCase();
          const validCategories = ["business", "technology", "design", "lifestyle", "ai", "marketing"];
          const category = validCategories.includes(normalizedCat) ? normalizedCat : "business";

          return {
            id: doc.id,
            ...data,
            category,
            coverImageUrl: data.coverImageUrl || data.featuredImageUrl || data.featureImgUrl || "/assets/imgs/blog/default-cover.jpg",
          };
        });

        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching published blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkAdminStatus = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userProfileRef = doc(db, "Profiles", currentUser.uid);
          const userDoc = await getDoc(userProfileRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    fetchBlogs();
    checkAdminStatus();
    loadBackgroudImages();
  }, []);

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  // Filter blogs by search term and category
  const filteredBlogs = blogs
    .filter((blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((blog) => filter === "*" || blog.category === filter);

  if (loading) return <div className="main-bgs">Loading...</div>;

  return (
    <>
      <ProgressScroll />

      <div className="main-bgs">
        <header
          className="page-header bg-img section-padding valign"
          style={{ backgroundImage: "url('/assets/imgs/background/bg4.jpg')" }}
          data-overlay-dark="8"
        >
          <div className="container pt-80">
            <div className="row">
              <div className="col-12">
                <div className="text-center">
                  <h1 className="text-u ls1 fz-80">
                    Blog <span className="fw-200"></span>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="blog-main section-padding">
          <div className="container">
            <div className="row lg-marg justify-content-around">
              <div className="col-lg-8">
                <div className="md-mb80">
                  {filteredBlogs.length > 0 ? (
                    filteredBlogs.map((blog) => (
                      <div className="item mb-80 blog-card" key={blog.id}>
                        {blog.coverImageUrl && (
                          <div className="img">
                            <img className="gallery-image blog-cover-img" src={blog.coverImageUrl} alt={blog.title} />
                          </div>
                        )}
                        <div className="content">
                          <div className="d-flex align-items-center mb-15">
                            <div className="post-date">
                              {blog.createdAt?.toDate
                                ? new Date(
                                    blog.createdAt.toDate()
                                  ).toLocaleDateString()
                                : ""}
                            </div>
                            <div className="commt opacity-7 fz-13">
                              <span className="ti-comment-alt mr-10"></span>
                              {blog.commentsCount || 0} Comments
                            </div>
                          </div>

                          <h3 className="mb-15 fz-30">
                            <Link to={`/blog-details/${blog.id}`}>
                              {blog.title}
                            </Link>
                          </h3>

                          <Link
                            to={`/blog-details/${blog.id}`}
                            className="d-flex align-items-center main-color mt-20"
                          >
                            <span className="text mr-15">Read More</span>
                            <span className="ti-arrow-top-right"></span>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No blogs match your search or category.</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                <div className="sidebar blog-sidebar-outdise" style={{ width: "100%" }}>
                  <div className="widget">
                    <h6 className="title-widget">Search Here</h6>
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <span className="icon pe-7s-search"></span>
                    </div>
                  </div>

                  <div className="widget catogry">
                    <h6 className="title-widget">Categories</h6>
                    <ul className="rest">
                      {[
                        "*",
                        "business",
                        "technology",
                        "design",
                        "lifestyle",
                        "ai",
                        "marketing",
                      ].map((cat) => (
                        <li key={cat}>
                          <span
                            onClick={() => handleFilterChange(cat)}
                            className={filter === cat ? "active" : ""}
                            style={{ cursor: "pointer" }}
                          >
                            {cat === "*"
                              ? "All"
                              : cat === "ai"
                              ? "AI"
                              : cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                          <span className="ml-auto">
                            {cat === "*"
                              ? blogs.length
                              : blogs.filter((b) => b.category === cat).length}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Marq2 />
      </div>
    </>
  );
}

export default Blogs;