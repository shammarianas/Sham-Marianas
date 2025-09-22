import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Marq2 from "../Components/marq2";
import { db, auth } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import loadBackgroudImages from "../common/loadBackgroudImages";
import Cursor from "../common/cusor";
import ProgressScroll from "../common/ProgressScroll";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*"); // State to track active filter

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogsData = [];
        querySnapshot.forEach((doc) => {
          blogsData.push({ id: doc.id, ...doc.data() });
        });
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
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

  // Filter blogs based on search term and category
  const filteredBlogs = blogs.filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase())).filter((blog) => filter === "*" || blog.category === filter);

  if (loading) return <div className="main-bgs">Loading...</div>;

  return (
    <>
      <Cursor />
      <ProgressScroll />

      <div className="main-bgs">
        <header className="page-header bg-img section-padding valign" style={{ backgroundImage: "url('/assets/imgs/background/bg4.jpg')" }} data-overlay-dark="8">
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
                      <div className="item mb-80" key={blog.id}>
                        {blog.featuredImageUrl && (
                          <div className="img">
                            <img src={blog.featuredImageUrl} alt={blog.title} />
                          </div>
                        )}
                        <div className="content">
                          <div className="d-flex align-items-center mb-15">
                            <div className="post-date">{new Date(blog.createdAt?.toDate()).toLocaleDateString()}</div>
                            <div className="commt opacity-7 fz-13">
                              <span className="ti-comment-alt mr-10"></span>
                              {blog.commentsCount || 0} Comments
                            </div>
                          </div>

                          <h3 className="mb-15">
                            <Link to={`/blog-details/${blog.id}`}>{blog.title}</Link>
                          </h3>
                          <div
                            className="blog-excerpt"
                            dangerouslySetInnerHTML={{
                              __html: blog.excerpt || blog.content?.substring(0, 200) + "...",
                            }}
                          />
                          <Link to={`/blog-details/${blog.id}`} className="d-flex align-items-center main-color mt-40">
                            <span className="text mr-15">Read More</span>
                            <span className="ti-arrow-top-right"></span>
                            {/* {isAdmin && (
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="btn btn-sm btn-danger ml-auto"
                              style={{
                                background: "#ff4d4f",
                                color: "white",
                                border: "none",
                                padding: "5px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}>
                              Delete
                            </button>
                          )} */}
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No blogs match your search or category.</p>
                  )}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="sidebar" style={{ width: "100%" }}>
                  <div className="widget">
                    <h6 className="title-widget">Search Here</h6>
                    <div className="search-box">
                      <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      <span className="icon pe-7s-search"></span>
                    </div>
                  </div>

                  <div className="widget catogry">
                    <h6 className="title-widget">Categories</h6>
                    <ul className="rest">
                      <li>
                        <span onClick={() => handleFilterChange("*")} className={filter === "*" ? "active" : ""} style={{ cursor: "pointer" }}>
                          All
                        </span>
                        <span className="ml-auto">{blogs.length}</span>
                      </li>
                      <li>
                        <span onClick={() => handleFilterChange("business")} className={filter === "business" ? "active" : ""} style={{ cursor: "pointer" }}>
                          Business
                        </span>
                        <span className="ml-auto">{blogs.filter((b) => b.category === "business").length}</span>
                      </li>
                      <li>
                        <span onClick={() => handleFilterChange("lifestyle")} className={filter === "lifestyle" ? "active" : ""} style={{ cursor: "pointer" }}>
                          Lifestyle
                        </span>
                        <span className="ml-auto">{blogs.filter((b) => b.category === "lifestyle").length}</span>
                      </li>
                      <li>
                        <span onClick={() => handleFilterChange("creative")} className={filter === "creative" ? "active" : ""} style={{ cursor: "pointer" }}>
                          Creative
                        </span>
                        <span className="ml-auto">{blogs.filter((b) => b.category === "creative").length}</span>
                      </li>
                      <li>
                        <span onClick={() => handleFilterChange("wordpress")} className={filter === "wordpress" ? "active" : ""} style={{ cursor: "pointer" }}>
                          WordPress
                        </span>
                        <span className="ml-auto">{blogs.filter((b) => b.category === "wordpress").length}</span>
                      </li>
                      <li>
                        <span onClick={() => handleFilterChange("design")} className={filter === "design" ? "active" : ""} style={{ cursor: "pointer" }}>
                          Design
                        </span>
                        <span className="ml-auto">{blogs.filter((b) => b.category === "design").length}</span>
                      </li>
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
