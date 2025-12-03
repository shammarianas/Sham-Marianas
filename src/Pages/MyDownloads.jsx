import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import { useUser } from "../Context/UserProvider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Naya (same hi rahega, bas ensure karo path sahi hai)
import { downloadLicense } from "../utils/generateLicense";

// ✅ Function to fetch complete asset data including licenseType
const fetchCompleteAssetData = async (assetId, downloadData) => {
  try {
    // First try to get from Assets collection
    const assetDoc = await getDoc(doc(db, "Assets", assetId));
    if (assetDoc.exists()) {
      const assetData = assetDoc.data();
      return {
        ...downloadData,
        ...assetData, // This will include licenseType and other fields
        id: assetId,
      };
    }
    
    // If not found in Assets, return the download data as is
    return {
      ...downloadData,
      id: assetId,
    };
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return {
      ...downloadData,
      id: assetId,
    };
  }
};

// ✅ SIMPLE LICENSE DETECTION - Use whatever is stored in asset.licenseType
const detectLicenseType = (asset) => {
  // Use the licenseType that was set during upload
  if (asset.licenseType) {
    return asset.licenseType;
  }

  // Fallback based on price
  const price = Number(asset.price) || 0;
  const discount = Number(asset.discount ?? 0) || 0;
  const finalPrice = Math.max(0, price - (price * discount) / 100);

  return finalPrice === 0 ? "Free License" : "Commercial License";
};

// ✅ SIMPLE COLOR FUNCTION
const getLicenseBadgeColor = (licenseType) => {
  if (!licenseType) return "#636e72";
  
  const license = licenseType.toLowerCase();
  
  if (license.includes("free for personal")) return "#00b894"; // Green
  if (license.includes("free for commercial")) return "#0984e3"; // Blue
  if (license.includes("editorial")) return "#e17055"; // Orange
  if (license.includes("extended")) return "#6c5ce7"; // Purple
  if (license.includes("commercial")) return "#0984e3"; // Blue
  if (license.includes("personal")) return "#00b894"; // Green
  if (license.includes("free")) return "#00b894"; // Green
  
  return "#636e72"; // Default gray
};

// Simple 3D Model Viewer Component
const SimpleModelViewer = ({ modelUrl }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !modelUrl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(100, 100);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = true;

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      model.position.x -= center.x;
      model.position.y -= center.y;
      model.position.z -= center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 5 / maxDim : 1;
      model.scale.multiplyScalar(scale);

      scene.add(model);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return <div ref={mountRef} />;
};

