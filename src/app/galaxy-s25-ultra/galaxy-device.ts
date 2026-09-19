import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { DeviceConfig, DeviceAssets } from '@/components/webgl-viewer/device-scene';
import type { StudioSpec } from '@/components/webgl-viewer/studio-environment';
import { dressGalaxy } from './galaxy-materials';

/**
 * Path to the licensed Galaxy GLB (CC-BY, vmmaniac / Sketchfab — attribution in
 * the page footer). File is a Galaxy S26 Ultra, used for the S25 Ultra page:
 * the industrial design is near-identical for a storefront viewer. Drop the
 * file at this path and the 3D viewer activates automatically; if it is absent
 * loadAssets() rejects and PhoneViewer falls back to the photo poster.
 */
const GALAXY_GLB = '/media/galaxy-s25-ultra/model/galaxy-geometry.glb';

const studio: StudioSpec = {
  background: [0.07, 0.07, 0.075],
  softboxes: [
    { width: 2.4, height: 6, position: [-4, 1, 3], intensity: 11, color: 0xf6f8ff },
    { width: 1, height: 6, position: [4, 1.5, 1.5], intensity: 7 },
    { width: 4, height: 1, position: [0, 5, 1], intensity: 5 },
    { width: 1.5, height: 6, position: [1, 1, -5], intensity: 5, color: 0xeef2ff },
    { width: 1.5, height: 6, position: [-4, -0.2, -2], intensity: 4 },
    { width: 5, height: 4, position: [0, -3, 5], intensity: 0.8 },
    { width: 4, height: 4, position: [0, 3, 7], intensity: 1.3 },
    { width: 5, height: 5, position: [0, -5, 0], intensity: 3.5 },
    // Two narrow, bright strips: crisp elongated catchlights on the black lens
    // glass and polished camera rings — the cue that reads as "premium optics".
    { width: 0.35, height: 5, position: [-2.2, 0.6, 4.2], intensity: 26, color: 0xffffff },
    { width: 0.3, height: 4, position: [2.4, -0.4, 3.6], intensity: 18, color: 0xdfe8ff },
  ],
};

export const galaxyConfig: DeviceConfig = {
  studio,
  displayHeight: 2.9,          // S25 Ultra is taller/flatter than iPhone; nudge later against the real model.
  initialRotation: [0, Math.PI, 0],
  cameraDistance: 7.8,
  environmentIntensity: 0.9,
  toneMappingExposure: 1.08,   // slightly brighter/punchier than the iPhone default (1).
  keyLight: { intensity: 4, width: 1.6, height: 1.3, position: [-0.8, 1.8, 1.5] },
  exposeAudit: true,

  async loadAssets(): Promise<DeviceAssets> {
    // TODO(model): once the licensed GLB is in /public/media/galaxy-s25-ultra/model/,
    // this resolves and the 3D viewer goes live. No other change is required.
    // Probe first so a missing model degrades quietly (photo fallback) instead of
    // spamming a GLTFLoader network error on every mount.
    const head = await fetch(GALAXY_GLB, { method: 'HEAD' }).catch(() => null);
    if (!head || !head.ok) throw new Error('Galaxy 3D model not available yet');
    const gltf = await new GLTFLoader().loadAsync(GALAXY_GLB);
    const model = gltf.scene as THREE.Group;
    if (!model) throw new Error('Incomplete Galaxy assets');
    return { model, screens: [] };
  },

  dress(ctx) {
    return dressGalaxy(ctx.model, ctx.screens, ctx.onFinishLighting);
  },

  tuneLighting(index, keyLight, scene, baseEnvIntensity) {
    // black / titanium / blue — dark finishes want a stronger key to keep edges readable.
    keyLight.intensity = [5, 4, 4.5][index] ?? 4;
    scene.environmentIntensity = [0.7, 0.9, 0.85][index] ?? baseEnvIntensity;
  },
};
