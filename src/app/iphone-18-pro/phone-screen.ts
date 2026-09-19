import * as THREE from 'three';

/** Complete localized display artwork. Dynamic Island is the original physical mesh. */
export async function createPhoneScreens():Promise<THREE.Texture[]> {
  const loader=new THREE.TextureLoader();
  const results=await Promise.allSettled(['burgundy','glacier','silver','black'].map(async name=>{
    const texture=await loader.loadAsync(`/media/iphone-18-pro/screens/${name}-complete.webp`);
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;
  }));
  const failed=results.find(result=>result.status==='rejected');
  if(failed?.status==='rejected'){
    results.forEach(result=>{if(result.status==='fulfilled')result.value.dispose();});
    throw failed.reason;
  }
  return results.map(result=>(result as PromiseFulfilledResult<THREE.Texture>).value);
}
