import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import loadBackgroudImages from "../common/loadBackgroudImages";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import Next from "../Components/blog-classic/Next";
import Marq2 from "../Components/marq2";
import sanitizeHtml from "sanitize-html";
import { SEO_CONFIG } from "../utils/seoConfig";
import SchemaMarkup from "../Components/SchemaMarkup";
import SEO from "../common/SEO";
import ErrorPage from "./Error";

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Updated to match BlogEditorModal
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    business: 0,
    technology: 0,
    design: 0,
    lifestyle: 0,
    ai: 0,
    marketing: 0,
  });

  const [latestBlogs, setLatestBlogs] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          const q = query(collection(db, "blogs"), where("slug", "==", id));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
          }
        }

        if (docSnap.exists()) {
          const blogData = { id: docSnap.id, ...docSnap.data() };

          // Ensure category is lowercase & valid (same as editor)
          const validCategories = ["business", "technology", "design", "lifestyle", "ai", "marketing"];
          const rawCategory = blogData.category?.toString().toLowerCase();
          blogData.category = validCategories.includes(rawCategory) ? rawCategory : "business";

          blogData.featuredImageUrl =
            blogData.featuredImageUrl ||
            blogData.featureImgUrl ||
            blogData.coverImageUrl ||
            "/assets/imgs/background/bg4.webp";

          blogData.content = sanitizeHtml(blogData.content, {
            allowedTags: [
              "p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "ul", "ol", "li",
              "a", "img", "div", "span", "br", "blockquote", "code", "pre"
            ],
            allowedAttributes: {
              a: ["href", "target", "rel"],
              img: ["src", "alt", "width", "height"],
              div: ["class"],
              span: ["class"],
              ul: ["data-list"],
              ol: ["data-list"],
              li: ["class", "data-list"],
            },
            allowedClasses: {
              div: ["prose", "prose-blue", "max-w-none"],
              span: [],
              ul: ["ql-indent-*"],
              ol: ["ql-indent-*"],
              li: ["ql-indent-*"],
            },
          });

          setBlog(blogData);
          setAllTags(Array.isArray(blogData.tags) ? blogData.tags : []);

          const canonicalPath = `/blog/${encodeURIComponent(blogData.slug || blogData.id)}`;
          if (location.pathname !== canonicalPath) {
            navigate(canonicalPath, { replace: true });
          }
        } else {
          setBlog(null);
          setAllTags([]);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setBlog(null);
        setAllTags([]);
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
            setIsAdmin(userDoc.data().role === "admin");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };

    const fetchCategoryCounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const counts = {
          all: querySnapshot.size,
          business: 0,
          technology: 0,
          design: 0,
          lifestyle: 0,
          ai: 0,
          marketing: 0,
        };

        querySnapshot.forEach((doc) => {
          const cat = doc.data().category?.toString().toLowerCase();
          if (Object.prototype.hasOwnProperty.call(counts, cat)) {
            counts[cat]++;
          }
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchLatestBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("publishedAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const blogsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const cat = data.category?.toString().toLowerCase();
          const validCat = ["business", "technology", "design", "lifestyle", "ai", "marketing"].includes(cat)
            ? cat
            : "business";

          return {
            id: doc.id,
            slug: data.slug || doc.id,
            title: data.title || "Untitled",
            category: validCat,
            coverImageUrl:
              data.coverImageUrl ||
              data.featureImgUrl ||
              data.featuredImageUrl ||
              "/assets/imgs/blog/c1.jpg",
            publishedAt: data.publishedAt,
          };
        });
        setLatestBlogs(blogsList);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchBlog();
    checkAdminStatus();
    fetchCategoryCounts();
    fetchLatestBlogs();
    loadBackgroudImages();
  }, [id, location.pathname, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/blog?category=${encodeURIComponent(category)}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await addDoc(collection(db, "blogs", blog.id, "comments"), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });
      alert("Comment posted!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to post comment.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">Loading blog...</div>;
  if (!blog) return <ErrorPage />;

  return (
    <>
      <style>{`
        span { display: inline; }
        .header-blog {
          min-height: 600px; background-size: cover; background-position: center;
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .header-blog .caption { padding: 2rem; max-width: 60%; }
        .header-blog h1 { font-size: 2.5rem; font-weight: 700; color: #FFFFFF; margin: 0.5rem 0; }
        .header-blog .sub-title { color: #D1D5DB; font-size: 0.9rem; text-transform: uppercase; }
        .info { color: #D1D5DB; justify-content: center; }
        .info .left-info, .info .right-info { color: #D1D5DB; }
        .info .date a, .info .right-info span { color: #FFFFFF; }
        .info .date span.opacity-7, .info .right-info span.opacity-7 { opacity: 0.7; font-size: 0.9rem; }
        .section-padding { padding: 80px 0; }
        body { background: #000000; color: #FFFFFF; }
        @media (max-width: 768px) {
          .header-blog { min-height: 200px; }
          .header-blog h1 { font-size: 1.2rem; max-width: 100%; }
          .header-blog .caption { max-width: 90%; }
          .section-padding { padding: 40px 0; }
        }
        .prose ol > li[data-list="bullet"] {
          list-style-type: disc !important;
        }
        .prose ol > li[data-list="ordered"] {
          list-style-type: decimal !important;
        }
        .prose ol {
          padding-left: 2.5em !important;
          margin: 1em 0 !important;
        }
        .prose li {
          margin-bottom: 0.5em !important;
          padding-left: 0.25em !important;
          list-style-position: outside !important;
        }
        .prose ol ol > li[data-list="bullet"] {
          list-style-type: circle !important;
        }
        .prose ol ol ol > li[data-list="bullet"] {
          list-style-type: square !important;
        }
        .prose ol ol > li[data-list="ordered"] {
          list-style-type: lower-alpha !important;
        }
        .prose ol ol ol > li[data-list="ordered"] {
          list-style-type: lower-roman !important;
        }
        .prose li::marker {
          color: inherit !important;
        }
      `}</style>

  {/* SEO Meta Tags */}
      {blog && (
        <SEO
          title={`${blog.title} | Shammarianas Blog`}
          description={blog.excerpt || "Blog description"}
          keywords={blog.tags?.join(', ') || blog.category}
          canonical={`https://www.shammarianas.com/blog/${encodeURIComponent(blog.slug || blog.id)}`}
        />
      )}

 {/* Schema Markup */}
      {blog && (
        <>
          <SchemaMarkup type="agency" />
    <SchemaMarkup 
      type="blog" 
      data={{
        ...blog,
        slug: blog.slug || blog.id,
        publishedTime: blog.publishedAt ? blog.publishedAt.toDate().toISOString() : new Date().toISOString(),
        updatedTime: blog.updatedAt ? blog.updatedAt.toDate().toISOString() : blog.publishedAt?.toDate().toISOString(),
        description: blog.excerpt || "Blog description",
        keywords: blog.tags?.join(', ') || blog.category,
        content: blog.content  // Yeh important – auto FAQ ke liye pass karo
      }}
    />
        </>
      )}
      <Cursor />
      <ProgressScroll />

      <header
        className="header-blog bg-img"
        data-background={blog.featuredImageUrl}
        data-overlay-dark="9"
      >
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="caption">
                <div className="sub-title fz-12">
                  {blog.category
                    ? blog.category.charAt(0).toUpperCase() + blog.category.slice(1)
                    : "Business"}
                </div>
                <h1 className="blog-inside-title">{blog.title}</h1>
                <div className="info d-flex mt-40 align-items-center">
                  <div className="left-info">
                    <div className="d-flex align-items-center">
                      <div className="date">
                        <a href="" aria-label={`Published on ${blog.publishedAt ? new Date(blog.publishedAt.toDate()).toDateString() : "Unknown date"}`}>
                          <span className="opacity-7">Published</span>
                          <h6 className="fz-14">
                            {blog.publishedAt
                              ? new Date(blog.publishedAt.toDate()).toDateString()
                              : "—"}
                          </h6>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="right-info ml-auto d-flex align-items-center">
                    <div className="mr-20">
                      <span className="pe-7s-comment fz-18 mr-10"></span>
                      <span className="opacity-7">
                        {blog.commentsCount || 0} Comments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="blog section-padding">
        <div className="container">
          <div className="row xlg-marg">
            <div className="col-lg-8">
              <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-poppins align-text">
                <article className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md align-text">
                  <div
                    className="prose prose-blue max-w-none blog-detail-size"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </article>

                <Link
                  to="/blog"
                  className="d-flex align-items-center main-color mt-40"
                >
                  <span className="text mr-15">Back to Blogs</span>
                  <span className="ti-arrow-left"></span>
                </Link>

                <div className="comments-from mt-80">
                  <div className="mb-60">
                    <h3>Leave a comment</h3>
                  </div>
                  <form onSubmit={handleCommentSubmit}>
                    <div className="controls row">
                      <div className="col-lg-6">
                        <div className="form-group mb-30">
                          <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group mb-30">
                          <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <textarea
                            placeholder="Message"
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                          ></textarea>
                        </div>
                        <div className="text-center">
                          <div className="mt-30">
                            <button type="submit">
                              <span className="text">Post Comment</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="sidebar-bl blog-sidebar">
                <div className="widget">
                  <h6 className="title-widget">Search Here</h6>
                  <form onSubmit={handleSearch} className="search-box">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="icon pe-7s-search"></span>
                  </form>
                </div>

                <div className="widget catogry">
                  <h6 className="title-widget">Categories</h6>
                  <ul className="rest">
                    {Object.entries(categoryCounts)
                      .filter(([key]) => key !== "all")
                      .map(([key, value]) => (
                        <li key={key}>
                          <span
                            onClick={() => handleCategoryClick(key)}
                            style={{ cursor: "pointer" }}
                          >
                            {key === "ai" ? "AI" : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="ml-auto">{value}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="widget last-post-thum">
                  <h6 className="title-widget">Latest Posts</h6>
                  {latestBlogs.length > 0 ? (
                    latestBlogs.map((post) => (
                      <div key={post.id} className="item d-flex align-items-center mb-20">
                        <div>
                          <div className="img">
                            <Link to={`/blog/${post.slug || post.id}`}>
                              <img  loading="lazy"  src={post.coverImageUrl} alt={post.title} />
                              {post.publishedAt && (
                                <span className="date">
                                  <span>
                                    {new Date(post.publishedAt.toDate()).toLocaleDateString("en-US", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </span>
                                </span>
                              )}
                            </Link>
                          </div>
                        </div>
                        <div className="cont">
                          <span className="tag">
                            <Link to={`/blog?category=${post.category}`}>
                              {post.category === "ai"
                                ? "AI"
                                : post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                            </Link>
                          </span>
                          <h6>
                            <Link to={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                          </h6>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No recent posts found.</p>
                  )}
                </div>

                {allTags.length > 0 && (
                  <div className="widget tags">
                    <h6 className="title-widget">Tags</h6>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag, index) => (
                        <Link
                          key={index}
                          to={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="inline-block px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Next />
      <Marq2 />
    </>
  );
}

export default BlogDetails;
