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

  useEffect(() => {
    const fetchByCategory = async () => {
      setLoading(true);
      try {
        // ✅ Normalize category (Firestore categories are saved in lowercase)
        const normalizedCategory = category?.toLowerCase();

        let qref;
        if (normalizedCategory) {
          // ✅ Simpler query (avoids "requires an index" error)
          qref = query(
            collection(db, "blogs"),
            where("category", "==", normalizedCategory)
          );
        } else {
          qref = query(collection(db, "blogs"), orderBy("publishedAt", "desc"));
        }

        const snap = await getDocs(qref);

        // ✅ Convert each document into a displayable format
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
          };
        });

        // ✅ Sort locally by published date (if missing Firestore index)
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

  return (
    <div className="section-padding">
      <div className="container">
        <h2 className="fz-30 fw-600 mb-20">
          {category
            ? category === "ai"
              ? "AI"
              : category.charAt(0).toUpperCase() + category.slice(1)
            : "All Blogs"}
        </h2>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500">
            No posts found in this category.
          </div>
        ) : (
          <div className="row">
            {blogs.map((post) => (
              <div key={post.id} className="col-md-6 mb-30">
                <div className="blog-card">
                  <Link to={`/blog/${post.slug}`}>
                    <div className="img">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{ width: "100%", borderRadius: 8 }}
                      />
                    </div>
                    <div className="content mt-10">
                      <h4>{post.title}</h4>
                      <p className="text-muted">{post.excerpt}</p>
                      {post.publishedAt && (
                        <small className="text-muted">
                          {new Date(
                            post.publishedAt.toDate()
                          ).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCategory;
