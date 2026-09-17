import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene instellen
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020); // Donkergrijze achtergrond om het model goed te zien

// 2. Camera instellen
const camera = new THREE.PerspectiveCamera(
  750,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 3);

// 3. Renderer instellen met de juiste kleurruimte (sRGB)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace; // Zorgt dat PBR/GLTF materialen de juiste kleuren hebben
document.body.appendChild(renderer.domElement);

// 4. OrbitControls toevoegen om rond het model te kunnen draaien/zoomen
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Belichting toevoegen (Essentieel voor GLTF / MeshStandardMaterial)
// Omgevingslicht voor algemene helderheid
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Hemellicht voor zachte schaduwen/nuance
/*const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
hemiLight.position.set(0, 60, 0);
scene.add(hemiLight);*/

// Richtingslicht voor diepte en highlights

const dirLightRedBack = new THREE.DirectionalLight(0xff0000, 1.5);
dirLightRedBack.position.set(0, 0, -0.2);
scene.add(dirLightRedBack);

const dirLightRedFront = new THREE.DirectionalLight(0xff0000, 1.5);
dirLightRedFront.position.set(0, 0, 0.2);
scene.add(dirLightRedFront);

const sunLight = new THREE.DirectionalLight(0xffd0d0, 54.5);
sunLight.position.set(0, 5, -5);
scene.add(sunLight);


// 6. GLTF Model Laden
const loader = new GLTFLoader();

// Vervang 'path/to/your/model.gltf' door het daadwerkelijke pad naar jouw bestand
loader.load(
  'public/church.glb',
  (gltf) => {
    const model = gltf.scene;

    // Optioneel: Centreer het model automatisch in de scene
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    console.log("center", center)

    scene.add(model);
    console.log('Model succesvol geladen!');
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

// 7. Venster schalen afhandelen
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 8. Animatieloop
var positionXStep = 0.05;
var lightRad = 0;
var lightRadStep = Math.PI / 720;
var lightDistance = 50;

function animate() {
  requestAnimationFrame(animate);
  
  sunLight.position.y = Math.sin(lightRad) * lightDistance;
  sunLight.position.z = Math.cos(lightRad) * lightDistance;
  lightRad += lightRadStep;

  controls.update(); // Noodzakelijk als enableDamping = true
  renderer.render(scene, camera);
}

animate();