const MyDownloads = () => {
  const { currentUser } = useUser();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingLicense, setDownloadingLicense] = useState(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const downloadsRef = collection(
          db,
          `Profiles/${currentUser.uid}/downloads`
        );
        const downloadsSnapshot = await getDocs(downloadsRef);

        if (downloadsSnapshot.empty) {
          setLoading("no_items");
          return;
        }

        // Fetch complete asset data for each download
        const downloadsData = [];
        for (const docSnap of downloadsSnapshot.docs) {
          const assetId = docSnap.id;
          const downloadData = docSnap.data();
          
          // Fetch complete asset data including licenseType
          const completeAssetData = await fetchCompleteAssetData(assetId, downloadData);
          downloadsData.push(completeAssetData);
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

  // Function to check if asset has 3D model
  const is3DModel = (asset) => {
    if (!asset) return false;
    if (asset.thumbnailModel) return true;
    if (asset.model) {
      const is3DFile = asset.model
        .toLowerCase()
        .match(/\.(gltf|glb|obj|stl|fbx|blend)($|\?)/);
      if (is3DFile) return true;
    }
    return false;
  };

  // Function to get 3D model URL
  const get3DModelUrl = (asset) => {
    if (!asset) return null;
    if (asset.thumbnailModel) return asset.thumbnailModel;
    if (asset.model) {
      const is3DFile = asset.model
        .toLowerCase()
        .match(/\.(gltf|glb|obj|stl|fbx|blend)($|\?)/);
      if (is3DFile) return asset.model;
    }
    return null;
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle license download - SIMPLIFIED
  const handleDownloadLicense = async (asset) => {
    setDownloadingLicense(asset.id);
    try {
      const success = await downloadLicense(asset, currentUser);
      if (success) {
        alert('License downloaded successfully!');
      } else {
        alert('Failed to download license. Please try again.');
      }
    } catch (error) {
      console.error('License download error:', error);
      alert('Error downloading license. Please try again.');
    }
    setDownloadingLicense(null);
  };

  // Check if asset is free
  const isAssetFree = (asset) => {
    const price = Number(asset.price) || 0;
    const discount = Number(asset.discount ?? 0) || 0;
    const finalPrice = Math.max(0, price - (price * discount) / 100);
    return finalPrice === 0;
  };

  // Get license type text - UPDATED: using the local function
  const getLicenseType = (asset) => {
    return detectLicenseType(asset);
  };

  // Get license badge color - UPDATED: using the local function
  const getLicenseBadgeColorForAsset = (asset) => {
    const licenseType = detectLicenseType(asset);
    return getLicenseBadgeColor(licenseType);
  };

  // ✅ NEW: Get display text for asset type
  const getAssetTypeDisplay = (type) => {
    if (!type) return "Asset";
    
    const typeMap = {
      "models": "3D Model",
      "videos": "Video",
      "images": "Image",
      "scripts": "Script",
      "graphics": "Graphics Template",
      "mockups": "Mockup",
      "fonts": "Font",
      "video-templates": "Video Template",
      "icons": "Icons",
      "hdris": "HDRI",
      "textures": "Texture",
      "other": "Other"
    };
    
    return typeMap[type] || type;
  };

  return (
    <>
      <Helmet>
        <title>
          My Downloads - {currentUser ? currentUser.displayName : "User"}
        </title>
      </Helmet>
      <div className="page_content">
        <PageTitle title="My Downloads" />

        <div className="downloads-container">
          {loading === true ? (
            <div className="loading">Loading...</div>
          ) : loading === "no_items" ? (
            <div className="no_items">
              <span>No Downloads Found.</span>
            </div>
          ) : (
            <div className="downloads-list">
              {assets.map((asset, index) => {
                const is3D = is3DModel(asset);
                const modelUrl = get3DModelUrl(asset);
                const licenseType = getLicenseType(asset);
                const licenseColor = getLicenseBadgeColorForAsset(asset);

                return (
                  <div className="download-item" key={index}>
                    <div className="download-item-content">
                      <div className="asset-preview">
                        {is3D ? (
                          <div className="model-preview">
                            <Link to={`/View/${asset.id}`}>
                              <SimpleModelViewer modelUrl={modelUrl} />
                            </Link>
                          </div>
                        ) : (
                          <div className="image-preview">
                            <Link to={`/View/${asset.id}`}>
                              {(() => {
                                const src = asset.thumbnail;
                                if (!src) return <div className="no-preview">No Preview</div>;
                                
                                const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(src);

                                if (isVideo) {
                                  return (
                                    <div
                                      className="video-container"
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
                                        className="preview-media"
                                      />
                                    </div>
                                  );
                                }
                                return <img src={src} alt={asset.title} className="preview-media" />;
                              })()}
                            </Link>

                            {asset.discount > 0 && (
                              <div className="discount-badge">
                                -{asset.discount}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="asset-details">
                        <div className="creator-info">
                          <div>
                            <div className="asset-info">
                              <Link to={`/View/${asset.id}`} className="asset-title-link">
                                <h3 className="asset-title">{asset.title}</h3>
                              </Link>
                              <div className="asset-meta">
                                <span className="asset-type">
                                  {getAssetTypeDisplay(asset.type)}
                                </span>
                                <span className="license-type-badge" style={{ backgroundColor: licenseColor }}>
                                  {licenseType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="creator-by">by: </span>
                            <span className="creator-name">
                              {asset.authorName ||
                                asset.author ||
                                asset.createdBy ||
                                asset.publisher ||
                                asset.userDisplayName ||
                                currentUser?.displayName ||
                                "User"}
                            </span>
                          </div>
                        </div>

                        <div className="price-section">
                          <span className="price">
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
                          </span>
                          <span className="download-date">
                            Downloaded on {formatDate(asset.downloadDate || asset.createdAt)}
                          </span>
                        </div>

                        <div className="download-actions">
                          <button
                            className="download-license license-badge"
                            onClick={() => handleDownloadLicense(asset)}
                            disabled={downloadingLicense === asset.id}
                            style={{ backgroundColor: licenseColor }}
                          >
                            {downloadingLicense === asset.id ? 'Generating...' : 'Download License'}
                          </button>
                          <button className="download-btn primary">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .downloads-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
        }

        .downloads-list {
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          border: 1px solid #2c2d2c;
        }

        .download-item {
          overflow: hidden;
          border-bottom: 1px solid #2c2d2c;
        }

        .download-item:last-child {
          border-bottom: none;
        }

        .download-item-content {
          display: flex;
          padding: 20px;
          gap: 20px;
          align-items: center;
        }

        .asset-preview {
          flex: 0 0 80px;
        }

        .model-preview,
        .image-preview {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
        }

        .preview-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-preview {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f3f5;
          color: #868e96;
          font-size: 12px;
        }

        .video-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .discount-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #e17055;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .asset-details {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .creator-info {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          font-size: 13px;
          flex-direction: column;
        }

        .asset-title-link {
          text-decoration: none;
          color: inherit;
        }

        .asset-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px 0;
          line-height: 1.3;
          cursor: pointer;
        }

        .asset-title:hover {
          color: #0984e3;
        }

        .asset-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .asset-type {
          font-size: 12px;
          font-weight: 500;
          color: #0984e3;
          background: #e3f2fd;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .license-type-badge {
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .creator-by {
          color: #636e72;
        }

        .creator-name {
          font-weight: 600;
        }

        .price-section {
          display: flex;
          margin: 0 20px;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .price {
          font-size: 16px;
          font-weight: 700;
        }

        .download-date {
          font-size: 12px;
          color: #636e72;
        }

        .download-actions {
          display: flex;
          gap: 10px;
        }

        .download-license {
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .download-license:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .download-btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .download-btn.primary {
          background: #0984e3;
          color: white;
        }

        .download-btn.primary:hover {
          background: #0770c4;
        }

        .loading,
        .no_items {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #636e72;
        }

        @media (max-width: 768px) {
          .download-item-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .asset-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
          }

          .price-section {
            margin: 0;
            align-items: flex-start;
          }

          .download-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export default MyDownloads;