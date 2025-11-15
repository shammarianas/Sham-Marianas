import React, { useEffect, useState } from "react";
import ItemInfoTable from "../Components/ItemInfoTable";
import Keywords from "../Components/Keywords";
import sky from "../assets/Models/illovo_beach_balcony_4k.hdr";
import Breadcrumbs from "../Components/Breadcrumbs";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import ModelViewer from "../Components/ModelViewer";
import UserCard from "../Components/UI/UserCard";
import ToastAlert from "../Components/UI/ToastAlert";
import { Helmet } from "react-helmet-async";
import { useUser } from "../Context/UserProvider";
import ReactMarkdown from "react-markdown";
import "@google/model-viewer";
import HdriViewer from "../Components/HdriViewer";
import SyntaxHighlighter from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import FavoriteButton from "../Components/UI/FavoriteButton";
import DownloadButton from "../Components/UI/DownloadButton";
import VideoViewer from "./VideoViewer";
import ContentViewer from "../Components/ContentViewer";
import AssetFullScreen from "../Components/AssetFullScreen";
import RelatedItems from "../Components/RelatedItems";

const View = () => {
  const { currentUser, userProfile } = useUser();
  const docId = useParams().id;
  const [is3d, setIs3d] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastState, setToastState] = useState("");
  const [item, setItem] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [isItemOwned, setIsItemOwned] = useState(false);
  const [group, setGroup] = useState(null);
  const [markdown, setMarkdown] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get price display text - UPDATED FOR FREE/PAID STRINGS
  const getPriceDisplay = (asset) => {
    if (asset.price === "free") return "Free";
    if (asset.price === "paid") return "Paid";

    // Fallback for old data
    if (typeof asset.price === "number") {
      return asset.price > 0 ? "Paid" : "Free";
    }

    if (typeof asset.price === "string") {
      const numPrice = parseFloat(asset.price);
      if (!isNaN(numPrice)) {
        return numPrice > 0 ? "Paid" : "Free";
      }
    }

    return "Free";
  };

  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={materialDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    image({ node, ...props }) {
      return <img className="markdown-image" alt={props.alt} {...props} />;
    },
  };

  useEffect(() => {
    const fetchItem = async () => {
      const itemDocRef = doc(db, "Assets", docId);
      const itemDocSnap = await getDoc(itemDocRef);

      if (itemDocSnap.exists()) {
        setItem({ id: itemDocSnap.id, ...itemDocSnap.data() });
        setMarkdown(itemDocSnap.data().description);
        setIs3d(itemDocSnap.data().is3d);
      } else {
      }
    };

    fetchItem();
  }, [docId]);

  useEffect(() => {
    if (userProfile && userProfile.purchasedItems) {
      setIsItemOwned(userProfile.purchasedItems.includes(item.id));
    }
  }, [userProfile, item]);

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleDownloadFromFullscreen = () => {
    console.log("Download from fullscreen:", item);
  };

  return (
    <>
      <Helmet>
        <title>{`${item.title} | shammarianas`} </title>
        <meta name="description" content={item.description} />
        <meta property="og:title" content={`${item.title} | shammarianas`} />
        <meta property="og:description" content={item.description} />
        <meta property="og:image" content={item.thumbnail} />
        <meta
          property="twitter:title"
          content={`${item.title} | shammarianas`}
        />
        <meta property="twitter:description" content={item.description} />
        <meta property="twitter:image" content={item.thumbnail} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:site" content="@shammarianas" />
        <meta property="twitter:creator" content="@shammarianas" />
        <meta property="og:site_name" content="shammarianas" />
        <meta property="og:locale" content="en_US" />
      </Helmet>

      <div className="page_content">
        {item.id ? (
          <div className="view_item_main">
            {showToast ? (
              <ToastAlert message={toastMessage} state={toastState} />
            ) : null}

            <AssetFullScreen
              asset={item}
              assetType={item.type}
              isOpen={isFullscreen}
              onClose={handleCloseFullscreen}
              onDownload={handleDownloadFromFullscreen}
            />

            <Breadcrumbs
              links={[
                { title: "Home", path: "/" },
                { title: item.type, path: `/${item.type}` },
                { title: item.title, path: `/View/${item.id}` },
              ]}
            />
            <div className="content">
              <div>
                <div className="left">
                  {item.type === "models" || item.type === "printables" ? (
                    <ModelViewer
                      thumbnailModel={item.thumbnailModel} 
                      model={item.model}
                      type={item.type}
                      alt={item.title}
                      ar={item.vrArLowPoly}
                      sky={sky}
                      onLoad={() => console.log("Model loaded successfully")}
                      onError={(e) => console.error("Error loading model:", e)}
                      onFullscreen={handleOpenFullscreen}
                    />
                  ) : item.type === "hdris" ? (
                    <HdriViewer
                      hdri={item.hdri}
                      onFullscreen={handleOpenFullscreen}
                    />
                  ) : item.type === "videos" ? (
                    <VideoViewer
                      videoUrl={item.video}
                      videoName={item.title}
                      previewUrl={item.thumbnail}
                      onFullscreen={handleOpenFullscreen}
                    />
                  ) : item.type === "video-templates" ? (
                    <VideoViewer
                      videoUrl={item.videoTemplateFile} // YEH CHANGE KARO
                      videoName={item.title}
                      previewUrl={item.thumbnail}
                      onFullscreen={handleOpenFullscreen}
                    />
                  ) : (
                    <div
                      className="details-media-frame"
                      onClick={handleOpenFullscreen}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="details-media-img"
                      />
                    </div>
                  )}
                </div>

                <div className="asset_details d-md-block d-none mt-4">
                  <div className="description">
                    <h2 className="title">Details</h2>
                    <div className="content" />
                    <div className="markdown-preview">
                      <ReactMarkdown
                        components={renderers}
                        remarkPlugins={[remarkGfm]}
                      >
                        {markdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="keywords_section">
                    <h2 className="title">Assets Tags</h2>
                    <div>
                      <Keywords keywords={item.tags} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="right">
                <div className="top_info">
                  <div className="title">
                    <h2
                      onClick={handleOpenFullscreen}
                      style={{ cursor: "pointer", display: "inline-block" }}
                      title="Click to view in fullscreen"
                    >
                      {item.title}
                    </h2>

                    <div className="deatils">
                      <UserCard
                        userId={item.userId}
                        profilePic={item.profilePic}
                        username={item.username}
                      />
                    </div>
                  </div>
                  <div className="price">
                    {isItemOwned ? (
                      <span className="ownership_badge">Purchased</span>
                    ) : (
                      ""
                    )}

                    {/* UPDATED PRICE DISPLAY */}
                    <span className="price_value">{getPriceDisplay(item)}</span>
                  </div>

                  <div className="action_buttons">
                    <DownloadButton
                      item={item}
                      userProfile={userProfile}
                      setToastMessage={setToastMessage}
                      setToastState={setToastState}
                      setShowToast={setShowToast}
                    />

                    <FavoriteButton assetId={item.id} />
                  </div>
                </div>

                <ItemInfoTable asset={item} />
              </div>

              <div className="asset_details d-block d-md-none mt-4">
                <div className="description">
                  <h2 className="title">Details</h2>
                  <div className="content" />
                  <div className="markdown-preview">
                    <ReactMarkdown
                      components={renderers}
                      remarkPlugins={[remarkGfm]}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="keywords_section">
                  <h2 className="title">Assets Tags</h2>
                  <div>
                    <Keywords keywords={item.tags} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="loading">Loading...</div>
        )}
      </div>

      <RelatedItems
        tags={item.tags}
        currentItemId={item.id}
        assetType={item.type}
        limit={8}
      />
    </>
  );
};

export default View;
