import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const BlogCategory = () => {
  const { category: paramCategory } = useParams();
  const location = useLocation();
  const q = new URLSearchParams(location.search);
  const queryCategory = q.get("category");
  const category = (paramCategory || queryCategory || "")
    .toString()
    .toLowerCase();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState(category || "*");

  useEffect(() => {
    const fetchByCategory = async () => {
      setLoading(true);
      try {
        const normalizedCategory = category?.toLowerCase();

        let qref;
        if (normalizedCategory) {
          qref = query(
            collection(db, "blogs"),
            where("category", "==", normalizedCategory)
          );
        } else {
          qref = query(collection(db, "blogs"), orderBy("publishedAt", "desc"));
        }

        const snap = await getDocs(qref);

        const items = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            slug: data.slug || doc.id,
            title: data.title || "Untitled",
            excerpt:
              data.excerpt ||
              (data.content
                ? data.content.replace(/<[^>]*>/g, "").slice(0, 160) + "..."
                : ""),
            coverImage:
              data.coverImageUrl ||
              data.featureImgUrl ||
              data.featuredImageUrl ||
              "/assets/imgs/blog/c1.jpg",
            publishedAt: data.publishedAt || null,
            category: data.category?.toLowerCase() || "uncategorized",
          };
        });

        const sortedItems = items.sort((a, b) => {
          if (!a.publishedAt || !b.publishedAt) return 0;
          return b.publishedAt.toMillis() - a.publishedAt.toMillis();
        });

        setBlogs(sortedItems);
      } catch (err) {
        console.error("Error fetching category blogs:", err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [category]);

  // Sync filter with URL
  useEffect(() => {
    if (category) {
      setFilter(category);
    } else {
      setFilter("*");
    }
  }, [category]);

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "*" || blog.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleFilterChange = (cat) => {
    setFilter(cat);
    setSearchTerm("");
  };

  const getCategoryCount = (cat) => {
    if (cat === "*") return blogs.length;
    return blogs.filter((b) => b.category === cat).length;
  };

  return (
    <section className="blog-main section-padding">
      <div className="container">
        <h2 className="fz-30 fw-600 mb-40">
          {category
            ? category === "ai"
              ? "AI"
              : category.charAt(0).toUpperCase() + category.slice(1)
            : "All Blogs"}
        </h2>

        <div className="row lg-marg justify-content-around">
          {/* Blog List */}
          <div className="col-lg-8">
            <div className="md-mb80">
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : filteredBlogs.length === 0 ? (
                <p className="text-center text-gray-500">
                  No posts found in this category.
                </p>
              ) : (
                filteredBlogs.map((post) => (
                  <div className="item mb-80 blog-card" key={post.id}>
                    {post.coverImage && (
                      <div className="img">
                        <Link to={`/blog/${post.slug}`}>
                          <img
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
                            ? new Date(post.publishedAt.toDate()).toLocaleDateString()
                            : ""}
                        </div>
                        <div className="commt opacity-7 fz-13">
                          <span className="ti-comment-alt mr-10"></span>
                          0 Comments
                        </div>
                      </div>

                      <h3 className="mb-15 fz-30">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
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

          {/* Sidebar - Same as Main Blog Page */}
          <div className="col-lg-4">
            <div className="sidebar blog-sidebar-outdise" style={{ width: "100%" }}>
              {/* Search Widget */}
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

              {/* Categories Widget */}
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
                        {getCategoryCount(cat)}
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
  );
};

export default BlogCategory;