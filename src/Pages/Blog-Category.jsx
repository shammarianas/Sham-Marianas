import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { SEO_CONFIG } from "../utils/seoConfig";
import SEO from "../common/SEO";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const VALID_CATEGORIES = [
  "business",
  "technology",
  "design",
  "lifestyle",
  "ai",
  "marketing",
];

/* --------------------------------------------------------------- */
const BlogCategory = () => {
  const { category: paramCategory } = useParams();
  const location = useLocation();
  const q = new URLSearchParams(location.search);
  const queryCategory = q.get("category");

  // URL category (lower-case, empty = "all")
  const urlCategory = (paramCategory || queryCategory || "")
    .toString()
    .toLowerCase();

  const [allBlogs, setAllBlogs] = useState([]); // <-- ALL published blogs
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState(urlCategory || "*");

  /* ----------------------------------------------------------- */
  // 1. FETCH **ALL** published blogs (once)
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "blogs"),
          where("status", "==", "PUBLISHED")
        );
        const snap = await getDocs(q);

        const items = snap.docs.map((doc) => {
          const d = doc.data();

          // ---- normalise category (same logic as Blogs page) ----
          const rawCat = d.category?.toString().toLowerCase();
          const category = VALID_CATEGORIES.includes(rawCat)
            ? rawCat
            : "business";

          return {
            id: doc.id,
            slug: d.slug || doc.id,
            title: d.title || "Untitled",
            excerpt:
              d.excerpt ||
              (d.content
                ? d.content.replace(/<[^>]*>/g, "").slice(0, 160) + "..."
                : ""),
            coverImage:
              d.coverImageUrl ||
              d.featureImgUrl ||
              d.featuredImageUrl ||
              "/assets/imgs/blog/c1.jpg",
            publishedAt: d.publishedAt || d.createdAt || null,
            category,
          };
        });

        // newest first
        const sorted = items.sort((a, b) => {
          const da = a.publishedAt?.toDate?.() ?? 0;
          const db = b.publishedAt?.toDate?.() ?? 0;
          return db - da;
        });

        setAllBlogs(sorted);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setAllBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []); // <-- run once

  /* ----------------------------------------------------------- */
  // 2. Keep the sidebar filter in sync with the URL category
  useEffect(() => {
    setFilter(urlCategory || "*");
  }, [urlCategory]);

  /* ----------------------------------------------------------- */
  // 3. UI filtering (search + sidebar filter + URL category)
  const displayedBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      // URL category overrides everything when present
      if (urlCategory && urlCategory !== "*" && blog.category !== urlCategory)
        return false;

      const matchesSearch = blog.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFilter = filter === "*" || blog.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [allBlogs, urlCategory, searchTerm, filter]);

  /* ----------------------------------------------------------- */
  const handleFilterChange = (cat) => {
    setFilter(cat);
    setSearchTerm(""); // optional – clear search when changing category
  };

  const getCategoryCount = (cat) => {
    if (cat === "*") return allBlogs.length;
    return allBlogs.filter((b) => b.category === cat).length;
  };

  /* ----------------------------------------------------------- */
  const categoryTitle = urlCategory
    ? urlCategory === "ai"
      ? "AI"
      : urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1)
    : "All Blogs";

  return (
    <>
      {SEO_CONFIG?.blogCategories?.[urlCategory] ? (
        <SEO {...SEO_CONFIG.blogCategories[urlCategory]} />
      ) : (
        <SEO {...SEO_CONFIG?.blogHome || {}} />
      )}
      {loading ? (
        <section className="blog-main section-padding">
          <div className="container text-center py-5">Loading...</div>
        </section>
      ) : (
      
    <section className="blog-main section-padding">
      <div className="container">
        <h2 className="fz-30 fw-600 mb-40">{categoryTitle}</h2>

        <div className="row lg-marg justify-content-around">
          {/* ---------- BLOG LIST ---------- */}
          <div className="col-lg-8">
            <div className="md-mb80">
              {displayedBlogs.length === 0 ? (
                <p className="text-center text-gray-500">
                  No posts found in this category.
                </p>
              ) : (
                displayedBlogs.map((post) => (
                  <div className="item mb-80 blog-card" key={post.id}>
                    {post.coverImage && (
                      <div className="img">
                        <Link to={`/blog/${post.slug}`}>
                          <img  loading="lazy"  
                            className="gallery-image blog-cover-img"
                            src={post.coverImage}
                            alt={post.title}
                          />
                        </Link>
                      </div>
                    )}
                    <div className="content">
                      <div className="d-flex align-items-center mb-15">
                        <div className="post-date">
                          {post.publishedAt
                            ? new Date(
                                post.publishedAt.toDate()
                              ).toLocaleDateString()
                            : ""}
                        </div>
                        <div className="commt opacity-7 fz-13">
                          <span className="ti-comment-alt mr-10"></span>0
                          Comments
                        </div>
                      </div>

                      <h3 className="mb-15 fz-30">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <Link
                        to={`/blog/${post.slug}`}
                        className="d-flex align-items-center main-color mt-20"
                      >
                        <span className="text mr-15">Read More</span>
                        <span className="ti-arrow-top-right"></span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <div className="col-lg-4">
            <div
              className="sidebar-bl blog-sidebar-outdise"
              style={{ width: "100%" }}
            >
              {/* SEARCH */}
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

              {/* CATEGORIES */}
              <div className="widget catogry">
                <h6 className="title-widget">Categories</h6>
                <ul className="rest">
                  {[
                    { value: "*", label: "All" },
                    { value: "business", label: "Business" },
                    { value: "technology", label: "Technology" },
                    { value: "design", label: "Design" },
                    { value: "lifestyle", label: "Lifestyle" },
                    { value: "ai", label: "AI" },
                    { value: "marketing", label: "Marketing" },
                  ].map((cat) => (
                    <li key={cat.value}>
                      <span
                        onClick={() => handleFilterChange(cat.value)}
                        className={filter === cat.value ? "active" : ""}
                        style={{ cursor: "pointer" }}
                      >
                        {cat.label}
                      </span>
                      <span className="ml-auto">
                        {getCategoryCount(cat.value)}
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
      )}
    </>
  );
};

export default BlogCategory;
