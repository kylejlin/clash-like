import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  1,
  1e5,
);
const renderer = new THREE.WebGLRenderer();

const render = () => {
  renderer.render(scene, camera);
};

scene.background = new THREE.Color(0xb3e7f9);

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
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

const hitbox = new THREE.Mesh(
  new THREE.BoxBufferGeometry(
    1e9,
    2,
    1e9,
  ),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);
hitbox.position.set(0, 0, 0);
hitbox.material.transparent = true;
hitbox.material.opacity = 0;
world.add(hitbox);

render();

const clientToNDC = (x, y) => [
  2 * x / window.innerWidth - 1,
  -(2 * y / window.innerHeight - 1),
];

const lastTouches = {};
const updateLastTouches = (touchList) => {
  Array.from(touchList).forEach((touch) => {
    const [x, y] = clientToNDC(touch.clientX, touch.clientY);
    lastTouches[touch.identifier] = [x, y];
  });
};

const handlePan = (touches) => {
  const [x, y] = clientToNDC(touches[0].clientX, touches[0].clientY);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const hits = raycaster.intersectObject(hitbox);
  if (hits.length === 0) {
    return;
  }
  const [{ point }] = hits;
  const [oldX, oldY] = lastTouches[touches[0].identifier];
  raycaster.setFromCamera(new THREE.Vector2(oldX, oldY), camera);
  const oldHits = raycaster.intersectObject(hitbox);
  if (oldHits.length === 0) {
    return;
  }
  const [{ point: oldPoint }] = oldHits;
  const delta = point.clone().sub(oldPoint);
  delta.y = 0;
  world.position.add(delta);
};

const handleZoom = (touches) => {
  const raycaster = new THREE.Raycaster();
  const [x0, y0] = clientToNDC(touches[0].clientX, touches[0].clientY);
  raycaster.setFromCamera(new THREE.Vector2(x0, y0), camera);
  const hits0 = raycaster.intersectObject(hitbox);
  if (hits0.length === 0) {
    return;
  }
  const [{ point: p0 }] = hits0;
  const [ox0, oy0] = lastTouches[touches[0].identifier];
  raycaster.setFromCamera(new THREE.Vector2(ox0, oy0), camera);
  const oldHits0 = raycaster.intersectObject(hitbox);
  if (oldHits0.length === 0) {
    return;
  }
  const [{ point: op0 }] = oldHits0;
  p0.y = 0;
  op0.y = 0;
  const [x1, y1] = clientToNDC(touches[1].clientX, touches[1].clientY);
  raycaster.setFromCamera(new THREE.Vector2(x1, y1), camera);
  const hits1 = raycaster.intersectObject(hitbox);
  if (hits1.length === 0) {
    return;
  }
  const [{ point: p1 }] = hits1;
  const [ox1, oy1] = lastTouches[touches[1].identifier];
  raycaster.setFromCamera(new THREE.Vector2(ox1, oy1), camera);
  const oldHits1 = raycaster.intersectObject(hitbox);
  if (oldHits1.length === 0) {
    return;
  }
  const [{ point: op1 }] = oldHits1;
  p1.y = 0;
  op1.y = 0;
  const dist = p0.clone().sub(p1).length();
  const oldDist = op0.clone().sub(op1).length();
  const scale = dist / oldDist;

  const newMp = p0.clone().add(p1).multiplyScalar(0.5);
  const oldMp = op0.clone().add(op1).multiplyScalar(0.5);
  const offset = oldMp.clone().sub(world.position).multiplyScalar(scale);
  const newMpScaled = world.position.clone().add(offset);
  const displacement = newMpScaled.clone().sub(newMp);

  world.scale.multiplyScalar(scale);
  world.position.sub(displacement);
};

window.addEventListener('touchstart', (e) => {
  updateLastTouches(e.changedTouches);
});
window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const { touches, changedTouches } = e;
  if (touches.length === 1) {
    handlePan(touches);
  } else if (touches.length === 2) {
    handleZoom(touches);
  }
  updateLastTouches(changedTouches);
  render();
}, { passive: false });
window.addEventListener('touchend', (e) => {
  Array.from(e.changedTouches).forEach((touch) => {
    delete lastTouches[touch.identifier];
  });
});
