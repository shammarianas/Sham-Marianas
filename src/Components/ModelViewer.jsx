import React, { useEffect, useRef, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const ModelViewer = (props) => {
  const [shadow, setShadow] = useState(2);
  const [exposure, setExposure] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const mountRef = useRef(null);
  const [isWireframeOn, setIsWireframeOn] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Use refs instead of let variables
  const sceneRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const currentModelRef = useRef();

  useEffect(() => {
    setIsLoading(true);
    setLoadProgress(0);
    setError(null);

    // Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Initialize Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current?.clientWidth / mountRef.current?.clientHeight || 1,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);

    // Initialize Renderer - UPDATED for newer Three.js
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    const width = mountRef.current?.clientWidth || window.innerWidth;
    const height = mountRef.current?.clientHeight || window.innerHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // UPDATED: Newer Three.js properties
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    rendererRef.current = renderer;

    // Initialize Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2;
    controls.enableTouch = true;
    controlsRef.current = controls;

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, shadow);
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

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // Setup DRACO Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    // Mount renderer
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Load Model Function - IMPROVED
    const loadModel = async (path) => {
      try {
        console.log("🔄 Starting model load...", path);
        
        const storage = getStorage(app);
        const modelRef = ref(storage, path);
        const url = await getDownloadURL(modelRef);
        
        console.log("📦 Model URL:", url);

        const extension = url.split('.').pop().toLowerCase().split('?')[0];
        console.log("📄 File extension:", extension);

        const manager = new THREE.LoadingManager();
        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
          const progress = (itemsLoaded / itemsTotal) * 100;
          setLoadProgress(progress);
          console.log(`📊 Loading progress: ${progress.toFixed(2)}%`);
        };

        manager.onLoad = () => {
          console.log("✅ Model loaded successfully");
          setIsLoading(false);
          setLoadProgress(100);
        };

        manager.onError = (url) => {
          console.error("❌ Error loading resource:", url);
          setError(`Failed to load resource: ${url}`);
          setIsLoading(false);
        };

        let loader;

        switch (extension) {
          case 'glb':
          case 'gltf':
            console.log("🎯 Using GLTFLoader for", extension);
            loader = new GLTFLoader(manager);
            loader.setDRACOLoader(dracoLoader);
            
            loader.load(url, 
              (gltf) => {
                console.log("✨ GLTF model loaded:", gltf);
                
                // Remove previous model
                if (currentModelRef.current) {
                  scene.remove(currentModelRef.current);
                }
                
                const model = gltf.scene;
                currentModelRef.current = model;
                
                // Setup materials and shadows
                model.traverse((node) => {
                  if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    
                    if (isWireframeOn) {
                      node.material.wireframe = true;
                    }
                    
                    if (node.material) {
                      node.material.envMapIntensity = 1;
                      if (node.material.isMeshStandardMaterial) {
                        node.material.roughness = 0.5;
                        node.material.metalness = 0.1;
                      }
                    }
                  }
                });
                
                scene.add(model);
                centerAndScaleModel(model);
                fitModelToView(model, camera, controls);
                
                console.log("🎉 Model added to scene");
              }, 
              (progress) => {
                // Progress callback
                if (progress.lengthComputable) {
                  const percent = (progress.loaded / progress.total) * 100;
                  setLoadProgress(percent);
                  console.log(`📈 Download progress: ${percent.toFixed(2)}%`);
                }
              },
              (error) => {
                console.error('❌ Error loading GLTF model:', error);
                setError(`GLTF Load Error: ${error.message}`);
                setIsLoading(false);
              }
            );
            break;

          case 'obj':
            // OBJ loader code...
            break;

          case 'stl':
            // STL loader code...
            break;

          default:
            console.error(`❌ Unsupported format: ${extension}`);
            setError(`Unsupported file format: ${extension}`);
            setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Failed to load model:', error);
        setError(`Model Load Failed: ${error.message}`);
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

    const fitModelToView = (model, camera, controls) => {
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

    // Load the model if props.model exists
    if (props.model) {
      console.log("🚀 Loading model from props:", props.model);
      loadModel(props.model);
    } else {
      console.log("⚠️ No model prop provided");
      setIsLoading(false);
    }

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate && isPlaying;
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && camera) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };
    
    animate();

    // Handle Resize
    const handleResize = () => {
      const width = mountRef.current?.clientWidth || window.innerWidth;
      const height = mountRef.current?.clientHeight || window.innerHeight;
      
      if (camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (currentModelRef.current) {
        sceneRef.current?.remove(currentModelRef.current);
      }
    };
  }, [props.model, autoRotate, isPlaying, shadow]);

  // Add error display to your JSX
  return (
    <div className={`model_showcase ${isFullscreen ? "fullscreen" : ""}`}>
      {/* Controls Panel */}
      <div className="controls">
        {/* ... your existing controls ... */}
      </div>

      {/* Model Viewer Container */}
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
            <div className="error-text">Error: {error}</div>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 30;
          color: #d00;
        }
        
        .retry-btn {
          margin-top: 10px;
          padding: 8px 16px;
          background: #d00;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        /* ... rest of your existing styles ... */
      `}</style>
    </div>
  );
};

export default ModelViewer;