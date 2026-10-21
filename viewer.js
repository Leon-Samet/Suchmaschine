const canvas = document.querySelector("#cad-canvas");
const viewport = document.querySelector("#three-viewport");
const blueprint = document.querySelector("#sketch-container");
const status = document.querySelector("#viewer-status");
const shell = document.querySelector("#viewer-shell");
const modeButtons = [...document.querySelectorAll("[data-view-mode]")];
const fullscreenButton = document.querySelector("#viewer-fullscreen");
const exitFullscreenButton = document.querySelector("#viewer-exit-fullscreen");

let three;
let OrbitControlsClass;
let scene;
let camera;
let perspectiveCamera;
let orthographicCamera;
let renderer;
let controls;
let modelGroup;
let modelBounds;
let currentModel;
let currentMode = "3d";
let animationFrame;
let isReady = false;
let loadFailureMessage;

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
  addEdgeOverlay(mesh);
  return mesh;
}

function addEdgeOverlay(mesh) {
  const edges = new three.EdgesGeometry(mesh.geometry, 24);
  const lines = new three.LineSegments(edges, new three.LineBasicMaterial({
    color: 0x18303c,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  }));
  lines.renderOrder = 2;
  mesh.add(lines);
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
  addEdgeOverlay(mesh);
}

function addRoof(group, dims, timber, panel) {
  const halfWidth = dims.width / 2;
  const halfDepth = dims.depth / 2;
  const pitch = Math.max(5, Math.min(80, Number(currentModel.pitch) || 35)) * Math.PI / 180;
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
  const roofSlope = dims.depth * 0.015;
  const roofAt = (y) => roofHeight + (-y / dims.depth) * roofSlope;
  [-hx + 0.15, hx - 0.15].forEach((x) => {
    [-hy + 0.15, hy - 0.15].forEach((y) => {
      const postTop = roofAt(y) - 0.08;
      addBox(group, x, y, postTop / 2, 0.12, 0.12, postTop, timber);
      const braceDirection = x < 0 ? 1 : -1;
      addBeam(
        group,
        [x, y, postTop - 0.55],
        [x + braceDirection * 0.55, y, postTop - 0.02],
        0.09,
        timber,
      );
    });
  });
  [-hy, hy].forEach((y) => addBeam(group, [-hx, y, roofAt(y)], [hx, y, roofAt(y)], 0.16, timber, 0.18));
  [-hx, hx].forEach((x) => {
    addBeam(group, [x, -hy, roofAt(-hy)], [x, hy, roofAt(hy)], 0.14, timber, 0.16);
  });
  const roof = new three.Mesh(
    new three.PlaneGeometry(dims.width, dims.depth),
    createMaterial(0x78b6c8, { side: three.DoubleSide, metalness: 0.22, roughness: 0.48 }),
  );
  roof.position.z = roofHeight;
  roof.rotation.x = -Math.atan(roofSlope / dims.depth);
  roof.receiveShadow = true;
  group.add(roof);
  addEdgeOverlay(roof);
}

