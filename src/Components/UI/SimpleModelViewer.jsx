// SimpleModelViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";

const SimpleModelViewer = ({ modelUrl }) => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!modelUrl || !mountRef.current) return;

    let scene, camera, renderer, controls;

    const initThreeJS = async () => {
      try {
        // Dynamically import Three.js
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        // Camera
        camera = new THREE.PerspectiveCamera(
          38,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.set(5, 5, 5);

        // Renderer
        renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true 
        });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Simple controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1;

        // Basic lighting
        const ambientLight = new THREE.AmbientLight(0xfffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);

        // Load model from Firebase
        await loadModel(THREE, GLTFLoader, modelUrl);

        // Animation
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

      } catch (error) {
        console.error('Three.js loading failed:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    const loadModel = async (THREE, GLTFLoader, url) => {
      try {
        console.log('Loading model from:', url);
        
        // Check if it's a Firebase storage path or direct URL
        let modelUrl = url;
        
        if (!url.startsWith('http') && !url.startsWith('blob:')) {
          // It's a Firebase storage path
          const storage = getStorage(app);
          const modelRef = ref(storage, url);
          modelUrl = await getDownloadURL(modelRef);
          console.log('Firebase download URL:', modelUrl);
        }

        const loader = new GLTFLoader();
        
        loader.load(
          modelUrl,
          (gltf) => {
            console.log('Model loaded successfully');
            const model = gltf.scene;

            // Enable shadows
            model.traverse((node) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
              }
            });

            scene.add(model);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = maxDim > 0 ? 5 / maxDim : 1;
            
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            
            // Focus camera on model
            camera.lookAt(center);
            
            setIsLoading(false);
          },
          (progress) => {
            // Progress callback
            console.log('Loading progress:', progress);
          },
          (error) => {
            console.error('Error loading 3D model:', error);
            setError('Failed to load 3D model');
            setIsLoading(false);
            
            // Fallback: Show a cube
            showFallbackModel(THREE, scene);
          }
        );
      } catch (error) {
        console.error('Error in loadModel:', error);
        setError(error.message);
        setIsLoading(false);
        
        // Fallback: Show a cube
        showFallbackModel(THREE, scene);
      }
    };

    const showFallbackModel = (THREE, scene) => {
      // Create a simple cube as fallback
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x2196f3,
        transparent: true,
        opacity: 0.8
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      setIsLoading(false);
    };

    initThreeJS();

    // Cleanup
    return () => {
      if (mountRef.current && renderer?.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer?.dispose();
      controls?.dispose();
    };
  }, [modelUrl]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'black',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Loading 3D Model...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SimpleModelViewer;