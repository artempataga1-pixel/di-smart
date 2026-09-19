import * as THREE from 'three';
import { addSatinGrain } from '@/components/webgl-viewer/satin-grain';
import type { DeviceSurfaces } from '@/components/webgl-viewer/device-scene';

/**
 * Dresser for the licensed Galaxy S26 Ultra GLB (CC-BY, vmmaniac / Sketchfab).
 *
 * The GLB ships two phone instances side by side ("SAMSUNG Galaxy S26 Ultra"
 * front + "...001" back) and cleanly named meshes/materials. We keep ONE
 * instance (so it rotates as a single phone) and re-tune materials by name:
 *
 *   Frame            -> paintable titanium body (per-finish colour)
 *   Glass back       -> paintable glass back (per-finish colour, glossy)
 *   Glass screen     -> front cover glass (clear)
 *   Screen           -> emissive display (keeps baked artwork texture)
 *   Camera / Glass camera -> lenses
 *   Camera block/frame, Flash, Dark, Buttons, SIM, USB type C, logo, Pens -> trim
 *
 * Finish order matches galaxy-content.ts `finishes`: [black, titanium, blue].
 */

const BODY_COLORS = [
  new THREE.Color('#2a2b2e'), // Чёрный  (titanium black)
  new THREE.Color('#8f8f8a'), // Титан   (natural titanium grey)
  new THREE.Color('#5f7f9c'), // Синий   (sky-blue titanium, from the model's own baseColor)
];
// The glass back reads a touch lighter/cooler than the frame on the real device.
const BACK_COLORS = [
  new THREE.Color('#37383c'),
  new THREE.Color('#a6a6a1'),
  new THREE.Color('#7ba0bf'),
];

/** Keep only the first phone instance; detach the duplicate to save draw calls. */
export function pruneDuplicatePhone(root: THREE.Object3D) {
  const instances = root.children.filter(
    c => /^SAMSUNG Galaxy S2\d Ultra(\.\d+)?$/i.test(c.name),
  );
  // Remove every instance whose name has a numeric suffix (the copies).
  for (const inst of instances) {
    if (/\.\d+$/.test(inst.name)) {
      inst.parent?.remove(inst);
      inst.traverse(n => {
        const m = n as THREE.Mesh;
        if (m.isMesh) m.geometry.dispose();
      });
    }
  }
}

type Kind = 'frame' | 'back' | 'coverGlass' | 'screen' | 'lens' | 'lensGlass' | 'camRing' | 'flash' | 'dark' | 'trim';

function classify(meshName: string, matName: string): Kind {
  const mesh = meshName.toLowerCase();
  const mat = matName.toLowerCase();
  // Material name is the most reliable signal in this GLB — decide by it first,
  // fall back to the mesh name only when the material is ambiguous.
  // Exception: a mesh literally named "Camera block" is the lens deck even when
  // its material is mislabelled "Glass back" in the source file.
  if (/camera\s*block/.test(mesh)) return 'camRing';
  if (/glass\s*screen/.test(mat)) return 'coverGlass';   // front cover glass
  if (/glass\s*[сc]amera/.test(mat)) return 'lensGlass'; // clear lens cover
  if (/glass\s*back/.test(mat)) return 'back';           // rear panel
  if (/camera\s*frame|camera\s*block/.test(mat)) return 'camRing'; // machined lens ring
  if (/\bdark\b/.test(mat)) return 'dark';               // black backing / interior
  if (/\bflash\b/.test(mat)) return 'flash';             // LED flash
  if (/\bscreen\b/.test(mat)) return 'screen';           // emissive display artwork
  if (/\b[сc]amera\b/.test(mat)) return 'lens';          // actual lens element
  if (/\bframe\b/.test(mat)) return 'frame';             // titanium body / paintable
  // Material was ambiguous ((none)/usb/etc) — use the mesh name.
  if (/camera\s*block|camera\s*frame/.test(mesh)) return 'camRing';
  if (/\bcamera\b/.test(mesh)) return 'lens';
  if (/\bscreen\b/.test(mesh)) return 'screen';
  if (/\bframe\b/.test(mesh)) return 'frame';
  return 'trim';
}

export type FinishPalette = { body: THREE.Color; back: THREE.Color }[];