function addTable(group, dims, timber, panel, isChair = false) {
  const topHeight = isChair ? dims.height * 0.52 : dims.height;
  const topWidth = dims.width;
  const topDepth = dims.depth;
  const slabThickness = isChair ? 0.045 : 0.03;
  addBox(group, 0, 0, topHeight - slabThickness / 2, topWidth, topDepth, slabThickness, panel);
  const legHeight = Math.max(0.25, topHeight - slabThickness);
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

function addStairs(group, dims, model, timber, panel) {
  const count = Math.max(2, Math.min(40, Math.round(model.stepCount) || Math.round(dims.height / 0.175)));
  const riser = Math.max(0.05, Math.min(0.3, Number(model.riserHeight) / 100 || dims.height / count));
  const tread = Math.max(0.15, Math.min(0.5, Number(model.treadDepth) / 100 || Math.max(0.15, (0.63 - 2 * riser))));
  const run = Math.max(tread, Number(model.stairLength) / 100 || tread * (count - 1));
  const treadThickness = Math.max(0.035, Math.min(0.06, riser * 0.22));
  const treadRun = run / (count - 1);
  const startY = -run / 2;
  for (let index = 0; index < count - 1; index += 1) {
    const y = startY + (index + 0.5) * treadRun;
    const top = (index + 1) * (dims.height / count);
    addBox(group, 0, y, top - treadThickness / 2, dims.width, treadRun * 0.98, treadThickness, panel);
    const riserDepth = Math.max(0.035, Math.min(0.07, treadThickness));
    addBox(group, 0, startY + (index + 1) * treadRun, top - dims.height / count / 2, dims.width, riserDepth, dims.height / count, timber);
  }
  const stringerX = dims.width * 0.43;
  const handrailHeight = Math.min(1, Math.max(0.85, dims.height * 0.34));
  [-stringerX, stringerX].forEach((x) => {
    addBeam(group, [x, startY, 0.04], [x, -startY, dims.height], 0.12, timber);
    const railStart = [x, startY, handrailHeight];
    const railEnd = [x, -startY, dims.height + handrailHeight];
    addBeam(group, railStart, railEnd, 0.065, timber, 0.065);
    const postCount = Math.max(3, Math.min(8, Math.ceil(run / 0.75) + 1));
    for (let index = 0; index < postCount; index += 1) {
      const fraction = index / (postCount - 1);
      const y = startY + fraction * run;
      const stairZ = fraction * dims.height;
      addBox(group, x, y, stairZ + handrailHeight / 2, 0.055, 0.055, handrailHeight, timber);
    }
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
  const post = Math.max(0.04, Math.min(0.14, Math.min(dims.width, dims.depth) * 0.08));
  const halfWidth = dims.width / 2;
  const halfDepth = dims.depth / 2;
  addBox(group, 0, 0, 0.04, dims.width, dims.depth, 0.08, panel);
  [-halfWidth + post / 2, halfWidth - post / 2].forEach((x) => {
    [-halfDepth + post / 2, halfDepth - post / 2].forEach((y) => {
      addBox(group, x, y, dims.height / 2, post, post, dims.height, timber);
    });
  });
  addBeam(group, [-halfWidth, -halfDepth, dims.height], [halfWidth, -halfDepth, dims.height], post, timber);
  addBeam(group, [-halfWidth, halfDepth, dims.height], [halfWidth, halfDepth, dims.height], post, timber);
  addBeam(group, [-halfWidth, -halfDepth, dims.height], [-halfWidth, halfDepth, dims.height], post, timber);
  addBeam(group, [halfWidth, -halfDepth, dims.height], [halfWidth, halfDepth, dims.height], post, timber);
  addBeam(group, [-halfWidth, 0, dims.height * 0.55], [halfWidth, 0, dims.height * 0.55], post * 0.7, panel);
  addBeam(group, [-halfWidth + post, -halfDepth, post], [halfWidth - post, halfDepth, dims.height - post], post * 0.45, timber);
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
    case "stairs": addStairs(group, dims, model, timber, panel); break;
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
  modelBounds = new three.Box3().setFromObject(modelGroup);
}

function setCameraMode(mode) {
  if (!isReady || !currentModel) {
    if (mode === "blueprint") showBlueprint();
    else showBlueprint("3D-Viewer nicht verfügbar – die technische SVG-Zeichnung bleibt nutzbar.");
    return;
  }
  currentMode = mode;
  viewport.hidden = false;
  blueprint.hidden = true;
  status.hidden = true;
  camera = mode === "3d" ? perspectiveCamera : orthographicCamera;
  const center = modelBounds.getCenter(new three.Vector3());
  const size = modelBounds.getSize(new three.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.5);
  const direction = mode === "top"
    ? new three.Vector3(0, 0, 1)
    : mode === "front"
      ? new three.Vector3(0, -1, 0)
      : mode === "side"
        ? new three.Vector3(1, 0, 0)
        : new three.Vector3(1, -1, 0.72).normalize();
  const viewWidth = mode === "top" ? size.x : mode === "front" ? size.x : mode === "side" ? size.y : maxDimension;
  const viewHeight = mode === "top" ? size.y : mode === "front" ? size.z : mode === "side" ? size.z : maxDimension;
  camera.up.set(0, 0, 1);
  if (mode === "top") camera.up.set(0, 1, 0);
  if (camera.isOrthographicCamera) camera.zoom = 1;
  if (mode === "3d") {
    camera.position.copy(center).add(new three.Vector3(maxDimension * 1.8, -maxDimension * 1.8, maxDimension * 1.3));
  } else {
    const aspect = Math.max(0.25, viewport.clientWidth / Math.max(viewport.clientHeight, 1));
    const halfHeight = Math.max(viewHeight, viewWidth / aspect) * 0.62;
    orthographicCamera.left = -halfHeight * aspect;
    orthographicCamera.right = halfHeight * aspect;
    orthographicCamera.top = halfHeight;
    orthographicCamera.bottom = -halfHeight;
    orthographicCamera.near = 0.01;
    orthographicCamera.far = maxDimension * 30;
    orthographicCamera.position.copy(center).addScaledVector(direction, maxDimension * 4);
    orthographicCamera.updateProjectionMatrix();
  }
  camera.lookAt(center);
  controls?.dispose();
  controls = new OrbitControlsClass(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = mode === "3d";
  controls.enableZoom = true;
  controls.screenSpacePanning = true;
  controls.minDistance = Math.max(0.15, maxDimension * 0.08);
  controls.maxDistance = maxDimension * 20;
  controls.minZoom = 0.55;
  controls.maxZoom = 12;
  controls.target.copy(center);
  controls.addEventListener("change", animate);
  resizeRenderer();
  updateModeButtons();
  if (animationFrame === undefined) animate();
}

function resizeRenderer() {
  if (!renderer || !viewport.clientWidth || !viewport.clientHeight) return;
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  if (camera.isOrthographicCamera && currentModel && modelBounds) {
    const size = modelBounds.getSize(new three.Vector3());
    const aspect = width / height;
    const verticalSpan = currentMode === "top" ? size.y : size.z;
    const horizontalSpan = currentMode === "side" ? size.y : size.x;
    const halfHeight = Math.max(verticalSpan, horizontalSpan / aspect, 0.5) * 0.62;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
  }
  camera.updateProjectionMatrix();
  if (isReady && currentMode !== "blueprint") animate();
}

function animate() {
  if (animationFrame !== undefined) return;
  animationFrame = requestAnimationFrame(() => {
    animationFrame = undefined;
    try {
      const dampingContinues = controls.update();
      renderer.render(scene, camera);
      if (dampingContinues) animate();
    } catch (error) {
      console.error("CAD-Ansicht konnte nicht gerendert werden.", error);
      showBlueprint("3D-Rendering nicht verfügbar – die technische SVG-Zeichnung bleibt nutzbar.");
    }
  });
}

function initialize(THREE, OrbitControls) {
  three = THREE;
  OrbitControlsClass = OrbitControls;
  scene = new three.Scene();
  scene.background = new three.Color(0x101e29);
  perspectiveCamera = new three.PerspectiveCamera(42, 1, 0.01, 1000);
  orthographicCamera = new three.OrthographicCamera(-5, 5, 5, -5, 0.01, 1000);
  camera = perspectiveCamera;
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
  controls = new OrbitControlsClass(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  if ("ResizeObserver" in window) new ResizeObserver(resizeRenderer).observe(viewport);
  else window.addEventListener("resize", resizeRenderer);
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

exitFullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch (error) {
    console.error("Vollbild konnte nicht geschlossen werden.", error);
    setStatus("Vollbild konnte nicht geschlossen werden. Bitte Esc drücken.", true);
  }
});

document.addEventListener("fullscreenchange", () => {
  const fullscreen = document.fullscreenElement === shell;
  exitFullscreenButton.hidden = !fullscreen;
  fullscreenButton.textContent = fullscreen ? "Vollbild schließen" : "Skizze vergrößern";
  resizeRenderer();
});

window.addEventListener("werkfinder:cad-model", (event) => {
  currentModel = event.detail;
  blueprint.hidden = currentMode !== "blueprint";
  if (!isReady) {
    showBlueprint(loadFailureMessage ?? "Technische Zeichnung aktiv – 3D-Viewer wird geladen …");
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

currentModel = window.werkfinderCadModel;
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
  loadFailureMessage = "3D-Viewer nicht verfügbar (CDN oder WebGL) – die technische SVG-Zeichnung bleibt nutzbar.";
  showBlueprint(loadFailureMessage);
}
