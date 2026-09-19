import { createDeviceScene } from '@/components/webgl-viewer/device-scene';
import { iphoneConfig } from './iphone-device';

/**
 * iPhone 18 Pro viewer entry point. The engine is now device-agnostic
 * (see components/webgl-viewer); everything iPhone-specific lives in
 * iphone-device.ts (asset loading, studio rig, material dressing, optics).
 * Signature preserved for phone-viewer.tsx.
 */
export function createPhoneScene(host: HTMLElement, onReady: () => void) {
  return createDeviceScene(host, iphoneConfig, onReady);
}