export function dressGalaxy(
  model: THREE.Object3D,
  _screens: THREE.Texture[],
  onFinish?: (index: number) => void,
  /** Overrides BODY_COLORS/BACK_COLORS above — lets callers dress the same GLB
   *  with a different device's real retail colours (e.g. the S26 Ultra page). */
  palette?: FinishPalette,
): DeviceSurfaces {
  pruneDuplicatePhone(model);

  const owned = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const frames: THREE.MeshPhysicalMaterial[] = [];
  const backs: THREE.MeshPhysicalMaterial[] = [];

  const seen = new Map<THREE.Material, THREE.MeshPhysicalMaterial>();

  model.traverse(node => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    const next = originals.map(orig => {
      // Materials are shared across meshes; convert each unique one once.
      const cached = seen.get(orig);
      const source = orig as THREE.MeshStandardMaterial;
      const material = cached ?? new THREE.MeshPhysicalMaterial();
      if (!cached) {
        THREE.MeshStandardMaterial.prototype.copy.call(material, source);
        material.name = source.name;
        Object.values(material).forEach(v => {
          if ((v as THREE.Texture)?.isTexture) { (v as THREE.Texture).anisotropy = 8; textures.add(v as THREE.Texture); }
        });
        seen.set(orig, material);
        owned.add(material);
      } else {
        return material; // already tuned
      }

      switch (classify(mesh.name, source.name)) {
        case 'frame': {
          // Brushed titanium rail: satin micro-grain under a faint clearcoat so
          // it catches a soft sheen without going plasticky.
          material.metalness = 0.9; material.roughness = 0.3;
          material.clearcoat = 0.25; material.clearcoatRoughness = 0.45;
          material.envMapIntensity = 1.15;
          addSatinGrain(material, 1);
          frames.push(material);
          break;
        }
        case 'back': {
          // Frosted glass back over a colour-matched layer: soft satin diffuse
          // with a clear reflective coat, like Gorilla Glass with a matte etch.
          material.metalness = 0.15; material.roughness = 0.32;
          material.clearcoat = 1; material.clearcoatRoughness = 0.14; material.ior = 1.5;
          material.envMapIntensity = 1.1;
          addSatinGrain(material, 0.5);
          backs.push(material);
          break;
        }
        case 'coverGlass': {
          // Front cover glass: nearly clear, sharp reflections, slight edge tint.
          material.color.set('#ffffff'); material.metalness = 0; material.roughness = 0.04;
          material.clearcoat = 1; material.clearcoatRoughness = 0.03; material.ior = 1.5;
          material.transparent = true; material.opacity = 0.06; material.depthWrite = false;
          material.envMapIntensity = 1.3;
          break;
        }
        case 'screen': {
          // Deep OLED look: near-black base so blacks read true, baked artwork
          // emits as the on-screen image, faint clearcoat for glass reflections.
          material.color.set('#040506');
          material.metalness = 0; material.roughness = 0.12;
          material.clearcoat = 0.5; material.clearcoatRoughness = 0.08;
          material.toneMapped = false; material.envMapIntensity = 0.3;
          if (material.map) {
            material.map.colorSpace = THREE.SRGBColorSpace;
            material.emissive.set('#ffffff');
            material.emissiveMap = material.map;
            material.emissiveIntensity = 1.15;
          }
          break;
        }
        case 'lens': {
          // Real lens element: near-black deep glass, mirror-sharp reflection,
          // faint iridescence from the optical anti-reflective coating.
          material.color.set('#050608');
          material.metalness = 0.1; material.roughness = 0.04;
          material.clearcoat = 1; material.clearcoatRoughness = 0.02; material.ior = 1.52;
          material.envMapIntensity = 1.2;
          material.iridescence = 0.45; material.iridescenceIOR = 1.3;
          material.iridescenceThicknessRange = [140, 320];
          material.specularIntensity = 1;
          break;
        }
        case 'lensGlass': {
          // Clear protective cover over the lens stack — crisp highlight, barely tinted.
          material.color.set('#ffffff'); material.metalness = 0; material.roughness = 0.02;
          material.clearcoat = 1; material.clearcoatRoughness = 0.02; material.ior = 1.5;
          material.transparent = true; material.opacity = 0.08; material.depthWrite = false;
          material.envMapIntensity = 1.4;
          break;
        }
        case 'camRing': {
          // Machined metal ring/deck around each lens — polished, dark.
          material.color.set('#17181b');
          material.metalness = 0.95; material.roughness = 0.18;
          material.clearcoat = 0.4; material.clearcoatRoughness = 0.1;
          material.envMapIntensity = 1;
          break;
        }
        case 'flash': {
          // LED flash / laser-AF sensor: soft matte disc, not a mirror.
          material.color.set('#c9c9cc');
          material.metalness = 0; material.roughness = 0.35;
          material.clearcoat = 0.6; material.clearcoatRoughness = 0.2;
          break;
        }
        case 'dark': {
          // Deep-black backing inside the module — swallows the environment.
          material.color.set('#020203');
          material.metalness = 0; material.roughness = 0.5;
          material.clearcoat = 0; material.envMapIntensity = 0.05;
          break;
        }
        case 'trim': {
          material.metalness = Math.max(material.metalness, 0.5);
          material.roughness = THREE.MathUtils.clamp(material.roughness || 0.3, 0.2, 0.6);
          material.clearcoat = 0;
          break;
        }
      }
      if (material.transparent) material.depthWrite = false;
      return material;
    });

    mesh.material = Array.isArray(mesh.material) ? next : next[0];
  });

  return {
    setFinish(index: number) {
      onFinish?.(index);
      const body = palette?.[index]?.body ?? BODY_COLORS[index] ?? BODY_COLORS[1];
      const back = palette?.[index]?.back ?? BACK_COLORS[index] ?? BACK_COLORS[1];
      frames.forEach(m => m.color.copy(body));
      backs.forEach(m => m.color.copy(back));
    },
    dispose() { owned.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); },
  };
}
