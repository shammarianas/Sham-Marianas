import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import ListedItemCard from "../UI/ListedItemCard";
import PageTitle from "../UI/PageTitle";
import ItemsListing from "../ItemsListing";
import { Link } from "react-router-dom";
import { rankAssetsByRelevance } from "../../utils/assetSearch";

const HeroSection = () => {
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [displayResults, setDisplayResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState("");
  const [overlay, setOverlay] = useState(false);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAssets = async () => {
      try {
        const assetsQuery = query(
          collection(db, "Assets"),
          where("status", "==", "approved")
        );
        const snapshot = await getDocs(assetsQuery);
        const assetsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) setAssets(assetsData);
      } catch (error) {
        console.error("Error fetching assets for search:", error);
        if (isMounted) setSearchError("Search is temporarily unavailable.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      setSearchResults([]);
      setDisplayResults(false);
      return;
    }

    setSearchResults(rankAssetsByRelevance(assets, trimmedSearchTerm).slice(0, 7));
    setDisplayResults(true);
  }, [assets, searchTerm]);

  // Handle Search Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setDisplayResults(Boolean(searchTerm.trim()));
  };

  const sortedResults = [...searchResults].sort((a, b) =>
    a.type.localeCompare(b.type)
  );

  const groupedResults = sortedResults.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          className="search_overlay"
          onClick={() => {
            const overlay = document.querySelector(".search_overlay");
            overlay.classList.add("fade");
            setTimeout(() => setOverlay(false), 190);
          }}
        ></div>
      )}

      {/* Hero Section */}
      <></>
      <div className="hero-container">
        {/* <Navbar /> */}
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Smarter creativity, faster designs</h1>
          <p className="hero-subtitle">
            Everything you need, from templates images and videos to AI-powered
            design tools.
          </p>

          {/* Search Component */}
          <div className="search-container">
            <div className="search-wrapper">
              <form onSubmit={handleSubmit} className="search-form">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search all assets"
                    className="search-input search-hero-input"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onClick={() => {
                      setDisplayResults(false);
                      overlay ? "" : setOverlay(true);
                    }}
                  />
                </div>
                <button type="submit" className="search-button">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {displayResults && (
        <section className="services-inline2 section-padding sub-bg bord-bottom-grd bord-top-grd">
          <div className="container ontop">
            <div className="sec-head mb-80">
              <div className="d-flex align-items-center">
                <div>
                  <span className="sub-title main-color mb-5">Our Templates</span>
                  <h3 className="fw-600 fz-50 text-u d-rotate wow">
                    <span className="rotate-text">
                      Search <span className="fw-200"> Results.</span>
                    </span>
                  </h3>
                </div>
                <div className="ml-auto vi-more">
                  <a href="#Hot" className="butn butn-sm butn-bord radius-30" aria-label="View hot assets">
                    <span>View All</span>
                  </a>
                  <span className="icon ti-arrow-top-right"></span>
                </div>
              </div>
            </div>

            {/* Hot Assets */}
            {/* <div className="page_content">
              <PageTitle title="Search" />
                <div className="listing_section">
                  <div className="item_listing">
                  {searchResults.length === 0 ? <div className="loading">Loading...</div> : null}
                    {searchResults.map((item) => (
                      <ListedItemCard key={item.id} id={item.id} data={item} />
                    ))}
                  </div>
                </div>
              </div> */}
            <div className="page_content">
            {loading && <div className="loading">Loading...</div>}
            {searchError && <div role="alert">{searchError}</div>}
            {!loading && !searchError && searchResults.length === 0 && (
              <div className="no_results">No matching assets found.</div>
            )}
            {Object.keys(groupedResults).map((type) => (
                <>
                  <PageTitle title={type} />
                  <div className="listing_section">
                    <div className="item_listing">
                      {groupedResults[type].map((item) => (
                        <ListedItemCard
                          key={item.id}
                          id={item.id}
                          data={item}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product List Section */}
      {!displayResults && (
        <section className="services-inline2 section-padding sub-bg bord-bottom-grd bord-top-grd">
          <div className="container ontop">
            <div className="sec-head mb-80">
              <div className="d-flex align-items-center">
                <div>
                  <span className="sub-title main-color mb-5">Our Templates</span>
                  <h3 className="fw-600 fz-50 text-u d-rotate wow">
                    <span className="rotate-text">
                      Trending <span className="fw-200">Templates</span>
                    </span>
                  </h3>
                </div>
              </div>
            </div>


            {[
              { title: "Prompts", category: "prompts" },
              { title: "Videos", category: "videos" },
              { title: "Video Templates", category: "video-templates" },
              { title: "Images", category: "images" },
              { title: "Graphic Templates", category: "graphics" },
              { title: "Mockups", category: "mockups" },
              { title: "3D Models", category: "models" },
              { title: "Fonts", category: "fonts" },
              { title: "Icons", category: "icons" },
            ].map(({ title, category }) => (
              <div className="page_content" key={category}>
                <div className="section-header-row">
                  <PageTitle title={title} />
                  <Link to={`/category/${category}`} className="view-all-link">
                    See All
                  </Link>
                </div>
                <ItemsListing limit={4} category={category} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default HeroSection;
