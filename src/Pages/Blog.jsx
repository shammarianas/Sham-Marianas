import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { SEO_CONFIG } from "../utils/seoConfig";
import SEO from "../common/SEO";

const VALID_CATEGORIES = [
  "business",
  "technology",
  "design",
  "lifestyle",
  "ai",
  "marketing",
];

function Blogs() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 10;

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
          const category = VALID_CATEGORIES.includes(normalizedCat) ? normalizedCat : "business";

          return {
            id: doc.id,
            slug: data.slug || doc.id, // ensure slug present
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category")?.toLowerCase();
    const search = params.get("search") || params.get("tag") || "";

    setFilter(VALID_CATEGORIES.includes(category) ? category : "*");
    setSearchTerm(search);
    setCurrentPage(1);
  }, [location.search]);

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
    setCurrentPage(1);
  };

  // Filter blogs by search term and category
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBlogs = blogs
    .filter((blog) => {
      if (!normalizedSearch) return true;

      const searchableText = [
        blog.title,
        blog.excerpt,
        ...(Array.isArray(blog.tags) ? blog.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    })
    .filter((blog) => filter === "*" || blog.category === filter);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const paginatedBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + blogsPerPage
  );

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1, 2];

    if (currentPage > 4) {
      pages.push("left-ellipsis");
    }

    const startPage = Math.max(3, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page++) {
      if (!pages.includes(page)) pages.push(page);
    }

    if (currentPage < totalPages - 3) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <>
      <ProgressScroll />
      <SEO {...SEO_CONFIG.blogHome} />
      {loading ? (
        <div className="main-bgs">Loading...</div>
      ) : (
      <div className="main-bgs">
        <header
          className="page-header bg-img section-padding valign"
          style={{ backgroundImage: "url('/assets/imgs/background/bg4.webp')" }}
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
                    paginatedBlogs.map((blog) => (
                      <div className="item mb-80 blog-card" key={blog.id}>
                        {blog.coverImageUrl && (
                          <div className="img">
                            <img  loading="lazy"  className="gallery-image blog-cover-img" src={blog.coverImageUrl} alt={blog.title} />
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
                            <Link to={`/blog/${blog.slug || blog.id}`}>
                              {blog.title}
                            </Link>
                          </h3>

                          <Link
                            to={`/blog/${blog.slug || blog.id}`}
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

                  {totalPages > 1 && (
                    <div className="pagination d-flex align-items-center justify-content-center mt-50">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) => Math.max(page - 1, 1))
                        }
                        style={{
                          margin: "0 5px",
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "50px",
                          border: "1px solid #ddd",
                          color: "#ffffff",
                          background: "none",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          opacity: currentPage === 1 ? 0.5 : 1,
                        }}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>

                      <button
                        type="button"
                        className="page-item active"
                        style={{
                          margin: "0 5px",
                          minWidth: "40px",
                          height: "40px",
                          border: "1px solid #ddd",
                          background: "#111",
                          color: "#fff",
                          cursor: "default",
                        }}
                      >
                        {currentPage}
                      </button>

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(page + 1, totalPages)
                          )
                        }
                        style={{
                          margin: "0 5px",
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "50px",
                          border: "1px solid #ddd",
                          color: "#ffffff",
                          background: "none",
                          cursor:
                            currentPage === totalPages
                              ? "not-allowed"
                              : "pointer",
                          opacity: currentPage === totalPages ? 0.5 : 1,
                        }}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                <div className="sidebar-bl blog-sidebar-outdise" style={{ width: "100%" }}>
                  <div className="widget">
                    <h6 className="title-widget">Search Here</h6>
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
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
      )}
    </>
  );
}

export default Blogs;
