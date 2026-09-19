import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStudioEnvironment, type StudioSpec } from './studio-environment';

/**
 * Device-agnostic WebGL product viewer.
 *
 * The scene, renderer, camera, controls, lifecycle (resize / visibility /
 * reduced-motion / dispose) and the "front/back" transition are shared by every
 * device. Everything model-specific — which files to load, how to combine them,
 * how to dress the materials, how many finishes exist and how each finish reacts
 * to lighting — is supplied by a DeviceConfig. iPhone/Galaxy differ only in
 * their config, never in this file.
 */

export interface DeviceSurfaces {
  /** Apply finish `index` (colour + any per-finish light response). */
  setFinish(index: number): void;
  dispose(): void;
}

export interface DeviceAssets {
  /** The renderable geometry root that gets added to the scene. */
  model: THREE.Group;
  /** Optional secondary source (e.g. USD material donor) disposed after dressing. */
  source?: THREE.Group;
  /** Optional screen/emissive textures handed to the dresser. */
  screens?: THREE.Texture[];
}

export interface DressContext {
  model: THREE.Group;
  screens: THREE.Texture[];
  /** Called by the dresser when a finish changes, so the scene can retune lights. */
  onFinishLighting: (index: number) => void;
}

export interface DeviceConfig {
  /** Loads and combines the raw assets. Free to run several loaders in parallel. */
  loadAssets(): Promise<DeviceAssets>;
  /** Studio lighting rig (softboxes) turned into a PMREM environment. */
  studio: StudioSpec;
  /** Turns the loaded model into finished materials. Returns finish control. */
  dress(ctx: DressContext): DeviceSurfaces;
  /** Optional post-dress pass (camera optics, lens tweaks, …). */
  refine?(model: THREE.Group): void;
  /** Target on-screen height of the model in world units. Default 2.8. */
  displayHeight?: number;
  /** Initial group rotation (radians). Default (0, PI, 0) — face the camera. */
  initialRotation?: [number, number, number];
  /** Key light: [intensity, width, height] + position. */
  keyLight?: { intensity: number; width: number; height: number; position: [number, number, number] };
  /** Base scene.environmentIntensity. Default 0.85. */
  environmentIntensity?: number;
  /** AgX tone-mapping exposure. Default 1. Bump slightly (~1.1) for a brighter, punchier look. */
  toneMappingExposure?: number;
  /** Camera distance on the Z axis. Default 7.8. */
  cameraDistance?: number;
  /** Expose the audit handle on the host element for debugging. Default false. */
  exposeAudit?: boolean;
  /** Optional per-finish lighting response (key light intensity, env intensity). */
  tuneLighting?(index: number, keyLight: THREE.RectAreaLight, scene: THREE.Scene, baseEnvIntensity: number): void;
}

export interface DeviceScene {
  dispose(): void;
  setColor(hex: string, index?: number): void;
  view(front: boolean): void;
  rotate(x: number, y: number): void;
  zoom(delta: number): void;
}

