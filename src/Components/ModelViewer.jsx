import { useEffect, useRef, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import "three/examples/jsm/postprocessing/EffectComposer";
import "three/examples/jsm/postprocessing/RenderPass";
import "three/examples/jsm/postprocessing/UnrealBloomPass";
import "three/examples/jsm/postprocessing/BokehPass";
import model_bg from "../assets/Images/Sections/model_bg.png";

const ModelViewer = (props) => {
  const [shadow] = useState(2);
  const [exposure] = useState(1);
  const [isPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const currentModelRef = useRef(null);
  const wireframeRef = useRef(false);
  const [isWireframeOn] = useState(false);
  const [autoRotate] = useState(true);

  // Function to check if file is supported 3D format
  const isSupported3DFormat = (url) => {
    if (!url) return false;
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0];
    // ZIP files ko exclude karo - sirf 3D formats allow karo
    return ['glb', 'gltf', 'fbx', 'obj', 'stl', '3ds'].includes(extension);
  };

  // ✅ YEH FUNCTION BANAYO JO SAHI MODEL URL DETA HAI
  const getModelToLoad = () => {
    console.log("🔍 ModelViewer checking all model sources:", {
      thumbnailModel: props.thumbnailModel, // 👈 THUMBNAIL SE 3D MODEL
      model: props.model,                   // 👈 MODEL FIELD SE DOWNLOAD FILE
      type: props.type
    });

    // Priority 1: thumbnailModel (preview ke liye)
    if (props.thumbnailModel && isSupported3DFormat(props.thumbnailModel)) {
      console.log("✅ Using thumbnailModel for 3D preview:", props.thumbnailModel);
      return props.thumbnailModel;
    }

    // Priority 2: model field (only if supported format)
    if (props.model && isSupported3DFormat(props.model)) {
      console.log("✅ Using model field for 3D preview:", props.model);
      return props.model;
    }

    console.log("❌ No supported 3D model found");
    return null;
  };

  const modelToLoad = getModelToLoad();

  useEffect(() => {
    const mountNode = mountRef.current;
    let animationFrameId;

    setIsLoading(true);
    setLoadProgress(0);
    setError(null);

    console.log("🎯 ModelViewer will load:", modelToLoad);

    if (!modelToLoad) {
      console.log("❌ No model to load");
      setError('No 3D model available for preview');
      setIsLoading(false);
      return;
    }

    // Check if the model file is supported
    if (!isSupported3DFormat(modelToLoad)) {
      console.error('❌ Unsupported format for 3D preview:', modelToLoad);
      setError('This file format cannot be previewed in 3D. Please download the file to view it.');
      setIsLoading(false);
      return;
    }

    // Initialize Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f0f0);

    // Initialize Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      mountRef.current?.clientWidth / mountRef.current?.clientHeight || 1,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(5, 5, 5);

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    rendererRef.current = renderer;

    const width = mountRef.current?.clientWidth || window.innerWidth;
    const height = mountRef.current?.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;

    // Initialize Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;

    // Touch controls for mobile
    controls.enableTouch = true;
    controls.touchRotateSpeed = 0.5;
    controls.touchZoomSpeed = 0.8;
    controls.touchPanSpeed = 0.3;

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Add fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // Background texture as fallback
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(model_bg, (texture) => {
      if (!scene.background.isTexture) {
        texture.repeat.set(2, 2);
        scene.background = texture;
      }
    });

    // Setup DRACO Loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    // Mount renderer
    if (mountNode) {
      mountNode.appendChild(renderer.domElement);
    }

    // Load Model Function - GLB OPTIMIZED
    const loadModel = async (path) => {
      try {
        const storage = getStorage(app);
        const modelRef = ref(storage, path);
        const url = await getDownloadURL(modelRef);

        let extension = url.split('.').pop().toLowerCase().split('?')[0];

        console.log("📦 Loading model:", { url, extension });

        // Final check - agar ZIP file hai to error show karo
        if (extension === 'zip') {
          console.error('❌ ZIP files cannot be previewed in 3D viewer');
          setError('ZIP files cannot be previewed in 3D. Please download the file to view its contents.');
          setIsLoading(false);
          return;
        }

        const manager = new THREE.LoadingManager();
        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
          setLoadProgress((itemsLoaded / itemsTotal) * 100);
        };

        manager.onLoad = () => {
          setIsLoading(false);
          setLoadProgress(100);
        };

        let loader;

        switch (extension) {
          case 'glb':
          case 'gltf':
            loader = new GLTFLoader(manager);
            loader.setDRACOLoader(dracoLoader);

            loader.load(url, (gltf) => {
              // Remove previous model
              if (currentModelRef.current) {
                scene.remove(currentModelRef.current);
              }

              const model = gltf.scene;
              currentModelRef.current = model;

              // GLB OPTIMIZED MATERIAL HANDLING
              model.traverse((node) => {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;

                  // Enable wireframe if toggled
                  if (wireframeRef.current) {
                    node.material.wireframe = true;
                  }

                  // GLB SPECIFIC MATERIAL OPTIMIZATIONS
                  if (node.material) {
                    node.material.envMapIntensity = 1;

                    // For GLB files, preserve original material properties
                    if (node.material.isMeshStandardMaterial) {
                      // Keep original GLB material values
                      node.material.roughness = node.material.roughness !== undefined ? node.material.roughness : 0.5;
                      node.material.metalness = node.material.metalness !== undefined ? node.material.metalness : 0.1;
                    }

                    // Ensure material updates
                    node.material.needsUpdate = true;
                  }
                }
              });

              scene.add(model);
              centerAndScaleModel(model);
              fitModelToView(model);
            },
            (progress) => {
              if (progress.lengthComputable) {
                setLoadProgress((progress.loaded / progress.total) * 100);
              }
            },
            (error) => {
              console.error('Error loading GLTF model:', error);
              setError('Failed to load 3D model');
              setIsLoading(false);
            });
            break;

          case 'obj':
            loader = new OBJLoader(manager);
            loader.load(url, (obj) => {
              if (currentModelRef.current) {
                scene.remove(currentModelRef.current);
              }

              currentModelRef.current = obj;
              obj.traverse((node) => {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                  if (wireframeRef.current) {
                    const wireframeMaterial = new THREE.MeshBasicMaterial({
                      color: 0xffffff,
                      wireframe: true
                    });
                    node.material = wireframeMaterial;
                  }
                }
              });

              scene.add(obj);
              centerAndScaleModel(obj);
              fitModelToView(obj);
            });
            break;

          case 'stl':
            loader = new STLLoader(manager);
            loader.load(url, (geometry) => {
              if (currentModelRef.current) {
                scene.remove(currentModelRef.current);
              }

              const material = new THREE.MeshPhongMaterial({
                color: 0xaaaaaa,
                specular: 0x111111,
                shininess: 200,
                wireframe: wireframeRef.current
              });

              currentModelRef.current = new THREE.Mesh(geometry, material);
              currentModelRef.current.castShadow = true;
              currentModelRef.current.receiveShadow = true;

              scene.add(currentModelRef.current);
              centerAndScaleModel(currentModelRef.current);
              fitModelToView(currentModelRef.current);
            });
            break;

          default:
            console.error(`Unsupported format: ${extension}`);
            setError(`Unsupported file format: ${extension}`);
            setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load model:', error);
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    };

    const centerAndScaleModel = (model) => {
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 10 / maxDim;

      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
    };

    const fitModelToView = (model) => {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
      const fitWidthDistance = fitHeightDistance / camera.aspect;
      const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

      camera.position.copy(center);
      camera.position.x += distance;
      camera.position.y += distance * 0.5;
      camera.position.z += distance;
      camera.lookAt(center);

      controls.target.copy(center);
      controls.update();
    };

    // ✅ SAHI MODEL LOAD KARO
    console.log("🚀 Loading model:", modelToLoad);
    loadModel(modelToLoad);

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (controls) {
        controls.update();
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      const width = mountNode?.clientWidth || window.innerWidth;
      const height = mountNode?.clientHeight || window.innerHeight;

      if (camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      if (renderer) {
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountNode?.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (controls) {
        controls.dispose();
      }
      if (currentModelRef.current) {
        scene.remove(currentModelRef.current);
      }
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
      controlsRef.current = null;
      currentModelRef.current = null;
    };
  }, [modelToLoad]);

  // Wireframe effect
  useEffect(() => {
    wireframeRef.current = isWireframeOn;
    if (currentModelRef.current) {
      currentModelRef.current.traverse((node) => {
        if (node.isMesh) {
          if (isWireframeOn) {
            if (node.material.isMaterial) {
              node.material.wireframe = true;
            } else {
              // For OBJ files, replace material
              const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true
              });
              node.material = wireframeMaterial;
            }
          } else {
            if (node.material.isMaterial) {
              node.material.wireframe = false;
            }
            // Note: OBJ materials can't be easily restored without reloading
          }
        }
      });
    }
  }, [isWireframeOn]);

  // Auto-rotate effect
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate && isPlaying;
    }
  }, [autoRotate, isPlaying]);

  // Shadow intensity effect
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.traverse((node) => {
        if (node.isDirectionalLight) {
          node.intensity = shadow;
        }
      });
    }
  }, [shadow]);

  // Exposure effect
  useEffect(() => {
    if (sceneRef.current) {
      const ambientLight = sceneRef.current.children.find(child => child.isAmbientLight);
      if (ambientLight) {
        ambientLight.intensity = exposure * 0.6;
      }
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = exposure;
    }
  }, [exposure]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`model_showcase ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="controls">
        <button
          className="control-btn fullscreen-btn"
          onClick={handleFullscreen}
          title="Toggle Fullscreen"
        >
          <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
        </button>
      </div>

      <div className="model_viewer" ref={mountRef}>
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Model...</div>
            <div className="loading-progress">
              <div
                className="loading-progress-bar"
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>
            <div className="loading-percentage">{Math.round(loadProgress)}%</div>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
            <div className="error-hint">
              Please download the file to view its contents
            </div>
          </div>
        )}
      </div>

      <style>{`
        .model_showcase {
          position: relative;
          width: 100%;
          height: 500px;
          border-radius: 12px;
          overflow: hidden;
          background: #f0f0f0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .model_showcase.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
        }

        .model_viewer {
          width: 100%;
          height: 100%;
          cursor: grab;
        }

        .model_viewer:active {
          cursor: grabbing;
        }

        .control-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: #333;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .control-btn:hover {
          background: rgba(0,0,0,0.1);
          transform: scale(1.1);
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
          text-align: center;
          padding: 20px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-text {
          font-size: 18px;
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 8px;
        }

        .error-hint {
          font-size: 14px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .loading-text {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }

        .loading-progress {
          width: 200px;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .loading-progress-bar {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .loading-percentage {
          font-size: 14px;
          color: #666;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModelViewer;
