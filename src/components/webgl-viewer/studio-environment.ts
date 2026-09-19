import * as THREE from 'three';

/** One softbox card in the studio rig. */
export interface Softbox {
  width: number;
  height: number;
  position: [number, number, number];
  intensity: number;
  color?: number;
}

export interface StudioSpec {
  /** Background colour of the environment scene (linear). Default dark grey. */
  background?: [number, number, number];
  softboxes: Softbox[];
}

/** Feathered photographic softboxes keep metal highlights broad and avoid hard white reflections. */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer, spec: StudioSpec) {
  const studio = new THREE.Scene();
  const bg = spec.background ?? [0.075, 0.075, 0.08];
  studio.background = new THREE.Color(bg[0], bg[1], bg[2]);
  const cards: THREE.Mesh[] = [];
  const side = 64; const pixels = new Float32Array(side * side * 4);
  for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
    const dx = Math.abs((x + 0.5) / side * 2 - 1), dy = Math.abs((y + 0.5) / side * 2 - 1);
    const value = (1 - THREE.MathUtils.smoothstep(dx, 0.35, 1)) * (1 - THREE.MathUtils.smoothstep(dy, 0.5, 1));
    const i = (y * side + x) * 4; pixels[i] = pixels[i + 1] = pixels[i + 2] = value; pixels[i + 3] = 1;
  }
  const feather = new THREE.DataTexture(pixels, side, side, THREE.RGBAFormat, THREE.FloatType); feather.needsUpdate = true; feather.magFilter = feather.minFilter = THREE.LinearFilter;
  for (const box of spec.softboxes) {
    const material = new THREE.MeshBasicMaterial({ map: feather, color: new THREE.Color(box.color ?? 0xffffff).multiplyScalar(box.intensity), side: THREE.DoubleSide });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(box.width, box.height), material);
    card.position.set(...box.position); card.lookAt(0, 0, 0); studio.add(card); cards.push(card);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(studio, 0.012, 0.1, 100, { size: 512 });
  pmrem.dispose(); feather.dispose(); cards.forEach(card => { card.geometry.dispose(); (card.material as THREE.Material).dispose(); });
  return target;
}
