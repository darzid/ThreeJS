import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function renderScene(settings) {
  // 1. Scene instellen
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(settings.sceneBackground); // Donkergrijze achtergrond om het model goed te zien
  
  // 2. Camera instellen
  const camera = new THREE.PerspectiveCamera(
    750,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.0, 4);
  
  // 3. Renderer instellen met de juiste kleurruimte (sRGB)
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Zorgt dat PBR/GLTF materialen de juiste kleuren hebben
  document.body.appendChild(renderer.domElement);
  
  // 4. OrbitControls toevoegen om rond het model te kunnen draaien/zoomen
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  
  // 7. Venster schalen afhandelen
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  
  // 5. Loader
  
  const sunLight = createSunlight();

  const loader = new GLTFLoader();
  function loadModels() {
    settings.models.forEach(modelInfo => loadModel(modelInfo));
    createLights();
    animate();
  }
  
  function loadModel(modelInfo) {
    loader.load(
      modelInfo.path,
      (gltf) => {
        const model = gltf.scene;
        model.scale.x = model.scale.x * modelInfo.scale;
        model.scale.y = model.scale.y * modelInfo.scale;
        model.scale.z = model.scale.z * modelInfo.scale;
        
        let box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.x += modelInfo.position.x;
        model.position.y += modelInfo.position.y;
        model.position.z += modelInfo.position.z;
    
        scene.add(model);
        console.log('Model succesvol geladen!', model);
        return;
      },
      (xhr) => {
        // Voortgang in console
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          console.log(`Laden: ${Math.round(percentComplete)}%`);
        }
      },
      (error) => {
        console.error('Er is een fout opgetreden bij het laden van het model:', error);
      }
    );
  }
  
  loadModels();
  
  function createSunlight() {
    var sunLight = new THREE.DirectionalLight(0xffd0d0, settings.sunStrength);
    sunLight.position.set(settings.sunDistance / 5, settings.sunDistance, settings.sunDistance);
    scene.add(sunLight);
    
    return sunLight;
  }
  
  function createLights() {
    // 6. Belichting toevoegen (Essentieel voor GLTF / MeshStandardMaterial)
    // Omgevingslicht voor algemene helderheid
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    // Hemellicht voor zachte schaduwen/nuance
    /*const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);*/
    
    // Richtingslicht voor diepte en highlights
    
    const dirLightRedBack = new THREE.DirectionalLight(settings.shadowColor, 1.5);
    dirLightRedBack.position.set(0, 0, -0.2);
    scene.add(dirLightRedBack);
    
    const dirLightRedFront = new THREE.DirectionalLight(settings.shadowColor, 1.5);
    dirLightRedFront.position.set(0, 0, 0.2);
    scene.add(dirLightRedFront);
  }
  
  // 8. Animatieloop
  var lightRad = 0;
  var lightRadStep = Math.PI / (360 * settings.sunSpeed);
  
  function animate() {
    requestAnimationFrame(animate);
    
    sunLight.position.x = -Math.cos(lightRad) * (settings.sunDistance / 5)
    sunLight.position.y = Math.sin(lightRad) * settings.sunDistance;
    sunLight.position.z = Math.cos(lightRad) * settings.sunDistance;
    lightRad += lightRadStep;
  
    controls.update(); // Noodzakelijk als enableDamping = true
    renderer.render(scene, camera);
  }
}
  
const sceneSettings = {
  models: [
    {
      path: 'public/treehouse.glb',
      position: {
        x: 0,
        y: 0.09,
        z: -0.65
      },
      scale: 0.5,
    },
    {
      path: 'public/church.glb',
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: 1
    }
  ],
  sceneBackground: 0x202020,
  shadowColor: 0xff80f0,
  sunStrength: 55,
  sunDistance: 50,
  sunSpeed: 2
}

renderScene(sceneSettings);