export async function createDeviceScene(
  host: HTMLElement,
  config: DeviceConfig,
  onReady: () => void,
): Promise<DeviceScene> {
  const cameraDistance = config.cameraDistance ?? 7.8;
  const displayHeight = config.displayHeight ?? 2.8;
  const initialRotation = config.initialRotation ?? [0, Math.PI, 0];
  const environmentIntensity = config.environmentIntensity ?? 0.85;
  const key = config.keyLight ?? { intensity: 3.5, width: 1.6, height: 1.2, position: [-0.8, 1.8, 1.5] };

  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const constrained = Boolean(
    device.connection?.saveData ||
    Boolean(device.connection?.effectiveType && device.connection.effectiveType !== '4g') ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
    (device.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 4)
  );
  const renderer = new THREE.WebGLRenderer({
    antialias: !constrained,
    alpha: true,
    powerPreference: constrained ? 'low-power' : 'high-performance',
  });
  // Не повышаем DPR искусственно: на слабом GPU supersampling был главным
  // источником лишнего fill-rate и памяти. На быстрых экранах 1.5 достаточно
  // для чёткой предметной модели, остальную детализацию даёт сам GLB.
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, constrained ? 1 : 1.5));
  renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = config.toneMappingExposure ?? 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  RectAreaLightUniformsLib.init();
  const keyLight = new THREE.RectAreaLight(0xffffff, key.intensity, key.width, key.height);
  keyLight.position.set(...key.position); keyLight.lookAt(0, 0, 0); scene.add(keyLight);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40); camera.position.set(0, 0, cameraDistance);
  const controls = new OrbitControls(camera, renderer.domElement);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = !motion.matches; controls.dampingFactor = 0.09;
  controls.rotateSpeed = 0.65; controls.minPolarAngle = 0.12; controls.maxPolarAngle = Math.PI - 0.12;

  const environment = createStudioEnvironment(renderer, config.studio);
  scene.environment = environment.texture; scene.environmentIntensity = environmentIntensity;

  const group = new THREE.Group(); scene.add(group);
  let disposed = false; let frame = 0; let inView = true; let lastFrameTime = 0;
  let model: THREE.Group | undefined; let sourceModel: THREE.Group | undefined; let screens: THREE.Texture[] = [];
  let surfaces: DeviceSurfaces | undefined;
  let transition: { started: number; rotation: THREE.Quaternion; target: THREE.Quaternion; position: THREE.Vector3 } | null = null;

  function requestRender() { if (!disposed && !frame && inView && !document.hidden) frame = requestAnimationFrame(draw); }
  function draw(now: number) {
    frame = 0; if (disposed) return;
    let moving = false;
    if (transition) {
      const t = motion.matches ? 1 : Math.min(1, (now - transition.started) / 700); const eased = 1 - (1 - t) ** 3;
      group.quaternion.slerpQuaternions(transition.rotation, transition.target, eased);
      camera.position.lerpVectors(transition.position, new THREE.Vector3(0, 0, cameraDistance), eased);
      if (t === 1) { transition = null; controls.enableDamping = !motion.matches; } else moving = true;
    }
    // Keep the damping duration consistent on both fast GPUs and low-frame-rate devices.
    const elapsed = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.05) : 1 / 60; lastFrameTime = now;
    controls.dampingFactor = 1 - Math.exp(-elapsed / 0.08);
    moving = controls.update() || moving; renderer.render(scene, camera);
    if (moving) requestRender();
  }
  function resize() { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); requestRender(); }
  const observer = new ResizeObserver(resize); observer.observe(host);
  const visibility = new IntersectionObserver(entries => { inView = entries.some(e => e.isIntersecting); if (inView) requestRender(); else { cancelAnimationFrame(frame); frame = 0; } }, { rootMargin: '100px' }); visibility.observe(host);
  const wake = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else requestRender(); };
  document.addEventListener('visibilitychange', wake);
  const cancelTransition = () => { transition = null; controls.enableDamping = !motion.matches; };
  const motionChanged = () => { controls.enableDamping = !motion.matches; requestRender(); }; motion.addEventListener('change', motionChanged);
  controls.addEventListener('start', cancelTransition); controls.addEventListener('change', requestRender);
  resize();

  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect();
    document.removeEventListener('visibilitychange', wake); motion.removeEventListener('change', motionChanged); controls.dispose();
    const geometries = new Set<THREE.BufferGeometry>();
    const fallbackMaterials = new Set<THREE.Material>(); const fallbackTextures = new Set<THREE.Texture>();
    [model, sourceModel].forEach(object => object?.traverse(node => {
      const mesh = node as THREE.Mesh; if (!mesh.isMesh) return; geometries.add(mesh.geometry);
      if (!surfaces) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => {
        fallbackMaterials.add(material); Object.values(material).forEach(value => { if ((value as THREE.Texture)?.isTexture) fallbackTextures.add(value as THREE.Texture); });
      });
    }));
    geometries.forEach(g => g.dispose()); fallbackMaterials.forEach(m => m.dispose()); fallbackTextures.forEach(t => t.dispose());
    surfaces?.dispose(); screens.forEach(t => t.dispose()); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
  }

  try {
    const assets = await config.loadAssets();
    model = assets.model; sourceModel = assets.source; screens = assets.screens ?? [];
    if (!model) throw new Error('Incomplete device assets');

    const bounds = new THREE.Box3().setFromObject(model); if (bounds.isEmpty()) throw new Error('Empty device geometry');
    const size = bounds.getSize(new THREE.Vector3()); model.position.sub(bounds.getCenter(new THREE.Vector3()));
    group.add(model); group.scale.setScalar(displayHeight / size.y); group.rotation.set(...initialRotation);

    surfaces = config.dress({
      model, screens,
      onFinishLighting: index => {
        if (config.tuneLighting) config.tuneLighting(index, keyLight, scene, environmentIntensity);
      },
    });
    surfaces.setFinish(0);
    config.refine?.(model);

    if (config.exposeAudit) Reflect.set(host, 'phoneAudit', { model, group, scene, camera, renderer, THREE, surfaces, keyLight });
    await renderer.compileAsync(scene, camera); requestRender(); onReady();

    return {
      dispose,
      setColor(_hex: string, index = 0) { surfaces?.setFinish(index); requestRender(); },
      view(front: boolean) {
        controls.enableDamping = false; controls.update();
        transition = { started: performance.now(), rotation: group.quaternion.clone(), target: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, front ? initialRotation[1] : initialRotation[1] - Math.PI, 0)), position: camera.position.clone() };
        controls.target.set(0, 0, 0); requestRender();
      },
      rotate(x: number, y: number) { cancelTransition(); group.rotation.y += x; group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + y, -1.2, 1.2); requestRender(); },
      zoom(delta: number) { cancelTransition(); camera.position.multiplyScalar(delta).clampLength(5, 11); controls.update(); requestRender(); },
    };
  } catch (error) { dispose(); throw error; }
}
