import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import { useUser } from "../Context/UserProvider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Simple 3D Model Viewer Component
const SimpleModelViewer = ({ modelUrl }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !modelUrl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 300);
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
        const favoritesRef = collection(
          db,
          `Profiles/${currentUser.uid}/favorites`
        );
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

          // Store both id and slug
          favoritesData.push({
            id: assetId,
            slug: assetData.slug || assetId, // Use slug if available, otherwise use id
            ...assetData,
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

  // Function to get the correct link for an asset
  const getAssetLink = (asset) => {
    if (!asset) return "#";
    
    // Priority: slug -> id -> title as slug
    if (asset.slug) {
      return `/View/${asset.slug}`;
    } else if (asset.id) {
      return `/View/${asset.id}`;
    } else if (asset.title) {
      // Create a slug from title
      const slug = asset.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return `/View/${slug}`;
    }
    return "#";
  };

  return (
    <>
      <Helmet>
        <title>
          My Favorites - {currentUser ? currentUser.displayName : "User"}
        </title>
      </Helmet>
      <div className="page_content">
        <PageTitle title="My Favorites" />
        <div className="item_listing p-3">
          {loading === true ? (
            <div className="loading">Loading...</div>
          ) : loading === "no_items" ? (
            <div className="no_items">
              <span>No Favorites Found.</span>
            </div>
          ) : (
            assets.map((asset, index) => {
              const is3D = is3DModel(asset);
              const modelUrl = get3DModelUrl(asset);
              const assetLink = getAssetLink(asset); // Get correct link

              return (
                <div className="" key={index}>
                  <div className="item_card">
                    <div
                      className="card_image"
                      style={{
                        aspectRatio:
                          asset.type === "textures" ? "1 / 1" : undefined,
                      }}
                    >
                      {asset.discount > 0 ? (
                        <div className="discount_card">
                          <span>
                            <strong>-{asset.discount}%</strong>
                          </span>
                        </div>
                      ) : null}
                      <Link className="card_image" to={assetLink}>
                        {is3D ? (
                          <SimpleModelViewer modelUrl={modelUrl} />
                        ) : (
                          (() => {
                            const src = asset.thumbnail;
                            const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(
                              src
                            );

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
                                    const video =
                                      e.currentTarget.querySelector("video");
                                    if (video) video.play();
                                  }}
                                  onMouseLeave={(e) => {
                                    const video =
                                      e.currentTarget.querySelector("video");
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
                            return <img  loading="lazy"  src={src} alt="placeholder" />;
                          })()
                        )}
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
                            by {asset.authorName || asset.author || "Unknown"}
                          </span>
                        </div>
                      </div>

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
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Favorites;