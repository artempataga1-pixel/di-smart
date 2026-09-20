import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { USDLoader } from 'three/addons/loaders/USDLoader.js';
import type { DeviceConfig, DeviceAssets } from '@/components/webgl-viewer/device-scene';
import type { StudioSpec } from '@/components/webgl-viewer/studio-environment';
import { createPhoneScreens } from './phone-screen';
import { dressPhone } from './phone-materials';
import { refineCameraOptics } from './phone-optics';

const studio: StudioSpec = {
  background: [0.075, 0.075, 0.08],
  softboxes: [
    { width: 2.4, height: 6, position: [-4, 1, 3], intensity: 12, color: 0xfff7f4 },
    { width: 1, height: 6, position: [4, 1.5, 1.5], intensity: 7 },
    { width: 4, height: 1, position: [0, 5, 1], intensity: 5 },
    { width: 1.5, height: 6, position: [1, 1, -5], intensity: 5, color: 0xeef2ff },
    { width: 1.5, height: 6, position: [-4, -0.2, -2], intensity: 4 },
    { width: 5, height: 4, position: [0, -3, 5], intensity: 0.8 },
    { width: 4, height: 4, position: [0, 3, 7], intensity: 1.3 },
    { width: 5, height: 5, position: [0, -5, 0], intensity: 3.5 },
  ],
};

export const iphoneConfig: DeviceConfig = {
  studio,
  displayHeight: 2.8,
  initialRotation: [0, Math.PI, 0],
  cameraDistance: 7.8,
  environmentIntensity: 0.85,
  keyLight: { intensity: 8, width: 1.6, height: 1.2, position: [-0.8, 1.8, 1.5] },

  async loadAssets(): Promise<DeviceAssets> {
    const loaded = await Promise.allSettled([
      new USDLoader().loadAsync('/media/iphone-18-pro/apple/iphone-web.usdz'),
      new GLTFLoader().loadAsync('/media/iphone-18-pro/apple/iphone-geometry.glb'),
      createPhoneScreens(),
    ]);
    let sourceModel: THREE.Group | undefined; let model: THREE.Group | undefined; let screens: THREE.Texture[] = [];
    if (loaded[0].status === 'fulfilled') sourceModel = loaded[0].value as THREE.Group;
    if (loaded[1].status === 'fulfilled') model = (loaded[1].value as { scene: THREE.Group }).scene;
    if (loaded[2].status === 'fulfilled') screens = loaded[2].value as THREE.Texture[];
    const failure = loaded.find(result => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
    if (!model || !sourceModel) throw new Error('Incomplete iPhone assets');

    // Geometry comes from the GLB; materials are donated from the USD source by mesh name.
    const sourceRoot = sourceModel;
    model.traverse(node => {
      const mesh = node as THREE.Mesh; if (!mesh.isMesh) return;
      const sourceMesh = sourceRoot.getObjectByName(mesh.name) as THREE.Mesh | undefined;
      if (sourceMesh?.isMesh) { (mesh.material as THREE.Material).dispose(); mesh.material = sourceMesh.material; }
    });
    const discardedGeometry = new Set<THREE.BufferGeometry>();
    sourceModel.traverse(node => { const mesh = node as THREE.Mesh; if (mesh.isMesh) discardedGeometry.add(mesh.geometry); });
    discardedGeometry.forEach(geometry => geometry.dispose()); sourceModel.clear();

    return { model, screens };
  },

  dress(ctx) {
    return dressPhone(ctx.model, ctx.screens, ctx.onFinishLighting);
  },

  tuneLighting(index, keyLight, scene, baseEnvIntensity) {
    // Burgundy (0) and Black (3) are darker finishes and were tuned much
    // dimmer than Glacier/Silver (1, 2) — on phone screens that read as
    // "barely visible". Keep them moodier than the light finishes, but not
    // this dark.
    keyLight.intensity = [8, 15, 14, 7.5][index] ?? 3.5;
    scene.environmentIntensity = [0.85, 0.9, 0.9, 0.88][index] ?? baseEnvIntensity;
  },

  refine(model) {
    refineCameraOptics(model);
  },
};
