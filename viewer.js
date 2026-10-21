const canvas = document.querySelector("#cad-canvas");
const viewport = document.querySelector("#three-viewport");
const blueprint = document.querySelector("#sketch-container");
const status = document.querySelector("#viewer-status");
const shell = document.querySelector("#viewer-shell");
const modeButtons = [...document.querySelectorAll("[data-view-mode]")];
const fullscreenButton = document.querySelector("#viewer-fullscreen");

let three;
let scene;
let camera;
let renderer;
let controls;
let modelGroup;
let currentModel;
let currentMode = "3d";
let animationFrame;
let isReady = false;

function showBlueprint(message) {
  viewport.hidden = true;
  blueprint.hidden = false;
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }
  if (message) {
    status.textContent = message;
  }
  status.hidden = !message;
  status.classList.toggle("is-error", Boolean(message));
  currentMode = "blueprint";
  updateModeButtons();
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    const selected = button.dataset.viewMode === currentMode;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("is-error", isError);
  status.hidden = false;
}

function dimensionsInMeters(model) {
  return {
    width: Math.max(0.1, Math.min(30, model.width / 100)),
    height: Math.max(0.1, Math.min(30, model.height / 100)),
    depth: Math.max(0.1, Math.min(30, model.depth / 100)),
  };
}

function createMaterial(color, options = {}) {
  return new three.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.04,
    ...options,
  });
}

