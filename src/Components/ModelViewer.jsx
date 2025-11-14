import React, { useEffect, useRef, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "../firebase"; // your Firebase app config

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
// Remove this line: import hdri from "../assets/Models/illovo_beach_balcony_4k.hdr";
import model_bg from "../assets/Images/Sections/model_bg.png";

const ModelViewer = (props) => {
  const [shadow, setShadow] = useState(2);
  const [exposure, setExposure] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const mountRef = useRef(null);
  const [isWireframeOn, setIsWireframeOn] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  let renderer, camera, scene, controls, composer;
  let currentModel = null;

  useEffect(() => {
    setIsLoading(true);
    setLoadProgress(0);

    // Initialize Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Initialize Camera
    camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current?.clientWidth / mountRef.current?.clientHeight || 1,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);

    // Initialize Renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    const width = mountRef.current?.clientWidth || window.innerWidth;
    const height = mountRef.current?.clientHeight || window.innerHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;

    // Initialize Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2;

    // Touch controls for mobile
    controls.enableTouch = true;
    controls.touchRotateSpeed = 0.5;
    controls.touchZoomSpeed = 0.8;
    controls.touchPanSpeed = 0.3;

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

    // Add fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // HDRI Environment - REMOVED FIXED HDRI
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
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Load Model Function
    const loadModel = async (path) => {
      try {
        const storage = getStorage(app);
        const modelRef = ref(storage, path);
        const url = await getDownloadURL(modelRef);

        let extension = url.split('.').pop().toLowerCase().split('?')[0];
        
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
              if (currentModel) {
                scene.remove(currentModel);
              }
              
              const model = gltf.scene;
              currentModel = model;
              
              // Setup materials and shadows
              model.traverse((node) => {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                  
                  // Enable wireframe if toggled
                  if (isWireframeOn) {
                    node.material.wireframe = true;
                  }
                  
                  // Improve material quality
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
              fitModelToView(model);
            }, 
            (progress) => {
              if (progress.lengthComputable) {
                setLoadProgress((progress.loaded / progress.total) * 100);
              }
            },
            (error) => {
              console.error('Error loading GLTF model:', error);
              setIsLoading(false);
            });
            break;

          case 'obj':
            loader = new OBJLoader(manager);
            loader.load(url, (obj) => {
              if (currentModel) {
                scene.remove(currentModel);
              }
              
              currentModel = obj;
              obj.traverse((node) => {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                  if (isWireframeOn) {
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
              if (currentModel) {
                scene.remove(currentModel);
              }
              
              const material = new THREE.MeshPhongMaterial({ 
                color: 0xaaaaaa,
                specular: 0x111111,
                shininess: 200,
                wireframe: isWireframeOn
              });
              
              currentModel = new THREE.Mesh(geometry, material);
              currentModel.castShadow = true;
              currentModel.receiveShadow = true;
              
              scene.add(currentModel);
              centerAndScaleModel(currentModel);
              fitModelToView(currentModel);
            });
            break;

          default:
            console.error(`Unsupported format: ${extension}`);
            setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load model:', error);
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

    // Load the model - YAHAN PROPS.MODEL USE HO RAHA HAI JO UPLOAD COMPONENT SE AAYEGA
    if (props.model) {
      loadModel(props.model);
    }

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      controls.autoRotate = autoRotate && isPlaying;
      controls.update();
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle Resize
    const handleResize = () => {
      const width = mountRef.current?.clientWidth || window.innerWidth;
      const height = mountRef.current?.clientHeight || window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
      if (currentModel) {
        scene.remove(currentModel);
      }
    };
  }, [props.model]);

  // ... rest of your code remains exactly the same
  // Wireframe effect, Auto-rotate effect, Shadow intensity effect, Exposure effect
  // All these remain unchanged

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
      {/* Controls Panel - unchanged */}
      <div className="controls">
        <button
          className="control-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause Rotation" : "Play Rotation"}
        >
          <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
        </button>

        <button
          className="control-btn"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? "Disable Auto Rotate" : "Enable Auto Rotate"}
        >
          <i className={`fas ${autoRotate ? "fa-sync" : "fa-sync-alt"}`}></i>
        </button>

        <button
          className="control-btn"
          onClick={() => setIsWireframeOn(!isWireframeOn)}
          title="Toggle Wireframe"
        >
          <i className={`fas ${isWireframeOn ? "fa-cube" : "fa-th"}`}></i>
        </button>

        <div className="control-group">
          <span className="control-label">Shadow</span>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={shadow}
            onChange={(e) => setShadow(parseFloat(e.target.value))}
            className="control-slider"
          />
        </div>

        <div className="control-group">
          <span className="control-label">Exposure</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={exposure}
            onChange={(e) => setExposure(parseFloat(e.target.value))}
            className="control-slider"
          />
        </div>

        <button
          className="control-btn fullscreen-btn"
          onClick={handleFullscreen}
          title="Toggle Fullscreen"
        >
          <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
        </button>
      </div>

      {/* Model Viewer Container - unchanged */}
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
      </div>

      {/* CSS styles - unchanged */}
      <style jsx>{`
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
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .control-label {
          font-size: 12px;
          font-weight: 600;
          color: #333;
          min-width: 60px;
        }
        
        .control-slider {
          width: 80px;
          height: 4px;
          border-radius: 2px;
          background: #ddd;
          outline: none;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .control-slider:hover {
          opacity: 1;
        }
        
        .control-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
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
        
        @media (max-width: 768px) {
          .controls {
            flex-wrap: wrap;
            justify-content: center;
            bottom: 10px;
            padding: 8px 15px;
            gap: 10px;
          }
          
          .control-group {
            flex: 1;
            min-width: 100px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelViewer;