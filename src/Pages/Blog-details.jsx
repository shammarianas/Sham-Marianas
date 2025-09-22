import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import loadBackgroudImages from "../common/loadBackgroudImages";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import Next from "../Components/blog-classic/Next";
import Marq2 from "../Components/marq2";
import sanitizeHtml from "sanitize-html";

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    business: 0,
    lifestyle: 0,
    creative: 0,
    wordpress: 0,
    design: 0,
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const blogData = { id: docSnap.id, ...docSnap.data() };
          blogData.content = sanitizeHtml(blogData.content, {
            allowedTags: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "ul", "ol", "li", "a", "img", "div", "span", "br"],
            allowedAttributes: {
              a: ["href", "target", "rel"],
              img: ["src", "alt", "width", "height"],
              div: ["class"],
              span: ["class"],
            },
            allowedClasses: {
              div: ["prose", "prose-blue", "max-w-none"],
              span: [],
            },
          });
          setBlog(blogData);
        } else {
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setBlog(null);
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

    const fetchCategoryCounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const counts = {
          all: querySnapshot.size,
          business: 0,
          lifestyle: 0,
          creative: 0,
          wordpress: 0,
          design: 0,
        };
        querySnapshot.forEach((doc) => {
          const category = doc.data().category || "uncategorized";
          if (counts.hasOwnProperty(category)) {
            counts[category]++;
          }
        });
        setCategoryCounts(counts);
      } catch (error) {
        console.error("Error fetching category counts:", error);
      }
    };

    fetchBlog();
    checkAdminStatus();
    fetchCategoryCounts();
    loadBackgroudImages();
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/blogs?category=${encodeURIComponent(category)}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">Loading blog...</div>;

  if (!blog) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">Blog not found</div>;

  return (
    <>
      <style>{`
        .header-blog {
          min-height: 600px;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-blog .caption {
          padding: 2rem;
          max-width: 90%;
        }
        .header-blog h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0.5rem 0;
        }
        .header-blog .sub-title {
          color: #D1D5DB;
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        .info {
          color: #D1D5DB;
          justify-content: center;
        }
        .info .left-info, .info .right-info {
          color: #D1D5DB;
        }
        .info .date a, .info .right-info span {
          color: #FFFFFF;
        }
        .info .date span.opacity-7, .info .right-info span.opacity-7 {
          opacity: 0.7;
          font-size: 0.9rem;
        }
        .section-padding {
          padding: 80px 0;
        }
        body {
          background: #000000;
          color: #FFFFFF;
        }
        @media (max-width: 768px) {
          .header-blog {
            min-height: 200px;
          }
          .header-blog h1 {
            font-size: 1.2rem;
            max-width: 100%;
          }
          .header-blog .caption {
            max-width: 90%;
          }
          .section-padding {
            padding: 40px 0;
          }
        }
      `}</style>
      <Cursor />
      <ProgressScroll />
      <header className="header-blog bg-img" data-background={blog.coverImageUrl || "/assets/imgs/background/bg4.jpg"} data-overlay-dark="9">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="caption">
                <div className="sub-title fz-12">{blog.category ? blog.category.charAt(0).toUpperCase() + blog.category.slice(1) : "Uncategorized"}</div>
                <h1 className="fz-55">{blog.title}</h1>
                <div className="info d-flex mt-40 align-items-center">
                  <div className="left-info">
                    <div className="d-flex align-items-center">
                      <div className="date">
                        <a href="#0">
                          <span className="opacity-7">Published</span>
                          <h6 className="fz-16">{new Date(blog.createdAt?.toDate()).toDateString()}</h6>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="right-info ml-auto d-flex align-items-center">
                    <div className="mr-20">
                      <span className="pe-7s-comment fz-18 mr-10"></span>
                      <span className="opacity-7">{blog.commentsCount || 0} Comments</span>
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
                  <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
                </article>
                <Link to="/blogs" className="d-flex align-items-center main-color mt-40">
                  <span className="text mr-15">Back to Blogs</span>
                  <span className="ti-arrow-left"></span>
                </Link>

                <div className="comments-from mt-80">
                  <div className="mb-60">
                    <h3>Leave a comment</h3>
                  </div>
                  <form id="contact-form" method="post" action="contact.php">
                    <div className="messages"></div>
                    <div className="controls row">
                      <div className="col-lg-6">
                        <div className="form-group mb-30">
                          <input id="form_name" type="text" name="name" placeholder="Name" required="required" />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group mb-30">
                          <input id="form_email" type="email" name="email" placeholder="Email" required="required" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <textarea id="form_message" name="message" placeholder="Message" rows="4" required="required"></textarea>
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
              <div className="sidebar">
                <div className="widget">
                  <h6 className="title-widget">Search Here</h6>
                  <form onSubmit={handleSearch} className="search-box">
                    <input type="text" name="search-post" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className="icon pe-7s-search"></span>
                  </form>
                </div>
                <div className="widget catogry">
                  <h6 className="title-widget">Categories</h6>
                  <ul className="rest">
                    <li>
                      <span onClick={() => handleCategoryClick("all")} className={searchTerm === "" && !window.location.search.includes("category") ? "active" : ""} style={{ cursor: "pointer" }}>
                        All
                      </span>
                      <span className="ml-auto">{categoryCounts.all}</span>
                    </li>
                    <li>
                      <span onClick={() => handleCategoryClick("business")} className={window.location.search.includes("category=business") ? "active" : ""} style={{ cursor: "pointer" }}>
                        Business
                      </span>
                      <span className="ml-auto">{categoryCounts.business}</span>
                    </li>
                    <li>
                      <span onClick={() => handleCategoryClick("lifestyle")} className={window.location.search.includes("category=lifestyle") ? "active" : ""} style={{ cursor: "pointer" }}>
                        Lifestyle
                      </span>
                      <span className="ml-auto">{categoryCounts.lifestyle}</span>
                    </li>
                    <li>
                      <span onClick={() => handleCategoryClick("creative")} className={window.location.search.includes("category=creative") ? "active" : ""} style={{ cursor: "pointer" }}>
                        Creative
                      </span>
                      <span className="ml-auto">{categoryCounts.creative}</span>
                    </li>
                    <li>
                      <span onClick={() => handleCategoryClick("wordpress")} className={window.location.search.includes("category=wordpress") ? "active" : ""} style={{ cursor: "pointer" }}>
                        WordPress
                      </span>
                      <span className="ml-auto">{categoryCounts.wordpress}</span>
                    </li>
                    <li>
                      <span onClick={() => handleCategoryClick("design")} className={window.location.search.includes("category=design") ? "active" : ""} style={{ cursor: "pointer" }}>
                        Design
                      </span>
                      <span className="ml-auto">{categoryCounts.design}</span>
                    </li>
                  </ul>
                </div>
                <div className="widget last-post-thum">
                  <h6 className="title-widget">Latest Posts</h6>
                  <div className="item d-flex align-items-center">
                    <div>
                      <div className="img">
                        <Link to="/blogs">
                          <img src="/assets/imgs/blog/c1.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> Sep
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <Link to="/blogs">Web Design</Link>
                      </span>
                      <h6>
                        <Link to="/blogs">Ways to quickly increase traffic to your website</Link>
                      </h6>
                    </div>
                  </div>
                  <div className="item d-flex align-items-center">
                    <div>
                      <div className="img">
                        <Link to="/blogs">
                          <img src="/assets/imgs/blog/c2.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> Sep
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <Link to="/blogs">Web Design</Link>
                      </span>
                      <h6>
                        <Link to="/blogs">Breaking the rules: Using SQLite to demo web</Link>
                      </h6>
                    </div>
                  </div>
                  <div className="item d-flex align-items-center">
                    <div>
                      <div className="img">
                        <Link to="/blogs">
                          <img src="/assets/imgs/blog/c3.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> Sep
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <Link to="/blogs">Web Design</Link>
                      </span>
                      <h6>
                        <Link to="/blogs">Building better UI designs with layout grids</Link>
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="widget tags">
                  <h6 className="title-widget">Tags</h6>
                  <div>
                    <Link to="/blogs">Creative</Link>
                    <Link to="/blogs">Design</Link>
                    <Link to="/blogs">Dark & Light</Link>
                    <Link to="/blogs">Minimal</Link>
                    <Link to="/blogs">Infolio</Link>
                  </div>
                </div>
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