function addBox(group, x, y, z, width, depth, height, material) {
  const geometry = new three.BoxGeometry(width, depth, height);
  const mesh = new three.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addBeam(group, start, end, thickness, material, width = thickness) {
  const from = new three.Vector3(...start);
  const to = new three.Vector3(...end);
  const direction = new three.Vector3().subVectors(to, from);
  const length = direction.length();
  if (length <= 0) return;
  const mesh = new three.Mesh(
    new three.BoxGeometry(length, width, thickness),
    material,
  );
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new three.Vector3(1, 0, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function addRoof(group, dims, timber, panel) {
  const halfWidth = dims.width / 2;
  const halfDepth = dims.depth / 2;
  const pitch = Math.max(15, Math.min(60, Number(currentModel.pitch) || 35)) * Math.PI / 180;
  const rise = halfWidth * Math.tan(pitch);
  const eaves = Math.max(1.8, dims.height - rise);
  const ridge = eaves + rise;
  const rafters = Math.max(3, Math.min(7, Math.round(dims.depth / 1.4)));
  const positions = Array.from({ length: rafters }, (_, index) => (
    rafters === 1 ? 0 : -halfDepth + index * (dims.depth / (rafters - 1))
  ));

  positions.forEach((y) => {
    addBeam(group, [-halfWidth, y, eaves], [0, y, ridge], 0.14, timber);
    addBeam(group, [0, y, ridge], [halfWidth, y, eaves], 0.14, timber);
    addBeam(group, [-halfWidth, y, eaves], [halfWidth, y, eaves], 0.12, timber);
  });
  addBeam(group, [0, -halfDepth, ridge], [0, halfDepth, ridge], 0.2, timber, 0.22);
  [-0.52, 0.52].forEach((fraction) => {
    const x = halfWidth * fraction;
    const z = ridge - Math.abs(x) * Math.tan(pitch);
    addBeam(group, [x, -halfDepth, z], [x, halfDepth, z], 0.13, timber, 0.16);
  });
  addBeam(group, [-halfWidth * 0.72, 0, eaves + rise * 0.4], [halfWidth * 0.72, 0, eaves + rise * 0.4], 0.1, timber);
  [-halfWidth, halfWidth].forEach((x) => {
    addBeam(group, [x, -halfDepth, 0], [x, halfDepth, 0], 0.15, timber, 0.15);
    [-halfDepth, halfDepth].forEach((y) => addBox(group, x, y, eaves / 2, 0.14, 0.14, eaves, timber));
  });
  addBeam(group, [-halfWidth, 0, eaves + 0.04], [0, 0, ridge + 0.04], 0.08, panel, dims.depth * 1.04);
  addBeam(group, [0, 0, ridge + 0.04], [halfWidth, 0, eaves + 0.04], 0.08, panel, dims.depth * 1.04);
}

function addCarport(group, dims, timber, panel) {
  const hx = dims.width / 2;
  const hy = dims.depth / 2;
  const roofHeight = Math.max(2, dims.height);
  [-hx + 0.15, hx - 0.15].forEach((x) => {
    [-hy + 0.15, hy - 0.15].forEach((y) => addBox(group, x, y, roofHeight / 2, 0.16, 0.16, roofHeight, timber));
  });
  addBeam(group, [-hx, -hy, roofHeight], [hx, -hy, roofHeight], 0.18, timber, 0.18);
  addBeam(group, [-hx, hy, roofHeight], [hx, hy, roofHeight], 0.18, timber, 0.18);
  addBeam(group, [-hx, -hy, roofHeight], [-hx, hy, roofHeight], 0.15, timber, 0.15);
  addBeam(group, [hx, -hy, roofHeight], [hx, hy, roofHeight], 0.15, timber, 0.15);
  addBox(group, 0, 0, roofHeight + 0.08, dims.width, dims.depth, 0.16, panel);
}

function addTable(group, dims, timber, panel, isChair = false) {
  const topHeight = isChair ? dims.height * 0.52 : dims.height;
  const topWidth = isChair ? dims.width : dims.width;
  const topDepth = dims.depth;
  addBox(group, 0, 0, topHeight, topWidth, topDepth, 0.08, panel);
  const legHeight = Math.max(0.25, topHeight - 0.04);
  const legWidth = Math.max(0.045, Math.min(0.1, topWidth * 0.07));
  [-1, 1].forEach((xSign) => [-1, 1].forEach((ySign) => {
    addBox(group, xSign * (topWidth / 2 - legWidth), ySign * (topDepth / 2 - legWidth), legHeight / 2, legWidth, legWidth, legHeight, timber);
  }));
  const apronZ = topHeight - Math.min(0.18, topHeight * 0.18);
  addBeam(group, [-topWidth * 0.42, -topDepth * 0.38, apronZ], [topWidth * 0.42, -topDepth * 0.38, apronZ], 0.07, timber);
  addBeam(group, [-topWidth * 0.42, topDepth * 0.38, apronZ], [topWidth * 0.42, topDepth * 0.38, apronZ], 0.07, timber);
  if (isChair) {
    addBeam(group, [-topWidth / 2, topDepth / 2 - 0.04, topHeight], [topWidth / 2, topDepth / 2 - 0.04, topHeight + dims.height * 0.48], 0.07, timber, 0.08);
  }
}

function addShelving(group, dims, timber, panel, cabinet = false) {
  const hx = dims.width / 2;
  const hy = dims.depth / 2;
  const post = Math.max(0.035, Math.min(0.075, dims.width * 0.035));
  const shelves = 4;
  [-hx + post / 2, hx - post / 2].forEach((x) => {
    [-hy + post / 2, hy - post / 2].forEach((y) => addBox(group, x, y, dims.height / 2, post, post, dims.height, timber));
  });
  for (let index = 0; index <= shelves; index += 1) {
    const z = 0.05 + index * ((dims.height - 0.1) / shelves);
    addBox(group, 0, 0, z, dims.width, dims.depth, 0.045, panel);
  }
  if (cabinet) {
    addBox(group, 0, hy - 0.015, dims.height / 2, dims.width * 0.96, 0.03, dims.height * 0.96, panel);
    addBox(group, -hx * 0.49, -hy - 0.01, dims.height / 2, dims.width * 0.48, 0.035, dims.height * 0.94, panel);
    addBox(group, hx * 0.49, -hy - 0.01, dims.height / 2, dims.width * 0.48, 0.035, dims.height * 0.94, panel);
  }
}

function addStairs(group, dims, timber, panel) {
  const count = Math.max(5, Math.min(18, Math.round(dims.height / 0.18)));
  const rise = dims.height / count;
  const run = dims.depth / count;
  for (let index = 0; index < count; index += 1) {
    const z = rise * (index + 0.5);
    const y = -dims.depth / 2 + run * (index + 0.5);
    addBox(group, 0, y, z, dims.width, run * 1.04, Math.max(0.035, rise * 0.18), panel);
  }
  [-dims.width * 0.43, dims.width * 0.43].forEach((x) => {
    addBeam(group, [x, -dims.depth / 2, 0], [x, dims.depth / 2, dims.height], 0.1, timber);
  });
}

function addWall(group, dims, timber, panel) {
  const thickness = Math.max(0.08, dims.depth);
  const post = Math.min(0.06, Math.max(0.035, dims.width / 60));
  addBox(group, 0, 0, dims.height / 2, dims.width, thickness, dims.height, panel);
  const count = Math.max(3, Math.min(14, Math.ceil(dims.width / 0.6)));
  for (let index = 0; index <= count; index += 1) {
    const x = -dims.width / 2 + index * (dims.width / count);
    addBox(group, x, -thickness / 2, dims.height / 2, post, post, dims.height, timber);
  }
  [0.15, 0.5, 0.85].forEach((fraction) => {
    addBeam(group, [-dims.width / 2, -thickness / 2, dims.height * fraction], [dims.width / 2, -thickness / 2, dims.height * fraction], post, timber);
  });
}

function addBed(group, dims, timber, panel) {
  const frameHeight = Math.min(0.45, dims.height);
  const rail = 0.07;
  addBox(group, 0, 0, frameHeight, dims.width, dims.depth, 0.09, panel);
  [-1, 1].forEach((xSign) => {
    addBox(group, xSign * (dims.width / 2 - rail / 2), 0, frameHeight / 2, rail, dims.depth, frameHeight, timber);
  });
  [-1, 1].forEach((ySign) => {
    addBox(group, 0, ySign * (dims.depth / 2 - rail / 2), frameHeight / 2, dims.width, rail, frameHeight, timber);
  });
  const slatCount = Math.max(8, Math.min(24, Math.round(dims.depth / 0.16)));
  for (let index = 0; index < slatCount; index += 1) {
    const y = -dims.depth / 2 + (index + 0.5) * (dims.depth / slatCount);
    addBox(group, 0, y, frameHeight + 0.03, dims.width * 0.9, 0.025, 0.035, panel);
  }
  addBox(group, 0, dims.depth / 2 - rail / 2, frameHeight + 0.25, dims.width, rail, 0.5, timber);
  addBeam(group, [0, -dims.depth / 2, frameHeight * 0.72], [0, dims.depth / 2, frameHeight * 0.72], 0.08, timber, 0.08);
}

function addGardenhouse(group, dims, timber, panel) {
  const eaves = dims.height * 0.78;
  const roofRise = dims.height * 0.22;
  addBox(group, 0, 0, eaves / 2, dims.width, dims.depth, eaves, panel);
  [-dims.width / 2, dims.width / 2].forEach((x) => {
    addBeam(group, [x, -dims.depth / 2, eaves], [x, dims.depth / 2, eaves], 0.1, timber);
    addBeam(group, [x, -dims.depth / 2, eaves], [x, 0, eaves + roofRise], 0.1, timber);
    addBeam(group, [x, 0, eaves + roofRise], [x, dims.depth / 2, eaves], 0.1, timber);
  });
  addBeam(group, [-dims.width / 2, 0, eaves + roofRise], [dims.width / 2, 0, eaves + roofRise], 0.12, timber);
  addBeam(group, [-dims.width / 2, 0, eaves + 0.04], [0, 0, eaves + roofRise + 0.04], 0.08, panel, dims.depth * 1.04);
  addBeam(group, [0, 0, eaves + roofRise + 0.04], [dims.width / 2, 0, eaves + 0.04], 0.08, panel, dims.depth * 1.04);
  addBox(group, 0, -dims.depth / 2 - 0.02, eaves * 0.46, dims.width * 0.28, 0.05, eaves * 0.9, timber);
}

function addFence(group, dims, timber, panel) {
  const postWidth = Math.max(0.07, Math.min(0.13, dims.depth));
  const postCount = Math.max(2, Math.min(8, Math.round(dims.width / 1.8) + 1));
  for (let index = 0; index < postCount; index += 1) {
    const x = -dims.width / 2 + index * (dims.width / (postCount - 1));
    addBox(group, x, 0, dims.height / 2, postWidth, postWidth, dims.height, timber);
  }
  [0.28, 0.72].forEach((fraction) => {
    addBeam(group, [-dims.width / 2, 0, dims.height * fraction], [dims.width / 2, 0, dims.height * fraction], postWidth * 0.65, timber);
  });
  const slatCount = Math.max(7, Math.min(34, Math.round(dims.width / 0.16)));
  for (let index = 0; index < slatCount; index += 1) {
    const x = -dims.width / 2 + (index + 0.5) * (dims.width / slatCount);
    addBox(group, x, -dims.depth * 0.15, dims.height / 2, dims.width / slatCount * 0.58, Math.max(0.025, dims.depth * 0.55), dims.height * 0.94, panel);
  }
}

function addBeamModel(group, dims, timber) {
  addBox(group, 0, 0, dims.height * 1.5, dims.width, dims.depth, dims.height, timber);
  const supportWidth = Math.max(0.08, Math.min(0.22, dims.width * 0.08));
  [-1, 1].forEach((side) => {
    addBox(group, side * dims.width * 0.42, 0, dims.height * 0.5, supportWidth, dims.depth * 1.3, dims.height, createMaterial(0x78b6c8));
  });
}

function addGeneric(group, dims, timber, panel) {
  const edges = new three.EdgesGeometry(new three.BoxGeometry(dims.width, dims.depth, dims.height));
  const wire = new three.LineSegments(edges, new three.LineBasicMaterial({ color: 0x8ac6db }));
  wire.position.z = dims.height / 2;
  group.add(wire);
  addBox(group, 0, 0, 0.035, dims.width, dims.depth, 0.07, panel);
  addBeam(group, [-dims.width / 2, -dims.depth / 2, 0.1], [dims.width / 2, dims.depth / 2, dims.height * 0.9], 0.045, timber);
}

function makeModel(model) {
  const group = new three.Group();
  const dims = dimensionsInMeters(model);
  const timber = createMaterial(0xc78c50);
  const panel = createMaterial(0x78b6c8, { metalness: 0.12, roughness: 0.55 });
  switch (model.type) {
    case "roof": addRoof(group, dims, timber, panel); break;
    case "carport": addCarport(group, dims, timber, panel); break;
    case "table": addTable(group, dims, timber, panel); break;
    case "chair": addTable(group, dims, timber, panel, true); break;
    case "shelf": addShelving(group, dims, timber, panel); break;
    case "cabinet": addShelving(group, dims, timber, panel, true); break;
    case "stairs": addStairs(group, dims, timber, panel); break;
    case "wall": addWall(group, dims, timber, panel); break;
    case "gardenhouse": addGardenhouse(group, dims, timber, panel); break;
    case "fence": addFence(group, dims, timber, panel); break;
    case "bed": addBed(group, dims, timber, panel); break;
    case "beam": addBeamModel(group, dims, timber); break;
    default: addGeneric(group, dims, timber, panel);
  }
  return { group, dims };
}

function frameModel(model) {
  if (modelGroup) {
    scene.remove(modelGroup);
    modelGroup.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
  }
  const result = makeModel(model);
  modelGroup = result.group;
  modelGroup.position.z = -result.dims.height / 2;
  scene.add(modelGroup);
  const maxDimension = Math.max(result.dims.width, result.dims.height, result.dims.depth, 1);
  const distance = maxDimension * 2.25;
  controls.target.set(0, 0, 0);
  camera.position.set(distance, -distance, distance * 0.8);
  camera.up.set(0, 0, 1);
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.update();
}

function setCameraMode(mode) {
  if (!isReady || !currentModel) {
    if (mode === "blueprint") showBlueprint();
    else showBlueprint("3D-Viewer nicht verfügbar – die technische SVG-Zeichnung bleibt nutzbar.");
    return;
  }
  currentMode = mode;
  const { width, height, depth } = dimensionsInMeters(currentModel);
  const distance = Math.max(width, height, depth, 1) * 2.5;
  const target = controls.target;
  camera.up.set(0, 0, 1);
  if (mode === "top") {
    camera.up.set(0, 1, 0);
    camera.position.set(target.x, target.y, target.z + distance);
  } else if (mode === "front") {
    camera.position.set(target.x, target.y - distance, target.z);
  } else if (mode === "side") {
    camera.position.set(target.x + distance, target.y, target.z);
  } else {
    const maxDimension = Math.max(width, height, depth, 1);
    camera.position.set(target.x + maxDimension * 1.8, target.y - maxDimension * 1.8, target.z + maxDimension * 1.35);
  }
  camera.lookAt(target);
  controls.update();
  viewport.hidden = false;
  blueprint.hidden = true;
  status.hidden = true;
  updateModeButtons();
  if (animationFrame === undefined) animate();
}

function resizeRenderer() {
  if (!renderer || !viewport.clientWidth || !viewport.clientHeight) return;
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  animationFrame = requestAnimationFrame(animate);
  try {
    controls.update();
    renderer.render(scene, camera);
  } catch (error) {
    cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
    console.error("CAD-Ansicht konnte nicht gerendert werden.", error);
    showBlueprint("3D-Rendering nicht verfügbar – die technische SVG-Zeichnung bleibt nutzbar.");
  }
}

function initialize(THREE, OrbitControls) {
  three = THREE;
  scene = new three.Scene();
  scene.background = new three.Color(0x101e29);
  camera = new three.PerspectiveCamera(42, 1, 0.01, 1000);
  renderer = new three.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = three.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = three.PCFSoftShadowMap;
  scene.add(new three.AmbientLight(0xffffff, 2.1));
  const keyLight = new three.DirectionalLight(0xfff0d8, 3.2);
  keyLight.position.set(-8, -10, 16);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const fillLight = new three.DirectionalLight(0x8fc9e8, 1.2);
  fillLight.position.set(8, 8, 10);
  scene.add(fillLight);
  const grid = new three.GridHelper(30, 30, 0x4b7484, 0x29404b);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.02;
  scene.add(grid);
  const axes = new three.AxesHelper(1.5);
  scene.add(axes);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.screenSpacePanning = true;
  controls.minDistance = 0.2;
  controls.maxDistance = 100;
  if ("ResizeObserver" in window) new ResizeObserver(resizeRenderer).observe(viewport);
  else window.addEventListener("resize", resizeRenderer);
  window.addEventListener("resize", resizeRenderer);
  isReady = true;
  resizeRenderer();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.viewMode;
    if (mode === "blueprint") {
      showBlueprint();
      return;
    }
    setCameraMode(mode);
  });
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  } catch (error) {
    console.error("Vollbild konnte nicht geöffnet werden.", error);
    setStatus("Vollbild ist in diesem Browser oder Kontext nicht verfügbar.", true);
  }
});

