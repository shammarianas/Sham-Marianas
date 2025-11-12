import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import { useUser } from "../Context/UserProvider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const MyDownloads = () => {
  const { currentUser } = useUser();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get downloads from subcollection
        const downloadsRef = collection(
          db,
          `Profiles/${currentUser.uid}/downloads`
        );
        const downloadsSnapshot = await getDocs(downloadsRef);

        if (downloadsSnapshot.empty) {
          setLoading("no_items");
          return;
        }

        // Map through downloads documents and extract asset data
        const downloadsData = [];

        for (const doc of downloadsSnapshot.docs) {
          // The document ID is the asset ID
          const assetId = doc.id;
          // The document data contains the asset information
          const assetData = doc.data();

          downloadsData.push({
            id: assetId,
            ...assetData,
          });
        }

        setAssets(downloadsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching downloads:", error);
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [currentUser]);

  return (
    <>
      <Helmet>
        <title>
          My Downloads - {currentUser ? currentUser.displayName : "User"}
        </title>
      </Helmet>
     <div className="page_content">
             <PageTitle title="My Favorites" />
             <div className="item_listing">
               {loading === true ? (
                 <div className="loading">Loading...</div>
               ) : loading === "no_items" ? (
                 <div className="no_items">
                   <span>No Download Found.</span>
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
      <div className="page_content">
        <PageTitle title="My Downloads" />
        <div className="item_listing">
          {loading === true ? (
            <div className="loading">Loading...</div>
          ) : loading === "no_items" ? (
            <div className="no_items">
              <span>No Downloads Found.</span>
            </div>
          ) : (
            assets.map((asset, index) => (
              <Link to={`/View/${asset.id}`} key={index}>
                <div className="item_card">
                  <div className="card_image">
                    {asset.discount > 0 ? (
                      <div className="discount_card">
                        <span>
                          <strong>-{asset.discount}%</strong>
                        </span>
                      </div>
                    ) : null}
                    <img src={asset.thumbnail} alt="placeholder" />
                  </div>

                  <div className="card_content">
                    <span className="title">
                      {asset.title}{" "}
                      <span className="publisher">
                        by Servant {asset.publisher}
                      </span>
                    </span>
                    <div className="details">
                      <span className="price">
                        <strong>
                          {(() => {
                            const price = Number(asset.price) || 0;
                            const discount = Number(asset.discount ?? 0) || 0;
                            const finalPrice = Math.max(
                              0,
                              price - (price * discount) / 100
                            );
                            return finalPrice === 0
                              ? "Free"
                              : `$${finalPrice.toFixed(2)}`;
                          })()}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default MyDownloads;
