import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import { useUser } from "../Context/UserProvider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Favorites = () => {
  const { currentUser } = useUser();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get favorites from subcollection
        const favoritesRef = collection(db, `Profiles/${currentUser.uid}/favorites`);
        const favoritesSnapshot = await getDocs(favoritesRef);
        
        if (favoritesSnapshot.empty) {
          setLoading("no_items");
          return;
        }
        
        // Map through favorites documents and extract asset data
        const favoritesData = [];
        
        for (const doc of favoritesSnapshot.docs) {
          // The document ID is the asset ID
          const assetId = doc.id;
          // The document data contains the asset information
          const assetData = doc.data();
          
          favoritesData.push({
            id: assetId,
            ...assetData
          });
        }
        
        setAssets(favoritesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  return (
    <>
      <Helmet>
        <title>
          My Favorites - {currentUser ? currentUser.displayName : "User"}
        </title>
      </Helmet>
      <div className="page_content">
        <PageTitle title="My Favorites" />
        <div className="item_listing">
          {loading === true ? (
            <div className="loading">Loading...</div>
          ) : loading === "no_items" ? (
            <div className="no_items">
              <span>No Favorites Found.</span>
            </div>
          ) : (
            assets.map((asset, index) => (
              <div className="" key={index}>
                <div className="item_card">
                  <div 
                    className="card_image"
                    style={{
                      aspectRatio: asset.type === "textures" ? "1 / 1" : undefined,
                    }}
                  >
                    {asset.discount > 0 ? (
                      <div className="discount_card">
                        <span>
                          <strong>-{asset.discount}%</strong>
                        </span>
                      </div>
                    ) : null}
                    <Link className="card_image" to={`/View/${asset.id}`}>
                      {(() => {
                        const src = asset.thumbnail;

                        // Detect video
                        const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(src);

                        if (isVideo) {
                          return (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              onMouseEnter={(e) => {
                                const video = e.currentTarget.querySelector("video");
                                if (video) video.play();
                              }}
                              onMouseLeave={(e) => {
                                const video = e.currentTarget.querySelector("video");
                                if (video) {
                                  video.pause();
                                  video.currentTime = 0;
                                }
                              }}
                            >
                              <video
                                src={src}
                                muted
                                loop
                                playsInline
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          );
                        }

                        // ✅ Image fallback (normal case)
                        return <img src={src} alt="placeholder" />;
                      })()}
                    </Link>
                  </div>

                  <div className="card_content">
                    <div className="title">
                      {asset.title} <br />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <span className="publisher">
                          by {asset.publisher || currentUser?.displayName || "User"}
                        </span>
                      </div>
                    </div>

                    <div className="details">
                      <span className="price">
                        <strong>
                          {(() => {
                            const price = Number(asset.price) || 0;
                            const discount = Number(asset.discount ?? 0) || 0;
                            const finalPrice = Math.max(0, price - (price * discount) / 100);
                            return finalPrice === 0 ? "Free" : `$${finalPrice.toFixed(2)}`;
                          })()}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Favorites;