window.addEventListener("werkfinder:cad-model", (event) => {
  currentModel = event.detail;
  blueprint.hidden = currentMode !== "blueprint";
  if (!isReady) {
    setStatus("Technische Zeichnung aktiv – 3D-Viewer wird geladen …");
    return;
  }
  try {
    frameModel(currentModel);
    if (currentMode === "blueprint") showBlueprint();
    else {
      setCameraMode(currentMode);
      setStatus(`${currentModel.title} · 3D-Modell bereit`);
      status.classList.remove("is-error");
    }
  } catch (error) {
    console.error("CAD-Modell konnte nicht erstellt werden.", error);
    showBlueprint("Das 3D-Modell konnte nicht erstellt werden – die technische SVG-Zeichnung bleibt nutzbar.");
  }
});

try {
  const [THREE, controlsModule] = await Promise.all([
    import("three"),
    import("three/addons/controls/OrbitControls.js"),
  ]);
  initialize(THREE, controlsModule.OrbitControls);
  if (currentModel) {
    frameModel(currentModel);
    setCameraMode("3d");
    setStatus(`${currentModel.title} · 3D-Modell bereit`);
  }
} catch (error) {
  console.error("Three.js oder WebGL ist nicht verfügbar.", error);
  showBlueprint("3D-Viewer nicht verfügbar (CDN oder WebGL) – die technische SVG-Zeichnung bleibt nutzbar.");
}
