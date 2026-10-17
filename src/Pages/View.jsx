import { lazy, Suspense, useEffect, useState } from "react";
import ItemInfoTable from "../Components/ItemInfoTable";
import Keywords from "../Components/Keywords";
import Breadcrumbs from "../Components/Breadcrumbs";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  query,
  where,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import UserCard from "../Components/UI/UserCard";
import ToastAlert from "../Components/UI/ToastAlert";
import { useUser } from "../Context/UserProvider";
import ReactMarkdown from "react-markdown";
// import HdriViewer from "../Components/HdriViewer";
import remarkGfm from "remark-gfm";
import FavoriteButton from "../Components/UI/FavoriteButton";
import DownloadButton from "../Components/UI/DownloadButton";
import VideoViewer from "./VideoViewer";
import AssetFullScreen from "../Components/AssetFullScreen";
import RelatedItems from "../Components/RelatedItems";
import Cursor from "../common/cusor";
import SEO from "../common/SEO";
import { getAssetPath } from "../utils/assetPath";

const ModelViewer = lazy(() => import("../Components/ModelViewer"));
const MarkdownCodeBlock = lazy(() => import("../Components/MarkdownCodeBlock"));

const getAssetString = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value.url === "string") return value.url;
  return "";
};

const getAssetStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map(getAssetString).filter(Boolean);
  }

  const stringValue = getAssetString(value);
  return stringValue ? [stringValue] : [];
};

const trackAssetViewOnce = async (assetId) => {
  const storageKey = `viewed-asset:${assetId}`;
  if (window.sessionStorage.getItem(storageKey)) return;

  window.sessionStorage.setItem(storageKey, "1");

  try {
    await updateDoc(doc(db, "Assets", assetId), {
      views: increment(1),
    });
  } catch (error) {
    window.sessionStorage.removeItem(storageKey);
    throw error;
  }
};

const normalizeAsset = (data, id) => {
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag) => typeof tag === "string")
    : typeof data.tags === "string"
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  return {
    ...data,
    id,
    title: typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : "Untitled asset",
    description: typeof data.description === "string" ? data.description : "",
    type: typeof data.type === "string" ? data.type.toLowerCase() : "",
    category: typeof data.category === "string" ? data.category : "",
    tags,
    thumbnail: getAssetString(data.thumbnail),
    thumbnailModel: getAssetString(data.thumbnailModel),
    model: getAssetString(data.model),
    video: getAssetString(data.video),
    videoTemplateFile: getAssetString(data.videoTemplateFile),
    images: getAssetStringArray(data.images),
    icons: getAssetStringArray(data.icons),
  };
};

