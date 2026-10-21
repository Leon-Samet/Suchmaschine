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
let resizeObserver;
let resizeListenerAttached = false;
let currentMode = "3d";
let preferredMode = "3d";
let automaticBlueprint = false;
let animationFrame;
let isReady = false;
let loadFailureMessage;

function showBlueprint(message) {
  viewport.hidden = true;
  blueprint.hidden = false;
  controls?.dispose();
  controls = undefined;
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

function disposeObjectTree(root) {
  root?.traverse((object) => {
    object.geometry?.dispose();
    if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
    else object.material?.dispose();
  });
}

function releaseViewer() {
  controls?.dispose();
  controls = undefined;
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  if (resizeListenerAttached) {
    window.removeEventListener("resize", resizeRenderer);
    resizeListenerAttached = false;
  }
  if (modelGroup) {
    scene?.remove(modelGroup);
    disposeObjectTree(modelGroup);
    modelGroup = undefined;
  }
  renderer?.dispose();
  renderer = undefined;
  isReady = false;
}

function dimensionsInMeters(model) {
  const meters = (value) => {
    const centimeters = Number(value);
    if (!Number.isFinite(centimeters) || centimeters <= 0) return 1;
    return Math.max(0.1, Math.min(30, centimeters / 100));
  };
  return {
    width: meters(model.width),
    height: meters(model.height),
    depth: meters(model.depth),
  };
}

function normalizeModel(model) {
  if (!model || typeof model !== "object") throw new TypeError("CAD-Modell fehlt.");
  const dimensions = ["width", "height", "depth"];
  const normalized = { ...model };
  for (const key of dimensions) {
    const value = Number(model[key]);
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`Ungültiges CAD-Maß: ${key}.`);
    }
    if (value < 1 || value > 3000) {
      throw new RangeError(`CAD-Maß außerhalb des unterstützten Darstellungsbereichs: ${key}.`);
    }
    normalized[key] = value;
  }
  normalized.title = typeof model.title === "string" && model.title.trim()
    ? model.title.trim().slice(0, 120)
    : "Werkstück · Konzeptmodell";
  normalized.pitch = Number.isFinite(Number(model.pitch)) ? Number(model.pitch) : 35;
  normalized.stepCount = Number.isInteger(Number(model.stepCount))
    ? Math.min(40, Math.max(2, Number(model.stepCount)))
    : undefined;
  normalized.riserHeight = Number.isFinite(Number(model.riserHeight)) && Number(model.riserHeight) > 0
    ? Number(model.riserHeight)
    : undefined;
  normalized.treadDepth = Number.isFinite(Number(model.treadDepth)) && Number(model.treadDepth) > 0
    ? Number(model.treadDepth)
    : undefined;
  normalized.stairLength = Number.isFinite(Number(model.stairLength)) && Number(model.stairLength) > 0
    ? Number(model.stairLength)
    : undefined;
  return normalized;
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
  const pitch = Math.max(1, Math.min(80, Number(currentModel.pitch) || 35)) * Math.PI / 180;
  const rise = halfWidth * Math.tan(pitch);
  const eaves = Math.max(0.5, dims.height - rise);
  const ridge = eaves + rise;
  const spacing = Math.max(0.4, Math.min(1.2, Number(currentModel.rafterSpacing) / 100 || 0.7));
  const rafters = Math.max(3, Math.min(30, Math.ceil(dims.depth / spacing) + 1));
  const positions = Array.from({ length: rafters }, (_, index) => (
    rafters === 1 ? 0 : -halfDepth + index * (dims.depth / (rafters - 1))
  ));

  positions.forEach((y) => {
    addBeam(group, [-halfWidth, y, eaves], [0, y, ridge], 0.08, timber, 0.18);
    addBeam(group, [0, y, ridge], [halfWidth, y, eaves], 0.08, timber, 0.18);
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

function addTable(group, dims, model, timber, panel, isChair = false) {
  const topHeight = isChair ? dims.height * 0.52 : dims.height;
  const topWidth = dims.width;
  const topDepth = dims.depth;
  const slabThickness = isChair ? 0.045 : Math.max(0.02, Math.min(0.08, Number(model.panelThickness) / 100 || 0.03));
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
    addBox(group, 0, startY + index * treadRun, top - dims.height / count / 2, dims.width, riserDepth, dims.height / count, timber);
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

function addKitchen(group, dims, timber, panel) {
  const counterHeight = Math.min(0.91, dims.height * 0.48);
  const plinthHeight = Math.min(0.1, counterHeight * 0.12);
  const worktopThickness = 0.04;
  const carcassHeight = counterHeight - plinthHeight - worktopThickness;
  const moduleCount = Math.max(2, Math.min(8, Math.round(dims.width / 0.6)));
  const moduleWidth = dims.width / moduleCount;
  const frontY = -dims.depth / 2 - 0.012;
  const cabinetColor = createMaterial(0xd7ded5, { roughness: 0.62 });
  const hardware = createMaterial(0x64777a, { metalness: 0.72, roughness: 0.28 });
  const metal = createMaterial(0xb6c4c4, { metalness: 0.72, roughness: 0.3 });
  const darkGlass = createMaterial(0x202b31, { metalness: 0.38, roughness: 0.25 });

  addBox(group, 0, 0, plinthHeight / 2, dims.width * 0.98, dims.depth * 0.92, plinthHeight, timber);
  for (let index = 0; index < moduleCount; index += 1) {
    const x = -dims.width / 2 + (index + 0.5) * moduleWidth;
    addBox(group, x, 0, plinthHeight + carcassHeight / 2, moduleWidth - 0.012, dims.depth * 0.92, carcassHeight, cabinetColor);
    addBox(group, x, frontY, plinthHeight + carcassHeight * 0.46, moduleWidth - 0.025, 0.025, carcassHeight * 0.78, panel);
    const drawerHeight = carcassHeight * 0.22;
    for (let drawer = 0; drawer < 3; drawer += 1) {
      const z = plinthHeight + carcassHeight * (0.18 + drawer * 0.28);
      addBox(group, x, frontY - 0.018, z, moduleWidth - 0.045, 0.018, drawerHeight, cabinetColor);
      addBox(group, x, frontY - 0.036, z, moduleWidth * 0.28, 0.012, 0.012, hardware);
    }
  }
  addBox(group, 0, 0, counterHeight - worktopThickness / 2, dims.width * 1.02, dims.depth * 1.02, worktopThickness, timber);

  const sinkX = -dims.width * 0.19;
  addBox(group, sinkX, -dims.depth * 0.03, counterHeight + 0.002, Math.min(0.46, dims.width * 0.22), dims.depth * 0.58, 0.012, metal);
  addBox(group, sinkX, -dims.depth * 0.03, counterHeight - 0.07, Math.min(0.39, dims.width * 0.19), dims.depth * 0.5, 0.13, metal);
  addBeam(group, [sinkX + 0.16, -dims.depth * 0.08, counterHeight + 0.02], [sinkX + 0.16, -dims.depth * 0.08, counterHeight + 0.22], 0.018, hardware);
  addBeam(group, [sinkX + 0.16, -dims.depth * 0.08, counterHeight + 0.22], [sinkX + 0.04, -dims.depth * 0.08, counterHeight + 0.22], 0.018, hardware);

  const hobX = dims.width * 0.25;
  addBox(group, hobX, 0, counterHeight + 0.008, Math.min(0.58, dims.width * 0.28), dims.depth * 0.65, 0.016, darkGlass);
  for (let index = 0; index < 4; index += 1) {
    const x = hobX + (index % 2 === 0 ? -0.11 : 0.11);
    const y = (index < 2 ? -1 : 1) * dims.depth * 0.15;
    const ring = new three.Mesh(new three.TorusGeometry(0.055, 0.006, 6, 24), hardware);
    ring.position.set(x, y, counterHeight + 0.02);
    group.add(ring);
  }

  const nicheHeight = 0.55;
  const upperBottom = counterHeight + nicheHeight;
  const upperHeight = Math.min(0.72, Math.max(0.48, dims.height - upperBottom - 0.08));
  const upperWidth = dims.width * 0.8;
  const upperDepth = Math.min(0.35, dims.depth * 0.58);
  const upperStart = -upperWidth / 2;
  const upperCount = Math.max(2, Math.min(moduleCount, Math.round(upperWidth / 0.6)));
  const upperModule = upperWidth / upperCount;
  for (let index = 0; index < upperCount; index += 1) {
    const x = upperStart + (index + 0.5) * upperModule;
    addBox(group, x, 0, upperBottom + upperHeight / 2, upperModule - 0.012, upperDepth, upperHeight, cabinetColor);
    addBox(group, x, -upperDepth / 2 - 0.012, upperBottom + upperHeight / 2, upperModule - 0.025, 0.022, upperHeight - 0.025, panel);
    addBox(group, x + upperModule * 0.32, -upperDepth / 2 - 0.032, upperBottom + upperHeight / 2, 0.012, 0.012, 0.11, hardware);
  }
  addBox(group, 0, dims.depth * 0.52, upperBottom + upperHeight / 2, upperWidth, 0.035, upperHeight * 0.88, panel);
}

function addBath(group, dims, timber, panel) {
  const floor = 0.04;
  const vanityWidth = Math.min(1.2, dims.width * 0.45);
  const vanityDepth = Math.min(0.48, dims.depth * 0.28);
  const vanityHeight = 0.78;
  const frontY = -dims.depth * 0.32;
  const porcelain = createMaterial(0xe8eeeb, { roughness: 0.22 });
  const glass = createMaterial(0x9ed3df, { transparent: true, opacity: 0.32, metalness: 0.2, roughness: 0.15 });
  addBox(group, 0, 0, floor / 2, dims.width, dims.depth, floor, panel);
  addBox(group, -dims.width * 0.25, frontY, vanityHeight / 2 + floor, vanityWidth, vanityDepth, vanityHeight, timber);
  addBox(group, -dims.width * 0.25, frontY - vanityDepth / 2 - 0.018, vanityHeight + floor, vanityWidth * 1.04, vanityDepth * 1.04, 0.045, porcelain);
  const basin = new three.Mesh(new three.SphereGeometry(0.28, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), porcelain);
  basin.position.set(-dims.width * 0.25, frontY, vanityHeight + floor + 0.01);
  basin.scale.set(1.2, 0.75, 0.28);
  group.add(basin);
  addBeam(group, [-dims.width * 0.25 + 0.15, frontY, vanityHeight + floor + 0.04], [-dims.width * 0.25 + 0.15, frontY, vanityHeight + floor + 0.25], 0.018, createMaterial(0x9da9a6, { metalness: 0.75 }));

  const showerWidth = Math.min(0.95, dims.width * 0.38);
  const showerDepth = Math.min(0.9, dims.depth * 0.48);
  const showerX = dims.width * 0.27;
  const showerY = dims.depth * 0.18;
  addBox(group, showerX, showerY, floor / 2, showerWidth, showerDepth, floor * 1.2, porcelain);
  addBox(group, showerX - showerWidth / 2, showerY, dims.height * 0.42, 0.018, showerDepth, dims.height * 0.84, glass);
  addBox(group, showerX, showerY - showerDepth / 2, dims.height * 0.42, showerWidth, 0.018, dims.height * 0.84, glass);
  addBeam(group, [showerX + showerWidth * 0.3, showerY, dims.height * 0.7], [showerX + showerWidth * 0.3, showerY, dims.height * 0.78], 0.018, timber);
}

function addVehicleBrake(group, dims) {
  const centerZ = dims.height * 0.52;
  const radius = Math.max(0.12, Math.min(dims.width, dims.height) * 0.38);
  const rotor = createMaterial(0x9da8a8, { metalness: 0.82, roughness: 0.3 });
  const hub = createMaterial(0x59666a, { metalness: 0.75, roughness: 0.38 });
  const pad = createMaterial(0x343a3b, { roughness: 0.88 });
  const caliper = createMaterial(0xb5543e, { metalness: 0.38, roughness: 0.45 });
  const disc = new three.Mesh(new three.CylinderGeometry(radius, radius, 0.075, 64), rotor);
  disc.rotation.x = Math.PI / 2;
  disc.position.set(-0.12, 0, centerZ);
  disc.castShadow = true;
  group.add(disc);
  const hubMesh = new three.Mesh(new three.CylinderGeometry(radius * 0.27, radius * 0.27, 0.12, 32), hub);
  hubMesh.rotation.x = Math.PI / 2;
  hubMesh.position.set(-0.12, 0, centerZ);
  group.add(hubMesh);
  for (let index = 0; index < 5; index += 1) {
    const angle = index * Math.PI * 2 / 5;
    const hole = new three.Mesh(new three.CylinderGeometry(radius * 0.045, radius * 0.045, 0.13, 12), createMaterial(0x18252b));
    hole.rotation.x = Math.PI / 2;
    hole.position.set(-0.12 + Math.cos(angle) * radius * 0.43, 0, centerZ + Math.sin(angle) * radius * 0.43);
    group.add(hole);
  }
  for (let index = 0; index < 10; index += 1) {
    const angle = index * Math.PI * 2 / 10;
    const vent = new three.Mesh(new three.BoxGeometry(0.035, 0.035, 0.16), hub);
    vent.position.set(-0.12 + Math.cos(angle) * radius * 0.68, 0, centerZ + Math.sin(angle) * radius * 0.68);
    vent.rotation.y = -angle;
    group.add(vent);
  }
  addBox(group, radius * 0.72, -0.02, centerZ, radius * 0.48, 0.34, radius * 1.25, caliper);
  addBox(group, radius * 0.39, -0.14, centerZ, 0.12, 0.09, radius * 1.05, pad);
  addBox(group, radius * 0.39, 0.14, centerZ, 0.12, 0.09, radius * 1.05, pad);
}

function addVehicleOilService(group, dims) {
  const block = createMaterial(0x53666a, { metalness: 0.34, roughness: 0.52 });
  const filter = createMaterial(0xb8c5c2, { metalness: 0.58, roughness: 0.34 });
  const pan = createMaterial(0x333d40, { metalness: 0.64, roughness: 0.38 });
  const centerZ = dims.height * 0.55;
  addBox(group, 0, 0, centerZ + dims.height * 0.08, dims.width * 0.82, dims.depth * 0.62, dims.height * 0.48, block);
  addBox(group, 0, 0, centerZ - dims.height * 0.24, dims.width * 0.72, dims.depth * 0.68, dims.height * 0.14, pan);
  const oilFilter = new three.Mesh(
    new three.CylinderGeometry(dims.width * 0.09, dims.width * 0.09, dims.height * 0.28, 24),
    filter,
  );
  oilFilter.position.set(dims.width * 0.28, -dims.depth * 0.16, centerZ + dims.height * 0.14);
  group.add(oilFilter);
  const drain = new three.Mesh(
    new three.CylinderGeometry(0.025, 0.025, 0.08, 12),
    filter,
  );
  drain.rotation.x = Math.PI / 2;
  drain.position.set(dims.width * 0.24, -dims.depth * 0.36, centerZ - dims.height * 0.28);
  group.add(drain);
}

function addVehicleEngineParts(group, dims) {
  const block = createMaterial(0x59686a, { metalness: 0.48, roughness: 0.48 });
  const ceramic = createMaterial(0xe0ddd1, { roughness: 0.42 });
  const rubber = createMaterial(0x24292b, { roughness: 0.82 });
  const centerZ = dims.height * 0.48;
  addBox(group, 0, 0, centerZ, dims.width * 0.72, dims.depth * 0.62, dims.height * 0.66, block);
  const plugCount = 4;
  for (let index = 0; index < plugCount; index += 1) {
    const x = -dims.width * 0.25 + index * (dims.width * 0.5 / (plugCount - 1));
    const plug = new three.Mesh(new three.CylinderGeometry(0.027, 0.032, 0.19, 12), ceramic);
    plug.position.set(x, -dims.depth * 0.3, centerZ + dims.height * 0.43);
    group.add(plug);
  }
  const pulleyOne = new three.Mesh(new three.TorusGeometry(dims.height * 0.12, 0.025, 8, 30), block);
  const pulleyTwo = new three.Mesh(new three.TorusGeometry(dims.height * 0.085, 0.022, 8, 30), block);
  pulleyOne.position.set(-dims.width * 0.22, -dims.depth * 0.36, centerZ - dims.height * 0.17);
  pulleyTwo.position.set(dims.width * 0.23, -dims.depth * 0.36, centerZ - dims.height * 0.17);
  group.add(pulleyOne, pulleyTwo);
  addBeam(group, [pulleyOne.position.x, pulleyOne.position.y, pulleyOne.position.z], [pulleyTwo.position.x, pulleyTwo.position.y, pulleyTwo.position.z], 0.025, rubber);
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
  addBox(group, 0, 0, dims.height / 2, dims.width, dims.depth, dims.height, panel);
}

function makeModel(model) {
  const group = new three.Group();
  try {
    const dims = dimensionsInMeters(model);
    const timber = createMaterial(0xc78c50);
    const panel = createMaterial(0x78b6c8, { metalness: 0.12, roughness: 0.55 });
    switch (model.type) {
      case "roof": addRoof(group, dims, timber, panel); break;
      case "carport": addCarport(group, dims, timber, panel); break;
      case "table": addTable(group, dims, model, timber, panel); break;
      case "chair": addTable(group, dims, model, timber, panel, true); break;
      case "shelf": addShelving(group, dims, timber, panel); break;
      case "cabinet": addShelving(group, dims, timber, panel, true); break;
      case "stairs": addStairs(group, dims, model, timber, panel); break;
      case "wall": addWall(group, dims, timber, panel); break;
      case "gardenhouse": addGardenhouse(group, dims, timber, panel); break;
      case "fence": addFence(group, dims, timber, panel); break;
      case "bed": addBed(group, dims, timber, panel); break;
      case "kitchen": addKitchen(group, dims, timber, panel); break;
      case "bath": addBath(group, dims, timber, panel); break;
      case "wardrobe": addShelving(group, dims, timber, panel, true); break;
      case "vehicle":
        if (model.vehicleTask === "oil") addVehicleOilService(group, dims);
        else if (model.vehicleTask === "engine") addVehicleEngineParts(group, dims);
        else addVehicleBrake(group, dims);
        break;
      case "beam": addBeamModel(group, dims, timber); break;
      default: addGeneric(group, dims, timber, panel);
    }
    return { group, dims };
  } catch (error) {
    group.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
    throw error;
  }
}

function frameModel(model) {
  if (modelGroup) {
    scene.remove(modelGroup);
    disposeObjectTree(modelGroup);
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
    else {
      preferredMode = mode;
      showBlueprint("3D-Viewer wird vorbereitet – die technische SVG-Zeichnung bleibt verfügbar.");
    }
    return;
  }
  preferredMode = mode;
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
    const radius = Math.max(modelBounds.getBoundingSphere(new three.Sphere()).radius, 0.2);
    const verticalHalfFov = three.MathUtils.degToRad(camera.fov / 2);
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * Math.max(viewport.clientWidth / Math.max(viewport.clientHeight, 1), 0.25));
    const distance = radius / Math.sin(Math.min(verticalHalfFov, horizontalHalfFov)) * 1.15;
    camera.position.copy(center).add(new three.Vector3(distance * 0.65, -distance * 0.65, distance * 0.48));
    camera.near = Math.max(0.01, distance / 1000);
    camera.far = Math.max(1000, distance * 20);
    camera.updateProjectionMatrix();
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
  controls.minDistance = Math.max(0.15, maxDimension * 0.12);
  controls.maxDistance = maxDimension * 12;
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
      loadFailureMessage = "3D-Rendering nicht verfügbar – die technische SVG-Zeichnung bleibt nutzbar.";
      releaseViewer();
      showBlueprint(loadFailureMessage);
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
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(viewport);
  } else {
    window.addEventListener("resize", resizeRenderer);
    resizeListenerAttached = true;
  }
  isReady = true;
  resizeRenderer();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.viewMode;
    if (mode === "blueprint") {
      preferredMode = "blueprint";
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
  try {
    currentModel = normalizeModel(event.detail);
  } catch (error) {
    console.error("Ungültige CAD-Modellparameter.", error);
    showBlueprint("Modellmaße konnten nicht verarbeitet werden – die Suchergebnisse bleiben verfügbar.");
    return;
  }
  blueprint.hidden = currentMode !== "blueprint";
  if (!isReady) {
    showBlueprint(loadFailureMessage ?? "Technische Zeichnung aktiv – 3D-Viewer wird geladen …");
    return;
  }
  try {
    frameModel(currentModel);
    const mode = automaticBlueprint ? preferredMode : currentMode;
    automaticBlueprint = false;
    if (mode === "blueprint") showBlueprint();
    else {
      setCameraMode(mode);
      setStatus(`${currentModel.title} · 3D-Modell bereit`);
      status.classList.remove("is-error");
    }
  } catch (error) {
    console.error("CAD-Modell konnte nicht erstellt werden.", error);
    loadFailureMessage = "Das 3D-Modell konnte nicht erstellt werden – die technische SVG-Zeichnung bleibt nutzbar.";
    releaseViewer();
    showBlueprint(loadFailureMessage);
  }
});

window.addEventListener("werkfinder:cad-blueprint", () => {
  currentModel = undefined;
  preferredMode = "3d";
  automaticBlueprint = true;
  showBlueprint();
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
    automaticBlueprint = false;
    if (preferredMode === "blueprint") showBlueprint();
    else {
      setCameraMode(preferredMode);
      setStatus(`${currentModel.title} · 3D-Modell bereit`);
    }
  }
} catch (error) {
  console.error("Three.js oder WebGL ist nicht verfügbar.", error);
  releaseViewer();
  loadFailureMessage = "3D-Viewer nicht verfügbar (CDN oder WebGL) – die technische SVG-Zeichnung bleibt nutzbar.";
  showBlueprint(loadFailureMessage);
}
