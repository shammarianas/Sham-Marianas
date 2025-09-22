import { db } from "../../../firebase";
import { useState, useEffect, useCallback } from "react";
import { getDocs, collection, query } from "firebase/firestore";
import { Link } from "react-router-dom";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [displayResults, setDisplayResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const fetchResults = useCallback(async () => {
    if (searchTerm.trim() === "") return;
    setLoading(true);
    setDisplayResults(true);
    const q = query(collection(db, "Assets"));
    const querySnapshot = await getDocs(q);
    const allResults = [];
    querySnapshot.forEach((doc) => {
      allResults.push({ id: doc.id, ...doc.data() });
    });
    const newResults = allResults
      .filter((result) =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 7);
    setResults(newResults);
    setLoading(false);
    setDisplayResults(searchTerm !== "");
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm !== "") {
      fetchResults();
    } else {
      setResults([]);
      setDisplayResults(false);
    }
  }, [searchTerm, fetchResults]);

  const handleSearchChange = debounce((e) => {
    setLoading(true);
    setSearchTerm(e.target.value);
  }, 1000);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <>
      {overlay && (
        <div
          className="search_overlay"
          onClick={() => {
            const overlay = document.querySelector(".search_overlay");
            overlay.classList.add("fade");

            setTimeout(() => {
              setOverlay(false);
            }, 190);
          }}
        ></div>
      )}
      <div className="search-wrapper">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-container">
            {/* <i className="icon fa-solid fa-magnifying-glass"></i> */}
            <input
              type="text"
              placeholder="Search all assets"
              className="search-input search-hero-input"
              onChange={handleSearchChange}
              onClick={() => {
                setDisplayResults(false);
                overlay ? "" : setOverlay(true);
              }}
            />
            {searchTerm ? (
              <i
                className="icon fa-solid fa-times"
                onClick={() => {
                  document.querySelector(".search-input").value = "";
                  setSearchTerm("");
                  setResults([]);
                }}
              ></i>
            ) : (
              ""
            )}
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {displayResults && (
          <div className="search-results">
            {results.map((result) => (
              <Link
                to={`/View/${result.id}`}
                key={result.id}
                onClick={() => {
                  setDisplayResults(false);
                  setSearchTerm("");
                  setOverlay(false);
                }}
              >
                <div className="result">
                  <div className="image">
                    <img src={result.thumbnail} alt={result.title} />
                  </div>
                  <div className="details">
                    <h3 className="title">{result.title}</h3>
                    <p className="type">{result.type}</p>
                  </div>
                </div>
              </Link>
            ))}

            {loading && (
              <div className="loading">
                <span>Loading...</span>
              </div>
            )}

            {results.length === 0 && !loading && (
              <div className="no-results">
                <span>No results found</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};


const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        let assetsQuery = query(collection(db, "Assets"));
  
        // You can add additional query constraints here if needed
  
        const snapshot = await getDocs(assetsQuery);
        const assetsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssets(assetsData);
      } catch (error) {
        setError(error.message);
      }
    };
  
    fetchAssets();
  }, []);

  return { assets, error };
};


const HeroSection = () => {

  const { assets, error } = useAssets();
  if (assets) {
    console.log({assets})
  }

  useEffect(() => {
    console.log({assets})
  }, [assets, useUser])

  return (
    <div className="hero-container">
      {/* Background image with overlay */}
      <div className="hero-background"></div>
      
      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Smarter creativity, faster designs
        </h1>
        <p className="hero-subtitle">
          Everything you need, from stock images and videos to AI-powered design tools.
        </p>
        
        {/* Search component */}
        <div className="search-container">
          <Search />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
