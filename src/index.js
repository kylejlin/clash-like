import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1e5,
);
const renderer = new THREE.WebGLRenderer();

scene.background = new THREE.Color(0xb3e7f9);

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
document.body.appendChild(renderer.domElement);

camera.position.set(300, 300, 300);
camera.lookAt(0, 0, 0);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

const world = new THREE.Group();
scene.add(world);

for (let x = 0; x < 10; x++) {
  for (let z = 0; z < 10; z++) {
    const color = x % 2 === z % 2 ? 0xffffff : 0x000000;
    const tileMesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(16, 2, 16),
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.5,
        roughness: 0.5,
      }),
    );
    tileMesh.position.set(x * 16, 0, z * 16);
    world.add(tileMesh);
  }
}

const render = () => {
  renderer.render(scene, camera);
};

render();
