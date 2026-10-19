import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import SchemaMarkup from "../Components/SchemaMarkup";

const VALID_CATEGORIES = [
  "business",
  "technology",
  "design",
  "lifestyle",
  "ai",
  "marketing",
];
const BLOG_AUTHOR = "Sham Marianas Editorial Team";

const getDateValue = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatBlogDate = (value) => {
  const date = getDateValue(value);
  return date ? date.toLocaleDateString() : "—";
};

function Blogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 10;

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchBlogs = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const blogsRef = collection(db, "blogs");
        const publishedQuery = query(
          blogsRef,
          where("status", "==", "PUBLISHED")
        );
        const querySnapshot = await Promise.race([
          getDocs(publishedQuery),
          new Promise((_, reject) => {
            timeoutId = window.setTimeout(() => {
              reject(new Error("BLOGS_REQUEST_TIMEOUT"));
            }, 10000);
          }),
        ]);

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
            coverImageUrl: data.coverImageUrl || data.featuredImageUrl || data.featureImgUrl || "/assets/imgs/blog/blog4.jpg",
          };
        });

        if (isMounted) setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching published blogs:", error);
        if (isMounted) {
          setBlogs([]);
          setLoadError(
            error?.message === "BLOGS_REQUEST_TIMEOUT"
              ? "Blogs are taking longer than expected to load. Please try again."
              : "We couldn't load the blogs right now. Please try again."
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
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

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [retryCount]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category")?.toLowerCase();
    const search = params.get("search") || params.get("tag") || "";
    const requestedPage = Number.parseInt(params.get("page") || "1", 10);

    setFilter(VALID_CATEGORIES.includes(category) ? category : "*");
    setSearchTerm(search);
    setCurrentPage(Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  }, [location.search]);

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

  useEffect(() => {
    if (totalPages === 0) return;
    setCurrentPage((page) => Math.min(Math.max(page, 1), Math.max(totalPages, 1)));
  }, [totalPages]);

  const getPageUrl = (page) => {
    const params = new URLSearchParams(location.search);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();
    return query ? `/blog?${query}` : "/blog";
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    const query = searchTerm.trim();
    if (query) params.set("search", query);
    else params.delete("search");
    params.delete("tag");
    params.delete("page");
    const search = params.toString();
    navigate(search ? `/blog?${search}` : "/blog");
  };
  const blogSeo = {
    ...SEO_CONFIG.blogHome,
    title:
      currentPage > 1
        ? `${SEO_CONFIG.blogHome.title} | Page ${currentPage}`
        : SEO_CONFIG.blogHome.title,
  };



  return (
    <>
      <ProgressScroll />
      <SEO {...blogSeo} />
      <SchemaMarkup
        type="blogListing"
        data={{ posts: paginatedBlogs, page: currentPage }}
      />
      {loading ? (
        <main className="main-bgs blog-loading-state" aria-busy="true">
          <div className="blog-loading-content" role="status" aria-live="polite">
            <span className="blog-loading-spinner" aria-hidden="true"></span>
            <p>Loading blogs…</p>
            <div className="blog-loading-skeletons" aria-hidden="true">
              {[1, 2, 3].map((item) => (
                <div className="blog-loading-skeleton" key={item}>
                  <div className="blog-loading-skeleton-image" />
                  <div className="blog-loading-skeleton-line blog-loading-skeleton-line-wide" />
                  <div className="blog-loading-skeleton-line" />
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : loadError ? (
        <main className="main-bgs blog-loading-state blog-error-state" role="alert">
          <div className="blog-loading-content">
            <p>{loadError}</p>
            <button
              type="button"
              className="blog-retry-button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        </main>
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
                  <h5 className="text-u ls1 fz-80">
                    Blog <span className="fw-200"></span>
                  </h5>
                  <p className="blog-hero-description fz-24 mx-auto mt-20">
                    Explore fresh perspectives on digital marketing, IT solutions, and branding. Discover practical insights, expert strategies, and industry trends from the Sham Marianas team, helping businesses innovate, grow, and succeed in the digital world.
                  </p>
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
                    paginatedBlogs.map((blog, index) => (
                      <div className="item mb-80 blog-card" key={blog.id}>
                        {blog.coverImageUrl && (
                          <div className="img">
                            <img
                              loading={index === 0 ? "eager" : "lazy"}
                              fetchPriority={index === 0 ? "high" : "auto"}
                              width="1200"
                              height="675"
                              className="gallery-image blog-cover-img"
                              src={blog.coverImageUrl}
                              alt={blog.title}
                            />
                          </div>
                        )}
                        <div className="content">
                          <div className="d-flex align-items-center mb-15">
                            <div className="post-date">
                              Published: {formatBlogDate(
                                blog.publishedAt || blog.createdAt
                              )}
                            </div>
                            <div className="post-author ml-20">
                              By {BLOG_AUTHOR}
                            </div>
                            <div className="post-updated ml-20">
                              Updated: {formatBlogDate(
                                blog.updatedAt || blog.publishedAt || blog.createdAt
                              )}
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
                      {currentPage > 1 ? (
                        <Link
                          to={getPageUrl(currentPage - 1)}
                          aria-label="Previous blog page"
                          className="page-item"
                        style={{
                          margin: "0 5px",
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "50px",
                          border: "1px solid #ddd",
                          color: "#ffffff",
                          background: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                        </Link>
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{
                            margin: "0 5px",
                            minWidth: "40px",
                            height: "40px",
                            borderRadius: "50px",
                            border: "1px solid #ddd",
                            color: "#ffffff",
                            background: "none",
                            opacity: 0.5,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i className="fa-solid fa-chevron-left"></i>
                        </span>
                      )}

                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) =>
                        page === currentPage ? (
                          <span
                            key={page}
                            className="page-item active"
                            aria-current="page"
                            style={{
                              margin: "0 5px",
                              minWidth: "40px",
                              height: "40px",
                              border: "1px solid #55c7cf",
                              background: "#55c7cf",
                              color: "#111",
                              cursor: "default",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {page}
                          </span>
                        ) : (
                          <Link
                            key={page}
                            to={getPageUrl(page)}
                            className="page-item"
                            aria-label={`Go to blog page ${page}`}
                            style={{
                              margin: "0 5px",
                              minWidth: "40px",
                              height: "40px",
                              border: "1px solid #ddd",
                              background: "none",
                              color: "#fff",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {page}
                          </Link>
                        )
                      )}

                      {currentPage < totalPages ? (
                        <Link
                          to={getPageUrl(currentPage + 1)}
                          aria-label="Next blog page"
                        style={{
                          margin: "0 5px",
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "50px",
                          border: "1px solid #ddd",
                          color: "#ffffff",
                          background: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                        </Link>
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{
                            margin: "0 5px",
                            minWidth: "40px",
                            height: "40px",
                            borderRadius: "50px",
                            border: "1px solid #ddd",
                            color: "#ffffff",
                            background: "none",
                            opacity: 0.5,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i className="fa-solid fa-chevron-right"></i>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                <div className="sidebar-bl blog-sidebar-outdise" style={{ width: "100%", height: "auto" }}>
                  <div className="widget">
                    <h6 className="title-widget">Search Here</h6>
                    <form className="search-box" role="search" onSubmit={handleSearchSubmit}>
                      <input
                        type="text"
                        name="search"
                        aria-label="Search blog posts"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <button type="submit" className="icon pe-7s-search" aria-label="Search blog posts" style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }} />
                    </form>
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
                          <Link
                            to={cat === "*" ? "/blog" : `/blog-category/${cat}`}
                            className={filter === cat ? "active" : ""}
                            aria-current={filter === cat ? "page" : undefined}
                          >
                            {cat === "*"
                              ? "All"
                              : cat === "ai"
                              ? "AI"
                              : cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </Link>
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