const View = () => {
  const { userProfile } = useUser();
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [seoData, setSeoData] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (/^\/view\//i.test(location.pathname) && location.pathname !== location.pathname.toLowerCase()) {
      navigate(`/view/${encodeURIComponent(slug || "")}`, { replace: true });
    }
  }, [location.pathname, navigate, slug]);
  const [toastState, setToastState] = useState("");
  const [item, setItem] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [showToast, setShowToast] = useState(false);
  const [isItemOwned, setIsItemOwned] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleShareAsset = async () => {
    const shareUrl = new URL(getAssetPath(item), window.location.origin).toString();
    const shareData = { title: item.title, url: shareUrl };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage("Asset link copied to clipboard");
        setToastState("success");
        setShowToast(true);
        window.setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      setToastMessage("Could not share this asset. Please try again.");
      setToastState("error");
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 3000);
    }
  };

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
    code({
  inline,
  className,
  children,
  ...props
}) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <Suspense
          fallback={(
            <pre>
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          )}
        >
          <MarkdownCodeBlock language={match[1]} {...props}>
            {String(children).replace(/\n$/, "")}
          </MarkdownCodeBlock>
        </Suspense>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    image({
  ...props
}) {
      return <img  loading="lazy"  className="markdown-image" alt={props.alt} {...props} />;
    },
  };

  useEffect(() => {
    let isActive = true;

    const fetchItem = async () => {
      setItem(null);
      setSeoData(null);
      setMarkdown("");
      setLoadStatus("loading");

      try {
        const q = query(collection(db, "Assets"), where("slug", "==", slug));
        const snap = await getDocs(q);

        if (!isActive) return;

        if (snap.empty) {
          setLoadStatus("not-found");
          return;
        }

        const docData = snap.docs[0].data();
        const docId = snap.docs[0].id;

        // Only approved assets can be viewed publicly.
        if (docData.status !== "approved") {
          setLoadStatus("not-found");
          return;
        }

        const fetchedItemData = normalizeAsset(docData, docId);

        void trackAssetViewOnce(docId).catch((error) => {
          console.error("Error tracking asset view:", error);
        });

        setItem(fetchedItemData);
        setMarkdown(docData.description || "");
        setSeoData(getAssetSEO(fetchedItemData));
        setLoadStatus("ready");
      } catch (error) {
        if (!isActive) return;
        console.error("Error loading asset:", error);
        setLoadStatus("error");
      }
    };

    fetchItem();

    return () => {
      isActive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (item?.id && userProfile?.purchasedItems) {
      setIsItemOwned(userProfile.purchasedItems.includes(item.id));
    } else {
      setIsItemOwned(false);
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

// ✅ SEO FUNCTION
  const getAssetSEO = (assetData) => {
    if (!assetData || !assetData.title) return null;

    return {
      title: `${assetData.title} | Shammarianas`,
      description: assetData.description
        ? assetData.description.substring(0, 160) + "..."
        : `Download ${assetData.title} from Shammarianas`,
      keywords: Array.isArray(assetData.tags) ? assetData.tags.join(", ") : "",
      ogImage: assetData.thumbnail || "/assets/imgs/default.jpg"
    };
  };

  // ✅ LOADING SEO FUNCTION
  const getLoadingSEO = () => ({
    title: "Loading Asset | Shammarianas",
    description: "Loading digital asset details...",
    keywords: "loading, digital assets",
    robots: "noindex, follow",
    noCanonical: true
  });

  const getUnavailableSEO = () => ({
    title: loadStatus === "error"
      ? "Asset Temporarily Unavailable | Shammarianas"
      : "Asset Not Found | Shammarianas",
    description: loadStatus === "error"
      ? "This asset could not be loaded right now. Please try again later."
      : "The requested asset could not be found on Shammarianas.",
    robots: "noindex, nofollow",
    noCanonical: true
  });

  return (
    <>
      <Cursor />

    {/* ✅ Dynamic SEO for Asset Page */}
      {loadStatus === "ready" && seoData ? (
        <SEO {...seoData} />
      ) : loadStatus === "loading" ? (
        <SEO {...getLoadingSEO()} />
      ) : (
        <SEO {...getUnavailableSEO()} />
      )}

      <div className="page_content">
        {loadStatus === "loading" ? (
          <div className="loading">Loading...</div>
        ) : loadStatus === "ready" && item?.id ? (
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
                { title: "Home", path: "/templates" },
                { title: item.type, path: `/templates/${item.type}` },
                { title: item.title, path: getAssetPath(item) },
              ]}
            />
            <div className="content">
              <div>
                <div className="left">
                  {item.type === "models" || item.type === "printables" ? (
                    <Suspense
                      fallback={(
                        <div
                          className="details-media-frame loading"
                          role="status"
                          aria-live="polite"
                        >
                          Loading 3D preview...
                        </div>
                      )}
                    >
                      <ModelViewer
                        thumbnailModel={item.thumbnailModel}
                        model={item.model}
                        type={item.type}
                        alt={item.title}
                        ar={item.vrArLowPoly}
                        onLoad={() => console.log("Model loaded successfully")}
                        onError={(e) => console.error("Error loading model:", e)}
                        onFullscreen={handleOpenFullscreen}
                      />
                    </Suspense>
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
                      style={{ cursor: "pointer", position: "relative" }}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="details-media-img"
                      />
                      {item.type === "prompts" && item.previewUrl && (
                        <a
                          href={item.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="asset-preview-button"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Preview
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="asset_details d-md-block d-none mt-4">
                  <div className="description">
                    <h2 className="title">Overview</h2>
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
                    <h2 className="title">Tags</h2>
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
                    <button
                      type="button"
                      className="add_to_wishlist_btn share_asset_btn"
                      onClick={handleShareAsset}
                      aria-label="Share asset"
                      title="Share asset"
                    >
                      <i className="icon fas fa-share-alt" aria-hidden="true"></i>
                    </button>
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
          <section className="page-error section-padding valign">
            <div className="container">
              <div className="text-center">
                <h1>{loadStatus === "error" ? "Sorry" : "404"}</h1>
                <h2>
                  {loadStatus === "error"
                    ? "Asset temporarily unavailable"
                    : "Asset not found"}
                </h2>
                <p>
                  {loadStatus === "error"
                    ? "We could not load this asset right now. Please try again later."
                    : "The asset may have been removed or the link may be incorrect."}
                </p>
                <Link
                  to="/"
                  className="butn butn-md butn-bg main-colorbg radius-30 mt-30"
                >
                  <span className="text">Back to Home</span>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {loadStatus === "ready" && item?.id ? (
        <RelatedItems
          category={item.category}
          currentItemId={item.id}
          assetType={item.type}
          limit={8}
        />
      ) : null}
    </>
  );
};

export default View;
